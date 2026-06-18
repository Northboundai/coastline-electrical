# -*- coding: utf-8 -*-
"""
Coastline Electrical — static site generator.

Produces the HTML pages that share chrome (everything except the hand-built
index.html and services.html). The output is plain static HTML you can edit
directly; this script just keeps the many pages consistent.

Run:  python3 build/build.py
"""
import os
import sys
import json

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, ".."))

import chrome
from chrome import render, BUSINESS
from services_data import SERVICES
from areas_data import AREAS
from blog_data import POSTS

I = chrome.icon
ORIGIN = BUSINESS["origin"]

TESTIMONIALS = [
    ("Marg Henderson", "Terrigal · Switchboard upgrade", "MH",
     "Booked a switchboard upgrade online, got a clear quote, and they turned up exactly when they said. Tidy work and explained everything."),
    ("Dylan Tresize", "Gosford · EV charger", "DT",
     "Had our EV charger put in at Gosford. Fair price, no upsell, and they sorted the load management properly. Couldn't fault them."),
    ("Priya Naidu", "Coast Property Co. · Woy Woy", "PN",
     "We manage 40+ rentals and Coastline handle our smoke alarm and safety checks. Reliable, certificates on time, easy to deal with."),
    ("Aaron Whitlock", "Erina · LED lighting", "AW",
     "Whole-home LED upgrade. The difference is night and day and the power bill dropped. Clean job, no mess left behind."),
    ("Janelle Cardoso", "Umina · Renovation", "JC",
     "They handled the wiring for our reno and worked in with the builder without any dramas. Genuinely reliable, which is rare."),
    ("Stephen Ng", "The Entrance · Rental compliance", "SN",
     "Quick, professional smoke alarm and safety checks across two rentals. Paperwork sorted same day. Will use again."),
]


def write(path, html):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", path)


# ----------------------------------------------------------------- helpers
def page_hero(crumbs, h1, sub, prefix="", small=False):
    bc = ""
    parts = []
    for (label, href) in crumbs:
        if href:
            parts.append('<a href="%s%s">%s</a>' % (prefix, href, label))
        else:
            parts.append("<span>%s</span>" % label)
    bc = ('<span class="sep">/</span>'.join(parts))
    contour = ('<svg class="page-hero__contour" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
               '<g fill="none" stroke="#3d8bff" stroke-width="1.2" opacity="0.45">'
               '<path d="M-40 240 C 240 180 380 300 640 220 S 1100 130 1480 240"/>'
               '<path d="M-40 300 C 240 240 380 360 640 280 S 1100 190 1480 300"/></g></svg>')
    return """    <section class="page-hero">
      {contour}
      <div class="container container--wide">
        <nav class="breadcrumb" aria-label="Breadcrumb">{bc}</nav>
        <h1>{h1}</h1>
        <p>{sub}</p>
      </div>
    </section>""".format(contour=contour, bc=bc, h1=h1, sub=sub)


def faq_accordion(items):
    rows = []
    for q, a in items:
        if isinstance(a, (list, tuple)):
            body = "".join("<p>%s</p>" % p for p in a)
        else:
            body = "<p>%s</p>" % a
        rows.append(
            '<details class="faq" data-reveal><summary>%s <span class="faq__icon" aria-hidden="true"></span></summary>'
            '<div class="faq__body">%s</div></details>' % (q, body)
        )
    return '<div class="faq-list" data-reveal-group>\n' + "\n".join(rows) + "\n</div>"


