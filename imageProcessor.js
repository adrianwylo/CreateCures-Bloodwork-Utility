import {createScheduler, createWorker, PSM} from 'tesseract.js';
import Fuse from 'fuse.js';
import { field_names} from './formatCsvRow';

/**
 * Processes an array of image files using Tesseract.js OCR with multiple workers.
 * Performs text recognition on each image and extracts word-level data including confidence, choices, bounding boxes, and rotation.
 * Returns a flattened array of word objects for all processed images.
 *
 * @async
 * @param {File[]} files - Array of image files to be processed.
 * @returns {Promise<Object[]>} Resolves to an array of word objects containing OCR results for each image.
 * @throws {Error} Throws if no images are provided.
 */
export async function processTestImages(files) {    
    if (!files || !files.length) {
        throw new Error('No images provided to processTestImages.');
    }

    // Create a scheduler and workers
    const workerN = 7;
    const scheduler = createScheduler();

    const workerGen = async () => {
        const worker = await createWorker("eng", 1, { 
            logger: m => console.log(m), cachePath: ".",
            workerPath: chrome.runtime.getURL('node_modules/tesseract.js/dist/worker.min.js'),
            corePath: chrome.runtime.getURL('node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js'),
            workerBlobURL: false,
        });
        await worker.setParameters({
            tessedit_pageseg_mode: PSM.SPARSE_TEXT_OSD
        });
        scheduler.addWorker(worker);
    };

    await Promise.all(Array(workerN).fill(0).map(async () => await workerGen())); 
    

    
    const jobPromises = files.map(async (file) => {
        return scheduler.addJob('recognize', file, {}, {
            text: true,
            blocks: true,
            hocr: false,
            tsv: false,
        })
        .then(out => {
            // console.log(out) //for debugging
            const wordsArray = [];
            const imageName = file.name
            const rotateRadians = out.data.rotateRadians
            if (out.data?.blocks) {
                out.data.blocks.forEach((block, blockIdx) => {
                    block.paragraphs.forEach((para, paraIdx) => {
                        const paragraphKey = `block_${blockIdx};paragraph_${paraIdx}`;

                        para.lines.forEach((line, lineIdx) => {
                            const lineKey = `${paragraphKey};line_${lineIdx}`;
                            line.words.forEach(word => {
                                var word_choices = word.choices
                                if (word_choices.length < 2) {
                                    word_choices = []
                                }
                                wordsArray.push({
                                    word_text: word.text,
                                    word_confidence: word.confidence,
                                    word_choices: word_choices,
                                    word_bbox: word.bbox,
                                    unique_paragraph_key: paragraphKey,
                                    unique_line_key: lineKey,
                                    imageName: imageName,
                                    rotateRadians: rotateRadians,
                                });
                            });
                        });
                    });
                });
            }
            return wordsArray
        })
        .catch(error => ({
            imageName: file.webkitRelativePath || file.name,
            error: error.message,
        }));
    });

    const results = await Promise.all(jobPromises);
    const flatResults = results.flat()
    // Terminate workers and save results
    await scheduler.terminate();

    console.log('OCR processing completed.');
    return flatResults;

}

/**
 * Scores the likelihood that a given string represents a valid OCR-extracted number.
 * The function attempts to correct common OCR misinterpretations (e.g., 'O' -> '0', 'I' -> '1'),
 * then uses a regex to extract a numeric value. The score is reduced based on the number of replacements
 * and regex corrections required.
 *
 * @param {string} str - The string to evaluate as a possible number.
 * @param {number} replace_strikes_weight - The penalty weight for each character replacement.
 * @param {number} regex_strikes_weight - The penalty weight for regex-based corrections.
 * @returns {number} A score between 0 and 1 indicating the confidence that the string is a valid number.
 */
function scoreOCRNumber(str, replace_strikes_weight, regex_strikes_weight) {
    const replacements = {
        'o': '0', 'O': '0',
        'I': '1', 'l': '1', 'L': '1',
        'S': '5', 's': '5',
        'B': '8',
        'q': '9', 'g': '9',
        'Z': '2', 'z': '2',
        'G': '6',
        'A': '4',
        'T': '7'
    };

    //might want to consider how confidence of OCR factors into things, but at same time, lower confidence would not lead to anytrhing MORE accurate
    let replace_strikes = 0;
    let transformed = '';
    let regex_strikes = 0;
    let regex_transformed = '';

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (replacements.hasOwnProperty(char)) {
            transformed += replacements[char];
            replace_strikes++;
        } else {
            transformed += char;
        }
    }
    const match = transformed.match(/(?<!\d)(\d+(\.\d+)?)(?!\d)/)
    
    if (match) {
        regex_transformed = match[0];
        if (transformed !== regex_transformed) {
            regex_strikes = 1
        }
    } else {
        return 0
    }

    if (regex_transformed.trim() === '' || isNaN(Number(regex_transformed))) {
        return 0
    } else {
        return Math.max(1 - replace_strikes * replace_strikes_weight - regex_strikes * regex_strikes_weight, 0)
    }
}


