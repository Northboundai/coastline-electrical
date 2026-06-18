# Deploying Coastline Electrical Co.

This is a **plain static site** (HTML, CSS, JS — no build step). It runs by
double-clicking `index.html`, and deploys to any static host. The lead capture
forms and chatbot work everywhere; connecting them to GoHighLevel is an optional
add-on that needs a host with serverless functions.

---

## 1. Preview locally

**Easiest:** double-click `index.html`.

**With a tiny server** (needed only if you add video files, which don't autoplay
over `file://` in some browsers):

```bash
# from inside the project folder
python3 -m http.server 8123
# then open http://localhost:8123
```
(or `ruby -run -e httpd . -p 8123`)

---

## 2. Deploy the static site (works on any host)

The whole project root is the publish directory. **No build command.**

| Host | How |
|------|-----|
| **Netlify** | Drag the folder onto app.netlify.com, or connect the GitHub repo. Build command: *none*. Publish dir: `/` (root). |
| **Vercel** | Import the repo. Framework preset: **Other**. Output dir: root. |
| **Cloudflare Pages** | Connect repo. Build command: *none*. Output dir: `/`. |
| **GitHub Pages** | Push to a repo, enable Pages on the branch root. (Static only — no serverless functions.) |
| **Any S3/CDN/cPanel** | Upload the files. Done. |

After deploying, update the absolute URLs in the page `<head>` tags and
`sitemap.xml` from `https://www.coastlineelectrical.com.au` to your real domain
(search-and-replace, or edit `BUSINESS["origin"]` in `build/chrome.py` and
re-run `python3 build/build.py`).

---

## 3. Connect the lead forms to GoHighLevel (optional)

Without this, every form and the chatbot still "work": leads are saved to the
browser's `localStorage` (press **Alt + L** or add `?debug` to any URL to see
them) and the success messages show. To send leads to your CRM:

### a) Create the webhooks in GoHighLevel
Automation → Workflows → Create Workflow → trigger **Inbound Webhook** → copy the
URL. Make three (one each for contact, booking, chatbot), then add workflow
actions: Create/Update Contact, Create Opportunity, tag by service, send the
confirmation SMS/email, etc. Contacts de-dupe by email.

### b) Set the environment variables (see `.env.example`)
```
GHL_CONTACT_WEBHOOK_URL=...
GHL_BOOKING_WEBHOOK_URL=...
GHL_CHATBOT_WEBHOOK_URL=...
NEXT_PUBLIC_GHL_BOOKING_URL=...   # optional, for the live calendar embed
```

### c) Put the function files where your host expects them
The routes live in `/functions` using the **Web Fetch API** signature. Map them
so the browser's `POST /api/contact|booking|chat-lead` reaches them:

- **Vercel** — move/copy `contact.js`, `booking.js`, `chat-lead.js` into an
  `/api` folder (`/api/contact.js` → `/api/contact`). They import `_ghl.js`, so
  copy that too (e.g. `/api/_ghl.js`).
- **Cloudflare Pages** — put them in `/functions/api/` (`functions/api/contact.js`
  → `/api/contact`) and uncomment the `onRequestPost` adapter at the bottom of
  each file. `_ghl.js` (underscore) is ignored as a route but still imported.
- **Netlify** — put them in `/netlify/functions/` and add redirects in
  `netlify.toml` so `/api/contact` → `/.netlify/functions/contact`:
  ```toml
  [[redirects]]
    from = "/api/*"
    to = "/.netlify/functions/:splat"
    status = 200
  ```
  Or just change the endpoints in `lib/integrations.js` to `/.netlify/functions/...`.

If your `/api/*` paths differ, edit `endpoints` in `lib/integrations.js` to match.

---

## 4. Optional: live GoHighLevel calendar embed

Set `NEXT_PUBLIC_GHL_BOOKING_URL` (mirror it in `lib/integrations.js` →
`ghl.bookingUrl`). The "Book through our calendar" section on `book.html` then
loads your LeadConnector widget in an iframe automatically. Until it's set, that
section shows a friendly placeholder and the native booking flow above it works.

---

## 5. Go-live checklist
- [ ] Replace `REPLACE_ME` values in `lib/integrations.js` (licence no., ABN, GHL ids, booking URL).
- [ ] Set real phone / email if they change (search `(02) 4321 1234` and `hello@coastlineelectrical.com.au`).
- [ ] Update the domain in `<head>` canonical/OG tags + `sitemap.xml` (or `build/chrome.py` origin, then re-run the generator).
- [ ] Add `og-cover.jpg` (1200×630) and a hero poster `central-coast-electrician.jpg`.
- [ ] Set the three `GHL_*_WEBHOOK_URL` env vars and test a submission.
- [ ] Review `privacy.html` and the licence/ABN details with the client.
- [ ] Submit `sitemap.xml` in Google Search Console.
