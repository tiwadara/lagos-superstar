#!/usr/bin/env node
// Plays thousands of games with no browser, to check balance after you add or
// change stories.
//
// Usage: node simulate.js [games per row, default 2000] [--stories=random|money|purist|all] [--detail] [--check]
//   --stories  how simulated players pick story choices (default random, "all" prints every strategy)
//   --detail   also print cash and fans by week, and each story's effect on games
//   --check    play random and money-chasing story choices, compare with TARGETS below and with
//              balance-baseline.json, and exit with code 1 if anything is missed. About 40 seconds.
//   --save-baseline  play the same games as --check and write balance-baseline.json. Use 4000 games per row
//              (node simulate.js 4000 --save-baseline) so the baseline itself is steady.
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const G = new Function(source + `
  return { newGame, doAction, actionState, pickEvent, choose, choiceState,
           wrapWeek, finale, val, R, ACTIONS, BACKGROUNDS, TOTAL_WEEKS, EVENTS, FOLLOWUPS };`)();

const can = (s, id) => G.actionState(s, G.ACTIONS.find(a => a.id === id)).ok;

// Three kinds of player. Add your own to test a strategy.
const players = {
  // Plans releases, keeps rent covered, mixes the other moves.
  sensible(s) {
    if (s.energy <= 0) return can(s, 'promo') && s.money > 300000 && s.vault.length ? 'promo' : null;
    if (s.money < 60000 && can(s, 'hustle')) return 'hustle';
    const since = s.lastRelease ? s.week - s.lastRelease : 9;
    if (s.vault.length && since >= 2 && can(s, 'release')) return can(s, 'promo') && s.money > 150000 ? 'promo' : 'release';
    if (!s.vault.length && s.energy >= 2 && can(s, 'record') && s.skill >= 30) return 'record';
    if (s.skill < 55 && Math.random() < 0.5) return 'rehearse';
    const r = Math.random();
    if (r < 0.3) return 'post';
    if (r < 0.55) return 'show';
    if (r < 0.7 && can(s, 'network')) return 'network';
    return r < 0.85 ? 'rehearse' : 'hustle';
  },
  // Taps anything that is available.
  random(s) {
    if (s.energy <= 0) return null;
    const ok = G.ACTIONS.filter(a => G.actionState(s, a).ok);
    return ok.length ? G.R.pick(ok).id : null;
  },
  // Never earns money, never records.
  lazy(s) {
    return s.energy <= 0 ? null : Math.random() < 0.5 ? 'post' : 'rehearse';
  }
};

// How a player picks story choices. Strategies try each choice on copies of the game and keep the best.
const clone = s => JSON.parse(JSON.stringify(s));
const deals = s => ['signed', 'signedGood', 'manager', 'investor'].filter(k => s.flags[k]).length;
function best(s, ev, open, score) {
  let pick = open[0], top = -Infinity;
  for (const i of open) {
    let total = 0;
    for (let k = 0; k < 3; k++) { const t = clone(s); G.choose(t, ev, i); total += score(t); }
    if (total > top) { top = total; pick = i; }
  }
  return pick;
}
const pickers = {
  // Picks any choice it can afford.
  random: (s, ev, open) => G.R.pick(open),
  // Always takes the choice that leaves the most cash.
  money: (s, ev, open) => best(s, ev, open, t => t.money),
  // Never signs a deal, protects street cred, then minds the money.
  purist: (s, ev, open) => best(s, ev, open, t => -deals(t) * 1e9 + t.cred * 1e5 + t.money)
};

