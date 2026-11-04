# bishwabandhu.me

Personal portfolio of **Bishwa Bandhu Parmar** with a private admin dashboard. Every piece of content (profile, projects, experience, skills, resumes, theme, SEO) lives in MongoDB and is edited from `/admin`.

```
portfolio-04/
├─ client/   Next.js 16 App Router frontend (Vercel)
└─ server/   Express + MongoDB REST API (Render)
```

## Status

| Phase | Scope | State |
|---|---|---|
| 1 | Plan, schemas, routes | ✅ |
| 2 | Backend API: auth, models, CRUD, uploads, contact, seed | ✅ |
| 3 | Public website, design system, 3D hero | ✅ |
| 4 | Admin dashboard | ✅ |
| 5 | SEO, performance, security review, deployment | ✅ |

**Deploying:** see [DEPLOYMENT.md](DEPLOYMENT.md) (Atlas, Cloudinary, Resend, Render, Vercel, custom domain, post-deploy checklist).

---

## Quick start (both apps)

```bash
# 1. API (see "Server" below for the .env values)
cd server && npm install && cp .env.example .env && npm run seed && npm run dev

# 2. Website, in a second terminal
cd client && npm install && cp .env.example .env.local && npm run dev
```

Open http://localhost:3000. The site reads everything from the API at `API_URL`, so the API must be running.

---

## Client (`client/`)

**Stack:** Next.js 16 (App Router, Cache Components, Turbopack), React 19, TypeScript, Tailwind CSS 4, Motion (Framer Motion), React Three Fiber + three.js, lucide-react + simple-icons.

### Environment (`client/.env.local`)

| Variable | |
|---|---|
| `API_URL` | Express API base URL, e.g. `http://localhost:4000` or your Render URL |
| `NEXT_PUBLIC_SITE_URL` | This site's public URL (`https://bishwabandhu.me` in production) |
| `REVALIDATE_SECRET` | Same value as the server's `REVALIDATE_SECRET` |
| `PROXY_SECRET` | Same value as the server's `PROXY_SECRET`. `proxy.ts` sends it with each visitor's IP so the API's rate limits work per visitor |

### Scripts

