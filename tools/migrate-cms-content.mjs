// One-time migration of the existing website. Refuses to overwrite edited content.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import YAML from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8').replace(/^\uFEFF/, '');
const write = (name, value) => {
  if (process.argv.includes('--schema-only') && name !== '.pages.yml') return;
  if (name.startsWith('templates/')) value = value.replace(/[ \t]+$/gm, '');
  const target = path.join(root, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  for (let attempt = 0; ; attempt++) {
    try { fs.writeFileSync(target, value, 'utf8'); break; }
    catch (error) {
      if (attempt >= 4 || !['EBUSY', 'EPERM', 'UNKNOWN'].includes(error.code)) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
    }
  }
};
const json = (name, value) => write(name, JSON.stringify(value, null, 2) + '\n');
const norm = value => String(value || '').replace(/\s+/g, ' ').trim();
if (fs.existsSync(path.join(root,'content/research'))) throw new Error('Research content uses a collection now. Edit the current content and .pages.yml; do not rerun the initial migration.');
if (fs.existsSync(path.join(root, 'content/site.json')) && !process.argv.includes('--refresh-initial-migration') && !process.argv.includes('--schema-only')) throw new Error('Content already exists; migration is one-time only.');

function snapshot(filename, language = 'en') {
  const dom = new JSDOM(read(filename), { url: 'https://thermax-ic.github.io/' + filename, runScripts: 'outside-only' });
  const win = dom.window;
  win.localStorage.setItem('siteLanguage', language);
  win.setTimeout = fn => { fn(); return 0; };
  win.eval(read('lang.js'));
  if (filename === 'index.html') win.eval(read('home-i18n.js'));
  win.document.dispatchEvent(new win.Event('DOMContentLoaded'));
  return dom;
}
function selector(element) {
  if (!element.parentElement) return element.tagName.toLowerCase();
  const siblings = [...element.parentElement.children].filter(child => child.tagName === element.tagName);
  return selector(element.parentElement) + ' > ' + element.tagName.toLowerCase() + ':nth-of-type(' + (siblings.indexOf(element) + 1) + ')';
}
function nodesWithin(element) {
  const walker = element.ownerDocument.createTreeWalker(element, 4);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    if (norm(node.nodeValue) && !node.parentElement.closest('script,style,.language-toggle')) nodes.push(node);
  }
  return nodes;
}
const field = (name, label, type = 'string', extra = {}) => ({ name, label, type, ...extra });
const hidden = name => field(name, name, 'string', { hidden: true });
const pairFields = [field('zh', '中文文案', 'text'), field('en', '英文文案', 'text')];
const imageField = (name, label) => field(name, label, 'image', { options: { media: 'images' } });
const object = (name, label, fields, extra = {}) => field(name, label, 'object', { fields, ...extra });
const rich = (name, label) => field(name, label, 'rich-text', { options: { format: 'html', switcher: false, media: false } });
const list = (name, label, fields, summary) => object(name, label, fields, { list: { collapsible: { collapsed: true, summary } } });
const select = (name, label, values, multiple = false) => field(name, label, 'select', { options: { values, multiple } });

const pageNames = { index: '首页', about: '实验室介绍', research: '研究方向', facilities: '设备平台介绍', people: '成员页面介绍', publications: '论文页面介绍', news: '新闻页面介绍', contact: '联系方式', search: '搜索页面' };
const pageEntries = [];
const baseline = { publications: [], equipment: [], people: [], news: [], pageText: {} };

