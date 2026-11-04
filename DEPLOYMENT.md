# Deploying bishwabandhu.me

The API runs on **Render** and the website on **Vercel**, with data in **MongoDB Atlas**, files on **Cloudinary** and email through **Resend**. All five have free tiers that are enough for this site. Plan for about an hour the first time.

```
visitor ──► bishwabandhu.me (Vercel, Next.js)
              │  pages are pre-rendered and cached, so visitors never wait for the API
              │  /api/* is forwarded ──► portfolio-api.onrender.com (Render, Express)
              │                                 ├─► MongoDB Atlas
              │                                 ├─► Cloudinary (photo, images, resume PDFs)
              │                                 └─► Resend (contact-form emails)
              ◄── POST /api/revalidate after every admin edit
```

---

## 1. Your env files (already created)

Four ready-made env files sit next to the code. All of them are **gitignored**, so they never reach GitHub. The random secrets are already generated, and the shared ones already match across each pair. Only fill in the lines that say `PASTE_ME`.

| File | Used for | Fill in |
|---|---|---|
| `server/.env` | Running the API on your computer, and seeding Atlas (step 2) | `MONGODB_URI`, `ADMIN_PASSWORD`, `CLOUDINARY_*` (optional `RESEND_API_KEY`) |
| `client/.env.local` | Running the website on your computer | Nothing; it already points at `http://localhost:4000` |
| `server/.env.render` | **Paste into Render** → Environment → *Add from .env* | `MONGODB_URI`, `CLOUDINARY_*` (optional `RESEND_API_KEY`) |
| `client/.env.vercel` | **Paste into Vercel** → Settings → Environment Variables (paste the whole file into the first *Key* box) | `API_URL`, once Render gives you the service URL |

| Secret | Render (API) | Vercel (website) | Purpose |
|---|---|---|---|
| `JWT_SECRET` | ✅ | ❌ never | Signs admin sessions. Only the API needs it |
| `REVALIDATE_SECRET` | ✅ | ✅ same value | Lets the API refresh the site's cache |
| `PROXY_SECRET` | ✅ | ✅ same value | Proves the visitor IP came from your site, so rate limits are per visitor |
| `IP_HASH_SALT` | ✅ | ❌ | Hashes contact-form IPs |

The production pair (`.env.render` / `.env.vercel`) has different secrets from the local pair, so a leaked dev file can't touch production. In production the API refuses to start if `REVALIDATE_SECRET`, `PROXY_SECRET` or `IP_HASH_SALT` is shorter than 32 characters.

To regenerate all secrets, delete the four files and recreate them from the `.env.example` files with:

```bash
node -e "for (const k of ['JWT_SECRET','REVALIDATE_SECRET','PROXY_SECRET','IP_HASH_SALT']) console.log(k + '=' + require('crypto').randomBytes(32).toString('hex'))"
```

---

## 2. MongoDB Atlas

1. Create a free **M0** cluster at https://cloud.mongodb.com. Choose AWS **Mumbai (ap-south-1)**.
2. **Database Access** → add a user with a generated password and the "Read and write to any database" role.
3. **Network Access** → add `0.0.0.0/0`. Render's free tier has no fixed outbound IP; the password still protects the database.
4. **Connect → Drivers** → copy the connection string. Insert the password and add the database name before the `?`:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority`

### Seed the database (from your computer)

```bash
cd server
cp .env.example .env
```

Put the Atlas URI into `MONGODB_URI`, plus `JWT_SECRET`, `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD`. Then run:

```bash
npm install && npm run seed
```

This creates your admin account and loads all your content. `ADMIN_PASSWORD` is used only here; it isn't needed on Render.

---

## 3. Cloudinary and Resend

**Cloudinary** (https://cloudinary.com):
1. Dashboard → copy the Cloud name, API key and API secret.
2. **Settings → Security → "Allow delivery of PDF and ZIP files"** → enable it. Without this, resume downloads return 401.

**Resend** (https://resend.com):
1. **Domains → Add domain** → `bishwabandhu.me`. Add the DNS records it shows at your domain registrar (MX, SPF TXT, DKIM). Wait until it says *Verified*.
2. **API Keys** → create a key with "Sending access".

Until the domain is verified, you can leave `RESEND_API_KEY` empty. Messages are still saved to the inbox; only the email notification is skipped.

---

## 4. API on Render

1. Render → **New → Web Service** → connect the GitHub repo.
2. Settings:

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/health` (under *Advanced*) |
| Instance type | Free |

3. **Environment → Add from .env** → paste the whole of `server/.env.render` (after filling in `MONGODB_URI` and the Cloudinary keys) → *Save*.
4. Deploy.

> Prefer infrastructure-as-code? [`render.yaml`](render.yaml) describes the same service (Render → **New → Blueprint**). Its `generateValue` secrets differ from the ones in your env files, so if you use it, copy `REVALIDATE_SECRET` and `PROXY_SECRET` from Render into `client/.env.vercel` before step 5.

When it is live, open `https://<your-service>.onrender.com/health`. You should see `{"status":"ok","db":"connected",…}`.

> **Free tier note:** Render's free tier sleeps after 15 minutes without traffic and takes about 30–50 seconds to wake. Visitors are not affected, because public pages are served from Vercel's cache. Only the admin panel and the contact form may wait on the first request after a quiet period. To avoid that, use a paid instance or an uptime pinger such as UptimeRobot on `/health` every 10 minutes.

---

## 5. Website on Vercel

