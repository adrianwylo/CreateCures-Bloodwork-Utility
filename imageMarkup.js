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

            if (cur_page_word.potential_matches.size > 0) {
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
            ctx.fillText(cur_page_word.word_text, cur_page_word.word_x, cur_page_word.word_y);
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
//Ignore below --------------------------------------------------------------------------------



// Draws lines between key centers and value centers for each image, returns array of marked-up image Files
export async function markupStructure(original_images, imageKeyValList) {
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
    for (const original_file of original_images) {
        const image_name = original_file.name;
        const img = await loadImage(original_file);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        if (!imageKeyValList[image_name]) {
            console.warn('No markup data for image:', image_name);
        }

        const page_info = imageKeyValList[image_name] 

        //circles keys
        const keys = page_info.keys;
        for (const key_object of keys) {
            ctx.beginPath();
            ctx.arc(key_object.word_x, key_object.word_y, 10, 0, 2 * Math.PI);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        const values = page_info.values;
        for (const value_object of values) {
            ctx.beginPath();
            ctx.arc(value_object.word_x, value_object.word_y, 10, 0, 2 * Math.PI);
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw green lines between each key and its 2 closest values
        for (const key_object of keys) {
            const keyObjectUniqueKey = key_object.uniqueKey
            const keyValStruct = page_info.keyValStructPattern
            const keyFoundInStruct = keyObjectUniqueKey in keyValStruct

            const key_x = key_object.word_x
            const key_y = key_object.word_y

            // Compute distances to all values
            const structDistances = [];
            const regDistances = [];
            for (const value_object of values) {
                const valObjectUniqueKey = value_object.uniqueKey
                if (keyFoundInStruct) {
                    if (valObjectUniqueKey in keyValStruct[keyObjectUniqueKey]) {
                        const dx = keyValStruct[keyObjectUniqueKey][valObjectUniqueKey].dx
                        const dy = keyValStruct[keyObjectUniqueKey][valObjectUniqueKey].dy
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        structDistances.push({key_x, key_y, dx, dy, dist});
                        continue 
                    } 
                }

                
                const dx = value_object.word_x - key_object.word_x;
                const dy = value_object.word_y - key_object.word_y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                regDistances.push({key_x, key_y, dx, dy, dist});
            }
            // Sort by distance and take 2 closest
            regDistances.sort((a, b) => a.dist - b.dist);
            for (const distanceInfo of regDistances.slice(0, 3)) {

                ctx.beginPath();
                ctx.moveTo(distanceInfo.key_x, distanceInfo.key_y);
                ctx.lineTo(distanceInfo.key_x + distanceInfo.dx, distanceInfo.key_y + distanceInfo.dy);
                ctx.strokeStyle = 'yellow';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            for (const distanceInfo of structDistances) {

                ctx.beginPath();
                ctx.moveTo(distanceInfo.key_x, distanceInfo.key_y);
                ctx.lineTo(distanceInfo.key_x + dx, distanceInfo.key_y + dy);
                ctx.strokeStyle = 'green';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
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


//markup function for ocr results (will be chaotic)
export async function markupOCRStructure(original_images, imageDic) {
    console.log('running markupOCRStructure')
    console.log('with :')
    console.log(original_images)
    console.log(imageDic)
    console.log('as inputs')
    const red = { r: 255, g: 0, b: 0 };
    const blue = { r: 0, g: 0, b: 255 };
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
    for (const original_file of original_images) {
        const image_name = original_file.name;
        const img = await loadImage(original_file);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        if (!imageDic[image_name]) {
            console.warn('No markup data for image:', image_name);
        }

        const page_info = imageDic[image_name] 

        //circles keys
        const keys = page_info.words;
        for (const key_object of keys) {
            ctx.beginPath();
            ctx.arc(key_object.word_x, key_object.word_y, 10, 0, 2 * Math.PI);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        const values = page_info.numbers;
        for (const value_object of values) {
            ctx.beginPath();
            ctx.arc(value_object.word_x, value_object.word_y, 10, 0, 2 * Math.PI);
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        const minCount = 1
        const maxCount = page_info.patterns.reduce((currentMax, item) => {
            if (item.count > currentMax) {
                return item.count;
            } else {
                return currentMax;
            }
        }, -Infinity);


        for (const pattern of page_info.patterns) {
            const patternCount = pattern.count
            for (const [word, numberObj] of Object.entries(pattern.keyValueInfo)) {
                for (const [number, distanceInfo] of Object.entries(numberObj)) {
                    // const lerpColor = getStrokeColorForWidth(patternCount, minCount, maxCount, red, blue)
                    // const alphaVal = lerp(patternCount, minCount, maxCount, 1, 0)
                    
                    // console.log(`Color: ${lerpColor}, Alpha: ${alphaVal.toFixed(2)} (Count: ${patternCount})`);

                    ctx.strokeStyle = 'red'
                    ctx.globalAlpha = 0.1
                    ctx.moveTo(distanceInfo.key_x, distanceInfo.key_y);
                    ctx.lineTo(distanceInfo.key_x + distanceInfo.dx, distanceInfo.key_y + distanceInfo.dy);
                    ctx.lineWidth = 0;
                    ctx.stroke();
                }
            }

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