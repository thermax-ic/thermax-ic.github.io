// Keep the existing content paths and values; organize only the editing UI.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pad = number => String(number).padStart(3,'0');
const t = (number,label) => ['text_'+pad(number),label];
const pairs = (...items) => items.map(([number,label])=>t(number,label));
const section = (key,label,items) => ({key,label,items});
const region = (name,label,sections,images=[],links=[],description='') => ({name,label,sections,images,links,description});

export const EDITOR_PAGES = [
  {name:'index',label:'首页',path:'content/pages/index.json',regions:[
    region('hero','01 顶部首屏',[section('section_01','标题与介绍',pairs([1,'顶部身份说明'],[2,'主标题'],[3,'简短介绍'],[4,'主按钮文字'],[5,'次按钮文字']))],[['hero_background','首屏背景图']],[],'官网打开后首先看到的大图、主标题、介绍与两个按钮。'),
    region('intro','02 实验室简介',[section('section_02','标题与正文',pairs([6,'区块标签'],[7,'区块标题'],[9,'正文第一段'],[10,'正文第二段'],[8,'配图下方文字'],[11,'了解研究按钮文字']))],[['image_01','实验室简介配图']],[],'首屏下方的“关于实验室”区域。'),
    region('focus','03 研究重点',[section('section_03','标题与方向卡片',pairs([12,'区块标签'],[13,'区块标题'],[14,'简短说明'],[16,'卡片1标题'],[17,'卡片1介绍'],[20,'卡片2标题'],[21,'卡片2介绍'],[24,'卡片3标题'],[25,'卡片3介绍']))],[['image_02','卡片1配图'],['image_03','卡片2配图'],['image_04','卡片3配图']],[],'首页的三张研究重点卡片；完整研究方向条目在“研究方向管理”中维护。'),
    region('platform','04 设备平台',[section('section_05','标题与介绍',pairs([49,'区块引导语'],[50,'区块标题'],[51,'平台介绍'],[52,'能力标签1'],[53,'能力标签2'],[54,'能力标签3'],[55,'能力标签4'],[56,'查看设备按钮文字']))],[['platform_background','设备平台背景图']],[],'研究重点下方的设备平台介绍区域。'),
    region('team','05 团队与招生',[section('section_06','标题与介绍',pairs([57,'区块引导语'],[58,'区块标题'],[59,'团队与招生介绍'],[60,'成员按钮文字'],[61,'合影下方文字']))],[['image_05','实验室双语标识'],['image_06','团队合影']],[],'首页的团队介绍、招生文案与团队合影。'),
    region('contact','06 联系入口',[section('section_07','标题与按钮',pairs([62,'区块标签'],[63,'合作邀请标题'],[64,'邮箱显示文字'],[66,'联系页面按钮文字']))],[],[['link_09','联系邮箱链接']],'首页底部的合作邀请与联系入口；修改邮箱时同时核对显示文字和链接。'),
    region('credits','07 图片署名与来源',[section('section_04','署名与说明',pairs([27,'折叠栏标题'],[28,'图片用途说明'],[29,'图片1名称'],[30,'图片1作者署名'],[31,'图片1来源按钮文字'],[33,'图片1许可名称'],[34,'图片2名称'],[35,'图片2作者署名'],[36,'图片2来源按钮文字'],[38,'图片2许可名称'],[39,'图片3名称'],[40,'图片3作者署名'],[41,'图片3来源按钮文字'],[43,'图片3许可名称'],[44,'图片4名称'],[45,'图片4作者署名'],[46,'图片4来源按钮文字'],[48,'图片4许可按钮文字']))],[],[['link_01','图片1来源网页'],['link_02','图片1许可网页'],['link_03','图片2来源网页'],['link_04','图片2许可网页'],['link_05','图片3来源网页'],['link_06','图片3许可网页'],['link_07','图片4来源网页'],['link_08','图片4复用政策网页']],'研究重点下方“图片署名与来源”折叠栏内的署名、来源及许可说明。')
  ]},
  {name:'about',label:'实验室介绍',path:'content/pages/about.json',regions:[
    region('hero','01 顶部介绍',[section('section_01','标题与介绍',pairs([1,'区块引导语'],[2,'主标题'],[3,'实验室简介'],[4,'研究关键词1'],[5,'研究关键词2'],[6,'研究关键词3'],[7,'研究关键词4'],[69,'配图角标文字']))],[['image_01','顶部芯片结构配图']],[],'实验室介绍页顶部的大标题、简介、研究关键词与芯片结构图。'),
    region('challenge','02 热管理挑战',[section('section_02','标题与正文',pairs([8,'区块标题'],[9,'正文第一段'],[10,'正文第二段'],[11,'图示下方说明']))],[],[],'“热管理正在成为集成技术的核心约束”区域；公式与箭头保持原有显示。'),
    region('system','03 研究体系',[section('section_03','流程与研究卡片',pairs([12,'区块标题'],[13,'上方流程节点1名称'],[14,'上方流程节点2名称'],[15,'上方流程节点3名称'],[16,'上方流程节点4名称'],[17,'下方卡片1标题'],[18,'下方卡片1介绍'],[19,'下方卡片2标题'],[20,'下方卡片2介绍'],[21,'下方卡片3标题'],[22,'下方卡片3介绍'],[23,'下方卡片4标题'],[24,'下方卡片4介绍']))],[],[],'“从材料到3D集成的研究体系”区域；上方是四个流程节点，下方是四张介绍卡片。'),
    region('pathway','04 技术路径',[section('section_04','步骤名称与说明',pairs([25,'区块标题'],[26,'步骤1名称'],[27,'步骤1说明'],[28,'步骤2名称'],[29,'步骤2说明'],[30,'步骤3名称'],[31,'步骤3说明'],[32,'步骤4名称'],[33,'步骤4说明'],[34,'步骤5名称'],[35,'步骤5说明']))],[],[],'“实验室的技术路径”区域，按页面从左至右填写五个步骤。'),
    region('stack','05 三维堆叠问题',[section('section_05','图示与问题说明',pairs([36,'区块标题'],[37,'区块介绍'],[38,'左图第1层名称'],[39,'左图第2层名称'],[40,'左图第3层名称'],[41,'左图第4层名称'],[42,'左图第5层名称'],[43,'左图第6层名称'],[44,'左图第7层名称'],[45,'左图下方说明'],[46,'右侧问题1标题'],[47,'右侧问题1说明'],[48,'右侧问题2标题'],[49,'右侧问题2说明'],[106,'右侧问题3标题'],[50,'右侧问题3说明'],[51,'右侧问题4标题'],[52,'右侧问题4说明'],[53,'右侧问题5标题'],[54,'右侧问题5说明']))],[],[],'“3D-IC热管理的关键问题”区域，区分左侧堆叠图的层名称与右侧问题说明。'),
    region('platform','06 表征平台与指标',[section('section_06','标题与能力指标',pairs([55,'区块标题'],[56,'平台介绍'],[110,'设备数量'],[57,'设备数量说明'],[111,'覆盖尺度'],[58,'覆盖尺度说明'],[59,'研究层级'],[60,'研究层级说明'],[61,'研究方法'],[62,'研究方法说明']))],[['image_02','表征平台全景配图']],[],'先进热表征平台介绍、全景配图和四项能力指标。'),
    region('closing','07 合作入口',[section('section_07','标题与按钮',pairs([63,'区块标题'],[64,'合作邀请介绍'],[65,'研究方向按钮文字'],[66,'设备平台按钮文字'],[67,'合作联系按钮文字']))],[],[],'实验室介绍页最下方的合作邀请与三个跳转按钮。')
  ]},
  {name:'research-page',label:'研究方向页面介绍',path:'content/pages/research.json',regions:[
    region('intro','01 页面标题与引言',[section('section_01','标题与引言',pairs([1,'页面标题'],[2,'页面引言']))],[],[],'方向条目的新增、正文、配图和排序在“研究方向管理”中维护。'),
    region('vision','02 研究愿景',[section('section_02','研究愿景与目录',pairs([3,'研究愿景标题'],[4,'正文第一段'],[5,'正文第二段'],[6,'方向目录标题']))])
  ]},
  {name:'facilities',label:'设备平台页面介绍',path:'content/pages/facilities.json',regions:[
    region('intro','01 页面标题与简介',[section('section_01','标题与简介',pairs([5,'页面标题'],[1,'平台简介']))],[],[],'设备平台页顶部的标题和平台介绍；具体设备在“设备管理”中维护。'),
    region('catalog','02 清单与能力矩阵',[section('section_02','设备清单',pairs([2,'设备清单标题'])),section('section_03','能力矩阵',pairs([3,'能力矩阵标题'],[4,'矩阵使用说明']))],[],[],'编辑清单与矩阵的标题和说明；测量能力状态在“设备分类与能力矩阵”中维护。')
  ]},
  {name:'people-page',label:'成员页面介绍',path:'content/pages/people.json',regions:[region('intro','页面标题',[section('section_01','页面标题',pairs([1,'页面标题']))],[],[],'成员资料、照片与个人主页在“成员管理”中维护。')]},
  {name:'publications-page',label:'论文页面介绍',path:'content/pages/publications.json',regions:[region('intro','标题与简介',[section('section_01','标题与简介',pairs([3,'页面标题'],[1,'页面简介'])),section('section_02','列表标题',pairs([2,'论文列表标题']))],[],[],'论文引用、年份、链接与 PDF 在“论文管理”中维护。')]},
  {name:'news-page',label:'新闻页面介绍',path:'content/pages/news.json',regions:[region('intro','标题与简介',[section('section_01','标题与简介',pairs([1,'页面标题'],[2,'页面简介']))],[],[],'新闻条目的新增、正文和配图在“新闻管理”中维护。')]},
  {name:'contact',label:'联系页面',path:'content/pages/contact.json',regions:[
    region('intro','01 页面标题与引言',[section('section_01','标题与引言',pairs([1,'页面标题'],[2,'页面引言']))]),
    region('details','02 实验室联系方式',[section('section_02','联系资料',pairs([3,'联系卡片标题'],[4,'机构字段标签'],[5,'机构名称'],[6,'学院字段标签'],[7,'学院名称'],[8,'地址字段标签'],[9,'联系地址'],[10,'邮箱字段标签'],[11,'邮箱显示文字']))],[],[['link_01','联系邮箱链接']],'页面主栏中的实验室联系资料；修改邮箱时同时核对显示文字和链接。'),
    region('requests','03 合作与测试需求',[section('section_03','标题与需求清单',pairs([12,'区块标题'],[13,'来信要求说明'],[14,'需求清单第1项'],[15,'需求清单第2项'],[16,'需求清单第3项'],[17,'需求清单第4项'],[18,'需求清单第5项']))]),
    region('students','04 研究领域与招生',[section('section_04','侧栏介绍',pairs([19,'研究领域标题'],[20,'研究领域第1项'],[21,'研究领域第2项'],[22,'研究领域第3项'],[23,'研究领域第4项'],[24,'研究领域第5项'],[25,'招生栏目标题'],[26,'招生介绍']))],[],[],'联系页面右侧的研究领域和学生加入说明。'),
    region('location','05 位置与来访指南',[section('section_05','地址与来访信息',pairs([27,'区块标题'],[28,'地址字段标签'],[29,'来访地址'],[30,'交通字段标签'],[31,'地铁交通说明'],[32,'入校字段标签'],[33,'入校方式说明'],[34,'高德地图按钮文字'],[35,'Google地图按钮文字']))],[],[['link_02','高德地图链接'],['link_03','Google地图链接']])
  ]},
  {name:'search',label:'搜索页面介绍',path:'content/pages/search.json',regions:[region('intro','标题与提示',[section('section_01','页面标题与说明',pairs([1,'页面标题'],[2,'页面使用说明'])),section('section_02','搜索按钮',pairs([3,'搜索按钮文字'])),section('section_03','空状态提示',pairs([4,'未输入关键词时的提示']))])]}
];
const SITE_REGIONS = [
  region('header','01 页头名称与Logo',[section('section_02','大学栏',pairs([2,'大学名称'])),section('section_03','实验室名称',pairs([3,'实验室全称'],[4,'研究主题副标题'],[5,'课题组署名']))],[['image_01','页头实验室Logo']],[],'所有页面顶部共用的大学名称、实验室名称、副标题和 Logo。'),
  region('navigation','02 导航与搜索',[section('section_03','导航菜单与搜索',pairs([6,'首页菜单文字'],[7,'介绍页菜单文字'],[8,'研究方向菜单文字'],[9,'设备平台菜单文字'],[10,'成员菜单文字'],[11,'论文菜单文字'],[12,'新闻菜单文字'],[13,'联系菜单文字'],[14,'搜索输入框标签'],[15,'搜索按钮文字']))]),
  region('footer','03 页脚实验室信息',[section('section_04','实验室信息与版权',pairs([16,'页脚实验室全称'],[17,'大学名称'],[18,'学院名称'],[25,'版权说明']))]),
  region('footer-contact','04 页脚地址与联系',[section('section_04','地址与联系',pairs([19,'地址栏目标题'],[20,'大楼名称'],[21,'详细地址'],[22,'联系栏目标题'],[23,'邮箱显示文字'],[24,'学院网站按钮文字']))],[],[['link_01','页脚联系邮箱链接'],['link_02','学院网站链接']]),
  region('accessibility','05 页面辅助提示',[section('section_01','阅读辅助',pairs([1,'跳转主要内容的文字']))],[],[],'键盘或阅读辅助工具使用的“跳转主要内容”链接文字。')
];
const bilingualType = label => /介绍|正文|说明|引言|引导语|地址$|指南|需求清单|问题.*说明/.test(label) ? 'bilingual-copy' : 'bilingual-title';
const sourceFields = entry => new Map(entry.fields.map(field=>[field.name,new Map((field.fields||[]).map(child=>[child.name,child]))]));

