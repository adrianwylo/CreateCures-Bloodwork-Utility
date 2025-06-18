import {processTestImages} from './imageProcessor.js'

import * as pdfjsLib from './node_modules/pdfjs-dist/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = './node_modules/pdfjs-dist/build/pdf.worker.mjs';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('process-btn-test').addEventListener('click', async () => {
        const files = document.getElementById('bloodwork-files').files;
        //Filter files
        // Deal w/ image files (e.g., PNG, JPEG, etc.)
        const imageFiles = Array.from(files).filter(file => 
            file.type.startsWith('image/')
        );

        // // Handle PDF files (Convert to images)
        const pdfFiles = Array.from(files).filter(file => 
            file.type === 'application/pdf'
        );

        //Convert Pdf files to Images
        const convertedPdfFiles = []
        for (const pdffile of pdfFiles) {
            const arrayBuffer = await pdffile.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer }); 
            
            try {
                const pdf = await loadingTask.promise;
                console.log(`PDF loaded: ${pdffile.name}`);
                const numPages = pdf.numPages;

                for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 2 });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');

                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    await page.render({ canvasContext: context, viewport }).promise;

                    const imageDataUrl = canvas.toDataURL('image/png');
                    convertedPdfFiles.push(imageDataUrl);
                }
            } catch (err) {
                console.error(`Error loading ${pdffile.name}:`, err);
            }
        }

        //Flatten files into an array
        const allImages = [
            ...imageFiles,
            ...convertedPdfFiles
        ]

        console.log('Files ready for processing', allImages);
        const final_data = await processTestImages(allImages)
        

        // Convert your JavaScript object or array to a JSON string
        const json = JSON.stringify(final_data, null, 2); // Pretty print with 2-space indentation

        // Create a Blob from the JSON string
        const blob = new Blob([json], { type: 'application/json' });

        // Create a temporary download URL
        const url = URL.createObjectURL(blob);

        // Create an anchor element to trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output.json';
        a.click();

        // Clean up the URL object to free memory
        URL.revokeObjectURL(url);
    });
});
