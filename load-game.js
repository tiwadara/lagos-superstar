// Loads the game's rules into Node for the tools (simulate.js, lint-stories.js, test-saves.js, try-story.js).
// It runs the page's scripts in the order index.html loads them: <script src="stories.js"> first, then the
// game script, as one function so they share names the way a page's scripts do. The interface block skips
// itself because there is no document. loadGame(['newGame', 'EVENTS']) returns an object with those names.
const fs = require('fs');
const path = require('path');

function loadGame(names, root = __dirname) {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const parts = [...html.matchAll(/<script(?: src="([^"]+)")?>([\s\S]*?)<\/script>/g)]
    .map(m => m[1] ? fs.readFileSync(path.join(root, m[1]), 'utf8') : m[2]);
  return new Function(parts.join('\n') + '\nreturn { ' + names.join(', ') + ' };')();
}

module.exports = { loadGame };
