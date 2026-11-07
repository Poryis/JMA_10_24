import fs from 'fs';
const facts = fs.readFileSync('src/data/musicFacts.js','utf8').replace(/^export /gm,'').replace(/\/\/ Get a random fact[\s\S]*$/,'');
const src = fs.readFileSync('src/data/voiceLines.js','utf8')
  .replace(/^import .*$/gm,'')
  .replace(/^export /gm,'')
  .replace(/export function[\s\S]*$/,'');
const mod = {};
new Function('mod', facts + '\n' + src + '\nmod.VOICE_CHARACTERS=VOICE_CHARACTERS; mod.VOICE_LINES=VOICE_LINES;')(mod);
const { VOICE_CHARACTERS: C, VOICE_LINES: L } = mod;
let out = `# JMA Voice Recording Script\n\n`;
out += `**${L.length} lines · ${Object.keys(C).length} voices.** Lou never speaks. **Sharky IS Finn Danger — the same shark, one voice.** Stew can be performed as kazoo-talk.\n\n`;
out += `## How to record\n- One short take per line, 1–3 seconds. Leave ~150 ms of silence at the start, trim the tail.\n- Export **MP3, mono, 44.1 kHz, ~96 kbps**, normalized to about **−3 dBFS** peak.\n- File name = the \`id\` column exactly, plus \`.mp3\` (e.g. \`doctor.correct.2.mp3\`).\n- Drop files into \`frontend/public/assets/voice/\`. Missing files are skipped silently, so record in any order.\n- Numbered takes (\`.1 .2 .3\`) are variants of the same moment — the app picks one at random, so vary the delivery.\n- Keep the *energy* in the "Emotion" column; the words are short on purpose — the voice does the work.\n- **Kudos** (cheers, \"miss\" lines, \"keep going\" lines) are rationed in the app: at most one every 15 seconds across all games, so each take will be heard on its own.\n- **How-to lines** (\`howto\`) play once when a kid opens that game, right after the host's tagline, and again when the kid taps a How to Play speaker button (where the game has one). These run 3–5 seconds — say them slowly and clearly, many listeners can't read yet.\n\n`;
const HEAD = out;
for (const [key, c] of Object.entries(C)) {
  const lines = L.filter(l => l.char === key);
  out += `---\n\n## ${c.name} — ${lines.length} lines\n**Rooms:** ${c.role}  \n**Voice:** ${c.vibe}\n\n| # | File (id) | Line | Emotion | Plays when |\n|---|---|---|---|---|\n`;
  lines.forEach((l, i) => { out += `| ${i+1} | \`${l.id}\` | **${l.text}** | ${l.emotion} | ${l.where} |\n`; });
  out += '\n';
}
fs.writeFileSync('/app/memory/voice_script.md', out);
fs.writeFileSync('public/voice-script.md', out);
const ch = L.filter(l => l.char === 'charlie');
const group = (l) => l.id.includes('.howto.') ? 'How-to instructions' : /\.(correct|perfect|miss|go)\./.test(l.id) || l.id.startsWith('charlie.shred.') ? 'Reactions & Shred City calls' : l.id.includes('.quest.') ? 'Quest nudges' : 'Host lines, taglines & big moments';
let cs = HEAD.replace('# JMA Voice Recording Script', '# JMA Voice Script — Charlie the Polliwog').replace(/\*\*\d+ lines · \d+ voices\.\*\*[^\n]*\n/, `**${ch.length} lines for Charlie.** ${C.charlie.vibe}\n`);
for (const g of ['How-to instructions', 'Host lines, taglines & big moments', 'Reactions & Shred City calls', 'Quest nudges']) {
  const ls = ch.filter(l => group(l) === g);
  cs += `---\n\n## ${g} — ${ls.length} lines\n\n| # | File (id) | Line | Emotion | Plays when |\n|---|---|---|---|---|\n`;
  ls.forEach((l, i) => { cs += `| ${i+1} | \`${l.id}\` | **${l.text}** | ${l.emotion} | ${l.where} |\n`; });
  cs += '\n';
}
fs.writeFileSync('/app/memory/voice_script_charlie.md', cs);
fs.writeFileSync('public/voice-script-charlie.md', cs);
fs.writeFileSync('public/assets/voice/README.md', `Drop recorded lines here as <id>.mp3 — see /app/memory/voice_script.md for the full list.\n`);
console.log(L.length, 'lines written');
