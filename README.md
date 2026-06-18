# Coastline Electrical Co. — Central Coast NSW

A premium, multi-page website template for a local Australian electrician.
Built with **plain HTML, CSS and JavaScript** — no framework, no build step, no
paid dependencies. Fast, responsive, accessible, SEO-ready and built to connect
to **GoHighLevel** when it goes live.

> **Positioning (important):** Coastline does **not** offer 24/7 emergency
> callouts. The site markets *scheduled* electrical work and *urgent priority*
> bookings during business hours, and points genuine emergencies to 000 /
> Ausgrid 13 13 88. This is reinforced consistently across every page.

---

## Run it

Double-click `index.html`, or serve the folder:

```bash
python3 -m http.server 8123   # then open http://localhost:8123
```

No install or build needed. See **DEPLOY.md** to publish (Netlify, Vercel,
Cloudflare Pages, GitHub Pages, or any static host) and to wire up GoHighLevel.

---

## What's inside

```
coastline-electrical/
├── index.html              # Home (hand-built showpiece)
├── services.html           # Services hub (all 10 services)
├── about.html  projects.html  service-areas.html
├── book.html               # 5-step booking flow + GHL calendar embed slot
├── contact.html  faq.html  blog.html  privacy.html
├── services/               # 10 service detail pages
├── areas/                  # 10 suburb pages (~700-800 words, local SEO)
├── blog/                   # 5 articles
├── assets/
│   ├── css/styles.css      # design system + components + responsive + reduced-motion
│   ├── js/main.js          # nav, scroll reveal, lead capture, AI chatbot, icon sprite
│   ├── js/booking.js       # booking calendar + step flow
│   ├── img/                # favicon + where real images go (branded placeholders until then)
│   └── videos/             # where the Higgsfield hero loop goes (CSS fallback if absent)
├── lib/integrations.js     # business + GoHighLevel config (REPLACE_ME values)
├── functions/              # serverless lead routes -> GoHighLevel webhooks
│   ├── _ghl.js  contact.js  booking.js  chat-lead.js
├── build/                  # OPTIONAL static-site generator (Python) — see below
├── sitemap.xml  robots.txt  manifest.json
├── .env.example            # environment variables for your host
├── higgsfield-prompts.md   # video/image generation prompts
└── DEPLOY.md  README.md
```

---

## Editing content

Everything is plain text — search and replace:

- **Phone:** `(02) 4321 1234` (display) and `+61243211234` (the `tel:` value).
- **Email:** `hello@coastlineelectrical.com.au`.
- **Business name / licence / ABN:** in `lib/integrations.js` and the footer.
- **Colours / fonts:** CSS variables at the top of `assets/css/styles.css`.

### The optional generator (`build/`)
Most pages share the same header, footer and nav. To keep ~30 pages perfectly
consistent, they're produced by a small Python generator. **The HTML it outputs
is the real site — you can edit those files directly and ignore the generator.**
If you'd rather change shared content (e.g. the nav or footer) in one place and
regenerate, edit `build/chrome.py` (chrome) or the `*_data.py` files (services,
areas, blog content) and run:

```bash
python3 build/build.py
```

`index.html` and `services.html` are hand-built and are **not** overwritten by
the generator.

---

## How the pieces work

- **AI chatbot** (`main.js`) — a floating assistant, bottom-right, on every page.
  Scripted demo flow: asks what work, suburb, property type, then collects name,
  phone and email and POSTs the lead to `/api/chat-lead`. Includes the no-24/7
  safety disclaimer and is clearly labelled a demo, ready to swap for a real AI
  backend (replace the `Chat.step()` logic with calls to your model).
- **Booking flow** (`booking.js`) — choose service → date (custom calendar with
  fake availability) → time → details → confirmation. Validates fields, shows a
  success screen, and POSTs to `/api/booking`. There's also a "Book through our
  calendar" section ready for a GoHighLevel embed.
- **Forms** — the contact form and booking flow submit to the API routes (not
  `console.log`). With no backend configured they still succeed in "demo mode",
  saving leads to `localStorage`. Press **Alt + L** or add `?debug` to any URL
  to view captured leads.
- **Lead data shape** (sent to GoHighLevel) includes: name, phone, email,
  suburb, address, service type, property type, urgency, preferred date/time,
  message, source page, lead source (`website`) and tags
  (`electrician`, `central-coast`, plus the selected service slug).

## Features
- Cinematic hero with background-video slot + premium CSS/SVG fallback
- Sticky header, mobile drawer, floating call/book bar on mobile
- Smooth scroll-reveal, counters and hover effects (Framer-Motion-style, in CSS/JS), all respecting `prefers-reduced-motion`
- Full SEO: per-page titles/descriptions, canonical, Open Graph, Twitter cards,
  JSON-LD (`Electrician` LocalBusiness, `Service`, `FAQPage`, `BlogPosting`,
  `BreadcrumbList`), `sitemap.xml`, `robots.txt`, `manifest.json`
- Accessible: semantic headings, labelled controls, keyboard-friendly, AA contrast
- Australian spelling and local Central Coast copy throughout

---

*Demo template by CoastForge. Replace placeholder business/licence details and
review the privacy policy before publishing.*
