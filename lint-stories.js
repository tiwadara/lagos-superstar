#!/usr/bin/env node
// Checks every story card in index.html against the rules in docs/story-writing-guide.md.
// Usage: node lint-stories.js
// Exits with code 1 if any error is found. Warnings are printed but do not fail.
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const G = new Function(source + '\nreturn { newGame, val, EVENTS, FOLLOWUPS, CAREERS, STAGE_NAMES, CAST };')();

const FX_KEYS = ['money', 'earn', 'fans', 'fansUp', 'fansPct', 'skill', 'hype', 'cred', 'links', 'energyNext', 'rent', 'flag', 'note'];
const MAX_WORDS = 60;
// Words that only make sense for a musician. Untagged city stories should not show them to other careers.
const MUSIC_WORDS = /\b(songs?|singles?|streams?|studio|record(ed|ing)?|verses?|hook|sing(s|ing|er|ers)?|sang|musician|music|album)\b/i;
const castOf = e => e.cast === undefined ? [] : [].concat(e.cast);
const RUNS = 30; // each choice is run this many times per test player, to reach both sides of checks and gambles

const errors = [], warnings = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);
const warn = (id, msg) => warnings.push(`${id}: ${msg}`);
const words = t => String(t).trim().split(/\s+/).length;
const clone = s => JSON.parse(JSON.stringify(s));
// All the words on a card, including inside its functions.
const cardText = e => [String(e.title), typeof e.who === 'function' ? e.who.toString() : e.who, e.text.toString(), JSON.stringify(e.choices, (k, v) => typeof v === 'function' ? v.toString() : v)].join(' ');

const cards = [
  ...G.EVENTS.map(e => ({ e, kind: 'event' })),
  ...G.FOLLOWUPS.map(e => ({ e, kind: 'follow-up' })),
  ...[...new Set(Object.values(G.CAREERS).map(c => c.december))].map(e => ({ e, kind: 'december' }))
];
const careerIds = Object.keys(G.CAREERS);
// Which test players a card is for: its careers, or every career when it has no careers tag.
const forCard = (e, players) => players.filter(s => !e.careers || e.careers.includes(s.career));

