const viewport = document.getElementById('viewport');
const zoomContainer = document.getElementById('zoomContainer');

let scale = 1;
let lastX = 0;
let lastY = 0;

let isDragging = false;
let startX = 0;
let startY = 0;

// Zoom toward mouse
viewport.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - lastX;
    const mouseY = e.clientY - rect.top - lastY;

    const delta = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.5, scale + delta), 5);

    lastX -= mouseX * (newScale / scale - 1);
    lastY -= mouseY * (newScale / scale - 1);

    scale = newScale;
    updateTransform();
  }
});

// Drag to pan
viewport.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  viewport.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  startX = e.clientX;
  startY = e.clientY;

  lastX += dx;
  lastY += dy;
  updateTransform();
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  viewport.style.cursor = 'grab';
});

function updateTransform() {
  zoomContainer.style.transform = `translate(${lastX}px, ${lastY}px) scale(${scale})`;
}
