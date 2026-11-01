# Project Audit — health_project-master

Read-only audit. No source file was modified, moved, or deleted while producing this document. This file is the only file created by this audit.

Note on paths: the repository is nested one level — the actual Next.js project root is `D:\health_project-master\health_project-master\`, inside an outer folder `D:\health_project-master\` that itself contains an unrelated, unrelated-in-git-history minimal `package.json`/`package-lock.json` pair (see Section 5). All paths below are relative to the inner project root (`D:\health_project-master\health_project-master\`) unless stated otherwise.

---

## 1. Project overview

**Framework**: Next.js `^15.5.10` (installed/resolved version confirmed by the build log: `Next.js 15.5.15`), App Router (the project has an `app/` directory with `page.js`/`layout.js` files; there is no `pages/` directory anywhere in the tree).

**Language**: JavaScript (JSX). There is no TypeScript anywhere — no `.ts`/`.tsx` files, no `tsconfig.json`. Path aliasing is configured via `jsconfig.json` (`@/*` → `./*`).

**Package manager**: npm (a `package-lock.json`, lockfileVersion 3, is present; no `yarn.lock` or `pnpm-lock.yaml`).

**Node version**: Not declared anywhere in `package.json` (no `engines` field). The `Dockerfile` pins `node:18-alpine`. The environment this audit ran in has Node `v24.15.0` / npm `11.12.1` installed.

### Dependencies (from the live `package.json` at the project root)

**Runtime (`dependencies`)**:

| Package | Declared version |
|---|---|
| `@prisma/client` | `^5.14.0` |
| `@upstash/redis` | `^1.38.0` |
| `@vercel/blob` | `^2.4.0` |
| `@vercel/kv` | `^3.0.0` |
| `bcryptjs` | `^3.0.3` |
| `jose` | `^6.2.3` |
| `jspdf` | `^4.2.1` |
| `jspdf-autotable` | `^5.0.7` |
| `lucide-react` | `^1.8.0` |
| `next` | `^15.5.10` |
| `nodemailer` | `^8.0.7` |
| `pdf-lib` | `^1.17.1` |
| `qrcode` | `^1.5.4` |
| `react` | `^19.0.0` |
| `react-dom` | `^19.0.0` |

**Dev (`devDependencies`)**:

| Package | Declared version |
|---|---|
| `prisma` | `^5.22.0` |

Notable: `@upstash/redis` and `@vercel/kv` are declared but no source file under `app/`, `components/`, `context/`, `lib/`, or `scripts/` imports `@upstash/redis` or `@vercel/kv` (grep across the codebase found zero matches for either package name outside `package.json`/`package-lock.json`). There is also no `eslint` / `eslint-config-next` dependency despite a `lint` script existing (see below).

`package.json` also carries `"version": "env"` — not a valid semver string.

### npm scripts

| Script | Command | What it does |
|---|---|---|
| `dev` | `next dev` | Starts the Next.js dev server. |
| `build` | `next build` | Production build (see build result below). |
| `start` | `next start` | Runs the built app in production mode. |
| `lint` | `next lint` | Runs Next.js's ESLint integration — but no ESLint package or config is installed (see Section 11), so this would prompt to install ESLint on first run. |
| `db:init` | `prisma migrate dev --name init && node scripts/init-db.js` | Runs a Prisma migration then seeds an `admin`/`admin` account and two sample reviewers via `scripts/init-db.js`. |
| `db:push` | `prisma db push` | Pushes the current `schema.prisma` state to the database without creating a migration file. |
| `db:studio` | `prisma studio` | Opens Prisma's local data-browser UI. |
| `db:reset` | `prisma migrate reset` | Drops and recreates the database from migrations (destructive). |

### Build result

Ran `npm run build` twice (once via the Bash tool, once via PowerShell, from the project root). Both runs produced the identical outcome:

```
⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
We detected multiple lockfiles and selected the directory of D:\health_project-master\package-lock.json as the root directory.
...
▲ Next.js 15.5.15
- Environments: .env

Creating an optimized production build ...
✓ Compiled successfully in 6.6s–23.8s
  Linting and checking validity of types ...
  Collecting page data ...
  Generating static pages (0/23) ...

> Build error occurred
[Error: spawn UNKNOWN] {
  errno: -4094,
  code: 'UNKNOWN',
  syscall: 'spawn'
}
```

So: **TypeScript/JS compilation succeeds** ("Compiled successfully"), but the build then fails during the "Generating static pages" phase with `Error: spawn UNKNOWN` (`errno: -4094`), before any of the 23 discovered routes are actually rendered. This is Next.js failing to spawn the worker process it uses for static generation.

UNCERTAIN: whether `spawn UNKNOWN` is caused by something in this project's code/config, or is specific to the sandboxed shell environment this audit ran in (both the Bash tool and PowerShell in this environment produced the identical error, which is at least consistent, but I could not test in an unrestricted shell to rule out an environment-level restriction on spawning child processes). What is certain and directly observed: the build never got past "Generating static pages (0/23)" in either terminal used here, so no production `.next` output was produced.

The build also prints an unrelated warning about "multiple lockfiles" — see Section 5 for the duplicate `package.json`/`package-lock.json` this refers to.

---

## 2. Full file tree

Excludes `node_modules/`, `.next/`, `.git/`. Line counts are `wc -l` (text files); binary/data files are marked `[binary]` with their byte size instead. `.claude/` (created by this audit's own tooling, auto-removed) is not part of the project and is excluded.

```
health_project-master/
├── .dockerignore                                    6
├── .env                                              6   (tracked by git — see Section 10)
├── .env.example                                     16
├── .gitignore                                       40
├── .vercel/
│   ├── README.txt                                   11
│   └── repo.json                                    11
├── API_DOCUMENTATION.md                             220
├── DEPLOYMENT_CHECKLIST.md                          121
├── Dockerfile                                        62
├── README.md                                        128
├── SETUP_GUIDE_AR.md                                211
├── START_HERE.md                                    308
├── app/
│   ├── about/page.js                                 30
│   ├── api/
│   │   ├── abstracts/
│   │   │   ├── [id]/route.js                         25
│   │   │   └── route.js                             211
│   │   ├── admin/route.js                            189
│   │   ├── auth/
│   │   │   ├── login/route.js                        102
│   │   │   └── setup/route.js                         33
│   │   ├── certificate/route.js                      128
│   │   ├── gallery/
│   │   │   ├── image/route.js                         36
│   │   │   ├── media/route.js                         85
│   │   │   ├── save/route.js                          20
│   │   │   ├── screens/route.js                      153
│   │   │   ├── signed-url/route.js                    24
│   │   │   └── upload/route.js                        53
│   │   ├── library/
│   │   │   ├── route.js                              182
│   │   │   └── upload/route.js                       109
│   │   ├── news/route.js                             130
│   │   ├── questions/route.js                         36
│   │   ├── register/route.js                          28
│   │   ├── send_email/route.js                        42
│   │   └── users/route.js                             30
│   ├── dashboard/
│   │   ├── gallery/page.js                           471
│   │   ├── layout.jsx                                285
│   │   ├── library/page.jsx                          508
│   │   ├── news/page.js                              498
│   │   ├── p                                           0   (0-byte empty file, no extension — see Section 5)
│   │   ├── page.jsx                                  502
│   │   └── submission/page.js                        272
│   ├── favicon.ico                                       [binary, 25,931 bytes]
│   ├── globals.css                                   249
│   ├── layout.js                                       28
│   ├── lib/prisma.js                                   10   (dead — see Section 5)
│   ├── lif/page.js                                     26   (orphan route — see Section 5)
│   ├── live/page.js                                   669
│   ├── login/page.jsx                                 294
│   ├── media/page.js                                  489
│   ├── page.js                                       3291
│   ├── page.module.css                                318   (dead — unused, see Section 5)
│   ├── participation/page.js                          343
│   ├── program/page.js                                618
│   └── registration/page.js                            63
├── components/
│   ├── ClientNavbar.js                                241
│   ├── Navbar.js                                        0   (0-byte empty file — dead, see Section 5)
│   └── NavbarWrapper.jsx                                 7   (dead — see Section 5)
├── config.js                                          172   (dead — imported nowhere, see Section 5/9)
├── context/LangContext.js                              18
├── data/
│   ├── abstracts.json                                 137   (dead — imported nowhere)
│   ├── gallery-media.json                              10   (dead)
│   ├── gallery-screens.json                            42   (dead)
│   ├── library.json                                    28   (dead)
│   └── news.json                                        0   (dead; content is literally "[]")
├── dev.db                                                  [binary, SQLite DB, 32,768 bytes]
├── jsconfig.json                                         7
├── lib/prisma.js                                        11   (the live Prisma singleton — see Section 5)
├── next.config.js                                        1   (the live config file — effectively empty, see Section 5)
├── next.config.mjs                                      18   (dead — never loaded, see Section 5)
├── package-lock.json                                  1817
├── package.json                                         35
├── prisma/
│   ├── dev.db                                             [binary, SQLite DB, 40,960 bytes]
│   ├── migrations/
│   │   ├── 20260425074603_init/migration.sql             43
│   │   └── migration_lock.toml                            2   (pins provider = "sqlite" — see Section 6)
│   └── schema.prisma                                    116   (datasource provider = "mysql" — see Section 6)
├── public/
│   ├── 24 image/photo files (.jpg/.jpeg/.png/.webp)        [binary — sizes range ~900 bytes to ~2.9 MB]
│   ├── Conferance_abstract_.docx                          [binary, 15,745 bytes — filename typo, referenced from app/participation/page.js]
│   ├── promo-video.mp4                                    [binary, 2,284,059 bytes]
│   ├── تجميع.mp4 ("collection.mp4")                        [binary, 47,728,000 bytes — untracked by git]
│   ├── next.svg, vercel.svg                                 0 lines each (SVG source, effectively empty per wc -l due to no trailing newline / minimal content)
│   └── uploads/
│       ├── 8 PDF files directly under uploads/               [binary, 94 KB–1.24 MB each]
│       ├── gallery/ — 4 PNG files                            [binary, 825 bytes–2.1 MB each]
│       ├── library/ — 2 PDF files                            [binary, 643 KB & 697 KB]
│       └── research/
│           ├── 15 PDF files (several exact-duplicate filenames with different upload timestamps)  [binary]
│           ├── Mazen_Soliman_Safi.jpg                        [binary, 17 bytes — effectively a stub/corrupt image]
│           └── README.txt                                    4   (instructs someone to manually place a doctor.jpg here)
├── scripts/
│   ├── create-media-admin.js                            57
│   ├── init-db.js                                        55
│   ├── quick-start.js                                   140
│   ├── setup.bat                                         68
│   └── setup.sh                                          61
├── structure.sql                                         85   (duplicates the single Prisma migration's SQL — see Section 5)
└── test-prisma.js                                        14
```

Total non-`node_modules`/`.next`/`.git` files enumerated: 156.

---

## 3. Routes map

### Pages (App Router, all under `app/`)

| URL path | File |
|---|---|
| `/` | `app/page.js` |
| `/about` | `app/about/page.js` |
| `/dashboard` | `app/dashboard/page.jsx` |
| `/dashboard/gallery` | `app/dashboard/gallery/page.js` |
| `/dashboard/library` | `app/dashboard/library/page.jsx` |
| `/dashboard/news` | `app/dashboard/news/page.js` |
| `/dashboard/submission` | `app/dashboard/submission/page.js` |
| `/lif` | `app/lif/page.js` |
| `/live` | `app/live/page.js` |
| `/login` | `app/login/page.jsx` |
| `/media` | `app/media/page.js` |
| `/participation` | `app/participation/page.js` |
| `/program` | `app/program/page.js` |
| `/registration` | `app/registration/page.js` |

Note: `app/dashboard/page.jsx`'s own `ROLE_CONFIG`/`PAGE_META` data (defined in `app/dashboard/layout.jsx`) references a `/dashboard/users` route (label "إدارة المستخدمين") for the `admin` role's page list, but no `app/dashboard/users/` directory or `page.jsx` exists — that link is broken (404) if clicked. See Section 10.

### API routes (all under `app/api/`)

| Methods | URL path | File | What it does |
|---|---|---|---|
| GET, POST, PUT | `/api/abstracts` | `app/api/abstracts/route.js` | POST accepts a multipart abstract submission (PDF), uploads it to Vercel Blob, creates an `Abstract` row, and emails the submitter + committee via Nodemailer/Gmail SMTP. GET lists all abstracts. PUT updates an abstract's `status` and emails the submitter the accept/reject decision. |
| PUT | `/api/abstracts/[id]` | `app/api/abstracts/[id]/route.js` | Updates one abstract's status by numeric `id` (dynamic segment) — a second, narrower status-update endpoint that duplicates part of the PUT handler above but does not send email. |
| GET, POST, PUT, DELETE | `/api/admin` | `app/api/admin/route.js` | Full CRUD for `Admin` accounts, gated by an `x-admin-token` header check; passwords hashed with `bcryptjs`. DELETE refuses to remove the last remaining admin. |
| POST | `/api/auth/login` | `app/api/auth/login/route.js` | Looks up an `Admin` by username, verifies the password with `bcrypt.compare`, and issues a signed JWT (via `jose`) containing `{id, name, role}`, with `role` derived from the username (`media_admin`→`media`, `doctor_admin`→`doctor`, else `admin`). |
| POST | `/api/auth/setup` | `app/api/auth/setup/route.js` | One-time bootstrap endpoint: if the request body's `setupKey` matches a hardcoded string (`'setup_samoud_2026_once'`), creates a default `admin`/`Admin@2026` account if none exists yet. |
| GET | `/api/certificate` | `app/api/certificate/route.js` | Looks up a `User` by `email` query param, generates a PDF attendance certificate (via `pdf-lib`) with an embedded QR code (via `qrcode`) linking to a `/verify?id=` URL, and streams it back as a PDF download. |
| GET | `/api/gallery/image` | `app/api/gallery/image/route.js` | Proxies/re-streams a private Vercel Blob image URL (appends the blob token as a query param and forwards the response), used to work around private-blob access from `<img>` tags. |
| GET, POST, DELETE | `/api/gallery/media` | `app/api/gallery/media/route.js` | Reads/writes a local JSON file `gallery-db.json` (via `fs`) in the project's working directory — **not** Prisma/the `GalleryMedia` model. GET lists items; POST appends a new item (with cleanup of malformed entries); DELETE removes by `id`. |
| POST | `/api/gallery/save` | `app/api/gallery/save/route.js` | A second, unauthenticated writer to the same `gallery-db.json` file — appends an item without the malformed-entry cleanup that `media/route.js`'s `readDb()` does. |
| GET, POST, PATCH, DELETE | `/api/gallery/screens` | `app/api/gallery/screens/route.js` | Full CRUD for the Prisma `GalleryScreen` model (the "interactive screens" shown on `/media`), gated by `x-admin-token` for write methods. |
| GET | `/api/gallery/signed-url` | `app/api/gallery/signed-url/route.js` | Returns a time-limited (1 hour) signed download URL for a given Vercel Blob URL via `@vercel/blob`'s `getDownloadUrl`. |
| POST | `/api/gallery/upload` | `app/api/gallery/upload/route.js` | Uploads an image file to Vercel Blob (public), gated by `x-admin-token` (with a hardcoded fallback token `"samoud2025"`); returns the resulting URL under five different aliased JSON keys (`url`, `imageUrl`, `image`, `link`, `path`) "so the frontend picks up whichever key it expects." |
| GET, POST, PATCH, DELETE | `/api/library` | `app/api/library/route.js` | Full CRUD for the Prisma `Library` model. GET returns all items to admins (token-gated) or only `published: true` items to the public. POST accepts a multipart PDF, uploads to Vercel Blob, creates a `Library` row. DELETE also deletes the associated blob file via `@vercel/blob`'s `del`. |
| POST, OPTIONS | `/api/library/upload` | `app/api/library/upload/route.js` | A separate file-upload endpoint (distinct from the POST on `/api/library`) restricted to document MIME types (PDF/Word/PowerPoint/Excel/zip) and 20 MB, uploads to Vercel Blob under `library/`, token-gated. Also answers CORS preflight `OPTIONS` requests. |
| GET, POST, PATCH, DELETE | `/api/news` | `app/api/news/route.js` | Full CRUD for the Prisma `News` model. GET is public/unauthenticated; POST/PATCH/DELETE are gated by `x-admin-token` (with a hardcoded fallback `"samoud2025"`). |
| GET, POST | `/api/questions` | `app/api/questions/route.js` | Lists/creates `Question` rows (used by the live Q&A feature on `/live`). **No `[id]`/`like` sub-route exists** even though `app/live/page.js` calls `POST /api/questions/${id}/like` — see Section 10. |
| POST | `/api/register` | `app/api/register/route.js` | Creates a `User` row after checking the email isn't already registered. |
| POST | `/api/send_email` | `app/api/send_email/route.js` | Sends an accept/reject notification email via Nodemailer, independent of (and overlapping with) the email logic already inside `/api/abstracts`'s PUT handler. |
| GET | `/api/users` | `app/api/users/route.js` | Lists users, `select`-ing `{id, fullName, title, institution, createdAt}` — **`title` and `institution` are not fields on the `User` model** in `prisma/schema.prisma` (see Section 6/10); this would raise a Prisma validation error at request time. |

### Layouts, middleware, loading/error boundaries

- `app/layout.js` — root layout for the whole app; wraps everything in `LangProvider` and renders `ClientNavbar`.
- `app/dashboard/layout.jsx` — scoped to `/dashboard/*`; client-side auth gate (reads a JWT from `localStorage`, decodes it without verifying the signature, redirects to `/login` if absent/expired) plus the dashboard's top navbar and `AuthContext`.
- No `middleware.js` exists anywhere in the project.
- No `loading.js`, `error.js`, or `not-found.js` exists anywhere in the project (confirmed by an exhaustive filename search).

### Dynamic segments

Only one: `app/api/abstracts/[id]/route.js` (`[id]`, numeric, `parseInt`'d). No catch-all (`[...slug]`) or optional-catch-all (`[[...slug]]`) segments exist anywhere in the project.

---

## 4. Large files (over 200 lines, largest first)

For each: the breakdown below is derived from a full read of the file. Because nearly every file in this project styles elements via inline `style={{...}}` objects rather than CSS classes, "JSX" and "inline CSS" are frequently inseparable at the line level — where that's the case it's called out explicitly rather than force-split into two numbers.

### `app/page.js` — 3,291 lines

- **Imports/setup**: lines 1–5.
- **Business logic / helpers**: `proxyImg()` (7–13), `getOrgCards(isRtl)` (15–22), `useBreakpoint()` hook (401–417) — roughly 30 lines total, plus ~180 lines of hooks/handlers inside `Home()` (912–1089: `useState`×20, `useEffect`×9, `useRef`×5, `useMemo`×5).
- **Data/constants**: `B`/`R`/`G` color constants and `STAT_ICONS`/`STAT_COLORS`/`TARGETS` (24–30); `MEDIA_ITEMS_FALLBACK` array of 10 gallery items (31–102); the `TRANSLATIONS` object (104–399, ~296 lines) holding the full Arabic and English copy for the page (titles, stats labels, president/supervisor bios with contact info, 3 committees each with a nested head bio, 3 news items, quick links, footer strings); local `TIERS`/`BENEFITS` arrays (≈1102–1129) for a sponsorship section. Total data/constants ≈ 405 lines.
- **Inline `<style>` block**: lines 1743–1795 (~51 lines of real CSS: a Google Fonts import, a box-sizing reset, and roughly 15 `@keyframes` animations plus a handful of classes/media queries). This is the only `<style>` tag in the file.
- **JSX markup fused with inline `style={{}}` objects**: the remaining ~2,450–2,500 lines — this is the dominant content of the file.
- **Exported symbols**: `export const dynamic = "force-dynamic";` (line 4) and `export default function Home()` (line 912). No other exports.
- **React components defined in this single file**: `ParticlesBackground` (419–491, canvas particle animation), `Avatar` (493–524), `PresidentQuoteSlide` (526–710), `NewsTicker` (712–910), `IconGlyph` (1131–1163, nested inside a `useMemo` inside `Home`), and `Home` itself (912–3291). None except `Home` are exported — they exist only for internal reuse within this one file.
- **Which other files import it**: none — this is the `/` route's `page.js`, loaded by Next.js's file-system router, not via a JS `import`.
- **Notable data inconsistency found while reading**: the Arabic and English committee-head bios for the same person disagree — the Arabic block (lines 177–178) lists `email: "drmnali@gmail.com"`, `phone: "+972-56-703-3314"` while the English block (lines 332–333) lists a different `email: "sheikh@medical.edu"`, `phone: "+970-8-2816-3030"` for what is presented as the same committee head.
- **Hardcoded contact PII embedded in the data**: several named individuals' email addresses and phone numbers are hardcoded directly into `TRANSLATIONS` (lines 137–138, 147–148, 162–163, 177–178/332–333, 192–193).
- **Repeated JSX**: the "person" and "committee head" modal variants (2629–2874 vs 2883–3109) are near-duplicate ~150–250-line blocks; the `ui-avatars.com` fallback-avatar URL is copy-pasted 4 times (lines 519, 578, 2681, 2925).

### `app/live/page.js` — 669 lines

- **Imports/directive**: lines 1–4.
- **Business logic**: `useState`×6, `useRef`×1 (7–14); `colors` (16–20) and `content` (22–55, bilingual UI strings) — both declared *inside* the component body, so re-created every render; `fetchQuestions` (60–77), a 5-second polling `useEffect` (79–83), an auto-scroll `useEffect` (85–87), `handleSendQuestion` (90–115), `handleLike` (118–129). Total logic+data ≈ 124 lines.
- **Inline `<style>` block**: lines 133–532 — ≈400 lines, the largest single section of the file (Google Fonts import, resets, `.navbar`, `.live-badge`, keyframes `pulse`/`drift`/`float`/`slideIn`, `.stat-card`, `.video-panel`, `.qa-panel`, message-bubble and form/input styles, `.footer`).
- **JSX markup**: lines 534–669 (≈136 lines).
- **Exported symbols**: `export default function LivePage()` (line 6) only.
- **Components defined**: only `LivePage` itself — no sub-components.
- **Which other files import it**: none (routed by file convention as `/live`).
- **Notable defect**: calls `POST /api/questions/${questionId}/like` (line 120) and links to `/dashboard/submissions` (line 539, plural) — neither target exists (see Section 10).

### `app/program/page.js` — 618 lines

- **Top-level constants**: `B`/`R`/`G` (line 6); `PROGRAM` (18–175, ≈158 lines) — a true module-level bilingual object, each language holding 2 "day" objects with 5–6 session objects apiece (type/time/title/description/tags).
- **Business logic**: `useBreakpoint()` custom hook (178–190); inside `Program()` — `useState`×3, one `useEffect` fetching `/api/library` (392–398).
- **Components defined**: `SessionCard` (193–307, 115 lines — mixes ternary-chain color logic with inline-styled JSX), `LibraryItem` (310–376, 67 lines), `Program` (379–618, the default-exported page).
- **Inline `<style>` block**: lines 413–439 (≈27 lines: Google Fonts import, keyframes `ecg`/`slideUp`/`pulse`, a few hover/media rules) — on top of that, nearly every element in `SessionCard`/`LibraryItem`/`Program` carries its own inline `style={{}}` object (roughly another 150–200+ lines of CSS-as-JS spread through the JSX).
- **Exported symbols**: `export default function Program()` only. `SessionCard`, `LibraryItem`, `useBreakpoint`, and `PROGRAM` are all module-private.
- **Which other files import it**: none (routed as `/program`).
- **Repeated patterns**: `PROGRAM.ar` and `PROGRAM.en` mirror each other structurally (≈78 lines each); the color/accent ternary chain in `SessionCard` (205–220) repeats the same `isQuiz ? … : isOpening ? … : …` shape 6 times; 8 near-identical "break" session objects recur across both days/languages.

### `app/dashboard/library/page.jsx` — 508 lines (read as 509 by the analysis pass; the file's trailing content accounts for the 1-line discrepancy from the `wc -l` count)

- **Setup**: directive/imports/colors/`EMPTY_FORM` (1–14).
- **Components**: `Toast` (16–30, pure presentational), `DropZone` (32–102, drag/drop file picker with its own `useState`+`handleDrop`), `ItemModal` (104–245, the add/edit form — 36 lines of state/`handleSubmit` logic, 91 lines of JSX), `LibraryDashboard` (247–508, the default export — `fetchItems`/`handleDelete`/`filtered` logic plus the page JSX).
- **Data/constants**: `EMPTY_FORM` (10–14, note: its `category` field is set but never surfaced in the UI); `inputStyle`/`labelStyle` (function-scoped inside `ItemModal`).
- **Inline `<style>` block**: 8 lines (Google Fonts import, box-sizing reset, one keyframe).
- **Exported symbols**: `export default function LibraryDashboard()` only.
- **Which other files import it**: none (routed as `/dashboard/library`); does not import `useAuth`/`ROLE_CONFIG`/`PAGE_META` from the dashboard layout.
- **Hardcoded token**: `'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'samoud2025'` at 3 call sites — see Section 6/10.

### `app/dashboard/page.jsx` — 502 lines

- **Components**: `AccessCard` (14–128, almost entirely inline-styled JSX plus a `cardColors` object re-created every render), `StatCard` (131–189, has its own hover `useState`), `DashboardHome` (192–502, the default export).
- **Business logic**: minimal — hook calls (`useRouter`, `useAuth`) at 193–196, a 6-line `greetingTime()` helper (221–226). No data fetching (`useEffect`) anywhere in this file.
- **Data/constants**: `B`/`R`/`G` (line 11, true module-level); `statsMap` (199–218, hardcoded per-role mock statistics — the code comment above it reads "إحصائيات وهمية — اربطها لاحقاً بـ API", i.e. "fake stats — wire to a real API later"); `bgIcons` (line 229, 8 decorative emoji).
- **Inline `<style jsx>` block**: 13 lines (243–255 — `@keyframes float`/`shimmer`, one hover rule). This is the only file in the whole project using Next.js's `<style jsx>` (styled-jsx) syntax rather than a plain `<style>{...}</style>` template literal.
- **Exported symbols**: `export default function DashboardHome()` only.
- **Which other files import it**: `app/dashboard/page.jsx` is itself an *importer* — `export const useAuth`, `ROLE_CONFIG`, and `PAGE_META` are consumed here from `"./layout"` (`app/dashboard/layout.jsx`). This is the only dashboard sub-page that wires into the layout's role system — `library`, `news`, and `gallery` pages do not.
- **Functional defect**: the floating background icons (270–286) compute `Math.random()`-based inline styles on every render, so their positions/delays jitter on each re-render rather than staying fixed.

### `app/dashboard/news/page.js` — 498 lines (read as 499)

- **Components**: `Toast` (7–30 — near-line-for-line identical to the `Toast` in `dashboard/library/page.jsx`, differing only in minor style details, i.e. copy-pasted rather than shared), `NewsDashboard` (35–499, default export).
- **Data/constants**: `B`/`R`/`G` declared as 3 separate `const` statements (3–5, unlike the single combined line used elsewhere); `ICON_OPTIONS` (line 33, 10 emoji, true module-level); `EMPTY` and `inputStyle` (function-scoped, re-created every render).
- **Business logic**: `fetchNews` (55–70), `handleSave` (77–117), `handleDelete` (119–134), `handleToggle` (136–155) — all `fetch` calls against `/api/news`.
- **Inline `<style>` block**: 6 lines (180–185, one keyframe only).
- **Exported symbols**: `export default function NewsDashboard()` only.
- **Which other files import it**: none (routed as `/dashboard/news`); does not import `useAuth`/`ROLE_CONFIG`/`PAGE_META`.
- **Hardcoded token**: `"x-admin-token": "samoud2025"` as a **bare literal with no `process.env` fallback at all**, at 4 separate fetch call sites (lines 60, 99, 125, 142) — more directly exposed than the equivalent in `library/page.jsx`.

### `app/media/page.js` — 489 lines (read as 490)

- **Components**: `MediaPage` (4–89, default export — fetches `/api/gallery/screens`), `Card` (92–237, includes `getImageUrl`/`hasImage` helpers), `Modal` (240–489, includes a `getYouTubeId` helper, a body-scroll-lock `useEffect`, and an Escape-key-listener `useEffect`).
- **Data/constants**: none at module scope — all content comes from the API fetch.
- **Inline `<style>` blocks**: two, totaling ~22 lines, both pure `@keyframes` (`fadeIn`, `fadeIn` again, `slideUp`) — everything else is inline `style={{}}`.
- **Exported symbols**: `export default function MediaPage()` only; `Card` and `Modal` are module-private.
- **Which other files import it**: none (routed as `/media`).
- **Repeated patterns**: the four `item.type === "..."` branches inside `Modal` (image/video/link/text, ~330–468) are structurally near-identical ~30–40-line copy/paste blocks.

### `app/dashboard/gallery/page.js` — 471 lines (read as 472)

- **Components**: `Toast`, `DropZone`, `MediaCarouselTab` (42–206), `InteractiveScreensTab` (211–431), `GalleryManager` (436–471, default export, combines the two tabs).
- **Data/constants**: `B`/`R`/`G` and `const TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "samoud2025"` (lines 5, 7 — true module-level, with the same hardcoded fallback secret pattern seen elsewhere); per-tab `EMPTY`/`TAG_OPTIONS`/`ICON_OPTIONS`/`inputStyle` objects (component-scoped; `inputStyle` is textually duplicated verbatim between the two tabs).
- **Business logic**: `MediaCarouselTab` and `InteractiveScreensTab` each independently implement `fetchItems`/`handleSave`/`handleDelete` against different endpoints (`/api/gallery/media` and `/api/gallery/screens` respectively) with near-identical logic — see Section 8.
- **Inline `<style>` block**: 5 lines (Google Fonts import, box-sizing reset, one keyframe).
- **Exported symbols**: `export default function GalleryManager()` only.
- **Which other files import it**: none (routed as `/dashboard/gallery`).
- **Hardcoded token**: `TOKEN` (with `"samoud2025"` fallback) is attached as the `x-admin-token` header at 9 separate fetch call sites in this one file.

### `app/participation/page.js` — 343 lines (read as 344)

- **Single component, no sub-components**: `Participation` (6–343/344, default export) — the only one of the large page files with zero internal decomposition.
- **Data**: the bilingual `t` dictionary (17–142, ≈126 lines) — by far the largest data block relative to file size, including two `criteriaGroups` arrays of 3 objects each (ar: 25–59, en: 87–121).
- **Business logic**: `handleFileChange` (146–155), `handleDrop` (157–161), `handleSubmit` (163–184, POSTs multipart data to `/api/abstracts`), `cardAccentBg` helper (186–190).
- **Inline `<style suppressHydrationWarning>` block**: 21 lines (198–218) — the only one of the three files in this batch with real class-based CSS rather than just keyframes (`.ecg-line`, `.card-hover`, `.criteria-card`, `.btn-pri`, `.file-zone`/`.dragging`, `.status-success`/`.status-error`, `.spinner`, a `@media(max-width:680px)` block, etc.).
- **Exported symbols**: `export default function Participation()` only.
- **Which other files import it**: none (routed as `/participation`); linked to from `app/page.js` and `app/program/page.js`.
- **Dead code inside the file**: `setLang` (destructured from `useLang()`) is never called anywhere in this file, and the `t.nav`/`t.langTxt` data (lines 19–20, 81–82) is defined but never rendered — no language-switcher UI exists on this page despite the translation data supporting one.
- **Filename typo referenced here**: links to `/Conferance_abstract_.docx` (line 285) — the actual file in `public/` is spelled the same (typo'd) way, so the link works, but the filename itself is a misspelling of "Conference."

### `app/page.module.css` — 318 lines

Entirely dead — see Section 5/9. Lines 1–88 are a hand-written `.cardDoctor`/`.cardImageWrapper`/`.cardImage`/`.cardContent`/`.cardName` block (styling for a doctor profile card); lines 89–319 are the unmodified default boilerplate CSS shipped by `create-next-app`'s starter template (`.main`, `.description`, `.grid`, `.card`, `.center`, `.logo`, dark-mode/`prefers-reduced-motion` media queries, a `rotate` keyframe). No exported symbols (a CSS Module — its class names are the only "exports," and none are consumed, see Section 5).

### `app/login/page.jsx` — 294 lines

`"use client"`. A single component, `LoginPage` (line 12, default export). Business logic: `useState`×4 (form/loading/error/showPass), `handleLogin` (19–41, POSTs `{username, password}` to `/api/auth/login`, stores the returned JWT in `localStorage` under key `auth_token`, then `router.replace("/dashboard")`), `handleKeyDown` (43–45). The remainder (≈240 lines) is one large inline `<style>` block (55–156, ≈100 lines of CSS for `.login-card`/`.login-input`/`.login-btn`/`.error-box`/etc.) plus JSX. Exported symbols: `LoginPage` only. Imported by nothing (routed as `/login`).

### `app/dashboard/layout.jsx` — 285 lines

Covered in Section 3 (layouts). Exported symbols: `AuthContext`, `useAuth`, `ROLE_CONFIG`, `PAGE_META`, and the default export `DashboardLayout`. Imported by: `app/dashboard/page.jsx` imports `useAuth`, `ROLE_CONFIG`, `PAGE_META` from it via the relative path `"./layout"`; as a `layout.jsx` file it also implicitly wraps every route under `/dashboard/*` via Next.js's routing convention (not a JS import). Breakdown: `decodeJWT` helper (17–25, decodes the JWT payload client-side with `atob` — does **not** verify the signature); `ROLE_CONFIG`/`PAGE_META` data objects (28–58); `Navbar` sub-component (61–186) and `NavLink` sub-component (188–210), both presentational; `LoadingScreen` sub-component (213–239); the default-exported `DashboardLayout` (242–285) holding the `useEffect`-based auth check.

### `app/dashboard/submission/page.js` — 272 lines

`"use client"`. Single component `SubmissionReviewPage` (line 6, default export). Data: `colors` (13–19) and bilingual `content` object (21–64) — both component-scoped. Logic: `fetchAbstracts` (72–88, GETs `/api/abstracts`), `updateStatus` (90–111, PUTs a status change), `filteredAbstracts`/`stats` derivations (114–124), `getStatusBadge` helper (126–145). Remainder is JSX with inline styles plus one small `<style>` block (149–157, keyframe + a few hover/table rules). Exported symbols: `SubmissionReviewPage` only. Imported by nothing (routed as `/dashboard/submission`).

### `app/globals.css` — 249 lines

Global stylesheet imported once, from `app/layout.js` (via `import "./globals.css"`), applying to every route. Contents: CSS custom properties for a dark theme plus a `body.light-mode` override block (1–25); a universal reset (27–32); base `body`/`html` rules (34–47); utility/component classes used across many pages — `.glass-panel` (79–94), `.btn-primary`/`.btn-outline` (97–133), `.navbar`/`.navbar-brand`/`.nav-links` (136–173, largely superseded in practice by the inline-styled `ClientNavbar.js`/`dashboard/layout.jsx` navbars — see Section 8), `.footer` (175–182, explicitly `display: none` with a comment explaining it was moved inline elsewhere on the homepage), `.form-group`/`.form-label`/`.form-input` (185–208, used by `app/registration/page.js`), a `fadeIn` keyframe/`.animate-fade-in` (211–225), and margin utility classes `.text-center`/`.mb-1`…`.mb-4`/`.mt-4` (228–250).

### `app/api/abstracts/route.js` — 211 lines

Covered in Section 3. Exported symbols: `POST`, `GET`, `PUT`. Imported by nothing (Next.js route handler, invoked via HTTP, not JS import). Breakdown: imports/transporter setup (1–20); `POST` (22–141, ≈120 lines — validation, Vercel Blob upload, `prisma.abstract.create`, two separate `transporter.sendMail` calls each carrying ~20 lines of inline HTML-email markup); `GET` (143–152); `PUT` (154–211, another `transporter.sendMail` call with ~25 lines of inline HTML-email markup).

---

## 5. Duplicate and conflicting files

### `next.config.js` vs `next.config.mjs`

**`next.config.js` is the live file; `next.config.mjs` is never loaded.** Evidence:
- Next.js resolves its config by searching, per directory, an ordered list `['next.config.js', 'next.config.mjs', 'next.config.ts']` (from `node_modules/next/dist/shared/lib/constants.js`, `CONFIG_FILES` constant) via a find-up utility that returns the first match by that order within a directory — `next.config.js` matches first, so `next.config.mjs` is never even opened.
- `next.config.js`'s entire content is: `" " ` (a single string-literal expression statement, one line) — it has no `module.exports`, so Next.js runs with **default configuration** in practice.
- `next.config.mjs` (18 lines) contains real settings — `experimental.serverActions.bodySizeLimit: '20mb'` and `images.remotePatterns` allowing any HTTPS host — none of which are ever applied, because this file is not the one Next.js reads.
- Git history: `git log --oneline -- app/lib/prisma.js lib/prisma.js` (used to trace prisma files) and general log inspection show 62 commits total on `main`; the config duplication itself has no dedicated commit message calling it out — it appears to be an accidental leftover from renaming/adding a second config file rather than an intentional migration.

### `package.json` / `package-lock.json` appearing at more than one path

There is a **second, unrelated pair** of `package.json`/`package-lock.json` one directory above the actual project, at `D:\health_project-master\package.json` / `D:\health_project-master\package-lock.json`. Its `package.json` content is just:
```json
{ "dependencies": { "lucide-react": "^1.8.0", "nodemailer": "^8.0.5" } }
```
— a minimal, differently-named lockfile (`"name": "health_project-master"` in the lockfile, vs. `"name": "health_project"` in the real project's `package.json`), with a different `nodemailer` version pin (`^8.0.5` vs. the real project's `^8.0.7`) and no other dependencies. This is **not part of the git repository** (the git repo root is the inner `health_project-master/` folder). It is, however, live in the sense that `npm run build` detects it and picks *it* as the inferred workspace root, printing: `"We detected multiple lockfiles and selected the directory of D:\health_project-master\package-lock.json as the root directory."` This does not currently break the build (compilation still succeeds), but it is real, observed behavior from Next.js's build tooling.

`node_modules/.package-lock.json` also exists, but this is npm's own standard bookkeeping file (written automatically on every `npm install`) — not a duplicate of the project's lockfile in any meaningful sense.

### `lib/` appearing at more than one level, and the `lif/` folder

Two `prisma.js` singleton files exist:
- `lib/prisma.js` (project root, 11 lines) — **this is the live one.** `jsconfig.json` maps the `@/*` alias to `./*` (the project root), so `@/lib/prisma` resolves to this file. It is imported by exactly 2 files: `app/api/auth/setup/route.js` and `app/api/news/route.js`.
- `app/lib/prisma.js` (10 lines) — **dead.** Nothing in the codebase imports `@/app/lib/prisma` or any relative path pointing at it (confirmed by grepping every import statement in the project). Its content is functionally identical to `lib/prisma.js` (same singleton pattern, one fewer leading blank line).

Both files' code is otherwise byte-for-byte equivalent in logic (a `globalForPrisma`-cached `PrismaClient` singleton).

`app/lif/page.js` is **not a typo of `lib`** — it is a real, routable page (`/lif`, Arabic content titled "Lif - خلف الكواليس" i.e. "Lif - behind the scenes"), 26 lines, that happens to sit alphabetically next to `app/lib/`. It is a genuine (if oddly named and unlinked-from-navigation — see Section 9) route, not a misnamed copy of the `lib/` folder.

### `page.js` vs `page_updated.js`

No file named `page_updated.js` (or any `*_updated.*`, `*_old.*`, `*_backup.*`, `*.bak`) exists anywhere in the project — searched exhaustively across the whole tree. This specific duplicate does not exist in this codebase.

### Other duplicated/near-duplicated files found

- **`components/Navbar.js` (0 bytes) + `components/NavbarWrapper.jsx` (7 lines) — both dead.** `NavbarWrapper.jsx` does `import Navbar from './Navbar'`, but `Navbar.js` is a completely empty file (0 bytes, no export at all), so `NavbarWrapper` would crash if it were ever rendered. Neither file is imported anywhere else in the project — `app/layout.js` uses `components/ClientNavbar.js` instead, and that file's own header comment reads: `// ملف واحد يجمع الـ Navbar كاملاً — لا يحتاج NavbarWrapper منفصل` ("one file that assembles the whole Navbar — no separate NavbarWrapper needed"), confirming `NavbarWrapper`/`Navbar` are superseded leftovers.
- **`app/page.module.css` (318 lines) — dead.** Not imported by `app/page.js` or any other file (confirmed by grep for `page.module.css` across the whole codebase). Its content is a mix of one hand-written card-style block plus the unmodified default boilerplate CSS from the Next.js starter template (`.main`, `.grid`, `.card`, `.center`, `.logo`, etc. — the same class names/comments found in a fresh `create-next-app` scaffold).
- **`config.js` (172 lines, project root) — dead.** Grepping every `.js`/`.jsx` file in the project for an import of `config` (via `from "..."` or `require(...)`) returns zero matches. It defines `theme`, `emailConfig`, `dbConfig`, `appConfig`, `devConfig`, `prodConfig`, `emailTemplates`, `securityConfig`, etc., none of which are consumed anywhere — the actual email/theme/security values used elsewhere in the app are separately hardcoded inline in the files that need them.
- **`structure.sql` (85 lines, project root) — a duplicate of the Prisma migration.** Its `CREATE TABLE` statements for `User`, `Abstract`, `Reviewer`, `Review`, `Question`, `Admin` are line-for-line equivalent (same columns, defaults, foreign keys) to `prisma/migrations/20260425074603_init/migration.sql` (43 lines) — the two differ only in that `structure.sql` is the same DDL without Prisma's `-- CreateTable` comment headers condensed differently. It is not referenced by any script or Dockerfile step.
- **`data/*.json` (5 files: `abstracts.json`, `gallery-media.json`, `gallery-screens.json`, `library.json`, `news.json`) — all dead.** None are imported anywhere in the codebase (confirmed by grep); they appear to be a static snapshot/seed of what the equivalent Prisma tables or `gallery-db.json` file hold, but nothing reads them at runtime.
- **`app/dashboard/p`** — a 0-byte file with no extension inside `app/dashboard/`. Because it has no `page.js`/`page.jsx`/`route.js` name, Next.js's router does not treat it as a route; it is inert, but its presence and empty name make its origin unclear (UNCERTAIN: whether this is a truncated/aborted file save, e.g. someone typed `p` and the editor created the file before the intended filename was finished).
- **`checkAuth(req)` — the same 2–4-line admin-token-check function is independently redefined in 5 different API route files** (`app/api/admin/route.js`, `app/api/gallery/screens/route.js`, `app/api/gallery/upload/route.js`, `app/api/library/route.js`, `app/api/news/route.js`) rather than shared from one module — see Section 8 for details.
- **`Toast` component — copy-pasted, not shared**, between `app/dashboard/library/page.jsx` (lines 16–30) and `app/dashboard/news/page.js` (lines 7–30), near-line-for-line identical.

---

## 6. Backend structure

### Prisma instantiation

The project mixes two patterns:
- **Singleton pattern** (`globalForPrisma`-cached, safe for Next.js dev-mode hot-reload) — defined in `lib/prisma.js` (live) and `app/lib/prisma.js` (dead, unused duplicate). Only 2 files actually import and use the singleton: `app/api/auth/setup/route.js` and `app/api/news/route.js`.
- **Direct `new PrismaClient()` instantiation** — every other Prisma-consuming file creates its own client instance at module load time, rather than importing the shared singleton. Files doing this:
  - `app/api/abstracts/route.js`
  - `app/api/abstracts/[id]/route.js`
  - `app/api/admin/route.js`
  - `app/api/auth/login/route.js`
  - `app/api/certificate/route.js`
  - `app/api/gallery/screens/route.js`
  - `app/api/library/route.js`
  - `app/api/questions/route.js`
  - `app/api/register/route.js`
  - `app/api/users/route.js`
  - `scripts/create-media-admin.js`
  - `scripts/init-db.js`
  - `test-prisma.js`

  That is 13 separate `new PrismaClient()` call sites across the codebase (plus the 1 inside `lib/prisma.js` and 1 inside the dead `app/lib/prisma.js`, for 15 total occurrences of `new PrismaClient()` in the source tree).

### Models in `prisma/schema.prisma` (names and relations only)

| Model | Relations |
|---|---|
| `Library` | none |
| `User` | has many `Abstract` (via `Abstract.submitterId`) |
| `Abstract` | belongs to `User?` (via `submitterId`, optional/nullable); has many `Review` |
| `Reviewer` | has many `Review` |
| `Review` | belongs to `Abstract` (via `abstractId`); belongs to `Reviewer` (via `reviewerId`) |
| `Question` | none |
| `Admin` | none |
| `GalleryMedia` | none |
| `GalleryScreen` | none |
| `News` | none |

**Schema/migration drift**: `prisma/migrations/` contains exactly one migration (`20260425074603_init`), whose SQL only creates `User`, `Abstract`, `Reviewer`, `Review`, `Question`, `Admin` (6 tables — matching `structure.sql` exactly). The schema additionally defines `Library`, `GalleryMedia`, `GalleryScreen`, and `News` (4 more models) with **no corresponding migration file** — these models were added to `schema.prisma` without ever running `prisma migrate dev` again (most likely via `prisma db push`, which the `db:push` script supports and which doesn't generate migration files).

**Datasource provider mismatch**: `prisma/schema.prisma`'s `datasource db` block declares `provider = "mysql"`. However `prisma/migrations/migration_lock.toml` (the file Prisma itself uses to pin/detect a schema-migration mismatch) declares `provider = "sqlite"`. In addition, two literal SQLite database files exist in the tree — `dev.db` (root, 32,768 bytes) and `prisma/dev.db` (40,960 bytes) — both verified via file header (`SQLite format 3`) to be real SQLite databases, not stray text. `.env.example` also documents `DATABASE_URL="file:./dev.db"` (SQLite connection-string syntax). All of this is consistent with the project having originally been built against SQLite and later had only `schema.prisma`'s `datasource` block switched to `mysql`, without regenerating the migration lock file or removing the leftover SQLite databases.

**`GalleryMedia` model is defined but never used**: grepping the whole codebase for `galleryMedia`/`GalleryMedia` finds only its own definition in `schema.prisma` — no route or component references `prisma.galleryMedia`. The actual gallery-media feature (`/api/gallery/media`, `/api/gallery/save`) instead persists to a local JSON file, `gallery-db.json`, read/written via Node's `fs` module directly (`path.join(process.cwd(), "gallery-db.json")`). That file does not currently exist in the repository — it would be created on first successful write by either route.

### Where business logic lives

Mixed, with no consistent layering:
- **Inside route handlers** — the large majority of business logic (validation, Prisma queries, Vercel Blob calls, PDF/QR generation, email sending) lives directly inside the `app/api/**/route.js` files themselves; there is no separate service/repository layer.
- **Inside `lib/`** — only the Prisma singleton (`lib/prisma.js`); no other shared business logic exists there.
- **Inside components/pages** — the dashboard pages (`app/dashboard/library/page.jsx`, `app/dashboard/news/page.js`, `app/dashboard/gallery/page.js`) each independently implement their own client-side fetch/CRUD logic against their respective API routes, duplicated across files rather than centralized in a shared client/data layer.
- **Inside `scripts/`** — one-off Node scripts (`init-db.js`, `create-media-admin.js`) duplicate Prisma seeding logic that overlaps with what `app/api/auth/setup/route.js` does at runtime.

### Input validation

There is no schema-validation library (no Zod/Yup/Joi/etc. anywhere in `package.json`). Validation is done ad hoc, inline, per route handler — typically a manual truthy/`?.trim()` check on required fields (e.g. `app/api/abstracts/route.js` lines 31–38 check `title`/`authorName`/`email`/`file` presence, PDF MIME type, and a 20 MB size cap) and occasional numeric coercion guards (`const targetId = isNaN(id) ? id : parseInt(id);`, repeated across several PATCH/PUT/DELETE handlers). Some routes (`app/api/questions/route.js`, `app/api/register/route.js`, `app/api/users/route.js`) have little to no validation beyond checking a field is truthy.

### Authentication / session handling

`app/login/` exists (`app/login/page.jsx`). The project uses **two independent, uncoordinated auth mechanisms**:

1. **JWT login flow** — `POST /api/auth/login` verifies `username`/`password` against the `Admin` table (bcrypt-compared), then signs a JWT (via `jose`, `HS256`, 24h expiry) containing `{id, name, role}`, using a secret from `process.env.JWT_SECRET` with a hardcoded fallback string (`"conference_secret_key_change_in_production"`) if that env var is unset. The client (`app/login/page.jsx`) stores the returned token in `localStorage` under the key `auth_token`. `app/dashboard/layout.jsx` reads that token on every `/dashboard/*` page load, **decodes its payload with a hand-rolled `atob`-based `decodeJWT()` function that does not verify the JWT's cryptographic signature**, checks only the `exp` claim client-side, and redirects to `/login` if the token is missing/expired/undecodable. There is no `middleware.js` and no server-side check on any `/dashboard/*` page — the "protection" is entirely client-side redirect logic that could be bypassed by disabling JavaScript navigation guards or crafting a fake `localStorage` value with a future `exp`.
2. **Static shared-secret header** (`x-admin-token`) — separately, most of the *write* API routes (`/api/admin`, `/api/gallery/screens`, `/api/gallery/upload`, `/api/library`, `/api/library/upload`, `/api/news`) gate access by comparing an incoming `x-admin-token` request header against `process.env.ADMIN_TOKEN` (with several routes falling back to the hardcoded literal `"samoud2025"` if that env var is unset: `app/api/gallery/upload/route.js`, `app/api/news/route.js`). This mechanism is completely separate from the JWT above — it is not derived from the logged-in user's identity/role, it is one shared token for all admin write operations. The client-side dashboard pages that call these routes read the token to send from `process.env.NEXT_PUBLIC_ADMIN_TOKEN` — a `NEXT_PUBLIC_`-prefixed variable, meaning its value (if set) is bundled into and readable from the client-side JavaScript — or fall back to the same hardcoded `"samoud2025"` literal baked directly into the client bundle (`app/dashboard/library/page.jsx` ×3, `app/dashboard/gallery/page.js` ×1 module constant used at 9 call sites, `app/dashboard/news/page.js` — as a bare literal with no env fallback at all, ×4 call sites).

There is no session store, no cookies, no CSRF protection, and no server-side route guard (middleware) anywhere in the project.

### Environment variables read by the code (names only)

`ADMIN_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `EMAIL_PASS`, `EMAIL_USER`, `JWT_SECRET`, `NEXT_PUBLIC_ADMIN_TOKEN`, `NEXT_PUBLIC_API_URL`, `NODE_ENV`, `PUBLIC_BLOB_READ_WRITE_TOKEN`, plus `DATABASE_URL` (read implicitly by Prisma via `env("DATABASE_URL")` in `schema.prisma`, not via a direct `process.env` reference in application code).

`.env` (present, tracked by git — see Section 10) defines: `DATABASE_URL`, `EMAIL_USER`, `EMAIL_PASS`, `ADMIN_TOKEN`, `NEXT_PUBLIC_ADMIN_TOKEN`, `PUBLIC_BLOB_READ_WRITE_TOKEN`. `.env.example` documents a different, smaller subset: `DATABASE_URL`, `EMAIL_USER`, `EMAIL_PASS`, `NODE_ENV`, `NEXT_PUBLIC_API_URL`. Neither file defines `JWT_SECRET` or `BLOB_READ_WRITE_TOKEN` (as distinct from `PUBLIC_BLOB_READ_WRITE_TOKEN`), both of which the code reads.

---

## 7. Frontend structure

### `components/`

3 files: `ClientNavbar.js` (241 lines, live — the actual site-wide navbar, rendered from `app/layout.js`, bilingual, responsive via a `useBreakpoint`-style hook defined inline), `Navbar.js` (0 bytes, dead), `NavbarWrapper.jsx` (7 lines, dead — depends on the empty `Navbar.js`).

### `context/`

1 file: `LangContext.js` (18 lines) — a `LangProvider` (wraps `{lang, setLang}` in React Context, default language `'ar'`) and a `useLang()` hook. Provided at the root via `app/layout.js`. Consumed by: `app/page.js`, `app/participation/page.js`, `app/program/page.js`, `components/ClientNavbar.js`. Not consumed by `app/live/page.js`, `app/media/page.js`, `app/registration/page.js`, `app/about/page.js`, or any `app/dashboard/**` page — those pages that need bilingual text (e.g. `app/live/page.js`, `app/dashboard/submission/page.js`) instead keep their own separate `lang` `useState` local to the component, disconnected from the shared context.

### `data/`

5 static JSON files (`abstracts.json`, `gallery-media.json`, `gallery-screens.json`, `library.json`, `news.json`), all dead/unimported — see Section 5.

### `lib/`

1 live file: `prisma.js` (the Prisma singleton). A second copy exists at `app/lib/prisma.js` (dead) — see Section 5.

### `scripts/`

5 Node scripts, none imported by the app itself (run manually via `node scripts/x.js` or via the `db:init` npm script): `init-db.js` (seeds a default `admin`/`admin` **plaintext**-password account plus 2 sample reviewers — note this script does not `bcrypt.hash` the password, unlike every route-handler admin-creation path, which does), `create-media-admin.js` (seeds one `media_admin`/`Media@2026` account, bcrypt-hashed), `quick-start.js` (interactive first-run helper: checks Node/npm, copies `.env.example` to `.env` if missing, runs `npm install` if `node_modules` is missing, runs a Prisma migration), `setup.sh` / `setup.bat` (shell/batch equivalents of a subset of `quick-start.js`'s steps).

### `public/`

Static assets: 24 photo/logo images (`.jpg`/`.jpeg`/`.png`/`.webp`, ranging roughly 900 bytes to ~2.9 MB), 2 video files (`promo-video.mp4`, 2.28 MB; `تجميع.mp4`, 47.7 MB — the latter is **not tracked by git**, per `git status`), one `.docx` (`Conferance_abstract_.docx`, filename typo, referenced by `app/participation/page.js`), and a `public/uploads/` subtree containing user-uploaded PDFs and images organized into `gallery/`, `library/`, and `research/` sub-folders (the `research/` folder alone contains 15 PDFs, several of which are exact duplicate filenames re-uploaded at different timestamps, plus a `README.txt` instructing someone to manually drop a `doctor.jpg` into that folder, and a 17-byte `Mazen_Soliman_Safi.jpg` that is too small to be a valid image).

### Styling approaches in use (mixed, no single convention)

- **Global CSS** (`app/globals.css`, imported once from `app/layout.js`) — defines CSS variables, resets, and a handful of utility/component classes (`.glass-panel`, `.btn-primary`, `.form-input`, `.mb-1`…`.mb-4`, etc.). Actually consumed by a minority of pages (`app/about/page.js`, `app/registration/page.js`, `app/lif/page.js` use the utility classes/`.glass-panel`; most of the dashboard and larger marketing pages do not).
- **CSS Modules** — `app/page.module.css` exists but is completely unimported/dead (see Section 5).
- **Inline `style={{...}}` objects** — the dominant approach across nearly every page component (`app/page.js`, `app/live/page.js`, `app/program/page.js`, all `app/dashboard/**` pages, `app/media/page.js`, `app/participation/page.js`, `app/login/page.jsx`) — the large majority of visual styling in this project is expressed this way rather than via classes.
- **Inline `<style>{...}</style>` template-literal blocks** (a form of runtime-injected global CSS, not scoped) — present in nearly every large page file, used specifically for `@keyframes` animations and `:hover`/media-query rules that inline `style` objects can't express (e.g. `app/live/page.js` lines 133–532, `app/program/page.js` 413–439, `app/login/page.jsx` 55–156, `app/dashboard/submission/page.js` 149–157).
- **`<style jsx>` (styled-jsx)** — used in exactly one file, `app/dashboard/page.jsx` (lines 243–255); every other file that needs runtime CSS uses the plain unscoped `<style>{...}</style>` pattern instead, so this one file is stylistically inconsistent with the rest of the project.

### State management / context providers

- `LangContext` (`context/LangContext.js`) — global (root-provided) language toggle, `{lang, setLang}`, but only actually read by 4 of the ~14 page components (see above).
- `AuthContext` (defined inside `app/dashboard/layout.jsx`) — scoped to `/dashboard/*`, holds `{user, role}` decoded from the (unverified) JWT.
- No other global state management (no Redux/Zustand/Jotai/etc. in `package.json`). Every other piece of state (forms, fetched lists, toggles) is local `useState` per component, independently re-implemented per page even where the same shape of state (e.g. bilingual `lang` toggle, CRUD list + loading flag) recurs across files.

### Client vs. server components

Every page and component that renders any interactivity carries `"use client"`: `app/page.js`, `app/dashboard/submission/page.js`, `app/dashboard/page.jsx`, `app/dashboard/news/page.js`, `app/dashboard/library/page.jsx`, `app/dashboard/gallery/page.js`, `app/participation/page.js`, `app/media/page.js`, `app/login/page.jsx`, `app/dashboard/layout.jsx`, `app/program/page.js`, `components/ClientNavbar.js`, `context/LangContext.js`, `components/NavbarWrapper.jsx` (dead), `app/live/page.js`, `app/registration/page.js` — 16 files total. The remaining page files (`app/about/page.js`, `app/layout.js`, `app/lif/page.js`) have no `"use client"` directive and are React Server Components by default, though `app/about/page.js` and `app/lif/page.js` render only static markup so the distinction has little practical effect. All `app/api/**/route.js` files are server-only by definition (Route Handlers) and never carry `"use client"`.

---

## 8. Duplicated logic

Logic/JSX/CSS blocks repeated in 3 or more places:

1. **`checkAuth(req)` admin-token-check function — repeated in 5 files**, each an independent, near-identical redefinition rather than a shared import:
   - `app/api/admin/route.js:17-19` — `return req.headers.get('x-admin-token') === process.env.ADMIN_TOKEN;`
   - `app/api/gallery/screens/route.js:19-21` — identical body.
   - `app/api/library/route.js:19-21` — identical body.
   - `app/api/gallery/upload/route.js:6-9` — same comparison, but with a hardcoded `"samoud2025"` fallback if `ADMIN_TOKEN` is unset.
   - `app/api/news/route.js:17-23` — same comparison, also with the `"samoud2025"` fallback, plus an extra comment explaining the fallback's purpose.

2. **The hardcoded fallback admin-token literal `"samoud2025"` — appears in at least 6 files**, both server- and client-side: `app/api/gallery/upload/route.js`, `app/api/news/route.js` (server checkAuth fallbacks), `app/dashboard/library/page.jsx` (×3 fetch call sites), `app/dashboard/gallery/page.js` (module-level `TOKEN` constant, used at 9 fetch call sites), `app/dashboard/news/page.js` (×4 fetch call sites, as a bare literal with no env-var fallback at all), and the real `.env` file's `ADMIN_TOKEN`/`NEXT_PUBLIC_ADMIN_TOKEN` entries (Section 10 covers the security implication; this entry covers the duplication itself).

3. **The `Toast` component — copy-pasted between `app/dashboard/library/page.jsx` (16–30) and `app/dashboard/news/page.js` (7–30)**, near-line-for-line identical (small fixed-position notification banner), rather than extracted to a shared component. (Only 2 occurrences of this exact component, short of the "3+" bar on its own, but the same *pattern* — a bespoke small toast/notification UI reimplemented per page rather than shared — recurs a third time as inline success/error `alert()` calls in `app/dashboard/submission/page.js`.)

4. **Per-tab/per-page CRUD fetch triplet (`fetchItems` / `handleSave` (POST+PATCH) / `handleDelete`) against a REST-ish API endpoint — independently reimplemented in at least 4 places** with the same shape (loading-state toggle → `fetch` with `x-admin-token` header → `.json()` → update local list state → toast/alert): `app/dashboard/library/page.jsx` (`fetchItems`/`handleDelete`, plus `ItemModal`'s `handleSubmit`), `app/dashboard/news/page.js` (`fetchNews`/`handleSave`/`handleDelete`/`handleToggle`), `app/dashboard/gallery/page.js`'s `MediaCarouselTab` (its own `fetchItems`/`handleSave`/`handleDelete`) and `InteractiveScreensTab` (a second, separately written `fetchItems`/`handleSave`/`handleDelete` triplet inside the *same file*, targeting a different endpoint). No shared API-client helper exists anywhere in the project — every page/tab re-issues raw `fetch()` calls with a manually re-typed headers object.

5. **Brand color constants `B`/`R`/`G` (`#1B365D`/`#C8102E`/`#D4AF37`) — redeclared as local constants in at least 7 files** rather than imported from one shared module: `app/page.js` (as `B`/`R`/`G`, lines 25–27), `app/program/page.js` (line 6), `app/login/page.jsx` (line 10, as `B`/`R`/`G`), `app/dashboard/page.jsx` (line 11), `app/dashboard/library/page.jsx` (line 8), `app/dashboard/gallery/page.js` (line 5), `app/dashboard/news/page.js` (lines 3–5, written as 3 separate statements instead of one line, a further inconsistency). (`app/globals.css` separately defines overlapping but not-identical brand colors as CSS variables — `--medical-blue: #1B365D`, `--medical-red: #C8102E`, `--medical-gold: #D4AF37` — which are not referenced by any of the JS files above; the JS files re-declare the same three hex values instead of using the CSS variables.)

