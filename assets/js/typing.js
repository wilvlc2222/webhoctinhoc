/* Keyboard lessons: on-screen keyboard with finger colours, a "which finger?" game,
   a typing exercise that checks every character, and a free typing box.
   ES5 only (Kindle browser). Needs core.js. */
(function () {
  var E = Core.el;

  var FINGERS = {
    L5: 'ngón út tay trái', L4: 'ngón áp út tay trái', L3: 'ngón giữa tay trái', L2: 'ngón trỏ tay trái',
    R2: 'ngón trỏ tay phải', R3: 'ngón giữa tay phải', R4: 'ngón áp út tay phải', R5: 'ngón út tay phải',
    T: 'ngón cái'
  };
  var ROWS = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['Caps Lock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', 'Enter'],
    ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift '],
    ['Space']
  ];
  var FINGER_OF = {};
  (function () {
    var map = {
      L5: ['`', '1', 'Tab', 'Q', 'Caps Lock', 'A', 'Shift', 'Z'],
      L4: ['2', 'W', 'S', 'X'], L3: ['3', 'E', 'D', 'C'], L2: ['4', '5', 'R', 'T', 'F', 'G', 'V', 'B'],
      R2: ['6', '7', 'Y', 'U', 'H', 'J', 'N', 'M'], R3: ['8', 'I', 'K', ','], R4: ['9', 'O', 'L', '.'],
      R5: ['0', '-', '=', 'Backspace', 'P', '[', ']', '\\', ';', '\'', 'Enter', '/', 'Shift '],
      T: ['Space']
    };
    for (var f in map) if (map.hasOwnProperty(f)) for (var i = 0; i < map[f].length; i++) FINGER_OF[map[f][i]] = f;
  })();
  var HOME = { A: 1, S: 1, D: 1, F: 1, J: 1, K: 1, L: 1, ';': 1 };
  var WIDE = { 'Backspace': 2, 'Tab': 1.5, '\\': 1.5, 'Caps Lock': 1.8, 'Enter': 2.2, 'Shift': 2.3, 'Shift ': 2.9, 'Space': 7 };

  window.Typing = { FINGERS: FINGERS, fingerOf: function (k) { return FINGER_OF[k]; } };

  /* opts = { color: 'number' | 'all' | 'none', dots: [keys to mark with a finger dot], mini, onKey(key, finger) } */
  Typing.keyboard = function (host, opts) {
    opts = opts || {};
    var kb = E('div', 'kbd' + (opts.mini ? ' kbd-mini' : ''));
    var dots = {};
    for (var d = 0; d < (opts.dots || []).length; d++) dots[opts.dots[d]] = 1;
    var keys = {};
    for (var r = 0; r < ROWS.length; r++) {
      var row = E('div', 'kbd-row');
      for (var c = 0; c < ROWS[r].length; c++) {
        (function (k) {
          var f = FINGER_OF[k];
          var colored = opts.color === 'all' || (opts.color === 'number' && /^[0-9]$/.test(k));
          var key = E(opts.onKey ? 'button' : 'span', 'kbd-key' + (colored ? ' f-' + f : '') + (HOME[k] ? ' home' : ''),
            '<span class="kbd-cap">' + (k === 'Space' ? '' : k.replace(/ $/, '')) + '</span>' + (dots[k] ? '<span class="kbd-dot"></span>' : ''));
          if (WIDE[k]) key.style.flexGrow = WIDE[k];
          if (opts.onKey) {
            key.setAttribute('aria-label', 'Phím ' + (k === 'Space' ? 'cách' : k));
            Core.on(key, function () { opts.onKey(k, f, key); });
          }
          keys[k] = key;
          row.appendChild(key);
        })(ROWS[r][c]);
      }
      kb.appendChild(row);
    }
    if (host) host.appendChild(kb);
    kb._keys = keys;
    return kb;
  };
  /* static mini keyboard as an HTML string (for quiz options) */
  Typing.miniHTML = function (dots) {
    var kb = Typing.keyboard(null, { mini: true, dots: dots, color: 'none' });
    var holder = E('div');
    holder.appendChild(kb);
    return holder.innerHTML;
  };
  Typing.flash = function (kb, k) {
    var el = kb._keys[k];
    if (!el) return;
    Core.addClass(el, 'is-hit');
    setTimeout(function () { Core.removeClass(el, 'is-hit'); }, 900);
  };

  /* "Which finger types this key?"  cfg = { lesson, id, keys: ['1','2',...] } */
  Typing.fingerGame = function (host, cfg) {
    var keys = Core.shuffle(cfg.keys);
    var i = 0, wrongs = 0;
    var ask = E('div', 'fg-ask');
    var hands = E('div', 'fg-hands');
    var fb = E('div', 'feedback');
    fb.setAttribute('aria-live', 'polite');
    var order = [['L5', 'L4', 'L3', 'L2'], ['R2', 'R3', 'R4', 'R5']];
    var label = { L5: 'Út', L4: 'Áp út', L3: 'Giữa', L2: 'Trỏ', R2: 'Trỏ', R3: 'Giữa', R4: 'Áp út', R5: 'Út' };
    for (var h = 0; h < 2; h++) {
      var hand = E('div', 'fg-hand');
      hand.appendChild(E('div', 'fg-hand-title', h === 0 ? 'Tay trái' : 'Tay phải'));
      var row = E('div', 'fg-row');
      for (var f = 0; f < 4; f++) {
        (function (fid) {
          var b = E('button', 'btn fg-btn f-' + fid, label[fid]);
          b.setAttribute('aria-label', FINGERS[fid]);
          Core.on(b, function () { answer(fid, b); });
          row.appendChild(b);
        })(order[h][f]);
      }
      hand.appendChild(row);
      hands.appendChild(hand);
    }
    function show() {
      ask.innerHTML = 'Câu ' + (i + 1) + '/' + keys.length + ': phím <span class="kbd-key kbd-inline">' + keys[i] + '</span> gõ bằng ngón nào?';
    }
    function answer(fid, b) {
      if (i >= keys.length) return;
      var right = FINGER_OF[keys[i]];
      if (fid !== right) {
        wrongs++;
        Core.addClass(b, 'is-wrong');
        setTimeout(function () { Core.removeClass(b, 'is-wrong'); }, 700);
        Core.say(fb, 'Chưa đúng. Nhìn màu của phím ' + keys[i] + ' trên bàn phím nha.', 'bad');
        if (cfg.keyboard) Typing.flash(cfg.keyboard, keys[i]);
        return;
      }
      i++;
      if (i === keys.length) {
        ask.innerHTML = 'Xong ' + keys.length + ' câu!';
        Core.celebrate(fb, cfg.lesson, cfg.id, 'Em nhớ hết ngón tay cho từng phím rồi!');
        var again = E('button', 'btn btn-small', Core.icon('reset') + 'Chơi lại');
        Core.on(again, function () { keys = Core.shuffle(cfg.keys); i = 0; show(); Core.say(fb, 'Chơi lại nha!', 'info'); });
        fb.appendChild(again);
      } else {
        Core.say(fb, 'Đúng! Phím ' + keys[i - 1] + ' là ' + FINGERS[right] + '.', 'good');
        show();
      }
    }
    host.appendChild(ask);
    host.appendChild(hands);
    host.appendChild(fb);
    show();
  };

  /* ---------- typing exercise ---------- */
  var VN_FROM = 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ';
  var VN_TO = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd';
  function plain(s) {
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i), lc = c.toLowerCase(), k = VN_FROM.indexOf(lc);
      if (k < 0) { out += c; continue; }
      var r = VN_TO.charAt(k);
      out += c !== lc ? r.toUpperCase() : r;
    }
    return out;
  }
  function clean(s) { return s.replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n'); }
  Typing.plain = plain;

  /* cfg = { lesson, id, tasks: [{ title, text }], note } — star when every task is typed correctly */
  Typing.practice = function (host, cfg) {
    var tabs = E('div', 'lab-tabs');
    var target = E('div', 'type-target');
    var input = E('textarea', 'type-input');
    input.setAttribute('rows', '4');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('aria-label', 'Ô gõ chữ');
    var status = E('div', 'type-status');
    var fb = E('div', 'feedback');
    fb.setAttribute('aria-live', 'polite');
    var done = {}, cur = 0, spans = [], goal = '';

    function renderTabs() {
      tabs.innerHTML = '';
      for (var t = 0; t < cfg.tasks.length; t++) {
        (function (t) {
          var b = E('button', 'btn btn-small lab-tab', (done[t] ? Core.icon('check') : '') + cfg.tasks[t].title);
          b.setAttribute('aria-pressed', t === cur ? 'true' : 'false');
          Core.on(b, function () { load(t); });
          tabs.appendChild(b);
        })(t);
      }
    }
    function load(t) {
      cur = t;
      goal = plain(clean(cfg.tasks[t].text));
      target.innerHTML = '';
      spans = [];
      var txt = clean(cfg.tasks[t].text);
      for (var i = 0; i < txt.length; i++) {
        var ch = txt.charAt(i);
        var s = E('span', 'tc' + (ch === '\n' ? ' tc-nl' : ''));
        s.appendChild(document.createTextNode(ch === '\n' ? '↵\n' : ch));
        spans.push(s);
        target.appendChild(s);
      }
      input.value = '';
      Core.say(fb, cfg.note || 'Đặt tay ở hàng phím cơ sở rồi gõ theo đoạn chữ ở trên. Gõ có dấu hay không dấu đều được.', 'info');
      check();
      renderTabs();
    }
    function check() {
      var typed = plain(clean(input.value));
      var ok = 0, firstBad = -1;
      for (var i = 0; i < spans.length; i++) {
        var cls = 'tc' + (goal.charAt(i) === '\n' ? ' tc-nl' : '');
        if (i < typed.length) {
          if (typed.charAt(i) === goal.charAt(i)) { cls += ' ok'; if (firstBad < 0) ok++; }
          else { cls += ' bad'; if (firstBad < 0) firstBad = i; }
        } else if (i === typed.length) cls += ' cur';
        spans[i].className = cls;
      }
      var pct = Math.round(100 * ok / goal.length);
      status.innerHTML = 'Đã gõ đúng <b>' + ok + '</b>/' + goal.length + ' kí tự (' + pct + '%)' +
        (firstBad >= 0 ? ' · <b>Có chỗ gõ sai</b>, em xoá bằng phím Backspace rồi gõ lại nha.' : '');
      var finished = typed.replace(/\s+$/, '') === goal.replace(/\s+$/, '');
      if (finished && !done[cur]) {
        done[cur] = true;
        renderTabs();
        var all = true;
        for (var t = 0; t < cfg.tasks.length; t++) if (!done[t]) all = false;
        if (all) Core.celebrate(fb, cfg.lesson, cfg.id, 'Em gõ xong tất cả các đoạn rồi!');
        else Core.say(fb, 'Hoàn thành "' + cfg.tasks[cur].title + '"! Chọn đoạn tiếp theo ở trên nha.', 'good');
      }
    }
    input.addEventListener('input', check, false);
    input.addEventListener('keyup', check, false);
    host.appendChild(tabs);
    host.appendChild(target);
    host.appendChild(input);
    host.appendChild(status);
    host.appendChild(fb);
    load(0);
  };

  /* ---------- typing tutor game (like Kiran's Typing Tutor "Kids Typing") ----------
     cfg = { lesson, courses: [{ id, name, items: ['A', 'S', ...] or [{ t: 'red', hint: 'đỏ', color: '#e03131' }], star: 'capitals' }] }
     The next key lights up on the keyboard; for capitals the right Shift key lights up too. */
  Typing.tutor = function (host, cfg) {
    var tabs = E('div', 'lab-tabs');
    var game = E('div', 'tt-game');
    var target = E('div', 'tt-target');
    var hint = E('div', 'tt-hint');
    var input = E('input', 'tt-input');
    input.setAttribute('autocomplete', 'off'); input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off'); input.setAttribute('spellcheck', 'false');
    input.setAttribute('aria-label', 'Gõ ở đây');
    input.setAttribute('placeholder', 'Chạm vào đây rồi gõ');
    var stats = E('div', 'tt-stats');
    var fb = E('div', 'feedback');
    fb.setAttribute('aria-live', 'polite');
    game.appendChild(target); game.appendChild(hint); game.appendChild(input); game.appendChild(stats);
    host.appendChild(tabs); host.appendChild(game);
    var kb = Typing.keyboard(host, { color: 'all' });
    kb.className += ' kbd-compact';
    host.appendChild(fb);
    var course, items, k, errors, t0, doneCourses = {};

    function lit(ch) {
      var all = kb.querySelectorAll('.is-next');
      for (var i = 0; i < all.length; i++) Core.removeClass(all[i], 'is-next');
      if (!ch) return;
      var up = ch.toUpperCase(), key = up === ' ' ? 'Space' : up;
      if (kb._keys[key]) Core.addClass(kb._keys[key], 'is-next');
      if (/[A-Z]/.test(ch)) {
        var f = FINGER_OF[up] || '';
        var shift = f.charAt(0) === 'L' ? 'Shift ' : 'Shift';
        Core.addClass(kb._keys[shift], 'is-next');
        hint.innerHTML = 'Chữ hoa: nhấn giữ <b>' + (shift === 'Shift' ? 'Shift bên trái' : 'Shift bên phải') + '</b> rồi gõ phím <b>' + up + '</b>.';
      }
    }
    function show() {
      var it = items[k], t = typeof it === 'string' ? it : it.t;
      target.innerHTML = '';
      for (var i = 0; i < t.length; i++) {
        var s = E('span', 'tt-ch' + (i < input.value.length ? ' ok' : i === input.value.length ? ' cur' : ''));
        s.appendChild(document.createTextNode(t.charAt(i) === ' ' ? ' ' : t.charAt(i)));
        target.appendChild(s);
      }
      hint.innerHTML = typeof it === 'string' ? '' : (it.color ? '<span class="tt-sw" style="background:' + it.color + '"></span>' : '') + (it.hint || '');
      lit(t.charAt(input.value.length));
      var sec = Math.max(1, Math.round((new Date() - t0) / 1000));
      stats.innerHTML = 'Bài <b>' + course.name + '</b> · Câu ' + (k + 1) + '/' + items.length + ' · Gõ sai: <b>' + errors + '</b> · Thời gian: ' + sec + ' giây';
    }
    function load(c) {
      course = c; items = Core.shuffle(c.items); k = 0; errors = 0; t0 = new Date();
      input.value = '';
      renderTabs(); show();
      Core.say(fb, 'Chạm vào ô gõ rồi gõ chữ đang hiện. Phím cần gõ sáng lên trên bàn phím.', 'info');
    }
    function renderTabs() {
      tabs.innerHTML = '';
      for (var i = 0; i < cfg.courses.length; i++) {
        (function (c) {
          var b = E('button', 'btn btn-small lab-tab', (doneCourses[c.id] ? Core.icon('check') : '') + c.name);
          b.setAttribute('aria-pressed', c === course ? 'true' : 'false');
          Core.on(b, function () { load(c); try { input.focus(); } catch (e) {} });
          tabs.appendChild(b);
        })(cfg.courses[i]);
      }
    }
    function check() {
      var it = items[k], t = typeof it === 'string' ? it : it.t, v = input.value;
      if (t.indexOf(v) !== 0) {
        errors++;
        var keep = 0;
        while (keep < v.length && v.charAt(keep) === t.charAt(keep)) keep++;
        input.value = v.slice(0, keep);
        Core.addClass(game, 'is-wrong');
        setTimeout(function () { Core.removeClass(game, 'is-wrong'); }, 400);
        var want = t.charAt(keep);
        Core.say(fb, 'Chưa đúng: cần gõ <b>' + (want === ' ' ? 'phím cách' : want) + '</b>' + (/[A-Z]/.test(want) ? ' (chữ hoa: giữ Shift)' : '') + '.', 'bad');
      } else if (v === t) {
        k++; input.value = '';
        if (k >= items.length) return finish();
        Core.say(fb, 'Đúng rồi!', 'good');
      }
      show();
    }
    function finish() {
      var sec = Math.max(1, Math.round((new Date() - t0) / 1000));
      doneCourses[course.id] = true;
      renderTabs(); lit('');
      target.innerHTML = '<span class="tt-ch ok">Xong!</span>';
      stats.innerHTML = 'Em gõ xong ' + items.length + ' câu trong ' + sec + ' giây, gõ sai ' + errors + ' lần.';
      if (course.star) Core.celebrate(fb, cfg.lesson, course.star, 'Hoàn thành bài ' + course.name + '!');
      else Core.say(fb, 'Hoàn thành bài ' + course.name + '!', 'good');
    }
    input.addEventListener('input', check, false);
    load(cfg.courses[0]);
    return {
      /* for tools/fit.html */
      solveAll: function () {
        for (var c = 0; c < cfg.courses.length; c++) {
          load(cfg.courses[c]);
          while (k < items.length) { var it = items[k]; input.value = typeof it === 'string' ? it : it.t; check(); }
        }
      }
    };
  };

  /* free typing with a word counter. cfg = { lesson, id, goal: 50, placeholder } */
  Typing.free = function (host, cfg) {
    var input = E('textarea', 'type-input');
    input.setAttribute('rows', '5');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('aria-label', 'Ô gõ tự do');
    if (cfg.placeholder) input.setAttribute('placeholder', cfg.placeholder);
    var status = E('div', 'type-status');
    var fb = E('div', 'feedback');
    var awarded = false;
    function count() {
      var words = input.value.replace(/^\s+|\s+$/g, '').split(/\s+/);
      var n = words[0] === '' ? 0 : words.length;
      status.innerHTML = 'Em đã gõ <b>' + n + '</b> từ' + (cfg.goal ? ' / ' + cfg.goal + ' từ' : '');
      if (cfg.goal && n >= cfg.goal && !awarded) {
        awarded = true;
        if (cfg.id) Core.celebrate(fb, cfg.lesson, cfg.id, 'Em gõ được ' + cfg.goal + ' từ rồi, giỏi quá!');
      }
    }
    input.addEventListener('input', count, false);
    input.addEventListener('keyup', count, false);
    host.appendChild(input);
    host.appendChild(status);
    host.appendChild(fb);
    count();
  };
})();
