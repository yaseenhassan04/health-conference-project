# Known Issues

This is a record of pre-existing defects identified by `PROJECT_AUDIT.md` (Section 10), carried over verbatim as of the start of the `refactor/structure` branch. **None of these are fixed by the structural refactor.** They are logged here so that structural changes and behavior fixes stay in separate, traceable work.

---

### 1. `/api/users` selects Prisma fields that don't exist on the `User` model
- **File**: `app/api/users/route.js`, lines 13–19 (specifically `title` at line 16, `institution` at line 17)
- `prisma.user.findMany({ select: { id, fullName, title, institution, createdAt } })` — the `User` model in `prisma/schema.prisma` has no `title` or `institution` field. This would raise a Prisma validation error at request time.

### 2. `app/live/page.js` calls a non-existent API route
- **File**: `app/live/page.js`, `handleLike` function, lines 118–129 (the `fetch` call is at line 120)
- `POST /api/questions/${questionId}/like` is called, but only `app/api/questions/route.js` exists (GET/POST on the collection root). No `[id]` or `[id]/like` route exists under `app/api/questions/`.

### 3. `app/live/page.js` links to a route that doesn't exist (plural vs. singular)
- **File**: `app/live/page.js`, line 539
- `<Link href="/dashboard/submissions">` (plural) — the actual route directory is `app/dashboard/submission` (singular). This link 404s.

### 4. Dashboard nav config points at a page that doesn't exist
- **File**: `app/dashboard/layout.jsx` — `PAGE_META.users` (around line 57, `path: "/dashboard/users"`) and `ROLE_CONFIG.admin.pages` (line 34, includes `"users"`)
- No `app/dashboard/users/` directory or page exists anywhere in the project. The admin role's rendered navbar links to a 404.

### 5. Prisma datasource provider mismatch (mysql vs. sqlite)
- **Files**: `prisma/schema.prisma` line 7 (`provider = "mysql"`) vs. `prisma/migrations/migration_lock.toml` line 3 (`provider = "sqlite"`)
- Two literal SQLite database files also remain in the tree (`dev.db`, `prisma/dev.db`), and `.env.example` documents a SQLite-style `DATABASE_URL`. Running `prisma migrate` against this schema/lock-file combination would be expected to raise a provider-mismatch error.

### 6. Two independent, uncoordinated auth mechanisms
- **Files**: `app/dashboard/layout.jsx`, `decodeJWT` function, lines 17–25 (decodes the JWT payload with `atob`, does not verify the signature) plus the `useEffect`-based check at lines 247–261; and the `checkAuth(req)` function independently redefined in `app/api/admin/route.js` (17–19), `app/api/gallery/screens/route.js` (19–21), `app/api/gallery/upload/route.js` (6–9), `app/api/library/route.js` (19–21), `app/api/news/route.js` (17–23)
- The JWT-in-`localStorage` flow (client-side-only signature check, no server-side guard, no `middleware.js` anywhere) and the static `x-admin-token` shared-secret header check are unrelated mechanisms that happen to coexist.

### 7. Hardcoded fallback admin-secret `"samoud2025"` baked into client bundles
- **Files**: `app/dashboard/gallery/page.js` line 7 (module constant `TOKEN`, used at 9 call sites); `app/dashboard/library/page.jsx` lines 127, 266, 288; `app/dashboard/news/page.js` lines 60, 99, 125, 142 (bare literal, no env fallback at all)
- Server-side equivalents: `app/api/gallery/upload/route.js` line 7; `app/api/news/route.js` lines 17–20 (`checkAuth`)
- `NEXT_PUBLIC_ADMIN_TOKEN` (the intended non-fallback value) is also inlined into the client bundle at build time by Next.js convention, so even a "real" configured token is not private from anyone viewing the site's JS.

### 8. `scripts/init-db.js` seeds the default admin with a plaintext password
- **File**: `scripts/init-db.js`, line 18 (`password: 'admin'`, upserted directly, no `bcrypt.hash`)
- Inconsistent with every other admin-creation path in the codebase (`app/api/admin/route.js`, `app/api/auth/setup/route.js`, `scripts/create-media-admin.js`), which all hash the password before storing.

### 9. `next.config.js` is the live config file but is effectively empty
- **Files**: `next.config.js` line 1 (a single stray string-literal expression, no `module.exports`); `next.config.mjs` lines 4–8 (`experimental.serverActions.bodySizeLimit: '20mb'`) and 11–15 (`images.remotePatterns`)
- Next.js's config resolution order (`next.config.js` → `.mjs` → `.ts`) means `next.config.js` is found first and `next.config.mjs`'s real settings are never loaded. (Handled explicitly in Phase 2 of the refactor — not fixed here.)

