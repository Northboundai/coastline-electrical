/* =====================================================================
   Coastline Electrical — booking.js
   Two modes (chosen by the toggle at the top of #booking):
     "book"  -> service -> date -> time -> details -> confirm  (real appointment)
     "quote" -> service -> details -> confirm                  (Quote lead, no slot)
   Uses window.CoastlineLeads (main.js) + window.COASTLINE_CONFIG.
   ===================================================================== */
(function () {
  "use strict";
  var root = document.getElementById("booking");
  if (!root) return;

  var CFG = window.COASTLINE_CONFIG || {};
  var L = window.CoastlineLeads || {};
  var AV = CFG.availability || {};
  var OPEN_DAYS = AV.openDays || [1, 2, 3, 4, 5, 6];
  var BY_APPT = AV.byAppointmentDays || [6];
  var SLOTS = AV.timeSlots || ["7:30 AM", "9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM"];
  var HORIZON = AV.horizonDays || 60;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var WD_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + HORIZON);

  var fullSet = {};
  (AV.fullyBookedOffsets || []).forEach(function (off) {
    var d = new Date(today); d.setDate(d.getDate() + off);
    fullSet[iso(d)] = true;
  });

  var state = { step: 1, mode: "book", service: null, serviceName: null, bookingType: null, dateObj: null, time: null };
  var MODE_STEPS = { book: [1, 2, 3, 4, 5], quote: [1, 4, 5] };
  function seq() { return MODE_STEPS[state.mode] || MODE_STEPS.book; }
  function nextN() { var s = seq(); return s[s.indexOf(state.step) + 1]; }
  function prevN() { var s = seq(); return s[s.indexOf(state.step) - 1]; }
  function isQuote() { return state.mode === "quote"; }

  var viewY = today.getFullYear(), viewM = today.getMonth();
  var inited = false;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function prettyDate(d) { return DAY_NAMES[d.getDay()].slice(0, 3) + ", " + d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3) + " " + d.getFullYear(); }

  /* ---------------- Step 1: service selection ---------------- */
  var nextBtn = $("#booking-next"), backBtn = $("#booking-back");

  $$(".svc-option", root).forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".svc-option", root).forEach(function (b) { b.classList.remove("is-selected"); b.setAttribute("aria-pressed", "false"); });
      btn.classList.add("is-selected"); btn.setAttribute("aria-pressed", "true");
      state.service = btn.getAttribute("data-slug");
      state.serviceName = btn.getAttribute("data-name");
      state.bookingType = btn.getAttribute("data-booking");
      refreshNav();
    });
  });

  (function preselect() {
    var m = location.search.match(/[?&]service=([a-z0-9-]+)/i);
    if (!m) return;
    var btn = $('.svc-option[data-slug="' + m[1] + '"]', root);
    if (btn) btn.click();
  })();

  /* ---------------- Step 2: calendar ---------------- */
  function isUnavailable(d) {
    if (d <= today || d > maxDate) return true; // block past days AND today (no same-day bookings)
    if (OPEN_DAYS.indexOf(d.getDay()) === -1) return true;
    if (fullSet[iso(d)]) return true;
    return false;
  }

  function renderCalendar() {
    var cal = $("#calendar"); if (!cal) return;
    var canPrev = (viewY > today.getFullYear()) || (viewM > today.getMonth());
    var first = new Date(viewY, viewM, 1);
    var startOffset = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(viewY, viewM + 1, 0).getDate();

    var html = '<div class="calendar__head">' +
      '<button type="button" class="cal-prev" aria-label="Previous month"' + (canPrev ? "" : " disabled") + '><svg class="ic" aria-hidden="true"><use href="#i-chevron-right" style="transform:scaleX(-1);transform-origin:center"></use></svg></button>' +
      '<span class="calendar__title">' + MONTHS[viewM] + " " + viewY + "</span>" +
      '<button type="button" class="cal-next" aria-label="Next month"><svg class="ic" aria-hidden="true"><use href="#i-chevron-right"></use></svg></button>' +
      "</div>";
    html += '<div class="calendar__weekdays">' + WD_SHORT.map(function (w) { return "<span>" + w + "</span>"; }).join("") + "</div>";
    html += '<div class="calendar__grid">';
    for (var i = 0; i < startOffset; i++) html += '<span class="cal-day is-empty" aria-hidden="true"></span>';
    for (var day = 1; day <= daysInMonth; day++) {
      var d = new Date(viewY, viewM, day);
      var isoStr = iso(d);
      var cls = "cal-day", disabled = false, label = day;
      if (d.getTime() === today.getTime()) cls += " is-today";
      if (fullSet[isoStr] && d >= today) { cls += " is-full"; disabled = true; }
      if (isUnavailable(d)) disabled = true;
      if (state.dateObj && iso(state.dateObj) === isoStr) cls += " is-selected";
      html += '<button type="button" class="' + cls + '" data-date="' + isoStr + '"' + (disabled ? " disabled" : "") +
        ' aria-label="' + prettyDate(d) + (disabled ? " (unavailable)" : "") + '">' + label + "</button>";
    }
    html += "</div>";
    cal.innerHTML = html;

    $(".cal-prev", cal).addEventListener("click", function () { if (!this.disabled) { viewM--; if (viewM < 0) { viewM = 11; viewY--; } renderCalendar(); } });
    $(".cal-next", cal).addEventListener("click", function () { viewM++; if (viewM > 11) { viewM = 0; viewY++; } renderCalendar(); });
    $$(".cal-day[data-date]", cal).forEach(function (b) {
      if (b.disabled) return;
      b.addEventListener("click", function () {
        var parts = b.getAttribute("data-date").split("-");
        state.dateObj = new Date(+parts[0], +parts[1] - 1, +parts[2]);
        state.time = null;
        renderCalendar();
        refreshNav();
      });
    });
  }

  /* ---------------- Step 3: time slots ---------------- */
  function renderSlots() {
    var box = $("#slots"); if (!box) return;
    var isSat = state.dateObj && BY_APPT.indexOf(state.dateObj.getDay()) > -1;
    var list = isSat ? SLOTS.slice(0, 3) : SLOTS;
    var note = isSat ? '<p class="alert alert--info" style="grid-column:1/-1;margin-bottom:.4rem"><svg class="ic" aria-hidden="true"><use href="#i-info"></use></svg><span>Saturdays are by appointment, so windows are limited. We\'ll confirm the exact time with you.</span></p>' : "";
    box.innerHTML = note + list.map(function (t) {
      var sel = state.time === t ? " is-selected" : "";
      return '<button type="button" class="slot' + sel + '" data-time="' + t + '">' + t + "</button>";
    }).join("");
    $$(".slot", box).forEach(function (b) {
      b.addEventListener("click", function () {
        state.time = b.getAttribute("data-time");
        renderSlots(); refreshNav();
      });
    });
  }

  /* ---------------- Step 5: review ---------------- */
  function row(k, v) { return '<div class="booking-summary__row"><span class="k">' + k + '</span><span class="v">' + (v || "—") + "</span></div>"; }
  function renderReview() {
    var f = readForm();
    var q = isQuote();
    var html = '<h2 class="booking-step__title">' + (q ? "Confirm your quote request" : "Confirm your booking") + '</h2>' +
      '<p class="booking-step__sub">' + (q ? "Have a quick look, then send it through. We'll get a quote back to you fast." : "Have a quick look, then lock it in. Your time slot is reserved the moment you confirm.") + '</p>' +
      '<div class="booking-summary">' +
      row("Service", state.serviceName) +
      (q ? "" : row("Preferred date", state.dateObj ? prettyDate(state.dateObj) : "") + row("Preferred time", state.time)) +
      row("Name", (f.firstName + " " + f.lastName).trim()) +
      row("Phone", f.phone) + row("Email", f.email) +
      row("Suburb", f.suburb) + (f.address ? row("Address", f.address) : "") + row("Property", f.propertyType || "—") +
      row("Urgency", f.urgency) +
      "</div>" +
      (f.message ? '<p style="margin-top:1rem;color:var(--slate)"><strong>Notes:</strong> ' + escapeHtml(f.message) + "</p>" : "") +
      '<div class="notice-emergency" style="margin-top:1.5rem"><svg class="ic" aria-hidden="true"><use href="#i-warning"></use></svg><div>We don\'t do 24/7 emergency callouts — bookings are for scheduled work during business hours. If it\'s dangerous or you smell burning, call <strong>000</strong>.</div></div>';
    $("#booking-review").innerHTML = html;
  }

  function readForm() {
    var form = $("#booking-form");
    var d = {};
    $$("[name]", form).forEach(function (el) {
      if (el.name === "company_website") return;
      d[el.name] = el.type === "checkbox" ? el.checked : el.value.trim();
    });
    return d;
  }

  /* ---------------- Step 4 validation ---------------- */
  function validateDetails() {
    var form = $("#booking-form");
    var ok = true;
    $$(".field--invalid", form).forEach(function (w) { w.classList.remove("field--invalid"); });
    $$("[data-required]", form).forEach(function (el) {
      if (isQuote() && el.name === "address") return; // street address optional for quotes
      var v = el.type === "checkbox" ? el.checked : el.value.trim();
      if (!v) { invalid(el, el.getAttribute("data-msg") || "This field is required."); ok = false; }
    });
    var phone = $('[name="phone"]', form);
    if (phone.value.trim() && L.isAusPhone && !L.isAusPhone(phone.value)) { invalid(phone, "Enter a valid Australian phone number."); ok = false; }
    var email = $('[name="email"]', form);
    if (email.value.trim() && L.isEmail && !L.isEmail(email.value)) { invalid(email, "Enter a valid email address."); ok = false; }
    if (!ok) { var f = $(".field--invalid input, .field--invalid select, .field--invalid textarea", form); if (f) f.focus(); }
    return ok;
  }
  function invalid(el, msg) {
    var wrap = el.closest(".field") || el.closest(".consent") || el.parentNode;
    wrap.classList.add("field--invalid");
    var err = wrap.querySelector(".field__error");
    if (!err) { err = document.createElement("span"); err.className = "field__error"; err.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-warning"></use></svg><span></span>'; wrap.appendChild(err); }
    err.querySelector("span").textContent = msg;
  }
  function escapeHtml(s) { return (s || "").replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  /* ---------------- Step navigation ---------------- */
  function showStep(n) {
    state.step = n;
    $$(".booking-step", root).forEach(function (p) {
      var active = +p.getAttribute("data-step") === n;
      p.classList.toggle("is-active", active);
      if (active) p.removeAttribute("hidden"); else p.setAttribute("hidden", "");
    });
    $$(".step", root).forEach(function (s) {
      var sn = +s.getAttribute("data-step");
      s.classList.toggle("is-active", sn === n);
      s.classList.toggle("is-done", sn < n);
    });
    if (n === 2) renderCalendar();
    if (n === 3) renderSlots();
    if (n === 5) renderReview();
    backBtn.hidden = n === seq()[0];
    var q = isQuote();
    nextBtn.innerHTML = n === 5 ? ((q ? "Send quote request" : "Confirm booking") + ' <svg class="ic" aria-hidden="true"><use href="#i-check"></use></svg>')
      : (n === 4 ? (q ? "Review quote" : "Review booking") : 'Continue <svg class="ic" aria-hidden="true"><use href="#i-arrow-right"></use></svg>');
    refreshNav();
    if (inited) root.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
    inited = true;
  }

  function refreshNav() {
    var ok = true;
    if (state.step === 1) ok = !!state.service;
    else if (state.step === 2) ok = !!state.dateObj;
    else if (state.step === 3) ok = !!state.time;
    nextBtn.disabled = !ok;
  }

  backBtn.addEventListener("click", function () { var p = prevN(); if (p) showStep(p); });
  nextBtn.addEventListener("click", function () {
    if (state.step === 5) { submitBooking(); return; }
    if (state.step === 4) { if (!validateDetails()) return; showStep(5); return; }
    showStep(nextN());
  });

  /* ---------------- Submit ---------------- */
  function submitBooking() {
    var f = readForm();
    var q = isQuote();
    var lead = L.make({
      leadType: q ? "Quote" : "Booking",
      firstName: f.firstName, lastName: f.lastName, phone: f.phone, email: f.email,
      suburb: f.suburb, address: f.address, serviceNeeded: state.serviceName,
      propertyType: f.propertyType, urgency: f.urgency,
      preferredDate: q ? "" : (state.dateObj ? iso(state.dateObj) : ""),
      preferredTime: q ? "" : state.time, message: f.message, consent: f.consent,
      sourcePage: "book.html"
    });
    nextBtn.classList.add("is-loading");
    nextBtn.innerHTML = '<span class="spinner"></span> Sending';
    nextBtn.disabled = true; backBtn.disabled = true;
    var ep = (CFG.endpoints && (q ? CFG.endpoints.contact : CFG.endpoints.booking)) || null;
    (L.send ? L.send(lead, ep) : Promise.resolve()).then(function () {
      showSuccess(lead, q);
    });
  }

  function showSuccess(lead, q) {
    var panel = $(".booking__panel");
    var stepper = $(".stepper", root);
    var nav = $(".booking__nav", root);
    var modeBar = $(".booking-mode", root);
    if (stepper) stepper.style.display = "none";
    if (nav) nav.style.display = "none";
    if (modeBar) modeBar.style.display = "none";
    panel.innerHTML =
      '<div style="text-align:center;padding:1rem 0" role="status">' +
      '<span style="width:72px;height:72px;border-radius:50%;background:#e8f8ee;color:#1d7a44;display:grid;place-items:center;margin:0 auto 1.2rem"><svg class="ic" aria-hidden="true" style="width:38px;height:38px"><use href="#i-check"></use></svg></span>' +
      '<h2 class="booking-step__title">' + (q ? "Quote request sent" : "Booking confirmed") + '</h2>' +
      '<p class="booking-step__sub" style="max-width:46ch;margin:.6rem auto 1.4rem">Thanks ' + escapeHtml((lead.firstName || "").split(" ")[0] || "") + '. ' + (q ? "We've got your details and we'll get a quote back to you shortly. We've emailed you a copy." : "Your appointment is locked in and a licensed Coastline electrician will be there. We've emailed you the details.") + '</p>' +
      '<div class="booking-summary" style="max-width:420px;margin:0 auto;text-align:left">' +
      row("Service", lead.serviceNeeded) +
      (q ? "" : row("Preferred date", state.dateObj ? prettyDate(state.dateObj) : "") + row("Preferred time", lead.preferredTime)) +
      "</div>" +
      '<div class="btn-row" style="justify-content:center;margin-top:1.8rem">' +
      '<a class="btn btn--primary" href="tel:' + (CFG.phone_dial || CFG.phoneDial || "+61243211234") + '"><svg class="ic" aria-hidden="true"><use href="#i-phone"></use></svg> Call us</a>' +
      '<a class="btn btn--ghost" href="index.html">Back to home</a>' +
      "</div>" +
      '<p class="muted" style="font-size:.85rem;margin-top:1.2rem">A reference has been saved. We don\'t offer 24/7 callouts; for emergencies call 000 or Ausgrid 13 13 88.</p>' +
      "</div>";
    panel.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "center" });
  }

  function prefersReduced() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  /* ---------------- Photo placeholder filename hint ---------------- */
  var photo = $("#b-photo");
  if (photo) photo.addEventListener("change", function () {
    var n = this.files && this.files.length;
    $("#b-photo-name").textContent = n ? (n + " photo" + (n > 1 ? "s" : "") + " selected (demo only, not uploaded)") : "Photos help us quote accurately. Placeholder only in this demo, no file is uploaded.";
  });

  /* ---------------- Mode toggle: Book online vs Get a quote ---------------- */
  function applyMode(m) {
    state.mode = (m === "quote") ? "quote" : "book";
    state.dateObj = null; state.time = null;
    $$(".mode-btn", root).forEach(function (x) {
      var on = x.getAttribute("data-mode") === state.mode;
      x.classList.toggle("btn--primary", on);
      x.classList.toggle("btn--ghost", !on);
      x.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $$(".step", root).forEach(function (s) {
      var sn = +s.getAttribute("data-step");
      s.style.display = (state.mode === "quote" && (sn === 2 || sn === 3)) ? "none" : "";
    });
    showStep(1);
  }
  $$(".mode-btn", root).forEach(function (b) {
    b.addEventListener("click", function () { applyMode(b.getAttribute("data-mode")); });
  });

  // init
  applyMode("book");
})();
