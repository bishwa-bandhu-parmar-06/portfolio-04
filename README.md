# bishwabandhu.me

Personal portfolio of **Bishwa Bandhu Parmar** with a private admin dashboard. Every piece of content (profile, projects, experience, skills, resumes, theme, SEO) lives in MongoDB and is edited from `/admin`.

```
portfolio-04/
├─ client/   Next.js 14 App Router frontend (Vercel)    ← Phase 3–4
└─ server/   Express + MongoDB REST API (Render)
```

## Status

| Phase | Scope | State |
|---|---|---|
| 1 | Plan, schemas, routes | ✅ |
| 2 | Backend API: auth, models, CRUD, uploads, contact, seed | ✅ |
| 3 | Public website, design system, 3D hero | ⏳ |
| 4 | Admin dashboard | ⏳ |
| 5 | SEO, performance, security review, deployment | ⏳ |

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
| PATCH | `/api/admin/settings/profile` \| `stats` \| `theme` \| `seo` | Partial updates |
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

- Passwords hashed with bcrypt (cost 12). Unknown emails take as long to reject as wrong passwords.
- JWT in an `httpOnly`, `SameSite=Lax` cookie (`Secure` in production). Tokens issued before a password change are rejected.
- Every input is validated with Zod. Links must be `http(s)`, and images must be Cloudinary URLs.
- NoSQL injection: `$` and dotted keys are stripped, and Mongoose `sanitizeFilter` is on.
- XSS: HTML tags are stripped from text fields. Markdown fields are rendered without raw HTML on the client.
- Helmet headers. CORS is limited to `CLIENT_ORIGINS`. Global, login and contact rate limits.
- Contact IPs are stored only as salted SHA-256 hashes.

### Cloudinary note

Free Cloudinary accounts block PDF delivery by default. If resume links return 401, open **Cloudinary → Settings → Security** and enable **Allow delivery of PDF and ZIP files**.
