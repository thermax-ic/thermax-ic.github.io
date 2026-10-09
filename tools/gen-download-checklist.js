// Generate an interactive download-checklist HTML page for manually fetching
// paywalled PDFs through the PKU VPN browser.
// Usage: node tools/gen-download-checklist.js
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
global.window = {};
require(path.join(ROOT, "publication-data.js"));
const data = global.window.publicationData;

function titleOf(citation) {
  const firstBreak = citation.indexOf(". ");
  const remainder = citation.slice(firstBreak + 2);
  const secondBreak = remainder.indexOf(". ");
  return secondBreak >= 0 ? remainder.slice(0, secondBreak).trim() : remainder.trim();
}
function firstAuthorOf(citation) {
  return citation.split(",")[0].trim();
}

// Resolve the best "click to download" URL + journal code per entry
function resolve(item) {
  const { host, link, doi } = item;
  // AIP entries whose stored link is a bare doi.org redirect — map to journal code
  const AIP_BY_DOI = {
    "10.1063/5.0304005": "apr",   // Applied Physics Reviews (no /aip/ prefix)
    "10.1063/5.0294611": "aip/apl",
    "10.1063/5.0297824": "aip/jap"
  };
  if (host === "doi.org" && AIP_BY_DOI[doi.toLowerCase()]) {
    return { url: `https://pubs.aip.org/${AIP_BY_DOI[doi.toLowerCase()]}/article-pdf/doi/${doi}`, kind: "direct" };
  }
  if (host === "doi.org" && doi.toLowerCase().startsWith("10.1002/")) {
    return { url: `https://onlinelibrary.wiley.com/doi/pdf/${doi}`, kind: "direct" };
  }
  if (host === "pubs.acs.org") return { url: `https://pubs.acs.org/doi/pdf/${doi}`, kind: "direct" };
  if (host === "pubs.aip.org") {
    const code = (new URL(link).pathname.match(/^\/(aip\/)?([a-z]+)\//) || [])[2] || "apl";
    const prefix = link.startsWith("https://pubs.aip.org/aip/") ? "aip/" : "";
    return { url: `https://pubs.aip.org/${prefix}${code}/article-pdf/doi/${doi}`, kind: "direct" };
  }
  if (host === "ieeexplore.ieee.org") {
    const arnum = link.match(/document\/(\d+)/)[1];
    return { url: `https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=${arnum}&tag=1`, kind: "direct" };
  }
  if (host === "onlinelibrary.wiley.com" || host === "advanced.onlinelibrary.wiley.com")
    return { url: `https://onlinelibrary.wiley.com/doi/pdf/${doi}`, kind: "direct" };
  if (host === "link.springer.com") return { url: `https://link.springer.com/content/pdf/${doi}.pdf`, kind: "direct" };
  if (host === "iopscience.iop.org") return { url: `https://iopscience.iop.org/article/${doi}/pdf`, kind: "direct" };
  if (host === "pubs.rsc.org") {
    const m = link.match(/\/articlelanding\/(.+)/);
    return { url: m ? `https://pubs.rsc.org/en/content/articlepdf/${m[1]}.pdf` : link, kind: "direct" };
  }
  if (host === "www.sciencedirect.com" || host === "linkinghub.elsevier.com") {
    const m = link.match(/pii\/([A-Za-z0-9]+)/);
    return { url: m ? `https://www.sciencedirect.com/science/article/pii/${m[1]}` : link, kind: "landing" };
  }
  if (host === "asmedigitalcollection.asme.org" || host === "ihtcdigitallibrary.com")
    return { url: link, kind: "landing" };
  return null;
}

const items = [];
let n = 0;
for (const e of data) {
  n++;
  if (e.pdf || !e.link) continue;
  if (!/^https?:\/\//.test(e.link)) continue;
  if (e.link.includes("eecs.pku.edu.cn")) continue; // IEDM 2026, no PDF exists yet
  const host = new URL(e.link).host;
  const r = resolve({ host, link: e.link, doi: e.doi });
  if (!r) continue;
  const short = titleOf(e.citation).split(" ").slice(0, 4).join("-").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
  const firstAuthor = firstAuthorOf(e.citation).toLowerCase().replace(/[^a-z]/g, "");
  items.push({
    id: n,
    year: e.year,
    author: firstAuthorOf(e.citation),
    title: titleOf(e.citation),
    host,
    url: r.url,
    kind: r.kind,
    file: `${e.year}-${firstAuthor}-${short}.pdf`
  });
}

const groups = {};
for (const it of items) {
  const g = it.host.replace("www.", "").replace("advanced.onlinelibrary.wiley.com", "onlinelibrary.wiley.com");
  (groups[g] = groups[g] || []).push(it);
}

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const groupNames = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);

const rows = groupNames.map(g => {
  const list = groups[g].map(it => `
    <li data-id="${it.id}">
      <label>
        <input type="checkbox" data-id="${it.id}">
        <span class="t">[${it.year}] ${esc(it.title)}</span>
        <span class="m">${esc(it.author)} · 目标文件名: <code>${it.file}</code>${it.kind === "landing" ? ' · <em>打开后点 "Download PDF"/PDF 按钮</em>' : ""}</span>
      </label>
      <a class="dl" href="${esc(it.url)}" target="_blank" rel="noopener">下载 ↗</a>
    </li>`).join("");
  return `<section class="group"><h2>${esc(g)} <span>${groups[g].length} 篇</span></h2><ul>${list}</ul></section>`;
}).join("\n");

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TherMAX-IC PDF 下载清单</title>
<style>
  body { font-family: "Segoe UI", "Microsoft YaHei", sans-serif; max-width: 980px; margin: 0 auto; padding: 24px 16px; background: #f7f6f2; color: #222; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .prog { position: sticky; top: 0; background: #fff; border: 1px solid #d8d8d8; border-radius: 8px; padding: 12px 16px; margin: 12px 0 20px; z-index: 10; }
  .prog b { font-size: 18px; }
  .bar { height: 8px; background: #eee; border-radius: 4px; margin-top: 8px; overflow: hidden; }
  .bar i { display: block; height: 100%; background: #8c1515; width: 0; transition: width .2s; }
  .note { background: #fff8e6; border: 1px solid #e8d9a0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 14px; line-height: 1.7; }
  .group h2 { font-size: 16px; margin: 22px 0 8px; color: #8c1515; }
  .group h2 span { color: #6b6b6b; font-weight: normal; font-size: 13px; }
  ul { list-style: none; margin: 0; padding: 0; }
  li { display: flex; align-items: flex-start; gap: 10px; background: #fff; border: 1px solid #e2e0da; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; }
  li.done { opacity: .45; }
  li.done .t { text-decoration: line-through; }
  label { flex: 1; display: flex; gap: 10px; cursor: pointer; }
  input[type=checkbox] { margin-top: 3px; width: 16px; height: 16px; flex-shrink: 0; }
  .t { font-size: 14px; line-height: 1.5; }
  .m { display: block; font-size: 12px; color: #6b6b6b; margin-top: 3px; }
  code { background: #f0efeb; padding: 1px 5px; border-radius: 4px; font-size: 11px; }
  .dl { flex-shrink: 0; align-self: center; background: #8c1515; color: #fff; text-decoration: none; padding: 6px 14px; border-radius: 6px; font-size: 13px; }
  .dl:hover { background: #5f0f0f; }
</style>
</head>
<body>
<h1>TherMAX-IC 论文 PDF 下载清单</h1>
<div class="prog"><b id="count">0 / ${items.length}</b> 已完成 <button onclick="resetAll()" style="float:right;font-size:12px;">重置记录</button><div class="bar"><i id="bar"></i></div></div>
<div class="note">
<b>使用方法：</b>① 连接北大 VPN（vpn.pku.edu.cn）；② 逐条点击右侧"下载"按钮，浏览器会自动下载 PDF（IEEE 链接会打开页面再点一次确认）；③ 全部下完后，把下载的 PDF 全部放入项目根目录的 <code>incoming-pdfs</code> 文件夹，告诉我即可——我会自动核对、改名、存入网站并更新 Publications 页面。勾选框会自动记录进度（存在本机浏览器）。<br>
<b>注意：</b>个别链接（ScienceDirect / ASME / IHTC）打开的是文章页，请点击页面上的 Download PDF 按钮。如果某个链接报错（如 AIP 跳转异常），先跳过，最后把文件名告诉我，我单独处理。
</div>
${rows}
<script>
const KEY = "trail-pdf-checklist";
const state = JSON.parse(localStorage.getItem(KEY) || "{}");
const boxes = document.querySelectorAll("input[type=checkbox]");
function save() {
  const s = {};
  boxes.forEach(b => { if (b.checked) s[b.dataset.id] = 1; });
  localStorage.setItem(KEY, JSON.stringify(s));
  const done = Object.keys(s).length;
  document.getElementById("count").textContent = done + " / ${items.length}";
  document.getElementById("bar").style.width = (done / ${items.length} * 100) + "%";
}
boxes.forEach(b => {
  if (state[b.dataset.id]) { b.checked = true; b.closest("li").classList.add("done"); }
  b.addEventListener("change", () => { b.closest("li").classList.toggle("done", b.checked); save(); });
});
function resetAll() { if (confirm("清除全部勾选记录？")) { localStorage.removeItem(KEY); location.reload(); } }
save();
</script>
</body>
</html>`;

const out = path.join(__dirname, "pdf-download-checklist.html");
fs.writeFileSync(out, html);
console.log("checklist written:", out, "items:", items.length);
console.log("groups:", groupNames.map(g => `${g}=${groups[g].length}`).join(", "));
