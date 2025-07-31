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

// Process that creates a list of marked up images that display the found OCR results in their processed key value map form
export async function markupOCR(original_images, OCR_word_list) {
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
        
        const cur_page_words = OCR_word_list.filter(word_object => image_name === word_object.imageName);
        // console.log(cur_page_words)
        for (const cur_page_word of cur_page_words) {
            ctx.beginPath();
            ctx.rect(cur_page_word.word_x, cur_page_word.word_y, cur_page_word.width, cur_page_word.height);

            if (cur_page_word.potential_matches.size > 0) {
                ctx.strokeStyle = 'blue';
            } else if (cur_page_word.numberScore > 0.9) {
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