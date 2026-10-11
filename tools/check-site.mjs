import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import YAML from 'yaml';
import { JSDOM } from 'jsdom';
import { ROOT, buildSite, validateContent } from './build-site.mjs';

const outDir = path.join(ROOT, 'dist');
const contentDir = path.join(ROOT, 'content');
const read = name => fs.readFileSync(path.join(outDir, name), 'utf8');
const evaluate = filename => { const sandbox = { window: {} }; vm.runInNewContext(read(filename), sandbox); return JSON.parse(JSON.stringify(sandbox.window)); };
const records = validateContent(contentDir);
const visible = items => items.filter(item => item.published !== false);
const publications = evaluate('publication-data.js').publicationData;
const equipment = evaluate('equipment-data-v2.js').equipmentLibraryData.equipment;
assert.equal(publications.length, visible(records.publications).length, 'Published paper count');
assert.equal(equipment.length, visible(records.equipment).length, 'Published equipment count');
for (const paper of visible(records.publications)) assert(publications.some(item => item.citation === paper.citation && item.doi === paper.doi && item.pdf === paper.pdf), 'Citation/DOI/PDF preserved');
for (const device of visible(records.equipment)) assert(equipment.some(item => item.id === device.id && item.principle === device.principle && item.principleZh === device.principleZh), 'Equipment principle preserved');

const config = YAML.parse(fs.readFileSync(path.join(ROOT, '.pages.yml'), 'utf8'));
assert.equal(config.settings.content.merge, true, 'Preserve content outside the editor schema');
assert(config.content.every(item => item.fields?.length), 'Every content section must use forms');
const contentNames = new Set(config.content.map(item => item.name));
assert.equal(contentNames.size, config.content.length, 'Unique CMS section names');
for (const name of ['site','index','about','research','contact','people','publications','news','equipment','equipment-settings']) assert(contentNames.has(name), 'CMS section: ' + name);
assert(config.content.every(item => fs.existsSync(path.join(ROOT, item.path))), 'CMS paths exist');

