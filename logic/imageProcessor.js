import {createRow} from './formatCsvRows.js';
import {cleanImage} from './imageCleaner.js';
import Tesseract from 'tesseract.js';

const { createWorker, createScheduler } = require('tesseract.js');
const path = require('path');
const fs = require('fs').promises;


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

export async function processTestImages(files) {
    const folderPath = path.resolve(__dirname, 'TestImages')
    try {
        // readfiles
        console.log('Reading files from the specified folder:', folderPath);
        const files = await fs.readdir(folderPath)
        if (files.length === 0) {
            throw new Error('No image files found in the specified folder.');
        }
        console.log('Number of image files found:', files.length);
        const imageArr = files.map(file => path.join(folderPath, file));


        // Create scheduler
        const scheduler = createScheduler();
        
        //worker creator function
        const workerGen = async () => {
            const worker = await createWorker("eng", 1, { logger: m => console.log(m), cachePath: "." });
            scheduler.addWorker(worker)
        }

        //worker creation
        const workerN = 10;
        const resArr = Array(workerN);
        for (let i=0; i<workerN; i++) {
            resArr[i] = workerGen();
        }
        await Promise.all(resArr)

        // Process images 
        console.log('Performing OCR:');

        const jobPromises = imageArr.map(async (imagePath) => {
            console.log(`Scheduling image processing for: ${imagePath}`);
            return scheduler.addJob('recognize', imagePath)
                .then(out => ({
                    imageName: path.basename(imagePath),
                    words: out.data.words.map(word => ({
                        text: word.text,
                        confidence: word.confidence.toFixed(2),
                        bbox: word.bbox
                    })),
                }))
                .catch(error => ({
                    imageName: path.basename(imagePath),
                    error:error.message,
                }));
        });

        //saved {}'s of all images
        const results = await Promise.all(jobPromises)

        await scheduler.terminate();
        console.log('OCR processing completed.');
        



    } catch (error) {
        console.error('Error:', error.message);

    }

}