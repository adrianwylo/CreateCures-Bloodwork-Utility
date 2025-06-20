const Default_Row_Format = {
    Date: null,
    Intervention: null,
    AST: null,
    AST_RangeLow: 8,
    AST_RangeHigh: 33,
    ALT: null,
    ALT_RangeLow: 4,
    ALT_RangeHigh: 36,
    GLOBULIN: null,
    GLOBULIN_RangeLow: 1.9,
    GLOBULIN_RangeHigh: 4.1,
    BUN: null,
    BUN_RangeLow: 6,
    BUN_RangeHigh: 20,
    FASTING_GLUCOSE: null,
    FASTING_GLUCOSE_RangeLow: 70,
    FASTING_GLUCOSE_RangeHigh: 99,
    A1C: null,
    A1C_RangeLow: 0,
    A1C_RangeHigh: 5.5,
    RBC: null,
    RBC_RangeLow: 4.5,
    RBC_RangeHigh: 5.9,
    HGB: null,
    HGB_RangeLow: 13.5,
    HGB_RangeHigh: 17.5,
    HCT: null,
    HCT_RangeLow: 41,
    HCT_RangeHigh: 53,
    WBC: null,
    WBC_RangeLow: 4,
    WBC_RangeHigh: 11,
    PLATELETS: null,
    PLATELETS_RangeLow: 150,
    PLATELETS_RangeHigh: 400,
    SODIUM: null,
    SODIUM_RangeLow: 135,
    SODIUM_RangeHigh: 145,
    POTASSIUM: null,
    POTASSIUM_RangeLow: 3.4,
    POTASSIUM_RangeHigh: 5,
    CHLORIDE: null,
    CHLORIDE_RangeLow: 98,
    CHLORIDE_RangeHigh: 108,
    CALCIUM: null,
    CALCIUM_RangeLow: 8.5,
    CALCIUM_RangeHigh: 10.5,
    CO2: null,
    CO2_RangeLow: 23,
    CO2_RangeHigh: 32,
    IGF1: null,
    IGF1_RangeLow: 120,
    IGF1_RangeHigh: 160,
    FASTING_INSULIN: null,
    FASTING_INSULIN_RangeLow: 2,
    FASTING_INSULIN_RangeHigh: 6,
    BETA_HYDROXYBUTYRATE: null,
    BETA_HYDROXYBUTYRATE_RangeLow: 0,
    BETA_HYDROXYBUTYRATE_RangeHigh: 7,
    B12: null,
    B12_RangeLow: 500,
    B12_RangeHigh: 1300,
    MAGNESIUM: null,
    MAGNESIUM_RangeLow: 1.7,
    MAGNESIUM_RangeHigh: 2.4,
    CRP: null,
    CRP_RangeLow: 1,
    CRP_RangeHigh: 3,
    IRON: null,
    IRON_MaleRangeLow: 50,
    IRON_MaleRangeHigh: 150,
    IRON_FemaleRangeLow: 35,
    IRON_FemaleRangeHigh: 145,
    CHOLESTEROL: null,
    CHOLESTEROL_RangeLow: 0,
    CHOLESTEROL_RangeHigh: 200,
    HOMOCYSTEINE: null,
    HOMOCYSTEINE_RangeLow: 5,
    HOMOCYSTEINE_RangeHigh: 15,
    Vitamin_D: null,
    Vitamin_D_RangeLow: 40,
    Vitamin_D_RangeHigh: 90
};

