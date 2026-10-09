// Run: node tools/verify-facilities-principles.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({window: {}});
const run = file => vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename: file});
run('equipment-data-v2.js');
const devices = context.window.equipmentLibraryData.equipment;
const missingBefore = devices.filter(d => !d.principleImage).length;
const before = JSON.parse(JSON.stringify(devices));
const source = JSON.parse(fs.readFileSync(path.join(__dirname, 'facilities-principle-content.json'), 'utf8'));
assert.deepEqual(Object.keys(source.devices).sort(), Array.from(devices, d => d.id).sort());
run('equipment-principles.js');
const hashes = new Set();
const paths = new Set();
const auditedKeys = new Set(['principle', 'principleZh', 'principleImage', 'principleImageZh', 'principleImageAlt', 'principleImageAltZh', 'principleSource']);
devices.forEach((device, i) => {
  assert.equal(device.principle, source.devices[device.id][2], device.id);
  assert.equal(device.principleZh, source.devices[device.id][3], device.id);
  assert.ok(device.principleSource.url.startsWith('https://'));
  for (const field of ['principleImage', 'principleImageZh']) {
    const imagePath = device[field];
    assert.ok(!paths.has(imagePath), `Repeated image path: ${imagePath}`);
    paths.add(imagePath);
    const bytes = fs.readFileSync(path.join(root, imagePath));
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    assert.ok(!hashes.has(hash), `Identical image content: ${imagePath}`);
    hashes.add(hash);
    assert.ok(bytes.toString('utf8').includes('<svg'));
  }
  // Preserve photos, status, capabilities and all other equipment metadata.
  for (const key of Object.keys(before[i])) {
    if (!auditedKeys.has(key)) assert.equal(JSON.stringify(device[key]), JSON.stringify(before[i][key]), `${device.id}: changed ${key}`);
  }
});
const page = fs.readFileSync(path.join(root, 'facilities.html'), 'utf8');
assert.ok(page.indexOf('equipment-data-v2.js') < page.indexOf('equipment-principles.js'));
assert.ok(page.indexOf('equipment-principles.js') < page.indexOf('facilities.js'));
console.log(`${devices.length} devices audited; ${missingBefore} missing figures filled; ${paths.size} unique bilingual SVG assets; unrelated metadata preserved.`);
