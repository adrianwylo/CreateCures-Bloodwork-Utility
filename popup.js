import {processDocumentCollection, processExtractedResults} from './imageProcessor.js'
import {filterImageFiles} from './imageCleaner.js'
import {processToCsv} from './formatCsvRow.js'
import {markupProcessedOcrResults} from './imageMarkup.js'

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
        //fuse parameters
        const fuseSearchThreshold = parseFloat(document.getElementById('slider-fuse-search-threshold').value);
        const fuseMatchThreshold = parseFloat(document.getElementById('slider-fuse-match-threshold').value);
        const downloadOcrResults = document.getElementById('downloadOCRJson').checked
        const displayOcrResults = document.getElementById('displayOCRJson').checked
        const displayProcessedResults = document.getElementById('displayProcessedOCR').checked
        const downloadCsv = document.getElementById('downloadCsv').checked
        
        try {
            //filtering image files
            const files = document.getElementById('bloodwork-files').files;
            const allImages = await filterImageFiles(files);
            
            //perform Ocr and document info extraction
            const extractedResults = processDocumentCollection(
                allImages,
                fuseSearchThreshold,
                fuseMatchThreshold,
                downloadOcrResults,
                displayOcrResults
            );

            //process extracted results
            const processedResults = processExtractedResults(extractedResults, displayProcessedResults)
            if (displayProcessedResults) {
                const markedImages = await markupProcessedOcrResults(allImages, processedResults.csvFieldAssignments, extractedResults)
                displayImages(markedImages)
            }
            
                        
        } catch (err) {
            console.error('Error during processing:', err);
        }
    });
});