function regionalEditor(source,pageName,pageLabel,spec) {
  const sourceMap = sourceFields(source);
  const fields = spec.sections.map(group=>({name:group.key,label:group.label,type:'object',fields:group.items.map(([name,label])=>{
    if(!sourceMap.get(group.key)?.has(name)) throw new Error('Unknown editor field: '+pageName+':'+group.key+'.'+name);
    return {name,label,component:bilingualType(label)};
  })}));
  if(spec.images.length) fields.push({name:'images',label:'本区域的配图',type:'object',fields:spec.images.map(([name,label])=>{
    const original = sourceMap.get('images')?.get(name);
    if(!original) throw new Error('Unknown image: '+pageName+':'+name);
    return {...original,label,description:'选择或上传图片。图片内容说明供阅读辅助工具使用，不是页面下方的可见图注。',fields:original.fields.map(field=>({...field,label:{src:'图片文件',alt_zh:'图片内容说明（中文）',alt_en:'图片内容说明（英文）'}[field.name]||field.label}))};
  })});
  if(spec.links.length) fields.push({name:'links',label:'本区域的相关链接',type:'object',fields:spec.links.map(([name,label])=>{
    const original = sourceMap.get('links')?.get(name);
    if(!original) throw new Error('Unknown link: '+pageName+':'+name);
    return {...original,label};
  })});
  return {name:pageName+'-'+spec.name,label:spec.label,type:'file',path:source.path,format:'json',description:spec.description||pageLabel+'中“'+spec.label.replace(/^\d+ /,'')+'”区域的内容。',operations:{create:false,delete:false,rename:false},commit:{templates:{update:'content: update '+pageLabel+' / '+spec.label}},fields};
}

