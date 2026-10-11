// One-time conversion of existing research content into editable CMS records.
// This migrates current copy and images without adding research topics.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import YAML from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'content/research');
if (fs.existsSync(directory)) throw new Error('Research collection already exists; do not overwrite edited content.');
const pagePath = path.join(root, 'content/pages/research.json');
const templatePath = path.join(root, 'templates/research.html');
const page = JSON.parse(fs.readFileSync(pagePath, 'utf8'));
const dom = new JSDOM(fs.readFileSync(templatePath, 'utf8'));
const doc = dom.window.document;
const resolve = element => {
  const binding = element.querySelector('[data-cms-text]')?.getAttribute('data-cms-text');
  if (!binding?.startsWith('research:')) throw new Error('Missing research text binding');
  return binding.split(':')[1].split('.').reduce((value, key) => value[key], page);
};
const escapeHTML = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const blocks = [...doc.querySelectorAll('.research-block')];
const records = blocks.map((block, index) => {
  const title = resolve(block.querySelector('h3'));
  const body = [...block.querySelectorAll('.research-text > p')].map(resolve);
  const caption = resolve(block.querySelector('.research-image'));
  const image = block.querySelector('.research-image').getAttribute('style').match(/url\(['"]?([^'"\)]+)['"]?\)/)?.[1] || '';
  return {
    filename: block.id + '.json',
    data: {
      title: title.en, titleZh: title.zh,
      body: body.map(item => '<p>' + escapeHTML(item.en) + '</p>').join(''),
      bodyZh: body.map(item => '<p>' + escapeHTML(item.zh) + '</p>').join(''),
      points: [...block.querySelectorAll('.research-text li')].map(resolve),
      image, imageAlt: caption.en, imageAltZh: caption.zh,
      caption: caption.en, captionZh: caption.zh, imageFit: 'cover',
      order: index + 1, published: true
    }
  };
});
if (!records.length) throw new Error('No existing research directions found');

blocks[0].before(doc.createComment(' CMS:RESEARCH_DIRECTIONS '));
blocks.forEach(block => block.remove());
doc.querySelector('.research-index ol').innerHTML = '<!-- CMS:RESEARCH_INDEX -->';
doc.querySelectorAll('.main-nav a').forEach(anchor => anchor.classList.toggle('active', anchor.getAttribute('href') === 'research.html'));
for (const key of ['section_03','section_04','section_05']) delete page[key];
for (const key of ['text_007','text_008','text_009']) delete page.section_02[key];

const configPath = path.join(root, '.pages.yml');
const config = YAML.parse(fs.readFileSync(configPath, 'utf8'));
const index = config.content.findIndex(item => item.path === 'content/pages/research.json');
if (index < 0) throw new Error('Research page CMS configuration is missing');
const copy = (name, label) => ({name,label,component:'bilingual'});
config.content[index] = {
  name:'research-page', label:'研究方向页面介绍', type:'file', path:'content/pages/research.json', format:'json',
  fields:[
    {name:'section_01',label:'页面标题与引言',type:'object',fields:[copy('text_001','页面标题'),copy('text_002','页面引言')]},
    {name:'section_02',label:'研究愿景与目录标题',type:'object',fields:[copy('text_003','研究愿景标题'),copy('text_004','研究愿景第一段'),copy('text_005','研究愿景第二段'),copy('text_006','方向目录标题')]}
  ]
};
const field = (name,label,type='string',extra={}) => ({name,label,type,...extra});
const rich = (name,label) => field(name,label,'rich-text',{options:{format:'html',switcher:false,media:'images',path:'images/research',rename:'safe'}});
const research = {
  name:'research',label:'研究方向管理',type:'collection',path:'content/research',format:'json',
  filename:{template:'direction-{year}-{month}-{day}-{hour}-{minute}-{second}.json',field:false},
  operations:{create:true,delete:true,rename:false},
  view:{primary:'titleZh',fields:['titleZh','title','order','published'],sort:['order','titleZh'],search:['titleZh','title','bodyZh','body'],default:{sort:'order',order:'asc'}},
  fields:[
    field('titleZh','研究方向名称（中文）','string',{required:true}),field('title','研究方向名称（英文）'),
    rich('bodyZh','研究方向介绍（中文）'),rich('body','研究方向介绍（英文）'),
    field('points','研究要点（可新增、删除或拖动排序）','object',{list:{collapsible:{collapsed:true,summary:'{zh}'}},fields:[field('zh','中文要点','text'),field('en','英文要点','text')]}),
    field('image','研究方向配图','image',{options:{media:'images',path:'images/research',rename:'safe'},description:'选择现有配图或上传新图片；配图可以留空。'}),
    field('imageAltZh','图片内容说明（中文）'),field('imageAlt','图片内容说明（英文）'),
    field('captionZh','图片下方说明（中文）','text'),field('caption','图片下方说明（英文）','text'),
    field('imageFit','配图显示方式','select',{default:'contain',options:{values:[{name:'contain',label:'完整显示（适合原理图）'},{name:'cover',label:'填满区域（可能裁切）'}]}}),
    field('order','排列顺序','number',{default:100,description:'数字越小越靠前；页面目录与方向编号自动同步。'}),
    field('published','在网站显示','boolean',{default:true,description:'关闭后保存为隐藏条目，内容仍保留在后台。'})
  ]
};
config.content.splice(index + 1,0,research);

fs.mkdirSync(directory,{recursive:true});
for (const record of records) fs.writeFileSync(path.join(directory,record.filename),JSON.stringify(record.data,null,2)+'\n');
fs.writeFileSync(pagePath,JSON.stringify(page,null,2)+'\n');
fs.writeFileSync(templatePath,dom.serialize().replace(/[ \t]+$/gm,'')+'\n');
fs.writeFileSync(configPath,'# Pages CMS — 编辑入口：https://app.pagescms.org/thermax-ic/thermax-ic.github.io\n'+YAML.stringify(config,{lineWidth:0,aliasDuplicateObjects:false}));
dom.window.close();
console.log(JSON.stringify({migratedResearchDirections:records.length,newResearchDirections:0}));
