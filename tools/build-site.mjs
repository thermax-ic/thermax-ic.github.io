import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import sanitizeHtml from 'sanitize-html';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const GROUPS = [
  { id: 'principal-investigator', en: 'Principal Investigator', zh: '负责人' },
  { id: 'postdoctoral-fellows-and-visiting-scholars', en: 'Postdoctoral Fellows and Visiting Scholars', zh: '博士后与访问学者' },
  { id: 'phd-students', en: 'Ph.D. Students', zh: '博士生' },
  { id: 'masters-students', en: "Master's Students", zh: '硕士生' },
  { id: 'undergraduate-students', en: 'Undergraduate Students', zh: '本科生' },
  { id: 'alumni', en: 'Alumni', zh: '校友' }
];
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const text = value => String(value ?? '');
export function bilingual(en, zh = '') {
  if (!zh) return `<span class="no-translate">${escapeHTML(en)}</span>`;
  return `<span class="lang-only-en">${escapeHTML(en)}</span><span class="lang-only-zh" lang="zh-CN">${escapeHTML(zh)}</span>`;
}
export function safeURL(value, label = 'URL') {
  const url = text(value).trim();
  if (/^[\u0000-\u0020]*[a-z][a-z0-9+.-]*:/i.test(url) && !/^(https?:|mailto:|tel:)/i.test(url)) throw new Error(`${label}: unsupported link protocol`);
  if (/[\u0000-\u001f\u007f\\]/.test(url) || url.startsWith('//')) throw new Error(`${label}: invalid URL`);
  return url;
}
const safeImage = value => {
  const url = safeURL(value, 'Image');
  if (url && !/^\/?(?:images|Fig)\//.test(url) && !/^https?:\/\//.test(url)) throw new Error('Images must be uploaded into images/ or Fig/: ' + url);
  return url;
};
const position = value => /^\d{1,3}(?:\.\d+)?%\s+\d{1,3}(?:\.\d+)?%$/.test(text(value)) ? value : '50% 50%';
const html = (value, { images = false } = {}) => sanitizeHtml(text(value), {
  allowedTags: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup', 'ul', 'ol', 'li', 'a', 'blockquote', 'h3', 'h4', ...(images ? ['img'] : [])],
  allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src','alt','title','width','height'], '*': ['lang'] },
  allowedSchemesByTag: { img: ['http','https'] },
  allowedSchemes: ['http', 'https', 'mailto'], allowProtocolRelative: false,
  transformTags: { a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, rel: 'noopener noreferrer' } }) }
});
const paragraphs = value => text(value).split(/\n\s*\n/).filter(part => part.trim()).map(part => `<p>${escapeHTML(part.trim()).replace(/\n/g, '<br>')}</p>`).join('');
const sortEntries = entries => [...entries].sort((a, b) => Number(a.order ?? 9999) - Number(b.order ?? 9999) || a._file.localeCompare(b._file));
export function readCollection(contentDir, name) {
  const directory = path.join(contentDir, name);
  return sortEntries(fs.readdirSync(directory).filter(filename => filename.endsWith('.json')).map(filename => ({
    ...JSON.parse(fs.readFileSync(path.join(directory, filename), 'utf8')), _file: filename
  })));
}
const publicRecord = ({ _file, order, published, ...item }) => item;
const readJSON = filename => JSON.parse(fs.readFileSync(filename, 'utf8'));
const publicURL = value => {
  const url = safeURL(value);
  return url && !url.startsWith('/') && !url.startsWith('#') && !/^[a-z]+:/i.test(url) ? '/' + url.replace(/^\.\.\//, '') : url;
};
function assert(condition, message) { if (!condition) throw new Error(message); }

function setActiveNavigation(doc, page) {
  const baseURL = 'https://thermax-ic.github.io/';
  const currentPath = new URL(page, baseURL).pathname;
  doc.querySelectorAll('.main-nav a').forEach(anchor => {
    const isCurrent = new URL(anchor.getAttribute('href'), baseURL).pathname === currentPath;
    anchor.classList.toggle('active', isCurrent);
    if (isCurrent) anchor.setAttribute('aria-current', 'page');
    else anchor.removeAttribute('aria-current');
  });
}

export function validateContent(contentDir) {
  const people = readCollection(contentDir, 'people');
  const publications = readCollection(contentDir, 'publications');
  const news = readCollection(contentDir, 'news');
  const equipment = readCollection(contentDir, 'equipment');
  const research = readCollection(contentDir, 'research');
  const settings = readJSON(path.join(contentDir, 'equipment-settings.json'));
  const unique = (items, field, name) => {
    const values = items.map(item => item[field]);
    assert(values.every(value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)), name + ': invalid identifier');
    assert(new Set(values).size === values.length, name + ': duplicate identifier');
  };
  unique(people, 'id', 'People'); unique(equipment, 'id', 'Equipment');
  people.forEach(person => {
    assert(person.name && GROUPS.some(group => group.id === person.group), 'Member requires a name and a valid group: ' + person._file);
    assert(!person.email || /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(person.email), 'Invalid email: ' + person._file);
    safeImage(person.image);
    (person.links || []).forEach(link => safeURL(link.url));
    (person.education || []).forEach(entry => assert(entry.en && entry.zh, 'Education requires matching English and Chinese entries: ' + person._file));
  });
  publications.forEach(paper => {
    assert(Number.isInteger(paper.year) && paper.year >= 1900 && paper.year <= 2200, 'Invalid publication year: ' + paper._file);
    assert(['preprint', 'journal', 'conference', 'book_chapter'].includes(paper.type) && paper.citation, 'Invalid publication: ' + paper._file);
    safeURL(paper.link); safeURL(paper.pdf);
  });
  news.forEach(item => {
    assert(item.title && Number.isInteger(item.year) && Number.isInteger(item.month) && item.month >= 1 && item.month <= 12, 'News requires title, year, and month 1–12: ' + item._file);
    safeImage(item.image);
  });
  research.forEach(direction => {
    assert(text(direction.title).trim() || text(direction.titleZh).trim(), 'Research direction requires a title: ' + direction._file);
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(direction._file), 'Invalid research direction filename: ' + direction._file);
    assert(direction.order === undefined || direction.order === null || (typeof direction.order === 'number' && Number.isFinite(direction.order)), 'Invalid research direction order: ' + direction._file);
    assert(!direction.imageFit || ['cover','contain'].includes(direction.imageFit), 'Invalid research image display mode: ' + direction._file);
    assert(!direction.points || Array.isArray(direction.points), 'Research points must be a list: ' + direction._file);
    safeImage(direction.image);
  });
  const filterIds = new Set([...settings.filters.map(filter => filter.id), 'custom-built', 'modified-commercial', 'shared']);
  equipment.forEach(device => {
    assert(device.name && ['custom-built', 'modified-commercial', 'shared'].includes(device.source), 'Invalid equipment: ' + device._file);
    assert((device.categories || []).every(category => filterIds.has(category)), 'Unknown equipment category: ' + device._file);
    safeImage(device.image); safeImage(device.principleImage); safeImage(device.principleImageZh);
    for (const source of [device.imageSource, device.principleSource]) if (source) safeURL(source.url);
    for (const ref of [...(device.publications || []), ...(device.results || [])]) { safeURL(ref.url); safeURL(ref.scholarUrl); }
  });
  const states = new Set(['', 'none', ...settings.capabilityMatrix.legend.map(item => item.id)]);
  const columns = new Set(settings.capabilityMatrix.columns.map(item => item.id));
  settings.capabilityMatrix.rows.forEach(row => Object.entries(row.values || {}).forEach(([key, value]) => {
    assert(columns.has(key) && states.has(value), 'Invalid capability matrix entry: ' + key);
  }));
  return { people, publications, news, equipment, research, settings };
}

