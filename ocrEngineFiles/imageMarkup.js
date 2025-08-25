/**
 * Returns a marked up array of images that display the contents of ocrResults
 * Classifies values by color benchmarks: green = unimportant, blue = key, red = number
 *
 * @param {File[]} originalImages - Array of image files that were processed
 * @param {Object[]} ocrResults - list of mutated word objects to be interpreted
 * @returns {File[]} - Array of marked up image files
 */
export async function markupOcrResults(originalImages, ocrResults) {
    // Helper to load image from File/Blob
    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    const markedImages = [];
    for (const original_file of originalImages) {
        const image_name = original_file.name;
        const img = await loadImage(original_file);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const cur_page_words = ocrResults.filter(word_object => image_name === word_object.imageName);
        for (const cur_page_word of cur_page_words) {
            ctx.beginPath();
            ctx.rect(cur_page_word.word_x, cur_page_word.word_y, cur_page_word.width, cur_page_word.height);

            if (cur_page_word.potentialCsvFields.size > 0) {
                ctx.strokeStyle = 'blue';
            } else if (cur_page_word.numberScore > 0) {
                ctx.strokeStyle = 'red';
            } else {
                ctx.strokeStyle = 'green';
            }

            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw the word text at the center
            ctx.save();
            ctx.font = '16px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cur_page_word.wordText, cur_page_word.word_x, cur_page_word.word_y);
            ctx.restore();
        } 
        
        // Convert canvas to Blob (PNG)
        const markedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        // Optionally, you can create a File with the same name
        const markedFile = new File([markedBlob], image_name, { type: 'image/png' });
        markedImages.push(markedFile);
        // Clean up
        URL.revokeObjectURL(img.src);
    }
    return markedImages;
}

/**
 * Opens a new browser window and displays a list of image files
 * Provides a simple UI with each image centered and a close button
 *
 * @param {File[]} image_list - Array of image files to display
 * @returns {void} - Opens a new window; does not return a value
 */
export async function displayImages(image_list) {
    console.log('ran the display')
    // Open a new window and display all marked images there
    const imageWindow = window.open('', '_blank', 'width=1200,height=900,scrollbars=yes,resizable=yes');
    if (imageWindow) {
        imageWindow.document.write('<!DOCTYPE html><html><head><title>Marked Images</title>');
        imageWindow.document.write('<style>body{background:#222;color:#fff;font-family:sans-serif;margin:0;padding:2em;} .img-wrap{margin:2em 0;text-align:center;} img{max-width:95vw;max-height:80vh;box-shadow:0 0 10px #000;} button{position:fixed;top:1em;right:1em;z-index:1000;padding:0.5em 1em;font-size:1.2em;}</style>');
        imageWindow.document.write('</head><body>');
        imageWindow.document.write('<button onclick="window.close()">Close</button>');
        for (const markedFile of image_list) {
            const url = imageWindow.URL.createObjectURL(markedFile);
            imageWindow.document.write('<div class="img-wrap"><img src="' + url + '" alt="' + (markedFile.name || 'marked_image.png') + '"></div>');
        }
        imageWindow.document.write('</body></html>');
        imageWindow.document.close();
    } else {
        alert('Popup blocked! Please allow popups for this site to view marked images.');
    }
}

/**
 * Generates marked-up images based on OCR results and CSV field assignments.
 * Draws visual connections between key and value word objects on the same page.
 * 
 * Color conventions for visual debugging (can be adjusted in future):
 *   - Green: key → value links
 *   - Blue: key words (from OCR) [handled in markupOcrResults]
 *   - Red: numeric values (from OCR) [handled in markupOcrResults]
 * 
 * @param {File[]} originalImages - Array of original image files that were processed.
 * @param {Object[]} csvFieldAssignments - Array of CSV field assignments containing:
 *      - keyUniqueKey: string, uniqueKey of the key word object
 *      - valueUniqueKey: string, uniqueKey of the value word object
 * @param {Object[]} ocrResults - Array of OCR word objects with metadata, including:
 *      - uniqueKey: string, unique identifier
 *      - word_x: number, X coordinate
 *      - word_y: number, Y coordinate
 *      - imageName: string, name of the image the word is on
 *      - matchWeights, currentMatch, etc. (optional metadata for debugging/processing)
 * @returns {Promise<File[]>} - A promise that resolves to an array of marked-up image files 
 *                               (PNG format) with visual links drawn between matched key/value pairs.
 */
export async function markupProcessedOcrResults(originalImages, csvFieldAssignments, ocrResults) {
    // Helper to load image from File/Blob
    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }
    

    const markedImages = [];
    for (const original_file of originalImages) {
        const image_name = original_file.name;
        const img = await loadImage(original_file);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        //same logic as markup OCR
        console.log(ocrResults)
        const cur_page_words = ocrResults.filter(word_object => image_name === word_object.imageName);
        for (const cur_page_word of cur_page_words) {
            ctx.beginPath();
            ctx.rect(cur_page_word.word_x, cur_page_word.word_y, cur_page_word.width, cur_page_word.height);

            if (cur_page_word.potentialCsvFields.size > 0) {
                ctx.strokeStyle = 'blue';
            } else if (cur_page_word.numberScore > 0) {
                ctx.strokeStyle = 'red';
            } else {
                ctx.strokeStyle = 'green';
            }

            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw the word text at the center
            ctx.save();
            ctx.font = '16px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cur_page_word.wordText, cur_page_word.word_x, cur_page_word.word_y);
            ctx.restore();
        } 


        const csvFieldAssignmentsOnPage = csvFieldAssignments.filter(csvFieldAssignmentInfo => {
            const keyWordObj = ocrResults.find(obj => obj.uniqueKey === csvFieldAssignmentInfo.keyUniqueKey);
            if (!keyWordObj) return false; // skip if not found
            return keyWordObj.imageName === image_name;
        });

        for (const csvFieldAssignment of csvFieldAssignmentsOnPage) {
            const keyWordObj = ocrResults.find(obj => obj.uniqueKey === csvFieldAssignment.keyUniqueKey);
            const valueWordObj = ocrResults.find(obj => obj.uniqueKey === csvFieldAssignment.valueUniqueKey);
            ctx.beginPath();
            ctx.moveTo(keyWordObj.word_x, keyWordObj.word_y);
            ctx.lineTo(valueWordObj.word_x, valueWordObj.word_y);
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Convert canvas to Blob (PNG)
        const markedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        // Optionally, you can create a File with the same name
        const markedFile = new File([markedBlob], image_name, { type: 'image/png' });
        markedImages.push(markedFile);
        // Clean up
        URL.revokeObjectURL(img.src);
    }
    return markedImages;
}


