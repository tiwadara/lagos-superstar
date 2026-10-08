#!/usr/bin/env node
// Checks that saves from older versions of the game still load, migrate and play on (#33).
// Saves are explained in docs/adr/0004-saves-in-local-storage.md, seasons in docs/adr/0010-seasons-carry-over.md.
// Usage: node test-saves.js     Exits with code 1 if any check fails. Runs on every pull request.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const G = new Function(source + `
  return { newGame, newSeason, migrate, doAction, actionState, pickEvent, choose, choiceState,
           wrapWeek, finale, val, R, ACTIONS, CAREERS, TOTAL_WEEKS, EVENTS, FOLLOWUPS };`)();

// Version 1 saves, made by the live game before seasons (main at cdb0050, 8 October 2026) and copied exactly as it
// wrote them to localStorage: a music game in week 13 with a manager and two follow-ups waiting, an actor and a
// music game on the end screen (over is set), and the week 13 game again from before careers, with no career field.
const V1 = {
  musicMid: {"v":1,"name":"Ada Test","career":"music","bg":"choir","week":13,"energy":3,"energyNext":0,"money":1502390,"fans":3008,"skill":61,"hype":13,"cred":31,"links":73,"rent":100000,"vault":[{"title":"Keke to Heaven","q":51}],"songs":[],"flags":{"blessing":true,"manager":6,"jingle":11,"freeStudio":true,"beef":12,"beefWay":"quiet"},"seen":["houserules","police","mum","cypher","phone","manager","talent","wedding","bisiBooking","jingle","beef"],"promoWeek":0,"lastRelease":0,"recoup":0,"log":[],"over":null,"opener":"The landlord’s wife says she heard you singing. She does not say if she liked it.","slogan":"God’s time is the best"},
  actorOver: {"v":1,"name":"Ada Test","career":"actor","bg":"skits","week":27,"energy":2,"energyNext":0,"money":337993,"fans":23501,"skill":71,"hype":78,"cred":52,"links":57,"rent":140000,"vault":[{"title":"Baba Landlord Returns","q":80},{"title":"Yaba Boys","q":80}],"songs":[{"title":"Two Wives, One Generator","q":51,"week":11},{"title":"Owambe Wahala","q":88,"week":25}],"flags":{"jingle":13,"feud":19,"feudWay":"truce","dec":"paid"},"seen":["houserules","nepa","exposure","agency","couch","yoruba","fees","mum","police","feature","flood","jingle","blog","jingleFallout","rewrite","caterer","feud","kiss","landlord","premieres","feudBack","alaba","phone","skit"],"promoWeek":0,"lastRelease":25,"recoup":0,"log":[],"over":{"kind":"end","title":"Familiar face","rank":2,"week":26,"show":"Your cameo lasts forty seconds. Your family watches it eleven times and claps every time.","verdict":"People stop you at the supermarket in Lekki to ask if you are “that one from the series.” Next year is yours to lose.","notes":["Nobody owns a piece of you. Every kobo that comes next is yours.","You end the year with ₦337,993 to your name."],"chips":[{"t":"+1,330 fans","k":"up"}],"tally":[["Fans","23.5k"],["Money","₦337,993"],["Roles played","2"],["Best role","“Owambe Wahala”"],["Street cred","52 / 100"]]},"opener":"Monday. The generator next door starts before your alarm does.","slogan":"No condition is permanent"},
  musicOver: {"v":1,"name":"Ada Test","career":"music","bg":"street","week":27,"energy":2,"energyNext":0,"money":-113314,"fans":22341,"skill":85,"hype":51,"cred":82,"links":14,"rent":140000,"vault":[{"title":"Monday Morning Hold-Up","q":77}],"songs":[{"title":"Shine Your Eye","q":94,"week":24}],"flags":{"ponzi":15,"ponziIn":100000,"dec":"none"},"seen":["mamaput","phone","talent","wedding","cypher","flood","nepa","fees","feature","investor","ponzi","manager","jingle","mum","ponziBust","okada","landlord","december","samebeat","camp","dance","skit"],"promoWeek":0,"lastRelease":24,"recoup":0,"log":[],"over":{"kind":"end","title":"Buzzing","rank":2,"week":26,"show":"You watch Detty December on your phone, from your room, on low brightness to save battery.","verdict":"Your name rings bells on the mainland and in a few group chats on the Island. Next year is yours to lose.","notes":["Nobody owns a piece of you. Every kobo that comes next is yours.","The streets still claim you. No plaque is worth more.","You end the year owing SapaLoan ₦113,314."],"chips":[],"tally":[["Fans","22.3k"],["Money","−₦113,314"],["Songs released","1"],["Best song","“Shine Your Eye”"],["Street cred","82 / 100"]]},"opener":"Monday. The generator next door starts before your alarm does.","slogan":"Who know {n}? Everybody"},
  legacyMid: {"v":1,"name":"Ada Test","bg":"choir","week":13,"energy":3,"energyNext":0,"money":1502390,"fans":3008,"skill":61,"hype":13,"cred":31,"links":73,"rent":100000,"vault":[{"title":"Keke to Heaven","q":51}],"songs":[],"flags":{"blessing":true,"manager":6,"jingle":11,"freeStudio":true,"beef":12,"beefWay":"quiet"},"seen":["houserules","police","mum","cypher","phone","manager","talent","wedding","bisiBooking","jingle","beef"],"promoWeek":0,"lastRelease":0,"recoup":0,"log":[],"over":null,"opener":"The landlord’s wife says she heard you singing. She does not say if she liked it.","slogan":"God’s time is the best"}
};

const clone = x => JSON.parse(JSON.stringify(x));
const finite = s => ['money', 'fans', 'skill', 'hype', 'cred', 'links', 'rent', 'week'].every(k => Number.isFinite(s[k]));
let checks = 0, failed = 0;
function check(name, fn) {
  checks++;
  try { fn(); console.log('pass  ' + name); } catch (e) { failed++; console.log('FAIL  ' + name + '\n      ' + e.message.split('\n').join('\n      ')); }
}

// Plays the rest of the current season with a simple player that taps any affordable move and any choice.
function playOn(s) {
  while (!s.over && s.week <= G.TOTAL_WEEKS) {
    for (let g = 0; g < 20 && s.energy > 0; g++) {
      const ok = G.ACTIONS.filter(a => a.energy && G.actionState(s, a).ok);
      if (!ok.length || !G.doAction(s, G.R.pick(ok).id)) break;
    }
    const ev = G.pickEvent(s);
    if (ev) {
      const ch = G.val(ev.choices, s), open = ch.map((c, i) => i).filter(i => G.choiceState(s, ch[i]).ok);
      G.choose(s, ev, G.R.pick(open));
    }
    G.wrapWeek(s);
    assert(finite(s), 'broken numbers in week ' + (s.week - 1) + ': ' + JSON.stringify({ money: s.money, fans: s.fans }));
  }
  if (!s.over) s.over = G.finale(s);
  // What the browser does after every change: save as JSON, then load it back.
  assert.deepStrictEqual(G.migrate(clone(s)), clone(s), 'the save changed on a round trip through JSON and migrate');
  return s;
}

G.R.seed(33);

for (const [name, v1] of Object.entries(V1)) {
  check(name + ': a version 1 save migrates to version 2 with nothing lost', () => {
    const m = G.migrate(clone(v1));
    assert(m, 'migrate returned null');
    assert.strictEqual(m.v, 2);
    assert.strictEqual(m.season, 1);
    assert.deepStrictEqual(m.history, []);
    assert.strictEqual(m.career, v1.career || 'music');
    for (const k of Object.keys(v1)) if (k !== 'v') assert.deepStrictEqual(m[k], v1[k], 'field ' + k + ' changed');
  });
  check(name + ': migrating twice changes nothing', () => {
    const m = G.migrate(clone(v1));
    assert.deepStrictEqual(G.migrate(clone(m)), m);
  });
  if (!v1.over) check(name + ': the migrated save plays on to December, and through season 2', () => {
    const s = G.migrate(clone(v1));
    playOn(s);
    assert(s.over && s.over.title, 'no ending');
    if (s.over.kind !== 'end') return; // Sapa won ends the career
    G.newSeason(s);
    playOn(s);
    assert.strictEqual(s.season, 2);
    assert.strictEqual(s.history.length, 1);
  });
}

// A version 1 save on the end screen keeps its ending, and can start season 2 with the carry-over rules of ADR 0010.
for (const name of ['actorOver', 'musicOver']) {
  check(name + ': keeps its ending, starts season 2 with the right carry-over and plays it to the end', () => {
    const v1 = V1[name], s = G.migrate(clone(v1));
    assert.deepStrictEqual(s.over, v1.over, 'the ending changed');
    G.newSeason(s);
    assert.strictEqual(s.season, 2);
    assert.strictEqual(s.week, 1);
    assert.strictEqual(s.over, null);
    assert.deepStrictEqual(s.history, [{ season: 1, title: v1.over.title, rank: v1.over.rank, fans: v1.fans, money: v1.money }]);
    assert.strictEqual(s.fans, Math.round(v1.fans * 0.8), 'fans keep 80%');
    assert.strictEqual(s.hype, 0, 'hype resets');
    for (const k of ['name', 'career', 'bg', 'money', 'skill', 'cred', 'links', 'rent', 'recoup']) assert.deepStrictEqual(s[k], v1[k], k + ' should carry over');
    assert.deepStrictEqual(s.vault, v1.vault, 'the vault stays');
    assert.deepStrictEqual(s.songs.map(x => [x.title, x.q, x.week + 27]), v1.songs.map(x => [x.title, x.q, x.week]), 'songs stay, a year earlier');
    for (const [k, x] of Object.entries(v1.flags)) {
      if (k === 'dec') assert(!('dec' in s.flags), 'the December booking resets');
      else if (typeof x === 'number' && x <= G.TOTAL_WEEKS) assert.strictEqual(s.flags[k], x - 27, 'week flag ' + k + ' moves back a year');
      else assert.deepStrictEqual(s.flags[k], x, 'flag ' + k + ' stays');
    }
    const once = new Set([...G.FOLLOWUPS, ...G.EVENTS.filter(e => e.once === 'career')].map(e => e.id));
    assert.deepStrictEqual(s.seen, v1.seen.filter(id => once.has(id)), 'seen keeps only follow-ups and once-per-career stories');
    playOn(s);
    assert(s.over && s.over.title, 'no ending in season 2');
  });
}

check('a save made by this version, written as version 1, migrates back to the same save', () => {
  for (const career of Object.keys(G.CAREERS)) {
    const s = G.newGame('Test', Object.keys(G.CAREERS[career].backgrounds)[0], career);
    for (let w = 0; w < 6; w++) { const ev = G.pickEvent(s); if (ev) G.choose(s, ev, 0); G.wrapWeek(s); }
    const v1 = clone(s); v1.v = 1; delete v1.season; delete v1.history;
    assert.deepStrictEqual(G.migrate(v1), clone(s));
  }
});

check('anything that is not a save is ignored', () => {
  const ok = V1.musicMid;
  const bad = [null, undefined, 'next-lagos-star', 42, [], {}, { ...clone(ok), v: 3 }, { ...clone(ok), v: undefined },
    { ...clone(ok), name: 7 }, { ...clone(ok), seen: 'x' }, { ...clone(ok), flags: null }, { ...clone(ok), career: 'dancer' }];
  for (const x of bad) assert.strictEqual(G.migrate(x), null, 'accepted ' + String(JSON.stringify(x)).slice(0, 60));
});

// Fields a new game has that a migrated version 1 save does not. The game must cope without them, which the
// play-on checks above test. This is a note, not a failure.
const extra = Object.keys(G.newGame('Test', 'choir', 'music')).filter(k => !(k in G.migrate(clone(V1.musicMid))));
if (extra.length) console.log('note  new games have fields that migrated version 1 saves lack: ' + extra.join(', '));

console.log(`\n${checks - failed} of ${checks} save checks passed.`);
process.exit(failed ? 1 : 0);