1. Vercel → **Add New → Project** → import the repo.
2. **Root Directory:** `client`. Vercel detects Next.js.
3. **Environment Variables:** put your Render URL into `API_URL` in `client/.env.vercel`, then paste the whole file into the first *Key* box. Vercel splits it into the four variables `API_URL`, `NEXT_PUBLIC_SITE_URL`, `REVALIDATE_SECRET` and `PROXY_SECRET`. Apply them to Production and Preview.
4. Deploy. You don't need to wake Render first: the build does it for you (see below).

### What the build does on Vercel

`npm run build` runs `client/scripts/prebuild.mjs` first. It:

- **checks the environment:** missing variables, a leftover `PASTE_ME`, or `localhost` in `API_URL` stop the build with a message that names the variable;
- **wakes the API:** it calls `API_URL/health` for up to 2 minutes (enough for Render's cold start), then checks `/api/public/site` to confirm the database is seeded;
- **stops before publishing anything broken:** if the API can't be reached, the build fails and **Vercel keeps serving the previous deployment**.

Then `next build` pre-renders:

- the home page;
- every project page;
- all 16 admin screens;
- `sitemap.xml`, `robots.txt`, and the favicon and share images.

So every URL is a real page on Vercel. Refreshing or opening a deep link never returns a 404, and there is no single-page-app fallback to configure.

Content changes made in `/admin` **don't need a rebuild**:
- Edited pages refresh within seconds.
- A project added later gets its page on its first visit, and from then on it is cached like the others.
- A deleted project's URL shows the not-found page, marked `noindex` for search engines.

---

## 6. Custom domain

1. Vercel → Project → **Settings → Domains** → add `bishwabandhu.me` and `www.bishwabandhu.me`. Choose to redirect `www` to the apex.
2. At your registrar, add the records Vercel shows: usually an `A` record for `@` (`76.76.21.21`) and a `CNAME` for `www` (`cname.vercel-dns.com`).
3. Wait for the certificates to be issued. HTTPS is automatic.
4. Check that Render's `CLIENT_URL` is `https://bishwabandhu.me` and `CLIENT_ORIGINS` includes it. These are already the defaults in `render.yaml`.

The site sends `Strict-Transport-Security` with `preload`. Only submit the domain to https://hstspreload.org once every subdomain you use serves HTTPS.

---

## 7. After the first deploy

Run through this checklist on the live site:

- [ ] `https://bishwabandhu.me` loads with your content. `/robots.txt`, `/sitemap.xml` and `/opengraph-image` respond.
- [ ] `/admin` redirects to the login page. Sign in with the seeded account.
- [ ] **Profile:** upload your photo. **Resumes:** upload the three PDFs and make "SDE / Full Stack" the default. Open each one to check that PDF delivery works.
- [ ] Edit something small (for example the tagline), save, and reload the public site. The change should appear on the next load.
- [ ] Send yourself a message through the contact form. It should appear in **Messages**, and an email should arrive if Resend is set up.
- [ ] **Per-visitor rate limits:** in Render → Logs, a contact submission should log the visitor's IP, not a Vercel address. The API relies on Vercel's `x-real-ip` / `x-forwarded-for` headers, which `proxy.ts` forwards with `PROXY_SECRET`. If every visitor shows up as the same address, check that `PROXY_SECRET` matches on both sides.
- [ ] Run https://pagespeed.web.dev on the home page and a project page.
- [ ] Share the link in a private chat (WhatsApp, LinkedIn message) to check the preview card.
- [ ] Google Search Console → add the domain → submit `https://bishwabandhu.me/sitemap.xml`.
- [ ] Change the admin password once from **Admin → Password**, so the seed password is no longer valid anywhere.

---

## Day-to-day

- **Content:** everything is edited in `/admin`; no redeploy is needed.
- **Code changes:** push to the deployed branch. Vercel and Render redeploy automatically.
- **Backups:** Atlas M0 has no automatic backups. Export now and then with
  `mongodump --uri "<MONGODB_URI>" --out backup-$(date +%F)`
  or upgrade the cluster for scheduled snapshots.
- **Rotating secrets:**
  - `JWT_SECRET`: changing it on Render signs you out everywhere.
  - `REVALIDATE_SECRET` and `PROXY_SECRET`: change them on Render and Vercel together, then redeploy both.
- **Forgot the admin password:** run the seed locally against Atlas with `npm run seed -- --reset-admin`, after setting a new `ADMIN_PASSWORD` in `server/.env`.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Vercel build log: "Build stopped: fix these environment variables first" | The listed variable is missing, still says `PASTE_ME`, or points at localhost. Fix it in Vercel → Settings → Environment Variables, then redeploy |
| Vercel build log: "the API … did not respond" | Render is down or `API_URL` is wrong. Open `API_URL/health` in a browser; if it loads, redeploy |
| Vercel build log: "/api/public/site responded 404 … npm run seed" | The database is empty. Run the seed (step 2) |
| Admin edits don't show on the site | `REVALIDATE_SECRET` differs between Render and Vercel, or `CLIENT_URL` on Render is wrong. Render logs show `[revalidate] …` warnings |
| Resume links return 401 | Cloudinary PDF delivery is disabled (step 3) |
| "File uploads are not configured" | The `CLOUDINARY_*` variables are missing on Render |
| Every visitor gets "Too many messages" | Per-visitor IP isn't reaching the API. Check `PROXY_SECRET` on both sides (see the checklist) |
| API won't start: "Set a random value of at least 32 characters…" | A production secret is missing or too short |
| Login says "Too many failed attempts" | The 15-minute lockout after 5 wrong passwords. Wait, or reset with `--reset-admin` |
