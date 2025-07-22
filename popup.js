import {processTestImages} from './imageProcessor.js'
import {filterImageFiles} from './imageCleaner.js'
import {processJsonToCSV} from './formatCsvRow.js'

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('process-btn-test').addEventListener('click', async () => {
        try {
            const files = document.getElementById('bloodwork-files').files;
            const allImages = await filterImageFiles(files);
            console.log('Number of image files found:', allImages.length);
            console.log('Files ready for processing', allImages);
            const final_data = await processTestImages(allImages);

            // Download raw JSON output
            const json = JSON.stringify(final_data, null, 2);
            const json_blob = new Blob([json], { type: 'application/json' });
            const json_url = URL.createObjectURL(json_blob);
            const json_a = document.createElement('a');
            json_a.href = json_url;
            json_a.download = 'raw_json_output.json';
            document.body.appendChild(json_a);
            json_a.click();
            document.body.removeChild(json_a);
            URL.revokeObjectURL(json_url);
            
            // Download CSV output
            const csv = await processJsonToCSV(final_data); // Pass the object, not the string
            const csv_blob = new Blob([csv], { type: 'application/csv' });
            const csv_url = URL.createObjectURL(csv_blob);
            const csv_a = document.createElement('a');
            csv_a.href = csv_url;
            csv_a.download = 'output.csv';
            document.body.appendChild(csv_a);
            csv_a.click();
            document.body.removeChild(csv_a);
            URL.revokeObjectURL(csv_url);
        } catch (err) {
            console.error('Error during processing:', err);
        }
    });
});
