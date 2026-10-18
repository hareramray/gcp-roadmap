import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const rel = p => path.relative(root, p).split(path.sep).join('/');
const read = p => fs.readFileSync(p, 'utf8');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true })
  .filter(e => !['.git', 'node_modules', '.venv'].includes(e.name))
  .flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const title = text => text.match(/^# (.+)$/m)?.[1] ?? 'Untitled';
const words = text => text.trim().split(/\s+/u).filter(Boolean).length;
const tutorials = walk(path.join(root, 'tutorials'))
  .filter(p => /^tutorials\/[^/]+\/[^/]+\.md$/.test(rel(p))).sort();
const groups = [...new Set(tutorials.map(p => rel(p).split('/')[1]))];

if (process.argv.includes('--write-indexes')) {
  const checklistPath = path.join(root, 'CHECKLIST.md');
  const previous = fs.existsSync(checklistPath) ? read(checklistPath) : '';
  const completed = new Set([...previous.matchAll(/^- \[[xX]\] \[[^\]]+\]\(([^)]+)\)/gm)].map(m => m[1]));
  let coverage = '# Curriculum coverage map\n\n[Home](README.md) · [Learning sequence](ROADMAP.md) · [Checklist](CHECKLIST.md)\n\n';
  coverage += `This inventory contains **${tutorials.length} tutorials across ${groups.length} domains**. Every row names an existing tutorial and its owning roadmap. Related service features are explained inside these tutorials; this inventory does not claim to reproduce every Google Cloud API, SKU, or feature.\n\n`;
  let checklist = '# Learning progress checklist\n\n[Home](README.md) · [Roadmap](ROADMAP.md) · [Coverage](COVERAGE.md)\n\n';
  checklist += 'Check a topic only after you can explain it, complete its practical or explicitly labeled design exercise, verify the result, analyze a failure, and account for cleanup/cost. Keep detailed evidence in your own learning journal. All topics start unchecked; repository authoring is not evidence that you completed a cloud lab.\n\n';
  let tutorialIndex = '# Tutorial library\n\n[Home](../README.md) · [Setup](../LAB-SETUP.md) · [Full coverage](../COVERAGE.md)\n\nChoose a domain roadmap for the recommended sequence and a link to every tutorial.\n\n';
  let roadmapIndex = '# Domain roadmaps\n\n[Home](../README.md) · [Complete learning sequence](../ROADMAP.md)\n\n';
  for (const group of groups) {
    const roadmap = path.join(root, 'roadmaps', `${group}.md`);
    if (!fs.existsSync(roadmap)) throw new Error(`Missing owning roadmap: ${rel(roadmap)}`);
    const name = title(read(roadmap)).replace(/ roadmap$/i, '');
    const items = tutorials.filter(p => rel(p).split('/')[1] === group);
    coverage += `## ${name}\n\n[Domain roadmap](roadmaps/${group}.md) · ${items.length} tutorials\n\n| Tutorial | Approximate words |\n| --- | ---: |\n`;
    checklist += `## ${name}\n\n`;
    tutorialIndex += `- [${name}](../roadmaps/${group}.md) — ${items.length} tutorials\n`;
    roadmapIndex += `- [${name}](${group}.md) — ${items.length} tutorials\n`;
    for (const p of items) {
      const text = read(p), label = title(text), target = rel(p);
      coverage += `| [${label}](${target}) | ${words(text).toLocaleString('en-US')} |\n`;
      checklist += `- [${completed.has(target) ? 'x' : ' '}] [${label}](${target})\n`;
    }
    coverage += '\n';
    checklist += '\n';
  }
  coverage += '## Depth and verification\n\nTutorials include teaching, practical or design work, expected evidence, failure analysis, cleanup/cost considerations, and primary references. Word counts include examples and tables and are a navigation aid, not a quality score. The local checker verifies links, code fences, and topic-to-roadmap coverage; it does not deploy cloud resources or certify live command behavior.\n';
  fs.writeFileSync(path.join(root, 'COVERAGE.md'), coverage);
  fs.writeFileSync(checklistPath, checklist);
  fs.writeFileSync(path.join(root, 'tutorials', 'README.md'), tutorialIndex);
  fs.writeFileSync(path.join(root, 'roadmaps', 'README.md'), roadmapIndex);
}

const files = walk(root).filter(p => p.endsWith('.md')).sort();
const errors = [], warnings = [];
let localLinks = 0, codeBlocks = 0, totalWords = 0;
const externalLinks = new Set();
for (const p of files) {
  const text = read(p);
  totalWords += words(text);
  let fence = null;
  const prose = [];
  for (const line of text.split(/\r?\n/)) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) { fence = marker[1]; codeBlocks++; }
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
    } else if (!fence) prose.push(line);
  }
  if (fence) errors.push(`${rel(p)}: unclosed code fence`);
  if ((prose.join('\n').match(/^# /gm) ?? []).length !== 1) errors.push(`${rel(p)}: expected one H1`);
  for (const m of prose.join('\n').matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    let target = m[1].trim().replace(/^<|>$/g, '');
    if (/^https?:\/\//i.test(target)) { externalLinks.add(target); continue; }
    if (/^[a-z]+:/i.test(target) || target.startsWith('#')) continue;
    target = target.split('#')[0].split('?')[0];
    if (!target) continue;
    localLinks++;
    const resolved = path.resolve(path.dirname(p), decodeURIComponent(target));
    if (!fs.existsSync(resolved)) errors.push(`${rel(p)}: broken local link ${target}`);
  }
}
for (const p of tutorials) {
  const text = read(p), group = rel(p).split('/')[1];
  const roadmap = path.join(root, 'roadmaps', `${group}.md`);
  if (!fs.existsSync(roadmap)) errors.push(`${rel(p)}: missing domain roadmap`);
  else if (!read(roadmap).includes(`../${rel(p)}`)) errors.push(`${rel(p)}: absent from its domain roadmap`);
  if (!text.includes('../../README.md') || !text.includes('../../LAB-SETUP.md')) errors.push(`${rel(p)}: missing home/setup navigation`);
  if (words(text) < 450) warnings.push(`${rel(p)}: shorter than 450 words; review depth`);
  if (!/cleanup|clean up|clean-up|tear.?down/i.test(text)) warnings.push(`${rel(p)}: review cleanup guidance`);
  const sources = new Set([...text.matchAll(/https?:\/\/[^\s)]+/g)].map(m => m[0]));
  if (sources.size < 3) warnings.push(`${rel(p)}: fewer than three linked references`);
}
const summary = {
  markdownFiles: files.length,
  tutorialFiles: tutorials.length,
  domainRoadmaps: groups.length,
  words: totalWords,
  localLinks,
  uniqueExternalReferences: externalLinks.size,
  codeBlocks,
  errors,
  warnings,
};
console.log(JSON.stringify(summary, null, 2));
process.exitCode = errors.length ? 1 : 0;
