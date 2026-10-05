#!/usr/bin/env node
// Runs every choice of one story against a test player and prints what each does.
// Usage: node .claude/skills/write-story/try-story.js <story id> [week] [fans] [money] [background]
// Example: node .claude/skills/write-story/try-story.js police 6 2000 150000 street
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..', '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const G = new Function(source + '\nreturn { newGame, choose, choiceState, val, EVENTS, FOLLOWUPS, DECEMBER };')();

const [id, week = 10, fans = 5000, money = 500000, bg = 'choir'] = process.argv.slice(2);
if (!id) { console.error('Usage: node try-story.js <story id> [week] [fans] [money] [background]'); process.exit(1); }
const all = [...G.EVENTS, ...G.FOLLOWUPS, G.DECEMBER];
const ev = all.find(e => e.id === id);
if (!ev) { console.error('No story with id "' + id + '". Ids: ' + all.map(e => e.id).join(', ')); process.exit(1); }

const ids = all.map(e => e.id);
const dupes = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dupes.length) console.warn('WARNING: duplicate story ids: ' + dupes.join(', '));

const s = G.newGame('Test', bg);
Object.assign(s, { week: +week, fans: +fans, money: +money });
const fits = ev.when ? ev.when(s) : true;
console.log(`"${ev.title}" (${ev.id}) for a ${bg} player in week ${week} with ${fans} fans and ₦${money}`);
console.log('Can appear now: ' + (fits ? 'yes' : 'no, its when() is false for this player'));
console.log('Story: ' + G.val(ev.text, s) + '\n');

const choices = G.val(ev.choices, s);
if (!choices.some(c => !c.cost)) console.warn('WARNING: every choice costs money, so a broke player is stuck.\n');
choices.forEach((c, i) => {
  const st = G.choiceState(s, c);
  console.log(`${i + 1}. ${c.label}${c.cost ? ' (₦' + c.cost.toLocaleString('en-US') + ')' : ''}${st.ok ? '' : ' [locked: cannot afford]'}`);
  console.log('   Hint: ' + (G.val(c.hint, s) || 'none'));
  if (!st.ok) return;
  // Run each choice several times on a copy, to show both sides of any check or gamble.
  const seen = new Map();
  for (let k = 0; k < 40; k++) {
    const t = JSON.parse(JSON.stringify(s));
    const r = G.choose(t, ev, i);
    const key = r.text + ' | ' + r.chips.map(x => x.t).join(', ');
    seen.set(key, (seen.get(key) || 0) + 1);
  }
  for (const [key, n] of seen) console.log(`   ${Math.round(n / 40 * 100)}%  ${key}`);
});
