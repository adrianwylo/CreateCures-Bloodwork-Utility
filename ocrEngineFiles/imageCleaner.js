import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = './node_modules/pdfjs-dist/build/pdf.worker.mjs';


export async function cleanImage(file) {
    // Placeholder for image cleaning logic
    // This function should handle the image processing and return a cleaned image
    return file; // For now, just return the original file
}
/**
 * Filters and processes uploaded files to return only valid image files
 * Converts PDF pages to images and optionally cleans each image
 *
 * @param {File[]} files - Array of uploaded File objects (images and/or PDFs)
 * @returns {Promise<File[]>} - Promise resolving to an array of processed image File objects
 * @throws {Error} - Throws if no valid images remain after filtering and processing
 */
export async function filterImageFiles(files) {
    
    // Separate image and PDF files
    const imageFiles = Array.from(files)
        .filter(file => file.type.startsWith('image/'));
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');

    // Convert PDF files to File objects
    function canvasToFile(canvas, name) {
        return new Promise(resolve => {
            canvas.toBlob(blob => {
                resolve(new File([blob], name, { type: 'image/png' }));
            }, 'image/png');
        });
    }

    const convertedPdfFiles = [];
    for (const pdffile of pdfFiles) {
        try {
            const arrayBuffer = await pdffile.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            console.log(`PDF loaded: ${pdffile.name}`);
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: context, viewport }).promise;
                const uniqueName = `${pdffile.name}_page${pageNum}.png`;
                const file = await canvasToFile(canvas, uniqueName);
                convertedPdfFiles.push(file);
            }
        } catch (err) {
            console.error(`Error loading ${pdffile.name}:`, err);
        }
    }

    // Combine all image sources as File objects
    const allImages = [...imageFiles, ...convertedPdfFiles];
    if (!Array.isArray(allImages) || allImages.length === 0) {
        throw new Error('No valid images found after filtering.');
    }

    // Clean all images and filter out failures
    const processedImages = await Promise.all(
        allImages.map(async image => {
            // Clean image (async)
            return await cleanImage(image);
        })
    );

    // Remove any undefined images
    return processedImages.filter(img => img !== undefined);
}