def faq_jsonld(items):
    main = []
    for q, a in items:
        text = " ".join(a) if isinstance(a, (list, tuple)) else a
        main.append({"@type": "Question", "name": q,
                     "acceptedAnswer": {"@type": "Answer", "text": text}})
    return json.dumps({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": main}, indent=2)


def breadcrumb_jsonld(crumbs, prefix=""):
    items = []
    for i, (label, href) in enumerate(crumbs, 1):
        url = ORIGIN + "/" + (href if href else "")
        items.append({"@type": "ListItem", "position": i, "name": label, "item": url})
    return json.dumps({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items}, indent=2)


def stars():
    return '<span class="stars" aria-label="5 out of 5">' + (I("star") * 5) + '</span>'


def reviews_section(heading="What Coast locals say", count=3):
    cards = []
    for (name, role, initials, quote) in TESTIMONIALS[:count]:
        cards.append(
            '<figure class="card review-card" data-reveal>'
            + stars()
            + '<blockquote>%s</blockquote>' % quote
            + '<figcaption class="review-card__by"><span class="avatar">%s</span>'
              '<span><span class="review-card__name">%s</span><br>'
              '<span class="review-card__role">%s</span></span></figcaption></figure>'
              % (initials, name, role)
        )
    return """    <section class="section section--paper">
      <div class="container container--wide">
        <div class="section-head section-head--center"><h2>{h}</h2>
          <div class="rating-row" style="display:flex;align-items:center;justify-content:center;gap:.75rem;margin-top:1rem">
            {st}<strong style="color:var(--ink)">4.9 / 5</strong><span class="muted">from 127 local jobs</span>
          </div>
        </div>
        <div class="grid grid-3" data-reveal-group>
          {cards}
        </div>
      </div>
    </section>""".format(h=heading, st=stars(), cards="\n          ".join(cards))


def cta_navy(title, sub, prefix="", second_label="Ask a question", second_href="contact.html"):
    return """    <section class="section section--navy" data-fx="circuit" style="text-align:center">
      <div class="container container--narrow">
        <h2 data-reveal>{title}</h2>
        <p class="lead" data-reveal style="margin:1rem auto 0;max-width:48ch">{sub}</p>
        <div class="btn-row" data-reveal style="justify-content:center;margin-top:2rem">
          <a class="btn btn--primary btn--lg" href="{p}book.html">{cal} Book Online</a>
          <a class="btn btn--on-dark btn--lg" href="{p}{sh}">{sl}</a>
        </div>
        <p class="muted" data-reveal style="margin-top:1.4rem;color:var(--cloud-soft);font-size:.9rem">Mon–Fri 7am–5pm · Sat by appointment · Sun closed · No 24/7 callouts</p>
      </div>
    </section>""".format(title=title, sub=sub, p=prefix, cal=I("calendar"), sh=second_href, sl=second_label)


def emergency_notice():
    return ('<div class="notice-emergency"><span>' + I("warning") + '</span>'
            '<div><strong>We don\'t offer 24/7 emergency callouts.</strong> We book scheduled work and urgent priority '
            'appointments during business hours. If anyone is in danger or you can smell burning, call <strong>000</strong>. '
            'For loss of power or fallen lines, call Ausgrid on <strong>13 13 88</strong>.</div></div>')


SERVICE_BY_SLUG = {s["slug"]: s for s in SERVICES}
AREA_BY_SLUG = {a["slug"]: a for a in AREAS}


# ----------------------------------------------------------------- core pages
def build_about():
    main = """{hero}
    <section class="section section--paper">
      <div class="container container--wide">
        <div class="split">
          <div data-reveal="left">
            <span class="eyebrow">Our story</span>
            <h2>A local team that treats your home like ours</h2>
            <p class="lead" style="margin-top:1rem">Coastline Electrical Co. started with a simple idea: most people don't want the cheapest sparky, they want one who turns up, does the job properly, and tells them the price first.</p>
            <p style="margin-top:1rem">We're a small, licensed team based on the Central Coast. We've wired new homes, dragged tired 1970s switchboards into the present, fitted EV chargers, and kept rental portfolios safe and compliant for local agents. What hasn't changed is how we work: honest quotes, tidy jobs, and respect for the fact that we're guests in your home or business.</p>
            <p style="margin-top:1rem">We made a deliberate choice not to run a 24/7 emergency operation. That means we can give every booked job our full attention during business hours, instead of being half-asleep at a callout at 3am. For genuine emergencies there are the right numbers to call, and we'll always make room for urgent priority work when we can.</p>
          </div>
          <div data-reveal="right">
            <img class="media-plate media-plate--ratio-tall" src="assets/img/about-van.webp" alt="Coastline Electrical work van outside a modern Central Coast home at golden hour" loading="lazy" width="896" height="1200" />
          </div>
        </div>
      </div>
    </section>

    <section class="section section--navy" data-fx="circuit">
      <div class="container container--wide">
        <div class="grid grid-4" data-reveal-group style="text-align:center">
          <div data-reveal><div class="stat__num" data-count="12" data-suffix="+">12+</div><div class="stat__label">Years on the Coast</div></div>
          <div data-reveal><div class="stat__num" data-count="3500" data-suffix="+">3500+</div><div class="stat__label">Jobs completed</div></div>
          <div data-reveal><div class="stat__num" data-count="4.9" data-decimals="1">4.9</div><div class="stat__label">Average rating</div></div>
          <div data-reveal><div class="stat__num" data-count="100" data-suffix="%">100%</div><div class="stat__label">Licensed &amp; insured</div></div>
        </div>
      </div>
    </section>

    <section class="section section--white">
      <div class="container container--wide">
        <div class="section-head section-head--center"><h2>What we stand for</h2><p class="lead">Four things we won't cut corners on, no matter how small the job.</p></div>
        <div class="grid grid-4" data-reveal-group>
          <div class="card" data-reveal><span class="icon-badge">{tag}</span><h3 style="margin-top:1rem;font-size:1.15rem">Honest pricing</h3><p style="font-size:.95rem;margin-top:.5rem">Upfront, fixed quotes you approve before we start. The price we say is the price you pay.</p></div>
          <div class="card" data-reveal><span class="icon-badge">{clock}</span><h3 style="margin-top:1rem;font-size:1.15rem">Reliable timing</h3><p style="font-size:.95rem;margin-top:.5rem">Booked windows with an SMS heads-up. We turn up when we say we will.</p></div>
          <div class="card" data-reveal><span class="icon-badge">{shield}</span><h3 style="margin-top:1rem;font-size:1.15rem">Safe &amp; compliant</h3><p style="font-size:.95rem;margin-top:.5rem">Every job to AS/NZS 3000 wiring rules, with a compliance certificate supplied.</p></div>
          <div class="card" data-reveal><span class="icon-badge">{spark}</span><h3 style="margin-top:1rem;font-size:1.15rem">Tidy work</h3><p style="font-size:.95rem;margin-top:.5rem">Drop sheets down, mess cleaned up. We leave it how we'd want our own place left.</p></div>
        </div>
      </div>
    </section>

{reviews}

{cta}""".format(
        hero=page_hero([("Home", "index.html"), ("About", None)],
                       "We're your local Central Coast electricians",
                       "Licensed, local and genuinely reliable. Here's who you're dealing with when you book Coastline Electrical.", ""),
        bolt=I("bolt"), tag=I("tag"), clock=I("clock"), shield=I("shield"), spark=I("sparkle"),
        reviews=reviews_section(),
        cta=cta_navy("Ready to get your job booked in?",
                     "Pick a time that suits, or call and chat it through. Licensed, local and quoted upfront.", ""),
    )
    meta = {"title": "About Us | Central Coast Electrician | Coastline Electrical Co.",
            "desc": "Meet Coastline Electrical Co., a small, licensed team of local Central Coast electricians. Honest quotes, reliable timing, tidy work. No 24/7 callouts.",
            "canonical": ORIGIN + "/about.html", "page": "about",
            "jsonld": [breadcrumb_jsonld([("Home", "index.html"), ("About", "about.html")])]}
    write("about.html", render(meta, main, "about"))


PROJECTS = [
    ("switch", "Switchboard upgrade", "Terrigal", "Switchboard", "project-switchboard-terrigal.webp",
     "Ceramic fuses to a safe, modern board",
     "A 1980s Terrigal home was still running ceramic fuses with no safety switches and tripping under modern loads. We replaced the lot with a compliant board, added RCD protection across every circuit and fitted surge protection.",
     "Safer home, no more nuisance tripping, and room to add an EV charger later."),
    ("bulb", "LED lighting upgrade", "Erina", "Lighting", "project-lighting-erina.webp",
     "Whole-home LED downlight refresh",
     "A four-bedroom Erina home was full of hot, dim halogen downlights. We swapped them for dimmable LEDs throughout, added pendants over the island bench and sensor lighting to the entry.",
     "Brighter, cooler rooms and a noticeable drop in the lighting share of the power bill."),
    ("ev", "EV charger installation", "Gosford", "EV charging", "project-ev-gosford.webp",
     "7kW home charger, neatly done",
     "A Gosford household needed a home charger for their new EV. We assessed the switchboard, ran a dedicated circuit to the driveway and installed a 7kW charger with load management.",
     "Reliable overnight charging off a safe, dedicated circuit, with no nuisance trips."),
    ("key", "Rental safety inspection", "Woy Woy", "Rental", "project-rental-woywoy.webp",
     "Compliance check for a managing agent",
     "A Woy Woy rental needed smoke alarm and safety switch compliance before a new tenancy. We checked and updated alarms, confirmed RCD protection and issued the documentation same day.",
     "A compliant, safe property and an agent with the paperwork sorted on time."),
    ("hammer", "Renovation rewire", "Avoca", "Renovation", "project-renovation-avoca.webp",
     "Rewire and new board for a full reno",
     "An Avoca Beach renovation needed a staged rewire and a new switchboard. We worked to the builder's program, roughing in at frame stage and returning for fit-off, with extra points and data throughout.",
     "A future-proofed home with capacity to spare, delivered on the builder's timeline."),
]


def build_projects():
    cards = []
    for (icon, label, suburb, tag, image, title, desc, outcome) in PROJECTS:
        cards.append(
            '<article class="card project-card card-hover" data-reveal>'
            '<img class="media-plate" src="assets/img/%s" alt="%s in %s" loading="lazy" />'
            '<div class="project-card__body">'
            '<div class="project-card__meta"><span class="tag">%s</span>'
            '<span class="tag tag--mist">%s %s</span></div>'
            '<h3>%s</h3><p style="font-size:.95rem">%s</p>'
            '<p style="font-size:.92rem;color:var(--slate)"><strong>Outcome:</strong> %s</p>'
            '<a class="project-card__foot textlink" href="book.html">Book similar work %s</a>'
            '</div></article>'
            % (image, label, suburb, tag,
               I("pin"), suburb, title, desc, outcome, I("arrow-right"))
        )
    main = """{hero}
    <section class="section section--paper">
      <div class="container container--wide">
        <div class="grid grid-3" data-reveal-group>
          {cards}
        </div>
        <p class="muted" style="text-align:center;margin-top:2rem;max-width:60ch;margin-inline:auto">Project details are representative examples for this demo. Swap in your own photos and write-ups, the layout is ready for them.</p>
      </div>
    </section>
{reviews}
{cta}""".format(
        hero=page_hero([("Home", "index.html"), ("Projects", None)],
                       "Recent work around the Central Coast",
                       "A look at the kind of jobs we do every week, from Terrigal switchboards to Avoca rewires.", ""),
        cards="\n          ".join(cards),
        reviews=reviews_section("The people behind the projects"),
        cta=cta_navy("Want work like this at your place?",
                     "Tell us what you're planning and we'll get you a fixed, upfront quote.", ""),
    )
    meta = {"title": "Projects | Central Coast Electrician | Coastline Electrical Co.",
            "desc": "Recent electrical projects across the Central Coast: switchboard upgrades in Terrigal, LED lighting in Erina, EV chargers in Gosford, rental compliance in Woy Woy and a renovation rewire in Avoca.",
            "canonical": ORIGIN + "/projects.html", "page": "projects",
            "jsonld": [breadcrumb_jsonld([("Home", "index.html"), ("Projects", "projects.html")])]}
    write("projects.html", render(meta, main, "projects"))


def build_service_areas():
    cards = []
    for a in AREAS:
        cards.append(
            '<a class="card area-card card-hover" href="areas/%s.html" data-reveal>'
            '<span><span class="area-card__name">%s</span><br><span class="area-card__sub">Electrician · %s</span></span>%s</a>'
            % (a["slug"], a["name"], a["postcode"], I("arrow-right"))
        )
    faqs = [
        ("Do you cover my Central Coast suburb?", "We cover the Central Coast broadly, including all the suburbs listed above and the areas between them. If you're not sure, give us a call or book online and we'll confirm."),
        ("Is there a travel charge for outer suburbs?", "For most of the Central Coast there's no separate travel charge. For jobs well outside our usual area we'll let you know upfront before you book."),
        ("Can you do same-week work across these areas?", "Yes, we hold same-week appointments across our service area where availability allows, plus urgent priority slots during business hours."),
    ]
    main = """{hero}
    <section class="section section--paper">
      <div class="container container--wide">
        <div class="split">
          <div data-reveal="left">
            <h2>Licensed electricians across the Central Coast</h2>
            <p class="lead" style="margin-top:1rem">From the Peninsula to the lakes, we're a genuinely local team. Pick your suburb for local detail, or just book online and tell us where you are.</p>
            <p style="margin-top:1rem">Being local matters more than it sounds. We know the older fibro homes on the Woy Woy Peninsula, the salt-air corrosion that eats fittings in Terrigal and The Entrance, the newer estates around Tuggerah, and the renovation boom in Long Jetty and Umina. That means we turn up with the right gear and a fair idea of what we'll find.</p>
            {notice}
          </div>
          <div data-reveal="right">
            <div class="media-plate media-plate--ratio-square" role="img" aria-label="Map of the Central Coast service area">
              <svg class="contour" viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="#6aa6ff" stroke-width="1"><path d="M0 280 C 80 250 120 300 200 270 S 340 240 400 270"/><path d="M0 320 C 80 290 120 340 200 310 S 340 280 400 310"/><path d="M0 240 C 80 210 120 260 200 230 S 340 200 400 230"/></g></svg>
              <div class="media-plate__inner"><span class="media-plate__icon">{route}</span><span class="media-plate__label">Central Coast, NSW</span><span class="media-plate__tag">Map placeholder · embed Google Maps here</span></div>
            </div>
          </div>
        </div>

        <div class="section-head section-head--center" style="margin-top:3.5rem"><h2>Choose your suburb</h2></div>
        <div class="grid grid-3" data-reveal-group>
          {cards}
        </div>
      </div>
    </section>

    <section class="section section--white">
      <div class="container container--narrow">
        <div class="section-head section-head--center"><h2>Service area questions</h2></div>
        {faqs}
      </div>
    </section>
{cta}""".format(
        hero=page_hero([("Home", "index.html"), ("Service Areas", None)],
                       "Electrician service areas on the Central Coast",
                       "Gosford, Terrigal, Erina, Woy Woy, Umina, Tuggerah, Wyong, Long Jetty, The Entrance, Bateau Bay and everywhere between.", ""),
        notice=emergency_notice(), route=I("route"),
        cards="\n          ".join(cards), faqs=faq_accordion(faqs),
        cta=cta_navy("Book a local electrician today",
                     "Wherever you are on the Coast, you can book online in a couple of minutes.", ""),
    )
    meta = {"title": "Service Areas | Central Coast Electrician | Coastline Electrical Co.",
            "desc": "Coastline Electrical covers the Central Coast: Gosford, Terrigal, Erina, Woy Woy, Umina, Tuggerah, Wyong, Long Jetty, The Entrance and Bateau Bay. Local licensed electricians.",
            "canonical": ORIGIN + "/service-areas.html", "page": "areas",
            "jsonld": [breadcrumb_jsonld([("Home", "index.html"), ("Service Areas", "service-areas.html")]), faq_jsonld(faqs)]}
    write("service-areas.html", render(meta, main, "areas"))


def build_contact():
    main = """{hero}
    <section class="section section--paper">
      <div class="container container--wide">
        <div class="split" style="align-items:start">
          <div data-reveal="left">
            <h2>Send us a message</h2>
            <p style="margin-top:.6rem">Tell us a bit about the job and we'll get back to you during business hours. Prefer to talk? Call <a href="tel:{dial}" style="color:var(--blue-700);font-weight:600">{phone_disp}</a>.</p>
            <div id="contact-success" style="margin-top:1.4rem"></div>
            <form class="form-panel" style="margin-top:1.4rem" data-lead-form data-lead-type="Contact" data-endpoint="contact" data-success-target="#contact-success" novalidate>
              <div class="form-row">
                <div class="field"><label for="c-first">First name <span class="req">*</span></label><input class="input" id="c-first" name="firstName" data-required autocomplete="given-name" /></div>
                <div class="field"><label for="c-last">Last name <span class="req">*</span></label><input class="input" id="c-last" name="lastName" data-required autocomplete="family-name" /></div>
              </div>
              <div class="form-row">
                <div class="field"><label for="c-phone">Phone <span class="req">*</span></label><input class="input" id="c-phone" name="phone" type="tel" data-required autocomplete="tel" placeholder="0412 345 678" /></div>
                <div class="field"><label for="c-email">Email <span class="req">*</span></label><input class="input" id="c-email" name="email" type="email" data-required autocomplete="email" placeholder="you@email.com" /></div>
              </div>
              <div class="field"><label for="c-suburb">Suburb</label><input class="input" id="c-suburb" name="suburb" autocomplete="address-level2" placeholder="e.g. Terrigal" /></div>
              <div class="field"><label for="c-service">What do you need?</label>
                <select class="select" id="c-service" name="serviceNeeded"><option value="">Select a service…</option>{options}<option value="Something else">Something else</option></select>
              </div>
              <div class="field"><label for="c-msg">Message</label><textarea class="textarea" id="c-msg" name="message" placeholder="Tell us about the job…"></textarea></div>
              <div class="field hp-field" aria-hidden="true"><label>Leave this empty</label><input type="text" name="company_website" tabindex="-1" autocomplete="off" /></div>
              <label class="consent"><input type="checkbox" name="consent" data-required data-msg="Please agree so we can contact you." /> <span>I agree to Coastline Electrical contacting me about my enquiry, per the <a href="privacy.html">privacy policy</a>.</span></label>
              <button type="submit" class="btn btn--primary btn--lg btn--block" style="margin-top:1.2rem">{send} Send message</button>
              <p class="muted" style="font-size:.8rem;margin-top:.8rem;text-align:center">Protected against spam. We reply during business hours, Mon–Fri 7am–5pm.</p>
            </form>
          </div>
          <div data-reveal="right">
            <div class="card" style="padding:1.6rem">
              <h3 style="font-size:1.2rem">Contact details</h3>
              <ul class="footer-contact" style="margin-top:1rem">
                <li style="color:var(--slate)">{phone}<a href="tel:{dial}" style="color:var(--ink);font-weight:600">{phone_disp}</a></li>
                <li style="color:var(--slate)">{mail}<a href="mailto:{email}" style="color:var(--ink)">{email}</a></li>
                <li style="color:var(--slate)">{pin}<span>Servicing the Central Coast, NSW</span></li>
              </ul>
              <a class="btn btn--primary btn--block" href="tel:{dial}" style="margin-top:1rem" data-track="click-to-call">{phone} Click to call</a>
              <a class="btn btn--ghost btn--block" href="book.html" style="margin-top:.6rem">{cal} Book online instead</a>
            </div>
            <div class="card" style="padding:1.6rem;margin-top:1rem">
              <h3 style="font-size:1.2rem">Opening hours</h3>
              <table style="width:100%;margin-top:.8rem;border-collapse:collapse">
                <tr><td style="padding:.45rem 0;color:var(--slate)">Monday–Friday</td><td style="text-align:right;font-weight:600;color:var(--ink)">7:00am – 5:00pm</td></tr>
                <tr style="border-top:1px solid var(--line)"><td style="padding:.45rem 0;color:var(--slate)">Saturday</td><td style="text-align:right;font-weight:600;color:var(--ink)">By appointment</td></tr>
                <tr style="border-top:1px solid var(--line)"><td style="padding:.45rem 0;color:var(--slate)">Sunday</td><td style="text-align:right;font-weight:600;color:var(--ink)">Closed</td></tr>
              </table>
              <div style="margin-top:1rem">{notice}</div>
            </div>
            <div class="media-plate media-plate--ratio-wide" role="img" aria-label="Map of the Central Coast service area" style="margin-top:1rem">
              <div class="media-plate__inner"><span class="media-plate__icon">{pin}</span><span class="media-plate__label">Central Coast, NSW</span><span class="media-plate__tag">Map placeholder · embed Google Maps here</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
{cta}""".format(
        hero=page_hero([("Home", "index.html"), ("Contact", None)],
                       "Get in touch with Coastline Electrical",
                       "Book online, send a message, or pick up the phone. We reply during business hours.", ""),
        dial=BUSINESS["phone_dial"], phone_disp=BUSINESS["phone_display"], email=BUSINESS["email"],
        options="".join('<option value="%s">%s</option>' % (s["name"], s["name"]) for s in SERVICES),
        send=I("send"), phone=I("phone"), mail=I("mail"), pin=I("pin"), cal=I("calendar"),
        notice=emergency_notice(),
        cta=cta_navy("Rather just book it in?",
                     "Skip the back-and-forth and choose a time that suits you online.", "", "Call us", "contact.html"),
    )
    meta = {"title": "Contact | Central Coast Electrician | Coastline Electrical Co.",
            "desc": "Contact Coastline Electrical Co. on (02) 4321 1234 or hello@coastlineelectrical.com.au. Central Coast electricians, Mon-Fri 7am-5pm, Sat by appointment. No 24/7 callouts.",
            "canonical": ORIGIN + "/contact.html", "page": "contact",
            "jsonld": [breadcrumb_jsonld([("Home", "index.html"), ("Contact", "contact.html")])]}
    write("contact.html", render(meta, main, "contact"))


FAQ_GROUPS = [
    ("Bookings &amp; availability", [
        ("Do you do 24/7 emergency or after-hours callouts?", ["No, and we're upfront about it. Coastline doesn't run a 24/7 emergency service. We book scheduled work and urgent priority appointments during business hours (Mon–Fri 7am–5pm).", "If anyone is in danger or you can smell burning, call <strong>000</strong>. For loss of power or fallen lines, call your distributor <strong>Ausgrid on 13 13 88</strong>."]),
        ("How soon can you come out?", "We hold same-week appointments where availability allows, plus urgent priority slots during business hours. Book online and we'll confirm the soonest time that suits."),
        ("How does online booking work?", "Pick your service, choose a date and time window, and enter your details. We confirm by phone or email. It's a request, not a locked appointment, until we confirm."),
        ("Do you work Saturdays?", "Saturdays are by appointment for certain jobs. Choose a Saturday in the booking calendar and we'll confirm availability."),
    ]),
    ("Pricing &amp; quotes", [
        ("Do you give upfront quotes?", "Yes. Smaller jobs get a clear upfront price before we start. Bigger jobs like switchboards, EV chargers and renovations get a fixed written quote after a quick site inspection."),
        ("Do you charge a call-out fee?", "For fault finding we charge a set diagnostic call-out to find the cause, then quote the repair before proceeding. For standard jobs you get an upfront price with no separate call-out surprise."),
        ("How do I pay?", "We accept the usual electronic payment methods. Payment terms are confirmed with your quote. Ask us about options for larger jobs."),
    ]),
    ("Licensing &amp; safety", [
        ("Are you licensed and insured?", "Yes. We're fully licensed NSW electricians and carry public liability insurance. Notifiable work is issued with a Certificate of Compliance for Electrical Work (CCEW)."),
        ("Will I get a compliance certificate?", "Yes, for notifiable electrical work. Keep it for your records, your insurer and any future sale of the property."),
        ("My safety switch keeps tripping, what should I do?", "Reset it once. If it trips straight back, leave it off and book a diagnostic visit, that's the system telling you something's wrong. If there's smoke or burning, switch off at the main if safe and call 000."),
    ]),
    ("Areas &amp; services", [
        ("Which areas do you cover?", "The Central Coast, including Gosford, Terrigal, Erina, Woy Woy, Umina, Avoca, Tuggerah, Wyong, Long Jetty, The Entrance and Bateau Bay."),
        ("Do you do rental compliance for landlords?", "Yes. We handle smoke alarm and safety switch compliance and repairs for landlords and managing agents, with certificates supplied promptly."),
        ("Can you install gear I've bought myself?", "Yes, we're happy to install your own fittings, fans or chargers, and we'll flag anything that isn't compliant before fitting it."),
    ]),
]


def build_faq():
    groups_html = []
    all_faqs = []
    for (title, items) in FAQ_GROUPS:
        groups_html.append('<div class="section-head" style="margin-top:2.5rem;margin-bottom:1.2rem"><h2 style="font-size:1.5rem">%s</h2></div>%s' % (title, faq_accordion(items)))
        all_faqs.extend(items)
    main = """{hero}
    <section class="section section--paper">
      <div class="container container--narrow">
        {groups}
        <div style="margin-top:2.5rem">{notice}</div>
      </div>
    </section>
{cta}""".format(
        hero=page_hero([("Home", "index.html"), ("FAQ", None)],
                       "Frequently asked questions",
                       "Everything Coast locals ask us about bookings, pricing, licensing and safety. Still stuck? Just get in touch.", ""),
        groups="\n        ".join(groups_html), notice=emergency_notice(),
        cta=cta_navy("Didn't find your answer?",
                     "Send us a message or book a time and we'll talk it through.", ""),
    )
    meta = {"title": "FAQ | Central Coast Electrician | Coastline Electrical Co.",
            "desc": "Answers to common questions about booking a Central Coast electrician: availability, pricing, licensing, safety switches and service areas. No 24/7 callouts.",
            "canonical": ORIGIN + "/faq.html", "page": "faq",
            "jsonld": [breadcrumb_jsonld([("Home", "index.html"), ("FAQ", "faq.html")]), faq_jsonld(all_faqs)]}
    write("faq.html", render(meta, main, "faq"))


BLOG_IMAGES = {
    "signs-your-switchboard-needs-upgrading": "project-switchboard-terrigal.webp",
    "ev-charger-installation-cost": "project-ev-gosford.webp",
    "why-smoke-alarms-need-testing": "project-rental-woywoy.webp",
    "choosing-led-lighting-for-your-home": "project-lighting-erina.webp",
    "common-causes-of-power-trips": "project-renovation-avoca.webp",
}


def build_blog_index():
    cards = []
    for p in POSTS:
        img = BLOG_IMAGES.get(p["slug"], "project-switchboard-terrigal.webp")
        cards.append(
            '<article class="card project-card card-hover" data-reveal>'
            '<img class="media-plate media-plate--ratio-wide" src="assets/img/%s" alt="%s" loading="lazy" />'
            '<div class="project-card__body">'
            '<div class="project-card__meta"><span class="tag">%s</span><span class="tag tag--mist">%s</span></div>'
            '<h3 style="font-size:1.2rem">%s</h3><p style="font-size:.95rem">%s</p>'
            '<a class="project-card__foot textlink" href="blog/%s.html">Read article %s</a>'
            '</div></article>'
            % (img, p["title"], p["category"], p["read"],
               p["title"], p["excerpt"], p["slug"], I("arrow-right"))
        )
    main = """{hero}
    <section class="section section--paper">
      <div class="container container--wide">
        <div class="grid grid-3" data-reveal-group>
          {cards}
        </div>
      </div>
    </section>
{cta}""".format(
        hero=page_hero([("Home", "index.html"), ("Blog", None)],
                       "Electrical advice for Central Coast homes",
                       "Straight-talking guides on switchboards, EV chargers, lighting, safety and the faults we see most.", ""),
        cards="\n          ".join(cards),
        cta=cta_navy("Need a hand with any of this?",
                     "Book a licensed local electrician online, or call and ask.", ""),
    )
    meta = {"title": "Blog | Central Coast Electrician | Coastline Electrical Co.",
            "desc": "Practical electrical advice for Central Coast homes: switchboard upgrades, EV charger costs, smoke alarm testing, choosing LED lighting and common causes of power trips.",
            "canonical": ORIGIN + "/blog.html", "page": "blog",
            "jsonld": [breadcrumb_jsonld([("Home", "index.html"), ("Blog", "blog.html")])]}
    write("blog.html", render(meta, main, "blog"))


def build_privacy():
    main = """{hero}
    <section class="section section--paper">
      <div class="container container--narrow" style="font-size:1rem;line-height:1.7">
        <p class="muted">Last updated: June 2026. This is a demo privacy policy template, review and adapt it before going live.</p>
        <h2 style="font-size:1.4rem;margin-top:2rem">Who we are</h2>
        <p style="margin-top:.6rem">Coastline Electrical Co. ("we", "us") provides electrical services on the Central Coast, NSW. This policy explains how we handle personal information collected through this website.</p>
        <h2 style="font-size:1.4rem;margin-top:2rem">What we collect</h2>
        <p style="margin-top:.6rem">When you submit a contact form, booking or chatbot enquiry, we collect the details you provide, such as your name, phone, email, suburb, address, and information about the job. We don't collect payment details through this website.</p>
        <h2 style="font-size:1.4rem;margin-top:2rem">How we use it</h2>
        <p style="margin-top:.6rem">We use your information to respond to your enquiry, quote and schedule work, and keep records for compliance. With your consent, we may contact you about your enquiry by phone, email or SMS. We don't sell your information.</p>
        <h2 style="font-size:1.4rem;margin-top:2rem">Who we share it with</h2>
        <p style="margin-top:.6rem">Enquiries may be processed through our customer management system (for example, a CRM such as GoHighLevel) to manage bookings and follow-up. These providers process data on our behalf under their own terms.</p>
        <h2 style="font-size:1.4rem;margin-top:2rem">Your choices</h2>
        <p style="margin-top:.6rem">You can ask us to access, correct or delete your personal information, or opt out of further contact, at any time. Contact us at <a href="mailto:{email}" style="color:var(--blue-700)">{email}</a>.</p>
        <h2 style="font-size:1.4rem;margin-top:2rem">Contact</h2>
        <p style="margin-top:.6rem">Coastline Electrical Co. · {phone_disp} · {email} · Central Coast, NSW.</p>
      </div>
    </section>""".format(
        hero=page_hero([("Home", "index.html"), ("Privacy", None)],
                       "Privacy policy", "How we handle your information when you contact or book with us.", ""),
        email=BUSINESS["email"], phone_disp=BUSINESS["phone_display"],
    )
    meta = {"title": "Privacy Policy | Coastline Electrical Co.",
            "desc": "Privacy policy for Coastline Electrical Co. How we collect, use and protect personal information submitted through our website.",
            "canonical": ORIGIN + "/privacy.html", "page": "privacy",
            "jsonld": []}
    write("privacy.html", render(meta, main, ""))


# ----------------------------------------------------------------- book.html
def build_book():
    service_cards = []
    for s in SERVICES:
        service_cards.append(
            '<button type="button" class="svc-option" data-slug="%s" data-name="%s" data-booking="%s">'
            '<span class="svc-option__icon">%s</span>'
            '<span class="svc-option__name">%s</span>'
            '<span class="svc-option__type">%s</span></button>'
            % (s["slug"], s["name"], s["booking_type"], I(s["icon"]), s["name"], s["booking_type"])
        )
    # A general / "not sure" option so any job can start a booking
    service_cards.append(
        '<button type="button" class="svc-option svc-option--general" data-slug="general-enquiry" data-name="General electrical / not sure" data-booking="We\'ll advise">'
        '<span class="svc-option__icon">%s</span>'
        '<span class="svc-option__name">General electrical / not sure</span>'
        '<span class="svc-option__type">Tell us and we\'ll point you the right way</span></button>'
        % I("info")
    )
    main = """    <section class="page-hero" style="padding-bottom:clamp(2rem,4vw,3rem)">
      <svg class="page-hero__contour" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="#3d8bff" stroke-width="1.2" opacity="0.45"><path d="M-40 240 C 240 180 380 300 640 220 S 1100 130 1480 240"/><path d="M-40 300 C 240 240 380 360 640 280 S 1100 190 1480 300"/></g></svg>
      <div class="container container--wide">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">/</span><span>Book Online</span></nav>
        <h1>Book an electrician online</h1>
        <p>Choose a service, pick a time that suits, and tell us about the job. We'll confirm your appointment during business hours.</p>
      </div>
    </section>

    <section class="section section--paper">
      <div class="container container--wide">
        <div style="max-width:780px;margin:0 auto 1.6rem">{notice}</div>

        <!-- Primary: live GoHighLevel / LeadConnector booking calendar -->
        <div class="section-head section-head--center" style="max-width:660px;margin:0 auto 1.5rem">
          <span class="eyebrow">Book instantly</span>
          <h2>Pick a time on our live calendar</h2>
          <p class="lead">Choose a slot that suits and you'll get instant confirmation.</p>
        </div>
        <div class="ghl-embed" id="ghl-embed" style="max-width:940px;margin:0 auto" data-reveal>
          <iframe src="https://api.leadconnectorhq.com/widget/booking/nwKpZMQCkcdfGKapBrJe" title="Book an appointment with Coastline Electrical" style="width:100%;min-height:720px;border:none;overflow:hidden" scrolling="no" id="nwKpZMQCkcdfGKapBrJe_book"></iframe>
        </div>

        <!-- Secondary: native details flow (lead capture / callback request) -->
        <div class="section-head section-head--center" style="max-width:660px;margin:3.5rem auto 1.5rem">
          <h2>Prefer we call you back?</h2>
          <p class="lead">Tell us about the job and your preferred time, and we'll confirm with you during business hours.</p>
        </div>

        <div class="booking" id="booking" data-default-service="">
          <ol class="stepper" aria-label="Booking progress">
            <li class="step is-active" data-step="1"><span class="step__n">1</span><span class="step__label">Service</span></li>
            <li class="step" data-step="2"><span class="step__n">2</span><span class="step__label">Date</span></li>
            <li class="step" data-step="3"><span class="step__n">3</span><span class="step__label">Time</span></li>
            <li class="step" data-step="4"><span class="step__n">4</span><span class="step__label">Details</span></li>
            <li class="step" data-step="5"><span class="step__n">5</span><span class="step__label">Confirm</span></li>
          </ol>

          <div class="booking__panel">
            <!-- Step 1: Service -->
            <div class="booking-step is-active" data-step="1">
              <h2 class="booking-step__title">What do you need done?</h2>
              <p class="booking-step__sub">Pick the closest match. You can add detail in a moment.</p>
              <div class="svc-options">
                {svc_cards}
              </div>
            </div>

            <!-- Step 2: Date -->
            <div class="booking-step" data-step="2" hidden>
              <h2 class="booking-step__title">Choose a preferred date</h2>
              <p class="booking-step__sub">Greyed-out days are unavailable. Saturdays are by appointment. We'll confirm the final time with you.</p>
              <div class="calendar" id="calendar"></div>
              <p class="calendar__legend"><span class="dot dot--free"></span> Available <span class="dot dot--full"></span> Fully booked <span class="dot dot--sel"></span> Selected</p>
            </div>

            <!-- Step 3: Time -->
            <div class="booking-step" data-step="3" hidden>
              <h2 class="booking-step__title">Pick a time window</h2>
              <p class="booking-step__sub">These are preferred windows, our team confirms the exact arrival time.</p>
              <div class="slots" id="slots"></div>
            </div>

            <!-- Step 4: Details -->
            <div class="booking-step" data-step="4" hidden>
              <h2 class="booking-step__title">Your details</h2>
              <p class="booking-step__sub">So we can confirm your booking and send a reminder.</p>
              <form id="booking-form" novalidate>
                <div class="form-row">
                  <div class="field"><label for="b-first">First name <span class="req">*</span></label><input class="input" id="b-first" name="firstName" data-required autocomplete="given-name" /></div>
                  <div class="field"><label for="b-last">Last name <span class="req">*</span></label><input class="input" id="b-last" name="lastName" data-required autocomplete="family-name" /></div>
                </div>
                <div class="form-row">
                  <div class="field"><label for="b-phone">Phone <span class="req">*</span></label><input class="input" id="b-phone" name="phone" type="tel" data-required autocomplete="tel" placeholder="0412 345 678" /></div>
                  <div class="field"><label for="b-email">Email <span class="req">*</span></label><input class="input" id="b-email" name="email" type="email" data-required autocomplete="email" placeholder="you@email.com" /></div>
                </div>
                <div class="form-row">
                  <div class="field"><label for="b-address">Street address</label><input class="input" id="b-address" name="address" autocomplete="address-line1" placeholder="12 Example St" /></div>
                  <div class="field"><label for="b-suburb">Suburb <span class="req">*</span></label><input class="input" id="b-suburb" name="suburb" data-required autocomplete="address-level2" placeholder="e.g. Gosford" /></div>
                </div>
                <div class="form-row">
                  <div class="field"><label for="b-property">Property type</label>
                    <select class="select" id="b-property" name="propertyType"><option value="">Select…</option><option>Home</option><option>Unit</option><option>Rental</option><option>Business</option><option>Construction site</option></select>
                  </div>
                  <div class="field"><label for="b-urgency">Urgency</label>
                    <select class="select" id="b-urgency" name="urgency"><option value="Flexible">Flexible</option><option value="This week">This week</option><option value="As soon as available">As soon as available</option></select>
                  </div>
                </div>
                <div class="field"><label for="b-desc">Job description</label><textarea class="textarea" id="b-desc" name="message" placeholder="Tell us what's going on, what you'd like done, and anything we should know."></textarea></div>
                <div class="field"><span class="field-label">Photos (optional)</span>
                  <label class="upload" for="b-photo">{camera}<span><strong>Add a photo</strong> of your switchboard or the problem</span><input type="file" id="b-photo" name="photo" accept="image/*" multiple hidden /></label>
                  <span class="hint" id="b-photo-name">Photos help us quote accurately. Placeholder only in this demo, no file is uploaded.</span>
                </div>
                <div class="field hp-field" aria-hidden="true"><label>Leave empty</label><input type="text" name="company_website" tabindex="-1" autocomplete="off" /></div>
                <label class="consent"><input type="checkbox" name="consent" data-required data-msg="Please agree so we can confirm your booking." /> <span>I agree to Coastline Electrical contacting me about this booking, per the <a href="privacy.html">privacy policy</a>.</span></label>
              </form>
            </div>

            <!-- Step 5: Confirm -->
            <div class="booking-step" data-step="5" hidden>
              <div id="booking-review"></div>
            </div>
          </div>

          <div class="booking__nav">
            <button type="button" class="btn btn--ghost" id="booking-back" hidden>Back</button>
            <button type="button" class="btn btn--primary" id="booking-next" disabled>Continue {arrow}</button>
          </div>
        </div>
      </div>
    </section>""".format(
        notice=emergency_notice(), svc_cards="\n                ".join(service_cards),
        camera=I("camera"), arrow=I("arrow-right"), cal=I("calendar"),
    )
    meta = {"title": "Book an Electrician Online | Central Coast | Coastline Electrical Co.",
            "desc": "Book a licensed Central Coast electrician online. Choose your service, date and time, and we'll confirm during business hours. Switchboards, EV chargers, lighting and more. No 24/7 callouts.",
            "canonical": ORIGIN + "/book.html", "page": "book",
            "jsonld": [breadcrumb_jsonld([("Home", "index.html"), ("Book Online", "book.html")])]}
    extra = ('\n  <script defer src="assets/js/booking.js"></script>'
             '\n  <script src="https://link.msgsndr.com/js/form_embed.js"></script>')
    write("book.html", render(meta, main, "book", extra_scripts=extra))


# ----------------------------------------------------------------- detail: services
def build_service_pages():
    SERVICE_IMAGES = {
        "switchboard-upgrades": "project-switchboard-terrigal.webp",
        "lighting-installation": "project-lighting-erina.webp",
        "ev-charger-installation": "project-ev-gosford.webp",
        "smoke-alarm-installation": "project-rental-woywoy.webp",
        "rental-property-electrical": "project-rental-woywoy.webp",
        "electrical-renovations": "project-renovation-avoca.webp",
    }
    for s in SERVICES:
        img_band = ""
        if s["slug"] in SERVICE_IMAGES:
            img_band = ('    <section class="section section--paper" style="padding-block:clamp(2rem,4vw,3rem) 0">'
                        '<div class="container container--wide"><div class="media-frame" data-reveal style="aspect-ratio:21/9">'
                        '<img src="../assets/img/%s" alt="%s on the Central Coast" loading="lazy" /></div></div></section>\n'
                        % (SERVICE_IMAGES[s["slug"]], s["name"]))
        benefits = "".join(
            '<div class="card" data-reveal><h3 style="font-size:1.12rem">%s</h3><p style="font-size:.95rem;margin-top:.5rem">%s</p></div>' % (t, x)
            for (t, x) in s["benefits"]
        )
        includes = "".join('<li><span>%s</span></li>' % x for x in s["includes"])
        includes = includes.replace("<li>", '<li>' + I("check"))
        steps = "".join(
            '<div class="step-card" data-reveal><span class="step-card__n">%d</span><h3>%s</h3><p style="font-size:.95rem">%s</p></div>' % (i + 1, t, x)
            for i, (t, x) in enumerate(s["process"])
        )
        related = [r for r in SERVICES if r["slug"] != s["slug"]][:3]
        rel_cards = "".join(
            '<a class="card service-card card-hover" href="%s.html" data-reveal><span class="icon-badge">%s</span><h3 style="font-size:1.1rem">%s</h3><span class="card-foot"><span class="booking-tag">%s %s</span><span class="textlink">%s</span></span></a>'
            % (r["slug"], I(r["icon"]), r["name"], I(r["booking_icon"]), r["booking_type"], I("arrow-right"))
            for r in related
        )
        intro_html = "".join('<p style="margin-top:1rem">%s</p>' % p for p in s["intro"])
        main = """    <section class="page-hero">
      <svg class="page-hero__contour" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="#3d8bff" stroke-width="1.2" opacity="0.45"><path d="M-40 240 C 240 180 380 300 640 220 S 1100 130 1480 240"/><path d="M-40 300 C 240 240 380 360 640 280 S 1100 190 1480 300"/></g></svg>
      <div class="container container--wide">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Home</a><span class="sep">/</span><a href="../services.html">Services</a><span class="sep">/</span><span>{name}</span></nav>
        <span class="pill pill--ghost-dark" style="margin-bottom:1rem">{bicon} {btype}</span>
        <h1>{name}</h1>
        <p>{lead}</p>
        <div class="btn-row" style="margin-top:2rem">
          <a class="btn btn--primary btn--lg" href="../book.html?service={slug}">{cal} Book this service</a>
          <a class="btn btn--ghost-dark btn--lg" href="tel:{dial}">{phone} {phone_disp}</a>
        </div>
      </div>
    </section>

{img_band}
    <section class="section section--paper">
      <div class="container container--wide">
        <div class="split" style="align-items:start">
          <div data-reveal="left">
            <h2>About this service</h2>
            {intro}
          </div>
          <div data-reveal="right">
            <div class="card" style="padding:1.6rem">
              <h3 style="font-size:1.15rem">What's included</h3>
              <ul class="tick-list" style="margin-top:1rem">{includes}</ul>
              <a class="btn btn--primary btn--block" href="../book.html?service={slug}" style="margin-top:1.4rem">Book this service</a>
              <p class="muted" style="font-size:.85rem;margin-top:.8rem;text-align:center">{price_note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--white">
      <div class="container container--wide">
        <div class="section-head section-head--center"><h2>Why book it with us</h2></div>
        <div class="grid grid-2" data-reveal-group>{benefits}</div>
      </div>
    </section>

    <section class="section section--navy" data-fx="circuit">
      <div class="container container--wide">
        <div class="section-head"><h2>How it works</h2><p class="lead">From first contact to a job that's done and certified.</p></div>
        <div class="grid grid-4" data-reveal-group>{steps}</div>
        <div class="btn-row" style="margin-top:2.4rem"><a class="btn btn--primary btn--lg" href="../book.html?service={slug}">{cal} Book this service</a></div>
      </div>
    </section>

    <section class="section section--paper">
      <div class="container container--narrow">
        <div class="section-head section-head--center"><h2>{name} FAQs</h2></div>
        {faqs}
      </div>
    </section>

    <section class="section section--white">
      <div class="container container--wide">
        <div class="section-head section-head--center"><h2>Related services</h2></div>
        <div class="grid grid-3" data-reveal-group>{rel}</div>
      </div>
    </section>

{cta}""".format(
            name=s["name"], lead=s["lead"], slug=s["slug"], btype=s["booking_type"],
            bicon=I(s["booking_icon"]), cal=I("calendar"), phone=I("phone"),
            dial=BUSINESS["phone_dial"], phone_disp=BUSINESS["phone_display"],
            intro=intro_html, includes=includes, benefits=benefits, steps=steps, img_band=img_band,
            price_note=s["price_note"], faqs=faq_accordion(s["faqs"]), rel=rel_cards,
            cta=cta_navy("Ready to book your " + s["name"].lower() + "?",
                         "Pick a time that suits, or call and chat it through first.", "../"),
        )
        svc_jsonld = json.dumps({
            "@context": "https://schema.org", "@type": "Service", "name": s["name"],
            "serviceType": s["name"], "provider": {"@type": "Electrician", "name": BUSINESS["name"], "telephone": BUSINESS["phone_dial"]},
            "areaServed": {"@type": "Place", "name": "Central Coast, NSW"},
            "url": ORIGIN + "/services/" + s["slug"] + ".html"
        }, indent=2)
        meta = {"title": s["name"] + " Central Coast | Coastline Electrical Co.",
                "desc": s["meta"], "canonical": ORIGIN + "/services/" + s["slug"] + ".html",
                "page": "services",
                "jsonld": [svc_jsonld, faq_jsonld(s["faqs"]),
                           breadcrumb_jsonld([("Home", "index.html"), ("Services", "services.html"), (s["name"], "services/" + s["slug"] + ".html")])]}
        write("services/" + s["slug"] + ".html", render(meta, main, "services", prefix="../"))


# ----------------------------------------------------------------- detail: areas
def build_area_pages():
    # a small set of services to surface on each area page
    feat = ["switchboard-upgrades", "ev-charger-installation", "lighting-installation",
            "safety-switch-installation", "fault-finding", "rental-property-electrical"]
    for a in AREAS:
        body = ""
        for (heading, text) in a["paras"]:
            if heading:
                body += '<h2 style="margin-top:2rem">%s</h2>' % heading
            body += '<p style="margin-top:1rem">%s</p>' % text
        svc_cards = "".join(
            '<a class="card service-card card-hover" href="../services/%s.html" data-reveal><span class="icon-badge">%s</span><h3 style="font-size:1.05rem">%s</h3><span class="card-foot"><span class="booking-tag">%s %s</span><span class="textlink">%s</span></span></a>'
            % (SERVICE_BY_SLUG[sl]["slug"], I(SERVICE_BY_SLUG[sl]["icon"]), SERVICE_BY_SLUG[sl]["name"],
               I(SERVICE_BY_SLUG[sl]["booking_icon"]), SERVICE_BY_SLUG[sl]["booking_type"], I("arrow-right"))
            for sl in feat
        )
        nearby = "".join(
            '<a class="card area-card card-hover" href="%s.html" data-reveal><span><span class="area-card__name">%s</span><br><span class="area-card__sub">Electrician · %s</span></span>%s</a>'
            % (AREA_BY_SLUG[n]["slug"], AREA_BY_SLUG[n]["name"], AREA_BY_SLUG[n]["postcode"], I("arrow-right"))
            for n in a["nearby"] if n in AREA_BY_SLUG
        )
        main = """    <section class="page-hero">
      <svg class="page-hero__contour" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="#3d8bff" stroke-width="1.2" opacity="0.45"><path d="M-40 240 C 240 180 380 300 640 220 S 1100 130 1480 240"/><path d="M-40 300 C 240 240 380 360 640 280 S 1100 190 1480 300"/></g></svg>
      <div class="container container--wide">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Home</a><span class="sep">/</span><a href="../service-areas.html">Service Areas</a><span class="sep">/</span><span>{name}</span></nav>
        <h1>Electrician in {name}</h1>
        <p>{lead}</p>
        <div class="btn-row" style="margin-top:2rem">
          <a class="btn btn--primary btn--lg" href="../book.html">{cal} Book Online</a>
          <a class="btn btn--ghost-dark btn--lg" href="tel:{dial}">{phone} {phone_disp}</a>
        </div>
      </div>
    </section>

    <section class="section section--paper">
      <div class="container container--narrow" style="font-size:1.03rem;line-height:1.75">
        {body}
      </div>
    </section>

    <section class="section section--white">
      <div class="container container--wide">
        <div class="section-head section-head--center"><h2>Popular {name} electrical services</h2></div>
        <div class="grid grid-3" data-reveal-group>{svc_cards}</div>
        <div class="btn-row" style="margin-top:2rem;justify-content:center"><a class="btn btn--ghost btn--lg" href="../services.html">All services {arrow}</a></div>
      </div>
    </section>

    <section class="section section--mist">
      <div class="container container--narrow">
        <div class="section-head section-head--center"><h2>{name} electrician FAQs</h2></div>
        {faqs}
      </div>
    </section>

    <section class="section section--white">
      <div class="container container--wide">
        <div class="section-head section-head--center"><h2>Nearby areas we cover</h2></div>
        <div class="grid grid-3" data-reveal-group>{nearby}</div>
      </div>
    </section>

{cta}""".format(
            name=a["name"], lead=a["lead"], body=body, svc_cards=svc_cards,
            faqs=faq_accordion(a["faqs"]), nearby=nearby, arrow=I("arrow-right"),
            cal=I("calendar"), phone=I("phone"), dial=BUSINESS["phone_dial"], phone_disp=BUSINESS["phone_display"],
            cta=cta_navy("Need an electrician in " + a["name"] + "?",
                         "Book online in a couple of minutes, or call and chat it through.", "../"),
        )
        meta = {"title": "Electrician " + a["name"] + " | Coastline Electrical Co.",
                "desc": a["blurb"], "canonical": ORIGIN + "/areas/" + a["slug"] + ".html",
                "page": "areas",
                "jsonld": [faq_jsonld(a["faqs"]),
                           breadcrumb_jsonld([("Home", "index.html"), ("Service Areas", "service-areas.html"), (a["name"], "areas/" + a["slug"] + ".html")])]}
        write("areas/" + a["slug"] + ".html", render(meta, main, "areas", prefix="../"))


# ----------------------------------------------------------------- detail: blog
def build_blog_posts():
    for p in POSTS:
        body = ""
        for (heading, paras) in p["body"]:
            if heading:
                body += '<h2 style="margin-top:2rem">%s</h2>' % heading
            for para in paras:
                body += '<p style="margin-top:1rem">%s</p>' % para
        related = [r for r in POSTS if r["slug"] in p.get("related", [])][:2]
        rel_cards = "".join(
            '<a class="card project-card card-hover" href="%s.html" data-reveal>'
            '<img class="media-plate media-plate--ratio-wide" src="../assets/img/%s" alt="%s" loading="lazy" />'
            '<div class="project-card__body"><div class="project-card__meta"><span class="tag">%s</span></div><h3 style="font-size:1.1rem">%s</h3><span class="project-card__foot textlink">Read article %s</span></div></a>'
            % (r["slug"], BLOG_IMAGES.get(r["slug"], "project-switchboard-terrigal.webp"), r["title"], r["category"], r["title"], I("arrow-right"))
            for r in related
        )
        img_band = ('    <section class="section section--paper" style="padding-block:clamp(2rem,4vw,3rem) 0">'
                    '<div class="container container--narrow"><div class="media-frame" data-reveal style="aspect-ratio:16/9">'
                    '<img src="../assets/img/%s" alt="%s" loading="lazy" /></div></div></section>\n'
                    % (BLOG_IMAGES.get(p["slug"], "project-switchboard-terrigal.webp"), p["title"]))
        main = """    <section class="page-hero">
      <svg class="page-hero__contour" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="#3d8bff" stroke-width="1.2" opacity="0.45"><path d="M-40 240 C 240 180 380 300 640 220 S 1100 130 1480 240"/><path d="M-40 300 C 240 240 380 360 640 280 S 1100 190 1480 300"/></g></svg>
      <div class="container container--narrow">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Home</a><span class="sep">/</span><a href="../blog.html">Blog</a><span class="sep">/</span><span>{cat}</span></nav>
        <span class="pill pill--ghost-dark" style="margin-bottom:1rem">{cat}</span>
        <h1>{title}</h1>
        <p style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;color:var(--cloud-soft);font-size:.92rem;margin-top:1rem">
          <span>{author}</span><span>·</span><span>{date}</span><span>·</span><span>{read}</span>
        </p>
      </div>
    </section>

{img_band}
    <section class="section section--paper">
      <article class="container container--narrow" style="font-size:1.05rem;line-height:1.78">
        {body}
        <div class="notice-emergency" style="margin-top:2.5rem">{warning}<div>Reminder: we don't offer 24/7 emergency callouts. If something is dangerous, call <strong>000</strong>, and for loss of power call <strong>Ausgrid on 13 13 88</strong>. For scheduled work, <a href="../book.html" style="color:#5e3f00;text-decoration:underline;font-weight:600">book online</a>.</div></div>
        <div style="margin-top:2rem;padding:1.4rem;border:1px solid var(--line);border-radius:var(--r-lg);display:flex;gap:1rem;align-items:center;background:var(--surface)">
          <span class="avatar" style="width:52px;height:52px">{bolt}</span>
          <div><strong style="color:var(--ink);font-family:var(--font-display)">Coastline Electrical Co.</strong><br><span class="muted" style="font-size:.92rem">Licensed Central Coast electricians. Honest quotes, reliable timing, tidy work.</span></div>
        </div>
      </article>
    </section>

    <section class="section section--white">
      <div class="container container--wide">
        <div class="section-head section-head--center"><h2>Related reading</h2></div>
        <div class="grid grid-2" data-reveal-group>{rel}</div>
      </div>
    </section>

{cta}""".format(
            cat=p["category"], title=p["title"], author=p["author"], date=p["date_display"],
            read=p["read"], body=body, warning=I("warning"), bolt=I("bolt"), rel=rel_cards, img_band=img_band,
            cta=cta_navy("Need a licensed electrician?",
                         "Book online in a couple of minutes, or call and ask us anything.", "../"),
        )
        art_jsonld = json.dumps({
            "@context": "https://schema.org", "@type": "BlogPosting", "headline": p["title"],
            "datePublished": p["date"], "author": {"@type": "Organization", "name": BUSINESS["name"]},
            "publisher": {"@type": "Organization", "name": BUSINESS["name"]},
            "description": p["excerpt"], "url": ORIGIN + "/blog/" + p["slug"] + ".html",
            "image": ORIGIN + "/assets/img/og-cover.jpg"
        }, indent=2)
        meta = {"title": p["title"] + " | Coastline Electrical Co.",
                "desc": p["meta"], "canonical": ORIGIN + "/blog/" + p["slug"] + ".html",
                "page": "blog", "ogtype": "article",
                "jsonld": [art_jsonld,
                           breadcrumb_jsonld([("Home", "index.html"), ("Blog", "blog.html"), (p["title"], "blog/" + p["slug"] + ".html")])]}
        write("blog/" + p["slug"] + ".html", render(meta, main, "blog", prefix="../"))


def build_sitemap_and_robots():
    import datetime
    lastmod = datetime.date.today().isoformat()
    urls = ["", "services.html", "service-areas.html", "projects.html", "about.html",
            "blog.html", "contact.html", "faq.html", "book.html", "privacy.html"]
    urls += ["services/%s.html" % s["slug"] for s in SERVICES]
    urls += ["areas/%s.html" % a["slug"] for a in AREAS]
    urls += ["blog/%s.html" % p["slug"] for p in POSTS]
    body = []
    for u in urls:
        loc = ORIGIN + "/" + u
        prio = "1.0" if u == "" else ("0.9" if u in ("services.html", "book.html", "service-areas.html") else "0.7")
        body.append("  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>%s</priority>\n  </url>"
                     % (loc, lastmod, prio))
    sitemap = ('<?xml version="1.0" encoding="UTF-8"?>\n'
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
               + "\n".join(body) + "\n</urlset>\n")
    write("sitemap.xml", sitemap)
    robots = ("User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n" % ORIGIN)
    write("robots.txt", robots)


def main():
    build_about()
    build_projects()
    build_service_areas()
    build_contact()
    build_faq()
    build_blog_index()
    build_privacy()
    build_book()
    build_service_pages()
    build_area_pages()
    build_blog_posts()
    build_sitemap_and_robots()
    print("\nDone. Generated all interior + detail pages, sitemap.xml and robots.txt.")


if __name__ == "__main__":
    main()
