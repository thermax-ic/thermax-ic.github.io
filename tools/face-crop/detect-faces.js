// Face detection for Fig/people photos using jsfeat's BBF detector (pure JS, no native deps).
// Usage: node tools/face-crop/detect-faces.js
// Writes tools/face-crop/faces.json: { "<filename>": { w, h, faces: [{x,y,w,h,conf}] } }
// Coordinates are in percent of image dimensions so results survive rescaling.

const fs = require('fs');
const path = require('path');

global.jsfeat = require('./vendor/jsfeat.js'); // commonjs export; expose globally for the cascade file
require('./vendor/bbf_face.js'); // attaches face_cascade to jsfeat.bbf
const jpeg = require('./vendor/jpeg-js.js'); // the decoder module exports decode() directly

const ROOT = path.resolve(__dirname, '..', '..');
const PHOTO_DIR = path.join(ROOT, 'Fig', 'people');
const OUT_FILE = path.join(__dirname, 'faces.json');

const jsfeat = global.jsfeat;
const cascade = jsfeat.bbf.face_cascade;
jsfeat.bbf.prepare_cascade(cascade);

// Downscale largest dimension to this for detection speed; percentages are scale-invariant.
const MAX_DIM = 1200;

function detect(file) {
  const buf = fs.readFileSync(path.join(PHOTO_DIR, file));
  const decoded = jpeg(buf, { maxMemoryUsageInMB: 1024, useTArray: true });
  const { width: W, height: H, data } = decoded;

  const scale = Math.min(1, MAX_DIM / Math.max(W, H));
  const w = Math.max(1, Math.round(W * scale));
  const h = Math.max(1, Math.round(H * scale));

  // RGBA -> grayscale, nearest-neighbor downscale
  const gray = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const sy = Math.min(H - 1, Math.floor(y / scale));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(W - 1, Math.floor(x / scale));
      const si = (sy * W + sx) * 4;
      gray[y * w + x] = (data[si] * 299 + data[si + 1] * 587 + data[si + 2] * 114) / 1000;
    }
  }

  const img = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
  img.data = gray;

  const pyr = jsfeat.bbf.build_pyramid(img, 24, 24, 4);

  const rects = jsfeat.bbf.detect(pyr, cascade);
  const faces = jsfeat.bbf.group_rectangles(rects, 1).map(r => ({
    x: +((r.x + r.width / 2) / w * 100).toFixed(2),   // center x %
    y: +((r.y + r.height / 2) / h * 100).toFixed(2),   // center y %
    w: +(r.width / w * 100).toFixed(2),
    h: +(r.height / h * 100).toFixed(2),
    conf: r.confidence,
  }));
  faces.sort((a, b) => b.w * b.h - a.w * a.h); // largest first
  return { w: W, h: H, faces };
}

const files = fs.readdirSync(PHOTO_DIR).filter(f => /\.(jpe?g|png)$/i.test(f));
const out = {};
for (const f of files) {
  try {
    out[f] = detect(f);
    const best = out[f].faces[0];
    console.log(`${f}  ${out[f].w}x${out[f].h}  faces=${out[f].faces.length}` +
      (best ? `  best: (${best.x}%, ${best.y}%) size ${best.w}x${best.h}% conf=${best.conf}` : '  *** NO FACE ***'));
  } catch (e) {
    console.log(`${f}  ERROR: ${e.message}`);
  }
}
fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
console.log(`\nWrote ${OUT_FILE}`);