// Balance targets, checked by `node simulate.js --check` on every pull request.
// Each rule applies to every starting background for that player, with random story choices.
// Endings are percentages of games. Cash is the median at the end of week 20, after rent, in naira.
// At 2,000 games per row, results move between runs by up to about ±3 points on endings and ±₦15,000 on cash,
// so the cash floor allows ₦25,000 below zero.
// To change a target on purpose, edit it here and in docs/balance.md in the same pull request, and say why.
const TARGETS = [
  { player: 'sensible', rule: 'ends Buzzing or Next rated', min: 90, value: r => r.pct['Buzzing'] + r.pct['Next rated'] },
  { player: 'sensible', rule: 'ends Lagos star', max: 5, value: r => r.pct['Lagos star'] },
  { player: 'sensible', rule: 'ends Sapa won', max: 1, value: r => r.pct['Sapa won'] },
  { player: 'sensible', rule: 'median cash at week 20', min: -25000, max: 300000, naira: true, value: r => r.cash20 },
  { player: 'random', rule: 'ends Buzzing or Area champion', min: 60, value: r => r.pct['Buzzing'] + r.pct['Area champion'] },
  { player: 'random', rule: 'ends Sapa won', min: 2, max: 25, value: r => r.pct['Sapa won'] },
  { player: 'lazy', rule: 'ends Next rated or Lagos star', max: 0.5, value: r => r.pct['Next rated'] + r.pct['Lagos star'] },
  { player: 'lazy', rule: 'ends Sapa won or Area champion', min: 80, value: r => r.pct['Sapa won'] + r.pct['Area champion'] }
];

// How far --check lets the game move from balance-baseline.json before it fails. Measured noise is well inside these.
const DRIFT = { endingPoints: 7, relative: 0.3, fansFloor: 2000, moneyFloor: 100000, cashFloor: 45000 };

const CHECKPOINTS = [4, 8, 12, 16, 20, 26];
function play(background, player, picker) {
  const s = G.newGame('Test', background);
  const byWeek = {};
  while (!s.over && s.week <= G.TOTAL_WEEKS) {
    for (let guard = 0; guard < 20; guard++) {
      const move = player(s);
      if (!move || !G.doAction(s, move)) break;
    }
    const ev = G.pickEvent(s);
    if (ev) {
      const choices = G.val(ev.choices, s);
      const open = choices.map((c, i) => i).filter(i => G.choiceState(s, choices[i]).ok);
      G.choose(s, ev, picker(s, ev, open));
    }
    const { wk } = G.wrapWeek(s);
    if (CHECKPOINTS.includes(wk)) byWeek[wk] = { money: s.money, fans: s.fans };
  }
  if (!s.over) s.over = G.finale(s);
  return { s, byWeek };
}

const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const SAVE = args.find(a => a.startsWith('--save-baseline'));
const BASELINE_FILE = SAVE && SAVE.includes('=') ? SAVE.split('=')[1] : path.join(__dirname, 'balance-baseline.json');
const N = parseInt(args.find(a => /^\d+$/.test(a)), 10) || 2000;
const DETAIL = args.includes('--detail');
const storyArg = (args.find(a => a.startsWith('--stories=')) || '--stories=random').split('=')[1];
const strategies = CHECK || SAVE ? ['random', 'money'] : storyArg === 'all' ? Object.keys(pickers) : [storyArg];
if (!strategies.every(k => pickers[k])) { console.error('Unknown --stories value. Use random, money, purist or all.'); process.exit(1); }
if ((CHECK || SAVE) && args.some(a => a.startsWith('--stories='))) { console.error('--check and --save-baseline choose their own story strategies. Leave out --stories.'); process.exit(1); }

const ENDINGS = ['Lagos star', 'Next rated', 'Buzzing', 'Area champion', 'Upcoming artist', 'Sapa won'];
const pct = n => ((n / N) * 100).toFixed(1).padStart(5) + '%';
const at = (sorted, p) => sorted[Math.floor(sorted.length * p)];
const median = a => at(a.slice().sort((x, y) => x - y), 0.5);
const short = n => (n < 0 ? '-' : '') + (Math.abs(n) >= 1e6 ? (Math.abs(n) / 1e6).toFixed(1) + 'm' : Math.round(Math.abs(n) / 1000) + 'k');

