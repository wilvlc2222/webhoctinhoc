/* Bíp the robot mascot: reacts to right / wrong answers, levels up with the
   learner's total stars, and each level unlocks a costume and a celebration.
   Loaded by core.js on every page. ES5 for the Kindle browser.
   On e-ink (and reduced motion) Bíp does not pop up, but the wardrobe and the
   level-up card still work, drawn still. */
(function () {
  var Core = window.Core;
  if (!Core) return;
  var INK = '#1d2433', SK = 'stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"';
  var WEAR_KEY = 'whth-bip';

  /* ---------- what can be unlocked ---------- */
  var ITEMS = [
    { id: 'bow', slot: 'neck', name: 'Nơ cổ' },
    { id: 'cap', slot: 'head', name: 'Mũ lưỡi trai' },
    { id: 'glasses', slot: 'face', name: 'Kính râm' },
    { id: 'cape', slot: 'back', name: 'Áo choàng' },
    { id: 'phones', slot: 'head', name: 'Tai nghe' },
    { id: 'wizard', slot: 'head', name: 'Mũ phù thuỷ' },
    { id: 'crown', slot: 'head', name: 'Vương miện' },
    { id: 'gold', slot: 'skin', name: 'Bíp vàng' }
  ];
  var ANIMS = [
    { id: 'jump', name: 'Nhảy' }, { id: 'wave', name: 'Vẫy tay' }, { id: 'spin', name: 'Xoay vòng' },
    { id: 'dance', name: 'Nhảy múa' }, { id: 'flip', name: 'Lộn nhào' }, { id: 'fireworks', name: 'Pháo hoa' },
    { id: 'magic', name: 'Phép thuật' }, { id: 'rocket', name: 'Tên lửa' }, { id: 'rainbow', name: 'Cầu vồng' }
  ];
  /* level n (1-based) needs LEVELS[n-1] stars; it unlocks ANIMS[n-1] and ITEMS[n-2] */
  var LEVELS = [0, 3, 8, 15, 25, 40, 60, 85, 120];
  var HATS = { cap: 1, wizard: 1, crown: 1 };

  /* ---------- drawing ---------- */
  var PART = {
    cape: '<path d="M32 70 L14 116 Q50 124 86 116 L68 70 Z" fill="#be4bdb" ' + SK + '/>',
    bow: '<path d="M50 70 L39 64 V77 Z M50 70 L61 64 V77 Z" fill="#e64980" ' + SK + ' stroke-width="2.5"/><circle cx="50" cy="70" r="3.5" fill="#c2255c" stroke="' + INK + '" stroke-width="2"/>',
    glasses: '<rect x="33" y="37" width="16" height="12" rx="4" fill="' + INK + '"/><rect x="51" y="37" width="16" height="12" rx="4" fill="' + INK + '"/><path d="M49 41 H51" stroke="' + INK + '" stroke-width="3"/><path d="M36 40 L41 39 M54 40 L59 39" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
    cap: '<path d="M22 30 Q24 12 50 12 Q76 12 78 30 Z" fill="#e03131" ' + SK + '/><path d="M70 27 H93 Q97 30 93 33 H72 Z" fill="#c92a2a" ' + SK + ' stroke-width="2.5"/>',
    phones: '<path d="M17 46 Q17 9 50 9 Q83 9 83 46" fill="none" stroke="#343a40" stroke-width="5"/><rect x="10" y="36" width="12" height="20" rx="5" fill="#495057" ' + SK + ' stroke-width="2.5"/><rect x="78" y="36" width="12" height="20" rx="5" fill="#495057" ' + SK + ' stroke-width="2.5"/>',
    wizard: '<path d="M25 26 L53 -12 L75 26 Z" fill="#5f3dc4" ' + SK + '/><path d="M15 27 Q50 35 85 27 Q50 19 15 27 Z" fill="#7048e8" ' + SK + ' stroke-width="2.5"/><path d="M51 3 l2 5 5 .5 -4 3.5 1.2 5 -4.2 -2.7 -4.2 2.7 1.2 -5 -4 -3.5 5 -.5 z" fill="#ffd43b"/>',
    crown: '<path d="M28 24 L28 6 L39 15 L50 0 L61 15 L72 6 L72 24 Z" fill="#fcc419" ' + SK + '/><circle cx="50" cy="16" r="3" fill="#e03131"/><circle cx="36" cy="19" r="2.4" fill="#4dabf7"/><circle cx="64" cy="19" r="2.4" fill="#4dabf7"/>'
  };
  function bipSVG(wear) {
    wear = wear || {};
    var skin = 'class="bp-skin" ' + SK, cls = 'bip' + (wear.skin === 'gold' ? ' gold' : '') + (HATS[wear.head] ? ' has-hat' : '');
    return '<svg class="' + cls + '" viewBox="-14 -16 128 142" aria-hidden="true">' +
      (wear.back ? PART[wear.back] : '') +
      '<rect x="36" y="100" width="10" height="15" rx="4" ' + skin + '/><rect x="54" y="100" width="10" height="15" rx="4" ' + skin + '/>' +
      '<g class="bp-arm bp-arm-l"><path d="M31 77 L16 92" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><circle cx="15" cy="93" r="5.5" ' + skin + ' stroke-width="2.5"/></g>' +
      '<g class="bp-arm bp-arm-r"><path d="M69 77 L84 92" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><circle cx="85" cy="93" r="5.5" ' + skin + ' stroke-width="2.5"/></g>' +
      '<rect x="28" y="68" width="44" height="36" rx="12" ' + skin + '/>' +
      '<circle cx="50" cy="87" r="6" fill="#ffd43b" stroke="' + INK + '" stroke-width="2.5"/>' +
      (wear.neck ? PART[wear.neck] : '') +
      '<g class="bp-head">' +
        '<g class="bp-ant"><path d="M50 22 V11" stroke="' + INK + '" stroke-width="3"/><circle cx="50" cy="8" r="4.5" fill="#ff6b6b" stroke="' + INK + '" stroke-width="2.5"/></g>' +
        '<rect x="14" y="37" width="7" height="15" rx="3" ' + skin + ' stroke-width="2.5"/><rect x="79" y="37" width="7" height="15" rx="3" ' + skin + ' stroke-width="2.5"/>' +
        '<rect x="20" y="22" width="60" height="46" rx="15" ' + skin + '/>' +
        '<rect x="29" y="30" width="42" height="30" rx="9" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<g class="bp-eyes"><circle cx="41" cy="43" r="4.5" fill="' + INK + '"/><circle cx="59" cy="43" r="4.5" fill="' + INK + '"/></g>' +
        '<path class="bp-eyes-happy" d="M36 45 Q41 38 46 45 M54 45 Q59 38 64 45" stroke="' + INK + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<circle cx="34" cy="52" r="3" fill="#ffa8a8"/><circle cx="66" cy="52" r="3" fill="#ffa8a8"/>' +
        '<path class="bp-m-smile" d="M43 51 Q50 57 57 51" stroke="' + INK + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path class="bp-m-sad" d="M43 56 Q50 50 57 56" stroke="' + INK + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path class="bp-m-open" d="M42 50 Q50 61 58 50 Z" fill="#e03131" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        (wear.face ? PART[wear.face] : '') +
        (wear.head ? PART[wear.head] : '') +
      '</g></svg>';
  }

  /* ---------- learner data ---------- */
  function read(key) { try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (e) { return {}; } }
  function who() { return '@' + (Core.currentName() || 'khach'); }
  function totalStars() {
    var mine = read('whth-progress')[who()] || {}, n = 0, l, a;
    for (l in mine) if (mine.hasOwnProperty(l) && /^l\d/.test(l)) for (a in mine[l]) if (mine[l].hasOwnProperty(a) && mine[l][a]) n++;
    return n;
  }
  function levelOf(stars) { var lv = 1; for (var i = 1; i < LEVELS.length; i++) if (stars >= LEVELS[i]) lv = i + 1; return lv; }
  function settings() {
    var s = read(WEAR_KEY)[who()] || {};
    s.wear = s.wear || {};
    s.anim = s.anim || 'random';
    return s;
  }
  function save(s) {
    var all = read(WEAR_KEY);
    all[who()] = s;
    try { localStorage.setItem(WEAR_KEY, JSON.stringify(all)); } catch (e) {}
    refreshAvatars();
  }
  function itemLevel(id) { for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return i + 2; return 99; }
  function animLevel(id) { for (var i = 0; i < ANIMS.length; i++) if (ANIMS[i].id === id) return i + 1; return 99; }
  /* only wear what is unlocked (a profile switch or a reset may lower the level) */
  function wearNow() {
    var s = settings(), lv = levelOf(totalStars()), w = {}, k;
    for (k in s.wear) if (s.wear.hasOwnProperty(k) && s.wear[k] && itemLevel(s.wear[k]) <= lv) w[k] = s.wear[k];
    return w;
  }
  function pickAnim() {
    var s = settings(), lv = levelOf(totalStars());
    if (s.anim !== 'random' && animLevel(s.anim) <= lv) return s.anim;
    return ANIMS[Math.floor(Math.random() * lv)].id;
  }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function E(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function quiet() { return Core.currentName() === '__fit'; }

  /* ---------- effects drawn around Bíp ---------- */
  var COLORS = ['#f03e3e', '#f59f00', '#37b24d', '#1c7ed6', '#ae3ec9', '#ffd43b'];
  function fx(fig, anim) {
    var box = fig.querySelector('.bip-fx'), html = '', i, a;
    if (!box) return;
    if (anim === 'fireworks') {
      for (var b = 0; b < 3; b++) for (i = 0; i < 10; i++) {
        a = i / 10 * Math.PI * 2;
        html += '<i class="fx-spark" style="left:' + [20, 80, 50][b] + '%;top:' + [18, 12, -8][b] + '%;background:' + COLORS[(i + b) % 6] +
          ';--dx:' + Math.round(Math.cos(a) * 34) + 'px;--dy:' + Math.round(Math.sin(a) * 34) + 'px;animation-delay:' + (b * 0.15) + 's"></i>';
      }
    } else if (anim === 'magic') {
      for (i = 0; i < 9; i++) html += '<i class="fx-twinkle" style="left:' + (8 + Math.random() * 84) + '%;top:' + (Math.random() * 80) + '%;animation-delay:' + (Math.random() * 0.35).toFixed(2) + 's">✦</i>';
    } else if (anim === 'rocket') {
      html = '<i class="fx-flame"></i>';
    } else if (anim === 'rainbow') {
      html = '<svg class="fx-rainbow" viewBox="0 0 200 110">';
      for (i = 0; i < 6; i++) html += '<path d="M' + (20 + i * 7) + ' 105 A' + (80 - i * 7) + ' ' + (80 - i * 7) + ' 0 0 1 ' + (180 - i * 7) + ' 105" stroke="' + COLORS[i] + '" stroke-width="7" fill="none" pathLength="100"/>';
      html += '</svg>';
    } else if (anim === 'sad') {
      html = '<i class="fx-drop"></i>';
    } else if (anim === 'dizzy') {
      html = '<span class="fx-orbit"><i>★</i><i>★</i><i>★</i></span>';
    }
    box.innerHTML = html;
  }
  function figure(wear, anim, mood) {
    return '<div class="bip-fig a-' + anim + ' mood-' + mood + '"><div class="bip-fx"></div><div class="bip-body">' + bipSVG(wear) + '</div></div>';
  }
  function play(holder, wear, anim, mood) {
    holder.innerHTML = figure(wear, anim, mood);
    fx(holder.firstChild, anim);
  }

  /* ---------- pop-up reaction in the corner ---------- */
  var pop, popTimer;
  var SAY = {
    good: ['Đúng rồi!', 'Giỏi quá!', 'Chính xác!', 'Hay lắm!', 'Tuyệt!'],
    bad: ['Thử lại nha!', 'Gần đúng rồi!', 'Em đọc kĩ lại nha!', 'Không sao, thử tiếp nào!'],
    win: ['Hoàn thành!', 'Xuất sắc!', 'Em giỏi quá!']
  };
  Core.react = function (kind, newStar) {
    if (quiet() || !Core.motionOK()) return;
    kind = kind === 'bad' ? 'bad' : kind === 'win' ? 'win' : 'good';
    if (!pop) { pop = E('div', 'bip-pop'); pop.setAttribute('aria-hidden', 'true'); document.body.appendChild(pop); }
    var anim = kind === 'bad' ? pick(['no', 'sad', 'dizzy']) : pickAnim();
    var text = (Core.bubbleText && Core.bubbleText(kind)) || (pick(SAY[kind]) + (kind === 'win' && newStar ? ' +1 ★' : ''));
    pop.className = 'bip-pop';
    pop.innerHTML = '<div class="bip-bubble' + (kind === 'bad' ? ' is-bad' : '') + '">' + text + '</div><div class="bip-holder"></div>';
    play(pop.lastChild, wearNow(), anim, kind === 'bad' ? 'bad' : kind === 'win' ? 'win' : 'ok');
    void pop.offsetWidth;
    pop.className = 'bip-pop is-on';
    clearTimeout(popTimer);
    popTimer = setTimeout(function () { pop.className = 'bip-pop'; }, 1000);
  };

  /* ---------- modal helpers ---------- */
  function modal(cls, html) {
    var m = E('div', 'bip-modal', '<div class="bip-card ' + cls + '" role="dialog" aria-modal="true">' + html + '</div>');
    document.body.appendChild(m);
    function close() { if (m.parentNode) m.parentNode.removeChild(m); }
    Core.on(m, function (e) { if (e && e.target === m) close(); });
    return { el: m, close: close, $: function (s) { return m.querySelector(s); } };
  }

  /* ---------- level up ---------- */
  function levelUp(lv) {
    var anim = ANIMS[lv - 1], item = ITEMS[lv - 2];
    if (Core.sound) Core.sound('level');
    var w = wearNow();
    if (item) w[item.slot] = item.id;
    var M = modal('bip-levelup',
      '<div class="bip-burst-bg"></div><div class="bip-holder big"></div>' +
      '<h2>Lên cấp ' + lv + '!</h2>' +
      '<p>Em đã có <b>' + totalStars() + '</b> sao. Bíp mở khoá ' + (item ? 'trang phục <b>' + item.name + '</b> và ' : '') + 'điệu ăn mừng <b>' + anim.name + '</b>.</p>' +
      '<div class="bip-actions"><button class="btn" data-k="later">Để sau</button>' +
      '<button class="btn btn-primary" data-k="wear">' + (item ? 'Mặc thử ngay' : 'Tuyệt quá!') + '</button></div>');
    var holder = M.$('.bip-holder');
    play(holder, w, anim.id, 'win');
    if (Core.motionOK()) var loop = setInterval(function () { if (!M.el.parentNode) return clearInterval(loop); play(holder, w, anim.id, 'win'); }, 2400);
    Core.on(M.$('[data-k="later"]'), M.close);
    Core.on(M.$('[data-k="wear"]'), function () {
      if (item) { var s = settings(); s.wear[item.slot] = item.id; save(s); }
      M.close();
    });
  }
  var award = Core.award;
  Core.award = function (lessonId, activityId) {
    var before = levelOf(totalStars());
    var isNew = award(lessonId, activityId);
    var after = levelOf(totalStars());
    if (isNew && after > before && !quiet()) setTimeout(function () { levelUp(after); }, 900);
    return isNew;
  };

  /* ---------- wardrobe ---------- */
  Core.wardrobe = function () {
    var s = settings(), stars = totalStars(), lv = levelOf(stars);
    var next = LEVELS[lv], nextItem = ITEMS[lv - 1], nextAnim = ANIMS[lv];
    var pct = next ? Math.round((stars - LEVELS[lv - 1]) / (next - LEVELS[lv - 1]) * 100) : 100;
    var items = '', anims = '<button class="btn bip-anim" data-a="random">Ngẫu nhiên</button>', i, need;
    for (i = 0; i < ITEMS.length; i++) {
      need = LEVELS[i + 1];
      var one = {}; one[ITEMS[i].slot] = ITEMS[i].id;
      items += '<button class="btn bip-item" data-i="' + i + '"' + (lv < i + 2 ? ' disabled' : '') + '>' +
        '<span class="bip-mini">' + bipSVG(one) + '</span><span>' + ITEMS[i].name + '</span>' +
        (lv < i + 2 ? '<small>Cần ' + need + ' sao</small>' : '') + '</button>';
    }
    for (i = 0; i < ANIMS.length; i++) {
      anims += '<button class="btn bip-anim" data-a="' + ANIMS[i].id + '"' + (lv < i + 1 ? ' disabled' : '') + '>' + ANIMS[i].name +
        (lv < i + 1 ? '<small>Cần ' + LEVELS[i] + ' sao</small>' : '') + '</button>';
    }
    var M = modal('bip-wardrobe',
      '<div class="bip-card-head"><h2>Tủ đồ của Bíp</h2><button class="btn btn-small" data-k="close" aria-label="Đóng">Đóng ✕</button></div>' +
      '<div class="bip-wr">' +
        '<div class="bip-wr-left"><div class="bip-holder big"></div>' +
          '<p class="bip-lv">Cấp <b>' + lv + '</b> · <b>' + stars + '</b> sao</p>' +
          '<div class="bip-bar"><span style="width:' + pct + '%"></span></div>' +
          '<p class="bip-next">' + (next ? 'Còn <b>' + (next - stars) + '</b> sao nữa để mở ' + (nextItem ? '<b>' + nextItem.name + '</b> và ' : '') + 'điệu <b>' + nextAnim.name + '</b>.' : 'Em đã mở khoá tất cả! Bíp tự hào về em lắm.') + '</p>' +
          '<button class="btn btn-primary" data-k="play">Xem Bíp ăn mừng</button></div>' +
        '<div class="bip-wr-right"><h3>Trang phục <small>(chạm lần nữa để cởi ra)</small></h3><div class="bip-items">' + items + '</div>' +
          '<h3>Điệu ăn mừng</h3><div class="bip-anims">' + anims + '</div></div>' +
      '</div>');
    var holder = M.$('.bip-holder');
    function mark() {
      var b = M.el.querySelectorAll('.bip-item'), a = M.el.querySelectorAll('.bip-anim'), k;
      for (k = 0; k < b.length; k++) { var it = ITEMS[+b[k].getAttribute('data-i')]; b[k].setAttribute('aria-pressed', s.wear[it.slot] === it.id ? 'true' : 'false'); }
      for (k = 0; k < a.length; k++) a[k].setAttribute('aria-pressed', a[k].getAttribute('data-a') === s.anim ? 'true' : 'false');
    }
    function show(anim) { play(holder, wearNow(), anim || pickAnim(), 'win'); }
    var list = M.el.querySelectorAll('.bip-item');
    for (i = 0; i < list.length; i++) Core.on(list[i], function () {
      var it = ITEMS[+this.getAttribute('data-i')];
      s.wear[it.slot] = s.wear[it.slot] === it.id ? '' : it.id;
      save(s); mark(); show('jump');
      if (Core.sound) Core.sound('wear');
    });
    list = M.el.querySelectorAll('.bip-anim');
    for (i = 0; i < list.length; i++) Core.on(list[i], function () {
      s.anim = this.getAttribute('data-a'); save(s); mark(); show(s.anim === 'random' ? null : s.anim);
    });
    Core.on(M.$('[data-k="play"]'), function () { show(); });
    Core.on(M.$('[data-k="close"]'), M.close);
    mark(); show('jump');
  };

  /* ---------- Bíp buttons: header avatar on every page, big Bíp on the home page ---------- */
  function refreshAvatars() {
    var els = document.querySelectorAll('[data-bip]');
    for (var i = 0; i < els.length; i++) els[i].querySelector('.bip-mini').innerHTML = bipSVG(wearNow());
  }
  Core.refreshBip = refreshAvatars;
  /* the learner may change on the home page */
  ["useProfile", "addProfile", "removeProfile"].forEach(function (k) {
    var f = Core[k];
    if (f) Core[k] = function () { var r = f.apply(Core, arguments); refreshAvatars(); return r; };
  });
  function init() {
    var eink = document.getElementById('eink-toggle');
    if (eink && !document.querySelector('.bip-avatar')) {
      var b = E('button', 'btn btn-small bip-avatar', '<span class="bip-mini"></span>');
      b.setAttribute('data-bip', '1'); b.setAttribute('title', 'Tủ đồ của Bíp'); b.setAttribute('aria-label', 'Tủ đồ của Bíp'); b.type = 'button';
      eink.parentNode.insertBefore(b, eink);
      Core.on(b, Core.wardrobe);
    }
    var hero = document.querySelector('.hero');
    if (hero && !hero.querySelector('.bip-hero')) {
      var h = E('button', 'bip-hero', '<span class="bip-mini"></span><span class="bip-hero-t">Tủ đồ của Bíp ›</span>');
      h.setAttribute('data-bip', '1'); h.type = 'button';
      hero.insertBefore(h, hero.firstChild);
      Core.on(h, Core.wardrobe);
    }
    refreshAvatars();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
