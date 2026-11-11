/* More shared activities: match two columns, put steps in order, pick-all.
   ES5 only (Kindle browser). Needs core.js. */
(function () {
  var E = Core.el;

  /* lower case, no Vietnamese marks, single spaces: for comparing what a child typed */
  var VN_FROM = 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ';
  var VN_TO = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd';
  if (!Core.plain) Core.plain = function (s) {
    s = String(s || '').toLowerCase();
    var out = '';
    for (var i = 0; i < s.length; i++) { var c = s.charAt(i), k = VN_FROM.indexOf(c); out += k < 0 ? c : VN_TO.charAt(k); }
    return out.replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').replace(/^ | $/g, '');
  };

  Core.shuffle = function (arr, seed) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  /* shuffle, but never return the original order (so there is something to do) */
  function mixed(arr) {
    if (arr.length < 2) return arr.slice();
    var a;
    do { a = Core.shuffle(arr); } while (sameOrder(a, arr));
    return a;
  }
  function sameOrder(a, b) {
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  function shake(el) {
    Core.addClass(el, 'is-wrong');
    setTimeout(function () { Core.removeClass(el, 'is-wrong'); }, 900);
  }

  /* ---------- match: tap an item on the left, then its partner on the right ----------
     cfg = { lesson, id, pairs: [[left, right], ...], leftTitle, rightTitle, doneText } */
  Core.match = function (host, cfg) {
    var wrap = E('div', 'match');
    var colL = E('div', 'match-col');
    var colR = E('div', 'match-col');
    if (cfg.leftTitle) colL.appendChild(E('div', 'match-title', cfg.leftTitle));
    if (cfg.rightTitle) colR.appendChild(E('div', 'match-title', cfg.rightTitle));
    host.appendChild(Core.howto('Chạm một ô bên trái, rồi chạm ô hợp với nó bên phải. Cặp đúng sẽ có cùng con số.'));
    var fb = E('div', 'feedback');
    fb.setAttribute('aria-live', 'polite');
    var sel = null, done = 0, n = cfg.pairs.length;

    for (var i = 0; i < n; i++) {
      (function (i) {
        var b = E('button', 'btn match-item', '<span class="match-badge"></span><span>' + cfg.pairs[i][0] + '</span>');
        b._k = i;
        Core.on(b, function () {
          if (b._done) return;
          if (sel) Core.removeClass(sel, 'is-selected');
          sel = sel === b ? null : b;
          if (sel) Core.addClass(b, 'is-selected');
        });
        colL.appendChild(b);
      })(i);
    }
    var order = [];
    for (var k = 0; k < n; k++) order.push(k);
    order = mixed(order);
    for (var r = 0; r < n; r++) {
      (function (k) {
        var b = E('button', 'btn match-item', '<span class="match-badge"></span><span>' + cfg.pairs[k][1] + '</span>');
        Core.on(b, function () {
          if (b._done) return;
          if (!sel) { Core.say(fb, 'Em chạm một ô bên trái trước nha.', 'info'); return; }
          if (sel._k !== k) {
            shake(b);
            Core.say(fb, 'Chưa khớp, em thử ô khác nha.', 'bad');
            return;
          }
          done++;
          var tag = String(done);
          var pair = [sel, b];
          for (var p = 0; p < 2; p++) {
            pair[p]._done = true;
            Core.removeClass(pair[p], 'is-selected');
            Core.addClass(pair[p], 'is-done');
            pair[p].firstChild.innerHTML = tag;
          }
          sel = null;
          if (done === n) Core.celebrate(fb, cfg.lesson, cfg.id, cfg.doneText || 'Em nối đúng hết rồi!');
          else Core.say(fb, 'Đúng rồi! Còn ' + (n - done) + ' cặp.', 'good');
        });
        colR.appendChild(b);
      })(order[r]);
    }
    wrap.appendChild(colL);
    wrap.appendChild(colR);
    host.appendChild(wrap);
    host.appendChild(fb);
  };

  /* ---------- order: tap the steps in the right order ----------
     cfg = { lesson, id, items: [step1, step2, ...] (correct order), doneText, hint } */
  Core.order = function (host, cfg) {
    var n = cfg.items.length, next = 0;
    var wrap = E('div', 'order');
    var pool = E('div', 'order-pool');
    var list = E('ol', 'order-list');
    host.appendChild(Core.howto('Chạm vào việc làm <b>trước tiên</b>, rồi tới việc tiếp theo, cho đến hết.'));
    var fb = E('div', 'feedback');
    fb.setAttribute('aria-live', 'polite');
    var idx = [];
    for (var i = 0; i < n; i++) idx.push(i);
    idx = mixed(idx);
    for (var j = 0; j < n; j++) {
      (function (k) {
        var b = E('button', 'btn order-item', cfg.items[k]);
        Core.on(b, function () {
          if (b._done) return;
          if (k !== next) {
            shake(b);
            Core.say(fb, cfg.hint || 'Chưa phải bước này. Em nghĩ xem việc nào làm trước nha.', 'bad');
            return;
          }
          b._done = true;
          next++;
          var li = E('li', 'order-step', cfg.items[k]);
          list.appendChild(li);
          b.parentNode.removeChild(b);
          if (next === n) Core.celebrate(fb, cfg.lesson, cfg.id, cfg.doneText || 'Em sắp xếp đúng thứ tự rồi!');
          else Core.say(fb, 'Đúng! Bước tiếp theo là gì?', 'good');
        });
        pool.appendChild(b);
      })(idx[j]);
    }
    wrap.appendChild(list);
    wrap.appendChild(pool);
    host.appendChild(wrap);
    host.appendChild(fb);
  };

  /* ---------- true / false: one row per statement with two buttons ----------
     cfg = { lesson, id, items: [{ t: 'statement', ok: true|false, why: 'explanation' }], doneText } */
  Core.truefalse = function (host, cfg) {
    host.appendChild(Core.howto('Đọc từng câu, rồi chạm <b>Đúng</b> hoặc <b>Sai</b>. Chọn chưa đúng thì chọn lại.'));
    var list = E('div', 'tf');
    var fb = E('div', 'feedback');
    fb.setAttribute('aria-live', 'polite');
    var done = 0, n = cfg.items.length;
    for (var i = 0; i < n; i++) {
      (function (it, i) {
        var row = E('div', 'tf-row');
        row.appendChild(E('span', 'tf-t', String.fromCharCode(97 + i) + ') ' + it.t));
        var bY = E('button', 'btn btn-small tf-btn', 'Đúng'), bN = E('button', 'btn btn-small tf-btn', 'Sai');
        function answer(v, b) {
          if (row._done) return;
          if (v !== it.ok) { shake(b); Core.say(fb, 'Câu ' + String.fromCharCode(97 + i) + ') chưa đúng, em đọc lại kĩ nha.', 'bad'); return; }
          row._done = true; done++;
          Core.addClass(b, 'is-on'); Core.addClass(row, 'is-done');
          if (done === n) Core.celebrate(fb, cfg.lesson, cfg.id, cfg.doneText || 'Em làm đúng hết rồi!');
          else Core.say(fb, 'Đúng rồi! ' + (it.why || ''), 'good');
        }
        Core.on(bY, function () { answer(true, bY); });
        Core.on(bN, function () { answer(false, bN); });
        row.appendChild(bY); row.appendChild(bN);
        row._ans = it.ok ? bY : bN;
        list.appendChild(row);
      })(cfg.items[i], i);
    }
    host.appendChild(list);
    host.appendChild(fb);
  };

  /* ---------- fill in the blanks: tap a word, then tap the blank ----------
     cfg = { lesson, id, text: 'Duyệt theo các [chủ đề] của website.', extra: ['words that do not fit'], doneText }
     Each [word] in text becomes a blank. */
  Core.fill = function (host, cfg) {
    host.appendChild(Core.howto('Chạm một từ ở hàng dưới, rồi chạm vào chỗ trống hợp với nó.'));
    var para = E('div', 'fill-text');
    var bank = E('div', 'fill-bank');
    var fb = E('div', 'feedback');
    fb.setAttribute('aria-live', 'polite');
    var parts = cfg.text.split(/\[([^\]]+)\]/), words = [], blanks = [], sel = null, done = 0;
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 0) { var s = E('span'); s.innerHTML = parts[i].replace(/\n/g, '<br>'); para.appendChild(s); continue; }
      (function (w) {
        var b = E('button', 'fill-blank', '……');
        b._w = w;
        Core.on(b, function () {
          if (b._done) return;
          if (!sel) { Core.say(fb, 'Em chạm một từ ở hàng dưới trước nha.', 'info'); return; }
          if (Core.plain(sel._w) !== Core.plain(w)) { shake(b); Core.say(fb, '"' + sel._w + '" chưa hợp với chỗ này, em thử chỗ khác nha.', 'bad'); return; }
          b._done = true; b.innerHTML = w; Core.addClass(b, 'is-done');
          sel.parentNode.removeChild(sel); sel = null; done++;
          if (done === blanks.length) Core.celebrate(fb, cfg.lesson, cfg.id, cfg.doneText || 'Em điền đúng hết rồi!');
          else Core.say(fb, 'Đúng rồi!', 'good');
        });
        blanks.push(b); words.push(w);
        para.appendChild(b);
      })(parts[i]);
    }
    var all = Core.shuffle(words.concat(cfg.extra || []));
    for (var k = 0; k < all.length; k++) {
      (function (w) {
        var c = E('button', 'btn btn-small fill-word', w);
        c._w = w;
        Core.on(c, function () {
          if (sel) Core.removeClass(sel, 'is-selected');
          sel = sel === c ? null : c;
          if (sel) Core.addClass(c, 'is-selected');
        });
        bank.appendChild(c);
      })(all[k]);
    }
    host.appendChild(para);
    host.appendChild(bank);
    host.appendChild(fb);
  };

  /* ---------- pick: choose ALL the right cards, then press "Kiểm tra" ----------
     cfg = { lesson, id, items: [{label, icon, ok}], doneText } */
  Core.pick = function (host, cfg) {
    var wrap = E('div', 'pick');
    /* sentences without pictures read better as full-width rows than as small cards */
    var longText = true;
    for (var li = 0; li < cfg.items.length; li++) if (cfg.items[li].icon || String(cfg.items[li].label).replace(/<[^>]+>/g, '').length < 28) longText = false;
    if (cfg.rows || longText) Core.addClass(wrap, 'pick-rows');
    host.appendChild(Core.howto('Chạm để chọn <b>tất cả</b> ý đúng (chạm lần nữa để bỏ chọn), rồi bấm <b>Kiểm tra</b>.'));
    var fb = E('div', 'feedback');
    fb.setAttribute('aria-live', 'polite');
    var cards = [];
    for (var i = 0; i < cfg.items.length; i++) {
      (function (it) {
        var b = E('button', 'sort-item pick-item' + (it.icon ? '' : ' no-ico'),
          (it.icon ? Core.icon(it.icon, 'sort-ico') : '') + '<span>' + it.label + '</span>');
        b.setAttribute('aria-pressed', 'false');
        Core.on(b, function () {
          if (wrap._solved) return;
          var on = b.getAttribute('aria-pressed') !== 'true';
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
          if (on) Core.addClass(b, 'is-selected'); else Core.removeClass(b, 'is-selected');
        });
        b._ok = !!it.ok;
        cards.push(b);
        wrap.appendChild(b);
      })(cfg.items[i]);
    }
    var check = E('button', 'btn btn-primary', 'Kiểm tra');
    Core.on(check, function () {
      var miss = 0, extra = 0;
      for (var i = 0; i < cards.length; i++) {
        var on = cards[i].getAttribute('aria-pressed') === 'true';
        if (cards[i]._ok && !on) miss++;
        if (!cards[i]._ok && on) { extra++; shake(cards[i]); }
      }
      if (!miss && !extra) {
        wrap._solved = true;
        Core.celebrate(fb, cfg.lesson, cfg.id, cfg.doneText || 'Em chọn đúng hết rồi!');
      } else {
        var t = [];
        if (extra) t.push(extra + ' thẻ chọn chưa đúng (thẻ đang rung)');
        if (miss) t.push('còn thiếu ' + miss + ' thẻ đúng');
        Core.say(fb, 'Chưa đúng: ' + t.join(', ') + '.', 'bad');
      }
    });
    host.appendChild(wrap);
    var row = E('div', 'pick-actions');
    row.appendChild(check);
    host.appendChild(row);
    host.appendChild(fb);
  };
})();
