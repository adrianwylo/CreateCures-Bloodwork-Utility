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

//
export async function processJsonToCSV(json_input) {
    
}
