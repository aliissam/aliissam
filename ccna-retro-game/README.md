# CCNA Arcade

A retro arcade-style quiz game for studying the **CCNA 200-301** exam.
Pure HTML/CSS/JS, no build step, no dependencies — just open `index.html`
or serve the folder statically.

## Play it

```bash
cd ccna-retro-game
python3 -m http.server 8000
# open http://localhost:8000
```

Or host it as-is on GitHub Pages, Netlify, Vercel, etc. — it's fully static.

## How it works

- **6 worlds**, one per official CCNA 200-301 exam domain: Network
  Fundamentals, Network Access, IP Connectivity, IP Services, Security
  Fundamentals, and Automation & Programmability.
- Each world is a run of quiz questions (arcade-style: score, combo
  streak, 20-second timer per question, 3 lives) ending in a **boss
  question** worth double points.
- Clearing a world unlocks the next one. Progress, best scores per world,
  and a top-10 high score table persist in `localStorage`.
- Retro CRT look (scanlines, glow, pixel font) and 8-bit-style sound
  effects generated live via the Web Audio API — no audio files needed.

## Files

```
index.html       Markup for all screens (title, world select, gameplay, etc.)
css/style.css     CRT/arcade visual theme
js/questions.js   Question bank (66 questions across 6 domains)
js/game.js        Game state machine, scoring, audio, persistence
```

## Adding or editing questions

Edit `js/questions.js`. Each level is:

```js
{
  id: "fundamentals",
  name: "NETWORK FUNDAMENTALS",
  icon: "...",
  questions: [
    { q: "...", options: ["a", "b", "c", "d"], answer: 1 },
    // ...
    { q: "...", options: [...], answer: 2, boss: true }, // last question of the level
  ],
}
```

Exactly one question per level should have `boss: true`, and it should be
the last one in the array — it's worth double points and gets a special
on-screen banner.

This is a fan-made study aid, not affiliated with or endorsed by Cisco.
