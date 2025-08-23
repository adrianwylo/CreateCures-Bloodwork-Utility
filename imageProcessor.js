import {createScheduler, createWorker, PSM} from 'tesseract.js';
import Fuse from 'fuse.js';
import {field_names} from './formatCsvRow';
import {markupOcrResults, displayImages} from './imageMarkup';

/**
 * Performs Ocr, cleans results, and evaluates each result's potential of being a sought after value through mutating the potential_matchs and numberScore properties
 *
 * @param {File[]} allImages - Array of image files to be processed.
 * @param {float} fuseThreshold - numerical threshold option for fuzzy searching with fuse.js
 * @param {float} resultThreshold - score threshold for accepting fuse result score
 * @returns {Object[]} Filtered and cleaned array of scored word objects
 */
export async function processDocumentCollection(
    allImages, 
    fuseThreshold,
    resultThreshold,
    downloadOcrResults,
    displayOcrResults
    ) {
    //run OCR
    // returns ocr_results: Array of word objects extracted from OCR results.
    // Each object represents a single recognized word with metadata:
    // {
    //   word_text: String        // The recognized word text
    //   word_confidence: Number  // Confidence score from Tesseract (0–100)
    //   word_choices: Array      // Alternative recognition choices (empty if none)
    //   word_y: Number           // Top Y coordinate of word bounding box
    //   word_x: Number           // Left X coordinate of word bounding box
    //   height: Number           // Height of bounding box
    //   width: Number            // Width of bounding box
    //   potential_matches: Set   // Placeholder for matching to hardcoded keys
    //   uniqueKey: String        // Unique hierarchical key (block/para/line/word)
    //   imageName: String        // Name of source image/PDF page
    //   rotateRadians: Number    // Page rotation in radians
    //   numberScore: Number      // Placeholder scoring for numeric parsing
    // }
    let currentOcrResults = await ocrProcessing(allImages);

    //cleaned OCR results
    //returns same format as ocrProcessing
    currentOcrResults =  ocrCleaning(currentOcrResults)
    
    //mutates currentOcrResults to score probability of word_text being a sought after csv value
    //returns an object that maps csv_value to array of 'matched' ocr objects (fuse output form) 
    const fuseResults = scoreKeyOcr(currentOcrResults, field_names, fuseThreshold, resultThreshold)
    
    //mutates currentOcrResults to score probability of word_text being a sought after numerical value
    scoreValOcr(currentOcrResults)
    
    //downloads mutated OcrResults
    if (downloadOcrResults) {
        console.log("requesting ocr json output download")
        const json = JSON.stringify(currentOcrResults, null, 2);
        const json_blob = new Blob([json], { type: 'application/json' });
        const json_url = URL.createObjectURL(json_blob);
        const json_a = document.createElement('a');
        json_a.href = json_url;
        json_a.download = 'mutated_json_output.json';
        document.body.appendChild(json_a);
        json_a.click();
        document.body.removeChild(json_a);
        URL.revokeObjectURL(json_url);
    }

    //markup Ocr Results for display
    if (displayOcrResults) {
        const markedImages = await markupOcrResults(allImages, currentOcrResults)
        displayImages(markedImages)
    }

    return currentOcrResults
}

/**
 * Processes an array of image files using Tesseract.js OCR with multiple workers.
 * Performs text recognition on each image and extracts word-level data including confidence, choices, bounding boxes, and rotation.
 * Returns a flattened array of word objects for all processed images.
 *
 * @param {File[]} files - Array of image files to be processed.
 * @returns {Promise<Object[]>} Resolves to an array of word objects containing OCR results for each image.
 * @throws {Error} Throws if no images are provided.
 */
