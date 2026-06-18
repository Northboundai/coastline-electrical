# Master Build Prompt — Premium Multi-Page Trades Website (Coastline style)

The single consolidated command that reproduces the **Coastline Electrical**-style site:
dark, cinematic, multi-page, real video hero, real photos, generator-driven, with a native
booking flow, AI chatbot and GoHighLevel wiring.

**How to use:** paste everything below the line as one prompt. Fill the `‹…›` placeholders.
In **PAGES**, delete the lines for pages you don't want (the Blog is usually overkill for a
smaller business — drop it unless they actually publish articles). Industry-agnostic: works for
electrical, plumbing, HVAC, landscaping, builders, cleaning, etc.

> Sibling file `master-build-prompt.md` is the older **single-page, no-photo** EzPower style.
> Use **this** file when you want the premium multi-page site with a real video hero + photos.

---

You are a senior frontend developer, motion designer, premium web/UX designer, conversion
copywriter, local-SEO specialist and GoHighLevel integration expert.

Build a **premium, dark, multi-page demo website** for a local service business using **plain
HTML, CSS and JavaScript only** — no framework, no build step, no Node required. It must run by
double-clicking `index.html` and deploy to any static host. Use any installed design skills
(taste/anti-slop) so it never looks templated.

## Business details (edit these)
- Business name: ‹BUSINESS_NAME›
- Industry: ‹INDUSTRY, e.g. Electrical services›
- Location / region: ‹CITY/REGION, STATE, COUNTRY›
- Service areas (8–11 suburbs): ‹suburb, suburb, …›
- Services (8–10): ‹service, service, …›
- Phone: ‹PHONE› (+ the tel: E.164 form, e.g. +61…)
- Email: ‹EMAIL›
- Positioning / key promise: ‹e.g. "scheduled work, upfront quotes, NOT a 24/7 emergency callout" — or whatever is true. State plainly and reinforce site-wide.›
- Goal: generate leads, quote requests, calls and booked appointments via the form, booking flow and chatbot.

## Tech stack & architecture
- Static `HTML / CSS / JS`. No framework, no bundler, no Node. Works from `file://` and on any host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3). **Don't lock to one host.**
- Shared chrome (head, header, footer, nav, scripts) and the repetitive pages (services, areas, blog) are produced by a small **Python generator** (`build/`): `chrome.py` (shared chrome) + `*_data.py` (content) + `build.py` (writes the pages, `sitemap.xml`, `robots.txt`). The OUTPUT is plain editable HTML — the generator just keeps ~30 pages consistent. `index.html` and one hand-built showcase page are NOT generator-owned.
- One `assets/css/styles.css` (design system + components + responsive + reduced-motion), one `assets/js/main.js` (shared runtime), `assets/js/booking.js` (booking flow). Icons are an **inline SVG sprite injected by JS** (one consistent set, ~24px, stroke 1.75, currentColor — do not hand-draw inconsistent icons).

## PAGES (delete the ones you don't need)
- `index.html` — Home (hand-built showpiece)
- `services.html` — services hub + a detail page per service under `services/`
- `service-areas.html` — suburb grid + a ~700–800-word local-SEO page per suburb under `areas/`
- `projects.html` — 5 realistic project cards
- `about.html`
- `book.html` — native 5-step booking flow (+ optional GHL calendar embed slot)
- `contact.html` — form, click-to-call, hours, map placeholder
- `faq.html`
- `blog.html` + `blog/` posts  ← **OPTIONAL / usually overkill — drop unless they publish articles**
- `privacy.html`

