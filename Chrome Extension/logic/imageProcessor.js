import {createRow} from './formatCsvRows.js';
import {cleanImage} from './imageCleaner.js';

export async function processImages(files) {
    for (const file of files) {
        //clean up the image
        const cleanedImage = await cleanImage(file);

        //read and process the image

        //create the csv using 
    }
}