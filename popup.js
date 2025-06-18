import {processTestImages} from './imageProcessor.js'
import {filterInputFiles} from './imageCleaner.js'
import {processJsonToCSV} from './formatCsvRow.js'

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('process-btn-test').addEventListener('click', async () => {
        console.log('Number of image files found:', files.length);
        const files = document.getElementById('bloodwork-files').files;
        const allImages = filterInputFiles(files)

        console.log('Files ready for processing', allImages);
        const final_data = await processTestImages(allImages)
        

        // Convert your JavaScript object or array to a JSON string
        const json = JSON.stringify(final_data, null, 2); // Pretty print with 2-space indentation

        const csv = processJsonToCSV(json);

        // Create a Blob from the JSON string
        const blob = new Blob([csv], { type: 'application/csv' });

        // Create a temporary download URL
        const url = URL.createObjectURL(blob);

        // Create an anchor element to trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output.csv';
        a.click();

        // Clean up the URL object to free memory
        URL.revokeObjectURL(url);
    });
});
