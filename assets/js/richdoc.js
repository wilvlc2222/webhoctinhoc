/* Pretend word processor with character formatting (like Word, Home > Font group) and picture layout.
   Text is made of lines; each line is one or more "runs" (pieces of text). Tapping a run selects it;
   "Ctrl" (chọn thêm) lets the child add more runs; "Select all" picks everything.
   ES5 only. Needs core.js, icons.js, art.js.

   var doc = RichDoc(host, cfg)
     cfg.lines: [ 'Một dòng', [{ t: 'Một.', id: 'k1' }, { t: ' Yêu Tổ quốc' }], { t: 'Dòng có kiểu riêng', id: 'title', s: 16 } ]
     cfg.base:  { f: 'Calibri', s: 12, c: '#000000' }   starting style of every run
     cfg.pic:   { art: 'icecream', layout: 'inline' | 'square' | 'topbottom', side: 'left' | 'right' }
     cfg.gallery: ['temple', 'museum']  Insert > Pictures offers these (no pic yet, or replace)
     cfg.tasks: [{ text, ok: function (doc) {} }], cfg.tasksHost, cfg.lesson, cfg.id, cfg.doneText, cfg.height
   doc: { style(id), runs(), pic(), select(ids), apply(prop, value), layout(l), side(s), insert(art), selectAll() } */
