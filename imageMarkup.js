// Draws lines between key centers and value centers for each image, returns array of marked-up image Files
export async function markupImages(original_images, markup_data) {
    // Helper to load image from File/Blob
    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    console.log(markup_data)

    const markedImages = [];
    for (const original_file of original_images) {
        const image_name = original_file.name;
        const img = await loadImage(original_file);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        if (markup_data[image_name]) {
            const keys = markup_data[image_name].keys;
            for (const key_object of keys) {
                const key_center = key_object.center_value;
                if (key_center && typeof key_center.centerx === 'number' && typeof key_center.centery === 'number') {
                    ctx.beginPath();
                    ctx.arc(key_center.centerx, key_center.centery, 10, 0, 2 * Math.PI);
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
            }
            const values = markup_data[image_name].values;
            for (const value_object of values) {
                const value_center = value_object.center_value;
                if (value_center && typeof value_center.centerx === 'number' && typeof value_center.centery === 'number') {
                    ctx.beginPath();
                    ctx.arc(value_center.centerx, value_center.centery, 10, 0, 2 * Math.PI);
                    ctx.strokeStyle = 'blue';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
            }

            // Draw green lines between each key and its 2 closest values
            for (const key_object of keys) {
                const key_center = key_object.center_value;
                if (!key_center || typeof key_center.centerx !== 'number' || typeof key_center.centery !== 'number') continue;
                // Compute distances to all values
                const distances = [];
                for (const value_object of values) {
                    const value_center = value_object.center_value;
                    if (!value_center || typeof value_center.centerx !== 'number' || typeof value_center.centery !== 'number') continue;
                    const dx = key_center.centerx - value_center.centerx;
                    const dy = key_center.centery - value_center.centery;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    distances.push({ value_center, dist });
                }
                // Sort by distance and take 2 closest
                distances.sort((a, b) => a.dist - b.dist);
                const closest = distances.slice(0, 2);
                for (const { value_center } of closest) {
                    ctx.beginPath();
                    ctx.moveTo(key_center.centerx, key_center.centery);
                    ctx.lineTo(value_center.centerx, value_center.centery);
                    ctx.strokeStyle = 'green';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
            
        } else {
            console.warn('No markup data for image:', image_name);
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

// Process
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

    console.log(OCR_word_list)

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
        console.log(cur_page_words)
        for (const cur_page_word of cur_page_words) {
            const word_bbox = cur_page_word.word_bbox;
            if (word_bbox && typeof word_bbox.x0 === 'number' && typeof word_bbox.y0 === 'number' && typeof word_bbox.x1 === 'number' && typeof word_bbox.y1 === 'number') {
                ctx.beginPath();
                ctx.rect(word_bbox.x0, word_bbox.y0, word_bbox.x1 - word_bbox.x0, word_bbox.y1 - word_bbox.y0);

                if (cur_page_word.potential_keys_for.size > 0) {
                    ctx.strokeStyle = 'blue';
                } else if (cur_page_word.number_score > 0.9) {
                    ctx.strokeStyle = 'red';
                } else {
                    ctx.strokeStyle = 'green';
                }

                ctx.lineWidth = 3;
                ctx.stroke();

                // Draw the word text at the center
                const word_center = cur_page_word.center_value;
                ctx.save();
                ctx.font = '16px Arial';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(cur_page_word.word_text, word_center.centerx, word_center.centery);
                ctx.restore();
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