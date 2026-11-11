/* Core helpers shared by every lesson page.
   Written in ES5 on purpose: the Kindle experimental browser is old. */
(function () {
  var Core = (window.Core = {});
  var STORE_KEY = 'whth-progress';
  var EINK_KEY = 'whth-eink';

  /* ---------- storage (may be unavailable: private mode, old browser) ---------- */
  function readJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function writeJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  /* ---------- e-ink mode: decided before first paint ---------- */
  Core.isEink = function () {
    var saved = readJSON(EINK_KEY, null);
    if (saved !== null) return !!saved;
    if (/[?&]eink=1/.test(location.search)) return true;
    return /Kindle|KFAPWI|PocketBook|Kobo/i.test(navigator.userAgent);
  };
  Core.setEink = function (on) {
    writeJSON(EINK_KEY, !!on);
    applyEink();
  };
  function applyEink() {
    var root = document.documentElement;
    var on = Core.isEink();
    root.className = root.className.replace(/\s*\beink\b/g, '') + (on ? ' eink' : '');
    var btn = document.getElementById('eink-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.innerHTML = on ? 'Màn hình mực: BẬT' : 'Màn hình mực: tắt';
    }
  }
  applyEink();
  /* step delay for animations: e-ink screens refresh slowly */
  Core.tick = function () {
    return Core.isEink() ? 750 : 450;
  };

  /* ---------- learner profiles: several kids can share one device ---------- */
  var PROFILE_KEY = 'whth-profiles';
  Core.profiles = function () {
    return readJSON(PROFILE_KEY, { list: [], current: null });
  };
  Core.currentName = function () {
    return Core.profiles().current;
  };
  Core.addProfile = function (name) {
    name = String(name || '').replace(/^\s+|\s+$/g, '').slice(0, 20);
    if (!name) return false;
    var p = Core.profiles();
    for (var i = 0; i < p.list.length; i++) if (p.list[i] === name) { p.current = name; writeJSON(PROFILE_KEY, p); return true; }
    p.list.push(name);
    p.current = name;
    writeJSON(PROFILE_KEY, p);
    return true;
  };
  Core.useProfile = function (name) {
    var p = Core.profiles();
    p.current = name;
    writeJSON(PROFILE_KEY, p);
  };
  Core.removeProfile = function (name) {
    var p = Core.profiles();
    var keep = [];
    for (var i = 0; i < p.list.length; i++) if (p.list[i] !== name) keep.push(p.list[i]);
    p.list = keep;
    if (p.current === name) p.current = keep.length ? keep[0] : null;
    writeJSON(PROFILE_KEY, p);
    var all = readJSON(STORE_KEY, {});
    delete all['@' + name];
    writeJSON(STORE_KEY, all);
  };
  /* progress is stored per learner; '@' prefix keeps names apart from other keys */
  function bucket(all) {
    var key = '@' + (Core.currentName() || 'khach');
    all[key] = all[key] || {};
    return all[key];
  }

  /* ---------- progress / stars ---------- */
  Core.getProgress = function (lessonId) {
    var all = readJSON(STORE_KEY, {});
    return bucket(all)[lessonId] || {};
  };
  Core.countStars = function (lessonId) {
    var p = Core.getProgress(lessonId), n = 0, k;
    for (k in p) if (p.hasOwnProperty(k) && p[k]) n++;
    return n;
  };
  Core.award = function (lessonId, activityId) {
    var all = readJSON(STORE_KEY, {});
    var mine = bucket(all);
    mine[lessonId] = mine[lessonId] || {};
    var isNew = !mine[lessonId][activityId];
    mine[lessonId][activityId] = 1;
    writeJSON(STORE_KEY, all);
    Core.renderStars();
    return isNew;
  };
  Core.renderStars = function () {
    var els = document.querySelectorAll('[data-stars-for]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var id = el.getAttribute('data-stars-for');
      var total = parseInt(el.getAttribute('data-stars-total'), 10) || 0;
      var have = Core.countStars(id);
      var html = '';
      for (var s = 0; s < total; s++) html += Core.icon(s < have ? 'star' : 'starEmpty', 'star-ico');
      el.innerHTML = html + '<span class="star-count">' + have + '/' + total + '</span>';
      el.setAttribute('aria-label', 'Đã đạt ' + have + ' trên ' + total + ' sao');
    }
  };

  /* ---------- fixed 1300x700 stage (wide screens, see main.css) ---------- */
  Core.STAGE_W = 1300;
  Core.STAGE_H = 700;
  Core.isStage = function () {
    if (window.matchMedia) return window.matchMedia('(min-width: 900px)').matches;
    return window.innerWidth >= 900;
  };
  /* shrink the stage when the window is smaller than 1300x700; never enlarge it */
  function fitStage() {
    var s = 1;
    if (Core.isStage()) s = Math.min(1, window.innerWidth / Core.STAGE_W, window.innerHeight / Core.STAGE_H);
    var st = document.documentElement.style;
    if (st.setProperty) st.setProperty('--stage-scale', String(s));
  }
  fitStage();
  window.addEventListener('resize', fitStage, false);

  /* ---------- tiny DOM helpers ---------- */
  Core.el = function (tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };
  Core.on = function (el, fn) {
    el.addEventListener('click', fn, false);
  };
  Core.icon = function (name, cls) {
    var svg = (window.Icons && window.Icons[name]) || '';
    return '<span class="ico ' + (cls || '') + '" aria-hidden="true">' + svg + '</span>';
  };
  function hasClass(el, c) {
    return (' ' + el.className + ' ').indexOf(' ' + c + ' ') > -1;
  }
  function addClass(el, c) {
    if (!hasClass(el, c)) el.className += ' ' + c;
  }
  function removeClass(el, c) {
    el.className = (' ' + el.className + ' ').replace(' ' + c + ' ', ' ').replace(/^\s+|\s+$/g, '');
  }
  Core.addClass = addClass;
  Core.removeClass = removeClass;
  Core.hasClass = hasClass;

  /* feedback line: type = good | bad | info */
  Core.say = function (box, text, type) {
    box.className = 'feedback feedback-' + (type || 'info');
    var ico = type === 'good' ? Core.icon('check') : type === 'bad' ? Core.icon('cross') : '';
    box.innerHTML = ico + '<span>' + text + '</span>';
  };
  Core.celebrate = function (box, lessonId, activityId, text) {
    var isNew = Core.award(lessonId, activityId);
    Core.say(box, (text || 'Hoàn thành!') + (isNew ? ' Em được thêm 1 sao.' : ''), 'good');
  };

  /* ---------- stepper: one section at a time ---------- */
  Core.initSteps = function () {
    var steps = document.querySelectorAll('.step');
    if (!steps.length) return;
    var nav = document.getElementById('step-nav');
    var current = 0;
    var m = /step-(\d+)/.exec(location.hash);
    if (m) current = Math.min(steps.length - 1, parseInt(m[1], 10) - 1);

    var prev = Core.el('button', 'btn btn-nav', '&lsaquo; Trước');
    var next = Core.el('button', 'btn btn-nav btn-primary', 'Tiếp &rsaquo;');
    var dots = Core.el('div', 'step-dots');
    for (var i = 0; i < steps.length; i++) {
      var d = Core.el('button', 'step-dot', String(i + 1));
      d.setAttribute('title', steps[i].getAttribute('data-title') || '');
      d.setAttribute('aria-label', 'Phần ' + (i + 1) + ': ' + (steps[i].getAttribute('data-title') || ''));
      (function (idx) {
        Core.on(d, function () { show(idx); });
      })(i);
      dots.appendChild(d);
    }
    nav.appendChild(prev);
    nav.appendChild(dots);
    nav.appendChild(next);
    Core.on(prev, function () { show(current - 1); });
    Core.on(next, function () { show(current + 1); });

    function show(idx) {
      if (idx < 0 || idx >= steps.length) return;
      current = idx;
      for (var i = 0; i < steps.length; i++) {
        steps[i].style.display = i === idx ? '' : 'none';
        var dot = dots.children[i];
        if (i === idx) addClass(dot, 'active'); else removeClass(dot, 'active');
      }
      prev.disabled = idx === 0;
      next.disabled = idx === steps.length - 1;
      var label = document.getElementById('step-label');
      if (label) label.innerHTML = steps[idx].getAttribute('data-title') || '';
      if (history.replaceState) history.replaceState(null, '', '#step-' + (idx + 1));
      window.scrollTo(0, 0);
      var mainEl = document.querySelector('main');
      if (mainEl) mainEl.scrollTop = 0; /* on the stage, main is the scroll box */
    }
    show(current);
  };

  /* ---------- small line telling the child HOW to do the activity (tap here, then there).
     It explains the controls only, never the answer. ---------- */
  Core.howto = function (text) {
    var el = Core.el('div', 'howto');
    var row = Core.el('div', 'howto-row', Core.icon('bulb') + '<span class="howto-text"></span>');
    row.lastChild.innerHTML = text;
    el.appendChild(row);
    el.reset = function () {};
    return el;
  };

  /* ---------- quiz: multiple choice, retry until right ---------- */
  /* cfg = { lesson, id, questions: [{ q, options: [], answer: index, explain }] } */
  /* One question is shown at a time, with numbered pips to jump between them. */
  Core.quiz = function (host, cfg) {
    var solved = 0;
    var total = cfg.questions.length;
    var cards = [], pips = [], isSolved = [];
    addClass(host, 'quiz-box');
    var pipBox = Core.el('div', 'quiz-pips');
    if (total > 1) {
      pipBox.appendChild(Core.el('span', 'quiz-pips-label', 'Câu hỏi:'));
      host.appendChild(pipBox);
    }
    var done = Core.el('div', 'feedback');
    done.setAttribute('aria-live', 'polite');
    var cur = 0;
    var how = Core.howto(total > 1 ? 'Chạm vào đáp án em chọn. Chọn sai thì chọn lại; đúng rồi bấm <b>Câu tiếp</b>.' : 'Chạm vào đáp án em chọn. Chọn sai thì chọn lại nha.');
    host.appendChild(how);

    function show(i) {
      if (i !== cur) how.reset();
      cur = i;
      for (var k = 0; k < total; k++) {
        cards[k].style.display = k === i ? '' : 'none';
        if (k === i) addClass(pips[k], 'active'); else removeClass(pips[k], 'active');
      }
    }
    function nextUnsolved(from) {
      for (var k = 1; k <= total; k++) {
        var j = (from + k) % total;
        if (!isSolved[j]) return j;
      }
      return -1;
    }

    for (var qi = 0; qi < total; qi++) {
      (function (q, qi) {
        var pip = Core.el('button', 'quiz-pip', String(qi + 1));
        pip.setAttribute('aria-label', 'Câu ' + (qi + 1));
        Core.on(pip, function () { show(qi); });
        pipBox.appendChild(pip);
        pips.push(pip);

        var card = Core.el('div', 'card quiz-q');
        /* questions that already carry their own label ("Câu 2.", "Bài 1.", "Luyện tập 1.") keep it */
        var labelled = /^\s*(<b>\s*)?(Câu|Bài|Luyện tập|Vận dụng)\s+\d/i.test(q.q);
        card.appendChild(Core.el('p', 'quiz-text', (labelled ? '' : '<b>Câu ' + (qi + 1) + '.</b> ') + q.q));
        var list = Core.el('div', 'quiz-options');
        var fb = Core.el('div', 'feedback');
        fb.setAttribute('aria-live', 'polite');
        var next = Core.el('button', 'btn btn-primary quiz-next', 'Câu tiếp &rsaquo;');
        next.style.display = 'none';
        Core.on(next, function () {
          var n = nextUnsolved(qi);
          if (n >= 0) show(n);
        });
        var finished = false;
        for (var oi = 0; oi < q.options.length; oi++) {
          (function (oi) {
            var b = Core.el('button', 'btn quiz-opt',
              '<span class="opt-letter">' + 'ABCDEF'.charAt(oi) + '</span><span>' + q.options[oi] + '</span>');
            Core.on(b, function () {
              if (finished || b.disabled) return;
              if (oi === q.answer) {
                finished = true;
                isSolved[qi] = true;
                addClass(b, 'is-right');
                addClass(pip, 'solved');
                pip.innerHTML = Core.icon('check') + (qi + 1);
                pip.setAttribute('aria-label', 'Câu ' + (qi + 1) + ', đã đúng');
                Core.say(fb, 'Đúng rồi! ' + (q.explain || ''), 'good');
                solved++;
                /* a one-question quiz shows the star on the same line, to save space */
                if (solved === total) Core.celebrate(fb, cfg.lesson, cfg.id, 'Đúng rồi! ' + (q.explain || '') + (total > 1 ? ' Em đã trả lời đúng hết các câu!' : ''));
                else next.style.display = '';
              } else {
                addClass(b, 'is-wrong');
                b.disabled = true;
                Core.say(fb, q.hint || 'Chưa đúng, em thử lại nha.', 'bad');
              }
            });
            list.appendChild(b);
          })(oi);
        }
        card.appendChild(list);
        card.appendChild(fb);
        card.appendChild(next);
        host.appendChild(card);
        cards.push(card);
      })(cfg.questions[qi], qi);
    }
    host.appendChild(done);
    show(0);
  };

  /* ---------- sort: tap an item, then tap the basket it belongs to ---------- */
  /* cfg = { lesson, id, bins: [{id,label}], items: [{label, icon, bin, explain}] } */
  Core.sort = function (host, cfg) {
    var selected = null;
    var placed = 0;
    var wrap = Core.el('div', 'sort');
    var tray = Core.el('div', 'sort-tray');
    tray.setAttribute('aria-label', 'Các thẻ cần xếp');
    var bins = Core.el('div', 'sort-bins');
    host.appendChild(Core.howto('Chạm vào một thẻ, rồi chạm vào ô hợp với nó. Xếp sai thì thẻ rung lên, em thử ô khác.'));
    var fb = Core.el('div', 'feedback');
    fb.setAttribute('aria-live', 'polite');

    var binEls = {};
    for (var b = 0; b < cfg.bins.length; b++) {
      (function (bin) {
        var box = Core.el('button', 'sort-bin');
        box.innerHTML = '<span class="sort-bin-title">' + bin.label + '</span>';
        var inner = Core.el('span', 'sort-bin-items');
        box.appendChild(inner);
        binEls[bin.id] = inner;
        Core.on(box, function () { drop(bin.id); });
        bins.appendChild(box);
      })(cfg.bins[b]);
    }

    for (var i = 0; i < cfg.items.length; i++) {
      (function (item) {
        var card = Core.el('button', 'sort-item' + (item.icon ? '' : ' no-ico'),
          (item.icon ? Core.icon(item.icon, 'sort-ico') : '') + '<span>' + item.label + '</span>');
        card._item = item;
        Core.on(card, function (ev) {
          ev.stopPropagation();
          if (card._placed) {
            if (item.explain) Core.say(fb, item.label + ': ' + item.explain, 'info');
            return;
          }
          if (selected) removeClass(selected, 'is-selected');
          selected = selected === card ? null : card;
          if (selected) {
            addClass(card, 'is-selected');
            Core.say(fb, 'Đã chọn "' + item.label + '". Giờ chạm vào ô phù hợp.', 'info');
          }
        });
        tray.appendChild(card);
      })(cfg.items[i]);
    }

    function drop(binId) {
      if (!selected) {
        Core.say(fb, 'Em chạm vào một thẻ trước nha.', 'info');
        return;
      }
      var item = selected._item;
      if (item.bin !== binId) {
        Core.say(fb, '"' + item.label + '" chưa đúng ô. ' + (item.hint || 'Em nghĩ lại thử nha.'), 'bad');
        addClass(selected, 'is-wrong');
        var s = selected;
        setTimeout(function () { removeClass(s, 'is-wrong'); }, 900);
        return;
      }
      removeClass(selected, 'is-selected');
      addClass(selected, 'is-placed');
      selected._placed = true;
      binEls[binId].appendChild(selected);
      placed++;
      selected = null;
      if (placed === cfg.items.length) {
        Core.celebrate(fb, cfg.lesson, cfg.id, cfg.doneText || 'Em xếp đúng hết rồi!');
      } else {
        Core.say(fb, 'Đúng rồi! ' + (item.explain || '') + ' Còn ' + (cfg.items.length - placed) + ' thẻ.', 'good');
      }
    }

    wrap.appendChild(tray);
    wrap.appendChild(bins);
    wrap.appendChild(fb);
    host.appendChild(wrap);
  };

  /* ---------- page boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    applyEink();
    var t = document.getElementById('eink-toggle');
    if (t) Core.on(t, function () { Core.setEink(!Core.isEink()); });
    var who = document.querySelectorAll('[data-current-name]');
    for (var i = 0; i < who.length; i++) {
      who[i].innerHTML = '';
      who[i].appendChild(document.createTextNode(Core.currentName() || 'Khách'));
    }
    Core.renderStars();
    Core.initSteps();
  });
})();
