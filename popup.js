import { startEngine } from './ocrEngineWrapper.js';

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
        await startEngine()
    });
});