const label = strategies.length > 1 ? 'Story choices by strategy: ' + strategies.join(', ') + '.' : storyArg === 'random' ? 'Story choices are random.' : 'Story choices: ' + storyArg + '.';
console.log(`${N} games per row. ${label}\n`);
console.log('player    start   ' + (strategies.length > 1 ? 'stories ' : '') + ENDINGS.map(e => e.padStart(17)).join('') + '   median fans   median money');

const weekly = [];   // rows for --detail
const rows = [];     // rows for --check
const storyStats = {}; // story id -> { in: {fans, money}, out: {fans, money} }, sensible player only
const storyIds = [...G.EVENTS, ...G.FOLLOWUPS].map(e => e.id).concat('december');

for (const strategy of strategies) {
  for (const [name, player] of Object.entries(players)) {
    for (const background of Object.keys(G.BACKGROUNDS)) {
      const count = Object.fromEntries(ENDINGS.map(e => [e, 0]));
      const fans = [], money = [];
      const weeks = Object.fromEntries(CHECKPOINTS.map(w => [w, { money: [], fans: [] }]));
      for (let i = 0; i < N; i++) {
        const { s, byWeek } = play(background, player, pickers[strategy]);
        if (!Number.isFinite(s.fans) || !Number.isFinite(s.money)) throw new Error('Broken numbers in a ' + background + ' game');
        count[s.over.title]++;
        fans.push(s.fans); money.push(s.money);
        for (const w of CHECKPOINTS) if (byWeek[w]) { weeks[w].money.push(byWeek[w].money); weeks[w].fans.push(byWeek[w].fans); }
        if (DETAIL && name === 'sensible') {
          for (const id of storyIds) {
            const st = storyStats[id] || (storyStats[id] = { in: { fans: [], money: [] }, out: { fans: [], money: [] } });
            const side = s.seen.includes(id) ? st.in : st.out;
            side.fans.push(s.fans); side.money.push(s.money);
          }
        }
      }
      fans.sort((a, b) => a - b); money.sort((a, b) => a - b);
      console.log(name.padEnd(10) + background.padEnd(8) + (strategies.length > 1 ? strategy.padEnd(8) : '') + ENDINGS.map(e => pct(count[e]).padStart(17)).join('') +
        String(at(fans, 0.5)).padStart(14) + String(at(money, 0.5)).padStart(15));
      weekly.push({ name, background, strategy, weeks });
      rows.push({ name, background, strategy, pct: Object.fromEntries(ENDINGS.map(e => [e, count[e] / N * 100])),
        fans: at(fans, 0.5), money: at(money, 0.5), cash20: weeks[20].money.length ? median(weeks[20].money) : null });
    }
  }
}

if (DETAIL) {
  console.log('\nMedian cash and fans at the end of each week (games still running that week)\n');
  console.log('player    start   ' + (strategies.length > 1 ? 'stories ' : '') + CHECKPOINTS.map(w => ('week ' + w).padStart(16)).join(''));
  for (const r of weekly) {
    console.log(r.name.padEnd(10) + r.background.padEnd(8) + (strategies.length > 1 ? r.strategy.padEnd(8) : '') +
      CHECKPOINTS.map(w => r.weeks[w].money.length ? (short(median(r.weeks[w].money)) + ' / ' + short(median(r.weeks[w].fans)) + 'f').padStart(16) : '-'.padStart(16)).join(''));
  }
  console.log('\nStories, for the sensible player: how often each appears, and the median end of games with it and without it\n');
  console.log('story'.padEnd(16) + 'seen'.padStart(7) + 'fans with'.padStart(12) + 'without'.padStart(10) + 'money with'.padStart(13) + 'without'.padStart(10));
  for (const id of storyIds) {
    const st = storyStats[id], total = st.in.fans.length + st.out.fans.length;
    const m = (a, f) => a.length ? f(median(a)) : '-';
    console.log(id.padEnd(16) + ((st.in.fans.length / total * 100).toFixed(0) + '%').padStart(7) +
      m(st.in.fans, short).padStart(12) + m(st.out.fans, short).padStart(10) + m(st.in.money, short).padStart(13) + m(st.out.money, short).padStart(10));
  }
}