6. **`inputStyle` form-input style object — duplicated verbatim between the two tabs of `app/dashboard/gallery/page.js`** (line 50 inside `MediaCarouselTab`, line 219 inside `InteractiveScreensTab`) — textually identical object literal copy-pasted within the same file. A structurally similar (not identical) `inputStyle` object also recurs independently in `app/dashboard/library/page.jsx` and `app/dashboard/news/page.js`.

7. **The `ui-avatars.com` fallback-avatar `onError` URL template — copy-pasted 4 times within `app/page.js`** alone (lines 519, 578, 2681, 2925), each instance re-typing the same `https://ui-avatars.com/api/?background=1B365D&color=D4AF37&bold=true&size=...` query string.

8. **The "person modal" vs. "committee-head modal" JSX in `app/page.js`** (2629–2874 vs. 2883–3109) — two ~150–250-line blocks with the same header/avatar/badge/name/contact/bio/expertise-pill structure, copy-pasted rather than parameterized into one modal component; the copy drifted slightly (an event handler present in one is missing in the other — see Section 4).

---

## 9. Dependency graph highlights

### Files imported by many others (the shared core)

Given this is a small App-Router project where most "reuse" happens through Next.js's file-based routing (not JS imports) and through copy-paste rather than shared modules (Section 8), the actual shared-via-`import` core is small:

