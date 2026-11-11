/* Pretend graphics program (like Microsoft Paint) for Bài 8A / 9A.
   Everything drawn is kept as shapes (oval, rectangle, triangle, line, pencil, text), so the lesson can check the work
   and the child can select, copy, paste, resize, flip and fill them. Works with mouse and finger. ES5 only.

   var p = PaintSim(host, cfg)
     cfg.shapes: [{ k: 'oval', x, y, w, h, s: '#f76707', f: '#f76707' }, { k: 'line', x1, y1, x2, y2, s }]  starting picture
     cfg.tasks: [{ text, ok: function (p) {} }], cfg.tasksHost, cfg.lesson, cfg.id, cfg.doneText, cfg.hello
     cfg.width / cfg.height: size of the drawing page (default 520 × 260)
   p: { shapes(), count(k), filled(k), colors(), used(op), saved(), color1(), color2(), tool(),
        add(shape), selectAll(), select(i), copy(), paste(), resize(k), flip(dir), fill(i, c), setColor(n, c), setTool(t), save(name) } */
(function () {
  var E = Core.el;
  var PALETTE = [['#000000', 'Đen'], ['#868e96', 'Xám'], ['#c92a2a', 'Đỏ thẫm'], ['#e03131', 'Đỏ'], ['#f76707', 'Cam'], ['#fab005', 'Vàng'],
    ['#2f9e44', 'Xanh lá'], ['#1c7ed6', 'Xanh dương'], ['#364fc7', 'Xanh đậm'], ['#7048e8', 'Tím'],
    ['#ffffff', 'Trắng'], ['#ced4da', 'Xám nhạt'], ['#a5673f', 'Nâu'], ['#f783ac', 'Hồng'], ['#ffd8a8', 'Cam nhạt'], ['#fff3bf', 'Vàng nhạt'],
    ['#b2f2bb', 'Xanh lá nhạt'], ['#a5d8ff', 'Xanh da trời'], ['#91a7ff', 'Xanh nhạt'], ['#d0bfff', 'Tím nhạt']];
  var TOOLS = [
    ['select', 'Select', 'Công cụ chọn: kéo chuột để chọn một phần hình'],
    ['pencil', 'Pencil', 'Bút chì: vẽ tự do'],
    ['fill', 'Fill', 'Tô màu: chạm vào bên trong hình'],
    ['text', 'Text', 'Viết chữ: chạm vào trang vẽ rồi gõ chữ'],
    ['eraser', 'Eraser', 'Tẩy: chạm vào hình muốn xoá']
  ];
  var SHAPES = [['line', 'Line', 'Đường thẳng'], ['oval', 'Oval', 'Hình ô van'], ['rect', 'Rectangle', 'Hình chữ nhật'], ['rrect', 'Rounded rectangle', 'Hình chữ nhật góc tròn'], ['tri', 'Triangle', 'Hình tam giác'], ['star', 'Star', 'Ngôi sao'], ['heart', 'Heart', 'Trái tim']];
  var SIZES = [2, 4, 7];
  function colorName(c) { for (var i = 0; i < PALETTE.length; i++) if (PALETTE[i][0] === c) return PALETTE[i][1]; return c; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function ico(k) {
    var st = 'fill="none" stroke="currentColor" stroke-width="2"';
    var m = {
      select: '<rect x="3" y="5" width="18" height="14" ' + st + ' stroke-dasharray="3 2"/>',
      pencil: '<path d="M4 20l3-1 11-11-2-2L5 17z" ' + st + '/>',
      fill: '<path d="M5 11l7-7 7 7-7 7z" ' + st + '/><path d="M19 15q2 3 0 4q-2-1 0-4z" fill="currentColor"/>',
      text: '<path d="M6 19L12 4l6 15M8.5 13h7" ' + st + '/>',
      eraser: '<path d="M4 15l8-8 7 7-5 5H8z" ' + st + '/><path d="M8 19h12" ' + st + '/>',
      line: '<path d="M4 19L20 5" ' + st + '/>',
      oval: '<ellipse cx="12" cy="12" rx="9" ry="7" ' + st + '/>',
      rect: '<rect x="3" y="6" width="18" height="12" ' + st + '/>',
      rrect: '<rect x="3" y="6" width="18" height="12" rx="4" ' + st + '/>',
      tri: '<path d="M12 4L21 19H3z" ' + st + '/>',
      star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" ' + st + '/>',
      heart: '<path d="M12 20S3 14 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5C21 14 12 20 12 20z" ' + st + '/>',
      copy: '<rect x="8" y="8" width="11" height="12" ' + st + '/><path d="M5 16V4h11" ' + st + '/>',
      paste: '<rect x="5" y="5" width="14" height="16" ' + st + '/><rect x="9" y="3" width="6" height="4" fill="currentColor"/>',
      cut: '<circle cx="7" cy="17" r="3" ' + st + '/><circle cx="17" cy="17" r="3" ' + st + '/><path d="M9 15L17 4M15 15L7 4" ' + st + '/>',
      resize: '<rect x="3" y="9" width="12" height="12" ' + st + '/><path d="M12 3h9v9M21 3l-8 8" ' + st + '/>',
      rotate: '<path d="M12 3v18" ' + st + ' stroke-dasharray="2 2"/><path d="M10 6L4 18h6zM14 6l6 12h-6z" ' + st + '/>',
      undo: '<path d="M9 8H4V3" ' + st + '/><path d="M4 8a8 8 0 1 1 2 8" ' + st + '/>',
      save: '<path d="M4 4h13l3 3v13H4z" ' + st + '/><rect x="8" y="4" width="7" height="5" fill="currentColor"/><rect x="7" y="13" width="10" height="6" ' + st + '/>',
      del: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13" ' + st + '/>'
    };
    return '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' + (m[k] || '') + '</svg>';
  }

  /* ---------- geometry ---------- */
  function bbox(o) {
    if (o.k === 'line') return { x: Math.min(o.x1, o.x2), y: Math.min(o.y1, o.y2), w: Math.abs(o.x2 - o.x1), h: Math.abs(o.y2 - o.y1) };
    if (o.k === 'pencil') { var a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (var i = 0; i < o.pts.length; i++) { a = Math.min(a, o.pts[i][0]); b = Math.min(b, o.pts[i][1]); c = Math.max(c, o.pts[i][0]); d = Math.max(d, o.pts[i][1]); } return { x: a, y: b, w: c - a, h: d - b }; }
    if (o.k === 'text') return { x: o.x, y: o.y - o.fs, w: Math.max(10, o.t.length * o.fs * 0.55), h: o.fs * 1.2 };
    return { x: o.x, y: o.y, w: o.w, h: o.h };
  }
  function mapPts(o, fx, fy) {
    if (o.k === 'line') { o.x1 = fx(o.x1); o.x2 = fx(o.x2); o.y1 = fy(o.y1); o.y2 = fy(o.y2); return; }
    if (o.k === 'pencil') { for (var i = 0; i < o.pts.length; i++) o.pts[i] = [fx(o.pts[i][0]), fy(o.pts[i][1])]; return; }
    if (o.k === 'text') { o.x = fx(o.x); o.y = fy(o.y); return; }
    var x1 = fx(o.x), x2 = fx(o.x + o.w), y1 = fy(o.y), y2 = fy(o.y + o.h);
    o.x = Math.min(x1, x2); o.w = Math.abs(x2 - x1); o.y = Math.min(y1, y2); o.h = Math.abs(y2 - y1);
  }
  function inside(o, px, py) {
    var b = bbox(o), pad = 4;
    if (o.k === 'line') {
      var dx = o.x2 - o.x1, dy = o.y2 - o.y1, L = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - o.x1) * dx + (py - o.y1) * dy) / L));
      var qx = o.x1 + t * dx - px, qy = o.y1 + t * dy - py; return qx * qx + qy * qy < 64;
    }
    if (o.k === 'oval') { var cx = b.x + b.w / 2, cy = b.y + b.h / 2, rx = b.w / 2 + pad, ry = b.h / 2 + pad; return ((px - cx) * (px - cx)) / (rx * rx) + ((py - cy) * (py - cy)) / (ry * ry) <= 1; }
    return px >= b.x - pad && px <= b.x + b.w + pad && py >= b.y - pad && py <= b.y + b.h + pad;
  }
  function shapeSVG(o, extra) {
    var s = o.s || '#000', f = o.f || 'none', sw = o.sw || 4, a = ' stroke="' + s + '" stroke-width="' + sw + '" fill="' + f + '" stroke-linejoin="round" stroke-linecap="round"' + (extra || '');
    var x = o.x, y = o.y, w = o.w, h = o.h;
    switch (o.k) {
      case 'oval': return '<ellipse cx="' + (x + w / 2) + '" cy="' + (y + h / 2) + '" rx="' + Math.max(1, w / 2) + '" ry="' + Math.max(1, h / 2) + '"' + a + '/>';
      case 'rect': return '<rect x="' + x + '" y="' + y + '" width="' + Math.max(1, w) + '" height="' + Math.max(1, h) + '"' + a + '/>';
      case 'rrect': return '<rect x="' + x + '" y="' + y + '" width="' + Math.max(1, w) + '" height="' + Math.max(1, h) + '" rx="' + Math.min(w, h) / 5 + '"' + a + '/>';
      case 'tri': return '<polygon points="' + (o.down ? [x + w / 2, y + h, x + w, y, x, y] : [x + w / 2, y, x + w, y + h, x, y + h]).join(',') + '"' + a + '/>';
      case 'star':
        var p = [], cx = x + w / 2, cy = y + h / 2;
        for (var i = 0; i < 10; i++) { var r = i % 2 ? 0.42 : 1, ang = -Math.PI / 2 + i * Math.PI / 5; p.push((cx + Math.cos(ang) * r * w / 2).toFixed(1) + ',' + (cy + Math.sin(ang) * r * h / 2).toFixed(1)); }
        return '<polygon points="' + p.join(' ') + '"' + a + '/>';
      case 'heart':
        return '<path d="M' + (x + w / 2) + ' ' + (y + h) + ' C' + (x - w * 0.1) + ' ' + (y + h * 0.55) + ' ' + (x + w * 0.05) + ' ' + (y - h * 0.15) + ' ' + (x + w / 2) + ' ' + (y + h * 0.25) +
          ' C' + (x + w * 0.95) + ' ' + (y - h * 0.15) + ' ' + (x + w * 1.1) + ' ' + (y + h * 0.55) + ' ' + (x + w / 2) + ' ' + (y + h) + 'z"' + a + '/>';
      case 'line': return '<line x1="' + o.x1 + '" y1="' + o.y1 + '" x2="' + o.x2 + '" y2="' + o.y2 + '" stroke="' + s + '" stroke-width="' + sw + '" stroke-linecap="round"' + (extra || '') + '/>';
      case 'pencil': var d = ''; for (var k = 0; k < o.pts.length; k++) d += (k ? 'L' : 'M') + o.pts[k][0].toFixed(1) + ' ' + o.pts[k][1].toFixed(1); return '<path d="' + d + '" stroke="' + s + '" stroke-width="' + sw + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>';
      case 'text': return '<text x="' + o.x + '" y="' + o.y + '" font-size="' + o.fs + '" font-family="Nunito, Arial, sans-serif" font-weight="800" fill="' + s + '"' + (extra || '') + '>' + esc(o.t) + '</text>';
    }
    return '';
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  window.PaintSim = function (host, cfg) {
    cfg = cfg || {};
    var W = cfg.width || 520, H = cfg.height || 230;
    var shapes = (cfg.shapes || []).map(clone), bg = cfg.bg || '#ffffff';
    var tool = 'select', c1 = '#000000', c2 = '#ffffff', which = 1, size = 1, sel = [], clip = null, used = {}, saved = null, hist = [];
    var awarded = false, taskDone = {}, menu = null, textBox = null;

    var app = E('div', 'pt');
    var title = E('div', 'pt-title', '<span class="pt-logo"></span><span class="pt-quick"></span><span>' + esc(cfg.fileName || 'Untitled') + ' - Paint</span>');
    var quick = title.childNodes[1];
    var ribbon = E('div', 'pt-ribbon');
    var stage = E('div', 'pt-stage');
    var svgWrap = E('div', 'pt-page');
    stage.appendChild(svgWrap);
    var status = E('div', 'pt-status');
    app.appendChild(title); app.appendChild(ribbon); app.appendChild(stage); app.appendChild(status);
    var fb = E('div', 'feedback');
    fb.setAttribute('aria-live', 'polite');
    host.appendChild(app);
    var tasksEl = null;
    if (cfg.tasks && cfg.tasksHost) { tasksEl = E('ul', 'checklist'); cfg.tasksHost.appendChild(tasksEl); }
    host.appendChild(fb);
    function say(t, type) { Core.say(fb, t, type || 'info'); }
    function mark(op) { used[op] = true; }
    function snap() { hist.push(JSON.stringify({ s: shapes, bg: bg })); if (hist.length > 40) hist.shift(); }

    /* ---------- ribbon ---------- */
    function btn(icon, label, title, fn, on, cls) {
      var b = E('button', 'pt-btn' + (on ? ' is-on' : '') + (cls ? ' ' + cls : ''), ico(icon) + (label ? '<span>' + label + '</span>' : ''));
      b.setAttribute('title', title); b.setAttribute('aria-label', label ? label + ' (' + title + ')' : title);
      Core.on(b, function (ev) { ev.stopPropagation(); fn(b); });
      return b;
    }
    function grp(name, kids, cls) {
      var g = E('div', 'pt-group' + (cls ? ' ' + cls : ''));
      var inn = E('div', 'pt-gin');
      for (var i = 0; i < kids.length; i++) inn.appendChild(kids[i]);
      g.appendChild(inn); g.appendChild(E('div', 'pt-gname', name));
      return g;
    }
    function renderRibbon() {
      ribbon.innerHTML = '';
      ribbon.appendChild(grp('Clipboard', [
        btn('paste', 'Paste', 'Dán phần đã sao chép', function () { paste(); }),
        btn('copy', 'Copy', 'Sao chép phần đang chọn', function () { copy(); }),
        btn('cut', 'Cut', 'Cắt phần đang chọn', function () { cut(); })
      ], 'pt-clip'));
      ribbon.appendChild(grp('Image', [
        btn('select', 'Select', TOOLS[0][2], function () { setTool('select'); }, tool === 'select'),
        btn('resize', 'Resize', 'Thay đổi kích thước phần đang chọn', function (b) { openResize(b); }),
        btn('rotate', 'Rotate ▾', 'Quay, lật phần đang chọn', function (b) { openRotate(b); })
      ]));
      var tl = [];
      for (var i = 1; i < TOOLS.length; i++) (function (t) { tl.push(btn(t[0], '', t[2], function () { setTool(t[0]); }, tool === t[0], 'pt-sq')); })(TOOLS[i]);
      ribbon.appendChild(grp('Tools', tl, 'pt-tools'));
      var sh = [];
      for (i = 0; i < SHAPES.length; i++) (function (t) { sh.push(btn(t[0], '', t[1] + ': ' + t[2], function () { setTool(t[0]); }, tool === t[0], 'pt-sq')); })(SHAPES[i]);
      ribbon.appendChild(grp('Shapes', sh, 'pt-shapes'));
      var sz = [];
      for (i = 0; i < SIZES.length; i++) (function (k) {
        var b = E('button', 'pt-size' + (size === k ? ' is-on' : ''), '<span style="height:' + SIZES[k] + 'px"></span>');
        b.setAttribute('title', 'Nét ' + (k === 0 ? 'mảnh' : k === 1 ? 'vừa' : 'đậm')); b.setAttribute('aria-label', b.getAttribute('title'));
        Core.on(b, function (ev) { ev.stopPropagation(); size = k; renderRibbon(); });
        sz.push(b);
      })(i);
      ribbon.appendChild(grp('Size', sz, 'pt-sizes'));
      var c = [];
      [1, 2].forEach(function (n) {
        var b = E('button', 'pt-cbig' + (which === n ? ' is-on' : ''), '<span class="pt-sw" style="background:' + (n === 1 ? c1 : c2) + '"></span><span>Color ' + n + '</span>');
        b.setAttribute('title', n === 1 ? 'Màu 1: màu nét vẽ, tô màu, chữ' : 'Màu 2: màu phụ');
        Core.on(b, function (ev) { ev.stopPropagation(); which = n; renderRibbon(); say('Đang chọn <b>Color ' + n + '</b>. Chạm một ô màu để đặt màu cho nó.'); });
        c.push(b);
      });
      var pal = E('div', 'pt-pal');
      for (i = 0; i < PALETTE.length; i++) (function (p) {
        var b = E('button', 'pt-cell', '');
        b.style.background = p[0]; b.setAttribute('title', p[1]); b.setAttribute('aria-label', 'Màu ' + p[1]);
        Core.on(b, function (ev) { ev.stopPropagation(); setColor(which, p[0]); });
        pal.appendChild(b);
      })(PALETTE[i]);
      c.push(pal);
      ribbon.appendChild(grp('Colors', c, 'pt-colors'));
      /* like Paint: Save and Undo sit in the quick access bar on the title line */
      quick.innerHTML = '';
      quick.appendChild(btn('save', 'Save', 'Lưu tệp', function (b) { openSave(b); }, false, 'pt-q'));
      quick.appendChild(btn('undo', 'Undo', 'Huỷ thao tác vừa làm', function () { undo(); }, false, 'pt-q'));
    }
    function closeMenu() { if (menu && menu.parentNode) menu.parentNode.removeChild(menu); menu = null; }
    function popAt(anchor) { menu.style.left = Math.max(4, anchor.offsetLeft) + 'px'; menu.style.top = (anchor.offsetTop + anchor.offsetHeight + 2) + 'px'; app.appendChild(menu); }
    function openRotate(anchor) {
      closeMenu();
      if (!sel.length) { say('Em dùng công cụ <b>Select</b> chọn phần hình cần quay, lật trước nha.'); return; }
      menu = E('div', 'pt-menu');
      [['h', 'Flip horizontal (lật ngang)'], ['v', 'Flip vertical (lật dọc)']].forEach(function (m) {
        var b = E('button', 'pt-mi', m[1]); Core.on(b, function (ev) { ev.stopPropagation(); closeMenu(); flip(m[0]); }); menu.appendChild(b);
      });
      popAt(anchor);
    }
    function openResize(anchor) {
      closeMenu();
      if (!sel.length) { say('Em dùng công cụ <b>Select</b> chọn phần hình cần đổi kích thước trước nha.'); return; }
      menu = E('div', 'pt-menu');
      menu.appendChild(E('div', 'pt-mt', 'Resize: đổi thành bao nhiêu phần trăm?'));
      [50, 75, 125, 150].forEach(function (p) {
        var b = E('button', 'pt-mi', p + '%' + (p < 100 ? ' (nhỏ hơn)' : ' (to hơn)')); Core.on(b, function (ev) { ev.stopPropagation(); closeMenu(); resize(p / 100); }); menu.appendChild(b);
      });
      popAt(anchor);
    }
    function openSave() {
      closeMenu();
      menu = E('div', 'pt-menu pt-save');
      menu.appendChild(E('div', 'pt-mt', 'Save As – đặt tên tệp'));
      var inp = E('input', 'pt-name'); inp.value = saved || cfg.fileName || ''; inp.setAttribute('aria-label', 'Tên tệp');
      var ok = E('button', 'btn btn-small btn-primary', 'Save');
      function go() { var v = inp.value.replace(/^\s+|\s+$/g, ''); if (!v) { inp.focus(); return; } saved = v; mark('save'); closeMenu(); title.lastChild.textContent = v + ' - Paint'; say('Đã lưu tệp <b>' + esc(v) + '</b>.', 'good'); check(); }
      Core.on(ok, function (ev) { ev.stopPropagation(); go(); });
      inp.addEventListener('keydown', function (e) { if (e.keyCode === 13) go(); });
      menu.appendChild(inp); menu.appendChild(ok);
      menu.style.left = '8px'; menu.style.top = (title.offsetTop + title.offsetHeight) + 'px';
      app.appendChild(menu);
      setTimeout(function () { try { inp.focus(); } catch (e) {} }, 0);
    }
    app.addEventListener('click', function (ev) {
      var t = ev.target; while (t && t !== app) { if (t === menu) return; t = t.parentNode; }
      closeMenu();
    });

    /* ---------- actions ---------- */
    function setTool(t) {
      if (textBox) commitText();
      tool = t; if (t !== 'select') sel = [];
      closeMenu(); render(); renderRibbon();
      var tip = { select: 'Kéo chuột (hoặc ngón tay) bao quanh phần hình muốn chọn. Chạm một hình để chọn riêng nó.', pencil: 'Kéo để vẽ tự do bằng <b>màu 1</b>.', fill: 'Chạm vào bên trong một hình để tô bằng <b>màu 1</b>. Chạm vào chỗ trống để tô nền.', text: 'Chạm vào trang vẽ, gõ chữ rồi nhấn <b>Enter</b>.', eraser: 'Chạm vào hình muốn xoá.' };
      say(tip[t] || 'Kéo trên trang vẽ để vẽ hình <b>' + t + '</b> bằng màu 1.');
      mark('tool-' + t); check();
    }
    function setColor(n, c) { if (n === 1) c1 = c; else c2 = c; mark('color' + n); renderRibbon(); say('Màu ' + n + ' giờ là <b>' + colorName(c) + '</b>.', 'good'); check(); }
    function selBox() {
      if (!sel.length) return null;
      var a = 1e9, b = 1e9, c = -1e9, d = -1e9;
      for (var i = 0; i < sel.length; i++) { var x = bbox(shapes[sel[i]]); a = Math.min(a, x.x); b = Math.min(b, x.y); c = Math.max(c, x.x + x.w); d = Math.max(d, x.y + x.h); }
      return { x: a, y: b, w: c - a, h: d - b };
    }
    function copy() { if (!sel.length) { say('Chưa chọn gì để sao chép. Dùng <b>Select</b> chọn phần hình trước nha.'); return; } clip = sel.map(function (i) { return clone(shapes[i]); }); mark('copy'); say('Đã <b>Copy</b>. Bấm <b>Paste</b> để dán ra bản mới.', 'good'); check(); }
    function cut() { if (!sel.length) { say('Chưa chọn gì để cắt.'); return; } copy(); snap(); removeSel(); mark('cut'); render(); check(); }
    function removeSel() { sel.sort(function (a, b) { return b - a; }); for (var i = 0; i < sel.length; i++) shapes.splice(sel[i], 1); sel = []; }
    function paste() {
      if (!clip) { say('Chưa có gì để dán. Chọn phần hình rồi bấm <b>Copy</b> trước.'); return; }
      snap(); tool = 'select'; sel = [];
      for (var i = 0; i < clip.length; i++) { var o = clone(clip[i]); mapPts(o, function (x) { return x + 30; }, function (y) { return y + 14; }); shapes.push(o); sel.push(shapes.length - 1); }
      mark('paste'); say('Đã <b>Paste</b> ra bản mới (đang được chọn). Kéo nó tới chỗ em muốn.', 'good');
      renderRibbon(); render(); check();
    }
    function resize(k) {
      if (!sel.length) return; snap();
      var b = selBox();
      for (var i = 0; i < sel.length; i++) { var o = shapes[sel[i]]; mapPts(o, function (x) { return b.x + (x - b.x) * k; }, function (y) { return b.y + (y - b.y) * k; }); if (o.k === 'text') o.fs = Math.max(8, o.fs * k); }
      mark('resize'); say('Đã đổi kích thước thành <b>' + Math.round(k * 100) + '%</b>.', 'good'); render(); check();
    }
    function flip(dir) {
      if (!sel.length) return; snap();
      var b = selBox(), cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      for (var i = 0; i < sel.length; i++) {
        var o = shapes[sel[i]];
        if (dir === 'h') mapPts(o, function (x) { return 2 * cx - x; }, function (y) { return y; });
        else { mapPts(o, function (x) { return x; }, function (y) { return 2 * cy - y; }); if (o.k === 'tri') o.down = !o.down; }
      }
      mark('flip' + dir); say(dir === 'h' ? 'Đã <b>lật ngang</b> (Flip horizontal).' : 'Đã <b>lật dọc</b> (Flip vertical).', 'good'); render(); check();
    }
    function undo() { if (!hist.length) { say('Không còn gì để huỷ.'); return; } var h = JSON.parse(hist.pop()); shapes = h.s; bg = h.bg; sel = []; render(); say('Đã huỷ thao tác vừa làm.'); check(); }
    function hitTop(x, y) { for (var i = shapes.length - 1; i >= 0; i--) if (inside(shapes[i], x, y)) return i; return -1; }

    /* ---------- drawing page ---------- */
    var svg, drag = null, preview = null;
    function render() {
      var h = '<svg class="pt-svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" xmlns="http://www.w3.org/2000/svg"><rect width="' + W + '" height="' + H + '" fill="' + bg + '"/>';
      for (var i = 0; i < shapes.length; i++) h += shapeSVG(shapes[i]);
      if (preview) h += shapeSVG(preview, ' opacity="0.8"');
      var b = selBox();
      if (b) h += '<rect x="' + (b.x - 4) + '" y="' + (b.y - 4) + '" width="' + (b.w + 8) + '" height="' + (b.h + 8) + '" fill="rgba(28,126,214,0.06)" stroke="#1c7ed6" stroke-width="1.5" stroke-dasharray="5 4"/>' +
        '<rect x="' + (b.x + b.w) + '" y="' + (b.y + b.h) + '" width="12" height="12" fill="#fff" stroke="#1c7ed6" stroke-width="2"/>';
      if (drag && drag.mode === 'box') h += '<rect x="' + Math.min(drag.x0, drag.x) + '" y="' + Math.min(drag.y0, drag.y) + '" width="' + Math.abs(drag.x - drag.x0) + '" height="' + Math.abs(drag.y - drag.y0) + '" fill="none" stroke="#1c7ed6" stroke-dasharray="4 3"/>';
      svgWrap.innerHTML = h + '</svg>';
      svg = svgWrap.firstChild;
      if (textBox) svgWrap.appendChild(textBox);
      status.innerHTML = '<span>Công cụ: <b>' + toolName(tool) + '</b></span><span>Màu 1: <b>' + colorName(c1) + '</b> · Màu 2: <b>' + colorName(c2) + '</b></span><span>' + (sel.length ? 'Đang chọn ' + sel.length + ' hình' : W + ' × ' + H + 'px') + '</span>';
      renderTasks();
    }
    function toolName(t) { var all = TOOLS.concat(SHAPES); for (var i = 0; i < all.length; i++) if (all[i][0] === t) return all[i][1]; return t; }
    function pt(cx, cy) { var r = svg.getBoundingClientRect(); return { x: (cx - r.left) * W / r.width, y: (cy - r.top) * H / r.height }; }

    function down(cx, cy) {
      if (!svg) return;
      closeMenu();
      var p = pt(cx, cy);
      if (textBox) { commitText(); return; }
      if (tool === 'fill') {
        var i = hitTop(p.x, p.y); snap();
        if (i < 0) { bg = c1; say('Đã tô <b>nền</b> trang vẽ màu ' + colorName(c1) + '.', 'good'); }
        else { var o = shapes[i]; if (o.k === 'line' || o.k === 'pencil' || o.k === 'text') o.s = c1; else o.f = c1; say('Đã tô màu <b>' + colorName(c1) + '</b>.', 'good'); }
        mark('fill'); render(); check(); return;
      }
      if (tool === 'eraser') { var j = hitTop(p.x, p.y); if (j > -1) { snap(); shapes.splice(j, 1); mark('erase'); render(); check(); } return; }
      if (tool === 'text') { openText(p); return; }
      if (tool === 'select') {
        var b = selBox();
        if (b && p.x >= b.x + b.w - 4 && p.x <= b.x + b.w + 16 && p.y >= b.y + b.h - 4 && p.y <= b.y + b.h + 16) { snap(); drag = { mode: 'scale', b: b, x0: p.x, y0: p.y, orig: sel.map(function (i) { return clone(shapes[i]); }) }; return; }
        if (b && p.x >= b.x - 4 && p.x <= b.x + b.w + 4 && p.y >= b.y - 4 && p.y <= b.y + b.h + 4) { snap(); drag = { mode: 'move', x0: p.x, y0: p.y, orig: sel.map(function (i) { return clone(shapes[i]); }) }; return; }
        drag = { mode: 'box', x0: p.x, y0: p.y, x: p.x, y: p.y }; return;
      }
      if (tool === 'pencil') { drag = { mode: 'pencil' }; preview = { k: 'pencil', pts: [[p.x, p.y]], s: c1, sw: SIZES[size] }; return; }
      drag = { mode: 'shape', x0: p.x, y0: p.y };
    }
    function move(cx, cy) {
      if (!drag) return;
      var p = pt(cx, cy);
      if (drag.mode === 'box') { drag.x = p.x; drag.y = p.y; render(); return; }
      if (drag.mode === 'move' || drag.mode === 'scale') {
        var dx = p.x - drag.x0, dy = p.y - drag.y0;
        for (var i = 0; i < sel.length; i++) {
          var o = clone(drag.orig[i]);
          if (drag.mode === 'move') mapPts(o, function (x) { return x + dx; }, function (y) { return y + dy; });
          else { var b = drag.b, k = Math.max(0.2, Math.min(3, ((b.w + dx) / (b.w || 1) + (b.h + dy) / (b.h || 1)) / 2)); mapPts(o, function (x) { return b.x + (x - b.x) * k; }, function (y) { return b.y + (y - b.y) * k; }); if (o.k === 'text') o.fs = Math.max(8, drag.orig[i].fs * k); drag.k = k; }
          shapes[sel[i]] = o;
        }
        drag.moved = true; render(); return;
      }
      if (drag.mode === 'pencil') { preview.pts.push([p.x, p.y]); render(); return; }
      preview = makeShape(drag.x0, drag.y0, p.x, p.y); render();
    }
    function makeShape(x0, y0, x1, y1) {
      var sw = SIZES[size];
      if (tool === 'line') return { k: 'line', x1: x0, y1: y0, x2: x1, y2: y1, s: c1, sw: sw };
      return { k: tool, x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), h: Math.abs(y1 - y0), s: c1, f: null, sw: sw };
    }
    function up() {
      if (!drag) return;
      var d = drag; drag = null;
      if (d.mode === 'box') {
        var x1 = Math.min(d.x0, d.x), y1 = Math.min(d.y0, d.y), x2 = Math.max(d.x0, d.x), y2 = Math.max(d.y0, d.y);
        sel = [];
        if (x2 - x1 < 6 && y2 - y1 < 6) { var i = hitTop(d.x0, d.y0); if (i > -1) sel = [i]; }
        else for (var k = 0; k < shapes.length; k++) { var b = bbox(shapes[k]), cx = b.x + b.w / 2, cy = b.y + b.h / 2; if (cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2) sel.push(k); }
        if (sel.length) { mark('select'); say('Đã chọn <b>' + sel.length + '</b> hình. Giờ em có thể Copy, Resize, Rotate, hoặc kéo để di chuyển.', 'good'); }
        render(); check(); return;
      }
      if (d.mode === 'move') { if (d.moved) { mark('move'); check(); } else hist.pop(); render(); return; }
      if (d.mode === 'scale') { if (d.moved) { mark('resize'); check(); } else hist.pop(); render(); return; }
      if (d.mode === 'pencil') { if (preview.pts.length > 1) { snap(); shapes.push(preview); mark('draw-pencil'); } preview = null; render(); check(); return; }
      if (preview && (bbox(preview).w > 4 || bbox(preview).h > 4)) { snap(); shapes.push(preview); mark('draw-' + preview.k); say('Đã vẽ. Muốn tô màu bên trong, chọn công cụ <b>Fill</b>.', 'good'); }
      preview = null; render(); check();
    }
    function openText(p) {
      textBox = E('input', 'pt-textin');
      textBox.setAttribute('aria-label', 'Gõ chữ');
      textBox._p = p;
      var r = 100 / W;
      textBox.style.left = (p.x * r) + '%'; textBox.style.top = Math.max(0, (p.y - 24) * 100 / H) + '%';
      textBox.addEventListener('keydown', function (e) { if (e.keyCode === 13) { e.preventDefault(); commitText(); } if (e.keyCode === 27) { textBox = null; render(); } });
      textBox.addEventListener('mousedown', function (e) { e.stopPropagation(); });
      textBox.addEventListener('touchstart', function (e) { e.stopPropagation(); }, false);
      render();
      if (window.Telex) Telex.attach(textBox, { mode: function () { return 'telex'; } });
      setTimeout(function () { try { textBox.focus(); } catch (e) {} }, 0);
    }
    function commitText() {
      var tb = textBox; textBox = null;
      var v = tb && tb.value.replace(/^\s+|\s+$/g, '');
      if (v) { snap(); shapes.push({ k: 'text', x: tb._p.x, y: tb._p.y, t: v, fs: [16, 22, 30][size], s: c1 }); mark('text'); say('Đã viết chữ.', 'good'); }
      render(); check();
    }
    svgWrap.addEventListener('mousedown', function (e) { if (e.target.className === 'pt-textin') return; down(e.clientX, e.clientY); e.preventDefault(); });
    document.addEventListener('mousemove', function (e) { if (drag) move(e.clientX, e.clientY); });
    document.addEventListener('mouseup', function () { up(); });
    svgWrap.addEventListener('touchstart', function (e) { if (e.target.className === 'pt-textin') return; var t = e.touches[0]; if (t) { down(t.clientX, t.clientY); e.preventDefault(); } }, false);
    svgWrap.addEventListener('touchmove', function (e) { var t = e.touches[0]; if (t && drag) { move(t.clientX, t.clientY); e.preventDefault(); } }, false);
    svgWrap.addEventListener('touchend', function () { up(); }, false);

    /* ---------- tasks ---------- */
    function renderTasks() {
      if (!tasksEl) return;
      tasksEl.innerHTML = '';
      for (var i = 0; i < cfg.tasks.length; i++) { var ok = !!taskDone[i]; tasksEl.appendChild(E('li', ok ? 'done' : '', '<span class="ico">' + (ok ? Icons.check : Icons.starEmpty) + '</span><span>' + cfg.tasks[i].text + '</span>')); }
    }
    function check() {
      if (!cfg.tasks) return;
      var all = true;
      for (var i = 0; i < cfg.tasks.length; i++) {
        if (!taskDone[i] && all) { var ok = false; try { ok = !!cfg.tasks[i].ok(api); } catch (e) {} if (ok) taskDone[i] = true; }
        if (!taskDone[i]) all = false;
      }
      renderTasks();
      if (all && !awarded) { awarded = true; Core.celebrate(fb, cfg.lesson, cfg.id, cfg.doneText || 'Em làm xong tất cả nhiệm vụ rồi!'); }
    }

    var api = {
      shapes: function () { return shapes; },
      count: function (k) { var n = 0; for (var i = 0; i < shapes.length; i++) if (!k || shapes[i].k === k) n++; return n; },
      filled: function (k) { var n = 0; for (var i = 0; i < shapes.length; i++) if ((!k || shapes[i].k === k) && shapes[i].f) n++; return n; },
      fills: function (k) { var o = {}, n = 0; for (var i = 0; i < shapes.length; i++) if ((!k || shapes[i].k === k) && shapes[i].f && !o[shapes[i].f]) { o[shapes[i].f] = 1; n++; } return n; },
      used: function (op) { return !!used[op]; },
      saved: function () { return saved; },
      bg: function () { return bg; },
      color1: function () { return c1; }, color2: function () { return c2; }, tool: function () { return tool; },
      add: function (o) { shapes.push(clone(o)); mark('draw-' + o.k); render(); check(); },
      selectAll: function () { tool = 'select'; sel = []; for (var i = 0; i < shapes.length; i++) sel.push(i); mark('select'); render(); check(); },
      select: function (list) { tool = 'select'; sel = list.slice(); mark('select'); render(); check(); },
      copy: copy, paste: paste, resize: resize, flip: flip,
      move: function (dx, dy) { for (var i = 0; i < sel.length; i++) mapPts(shapes[sel[i]], function (x) { return x + dx; }, function (y) { return y + dy; }); mark('move'); render(); check(); },
      box: function (list) { var keep = sel; sel = list; var b = selBox(); sel = keep; return b; },
      texts: function () { var o = []; for (var i = 0; i < shapes.length; i++) if (shapes[i].k === 'text') o.push(shapes[i].t); return o; },
      fill: function (i, c) { var o = shapes[i]; if (o.k === 'line' || o.k === 'text') o.s = c; else o.f = c; mark('fill'); render(); check(); },
      fillBg: function (c) { bg = c; mark('fill'); render(); check(); },
      setColor: setColor, setTool: setTool,
      save: function (n) { saved = n; mark('save'); check(); }
    };
    renderRibbon();
    render();
    say(cfg.hello || 'Chọn một công cụ ở trên rồi vẽ trên trang vẽ màu trắng.');
    return api;
  };

  /* small picture of a drawing, for questions (no tools) */
  PaintSim.svg = function (shapes, w, h, bg) {
    var s = '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg"><rect width="' + w + '" height="' + h + '" fill="' + (bg || '#fff') + '"/>';
    for (var i = 0; i < shapes.length; i++) s += shapeSVG(shapes[i]);
    return s + '</svg>';
  };
  PaintSim.icon = ico;
})();
