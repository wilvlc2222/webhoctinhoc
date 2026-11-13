/* Game layer on top of the stars. Loaded by core.js on every page. ES5.
   - gems: an answer exercise finished with no wrong answer gives a gem ("kim cương")
   - combo: right answers in a row
   - medals: bronze / silver / gold per lesson, from the share of stars
   - lesson summary card, badges, and the data the boss challenge needs
   Everything here is drawn still, so it also works on e-ink.

   Core.LESSONS (id: [grade, topic, stars]) is built from the one lesson list in lessons.js. */
(function () {
  var Core = window.Core;
  if (!Core) return;

  var L = Core.LESSONS = {}, ORDER = [];
  Core.TOPIC_NAMES = [];
  (function () {
    var G = window.LESSON_GRADES || {}, grades = ['4', '5'], g, t, k;
    for (g = 0; g < grades.length; g++) {
      var topics = G[grades[g]] || [];
      for (t = 0; t < topics.length; t++) {
        if (!Core.TOPIC_NAMES[t]) Core.TOPIC_NAMES[t] = topics[t].topic.replace(/^Chủ đề \d+\.\s*/, '');
        for (k = 0; k < topics[t].lessons.length; k++) {
          var l = topics[t].lessons[k];
          L[l.id] = [+grades[g], t + 1, l.stars];
          ORDER.push(l.id);
        }
      }
    }
  })();
  /* 'l5-b08a' → 'lop5/bai08a.html' */
  Core.lessonHref = function (lessonId) { return lessonId.replace(/^l(\d)-b/, 'lop$1/bai') + '.html'; };
  Core.topicLessons = function (grade, topic) {
    var out = [];
    for (var i = 0; i < ORDER.length; i++) if (L[ORDER[i]][0] === +grade && L[ORDER[i]][1] === +topic) out.push(ORDER[i]);
    return out;
  };

  function name() { return Core.currentName() || 'khach'; }
  function prog() { return Core.exportProgress(name()); }
  function quiet() { var f = false; try { f = window.self !== window.top; } catch (e) { f = true; } return f || Core.currentName() === '__fit'; }
  function count(o) { var n = 0, k; for (k in o || {}) if (o.hasOwnProperty(k) && o[k]) n++; return n; }
  function E(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* ---------- gems (kept in the progress data under "gems", so they reach the teacher's sheet too) ---------- */
  var GEM = '<svg class="gem-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 22 9 12 22 2 9z" fill="#3bc9db" stroke="#0b7285" stroke-width="2" stroke-linejoin="round"/><path d="M2 9h20M8 9l4-7 4 7-4 13z" fill="none" stroke="#0b7285" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  Core.gemIcon = GEM;
  /* two crossed swords for the Solo BOSS buttons (drawn in the button's text colour) */
  Core.swordsIcon = '<svg class="swords-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 4l11 11M12.5 17.5l5-5M16 16l4 4M20 4L9 15M6.5 12.5l5 5M8 16l-4 4"/></svg>';
  function gemKey(lessonId, activityId) { return (lessonId + '__' + activityId).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40); }
  Core.gems = {
    all: function () { return prog().gems || {}; },
    has: function (key) { return !!Core.gems.all()[key]; },
    count: function () { return count(Core.gems.all()); },
    inLesson: function (lessonId) { var n = 0, g = Core.gems.all(), k; for (k in g) if (g.hasOwnProperty(k) && k.indexOf(lessonId + '__') === 0) n++; return n; },
    add: function (key) {
      var o = { gems: {} };
      o.gems[key] = 1;
      Core.importProgress(name(), o);
      if (Core.sync && Core.sync.on) Core.sync.soon(Core.currentName());
    },
    bossWins: function () { var n = 0, g = Core.gems.all(), k; for (k in g) if (g.hasOwnProperty(k) && /^boss_g\d_t\d_1$/.test(k)) n++; return n; },
    bossWon: function (grade, topic) { return Core.gems.has('boss_g' + grade + '_t' + topic + '_1'); }
  };

  /* ---------- medals ---------- */
  var MEDAL_NAME = { gold: 'Huy chương vàng', silver: 'Huy chương bạc', bronze: 'Huy chương đồng' };
  var MEDAL_FILL = { gold: '#fcc419', silver: '#ced4da', bronze: '#e8a15b' };
  Core.medal = function (have, total) {
    if (!total) return '';
    var r = have / total;
    return r >= 1 ? 'gold' : r >= 0.7 ? 'silver' : r >= 0.4 ? 'bronze' : '';
  };
  Core.medalOf = function (lessonId) { return L[lessonId] ? Core.medal(Core.countStars(lessonId), L[lessonId][2]) : ''; };
  Core.medalIcon = function (m, cls) {
    if (!m) return '';
    return '<svg class="medal-ico ' + (cls || '') + '" viewBox="0 0 24 24" role="img" aria-label="' + MEDAL_NAME[m] + '"><title>' + MEDAL_NAME[m] + '</title>' +
      '<path d="M7 2h4l1 6-3 1zM17 2h-4l-1 6 3 1z" fill="#e03131" stroke="#1d2433" stroke-width="1.3" stroke-linejoin="round"/>' +
      '<circle cx="12" cy="15" r="7" fill="' + MEDAL_FILL[m] + '" stroke="#1d2433" stroke-width="1.6"/>' +
      '<text x="12" y="18.6" text-anchor="middle" font-size="9" font-weight="800" fill="#1d2433">' + (m === 'gold' ? '1' : m === 'silver' ? '2' : '3') + '</text></svg>';
  };
  /* home page lesson cards show the medal in front of the star bar */
  var renderStars = Core.renderStars;
  Core.renderStars = function () {
    renderStars();
    var els = document.querySelectorAll('.lesson-item [data-stars-for], .map-node [data-stars-for]');
    for (var i = 0; i < els.length; i++) {
      var m = Core.medalOf(els[i].getAttribute('data-stars-for'));
      if (m) els[i].innerHTML = Core.medalIcon(m) + els[i].innerHTML;
    }
  };

  /* ---------- first try and combo ---------- */
  var combo = 0, justGem = false, lastGood = 0;
  function root(box) { var n = box; while (n && n.parentNode && !n.id) n = n.parentNode; return n || box; }   /* the exercise's host element */
  function isAnswer(box) { return !!(box && box.getAttribute && box.getAttribute('data-react')); }
  Core.bubbleText = function (kind) {
    if (kind === 'bad') return '';
    if (justGem) return 'Đúng ngay lần đầu!';
    return combo >= 2 && !repeat ? 'Đúng liên tiếp x' + combo + '!' : '';
  };
  var say = Core.say;
  Core.say = function (box, text, type) {
    var ans = isAnswer(box);
    if (ans && type === 'bad') { root(box)._wrong = true; combo = 0; }
    if (ans && type === 'good' && !repeat) { var now = new Date().getTime(); if (now - lastGood > 80) combo++; lastGood = now; }   /* a quiz says "good" and then celebrates in the same instant: that is one right answer */
    say(box, text, type);
    if (ans && type === 'good' && combo >= 2 && !repeat) chip(box, 'combo-chip', 'Đúng liên tiếp x' + combo);
  };
  /* an exercise with a "Kiểm tra" button can be checked again and again once it is right:
     only its first right check counts for the combo */
  var finished = {}, repeat = false;
  /* small labels that float on the top right corner of the feedback line: they take no room, so no step grows */
  function chip(box, cls, html) {
    var c = box.querySelector('.fb-chips');
    if (!c) { c = E('span', 'fb-chips'); box.appendChild(c); }
    c.appendChild(E('span', cls, html));
  }
  var celebrate = Core.celebrate;
  Core.celebrate = function (box, lessonId, activityId, text) {
    var key = gemKey(lessonId, activityId), gem = false;
    if (isAnswer(box) && !root(box)._wrong && !quiet() && !Core.gems.has(key)) { Core.gems.add(key); gem = true; }
    justGem = gem;
    repeat = !!finished[key];
    finished[key] = true;
    celebrate(box, lessonId, activityId, text);
    justGem = false;
    repeat = false;
    if (gem) chip(box, 'gem-chip', GEM + '+1 kim cương');
    if (!quiet()) { checkBadges(); lessonDone(lessonId); }
  };

  /* ---------- modal + toast (the card styles come from the mascot's .bip-card) ---------- */
  function modal(cls, html) {
    var m = E('div', 'bip-modal', '<div class="bip-card ' + cls + '" role="dialog" aria-modal="true">' + html + '</div>');
    document.body.appendChild(m);
    function close() { if (m.parentNode) m.parentNode.removeChild(m); }
    Core.on(m, function (e) { if (e && e.target === m) close(); });
    return { el: m, close: close, $: function (s) { return m.querySelector(s); } };
  }
  function toast(html) {
    var t = E('div', 'game-toast', html);
    document.body.appendChild(t);
    setTimeout(function () { t.className = 'game-toast is-on'; }, 30);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3600);
  }
  function homePrefix() { var b = document.querySelector('a.brand'); return b ? (b.getAttribute('href') || '').replace(/index\.html.*$/, '') : ''; }

  /* ---------- lesson summary ---------- */
  var MEDAL_SAY = { gold: 'Tuyệt vời! Em đã lấy hết sao của bài này.', silver: 'Giỏi lắm! Thêm vài sao nữa là được huy chương vàng.',
    bronze: 'Khá lắm! Em làm thêm các phần còn lại để lên huy chương bạc nha.', '': 'Em làm thêm các hoạt động để nhận huy chương nha.' };
  Core.lessonSummary = function (lessonId) {
    var info = L[lessonId];
    if (!info) return;
    var have = Core.countStars(lessonId), total = info[2], m = Core.medal(have, total), gems = Core.gems.inLesson(lessonId);
    var at = ORDER.indexOf(lessonId), next = ORDER[at + 1], pre = homePrefix();
    if (next && L[next][0] !== info[0]) next = null;
    var M = modal('result-card',
      '<h2>Kết quả bài học</h2>' +
      '<div class="result-medal">' + (m ? Core.medalIcon(m, 'big') + '<b>' + MEDAL_NAME[m] + '</b>' : '<b class="result-none">Chưa có huy chương</b>') + '</div>' +
      '<p class="result-line">' + Core.icon('star', 'star-ico') + '<b>' + have + '/' + total + '</b> sao' +
        '<span class="result-gem">' + GEM + '<b>' + gems + '</b> kim cương</span></p>' +
      '<p>' + MEDAL_SAY[m] + '</p>' +
      '<p class="result-hint">Huy chương: đồng từ 40% số sao, bạc từ 70%, vàng khi đủ sao. Kim cương: làm đúng ngay lần đầu.</p>' +
      '<div class="bip-actions"><button class="btn" data-k="stay" type="button">Học tiếp bài này</button>' +
        '<a class="btn" href="' + pre + 'index.html">Về trang chủ</a>' +
        (next ? '<a class="btn btn-primary" href="' + pre + Core.lessonHref(next) + '">Bài tiếp theo &rsaquo;</a>' : '') + '</div>');
    Core.on(M.$('[data-k="stay"]'), M.close);
    if (m === 'gold' && Core.sound) Core.sound('level');
  };
  var shownDone = {};
  function lessonDone(lessonId) {
    if (!L[lessonId] || shownDone[lessonId] || Core.countStars(lessonId) < L[lessonId][2] || !document.querySelector('.step')) return;
    shownDone[lessonId] = true;
    /* wait for Bíp and for a level-up card to go away first */
    var tries = 0, t = setInterval(function () {
      if (++tries < 3 || (document.querySelector('.bip-levelup') && tries < 60)) return;
      clearInterval(t);
      Core.lessonSummary(lessonId);
    }, 500);
  }

  /* ---------- badges ---------- */
  function ctx() {
    var p = prog(), c = { stars: 0, gems: 0, gold: 0, boss: Core.gems.bossWins(), topic: {} }, l, i, g, t, ls, ok;
    for (l in p) if (p.hasOwnProperty(l) && L[l]) { c.stars += count(p[l]); if (Core.medal(count(p[l]), L[l][2]) === 'gold') c.gold++; }
    c.gems = Core.gems.count();
    for (t = 1; t <= 6; t++) for (g = 4; g <= 5; g++) {
      ls = Core.topicLessons(g, t); ok = ls.length > 0;
      for (i = 0; i < ls.length; i++) { var m = Core.medal(count(p[ls[i]]), L[ls[i]][2]); if (m !== 'gold' && m !== 'silver') ok = false; }
      if (ok) c.topic[t] = true;
    }
    return c;
  }
  var TOPIC_BADGE = ['Bạn của máy tính', 'Nhà thám hiểm mạng', 'Người giữ kho báu', 'Công dân số', 'Nghệ sĩ số', 'Lập trình viên nhí'];
  var BADGES = [
    { id: 'first', n: 'Bước đầu tiên', d: 'Có ngôi sao đầu tiên', c: '#f59f00', ok: function (c) { return c.stars >= 1; } },
    { id: 's25', n: 'Chăm học', d: 'Có 25 sao', c: '#f59f00', ok: function (c) { return c.stars >= 25; } },
    { id: 's75', n: 'Siêu chăm học', d: 'Có 75 sao', c: '#e8590c', ok: function (c) { return c.stars >= 75; } },
    { id: 's150', n: 'Nhà vô địch sao', d: 'Có 150 sao', c: '#e03131', ok: function (c) { return c.stars >= 150; } },
    { id: 'g10', n: 'Suy nghĩ kĩ', d: 'Có 10 kim cương', c: '#15aabf', ok: function (c) { return c.gems >= 10; } },
    { id: 'g40', n: 'Bậc thầy', d: 'Có 40 kim cương', c: '#0b7285', ok: function (c) { return c.gems >= 40; } },
    { id: 'gold1', n: 'Vàng đầu tiên', d: 'Có 1 huy chương vàng', c: '#fab005', ok: function (c) { return c.gold >= 1; } },
    { id: 'gold5', n: 'Năm lần vàng', d: 'Có 5 huy chương vàng', c: '#fab005', ok: function (c) { return c.gold >= 5; } }
  ];
  (function () {
    var colors = ['#e8590c', '#1f6fd1', '#2b8a3e', '#c2255c', '#7048e8', '#0c8599'];
    for (var t = 1; t <= 6; t++) (function (t) {
      BADGES.push({ id: 't' + t, n: TOPIC_BADGE[t - 1], d: 'Mọi bài của chủ đề ' + t + ' đạt từ huy chương bạc', c: colors[t - 1], ok: function (c) { return !!c.topic[t]; } });
    })(t);
    BADGES.push({ id: 'boss1', n: 'Dũng sĩ Solo BOSS', d: 'Thắng 1 thử thách', c: '#5f3dc4', ok: function (c) { return c.boss >= 1; } });
    BADGES.push({ id: 'boss6', n: 'Khắc tinh của BOSS', d: 'Thắng 6 thử thách', c: '#5f3dc4', ok: function (c) { return c.boss >= 6; } });
  })();
  function badgeIcon(b, on) {
    var f = on ? b.c : '#dee2e6', ink = on ? '#1d2433' : '#adb5bd';
    return '<svg class="badge-ico" viewBox="0 0 48 56" aria-hidden="true"><path d="M14 30 8 54l10-6 6 8 6-8 10 6-6-24z" fill="' + (on ? '#e03131' : '#e9ecef') + '" stroke="' + ink + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="24" cy="21" r="18" fill="' + f + '" stroke="' + ink + '" stroke-width="2.5"/><circle cx="24" cy="21" r="12.5" fill="none" stroke="' + (on ? '#fff' : '#f1f3f5') + '" stroke-width="2"/>' +
      '<path d="M24 11l3 6.4 7 .8-5.2 4.8 1.5 6.9L24 26.4l-6.3 3.5 1.5-6.9L14 18.2l7-.8z" fill="' + (on ? '#fff' : '#f1f3f5') + '"/></svg>';
  }
  function earned() { var c = ctx(), out = []; for (var i = 0; i < BADGES.length; i++) if (BADGES[i].ok(c)) out.push(BADGES[i].id); return out; }
  Core.badgeCount = function () { return earned().length + '/' + BADGES.length; };
  Core.badges = function () {
    var got = earned(), html = '';
    for (var i = 0; i < BADGES.length; i++) {
      var on = got.indexOf(BADGES[i].id) >= 0;
      html += '<div class="badge-cell' + (on ? ' is-on' : '') + '">' + badgeIcon(BADGES[i], on) + '<b>' + BADGES[i].n + '</b><small>' + BADGES[i].d + '</small></div>';
    }
    var M = modal('badge-card', '<div class="bip-card-head"><h2>Huy hiệu của em <small>' + got.length + '/' + BADGES.length + '</small></h2>' +
      '<button class="btn btn-small" data-k="close" type="button">Đóng ✕</button></div><div class="badge-grid">' + html + '</div>');
    Core.on(M.$('[data-k="close"]'), M.close);
  };
  /* a toast for each badge earned since the last look */
  var SEEN = 'whth-badges';
  function seenAll() { try { return JSON.parse(localStorage.getItem(SEEN) || '{}') || {}; } catch (e) { return {}; } }
  function checkBadges(silent) {
    var all = seenAll(), key = '@' + name(), old = all[key], got = earned(), fresh = [];
    for (var i = 0; i < got.length; i++) if (!old || old.indexOf(got[i]) < 0) fresh.push(got[i]);
    if (!fresh.length && old) return;
    all[key] = got;
    try { localStorage.setItem(SEEN, JSON.stringify(all)); } catch (e) {}
    if (silent || !old) return;
    for (i = 0; i < BADGES.length; i++) if (fresh.indexOf(BADGES[i].id) >= 0) {
      toast(badgeIcon(BADGES[i], true) + '<span>Huy hiệu mới<b>' + BADGES[i].n + '</b></span>');
      if (Core.sound) Core.sound('level');
      break;
    }
  }
  Core.checkBadges = checkBadges;

  /* ---------- page start ---------- */
  function init() {
    if (quiet()) return;
    checkBadges(true);   /* what the learner already has is not news */
    var steps = document.querySelectorAll('.step'), head = document.querySelector('[data-stars-for]');
    if (steps.length && head && L[head.getAttribute('data-stars-for')]) {
      var b = E('button', 'btn btn-small result-btn', 'Xem kết quả');
      b.type = 'button';
      Core.on(b, function () { Core.lessonSummary(head.getAttribute('data-stars-for')); });
      var h = steps[steps.length - 1].querySelector('.step-head');
      if (h) h.appendChild(b);
    }
    Core.renderStars();
    if (typeof Core.onGameReady === "function") Core.onGameReady();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