| File | Imported by |
|---|---|
| `context/LangContext.js` | `app/layout.js`, `app/page.js`, `app/participation/page.js`, `app/program/page.js`, `components/ClientNavbar.js` (5 importers) |
| `lib/prisma.js` | `app/api/auth/setup/route.js`, `app/api/news/route.js` (2 importers) |
| `components/ClientNavbar.js` | `app/layout.js` (1 importer — but that's the root layout, so it's effectively used on every page) |
| `app/dashboard/layout.jsx` | `app/dashboard/page.jsx` (imports `useAuth`/`ROLE_CONFIG`/`PAGE_META` via `"./layout"`) — plus implicitly wraps every `/dashboard/*` route via Next.js's layout convention |

No other internal module has more than one importer. There is no shared `utils.js`, API-client wrapper, shared UI-primitives file, or design-token module — the closest thing to "shared core" is `globals.css`'s utility classes, which are CSS (not JS-importable) and are in practice only used by a handful of pages (Section 7).

### Files imported by nothing (candidates for dead code — not deleted, per audit scope)

- `app/lib/prisma.js` — dead duplicate of `lib/prisma.js` (Section 5).
- `components/Navbar.js` and `components/NavbarWrapper.jsx` — dead (Section 5).
- `config.js` — dead (Section 5).
- `app/page.module.css` — dead (Section 5); note CSS Modules aren't "imported" by other JS files in the sense of re-export, but zero files `import styles from` it, so it is never applied.
- `data/abstracts.json`, `data/gallery-media.json`, `data/gallery-screens.json`, `data/library.json`, `data/news.json` — all 5 dead (Section 5).
- `structure.sql` — not a JS/CSS file, but not referenced by any script, Dockerfile step, or `package.json` script either.
- `test-prisma.js` (project root) — a standalone diagnostic script (`prisma.user.findMany()` then log/disconnect); not imported by anything, not wired into any npm script; only runnable manually via `node test-prisma.js`.