### 10. `.env` is tracked by git
- **Files**: `.env` (tracked), `.gitignore` (excludes only `.env*.local`, not `.env` itself)
- The tracked `.env` contains real values for `DATABASE_URL`, `EMAIL_USER`, `EMAIL_PASS`, `ADMIN_TOKEN`, `NEXT_PUBLIC_ADMIN_TOKEN`, `PUBLIC_BLOB_READ_WRITE_TOKEN`.

### 11. Global mutable state at module load: 15 separate `new PrismaClient()` instantiations
- **Files**: `app/api/abstracts/route.js`, `app/api/abstracts/[id]/route.js`, `app/api/admin/route.js`, `app/api/auth/login/route.js`, `app/api/certificate/route.js`, `app/api/gallery/screens/route.js`, `app/api/library/route.js`, `app/api/questions/route.js`, `app/api/register/route.js`, `app/api/users/route.js`, `scripts/create-media-admin.js`, `scripts/init-db.js`, `test-prisma.js`, plus `lib/prisma.js` and the dead `app/lib/prisma.js`
- Each opens its own connection pool at import time rather than sharing one client. (Addressed structurally, without changing runtime behavior, in Phase 3.)

### 12. Side effects at module load in `app/api/abstracts/route.js`
- **File**: `app/api/abstracts/route.js`, lines 9–20
- `nodemailer.createTransport(...)` is constructed at module scope, so an SMTP transport is configured every time the route module loads, regardless of whether a request needing mail arrives.

### 13. Mixed `.js` / `.jsx` extension convention for otherwise-identical file roles
- **Example**: `app/dashboard/page.jsx`, `app/dashboard/layout.jsx`, `app/dashboard/library/page.jsx` use `.jsx`; `app/dashboard/gallery/page.js`, `app/dashboard/news/page.js`, `app/dashboard/submission/page.js` use `.js` — same folder tree, same file role, no discernible rule.
- Also at `app/` top level: `app/login/page.jsx` is `.jsx`; every sibling page is `.js`.

### 14. Mixed `.js` / `.mjs` config convention
- **Files**: `next.config.js` and `next.config.mjs` both exist for the same purpose (see #9).

### 15. Naming-casing inconsistency in the API route tree
- **File/folder**: `app/api/send_email/`
- Every other `app/api/*` folder is a single lowercase word or unseparated compound (`abstracts`, `admin`, `auth`, `certificate`, `gallery`, `library`, `news`, `questions`, `register`, `users`); `send_email` is the only one using `snake_case`.

### 16. `app/dashboard/p` — 0-byte, extensionless file of unclear origin
- **File**: `app/dashboard/p`
- Not a valid Next.js route file (no recognized name), inert, but its presence is unexplained.

### 17. `components/Navbar.js` is empty; `components/NavbarWrapper.jsx` depends on it
- **Files**: `components/Navbar.js` (0 bytes), `components/NavbarWrapper.jsx` (`import Navbar from './Navbar'`)
- `NavbarWrapper` would throw at render time if it were ever used, since it imports a default export that doesn't exist in an empty module. Neither file is currently imported anywhere else.

### 18. `public/تجميع.mp4` (47.7 MB) is untracked by git
- **File**: `public/تجميع.mp4`
- Unlike every other file in `public/`, which is committed, this one exists on disk but was never added to version control.

### 19. Duplicate re-uploads and a corrupt file under `public/uploads/research/`
- **Folder**: `public/uploads/research/`
- Several PDFs share the same base filename with only the upload timestamp differing (e.g. six separate `*-التكليف_الثاني.pdf` uploads). `public/uploads/research/Mazen_Soliman_Safi.jpg` is 17 bytes — too small to be a valid JPEG.

### 20. All five `.md` docs describe an outdated version of the project
- **Files**: `README.md`, `API_DOCUMENTATION.md`, `SETUP_GUIDE_AR.md`, `DEPLOYMENT_CHECKLIST.md`, `START_HERE.md`
- All carry the identical trailing date "25 أبريل 2026" and describe an earlier SQLite / Next.js 14.2 / `config.js`-centric state that no longer matches the current MySQL-provider schema, Vercel Blob storage, JWT-plus-shared-secret auth, and expanded API surface. Per-document specifics are in `PROJECT_AUDIT.md` Section 11. (Addressed with outdated-banners only, not rewritten, in Phase 7.)

---

*This file is a running record. Entries are added as issues are identified; existing entries are not removed or "resolved" by the structural refactor itself — only by dedicated bug-fix work outside this branch's scope.*
