/* Pretend file manager (like File Explorer) for the lessons on files and folders.
   Everything lives in memory: nothing on the real computer is touched.
   ES5 only (Kindle browser). Needs core.js + icons.js.

   Explorer(host, cfg)
     cfg.tree:  [{ n: 'D:', label: 'Du lieu (D:)', t: 'drive', c: [ { n: 'Lop 4A2', t: 'folder', c: [...] }, { n: 'Gioi thieu', t: 'file', k: 'ppt' } ] }]
                file kinds k: ppt | img | doc | vid; sys: true = system item (cannot be changed)
     cfg.open:  path of the folder shown first, e.g. 'D:/Lop 4A2'
     cfg.tasks: [{ text, ok: function (fs) { return fs.has('D:/Lop 4A2/Nhom 2/Thu An'); } }]
     cfg.lesson, cfg.id: star when every task is done
     cfg.height: height of the panes in px
     cfg.search: true = search box at the top right (searches the open folder and everything inside it)
   returns fs: { has(path), node(path), mkdir(path, name), copy(path), paste(path), move(path, toPath), rename(path, name), del(path),
                 open(path), search(term), locate(path) } */
(function () {
  var E = Core.el;
  var FILE_ICON = { ppt: 'slides', img: 'image', doc: 'text', vid: 'video' };
  var uid = 1;

  function build(list, parent) {
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var n = { id: uid++, n: s.n, label: s.label, t: s.t, k: s.k, sys: !!s.sys, parent: parent, c: [] };
      if (s.c) n.c = build(s.c, n);
      out.push(n);
    }
    return out;
  }
  function clone(node, parent) {
    var n = { id: uid++, n: node.n, label: node.label, t: node.t, k: node.k, sys: false, parent: parent, c: [] };
    for (var i = 0; i < node.c.length; i++) n.c.push(clone(node.c[i], n));
    return n;
  }
  function isFolder(n) { return n.t === 'folder' || n.t === 'drive'; }
  function label(n) { return n.label || n.n; }
  function pathOf(n) { var p = []; while (n) { p.unshift(n.n); n = n.parent; } return p.join('/'); }
  function contains(a, b) { while (b) { if (b === a) return true; b = b.parent; } return false; }
  function sortKids(f) {
    f.c.sort(function (a, b) {
      if (isFolder(a) !== isFolder(b)) return isFolder(a) ? -1 : 1;
      return a.n.toLowerCase() < b.n.toLowerCase() ? -1 : 1;
    });
  }

  window.Explorer = function (host, cfg) {
    var roots = build(cfg.tree, null);
    var top = { n: '', c: roots };
    for (var r = 0; r < roots.length; r++) roots[r].parent = null;
    var cur, sel = null, clip = null, renaming = null, confirmDel = null, moving = false, awarded = false, found = null;
    var expanded = {};

    function find(path) {
      var parts = String(path).split('/'), list = roots, node = null;
      for (var i = 0; i < parts.length; i++) {
        node = null;
        for (var j = 0; j < list.length; j++) if (list[j].n.toLowerCase() === parts[i].toLowerCase()) { node = list[j]; break; }
        if (!node) return null;
        list = node.c;
      }
      return node;
    }
    function childNamed(folder, name) {
      for (var i = 0; i < folder.c.length; i++) if (folder.c[i].n.toLowerCase() === name.toLowerCase()) return folder.c[i];
      return null;
    }

    /* ---------- DOM ---------- */
    var win = E('div', 'xp');
    var ribbon = E('div', 'xp-ribbon');
    var addr = E('div', 'xp-addr');
    var body = E('div', 'xp-body');
    var treeEl = E('div', 'xp-tree');
    var listEl = E('div', 'xp-list');
    var moveMenu = E('div', 'xp-move');
    var fb = E('div', 'feedback');
    fb.setAttribute('aria-live', 'polite');
    if (cfg.height) { treeEl.style.height = cfg.height + 'px'; listEl.style.height = cfg.height + 'px'; }
    body.appendChild(treeEl);
    body.appendChild(listEl);
    win.appendChild(ribbon);
    var addrRow = E('div', 'xp-addr-row');
    addrRow.appendChild(addr);
    var sInput = null;
    if (cfg.search) {
      var sBox = E('form', 'xp-search');
      sInput = E('input', 'xp-search-in');
      sInput.setAttribute('placeholder', 'Search');
      sInput.setAttribute('aria-label', 'Ô tìm kiếm');
      var sBtn = E('button', 'xp-search-go', Core.icon('search'));
      sBtn.setAttribute('aria-label', 'Tìm');
      sBox.appendChild(sInput); sBox.appendChild(sBtn);
      sBox.addEventListener('submit', function (ev) { ev.preventDefault(); search(sInput.value); });
      addrRow.appendChild(sBox);
    }
    win.appendChild(addrRow);
    win.appendChild(body);
    win.appendChild(moveMenu);
    host.appendChild(win);
    var tasksEl = null;
    if (cfg.tasks && cfg.tasksHost) { tasksEl = E('ul', 'checklist xp-tasks'); cfg.tasksHost.appendChild(tasksEl); }
    host.appendChild(fb);

    var BTN = [
      ['newf', 'New folder', 'folder', 'Tạo thư mục mới'],
      ['rename', 'Rename', 'rename', 'Đổi tên'],
      ['del', 'Delete', 'trash', 'Xoá'],
      ['copy', 'Copy', 'copy', 'Sao chép'],
      ['paste', 'Paste', 'paste', 'Dán'],
      ['move', 'Move to', 'forward', 'Di chuyển tới']
    ];
    var btns = {};
    if (cfg.onReset) {
      var rb = E('button', 'xp-btn xp-reset', Core.icon('reset') + '<span>Làm lại</span>');
      rb.setAttribute('title', 'Làm lại từ đầu');
      Core.on(rb, function () { cfg.onReset(); });
      ribbon.appendChild(rb);
    }
    for (var b = 0; b < BTN.length; b++) {
      (function (d) {
        var el = E('button', 'xp-btn', Core.icon(d[2]) + '<span>' + d[1] + '</span>');
        el.setAttribute('title', d[3]);
        el.setAttribute('aria-label', d[1] + ' (' + d[3] + ')');
        Core.on(el, function () { act(d[0]); });
        ribbon.appendChild(el);
        btns[d[0]] = el;
      })(BTN[b]);
    }

    function say(t, type) { Core.say(fb, t, type || 'info'); }
    function q(n) { return '"<b>' + esc(label(n)) + '</b>"'; }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function blockSys(n, what) {
      if (!n.sys) return false;
      say('Ối! ' + q(n) + ' là của <b>hệ thống máy tính</b>. ' + what + ' nó có thể làm <b>lỗi chương trình, treo máy</b>. Em chỉ nên thao tác với tệp và thư mục do mình tạo ra.', 'bad');
      if (cfg.onOp) cfg.onOp('sys', { node: n });
      return true;
    }

    function act(op) {
      confirmDel = null;
      if (op !== 'move') { moving = false; moveMenu.innerHTML = ''; }
      if (found && (op === 'newf' || op === 'paste')) { found = null; if (sInput) sInput.value = ''; }
      if (op === 'newf') {
        var name = 'New folder', k = 2;
        while (childNamed(cur, name)) name = 'New folder (' + (k++) + ')';
        var nf = { id: uid++, n: name, t: 'folder', parent: cur, c: [] };
        cur.c.push(nf); sortKids(cur);
        sel = nf; renaming = nf;
        say('Đã tạo thư mục mới. Gõ tên cho thư mục rồi nhấn <b>Enter</b>.', 'info');
        done('mkdir', { node: nf });
      } else if (op === 'rename') {
        if (!sel) return say('Em chạm chọn một tệp hoặc thư mục trước, rồi bấm <b>Rename</b>.');
        if (blockSys(sel, 'Đổi tên')) return;
        renaming = sel;
        say('Gõ tên mới rồi nhấn <b>Enter</b>.');
      } else if (op === 'del') {
        if (!sel) return say('Em chạm chọn thứ cần xoá trước nha.');
        if (blockSys(sel, 'Xoá')) return;
        confirmDel = sel;
      } else if (op === 'copy') {
        if (!sel) return say('Em chạm chọn tệp hoặc thư mục cần sao chép trước nha.');
        clip = sel;
        say('Đã <b>Copy</b> ' + q(sel) + '. Giờ mở thư mục muốn dán tới rồi bấm <b>Paste</b>.', 'good');
      } else if (op === 'paste') {
        if (!clip) return say('Chưa có gì để dán. Em chọn một thứ rồi bấm <b>Copy</b> trước.');
        if (contains(clip, cur) && clip.t !== 'file') return say('Không dán một thư mục vào bên trong chính nó được.', 'bad');
        var c = clone(clip, cur);
        while (childNamed(cur, c.n)) c.n = c.n + ' - Copy';
        c.label = null;
        cur.c.push(c); sortKids(cur);
        sel = c;
        say('Đã <b>Paste</b>: ' + q(c) + ' giờ có ở cả chỗ cũ và chỗ mới.', 'good');
        done('paste', { node: c });
      } else if (op === 'move') {
        if (!sel) return say('Em chạm chọn thứ cần di chuyển trước, rồi bấm <b>Move to</b>.');
        if (blockSys(sel, 'Di chuyển')) return;
        moving = !moving;
        renderMove();
      }
      render();
    }

    function plain(s) { return Core.plain ? Core.plain(String(s)).toLowerCase() : String(s).toLowerCase(); }
    function search(term) {
      term = String(term || '').replace(/^\s+|\s+$/g, '');
      if (!term) { say('Em gõ tên (hoặc một phần tên) tệp, thư mục cần tìm vào ô <b>Search</b> rồi nhấn <b>Enter</b>.'); return; }
      var hits = [], key = plain(term).replace(/[\s_-]+/g, '');
      (function walk(list) {
        for (var i = 0; i < list.length; i++) {
          if (plain(list[i].n).replace(/[\s_-]+/g, '').indexOf(key) >= 0) hits.push(list[i]);
          walk(list[i].c);
        }
      })(cur.c);
      found = { term: term, base: cur, hits: hits };
      if (sInput) sInput.value = term;
      sel = null; renaming = null; confirmDel = null; moving = false; moveMenu.innerHTML = '';
      if (hits.length) say('Tìm thấy <b>' + hits.length + '</b> kết quả trong ' + q(cur) + '. Chạm hai lần vào một kết quả để mở thư mục chứa nó.', 'info');
      else say('Không tìm thấy gì tên giống "<b>' + esc(term) + '</b>" trong ' + q(cur) + '. Em thử mở thư mục lớn hơn rồi tìm lại nha.', 'bad');
      done('search', { term: term, base: cur, hits: hits });
      render();
    }
    function locate(n) {
      found = null; cur = isFolder(n) ? n : n.parent; sel = isFolder(n) ? null : n;
      var o = cur; while (o) { expanded[o.id] = 1; o = o.parent; }
      if (sInput) sInput.value = '';
      say(isFolder(n) ? 'Đã mở thư mục ' + q(n) + '.' : 'Đã mở thư mục chứa tệp ' + q(n) + ': đó là ' + q(cur) + '.', 'good');
      done('locate', { node: n });
      render();
    }

    function renderMove() {
      moveMenu.innerHTML = '';
      if (!moving || !sel) return;
      moveMenu.appendChild(E('div', 'xp-move-title', 'Di chuyển ' + q(sel) + ' tới thư mục nào?'));
      var all = [];
      (function walk(list) { for (var i = 0; i < list.length; i++) if (isFolder(list[i])) { all.push(list[i]); walk(list[i].c); } })(roots);
      for (var i = 0; i < all.length; i++) {
        (function (f) {
          if (f.sys || contains(sel, f) || f === sel.parent) return;
          var depth = pathOf(f).split('/').length - 1;
          var b = E('button', 'xp-move-item', Core.icon(f.t === 'drive' ? 'harddisk' : 'folder') + '<span></span>');
          b.style.paddingLeft = (8 + depth * 14) + 'px';
          b.lastChild.appendChild(document.createTextNode(label(f)));
          Core.on(b, function () {
            if (childNamed(f, sel.n)) return say('Trong ' + q(f) + ' đã có thứ tên giống vậy rồi.', 'bad');
            var from = sel.parent;
            from.c.splice(from.c.indexOf(sel), 1);
            sel.parent = f; f.c.push(sel); sortKids(f);
            moving = false; moveMenu.innerHTML = '';
            say('Đã <b>di chuyển</b> ' + q(sel) + ' tới ' + q(f) + '. Ở chỗ cũ không còn nữa.', 'good');
            expanded[f.id] = 1;
            done('move', { node: sel, to: f, from: from });
            render();
          });
          moveMenu.appendChild(b);
        })(all[i]);
      }
      var cancel = E('button', 'btn btn-small', 'Thôi');
      Core.on(cancel, function () { moving = false; renderMove(); });
      moveMenu.appendChild(cancel);
    }

    function commitRename(input) {
      var n = renaming;
      if (!n) return;
      var v = input.value.replace(/^\s+|\s+$/g, '');
      renaming = null;
      if (!v) { say('Tên không được để trống.', 'bad'); render(); return; }
      var other = childNamed(n.parent, v);
      if (other && other !== n) { say('Ở đây đã có thứ tên "' + esc(v) + '" rồi. Chọn tên khác nha.', 'bad'); render(); return; }
      var old = n.n;
      n.n = v; n.label = null; sortKids(n.parent);
      if (old !== v) { say('Đã đổi tên thành ' + q(n) + '.', 'good'); done('rename', { node: n, old: old }); }
      render();
    }

    function render() {
      /* address bar */
      addr.innerHTML = Core.icon(found ? 'search' : 'folderOpen') + '<span></span>';
      var parts = [], x = cur;
      while (x) { parts.unshift(label(x)); x = x.parent; }
      addr.lastChild.appendChild(document.createTextNode(found ? 'Kết quả tìm trong ' + label(cur) : 'This PC  ›  ' + parts.join('  ›  ')));
      /* tree */
      treeEl.innerHTML = '';
      var pc = E('div', 'xp-node xp-pc', Core.icon('monitor') + '<span>This PC</span>');
      treeEl.appendChild(pc);
      (function walk(list, depth) {
        for (var i = 0; i < list.length; i++) {
          (function (n) {
            if (!isFolder(n)) return;
            var hasSub = false;
            for (var k = 0; k < n.c.length; k++) if (isFolder(n.c[k])) hasSub = true;
            var open = expanded[n.id] || contains(n, cur);
            var row = E('button', 'xp-node' + (n === cur ? ' is-cur' : ''),
              '<span class="xp-tw">' + (hasSub ? (open ? '–' : '+') : '') + '</span>' + Core.icon(n.t === 'drive' ? 'harddisk' : 'folder') + '<span></span>');
            row.style.paddingLeft = (4 + depth * 14) + 'px';
            row.lastChild.appendChild(document.createTextNode(label(n)));
            Core.on(row, function () {
              if (n === cur && hasSub && !found) expanded[n.id] = !open; else { cur = n; sel = null; expanded[n.id] = 1; }
              found = null; if (sInput) sInput.value = '';
              renaming = null; confirmDel = null; moving = false; moveMenu.innerHTML = '';
              render();
            });
            treeEl.appendChild(row);
            if (open) walk(n.c, depth + 1);
          })(list[i]);
        }
      })(roots, 1);
      /* list */
      listEl.innerHTML = '';
      listEl.appendChild(E('div', 'xp-head', '<span>Name</span><span>' + (found ? 'Nằm ở' : 'Type') + '</span>'));
      if (found) {
        if (!found.hits.length) listEl.appendChild(E('div', 'xp-empty', 'Không có kết quả nào.'));
        for (var h = 0; h < found.hits.length; h++) {
          (function (n) {
            var ico = isFolder(n) ? 'folder' : (FILE_ICON[n.k] || 'file');
            var row = E('div', 'xp-item' + (n === sel ? ' is-sel' : '') + (isFolder(n) ? ' is-folder' : ' is-file k-' + (n.k || 'file')));
            row.innerHTML = Core.icon(ico) + '<span class="xp-name"></span><span class="xp-type"></span>';
            row.querySelector('.xp-name').appendChild(document.createTextNode(label(n)));
            row.querySelector('.xp-type').appendChild(document.createTextNode(pathOf(n.parent).replace(/\//g, ' › ')));
            Core.on(row, function () { if (sel === n) locate(n); else { sel = n; render(); } });
            listEl.appendChild(row);
          })(found.hits[h]);
        }
        btns.paste.disabled = !clip;
        renderTasks();
        return;
      }
      if (!cur.c.length) listEl.appendChild(E('div', 'xp-empty', 'Thư mục này đang trống.'));
      for (var i = 0; i < cur.c.length; i++) {
        (function (n) {
          var ico = isFolder(n) ? 'folder' : (FILE_ICON[n.k] || 'file');
          var row = E('div', 'xp-item' + (n === sel ? ' is-sel' : '') + (isFolder(n) ? ' is-folder' : ' is-file k-' + (n.k || 'file')));
          row.innerHTML = Core.icon(ico) + '<span class="xp-name"></span><span class="xp-type">' + (isFolder(n) ? 'File folder' : typeName(n.k)) + '</span>';
          if (n === renaming) {
            var input = E('input', 'xp-rename');
            input.value = n.n;
            input.setAttribute('aria-label', 'Tên mới');
            input.addEventListener('keydown', function (ev) { if (ev.keyCode === 13) { ev.preventDefault(); commitRename(input); } if (ev.keyCode === 27) { renaming = null; render(); } });
            input.addEventListener('blur', function () { if (renaming === n) commitRename(input); });
            row.querySelector('.xp-name').appendChild(input);
            setTimeout(function () { try { input.focus(); input.select(); } catch (e) {} }, 0);
          } else {
            row.querySelector('.xp-name').appendChild(document.createTextNode(label(n)));
            Core.on(row, function () {
              if (sel === n && isFolder(n)) { cur = n; sel = null; expanded[n.id] = 1; }
              else sel = n;
              confirmDel = null; moving = false; moveMenu.innerHTML = '';
              render();
            });
          }
          listEl.appendChild(row);
          if (n === confirmDel) {
            var bar = E('div', 'xp-confirm', '<span>Xoá ' + q(n) + '? Xoá rồi là mất luôn đó.</span>');
            var yes = E('button', 'btn btn-small', Core.icon('trash') + 'Xoá');
            var no = E('button', 'btn btn-small', 'Thôi');
            Core.on(yes, function (ev) {
              ev.stopPropagation();
              n.parent.c.splice(n.parent.c.indexOf(n), 1);
              if (clip && contains(n, clip)) clip = null;
              sel = null; confirmDel = null;
              say('Đã xoá ' + q(n) + '.', 'good');
              done('del', { node: n });
              render();
            });
            Core.on(no, function (ev) { ev.stopPropagation(); confirmDel = null; render(); });
            bar.appendChild(yes); bar.appendChild(no);
            listEl.appendChild(bar);
          }
        })(cur.c[i]);
      }
      btns.paste.disabled = !clip;
      renderTasks();
    }
    function typeName(k) { return { ppt: 'Bài trình chiếu', img: 'Tệp hình ảnh', doc: 'Văn bản', vid: 'Video' }[k] || 'Tệp'; }

    var fs = {
      has: function (p) { return !!find(p); },
      node: find,
      kids: function (p) { var n = find(p); return n ? n.c.length : -1; },
      mkdir: function (p, name) { var f = find(p); if (!f) return; var nf = { id: uid++, n: name, t: 'folder', parent: f, c: [] }; f.c.push(nf); sortKids(f); done('mkdir', { node: nf }); render(); },
      copy: function (p) { clip = find(p); },
      paste: function (p) { var f = find(p); if (!f || !clip) return; cur = f; act('paste'); },
      move: function (p, to) { var n = find(p), f = find(to); if (!n || !f) return; n.parent.c.splice(n.parent.c.indexOf(n), 1); n.parent = f; f.c.push(n); sortKids(f); done('move', { node: n, to: f }); render(); },
      rename: function (p, name) { var n = find(p); if (!n) return; var old = n.n; n.n = name; n.label = null; sortKids(n.parent); done('rename', { node: n, old: old }); render(); },
      del: function (p) { var n = find(p); if (!n) return; n.parent.c.splice(n.parent.c.indexOf(n), 1); done('del', { node: n }); render(); },
      open: function (p) { var n = find(p); if (!n) return; found = null; cur = n; sel = null; render(); },
      search: function (t) { search(t); },
      locate: function (p) { var n = find(p); if (n) locate(n); },
      cur: function () { return pathOf(cur); }
    };

    var taskDone = {};
    function renderTasks() {
      if (!tasksEl) return;
      tasksEl.innerHTML = '';
      for (var i = 0; i < cfg.tasks.length; i++) {
        var ok = !!taskDone[i];
        var li = E('li', ok ? 'done' : '', '<span class="ico">' + (ok ? Icons.check : Icons.starEmpty) + '</span><span>' + cfg.tasks[i].text + '</span>');
        tasksEl.appendChild(li);
      }
    }
    function done(op, info) {
      if (cfg.onOp) cfg.onOp(op, info, fs);
      if (!cfg.tasks) return;
      var all = true;
      for (var i = 0; i < cfg.tasks.length; i++) {
        /* tasks are done in order: a later one only counts once the earlier ones are done */
        if (!taskDone[i]) {
          if (all && cfg.tasks[i].ok(fs, op, info)) taskDone[i] = true;
          else all = false;
        }
      }
      if (all && !awarded) {
        awarded = true;
        setTimeout(function () { Core.celebrate(fb, cfg.lesson, cfg.id, cfg.doneText || 'Em làm xong tất cả nhiệm vụ rồi!'); }, 0);
      }
    }

    cur = (cfg.open && find(cfg.open)) || roots[0];
    var o = cur; while (o) { expanded[o.id] = 1; o = o.parent; }
    say(cfg.hello || 'Chạm vào một thư mục bên trái để mở. Bên phải: chạm một lần để <b>chọn</b>, chạm lần nữa vào thư mục để <b>mở</b>.', 'info');
    render();
    return fs;
  };

  /* static tree picture (for "before / after" illustrations) */
  Explorer.treeHTML = function (tree, mark) {
    var html = '<div class="xp-static">';
    (function walk(list, depth) {
      for (var i = 0; i < list.length; i++) {
        var n = list[i];
        var ico = n.t === 'drive' ? 'harddisk' : n.t === 'file' ? (FILE_ICON[n.k] || 'file') : 'folder';
        html += '<div class="xp-srow' + (mark && mark[n.n] ? ' is-mark' : '') + '" style="padding-left:' + (depth * 16) + 'px">' + Core.icon(ico) + '<span>' + (n.label || n.n) + '</span></div>';
        if (n.c) walk(n.c, depth + 1);
      }
    })(tree, 0);
    return html + '</div>';
  };
})();