// Expose a narrowly defined editor schema for each fixed page. Identifiers remain
// in templates and schema rather than user-editable lists.
function extractRegion(doc, translated, regions, scope, label) {
  const data = {};
  const sections = new Map();
  const bound = new Set();
  let textIndex = 0, imageIndex = 0, linkIndex = 0;
  const translatedText = new WeakMap();
  for (const region of regions) for (const node of nodesWithin(region)) {
    const parent = translated.querySelector(selector(node.parentElement));
    const index = [...node.parentElement.childNodes].indexOf(node);
    translatedText.set(node, parent?.childNodes[index]?.nodeValue || node.nodeValue);
  }
  function sectionFor(node) {
    const region = regions.find(region => region.contains(node));
    let section = node.parentElement.closest('section,details');
    if (!section || !region.contains(section)) section = region;
    if (!sections.has(section)) {
      const name = 'section_' + String(sections.size + 1).padStart(2, '0');
      const titleNode = section.querySelector('h1,h2,h3,h4,summary,.section-kicker');
      const title = norm(titleNode?.textContent) || label;
      const zhTitle = titleNode ? norm(translated.querySelector(selector(titleNode))?.textContent) : '';
      sections.set(section, { name, title: (zhTitle || title).slice(0, 65), fields: [] });
      data[name] = {};
    }
    return sections.get(section);
  }
  function bind(node, key, language) {
    const parent = node.parentElement;
    if (parent.namespaceURI === 'http://www.w3.org/2000/svg') {
      parent.setAttribute('data-cms-text', scope + ':' + key);
      if (language) parent.setAttribute('data-cms-language', language);
    } else {
      const span = doc.createElement('span');
      span.setAttribute('data-cms-text', scope + ':' + key);
      span.setAttribute('data-cms-before', node.nodeValue.match(/^\s*/)[0]);
      span.setAttribute('data-cms-after', node.nodeValue.match(/\s*$/)[0]);
      if (language) span.setAttribute('data-cms-language', language);
      node.replaceWith(span);
      span.append(node);
    }
    bound.add(node);
  }
  function add(enNode, zhNode, explicit = false) {
    const node = enNode || zhNode;
    const section = sectionFor(node);
    const name = 'text_' + String(++textIndex).padStart(3, '0');
    const en = enNode ? norm(enNode.nodeValue) : '';
    const zh = zhNode ? norm(zhNode.nodeValue) : explicit ? '' : norm(translatedText.get(enNode));
    const labelText = (zh || en).slice(0, 75);
    data[section.name][name] = { en, zh };
    section.fields.push({name, label:labelText, component:'bilingual'});
    const key = section.name + '.' + name;
    if (enNode) bind(enNode, key, explicit ? 'en' : undefined);
    if (zhNode) bind(zhNode, key, 'zh');
  }
  // Pair explicit language blocks before wrapping ordinary text nodes.
  for (const region of regions) {
    const englishBlocks = [...region.querySelectorAll('.lang-only-en')].filter(el => !el.parentElement.closest('.lang-only-en,.lang-only-zh'));
    for (const english of englishBlocks) {
      let chinese = english.nextElementSibling;
      if (!chinese?.classList.contains('lang-only-zh')) chinese = null;
      const englishNodes = nodesWithin(english);
      const chineseNodes = chinese ? nodesWithin(chinese) : [];
      for (let i = 0; i < Math.max(englishNodes.length, chineseNodes.length); i++) add(englishNodes[i], chineseNodes[i], true);
    }
    for (const node of nodesWithin(region)) {
      if (bound.has(node)) continue;
      if (node.parentElement.closest('.lang-only-zh')) add(null, node, true);
      else if (node.parentElement.closest('.lang-only-en')) add(node, null, true);
      else add(node, null);
    }
  }
  const imageFields = [], linkFields = [];
  for (const region of regions) {
    for (const image of region.querySelectorAll('img')) {
      const name = 'image_' + String(++imageIndex).padStart(2, '0');
      const translatedImage = translated.querySelector(selector(image));
      const alt = norm(image.getAttribute('alt'));
      data.images ||= {};
      data.images[name] = { src: image.getAttribute('src') || '', alt_en: alt, alt_zh: norm(translatedImage?.getAttribute('alt')) || alt };
      image.setAttribute('data-cms-image', scope + ':images.' + name);
      imageFields.push(object(name, alt.slice(0, 65) || '图片', [imageField('src', '图片文件'), field('alt_zh', '中文图片说明'), field('alt_en', '英文图片说明')]));
    }
    for (const [cssSelector, name, src, label] of [
      ['.hero-v3-media', 'hero_background', 'Fig/advanced-ic-thermal-integration-hero.png', '首页顶部背景图'],
      ['.platform-v3-image', 'platform_background', 'Fig/ic-tmi-advanced-thermal-characterization-platform.png', '首页设备平台背景图']
    ]) {
      const element = region.querySelector(cssSelector);
      if (!element) continue;
      data.images ||= {};
      data.images[name] = {src,alt_en:element.getAttribute('aria-label') || '',alt_zh:translated.querySelector(cssSelector)?.getAttribute('aria-label') || ''};
      element.setAttribute('data-cms-background',scope + ':images.' + name);
      imageFields.push(object(name,label,[imageField('src','背景图片文件'),field('alt_zh','中文图片说明'),field('alt_en','英文图片说明')]));
    }
    for (const anchor of region.querySelectorAll('a[href]')) {
      if (/^(#|(?:\.\.\/)?(?:index|about|research|facilities|people|publications|news|contact|search)\.html)/.test(anchor.getAttribute('href'))) continue;
      const name = 'link_' + String(++linkIndex).padStart(2, '0');
      data.links ||= {};
      data.links[name] = { href: anchor.getAttribute('href') };
      anchor.setAttribute('data-cms-link', scope + ':links.' + name);
      linkFields.push(object(name, norm(anchor.textContent).slice(0, 65) || '链接', [field('href', '链接地址', 'string', { description: '邮箱链接以 mailto: 开头，网页链接以 https:// 开头。' })]));
    }
  }
  const fields = [...sections.values()].map(section => object(section.name, section.title, section.fields));
  if (imageFields.length) fields.push(object('images', '页面图片', imageFields));
  if (linkFields.length) fields.push(object('links', '网页与邮箱链接', linkFields));
  return { data, fields };
}

const homeEN = snapshot('index.html');
const homeZH = snapshot('index.html', 'zh');
const globalSelectors = ['.skip-link', '.university-bar', '.lab-lockup', '.site-footer'];
const globalRegions = globalSelectors.map(s => homeEN.window.document.querySelector(s));
const global = extractRegion(homeEN.window.document, homeZH.window.document, globalRegions, 'site', '网站公共信息');
json('content/site.json', global.data);
pageEntries.push({ name: 'site', label: '网站名称、导航与页脚', type: 'file', path: 'content/site.json', format: 'json', fields: global.fields });
const commonHTML = globalSelectors.map(s => homeEN.window.document.querySelector(s).outerHTML);

for (const [slug, label] of Object.entries(pageNames)) {
  const en = snapshot(slug + '.html');
  const zh = snapshot(slug + '.html', 'zh');
  const doc = en.window.document;
  // Dynamic lists are generated from their own collections.
  if (slug === 'news') doc.querySelector('.news-list').innerHTML = '<!-- CMS:NEWS -->';
  if (slug === 'people') {
    const main = doc.querySelector('main');
    main.innerHTML = '<section class="page-title people-page-title"><h2>People</h2></section><!-- CMS:PEOPLE -->';
  }
  if (slug === 'search') {
    const script = [...doc.querySelectorAll('script:not([src])')].find(el => el.textContent.includes('const people ='));
    if (script) {
      script.textContent = script.textContent.replace(/const pages = \[[\s\S]*?\n    \];/, 'const pages = window.siteSearchData.pages;').replace(/const people = \[[\s\S]*?\n    \];/, 'const people = window.siteSearchData.people;');
      const source = doc.createElement('script'); source.src = 'search-data.js'; script.before(source);
    }
  }
  const main = doc.querySelector('main');
  const extracted = extractRegion(doc, zh.window.document, [main], slug, label);
  json('content/pages/' + slug + '.json', extracted.data);
  pageEntries.push({ name: ['people','publications','news'].includes(slug) ? slug + '-page' : slug, label, type: 'file', path: 'content/pages/' + slug + '.json', format: 'json', fields: extracted.fields });
  for (let i = 0; i < globalSelectors.length; i++) {
    const matches = [...doc.querySelectorAll(globalSelectors[i])];
    matches.slice(1).forEach(el => el.remove());
    if (matches[0]) matches[0].outerHTML = commonHTML[i];
  }
  doc.querySelectorAll('script[src*="home-i18n.js"]').forEach(el => el.remove());
  doc.querySelectorAll('script[src*="equipment-principles.js"]').forEach(el => el.remove());
  doc.body.classList.remove('lang-en', 'lang-zh');
  doc.querySelectorAll('.language-toggle').forEach(button => { button.dataset.lang = 'en'; });
  write('templates/' + slug + '.html', '<!DOCTYPE html>\n' + doc.documentElement.outerHTML + '\n');
  baseline.pageText[slug] = Object.values(extracted.data).flatMap(section => Object.values(section)).filter(item => 'en' in item).map(item => ({ en: item.en, zh: item.zh }));
  en.window.close(); zh.window.close();
}

const publicationContext = { window: {} };
vm.runInNewContext(read('publication-data.js'), publicationContext);
publicationContext.window.publicationData.forEach((entry, index) => {
  const item = { ...entry, order: index + 1, published: true };
  json('content/publications/' + String(index + 1).padStart(3, '0') + '.json', item);
  baseline.publications.push(entry);
});

const equipmentContext = { window: {} };
vm.runInNewContext(read('equipment-data-v2.js'), equipmentContext);
vm.runInNewContext(read('equipment-principles.js'), equipmentContext);
const library = equipmentContext.window.equipmentLibraryData;
library.equipment.forEach((device, index) => {
  json('content/equipment/' + device.id + '.json', { ...device, order: index + 1, published: true });
  baseline.equipment.push(device);
});
delete library.equipment;
json('content/equipment-settings.json', library);

const peopleDoc = new JSDOM(read('people.html')).window.document;
const seen = new Set();
for (const [index, card] of [...peopleDoc.querySelectorAll('.person-card-link')].entries()) {
  const filename = card.getAttribute('href');
  const id = path.basename(filename, '.html');
  if (seen.has(id)) continue;
  seen.add(id);
  const raw = new JSDOM(read(filename));
  const translated = snapshot(filename, 'zh');
  const doc = raw.window.document;
  const enSections = [...doc.querySelectorAll('.profile-language-sections.lang-only-en article')];
  const zhSections = [...doc.querySelectorAll('.profile-language-sections.lang-only-zh article')];
  const enIntro = enSections.find(el => norm(el.querySelector('h2')?.textContent) === 'Biography');
  const zhIntro = zhSections.find(el => norm(el.querySelector('h2')?.textContent) === '个人简介');
  const enEdu = enSections.find(el => norm(el.querySelector('h2')?.textContent) === 'Education and Training');
  const zhEdu = zhSections.find(el => norm(el.querySelector('h2')?.textContent) === '教育与科研经历');
  const paragraphs = el => el ? [...el.querySelectorAll('p')].map(p => norm(p.textContent)) : [];
  const photo = doc.querySelector('.person-profile-photo img');
  const cardStyle = card.querySelector('.person-photo-v2')?.getAttribute('style') || '';
  const role = norm(doc.querySelector('.profile-role-label .lang-only-en')?.textContent || doc.querySelector('.profile-role-label')?.textContent);
  const roleZh = norm(translated.window.document.querySelector('.profile-role-label .lang-only-zh')?.textContent || translated.window.document.querySelector('.profile-role-label')?.textContent);
  const extraEN = enSections.filter(el => el !== enIntro && el !== enEdu);
  const extraZH = zhSections.filter(el => el !== zhIntro && el !== zhEdu);
  const person = {
    id, name: norm(card.querySelector('h3.lang-only-en')?.textContent), nameZh: norm(card.querySelector('h3.lang-only-zh')?.textContent),
    group: card.closest('.people-category').id, order: index + 1, role, roleZh,
    meta: norm(card.querySelector('.person-meta.lang-only-en')?.textContent), metaZh: norm(card.querySelector('.person-meta.lang-only-zh')?.textContent),
    image: photo?.getAttribute('src')?.replace(/^\.\.\//, '') || '',
    imagePosition: cardStyle.match(/--image-position:\s*([^;]+)/)?.[1] || '50% 50%',
    imagePositionFull: photo?.getAttribute('style')?.match(/object-position:\s*([^;]+)/)?.[1] || '50% 50%',
    email: doc.querySelector('.person-profile-side a[href^="mailto:"]')?.getAttribute('href').slice(7) || '',
    bio: paragraphs(enIntro).join('\n\n'), bioZh: paragraphs(zhIntro).join('\n\n'),
    education: paragraphs(enEdu).map((en, i) => ({ en, zh: paragraphs(zhEdu)[i] || '' })),
    sections: extraEN.map((el, i) => ({ title: norm(el.querySelector('h2')?.textContent), titleZh: norm(extraZH[i]?.querySelector('h2')?.textContent), body: [...el.children].filter(child => child.tagName !== 'H2').map(child => child.outerHTML).join(''), bodyZh: extraZH[i] ? [...extraZH[i].children].filter(child => child.tagName !== 'H2').map(child => child.outerHTML).join('') : '' })),
    links: [...doc.querySelectorAll('.person-profile-side a:not([href^="mailto:"])')].map(el => ({ label: norm(el.textContent), url: el.getAttribute('href') })), published: true
  };
  json('content/people/' + id + '.json', person);
  baseline.people.push(person);
  raw.window.close(); translated.window.close();
}
// Reuse the PI layout for generated profile pages, while preserving the original
// hand-maintained source file. All profile content now comes from CMS records.
const profile = new JSDOM(read('people/zhe-cheng.html')).window.document;
profile.querySelector('main').innerHTML = '<!-- CMS:PROFILE -->';
globalSelectors.forEach((s, i) => {
  profile.querySelector(s).outerHTML = commonHTML[i];
});
write('templates/profile.html', '<!DOCTYPE html>\n' + profile.documentElement.outerHTML + '\n');

const newsEN = snapshot('news.html');
const newsZH = snapshot('news.html', 'zh');
const zhArticles = [...newsZH.window.document.querySelectorAll('.news-list-item')];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
[...newsEN.window.document.querySelectorAll('.news-list-item')].forEach((article, index) => {
  const chinese = zhArticles[index];
  const image = article.querySelector('img');
  const month = months.indexOf(norm(article.querySelector('.month').textContent)) + 1;
  const title = norm(article.querySelector('h3').textContent);
  const body = el => [...el.querySelectorAll('.news-list-content > p:not(.news-category)')].map(p => p.outerHTML).join('');
  const item = {
    title, titleZh: norm(chinese.querySelector('h3').textContent), year: Number(norm(article.querySelector('.year').textContent)), month,
    body: body(article), bodyZh: body(chinese), image: image?.getAttribute('src') || '',
    imageAlt: image?.getAttribute('alt') || '', imageAltZh: chinese.querySelector('img')?.getAttribute('alt') || '',
    caption: norm(article.querySelector('figcaption')?.textContent), captionZh: norm(chinese.querySelector('figcaption')?.textContent),
    category: norm(article.querySelector('.news-category')?.textContent), categoryZh: norm(chinese.querySelector('.news-category')?.textContent),
    order: index + 1, published: true
  };
  json('content/news/' + item.year + '-' + String(month).padStart(2, '0') + '.json', item);
  baseline.news.push(item);
});
newsEN.window.close(); newsZH.window.close();

const groups = [
  { name: 'principal-investigator', label: '负责人' }, { name: 'postdoctoral-fellows-and-visiting-scholars', label: '博士后与访问学者' },
  { name: 'phd-students', label: '博士生' }, { name: 'masters-students', label: '硕士生' }, { name: 'undergraduate-students', label: '本科生' }, { name: 'alumni', label: '校友' }
];
const collection = (name, label, fields, primary, extra = {}) => ({ name, label, type: 'collection', path: 'content/' + name, format: 'json', filename: { template: '{year}-{month}-{day}-{hour}-{minute}-{second}-{primary}.json', field: false }, fields, view: { primary, sort: ['order'], default: {sort:'order',order:'asc'} }, operations: { rename: false }, ...extra });
const published = field('published', '在网站显示', 'boolean', { description: '开启后保存将自动发布；关闭可保留内容而不在网站显示。' });
const order = field('order', '排列顺序', 'number', { description: '数字较小的条目排在前面；论文优先按年份倒序。' });
const pairList = (name, label) => list(name, label, [field('zh', '中文', 'text'), field('en', '英文', 'text')], '{zh}');
const people = collection('people', '成员管理', [
  field('id', '个人页面地址标识', 'string', { required: true, pattern: { regex: '^[a-z0-9]+(?:-[a-z0-9]+)*$', message: '请填写英文小写字母、数字和连字符，例如 zhe-cheng。' }, description: '用于个人页面地址。现有成员请保持不变。新增成员可填写姓名拼音。' }),
  field('nameZh', '中文姓名'), field('name', '英文姓名', 'string', { required: true }), select('group', '成员类别', groups),
  field('roleZh', '中文身份'), field('role', '英文身份'), imageField('image', '成员照片'),
  field('imagePosition', '列表照片位置', 'string', { description: '例如 50% 50%；第一个数字为左右位置，第二个为上下位置。' }), field('imagePositionFull', '个人页面照片位置'),
  field('metaZh', '列表简述（中文）', 'text'), field('meta', '列表简述（英文）', 'text'), field('email', '联系邮箱'),
  field('bioZh', '个人简介（中文）', 'text'), field('bio', '个人简介（英文）', 'text'), pairList('education', '教育与科研经历（从最近到最早）'),
  list('sections', '其他介绍栏目', [field('titleZh', '中文栏目名称'), field('title', '英文栏目名称'), rich('bodyZh', '中文内容'), rich('body', '英文内容')], '{titleZh}'),
  list('links', '个人相关链接', [field('label', '显示名称'), field('url', '网址')], '{label}'), order, published
], 'name', { filename: { template: '{fields.id}.json', field: false } });
const pubs = collection('publications', '论文管理', [
  field('year', '发表年份', 'number', { required: true }), select('type', '论文类型', [{ name: 'journal', label: '期刊论文' }, { name: 'conference', label: '会议论文' }, { name: 'preprint', label: '预印本' }, { name: 'book_chapter', label: '书章节 / 其他' }]),
  field('citation', '完整引用信息', 'text', { required: true, description: '按正式引用格式填写作者、题目、期刊、卷期和年份；网站不会自动改写引用。' }),
  field('doi', 'DOI'), field('link', '论文网页链接'), field('pdf', 'PDF 文件或链接', 'file', { options: { media: 'pdfs' }, description: '可上传 PDF，也可填写 https:// 开头的公开 PDF 链接。' }), order, published
], 'citation', {filename:{template:'publication-{year}-{month}-{day}-{hour}-{minute}-{second}.json',field:false}});
const news = collection('news', '新闻管理', [
  field('titleZh', '中文标题'), field('title', '英文标题', 'string', { required: true }), field('year', '年份', 'number', { required: true }), field('month', '月份（1–12）', 'number', { required: true }),
  rich('bodyZh', '中文正文'), rich('body', '英文正文'), imageField('image', '新闻配图'), field('imageAltZh', '中文图片说明'), field('imageAlt', '英文图片说明'),
  field('captionZh', '图片下方说明（中文）'), field('caption', '图片下方说明（英文）'), field('categoryZh', '新闻分类（中文）'), field('category', '新闻分类（英文）'), order, published
], 'title', { filename:{template:'news-{year}-{month}-{day}-{hour}-{minute}-{second}.json',field:false}, view: { primary: 'title', fields: ['year', 'month', 'titleZh', 'published'], sort: ['year','month','order'], default:{sort:'year',order:'desc'} } });
const sourceFields = [field('labelZh', '中文来源说明'), field('label', '英文来源说明'), field('url', '来源网页')];
const categories = [...library.filters.filter(item => item.id !== 'all').map(item => ({ name: item.id, label: item.labelZh })), {name:'custom-built',label:'自主搭建'}, {name:'modified-commercial',label:'采购改装'}];
const equipmentFields = [
  field('id', '设备地址标识', 'string', { required: true, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', description: '现有设备请保持不变；新增设备填写英文小写字母、数字和连字符。' }),
  field('nameZh', '中文设备名称'), field('name', '英文设备名称', 'string', { required: true }), select('source', '设备来源', [{ name: 'custom-built', label: '自主搭建' }, { name: 'modified-commercial', label: '采购改装' }, { name: 'shared', label: '共享设备' }]), select('categories', '设备分类（可多选）', categories, true),
  field('summaryZh', '中文简介', 'text'), field('summary', '英文简介', 'text'), field('overviewZh', '中文详细介绍', 'text'), field('overview', '英文详细介绍', 'text'),
  imageField('image', '设备图片'), field('imageAltZh', '设备图片说明（中文）'), field('imageAlt', '设备图片说明（英文）'), field('imageGenerated', '设备图片是 AI 示意图', 'boolean'), object('imageSource', '设备图片来源', sourceFields),
  field('principleZh', '工作原理（中文）', 'text'), field('principle', '工作原理（英文）', 'text'), imageField('principleImage', '原理图（英文或通用）'), imageField('principleImageZh','原理图（中文，可选）'), field('principleImageAlt','英文原理图说明'), field('principleImageAltZh','中文原理图说明'), object('principleSource', '原理图来源', sourceFields),
  pairList('parameters', '可测参数'), pairList('samples', '适用样品'), pairList('features', '设备特点'),
  list('publications', '相关论文', [field('citation', '引用信息', 'text'), field('url', '论文链接'), field('scholarUrl', '学术搜索链接'), field('verified', '链接已核对', 'boolean')], '{citation}'),
  list('results', '代表性测量结果（论文引用）', [field('citation', '结果说明或引用信息', 'text'), field('url', '结果或论文链接'), field('scholarUrl', '学术搜索链接'), field('verified', '链接已核对', 'boolean')], '{citation}'), order, published
];
const equipment = collection('equipment', '设备管理', equipmentFields, 'name', { filename: { template: '{fields.id}.json', field: false } });
const capabilityStates = [{name:'none',label:'无此能力'}, ...library.capabilityMatrix.legend.map(item => ({name:item.id,label:item.labelZh}))];
const equipmentSettings = {name:'equipment-settings',label:'设备分类与能力矩阵',type:'file',path:'content/equipment-settings.json',format:'json',fields:[
  list('filters','设备分类名称',[field('id','分类标识','string',{readonly:true}),field('labelZh','中文名称'),field('label','英文名称')],'{labelZh}'),
  object('capabilityMatrix','能力矩阵',[
    list('legend','图例',[field('id','能力标识','string',{readonly:true}),field('labelZh','中文名称'),field('label','英文名称')],'{labelZh}'),
    list('columns','测量项目',[field('id','项目标识','string',{readonly:true}),field('labelZh','中文名称'),field('label','英文名称')],'{labelZh}'),
    list('rows','设备能力',[field('labelZh','中文设备名称'),field('label','英文设备名称'),object('values','测量能力',library.capabilityMatrix.columns.map(item => select(item.id,item.labelZh,capabilityStates)))],'{labelZh}')
  ])
]};
const config = {
  components: { bilingual: { type: 'object', fields: pairFields } },
  media: [
    { name: 'images', label: '网站图片', input: 'images', output: '/images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'], rename: 'safe' },
    { name: 'portraits', label: '现有成员照片', input: 'Fig', output: '/Fig', extensions: ['jpg', 'jpeg', 'png', 'webp'], rename: 'safe' },
    { name: 'pdfs', label: '论文 PDF', input: 'pdfs', output: '/pdfs', extensions: ['pdf'], rename: 'safe' }
  ],
  content: [...pageEntries, people, pubs, news, equipment, equipmentSettings],
  settings: { content: { merge: true }, commit: { templates: { create: 'content: add {name}', update: 'content: update {name}', delete: 'content: remove {name}' } } }
};
write('.pages.yml', '# Pages CMS — 编辑入口：https://app.pagescms.org/thermax-ic/thermax-ic.github.io\n' + YAML.stringify(config, { lineWidth: 0, aliasDuplicateObjects: false }));
json('tools/cms-migration-baseline.json', baseline);
homeEN.window.close(); homeZH.window.close();
console.log(JSON.stringify({ pages: pageEntries.length, people: seen.size, publications: baseline.publications.length, equipment: baseline.equipment.length, news: baseline.news.length }));
