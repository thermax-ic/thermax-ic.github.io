import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import mergeWith from 'lodash.mergewith';
import { walkContent } from './organize-cms-editors.mjs';

// Pages CMS saves regional forms with this same lodash merge behavior. Verify
// real page data survives a partial save, including fields outside the form.
export function checkRegionalEditors(config, root) {
  const entries = walkContent(config.content);
  assert(config.content.some(entry=>entry.name==='page-introductions'&&entry.type==='group'),'Page introduction navigation exists');
  const editors = entries.filter(entry=>entry.type==='file'&&(entry.path==='content/site.json'||entry.path.startsWith('content/pages/')));
  assert(editors.length>=30,'Page introductions are split into regional forms');
  const project = (fields, data) => Object.fromEntries(fields.map(field=>{
    const schema = field.component ? config.components[field.component] : field;
    const value = data[field.name];
    assert(value!==undefined,'Editor field exists in content: '+field.name);
    return [field.name,schema.fields ? project(schema.fields,value) : structuredClone(value)];
  }));
  const merge = (original,submitted) => mergeWith({},original,submitted,(_original,value)=>Array.isArray(value)?value:undefined);
  function checkLabels(fields) {
    for(const field of fields) {
      assert(field.label&&field.label.length<=24,'Human-readable field label: '+field.label);
      assert(!['→','↗','·','≈','↑','↓'].includes(field.label),'Decorative symbols are not editor labels');
      if(field.fields)checkLabels(field.fields);
    }
  }
  for(const editor of editors) {
    checkLabels(editor.fields);
    assert.equal(editor.operations?.delete,false,'Regional editor cannot delete an entire page');
    const original = JSON.parse(fs.readFileSync(path.join(root,editor.path),'utf8'));
    const submitted = project(editor.fields,original);
    assert.deepEqual(merge(original,submitted),original,'Saving an unchanged regional form preserves every page field: '+editor.name);
    const group = editor.fields.find(field=>field.fields?.some(child=>child.component));
    const copy = group.fields.find(field=>field.component);
    submitted[group.name][copy.name].zh = '区域编辑验证';
    submitted[group.name][copy.name].en = 'Regional editing verification';
    const expected = structuredClone(original);
    expected[group.name][copy.name].zh = submitted[group.name][copy.name].zh;
    expected[group.name][copy.name].en = submitted[group.name][copy.name].en;
    assert.deepEqual(merge(original,submitted),expected,'Editing one region preserves other regions, images and decorations: '+editor.name);
  }
  return {regionalForms:editors.length};
}
