import {processTestImages, generateImageKeyValueMap} from './imageProcessor.js'
import {filterImageFiles} from './imageCleaner.js'
import {processJsonToCSV, testingJsonProcessing} from './formatCsvRow.js'
import {markupImages, markupOCR} from './imageMarkup.js'

document.querySelectorAll('input[type="range"]').forEach(slider => {
    const spanId = slider.id + '-value';
    const display = document.getElementById(spanId);
    if (display) {
    display.textContent = slider.value;
    slider.addEventListener('input', () => {
        display.textContent = slider.value;
    });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('process-btn-test').addEventListener('click', async () => {
        const fuseThreshold = parseFloat(document.getElementById('slider-fuse-threshold').value);
        const keySearchThreshold = parseFloat(document.getElementById('slider-key-search-threshold').value);
        const maxKeyEntries = parseInt(document.getElementById('slider-max-key-entries').value, 10);
        const replaceStrikesWeight = parseFloat(document.getElementById('slider-replace-strikes-weight').value);
        const regexStrikesWeight = parseFloat(document.getElementById('slider-regex-strikes-weight').value);
        console.log({
            fuseThreshold,
            keySearchThreshold,
            maxKeyEntries,
            replaceStrikesWeight,
            regexStrikesWeight
        });
        try {
            const files = document.getElementById('bloodwork-files').files;
            const allImages = await filterImageFiles(files);
            console.log('Number of image files found:', allImages.length);
            console.log('Files ready for processing', allImages);
            const final_data = await processTestImages(allImages);

            // Download raw JSON output
            // const json = JSON.stringify(final_data, null, 2);
            // const json_blob = new Blob([json], { type: 'application/json' });
            // const json_url = URL.createObjectURL(json_blob);
            // const json_a = document.createElement('a');
            // json_a.href = json_url;
            // json_a.download = 'raw_json_output.json';
            // document.body.appendChild(json_a);
            // json_a.click();
            // document.body.removeChild(json_a);
            // URL.revokeObjectURL(json_url);
            
            const imageKeyValueMap = await generateImageKeyValueMap(
                final_data,
                fuseThreshold,
                keySearchThreshold,
                maxKeyEntries,
                replaceStrikesWeight,
                regexStrikesWeight
            );
            const ocr_marked_image_list = await markupOCR(allImages, final_data)
            const marked_image_list = await markupImages(allImages, imageKeyValueMap)

            // Open a new window and display all marked images there
            const imageWindow = window.open('', '_blank', 'width=1200,height=900,scrollbars=yes,resizable=yes');
            if (imageWindow) {
                imageWindow.document.write('<!DOCTYPE html><html><head><title>Marked Images</title>');
                imageWindow.document.write('<style>body{background:#222;color:#fff;font-family:sans-serif;margin:0;padding:2em;} .img-wrap{margin:2em 0;text-align:center;} img{max-width:95vw;max-height:80vh;box-shadow:0 0 10px #000;} button{position:fixed;top:1em;right:1em;z-index:1000;padding:0.5em 1em;font-size:1.2em;}</style>');
                imageWindow.document.write('</head><body>');
                imageWindow.document.write('<button onclick="window.close()">Close</button>');
                for (const markedFile of ocr_marked_image_list) {
                    const url = imageWindow.URL.createObjectURL(markedFile);
                    imageWindow.document.write('<div class="img-wrap"><img src="' + url + '" alt="' + (markedFile.name || 'marked_image.png') + '"></div>');
                }
                imageWindow.document.write('</body></html>');
                imageWindow.document.close();
            } else {
                alert('Popup blocked! Please allow popups for this site to view marked images.');
            }


            //debug testing
            // const modified_json = JSON.stringify(await testingJsonProcessing(final_data), null, 2);
            // const json_blob = new Blob([modified_json], { type: 'application/json' });
            // const json_url = URL.createObjectURL(json_blob);
            // const json_a = document.createElement('a');
            // json_a.href = json_url;
            // json_a.download = 'mod_json_output.json';
            // document.body.appendChild(json_a);
            // json_a.click();
            // document.body.removeChild(json_a);
            // URL.revokeObjectURL(json_url);



            // Download CSV output
            // const csv = await processJsonToCSV(final_data); // Pass the object, not the string
            // const csv_blob = new Blob([csv], { type: 'application/csv' });
            // const csv_url = URL.createObjectURL(csv_blob);
            // const csv_a = document.createElement('a');
            // csv_a.href = csv_url;
            // csv_a.download = 'output.csv';
            // document.body.appendChild(csv_a);
            // csv_a.click();
            // document.body.removeChild(csv_a);
            // URL.revokeObjectURL(csv_url);
        } catch (err) {
            console.error('Error during processing:', err);
        }
    });
});
