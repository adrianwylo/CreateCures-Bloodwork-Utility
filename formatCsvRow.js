
import Fuse from 'fuse.js';


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


export const field_names = [
    { csvfield: 'AST', replacements: ['ast', 'aspartate aminotransferase', 'aspartate transaminase', 'sgot', 'serum glutamic oxaloacetic transaminase', 'asp aminotransferase'] },
    { csvfield: 'ALT', replacements: ['alt', 'alanine aminotransferase', 'alanine transaminase', 'sgpt', 'serum glutamic pyruvic transaminase', 'ala aminotransferase', 'alat'] },
    { csvfield: 'GLOBULIN', replacements: ['globulin', 'serum globulin', 'total globulin', 'glob', 'globulins'] },
    { csvfield: 'BUN', replacements: ['bun', 'blood urea nitrogen', 'urea nitrogen', 'urea', 'blood urea'] },
    { csvfield: 'FASTING_GLUCOSE', replacements: ['fasting glucose', 'glucose fasting', 'fbs', 'fasting blood sugar', 'glucose', 'blood glucose', 'serum glucose', 'plasma glucose', 'gluc', 'glu', 'fast glucose', 'glucose fast'] },
    { csvfield: 'A1C', replacements: ['a1c', 'hba1c', 'hemoglobin a1c', 'glycated hemoglobin', 'glycohemoglobin', 'hgb a1c', 'hb a1c', 'a1c hemoglobin', 'hemoglobin a1c'] },
    { csvfield: 'RBC', replacements: ['rbc', 'red blood cells', 'red blood cell count', 'erythrocytes', 'red cell count', 'rbc count', 'red cells'] },
    { csvfield: 'HGB', replacements: ['hgb', 'hemoglobin', 'hb', 'haemoglobin', 'hemo'] },
    { csvfield: 'HCT', replacements: ['hct', 'hematocrit', 'haematocrit', 'packed cell volume', 'pcv'] },
    { csvfield: 'WBC', replacements: ['wbc', 'white blood cells', 'white blood cell count', 'leukocytes', 'white cell count', 'wbc count', 'white cells', 'leucocytes'] },
    { csvfield: 'PLATELETS', replacements: ['platelets', 'platelet count', 'plt', 'thrombocytes', 'plts'] },
    { csvfield: 'SODIUM', replacements: ['sodium', 'na', 'serum sodium', 'na+', 'sod'] },
    { csvfield: 'POTASSIUM', replacements: ['potassium', 'k', 'serum potassium', 'k+', 'pot'] },
    { csvfield: 'CHLORIDE', replacements: ['chloride', 'cl', 'serum chloride', 'cl-', 'chlor'] },
    { csvfield: 'CALCIUM', replacements: ['calcium', 'ca', 'serum calcium', 'ca++', 'total calcium', 'ca2+'] },
    { csvfield: 'CO2', replacements: ['co2', 'carbon dioxide', 'bicarbonate', 'hco3', 'total co2', 'co2 total', 'bicarb', 'tco2'] },
    { csvfield: 'IGF1', replacements: ['igf1', 'igf-1', 'insulin-like growth factor 1', 'insulin like growth factor', 'somatomedin c', 'igf 1'] },
    { csvfield: 'FASTING_INSULIN', replacements: ['fasting insulin', 'insulin fasting', 'insulin', 'serum insulin', 'plasma insulin', 'fast insulin', 'insulin fast'] },
    { csvfield: 'BETA_HYDROXYBUTYRATE', replacements: ['beta hydroxybutyrate', 'beta-hydroxybutyrate', 'b-hydroxybutyrate', 'bhb', 'ketones', 'serum ketones', 'beta hydroxy butyrate'] },
    { csvfield: 'B12', replacements: ['b12', 'vitamin b12', 'vitamin b-12', 'cobalamin', 'cyanocobalamin', 'b 12', 'vit b12', 'folate b12'] },
    { csvfield: 'Vitamin_D', replacements: ['vitamin d', 'vitamin d3', 'vitamin d 25-oh', '25-hydroxyvitamin d', '25 oh vitamin d', 'calcidiol', 'vit d', 'vitamin d total', '25-oh-d3', '25(oh)d', 'vitamin d 25 hydroxy'] },
    { csvfield: 'MAGNESIUM', replacements: ['magnesium', 'mg', 'serum magnesium', 'mg++', 'mag'] },
    { csvfield: 'IRON', replacements: ['iron', 'fe', 'serum iron', 'iron serum', 'total iron'] },
    { csvfield: 'CRP', replacements: ['crp', 'c-reactive protein', 'c reactive protein', 'c-rp', 'high sensitivity crp', 'hs-crp', 'hs crp'] },
    { csvfield: 'CHOLESTEROL', replacements: ['cholesterol', 'total cholesterol', 'chol', 'tc', 'serum cholesterol', 'total chol'] },
    { csvfield: 'HOMOCYSTEINE', replacements: ['homocysteine', 'hcy', 'homo-cysteine', 'homocyst', 'total homocysteine'] }
];

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



export async function testingJsonProcessing( ocr_object_list) {
    // This function is for debugging purposes to test the JSON processing logic

    //mutates json input with a new property for potential of being a value and a bounding box center point
    for (var word_object of ocr_object_list){
        const possible_val = word_object.word_text
        const val_score = scoreOCRNumber(possible_val)
        word_object['number_score'] = val_score
        word_object['center_value'] = {
            centerx: (word_object.word_bbox.x1 + word_object.word_bbox.x0)/2,
            centery: (word_object.word_bbox.y1 + word_object.word_bbox.y0)/2,
        }
        word_object['potential_keys_for'] = new Set()
    }

    //finds which ocr values are probably a sought after csv field (will mutate ocr_object_list)
    let probable_keys = {}
    for (const field of field_names) {
        const field_name = field.csvfield
        const field_replacements = field.replacements
        const field_key_value_pair = await evalKeyConfidence(field_name, field_replacements, ocr_object_list)
        probable_keys[field_key_value_pair.csv_value] = field_key_value_pair.closest_matches
    }

    console.log(ocr_object_list)

    //search for innate structural offset between different probable keys and probable values
    //isolate each page
    let image_dic = {}
    for (var word_object of ocr_object_list) {
        const page_key = word_object.imageName
        if (page_key in image_dic) {
            // Check if key or value and add to appropriate key or value
            if (word_object.potential_keys_for instanceof Set) {
                if (word_object.potential_keys_for.size > 0) {
                    // console.log('Pushing key:', word_object.word_text, 'potential_keys_for:', word_object.potential_keys_for);
                    image_dic[page_key].keys.push(word_object);
                    continue;
                } else {
                    // Debug: Set is empty
                    //console.log('Empty potential_keys_for Set for:', word_object.word_text);
                }
            } else {
                // Debug: Not a Set
                //console.warn('potential_keys_for is not a Set for:', word_object.word_text, word_object.potential_keys_for);
            }
            if (word_object.number_score > 0.9) {
                image_dic[page_key].values.push(word_object);
                continue;
            }
        } else {
            image_dic[page_key] = {
                keys: [],
                values: []
            };
        }
    }
    console.log(image_dic)
    return image_dic



}


//
export async function processToCsv(resultsObject) {
    let final_csv = {... curRowFormat}
    for (const [key, value] of Object.entries(final_csv)) {
        if (value === null) {
            if (key in resultsObject) {
                final_csv[key] = resultsObject[key]
            }
        }
    }
    const csv = [
        Object.keys(obj).join(','),       // header row
        Object.values(obj).join(',')      // value row
    ].join('\n');
    return csv
}

