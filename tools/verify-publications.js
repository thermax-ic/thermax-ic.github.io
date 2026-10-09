// One-by-one verification of every publication DOI against Crossref.
// Usage: node tools/verify-publications.js
const fs = require("fs");
const path = require("path");

global.window = {};
require(path.join(__dirname, "..", "publication-data.js"));
const data = global.window.publicationData;

function titleFromCitation(citation) {
  const firstBreak = citation.indexOf(". ");
  const remainder = citation.slice(firstBreak + 2);
  const secondBreak = remainder.indexOf(". ");
  let title = (secondBreak >= 0 ? remainder.slice(0, secondBreak) : remainder).trim();
  return title;
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

async function verify(entry) {
  const url = "https://api.crossref.org/works/" + encodeURIComponent(entry.doi);
  try {
    const res = await fetch(url, { headers: { "User-Agent": "trail-lab-site-check/1.0 (mailto:zhe.cheng@pku.edu.cn)" } });
    if (!res.ok) return { status: "HTTP_" + res.status };
    const msg = (await res.json()).message;
    const crTitle = Array.isArray(msg.title) ? msg.title[0] : msg.title || "";
    const expected = normalize(titleFromCitation(entry.citation));
    const actual = normalize(crTitle);
    // Compare word overlap: fraction of expected words present in actual
    const expWords = expected.split(" ").filter(w => w.length > 2);
    const hits = expWords.filter(w => actual.includes(w)).length;
    const ratio = expWords.length ? hits / expWords.length : 0;
    const year = (msg.issued && msg.issued["date-parts"] && msg.issued["date-parts"][0] && msg.issued["date-parts"][0][0]) || null;
    return { status: ratio >= 0.7 ? "MATCH" : "MISMATCH", ratio: ratio.toFixed(2), crTitle, crYear: year, entryYear: entry.year };
  } catch (e) {
    return { status: "ERROR", error: String(e).slice(0, 120) };
  }
}

(async () => {
  const results = [];
  let i = 0;
  for (const entry of data) {
    i++;
    if (!entry.doi) { results.push({ i, year: entry.year, doi: "", status: "NO_DOI" }); continue; }
    const r = await verify(entry);
    results.push({ i, year: entry.year, doi: entry.doi, ...r });
    await new Promise(r2 => setTimeout(r2, 150)); // be polite to Crossref
  }
  const bad = results.filter(r => r.status !== "MATCH");
  console.log(`Total: ${results.length}, MATCH: ${results.filter(r => r.status === "MATCH").length}, problems: ${bad.length}`);
  for (const b of bad) console.log(JSON.stringify(b));
  fs.writeFileSync(path.join(__dirname, "verify-publications-result.json"), JSON.stringify(results, null, 2));
})();