| Command | |
|---|---|
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm run build && npm start` | Production build. `prebuild` first checks the env vars and wakes the API (up to 2 min), because pages are pre-rendered from it; the build stops with a clear message if either is wrong |
| `npm run typecheck` | Generate route types and run TypeScript |
| `npm run lint` | ESLint |

### How content stays fresh

- Pages are pre-rendered and cached with `'use cache'` + `cacheTag('portfolio')`, so visitors never wait for the API, even when Render's free tier is asleep.
- After every admin edit, the API calls `POST /api/revalidate` (with `x-revalidate-secret`). The next page load then shows the change, including theme colors.
- There is a daily background refresh as a safety net.
- The browser never calls the API directly. `/api/*` is rewritten to `API_URL`, so the admin cookie stays first-party.

### Structure

```
client/
├─ app/
│  ├─ layout.tsx               fonts, theme CSS variables, pre-paint dark/light script, metadata
│  ├─ (site)/layout.tsx        navbar + footer
│  ├─ (site)/page.tsx          home page sections, in order
│  ├─ (site)/projects/[slug]/  project detail (pre-rendered per project)
│  └─ api/revalidate/route.ts  cache refresh webhook
├─ components/
│  ├─ sections/   Hero, About, Experience, Projects, Skills, CodingProfiles, Education, Contact
│  ├─ three/      HeroVisual (capability check, lazy load, pause off-screen) + HeroScene (R3F)
│  ├─ motion/     scroll reveal + stagger (respects prefers-reduced-motion)
│  └─ ui/         buttons, cards, icons, markdown
└─ lib/           API client, types, theme + contrast helpers, Cloudinary image loader
```

### Admin dashboard (`/admin`)

Sign in at `/admin/login` with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you seeded. There is no signup.

| Page | What you can do |
|---|---|
| Dashboard | Project and unread-message counts, last content update, latest messages |
| Messages | Search, filter (unread/read/replied), open (marks as read), reply by email, mark replied/unread, delete |
| Profile | Name, title, company, tagline, bio, location, availability, email, phone (hidden by default), photo upload; quick stats |
| Resumes | Upload PDF versions, choose the default for every Download button |
| Social links, Projects, Experience, Skills, Coding profiles, Education, Certifications | Add, edit, delete, show/hide, drag to reorder (or focus the handle and use the arrow keys) |
| Section headings | Label, heading and intro text for each home-page section |
| Theme | Presets, custom accent colours for dark and light, default mode, live preview with contrast check |
| SEO | Site title, meta description, keywords, Open Graph image |
| Password | Change password (signs out every other session) |

How it works:

- **Guarding:** `client/proxy.ts` redirects to the login page when there is no session cookie, and marks `/admin` pages `noindex` and `no-store`. The Express API verifies the session on every request, and the admin shell signs out on any 401. The JWT secret lives only on the API, so the web server can never mint admin tokens.
- **Forms:** forms are declared as field lists (`lib/admin/collections.tsx`, `lib/admin/settings.ts`) and rendered by `components/admin/FormFields.tsx`. Field names match the server's Zod schemas, so server validation errors appear under the right input.
- **Uploads:** files go to `/api/admin/uploads` first, then the returned file is saved onto the item. Uploads you replace or cancel before saving are deleted from Cloudinary; files replaced on a saved item are deleted by the server.
- **Publishing:** every save triggers the site refresh, so the public site shows the change on the next page load.

### Design notes

- Accent colors come from the database. `lib/color.ts` derives a button shade and a text shade from each accent so they always pass WCAG AA (4.5:1), whatever color is picked in the admin.
- Icons: lucide-react for the interface, simple-icons for brand logos. Skill icons are stored as a simple-icons slug (`react`) or `lucide:<name>` (`lucide:database`).
- Section headings are stored in the database too (`settings.sections`). In the coding-profiles title, `{total}` is replaced with the live problem count.
- 3D hero: loaded only after the page is idle, and only on devices with WebGL. It is skipped for reduced motion, data saver, and low-power phones (which get a static gradient). Pixel ratio is capped at 1.5, and rendering pauses when the hero is off-screen or the tab is hidden.

---

## Server (`server/`)

**Stack:** Node 20+, Express 5, TypeScript, Mongoose 8, Zod 4, JWT (httpOnly cookie), bcrypt, Helmet, express-rate-limit, Multer → Cloudinary, Resend.

### Run locally

```bash
cd server
npm install
cp .env.example .env        # then fill in the values below
npm run seed                # creates the admin + loads your content
npm run dev                 # http://localhost:4000
```

Required in `.env`:

| Variable | What to put |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string (Atlas → Connect → Drivers), ending in `/portfolio` |
| `JWT_SECRET` | 64 random hex chars: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Your login. Password needs 12+ chars with upper, lower and a number |

Optional: `CLOUDINARY_*` (uploads return 503 without it), `RESEND_API_KEY` (contact emails are printed to the console without it), `REVALIDATE_SECRET` + `CLIENT_URL` (instant site refresh after edits).

### Scripts

| Command | |
|---|---|
| `npm run dev` | Start with auto-reload |
| `npm test` | 31 integration tests against an in-memory MongoDB (no Atlas needed; first run downloads a MongoDB binary) |
| `npm run typecheck` | TypeScript check |
| `npm run build && npm start` | Production build |
| `npm run seed` | Create the admin if none exists and fill empty collections |
| `npm run seed -- --force` | Wipe and reload all content (keeps messages and the admin) |
| `npm run seed -- --reset-admin` | Replace the admin email/password from `.env` and sign out all sessions |

### API

All responses are JSON. Errors look like `{ "error": { "code", "message", "fields?" } }`.

**Public**

| Method | Path | |
|---|---|---|
| GET | `/health` | Uptime + DB status |
| GET | `/api/public/site` | Everything the home page needs, in one request |
| GET | `/api/public/projects` | Visible project slugs (for static generation and the sitemap) |
| GET | `/api/public/projects/:slug` | Full project + prev/next |
| GET | `/api/public/resume[/:slug]` | 302 redirect to the default (or named) resume PDF |
| POST | `/api/public/contact` | `{ name, email, subject, message, website }` (`website` is the honeypot). 5 per hour per IP |

**Auth**

| Method | Path | |
|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` → sets the `pf_session` cookie. 10 per 15 min per IP; the account locks for 15 min after 5 wrong passwords |
| POST | `/api/auth/logout` | Clears the cookie |
| GET | `/api/auth/me` | Current admin |
| PATCH | `/api/auth/password` | `{ currentPassword, newPassword }`, signs out other sessions |

There is no signup route.

**Admin** (session cookie required)

| Method | Path | |
|---|---|---|
| GET | `/api/admin/dashboard` | Counts, unread messages, last content update |
| GET | `/api/admin/settings` | Full settings, including the phone number |
| PATCH | `/api/admin/settings/profile` \| `stats` \| `sections` \| `theme` \| `seo` | Partial updates (`sections` = heading copy for each home-page section) |
| GET POST | `/api/admin/{collection}` | List / create |
| GET PATCH DELETE | `/api/admin/{collection}/:id` | Read / update / delete |
| PATCH | `/api/admin/{collection}/reorder` | `{ ids: [...] }` in the new order |
| PATCH | `/api/admin/resumes/:id/default` | Make this the Download button's resume |
| POST | `/api/admin/uploads?kind=image\|pdf&folder=profile\|projects\|resumes\|seo\|misc` | Multipart field `file`, max 5 MB, JPG/PNG/WEBP/PDF checked by file contents → `{ media }` |
| DELETE | `/api/admin/uploads` | `{ publicId, resourceType }`, discard an unsaved upload |
| GET | `/api/admin/messages?q=&status=&page=&limit=` | Inbox search + filter |
| GET PATCH DELETE | `/api/admin/messages/:id` | `PATCH { status: "unread" \| "read" \| "replied" }` |

`{collection}` is one of `projects`, `resumes`, `social-links`, `experience`, `skill-groups`, `education`, `certifications`, `coding-profiles`.

Uploading is two steps: `POST /uploads` returns a `media` object, which you then save onto the profile, project or resume. Replaced or deleted files are removed from Cloudinary automatically.

### Security

**Accounts and sessions**
- Passwords are hashed with bcrypt (cost 12). Unknown emails take as long to reject as wrong passwords.
- Lockout: 5 wrong passwords lock the account for 15 minutes. Each attempt claims a slot atomically *before* the password check, so parallel requests can't exceed the limit.
- Sessions are a JWT in an `httpOnly`, `SameSite=Lax` cookie (`Secure` in production).
- Logging out or changing the password bumps `sessionVersion`, which revokes every outstanding token on the server, not just in the browser.

**Input handling**
- Every input is validated with Zod. Links must be `http(s)`; images must be Cloudinary URLs inside this site's `CLOUDINARY_FOLDER`, so the server never deletes another app's files.
- NoSQL injection: `$` and dotted keys are stripped, and Mongoose `sanitizeFilter` is on.
- XSS:
  - HTML is stripped from text fields with linear-time matching (no ReDoS).
  - Markdown is rendered without raw HTML.
  - JSON-LD escapes `<`, `>`, `&`, U+2028 and U+2029.
  - The website sends a strict CSP: no third-party scripts, `frame-ancestors 'none'`, `object-src 'none'`, plus HSTS and other security headers.

**Abuse protection**
- Rate limits are global, plus stricter ones on login and the contact form. They run before body parsing.
- Behind the website, visitors are identified by `x-client-ip` + `PROXY_SECRET` set by `proxy.ts`. Spoofed headers on direct requests to the API are ignored.
- Contact IPs are stored only as HMAC-SHA256 hashes.
- In production the API refuses to start with missing or short secrets.
- Helmet is on, and CORS is limited to `CLIENT_ORIGINS`.

The regression tests for all of this are in `server/tests/security.test.ts`.

### Performance (Lighthouse 13, local production build)

| Page | Desktop (perf / a11y / best practices / SEO) | Mobile (perf / a11y / best practices / SEO) |
|---|---|---|
| Home | 100 / 100 / 100 / 100 | 78–81 / 100 / 100 / 100 |
| Project detail | 100 / 100 / 100 / 100 | 83–88 / 100 / 100 / 100 |

The mobile score is limited by the Next.js + React runtime under Lighthouse's 4× CPU throttle on the test laptop. A near-empty page in the same app scored 83–85 there. Re-check with PageSpeed Insights after deploying (see DEPLOYMENT.md).

What keeps it fast:
- Pages are pre-rendered.
- The hero has a CSS-only entrance.
- The 3D scene loads only on desktop, after the first interaction, and its WebGL check is deferred until then.
- No schema library ships to visitors.
- Cloudinary resizes images.
- Fonts are self-hosted by `next/font`.

### Cloudinary note

Free Cloudinary accounts block PDF delivery by default. If resume links return 401, open **Cloudinary → Settings → Security** and enable **Allow delivery of PDF and ZIP files**.
