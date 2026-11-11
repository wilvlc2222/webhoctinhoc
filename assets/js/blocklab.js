/* BlockLab: a tiny Scratch-like grid game, built for touch and e-ink.
   Kids tap palette blocks to add them to the "target" slot (main program or a
   repeat's body), then press Run and watch the robot follow the program.
   ES5 only (Kindle browser). */
(function () {
  var DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; /* up, right, down, left */
  var HARD_CAP = 30;   /* blocks per program */
  var STEP_CAP = 400;  /* executed steps per run */

  var DEF = {
    fwd: { label: 'đi tới 1 ô', icon: 'arrowUp', cls: 'motion' },
    left: { label: 'quay trái', icon: 'turnLeft', cls: 'motion' },
    right: { label: 'quay phải', icon: 'turnRight', cls: 'motion' },
    repeat: { label: 'lặp lại', icon: 'loop', cls: 'control' }
  };

  function key(x, y) { return x + ',' + y; }
  function toSet(list) {
    var s = {};
    for (var i = 0; i < (list || []).length; i++) s[key(list[i][0], list[i][1])] = 1;
    return s;
  }
  function count(list) {
    var n = 0;
    for (var i = 0; i < list.length; i++) n += 1 + (list[i].t === 'repeat' ? count(list[i].body) : 0);
    return n;
  }

  window.BlockLab = function (host, cfg) {
    var E = Core.el;
    var levelIdx = 0;
    var level, prog, targetId, nextId = 1, running = false, timer = null;
    var robot, walls, starsLeft, visited, fast = false;

    /* ---------- skeleton ---------- */
    var tabs = E('div', 'lab-tabs');
    var info = E('div', 'lab-info');
    var layout = E('div', 'lab-layout');
    var boardWrap = E('div', 'lab-board-wrap');
    var board = E('div', 'lab-board');
    boardWrap.appendChild(board);
    var editor = E('div', 'lab-editor');
    var palette = E('div', 'lab-palette');
    var used = E('div', 'lab-used');
    var progHost = E('div', 'lab-program');
    var controls = E('div', 'lab-controls');
    var fb = E('div', 'feedback'); fb.setAttribute('data-react', '1');
    fb.setAttribute('aria-live', 'polite');

    var runBtn = E('button', 'btn btn-primary', Core.icon('play') + 'Chạy');
    var resetBtn = E('button', 'btn', Core.icon('reset') + 'Về chỗ cũ');
    var clearBtn = E('button', 'btn', Core.icon('trash') + 'Xoá hết');
    controls.appendChild(runBtn);
    controls.appendChild(resetBtn);
    controls.appendChild(clearBtn);

    /* wide screens: board | palette | program, all side by side */
    var palCol = E('div', 'lab-pal-col');
    var progCol = E('div', 'lab-prog-col');
    palCol.appendChild(E('div', 'lab-label', 'Khối lệnh (chạm để thêm):'));
    palCol.appendChild(palette);
    progCol.appendChild(E('div', 'lab-label', 'Chương trình của em:'));
    progCol.appendChild(used);
    progCol.appendChild(progHost);
    editor.appendChild(palCol);
    editor.appendChild(progCol);
    layout.appendChild(boardWrap);
    layout.appendChild(editor);
    var top = E('div', 'lab-top');
    /* cfg.tabsHost lets the page put the level buttons in its own heading row */
    (cfg.tabsHost || top).appendChild(tabs);
    top.appendChild(info);
    host.appendChild(top);
    host.appendChild(layout);

    function isWide() { return Core.isStage(); }
    /* Run buttons and feedback sit under the board on wide screens,
       and after the program on narrow ones (where everything is stacked). */
    function place() {
      var parent = isWide() ? boardWrap : host;
      if (controls.parentNode !== parent) { parent.appendChild(controls); parent.appendChild(fb); }
    }
    place();
    var lastWide = isWide();
    window.addEventListener('resize', function () {
      place();
      if (isWide() !== lastWide) { lastWide = isWide(); renderBoard(); }
    });

    /* palette */
    var types = ['fwd', 'left', 'right', 'repeat'];
    for (var i = 0; i < types.length; i++) {
      (function (t) {
        var b = E('button', 'blk blk-' + DEF[t].cls + ' blk-palette', Core.icon(DEF[t].icon) + '<span>' + DEF[t].label + (t === 'repeat' ? ' ... lần' : '') + '</span>');
        Core.on(b, function () { add(t); });
        palette.appendChild(b);
      })(types[i]);
    }

    /* ---------- program model ---------- */
    function findBody(id, list) {
      if (id === 'main') return prog;
      list = list || prog;
      for (var i = 0; i < list.length; i++) {
        if (list[i].t !== 'repeat') continue;
        if (list[i].id === id) return list[i].body;
        var r = findBody(id, list[i].body);
        if (r) return r;
      }
      return null;
    }
    function findBlock(id, list) {
      list = list || prog;
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) return list[i];
        if (list[i].t === 'repeat') { var r = findBlock(id, list[i].body); if (r) return r; }
      }
      return null;
    }
    function removeBlock(id, list) {
      list = list || prog;
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) { list.splice(i, 1); return true; }
        if (list[i].t === 'repeat' && removeBlock(id, list[i].body)) return true;
      }
      return false;
    }
    function add(t) {
      if (running) return;
      if (count(prog) >= HARD_CAP) { Core.say(fb, 'Chương trình dài quá rồi. Thử dùng lặp lại cho gọn nha.', 'bad'); return; }
      var body = findBody(targetId) || prog;
      var b = { id: 'k' + (nextId++), t: t };
      if (t === 'repeat') { b.n = level.defaultRepeat || 3; b.body = []; }
      body.push(b);
      if (t === 'repeat') {
        targetId = b.id; /* new blocks now go inside the loop */
        Core.say(fb, 'Khối tiếp theo sẽ vào <b>bên trong</b> "lặp lại". Muốn thêm ra ngoài, chạm vào "Chương trình chính".', 'info');
      }
      renderProgram();
    }

    /* ---------- program view ---------- */
    function renderSlot(list, id, title) {
      var slot = E('div', 'lab-slot' + (targetId === id ? ' is-target' : ''));
      if (title) slot.appendChild(E('div', 'lab-slot-title', title));
      for (var i = 0; i < list.length; i++) slot.appendChild(renderBlock(list[i]));
      /* a filled slot that is not the target needs no hint line: keeps long programs short */
      if (targetId === id || !list.length) {
        slot.appendChild(E('div', 'lab-slot-hint', targetId === id ? '&#9654; khối mới sẽ vào đây' : 'chạm để thêm khối vào đây'));
      }
      Core.on(slot, function (ev) {
        ev.stopPropagation();
        if (running) return;
        targetId = id;
        renderProgram();
      });
      return slot;
    }
    function renderBlock(b) {
      var d = DEF[b.t];
      var el = E('div', 'blk blk-' + d.cls + ' blk-in');
      el.id = 'blk-' + b.id;
      var head = E('div', 'blk-head');
      head.innerHTML = Core.icon(d.icon) + '<span>' + d.label + '</span>';
      if (b.t === 'repeat') {
        var minus = E('button', 'blk-num-btn', Core.icon('minus'));
        minus.setAttribute('aria-label', 'Bớt 1 lần');
        var num = E('span', 'blk-num', String(b.n));
        var plus = E('button', 'blk-num-btn', Core.icon('plus'));
        plus.setAttribute('aria-label', 'Thêm 1 lần');
        var iter = E('span', 'blk-iter');
        iter.id = 'iter-' + b.id;
        Core.on(minus, function (ev) { ev.stopPropagation(); if (!running && b.n > 2) { b.n--; num.innerHTML = b.n; } });
        Core.on(plus, function (ev) { ev.stopPropagation(); if (!running && b.n < 12) { b.n++; num.innerHTML = b.n; } });
        head.appendChild(minus);
        head.appendChild(num);
        head.appendChild(plus);
        head.appendChild(E('span', '', 'lần'));
        head.appendChild(iter);
      }
      var del = E('button', 'blk-del', Core.icon('cross'));
      del.setAttribute('aria-label', 'Xoá khối này');
      Core.on(del, function (ev) {
        ev.stopPropagation();
        if (running) return;
        removeBlock(b.id);
        if (!findBody(targetId)) targetId = 'main';
        renderProgram();
      });
      head.appendChild(del);
      el.appendChild(head);
      if (b.t === 'repeat') {
        el.appendChild(renderSlot(b.body, b.id, null));
        el.appendChild(E('div', 'blk-foot'));
      }
      return el;
    }
    function renderProgram() {
      progHost.innerHTML = '';
      progHost.appendChild(renderSlot(prog, 'main', 'Chương trình chính'));
      var n = count(prog);
      var over = level.max && n > level.max;
      used.className = 'lab-used' + (over ? ' over' : '');
      used.innerHTML = level.max ? 'Đã dùng <b>' + n + '</b> / ' + level.max + ' khối' + (over ? ' (nhiều quá!)' : '') : 'Đã dùng <b>' + n + '</b> khối';
    }

    /* ---------- board ---------- */
    function cellAt(x, y) { return document.getElementById('cell-' + x + '-' + y); }
    function renderBoard() {
      board.innerHTML = '';
      /* on wide screens the app is a fixed 1300x700 stage: the board gets 280px of height */
      var cell = 64;
      if (isWide()) cell = Math.min(64, Math.floor(280 / level.rows));
      board.style.maxWidth = Math.min(level.cols * cell, 460) + 'px';
      for (var y = 0; y < level.rows; y++) {
        var row = E('div', 'lab-row');
        for (var x = 0; x < level.cols; x++) {
          var c = E('div', 'lab-cell');
          c.id = 'cell-' + x + '-' + y;
          var k = key(x, y);
          if (walls[k]) { Core.addClass(c, 'wall'); c.innerHTML = '<span class="cell-in">' + Core.icon('rock') + '</span>'; }
          else if (starsLeft[k]) c.innerHTML = '<span class="cell-in">' + Core.icon('star', 'cell-star') + '</span>';
          else if (level.goal && level.goal[0] === x && level.goal[1] === y) c.innerHTML = '<span class="cell-in">' + Core.icon('flag', 'cell-flag') + '</span>';
          if (visited[k]) Core.addClass(c, 'trail');
          row.appendChild(c);
        }
        board.appendChild(row);
      }
      var rc = cellAt(robot.x, robot.y);
      if (rc) {
        var r = E('span', 'cell-in lab-robot dir-' + robot.d, Icons.robot);
        rc.appendChild(r);
      }
    }
    function resetWorld() {
      stop();
      robot = { x: level.start[0], y: level.start[1], d: level.start[2] };
      walls = toSet(level.walls);
      starsLeft = toSet(level.stars);
      visited = {};
      visited[key(robot.x, robot.y)] = 1;
      clearHighlights();
      renderBoard();
    }

    /* ---------- execution ---------- */
    /* anc = ids of the repeat blocks that contain this step, for highlighting */
    function compile(list, out, anc) {
      anc = anc || [];
      for (var i = 0; i < list.length && out.length < STEP_CAP; i++) {
        var b = list[i];
        if (b.t === 'repeat') {
          var inner = anc.concat([b.id]);
          for (var r = 1; r <= b.n && out.length < STEP_CAP; r++) {
            out.push({ op: 'iter', id: b.id, i: r, n: b.n, anc: anc });
            compile(b.body, out, inner);
          }
        } else out.push({ op: b.t, id: b.id, anc: anc });
      }
      return out;
    }
    function clearHighlights() {
      var els = progHost.querySelectorAll('.is-running');
      for (var i = 0; i < els.length; i++) Core.removeClass(els[i], 'is-running');
      var its = progHost.querySelectorAll('.blk-iter');
      for (var j = 0; j < its.length; j++) its[j].innerHTML = '';
    }
    function stop() {
      if (timer) clearTimeout(timer);
      timer = null;
      running = false;
      Core.removeClass(host, 'is-running');
      runBtn.innerHTML = Core.icon('play') + 'Chạy';
    }
    function starCount() { var n = 0; for (var k in starsLeft) if (starsLeft.hasOwnProperty(k)) n++; return n; }

    function run() {
      if (running) { stop(); Core.say(fb, 'Đã dừng.', 'info'); return; }
      if (!prog.length) { Core.say(fb, 'Chương trình còn trống. Em chạm vào khối lệnh để thêm nha.', 'info'); return; }
      resetWorld();
      /* stacked layout (phone/Kindle): the board is above the editor, bring it into view */
      if (window.innerWidth <= 680 && boardWrap.scrollIntoView) boardWrap.scrollIntoView(true);
      var steps = compile(prog, []);
      running = true;
      Core.addClass(host, 'is-running');
      runBtn.innerHTML = 'Dừng';
      Core.say(fb, 'Bíp đang chạy chương trình...', 'info');
      var i = 0;
      function next() {
        clearRunMark();
        if (i >= steps.length) return finish(steps.length >= STEP_CAP);
        var s = steps[i++];
        var ids = s.anc.concat([s.id]);
        for (var a = 0; a < ids.length; a++) {
          var el = document.getElementById('blk-' + ids[a]);
          if (el) Core.addClass(el, 'is-running');
        }
        /* keep the running block visible when the program box scrolls */
        var cur = document.getElementById('blk-' + s.id);
        if (cur && progHost.scrollHeight > progHost.clientHeight) {
          var y = cur.offsetTop;
          if (y < progHost.scrollTop || y + 40 > progHost.scrollTop + progHost.clientHeight) progHost.scrollTop = Math.max(0, y - 40);
        }
        if (s.op === 'iter') {
          var it = document.getElementById('iter-' + s.id);
          if (it) it.innerHTML = 'lần ' + s.i + '/' + s.n;
          timer = setTimeout(next, fast ? 0 : Core.tick() / 2);
          return;
        }
        if (s.op === 'left') robot.d = (robot.d + 3) % 4;
        else if (s.op === 'right') robot.d = (robot.d + 1) % 4;
        else {
          var nx = robot.x + DIRS[robot.d][0], ny = robot.y + DIRS[robot.d][1];
          if (nx < 0 || ny < 0 || nx >= level.cols || ny >= level.rows) return crash('Ối! Bíp đi ra ngoài sân rồi.');
          if (walls[key(nx, ny)]) return crash('Ối! Bíp đụng phải tảng đá.');
          robot.x = nx; robot.y = ny;
          visited[key(nx, ny)] = 1;
          delete starsLeft[key(nx, ny)];
        }
        renderBoard();
        timer = setTimeout(next, fast ? 0 : Core.tick());
      }
      function clearRunMark() {
        var els = progHost.querySelectorAll('.is-running');
        for (var k = 0; k < els.length; k++) Core.removeClass(els[k], 'is-running');
      }
      next();
    }
    function crash(msg) {
      stop();
      renderBoard();
      Core.say(fb, msg + ' Em sửa chương trình rồi chạy lại nha.', 'bad');
    }
    function finish(capped) {
      stop();
      clearHighlights();
      if (level.free) { Core.say(fb, 'Xong! Em vẽ được hình gì vậy? Thử đổi số lần lặp xem hình thay đổi ra sao.', 'good'); return; }
      var atGoal = !level.goal || (robot.x === level.goal[0] && robot.y === level.goal[1]);
      var left = starCount();
      if (!atGoal || left) {
        var why = !atGoal ? 'Bíp chưa tới lá cờ.' : 'Còn ' + left + ' ngôi sao chưa nhặt.';
        Core.say(fb, why + (capped ? ' Chương trình chạy lâu quá nên Bíp dừng lại.' : '') + ' Em sửa chương trình rồi thử lại nha.', 'bad');
        return;
      }
      var n = count(prog);
      if (level.max && n > level.max) {
        Core.say(fb, 'Bíp tới nơi rồi! Nhưng em dùng ' + n + ' khối, nhiều hơn ' + level.max + '. Dùng "lặp lại" để viết gọn hơn nha.', 'bad');
        return;
      }
      Core.celebrate(fb, cfg.lesson, level.id, 'Tuyệt vời! Em qua màn "' + level.title + '".');
      renderTabs();
    }

    /* ---------- levels ---------- */
    function renderTabs() {
      tabs.innerHTML = '';
      var done = Core.getProgress(cfg.lesson);
      for (var i = 0; i < cfg.levels.length; i++) {
        (function (i) {
          var lv = cfg.levels[i];
          var b = E('button', 'btn btn-small lab-tab', (done[lv.id] ? Core.icon('check') : '') + (lv.free ? 'Tự do' : 'Màn ' + (i + 1)));
          b.setAttribute('aria-pressed', i === levelIdx ? 'true' : 'false');
          Core.on(b, function () { load(i); });
          tabs.appendChild(b);
        })(i);
      }
    }
    function load(i) {
      stop();
      levelIdx = i;
      level = cfg.levels[i];
      prog = [];
      targetId = 'main';
      info.innerHTML = '<h3>' + level.title + '</h3><p>' + level.text + '</p>';
      Core.say(fb, level.free ? 'Sân chơi tự do: không có đích, em vẽ thoả thích.' : 'Chạm vào các khối lệnh để xếp chương trình, rồi bấm "Chạy".', 'info');
      resetWorld();
      renderProgram();
      renderTabs();
    }

    Core.on(runBtn, run);
    Core.on(resetBtn, function () { resetWorld(); Core.say(fb, 'Bíp về chỗ cũ rồi.', 'info'); });
    Core.on(clearBtn, function () { if (running) return; prog = []; targetId = 'main'; renderProgram(); resetWorld(); });

    load(0);
    /* for the page self-check: build a program from specs like [['repeat', 6, [['fwd']]]] and run it quickly */
    function fromSpec(list) { var out = []; for (var i = 0; i < list.length; i++) { var s = list[i], b = { id: 'k' + (nextId++), t: s[0] }; if (s[0] === 'repeat') { b.n = s[1]; b.body = fromSpec(s[2]); } out.push(b); } return out; }
    return {
      play: function (i, spec) { return new Promise(function (done) { load(i); prog = fromSpec(spec); targetId = 'main'; renderProgram(); fast = true; run(); (function wait() { if (running) setTimeout(wait, 20); else { fast = false; done(); } })(); }); }
    };
  };
})();
