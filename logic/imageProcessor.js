import {createRow} from './formatCsvRows.js';
import {cleanImage} from './imageCleaner.js';
import Tesseract from 'tesseract.js';


export async function processImages(files) {
    for (const file of files) {
        //clean up the image
        const cleanedImage = await cleanImage(file);

        //read and process the image
        try {
            const result = await Tesseract.recognize(
                file, // Path or Blob of the image
                'eng',     // Language code (English in this case)
                {
                    logger: info => console.log(info) // Log progress
                }
            );
            console.log('Extracted Text:', result.data.text);
            return result.data.text;
        } catch (error) {
            console.error('Error during OCR:', error);
            throw error;
        }

        //create the csv using results
    }
}