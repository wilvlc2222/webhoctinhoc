/* Mini Scratch for the programming lessons: stage, sprites, coloured blocks, green flag.
   Built for touch and e-ink: tap a block in the palette to add it where the orange marker is.
   ES5 only. Needs core.js, icons.js, sprites.js.

   var sc = Scratch(host, cfg)
     cfg.project: { backdrop: 'vuon', sprites: [{ name, art: 'cho', x, y, dir, size, rot: 'all'|'lr'|'none', scripts: [ [hat, cmd, cmd...] ] }], vars: { 'điểm': 0 } }
       a block spec is [op, arg1, arg2, ...]; a C block ends with a body list: ['repeat', 4, [ ['move', 100], ['turnR', 90] ]]
       'ifElse' ends with two body lists; a boolean/reporter argument is itself a spec: ['if', ['touching', 'edge'], [...]]
     cfg.cats:  categories to show, default all of CATS keys
     cfg.tasks, cfg.tasksHost, cfg.lesson, cfg.id, cfg.doneText; cfg.folders, cfg.fileName, cfg.samples: [{ path, project }]
     cfg.libSprites / cfg.libBackdrops: names offered in the libraries
   returns an API (see bottom) used by lessons to check the work. */
(function () {
  var E = Core.el;
  var CATS = {
    motion: { vi: 'Chuyển động', en: 'Motion', c: '#4c97ff' },
    looks: { vi: 'Hiển thị', en: 'Looks', c: '#9966ff' },
    sound: { vi: 'Âm thanh', en: 'Sound', c: '#cf63cf' },
    events: { vi: 'Sự kiện', en: 'Events', c: '#ffbf00' },
    control: { vi: 'Điều khiển', en: 'Control', c: '#ffab19' },
    sensing: { vi: 'Cảm biến', en: 'Sensing', c: '#5cb1d6' },
    operators: { vi: 'Các phép toán', en: 'Operators', c: '#59c059' },
    variables: { vi: 'Các biến số', en: 'Variables', c: '#ff8c1a' },
    pen: { vi: 'Bút vẽ', en: 'Pen', c: '#0fbd8c' }
  };
  var KEYS = [['space', 'phím trắng', 'space'], ['up', 'mũi tên lên', 'up arrow'], ['down', 'mũi tên xuống', 'down arrow'], ['left', 'mũi tên trái', 'left arrow'], ['right', 'mũi tên phải', 'right arrow'], ['a', 'a', 'a'], ['b', 'b', 'b']];
  var SOUNDS = [['meo', 'Meo', 'Meow'], ['gau', 'Gâu gâu', 'Dog bark'], ['pop', 'Bụp', 'Pop'], ['trong', 'Trống', 'Drum'], ['chuong', 'Chuông', 'Bell']];
  var PENCOL = [['#1c7ed6', 'xanh dương', 'blue'], ['#e03131', 'đỏ', 'red'], ['#2f9e44', 'xanh lá', 'green'], ['#f08c00', 'cam', 'orange'], ['#7048e8', 'tím', 'purple'], ['#212529', 'đen', 'black']];
  var ROT = [['lr', 'trái - phải', 'left-right'], ['none', 'không xoay', "don't rotate"], ['all', 'xoay tròn', 'all around']];
  /* shapes: hat, cmd, c (one body), c2 (if/else), cap (nothing after), rep (round reporter), bool (pointy) */
  var B = {
    flag: { cat: 'events', s: 'hat', vi: 'khi bấm vào %F', en: 'when %F clicked' },
    keypress: { cat: 'events', s: 'hat', vi: 'khi bấm phím %1', en: 'when %1 key pressed', a: [{ t: 'm', o: KEYS, d: 'space' }] },
    spriteclick: { cat: 'events', s: 'hat', vi: 'khi bấm vào nhân vật này', en: 'when this sprite clicked' },
    move: { cat: 'motion', s: 'cmd', vi: 'di chuyển %1 bước', en: 'move %1 steps', a: [{ t: 'n', d: 10 }] },
    turnR: { cat: 'motion', s: 'cmd', vi: 'xoay ↻ %1 độ', en: 'turn ↻ %1 degrees', a: [{ t: 'n', d: 15 }] },
    turnL: { cat: 'motion', s: 'cmd', vi: 'xoay ↺ %1 độ', en: 'turn ↺ %1 degrees', a: [{ t: 'n', d: 15 }] },
    gotoRandom: { cat: 'motion', s: 'cmd', vi: 'đi tới vị trí ngẫu nhiên', en: 'go to random position' },
    gotoMouse: { cat: 'motion', s: 'cmd', vi: 'đi tới con trỏ chuột', en: 'go to mouse-pointer' },
    goto: { cat: 'motion', s: 'cmd', vi: 'đi tới vị trí x: %1 y: %2', en: 'go to x: %1 y: %2', a: [{ t: 'n', d: 0 }, { t: 'n', d: 0 }] },
    glideRandom: { cat: 'motion', s: 'cmd', vi: 'lướt trong %1 giây tới vị trí ngẫu nhiên', en: 'glide %1 secs to random position', a: [{ t: 'n', d: 1 }] },
    glideTo: { cat: 'motion', s: 'cmd', vi: 'lướt trong %1 giây tới %2', en: 'glide %1 secs to %2', a: [{ t: 'n', d: 1 }, { t: 'm', o: 'sprites', d: '' }] },
    glide: { cat: 'motion', s: 'cmd', vi: 'lướt trong %1 giây tới vị trí x: %2 y: %3', en: 'glide %1 secs to x: %2 y: %3', a: [{ t: 'n', d: 1 }, { t: 'n', d: 0 }, { t: 'n', d: 0 }] },
    point: { cat: 'motion', s: 'cmd', vi: 'hướng về %1 độ', en: 'point in direction %1', a: [{ t: 'n', d: 90 }] },
    changeX: { cat: 'motion', s: 'cmd', vi: 'thay đổi hoành độ một lượng %1', en: 'change x by %1', a: [{ t: 'n', d: 10 }] },
    setX: { cat: 'motion', s: 'cmd', vi: 'đặt hoành độ bằng %1', en: 'set x to %1', a: [{ t: 'n', d: 0 }] },
    changeY: { cat: 'motion', s: 'cmd', vi: 'thay đổi tung độ một lượng %1', en: 'change y by %1', a: [{ t: 'n', d: 10 }] },
    setY: { cat: 'motion', s: 'cmd', vi: 'đặt tung độ bằng %1', en: 'set y to %1', a: [{ t: 'n', d: 0 }] },
    bounce: { cat: 'motion', s: 'cmd', vi: 'nếu chạm cạnh, bật lại', en: 'if on edge, bounce' },
    rotStyle: { cat: 'motion', s: 'cmd', vi: 'đặt kiểu xoay %1', en: 'set rotation style %1', a: [{ t: 'm', o: ROT, d: 'lr' }] },
    xpos: { cat: 'motion', s: 'rep', vi: 'hoành độ x', en: 'x position' },
    ypos: { cat: 'motion', s: 'rep', vi: 'tung độ y', en: 'y position' },
    sayFor: { cat: 'looks', s: 'cmd', vi: 'nói %1 trong %2 giây', en: 'say %1 for %2 seconds', a: [{ t: 't', d: 'Xin chào!' }, { t: 'n', d: 2 }] },
    say: { cat: 'looks', s: 'cmd', vi: 'nói %1', en: 'say %1', a: [{ t: 't', d: 'Xin chào!' }] },
    thinkFor: { cat: 'looks', s: 'cmd', vi: 'nghĩ %1 trong %2 giây', en: 'think %1 for %2 seconds', a: [{ t: 't', d: 'Hmm...' }, { t: 'n', d: 2 }] },
    nextCostume: { cat: 'looks', s: 'cmd', vi: 'trang phục tiếp theo', en: 'next costume' },
    nextBackdrop: { cat: 'looks', s: 'cmd', vi: 'phông nền tiếp theo', en: 'next backdrop' },
    changeSize: { cat: 'looks', s: 'cmd', vi: 'thay đổi kích thước một lượng %1', en: 'change size by %1', a: [{ t: 'n', d: 10 }] },
    setSize: { cat: 'looks', s: 'cmd', vi: 'đặt kích thước thành %1 %', en: 'set size to %1 %', a: [{ t: 'n', d: 100 }] },
    changeColor: { cat: 'looks', s: 'cmd', vi: 'thay đổi hiệu ứng màu một lượng %1', en: 'change color effect by %1', a: [{ t: 'n', d: 25 }] },
    clearFx: { cat: 'looks', s: 'cmd', vi: 'bỏ hiệu ứng đồ hoạ', en: 'clear graphic effects' },
    show: { cat: 'looks', s: 'cmd', vi: 'hiện', en: 'show' },
    hide: { cat: 'looks', s: 'cmd', vi: 'ẩn', en: 'hide' },
    playUntil: { cat: 'sound', s: 'cmd', vi: 'phát âm thanh %1 đến hết', en: 'play sound %1 until done', a: [{ t: 'm', o: SOUNDS, d: 'meo' }] },
    play: { cat: 'sound', s: 'cmd', vi: 'bắt đầu âm thanh %1', en: 'start sound %1', a: [{ t: 'm', o: SOUNDS, d: 'meo' }] },
    wait: { cat: 'control', s: 'cmd', vi: 'đợi %1 giây', en: 'wait %1 seconds', a: [{ t: 'n', d: 1 }] },
    repeat: { cat: 'control', s: 'c', vi: 'lặp lại %1', en: 'repeat %1', a: [{ t: 'n', d: 10 }] },
    forever: { cat: 'control', s: 'c', cap: true, vi: 'liên tục', en: 'forever' },
    if: { cat: 'control', s: 'c', vi: 'nếu %1 thì', en: 'if %1 then', a: [{ t: 'b' }] },
    ifElse: { cat: 'control', s: 'c2', vi: 'nếu %1 thì', vi2: 'nếu không thì', en: 'if %1 then', en2: 'else', a: [{ t: 'b' }] },
    waitUntil: { cat: 'control', s: 'cmd', vi: 'đợi đến khi %1', en: 'wait until %1', a: [{ t: 'b' }] },
    until: { cat: 'control', s: 'c', vi: 'lặp lại cho đến khi %1', en: 'repeat until %1', a: [{ t: 'b' }] },
    stopAll: { cat: 'control', s: 'cap', vi: 'dừng tất cả', en: 'stop all' },
    touching: { cat: 'sensing', s: 'bool', vi: 'đang chạm %1 ?', en: 'touching %1 ?', a: [{ t: 'm', o: 'touch', d: 'edge' }] },
    keyDown: { cat: 'sensing', s: 'bool', vi: 'phím %1 được bấm?', en: 'key %1 pressed?', a: [{ t: 'm', o: KEYS, d: 'space' }] },
    mouseDown: { cat: 'sensing', s: 'bool', vi: 'chuột được nhấn?', en: 'mouse down?' },
    ask: { cat: 'sensing', s: 'cmd', vi: 'hỏi %1 và đợi', en: 'ask %1 and wait', a: [{ t: 't', d: 'Bạn tên là gì?' }] },
    answer: { cat: 'sensing', s: 'rep', vi: 'trả lời', en: 'answer' },
    add: { cat: 'operators', s: 'rep', vi: '%1 + %2', en: '%1 + %2', a: [{ t: 'n', d: '' }, { t: 'n', d: '' }] },
    sub: { cat: 'operators', s: 'rep', vi: '%1 - %2', en: '%1 - %2', a: [{ t: 'n', d: '' }, { t: 'n', d: '' }] },
    mul: { cat: 'operators', s: 'rep', vi: '%1 * %2', en: '%1 * %2', a: [{ t: 'n', d: '' }, { t: 'n', d: '' }] },
    div: { cat: 'operators', s: 'rep', vi: '%1 / %2', en: '%1 / %2', a: [{ t: 'n', d: '' }, { t: 'n', d: '' }] },
    mod: { cat: 'operators', s: 'rep', vi: '%1 chia lấy dư cho %2', en: '%1 mod %2', a: [{ t: 'n', d: '' }, { t: 'n', d: '' }] },
    random: { cat: 'operators', s: 'rep', vi: 'lấy ngẫu nhiên từ %1 đến %2', en: 'pick random %1 to %2', a: [{ t: 'n', d: 1 }, { t: 'n', d: 10 }] },
    gt: { cat: 'operators', s: 'bool', vi: '%1 > %2', en: '%1 > %2', a: [{ t: 'n', d: '' }, { t: 'n', d: 50 }] },
    lt: { cat: 'operators', s: 'bool', vi: '%1 < %2', en: '%1 < %2', a: [{ t: 'n', d: '' }, { t: 'n', d: 50 }] },
    eq: { cat: 'operators', s: 'bool', vi: '%1 = %2', en: '%1 = %2', a: [{ t: 'n', d: '' }, { t: 'n', d: 50 }] },
    and: { cat: 'operators', s: 'bool', vi: '%1 và %2', en: '%1 and %2', a: [{ t: 'b' }, { t: 'b' }] },
    or: { cat: 'operators', s: 'bool', vi: '%1 hoặc %2', en: '%1 or %2', a: [{ t: 'b' }, { t: 'b' }] },
    not: { cat: 'operators', s: 'bool', vi: 'không phải %1', en: 'not %1', a: [{ t: 'b' }] },
    join: { cat: 'operators', s: 'rep', vi: 'kết hợp %1 %2', en: 'join %1 %2', a: [{ t: 't', d: 'xin ' }, { t: 't', d: 'chào' }] },
    getVar: { cat: 'variables', s: 'rep', vi: '%1', en: '%1', a: [{ t: 'v' }], varRep: true },
    setVar: { cat: 'variables', s: 'cmd', vi: 'đặt %1 thành %2', en: 'set %1 to %2', a: [{ t: 'v' }, { t: 'n', d: 0 }] },
    changeVar: { cat: 'variables', s: 'cmd', vi: 'thay đổi %1 một lượng %2', en: 'change %1 by %2', a: [{ t: 'v' }, { t: 'n', d: 1 }] },
    showVar: { cat: 'variables', s: 'cmd', vi: 'hiện biến %1', en: 'show variable %1', a: [{ t: 'v' }] },
    hideVar: { cat: 'variables', s: 'cmd', vi: 'ẩn biến %1', en: 'hide variable %1', a: [{ t: 'v' }] },
    clear: { cat: 'pen', s: 'cmd', vi: 'xoá tất cả', en: 'erase all' },
    penDown: { cat: 'pen', s: 'cmd', vi: 'đặt bút', en: 'pen down' },
    penUp: { cat: 'pen', s: 'cmd', vi: 'nhấc bút', en: 'pen up' },
    penColor: { cat: 'pen', s: 'cmd', vi: 'đặt màu bút thành %1', en: 'set pen color to %1', a: [{ t: 'm', o: PENCOL, d: '#1c7ed6' }] },
    penSize: { cat: 'pen', s: 'cmd', vi: 'đặt kích thước bút thành %1', en: 'set pen size to %1', a: [{ t: 'n', d: 3 }] }
  };
  var PALETTE = {
    events: ['flag', 'keypress', 'spriteclick'],
    motion: ['move', 'turnR', 'turnL', 'gotoRandom', 'gotoMouse', 'goto', 'glideRandom', 'glideTo', 'glide', 'point', 'changeX', 'setX', 'changeY', 'setY', 'bounce', 'rotStyle', 'xpos', 'ypos'],
    looks: ['sayFor', 'say', 'thinkFor', 'nextCostume', 'nextBackdrop', 'changeSize', 'setSize', 'changeColor', 'clearFx', 'show', 'hide'],
    sound: ['playUntil', 'play'],
    control: ['wait', 'repeat', 'forever', 'if', 'ifElse', 'waitUntil', 'until', 'stopAll'],
    sensing: ['touching', 'keyDown', 'mouseDown', 'ask', 'answer'],
    operators: ['add', 'sub', 'mul', 'div', 'mod', 'random', 'gt', 'lt', 'eq', 'and', 'or', 'not', 'join'],
    variables: ['setVar', 'changeVar', 'showVar', 'hideVar'],
    pen: ['clear', 'penDown', 'penUp', 'penColor', 'penSize']
  };
  var uid = 1;
  function isBody(x) { return Object.prototype.toString.call(x) === '[object Array]' && (x.length === 0 || Object.prototype.toString.call(x[0]) === '[object Array]'); }
  function isSpec(x) { return Object.prototype.toString.call(x) === '[object Array]' && typeof x[0] === 'string'; }
  /* spec -> block instance */
  function build(spec) {
    var def = B[spec[0]];
    if (!def) throw new Error('unknown block ' + spec[0]);
    var b = { id: 'b' + (uid++), op: spec[0], args: [], body: null, body2: null };
    var defs = def.a || [], vals = [], bodies = [];
    for (var j = 1; j < spec.length; j++) { if (isBody(spec[j])) bodies.push(spec[j]); else vals.push(spec[j]); }
    for (var i = 0; i < defs.length; i++) {
      var v = i < vals.length ? vals[i] : (defs[i].t === 'b' ? null : defs[i].d);
      if (isSpec(v)) v = { blk: build(v) };
      else if (defs[i].t === 'b') v = null;
      b.args.push(v === undefined ? '' : v);
    }
    if (def.s === 'c' || def.s === 'c2') {
      b.body = [];
      if (bodies[0]) for (var x = 0; x < bodies[0].length; x++) b.body.push(build(bodies[0][x]));
      if (def.s === 'c2') { b.body2 = []; if (bodies[1]) for (var y = 0; y < bodies[1].length; y++) b.body2.push(build(bodies[1][y])); }
    }
    return b;
  }
  function toSpec(b) {
    var s = [b.op];
    for (var i = 0; i < b.args.length; i++) s.push(b.args[i] && b.args[i].blk ? toSpec(b.args[i].blk) : b.args[i]);
    if (b.body) { var bd = []; for (var j = 0; j < b.body.length; j++) bd.push(toSpec(b.body[j])); s.push(bd); }
    if (b.body2) { var b2 = []; for (var k = 0; k < b.body2.length; k++) b2.push(toSpec(b.body2[k])); s.push(b2); }
    return s;
  }
  function escH(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  /* ---------------- sound: short beeps (no sound files) ---------------- */
  var actx = null;
  function beep(kind) {
    try {
      if (!actx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; actx = new AC(); }
      var f = { meo: [700, 500], gau: [220, 180], pop: [900, 900], trong: [120, 90], chuong: [1200, 1000] }[kind] || [600, 600];
      var o = actx.createOscillator(), g = actx.createGain();
      o.frequency.setValueAtTime(f[0], actx.currentTime);
      o.frequency.linearRampToValueAtTime(f[1], actx.currentTime + 0.25);
      g.gain.setValueAtTime(0.15, actx.currentTime);
      g.gain.linearRampToValueAtTime(0, actx.currentTime + 0.3);
      o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.32);
    } catch (e) {}
  }

  window.Scratch = function (host, cfg) {
    cfg = cfg || {};
    var lang = cfg.lang || 'vi';
    var ART = window.ScratchArt;
    var STW = cfg.stageWidth || 320, SC = STW / 480, STH = Math.round(360 * SC);
    var sprites = [], cur = null, backdrop = 'trang', vars = {}, shownVars = {};
    var threads = [], running = false, timer = null, clock = 0, runs = 0, keys = {}, answer = '', asking = null;
    var penSegs = [], said = [], savedAs = null, opened = null, exited = false, awarded = false;
    var target = null; /* { list: Array, index: n } insertion point */
    var selBlock = null;

    /* ---------- DOM skeleton ---------- */
    var app = E('div', 'sc');
    var menu = E('div', 'sc-menu');
    var body = E('div', 'sc-body');
    var palWrap = E('div', 'sc-palwrap');
    var catsEl = E('div', 'sc-cats');
    var palEl = E('div', 'sc-pal');
    palWrap.appendChild(catsEl); palWrap.appendChild(palEl);
    var codeWrap = E('div', 'sc-codewrap');
    var codeBar = E('div', 'sc-codebar');
    var codeEl = E('div', 'sc-code');
    codeWrap.appendChild(codeBar); codeWrap.appendChild(codeEl);
    var right = E('div', 'sc-right');
    var stageBar = E('div', 'sc-stagebar');
    var stage = E('div', 'sc-stage');
    stage.style.width = STW + 'px'; stage.style.height = STH + 'px';
    var bdEl = E('div', 'sc-backdrop');
    var canvas = document.createElement('canvas');
    canvas.className = 'sc-pen'; canvas.width = 480; canvas.height = 360;
    var spritesLayer = E('div', 'sc-sprites');
    var varLayer = E('div', 'sc-vars');
    var askEl = E('div', 'sc-ask');
    stage.appendChild(bdEl); stage.appendChild(canvas); stage.appendChild(spritesLayer); stage.appendChild(varLayer); stage.appendChild(askEl);
    /* mouse pointer / finger on the stage (for "touching mouse-pointer?" and "mouse down?") */
    var mouse = { x: 0, y: 0, in: false, down: false };
    function trackXY(cx, cy) { var r = stage.getBoundingClientRect(); if (!r.width) return; mouse.x = (cx - r.left) / r.width * 480 - 240; mouse.y = 180 - (cy - r.top) / r.height * 360; }
    stage.addEventListener('mousemove', function (e) { trackXY(e.clientX, e.clientY); mouse.in = true; }, false);
    stage.addEventListener('mouseleave', function () { mouse.in = false; mouse.down = false; }, false);
    stage.addEventListener('mousedown', function (e) { trackXY(e.clientX, e.clientY); mouse.in = true; mouse.down = true; }, false);
    document.addEventListener('mouseup', function () { mouse.down = false; }, false);
    stage.addEventListener('touchstart', function (e) { var t = e.touches[0]; if (t) { trackXY(t.clientX, t.clientY); mouse.in = true; mouse.down = true; } }, false);
    stage.addEventListener('touchmove', function (e) { var t = e.touches[0]; if (t) { trackXY(t.clientX, t.clientY); e.preventDefault(); } }, false);
    stage.addEventListener('touchend', function () { mouse.down = false; mouse.in = false; }, false);
    var keypad = E('div', 'sc-keypad');
    var spritePane = E('div', 'sc-spritepane');
    right.appendChild(stageBar); right.appendChild(stage); right.appendChild(keypad); right.appendChild(spritePane);
    body.appendChild(palWrap); body.appendChild(codeWrap); body.appendChild(right);
    var overlay = E('div', 'ss-overlay');
    app.appendChild(menu); app.appendChild(body); app.appendChild(overlay);
    var closedEl = E('div', 'ss-closed');
    var fb = E('div', 'feedback'); fb.setAttribute('aria-live', 'polite');
    host.appendChild(app); host.appendChild(closedEl); host.appendChild(fb);
    var tasksEl = null;
    if (cfg.tasks && cfg.tasksHost) { tasksEl = E('ul', 'checklist'); cfg.tasksHost.appendChild(tasksEl); }
    var ctx = canvas.getContext ? canvas.getContext('2d') : null;
    function say(t, type) { Core.say(fb, t, type || 'info'); }
    function L(def, two) { return lang === 'vi' ? (two ? def.vi2 : def.vi) : (two ? def.en2 : def.en); }

    /* ---------- project ---------- */
    function newSprite(s) {
      var art = ART.sprites[s.art] || ART.sprites.meo;
      var sp = { name: s.name || art.name, art: s.art || 'meo', x: s.x || 0, y: s.y || 0, dir: s.dir === undefined ? 90 : s.dir, size: s.size || 100,
        rot: s.rot || 'all', costume: 0, visible: s.visible !== false, color: 0, say: null, pen: false, penColor: '#1c7ed6', penSize: 3, scripts: [], el: null };
      var sc = s.scripts || [];
      for (var i = 0; i < sc.length; i++) sp.scripts.push(scriptFrom(sc[i]));
      return sp;
    }
    function scriptFrom(spec) {
      var list = [];
      for (var i = 0; i < spec.length; i++) list.push(build(spec[i]));
      return { id: 's' + (uid++), blocks: list };
    }
    function loadProject(p) {
      stopAll(true);
      sprites = []; vars = {}; shownVars = {};
      backdrop = p.backdrop || 'trang';
      var ss = p.sprites || [];
      for (var i = 0; i < ss.length; i++) sprites.push(newSprite(ss[i]));
      if (p.vars) for (var v in p.vars) if (p.vars.hasOwnProperty(v)) { vars[v] = p.vars[v]; shownVars[v] = true; }
      cur = sprites[0] || null;
      target = null; selBlock = null; said = [];
      clearPen();
      renderAll();
    }
    function project() {
      var out = { backdrop: backdrop, vars: {}, sprites: [] };
      for (var v in vars) if (vars.hasOwnProperty(v)) out.vars[v] = 0;
      for (var i = 0; i < sprites.length; i++) {
        var s = sprites[i], scs = [];
        for (var j = 0; j < s.scripts.length; j++) { var l = []; for (var k = 0; k < s.scripts[j].blocks.length; k++) l.push(toSpec(s.scripts[j].blocks[k])); scs.push(l); }
        out.sprites.push({ name: s.name, art: s.art, x: s.x0 !== undefined ? s.x0 : s.x, y: s.y0 !== undefined ? s.y0 : s.y, dir: s.dir0 !== undefined ? s.dir0 : s.dir, size: s.size, rot: s.rot, scripts: scs });
      }
      return out;
    }

    /* ---------- menu bar ---------- */
    function renderMenu() {
      menu.innerHTML = '';
      menu.appendChild(E('span', 'sc-logo', 'Scratch'));
      var globe = E('button', 'sc-mbtn', Core.icon('globe') + '<span>' + (lang === 'vi' ? 'Tiếng Việt' : 'English') + '</span>');
      globe.setAttribute('title', 'Đổi ngôn ngữ / Language');
      Core.on(globe, function () { lang = lang === 'vi' ? 'en' : 'vi'; renderAll(); changed('lang'); });
      var file = E('button', 'sc-mbtn', '<span>' + (lang === 'vi' ? 'Tập tin' : 'File') + '</span>');
      Core.on(file, fileMenu);
      menu.appendChild(globe); menu.appendChild(file);
      var title = E('span', 'sc-title');
      title.appendChild(document.createTextNode(savedAs ? savedAs.name : (lang === 'vi' ? 'Dự án Scratch' : 'Scratch Project')));
      menu.appendChild(title);
      var x = E('button', 'ss-x sc-x', Core.icon('cross'));
      x.setAttribute('aria-label', 'Thoát khỏi phần mềm');
      Core.on(x, function () { stopAll(); exited = true; app.style.display = 'none'; closedEl.innerHTML = ''; closedEl.appendChild(E('p', '', 'Em đã <b>thoát khỏi</b> phần mềm Scratch.')); var again = E('button', 'btn btn-small', 'Mở lại Scratch'); Core.on(again, function () { exited = false; app.style.display = ''; closedEl.innerHTML = ''; }); closedEl.appendChild(again); changed('exit'); });
      menu.appendChild(x);
    }
    function dialog(title, bodyEl, buttons) {
      overlay.innerHTML = '';
      var box = E('div', 'ss-dialog');
      box.appendChild(E('div', 'ss-dtitle', title));
      box.appendChild(bodyEl);
      var row = E('div', 'ss-drow');
      for (var i = 0; i < buttons.length; i++) row.appendChild(buttons[i]);
      box.appendChild(row);
      overlay.appendChild(box);
      overlay.style.display = 'flex';
    }
    function closeDialog() { overlay.style.display = 'none'; overlay.innerHTML = ''; }
    function btn(label, fn, primary) { var b = E('button', 'btn btn-small' + (primary ? ' btn-primary' : ''), label); Core.on(b, fn); return b; }
    function fileMenu() {
      var bodyEl = E('div', 'sc-filemenu');
      bodyEl.appendChild(btn(lang === 'vi' ? 'Mở từ máy tính của bạn' : 'Load from your computer', function () { closeDialog(); openDialog(); }));
      bodyEl.appendChild(btn(lang === 'vi' ? 'Lưu về máy tính của bạn' : 'Save to your computer', function () { closeDialog(); saveDialog(); }));
      dialog(lang === 'vi' ? 'Tập tin' : 'File', bodyEl, [btn('Đóng', closeDialog)]);
    }
    var STORE = 'whth-files';
    function files() { try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { return {}; } }
    function who() { return '@' + (Core.currentName() || 'khach'); }
    function saveDialog() {
      var bodyEl = E('div', 'ss-save');
      bodyEl.appendChild(E('div', 'ss-dlabel', 'Lưu vào thư mục:'));
      var folders = cfg.folders || ['D:/Lop 4A2/Nhom 2/Thu An'];
      var fsel = E('select', 'ss-sel ss-folder');
      for (var i = 0; i < folders.length; i++) { var o = E('option', '', folders[i]); o.value = folders[i]; fsel.appendChild(o); }
      bodyEl.appendChild(fsel);
      bodyEl.appendChild(E('div', 'ss-dlabel', 'File name (tên tệp):'));
      var name = E('input', 'ss-name');
      name.value = savedAs ? savedAs.name : (cfg.fileName || '');
      bodyEl.appendChild(name);
      dialog('Save as', bodyEl, [btn('Save', function () {
        var n = name.value.replace(/^\s+|\s+$/g, '');
        if (!n) { name.focus(); return; }
        doSave(n, fsel.value); closeDialog();
      }, true), btn('Cancel', closeDialog)]);
    }
    function doSave(n, folder) {
      savedAs = { name: n, folder: folder };
      var all = files(), mine = all[who()] || {};
      var p = project(); p.type = 'sb';
      mine[folder + '/' + n] = p; all[who()] = mine;
      try { localStorage.setItem(STORE, JSON.stringify(all)); } catch (e) {}
      renderMenu();
      say('Đã lưu dự án <b>' + escH(n) + '</b> vào <b>' + escH(folder) + '</b>.', 'good');
      changed('save');
    }
    function openDialog() {
      var bodyEl = E('div', 'ss-open'), mine = files()[who()] || {}, any = false;
      function item(label, fn) { var b = E('button', 'ss-openitem', Core.icon('game') + '<span></span>'); b.lastChild.appendChild(document.createTextNode(label)); Core.on(b, fn); bodyEl.appendChild(b); any = true; }
      for (var p in mine) if (mine.hasOwnProperty(p) && mine[p] && mine[p].type === 'sb') (function (p) { item(p, function () { doOpen(mine[p], p); closeDialog(); }); })(p);
      var samples = cfg.samples || [];
      for (var i = 0; i < samples.length; i++) (function (s) { item(s.path + ' (tệp mẫu)', function () { doOpen(s.project, s.path); closeDialog(); }); })(samples[i]);
      if (!any) bodyEl.appendChild(E('p', '', 'Chưa có dự án nào được lưu.'));
      dialog(lang === 'vi' ? 'Mở dự án' : 'Open project', bodyEl, [btn('Cancel', closeDialog)]);
    }
    function doOpen(p, path) {
      loadProject(p);
      var cut = path.lastIndexOf('/');
      savedAs = { folder: path.slice(0, cut), name: path.slice(cut + 1) };
      opened = path; renderMenu();
      say('Đã mở dự án <b>' + escH(savedAs.name) + '</b>.', 'good');
      changed('open');
    }

    /* ---------- palette ---------- */
    var catList = cfg.cats || ['motion', 'looks', 'sound', 'events', 'control', 'sensing', 'operators', 'variables', 'pen'];
    var curCat = cfg.startCat || catList[0];
    function renderCats() {
      catsEl.innerHTML = '';
      for (var i = 0; i < catList.length; i++) {
        (function (c) {
          var b = E('button', 'sc-cat' + (c === curCat ? ' is-on' : ''), '<span class="sc-dot" style="background:' + CATS[c].c + '"></span><span>' + CATS[c][lang] + '</span>');
          Core.on(b, function () { curCat = c; renderCats(); renderPalette(); });
          catsEl.appendChild(b);
        })(catList[i]);
      }
      if (cfg.hidePen !== true && catList.indexOf('pen') < 0 && cfg.addExtension) {
        var add = E('button', 'sc-cat sc-ext', Core.icon('plus') + '<span>' + (lang === 'vi' ? 'Thêm Bút vẽ' : 'Add Pen') + '</span>');
        Core.on(add, function () { catList.push('pen'); curCat = 'pen'; renderCats(); renderPalette(); say('Đã thêm nhóm lệnh <b>Bút vẽ</b> (Pen).', 'good'); changed('ext'); });
        catsEl.appendChild(add);
      }
    }
    function renderPalette() {
      palEl.innerHTML = '';
      palEl.appendChild(E('div', 'sc-palhead', CATS[curCat][lang]));
      if (curCat === 'variables') {
        var mk = E('button', 'btn btn-small sc-mkvar', lang === 'vi' ? 'Tạo một biến' : 'Make a Variable');
        Core.on(mk, function () {
          var bodyEl = E('div', ''), inp = E('input', 'ss-name');
          inp.setAttribute('placeholder', 'Tên biến, ví dụ: điểm');
          bodyEl.appendChild(inp);
          dialog(lang === 'vi' ? 'Biến mới' : 'New Variable', bodyEl, [btn('OK', function () {
            var n = inp.value.replace(/^\s+|\s+$/g, '');
            if (!n) return;
            vars[n] = 0; shownVars[n] = true; closeDialog(); renderPalette(); renderVars(); changed('var');
            say('Đã tạo biến <b>' + escH(n) + '</b>.', 'good');
          }, true), btn('Cancel', closeDialog)]);
          setTimeout(function () { try { inp.focus(); } catch (e) {} }, 0);
        });
        palEl.appendChild(mk);
        for (var v in vars) if (vars.hasOwnProperty(v)) (function (v) {
          /* like Scratch: the tick box shows or hides the variable on the stage */
          var row = E('div', 'sc-varrow'), chk = E('input', 'sc-varchk');
          chk.type = 'checkbox'; chk.checked = !!shownVars[v]; chk.setAttribute('aria-label', (lang === 'vi' ? 'Hiện biến ' : 'Show variable ') + v);
          chk.addEventListener('change', function () { shownVars[v] = chk.checked; renderVars(); changed('showvar'); }, false);
          row.appendChild(chk); row.appendChild(palBlock('getVar', [v]));
          palEl.appendChild(row);
        })(v);
      }
      var ops = PALETTE[curCat];
      for (var i = 0; i < ops.length; i++) {
        if (B[ops[i]].a && B[ops[i]].a[0] && B[ops[i]].a[0].t === 'v' && !hasVars()) continue;
        palEl.appendChild(palBlock(ops[i]));
      }
    }
    function hasVars() { for (var v in vars) if (vars.hasOwnProperty(v)) return true; return false; }
    function firstVar() { for (var v in vars) if (vars.hasOwnProperty(v)) return v; return ''; }
    function palBlock(op, preset) {
      var def = B[op];
      var el = E('button', 'sc-blk sc-' + def.s + ' sc-pblk');
      el.style.background = CATS[def.cat].c;
      el.innerHTML = labelHTML(def, null, preset);
      Core.on(el, function () {
        if (def.s === 'rep' || def.s === 'bool') { say('Khối tròn hoặc khối nhọn này dùng để <b>đặt vào ô</b> của khối khác. Em chạm vào ô trống trong một khối ở chương trình, rồi chọn nó trong danh sách.', 'info'); return; }
        var spec = [op];
        if (preset) spec = spec.concat(preset);
        else if (def.a && def.a[0] && def.a[0].t === 'v') spec.push(firstVar());
        addBlock(build(spec));
      });
      return el;
    }
    function labelHTML(def, b, preset) {
      var text = L(def), out = '', idx = 0;
      var parts = text.split(/(%\d|%F)/);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p === '%F') out += '<span class="sc-flagico">' + Icons.flag + '</span>';
        else if (/^%\d$/.test(p)) {
          var k = parseInt(p.charAt(1), 10) - 1, a = def.a[k];
          var v = b ? b.args[k] : (preset ? preset[k] : (a.t === 'b' ? null : a.d));
          if (a.t === 'v' && !b && !preset) v = firstVar();
          out += '<span class="sc-slot sc-' + a.t + '">' + slotText(a, v) + '</span>';
        } else if (p) out += '<span>' + escH(p) + '</span>';
      }
      return out;
    }
    function optLabel(a, v) {
      var o = a.o === 'touch' ? touchOpts() : a.o === 'sprites' ? spriteOpts() : a.o;
      for (var i = 0; i < o.length; i++) if (o[i][0] === v) return lang === 'vi' ? o[i][1] : o[i][2];
      return v;
    }
    function slotText(a, v) {
      if (a.t === 'b') return v && v.blk ? '…' : '';
      if (a.t === 'm' || a.t === 'v') return escH(a.t === 'v' ? v : optLabel(a, v)) + ' ▾';
      if (v && v.blk) return '…';
      return escH(v);
    }
    function spriteOpts() {
      var o = [];
      for (var i = 0; i < sprites.length; i++) if (sprites[i] !== cur) o.push([sprites[i].name, sprites[i].name, sprites[i].name]);
      return o.length ? o : [['', '(chưa có nhân vật khác)', '(no other sprite)']];
    }
    function touchOpts() {
      var o = [['edge', 'cạnh', 'edge'], ['mouse', 'con trỏ chuột', 'mouse-pointer']];
      for (var i = 0; i < sprites.length; i++) if (sprites[i] !== cur) o.push([sprites[i].name, sprites[i].name, sprites[i].name]);
      return o;
    }

    /* ---------- code area ---------- */
    function addBlock(b) {
      if (!cur) return say('Chưa có nhân vật nào. Em chọn một nhân vật trước nha.');
      var def = B[b.op];
      if (def.s === 'hat') {
        var sc = { id: 's' + (uid++), blocks: [b] };
        cur.scripts.push(sc);
        target = { list: sc.blocks, index: 1 };
        say('Đã thêm khối <b>sự kiện</b>. Các lệnh tiếp theo sẽ nối vào bên dưới.', 'good');
      } else {
        if (!target || !inCur(target.list)) {
          var last = cur.scripts[cur.scripts.length - 1];
          if (!last) { last = { id: 's' + (uid++), blocks: [] }; cur.scripts.push(last); }
          target = { list: last.blocks, index: last.blocks.length };
        }
        var tl = target.list;
        if (tl.length && target.index > 0 && B[tl[target.index - 1].op].cap) return say('Sau khối <b>' + L(B[tl[target.index - 1].op]) + '</b> không nối thêm lệnh được.', 'bad');
        tl.splice(target.index, 0, b);
        target = (def.s === 'c' || def.s === 'c2') ? { list: b.body, index: 0 } : { list: tl, index: target.index + 1 };
        if (def.s === 'c' || def.s === 'c2') say('Lệnh tiếp theo sẽ vào <b>bên trong</b> khối "' + L(def).replace(/%\d/g, '…') + '". Chạm vào dưới khối để nối ra ngoài.', 'info');
      }
      selBlock = b;
      renderCode(); changed('add');
    }
    function inCur(list) {
      var found = false;
      function walk(l) { if (l === list) found = true; for (var i = 0; i < l.length && !found; i++) { if (l[i].body) walk(l[i].body); if (l[i].body2) walk(l[i].body2); } }
      for (var s = 0; s < cur.scripts.length && !found; s++) walk(cur.scripts[s].blocks);
      return found;
    }
    function findParent(b) {
      var res = null;
      function walk(l) { for (var i = 0; i < l.length && !res; i++) { if (l[i] === b) { res = { list: l, index: i }; return; } if (l[i].body) walk(l[i].body); if (l[i].body2) walk(l[i].body2); } }
      for (var s = 0; s < cur.scripts.length && !res; s++) walk(cur.scripts[s].blocks);
      return res;
    }
    function renderCodeBar() {
      codeBar.innerHTML = '';
      codeBar.appendChild(E('span', 'sc-who', (lang === 'vi' ? 'Chương trình của: ' : 'Code of: ') + '<b>' + escH(cur ? cur.name : '—') + '</b>'));
      var del = E('button', 'btn btn-small', Core.icon('trash') + (lang === 'vi' ? 'Xoá khối' : 'Delete'));
      var up = E('button', 'btn btn-small', '▲'), down = E('button', 'btn btn-small', '▼');
      up.setAttribute('aria-label', 'Đưa khối lên'); down.setAttribute('aria-label', 'Đưa khối xuống');
      [del, up, down].forEach(function (x) { x.disabled = !selBlock; codeBar.appendChild(x); });
      Core.on(del, function () {
        if (!selBlock) return;
        var p = findParent(selBlock);
        if (p) {
          p.list.splice(p.index, 1);
          for (var s = cur.scripts.length - 1; s >= 0; s--) if (!cur.scripts[s].blocks.length) cur.scripts.splice(s, 1);
          target = { list: p.list, index: p.index };
        }
        selBlock = null; renderCode(); changed('del');
      });
      function shift(d) {
        var p = findParent(selBlock);
        if (!p) return;
        var j = p.index + d;
        if (j < 0 || j >= p.list.length) return;
        if (B[p.list[j].op].s === 'hat' || B[selBlock.op].s === 'hat') return;
        var t = p.list[j]; p.list[j] = selBlock; p.list[p.index] = t;
        renderCode(); changed('move');
      }
      Core.on(up, function () { shift(-1); });
      Core.on(down, function () { shift(1); });
    }
    function renderCode() {
      renderCodeBar();
      codeEl.innerHTML = '';
      if (!cur) return;
      if (!cur.scripts.length) codeEl.appendChild(E('div', 'sc-empty', lang === 'vi' ? 'Chưa có lệnh nào. Chạm vào một khối lệnh ở bên trái để thêm vào đây.' : 'No code yet. Tap a block on the left.'));
      for (var s = 0; s < cur.scripts.length; s++) {
        var sc = E('div', 'sc-script');
        sc.appendChild(renderList(cur.scripts[s].blocks, true));
        codeEl.appendChild(sc);
      }
    }
    function marker(list, index) {
      var m = E('div', 'sc-drop' + (target && target.list === list && target.index === index ? ' is-target' : ''));
      Core.on(m, function (ev) { ev.stopPropagation(); target = { list: list, index: index }; renderCode(); });
      return m;
    }
    function renderList(list, top) {
      var wrap = E('div', 'sc-list');
      for (var i = 0; i < list.length; i++) {
        if (!top || i > 0) wrap.appendChild(marker(list, i));
        wrap.appendChild(renderBlock(list[i]));
      }
      if (!list.length || !B[list[list.length - 1].op].cap) wrap.appendChild(marker(list, list.length));
      return wrap;
    }
    function renderBlock(b) {
      var def = B[b.op];
      var el = E('div', 'sc-blk sc-' + def.s + (b === selBlock ? ' is-sel' : '') + (b._running ? ' is-running' : ''));
      el.id = 'blk-' + b.id;
      el.style.background = CATS[def.cat].c;
      var head = E('div', 'sc-head');
      fillLabel(head, def, b);
      el.appendChild(head);
      Core.on(el, function (ev) { ev.stopPropagation(); selBlock = b; var p = findParent(b); if (p) target = (def.s === 'c' || def.s === 'c2') ? { list: b.body, index: b.body.length } : { list: p.list, index: p.index + 1 }; renderCode(); });
      if (def.s === 'c' || def.s === 'c2') {
        var inner = E('div', 'sc-inner');
        inner.appendChild(renderList(b.body, false));
        el.appendChild(inner);
        if (def.s === 'c2') {
          el.appendChild(E('div', 'sc-head sc-else', escH(L(def, true))));
          var inner2 = E('div', 'sc-inner');
          inner2.appendChild(renderList(b.body2, false));
          el.appendChild(inner2);
        }
        el.appendChild(E('div', 'sc-foot'));
      }
      return el;
    }
    function fillLabel(head, def, b) {
      var parts = L(def).split(/(%\d|%F)/);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p === '%F') head.appendChild(E('span', 'sc-flagico', Icons.flag));
        else if (/^%\d$/.test(p)) head.appendChild(slotEl(def.a[parseInt(p.charAt(1), 10) - 1], b, parseInt(p.charAt(1), 10) - 1));
        else if (p) head.appendChild(E('span', '', escH(p)));
      }
    }
    function slotEl(a, b, k) {
      var v = b.args[k];
      if (v && v.blk) {
        var inner = v.blk, d2 = B[inner.op];
        var el = E('span', 'sc-nest sc-' + d2.s);
        el.style.background = CATS[d2.cat].c;
        fillLabel(el, d2, inner);
        var x = E('button', 'sc-unnest', '×');
        x.setAttribute('aria-label', 'Bỏ khối này ra');
        Core.on(x, function (ev) { ev.stopPropagation(); b.args[k] = a.t === 'b' ? null : (a.d === undefined ? '' : a.d); renderCode(); changed('arg'); });
        el.appendChild(x);
        return el;
      }
      if (a.t === 'n' || a.t === 't') {
        var wrapS = E('span', 'sc-slotwrap');
        var inp = E('input', 'sc-in sc-' + a.t);
        inp.value = v;
        inp.setAttribute('size', String(Math.max(2, String(v).length + 1)));
        if (a.t === 'n') inp.setAttribute('inputmode', 'decimal');
        inp.addEventListener('click', function (ev) { ev.stopPropagation(); }, false);
        inp.addEventListener('input', function () { b.args[k] = a.t === 'n' && inp.value !== '' && !isNaN(+inp.value) ? +inp.value : inp.value; inp.setAttribute('size', String(Math.max(2, inp.value.length + 1))); changed('arg'); }, false);
        if (window.Telex && a.t === 't') Telex.attach(inp, { mode: function () { return 'telex'; } });
        wrapS.appendChild(inp);
        var pick = E('button', 'sc-pick', '▾');
        pick.setAttribute('aria-label', 'Đặt một khối vào ô này');
        Core.on(pick, function (ev) { ev.stopPropagation(); chooseReporter(b, k, false); });
        wrapS.appendChild(pick);
        return wrapS;
      }
      if (a.t === 'm' || a.t === 'v') {
        var sel = E('select', 'sc-sel');
        var opts = a.t === 'v' ? varOpts() : (a.o === 'touch' ? touchOpts() : a.o === 'sprites' ? spriteOpts() : a.o);
        for (var i = 0; i < opts.length; i++) { var o = E('option', '', escH(lang === 'vi' ? opts[i][1] : opts[i][2])); o.value = opts[i][0]; if (opts[i][0] === v) o.selected = true; sel.appendChild(o); }
        sel.addEventListener('click', function (ev) { ev.stopPropagation(); }, false);
        sel.addEventListener('change', function () { b.args[k] = sel.value; changed('arg'); }, false);
        return sel;
      }
      /* boolean slot */
      var hole = E('button', 'sc-hole', lang === 'vi' ? 'chọn điều kiện' : 'condition');
      Core.on(hole, function (ev) { ev.stopPropagation(); chooseReporter(b, k, true); });
      return hole;
    }
    function varOpts() { var o = []; for (var v in vars) if (vars.hasOwnProperty(v)) o.push([v, v, v]); return o.length ? o : [['', '(chưa có biến)', '(no variable)']]; }
    function chooseReporter(b, k, bool) {
      var bodyEl = E('div', 'sc-choose');
      var any = false;
      for (var ci = 0; ci < catList.length; ci++) {
        var c = catList[ci], ops = PALETTE[c].slice();
        if (c === 'variables') for (var v in vars) if (vars.hasOwnProperty(v)) ops.unshift('getVar:' + v);
        for (var i = 0; i < ops.length; i++) {
          var op = ops[i], preset = null;
          if (op.indexOf('getVar:') === 0) { preset = [op.slice(7)]; op = 'getVar'; }
          var def = B[op];
          if (bool ? def.s !== 'bool' : def.s !== 'rep') continue;
          (function (op, preset, def) {
            var el = E('button', 'sc-blk sc-' + def.s + ' sc-pblk');
            el.style.background = CATS[def.cat].c;
            el.innerHTML = labelHTML(def, null, preset);
            Core.on(el, function () { b.args[k] = { blk: build([op].concat(preset || [])) }; closeDialog(); renderCode(); changed('arg'); });
            bodyEl.appendChild(el);
            any = true;
          })(op, preset, def);
        }
      }
      if (!any) bodyEl.appendChild(E('p', '', 'Chưa có khối nào đặt được vào ô này.'));
      dialog(bool ? (lang === 'vi' ? 'Chọn điều kiện (khối nhọn)' : 'Choose a condition') : (lang === 'vi' ? 'Chọn khối đặt vào ô' : 'Choose a reporter'), bodyEl, [btn('Thôi', closeDialog)]);
    }

    /* ---------- sprites pane ---------- */
    function renderSprites() {
      spritePane.innerHTML = '';
      var list = E('div', 'sc-splist');
      for (var i = 0; i < sprites.length; i++) {
        (function (s) {
          var t = E('button', 'sc-spr' + (s === cur ? ' is-cur' : ''), ART.sprites[s.art].costumes[0] + '<span></span>');
          t.lastChild.appendChild(document.createTextNode(s.name));
          Core.on(t, function () { cur = s; selBlock = null; target = null; renderAll(); });
          list.appendChild(t);
        })(sprites[i]);
      }
      spritePane.appendChild(list);
      var tools = E('div', 'sc-sptools');
      var add = E('button', 'btn btn-small', Core.icon('plus') + (lang === 'vi' ? 'Chọn nhân vật' : 'Choose a Sprite'));
      Core.on(add, spriteLibrary);
      var del = E('button', 'btn btn-small', Core.icon('trash') + (lang === 'vi' ? 'Xoá nhân vật' : 'Delete'));
      del.disabled = !cur;
      Core.on(del, function () {
        if (!cur) return;
        var n = cur.name;
        sprites.splice(sprites.indexOf(cur), 1);
        cur = sprites[0] || null; selBlock = null; target = null;
        renderAll(); say('Đã xoá nhân vật <b>' + escH(n) + '</b>.', 'good'); changed('delSprite');
      });
      var bd = E('button', 'btn btn-small', Core.icon('image') + (lang === 'vi' ? 'Chọn phông nền' : 'Backdrop'));
      Core.on(bd, backdropLibrary);
      tools.appendChild(add); tools.appendChild(del); tools.appendChild(bd);
      spritePane.appendChild(tools);
    }
    function spriteLibrary() {
      var bodyEl = E('div', 'sc-lib');
      var names = cfg.libSprites || ['meo', 'cho', 'ca', 'ca2', 'buom', 'bodua', 'chim', 'robot', 'bong', 'sao', 'tao'];
      for (var i = 0; i < names.length; i++) {
        (function (n) {
          var a = ART.sprites[n];
          var b = E('button', 'sc-libitem', a.costumes[0] + '<span>' + a.name + '</span>');
          Core.on(b, function () {
            var nm = a.name, k = 2;
            while (spriteNamed(nm)) nm = a.name + ' ' + (k++);
            var s = newSprite({ art: n, name: nm, x: Math.round(Math.random() * 200 - 100), y: Math.round(Math.random() * 120 - 60) });
            sprites.push(s); cur = s; selBlock = null; target = null;
            closeDialog(); renderAll();
            say('Đã thêm nhân vật <b>' + escH(nm) + '</b>. Chương trình ở giữa giờ là của nhân vật này.', 'good');
            changed('addSprite');
          });
          bodyEl.appendChild(b);
        })(names[i]);
      }
      dialog(lang === 'vi' ? 'Chọn một nhân vật' : 'Choose a Sprite', bodyEl, [btn('Thôi', closeDialog)]);
    }
    function backdropLibrary() {
      var bodyEl = E('div', 'sc-lib');
      var names = cfg.libBackdrops || ['trang', 'vuon', 'be', 'troi', 'lop', 'san'];
      for (var i = 0; i < names.length; i++) {
        (function (n) {
          var b = E('button', 'sc-libitem sc-libbd', ART.backdrops[n].svg + '<span>' + ART.backdrops[n].name + '</span>');
          Core.on(b, function () { backdrop = n; closeDialog(); renderStage(); say('Đã đổi phông nền thành <b>' + ART.backdrops[n].name + '</b>.', 'good'); changed('backdrop'); });
          bodyEl.appendChild(b);
        })(names[i]);
      }
      dialog(lang === 'vi' ? 'Chọn phông nền' : 'Choose a Backdrop', bodyEl, [btn('Thôi', closeDialog)]);
    }
    function spriteNamed(n) { for (var i = 0; i < sprites.length; i++) if (sprites[i].name === n) return sprites[i]; return null; }

    /* ---------- stage ---------- */
    function renderStageBar() {
      stageBar.innerHTML = '';
      var go = E('button', 'sc-go', Icons.flag);
      go.setAttribute('aria-label', 'Chạy chương trình (lá cờ xanh)');
      Core.on(go, flag);
      var stop = E('button', 'sc-stop', Icons.stopSq || Icons.cross);
      stop.setAttribute('aria-label', 'Dừng chương trình');
      Core.on(stop, function () { stopAll(); say('Đã dừng chương trình.', 'info'); changed('stop'); });
      var full = E('button', 'sc-full', Icons.fullscr || Icons.plus);
      full.setAttribute('aria-label', 'Phóng to sân khấu');
      Core.on(full, function () { if (Core.hasClass(app, 'is-full')) Core.removeClass(app, 'is-full'); else Core.addClass(app, 'is-full'); changed('full'); });
      stageBar.appendChild(go); stageBar.appendChild(stop); stageBar.appendChild(full);
    }
    function renderStage() {
      bdEl.innerHTML = ART.backdrops[backdrop] ? ART.backdrops[backdrop].svg : '';
      spritesLayer.innerHTML = '';
      for (var i = 0; i < sprites.length; i++) {
        (function (s) {
          var el = E('div', 'sc-sprite');
          var img = E('div', 'sc-costume');
          el.appendChild(img);
          var bubble = E('div', 'sc-bubble');
          el.appendChild(bubble);
          s.el = el; s.img = img; s.bubble = bubble;
          Core.on(el, function (ev) { ev.stopPropagation(); fire('spriteclick', s); });
          spritesLayer.appendChild(el);
          drawSprite(s, true);
        })(sprites[i]);
      }
      renderVars();
      renderKeypad();
    }
    function drawSprite(s, full) {
      if (!s.el) return;
      var art = ART.sprites[s.art];
      if (full || s._cost !== s.costume) { s.img.innerHTML = art.costumes[s.costume % art.costumes.length]; s._cost = s.costume; }
      var px = (240 + s.x) * SC, py = (180 - s.y) * SC, sz = 64 * SC * s.size / 100;
      var rot = s.rot === 'all' ? s.dir - 90 : 0;
      var flip = s.rot === 'lr' && s.dir < 0 ? -1 : 1;
      s.el.style.display = s.visible ? '' : 'none';
      s.el.style.left = (px - sz / 2) + 'px'; s.el.style.top = (py - sz / 2) + 'px';
      s.el.style.width = sz + 'px'; s.el.style.height = sz + 'px';
      var tf = 'rotate(' + rot + 'deg) scaleX(' + flip + ')';
      s.img.style.webkitTransform = tf; s.img.style.transform = tf;
      s.img.style.filter = s.color ? 'hue-rotate(' + (s.color * 1.8) + 'deg)' : '';
      if (s.say) { s.bubble.style.display = 'block'; s.bubble.className = 'sc-bubble' + (s.say.think ? ' think' : ''); s.bubble.innerHTML = ''; s.bubble.appendChild(document.createTextNode(String(s.say.text))); }
      else s.bubble.style.display = 'none';
    }
    function renderVars() {
      varLayer.innerHTML = '';
      for (var v in vars) if (vars.hasOwnProperty(v) && shownVars[v]) {
        var el = E('div', 'sc-varbox', '<span></span> <b></b>');
        el.firstChild.appendChild(document.createTextNode(v));
        el.lastChild.appendChild(document.createTextNode(String(vars[v])));
        varLayer.appendChild(el);
      }
    }
    function renderKeypad() {
      keypad.innerHTML = '';
      var need = {};
      for (var i = 0; i < sprites.length; i++) for (var j = 0; j < sprites[i].scripts.length; j++) {
        var hb = sprites[i].scripts[j].blocks[0];
        if (hb && hb.op === 'keypress') need[hb.args[0]] = true;
        walkAll(sprites[i].scripts[j].blocks, function (b) { if (b.op === 'keyDown') need[b.args[0]] = true; });
      }
      var names = { up: '▲', down: '▼', left: '◀', right: '▶', space: lang === 'vi' ? 'phím trắng' : 'space', a: 'a', b: 'b' };
      var any = false;
      for (var k in need) if (need.hasOwnProperty(k)) {
        any = true;
        (function (k) {
          var b = E('button', 'btn btn-small sc-key', names[k] || k);
          b.addEventListener('mousedown', function (e) { e.preventDefault(); keys[k] = true; fire('keypress', k); }, false);
          b.addEventListener('touchstart', function (e) { e.preventDefault(); keys[k] = true; fire('keypress', k); }, false);
          var up = function () { keys[k] = false; };
          b.addEventListener('mouseup', up, false); b.addEventListener('mouseleave', up, false); b.addEventListener('touchend', up, false);
          keypad.appendChild(b);
        })(k);
      }
      keypad.style.display = any ? '' : 'none';
    }
    function walkAll(list, fn) { for (var i = 0; i < list.length; i++) { fn(list[i]); for (var a = 0; a < list[i].args.length; a++) if (list[i].args[a] && list[i].args[a].blk) walkAll([list[i].args[a].blk], fn); if (list[i].body) walkAll(list[i].body, fn); if (list[i].body2) walkAll(list[i].body2, fn); } }
    var KEYMAP = { 32: 'space', 38: 'up', 40: 'down', 37: 'left', 39: 'right', 65: 'a', 66: 'b' };
    document.addEventListener('keydown', function (e) {
      if (!host.offsetParent || exited || /input|textarea|select/i.test((e.target && e.target.tagName) || '')) return;
      var k = KEYMAP[e.keyCode];
      if (k) { e.preventDefault(); if (!keys[k]) fire('keypress', k); keys[k] = true; }
    }, false);
    document.addEventListener('keyup', function (e) { var k = KEYMAP[e.keyCode]; if (k) keys[k] = false; }, false);

    /* ---------- pen ---------- */
    function clearPen() { penSegs = []; if (ctx) ctx.clearRect(0, 0, 480, 360); }
    function line(s, x1, y1, x2, y2) {
      penSegs.push({ x1: x1, y1: y1, x2: x2, y2: y2, c: s.penColor, sprite: s.name });
      if (!ctx) return;
      ctx.strokeStyle = s.penColor; ctx.lineWidth = s.penSize; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(240 + x1, 180 - y1); ctx.lineTo(240 + x2, 180 - y2); ctx.stroke();
    }
    function moveTo(s, x, y) {
      if (s.pen) line(s, s.x, s.y, x, y);
      s.x = x; s.y = y;
    }
    function radius(s) { return (ART.sprites[s.art].r || 24) * s.size / 100; }
    function touchingEdge(s) { var r = radius(s); return s.x - r <= -240 || s.x + r >= 240 || s.y - r <= -180 || s.y + r >= 180; }
    function bounce(s) {
      var r = radius(s), hit = false;
      if (s.x - r < -240 || s.x + r > 240) { s.dir = -s.dir; s.x = Math.max(-240 + r, Math.min(240 - r, s.x)); hit = true; }
      if (s.y - r < -180 || s.y + r > 180) { s.dir = 180 - s.dir; s.y = Math.max(-180 + r, Math.min(180 - r, s.y)); hit = true; }
      s.dir = normDir(s.dir);
      return hit;
    }
    function normDir(d) { d = ((d + 180) % 360 + 360) % 360 - 180; return d === -180 ? 180 : d; }

    /* ---------- interpreter ---------- */
    function num(v) { var n = +v; return isNaN(n) ? 0 : n; }
    function val(s, v) {
      if (v && v.blk) return evalRep(s, v.blk);
      return v === null || v === undefined ? '' : v;
    }
    function evalRep(s, b) {
      var a = b.args;
      switch (b.op) {
        case 'xpos': return Math.round(s.x);
        case 'ypos': return Math.round(s.y);
        case 'answer': return answer;
        case 'getVar': return vars.hasOwnProperty(a[0]) ? vars[a[0]] : 0;
        case 'add': return num(val(s, a[0])) + num(val(s, a[1]));
        case 'sub': return num(val(s, a[0])) - num(val(s, a[1]));
        case 'mul': return num(val(s, a[0])) * num(val(s, a[1]));
        case 'div': var d = num(val(s, a[1])); return d === 0 ? 0 : num(val(s, a[0])) / d;
        case 'mod': var m2 = num(val(s, a[1])); if (m2 === 0) return 0; var r2 = num(val(s, a[0])) % m2; return r2 < 0 ? r2 + Math.abs(m2) : r2;
        case 'random': var lo = num(val(s, a[0])), hi = num(val(s, a[1])); if (lo > hi) { var t = lo; lo = hi; hi = t; } return Math.floor(lo) === lo && Math.floor(hi) === hi ? lo + Math.floor(Math.random() * (hi - lo + 1)) : lo + Math.random() * (hi - lo);
        case 'join': return String(val(s, a[0])) + String(val(s, a[1]));
        default: return evalBool(s, b) ? 'true' : 'false';
      }
    }
    function cmpVals(x, y) { var nx = +x, ny = +y; if (x !== '' && y !== '' && !isNaN(nx) && !isNaN(ny)) return nx - ny; x = String(x).toLowerCase(); y = String(y).toLowerCase(); return x < y ? -1 : x > y ? 1 : 0; }
    function evalBool(s, b) {
      if (!b) return false;
      var a = b.args;
      switch (b.op) {
        case 'touching':
          if (a[0] === 'edge') return touchingEdge(s);
          if (a[0] === 'mouse') { if (!mouse.in || !s.visible) return false; var mx = mouse.x - s.x, my = mouse.y - s.y, mr = radius(s); return mx * mx + my * my <= mr * mr; }
          var o = spriteNamed(a[0]);
          if (!o || !o.visible || !s.visible) return false;
          var dx = o.x - s.x, dy = o.y - s.y, rr = radius(o) + radius(s) - 6;
          return dx * dx + dy * dy <= rr * rr;
        case 'keyDown': return !!keys[a[0]];
        case 'mouseDown': return mouse.down;
        case 'gt': return cmpVals(val(s, a[0]), val(s, a[1])) > 0;
        case 'lt': return cmpVals(val(s, a[0]), val(s, a[1])) < 0;
        case 'eq': return cmpVals(val(s, a[0]), val(s, a[1])) === 0;
        case 'and': return evalBool(s, a[0] && a[0].blk) && evalBool(s, a[1] && a[1].blk);
        case 'or': return evalBool(s, a[0] && a[0].blk) || evalBool(s, a[1] && a[1].blk);
        case 'not': return !evalBool(s, a[0] && a[0].blk);
        default: return false;
      }
    }
    function cond(s, v) { return v && v.blk ? evalBool(s, v.blk) : false; }
    var TICK = 33;
    function startThread(s, script) {
      var t = { s: s, stack: [{ list: script.blocks, i: 1, kind: 'seq' }], wait: 0, glide: null, done: false, script: script };
      threads.push(t);
    }
    function fire(kind, arg) {
      if (exited) return;
      for (var i = 0; i < sprites.length; i++) {
        var s = sprites[i];
        if (kind === 'spriteclick' && s !== arg) continue;
        for (var j = 0; j < s.scripts.length; j++) {
          var h = s.scripts[j].blocks[0];
          if (!h || h.op !== kind) continue;
          if (kind === 'keypress' && h.args[0] !== arg) continue;
          /* restart the same script if it is already running */
          for (var k = threads.length - 1; k >= 0; k--) if (threads[k].script === s.scripts[j]) threads.splice(k, 1);
          startThread(s, s.scripts[j]);
        }
      }
      if (threads.length && !running) startLoop();
      if (kind !== 'flag') changed(kind);
    }
    function flag() {
      stopAll(true);
      for (var i = 0; i < sprites.length; i++) { var s = sprites[i]; s.x0 = s.x0 === undefined ? s.x : s.x0; s.y0 = s.y0 === undefined ? s.y : s.y0; s.dir0 = s.dir0 === undefined ? s.dir : s.dir0; }
      runs++;
      fire('flag');
      if (!threads.length) say(lang === 'vi' ? 'Chưa có khối <b>khi bấm vào lá cờ xanh</b> nên chương trình không chạy. Em vào nhóm <b>Sự kiện</b> để thêm nha.' : 'No "when flag clicked" block yet.', 'info');
      changed('flag');
    }
    function startLoop() { running = true; if (!timer) timer = setTimeout(loop, TICK); }
    function loop() {
      timer = null;
      clock += TICK;
      step();
      redraw();
      if (threads.length) timer = setTimeout(loop, Core.isEink() ? 120 : TICK);
      else { running = false; clearRunning(); changed('end'); }
    }
    function stopAll(silent) {
      threads = []; running = false;
      if (timer) clearTimeout(timer); timer = null;
      for (var i = 0; i < sprites.length; i++) sprites[i].say = null;
      if (asking) { askEl.innerHTML = ''; askEl.style.display = 'none'; asking = null; }
      clearRunning(); redraw();
    }
    function clearRunning() { var els = codeEl.querySelectorAll('.is-running'); for (var i = 0; i < els.length; i++) Core.removeClass(els[i], 'is-running'); }
    function redraw() { for (var i = 0; i < sprites.length; i++) drawSprite(sprites[i]); renderVars(); }
    function step() {
      for (var i = 0; i < threads.length; i++) runThread(threads[i]);
      for (var j = threads.length - 1; j >= 0; j--) if (threads[j].done) threads.splice(j, 1);
    }
    function mark(b) {
      clearRunning();
      var el = document.getElementById('blk-' + b.id);
      if (el) Core.addClass(el, 'is-running');
    }
    function runThread(t) {
      var s = t.s, n = 0;
      if (sprites.indexOf(s) < 0) { t.done = true; return; }
      while (!t.done && n++ < 300) {
        if (t.wait && clock < t.wait) return;
        if (t.glide) {
          var g = t.glide, p = Math.min(1, (clock - g.t0) / g.dur);
          moveTo(s, g.x0 + (g.x1 - g.x0) * p, g.y0 + (g.y1 - g.y0) * p);
          if (p < 1) return;
          t.glide = null;
        }
        if (t.asking) return;
        if (t.waitCond) { if (!cond(s, t.waitCond)) return; t.waitCond = null; }
        if (t.wait) { t.wait = 0; if (t.clearSay) { s.say = null; t.clearSay = false; } }
        var f = t.stack[t.stack.length - 1];
        if (!f) { t.done = true; return; }
        if (f.i >= f.list.length) {
          if (f.kind === 'repeat') { f.count--; if (f.count > 0) { f.i = 0; return; } t.stack.pop(); continue; }
          if (f.kind === 'forever') { f.i = 0; return; }
          if (f.kind === 'until') { if (cond(s, f.cond)) { t.stack.pop(); continue; } f.i = 0; return; }
          t.stack.pop(); continue;
        }
        var b = f.list[f.i++];
        if (exec(t, s, b) === 'yield') return;
      }
    }
    function exec(t, s, b) {
      var a = b.args, v0 = function () { return val(s, a[0]); };
      if (!Core.isEink()) mark(b);
      switch (b.op) {
        case 'move': var st = num(v0()), rad = (90 - s.dir) * Math.PI / 180; moveTo(s, s.x + st * Math.cos(rad), s.y + st * Math.sin(rad)); return;
        case 'turnR': s.dir = normDir(s.dir + num(v0())); return;
        case 'turnL': s.dir = normDir(s.dir - num(v0())); return;
        case 'goto': moveTo(s, num(v0()), num(val(s, a[1]))); return;
        case 'gotoRandom': moveTo(s, Math.round(Math.random() * 400 - 200), Math.round(Math.random() * 300 - 150)); return;
        case 'gotoMouse': if (mouse.in) moveTo(s, Math.max(-240, Math.min(240, mouse.x)), Math.max(-180, Math.min(180, mouse.y))); return;
        case 'glideRandom': case 'glide':
          var dur = num(v0()) * 1000, x1 = b.op === 'glide' ? num(val(s, a[1])) : Math.round(Math.random() * 400 - 200), y1 = b.op === 'glide' ? num(val(s, a[2])) : Math.round(Math.random() * 300 - 150);
          if (dur <= 0) { moveTo(s, x1, y1); return; }
          t.glide = { x0: s.x, y0: s.y, x1: x1, y1: y1, t0: clock, dur: dur }; return 'yield';
        case 'glideTo':
          var tg = spriteNamed(a[1]); if (!tg) return;
          var dur2 = num(v0()) * 1000;
          if (dur2 <= 0) { moveTo(s, tg.x, tg.y); return; }
          t.glide = { x0: s.x, y0: s.y, x1: tg.x, y1: tg.y, t0: clock, dur: dur2 }; return 'yield';
        case 'point': s.dir = normDir(num(v0())); return;
        case 'changeX': moveTo(s, s.x + num(v0()), s.y); return;
        case 'setX': moveTo(s, num(v0()), s.y); return;
        case 'changeY': moveTo(s, s.x, s.y + num(v0())); return;
        case 'setY': moveTo(s, s.x, num(v0())); return;
        case 'bounce': bounce(s); return;
        case 'rotStyle': s.rot = a[0]; return;
        case 'sayFor': case 'thinkFor':
          s.say = { text: val(s, a[0]), think: b.op === 'thinkFor' }; said.push({ sprite: s.name, text: String(s.say.text) });
          t.wait = clock + num(val(s, a[1])) * 1000; t.clearSay = true; return 'yield';
        case 'say': var tx = val(s, a[0]); s.say = tx === '' ? null : { text: tx }; if (tx !== '') said.push({ sprite: s.name, text: String(tx) }); return;
        case 'nextCostume': s.costume++; return;
        case 'nextBackdrop': var keysB = cfg.libBackdrops || ['trang', 'vuon', 'be', 'troi', 'lop', 'san']; backdrop = keysB[(keysB.indexOf(backdrop) + 1) % keysB.length]; bdEl.innerHTML = ART.backdrops[backdrop].svg; return;
        case 'changeSize': s.size = Math.max(5, s.size + num(v0())); return;
        case 'setSize': s.size = Math.max(5, num(v0())); return;
        case 'changeColor': s.color = (s.color + num(v0())) % 200; return;
        case 'clearFx': s.color = 0; return;
        case 'show': s.visible = true; return;
        case 'hide': s.visible = false; return;
        case 'playUntil': case 'play':
          beep(a[0]); s.say = { text: '♪ ' + optLabel(B.play.a[0], a[0]) }; said.push({ sprite: s.name, text: 'sound:' + a[0] });
          t.wait = clock + (b.op === 'playUntil' ? 800 : 400); t.clearSay = true; if (b.op === 'playUntil') return 'yield'; return;
        case 'wait': t.wait = clock + num(v0()) * 1000; return 'yield';
        case 'repeat': var c = Math.floor(num(v0())); if (c > 0 && b.body.length) t.stack.push({ list: b.body, i: 0, kind: 'repeat', count: c }); return;
        case 'forever': t.stack.push({ list: b.body, i: 0, kind: 'forever' }); return;
        case 'if': if (cond(s, a[0])) t.stack.push({ list: b.body, i: 0, kind: 'seq' }); return;
        case 'ifElse': t.stack.push({ list: cond(s, a[0]) ? b.body : b.body2, i: 0, kind: 'seq' }); return;
        case 'until': if (!cond(s, a[0])) t.stack.push({ list: b.body, i: 0, kind: 'until', cond: a[0] }); return;
        case 'waitUntil': if (!cond(s, a[0])) { t.waitCond = a[0]; return 'yield'; } return;
        case 'stopAll': threads = []; t.done = true; return 'yield';
        case 'ask': askQuestion(t, s, String(v0())); return 'yield';
        case 'setVar': if (a[0] !== '') vars[a[0]] = val(s, a[1]); return;
        case 'changeVar': if (a[0] !== '') vars[a[0]] = num(vars[a[0]]) + num(val(s, a[1])); return;
        case 'showVar': shownVars[a[0]] = true; return;
        case 'hideVar': shownVars[a[0]] = false; return;
        case 'clear': clearPen(); return;
        case 'penDown': s.pen = true; return;
        case 'penUp': s.pen = false; return;
        case 'penColor': s.penColor = a[0]; return;
        case 'penSize': s.penSize = Math.max(1, num(v0())); return;
      }
    }
    function askQuestion(t, s, q) {
      t.asking = true; asking = t;
      s.say = { text: q }; drawSprite(s);
      askEl.innerHTML = '';
      askEl.style.display = 'flex';
      var inp = E('input', 'sc-askin');
      inp.setAttribute('aria-label', 'Câu trả lời');
      if (window.Telex) Telex.attach(inp, { mode: function () { return 'telex'; } });
      var ok = E('button', 'btn btn-small btn-primary', 'OK');
      function done() { answer = inp.value; askEl.innerHTML = ''; askEl.style.display = 'none'; s.say = null; t.asking = false; asking = null; changed('answer'); }
      Core.on(ok, done);
      inp.addEventListener('keydown', function (e) { if (e.keyCode === 13) done(); }, false);
      askEl.appendChild(inp); askEl.appendChild(ok);
      setTimeout(function () { try { inp.focus(); } catch (e) {} }, 0);
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
      if (what === 'add' || what === 'del' || what === 'arg' || what === 'addSprite' || what === 'delSprite') renderKeypad();
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

    function renderAll() { renderMenu(); renderCats(); renderPalette(); renderCode(); renderStageBar(); renderStage(); renderSprites(); }

    /* ---------- API for lessons ---------- */
    function specsOf(sp) {
      var out = [];
      if (!sp) return out;
      for (var j = 0; j < sp.scripts.length; j++) { var l = []; for (var k = 0; k < sp.scripts[j].blocks.length; k++) l.push(toSpec(sp.scripts[j].blocks[k])); out.push(l); }
      return out;
    }
    function flat(specs, out) {
      out = out || [];
      for (var i = 0; i < specs.length; i++) {
        var s = specs[i];
        if (isSpec(s)) { out.push(s); for (var k = 1; k < s.length; k++) { if (isSpec(s[k])) flat([s[k]], out); else if (isBody(s[k])) flat(s[k], out); } }
        else if (isBody(s)) flat(s, out);
      }
      return out;
    }
    var api = {
      sprites: function () { var n = []; for (var i = 0; i < sprites.length; i++) n.push(sprites[i].name); return n; },
      arts: function () { var n = []; for (var i = 0; i < sprites.length; i++) n.push(sprites[i].art); return n; },
      sprite: function (name) { return name ? spriteNamed(name) : cur; },
      byArt: function (art) { for (var i = 0; i < sprites.length; i++) if (sprites[i].art === art) return sprites[i]; return null; },
      scripts: function (name) { return specsOf(name && typeof name === 'object' ? name : (name ? spriteNamed(name) : cur)); },
      /* every block spec of a sprite, flattened */
      blocks: function (sp) { return flat(api.scripts(sp)); },
      has: function (sp, op, pred) { var l = api.blocks(sp); for (var i = 0; i < l.length; i++) if (l[i][0] === op && (!pred || pred(l[i]))) return true; return false; },
      count: function (sp, op) { var l = api.blocks(sp), n = 0; for (var i = 0; i < l.length; i++) if (l[i][0] === op) n++; return n; },
      backdrop: function () { return backdrop; },
      runs: function () { return runs; },
      running: function () { return running; },
      pen: function () { return penSegs.slice(); },
      said: function () { return said.slice(); },
      vars: function () { return vars; },
      saved: function () { return savedAs; },
      opened: function () { return opened; },
      exited: function () { return exited; },
      lang: function () { return lang; },
      project: project,
      load: function (p) { loadProject(p); changed('load'); },
      open: function (p, path) { doOpen(p, path); },
      save: doSave,
      flag: flag,
      stop: function () { stopAll(); changed('stop'); },
      setLang: function (l) { lang = l; renderAll(); changed('lang'); },
      addSprite: function (art, name) { var s = newSprite({ art: art, name: name }); sprites.push(s); cur = s; renderAll(); changed('addSprite'); return s; },
      removeSprite: function (name) { var s = spriteNamed(name); if (s) { sprites.splice(sprites.indexOf(s), 1); cur = sprites[0] || null; renderAll(); changed('delSprite'); } },
      setScripts: function (name, scripts) { var s = spriteNamed(name) || cur; s.scripts = []; for (var i = 0; i < scripts.length; i++) s.scripts.push(scriptFrom(scripts[i])); renderAll(); changed('add'); },
      setBackdrop: function (n) { backdrop = n; renderStage(); changed('backdrop'); },
      key: function (k) { fire('keypress', k); },
      mouse: function (x, y, down) { mouse.x = x; mouse.y = y; mouse.in = x !== null; mouse.down = !!down; },
      answer: function (text) { if (asking) { var inp = askEl.querySelector('input'); inp.value = text; askEl.querySelector('button').click(); } },
      /* run the program quickly without waiting (for checks); returns after `secs` simulated seconds */
      simulate: function (secs) {
        if (timer) clearTimeout(timer); timer = null;
        var end = clock + (secs || 5) * 1000, guard = 0;
        while (threads.length && clock < end && guard++ < 20000) { clock += TICK; step(); }
        redraw();
        if (!threads.length) { running = false; changed('end'); } else if (running) timer = setTimeout(loop, TICK);
      },
      vars: function () { return vars; }
    };

    if (cfg.project) loadProject(cfg.project); else { sprites = [newSprite({ art: 'meo' })]; cur = sprites[0]; renderAll(); }
    renderTasks();
    say(cfg.hello || 'Chạm vào một nhóm lệnh, rồi chạm vào khối lệnh để thêm vào chương trình. Bấm lá cờ xanh để chạy.', 'info');
    return api;
  };
  window.Scratch.BLOCKS = B;
  window.Scratch.CATS = CATS;
})();