export function organizeEditors(config) {
  const allEntries = walkContent(config.content);
  const sourceForPath = filePath => {
    const sources = allEntries.filter(entry=>entry.type==='file'&&entry.path===filePath);
    if(!sources.length)throw new Error('Missing CMS page path: '+filePath);
    const groups = new Map();
    for(const source of sources)for(const field of source.fields) {
      if(!groups.has(field.name))groups.set(field.name,{...field,fields:[]});
      const group = groups.get(field.name);
      for(const child of field.fields||[])if(!group.fields.some(existing=>existing.name===child.name))group.fields.push(child);
    }
    return {path:filePath,fields:[...groups.values()]};
  };
  const pages = EDITOR_PAGES.map(page=>{
    const source = sourceForPath(page.path);
    const items = page.regions.map(spec=>regionalEditor(source,page.name,page.label,spec));
    return items.length === 1 ? {...items[0],name:page.name,label:page.label} : {name:page.name,label:page.label,type:'group',description:'按页面从上到下选择要修改的区域。',items};
  });
  const site = sourceForPath('content/site.json');
  const remaining = config.content.filter(item=>!EDITOR_PAGES.some(page=>page.name===item.name)&&!['site','page-introductions'].includes(item.name));
  return {...config,components:{...config.components,
    'bilingual-title':{type:'object',fields:[{name:'zh',label:'中文',type:'string'},{name:'en',label:'英文',type:'string'}]},
    'bilingual-copy':{type:'object',fields:[{name:'zh',label:'中文',type:'text'},{name:'en',label:'英文',type:'text'}]}
  },content:[
    {name:'page-introductions',label:'页面介绍',type:'group',description:'先选页面，再按页面区域找到对应的标题、正文、配图和链接。',items:pages},
    {name:'site',label:'公共页头与页脚',type:'group',items:SITE_REGIONS.map(spec=>regionalEditor(site,'site','公共页头与页脚',spec))},
    ...remaining
  ]};
}

export function walkContent(entries) {
  return entries.flatMap(entry=>entry.type==='group'?[entry,...walkContent(entry.items)]:[entry]);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(!process.argv.includes('--write')) throw new Error('Use --write to apply the regional editor configuration.');
  const configPath = path.join(root,'.pages.yml');
  const result = organizeEditors(YAML.parse(fs.readFileSync(configPath,'utf8')));
  fs.writeFileSync(configPath,'# Pages CMS — 页面介绍按页面区域维护；内容与绑定路径保持不变。\n'+YAML.stringify(result,{lineWidth:0,aliasDuplicateObjects:false}));
  console.log(JSON.stringify({regionalForms:walkContent(result.content).filter(entry=>entry.type==='file').length,pageGroups:EDITOR_PAGES.length}));
}
