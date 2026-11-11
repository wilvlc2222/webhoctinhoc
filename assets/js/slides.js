/* Pretend presentation program (like PowerPoint) for the slide lessons.
   Tap a text box to type in it; formatting buttons change the selected box.
   Files are "saved" per learner in localStorage, so a later lesson can open them again.
   ES5 only. Needs core.js, icons.js, art.js; telex.js is optional (Vietnamese typing).

   var app = Slides(host, cfg)
     cfg.deck:    [{ layout: 'title'|'content'|'picture'|'text', boxes: { title: 'text', sub: '...' }, pic: 'bridge', trans: 'fade' }]
     cfg.ribbon:  ['file', 'home', 'insert', 'transitions'] (tabs to show)
     cfg.tasks:   [{ text, ok: function (app) {} }], cfg.tasksHost, cfg.lesson, cfg.id, cfg.doneText
     cfg.folders: folders offered in the Save dialog
     cfg.height:  canvas width in px (default fits the host) */
(function () {
  var E = Core.el;
  var FONTS = ['Calibri', 'Arial', 'Times New Roman', 'Tahoma', 'Verdana', 'Comic Sans MS'];
  var SIZES = [12, 14, 16, 18, 20, 24, 28, 30, 32, 36, 40, 44, 48, 50, 54, 60];
  var COLORS = [['#000000', 'Đen'], ['#e03131', 'Đỏ'], ['#1971c2', 'Xanh dương'], ['#2f9e44', 'Xanh lá'], ['#f76707', 'Cam'], ['#7048e8', 'Tím']];
  var TRANS = [['none', 'None', 'Không có'], ['fade', 'Fade', 'Mờ dần'], ['push', 'Push', 'Đẩy'], ['wipe', 'Wipe', 'Lau'], ['split', 'Split', 'Tách đôi'], ['zoom', 'Zoom', 'Phóng to'], ['cover', 'Cover', 'Phủ lên']];
  var LAYOUTS = {
    title: { name: 'Title Slide', vi: 'Trang tiêu đề', boxes: { title: { x: 8, y: 28, w: 84, h: 22, size: 44, align: 'center', hint: 'Bấm để gõ tiêu đề' }, sub: { x: 8, y: 54, w: 84, h: 26, size: 24, align: 'center', hint: 'Bấm để gõ phụ đề' } } },
    content: { name: 'Title and Content', vi: 'Tiêu đề và nội dung', boxes: { title: { x: 6, y: 5, w: 88, h: 18, size: 36, align: 'center', hint: 'Bấm để gõ tiêu đề' }, body: { x: 8, y: 26, w: 84, h: 68, size: 24, align: 'left', hint: 'Bấm để gõ nội dung (mỗi ý một dòng)' } } },
    picture: { name: 'Picture with Caption', vi: 'Ảnh và chú thích', pic: { x: 20, y: 6, w: 60, h: 66 }, boxes: { caption: { x: 10, y: 76, w: 80, h: 18, size: 20, align: 'center', hint: 'Bấm để gõ chú thích ảnh' } } },
    text: { name: 'Text Only', vi: 'Chỉ có chữ', boxes: { text: { x: 8, y: 30, w: 84, h: 40, size: 32, align: 'center', hint: 'Bấm để gõ nội dung' } } }
  };
  Slides.LAYOUTS = LAYOUTS;
  var STORE = 'whth-files';

  function readFiles() { try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { return {}; } }
  function writeFiles(all) { try { localStorage.setItem(STORE, JSON.stringify(all)); } catch (e) {} }
  function who() { return '@' + (Core.currentName() || 'khach'); }

  function newBox(layout, role, text) {
    var d = LAYOUTS[layout].boxes[role];
    return { role: role, text: text || '', font: 'Calibri', size: d.size, b: false, i: false, u: false, color: '#000000', align: d.align, bullets: false };
  }
  function newSlide(layout, texts) {
    var s = { layout: layout, boxes: [], pic: null, trans: 'none' };
    for (var r in LAYOUTS[layout].boxes) if (LAYOUTS[layout].boxes.hasOwnProperty(r)) s.boxes.push(newBox(layout, r, texts && texts[r]));
    return s;
  }
  function copyDeck(d) { return JSON.parse(JSON.stringify(d)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function Slides(host, cfg) {
    cfg = cfg || {};
    var deck = [];
    var cur = 0, selBox = null, savedAs = null, exited = false, dirty = false, opened = null, awarded = false;
    if (cfg.deck) for (var d = 0; d < cfg.deck.length; d++) {
      var sd = cfg.deck[d], s = newSlide(sd.layout || 'content', sd.boxes);
      if (sd.pic) s.pic = sd.pic;
      if (sd.trans) s.trans = sd.trans;
      if (sd.format) for (var role in sd.format) if (sd.format.hasOwnProperty(role)) for (var j = 0; j < s.boxes.length; j++) if (s.boxes[j].role === role) for (var p in sd.format[role]) s.boxes[j][p] = sd.format[role][p];
      deck.push(s);
    }
    if (!deck.length) deck.push(newSlide('title'));

    /* ---------- skeleton ---------- */
    var app = E('div', 'ss');
    var titleBar = E('div', 'ss-titlebar');
    var tabsRow = E('div', 'ss-tabs');
    var ribbon = E('div', 'ss-ribbon');
    var main = E('div', 'ss-main');
    var thumbs = E('div', 'ss-thumbs');
    var stage = E('div', 'ss-stage');
    var canvas = E('div', 'ss-canvas');
    var overlay = E('div', 'ss-overlay');
    stage.appendChild(canvas);
    main.appendChild(thumbs);
    main.appendChild(stage);
    app.appendChild(titleBar);
    app.appendChild(tabsRow);
    app.appendChild(ribbon);
    app.appendChild(main);
    app.appendChild(overlay);
    var W = cfg.width || 480;
    canvas.style.width = W + 'px';
    canvas.style.height = Math.round(W * 9 / 16) + 'px';
    var closedEl = E('div', 'ss-closed');
    var fb = E('div', 'feedback');
    fb.setAttribute('aria-live', 'polite');
    host.appendChild(app);
    host.appendChild(closedEl);
    host.appendChild(fb);
    var tasksEl = null;
    if (cfg.tasks && cfg.tasksHost) { tasksEl = E('ul', 'checklist'); cfg.tasksHost.appendChild(tasksEl); }

    var imeMode = function () { return 'off'; };
    if (cfg.ime && window.Telex) imeMode = null;

    function say(t, type) { Core.say(fb, t, type || 'info'); }

    /* ---------- ribbon ---------- */
    var TABS = cfg.ribbon || ['file', 'home', 'insert', 'transitions'];
    var TABNAME = { file: 'File', home: 'Home', insert: 'Insert', transitions: 'Transitions' };
    var tab = TABS[1] || TABS[0];
    function renderTabs() {
      tabsRow.innerHTML = '';
      for (var i = 0; i < TABS.length; i++) {
        (function (t) {
          var b = E('button', 'ss-tab' + (t === tab ? ' is-on' : '') + (t === 'file' ? ' ss-file' : ''), TABNAME[t]);
          Core.on(b, function () { tab = t; renderTabs(); renderRibbon(); });
          tabsRow.appendChild(b);
        })(TABS[i]);
      }
      var show = E('button', 'ss-tab ss-show', Core.icon('play') + 'Trình chiếu');
      show.setAttribute('title', 'Slide Show: trình chiếu từ trang đầu');
      Core.on(show, function () { slideShow(0); });
      tabsRow.appendChild(show);
      if (cfg.ime && window.Telex) {
        var imeHost = E('span', 'ss-ime');
        tabsRow.appendChild(imeHost);
        imeMode = Telex.switcher(imeHost, 'telex');
      }
    }
    function rbtn(label, title, fn, on) {
      var b = E('button', 'ss-rb' + (on ? ' is-on' : ''), label);
      if (title) { b.setAttribute('title', title); b.setAttribute('aria-label', title); }
      Core.on(b, fn);
      return b;
    }
    function group(name) { var g = E('div', 'ss-group'); var inner = E('div', 'ss-gin'); g.appendChild(inner); g.appendChild(E('div', 'ss-gname', name)); ribbon.appendChild(g); return inner; }
    function needBox() { if (!selBox) { say('Em chạm vào một khung chữ trên trang chiếu trước, rồi mới chọn lệnh định dạng.'); return true; } return false; }
    function setProp(p, v) {
      if (needBox()) return;
      selBox[p] = v; dirty = true;
      renderCanvas(); renderThumbs(); renderRibbon(); changed('format');
    }
    function toggle(p) { if (needBox()) return; setProp(p, !selBox[p]); }
    function renderRibbon() {
      ribbon.innerHTML = '';
      if (tab === 'file') {
        var g = group('File');
        g.appendChild(rbtn(Core.icon('folderOpen') + '<span>Open</span>', 'Mở tệp', openDialog));
        g.appendChild(rbtn(Core.icon('download') + '<span>Save</span>', 'Lưu tệp', function () { saveDialog(); }));
        g.appendChild(rbtn(Core.icon('cross') + '<span>Exit</span>', 'Thoát khỏi phần mềm', exitApp));
      } else if (tab === 'home') {
        var gs = group('Slides');
        gs.appendChild(rbtn(Core.icon('plus') + '<span>New Slide</span>', 'Thêm trang chiếu mới', layoutMenu));
        gs.appendChild(rbtn(Core.icon('trash') + '<span>Delete</span>', 'Xoá trang chiếu đang chọn', deleteSlide));
        var gf = group('Font');
        gf.className += ' has-rows';
        var b = selBox || {};
        var font = E('select', 'ss-sel ss-font');
        font.setAttribute('aria-label', 'Phông chữ');
        for (var i = 0; i < FONTS.length; i++) { var o = E('option', '', FONTS[i]); o.value = FONTS[i]; if (b.font === FONTS[i]) o.selected = true; font.appendChild(o); }
        font.addEventListener('change', function () { setProp('font', font.value); }, false);
        var size = E('select', 'ss-sel ss-size');
        size.setAttribute('aria-label', 'Cỡ chữ');
        for (var k = 0; k < SIZES.length; k++) { var o2 = E('option', '', String(SIZES[k])); o2.value = SIZES[k]; if (b.size === SIZES[k]) o2.selected = true; size.appendChild(o2); }
        size.addEventListener('change', function () { setProp('size', parseInt(size.value, 10)); }, false);
        var row1 = E('div', 'ss-row'); row1.appendChild(font); row1.appendChild(size);
        var row2 = E('div', 'ss-row');
        row2.appendChild(rbtn('<b>B</b>', 'Chữ đậm (Bold)', function () { toggle('b'); }, b.b));
        row2.appendChild(rbtn('<i>I</i>', 'Chữ nghiêng (Italic)', function () { toggle('i'); }, b.i));
        row2.appendChild(rbtn('<u>U</u>', 'Chữ gạch chân (Underline)', function () { toggle('u'); }, b.u));
        for (var c = 0; c < COLORS.length; c++) {
          (function (col) {
            var cb = rbtn('<span class="ss-swatch" style="background:' + col[0] + '"></span>', 'Màu chữ: ' + col[1], function () { setProp('color', col[0]); }, b.color === col[0]);
            cb.className += ' ss-color';
            row2.appendChild(cb);
          })(COLORS[c]);
        }
        gf.appendChild(row1); gf.appendChild(row2);
        var gp = group('Paragraph');
        gp.className += ' has-rows';
        var r1 = E('div', 'ss-row');
        r1.appendChild(rbtn('<span class="ss-bul">&bull;&mdash;<br>&bull;&mdash;</span>', 'Gạch đầu dòng (Bullets)', function () { toggle('bullets'); }, b.bullets));
        var r2 = E('div', 'ss-row');
        r2.appendChild(rbtn('<span class="ss-al al-l"></span>', 'Căn trái', function () { setProp('align', 'left'); }, b.align === 'left'));
        r2.appendChild(rbtn('<span class="ss-al al-c"></span>', 'Căn giữa', function () { setProp('align', 'center'); }, b.align === 'center'));
        r2.appendChild(rbtn('<span class="ss-al al-r"></span>', 'Căn phải', function () { setProp('align', 'right'); }, b.align === 'right'));
        gp.appendChild(r1); gp.appendChild(r2);
      } else if (tab === 'insert') {
        var gi = group('Images');
        gi.appendChild(rbtn(Core.icon('image') + '<span>Picture</span>', 'Chèn ảnh vào trang chiếu', pictureDialog));
        var gt = group('Text');
        gt.appendChild(rbtn(Core.icon('plus') + '<span>New Slide</span>', 'Thêm trang chiếu mới', layoutMenu));
      } else if (tab === 'transitions') {
        var gp2 = group('Preview');
        gp2.appendChild(rbtn(Core.icon('play') + '<span>Preview</span>', 'Xem thử hiệu ứng', function () { preview(); }));
        var gt2 = group('Transition to This Slide');
        var rowT = E('div', 'ss-row ss-trans');
        for (var t = 0; t < TRANS.length; t++) {
          (function (tr) {
            rowT.appendChild(rbtn('<span class="ss-tr-ico tr-' + tr[0] + '"></span><span>' + tr[1] + '</span>', tr[1] + ': ' + tr[2], function () {
              deck[cur].trans = tr[0]; dirty = true;
              renderThumbs(); renderRibbon(); preview();
              say('Trang ' + (cur + 1) + ' có hiệu ứng <b>' + tr[1] + '</b> (' + tr[2] + ').', 'good');
              changed('trans');
            }, deck[cur].trans === tr[0]));
          })(TRANS[t]);
        }
        gt2.appendChild(rowT);
        var ga = group('Timing');
        ga.appendChild(rbtn(Core.icon('copy') + '<span>Apply To All</span>', 'Áp dụng hiệu ứng này cho tất cả trang chiếu', function () {
          for (var i = 0; i < deck.length; i++) deck[i].trans = deck[cur].trans;
          dirty = true; renderThumbs();
          say('Đã áp dụng hiệu ứng cho <b>tất cả</b> ' + deck.length + ' trang chiếu.', 'good');
          changed('trans');
        }));
      }
    }

    /* ---------- dialogs ---------- */
    function dialog(title, body, buttons) {
      overlay.innerHTML = '';
      var box = E('div', 'ss-dialog');
      box.appendChild(E('div', 'ss-dtitle', title));
      box.appendChild(body);
      var row = E('div', 'ss-drow');
      for (var i = 0; i < buttons.length; i++) row.appendChild(buttons[i]);
      box.appendChild(row);
      overlay.appendChild(box);
      overlay.style.display = 'flex';
    }
    function closeDialog() { overlay.style.display = 'none'; overlay.innerHTML = ''; }
    function btn(label, fn, primary) { var b = E('button', 'btn btn-small' + (primary ? ' btn-primary' : ''), label); Core.on(b, fn); return b; }
    function layoutMenu() {
      var body = E('div', 'ss-layouts');
      for (var k in LAYOUTS) if (LAYOUTS.hasOwnProperty(k)) {
        (function (k) {
          var b = E('button', 'ss-layout', '<span class="ss-lthumb lt-' + k + '"></span><span><b>' + LAYOUTS[k].name + '</b><br>' + LAYOUTS[k].vi + '</span>');
          Core.on(b, function () {
            deck.splice(cur + 1, 0, newSlide(k));
            cur++; selBox = null; dirty = true;
            closeDialog(); renderAll(); changed('slide');
            say('Đã thêm trang ' + (cur + 1) + ' (' + LAYOUTS[k].vi + '). Chạm vào khung để gõ chữ.', 'good');
          });
          body.appendChild(b);
        })(k);
      }
      dialog('New Slide: chọn bố cục trang chiếu', body, [btn('Thôi', closeDialog)]);
    }
    function deleteSlide() {
      if (deck.length <= 1) return say('Bài trình chiếu phải còn ít nhất một trang.');
      deck.splice(cur, 1);
      if (cur >= deck.length) cur = deck.length - 1;
      selBox = null; dirty = true; renderAll(); changed('slide');
    }
    function pictureDialog() {
      var body = E('div', 'ss-gallery');
      var names = cfg.pictures || ['bridge', 'lake', 'temple', 'sea', 'hills', 'school', 'ball', 'swim', 'flower', 'kids', 'sing', 'town', 'lantern'];
      for (var i = 0; i < names.length; i++) {
        (function (n) {
          var b = E('button', 'ss-gpic', Art.svg(n));
          b.setAttribute('aria-label', 'Ảnh ' + n);
          Core.on(b, function () {
            deck[cur].pic = n; dirty = true;
            closeDialog(); renderAll(); changed('pic');
            say('Đã chèn ảnh vào trang ' + (cur + 1) + '.', 'good');
          });
          body.appendChild(b);
        })(names[i]);
      }
      dialog('Insert Picture: chọn ảnh trong máy', body, [btn('Thôi', closeDialog)]);
    }
    function saveDialog(after) {
      var body = E('div', 'ss-save');
      body.appendChild(E('div', 'ss-dlabel', 'Lưu vào thư mục:'));
      var folders = cfg.folders || ['D:/Lop 4A2/Nhom 2/Thu An'];
      var sel = E('select', 'ss-sel ss-folder');
      for (var i = 0; i < folders.length; i++) { var o = E('option', '', folders[i]); o.value = folders[i]; sel.appendChild(o); }
      if (savedAs) sel.value = savedAs.folder;
      body.appendChild(sel);
      body.appendChild(E('div', 'ss-dlabel', 'File name (tên tệp):'));
      var name = E('input', 'ss-name');
      name.value = savedAs ? savedAs.name : (cfg.fileName || '');
      name.setAttribute('placeholder', 'Gõ tên tệp');
      body.appendChild(name);
      dialog('Save As', body, [btn('Save', function () {
        var n = name.value.replace(/^\s+|\s+$/g, '');
        if (!n) { name.focus(); return; }
        savedAs = { name: n, folder: sel.value };
        var all = readFiles(), mine = all[who()] || {};
        mine[savedAs.folder + '/' + n] = copyDeck(deck);
        all[who()] = mine; writeFiles(all);
        dirty = false; closeDialog(); renderTitle();
        say('Đã lưu tệp <b>' + esc(n) + '</b> vào thư mục <b>' + esc(savedAs.folder) + '</b>.', 'good');
        changed('save');
        if (after) after();
      }, true), btn('Cancel', closeDialog)]);
      setTimeout(function () { try { name.focus(); } catch (e) {} }, 0);
    }
    function openDialog() {
      var body = E('div', 'ss-open');
      var mine = readFiles()[who()] || {}, any = false;
      for (var path in mine) if (mine.hasOwnProperty(path) && Object.prototype.toString.call(mine[path]) === '[object Array]') {
        any = true;
        (function (path) {
          var b = E('button', 'ss-openitem', Core.icon('slides') + '<span></span>');
          b.lastChild.appendChild(document.createTextNode(path));
          Core.on(b, function () { load(mine[path], path); closeDialog(); });
          body.appendChild(b);
        })(path);
      }
      if (cfg.sampleFile) {
        var sb = E('button', 'ss-openitem', Core.icon('slides') + '<span></span>');
        sb.lastChild.appendChild(document.createTextNode(cfg.sampleFile.path + ' (tệp mẫu)'));
        Core.on(sb, function () { var s = Slides.deckFrom(cfg.sampleFile.deck); load(s, cfg.sampleFile.path); closeDialog(); });
        body.appendChild(sb);
      }
      if (!any && !cfg.sampleFile) body.appendChild(E('p', '', 'Chưa có tệp nào được lưu.'));
      dialog('Open: chọn tệp trình chiếu', body, [btn('Cancel', closeDialog)]);
    }
    function load(d, path) {
      deck = copyDeck(d); cur = 0; selBox = null; dirty = false;
      var cut = path.lastIndexOf('/');
      savedAs = { folder: path.slice(0, cut), name: path.slice(cut + 1) };
      opened = path;
      renderAll();
      say('Đã mở tệp <b>' + esc(savedAs.name) + '</b>.', 'good');
      changed('open');
    }
    function exitApp() {
      if (dirty) {
        dialog('Bài trình chiếu chưa được lưu', E('p', '', 'Em có muốn lưu lại trước khi thoát không?'),
          [btn('Save', function () { closeDialog(); saveDialog(reallyExit); }, true), btn("Don't Save", function () { closeDialog(); reallyExit(); }), btn('Cancel', closeDialog)]);
        return;
      }
      reallyExit();
    }
    function reallyExit() {
      exited = true;
      app.style.display = 'none';
      closedEl.innerHTML = '';
      closedEl.appendChild(E('p', '', 'Em đã <b>thoát khỏi</b> phần mềm trình chiếu.'));
      var again = btn('Mở lại phần mềm', function () { exited = false; app.style.display = ''; closedEl.innerHTML = ''; });
      closedEl.appendChild(again);
      changed('exit');
    }

    /* ---------- canvas ---------- */
    function boxStyle(b, scale) {
      return 'font-family:' + b.font + ';font-size:' + Math.round(b.size * scale) + 'px;font-weight:' + (b.b ? 800 : 400) +
        ';font-style:' + (b.i ? 'italic' : 'normal') + ';text-decoration:' + (b.u ? 'underline' : 'none') +
        ';color:' + b.color + ';text-align:' + b.align + ';';
    }
    function boxHTML(b) {
      if (!b.text) return '';
      var lines = b.text.split('\n'), out = '';
      if (b.bullets) { for (var i = 0; i < lines.length; i++) out += '<li>' + esc(lines[i]) + '</li>'; return '<ul>' + out + '</ul>'; }
      for (var j = 0; j < lines.length; j++) out += '<div>' + (esc(lines[j]) || '&nbsp;') + '</div>';
      return out;
    }
    function scaleOf(w) { return w / 720; }
    function drawSlide(el, s, w, editable) {
      el.innerHTML = '';
      var L = LAYOUTS[s.layout], scale = scaleOf(w);
      if (L.pic || s.pic) {
        var pp = L.pic || { x: 58, y: 30, w: 36, h: 50 };
        var pe = E('div', 'ss-pic' + (s.pic ? '' : ' is-empty'), s.pic ? Art.svg(s.pic) : (editable ? Core.icon('image') + '<span>Insert › Picture để chèn ảnh</span>' : ''));
        pe.style.cssText = 'left:' + pp.x + '%;top:' + pp.y + '%;width:' + pp.w + '%;height:' + pp.h + '%;';
        el.appendChild(pe);
      }
      for (var i = 0; i < s.boxes.length; i++) {
        (function (b) {
          var pos = L.boxes[b.role];
          var be = E('div', 'ss-box' + (editable && b === selBox ? ' is-sel' : '') + (b.text ? '' : ' is-empty'));
          be.style.cssText = 'left:' + pos.x + '%;top:' + pos.y + '%;width:' + pos.w + '%;height:' + pos.h + '%;' + boxStyle(b, scale);
          be.innerHTML = b.text ? boxHTML(b) : (editable ? '<span class="ss-hint">' + pos.hint + '</span>' : '');
          if (editable) Core.on(be, function (ev) { ev.stopPropagation(); edit(b, be); });
          el.appendChild(be);
        })(s.boxes[i]);
      }
    }
    function edit(b, be) {
      selBox = b;
      renderRibbon();
      var olds = canvas.querySelectorAll('.ss-box.is-sel');
      for (var i = 0; i < olds.length; i++) Core.removeClass(olds[i], 'is-sel');
      Core.addClass(be, 'is-sel');
      var ta = E('textarea', 'ss-edit');
      ta.value = b.text;
      ta.style.cssText = boxStyle(b, scaleOf(W));
      ta.setAttribute('aria-label', 'Gõ chữ vào khung');
      be.innerHTML = '';
      be.appendChild(ta);
      if (window.Telex) Telex.attach(ta, { mode: function () { return imeMode ? imeMode() : 'off'; } });
      ta.addEventListener('input', function () { b.text = ta.value; dirty = true; changed('text'); }, false);
      ta.addEventListener('blur', function () { b.text = ta.value; renderCanvas(); renderThumbs(); }, false);
      setTimeout(function () { try { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); } catch (e) {} }, 0);
    }
    Core.on(canvas, function () { selBox = null; renderCanvas(); renderRibbon(); });
    function renderCanvas() { drawSlide(canvas, deck[cur], W, true); }
    function renderThumbs() {
      thumbs.innerHTML = '';
      for (var i = 0; i < deck.length; i++) {
        (function (i) {
          var t = E('button', 'ss-thumb' + (i === cur ? ' is-cur' : ''));
          t.appendChild(E('span', 'ss-tnum', String(i + 1) + (deck[i].trans !== 'none' ? '<span class="ss-star" title="Có hiệu ứng chuyển trang">*</span>' : '')));
          var mini = E('div', 'ss-mini');
          t.appendChild(mini);
          Core.on(t, function () { cur = i; selBox = null; renderAll(); });
          thumbs.appendChild(t);
          drawSlide(mini, deck[i], 96, false);
        })(i);
      }
    }
    function renderTitle() {
      titleBar.innerHTML = Core.icon('slides') + '<span></span>';
      titleBar.lastChild.appendChild(document.createTextNode((savedAs ? savedAs.name : 'Presentation1') + ' – Phần mềm trình chiếu' + (dirty ? ' (chưa lưu)' : '')));
      var x = E('button', 'ss-x', Core.icon('cross'));
      x.setAttribute('title', 'Thoát khỏi phần mềm');
      x.setAttribute('aria-label', 'Thoát khỏi phần mềm');
      Core.on(x, exitApp);
      titleBar.appendChild(x);
    }
    function renderAll() { renderTitle(); renderRibbon(); renderCanvas(); renderThumbs(); }

    /* ---------- show ---------- */
    function animate(el, trans) {
      if (Core.isEink() || !trans || trans === 'none') return;
      el.className = el.className.replace(/ tr-run-\w+/g, '');
      void el.offsetWidth;
      el.className += ' tr-run-' + trans;
    }
    function preview() { animate(canvas, deck[cur].trans); }
    function slideShow(start) {
      var i = start || 0;
      var show = E('div', 'ss-showbox');
      var slide = E('div', 'ss-showslide');
      var info = E('div', 'ss-showinfo');
      show.appendChild(slide);
      show.appendChild(info);
      overlay.innerHTML = '';
      overlay.appendChild(show);
      overlay.style.display = 'flex';
      function draw() {
        if (i >= deck.length) return;
        var sw = slide.offsetWidth || W;
        slide.style.height = Math.round(sw * 9 / 16) + 'px';
        drawSlide(slide, deck[i], sw, false);
        info.innerHTML = 'Trang ' + (i + 1) + '/' + deck.length + (deck[i].trans !== 'none' ? ' · hiệu ứng ' + deck[i].trans : '') + ' · chạm để sang trang tiếp';
        animate(slide, deck[i].trans);
      }
      Core.on(show, function () {
        i++;
        if (i >= deck.length) { closeDialog(); say('Hết trình chiếu.', 'info'); changed('show'); return; }
        draw();
      });
      setTimeout(draw, 0);
    }

    /* ---------- tasks ---------- */
    var taskDone = {};
    function renderTasks() {
      if (!tasksEl) return;
      tasksEl.innerHTML = '';
      for (var i = 0; i < cfg.tasks.length; i++) {
        var ok = !!taskDone[i];
        tasksEl.appendChild(E('li', ok ? 'done' : '', '<span class="ico">' + (ok ? Icons.check : Icons.starEmpty) + '</span><span>' + cfg.tasks[i].text + '</span>'));
      }
    }
    function changed(what) {
      if (cfg.onChange) cfg.onChange(what, api);
      if (!cfg.tasks) return;
      var all = true;
      for (var i = 0; i < cfg.tasks.length; i++) {
        if (taskDone[i]) continue;
        var ok = false;
        try { ok = !!cfg.tasks[i].ok(api, what); } catch (e) { ok = false; }
        if (ok) taskDone[i] = true; else all = false;
      }
      renderTasks();
      if (all && !awarded) { awarded = true; Core.celebrate(fb, cfg.lesson, cfg.id, cfg.doneText || 'Em làm xong tất cả nhiệm vụ rồi!'); }
    }

    var api = {
      deck: function () { return deck; },
      count: function () { return deck.length; },
      slide: function (i) { return deck[i]; },
      box: function (i, role) { var s = deck[i]; if (!s) return null; for (var k = 0; k < s.boxes.length; k++) if (s.boxes[k].role === role) return s.boxes[k]; return null; },
      text: function (i, role) { var b = api.box(i, role); return b ? b.text.replace(/^\s+|\s+$/g, '') : ''; },
      anyText: function (i) { var s = deck[i], t = ''; if (!s) return ''; for (var k = 0; k < s.boxes.length; k++) t += s.boxes[k].text; return t.replace(/\s+/g, ''); },
      saved: function () { return savedAs; },
      exited: function () { return exited; },
      opened: function () { return opened; },
      /* for tools/fit.html and lesson solvers */
      set: function (i, role, props) {
        while (deck.length <= i) deck.push(newSlide(props && props.layout || 'content'));
        var b = api.box(i, role);
        if (!b) return;
        for (var p in props) if (props.hasOwnProperty(p) && p !== 'layout') b[p] = props[p];
        renderAll(); changed('set');
      },
      add: function (layout) { deck.push(newSlide(layout)); cur = deck.length - 1; renderAll(); changed('slide'); },
      pic: function (i, name) { deck[i].pic = name; renderAll(); changed('pic'); },
      trans: function (i, name) { deck[i].trans = name; renderAll(); changed('trans'); },
      save: function (name, folder) {
        savedAs = { name: name, folder: folder || (cfg.folders || ['D:'])[0] };
        var all = readFiles(), mine = all[who()] || {};
        mine[savedAs.folder + '/' + name] = copyDeck(deck); all[who()] = mine; writeFiles(all);
        dirty = false; renderTitle(); changed('save');
      },
      exit: function () { dirty = false; reallyExit(); },
      show: function () { slideShow(0); },
      openFile: function (path, d) { load(d, path); }
    };

    renderTabs();
    renderAll();
    renderTasks();
    say(cfg.hello || 'Chạm vào khung chữ trên trang chiếu để gõ. Các nút lệnh nằm trên dải lệnh ở trên.', 'info');
    return api;
  }
  /* build a full deck (with formats) from the short cfg.deck form */
  Slides.deckFrom = function (short) {
    var d = [];
    for (var i = 0; i < short.length; i++) {
      var sd = short[i], s = newSlide(sd.layout || 'content', sd.boxes);
      if (sd.pic) s.pic = sd.pic;
      if (sd.trans) s.trans = sd.trans;
      d.push(s);
    }
    return d;
  };
  Slides.readFiles = function () { return readFiles()[who()] || {}; };
  window.Slides = Slides;
})();
