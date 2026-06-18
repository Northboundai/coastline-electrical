/* =====================================================================
   Coastline Electrical Co. — main.js
   Shared site runtime (loaded on every page, classic script, no build):
     · SVG icon sprite injection
     · Sticky header + active nav + mobile menu
     · Scroll-reveal (IntersectionObserver) + animated counters
     · Lead core: validation, localStorage demo capture, fail-safe webhook
     · Reusable lead-form handler (contact / quote forms)
     · Floating AI chatbot widget (scripted demo, ready for an AI backend)
     · Leads debug panel (Alt+L or ?debug)
   ===================================================================== */
(function () {
  "use strict";
  var CFG = window.COASTLINE_CONFIG || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ============================ Icon sprite ============================ */
  // Consistent 24x24, stroke 1.75, currentColor. Injected once at body top.
  var SPRITE = [
    '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">',
    sym("bolt", '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" stroke="none"/>'),
    sym("phone", '<path d="M6.5 3.5h3l1.5 4-2 1.2a12 12 0 0 0 5.3 5.3l1.2-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z"/>'),
    sym("calendar", '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>'),
    sym("clock", '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    sym("check", '<path d="M5 12.5 10 17.5 19.5 7"/>'),
    sym("shield", '<path d="M12 3 5 6v5c0 4.5 3 8 7 9.5 4-1.5 7-5 7-9.5V6l-7-3z"/><path d="M9 12l2.2 2.2L15.5 9.8"/>'),
    sym("pin", '<path d="M12 21c4-4.5 7-7.8 7-11a7 7 0 1 0-14 0c0 3.2 3 6.5 7 11z"/><circle cx="12" cy="10" r="2.6"/>'),
    sym("arrow-right", '<path d="M4.5 12h15M13 5.5 19.5 12 13 18.5"/>'),
    sym("arrow-up-right", '<path d="M7 17 17 7M8.5 7H17v8.5"/>'),
    sym("chevron-right", '<path d="M9 5.5 15.5 12 9 18.5"/>'),
    sym("chevron-down", '<path d="M5.5 9 12 15.5 18.5 9"/>'),
    sym("menu", '<path d="M4 7h16M4 12h16M4 17h16"/>'),
    sym("close", '<path d="M6 6l12 12M18 6 6 18"/>'),
    sym("chat", '<path d="M5 4.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-4 3.2V16.5H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"/>'),
    sym("send", '<path d="M21 3 3 10.5l7 2.6 2.6 7L21 3z"/><path d="M10 13.1 21 3"/>'),
    sym("star", '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8-4.3-4.1 5.9-.9z" fill="currentColor" stroke="none"/>'),
    sym("ev", '<rect x="4.5" y="3" width="10" height="18" rx="2.2"/><path d="M9 9.5 7.4 12.4h3L8.7 15.5"/><path d="M14.5 8h2.5a2 2 0 0 1 2 2v4a1.6 1.6 0 1 0 3.2 0v-3"/>'),
    sym("bulb", '<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.5 10.8c.6.5 1 1.2 1 2V16h5v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>'),
    sym("fan", '<circle cx="12" cy="12" r="1.7"/><path d="M12 10.3C12 6 13 3.6 15.4 4.6 17.4 5.4 16 9.6 12 10.3ZM13.7 12C18 12 20.4 13 19.4 15.4 18.6 17.4 14.4 16 13.7 12ZM12 13.7C12 18 11 20.4 8.6 19.4 6.6 18.6 8 14.4 12 13.7ZM10.3 12C6 12 3.6 11 4.6 8.6 5.4 6.6 9.6 8 10.3 12Z" fill="currentColor" stroke="none"/>'),
    sym("bell", '<path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.8 1.8H4.2L6 16.5z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
    sym("switch", '<rect x="3" y="8" width="18" height="8" rx="4"/><circle cx="9" cy="12" r="2.4" fill="currentColor" stroke="none"/>'),
    sym("search", '<circle cx="11" cy="11" r="7"/><path d="M16.2 16.2 21 21"/>'),
    sym("hammer", '<path d="m14.5 6.5 3 3M16.8 4.2 19.8 7.2 16.5 10.5l-3-3zM13 9 3.8 18.2l2 2L15 11"/>'),
    sym("key", '<circle cx="8.5" cy="8.5" r="4"/><path d="m11.3 11.3 8 8M16.5 16.5 18.5 14.5M14.5 18.5 16.5 16.5"/>'),
    sym("building", '<rect x="4" y="3.5" width="16" height="17" rx="1.6"/><path d="M8 8h2M14 8h2M8 12h2M14 12h2M9 20.5v-3h6v3"/>'),
    sym("house", '<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>'),
    sym("camera", '<rect x="3" y="6.5" width="18" height="13" rx="2.5"/><circle cx="12" cy="13" r="3.4"/><path d="M8 6.5 9.4 4h5.2L16 6.5"/>'),
    sym("upload", '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>'),
    sym("mail", '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>'),
    sym("info", '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>'),
    sym("warning", '<path d="M12 4 2.6 20h18.8L12 4z"/><path d="M12 10v4M12 17h.01"/>'),
    sym("users", '<circle cx="9" cy="8" r="3.2"/><path d="M3.6 19c0-3 2.4-5 5.4-5s5.4 2 5.4 5"/><path d="M16 5.3A3.2 3.2 0 0 1 18 11M17.6 14c2.3.3 3.9 2.3 3.9 5"/>'),
    sym("heart", '<path d="M12 20S4 14.5 4 9.2A4.2 4.2 0 0 1 12 6a4.2 4.2 0 0 1 8 3.2C20 14.5 12 20 12 20z"/>'),
    sym("tag", '<path d="M3.6 12.6 12.6 3.6H20V11l-9 9-7.4-7.4z"/><circle cx="16" cy="8" r="1.3" fill="currentColor" stroke="none"/>'),
    sym("clipboard", '<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M9 12l2 2 4-4"/>'),
    sym("route", '<circle cx="6.5" cy="18" r="2.4"/><circle cx="17.5" cy="6" r="2.4"/><path d="M8.4 16.3C14 14.8 16 12 15.6 8M15.1 6H9.5"/>'),
    sym("sparkle", '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="currentColor" stroke="none"/>'),
    sym("quote", '<path d="M9.5 6.5H5.5A1.5 1.5 0 0 0 4 8v3.5A1.5 1.5 0 0 0 5.5 13H8v1.5A2.5 2.5 0 0 1 5.5 17M20 6.5h-4A1.5 1.5 0 0 0 14.5 8v3.5A1.5 1.5 0 0 0 16 13h2.5v1.5A2.5 2.5 0 0 1 16 17"/>'),
    sym("plug", '<path d="M9 3v5M15 3v5"/><path d="M7 8h10v2a5 5 0 0 1-10 0z"/><path d="M12 15v6"/>'),
    sym("dollar", '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9c-.5-1-1.5-1.5-2.7-1.5-1.5 0-2.6.8-2.6 2 0 2.8 5.6 1.4 5.6 4.2 0 1.3-1.2 2.1-2.8 2.1-1.4 0-2.5-.6-3-1.6M12 6v1.5M12 16.5V18"/>'),
    sym("facebook", '<path d="M14 8.5h2.5V5.6H14c-2 0-3.5 1.4-3.5 3.4V11H8v3h2.5v7h3v-7H16l.5-3h-3v-1.5c0-.6.4-1 .9-1z" fill="currentColor" stroke="none"/>'),
    sym("instagram", '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none"/>'),
    sym("award", '<circle cx="12" cy="9" r="5.5"/><path d="M9 13.5 7.5 21l4.5-2.5L16.5 21 15 13.5"/>'),
    sym("leaf", '<path d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14-0.5 0-1 0-1 0z"/><path d="M5 19C9 14 12 12 16 10"/>'),
    "</svg>"
  ].join("");
  function sym(id, body) { return '<symbol id="i-' + id + '" viewBox="0 0 24 24">' + body + "</symbol>"; }

  function injectSprite() {
    var d = document.createElement("div");
    d.innerHTML = SPRITE;
    var node = d.firstChild;
    document.body.insertBefore(node, document.body.firstChild);
  }

  /* ============================ Header / nav ============================ */
  function initHeader() {
    var header = $(".site-header");
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 36) header.classList.add("is-stuck");
      else header.classList.remove("is-stuck");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Active nav from <body data-page="...">
    var page = document.body.getAttribute("data-page");
    if (page) $$('[data-nav="' + page + '"]').forEach(function (a) { a.classList.add("is-active"); });

    // Mobile menu
    var toggle = $(".menu-toggle");
    var drawer = $(".mobile-nav");
    if (toggle && drawer) {
      var close = $(".mobile-nav__close", drawer);
      var open = function () { drawer.classList.add("is-open"); document.body.classList.add("no-scroll"); drawer.setAttribute("aria-hidden", "false"); };
      var shut = function () { drawer.classList.remove("is-open"); document.body.classList.remove("no-scroll"); drawer.setAttribute("aria-hidden", "true"); };
      toggle.addEventListener("click", open);
      if (close) close.addEventListener("click", shut);
      $$(".mobile-nav__links a", drawer).forEach(function (a) { a.addEventListener("click", shut); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") shut(); });
    }
  }

  /* ============================ Reveal + counters ============================ */
  function initReveal() {
    var els = $$("[data-reveal]");
    // stagger groups
    $$("[data-reveal-group]").forEach(function (group) {
      $$("[data-reveal]", group).forEach(function (child, i) {
        child.style.setProperty("--reveal-delay", (i * 75) + "ms");
      });
    });
    if (!("IntersectionObserver" in window) || prefersReduced()) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      countUpAll();
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });

    // counters
    var counters = $$("[data-count]");
    if (counters.length) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cio.observe(c); });
    }
  }
  function countUpAll() { $$("[data-count]").forEach(countUp); }
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(step);
  }
  function prefersReduced() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  /* ============================ Lead core ============================ */
  var STORAGE_KEY = "coastline_leads";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function isEmail(v) { return EMAIL_RE.test((v || "").trim()); }
  function isAusPhone(v) {
    var d = (v || "").replace(/[\s()\-.]/g, "");
    return /^(?:\+?61|0)[234578]\d{8}$/.test(d);
  }
  function serviceSlug(name) {
    return (name || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "general";
  }

  // Canonical lead shape (matches functions/* and GHL field mapping)
  function makeLead(data) {
    var svc = data.serviceNeeded || "";
    var tags = (CFG.baseTags || []).slice();
    if (svc) tags.push(serviceSlug(svc));
    return {
      id: "lead_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      business: CFG.business || "Coastline Electrical Co.",
      leadType: data.leadType || "Enquiry",          // Booking | Quote | Contact | Chatbot
      leadSource: "website",
      sourcePage: data.sourcePage || (location.pathname.split("/").pop() || "index.html"),
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      name: data.name || ((data.firstName || "") + " " + (data.lastName || "")).trim(),
      phone: data.phone || "",
      email: data.email || "",
      suburb: data.suburb || "",
      address: data.address || "",
      serviceNeeded: svc,
      propertyType: data.propertyType || "",
      urgency: data.urgency || "",
      preferredDate: data.preferredDate || "",
      preferredTime: data.preferredTime || "",
      message: data.message || "",
      consent: !!data.consent,
      tags: tags,
      createdAt: new Date().toISOString()
    };
  }
  function saveLeadLocal(lead) {
    try {
      var arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      arr.push(lead);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) { /* storage may be disabled; ignore for demo */ }
  }

  // Fail-safe send: always saves locally; tries the endpoint; never throws.
  // Returns a promise that resolves {ok, forwarded}.
  function sendLead(lead, endpoint) {
    saveLeadLocal(lead);
    try { console.log("[lead captured]", lead); console.table && console.table([lead]); } catch (e) {}
    if (!endpoint) return Promise.resolve({ ok: true, forwarded: false });
    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        return { ok: r.ok, forwarded: !!(j && j.forwarded) };
      });
    }).catch(function (err) {
      // Demo mode / no backend yet — lead is safe in localStorage.
      console.warn("[lead] endpoint unavailable (saved locally):", err && err.message);
      return { ok: true, forwarded: false };
    });
  }

  // expose for booking.js + chatbot
  window.CoastlineLeads = {
    make: makeLead, send: sendLead, isEmail: isEmail, isAusPhone: isAusPhone,
    endpoints: CFG.endpoints || {}, serviceSlug: serviceSlug, STORAGE_KEY: STORAGE_KEY
  };

  /* ============================ Reusable lead form ============================ */
  // <form data-lead-form data-lead-type="Contact" data-endpoint="contact"> ... </form>
  function initLeadForms() {
    $$("form[data-lead-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        clearErrors(form);
        // Honeypot
        var hp = $('input[name="company_website"]', form);
        if (hp && hp.value) { return; } // bot — silently drop
        var fields = collectFields(form);
        var errs = validateFields(form, fields);
        if (errs) { focusFirstError(form); return; }

        var btn = $('button[type="submit"]', form) || $(".btn", form);
        var orig = btn ? btn.innerHTML : "";
        if (btn) { btn.classList.add("is-loading"); btn.innerHTML = '<span class="spinner"></span> Sending'; }

        var type = form.getAttribute("data-lead-type") || "Contact";
        var epKey = form.getAttribute("data-endpoint") || "contact";
        var endpoint = (CFG.endpoints && CFG.endpoints[epKey]) || null;
        var lead = makeLead(Object.assign({ leadType: type }, fields));

        sendLead(lead, endpoint).then(function () {
          showFormSuccess(form);
        }).catch(function () {
          showFormSuccess(form); // lead is saved locally regardless
        }).then(function () {
          if (btn) { btn.classList.remove("is-loading"); btn.innerHTML = orig; }
        });
      });
    });
  }
  function collectFields(form) {
    var data = {};
    $$("[name]", form).forEach(function (el) {
      var n = el.name;
      if (n === "company_website") return;
      if (el.type === "checkbox") { data[n] = el.checked; return; }
      data[n] = el.value.trim();
    });
    return data;
  }
  function validateFields(form, data) {
    var bad = false;
    $$("[data-required]", form).forEach(function (el) {
      var v = el.type === "checkbox" ? el.checked : (el.value || "").trim();
      if (!v) { markInvalid(el, el.getAttribute("data-msg") || "This field is required."); bad = true; }
    });
    var phone = $('[name="phone"]', form);
    if (phone && phone.value.trim() && !isAusPhone(phone.value)) { markInvalid(phone, "Enter a valid Australian phone number."); bad = true; }
    var email = $('[name="email"]', form);
    if (email && email.value.trim() && !isEmail(email.value)) { markInvalid(email, "Enter a valid email address."); bad = true; }
    return bad;
  }
  function fieldWrap(el) { return el.closest(".field") || el.closest(".consent") || el.parentNode; }
  function markInvalid(el, msg) {
    var wrap = fieldWrap(el);
    wrap.classList.add("field--invalid");
    var err = $(".field__error", wrap);
    if (!err) {
      err = document.createElement("span");
      err.className = "field__error";
      err.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-warning"></use></svg><span></span>';
      wrap.appendChild(err);
    }
    $("span", err) ? ($("span", err).textContent = msg) : (err.textContent = msg);
  }
  function clearErrors(form) { $$(".field--invalid", form).forEach(function (w) { w.classList.remove("field--invalid"); }); }
  function focusFirstError(form) { var f = $(".field--invalid [name], .field--invalid input", form); if (f) f.focus(); }
  function showFormSuccess(form) {
    var target = form.getAttribute("data-success-target");
    var panel = target ? $(target) : null;
    var html =
      '<div class="alert alert--ok" role="status">' +
      '<svg class="ic" aria-hidden="true"><use href="#i-check"></use></svg>' +
      '<div><strong>Thanks, we\'ve got your details.</strong><br>A licensed Coastline electrician will be in touch during business hours (Mon–Fri 7am–5pm) to confirm the details and timing.</div>' +
      "</div>";
    if (panel) { panel.innerHTML = html; panel.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "center" }); }
    else {
      var box = document.createElement("div");
      box.innerHTML = html;
      form.parentNode.insertBefore(box.firstChild, form);
      form.reset();
      form.style.display = "none";
    }
  }

  /* ============================ Footer year ============================ */
  function initYear() { $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); }); }

  /* ============================ Leads debug panel ============================ */
  function initDebug() {
    var openPanel = function () {
      var existing = $("#cl-debug");
      if (existing) { existing.remove(); return; }
      var leads = [];
      try { leads = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch (e) {}
      var panel = document.createElement("div");
      panel.id = "cl-debug";
      panel.style.cssText = "position:fixed;left:16px;bottom:16px;z-index:300;width:min(440px,92vw);max-height:70vh;overflow:auto;background:#0b1530;color:#dbe4f5;border:1px solid #1b3263;border-radius:14px;padding:14px 16px;font:12px/1.5 ui-monospace,Menlo,monospace;box-shadow:0 24px 60px rgba(0,0,0,.5)";
      panel.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-family:Sora,sans-serif"><strong style="color:#fff">Captured leads (' + leads.length + ')</strong><span><button id="cl-clear" style="color:#ffc02e;margin-right:10px">Clear</button><button id="cl-x" style="color:#6aa6ff">Close</button></span></div><pre style="white-space:pre-wrap;word-break:break-word;margin:0">' + (leads.length ? escapeHtml(JSON.stringify(leads, null, 2)) : "No leads yet. Submit a form or use the chatbot.") + "</pre>";
      document.body.appendChild(panel);
      $("#cl-x").onclick = function () { panel.remove(); };
      $("#cl-clear").onclick = function () { localStorage.removeItem(STORAGE_KEY); panel.remove(); };
    };
    document.addEventListener("keydown", function (e) { if (e.altKey && (e.key === "l" || e.key === "L")) openPanel(); });
    if (/[?&]debug/.test(location.search)) openPanel();
  }
  function escapeHtml(s) { return s.replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  /* ============================ Chatbot ============================ */
  // Scripted demo assistant. Collects name, phone, email, suburb + service,
  // then POSTs the lead to the chat endpoint (functions/chat-lead.js).
  // Clearly a demo — ready to swap the scripted brain for an AI backend.
  var Chat = {
    state: "greet",
    lead: {},
    el: {},
    danger: /(spark|smoke|burn|fire|shock|zap|exposed wire|bare wire|buzzing|hot (switch|outlet|powerpoint|socket)|melt)/i,

    build: function () {
      var launcher = document.createElement("button");
      launcher.className = "chat-launcher";
      launcher.setAttribute("aria-label", "Open chat assistant");
      launcher.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-chat"></use></svg><span class="chat-launcher__pulse"></span>';
      document.body.appendChild(launcher);

      var win = document.createElement("section");
      win.className = "chat-window";
      win.setAttribute("aria-label", "Chat assistant");
      win.setAttribute("role", "dialog");
      win.innerHTML =
        '<header class="chat-head">' +
          '<div class="chat-head__id"><span class="chat-head__avatar"><svg class="ic" aria-hidden="true"><use href="#i-bolt"></use></svg></span>' +
          '<div><strong>Coastline Assistant</strong><span class="chat-head__sub"><span class="chat-head__dot"></span>Demo · replies in seconds</span></div></div>' +
          '<button class="chat-head__close" aria-label="Close chat"><svg class="ic" aria-hidden="true"><use href="#i-close"></use></svg></button>' +
        '</header>' +
        '<div class="chat-log" id="chat-log" aria-live="polite"></div>' +
        '<div class="chat-quick" id="chat-quick"></div>' +
        '<form class="chat-input" id="chat-form" autocomplete="off">' +
          '<input type="text" id="chat-text" placeholder="Type a message…" aria-label="Type a message" />' +
          '<button type="submit" aria-label="Send"><svg class="ic" aria-hidden="true"><use href="#i-send"></use></svg></button>' +
        '</form>';
      document.body.appendChild(win);

      this.el = {
        launcher: launcher, win: win,
        log: $("#chat-log", win), quick: $("#chat-quick", win),
        form: $("#chat-form", win), text: $("#chat-text", win),
        close: $(".chat-head__close", win)
      };

      var self = this;
      launcher.addEventListener("click", function () { self.toggle(); });
      this.el.close.addEventListener("click", function () { self.toggle(false); });
      this.el.form.addEventListener("submit", function (e) { e.preventDefault(); var v = self.el.text.value.trim(); if (v) { self.userSay(v); self.el.text.value = ""; self.handle(v); } });
    },

    toggle: function (force) {
      var open = typeof force === "boolean" ? force : !this.el.win.classList.contains("is-open");
      this.el.win.classList.toggle("is-open", open);
      this.el.launcher.classList.toggle("is-active", open);
      if (open && !this._started) { this._started = true; this.start(); }
      if (open) setTimeout(function () { var t = $("#chat-text"); if (t) t.focus(); }, 320);
    },

    start: function () {
      var self = this;
      this.botSay("G'day! I'm the Coastline Electrical assistant 👋 I can help you scope a job and get a booking started.");
      setTimeout(function () {
        self.botSay("What electrical work do you need a hand with?");
        self.setQuick([
          { t: "Switchboard upgrade", v: "Switchboard upgrade" },
          { t: "EV charger", v: "EV charger installation" },
          { t: "Lighting / downlights", v: "Lighting installation" },
          { t: "Power fault / repair", v: "Fault finding and repairs" },
          { t: "Something else", v: "Something else" }
        ]);
        self.state = "service";
      }, 700);
    },

    handle: function (text) {
      var self = this;
      this.clearQuick();
      // Safety interceptor — runs in any state
      if (this.danger.test(text)) {
        this.botSay("⚠️ Please be careful. If anyone is in danger, there's smoke or burning, or you can smell something hot, call <strong>000</strong> now. For loss of supply or sparking from the street, ring your distributor <strong>Ausgrid on 13 13 88</strong>.", true);
        this.botSay("Heads up: <strong>we don't do 24/7 emergency callouts</strong> — we book scheduled work during business hours. I can still take your details so the team prioritises you first thing.", true);
      }
      setTimeout(function () { self.step(text); }, 550);
    },

    step: function (text) {
      var self = this;
      switch (this.state) {
        case "service":
          this.lead.serviceNeeded = text;
          this.botSay("Good one. What suburb are you in?");
          this.setQuick([
            { t: "Gosford", v: "Gosford" }, { t: "Terrigal", v: "Terrigal" },
            { t: "Erina", v: "Erina" }, { t: "Woy Woy", v: "Woy Woy" },
            { t: "Other Central Coast", v: "Central Coast" }
          ]);
          this.state = "suburb";
          break;
        case "suburb":
          this.lead.suburb = text;
          this.botSay("Is this for a home, a rental, or a business?");
          this.setQuick([
            { t: "My home", v: "Home" }, { t: "A rental", v: "Rental" }, { t: "A business", v: "Business" }
          ]);
          this.state = "property";
          break;
        case "property":
          this.lead.propertyType = text;
          this.botSay("Perfect. Would you like to book a quote? I'll grab a few details and the team will confirm a time.");
          this.setQuick([
            { t: "Yes, book a quote", v: "book" }, { t: "Just a quick question", v: "question" }
          ]);
          this.state = "intent";
          break;
        case "intent":
          if (/quest/i.test(text) || text === "question") {
            this.botSay("No worries — ask away. For anything detailed it's quickest to call us on <strong>" + (CFG.phoneDisplay || "") + "</strong> (Mon–Fri 7am–5pm), or I can still take your details for a callback.");
            this.setQuick([{ t: "Book a quote instead", v: "book" }, { t: "Call now", v: "__call" }]);
            this.state = "intent";
          } else {
            this.botSay("Great. What's your name?");
            this.state = "name";
          }
          break;
        case "name":
          this.lead.name = text;
          this.botSay("Thanks " + text.split(" ")[0] + ". What's the best phone number to reach you on?");
          this.state = "phone";
          break;
        case "phone":
          if (!isAusPhone(text)) { this.botSay("Hmm, that doesn't look like an Australian number. Try a mobile like 0412 345 678 or a landline like (02) 4321 1234."); return; }
          this.lead.phone = text;
          this.botSay("And your email, so we can send a written quote?");
          this.state = "email";
          break;
        case "email":
          if (!isEmail(text)) { this.botSay("That email doesn't look quite right — mind checking it?"); return; }
          this.lead.email = text;
          this.submit();
          break;
        default:
          this.botSay("I can help you book a quote or get the right service. Want to start a booking?");
          this.setQuick([{ t: "Book a quote", v: "book" }, { t: "Call now", v: "__call" }]);
          this.state = "intent";
      }
    },

    submit: function () {
      var self = this;
      this.typing(true);
      var lead = makeLead({
        leadType: "Chatbot",
        name: this.lead.name,
        phone: this.lead.phone,
        email: this.lead.email,
        suburb: this.lead.suburb,
        serviceNeeded: this.lead.serviceNeeded,
        propertyType: this.lead.propertyType,
        message: "Lead captured via website chatbot.",
        sourcePage: "chatbot"
      });
      var ep = (CFG.endpoints && CFG.endpoints.chat) || null;
      sendLead(lead, ep).then(function () {
        self.typing(false);
        self.botSay("Thanks. The team will review your request and get back to you during business hours.");
        self.botSay("Want to lock in a preferred time now? You can pick a date on our booking page.");
        self.setQuick([
          { t: "Open booking page", v: "__book" },
          { t: "Call " + (CFG.phoneDisplay || ""), v: "__call" }
        ]);
        self.state = "done";
      });
    },

    /* ---- UI helpers ---- */
    userSay: function (text) { this.append("user", text); },
    botSay: function (html, instant) {
      var self = this;
      if (instant) { this.append("bot", html); return; }
      this.typing(true);
      setTimeout(function () { self.typing(false); self.append("bot", html); }, 480);
    },
    append: function (who, html) {
      var row = document.createElement("div");
      row.className = "chat-msg chat-msg--" + who;
      row.innerHTML = '<div class="chat-bubble">' + html + "</div>";
      this.el.log.appendChild(row);
      this.scroll();
    },
    typing: function (on) {
      var ex = $(".chat-typing", this.el.log);
      if (on) {
        if (ex) return;
        var t = document.createElement("div");
        t.className = "chat-msg chat-msg--bot chat-typing";
        t.innerHTML = '<div class="chat-bubble chat-bubble--typing"><span></span><span></span><span></span></div>';
        this.el.log.appendChild(t); this.scroll();
      } else if (ex) { ex.remove(); }
    },
    setQuick: function (items) {
      var self = this;
      this.el.quick.innerHTML = "";
      items.forEach(function (it) {
        var b = document.createElement("button");
        b.className = "chat-chip";
        b.type = "button";
        b.textContent = it.t;
        b.addEventListener("click", function () {
          if (it.v === "__call") { window.location.href = CFG.telHref; return; }
          if (it.v === "__book") { window.location.href = bookHref(); return; }
          self.userSay(it.t);
          self.handle(it.v);
        });
        self.el.quick.appendChild(b);
      });
    },
    clearQuick: function () { this.el.quick.innerHTML = ""; },
    scroll: function () { this.el.log.scrollTop = this.el.log.scrollHeight; }
  };

  function bookHref() {
    // resolve correct relative path to book.html from any depth
    return (location.pathname.indexOf("/services/") > -1 || location.pathname.indexOf("/areas/") > -1 || location.pathname.indexOf("/blog/") > -1) ? "../book.html" : "book.html";
  }

  /* ============================ Hero video ============================ */
  // Poster shows instantly; the video slow-fades in once it can play, runs at
  // a slowed rate and gently zooms (CSS) for a smooth, cinematic feel.
  function initHeroVideo() {
    var v = document.querySelector(".hero__media video");
    if (!v) return;
    if (prefersReduced()) return; // poster image shows instead under reduced motion
    // PING-PONG (boomerang) loop on ONE video: play forward, then gently reverse,
    // and repeat. The turnaround frames are identical, so there is NO cut at the
    // loop and NO second layer to blend/merge. Slowed for a calm, premium feel.
    var RATE = 0.5;
    v.loop = false; v.muted = true; v.playsInline = true; v.removeAttribute("autoplay");
    try { v.playbackRate = RATE; } catch (e) {}
    var show = function () { v.classList.add("is-visible"); };
    if (v.readyState >= 2) show(); else v.addEventListener("loadeddata", show, { once: true });

    var reversing = false, lastTs = 0, pending = 0;
    function forward() { reversing = false; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    function rev(ts) {
      if (!reversing) return;
      if (!lastTs) lastTs = ts;
      pending += ((ts - lastTs) / 1000) * RATE;   // accumulate real time, rate-scaled
      lastTs = ts;
      if (!v.seeking && pending > 0) {             // wait for each seek; don't queue them
        var nt = v.currentTime - pending; pending = 0;
        if (nt <= 0) { v.currentTime = 0; forward(); return; }
        v.currentTime = nt;
      }
      requestAnimationFrame(rev);
    }
    function startReverse() { if (reversing) return; reversing = true; v.pause(); lastTs = 0; pending = 0; requestAnimationFrame(rev); }
    v.addEventListener("ended", startReverse);
    v.addEventListener("timeupdate", function () {
      if (!reversing && v.duration && v.currentTime >= v.duration - 0.06) startReverse();
    });
    function kick() { if (!reversing) forward(); }
    kick();
    // Browsers block autoplay in hidden/background tabs; resume when visible.
    document.addEventListener("visibilitychange", function () { if (!document.hidden) kick(); });
  }

  /* ============================ Electrical-flow background ============================ */
  // Injects an animated circuit/current SVG into any [data-fx="circuit"] section.
  var CIRCUIT =
    '<svg class="fx-circuit" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    '<g class="fx-trace">' +
    '<path d="M-20 72 H180 V150 H400 V64 H640 V190 H900 V112 H1220"/>' +
    '<path d="M-20 210 H120 V300 H360 V198 H600 V322 H840 V232 H1220"/>' +
    '<path d="M-20 360 H240 V280 H470 V372 H760 V300 H1020 V382 H1220"/>' +
    '<path d="M-20 140 H80 V40 H300 V120 H520 V30 H780 V96 H1220"/>' +
    '</g>' +
    '<g class="fx-pulse">' +
    '<path d="M-20 72 H180 V150 H400 V64 H640 V190 H900 V112 H1220"/>' +
    '<path d="M-20 210 H120 V300 H360 V198 H600 V322 H840 V232 H1220"/>' +
    '<path d="M-20 360 H240 V280 H470 V372 H760 V300 H1020 V382 H1220"/>' +
    '</g>' +
    '<g class="fx-node">' +
    '<circle cx="180" cy="150" r="4.5"/><circle cx="400" cy="64" r="4.5"/><circle cx="640" cy="190" r="4.5"/>' +
    '<circle cx="360" cy="198" r="4.5"/><circle cx="600" cy="322" r="4.5"/><circle cx="470" cy="372" r="4.5"/>' +
    '<circle cx="760" cy="300" r="4.5"/><circle cx="300" cy="120" r="4.5"/><circle cx="900" cy="112" r="4.5"/>' +
    '</g></svg>';
  function initCircuitFx() {
    $$('.page-hero, [data-fx="circuit"]').forEach(function (el) {
      var d = document.createElement("div");
      d.innerHTML = CIRCUIT;
      el.insertBefore(d.firstChild, el.firstChild);
    });
  }

  /* ============================ Boot ============================ */
  function boot() {
    injectSprite();
    initCircuitFx();
    initHeader();
    initHeroVideo();
    initReveal();
    initLeadForms();
    initYear();
    initDebug();
    if (!document.body.hasAttribute("data-no-chat")) { Chat.build(); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
