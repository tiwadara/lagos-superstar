#!/usr/bin/env node
// Checks every story card in index.html against the rules in docs/story-writing-guide.md.
// Usage: node lint-stories.js
// Exits with code 1 if any error is found. Warnings are printed but do not fail.
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const G = new Function(source + '\nreturn { newGame, val, EVENTS, FOLLOWUPS, DECEMBER, STAGE_NAMES, BACKGROUNDS };')();

const FX_KEYS = ['money', 'earn', 'fans', 'fansUp', 'fansPct', 'skill', 'hype', 'cred', 'links', 'energyNext', 'rent', 'flag', 'note'];
const MAX_WORDS = 60;
const RUNS = 30; // each choice is run this many times per test player, to reach both sides of checks and gambles

const errors = [], warnings = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);
const warn = (id, msg) => warnings.push(`${id}: ${msg}`);
const words = t => String(t).trim().split(/\s+/).length;
const clone = s => JSON.parse(JSON.stringify(s));

const cards = [
  ...G.EVENTS.map(e => ({ e, kind: 'event' })),
  ...G.FOLLOWUPS.map(e => ({ e, kind: 'follow-up' })),
  { e: G.DECEMBER, kind: 'december' }
];

// Test players: weak and broke, strong and rich, for each background, late enough that most stories fit.
function testPlayers(extraFlags) {
  const out = [];
  for (const bg of Object.keys(G.BACKGROUNDS)) {
    for (const level of [0, 100]) {
      const s = G.newGame('Test', bg);
      Object.assign(s, { week: 10, fans: level ? 200000 : 50, money: level ? 5000000 : 0, skill: level, hype: level, cred: level, links: level });
      Object.assign(s.flags, extraFlags);
      out.push(s);
    }
  }
  return out;
}

// 1. Ids are unique.
const seenIds = new Map();
for (const { e } of cards) {
  if (!e.id) { err('(card without id)', 'every card needs an id'); continue; }
  if (seenIds.has(e.id)) err(e.id, 'duplicate id');
  seenIds.set(e.id, true);
}

// 2. Run every choice to learn which flags stories set, so follow-ups and choice lists can be checked.
const flagsSet = new Set();
function runChoice(e, c, s) {
  const out = [];
  for (let k = 0; k < RUNS; k++) {
    const t = clone(s);
    let res;
    try { res = c.run(t) || {}; } catch (x) { err(e.id, `choice "${c.label}" crashed: ${x.message}`); return out; }
    out.push(res);
    if (res.fx && res.fx.flag) Object.keys(res.fx.flag).forEach(f => flagsSet.add(f));
  }
  return out;
}
const basePlayers = testPlayers({});
for (const { e } of cards) {
  for (const s of basePlayers) {
    const choices = G.val(e.choices, s);
    if (Array.isArray(choices)) for (const c of choices) if (typeof c.run === 'function') runChoice(e, c, s);
  }
}
// Players with every known flag set, to reach choice lists that depend on flags.
const flaggedPlayers = testPlayers(Object.fromEntries([...flagsSet].map(f => [f, 1])));

// 3. Check each card.
for (const { e, kind } of cards) {
  const id = e.id || '(no id)';
  for (const field of ['title', 'who', 'text', 'choices']) if (e[field] === undefined) err(id, `missing ${field}`);
  if (kind !== 'december' && typeof e.when !== 'function') err(id, 'missing when(s)');

  for (const s of [...basePlayers, ...flaggedPlayers]) {
    const text = G.val(e.text, s);
    if (typeof text !== 'string' || !text.trim()) { err(id, 'text is empty'); break; }
    if (words(text) > MAX_WORDS) { warn(id, `story text is ${words(text)} words; aim for 25 to 45`); break; }
  }

  const lists = [...basePlayers, ...flaggedPlayers].map(s => ({ s, choices: G.val(e.choices, s) }));
  for (const { s, choices } of lists) {
    if (!Array.isArray(choices) || !choices.length) { err(id, 'choices must be a non-empty list'); break; }
    if (!choices.some(c => !c.cost)) { err(id, 'every choice costs money, so a broke player is stuck. Add a free choice'); break; }
    if (choices.length > 3) warn(id, `${choices.length} choices; the guide asks for two or three`);
    for (const c of choices) {
      if (!c.label) err(id, 'a choice has no label');
      if (typeof c.run !== 'function') { err(id, `choice "${c.label}" has no run(s)`); continue; }
      const runSrc = c.run.toString();
      if (/\bchk\(/.test(runSrc) && !(typeof c.hint === 'function' && /\bodds\(/.test(c.hint.toString())))
        warn(id, `choice "${c.label}" uses chk() but its hint does not show odds()`);
      for (const res of runChoice(e, c, s)) {
        if (typeof res.text !== 'string' || !res.text.trim()) { err(id, `choice "${c.label}" can end with no result text`); break; }
        const bad = Object.keys(res.fx || {}).filter(k => !FX_KEYS.includes(k));
        if (bad.length) { err(id, `choice "${c.label}" uses unknown effect ${bad.join(', ')}. Known: ${FX_KEYS.join(', ')}`); break; }
      }
    }
  }

  // 4. Follow-ups wait for flags that some choice sets.
  if (kind === 'follow-up') {
    const waits = [...new Set([...e.when.toString().matchAll(/flags\.(\w+)/g)].map(m => m[1]))];
    if (!waits.length) warn(id, 'follow-up does not wait for any flag');
    for (const f of waits) if (!flagsSet.has(f)) err(id, `waits for flag "${f}", but no choice sets it`);
  }

  // 5. Names players can be given are never used in stories.
  const allText = [e.title, G.val(e.who, basePlayers[0]), e.text.toString(), JSON.stringify(e.choices, (k, v) => typeof v === 'function' ? v.toString() : v)].join(' ');
  for (const name of G.STAGE_NAMES) if (allText.includes(name)) err(id, `uses "${name}", which is in STAGE_NAMES. Players can be given that name`);
}

// Report.
for (const w of warnings) console.log('warning  ' + w);
for (const x of errors) console.log('ERROR    ' + x);
console.log(`\nChecked ${cards.length} stories (${G.EVENTS.length} events, ${G.FOLLOWUPS.length} follow-ups, December): ${errors.length} errors, ${warnings.length} warnings.`);
process.exit(errors.length ? 1 : 0);
