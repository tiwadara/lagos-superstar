#!/usr/bin/env node
// Plays thousands of games with no browser, to check balance after you add or
// change stories. Usage: node simulate.js [games per row, default 2000]
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const G = new Function(source + `
  return { newGame, doAction, actionState, pickEvent, choose, choiceState,
           wrapWeek, finale, val, R, ACTIONS, BACKGROUNDS, TOTAL_WEEKS };`)();

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

function play(background, player) {
  const s = G.newGame('Test', background);
  while (!s.over && s.week <= G.TOTAL_WEEKS) {
    for (let guard = 0; guard < 20; guard++) {
      const move = player(s);
      if (!move || !G.doAction(s, move)) break;
    }
    const ev = G.pickEvent(s);
    if (ev) {
      const choices = G.val(ev.choices, s);
      const open = choices.map((c, i) => i).filter(i => G.choiceState(s, choices[i]).ok);
      G.choose(s, ev, G.R.pick(open)); // story choices are picked at random
    }
    G.wrapWeek(s);
  }
  if (!s.over) s.over = G.finale(s);
  return s;
}

const N = parseInt(process.argv[2], 10) || 2000;
const ENDINGS = ['Lagos star', 'Next rated', 'Buzzing', 'Area champion', 'Upcoming artist', 'Sapa won'];
const pct = n => ((n / N) * 100).toFixed(1).padStart(5) + '%';
const at = (sorted, p) => sorted[Math.floor(sorted.length * p)];

console.log(`${N} games per row. Story choices are random.\n`);
console.log('player    start   ' + ENDINGS.map(e => e.padStart(17)).join('') + '   median fans   median money');
for (const [name, player] of Object.entries(players)) {
  for (const background of Object.keys(G.BACKGROUNDS)) {
    const count = Object.fromEntries(ENDINGS.map(e => [e, 0]));
    const fans = [], money = [];
    for (let i = 0; i < N; i++) {
      const s = play(background, player);
      if (!Number.isFinite(s.fans) || !Number.isFinite(s.money)) throw new Error('Broken numbers in a ' + background + ' game');
      count[s.over.title]++;
      fans.push(s.fans); money.push(s.money);
    }
    fans.sort((a, b) => a - b); money.sort((a, b) => a - b);
    console.log(name.padEnd(10) + background.padEnd(8) + ENDINGS.map(e => pct(count[e]).padStart(17)).join('') +
      String(at(fans, 0.5)).padStart(14) + String(at(money, 0.5)).padStart(15));
  }
}