// Test players: weak and broke, strong and rich, for each career and background, late enough that most stories fit.
function testPlayers(extraFlags) {
  const out = [];
  for (const cid of careerIds) for (const bg of Object.keys(G.CAREERS[cid].backgrounds)) {
    for (const level of [0, 100]) {
      const s = G.newGame('Test', bg, cid);
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
const flagsSet = new Set(), flagsBy = {}; // every flag set, and the flags each card sets
function runChoice(e, c, s) {
  const out = [];
  for (let k = 0; k < RUNS; k++) {
    const t = clone(s);
    let res;
    try { res = c.run(t) || {}; } catch (x) { err(e.id, `choice "${c.label}" crashed: ${x.message}`); return out; }
    out.push(res);
    if (res.fx && res.fx.flag) Object.keys(res.fx.flag).forEach(f => { flagsSet.add(f); (flagsBy[e.id] = flagsBy[e.id] || new Set()).add(f); });
  }
  return out;
}
const basePlayers = testPlayers({});
for (const { e } of cards) {
  for (const s of forCard(e, basePlayers)) {
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

  for (const s of forCard(e, [...basePlayers, ...flaggedPlayers])) {
    const text = G.val(e.text, s);
    if (typeof text !== 'string' || !text.trim()) { err(id, 'text is empty'); break; }
    if (words(text) > MAX_WORDS) { warn(id, `story text is ${words(text)} words; aim for 25 to 45`); break; }
  }

  const lists = forCard(e, [...basePlayers, ...flaggedPlayers]).map(s => ({ s, choices: G.val(e.choices, s) }));
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

  // Cast: each cast tag (a string or a list) must point at a character in CAST.
  for (const c of castOf(e)) if (!G.CAST[c]) err(id, `cast "${c}" is not in CAST`);

  // Careers: a careers tag lists career ids. With more than one career, untagged stories are city stories that
  // every career draws, so they should not lean on one career's words.
  if (e.careers !== undefined) {
    if (!Array.isArray(e.careers) || !e.careers.length) err(id, 'careers must be a list of career ids, such as [\'music\']');
    else for (const c of e.careers) if (!G.CAREERS[c]) err(id, `career "${c}" is not in CAREERS`);
  } else if (careerIds.length > 1 && kind !== 'december') {
    // What a player in another career actually reads: the title, who, text, labels, hints and every result.
    for (const s of forCard(e, [...basePlayers, ...flaggedPlayers]).filter(s => s.career !== 'music')) {
      const seen = [G.val(e.title, s), G.val(e.who, s), G.val(e.text, s)];
      for (const c of G.val(e.choices, s) || []) {
        seen.push(c.label, G.val(c.hint, s) || '');
        for (const res of runChoice(e, c, s)) seen.push(res.text || '', (res.fx && res.fx.note) || '');
      }
      const said = seen.join(' ').match(MUSIC_WORDS);
      if (said) { warn(id, `has no careers tag, and ${/^[aeiou]/i.test(s.career) ? "an" : "a"} ${s.career} player reads "${said[0]}". Tag it, or word it with by(s, {...})`); break; }
    }
  }

  // 5. Draw fields: weight is a positive number, group is a name. Only EVENTS are drawn at random.
  if (e.weight !== undefined && !(typeof e.weight === 'number' && e.weight > 0)) err(id, `weight must be a number above 0, not ${JSON.stringify(e.weight)}`);
  if (e.group !== undefined && (typeof e.group !== 'string' || !e.group)) err(id, 'group must be a name, such as \'scam\'');
  if (kind !== 'event' && (e.weight !== undefined || e.group !== undefined)) warn(id, 'weight and group only change how EVENTS are drawn, so they do nothing here');

  // Seasons (docs/adr/0010-seasons-carry-over.md): once is 'career', and fromSeason is a season number from 2.
  if (e.once !== undefined && e.once !== 'career') err(id, `once must be 'career', not ${JSON.stringify(e.once)}`);
  if (e.fromSeason !== undefined && !(Number.isInteger(e.fromSeason) && e.fromSeason >= 2)) err(id, `fromSeason must be a season number from 2, not ${JSON.stringify(e.fromSeason)}`);

  // 6. Names players can be given are never used in stories.
  const allText = cardText(e);
  for (const name of G.STAGE_NAMES) if (allText.includes(name)) err(id, `uses "${name}", which is in STAGE_NAMES. Players can be given that name`);
}

// Follow-ups happen once per career. A story that starts one must too (once: 'career'), or in a later season
// it would come back without its consequence.
const waitedFor = {};
for (const e of G.FOLLOWUPS) for (const m of e.when.toString().matchAll(/flags\.(\w+)/g)) (waitedFor[m[1]] = waitedFor[m[1]] || []).push(e.id);
for (const e of G.EVENTS) {
  const starts = [...(flagsBy[e.id] || [])].filter(f => waitedFor[f]);
  if (starts.length && e.once !== 'career') err(e.id, `sets flag "${starts[0]}", which ${waitedFor[starts[0]][0]} waits for, so it needs once: 'career'`);
}

// Every cast member appears in at least one story.
for (const [cid, c] of Object.entries(G.CAST)) {
  if (!cards.some(({ e }) => castOf(e).includes(cid))) warn('CAST', `${c.name} (${cid}) is in no story`);
  if (G.STAGE_NAMES.includes(c.name)) err('CAST', `${c.name} is also in STAGE_NAMES`);
}

// A group with one story shuts nothing out.
const groups = {};
for (const e of G.EVENTS) if (e.group) (groups[e.group] = groups[e.group] || []).push(e.id);
for (const [g, ids] of Object.entries(groups)) if (ids.length < 2) warn(ids[0], `is the only story in group "${g}", so the group does nothing`);

// Report.
for (const w of warnings) console.log('warning  ' + w);
for (const x of errors) console.log('ERROR    ' + x);
console.log(`\nChecked ${cards.length} stories (${G.EVENTS.length} events, ${G.FOLLOWUPS.length} follow-ups, December): ${errors.length} errors, ${warnings.length} warnings.`);
process.exit(errors.length ? 1 : 0);