/**
 * Enhances an array of OCR word objects with additional metadata for markup analysis.
 * - Adds a 'number_score' property indicating the likelihood that the word represents a numeric value.
 * - Adds a 'center_value' property with the center coordinates of the word's bounding box.
 * - Adds a 'potential_keys_for' property (Set) for possible CSV field matches.
 * - Identifies probable keys and values for each image and groups them by image name.
 *
 * @param {Object[]} ocr_object_list - Array of word objects from OCR output. Each object should contain at least 'word_text', 'word_bbox', and 'imageName'.
 * @returns {Object} An object mapping image names to their detected keys and values:
 *   {
 *     [imageName]: {
 *       keys: Object[],   // Word objects identified as probable keys
 *       values: Object[]  // Word objects identified as probable values (numbers)
 *     }
 *   }
 */
export async function generateImageKeyValueMap(ocr_object_list, fuseThreshold, keySearchThreshold, maxKeyEntries, replaceStrikesWeight, regexStrikesWeight) {

    for (var wordObj of ocr_object_list){
        const wordText = wordObj.word_text;
        const numberScore = scoreOCRNumber(wordText, replaceStrikesWeight, regexStrikesWeight);
        wordObj['number_score'] = numberScore;
        wordObj['center_value'] = {
            centerx: (wordObj.word_bbox.x1 + wordObj.word_bbox.x0)/2,
            centery: (wordObj.word_bbox.y1 + wordObj.word_bbox.y0)/2,
        };
        wordObj['potential_keys_for'] = new Set();
    }

    // Finds which ocr values are probably a sought after csv field (will mutate ocr_object_list)
    let probableKeys = {};
    for (const field of field_names) {
        const csvField = field.csvfield;
        const replacementList = field.replacements;
        const keyConfidence = await evalKeyConfidence(csvField, replacementList, ocr_object_list, keySearchThreshold, maxKeyEntries, fuseThreshold);
        probableKeys[keyConfidence.csv_value] = keyConfidence.closest_matches;
    }

    console.log(ocr_object_list)

    //search for innate structural offset between different probable keys and probable values
    //isolate each page
    let imageDic = {};
    for (var wordObj of ocr_object_list) {
        const pageKey = wordObj.imageName;
        if (pageKey in imageDic) {
            // Check if key or value and add to appropriate key or value
            if (wordObj.potential_keys_for.size > 0) {
                imageDic[pageKey].keys.push(wordObj);
                continue;
            }
            if (wordObj.number_score > 0.9) {
                imageDic[pageKey].values.push(wordObj);
                continue;
            }
        } else {
            imageDic[pageKey] = {
                keys: [],
                values: []
            };
        }
    }
    console.log(imageDic);
    return imageDic;
}



//Evaluates which json word values are the closest match to a given csv value
async function evalKeyConfidence(csv_value, csv_replacement_values, ocr_object_list, total_threshold, max_entries, fuseThreshold) {
    // Type checks
    if (typeof csv_value !== 'string') {
        throw new Error('evalKeyConfidence: csv_value must be a string');
    }
    if (!Array.isArray(csv_replacement_values) || !csv_replacement_values.every(val => typeof val === 'string')) {
        throw new Error('evalKeyConfidence: csv_replacement_values must be an array of strings');
    }
    
    // console.log(`searching for "${csv_value}" and found`)
    const fuseOptions = {
        isCaseSensitive: false,
        includeScore: true,
        ignoreDiacritics: true, 
        shouldSort: true,
        includeMatches: false,
        findAllMatches: true,
        minMatchCharLength: 2,
        location: 0,
        threshold: fuseThreshold, //tentative
        distance: 100,
        useExtendedSearch: false,
        ignoreLocation: true,
        ignoreFieldNorm: true,
        // fieldNormWeight: 1,
        keys: ["word_text"]
    };
    
    //looped operation that finds best matches (searching based on main csv_value before csv_replacement value searches)
    let valid_entries = [];
    let threshold = 0.1;
    let seen_indexes = new Set()
    const fuse = new Fuse(ocr_object_list, fuseOptions);

    while (threshold < total_threshold) {
        const pure_results = fuse
            .search(csv_value)
            .filter(result => result.score < threshold && result.score >= threshold - 0.1);
        for (const pure_result of pure_results) {
            if (!seen_indexes.has(pure_result.refIndex)) {
                seen_indexes.add(pure_result.refIndex)
                valid_entries.push(pure_result)
                pure_result.item.potential_keys_for.add({
                    'matched_word': csv_value,
                    'word_score': pure_result.score
                })

            }
        }

        // Try replacements only if nothing matched
        if (pure_results.length === 0) {
            for (const replacement_value of csv_replacement_values) {
                const replacement_results = fuse
                    .search(replacement_value)
                    .filter(result => result.score < threshold && result.score >= threshold - 0.1);
                for (const replacement_result of replacement_results) {
                    if (!seen_indexes.has(replacement_result.refIndex)) {
                        seen_indexes.add(replacement_result.refIndex);
                        valid_entries.push(replacement_result);
                        replacement_result.item.potential_keys_for.add({
                            'matched_word': replacement_value,
                            'word_score': replacement_result.score
                        })

                    }
                }
            }
        }

        // Sort and slice to top 5 if needed
        valid_entries.sort((a, b) => a.score - b.score);
        if (valid_entries.length > max_entries) {
            break;
        }
        threshold += 0.05;
    }
    
    // console.log(valid_entries)
    // console.log(ocr_object_list)
    return {
        csv_value: csv_value,
        closest_matches: valid_entries
    }
}