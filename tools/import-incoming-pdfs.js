// Import downloaded PDFs from incoming-pdfs/ into pdfs/ and wire them into
// publication-data.js. Matches are explicit (filename fragment -> DOI).
// Usage: node tools/import-incoming-pdfs.js        (import all matched files)
//        node tools/import-incoming-pdfs.js --dry   (report matches only)
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const INCOMING = path.join(ROOT, "incoming-pdfs");
const PDF_DIR = path.join(ROOT, "pdfs");
const DATA_FILE = path.join(ROOT, "publication-data.js");
const DRY = process.argv.includes("--dry");

// filename fragment (as downloaded) -> publication DOI
const MAP = [
  ["am0c11672", "10.1021/acsami.0c11672"],              // 2020 Cheng ion-cut Ga2O3
  ["am1c05191", "10.1021/acsami.1c05191"],              // 2021 Shi metal/Ga2O3
  ["am1c06212", "10.1021/acsami.1c06212"],              // 2021 Cheng thermal visualization
  ["am3c02507", "10.1021/acsami.3c02507"],              // 2023 Feng review
  ["am3c16905", "10.1021/acsami.3c16905"],              // 2024 Li GaN/SiC AlN
  ["am4c10789", "10.1021/acsami.4c10789"],              // 2024 Xiong Bi2Se3
  ["am5b08578", "10.1021/acsami.5b08578"],              // 2015 Liu UHMWPE
  ["am7b16812", "10.1021/acsami.7b16812"],              // 2018 Cheng CVD diamond membranes
  ["nl8b02837", "10.1021/acs.nanolett.8b02837"],        // 2018 Gaskins ZnO/GaN
  ["S0169433226021811", "10.1016/j.apsusc.2026.167977"],// 2026 Li Si/diamond SAB
  ["S0378775321012544", "10.1016/j.jpowsour.2021.230762"],// 2022 Cheng battery heat
  ["Adv Funct Materials - 2023 - Lee", "10.1002/adfm.202212957"],
  ["Small - 2021 - Cheng", "10.1002/smll.202101693"],
  ["Small - 2023 - Kagawa", "10.1002/smll.202305574"],
  ["AlN-capped", "10.1109/drc55272.2022.9855809"],
  ["Characterization_of_the_Thermal_Conductivity_of_CVD_Diamond", "10.1109/csics.2016.7751032"],
  ["Experimental_considerations_of_CVD_diamond", "10.1109/itherm.2017.7991853"],
  ["First_Demonstration_of_Three-Dimensional", "10.1109/iedm50572.2025.11353753"],
  ["Thermal_Boundary_Resistance_of_Bonded", "10.1109/ltb-3d64053.2024.10774109", "2024-cheng-thermal-boundary-resistance-of-bonded.pdf"],
  ["Thermal_conductivity_measurements_on_suspended", "10.1109/itherm.2017.7992555"],
  ["Thermal_Resistance_of_Interfaces_in_Hybrid", "10.1109/ltb-3d69101.2026.11555535"],
  // batch 2 (2026-10-04)
  ["011431_1_5.0304005", "10.1063/5.0304005"],
  ["030501_1_5.0077039", "10.1063/5.0077039"],
  ["041324_1_5.0185305", "10.1063/5.0185305"],
  ["042201_1_5.0179581", "10.1063/5.0179581"],
  ["044907_1_online", "10.1063/5.0039966"],
  ["062105_1_online", "10.1063/1.5125637"],
  ["063203_1_6.0002693", "10.1116/6.0002693"],
  ["132204_1_5.0294611", "10.1063/5.0294611"],
  ["153502_1_5.0191771", "10.1063/5.0191771"],
  ["221603_1_5.0338819", "10.1063/5.0338819"],
  ["215104_1_5.0297824", "10.1063/5.0297824"],
  ["10312821", "10.1149/ma2021-01331075mtgabs"],
  ["Adv Materials Technologies - 2025 - Moriyama", "10.1002/admt.202500437"],
  ["IHTC_diamond_05192018-final", "10.1615/ihtc16.tpm.022782"]
];

global.window = {};
require(DATA_FILE);
const data = global.window.publicationData;

function titleOf(citation) {
  const firstBreak = citation.indexOf(". ");
  const remainder = citation.slice(firstBreak + 2);
  const secondBreak = remainder.indexOf(". ");
  return secondBreak >= 0 ? remainder.slice(0, secondBreak).trim() : remainder.trim();
}
function targetName(entry) {
  const firstAuthor = entry.citation.split(",")[0].toLowerCase().replace(/[^a-z]/g, "");
  const short = titleOf(entry.citation).split(" ").slice(0, 4).join("-").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
  return `${entry.year}-${firstAuthor}-${short}.pdf`;
}

const incoming = fs.readdirSync(INCOMING).filter(f => f.toLowerCase().endsWith(".pdf"));
let jsText = DRY ? "" : fs.readFileSync(DATA_FILE, "utf8");
const imported = [];
const unmatchedFiles = incoming.slice();

for (const [frag, doi, nameOverride] of MAP) {
  const file = incoming.find(f => f.includes(frag));
  const entry = data.find(e => (e.doi || "").toLowerCase() === doi.toLowerCase());
  if (!entry) { console.log(`NO ENTRY  ${doi}`); continue; }
  if (!file) { console.log(`NO FILE   ${doi}  (${entry.citation.slice(0, 60)}...)`); continue; }
  unmatchedFiles.splice(unmatchedFiles.indexOf(file), 1);
  const name = nameOverride || targetName(entry);
  if (!DRY) {
    fs.copyFileSync(path.join(INCOMING, file), path.join(PDF_DIR, name));
    fs.unlinkSync(path.join(INCOMING, file));
    // update publication-data.js: insert or replace pdf field in this entry's block
    const doiPos = jsText.indexOf(`doi: "${entry.doi}"`);
    if (doiPos < 0) { console.log(`JS EDIT FAIL: doi not found ${doi}`); continue; }
    const endPos = jsText.indexOf("}", doiPos);
    let block = jsText.slice(doiPos, endPos);
    if (/pdf:\s*"[^"]*"/.test(block)) {
      block = block.replace(/pdf:\s*"[^"]*"/, `pdf: "pdfs/${name}"`);
    } else {
      // link is the last field: `link: "..." ` -> add comma + pdf line
      block = block.replace(/(link:\s*"[^"]*")\s*,?\s*$/, `$1,\n    pdf: "pdfs/${name}"`);
    }
    jsText = jsText.slice(0, doiPos) + block + jsText.slice(endPos);
  }
  imported.push({ doi, name, title: titleOf(entry.citation) });
}

if (!DRY) fs.writeFileSync(DATA_FILE, jsText);

console.log(`\nImported ${imported.length} PDFs:`);
for (const i of imported) console.log(`  ${i.name}`);
if (unmatchedFiles.length) {
  console.log(`\nFiles in incoming-pdfs NOT recognized (${unmatchedFiles.length}):`);
  for (const f of unmatchedFiles) console.log(`  ${f}`);
}

// Reload data and report entries still missing a local PDF
delete require.cache[require.resolve(DATA_FILE)];
global.window = {};
require(DATA_FILE);
const data2 = global.window.publicationData;
const missing = data2.filter(e => !e.pdf);
console.log(`\n=== Entries without PDF (${missing.length}/${data2.length}) ===`);
for (const e of missing) {
  console.log(`- [${e.year}] ${titleOf(e.citation).slice(0, 70)}`);
  console.log(`    DOI : ${e.doi || "(none)"}`);
  console.log(`    Link: ${e.link || "(none)"}`);
}
