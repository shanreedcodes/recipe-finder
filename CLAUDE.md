# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

**Step 0 of 10, mostly finished.** `server/index.js` loads `.env` via
`dotenv`, serves `GET /api/health` on port `3001` (from `.env`, `|| 3001`
fallback) returning `{"ok": true}`, and matches `requests.http`. `mode` and
`pointsToday` in the health response, `express.json()`, and the
`server/app.js` decision are deliberately deferred to step 1. See
"Build order" for what is left.

This file records what was decided before the code was written, and why, so the
decisions do not get re-litigated. Everything in "Decided" is settled.
Everything under "Open" is not.

The full build plan lives at
`~/.claude/plans/i-want-to-build-cheerful-frost.md`.

## What this is

A web app that suggests recipes from what is already in your pantry. Ingredient
input, dietary filters, a step-by-step cooking mode with timers and voice, and
saved and shareable recipes. Portfolio project.

It is a sibling of `../project-assistant` and `../study-assistant`, both Python.
This is the first JavaScript project of the three, so their code does not carry
over, but three of their conventions do, marked below.

## How to work in this repo

**Shan writes the code.** Per build step, give the contract (routes, function
signatures, data shapes, and the gotchas) and stop. Review on request. Do not
create or edit source files, scaffolding, or stubs unless explicitly told to.
The point is learning React and Node, not shipping fast.

## Decided

| Decision | Choice | Why |
| --- | --- | --- |
| Frontend | React 19 + Vite | First framework project. Vite proxies `/api` to Express, so no CORS work. |
| Backend | Node 22 + Express 5 | Node 22.23.1, npm 10.9.8, express 5.2.1, dotenv 17.4.2. |
| Recipe API | Spoonacular | Edamam returns no instruction text, only a link to the source site, so Cooking Mode cannot be built on it. Spoonacular's `analyzedInstructions` returns numbered steps with a `length` field, which is the timer. |
| Search endpoint | `complexSearch`, not `findByIngredients` | `findByIngredients` accepts only `ingredients`, `number`, `ranking`, `ignorePantry`. No diet filtering. `complexSearch` takes `includeIngredients` plus `diet` plus `intolerances` and returns instructions in the same call. |
| AI | Anthropic API, `claude-opus-5` | Four jobs: parse pantry text, rank and explain matches, invent a dish, rewrite steps for voice. |
| Module system | ESM (`"type": "module"` in `server/package.json`) | Needed for `import.meta.url` in step 1. Costs mental translation of every tutorial, which are nearly all CommonJS. |
| Repo layout | `server/` and `client/`, one `package.json` each | No workspaces. Two independent installs is less to break. |
| API key handling | Every external call goes through Express | Anything reachable from React is public. `import.meta.env.VITE_*` is compiled into the bundle. |
| Saves | LocalStorage first | Bookmarks work with the server down. Share links come in step 9. |
| Shares | JSON file store behind an interface | Same pattern as `projects_store.py` in `../project-assistant`. |
| Deployment | Out of scope for the first pass | Build it so it runs locally. Same approach as the two siblings. |

## The quota, and what it forces

This is the constraint that shapes the architecture. Measured from Spoonacular's
pricing and docs pages:

| | |
| --- | --- |
| Free tier | 50 points/day, then calls stop |
| Rate limit | 1 request/second, 2 concurrent |
| Attribution | Backlink to spoonacular.com required |
| `complexSearch` | 1 point + 0.01 per result + 0.025 each for `fillIngredients`, `addRecipeInformation`, `addRecipeInstructions` |
| `getRecipeInformation` | 1 point per recipe |
| Nutrient filters (`maxCarbs` and friends) | 1 extra point per call |

A search costs roughly 1.2 to 1.9 points, so the whole day is 25 to 40 searches
covering development, testing, and demoing. Three consequences:

- **One search, not one search plus N detail calls.** Ten results fetched
  individually is 10 points, a fifth of the day. Ask `complexSearch` for
  instructions inline.
- **The disk cache is mandatory**, not an optimization. Re-running a search
  while building the UI must cost zero.
- **Fixture mode exists so the frontend can be built at zero cost.** Spend about
  8 points once to record representative searches, commit them, work against
  them.

**`SPOONACULAR_MODE` defaults to `fixture`, never `live`.** The safe setting is
the one you get by forgetting to set it.

**"Low-carb" is not a diet.** Spoonacular's `diet` parameter is an enum (vegan,
vegetarian, gluten free, ketogenic, paleo, and others) and low-carb is not in
it. Low-carb is `maxCarbs`, a nutrient filter, and any nutrient filter costs a
full extra point, close to doubling the cost of a search. Ketogenic is in the
diet enum and is free.

## Conventions

Three carried from `../project-assistant`:

- **Read `process.env` inside the handler, not at module scope.** Same reason
  `EMBED_BACKEND` is read per call there: a test can flip it, and it sidesteps a
  load-order trap where an import-sorting linter moving `dotenv/config` below
  another import breaks things silently.
- **The diet and intolerance vocabularies live in one module, are served by
  `GET /api/config`, and are never hardcoded in the frontend.** Adding a value
  is a one-line change that reaches every dropdown at once.
- **The stack trace goes to the log, never to the client.** The client gets
  `{"error": "internal server error"}`.

Settled this session:

- **Run the server from the repo root: `node server/index.js`.** `.env` is at
  the root and `dotenv` with no path argument reads `process.cwd()/.env`, so
  `cd server` first and it silently loads nothing. No error, just undefined
  values.
- **Relative imports need the `.js` extension.** ESM requires it: `./app.js`,
  not `./app`. CommonJS allowed the short form; ESM throws
  `ERR_MODULE_NOT_FOUND`.