function researchIndexMarkup(directions) {
  return directions.map(direction => `<li><a href="#${path.basename(direction._file,'.json')}">${bilingual(direction.title || direction.titleZh,direction.titleZh || direction.title)}</a></li>`).join('\n');
}
function researchMarkup(directions) {
  return directions.map((direction,index) => {
    const id = path.basename(direction._file,'.json');
    const enTitle = direction.title || direction.titleZh, zhTitle = direction.titleZh || direction.title;
    const altEn = direction.imageAlt || enTitle, altZh = direction.imageAltZh || zhTitle;
    const captionEn = direction.caption || direction.captionZh || '', captionZh = direction.captionZh || direction.caption || '';
    const image = direction.image ? `<div class="image-box research-image research-cms-image" role="img" aria-label="${escapeHTML(altEn)}" data-i18n-en="${escapeHTML(altEn)}" data-i18n-zh="${escapeHTML(altZh)}" data-i18n-attribute="aria-label" style="--image: url('${escapeHTML(encodeURI(publicURL(safeImage(direction.image))).replaceAll("'",'%27').replaceAll('"','%22'))}');${direction.imageFit === 'contain' ? ' background-size: cover, contain, cover; background-repeat: no-repeat;' : ''}">${captionEn ? `<span class="research-cms-caption" data-i18n-en="${escapeHTML(captionEn)}" data-i18n-zh="${escapeHTML(captionZh)}">${escapeHTML(captionEn)}</span>` : ''}</div>` : '';
    const points = (direction.points || []).filter(item => text(item.en).trim() || text(item.zh).trim());
    return `<section id="${id}" class="research-block${index % 2 ? ' reverse' : ''}${image ? '' : ' research-without-image'}">
      ${image}<div class="research-text">
        <div class="research-label">${bilingual('Research Thrust '+String(index+1).padStart(2,'0'),'研究方向 '+String(index+1).padStart(2,'0'))}</div>
        <h3>${bilingual(enTitle,zhTitle)}</h3>
        <div class="lang-only-en">${html(direction.body || direction.bodyZh,{images:true})}</div>
        <div class="lang-only-zh" lang="zh-CN">${html(direction.bodyZh || direction.body,{images:true})}</div>
        ${points.length ? `<ul>${points.map(item=>`<li>${bilingual(item.en || item.zh,item.zh || item.en)}</li>`).join('')}</ul>` : ''}
      </div></section>`;
  }).join('\n');
}

