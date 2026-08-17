# MathTech — Application Overview

MathTech is a web-based **digital workbook for Senior High School Mathematics**.
Students work through comic-style lessons and graded quizzes; teachers publish
topics on a schedule and monitor every student's progress in real time.

---

## What it is built from

MathTech is a **MERN** application — MongoDB, Express, React, Node.js — split
into two independently deployable halves.

### Frontend

| Piece | Choice | Why |
|---|---|---|
| UI library | **React 18** | component model for the comic panels and activity types |
| Build tool | **Vite 5** | fast dev server; produces a static bundle |
| Routing | **React Router 6** | client-side routes, guarded by role |
| Server state | **Axios** | one instance that attaches the JWT to every request |
| Local state | **Redux Toolkit** + **React Context** | Redux for submissions/module data, Context for auth and the selected topic |
| Icons | **lucide-react** | the project uses no emojis in the UI |
| Styling | **plain CSS + inline style objects** | no CSS framework; a small token file drives the whole theme |

### Backend

| Piece | Choice | Why |
|---|---|---|
| Runtime | **Node.js 18+** (ES modules) | `"type": "module"` throughout |
| Framework | **Express 4** | REST API only, no server-rendered views |
| Database | **MongoDB** via **Mongoose 8** | schema-per-collection with validation |
| Auth | **jsonwebtoken** (JWT, 7-day expiry) | stateless; no session store needed |
| Passwords | **bcryptjs** | hashed in a Mongoose pre-save hook |
| Config | **dotenv** | five environment variables, documented in `.env.example` |
| CORS | **cors** | a strict allow-list built from `CLIENT_URL` |

### Hosting

- **Frontend → Vercel** (static build; `vercel.json` rewrites all paths to
  `index.html` so client-side routes survive a refresh)
- **Backend → Render** (`render.yaml` blueprint pins the build and start commands)
- **Database → MongoDB Atlas**

---

## Repository layout

```
DigitalWorkbookNavigation/
├── render.yaml                 Render blueprint for the API
├── overview.md                 this file
│
├── backend/
│   ├── .env.example            documents the five required variables
│   └── src/
│       ├── server.js           Express app, CORS, graceful shutdown
│       ├── config/
│       │   ├── database.js     Mongoose connection (fails fast)
│       │   ├── seeder.js       seeds the teacher account
│       │   ├── seedHelper.js   shared, idempotent content seeding
│       │   └── seedTopic{N}Week{M}.js   one file per topic
│       ├── models/             User · Module · Activity · Submission · Progress
│       ├── controllers/        one per resource
│       ├── routes/             one per resource
│       ├── middleware/         protect · teacherOnly · studentOnly · errorHandler
│       └── utils/              generateToken · release (topic-unlock rules)
│
└── frontend/
    ├── vercel.json             SPA rewrite
    ├── .env.example            VITE_API_URL
    ├── assets-source/          full-resolution character art (not deployed)
    ├── public/assets/          web-optimised character PNGs
    └── src/
        ├── api/                one module per backend resource
        ├── components/
        │   ├── comic/          ComicStrip · ComicPanel · ComicDiscussion · CharacterImage
        │   ├── layout/         Sidebar · Navbar · MainLayout
        │   └── shared/         AppLoader · SectionTitle · Loader · Modal · Button
        ├── context/            AuthContext · WorkbookContext
        ├── store/              workbookSlice · submissionSlice
        ├── pages/              one folder per section
        └── styles/             variables.css · global.css · comic.css
```

---

## Data model

Five Mongoose collections.

| Model | Holds | Notes |
|---|---|---|
| **User** | fullname, username, email, password, role | role is `student` or `teacher`; registration always creates a student |
| **Module** | one **topic** — title, objectives, competencies, discussion HTML, concepts, examples, references, `isPublished`, `releaseDate` | one document per topic, not per week |
| **Activity** | question, type, choices, correctAnswer, explanation, points, order, comic config | `correctAnswer` is never sent to the browser |
| **Submission** | graded answers, totalScore, maxScore, percentage, attempt | created server-side on submit |
| **Progress** | `completedSections{}`, lastVisited, attempts | unique per user + module |

Activity types: `multiple_choice`, `fill_blank`, `true_false`, `drag_drop`.

---

## How the pieces fit together

### Student flow

```
Login → Topics → pick a topic → Competencies → Lesson
      → Practice (unscored) → Independent Activity (graded)
      → Feedback (score, answers, explanations) → Review → Progress
```

The **Topics** page is the entry point: it lists every published topic with its
release state and writes the chosen module id to `localStorage`, so the
selection survives a refresh.

### Grading

Grading happens **entirely on the server**. The browser never receives
`correctAnswer`, so it cannot reveal or check answers. On submit, the API
re-reads every activity, compares answers, and writes a `Submission`.

