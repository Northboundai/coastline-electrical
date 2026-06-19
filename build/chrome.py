# -*- coding: utf-8 -*-
"""
Coastline Electrical — shared page chrome for the static-site generator.

This module renders the parts every page shares (head, header, mobile nav,
footer, floating actions, scripts) so all pages stay perfectly consistent.
The OUTPUT is plain static HTML you can edit by hand; this generator is just a
convenience for producing many consistent pages. Re-run with:  python3 build/build.py

`prefix` is the relative path back to the site root: "" for root-level pages,
"../" for pages inside /services, /areas, /blog.
"""

BUSINESS = {
    "name": "Coastline Electrical Co.",
    "short": "Coastline Electrical",
    "phone_display": "(02) 4321 1234",
    "phone_dial": "+61243211234",
    "email": "hello@coastlineelectrical.com.au",
    "origin": "https://www.coastlineelectrical.com.au",
    "licence": "NSW Lic. 000000C",
    "abn": "00 000 000 000",
}

# Primary nav: (label, file, nav-key)
NAV = [
    ("Services", "services.html", "services"),
    ("Service Areas", "service-areas.html", "areas"),
    ("Projects", "projects.html", "projects"),
    ("About", "about.html", "about"),
    ("Blog", "blog.html", "blog"),
    ("Contact", "contact.html", "contact"),
]

MOBILE_NAV = NAV[:5] + [("FAQ", "faq.html", "faq")] + NAV[5:]

DOCTYPE = "<!DOCTYPE html>\n<html lang=\"en-AU\">\n"


def icon(name):
    return '<svg class="ic" aria-hidden="true"><use href="#i-%s"></use></svg>' % name


def head(meta, prefix=""):
    jsonld = "".join(
        '\n  <script type="application/ld+json">\n%s\n  </script>' % block.strip()
        for block in meta.get("jsonld", [])
    )
    og_img = BUSINESS["origin"] + "/assets/img/og-cover.jpg"
    return """<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content="{desc}" />
  <link rel="canonical" href="{canonical}" />
  <meta name="theme-color" content="#0e1b3d" />
  <meta name="robots" content="index, follow" />
  <meta property="og:type" content="{ogtype}" />
  <meta property="og:site_name" content="Coastline Electrical Co." />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{desc}" />
  <meta property="og:url" content="{canonical}" />
  <meta property="og:image" content="{ogimg}" />
  <meta property="og:locale" content="en_AU" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{desc}" />
  <meta name="twitter:image" content="{ogimg}" />
  <link rel="icon" href="{p}assets/img/favicon.svg" type="image/svg+xml" />
  <link rel="manifest" href="{p}manifest.json" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="{p}assets/css/styles.css" />{jsonld}
</head>
""".format(
        title=meta["title"], desc=meta["desc"], canonical=meta["canonical"],
        ogtype=meta.get("ogtype", "website"), ogimg=og_img, p=prefix, jsonld=jsonld,
    )


def header(active="", prefix=""):
    links = "".join(
        '\n          <a class="nav__link" data-nav="%s" href="%s%s">%s</a>' % (key, prefix, f, label)
        for (label, f, key) in NAV
    )
    return """  <header class="site-header">
    <div class="container container--wide">
      <nav class="nav" aria-label="Primary">
        <a class="brand" href="{p}index.html" aria-label="Coastline Electrical Co. — home">
          <span class="brand__mark">{bolt}</span>
          <span><span class="brand__name">Coastline Electrical</span><span class="brand__tag">Central Coast NSW</span></span>
        </a>
        <div class="nav__links">{links}
        </div>
        <div class="nav__actions">
          <a class="nav__phone" href="tel:{dial}">{phone}(02) 4321 1234</a>
          <a class="btn btn--primary btn--sm" data-nav="book" href="{p}book.html">Book Online</a>
        </div>
        <button class="menu-toggle" aria-label="Open menu" aria-controls="mobile-nav" aria-expanded="false">{menu}</button>
      </nav>
    </div>
  </header>
""".format(p=prefix, links=links, dial=BUSINESS["phone_dial"],
           bolt=icon("bolt"), phone=icon("phone"), menu=icon("menu"))


def mobile_nav(prefix=""):
    links = "".join(
        '\n      <a href="%s%s">%s %s</a>' % (prefix, f, label, icon("arrow-right"))
        for (label, f, key) in MOBILE_NAV
    )
    return """  <div class="mobile-nav" id="mobile-nav" aria-hidden="true">
    <div class="mobile-nav__top">
      <a class="brand" href="{p}index.html" aria-label="Coastline Electrical Co. — home"><span class="brand__mark">{bolt}</span><span><span class="brand__name" style="color:#fff">Coastline Electrical</span><span class="brand__tag">Central Coast NSW</span></span></a>
      <button class="mobile-nav__close" aria-label="Close menu">{close}</button>
    </div>
    <nav class="mobile-nav__links" aria-label="Mobile">{links}
    </nav>
    <div class="mobile-nav__cta">
      <a class="btn btn--primary btn--block btn--lg" href="{p}book.html">Book Online</a>
      <a class="mobile-nav__call" href="tel:{dial}">{phone} Call (02) 4321 1234</a>
    </div>
  </div>
""".format(p=prefix, links=links, dial=BUSINESS["phone_dial"],
           bolt=icon("bolt"), close=icon("close"), phone=icon("phone"))


