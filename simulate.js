// Plays thousands of games of The Next Lagos Star without a browser, to check balance.
// Usage: node simulate.js [games per player and background]
//
// It loads the game rules straight out of index.html, so it always tests the real game.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(script, sandbox);
const G = sandbox.GAME;

const GAMES = Math.max(1, parseInt(process.argv[2], 10) || 2000);

const clone = s => JSON.parse(JSON.stringify(s));
const can = (s, id) => !G.actionBlock(s, G.ACTIONS.find(a => a.id === id));
const openChoices = s => G.findStory(s.storyId).choices.map((c, i) => i).filter(i => !G.choiceBlock(s, G.findStory(s.storyId).choices[i]));

// A rough sense of how well a game is going, used by the sensible player to compare choices.
function worth(s) {
  const cut = (s.flags.label || 0) + (s.flags.manager || 0) + (s.flags.investor || 0);
  return s.fans + Math.min(s.money, 300000) / 25 + (s.skill + s.cred + s.links) * 40 + s.hype * 15
    - cut * 2000 - (s.money < 0 ? -s.money / 5 : 0);
}

const PLAYERS = {
  // Plans the week: keeps cash for rent, records and releases good songs, builds hype before a release.
  sensible: {
    act(s) {
      const rentSoon = (4 - s.week % 4) % 4 <= 1 ? s.rent : 0;
      const buffer = 30000 + rentSoon;
      const unreleased = s.songs.filter(x => !x.released);
      const show = G.showTier(s);
      if (s.money < buffer) return show.pay >= 20000 && G.chance(s, 'skill', show.dc) >= 0.5 ? 'show' : 'hustle';
      if (unreleased.length && s.hype >= 12 && can(s, 'release')) return 'release';
      if (!unreleased.length && s.skill >= 30 && s.money >= 30000 + buffer) return 'record';
      if (s.skill < 30) return 'rehearse';
      if (unreleased.length && s.hype < 12) return 'post';
      if (show.pay >= 80000 && G.chance(s, 'skill', show.dc) >= 0.5 && s.moves === 1) return 'show';
      if (s.links < 30 && s.money >= 20000 + buffer) return 'island';
      if (can(s, 'promo') && s.money >= 60000 + buffer + 100000) return 'promo';
      if (s.skill < 70) return 'rehearse';
      return 'post';
    },
    // Tries each open choice a few times on a copy of the game and keeps the one that ends up best.
    choose(s) {
      let best = 0, bestScore = -Infinity;
      for (const i of openChoices(s)) {
        let total = 0;
        for (let k = 0; k < 4; k++) { const t = clone(s); G.choose(t, i); total += worth(t); }
        if (total > bestScore) { bestScore = total; best = i; }
      }
      return best;
    }
  },
  // Picks any move it can afford and any choice it can afford.
  random: {
    act(s) { const ok = G.ACTIONS.filter(a => !G.actionBlock(s, a)); return ok.length ? ok[Math.floor(Math.random() * ok.length)].id : null; },
    choose(s) { const ok = openChoices(s); return ok[Math.floor(Math.random() * ok.length)]; }
  },
  // Mostly works the side hustle and posts now and then. Never records.
  lazy: {
    act(s) { return Math.random() < 0.7 ? 'hustle' : 'post'; },
    choose(s) { const ok = openChoices(s); return ok[ok.length - 1]; }
  }
};

function play(player, bg) {
  const s = G.newGame(bg);
  let guard = 0;
  while (s.phase !== 'over' && guard++ < 1000) {
    if (s.phase === 'moves') {
      const id = s.moves > 0 ? player.act(s) : null;
      if (!id || !G.doAction(s, id)) G.endWeek(s);
    } else if (s.phase === 'story') {
      G.choose(s, player.choose(s));
    } else {
      G.advance(s);
    }
  }
  return s;
}

const names = G.ENDINGS.map(e => e[1]).reverse().concat(['Owing everybody']);
const pad = (t, n) => String(t).padEnd(n);
const padL = (t, n) => String(t).padStart(n);

console.log('The Next Lagos Star: ' + GAMES + ' games for each player and background\n');
console.log(pad('Player', 10) + pad('Background', 22) + names.map(n => padL(n, 17)).join('') + padL('Median fans', 13));
for (const [pname, player] of Object.entries(PLAYERS)) {
  for (const bg of G.BACKGROUNDS) {
    const counts = Object.fromEntries(names.map(n => [n, 0]));
    const fans = [];
    for (let i = 0; i < GAMES; i++) {
      const s = play(player, bg.id);
      counts[s.ending ? s.ending.title : 'Owing everybody']++;
      fans.push(s.fans);
    }
    fans.sort((a, b) => a - b);
    console.log(pad(pname, 10) + pad(bg.name, 22) +
      names.map(n => padL((counts[n] / GAMES * 100).toFixed(1) + '%', 17)).join('') +
      padL(fans[Math.floor(fans.length / 2)].toLocaleString('en-US'), 13));
  }
}