(function () {
  var E = Core.el;
  var FONTS = ['Calibri', 'Arial', 'Tahoma', 'Times New Roman', 'Verdana'];
  var SIZES = [10, 11, 12, 13, 14, 15, 16, 18, 20, 24];
  var COLORS = [['Black', 'Đen', '#000000'], ['Red', 'Đỏ', '#e03131'], ['Orange', 'Cam', '#f76707'], ['Green', 'Xanh lá', '#2f9e44'],
    ['Blue', 'Xanh dương', '#1c7ed6'], ['Purple', 'Tím', '#7048e8']];
  var LAYOUTS = [['inline', 'In Line with Text', 'Hình cùng hàng với chữ'], ['square', 'Square', 'Chữ chạy quanh hình'], ['topbottom', 'Top and Bottom', 'Chữ ở trên và dưới hình']];
  function colorName(c) { for (var i = 0; i < COLORS.length; i++) if (COLORS[i][2] === c) return COLORS[i][0]; return c; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function layIcon(l) {
    var lines = '<path d="M3 4h18M3 20h18" stroke="currentColor" stroke-width="2"/>';
    if (l === 'square') lines = '<path d="M3 4h18M3 9h6M3 14h6M3 19h18" stroke="currentColor" stroke-width="2"/><rect x="11" y="7" width="10" height="9" fill="currentColor"/>';
    else if (l === 'topbottom') lines = '<path d="M3 3h18M3 21h18" stroke="currentColor" stroke-width="2"/><rect x="7" y="7" width="10" height="10" fill="currentColor"/>';
    else lines = '<path d="M3 4h18M13 17h8M3 21h18" stroke="currentColor" stroke-width="2"/><path d="M3 18a4 4 0 0 1 8 0" fill="currentColor"/>';
    return '<svg viewBox="0 0 24 24" width="22" height="22">' + lines + '</svg>';
  }

  window.RichDoc = function (host, cfg) {
    cfg = cfg || {};
    var base = cfg.base || { f: 'Calibri', s: 12, c: '#000000' };
    var runs = [], lines = [], byId = {};
    function mkRun(src, li, ri, single) {
      if (typeof src === 'string') src = { t: src };
      var r = { t: src.t, id: src.id || ('L' + li + (single ? '' : 'R' + ri)), f: src.f || base.f, s: src.s || base.s, c: src.c || base.c, b: !!src.b, i: !!src.i, u: !!src.u, line: li };
      runs.push(r); byId[r.id] = r;
      return r;
    }
    var srcLines = cfg.lines || [];
    for (var li = 0; li < srcLines.length; li++) {
      var L = srcLines[li], list = [];
      if (Core.isArray ? Core.isArray(L) : Object.prototype.toString.call(L) === '[object Array]') { for (var ri = 0; ri < L.length; ri++) list.push(mkRun(L[ri], li, ri, false)); }
      else list.push(mkRun(L, li, 0, true));
      lines.push(list);
    }
    var pic = cfg.pic ? { art: cfg.pic.art, layout: cfg.pic.layout || 'inline', side: cfg.pic.side || 'left' } : null;
    var sel = [], ctrl = false, picSel = false, panel = null, awarded = false, taskDone = {};

    /* ---------- DOM ---------- */
    var app = E('div', 'ss ds rd');
    var titleBar = E('div', 'ss-titlebar ds-titlebar', Core.icon('text') + '<span>' + esc(cfg.fileName || 'Document') + ' - Word</span>');
    var tabsRow = E('div', 'ss-tabs');
    var ribbon = E('div', 'ss-ribbon rd-ribbon');
    var status = E('div', 'rd-status');
    var pageWrap = E('div', 'ds-pagewrap rd-pagewrap');
    var page = E('div', 'ds-page rd-page');
    if (cfg.height) pageWrap.style.height = cfg.height + 'px';
    pageWrap.appendChild(page);
    app.appendChild(titleBar); app.appendChild(tabsRow); app.appendChild(ribbon); app.appendChild(status); app.appendChild(pageWrap);
    var fb = E('div', 'feedback');
    fb.setAttribute('aria-live', 'polite');
    host.appendChild(app);
    var tasksEl = null;
    if (cfg.tasks && cfg.tasksHost) { tasksEl = E('ul', 'checklist'); cfg.tasksHost.appendChild(tasksEl); }
    host.appendChild(fb);
    function say(t, type) { Core.say(fb, t, type || 'info'); }

    var tab = 'home';
    function renderTabs() {
      tabsRow.innerHTML = '';
      var T = [['home', 'Home']];
      if (cfg.gallery) T.push(['insert', 'Insert']);
      for (var i = 0; i < T.length; i++) (function (t) {
        var b = E('button', 'ss-tab' + (tab === t[0] ? ' is-on' : ''), t[1]);
        Core.on(b, function () { tab = t[0]; closePanel(); renderTabs(); renderRibbon(); });
        tabsRow.appendChild(b);
      })(T[i]);
    }

    function group(name, rows) {
      var g = E('div', 'ss-group');
      var gin = E('div', 'ss-gin' + (rows.length > 1 ? ' has-rows' : ''));
      for (var i = 0; i < rows.length; i++) { var r = E('div', 'ss-row'); for (var k = 0; k < rows[i].length; k++) r.appendChild(rows[i][k]); gin.appendChild(r); }
      g.appendChild(gin);
      g.appendChild(E('div', 'ss-gname', name));
      return g;
    }
    function rb(html, title, fn, on) {
      var b = E('button', 'ss-rb' + (on ? ' is-on' : ''), html);
      b.setAttribute('title', title); b.setAttribute('aria-label', title);
      Core.on(b, fn);
      return b;
    }
    function first() { return sel.length ? sel[0] : null; }
    function allSame(prop) { if (!sel.length) return false; for (var i = 0; i < sel.length; i++) if (!sel[i][prop]) return false; return true; }

    function renderRibbon() {
      ribbon.innerHTML = '';
      if (tab === 'insert') {
        ribbon.appendChild(group('Illustrations', [[rb(Core.icon('image') + '<span>Pictures</span>', 'Chèn hình ảnh', function () { openGallery(); })]]));
        return;
      }
      var f0 = first();
      var fontSel = E('select', 'ss-sel ss-font');
      fontSel.setAttribute('aria-label', 'Phông chữ (Font)');
      for (var i = 0; i < FONTS.length; i++) { var o = E('option', '', FONTS[i]); o.value = FONTS[i]; o.style.fontFamily = FONTS[i]; fontSel.appendChild(o); }
      fontSel.value = f0 ? f0.f : base.f;
      fontSel.addEventListener('change', function () { apply('f', fontSel.value); });
      var sizeSel = E('select', 'ss-sel rd-size');
      sizeSel.setAttribute('aria-label', 'Cỡ chữ (Font Size)');
      for (i = 0; i < SIZES.length; i++) { var o2 = E('option', '', String(SIZES[i])); o2.value = SIZES[i]; sizeSel.appendChild(o2); }
      sizeSel.value = String(f0 ? f0.s : base.s);
      sizeSel.addEventListener('change', function () { apply('s', parseInt(sizeSel.value, 10)); });
      var B = rb('<b>B</b>', 'Chữ đậm (Bold)', function () { apply('b', !allSame('b')); }, allSame('b'));
      var I = rb('<i style="font-family:Georgia,serif">I</i>', 'Chữ nghiêng (Italic)', function () { apply('i', !allSame('i')); }, allSame('i'));
      var U = rb('<u>U</u>', 'Chữ gạch chân (Underline)', function () { apply('u', !allSame('u')); }, allSame('u'));
      var cur = f0 ? f0.c : base.c;
      var A = rb('<span class="rd-a">A<span class="rd-abar" style="background:' + cur + '"></span></span><span class="rd-caret">▾</span>', 'Màu chữ (Font Color)', function (ev) { ev.stopPropagation(); openColors(A); });
      ribbon.appendChild(group('Font', [[fontSel, sizeSel], [B, I, U, A]]));
      var all = rb('<span>Select all</span>', 'Chọn toàn bộ văn bản (Ctrl+A)', function () { selectAll(); });
      var ct = rb('<span>Ctrl</span>', 'Giữ Ctrl: chạm để chọn thêm', function () { ctrl = !ctrl; renderRibbon(); say(ctrl ? 'Đang giữ <b>Ctrl</b>: chạm vào chữ khác để <b>chọn thêm</b>. Bấm Ctrl lần nữa để thả ra.' : 'Đã thả <b>Ctrl</b>.'); }, ctrl);
      ribbon.appendChild(group('Editing', [[all], [ct]]));
    }

    function closePanel() { if (panel && panel.parentNode) panel.parentNode.removeChild(panel); panel = null; }
    function openColors(anchor) {
      closePanel();
      if (!sel.length) { say('Em chạm chọn chữ cần đổi màu trước nha.'); return; }
      panel = E('div', 'rd-pop');
      panel.appendChild(E('div', 'rd-pop-title', 'Standard Colors'));
      var row = E('div', 'rd-swatches');
      for (var i = 0; i < COLORS.length; i++) (function (c) {
        var b = E('button', 'rd-sw', '<span class="ss-swatch" style="background:' + c[2] + '"></span><span>' + c[0] + '</span>');
        b.setAttribute('title', c[1]);
        Core.on(b, function (ev) { ev.stopPropagation(); closePanel(); apply('c', c[2]); });
        row.appendChild(b);
      })(COLORS[i]);
      panel.appendChild(row);
      app.appendChild(panel);
      panel.style.left = Math.max(4, anchor.offsetLeft - 40) + 'px';
      panel.style.top = (anchor.offsetTop + anchor.offsetHeight + 2) + 'px';
    }
    function openGallery() {
      closePanel();
      panel = E('div', 'rd-pop rd-gallery');
      panel.appendChild(E('div', 'rd-pop-title', 'Chọn một hình rồi bấm vào để chèn (Insert)'));
      var row = E('div', 'rd-gal-row');
      for (var i = 0; i < cfg.gallery.length; i++) (function (name) {
        var b = E('button', 'rd-gal', Art.svg(name));
        b.setAttribute('aria-label', 'Hình ' + name);
        Core.on(b, function (ev) { ev.stopPropagation(); closePanel(); insert(name); });
        row.appendChild(b);
      })(cfg.gallery[i]);
      panel.appendChild(row);
      app.appendChild(panel);
      panel.style.left = '8px';
      panel.style.top = (ribbon.offsetTop + ribbon.offsetHeight) + 'px';
    }
    function openLayout() {
      closePanel();
      panel = E('div', 'rd-pop rd-layout');
      panel.appendChild(E('div', 'rd-pop-title', 'Layout Options'));
      for (var i = 0; i < LAYOUTS.length; i++) (function (l) {
        var b = E('button', 'rd-lay' + (pic.layout === l[0] ? ' is-on' : ''), layIcon(l[0]) + '<span><b>' + l[1] + '</b><br><small>' + l[2] + '</small></span>');
        Core.on(b, function (ev) { ev.stopPropagation(); setLayout(l[0]); });
        panel.appendChild(b);
      })(LAYOUTS[i]);
      if (pic.layout === 'square') {
        panel.appendChild(E('div', 'rd-pop-title', 'Position (vị trí)'));
        var pr = E('div', 'rd-pos');
        var lb = E('button', 'btn btn-small' + (pic.side === 'left' ? ' is-on' : ''), '◧ Bên trái');
        var rbn = E('button', 'btn btn-small' + (pic.side === 'right' ? ' is-on' : ''), 'Bên phải ◨');
        Core.on(lb, function (ev) { ev.stopPropagation(); setSide('left'); openLayout(); });
        Core.on(rbn, function (ev) { ev.stopPropagation(); setSide('right'); openLayout(); });
        pr.appendChild(lb); pr.appendChild(rbn);
        panel.appendChild(pr);
      }
      app.appendChild(panel);
      if (pic.layout === 'square' && pic.side === 'right') panel.style.left = '8px'; else panel.style.right = '8px';
      panel.style.top = (pageWrap.offsetTop + 4) + 'px';
    }
    app.addEventListener('click', function (ev) {
      var t = ev.target;
      while (t && t !== app) { if (t === panel) return; t = t.parentNode; }
      if (panel && !/rd-laybtn|ss-rb|rd-gal/.test(ev.target.className || '')) closePanel();
    });

    /* ---------- page ---------- */
    function cssOf(r) {
      return 'font-family:' + (r.f === 'Times New Roman' ? '"Times New Roman",Times,serif' : r.f + ',sans-serif') + ';font-size:' + Math.round(r.s * 1.2) + 'px;color:' + r.c +
        ';font-weight:' + (r.b ? 800 : 400) + ';font-style:' + (r.i ? 'italic' : 'normal') + ';text-decoration:' + (r.u ? 'underline' : 'none');
    }
    function picEl() {
      var box = E('div', 'rd-pic rd-' + pic.layout + (pic.layout === 'square' ? ' rd-' + pic.side : '') + (picSel ? ' is-sel' : ''));
      box.innerHTML = Art.svg(pic.art);
      box.setAttribute('role', 'button');
      box.setAttribute('aria-label', 'Hình ảnh');
      if (picSel) {
        var lbtn = E('button', 'rd-laybtn', layIcon('square'));
        lbtn.setAttribute('title', 'Layout Options (cách bố trí hình ảnh)');
        lbtn.setAttribute('aria-label', 'Layout Options');
        Core.on(lbtn, function (ev) { ev.stopPropagation(); if (panel) closePanel(); else openLayout(); });
        box.appendChild(lbtn);
      }
      Core.on(box, function (ev) {
        if (box._dragged) { box._dragged = false; return; }
        ev.stopPropagation(); sel = []; picSel = true; render();
        say(pic.layout === 'square' ? 'Đã chọn hình. Kéo hình sang trái/phải, hoặc bấm nút bố trí bên cạnh hình.' : 'Đã chọn hình. Bấm nút <b>Layout Options</b> bên cạnh hình để chọn cách bố trí.');
      });
      enableDrag(box);
      return box;
    }
    /* dragging a Square picture left / right (mouse or finger); one shared state for the whole editor */
    var drag = null;
    function dragMove(x) { if (!drag) return; var dx = x - drag.x; if (Math.abs(dx) > 6) drag.moved = true; drag.box.style.transform = 'translateX(' + dx + 'px)'; }
    function dragEnd(x) {
      if (!drag) return;
      var d = drag, pr = page.getBoundingClientRect(), side = x > pr.left + pr.width / 2 ? 'right' : 'left';
      drag = null; d.box.style.transform = '';
      if (d.moved) { d.box._dragged = true; closePanel(); setSide(side); }
    }
    document.addEventListener('mousemove', function (e) { dragMove(e.clientX); });
    document.addEventListener('mouseup', function (e) { dragEnd(e.clientX); });
    function enableDrag(box) {
      function down(x) { if (pic.layout === 'square' && picSel) drag = { box: box, x: x, moved: false }; }
      box.addEventListener('mousedown', function (e) { down(e.clientX); if (drag) e.preventDefault(); });
      box.addEventListener('touchstart', function (e) { if (e.touches[0]) down(e.touches[0].clientX); }, false);
      box.addEventListener('touchmove', function (e) { if (drag && e.touches[0]) { dragMove(e.touches[0].clientX); e.preventDefault(); } }, false);
      box.addEventListener('touchend', function (e) { if (e.changedTouches[0]) dragEnd(e.changedTouches[0].clientX); }, false);
    }
    function render() {
      page.innerHTML = '';
      if (pic && pic.layout === 'square') page.appendChild(picEl());
      for (var i = 0; i < lines.length; i++) {
        var ln = E('div', 'rd-line');
        for (var k = 0; k < lines[i].length; k++) (function (r) {
          var s = E('span', 'rd-run' + (sel.indexOf(r) > -1 ? ' is-sel' : ''));
          s.setAttribute('style', cssOf(r));
          s.appendChild(document.createTextNode(r.t));
          Core.on(s, function (ev) { ev.stopPropagation(); pick(r); });
          ln.appendChild(s);
        })(lines[i][k]);
        if (!lines[i].length) ln.innerHTML = '&nbsp;';
        page.appendChild(ln);
      }
      if (pic && pic.layout !== 'square') page.appendChild(picEl());
      var clr = E('div', 'rd-clear'); page.appendChild(clr);
      renderStatus();
      renderRibbon();
      renderTasks();
    }
    page.addEventListener('click', function () { if (picSel || sel.length) { picSel = false; sel = []; closePanel(); render(); } });

    function renderStatus() {
      if (picSel && pic) { status.innerHTML = 'Đang chọn: <b>hình ảnh</b> · bố trí: <b>' + layoutName(pic.layout) + '</b>' + (pic.layout === 'square' ? ' · ' + (pic.side === 'right' ? 'bên phải' : 'bên trái') : ''); return; }
      if (!sel.length) { status.innerHTML = 'Chạm vào chữ để chọn.'; return; }
      var r = sel[0], txt = sel.length === runs.length ? 'toàn bộ văn bản' : sel.length > 1 ? sel.length + ' đoạn chữ' : '"' + esc(r.t.replace(/^\s+/, '')) + '"';
      if (txt.length > 46) txt = txt.slice(0, 44) + '…"';
      var st = [r.f, r.s];
      if (r.b) st.push('đậm'); if (r.i) st.push('nghiêng'); if (r.u) st.push('gạch chân');
      st.push('màu ' + colorName(r.c));
      status.innerHTML = 'Đang chọn: <b>' + txt + '</b> · ' + esc(st.join(' · '));
    }
    function layoutName(l) { for (var i = 0; i < LAYOUTS.length; i++) if (LAYOUTS[i][0] === l) return LAYOUTS[i][1]; return l; }

    function pick(r) {
      picSel = false; closePanel();
      if (ctrl) { var k = sel.indexOf(r); if (k > -1) sel.splice(k, 1); else sel.push(r); }
      else sel = [r];
      render();
    }
    function selectAll() { picSel = false; closePanel(); sel = runs.slice(); render(); say('Đã chọn <b>toàn bộ</b> văn bản.'); }
    function apply(prop, v) {
      if (!sel.length) { say('Em chạm chọn chữ cần định dạng trước nha.'); renderRibbon(); return; }
      for (var i = 0; i < sel.length; i++) sel[i][prop] = v;
      render(); check();
    }
    function setLayout(l) {
      pic.layout = l; picSel = true; render(); openLayout();
      say('Đã chọn cách bố trí <b>' + layoutName(l) + '</b>.' + (l === 'square' ? ' Giờ em kéo hình (hoặc chọn Position) sang vị trí mới.' : ''), 'good');
      check();
    }
    function setSide(s) { pic.side = s; picSel = true; render(); say('Đã đưa hình sang <b>' + (s === 'right' ? 'bên phải' : 'bên trái') + '</b>.', 'good'); check(); }
    function insert(name) {
      pic = { art: name, layout: 'inline', side: 'left' }; picSel = true; sel = [];
      tab = 'home'; renderTabs(); render();
      say('Đã chèn hình. Bấm nút <b>Layout Options</b> bên cạnh hình để chọn cách bố trí.', 'good');
      check();
    }

    function renderTasks() {
      if (!tasksEl) return;
      tasksEl.innerHTML = '';
      for (var i = 0; i < cfg.tasks.length; i++) {
        var ok = !!taskDone[i];
        tasksEl.appendChild(E('li', ok ? 'done' : '', '<span class="ico">' + (ok ? Icons.check : Icons.starEmpty) + '</span><span>' + cfg.tasks[i].text + '</span>'));
      }
    }
    function check() {
      if (!cfg.tasks) return;
      var all = true;
      for (var i = 0; i < cfg.tasks.length; i++) {
        if (!taskDone[i] && cfg.tasks[i].ok(api)) taskDone[i] = true;
        if (!taskDone[i]) all = false;
      }
      renderTasks();
      if (all && !awarded) { awarded = true; Core.celebrate(fb, cfg.lesson, cfg.id, cfg.doneText || 'Em làm xong tất cả nhiệm vụ rồi!'); }
    }

    var api = {
      style: function (id) { return byId[id]; },
      runs: function () { return runs; },
      line: function (i) { return lines[i]; },
      pic: function () { return pic; },
      select: function (ids) { sel = []; for (var i = 0; i < ids.length; i++) if (byId[ids[i]]) sel.push(byId[ids[i]]); picSel = false; render(); },
      selectAll: selectAll,
      apply: apply,
      layout: function (l) { if (pic) setLayout(l); },
      side: function (s) { if (pic) setSide(s); },
      insert: insert,
      every: function (fn) { for (var i = 0; i < runs.length; i++) if (!fn(runs[i])) return false; return true; }
    };
    renderTabs();
    say(cfg.hello || 'Chạm vào chữ để chọn, rồi dùng các lệnh trong nhóm <b>Font</b>.');
    render();
    return api;
  };
})();