const pageFiles = fs.readdirSync(outDir).filter(name => name.endsWith('.html'));
pageFiles.push(...fs.readdirSync(path.join(outDir, 'people')).filter(name => name.endsWith('.html') && name !== 'pending-profile.html').map(name => 'people/' + name));
const brokenLinks = [];
for (const filename of pageFiles) {
  const dom = new JSDOM(read(filename));
  const doc = dom.window.document;
  assert.equal(doc.querySelectorAll('main').length, 1, filename + ': one main');
  assert.equal(doc.querySelectorAll('.site-footer').length, 1, filename + ': one footer');
  assert.equal(doc.querySelectorAll('.language-toggle').length, 1, filename + ': one language button');
  assert(!read(filename).includes('data-cms-') && !read(filename).includes('<!-- CMS:'), filename + ': all content bindings resolved');
  for (const element of doc.querySelectorAll('[src],[href],[action]')) for (const attribute of ['src','href','action']) {
    const value = element.getAttribute(attribute);
    if (!value || value.startsWith('#') || /^[a-z]+:/i.test(value)) continue;
    const plain = decodeURIComponent(value.split(/[?#]/)[0]);
    const target = plain.startsWith('/') ? path.join(outDir, plain) : path.resolve(outDir, path.dirname(filename), plain);
    if (!fs.existsSync(target)) brokenLinks.push(filename + ': ' + value);
  }
  dom.window.close();
}
for (const item of publications) if (item.pdf && !/^https?:/.test(item.pdf)) {
  const target = path.join(outDir, decodeURIComponent(item.pdf).replace(/^\//, ''));
  if (!fs.existsSync(target)) brokenLinks.push('Publication PDF: ' + item.pdf);
}
for (const item of equipment) for (const key of ['image','principleImage','principleImageZh']) if (item[key] && !/^https?:/.test(item[key])) {
  if (!fs.existsSync(path.join(outDir, item[key].replace(/^\//, '')))) brokenLinks.push('Equipment image: ' + item[key]);
}
assert.deepEqual(brokenLinks, [], 'All site files, images and PDFs resolve');
const peopleDOM = new JSDOM(read('people.html'));
assert.equal(peopleDOM.window.document.querySelectorAll('.person-card-link').length, visible(records.people).length, 'People cards count');
assert.equal(peopleDOM.window.document.querySelectorAll('#alumni').length, 1, 'No duplicate alumni section');
peopleDOM.window.close();
for (const person of visible(records.people)) {
  const source = read('people/' + person.id + '.html');
  const dom = new JSDOM(source);
  assert.equal(dom.window.document.querySelector('.profile-name-primary')?.textContent || dom.window.document.querySelector('h1 .lang-only-en')?.textContent || dom.window.document.querySelector('h1')?.textContent, person.name, 'Profile name matches CMS');
  if (person.email) assert(source.includes('mailto:' + person.email), 'Profile contact matches CMS');
  for (const entry of person.education || []) assert(dom.window.document.body.textContent.includes(entry.en) && dom.window.document.body.textContent.includes(entry.zh), 'Bilingual education preserved');
  dom.window.close();
}

// Exercise actual content edits and additions in a separate, ignored workspace.
const tempBase = path.join(ROOT, 'output', 'cms-checks');
fs.mkdirSync(tempBase, { recursive: true });
const temp = fs.mkdtempSync(path.join(tempBase, 'scenario-'));
const editedContent = path.join(temp, 'content'), editedOut = path.join(temp, 'site');
fs.cpSync(contentDir, editedContent, { recursive: true });
const update = (filename, edit) => {
  const target = path.join(editedContent, filename);
  const item = JSON.parse(fs.readFileSync(target, 'utf8')); edit(item); fs.writeFileSync(target, JSON.stringify(item));
};
let editedKey;
update('pages/index.json', page => {
  for (const section of Object.values(page)) for (const [key, item] of Object.entries(section)) {
    if (item.en === 'Thermal Management and Advanced Integration for Future Integrated Circuits') {
      item.en = 'CMS verification: revised research vision'; item.zh = 'CMS校验：修订后的研究愿景'; editedKey = key;
    }
  }
});
assert(editedKey, 'Find actual editable home title');
const newPerson = { ...records.people[0], id: 'cms-verification-member', name: 'CMS Verification Member', nameZh: '校验成员', image: '', email: '', group: 'phd-students', order: 999, published: true };
delete newPerson._file;
fs.writeFileSync(path.join(editedContent, 'people', newPerson.id + '.json'), JSON.stringify(newPerson));
const hiddenNews = records.news[0];
update('news/' + hiddenNews._file, item => { item.published = false; });
update('publications/' + records.publications[0]._file, item => { item.citation = 'CMS verification publication citation'; });
update('equipment/' + records.equipment[0]._file, item => { item.principleZh = 'CMS校验：更新后的设备原理'; });
buildSite({ contentDir: editedContent, outDir: editedOut, copyAssets: false });
const editedHome = fs.readFileSync(path.join(editedOut, 'index.html'), 'utf8');
const home = new JSDOM(editedHome, { url: 'http://localhost/', runScripts: 'outside-only' });
home.window.eval(fs.readFileSync(path.join(ROOT, 'cms-language.js'), 'utf8'));
home.window.document.dispatchEvent(new home.window.Event('DOMContentLoaded'));
assert.equal(home.window.document.querySelector('h1').textContent.trim(), 'CMS verification: revised research vision', 'Edited English title renders');
home.window.document.querySelector('.language-toggle').click();
assert.equal(home.window.document.querySelector('h1').textContent.trim(), 'CMS校验：修订后的研究愿景', 'Edited Chinese title renders');
home.window.document.querySelector('.language-toggle').click();
assert.equal(home.window.document.querySelector('h1').textContent.trim(), 'CMS verification: revised research vision', 'Repeated language toggle restores English');
home.window.close();
assert(fs.existsSync(path.join(editedOut, 'people', newPerson.id + '.html')), 'New member profile generated');
assert(fs.readFileSync(path.join(editedOut, 'people.html'), 'utf8').includes('CMS Verification Member'), 'New member card generated');
assert(fs.readFileSync(path.join(editedOut, 'search-data.js'), 'utf8').includes('CMS Verification Member'), 'Search follows member updates');
assert(!fs.readFileSync(path.join(editedOut, 'news.html'), 'utf8').includes(hiddenNews.title), 'Hidden news excluded');
assert(fs.readFileSync(path.join(editedOut, 'publication-data.js'), 'utf8').includes('CMS verification publication citation'), 'Publication edits published');
assert(fs.readFileSync(path.join(editedOut, 'equipment-data-v2.js'), 'utf8').includes('CMS校验：更新后的设备原理'), 'Equipment edits published');
const facilities = new JSDOM(fs.readFileSync(path.join(editedOut, 'facilities.html'),'utf8'),{url:'http://localhost/',runScripts:'outside-only'});
const facilitiesWindow = facilities.window;
facilitiesWindow.eval(fs.readFileSync(path.join(editedOut,'equipment-data-v2.js'),'utf8'));
facilitiesWindow.eval(fs.readFileSync(path.join(ROOT,'facilities.js'),'utf8'));
facilitiesWindow.document.dispatchEvent(new facilitiesWindow.Event('DOMContentLoaded'));
const deviceCard = [...facilitiesWindow.document.querySelectorAll('.equipment-card-item')].find(item => item.dataset.equipmentId === records.equipment[0].id);
deviceCard.querySelector('.equipment-card').click();
assert(facilitiesWindow.document.getElementById('panel-principle').textContent.includes('CMS校验：更新后的设备原理'),'CMS equipment edits reach the actual detail dialog');
facilitiesWindow.close();
// A removed member must also disappear from a reused output directory.
fs.unlinkSync(path.join(editedContent, 'people', newPerson.id + '.json'));
buildSite({ contentDir: editedContent, outDir: editedOut, copyAssets: false });
assert(!fs.existsSync(path.join(editedOut, 'people', newPerson.id + '.html')), 'Deleted profiles do not linger');
update('news/' + hiddenNews._file, item => { item.month = 13; });
assert.throws(() => validateContent(editedContent), /month 1–12/, 'Reject invalid news month');
update('news/' + hiddenNews._file, item => { item.month = hiddenNews.month; });
update('people/' + records.people[0]._file, item => { item.links = [{ label: 'Unsafe link', url: 'javascript:alert(1)' }]; });
assert.throws(() => validateContent(editedContent), /unsupported link protocol/, 'Reject unsafe link protocol');

console.log(JSON.stringify({ result: 'passed', htmlPages: pageFiles.length, counts: { people: visible(records.people).length, publications: publications.length, equipment: equipment.length, news: visible(records.news).length }, scenarios: ['bilingual edits', 'new member and search', 'hidden news', 'publication and equipment edits', 'deleted profile cleanup', 'invalid month', 'unsafe link rejection'] }, null, 2));
