import * as pdfjsLib from './node_modules/pdfjs-dist/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = './node_modules/pdfjs-dist/build/pdf.worker.mjs';


export async function cleanImage(file) {
    // Placeholder for image cleaning logic
    // This function should handle the image processing and return a cleaned image
    return file; // For now, just return the original file
}

//filter function for incoming uploaded files
export async function filterImageFiles(files) {
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
    const arrImages =  [
        ...imageFiles,
        ...convertedPdfFiles
    ]

    //clean each image
    return arrImages.map(image => (cleanImage(image)))
}