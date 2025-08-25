import {processDocumentCollection, processExtractedResults} from './ocrEngineFiles/imageProcessor.js'
import {filterImageFiles} from './ocrEngineFiles/imageCleaner.js'
import {markupProcessedOcrResults, displayImages} from './ocrEngineFiles/imageMarkup.js'

export async function startEngine() {
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
        const extractedResults = await processDocumentCollection(
            allImages,
            fuseSearchThreshold,
            fuseMatchThreshold,
            downloadOcrResults,
            displayOcrResults
        );

        //process extracted results
        const processedResults = await processExtractedResults(extractedResults, displayProcessedResults)
        if (displayProcessedResults) {
            const markedImages = await markupProcessedOcrResults(allImages, processedResults.csvFieldAssignments, extractedResults.finalOcrResults)
            displayImages(markedImages)
        }
        //move to ui
        chrome.tabs.create({ url: chrome.runtime.getURL("./ocrUiFiles/ui.html") });
                    
    } catch (err) {
        console.error('Error during processing:', err);
    }

}