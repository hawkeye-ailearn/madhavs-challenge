# Madhav's Million Coin Challenge — Project Context

A "Who Wants to Be a Millionaire"-style trivia game built for Madhav (2nd grader, age 7-8).
Deployed at: **https://madhavs-challenge.vercel.app**
GitHub: **https://github.com/hari-tr/madhavs-challenge**

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React 19, Vite 8 (beta), plain CSS-in-JS |
| Bundler | Vite + @vitejs/plugin-react |
| PWA | vite-plugin-pwa (fullscreen, autoUpdate) |
| Linting | ESLint 9 + react-hooks + react-refresh plugins |
| Prop types | prop-types v15.8.1 |
| API | Vercel serverless function (`api/ask-claude.js`) |
| AI | Anthropic API — `claude-sonnet-4-20250514`, max_tokens 256 |
| Storage | localStorage key `"madhav_progress"` |
| Deploy | Vercel (auto-deploy from `main` branch) |

---

## Project Structure

```
madhavs-challenge/
├── api/
│   └── ask-claude.js          # Vercel serverless — proxies Anthropic API
├── public/
│   ├── coin.png               # favicon / general coin image
│   ├── coin192.png            # PWA icon 192×192
│   └── coin512.png            # PWA icon 512×512
├── src/
│   ├── main.jsx               # React root mount
│   ├── index.css              # Global reset / base styles
│   ├── Millionaire_Trivia.jsx # Main game component (all UI + logic)
│   ├── questionBank.js        # 50 static questions + buildGameQuestions()
│   └── progressTracker.js     # localStorage progress helpers
├── index.html
├── vite.config.js
├── package.json
└── CLAUDE.md                  # ← this file
```

No `App.jsx` — `main.jsx` renders `<MillionaireTrivia />` directly.

---

## Game Rules

- 10 questions per game
- Questions: Q1-3 Easy → Q4-6 Medium → Q7-9 Hard → Q10 Bonus
- 3 lifelines: 50/50, Ask a Parent (reveals answer), Skip
- Each lifeline usable once per game
- Wrong answer = game over, coins drop to last safe checkpoint
- Coin ladder (with safe checkpoints at levels 3, 6, 9):
  100 → 500 → **1,000** → 5,000 → 10,000 → **25,000** → 50,000 → 100,000 → **250,000** → 1,000,000

---

## Question Strategy

### Static Bank (`src/questionBank.js`)
- 50 questions: 10 per subject × 5 subjects
- Subjects: Math, Science, History, Civics, Reading
- Each question: `{ question, options, answer, subject, difficulty }` (difficulty 1–4)
- `buildGameQuestions()` picks 3 Easy + 3 Medium + 3 Hard + 1 Bonus
- Subject variety enforced across tier boundaries (no same subject back-to-back)

### Adaptive AI Override (`api/ask-claude.js`)
After `buildGameQuestions()` fills all 10 slots, AI questions swap in silently in the background (no loading delay for the player). The number of AI slots grows with experience:

| Games Played | AI Questions | Slots (0-based) |
|---|---|---|
| 1–5 | 2 | [6, 7] |
| 6–15 | 4 | [6, 7, 8, 9] |
| 16–30 | 6 | [4, 5, 6, 7, 8, 9] |
| 31+ | 8 | [2, 3, 4, 5, 6, 7, 8, 9] |

AI questions always use `difficulty: "hard"` so they're age-appropriate but challenging.
The AI call is fire-and-forget — if it fails, the static question stays.

---

## Progress Tracking (`src/progressTracker.js`)

localStorage key: `"madhav_progress"`

```js
{
  gamesPlayed: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  highScore: 0,       // best coinsEarned across all games
  currentStreak: 0,   // always reset to 0 on saveGameResult
  bestStreak: 0,      // best consecutive-correct streak across all games
}
```

Functions:
- `getProgress()` — reads and merges with defaults; never throws
- `saveGameResult({ coinsEarned, correct, total, bestStreakThisGame })` — updates all fields
- `resetProgress()` — removes key from localStorage

---

## Key Components in `Millionaire_Trivia.jsx`

| Component | Purpose |
|---|---|
| `MillionaireTrivia` | Main game state machine |
| `GeekMascot` | Pure HTML/CSS mascot; states: idle / correct / wrong / thinking |
| `StreakCounter` | Shows fire streak badge when `streak >= 2` |
| `DadMessage` | Slides in dad's celebration text on correct answer |
| `PersonalBestBanner` | Shown above question card when player beats their high score mid-game |
| `CheckpointBanner` | Shown when landing on a safe level |
| `CoinBurst` | CSS particle burst on correct answer |
| `AskParentModal` | Lifeline modal that reveals the answer |
| `GameOver` | End screen with full stats |

### Dad Messages
```js
// Shown on correct answer (random pick)
const DAD_MESSAGES = [
  "Wow! Madhav! That was amazing!! 🌟",
  "Kidu Madhav!! 🔥",
  "Super Madhav!! ⭐",
  "You are the bestest!! 🏆",
  "Ente Ammo!! IThaaraa!! 🤩",
  "Madhav oru sambhavam aanallo! 👑",
];

// Shown on game over / wrong answer (random pick)
const DAD_LOSS_MESSAGES = [
  "That's alright!! You did your best, I am proud of you! 💙",
  "You win some...you lose some...so that next time you can win! 💪",
  "You still are the best! 🌟",
];
```

### Subject Colors / Emojis
```js
const SUBJECT_COLORS = { Math: "#FF6B6B", Science: "#51CF66", History: "#FFD43B", Civics: "#74C0FC", Reading: "#F783AC" };
const SUBJECT_EMOJIS = { Math: "🔢", Science: "🌱", History: "🏛️", Civics: "🏙️", Reading: "📚" };
```

---

## Sounds

All sounds synthesized via Web Audio API (no audio files).
Uses `globalThis.AudioContext` (not `window.AudioContext`) per SonarLint S7764.

---

## Deploy Workflow

1. Create feature branch from `main`: `git checkout -b features/<name>`
2. Implement, commit, push
3. Open PR on GitHub → merge to `main`
4. Vercel auto-deploys `main` → live at madhavs-challenge.vercel.app

---

## SonarLint Rules Applied

All 16 SonarLint findings were resolved:
- **S1128** — no unused imports
- **S7764** — `globalThis` instead of `window`
- **S7748** — no trailing zero in float literals (`415.3` not `415.30`)
- **S2486** — non-empty catch blocks (comment explaining intent)
- **S6774** — PropTypes on all components
- **S6479** — no array index as React key (use stable IDs)
- **S3776** — cognitive complexity ≤ 15 (helpers moved outside component)
- **S3358** — no nested ternaries (use helper functions)

---

## What NOT to Do

- Do NOT add `App.jsx` back — it was deleted intentionally
- Do NOT move question logic back into the component
- Do NOT add loading spinners for AI questions — they swap in silently
- Do NOT use `window.*` — use `globalThis.*`
- Do NOT use array index as React key
- Do NOT commit directly to `main` — always use a feature branch + PR
- Do NOT hardcode API keys — use `process.env.ANTHROPIC_API_KEY` (set in Vercel dashboard)

---

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | Vercel dashboard → Environment Variables | Anthropic API auth for `api/ask-claude.js` |