def footer(prefix=""):
    return """  <footer class="site-footer">
    <div class="container container--wide">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="{p}index.html" aria-label="Coastline Electrical Co. — home"><span class="brand__mark">{bolt}</span><span><span class="brand__name">Coastline Electrical</span><span class="brand__tag">Central Coast NSW</span></span></a>
          <p>Licensed local electricians for Central Coast homes, rentals, renovations and small businesses. Scheduled work, quoted upfront, done properly.</p>
          <div class="btn-row" style="margin-top:1.2rem;gap:.5rem"><a class="footer-licence" href="#">{shield} NSW Lic. 000000C</a></div>
          <div style="display:flex;gap:.6rem;margin-top:1.2rem">
            <a href="#" aria-label="Facebook" style="width:40px;height:40px;border-radius:10px;display:grid;place-items:center;background:rgba(255,255,255,.06);color:var(--cloud)">{fb}</a>
            <a href="#" aria-label="Instagram" style="width:40px;height:40px;border-radius:10px;display:grid;place-items:center;background:rgba(255,255,255,.06);color:var(--cloud)">{ig}</a>
          </div>
        </div>
        <div class="footer-col"><h4>Services</h4><ul>
          <li><a href="{p}services/switchboard-upgrades.html">Switchboard upgrades</a></li>
          <li><a href="{p}services/ev-charger-installation.html">EV charger installation</a></li>
          <li><a href="{p}services/lighting-installation.html">Lighting installation</a></li>
          <li><a href="{p}services/safety-switch-installation.html">Safety switches</a></li>
          <li><a href="{p}services/fault-finding.html">Fault finding</a></li>
          <li><a href="{p}services.html">All services</a></li>
        </ul></div>
        <div class="footer-col"><h4>Company</h4><ul>
          <li><a href="{p}about.html">About us</a></li>
          <li><a href="{p}projects.html">Projects</a></li>
          <li><a href="{p}service-areas.html">Service areas</a></li>
          <li><a href="{p}blog.html">Blog</a></li>
          <li><a href="{p}faq.html">FAQ</a></li>
          <li><a href="{p}contact.html">Contact</a></li>
        </ul></div>
        <div class="footer-col footer-contact"><h4>Get in touch</h4><ul>
          <li>{phone}<a href="tel:{dial}">(02) 4321 1234</a></li>
          <li>{mail}<a href="mailto:{email}">{email}</a></li>
          <li>{pin}<span>Servicing the Central Coast, NSW</span></li>
          <li>{clock}<span>Mon–Fri 7am–5pm<br>Sat by appointment · Sun closed</span></li>
        </ul><p class="muted" style="font-size:.82rem;color:var(--cloud-soft);margin-top:.4rem">No 24/7 emergency callouts. In an emergency call 000, or Ausgrid 13 13 88.</p></div>
      </div>
      <div class="footer-bottom">
        <span>© <span data-year>2026</span> Coastline Electrical Co. · ABN 00 000 000 000 · Demo template by Northbound AI.</span>
        <span style="display:flex;gap:1.2rem"><a href="{p}privacy.html">Privacy</a><a href="{p}book.html">Book Online</a></span>
      </div>
    </div>
  </footer>
""".format(p=prefix, dial=BUSINESS["phone_dial"], email=BUSINESS["email"],
           bolt=icon("bolt"), shield=icon("shield"), fb=icon("facebook"), ig=icon("instagram"),
           phone=icon("phone"), mail=icon("mail"), pin=icon("pin"), clock=icon("clock"))


def floating(prefix=""):
    return """  <div class="floating-actions">
    <a class="btn btn--call" href="tel:{dial}">{phone} Call</a>
    <a class="btn btn--primary" href="{p}book.html">{cal} Book Online</a>
  </div>
""".format(p=prefix, dial=BUSINESS["phone_dial"], phone=icon("phone"), cal=icon("calendar"))


def scripts(prefix="", extra=""):
    return """  <script defer src="{p}lib/integrations.js"></script>
  <script defer src="{p}assets/js/main.js"></script>{extra}
""".format(p=prefix, extra=extra)


def render(meta, main, active="", prefix="", body_attrs="", extra_scripts=""):
    body = '<body data-page="%s"%s>\n' % (meta.get("page", ""), (" " + body_attrs) if body_attrs else "")
    return (
        DOCTYPE
        + head(meta, prefix)
        + body
        + header(active, prefix)
        + mobile_nav(prefix)
        + "\n  <main>\n" + main + "\n  </main>\n\n"
        + footer(prefix)
        + floating(prefix)
        + "\n" + scripts(prefix, extra_scripts)
        + "</body>\n</html>\n"
    )
