// Computes per-photo display positions from focal-points.json and patches:
//   - people.html        : --image-position on each .person-photo-v2 card (square 1/1 container)
//   - people/*.html      : inline object-position on each profile photo <img> (5/7 portrait container)
// Run from repo root: node tools/face-crop/apply-positions.js
//
// Position math (CSS background-position / object-position percentages):
//   p = (focal - target * visible) / (image - visible) * 100, clamped to [0, 100]
// where `visible` is the size of the cover-cropped window. If an axis is cropped by
// less than 2% the position is meaningless, so it falls back to 50%.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const focal = JSON.parse(fs.readFileSync(path.join(__dirname, 'focal-points.json'), 'utf8'));
const dims = JSON.parse(fs.readFileSync(path.join(__dirname, 'faces.json'), 'utf8'));

// Container aspect ratios (width / height)
const CARD_R = 1 / 1;      // .person-photo-v2
const PROFILE_R = 5 / 7;   // .person-profile-photo-full

function clampPct(v) {
  if (!isFinite(v)) return 50;
  return Math.max(0, Math.min(100, Math.round(v)));
}

// Returns "X% Y%" for the given container aspect and focal point (fractions 0..1)
function positionFor(file, containerR) {
  const d = dims[file];
  if (!d) throw new Error('No dimensions for ' + file + ' (run detect-faces.js first)');
  const W = d.w, H = d.h;
  const f = focal[file];
  if (!f) throw new Error('No focal point for ' + file);
  const fx = f.x / 100, fy = f.y / 100;

  const visibleW = Math.min(W, H * containerR);
  const visibleH = Math.min(H, W / containerR);

  let px = 50, py = 50;
  if (W - visibleW > 0.02 * W) {
    px = clampPct((fx * W - 0.5 * visibleW) / (W - visibleW) * 100);
  }
  if (H - visibleH > 0.02 * H) {
    // aim the focal point slightly above center (40%) for headroom
    py = clampPct((fy * H - 0.40 * visibleH) / (H - visibleH) * 100);
  }
  return `${px}% ${py}%`;
}

// --- Patch people.html cards -------------------------------------------------
const peopleHtmlPath = path.join(ROOT, 'people.html');
let html = fs.readFileSync(peopleHtmlPath, 'utf8');
const cardRe = /--image: url\('Fig\/people\/([^']+)'\); --image-position: [^;]+;/g;
html = html.replace(cardRe, (m, file) => {
  if (!focal[file]) return m;
  return `--image: url('Fig/people/${file}'); --image-position: ${positionFor(file, CARD_R)};`;
});
fs.writeFileSync(peopleHtmlPath, html, 'utf8');

// --- Patch profile pages ------------------------------------------------------
const peopleDir = path.join(ROOT, 'people');
let patched = 0, missing = [];
for (const page of fs.readdirSync(peopleDir).filter(f => f.endsWith('.html') && f !== 'pending-profile.html')) {
  const p = path.join(peopleDir, page);
  let content = fs.readFileSync(p, 'utf8');
  const imgRe = new RegExp(`<img src="\\.\\./Fig/people/([^"]+)" alt="([^"]*)"( style="object-position: [^"]*")? ?/>`, 'g');
  let hit = false;
  content = content.replace(imgRe, (m, file, alt, existingStyle) => {
    if (!focal[file]) { missing.push(`${page} -> ${file}`); return m; }
    hit = true;
    return `<img src="../Fig/people/${file}" alt="${alt}" style="object-position: ${positionFor(file, PROFILE_R)};" />`;
  });
  if (hit) { fs.writeFileSync(p, content, 'utf8'); patched++; }
}

// --- Report -------------------------------------------------------------------
console.log('people.html cards updated.');
console.log(`profile pages patched: ${patched}`);
if (missing.length) console.log('skipped (no focal point):', missing.join(', '));
console.log('\nPer-file positions (card / profile):');
for (const file of Object.keys(focal)) {
  if (!dims[file]) continue;
  console.log(`  ${file}  ${positionFor(file, CARD_R)}  /  ${positionFor(file, PROFILE_R)}`);
}
