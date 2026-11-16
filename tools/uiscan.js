/* UI scan: every page x several screen sizes, every step. Finds what a child would trip on:
   sideways scroll, things sticking out of the screen, tap targets under 36px, text under 13px,
   cut-off text, broken images, buttons without a name, script errors.
   Use (from any page of the site, e.g. tools/fit.html, in the browser console):
     window.SCAN_PAGES = ['index.html', 'lop4/bai14.html'];          // required
     window.SCAN_VP = [[1280, 720], [800, 1280], [375, 667]];        // optional
     var s = document.createElement('script'); s.src = '/tools/uiscan.js'; document.body.appendChild(s);
   then wait for window.scan.done and read window.scan.out (one line per page/size that has a finding).
   On the 1280x720 stage scaled down (e.g. 1024x768) every size shrinks, so small taps there are expected;
   tiny controls inside the software look-alikes (Scratch, PowerPoint, Paint) copy the real software. */
(async function () {
  var VP = (window.SCAN_VP || [[1280, 720], [800, 1280], [375, 667], [1024, 768]]);
  var PAGES = window.SCAN_PAGES;
  var S = window.scan = { done: false, out: [], errs: [] };
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function vis(el, w) {
    var cs = w.getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function clipped(el, w) { /* is el inside a scroll/clip container narrower than it */
    for (var p = el.parentElement; p && p.tagName !== 'BODY'; p = p.parentElement) {
      var ox = w.getComputedStyle(p).overflowX;
      if (ox !== 'visible') return true;
    }
    return false;
  }
  function check(w, d, vw, tag, rec) {
    var de = d.documentElement;
    if (de.scrollWidth > vw + 1) rec('hscroll+' + (de.scrollWidth - vw));
    var els = d.body.querySelectorAll('*');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (/^(SCRIPT|STYLE|svg|path|g|circle|rect|line|polygon|ellipse|text|tspan|defs|use|OPTION)$/i.test(el.tagName)) continue;
      if (el.closest('svg')) continue;
      if (!vis(el, w)) continue;
      var r = el.getBoundingClientRect(), cs = w.getComputedStyle(el);
      var name = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
      if (r.right > vw + 2 && !clipped(el, w)) rec('offright ' + name + ' +' + Math.round(r.right - vw));
      if (r.left < -2 && !clipped(el, w)) rec('offleft ' + name + ' ' + Math.round(r.left));
      var tap = el.matches('button,a[href],input:not([type=hidden]),select,textarea,[role=button],[onclick],summary,.quiz-opt,.sort-item,.sort-bin,.match-item,.pick-item,.fill-word,.fill-blank,.step-dot');
      if (tap && !el.disabled && (r.width < 36 || r.height < 36)) rec('smalltap ' + name + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' "' + (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 18) + '"');
      if (tap && !(el.textContent || '').trim() && !el.getAttribute('aria-label') && !el.getAttribute('title') && !el.querySelector('img[alt]') && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'SELECT') rec('nolabel ' + name);
      var own = false;
      for (var c = el.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && c.nodeValue.trim()) { own = true; break; }
      if (own) {
        var fs = parseFloat(cs.fontSize);
        if (fs < 13) rec('tinyfont ' + name + ' ' + fs + 'px "' + el.textContent.trim().slice(0, 18) + '"');
        if ((cs.overflow === 'hidden' || cs.overflowX === 'hidden') && el.scrollWidth > el.clientWidth + 1 && cs.textOverflow !== 'ellipsis') rec('cuttext ' + name + ' "' + el.textContent.trim().slice(0, 18) + '"');
      }
      if (el.tagName === 'IMG' && el.complete && !el.naturalWidth) rec('brokenimg ' + el.getAttribute('src'));
    }
  }
  for (var v = 0; v < VP.length; v++) {
    var vw = VP[v][0], vh = VP[v][1];
    for (var p = 0; p < PAGES.length; p++) {
      var f = document.createElement('iframe');
      f.style.cssText = 'width:' + vw + 'px;height:' + vh + 'px;border:0;position:absolute;left:0;top:0';
      document.body.appendChild(f);
      var ld = new Promise(function (r) { f.onload = r; });
      f.src = '/' + PAGES[p] + (PAGES[p].indexOf('?') < 0 ? '?' : '&') + 'scan=' + Date.now();
      await ld;
      var w = f.contentWindow, d = f.contentDocument, errs = [];
      w.addEventListener('error', function (e) { errs.push(e.message); });
      var oce = w.console.error; w.console.error = function () { errs.push([].join.call(arguments, ' ')); return oce.apply(this, arguments); };
      await wait(500);
      var found = {};
      function rec(s) { var k = s.replace(/ \d+x\d+.*| [+-]?\d+$/, ''); if (!found[k]) found[k] = s; }
      var dots = d.querySelectorAll('.step-dot'), n = Math.max(dots.length, 1);
      for (var s = 0; s < n; s++) {
        if (dots[s]) { dots[s].click(); await wait(60); }
        check(w, d, vw, s + 1, rec);
      }
      var keys = Object.keys(found);
      if (keys.length || errs.length) S.out.push(vw + 'x' + vh + ' ' + PAGES[p] + ' :: ' + keys.map(function (k) { return found[k]; }).join(' | ') + (errs.length ? ' || ERR ' + errs.slice(0, 3).join(' ; ') : ''));
      f.remove();
    }
  }
  S.done = true;
})();