## Design system (dark & premium — this is the look)
- **Dark, navy-led theme. NOT a white site.** One locked theme across every page. Deep navy page background, dark "surface" cards, light text, electric-blue primary accent, one warm secondary accent (e.g. amber). Use the client's brand palette if given.
- Drive everything from CSS variables/tokens (`--paper/--mist/--surface/--ink/--slate/--line/--accent`). **Never hardcode `#fff` backgrounds** — they become white-on-white in a dark theme.
- Fonts: a confident sans display + clean sans body via `next/font`-style `<link>` (e.g. **Sora + DM Sans**). Not Inter-as-default, not serif.
- Shape system: pill buttons, ~16–18px cards, ~12px inputs — pick one scale and keep it.
- Sticky dark-glass header (readable light text — verify it's never white-on-white), mobile drawer, floating call/book bar on mobile, click-to-call everywhere.

## Hero (cinematic, real video)
- Full-viewport dark hero: eyebrow pill, headline (≤2 lines), ≤20-word subhead, primary + ghost CTA, a small trust note, and a 4-up trust bar.
- **Background = ONE real Higgsfield video** behind a dark overlay, with a poster still + a premium CSS gradient/contour fallback so it looks great even with no video. Reference `assets/videos/‹slug›.mp4`.
- **Looping must be seamless — no cut, no flash, no merge.** Use ONE of:
  - a **static / locked-off camera** clip + plain native `loop` (the loop point is invisible), or
  - a **ping-pong** loop in JS for a moving clip (play forward, then reverse via rAF, repeat — turnaround frames are identical, so no cut and no second layer to blend).
  - **Do NOT crossfade two video layers** (it flashes or ghosts/merges). Slow playback (~0.5×) + a slow CSS zoom for calm. Resume play on `visibilitychange`.

## Sections / components
Home: hero + trust bar → services preview (cards) → suburb **marquee** → "who we are" split (with a real photo) → why-choose-us (divided, no white card) → 4-step "how booking works" (dark band) → featured projects (horizontal scroll, real photos) → reviews (3–6, real local names, ≤3-line quotes) → FAQ accordion → final CTA band. At least 4 different section layout families; don't repeat one.
Service card: icon, short benefit copy, **booking type** tag (standard appointment / diagnostic visit / site inspection), "Book this service" → `book.html?service=‹slug›`.
Service/area/blog detail pages: hero + body + relevant cards + FAQ (+ matching FAQ JSON-LD) + CTA; area pages ~700–800 words of genuine local content (housing stock, landmarks, common jobs).

## Booking flow (`book.html` + `booking.js`)
5 steps: **Service → Date → Time → Details → Confirm.** Custom month calendar with fake availability (past disabled, some days "fully booked", weekend rules), time-window slots, a full-width **"General / not sure"** service option, validation (required + AU phone + email + privacy consent), photo-upload placeholder, urgency (Flexible / This week / ASAP), loading + success states, confirmation summary. Submitting is a *request*, confirmed during business hours. Optionally include a commented GHL calendar-embed slot (skip if not wanted).

## AI chatbot (`main.js`, every page)
Floating bottom-right widget, animated open/close, clearly labelled a demo, ready for a real AI backend. Scripted flow: what work → suburb → home/rental/business → book-or-question → name → phone → email, then POST the lead to `/api/chat-lead` and confirm "the team will review and get back to you during business hours." Quick-reply chips, AU phone/email validation, a safety disclaimer for dangerous issues, and a push toward booking or calling.

## GoHighLevel integration
- `lib/integrations.js` (classic script, sets `window.‹BIZ›_CONFIG`): business info, GHL public ids (REPLACE_ME), booking URL, and `endpoints` `{contact, booking, chat}` → `/api/...`.
- `functions/` portable serverless routes `contact.js`, `booking.js`, `chat-lead.js` (+ shared `_ghl.js`): validate required fields, forward to the matching `GHL_*_WEBHOOK_URL` env var, return JSON; include commented Cloudflare/Node adapters and a note for where GHL API auth goes. `.env.example` with the public + secret vars. Document per-host placement in `DEPLOY.md`.
- Forms + chatbot **submit to these routes, not console.log**. With no backend they still succeed in **demo mode**: every lead is saved to `localStorage` (Alt+L / `?debug` panel to inspect) and the success UI shows. Canonical lead shape: name, phone, email, suburb, address, serviceType, propertyType, urgency, preferredDate, preferredTime, message, sourcePage, leadSource="website", tags `[‹industry›, ‹region-slug›, website, ‹service-slug›]`.

## SEO
Per-page `<title>`/description/canonical/theme-color, Open Graph + Twitter, semantic headings (one `<h1>`), Australian/local spelling, natural local keywords. JSON-LD: LocalBusiness (correct trade `@type`, `areaServed`, opening hours, `makesOffer`, `aggregateRating`), `Service`, `FAQPage` (matching on-page FAQ), `BreadcrumbList`, and `BlogPosting` if blog is included. Generate `sitemap.xml`, `robots.txt`, `manifest.json`, a favicon SVG.

## Animation (premium, not busy — all gated on `prefers-reduced-motion`)
Scroll reveals (IntersectionObserver, staggered), animated counters, hover **pops** on cards (icon scales/tilts/fills) and a shine sweep on primary buttons, one **marquee** per page (suburbs), drifting background glow orbs on dark bands, and an **industry-appropriate animated background motif** injected into dark sections + interior page heros — e.g. an **electrical current/circuit flow** (faint PCB-style traces with bright travelling pulses and pulsing nodes) for an electrician; adapt the motif to the trade (pipe-flow for plumbing, etc.). Smooth, hardware-accelerated, never breaks mobile.

## Higgsfield assets — credit discipline (important)
Generate the **minimum**: **ONE hero video** + ~6–8 photos (hero/about + project/service scenes). Preflight cost (`get_cost`), reason out the right prompt first, generate **once**, and solve any looping/quality issue in **code** — do **not** churn out multiple variants. For a seamless loop, prompt a **static/locked-off camera** clip (or ping-pong a moving one in code). Photos: clean, premium, realistic trade photography, no text/logos, no faces to camera. Also write a `higgsfield-prompts.md` with copy-ready prompts + target paths so the client can regenerate.

## Content & quality
Local, direct, trustworthy copy in the client's voice — no generic AI filler, no em-dashes, real local suburb/landmark references, real-sounding reviewer names. Fully responsive, mobile-first, accessible (labelled controls, keyboard-friendly, AA contrast, reduced-motion). Write a `README.md` (run, edit, generator, integrations, deploy) and `DEPLOY.md`.

## Pre-flight (verify before finishing)
Dark theme consistent and **no white-on-white** (header + any inline backgrounds); hero video loops with **no cut/flash/merge**; booking flow works end-to-end with validation + success; chatbot captures a lead; forms POST to the API routes + fall back to localStorage; SEO tags + JSON-LD + sitemap/robots/manifest present; marquee/reveals/hover/circuit motion all respect reduced-motion; mobile menu + floating bar work; **actually run it in a browser and confirm zero console errors** (note: some preview tabs are "hidden" and block video autoplay — verify hero playback in a real visible tab). **Create the full working files — do not only describe them.**