- **`requests.http` at the repo root is the API test surface**, driven by the
  VS Code REST Client extension (`humao.rest-client`). It is committed and
  doubles as the record of what the API accepts. Note that in PowerShell `curl`
  is an alias for `Invoke-WebRequest` and ignores curl's flags; real curl needs
  `curl.exe`.

## Layout

```
.env                gitignored, currently PORT and NODE_ENV only; API keys,
                    MODE, and ceiling are added in step 1
.env.example        committed, mirrors .env's current keys
requests.http       REST Client requests, the API test surface
CLAUDE.md           this file
README.md           setup sequence
server/
  index.js          entry point: load .env, start the listener
  app.js            does not exist yet; app-construction split, or dropped
                     from the plan, decided in step 1
client/             does not exist yet, step 3 creates it
```

## Build order

0. **Skeleton.** Mostly done. Done: `git init`, `.gitignore`, `.env` and
   `.env.example` (currently `PORT` and `NODE_ENV` only), `server/package.json`,
   `requests.http`, `.env` loaded in `index.js`, `GET /api/health` on `3001`
   returning `{"ok": true}` matching `requests.http`. Deliberately left for
   step 1: `mode`/`pointsToday` in the health response, `SPOONACULAR_API_KEY`/
   `ANTHROPIC_API_KEY`/`SPOONACULAR_MODE`/`DAILY_POINT_CEILING` in
   `.env`/`.env.example`, `express.json()` registration, and a decision on
   `server/app.js`.
1. **The Spoonacular client, offline first.** `spoonacular.js` normalizing to
   an internal `Recipe` shape, `cache.js` on disk, `points.js` as a daily
   ledger, `SPOONACULAR_MODE=live|cache|fixture`, and a fixture recorder.
2. **Express API surface.** `/api/health`, `/api/config`, `/api/search`,
   `/api/recipe/:id`. No AI yet.
3. **React frontend.** Vite, proxy `/api` to Express, pantry input and results.
4. **Dietary filters**, fed from `/api/config`.
5. **The AI layer.** The four jobs, each its own module, route, and cache.
6. **Cooking mode.** Timers from `step.length`, Screen Wake Lock.
7. **Voice.** `speechSynthesis` everywhere, `SpeechRecognition` behind a
   feature check.
8. **Save.** LocalStorage bookmarks, storing the recipe not the id.
9. **Share links.** `POST /api/shares`, `GET /r/:id`, behind a store interface.
10. **Deployment.** Not now.

## Gotchas

- **`analyzedInstructions` is often an empty array.** Do not build Cooking Mode
  assuming it is there. The fallback is a plain `instructions` string that is
  sometimes HTML, which is what the AI step-rewriting job exists to handle.
- **`step.length` is present on only some steps**, so the timer button appears
  conditionally.
- **`fillIngredients=true` is what returns `usedIngredients` and
  `missedIngredients`** on `complexSearch`. Without it the pantry match data,
  which is the premise of the app, is missing from the response.
- **Spoonacular returns 402 when the quota is exhausted, not 429.** Handle it
  separately and say so in the UI.
- **1 request per second, 2 concurrent.** A `Promise.all` over recipe ids fails
  on the free tier. Serialize anything that fans out.
- **`sort=min-missing-ingredients` is referenced in the docs but unverified
  against a live response.** Check it on the first real call and fall back to
  sorting on `missedIngredientCount` if it misbehaves.
- **Express 5 auto-forwards rejected promises** from `async` handlers to the
  error middleware. Express 4 did not. Routes can be `async` and just `throw`,
  with no try/catch and no `next(err)`.
- **Express 5 passes `app.listen()` startup errors to the callback instead of
  throwing them unhandled.** Express 4 and raw `http.Server` invoke the
  callback with no arguments on success and let a bind failure (like
  `EADDRINUSE`) surface as an unhandled `'error'` event. Express 5 attaches
  its own listener and calls the callback with the error as its first
  argument, so `(error) => { if (error) throw error; ... }` is the correct,
  documented pattern on this version, not dead code.
- **Middleware order is execution order.** Specific routes first, the no-path
  catch-all last, the four-argument error handler at the bottom. A catch-all
  above the routes makes every request 404 while the routes still sit visible
  in the file.
- **`JSON.stringify` drops keys whose value is `undefined`.** An unset
  `process.env` value makes a field vanish from a response rather than show as
  null. Use `||` for string settings so an empty string also falls back; use
  `??` only where `0` or `''` are legitimate values, such as
  `DAILY_POINT_CEILING`, where `0` means "do not call the API at all".
- **BOMs are a Python problem, not a Node one.** JavaScript's `\s` matches
  U+FEFF so dotenv eats it, unlike python-dotenv, which cost an hour in
  `../project-assistant`. Where it does still bite is `JSON.parse`, which
  throws on a leading BOM. Only relevant if a fixture or cache file is
  hand-edited, since Node never writes one.
- **An invented recipe must be visually distinct from a real one.** A
  model-written cooking time for chicken is an unverified food-safety claim.
  Label the card, and prompt for doneness cues (internal temperature, a visual
  test) rather than time alone.

## Open

- Which model for the parse job. `claude-opus-5` is the default.
  `claude-haiku-4-5` is $1/$5 per million tokens against Opus 5's $5/$25 and
  the job is simple extraction, so it is a reasonable swap. Shan's call.
- Whether `maxCarbs` is worth the extra point per search for a low-carb filter.
- Whether shares need expiry.
- The exact `diet` and `intolerance` enum values, to be read off
  `spoonacular.com/food-api/docs` in step 4. They are two separate
  vocabularies and a remembered list should not be trusted.
- Whether `server/app.js` becomes the app-construction half of an app/server
  split (which lets tests import the app without binding a port) or gets
  deleted.