if (CHECK) {
  console.log('\nBalance targets (docs/balance.md)\n');
  const failed = [];
  for (const t of TARGETS) {
    for (const r of rows.filter(r => r.name === t.player && r.strategy === 'random')) {
      const v = t.value(r);
      const ok = v !== null && (t.min === undefined || v >= t.min) && (t.max === undefined || v <= t.max);
      const show = x => t.naira ? (v === null ? 'none' : '₦' + Math.round(x).toLocaleString('en-US')) : x.toFixed(1) + '%';
      const range = [t.min !== undefined ? 'at least ' + show(t.min) : '', t.max !== undefined ? 'at most ' + show(t.max) : ''].filter(Boolean).join(' and ');
      const line = `${ok ? 'pass' : 'FAIL'}  ${t.player} ${r.background}: ${t.rule} ${v === null ? 'none' : show(v)} (target ${range})`;
      console.log(line);
      if (!ok) failed.push(line);
    }
  }

  console.log('\nCompared with balance-baseline.json\n');
  let base = null;
  try { base = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8')); } catch (e) { failed.push('balance-baseline.json is missing or unreadable. Run node simulate.js --save-baseline'); console.log('FAIL  ' + failed[failed.length - 1]); }
  const drift = [];
  if (base) {
    for (const r of rows) {
      const key = `${r.name}/${r.background}/${r.strategy}`, b = base.rows[key];
      if (!b) { drift.push(`${key}: not in the baseline`); continue; }
      for (const e of ENDINGS) {
        const d = r.pct[e] - b.pct[e];
        if (Math.abs(d) > DRIFT.endingPoints) drift.push(`${key}: ${e} ${b.pct[e].toFixed(1)}% → ${r.pct[e].toFixed(1)}%`);
      }
      for (const [k, label, floor] of [['fans', 'median fans', DRIFT.fansFloor], ['money', 'median money', DRIFT.moneyFloor], ['cash20', 'week 20 cash', DRIFT.cashFloor]]) {
        if (r[k] === null || b[k] === null || b[k] === undefined) continue;
        if (k === 'cash20' && r.name !== 'sensible') continue; // random and lazy cash at week 20 swing too much between runs to compare
        if (Math.abs(r[k] - b[k]) > Math.max(DRIFT.relative * Math.abs(b[k]), floor))
          drift.push(`${key}: ${label} ${Math.round(b[k]).toLocaleString('en-US')} → ${Math.round(r[k]).toLocaleString('en-US')}`);
      }
    }
    for (const d of drift) console.log('FAIL  ' + d);
    if (!drift.length) console.log(`pass  all ${rows.length} rows within ${DRIFT.endingPoints} points on endings and ${DRIFT.relative * 100}% on fans and money`);
  }
  if (failed.length || drift.length) {
    if (failed.length) console.log(`\n${failed.length} balance target${failed.length > 1 ? 's' : ''} missed. If the change is meant to move the game this far, update TARGETS in simulate.js and docs/balance.md, and explain why in the pull request.`);
    if (drift.length) console.log(`\nThe game moved away from the baseline. If that is intended, run node simulate.js --save-baseline, commit balance-baseline.json, update the tables in docs/balance.md, and explain the change in the pull request.`);
    process.exit(1);
  }
  console.log('\nAll balance targets met, and the game matches the baseline.');
}

if (SAVE) {
  const out = { saved: new Date().toISOString().slice(0, 10), games: N, rows: {} };
  for (const r of rows) out.rows[`${r.name}/${r.background}/${r.strategy}`] = { pct: Object.fromEntries(ENDINGS.map(e => [e, +r.pct[e].toFixed(2)])), fans: r.fans, money: r.money, cash20: r.cash20 };
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(out, null, 2) + '\n');
  console.log(`\nSaved ${rows.length} rows to ${path.relative(process.cwd(), BASELINE_FILE) || BASELINE_FILE}.`);
}
