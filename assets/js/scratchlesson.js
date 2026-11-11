/* Helpers shared by the Scratch lesson pages: static block pictures and checks. ES5 only.
   Needs core.js, icons.js, scratch.js. */
(function () {
  var SL = {};
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function isBody(x) { return Object.prototype.toString.call(x) === '[object Array]' && (x.length === 0 || Object.prototype.toString.call(x[0]) === '[object Array]'); }
  function isSpec(x) { return Object.prototype.toString.call(x) === '[object Array]' && typeof x[0] === 'string'; }
  var OPT = { edge: 'cạnh', mouse: 'con trỏ chuột', lr: 'trái - phải', none: 'không xoay', all: 'xoay tròn', space: 'phím trắng', up: 'mũi tên lên', down: 'mũi tên xuống', left: 'mũi tên trái', right: 'mũi tên phải',
    meo: 'Meo', gau: 'Gâu gâu', pop: 'Bụp', trong: 'Trống', chuong: 'Chuông', '#1c7ed6': 'xanh dương', '#e03131': 'đỏ', '#2f9e44': 'xanh lá', '#f08c00': 'cam', '#7048e8': 'tím', '#212529': 'đen' };

  SL.icons = function () {
    var els = document.querySelectorAll('[data-icon]');
    for (var i = 0; i < els.length; i++) els[i].innerHTML = Icons[els[i].getAttribute('data-icon')] || '';
    var b = document.getElementById('brand-ico');
    if (b) b.innerHTML = Icons.robot;
  };

  /* one block as static HTML (reporters and C bodies included) */
  SL.blockHTML = function (spec, inner) {
    var B = Scratch.BLOCKS, C = Scratch.CATS, def = B[spec[0]];
    if (!def) return esc(spec[0]);
    var vals = [], bodies = [];
    for (var i = 1; i < spec.length; i++) { if (isBody(spec[i])) bodies.push(spec[i]); else vals.push(spec[i]); }
    var parts = def.vi.split(/(%\d|%F)/), head = '';
    for (var p = 0; p < parts.length; p++) {
      var t = parts[p];
      if (t === '%F') head += '<span class="sc-flagico">' + Icons.flag + '</span>';
      else if (/^%\d$/.test(t)) {
        var k = parseInt(t.charAt(1), 10) - 1, a = def.a[k], v = k < vals.length ? vals[k] : (a.t === 'b' ? null : a.d);
        if (isSpec(v)) head += SL.blockHTML(v, true);
        else if (a.t === 'b') head += '<span class="sc-slot sc-b"></span>';
        else if (a.t === 'm' || a.t === 'v') head += '<span class="sc-slot sc-m">' + esc(OPT[v] || v) + ' ▾</span>';
        else head += '<span class="sc-slot">' + esc(v) + '</span>';
      } else if (t) head += '<span>' + esc(t) + '</span>';
    }
    var color = C[def.cat].c;
    if (inner) return '<span class="sc-nest sc-' + def.s + '" style="background:' + color + '">' + head + '</span>';
    var html = '<div class="sc-blk sc-' + def.s + '" style="background:' + color + '"><div class="sc-head">' + head + '</div>';
    if (def.s === 'c' || def.s === 'c2') {
      html += '<div class="sc-inner">' + SL.listHTML(bodies[0] || []) + '</div>';
      if (def.s === 'c2') html += '<div class="sc-head sc-else">' + esc(def.vi2) + '</div><div class="sc-inner">' + SL.listHTML(bodies[1] || []) + '</div>';
      html += '<div class="sc-foot"></div>';
    }
    return html + '</div>';
  };
  SL.listHTML = function (list) {
    var h = '<div class="sc-list sc-static">';
    for (var i = 0; i < list.length; i++) h += SL.blockHTML(list[i]);
    return h + '</div>';
  };
  SL.scriptHTML = function (script) { return '<div class="sc-script sc-static">' + SL.listHTML(script) + '</div>'; };

  /* do the pen lines contain n connected lines that close into a polygon (each about len long)? */
  SL.polygon = function (segs, n, len) {
    var s = [];
    for (var i = 0; i < segs.length; i++) {
      var g = segs[i], l = Math.sqrt(Math.pow(g.x2 - g.x1, 2) + Math.pow(g.y2 - g.y1, 2));
      if (l > 0.5) s.push({ x1: g.x1, y1: g.y1, x2: g.x2, y2: g.y2, l: l });
    }
    function near(ax, ay, bx, by) { return Math.abs(ax - bx) < 2.5 && Math.abs(ay - by) < 2.5; }
    for (var st = 0; st + n <= s.length; st++) {
      var ok = true, L0 = s[st].l;
      for (var k = 0; k < n && ok; k++) {
        var g2 = s[st + k];
        if (len && Math.abs(g2.l - len) > 3) ok = false;
        if (!len && Math.abs(g2.l - L0) > 3) ok = false;
        if (k > 0 && !near(s[st + k - 1].x2, s[st + k - 1].y2, g2.x1, g2.y1)) ok = false;
      }
      if (ok && near(s[st].x1, s[st].y1, s[st + n - 1].x2, s[st + n - 1].y2)) return true;
    }
    return false;
  };
  /* a rectangle: 4 connected lines closing, opposite sides equal */
  SL.rectangle = function (segs) {
    var s = [];
    for (var i = 0; i < segs.length; i++) { var g = segs[i], l = Math.sqrt(Math.pow(g.x2 - g.x1, 2) + Math.pow(g.y2 - g.y1, 2)); if (l > 0.5) s.push({ x1: g.x1, y1: g.y1, x2: g.x2, y2: g.y2, l: l }); }
    for (var st = 0; st + 4 <= s.length; st++) {
      var a = s.slice(st, st + 4), ok = Math.abs(a[0].l - a[2].l) < 3 && Math.abs(a[1].l - a[3].l) < 3;
      for (var k = 1; k < 4 && ok; k++) if (Math.abs(a[k - 1].x2 - a[k].x1) > 2.5 || Math.abs(a[k - 1].y2 - a[k].y1) > 2.5) ok = false;
      if (ok && Math.abs(a[0].x1 - a[3].x2) < 2.5 && Math.abs(a[0].y1 - a[3].y2) < 2.5) return true;
    }
    return false;
  };
  SL.savedIn = function (api, folder, name) { var s = api.saved(); return !!s && s.folder === folder && Core.plain(s.name) === Core.plain(name); };
  window.ScratchLesson = SL;
})();