function peopleMarkup(people) {
  const menu = GROUPS.map((group, i) => `<a${i === 0 ? ' class="active"' : ''} href="#${group.id}">${bilingual(group.en, group.zh)}</a>`).join('');
  const categories = GROUPS.map(group => {
    const members = people.filter(person => person.group === group.id);
    const cards = members.map(person => {
      const photo = person.image ? ` style="--image: url('${escapeHTML(encodeURI(publicURL(safeImage(person.image))).replaceAll("'", '%27'))}'); --image-position: ${position(person.imagePosition)};"` : '';
      return `<a class="person-card-link" href="people/${person.id}.html"><article class="person-card-v2">
        <div class="person-photo-v2${person.image ? '' : ' person-photo-placeholder'}" role="img" aria-label="${escapeHTML('Portrait of ' + person.name)}"${photo}></div>
        <div class="person-content-v2">${person.nameZh ? `<h3 class="lang-only-en">${escapeHTML(person.name)}</h3><h3 class="person-native-name lang-only-zh" lang="zh-CN">${escapeHTML(person.nameZh)}</h3>` : `<h3>${escapeHTML(person.name)}</h3>`}
        ${person.role || person.roleZh ? `<p class="person-role">${bilingual(person.role, person.roleZh)}</p>` : ''}
        ${person.meta ? `<p class="person-meta lang-only-en">${escapeHTML(person.meta)}</p>` : ''}${person.metaZh ? `<p class="person-meta lang-only-zh" lang="zh-CN">${escapeHTML(person.metaZh)}</p>` : ''}
        <span class="profile-link-label">${bilingual('View profile', '查看个人主页')}</span></div></article></a>`;
    }).join('\n');
    return `<section class="people-category" id="${group.id}"><div class="people-category-heading"><h2>${bilingual(group.en, group.zh)}</h2><span>${members.length}</span></div><div class="people-card-grid${group.id === 'principal-investigator' ? ' pi-grid' : ''}">${cards}</div></section>`;
  }).join('\n');
  return `<div class="people-layout-v2"><aside class="people-filter"><div class="filter-heading">${bilingual('Person Type', '成员类别')}</div><nav class="filter-menu">${menu}</nav></aside><section class="people-results" id="members"><div class="result-label">${bilingual(people.length + ' people', people.length + ' 位成员')}</div>${categories}</section></div>`;
}
function profileMarkup(person) {
  const group = GROUPS.find(item => item.id === person.group);
  const photo = person.image ? `<div class="person-profile-photo person-profile-photo-full"><img src="${escapeHTML(publicURL(person.image))}" alt="${escapeHTML('Portrait of ' + person.name)}" style="object-position: ${position(person.imagePositionFull)};"></div>` : '<div class="person-profile-photo person-profile-photo-full person-profile-photo-placeholder"></div>';
  const sections = lang => {
    const suffix = lang === 'zh' ? 'Zh' : '';
    const biography = person['bio' + suffix];
    const education = (person.education || []).map(item => item[lang]).filter(Boolean);
    const intro = biography ? `<article class="person-profile-intro"><h2>${lang === 'zh' ? '个人简介' : 'Biography'}</h2>${paragraphs(biography)}</article>` : '';
    const training = education.length ? `<article><h2>${lang === 'zh' ? '教育与科研经历' : 'Education and Training'}</h2>${education.map(entry => `<p>${escapeHTML(entry)}</p>`).join('')}</article>` : '';
    const extra = (person.sections || []).map(section => {
      const body = section['body' + suffix];
      return body ? `<article><h2>${escapeHTML(section['title' + suffix] || section.title)}</h2>${html(body)}</article>` : '';
    }).join('');
    return intro + training + extra;
  };
  const links = (person.links || []).filter(link => link.url).map(link => `<li><a href="${escapeHTML(safeURL(link.url))}" target="_blank" rel="noopener noreferrer">${escapeHTML(link.label)}</a></li>`).join('');
  return `<div class="profile-back-link"><a href="../people.html">${bilingual('← Back to People', '← 返回成员列表')}</a></div>
    <section class="person-profile-hero">${photo}<div class="person-profile-heading"><p class="profile-role-label">${bilingual(person.role, person.roleZh)}</p><h1><span class="profile-name-primary lang-only-en">${escapeHTML(person.name)}</span>${person.nameZh ? `<span class="profile-name-primary lang-only-zh" lang="zh-CN">${escapeHTML(person.nameZh)}</span>` : `<span class="profile-name-primary lang-only-zh" lang="zh-CN">${escapeHTML(person.name)}</span>`}</h1><p class="profile-group-label">${bilingual(group.en, group.zh)}</p></div></section>
    <div class="person-profile-layout"><section class="person-profile-main"><div class="profile-language-sections lang-only-en">${sections('en')}</div><div class="profile-language-sections lang-only-zh" lang="zh-CN">${sections('zh')}</div></section>
    <aside class="person-profile-side">${person.email ? `<section><h2>${bilingual('Contact', '联系')}</h2><p><a href="mailto:${escapeHTML(person.email)}">${escapeHTML(person.email)}</a></p></section>` : ''}${links ? `<section><h2>${bilingual('Links', '相关链接')}</h2><ul>${links}</ul></section>` : ''}</aside></div>`;
}
function newsMarkup(news) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return news.map(item => {
    const image = item.image ? `<img class="${item.caption ? 'news-photo' : 'news-inline-image'}" src="${escapeHTML(publicURL(item.image))}" alt="${escapeHTML(item.imageAlt || item.title)}" data-i18n-alt-en="${escapeHTML(item.imageAlt || item.title)}" data-i18n-alt-zh="${escapeHTML(item.imageAltZh || item.titleZh || item.title)}" loading="lazy">` : '';
    const figure = item.caption ? `<figure class="news-photo-figure">${image}<figcaption>${bilingual(item.caption, item.captionZh)}</figcaption></figure>` : image;
    return `<article class="news-list-item" id="news-${escapeHTML(path.basename(item._file, '.json'))}"><div class="news-date-box"><span class="month">${bilingual(months[item.month - 1], item.month + '月')}</span><span class="year">${item.year}</span></div><div class="news-list-content"><h3>${bilingual(item.title, item.titleZh)}</h3>${item.caption ? figure : ''}<div class="lang-only-en">${html(item.body)}</div><div class="lang-only-zh" lang="zh-CN">${html(item.bodyZh || item.body)}</div>${item.caption ? '' : figure}<p class="news-category">${bilingual(item.category, item.categoryZh)}</p></div></article>`;
  }).join('\n');
}

