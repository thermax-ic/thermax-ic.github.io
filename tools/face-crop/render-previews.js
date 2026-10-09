// Renders preview montages simulating the exact CSS crop (background-size: cover +
// computed position) for every Fig/people photo, so the results can be verified visually.
//   preview-cards.jpg    - square 1/1 containers as shown on people.html
//   preview-profiles.jpg - 5/7 portrait containers as shown on profile pages
// Run from repo root: node tools/face-crop/render-previews.js

const fs = require('fs');
const path = require('path');
const jpeg = require('./vendor/jpeg-js.js');
const encodeJpeg = require('./vendor/jpeg-encoder.js');

const ROOT = path.resolve(__dirname, '..', '..');
const PHOTO_DIR = path.join(ROOT, 'Fig', 'people');
const focal = JSON.parse(fs.readFileSync(path.join(__dirname, 'focal-points.json'), 'utf8'));

function clampPct(v) { return !isFinite(v) ? 50 : Math.max(0, Math.min(100, Math.round(v))); }

function positionFor(W, H, file, r) {
  const f = focal[file];
  const fx = f.x / 100, fy = f.y / 100;
  const visibleW = Math.min(W, H * r);
  const visibleH = Math.min(H, W / r);
  let px = 50, py = 50;
  if (W - visibleW > 0.02 * W) px = clampPct((fx * W - 0.5 * visibleW) / (W - visibleW) * 100);
  if (H - visibleH > 0.02 * H) py = clampPct((fy * H - 0.40 * visibleH) / (H - visibleH) * 100);
  return [px, py, Math.round(visibleW), Math.round(visibleH)];
}

// nearest-neighbour crop + resize
function cropResize(data, W, H, left, top, cw, ch, outW, outH) {
  const out = Buffer.alloc(outW * outH * 4);
  for (let y = 0; y < outH; y++) {
    const sy = Math.min(H - 1, top + Math.floor(y * ch / outH));
    for (let x = 0; x < outW; x++) {
      const sx = Math.min(W - 1, left + Math.floor(x * cw / outW));
      const si = (sy * W + sx) * 4, di = (y * outW + x) * 4;
      out[di] = data[si]; out[di + 1] = data[si + 1]; out[di + 2] = data[si + 2]; out[di + 3] = 255;
    }
  }
  return out;
}

function montage(files, r, cellW, cellH, cols, outFile) {
  const rows = Math.ceil(files.length / cols);
  const canvas = Buffer.alloc(cols * cellW * rows * cellH * 4);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const decoded = jpeg(fs.readFileSync(path.join(PHOTO_DIR, file)), { maxMemoryUsageInMB: 2048, useTArray: true });
    const [px, py, vw, vh] = positionFor(decoded.width, decoded.height, file, r);
    const left = Math.round(px / 100 * (decoded.width - vw));
    const top = Math.round(py / 100 * (decoded.height - vh));
    const cell = cropResize(decoded.data, decoded.width, decoded.height, left, top, vw, vh, cellW, cellH);
    const cx = (i % cols) * cellW, cy = Math.floor(i / cols) * cellH;
    for (let y = 0; y < cellH; y++) {
      cell.copy(canvas, ((cy + y) * cols * cellW + cx) * 4, y * cellW * 4, (y + 1) * cellW * 4);
    }
  }
  fs.writeFileSync(path.join(__dirname, outFile), encodeJpeg({
    data: canvas, width: cols * cellW, height: rows * cellH,
  }, 85).data);
  console.log('wrote', outFile);
}

const files = Object.keys(focal).filter(f => !f.startsWith('_'));
montage(files, 1 / 1, 200, 200, 6, 'preview-cards.jpg');
montage(files, 5 / 7, 160, 224, 6, 'preview-profiles.jpg');
console.log('order:', files.join(', '));