const field_names = {
    // Liver Function Tests
    AST: [
        'ast', 'aspartate aminotransferase', 'aspartate transaminase', 'sgot', 
        'serum glutamic oxaloacetic transaminase', 'asp aminotransferase'
    ],
    
    ALT: [
        'alt', 'alanine aminotransferase', 'alanine transaminase', 'sgpt', 
        'serum glutamic pyruvic transaminase', 'ala aminotransferase', 'alat'
    ],
    
    // Protein Tests
    GLOBULIN: [
        'globulin', 'serum globulin', 'total globulin', 'glob', 'globulins'
    ],
    
    // Kidney Function
    BUN: [
        'bun', 'blood urea nitrogen', 'urea nitrogen', 'urea', 'blood urea'
    ],
    
    // Diabetes/Glucose Tests
    FASTING_GLUCOSE: [
        'fasting glucose', 'glucose fasting', 'fbs', 'fasting blood sugar', 
        'glucose', 'blood glucose', 'serum glucose', 'plasma glucose',
        'gluc', 'glu', 'fast glucose', 'glucose fast'
    ],
    
    A1C: [
        'a1c', 'hba1c', 'hemoglobin a1c', 'glycated hemoglobin', 'glycohemoglobin',
        'hgb a1c', 'hb a1c', 'a1c hemoglobin', 'hemoglobin a1c'
    ],
    
    // Complete Blood Count
    RBC: [
        'rbc', 'red blood cells', 'red blood cell count', 'erythrocytes', 
        'red cell count', 'rbc count', 'red cells'
    ],
    
    HGB: [
        'hgb', 'hemoglobin', 'hb', 'haemoglobin', 'hemo'
    ],
    
    HCT: [
        'hct', 'hematocrit', 'haematocrit', 'packed cell volume', 'pcv'
    ],
    
    WBC: [
        'wbc', 'white blood cells', 'white blood cell count', 'leukocytes', 
        'white cell count', 'wbc count', 'white cells', 'leucocytes'
    ],
    
    PLATELETS: [
        'platelets', 'platelet count', 'plt', 'thrombocytes', 'plts'
    ],
    
    // Electrolytes
    SODIUM: [
        'sodium', 'na', 'serum sodium', 'na+', 'sod'
    ],
    
    POTASSIUM: [
        'potassium', 'k', 'serum potassium', 'k+', 'pot'
    ],
    
    CHLORIDE: [
        'chloride', 'cl', 'serum chloride', 'cl-', 'chlor'
    ],
    
    CALCIUM: [
        'calcium', 'ca', 'serum calcium', 'ca++', 'total calcium', 'ca2+'
    ],
    
    CO2: [
        'co2', 'carbon dioxide', 'bicarbonate', 'hco3', 'total co2', 
        'co2 total', 'bicarb', 'tco2'
    ],
    
    // Hormones
    IGF1: [
        'igf1', 'igf-1', 'insulin-like growth factor 1', 'insulin like growth factor',
        'somatomedin c', 'igf 1'
    ],
    
    FASTING_INSULIN: [
        'fasting insulin', 'insulin fasting', 'insulin', 'serum insulin',
        'plasma insulin', 'fast insulin', 'insulin fast'
    ],
    
    // Ketones
    BETA_HYDROXYBUTYRATE: [
        'beta hydroxybutyrate', 'beta-hydroxybutyrate', 'b-hydroxybutyrate',
        'bhb', 'ketones', 'serum ketones', 'beta hydroxy butyrate'
    ],
    
    // Vitamins
    B12: [
        'b12', 'vitamin b12', 'vitamin b-12', 'cobalamin', 'cyanocobalamin',
        'b 12', 'vit b12', 'folate b12'
    ],
    
    Vitamin_D: [
        'vitamin d', 'vitamin d3', 'vitamin d 25-oh', '25-hydroxyvitamin d',
        '25 oh vitamin d', 'calcidiol', 'vit d', 'vitamin d total',
        '25-oh-d3', '25(oh)d', 'vitamin d 25 hydroxy'
    ],
    
    // Minerals
    MAGNESIUM: [
        'magnesium', 'mg', 'serum magnesium', 'mg++', 'mag'
    ],
    
    IRON: [
        'iron', 'fe', 'serum iron', 'iron serum', 'total iron'
    ],
    
    // Inflammatory Markers
    CRP: [
        'crp', 'c-reactive protein', 'c reactive protein', 'c-rp', 
        'high sensitivity crp', 'hs-crp', 'hs crp'
    ],
    
    // Lipids
    CHOLESTEROL: [
        'cholesterol', 'total cholesterol', 'chol', 'tc', 'serum cholesterol',
        'total chol'
    ],
    
    // Cardiovascular
    HOMOCYSTEINE: [
        'homocysteine', 'hcy', 'homo-cysteine', 'homocyst', 'total homocysteine'
    ],
    
};






//placeholder for persistent curRowFormat
let curRowFormat = { ...Default_Row_Format };

//modify row format based on field and range value
export async function modifyRowFormat(field, rangeValue, newValue) {
    // Check if the field exists in curRowFormat
    if (curRowFormat.hasOwnProperty(field)) {
        // If modifying the main field value
        if (!rangeValue) {
            curRowFormat[field] = newValue;
        } else {
            // If modifying a range value (e.g., RangeLow or RangeHigh)
            const rangeKey = `${field}_${rangeValue}`;
            if (curRowFormat.hasOwnProperty(rangeKey)) {
                curRowFormat[rangeKey] = newValue;
            } else {
                console.error(`Range key "${rangeKey}" does not exist in curRowFormat.`);
            }
        }
    } else {
        console.error(`Field "${field}" does not exist in curRowFormat.`);
    }
}


