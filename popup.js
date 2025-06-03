import {processImages, processTestImages} from '.logic/imageProcessor.js'

document.getElementById('process-btn').addEventListener('click', async () => {
    const files = document.getElementById('bloodwork-files').files;
    //Filter files
    // Deal w/ image files (e.g., PNG, JPEG, etc.)
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
    );

    // Handle PDF files (Convert to images)
    const pdfFiles = Array.from(files).filter(file => 
        file.type === 'application/pdf'
    );

    //Convert Pdf files to Images

    //Flatten files into an array
    const allImages = [
        ...imageFiles,
        ...pdfFiles
    ]
    console.log('Files ready for processing', allImages);

    //run logic of external script
    const final_csv = await processImages(allImages)

    //create download reference and download csv
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url
    a.download = 'output.csv';
    a.click();
    
    URL.revokeObjectURL(url);
});

document.getElementById('process-btn-test').addEventListener('click', async () => {
    const final_data = await processTestImages()
    // Convert your JavaScript object or array to a JSON string
    const json = JSON.stringify(final_data, null, 2); // Pretty print with 2-space indentation

    // Create a Blob from the JSON string
    const blob = new Blob([json], { type: 'application/json' });

    // Create a temporary download URL
    const url = URL.createObjectURL(blob);

    // Create an anchor element to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.json';
    a.click();

    // Clean up the URL object to free memory
    URL.revokeObjectURL(url);
});
