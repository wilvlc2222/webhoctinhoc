/* Pretend word processor (like Word) for the lessons on typing and editing text.
   The page is a real textarea, so selecting, Backspace, Delete and the arrow keys work as usual;
   the ribbon adds Cut / Copy / Paste, Insert Picture, and File Open / Save / Exit.
   Files are kept per learner in localStorage (same store as slides.js).
   ES5 only. Needs core.js, icons.js, art.js; telex.js optional.

   var doc = DocSim(host, cfg)
     cfg.text, cfg.pics, cfg.ime, cfg.folders, cfg.fileName, cfg.sampleFiles: [{ path, text, pics }]
     cfg.tasks: [{ text, ok: function (doc, what) {} }], cfg.tasksHost, cfg.lesson, cfg.id, cfg.doneText, cfg.rows */
(function () {
  var E = Core.el;
  var STORE = 'whth-files';
  function readFiles() { try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { return {}; } }
  function writeFiles(all) { try { localStorage.setItem(STORE, JSON.stringify(all)); } catch (e) {} }
  function who() { return '@' + (Core.currentName() || 'khach'); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  window.DocSim = function (host, cfg) {
    cfg = cfg || {};
    var pics = (cfg.pics || []).slice();
    var clip = '', savedAs = null, exited = false, opened = null, dirty = false, awarded = false;
    var used = {};

    var app = E('div', 'ss ds');
    var titleBar = E('div', 'ss-titlebar ds-titlebar');
    var tabsRow = E('div', 'ss-tabs');
    var ribbon = E('div', 'ss-ribbon');
    var pageWrap = E('div', 'ds-pagewrap');
    var page = E('div', 'ds-page');
    var ta = E('textarea', 'ds-text');
    ta.setAttribute('aria-label', 'Vùng soạn thảo văn bản');
    ta.setAttribute('rows', String(cfg.rows || 8));
    ta.value = cfg.text || '';
    var picRow = E('div', 'ds-pics');
    page.appendChild(ta);
    page.appendChild(picRow);
    pageWrap.appendChild(page);
    var overlay = E('div', 'ss-overlay');
    app.appendChild(titleBar);
    app.appendChild(tabsRow);
    app.appendChild(ribbon);
    app.appendChild(pageWrap);
    app.appendChild(overlay);
    var closedEl = E('div', 'ss-closed');
    var fb = E('div', 'feedback');
    fb.setAttribute('aria-live', 'polite');
    host.appendChild(app);
    host.appendChild(closedEl);
    host.appendChild(fb);
    var tasksEl = null;
    if (cfg.tasks && cfg.tasksHost) { tasksEl = E('ul', 'checklist'); cfg.tasksHost.appendChild(tasksEl); }
    function say(t, type) { Core.say(fb, t, type || 'info'); }

    var imeMode = function () { return 'off'; };
    var TABS = cfg.ribbon || ['file', 'home', 'insert'];
    var NAMES = { file: 'File', home: 'Home', insert: 'Insert' };
    var tab = 'home';
    function renderTabs() {
      tabsRow.innerHTML = '';
      for (var i = 0; i < TABS.length; i++) {
        (function (t) {
          var b = E('button', 'ss-tab' + (t === tab ? ' is-on' : '') + (t === 'file' ? ' ss-file' : ''), NAMES[t]);
          Core.on(b, function () { tab = t; renderTabs(); renderRibbon(); });
          tabsRow.appendChild(b);
        })(TABS[i]);
      }
      if (cfg.ime && window.Telex) {
        var h = E('span', 'ss-ime');
        h.style.marginLeft = 'auto';
        tabsRow.appendChild(h);
        imeMode = Telex.switcher(h, 'telex');
      }
    }
    function rbtn(label, title, fn) {
      var b = E('button', 'ss-rb', label);
      b.setAttribute('title', title); b.setAttribute('aria-label', title);
      /* keep the selection in the textarea when a ribbon button is pressed */
      b.addEventListener('mousedown', function (e) { e.preventDefault(); }, false);
      Core.on(b, fn);
      return b;
    }
    function group(name) { var g = E('div', 'ss-group'); var inner = E('div', 'ss-gin'); g.appendChild(inner); g.appendChild(E('div', 'ss-gname', name)); ribbon.appendChild(g); return inner; }

    /* text helpers */
    var lastSel = { s: 0, e: 0 };
    function remember() { lastSel = { s: ta.selectionStart, e: ta.selectionEnd }; }
    ta.addEventListener('select', remember, false);
    ta.addEventListener('keyup', remember, false);
    ta.addEventListener('mouseup', remember, false);
    ta.addEventListener('touchend', remember, false);
    ta.addEventListener('blur', remember, false);
    function sel() { return document.activeElement === ta ? { s: ta.selectionStart, e: ta.selectionEnd } : lastSel; }
    function setText(v, caret) {
      ta.value = v;
      if (ta._telexSync) ta._telexSync();
      try { ta.focus(); ta.setSelectionRange(caret, caret); } catch (e) {}
      lastSel = { s: caret, e: caret };
      dirty = true; renderTitle(); changed('text');
    }
    function cut() {
      var r = sel();
      if (r.s === r.e) return say('Em <b>chọn phần văn bản</b> trước (kéo chuột, hoặc chạm giữ rồi kéo), rồi bấm <b>Cut</b>.');
      clip = ta.value.slice(r.s, r.e); used.cut = true;
      setText(ta.value.slice(0, r.s) + ta.value.slice(r.e), r.s);
      say('Đã <b>Cut</b> (cắt) "' + esc(clip.slice(0, 40)) + '". Đặt con trỏ ở chỗ mới rồi bấm <b>Paste</b>.', 'good');
    }
    function copy() {
      var r = sel();
      if (r.s === r.e) return say('Em <b>chọn phần văn bản</b> trước, rồi bấm <b>Copy</b>.');
      clip = ta.value.slice(r.s, r.e); used.copy = true;
      say('Đã <b>Copy</b> "' + esc(clip.slice(0, 40)) + '". Đặt con trỏ ở chỗ cần dán rồi bấm <b>Paste</b>.', 'good');
      changed('copy');
    }
    function paste() {
      if (!clip) return say('Chưa có gì để dán. Em chọn văn bản rồi bấm Copy hoặc Cut trước.');
      var r = sel(); used.paste = true;
      setText(ta.value.slice(0, r.s) + clip + ta.value.slice(r.e), r.s + clip.length);
      say('Đã <b>Paste</b> (dán).', 'good');
    }
    function key(k) {
      var r = sel(), v = ta.value;
      if (k === 'bs') {
        if (r.s !== r.e) setText(v.slice(0, r.s) + v.slice(r.e), r.s);
        else if (r.s > 0) setText(v.slice(0, r.s - 1) + v.slice(r.s), r.s - 1);
      } else if (k === 'del') {
        if (r.s !== r.e) setText(v.slice(0, r.s) + v.slice(r.e), r.s);
        else if (r.s < v.length) setText(v.slice(0, r.s) + v.slice(r.s + 1), r.s);
      } else if (k === 'left' || k === 'right') {
        var p = Math.max(0, Math.min(v.length, (k === 'left' ? r.s - 1 : r.e + 1)));
        try { ta.focus(); ta.setSelectionRange(p, p); } catch (e) {}
        lastSel = { s: p, e: p };
      }
    }
    function renderRibbon() {
      ribbon.innerHTML = '';
      if (tab === 'file') {
        var g = group('File');
        g.appendChild(rbtn(Core.icon('folderOpen') + '<span>Open</span>', 'Mở tệp', openDialog));
        g.appendChild(rbtn(Core.icon('download') + '<span>Save</span>', 'Lưu tệp', function () { saveDialog(); }));
        g.appendChild(rbtn(Core.icon('cross') + '<span>Exit</span>', 'Thoát khỏi phần mềm', exitApp));
      } else if (tab === 'home') {
        var gc = group('Clipboard');
        gc.appendChild(rbtn(Core.icon('paste') + '<span>Paste</span>', 'Dán (Ctrl+V)', paste));
        gc.appendChild(rbtn(Core.icon('cut') + '<span>Cut</span>', 'Cắt (Ctrl+X)', cut));
        gc.appendChild(rbtn(Core.icon('copy') + '<span>Copy</span>', 'Sao chép (Ctrl+C)', copy));
        var gk = group('Phím sửa chữ');
        gk.appendChild(rbtn('<span class="ds-key">&larr;</span>', 'Mũi tên trái: lùi con trỏ', function () { key('left'); }));
        gk.appendChild(rbtn('<span class="ds-key">&rarr;</span>', 'Mũi tên phải: tiến con trỏ', function () { key('right'); }));
        gk.appendChild(rbtn('<span class="ds-key">Backspace</span>', 'Backspace: xoá kí tự bên trái con trỏ', function () { key('bs'); }));
        gk.appendChild(rbtn('<span class="ds-key">Delete</span>', 'Delete: xoá kí tự bên phải con trỏ', function () { key('del'); }));
      } else if (tab === 'insert') {
        var gi = group('Illustrations');
        gi.appendChild(rbtn(Core.icon('image') + '<span>Picture</span>', 'Chèn ảnh vào văn bản', pictureDialog));
      }
    }

    /* dialogs */
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
    function pictureDialog() {
      var body = E('div', 'ss-gallery');
      var names = cfg.pictures || ['flower', 'hills', 'kids', 'school', 'lake', 'sea', 'ball', 'lantern', 'bridge', 'town'];
      for (var i = 0; i < names.length; i++) {
        (function (n) {
          var b = E('button', 'ss-gpic', Art.svg(n));
          Core.on(b, function () { pics.push(n); dirty = true; closeDialog(); renderPics(); renderTitle(); say('Đã chèn ảnh vào văn bản.', 'good'); changed('pic'); });
          body.appendChild(b);
        })(names[i]);
      }
      dialog('Insert Picture: chọn ảnh', body, [btn('Cancel', closeDialog)]);
    }
    function saveDialog(after) {
      var body = E('div', 'ss-save');
      body.appendChild(E('div', 'ss-dlabel', 'Lưu vào thư mục:'));
      var folders = cfg.folders || ['D:/Lop 4A2/Nhom 2/Thu An'];
      var fsel = E('select', 'ss-sel ss-folder');
      for (var i = 0; i < folders.length; i++) { var o = E('option', '', folders[i]); o.value = folders[i]; fsel.appendChild(o); }
      if (savedAs) fsel.value = savedAs.folder;
      body.appendChild(fsel);
      body.appendChild(E('div', 'ss-dlabel', 'File name (tên tệp):'));
      var name = E('input', 'ss-name');
      name.value = savedAs ? savedAs.name : (cfg.fileName || '');
      body.appendChild(name);
      dialog('Save As', body, [btn('Save', function () {
        var n = name.value.replace(/^\s+|\s+$/g, '');
        if (!n) { name.focus(); return; }
        doSave(n, fsel.value);
        closeDialog();
        if (after) after();
      }, true), btn('Cancel', closeDialog)]);
    }
    function doSave(n, folder) {
      savedAs = { name: n, folder: folder };
      var all = readFiles(), mine = all[who()] || {};
      mine[folder + '/' + n] = { type: 'doc', text: ta.value, pics: pics.slice() };
      all[who()] = mine; writeFiles(all);
      dirty = false; renderTitle();
      say('Đã lưu tệp <b>' + esc(n) + '</b> vào <b>' + esc(folder) + '</b>.', 'good');
      changed('save');
    }
    function openDialog() {
      var body = E('div', 'ss-open'), mine = readFiles()[who()] || {}, any = false;
      function item(label, fn) {
        var b = E('button', 'ss-openitem', Core.icon('text') + '<span></span>');
        b.lastChild.appendChild(document.createTextNode(label));
        Core.on(b, fn); body.appendChild(b); any = true;
      }
      for (var p in mine) if (mine.hasOwnProperty(p) && mine[p] && mine[p].type === 'doc') (function (p) { item(p, function () { load(mine[p], p); closeDialog(); }); })(p);
      var samples = cfg.sampleFiles || [];
      for (var i = 0; i < samples.length; i++) (function (s) { item(s.path + ' (tệp mẫu)', function () { load(s, s.path); closeDialog(); }); })(samples[i]);
      if (!any) body.appendChild(E('p', '', 'Chưa có tệp văn bản nào được lưu.'));
      dialog('Open: chọn tệp văn bản', body, [btn('Cancel', closeDialog)]);
    }
    function load(f, path) {
      ta.value = f.text || ''; if (ta._telexSync) ta._telexSync();
      pics = (f.pics || []).slice();
      var cut2 = path.lastIndexOf('/');
      savedAs = { folder: path.slice(0, cut2), name: path.slice(cut2 + 1) };
      opened = path; dirty = false;
      renderPics(); renderTitle();
      say('Đã mở tệp <b>' + esc(savedAs.name) + '</b>.', 'good');
      changed('open');
    }
    function exitApp() {
      if (dirty) {
        dialog('Văn bản chưa được lưu', E('p', '', 'Em có muốn lưu lại trước khi thoát không?'),
          [btn('Save', function () { closeDialog(); saveDialog(reallyExit); }, true), btn("Don't Save", function () { closeDialog(); reallyExit(); }), btn('Cancel', closeDialog)]);
        return;
      }
      reallyExit();
    }
    function reallyExit() {
      exited = true; app.style.display = 'none';
      closedEl.innerHTML = '';
      closedEl.appendChild(E('p', '', 'Em đã <b>thoát khỏi</b> phần mềm soạn thảo văn bản.'));
      closedEl.appendChild(btn('Mở lại phần mềm', function () { exited = false; app.style.display = ''; closedEl.innerHTML = ''; }));
      changed('exit');
    }
    function renderPics() {
      picRow.innerHTML = '';
      for (var i = 0; i < pics.length; i++) {
        (function (i) {
          var f = E('div', 'ds-pic', Art.svg(pics[i]));
          var x = E('button', 'ds-picdel', Core.icon('cross'));
          x.setAttribute('aria-label', 'Xoá ảnh này');
          Core.on(x, function () { pics.splice(i, 1); dirty = true; renderPics(); changed('pic'); });
          f.appendChild(x);
          picRow.appendChild(f);
        })(i);
      }
    }
    function renderTitle() {
      titleBar.innerHTML = Core.icon('text') + '<span></span>';
      titleBar.lastChild.appendChild(document.createTextNode((savedAs ? savedAs.name : 'Document1') + ' – Phần mềm soạn thảo văn bản' + (dirty ? ' (chưa lưu)' : '')));
      var x = E('button', 'ss-x', Core.icon('cross'));
      x.setAttribute('aria-label', 'Thoát khỏi phần mềm');
      Core.on(x, exitApp);
      titleBar.appendChild(x);
    }

    if (window.Telex && cfg.ime) Telex.attach(ta, { mode: function () { return imeMode(); } });
    ta.addEventListener('input', function () { dirty = true; renderTitle(); changed('text'); }, false);

    /* tasks */
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
      text: function () { return ta.value; },
      lines: function () { return ta.value.replace(/\r/g, '').split('\n'); },
      pics: function () { return pics.slice(); },
      used: function (k) { return !!used[k]; },
      saved: function () { return savedAs; },
      exited: function () { return exited; },
      opened: function () { return opened; },
      /* for solvers */
      setText: function (v) { setText(v, v.length); },
      addPic: function (n) { pics.push(n); renderPics(); changed('pic'); },
      save: doSave,
      exit: function () { dirty = false; reallyExit(); },
      openFile: function (f, path) { load(f, path); },
      mark: function (k) { used[k] = true; changed(k); }
    };

    renderTabs(); renderRibbon(); renderTitle(); renderPics(); renderTasks();
    say(cfg.hello || 'Chạm vào trang giấy trắng để gõ. Các nút lệnh nằm trên dải lệnh ở trên.', 'info');
    return api;
  };
})();