// Evaluates how close a given value is to an expected string using fuzzy matching.
// Returns a confidence score between 0 and 1, where 1 means an exact match
// ocr_word: an object containing the OCR word text and other information
// expected_key: the expected key string to match against
async function evalKeyConfidence(ocr_word, expected_key) {
    //placeholder for fuzzy matching logic
    return 1; // Replace with actual fuzzy matching logic
}

// Evaluates how confident ocr_word is a number
// Returns a confidence score between 0 and 1, where 1 means an exact match
async function evalValueConfidence(ocr_word, expected_value) {
    //placeholder for fuzzy matching logic
    return 1; // Replace with actual fuzzy matching logic
}


// Evaluates how confident a key-value pair is correct
// Returns a confidence score between 0 and 1, where 1 means an exact match
async function evaleKeyValueConfidence(ocr_key,ocr_value) {
    //Evaluate vertical alignment of key and value
    //Evaluate horizontal alignment of key and value
    //Evaluate distance between key and value
}



//  Processes the input JSON data to extract relevant fields and format them into a CSV row.
//  Returns an array of objects, each representing a row in the CSV format.
export async function processJsonToCSV(json_input) {
    // evaluate input JSON and rank relevant keys
    const probable_keys = {
        // Liver Function Tests
        AST: [],
        
        ALT: [],
        
        // Protein Tests
        GLOBULIN: [],
        
        // Kidney Function
        BUN: [],
        
        // Diabetes/Glucose Tests
        FASTING_GLUCOSE: [],
        
        A1C: [],
        
        // Complete Blood Count
        RBC: [],
        
        HGB: [],
        
        HCT: [],
        
        WBC: [],
        
        PLATELETS: [],
        
        // Electrolytes
        SODIUM: [],
        
        POTASSIUM: [],
        
        CHLORIDE: [],
        
        CALCIUM: [],
        
        CO2: [],
        
        // Hormones
        IGF1: [],
        
        FASTING_INSULIN: [],
        
        // Ketones
        BETA_HYDROXYBUTYRATE: [],
        
        // Vitamins
        B12: [],
        
        Vitamin_D: [],
        
        // Minerals
        MAGNESIUM: [],
        
        IRON: [],
        
        // Inflammatory Markers
        CRP: [],
        
        // Lipids
        CHOLESTEROL: [],
        
        // Cardiovascular
        HOMOCYSTEINE: [],
    };

    const final_key_values = {}


    //evaluate input JSON and rank relevant keys
    for (const key in probable_keys) {
        //iterate through each page scanned
        for (const json_page in json_input) {
            //iterate through each word in the page
            for (const ocr_word_info of json_page.words) {
                //evaluate the confidence of the word matching the expected key
                const confidence = await evalKeyConfidence(ocr_word_info, key);
                //if confidence is above a threshold, add to probable keys
                if (confidence > 0.7) {
                    probable_keys[key].push({
                        word: ocr_word_info,
                        keyConfidence: confidence,
                        page: json_page.imageName,
                    });
                }
            }
        }
        probable_keys[key].sort((a, b) => b.keyConfidence - a.keyConfidence);
        // Keep only top 5
        if (probable_keys[key].length > 5) {
            probable_keys[key] = probable_keys[key].slice(0, 5);
        }
    }

    //evaluate input JSON and add value confidence to each word
    for (const json_page in json_input) {
        //iterate through each word in the page
        for (const ocr_word_info of json_page.words) {
            //evaluate the confidence of the word matching the expected key
            const confidence = await evalValueConfidence(ocr_word_info, key);
            json_page.words.valueConfidence = confidence;
        }
    }

    // Evaluate key-value pairs and their confidence
    for (const key in probable_keys) {
        const curConfidence = 0;
        for (const key_options in probable_keys[key]) {
            for (const ocr_key in key_options) {
                const fileName = ocr_key.page
                const relevantPage = json_input.find(page => page.imageName === fileName);
                for (const ocr_value of relevantPage.words) {
                    const confidence = await evaleKeyValueConfidence(ocr_key, ocr_value);
                    if (confidence > curConfidence) {
                        curConfidence = confidence;
                        final_value = ocr_value.word.text; // Assuming the value is in the text property
                    }
                }
            }
        }
        final_key_values[key] = final_value
    }


    // Create the final CSV row object
    const csvRow = { ...curRowFormat };
    for (const key in final_key_values) {
        if (final_key_values[key] !== undefined) {
            csvRow[key] = final_key_values[key];
        } else {
            csvRow[key] = null; // or some default value
        }
    }

    return csvRow
}
