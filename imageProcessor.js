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
export async function ocrProcessing(files) {    
    if (!files || !files.length) {
        throw new Error('No images provided to ocrProcessing.');
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
                            line.words.forEach((word, wordIdx) => {
                                var word_choices = word.choices
                                if (word_choices.length < 2) {
                                    word_choices = []
                                }
                                const uniqueKey = `${lineKey};word_${wordIdx};`
                                wordsArray.push({
                                    word_text: word.text,
                                    word_confidence: word.confidence,
                                    word_choices: word_choices,
                                    word_y: word.bbox.y0,
                                    word_x: word.bbox.x0,
                                    height: word.bbox.y1 - word.bbox.y0,
                                    width: word.bbox.x1 - word.bbox.x0,
                                    potential_matches: new Set(),
                                    uniqueKey: uniqueKey,
                                    imageName: imageName,
                                    rotateRadians: rotateRadians,
                                    numberScore: 0
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

    console.log('OCR processing completed. \n here are results:');
    console.log(flatResults)
    return flatResults;

}


/**
 * Evaluates selection of word objects that match closestr to the given csv value or its potential csv replacement values
 *
 * @param {String} csv_value - current key being searched for
 * @param {Array} csv_replacement_values - list of potential replacement strings to match for for csv_value
 * @param {Object[]} ocr_object_list - Array of word objects from OCR output. Each object should contain at least 'word_text', 'word_bbox', and 'imageName'.
 * @returns {Object} An object representing the searched for word and a list of closest word object matches
 *   {
 *     [csv_value]: String //searched for csv_value,
 *     [closest_matches]: Array //list of word objects ordered by score
 *   }
 */
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

                //mutate ocr list
                pure_result.item.potential_matches.add({
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

                        //mutate ocr list
                        replacement_result.item.potential_matches.add({
                            'matched_word': replacement_value,
                            'word_score': replacement_result.score
                        })

                    }
                }
            }
        }

        // Sort 
        valid_entries.sort((a, b) => a.score - b.score);
        if (valid_entries.length > max_entries) {
            break;
        }
        threshold += 0.05;
    }
    
    // console.log(valid_entries)
    // console.log(ocr_object_list)
    return {
        csv_value: csv_value, //csv value in question
        closest_matches: valid_entries //list of matched ocr objects
    }
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
export async function generateimageKeyValueList(ocr_object_list, fuseThreshold, keySearchThreshold, maxKeyEntries, replaceStrikesWeight, regexStrikesWeight) {
    console.log("running generateimageKeyValueList")
    console.log("ocr_object_list: ")
    console.log(ocr_object_list)
    for (var wordObj of ocr_object_list){
        const wordText = wordObj.word_text;
        const numberScore = scoreOCRNumber(wordText, replaceStrikesWeight, regexStrikesWeight);
        wordObj.numberScore = numberScore;
    }

    // Finds which ocr values are probably a sought after csv field (will mutate ocr_object_list)
    let probableKeys = {};
    for (const field of field_names) {
        const csvField = field.csvfield;
        const replacementList = field.replacements;
        const keyMatchResult = await evalKeyConfidence(csvField, replacementList, ocr_object_list, keySearchThreshold, maxKeyEntries, fuseThreshold);
        probableKeys[keyMatchResult.csv_value] = keyMatchResult.closest_matches;
    }

    //search for innate structural offset between different probable keys and probable values
    //isolate each page
    let imageDic = {};
    for (var wordObj of ocr_object_list) {
        const pageKey = wordObj.imageName;
        if (!(pageKey in imageDic)) {
            imageDic[pageKey] = {
                keys: [],
                values: []
            };
        }
        // Check if key or value and add to appropriate key or value
        if (wordObj.potential_matches.size > 0) {
            imageDic[pageKey].keys.push(wordObj);
            continue;
        }
        if (wordObj.numberScore > 0.8) {
            imageDic[pageKey].values.push(wordObj);
            continue;
        }
    }
          
    console.log("final generateimageKeyValueList output: ")
    console.log(imageDic);
    return imageDic;
}


//TODO
export async function findKeyValuePairs(imageKeyValueList, ) {
    
    for (const pageObj of Object.values(imageKeyValueList)) {
        const dataStructPattern = findDataStructPat(pageObj) //atm just finds list of key value pairs that show spatial allignment of some sort
        for (const keyWordObj of page.keys) {
            


            // code for searching for best value
            // find closest value
            //find most horizontally in line

            //
        }
    }
}


//mutates imageKeyValList to include information about keys with structure
export async function findDataStructPattern(imageKeyValueList) {
    console.log("running findDataStructPattern")
    console.log("imageKeyValueList:")
    console.log(imageKeyValueList)
    for (var pageObj of Object.values(imageKeyValueList)) {
        pageObj['keyValStructPattern'] = findPageDataStructPattern(pageObj)
    }
}


//identifies if there is a positional pattern between keywords and values by noting distances between each keyword and all values
//notes if distance/direction is the same and is indicative of a positional data structure
//also notes keys in relation to each otehr

function findPageDataStructPattern(pageObj, angleTolerance = 5) {
    console.log("running findPageDataStructPattern")
    console.log("pageObj: ")
    console.log(pageObj)

    const keywords = pageObj.keys 
    const values = pageObj.values

    const keyValueDistances = {};

    for (const key of keywords) {
        let valueDic = {}
        for (const value of values) {
            const dx = value.word_x - key.word_x
            const dy = value.word_y - key.word_y
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            valueDic[value.uniqueKey] = {
                valUniqueKey: value.uniqueKey,
                dx,
                dy,
                distance,
                angle
            }
        }
        keyValueDistances[key.uniqueKey] = valueDic
    }

    //
    let evidenceGroupings = []
    console.log(`iterating over the following:`)
    console.log(keyValueDistances)
    //identifies key and value pairs based on matching angles
    for (const keyUniqueKey of Object.keys(keyValueDistances)) {

        const valueDic = keyValueDistances[keyUniqueKey]
        console.log(`nested iterating over the following:`)
        console.log(valueDic)
        for (const valueUniqueKey of Object.keys(valueDic)) {
            const valueInfo = valueDic[valueUniqueKey]
            //find if there is group match
            let foundGroup = false
            for (var grouping of evidenceGroupings) {
                const newAverageAngle = (grouping.averagedAngle * grouping.count + valueInfo.angle) / (grouping.count + 1)
                const sameAngle = Math.abs(newAverageAngle - grouping.averagedAngle) <= angleTolerance
                
                if (!sameAngle) continue;
                
                const horizontalAngle = isHorizontalAngle(valueInfo.angle)
                const verticalAngle = isVerticalAngle(valueInfo.angle)
                const isDirectional = horizontalAngle || verticalAngle
                const exists = keyUniqueKey in grouping.keyValuePairs;

                if (exists && isDirectional) continue;

                if (!exists) {
                    grouping.keyValuePairs[keyUniqueKey] = [];
                }

                grouping.keyValuePairs[keyUniqueKey].push(valueInfo);
                grouping.averagedAngle = newAverageAngle;
                grouping.count += 1;
                foundGroup = true
                break
            }
            //create new group if none found
            if (!foundGroup) {
                evidenceGroupings.push({
                    keyValuePairs: {
                        [keyUniqueKey]: [valueInfo]
                    },
                    averagedAngle: valueInfo.angle,
                    count: 1
                })
            }

        }
    }
    return evidenceGroupings.filter(grouping => grouping.count > 1)
}

function isHorizontalAngle(angle, tolerance = 10) {
    return (
        Math.abs(angle) <= tolerance ||        // near 0° (right)
        Math.abs(angle - 180) <= tolerance     // near 180° (left)
    );
}

function isVerticalAngle(angle, tolerance = 10) {
    return (
        Math.abs(angle - 90) <= tolerance ||   // near 90° (down)
        Math.abs(angle + 90) <= tolerance      // near -90° (up)
    );
}