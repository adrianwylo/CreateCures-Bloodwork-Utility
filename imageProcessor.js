import {createScheduler, addWorker, createWorker, PSM} from 'tesseract.js';

export async function processTestImages(files) {    

    if (!files || !files.length) {
        throw new Error('No images provided to processTestImages.');
    }

    // Create a scheduler and workers
    const workerN = 7;
    const scheduler = createScheduler();

    const workerGen = async () => {
        const worker = await createWorker("eng", 1, { 
            logger: m => console.log(m), cachePath: ".",
            workerPath: chrome.runtime.getURL('node_modules/tesseract.js/dist/worker.min.js'),
            corePath: chrome.runtime.getURL('node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js'),
            workerBlobURL: false,
        });
        await worker.setParameters({
            tessedit_pageseg_mode: PSM.SPARSE_TEXT_OSD
        });
        scheduler.addWorker(worker);
    };

    await Promise.all(Array(workerN).fill(0).map(async () => await workerGen())); 
    
    console.log('Processing images and performing OCR:');
    const jobPromises = files.map(async (file) => {
        console.log(`Scheduling image processing for: ${file.name}`);
        return scheduler.addJob('recognize', file, {}, {
            text: true,
            blocks: true,
            hocr: false,
            tsv: false,
        })
        .then(out => {
            console.log(out) //for debugging
            const wordsArray = [];
            if (out.data?.blocks) {
                console.log("blocks have been ensured")
                out.data.blocks.forEach((block, blockIdx) => {
                    block.paragraphs.forEach((para, paraIdx) => {
                        const paragraphKey = `block_${blockIdx};paragraph_${paraIdx}`;

                        para.lines.forEach((line, lineIdx) => {
                            const lineKey = `${paragraphKey};line_${lineIdx}`;

                            line.words.forEach(word => {
                                wordsArray.push({
                                    word_text: word.text,
                                    word_confidence: word.confidence,
                                    word_choices: word.choices,
                                    word_bbox: word.bbox,
                                    unique_paragraph_key: paragraphKey,
                                    unique_line_key: lineKey
                                });
                            });
                        });
                    });
                });
            }
            return {
                imageName: file.webkitRelativePath || file.name,
                rotateRadians: out.data.rotateRadians,
                words: wordsArray
            };
        })
        .catch(error => ({
            imageName: file.webkitRelativePath || file.name,
            error: error.message,
        }));
    });

    const results = await Promise.all(jobPromises);
    // Terminate workers and save results
    await scheduler.terminate();

    console.log('OCR processing completed.');
    return results;

}