async function ocrProcessing(files) {    
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
                        const paragraphKey = `b_${blockIdx};p_${paraIdx}`;
                        para.lines.forEach((line, lineIdx) => {
                            const lineKey = `${paragraphKey};l_${lineIdx}`;
                            line.words.forEach((word, wordIdx) => {
                                var word_choices = word.choices
                                if (word_choices.length < 2) {
                                    word_choices = []
                                }
                                const uniqueKey = `${lineKey};w_${wordIdx};`
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
 * Processes array word objects from ocrProcessing
 * Performs cleaning of results (text normalization, noise filtering, word-regrouping)
 * Returns a filtered array of word objects with some changed metadata TODO
 *
 * @param {Object[]} rawOcrResults - Array of word objects produced by OCR.
 * @returns {Object[]} Filtered and cleaned array of word objects.
 * @throws {Error} If the input array is empty or invalid.
 */
function ocrCleaning(rawOcrResults) {
    //Removal of low score values
    let workingOcrResults = rawOcrResults.filter(word => word.word_confidence >= 80);
   
    //Normalize text: convert all word_text to lowercase
    workingOcrResults = workingOcrResults.map(wordObj => ({
        ...wordObj,
        word_text: wordObj.word_text.toLowerCase()
    }));

    //Token merging and Splitting TODO
    //for now gets rid of words that are single characters that aren't numbers
    workingOcrResults = rawOcrResults.filter(word => {
        return word.word_text.length > 1 || /^\d$/.test(word.word_text);
    });

    return workingOcrResults
}

/**
 * Performs fuzzy matching on all words in Ocr word list, finding the best matches per field_name (from ./formatCsvRow)
 * Mutates the matched Ocr word objects' potential_matches property by adding potential matches to each word where search threshold is maintained {
 *      'matched_word': csv field name
        'word_score': fuse score result
 * }
 * Returns an object that maps all csv fields to the array of 'matched' ocr objects (fuse output form)
 *
 * @param {Object[]} currentOcrResults - Array of word objects produced by OCR (to be mutated)
 * @param {Object[]} fieldNames - Array of fieldName objects {
 *      csvfield: value as found in csv format,
 *      replacements: array of potential replacement values (unused),
 * }
 * @param {float} fuseThreshold - numerical threshold option for fuzzy searching with fuse.js
 * @param {float} resultThreshold - score threshold for accepting fuse result score
 * @returns {Object} - Map between csv field name and array of 'matched' ocr objects (fuse output form)
 */
function scoreKeyOcr(currentOcrResults, field_names, fuseThreshold, resultThreshold) {
    let fieldOcrMap = {}
    for (var fieldNameObj of field_names){ 
        const csvFieldName = fieldNameObj.csvfield
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
        const fuse = new Fuse(currentOcrResults, fuseOptions);
        const pure_results = fuse
            .search(csvFieldName)
            .filter(result => result.score < resultThreshold);

        //record of filtered results
        var matchedOcrObjects = []
        for (const pure_result of pure_results) {
            matchedOcrObjects.push(pure_result)
            //mutate ocrObject
            pure_result.item.potential_matches.add({
                'matched_word': csvFieldName,
                'word_score': pure_result.score
            })
        }

        fieldOcrMap[csvFieldName] = matchedOcrObjects
    }
    return fieldOcrMap
}
        
/**
 * Performs a scoring on all words in Ocr word list that evaluates whether or not said word object is a number
 * Mutates each entry's numberScore property to reflect that
 * @param {Object[]} currentOcrResults - Array of word objects produced by OCR (to be mutated)
 * @returns {void} 
 */
function scoreValOcr(currentOcrResults) {
    const replacementWeight = 0.2
    const regexWeight = 0.3
    //replacements are only applicable when word_confidence is between 80 and 90
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
    for (var ocrObj of currentOcrResults){
        let curWordText = ocrObj.word_text;
        const wordConfidence = ocrObj.word_confidence
            
        //replacement evaluation
        let charReplaceCount = 0
        if (wordConfidence < 90) {
            let replacedText = ''
            for (let i = 0; i < curWordText.length; i++) {
                const char = curWordText[i];
                if (replacements.hasOwnProperty(char)) {
                    replacedText += replacements[char];
                    charReplaceCount++;
                } else {
                    replacedText += char;
                }
            }
            curWordText = replacedText
        }

        //regex match evaluation
        const match = curWordText.match(/(?<!\d)(\d+(\.\d+)?)(?!\d)/);
        if (!match) {
            //number score stays the same as initial 0
            continue
        }
        const extractedNumber = match[0]
        if (extractedNumber.trim() === '' || isNaN(Number(extractedNumber))) {
            //number score stays the same as initial 0
            continue
        }
        let regexPenalty = 1 - extractedNumber.length / curWordText.length;
        
        //mutation
        ocrObj.numberScore = Math.max(
            0,
            1
            - charReplaceCount * replacementWeight
            - regexPenalty * regexWeight
        )
    }
}

//---------------------------------------------------------------------------------------------




export async function findOCRDataStruct(ocr_object_list, angleTolerance = 10) {
    let imageDic = {};
    for (var wordObj of ocr_object_list) {
        const pageKey = wordObj.imageName;
        if (!(pageKey in imageDic)) {
            imageDic[pageKey] = {
                words: [],
                numbers: []
            };
        }
        //check if it is a number
        if (wordObj.numberScore > 0.8) {
            imageDic[pageKey].numbers.push(wordObj);
        } else {
            imageDic[pageKey].words.push(wordObj);
        }
    }
    //used dictionary to find innate structure
    for (var pageObj of Object.values(imageDic)) {
        const words = pageObj.words
        const numbers = pageObj.numbers
        //create object that references all distances between word and number
        let wordDic = {};
        for (const word of words) {
            let numberDic = {}
                for (const number of numbers) {
                    const dx = number.word_x - word.word_x
                    const dy = number.word_y - word.word_y
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    numberDic[number.uniqueKey] = {
                        dx,
                        dy,
                        distance,
                        angle,
                        key_x: word.word_x,
                        key_y: word.word_y
                    }
                }
            wordDic[word.uniqueKey] = numberDic
        }
        //create object that organizes above object into reoccuring similar postional offsets
        let patterns = []
        for (const [wordkey, numberObj] of Object.entries(wordDic)) {
            for (const [numberkey, distanceInfo] of Object.entries(numberObj)) {
                //searching existing patterns for a match
                var foundSameAngle = false
                for (var pattern of patterns) {
                    const newAverageAngle = (pattern.averagedAngle * pattern.count + distanceInfo.angle) / (pattern.count + 1)
                    const isSameAngle = Math.abs(newAverageAngle - pattern.averagedAngle) <= angleTolerance
                    if (!isSameAngle) continue;
                    const horizontalAngle = isHorizontalAngle(distanceInfo.angle)
                    const verticalAngle = isVerticalAngle(distanceInfo.angle)
                    const isAxial = horizontalAngle || verticalAngle
                    const sameWord = wordkey in pattern.keyValueInfo;
                    
                    if (sameWord && !isAxial) continue;
                    if (!sameWord) {
                        pattern.keyValueInfo[wordkey] = {};
                    }

                    pattern.keyValueInfo[wordkey][numberkey] = distanceInfo;
                    pattern.averagedAngle = newAverageAngle;
                    pattern.count += 1;
                    foundSameAngle = true
                    break
                }
                if (!foundSameAngle) {
                    patterns.push({
                        keyValueInfo: {
                            [wordkey]: {
                                [numberkey]: distanceInfo
                            }
                        },
                        averagedAngle: distanceInfo.angle,
                        count: 1
                    })
                }
            }
        }
        pageObj['patterns'] = patterns
    }
    return imageDic
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