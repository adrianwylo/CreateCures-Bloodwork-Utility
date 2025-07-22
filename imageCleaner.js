import * as pdfjsLib from './node_modules/pdfjs-dist/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = './node_modules/pdfjs-dist/build/pdf.worker.mjs';


export async function cleanImage(file) {
    // Placeholder for image cleaning logic
    // This function should handle the image processing and return a cleaned image
    return file; // For now, just return the original file
}

//filter function for incoming uploaded files
export async function filterImageFiles(files) {
    
    // Separate image and PDF files
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');

    // Convert PDF files to PNG data URLs
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
                const imageDataUrl = canvas.toDataURL('image/png');
                convertedPdfFiles.push(imageDataUrl);
            }
        } catch (err) {
            console.error(`Error loading ${pdffile.name}:`, err);
        }
    }

    // Combine all image sources
    const allImages = [...imageFiles, ...convertedPdfFiles];
    if (!Array.isArray(allImages) || allImages.length === 0) {
        throw new Error('No valid images found after filtering.');
    }

    // Convert PNG data URLs to HTMLImageElement, clean all images, and filter out failures
    const processedImages = await Promise.all(
        allImages.map(async image => {
            if (typeof image === 'string' && image.startsWith('data:image/')) {
                // Convert data URL to Image object
                return await new Promise(resolve => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = () => resolve(undefined);
                    img.src = image;
                });
            }
            // Clean image (async)
            return await cleanImage(image);
        })
    );

    // Remove any undefined images
    return processedImages.filter(img => img !== undefined);
}