Answer comparison is **maths-aware**: `₱1,234.50`, `1,234.50` and `1234.5` all
match, with a 0.005 tolerance for centavo rounding. Booleans accept both `true`
and the string `"True"` the UI sends.

### Release scheduling

Each topic carries an optional `releaseDate`. Before it passes:

- students still **see** the topic and a live countdown
- the lesson and quiz return **423 Locked** — enforced in the API, not the UI
- teachers bypass the gate entirely so they can prepare content

### Roles

`protect` verifies the JWT on every private route. `teacherOnly` guards all
content-authoring and monitoring endpoints. Students cannot create or edit
modules and activities, and cannot change a release date.

---

## Content

Four topics, grouped into two weeks. Each topic is its own module so it can be
released on its own date.

| Module | Topic |
|---|---|
| Week 1 · Topic 1 | Sigma notation and series |
| Week 1 · Topic 2 | Percentage change and inflation |
| Week 2 · Topic 3 | Profit and loss |
| Week 2 · Topic 4 | Deductions, tax and overtime pay |

Every topic ships with a **6-panel comic discussion**, ~9 key concepts, 4 worked
examples, **4 practice items** (unscored) and **10 graded items** (10 points).

Content lives in code, in `seedTopic{N}Week{M}.js`, and is seeded on server
start. The seeder is idempotent and self-repairing: if a module exists but its
activity count is wrong, it rebuilds the activities rather than skipping.

---

## Design system

A comic/manga aesthetic built on a mathematics theme.

- **Surfaces** — cream graph paper background, white grid-paper cards, navy
  chalkboard panels
- **Palette** — `--board` navy, `--paper` cream, `--teal` accent, plus yellow /
  red / green for state
- **Type** — Fredoka One (headings), Nunito (body), JetBrains Mono (numbers,
  equations, code-style labels)
- **Borders** — hard offset shadows (`3px 3px 0`), no blur, no rounded corners
- **Icons** — lucide-react only; no emojis anywhere in the UI

The lesson `discussion` field is authored as HTML with `<h3>Panel N — Title</h3>`
headings and `<strong>Name:</strong>` dialogue. `ComicDiscussion` parses that at
runtime into real panels with speech bubbles and character portraits, so new
content becomes comic-style automatically.

---

## Running locally

**Prerequisites:** Node.js 18+, MongoDB running on `localhost:27017`.

```bash
# backend  → http://localhost:5000
cd backend
npm install
cp .env.example .env      # then edit the values
npm run dev

# frontend → http://localhost:5173
cd frontend
npm install
cp .env.example .env
npm run dev
```

On first start the backend seeds the teacher account and all four topics.

### Environment variables

**backend/.env**

| Variable | Purpose |
|---|---|
| `NODE_ENV` | must be `production` when deployed — it is what hides stack traces |
| `PORT` | local only; Render injects its own |
| `MONGO_URI` | local MongoDB or an Atlas SRV string |
| `JWT_SECRET` | long random string; use a different one in production |
| `CLIENT_URL` | exact frontend origin, no trailing slash |

**frontend/.env**

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | e.g. `https://your-api.onrender.com/api` — baked in at **build** time, so a change needs a redeploy |

---

## Startup behaviour

`AppLoader` gates the app until the things it needs are ready: web fonts,
character artwork, and a `/health` ping. Progress reflects real downloads rather
than a fixed timer, so a fast connection clears it almost instantly. Every step
resolves even on failure, and a 25-second ceiling guarantees the app always
opens. If the API is slow to answer it shows a "waking up the server" hint,
because Render's free tier sleeps after 15 minutes idle.

---

## Known gaps

Recorded honestly so nobody rediscovers them the hard way.

- **Unused dependencies.** `socket.io-client` (frontend) and `helmet`,
  `express-rate-limit`, `joi`, `mongodb` (backend) are installed but never
  imported. Real-time updates use 30-second polling, not websockets.
- **`drag_drop` is not implemented in the UI.** The type exists in the schema
  and the grader handles it, but no activity component renders it.
- **The teacher password is hard-coded** in `config/seeder.js` and reaches
  production through the repo. It should move to an environment variable.
- **The seeder's existence check and the account it creates use different
  usernames**, so on a database that already has the old teacher the new one is
  never created.
- **`discussion` is rendered with `dangerouslySetInnerHTML`.** Module writes are
  now `teacherOnly`, which closes the injection path, but the content is still
  trusted rather than sanitised.
- **No automated test suite.** `jest` and `supertest` are installed; no tests
  are written.
- **Removed URLs are not redirected.** `/activities/interactive` was renamed to
  `/activities/independent`; the old path renders a blank page because the app
  has no 404 route.