### Orphan *routes* (reachable by URL, but not linked from any in-app navigation)

Distinct from "imported by nothing" (these are pages, which Next.js routes to regardless of JS imports), but worth flagging alongside the dead-code list since they represent unreachable-in-practice UI: grepping every `href`/`Link` target across the whole `app/`/`components/` tree for `/about`, `/registration`, and `/lif` found **zero** in-app links to any of them. `app/about/page.js`, `app/registration/page.js`, and `app/lif/page.js` are only reachable by a user (or search engine) navigating to the exact URL directly — no nav menu, button, or `<Link>` anywhere in the rendered UI points at any of the three. (`/login` is also unlinked from any visible nav, but that is expected for an admin-only login page reached via a redirect, not a UI gap.)

### Circular imports

None found. The internal import graph (Section 3/7/9 combined) is a shallow tree — at most one level of internal-module reuse (e.g. `app/dashboard/page.jsx` → `app/dashboard/layout.jsx`; nothing imports back from `layout.jsx` to `page.jsx`) — there is no cycle anywhere in the ~40 first-party JS/JSX files.

---

## 10. Risks and observations

Factual risks and anomalies observed directly in the code/config, without recommendations:

- **`.env` is tracked by git.** `git ls-files | grep env` returns both `.env` and `.env.example`; `.gitignore` excludes only `.env*.local`, not `.env` itself. The tracked `.env` contains real values for `DATABASE_URL`, `EMAIL_USER`, `EMAIL_PASS`, `ADMIN_TOKEN`, `NEXT_PUBLIC_ADMIN_TOKEN`, and `PUBLIC_BLOB_READ_WRITE_TOKEN` (values not reproduced in this report).
- **The `/api/users` route selects Prisma fields that don't exist on the `User` model.** `app/api/users/route.js` runs `prisma.user.findMany({ select: { id, fullName, title, institution, createdAt } })`, but `prisma/schema.prisma`'s `User` model has no `title` or `institution` field (only `id, fullName, email, profession, country, createdAt, attended`). This would raise a Prisma validation error at request time whenever `GET /api/users` is called.
- **`app/live/page.js` calls a non-existent API route.** `handleLike` (line 118–129 of that file) does `POST /api/questions/${questionId}/like`, but only `app/api/questions/route.js` exists (GET/POST on the collection root) — there is no `app/api/questions/[id]/route.js` or `.../[id]/like/route.js` anywhere in the project.
- **`app/live/page.js` links to a route that doesn't exist.** Line 539 renders `<Link href="/dashboard/submissions">` (plural), but the actual route directory is `app/dashboard/submission` (singular) — this link 404s.
- **The dashboard's own role/nav config points at a route that doesn't exist.** `app/dashboard/layout.jsx`'s `PAGE_META.users` declares `path: "/dashboard/users"` and `ROLE_CONFIG.admin.pages` includes `"users"`, so the admin role's navbar renders a link to `/dashboard/users` — but no `app/dashboard/users/` directory or page exists anywhere in the project.
- **`prisma/schema.prisma` declares `provider = "mysql"` while `prisma/migrations/migration_lock.toml` (Prisma's own drift-detection file) declares `provider = "sqlite"`**, and two real SQLite database files (`dev.db`, `prisma/dev.db`) still exist in the tree, alongside a `.env.example` documenting a SQLite-style `DATABASE_URL`. Running any `prisma migrate` command against this schema/lock-file combination would be expected to raise a provider-mismatch error from Prisma itself (not independently reproduced as part of this read-only audit, since doing so would write to the database).
- **Two independent, uncoordinated auth mechanisms coexist** (JWT-in-localStorage with client-side-only signature-unverified decoding, and a static `x-admin-token` shared secret compared server-side) — detailed in Section 6. There is no `middleware.js` anywhere, so no `/dashboard/*` page or `/api/**` write route has a server-side auth guard beyond each route's own manual `checkAuth`/header check.
- **A hardcoded fallback admin-secret literal, `"samoud2025"`, is baked directly into client-side JavaScript bundles** (`app/dashboard/gallery/page.js`, `app/dashboard/library/page.jsx`, `app/dashboard/news/page.js`) as the value sent in the `x-admin-token` header whenever `NEXT_PUBLIC_ADMIN_TOKEN` is unset, and independently also exists as the server-side fallback in `app/api/gallery/upload/route.js` and `app/api/news/route.js`'s `checkAuth`. Additionally, `NEXT_PUBLIC_ADMIN_TOKEN` (the intended non-fallback value) is by Next.js convention inlined into the client bundle at build time, so even a "real" configured admin token is not actually private from anyone who can view the site's JavaScript.
- **`scripts/init-db.js` creates the default `admin` account with a plaintext (non-bcrypt-hashed) password** (`password: 'admin'`, upserted directly), in contrast to every other admin-creation code path in the project (`app/api/admin/route.js`, `app/api/auth/setup/route.js`, `scripts/create-media-admin.js`), which all call `bcrypt.hash` before storing. If `npm run db:init` is used to seed a database, the resulting `admin` row's password would not match the hash format `app/api/auth/login/route.js`'s `bcrypt.compare` expects, and login for that seeded account would fail rather than succeed insecurely — but the plaintext-storage itself is inconsistent with the rest of the codebase's password handling.
- **`next.config.js`, the file Next.js actually loads, is effectively empty** (a single stray string-literal expression) — the `experimental.serverActions.bodySizeLimit: '20mb'` and `images.remotePatterns` settings that exist in the sibling (dead) `next.config.mjs` are never applied. Multiple API routes (`app/api/abstracts/route.js`, `app/api/library/route.js`, `app/api/library/upload/route.js`) implement their own 20 MB file-size checks in application code, independent of whatever the framework-level Server Actions body-size limit actually is at runtime (the framework default, since the `.mjs` override is inert).
- **Global mutable state at module load**: 15 separate `new PrismaClient()` calls (Section 6) each open their own connection pool at import time, rather than sharing one client — a difference in connection-management pattern between files, not something this read-only audit can evaluate for runtime impact.
- **Side effects at module load**: `app/api/abstracts/route.js` constructs a `nodemailer.createTransport(...)` object at module scope (lines 9–20), meaning an SMTP transport is configured every time that route module is loaded, independent of whether a request that needs to send mail actually arrives.
- **Mixed `.js` / `.jsx` extension convention for otherwise-identical file roles.** Within `app/dashboard/` alone: `page.jsx` (root dashboard page), `layout.jsx`, `library/page.jsx` use `.jsx`, while `gallery/page.js`, `news/page.js`, `submission/page.js` use `.js` — both extensions are used for React components with JSX syntax and default exports, with no discernible rule distinguishing when one or the other is used. The same split exists at `app/` top level: `login/page.jsx` is `.jsx`, every sibling page (`page.js`, `live/page.js`, `program/page.js`, etc.) is `.js`.
- **Mixed `.js` / `.mjs` config convention**: `next.config.js` and `next.config.mjs` both exist for the same purpose (Section 5).
- **Naming-casing inconsistency in the API route tree**: every other `app/api/*` folder is a single lowercase word or kebab-case-free compound (`abstracts`, `admin`, `auth`, `certificate`, `gallery`, `library`, `news`, `questions`, `register`, `users`), except `send_email`, which uses `snake_case` — the only folder in the entire `app/` tree that does.
- **`app/dashboard/p`** — a 0-byte, extensionless file inside a routed directory, of unclear origin (see Section 5).
- **`components/Navbar.js` is a 0-byte file** with a dependent file (`NavbarWrapper.jsx`) that would throw at render time if ever used, since it imports a default export that doesn't exist in an empty module.
- **`public/تجميع.mp4` (47.7 MB) is untracked by git** (`git status --porcelain` lists it with `??`), unlike every other file in `public/`, which is committed — it exists on disk but was never added to version control.
- **Duplicate re-uploads under `public/uploads/research/`**: several PDFs share the exact same base filename with only the leading upload-timestamp differing (e.g. six separate `*-التكليف_الثاني.pdf` uploads), and `public/uploads/research/Mazen_Soliman_Safi.jpg` is only 17 bytes, too small to be a valid JPEG.
- **All documentation `.md` files carry the identical date "25 أبريل 2026"** (see Section 11) and describe an earlier, SQLite/Next.js-14/`config.js`-centric version of the project that no longer matches the current MySQL-provider, Vercel-Blob-storage, JWT-plus-shared-secret-auth, `config.js`-unused state of the code (detailed per-document in Section 11).

---

## 11. Testing and tooling

### Tests

**None.** An exhaustive search for `*.test.js`, `*.spec.js`, `*.test.jsx`, `*.spec.jsx` across the whole project (excluding `node_modules`/`.next`) returned zero files. `package.json` has no `test` script, and no testing library (`jest`, `vitest`, `@testing-library/*`, `cypress`, `playwright`, etc.) appears in `dependencies` or `devDependencies`.

### Linting / formatting

`package.json` declares a `"lint": "next lint"` script, but **no ESLint package or config is installed**: there is no `.eslintrc*` file, no `eslint.config.*` file anywhere in the project, and grepping `package.json` for `eslint` (case-insensitive) returns no matches in either `dependencies` or `devDependencies`. Running `npm run lint` as configured would trigger Next.js's first-run prompt to install ESLint, since nothing is currently set up. No Prettier config (`.prettierrc*`, `prettier.config.*`) exists either, and `prettier` is not a dependency.

### Docker

A `Dockerfile` (62 lines) and `.dockerignore` (6 lines, excluding `node_modules`, `.next`, `.git`, `npm-debug.log`, and — self-referentially — the `Dockerfile`/`.dockerignore` themselves) exist. The Dockerfile is a standard 3-stage (`deps`/`builder`/`runner`) Next.js standalone-output build on `node:18-alpine`, running `npx prisma generate` and `npm run build` in the builder stage, then copying `.next/standalone` and `.next/static` into a slim runner stage that runs as a non-root `nextjs` user on port 3000.

Whether it is "current" relative to the rest of the project: its own inline comments describe copying `prisma/dev.db` "for testing purposes" and warn `"# Note: In a real system, use a Postgres/MySQL remote database URL instead of SQLite / The dev.db will be read-only if permissions aren't set, or reset on container restart"` — i.e. the Dockerfile's own comments still describe a SQLite-based setup, consistent with the SQLite/MySQL drift documented in Section 6, even though `schema.prisma`'s active `datasource` is `mysql`. It does not set `output: 'standalone'` anywhere itself — that setting normally belongs in `next.config.js`, which (per Section 5) is effectively empty in this project, meaning the Dockerfile's `COPY --from=builder /app/.next/standalone ./` step would copy a directory that a default Next.js build does not produce (`.next/standalone` is only emitted when `output: 'standalone'` is set in the active Next config). UNCERTAIN whether this Dockerfile has actually been run successfully against the current repository state, since doing so was out of scope for this read-only audit (it would build a container image).

### The five existing `.md` files

| File | Covers | Up to date with the code? |
|---|---|---|
| `README.md` (128 lines) | Feature overview, quick-start command, default admin credentials, tech-stack summary, available npm scripts, a project-structure diagram, deployment pointer. | No — states **"Next.js 14.2"** (actual: `^15.5.10`, confirmed `15.5.15` at build time) and **"SQLite - Development database"** (actual `schema.prisma` provider is `mysql`; see Section 6). Lists `config.js` in the project-structure diagram as a real part of the app, though it is unimported/dead (Section 5). |
| `API_DOCUMENTATION.md` (220 lines) | Endpoint reference for `/api/register`, `/api/abstracts` (+ `[id]`), `/api/admin`, `/api/send_email`, `/api/questions`, plus generic error-code notes and fetch/cURL examples. | No — omits roughly half of the actual API surface documented in Section 3 (`/api/auth/login`, `/api/auth/setup`, `/api/certificate`, all `/api/gallery/*` routes, `/api/library` + `/api/library/upload`, `/api/news`, `/api/users`). States admin login is "verified on the frontend" (`يتم التحقق من بيانات المسؤول في الواجهة الأمامية`), which contradicts the actual `/api/auth/login` route's server-side bcrypt/JWT verification (Section 6). Dated "25 أبريل 2026" (25 April 2026) at the bottom. |
| `SETUP_GUIDE_AR.md` (211 lines) | Arabic setup walkthrough: install, `.env` setup (documents only `DATABASE_URL`/`EMAIL_USER`/`EMAIL_PASS`, omitting `ADMIN_TOKEN`/`NEXT_PUBLIC_ADMIN_TOKEN`/`PUBLIC_BLOB_READ_WRITE_TOKEN`/`JWT_SECRET`), default admin login, project-structure diagram, npm-script table, email setup, Prisma Studio, deployment options, troubleshooting. | No — its "متطلبات التطبيق" (requirements) section states "SQLite (مُضمّن في Prisma)" ("SQLite, bundled with Prisma") and its `.env` example uses `DATABASE_URL="file:./dev.db"`, both inconsistent with the schema's active `mysql` provider (Section 6). Also dated "25 أبريل 2026". |
| `DEPLOYMENT_CHECKLIST.md` (121 lines) | Arabic pre-deployment checklist (unchecked `- [ ]` items): environment setup, database init, security-hardening reminders (change default password, add hashing/JWT — both of which the current code already does in most paths, per Section 6, making this checklist item stale), email setup, SSL/domain, local + performance testing, production-database migration, deployment steps for Vercel or a custom server, monitoring, documentation, post-launch. | Partially — its security section tells the reader to "add password hashing (bcrypt)" and "add JWT auth," both of which are already implemented in the current code (Section 6), so the checklist reads as written before those features existed and was not revised afterward. Also dated "25 أبريل 2026". |
| `START_HERE.md` (308 lines) | A meta-summary of "what was accomplished" (lists the other 4 docs, `.env.example`, `config.js`, and the `scripts/*` files as deliverables), a getting-started walkthrough, a link table (includes `http://localhost:3000/registration` and `http://localhost:3000/api/abstracts` as "important links"), dashboard feature list, email setup, DB management, full project-structure diagram, deployment steps, troubleshooting, final reminders. | No — explicitly lists `config.js` as a delivered, meaningful "central configuration file" (item 5 under "الوثائق المضافة"), though it is dead code (Section 5); its project-structure diagram (lines 193–223) also shows `config.js` and omits the `dashboard/gallery`, `dashboard/news`, `login`, `live`, `media`, `program`, `lif` routes entirely. Also dated "25 أبريل 2026". |

All five documents carry the identical trailing date "25 أبريل 2026" (25 April 2026), and all describe a version of the project centered on SQLite, `config.js`, and a narrower API surface than what currently exists in `app/api/`, suggesting they were authored together at one point in the project's history and not revised as the codebase (MySQL migration, Vercel Blob storage, expanded gallery/library/news/auth API surface) moved on from that point.

---

*End of audit.*