export function buildSite({ contentDir = path.join(ROOT, 'content'), outDir = path.join(ROOT, 'dist'), copyAssets = true } = {}) {
  const absoluteOut = path.resolve(outDir);
  assert(absoluteOut.startsWith(ROOT + path.sep) && absoluteOut !== path.join(ROOT, 'content') && !absoluteOut.startsWith(path.join(ROOT, 'content') + path.sep), 'Output must be a separate directory inside this workspace');
  fs.mkdirSync(absoluteOut, { recursive: true });
  // Remove only previously generated member pages; prevent stale deleted profiles.
  const profileDir = path.join(absoluteOut, 'people');
  if (fs.existsSync(profileDir)) for (const name of fs.readdirSync(profileDir)) {
    if (name.endsWith('.html')) fs.unlinkSync(path.join(profileDir, name));
  }
  const records = validateContent(contentDir);
  const visible = items => items.filter(item => item.published !== false);
  const people = visible(records.people);
  const news = visible(records.news).sort((a, b) => b.year - a.year || b.month - a.month || Number(a.order || 0) - Number(b.order || 0));
  const publications = visible(records.publications).sort((a, b) => b.year - a.year || Number(a.order || 0) - Number(b.order || 0));
  const equipment = visible(records.equipment);
  const research = visible(records.research);
  const datasets = { site: readJSON(path.join(contentDir, 'site.json')) };
  for (const name of fs.readdirSync(path.join(contentDir, 'pages'))) if (name.endsWith('.json')) datasets[path.basename(name, '.json')] = readJSON(path.join(contentDir, 'pages', name));
  const write = (filename, value) => {
    const target = path.join(absoluteOut, filename);
    fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, value, 'utf8');
  };
  function applyBindings(doc) {
    const resolve = binding => {
      const [scope, key] = binding.split(':');
      const value = key.split('.').reduce((current, segment) => current?.[segment], datasets[scope]);
      assert(value !== undefined, 'Missing editable field: ' + binding); return value;
    };
    doc.querySelectorAll('[data-cms-text]').forEach(element => {
      const copy = resolve(element.getAttribute('data-cms-text'));
      const fixed = element.getAttribute('data-cms-language');
      const before = element.getAttribute('data-cms-before') || '', after = element.getAttribute('data-cms-after') || '';
      element.textContent = before + (fixed === 'zh' ? text(copy.zh) : text(copy.en)) + after;
      if (!fixed) { element.setAttribute('data-i18n-en', before + text(copy.en) + after); element.setAttribute('data-i18n-zh', before + text(copy.zh || copy.en) + after); }
      for (const name of ['data-cms-text', 'data-cms-language', 'data-cms-before', 'data-cms-after']) element.removeAttribute(name);
    });
    doc.querySelectorAll('[data-cms-image]').forEach(element => {
      const image = resolve(element.getAttribute('data-cms-image'));
      element.setAttribute('src', safeImage(image.src)); element.setAttribute('alt', image.alt_en || '');
      element.setAttribute('data-i18n-alt-en', image.alt_en || ''); element.setAttribute('data-i18n-alt-zh', image.alt_zh || image.alt_en || '');
      element.removeAttribute('data-cms-image');
    });
    doc.querySelectorAll('[data-cms-background]').forEach(element => {
      const image = resolve(element.getAttribute('data-cms-background'));
      const url = encodeURI(publicURL(safeImage(image.src))).replaceAll('"', '%22').replaceAll("'", '%27');
      element.style.backgroundImage = url ? `url("${url}")` : 'none';
      element.setAttribute('aria-label', image.alt_en || '');
      element.setAttribute('data-i18n-en', image.alt_en || ''); element.setAttribute('data-i18n-zh', image.alt_zh || image.alt_en || '');
      element.setAttribute('data-i18n-attribute', 'aria-label'); element.removeAttribute('data-cms-background');
    });
    doc.querySelectorAll('[data-cms-link]').forEach(element => {
      element.setAttribute('href', safeURL(resolve(element.getAttribute('data-cms-link')).href)); element.removeAttribute('data-cms-link');
    });
    doc.querySelectorAll('script[src]').forEach(element => {
      if (/equipment-principles\.js(?:\?|$)/.test(element.getAttribute('src'))) { element.remove(); return; }
      if (/lang\.js(?:\?|$)/.test(element.getAttribute('src'))) element.setAttribute('src', element.getAttribute('src').replace('lang.js', 'cms-language.js'));
    });
    doc.querySelectorAll('input[placeholder]').forEach(element => {
      const en = element.getAttribute('placeholder');
      element.setAttribute('data-i18n-placeholder-en', en);
      element.setAttribute('data-i18n-placeholder-zh', element.type === 'search' ? '搜索本网站' : en);
    });
    if (!doc.querySelector('link[rel="icon"]')) {
      const icon = doc.createElement('link'); icon.rel = 'icon'; icon.href = '/Fig/TherMAX-IC%20Lab.png'; doc.head.append(icon);
    }
  }
  const rendered = new Map();
  for (const name of fs.readdirSync(path.join(ROOT, 'templates')).filter(name => name.endsWith('.html') && name !== 'profile.html')) {
    let source = fs.readFileSync(path.join(ROOT, 'templates', name), 'utf8');
    source = source.replace('<!-- CMS:NEWS -->', newsMarkup(news)).replace('<!-- CMS:PEOPLE -->', peopleMarkup(people))
      .replace('<!-- CMS:RESEARCH_INDEX -->', researchIndexMarkup(research)).replace('<!-- CMS:RESEARCH_DIRECTIONS -->', researchMarkup(research));
    const dom = new JSDOM(source);
    applyBindings(dom.window.document);
    setActiveNavigation(dom.window.document, name);
    const slug = path.basename(name, '.html');
    const title = dom.window.document.querySelector('title');
    title.setAttribute('data-i18n-en', title.textContent);
    title.setAttribute('data-i18n-zh', slug === 'index' ? 'TherMAX-IC | 北京大学' : ({about:'实验室介绍',research:'研究方向',facilities:'设备平台',people:'成员',publications:'论文发表',news:'新闻',contact:'联系',search:'搜索'}[slug] || slug) + ' | TherMAX-IC');
    write(name, dom.serialize()); rendered.set(slug, dom.window.document);
  }
  const profileTemplate = fs.readFileSync(path.join(ROOT, 'templates/profile.html'), 'utf8');
  for (const person of people) {
    const dom = new JSDOM(profileTemplate.replace('<!-- CMS:PROFILE -->', profileMarkup(person)));
    const doc = dom.window.document;
    applyBindings(doc);
    doc.title = person.name + ' | TherMAX-IC';
    const title = doc.querySelector('title'); title.setAttribute('data-i18n-en', doc.title); title.setAttribute('data-i18n-zh', (person.nameZh || person.name) + ' | TherMAX-IC');
    doc.querySelectorAll('[src],[href],[action]').forEach(element => {
      for (const attr of ['src', 'href', 'action']) if (element.hasAttribute(attr)) element.setAttribute(attr, publicURL(element.getAttribute(attr)));
    });
    setActiveNavigation(doc, 'people.html');
    write('people/' + person.id + '.html', dom.serialize()); dom.window.close();
  }
  // Old query-based member bookmarks continue to resolve to the current profile.
  write('people/pending-profile.html', '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>成员主页</title></head><body><a href="../people.html">返回成员列表</a><script>const id=new URLSearchParams(location.search).get("member");if(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id||""))location.replace("./"+id+".html");</script></body></html>');
  write('publication-data.js', 'window.publicationData = ' + JSON.stringify(publications.map(publicRecord)) + ';\n');
  write('equipment-data-v2.js', 'window.equipmentLibraryData = ' + JSON.stringify({ ...records.settings, equipment: equipment.map(publicRecord) }) + ';\n');
  const searchPages = [];
  for (const [slug, doc] of rendered) {
    if (slug === 'search') continue;
    const main = doc.querySelector('main');
    const enCopy = main.cloneNode(true), zhCopy = main.cloneNode(true);
    enCopy.querySelectorAll('.lang-only-zh').forEach(el => el.remove()); zhCopy.querySelectorAll('.lang-only-en').forEach(el => el.remove());
    zhCopy.querySelectorAll('[data-i18n-zh]').forEach(el => { el.textContent = el.getAttribute('data-i18n-zh'); });
    const getText = node => node.textContent.replace(/\s+/g, ' ').trim();
    const title = doc.querySelector('title');
    const enText = getText(enCopy), zhText = getText(zhCopy);
    searchPages.push({ title: title.getAttribute('data-i18n-en').split(' | ')[0], titleZh: title.getAttribute('data-i18n-zh').split(' | ')[0], url: slug + '.html', desc: enText.slice(0, 240), descZh: zhText.slice(0, 140), text: enText, textZh: zhText });
  }
  write('search-data.js', 'window.siteSearchData = ' + JSON.stringify({ pages: searchPages, people: people.map(person => ({name:person.name,nameZh:person.nameZh,role:person.role,roleZh:person.roleZh,url:'people/' + person.id + '.html'})) }) + ';\n');
  write('.nojekyll', '');
  write('build-info.json', JSON.stringify({ commit: process.env.GITHUB_SHA || 'local', counts: { people: people.length, publications: publications.length, equipment: equipment.length, news: news.length, research: research.length } }, null, 2));
  if (copyAssets) {
    for (const name of ['images', 'Fig', 'pdfs']) fs.cpSync(path.join(ROOT, name), path.join(absoluteOut, name), { recursive: true });
    for (const name of ['style.css', 'cms-language.js', 'back-to-top.js', 'about.js', 'publications.js', 'facilities.js']) fs.copyFileSync(path.join(ROOT, name), path.join(absoluteOut, name));
    if (fs.existsSync(path.join(ROOT, 'CNAME'))) fs.copyFileSync(path.join(ROOT, 'CNAME'), path.join(absoluteOut, 'CNAME'));
    fs.cpSync(path.join(ROOT, 'admin'), path.join(absoluteOut, 'admin'), { recursive: true });
  }
  for (const doc of rendered.values()) doc.defaultView.close();
  return { outDir: absoluteOut, counts: { people: people.length, publications: publications.length, equipment: equipment.length, news: news.length, research: research.length } };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(buildSite(), null, 2));
}
