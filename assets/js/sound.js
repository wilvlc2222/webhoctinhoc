/* Small game sounds made with Web Audio (no audio files): tap, right, wrong,
   exercise done, level up, costume. Loaded by core.js on every page.
   ES5. Browsers without Web Audio (Kindle) simply stay silent and get no button. */
(function () {
  var Core = window.Core;
  if (!Core) return;
  var AC = window.AudioContext || window.webkitAudioContext;
  var KEY = 'whth-sound', ctx = null;
  var RANK = { tap: 1, wear: 2, good: 3, bad: 3, win: 4, level: 5 };

  function isOn() { try { return localStorage.getItem(KEY) !== '0'; } catch (e) { return true; } }
  function setOn(on) { try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {} }
  function quiet() { return !AC || !isOn() || Core.currentName() === '__fit'; }

  /* browsers only let sound start after a touch or click */
  function wake() {
    if (!AC) return;
    try {
      if (!ctx) ctx = new AC();
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    } catch (e) { ctx = null; }
    setTimeout(mStart, 250);   /* the music waits for this first touch too */
  }
  document.addEventListener('pointerdown', wake, true);
  document.addEventListener('mousedown', wake, true);
  document.addEventListener('touchstart', wake, true);
  document.addEventListener('keydown', wake, true);

  /* one note: freq (Hz) may slide to `to`; starts `at` seconds from now */
  function note(freq, at, dur, vol, type, to) {
    var t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'triangle';
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.linearRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  var TUNE = {
    tap: function () { note(520, 0, 0.06, 0.07, 'sine', 700); },
    wear: function () { note(420, 0, 0.12, 0.1, 'sine', 880); },
    good: function () { note(659, 0, 0.12, 0.14); note(880, 0.09, 0.2, 0.14); },
    bad: function () { note(233, 0, 0.16, 0.12, 'sine'); note(175, 0.13, 0.24, 0.12, 'sine'); },
    win: function () { note(523, 0, 0.12, 0.13); note(659, 0.09, 0.12, 0.13); note(784, 0.18, 0.12, 0.13); note(1047, 0.27, 0.34, 0.15); },
    level: function () {
      var f = [523, 659, 784, 1047, 1319];
      for (var i = 0; i < f.length; i++) note(f[i], i * 0.1, 0.14, 0.13);
      note(1047, 0.55, 0.5, 0.1); note(1319, 0.55, 0.5, 0.1); note(1568, 0.55, 0.5, 0.1);
    }
  };

  /* several sounds may be asked for by one tap (tap + right + done): only the most important one plays */
  var pending = null;
  Core.sound = function (name) {
    if (quiet() || !TUNE[name]) return;
    if (pending) { if (RANK[name] > RANK[pending]) pending = name; return; }
    pending = name;
    setTimeout(function () {
      var n = pending; pending = null;
      wake();
      if (!ctx || ctx.state === 'suspended') return;
      try { TUNE[n](); } catch (e) {}
    }, 0);
  };

  /* every button gives a soft tap */
  document.addEventListener('click', function (e) {
    var el = e.target, i = 0;
    while (el && el !== document.body && i++ < 5) {
      if (el.tagName === 'BUTTON' || (el.className && typeof el.className === 'string' && /(^| )btn( |$)/.test(el.className))) {
        if (!el.disabled) Core.sound('tap');
        return;
      }
      el = el.parentNode;
    }
  }, true);

  /* ---------- background music ----------
     Three kinds: study (slow, soft: lesson pages), home (bright: home page), boss (lively: started by thuthach.html).
     Each kind has several songs (POOLS); every visit picks one, never the one heard last.
     Notes are MIDI numbers (0 = rest), one per step; a timer schedules them a little ahead.
     Stereo: each note is two slightly detuned voices, one left and one right, bass leaning left and tune leaning
     right, plus a soft echo that bounces left then right. Browsers without StereoPanner just play it centred.
     The music tries to start as soon as the page opens (allowed when the learner tapped to get here);
     where the browser says no, it starts on the first touch.
     Never plays inside a frame (boss page and fit checker load lessons in frames). */
  var MKEY = 'whth-music', LKEY = 'whth-music-last', track = null, song = null, mGain = null, mOld = [], mTimer = null, mNext = 0, mStep = 0;
  var SONGS = {
    study1: { beat: 0.8, vol: 0.05, lowType: 'sine', lowLen: 1.5, leadType: 'sine', leadLen: 2.2,
      low: [60, 64, 67, 64, 57, 60, 64, 60, 53, 57, 60, 57, 55, 59, 62, 59, 60, 64, 67, 64, 57, 60, 64, 60, 53, 57, 60, 57, 55, 59, 62, 59],
      lead: [76, 0, 79, 0, 76, 0, 72, 0, 69, 0, 72, 0, 74, 0, 71, 0, 79, 0, 76, 0, 72, 0, 76, 0, 77, 0, 72, 0, 74, 0, 67, 0] },
    /* home page: a bright, medium-speed welcome loop (C – G – Am – F) */
    home1: { beat: 0.36, vol: 0.045, lowType: 'sine', lowLen: 1.4, leadType: 'triangle', leadLen: 1.6,
      low: [60, 64, 67, 64, 60, 64, 67, 64, 55, 59, 62, 59, 55, 59, 62, 59, 57, 60, 64, 60, 57, 60, 64, 60, 53, 57, 60, 57, 53, 57, 60, 57],
      lead: [72, 0, 76, 0, 79, 0, 76, 74, 74, 0, 71, 0, 67, 0, 71, 74, 76, 0, 72, 0, 69, 0, 72, 76, 77, 76, 74, 0, 72, 0, 0, 0] },
    /* home2: D – A – Bm – G, bouncy */
    home2: { beat: 0.33, vol: 0.045, lowType: 'sine', lowLen: 1.3, leadType: 'triangle', leadLen: 1.5,
      low: [62, 66, 69, 66, 62, 66, 69, 66, 57, 61, 64, 61, 57, 61, 64, 61, 59, 62, 66, 62, 59, 62, 66, 62, 55, 59, 62, 59, 55, 59, 62, 59],
      lead: [74, 0, 78, 0, 81, 78, 76, 74, 73, 0, 76, 0, 69, 0, 73, 76, 78, 0, 74, 0, 71, 0, 74, 78, 79, 78, 76, 0, 74, 0, 0, 0] },
    /* study2: F – Dm – Bb – C, gentle */
    study2: { beat: 0.75, vol: 0.05, lowType: 'triangle', lowLen: 1.5, leadType: 'sine', leadLen: 2.2,
      low: [53, 57, 60, 57, 53, 57, 60, 57, 50, 53, 57, 53, 50, 53, 57, 53, 46, 50, 53, 50, 46, 50, 53, 50, 48, 52, 55, 52, 48, 52, 55, 52],
      lead: [72, 0, 69, 0, 72, 0, 77, 0, 76, 0, 74, 0, 72, 0, 69, 0, 70, 0, 74, 0, 77, 0, 74, 0, 72, 0, 0, 0, 67, 0, 0, 0] },
    /* study3: G – Em – C – D, calm walk */
    study3: { beat: 0.7, vol: 0.05, lowType: 'sine', lowLen: 1.5, leadType: 'sine', leadLen: 2.2,
      low: [55, 59, 62, 59, 55, 59, 62, 59, 52, 55, 59, 55, 52, 55, 59, 55, 48, 52, 55, 52, 48, 52, 55, 52, 50, 54, 57, 54, 50, 54, 57, 54],
      lead: [71, 0, 74, 0, 79, 0, 78, 0, 76, 0, 74, 0, 71, 0, 0, 0, 72, 0, 76, 0, 79, 0, 76, 0, 74, 0, 72, 0, 71, 0, 69, 0] },
    /* study4: Am – F – C – G, quiet */
    study4: { beat: 0.8, vol: 0.05, lowType: 'triangle', lowLen: 1.5, leadType: 'sine', leadLen: 2.2,
      low: [57, 60, 64, 60, 57, 60, 64, 60, 53, 57, 60, 57, 53, 57, 60, 57, 55, 60, 64, 60, 55, 60, 64, 60, 55, 59, 62, 59, 55, 59, 62, 59],
      lead: [69, 0, 72, 0, 76, 0, 74, 72, 72, 0, 69, 0, 65, 0, 0, 0, 67, 0, 72, 0, 76, 0, 79, 0, 74, 0, 71, 0, 67, 0, 0, 0] },
    boss1: { beat: 0.24, vol: 0.045, lowType: 'triangle', lowLen: 0.9, leadType: 'triangle', leadLen: 1.6,
      low: [57, 57, 64, 57, 57, 57, 64, 57, 53, 53, 60, 53, 53, 53, 60, 53, 60, 60, 67, 60, 60, 60, 67, 60, 52, 52, 59, 52, 56, 56, 59, 64],
      lead: [69, 0, 72, 0, 76, 0, 72, 0, 69, 0, 72, 0, 77, 0, 72, 0, 67, 0, 72, 0, 76, 0, 79, 0, 76, 0, 71, 0, 68, 0, 71, 0] },
    /* boss2: Em – C – G – D, driving */
    boss2: { beat: 0.22, vol: 0.045, lowType: 'triangle', lowLen: 0.9, leadType: 'triangle', leadLen: 1.6,
      low: [52, 52, 59, 52, 52, 52, 59, 52, 48, 48, 55, 48, 48, 48, 55, 48, 55, 55, 62, 55, 55, 55, 62, 55, 50, 50, 57, 50, 54, 54, 57, 62],
      lead: [71, 0, 76, 0, 79, 0, 76, 0, 72, 0, 76, 0, 79, 0, 76, 0, 74, 0, 79, 0, 83, 0, 79, 0, 74, 0, 78, 0, 81, 0, 78, 74] }
  };
  /* each kind plays its songs at beat × TEMPO[kind] seconds per step (smaller = faster).
     Master 2026-11-14: a bit faster than written, but only moderately, never so fast that kids feel rushed:
     study and home a little faster, boss a little calmer than written. */
  var TEMPO = { study: 0.88, home: 0.9, boss: 1.1 };
  function tempo() { return TEMPO[track] || 1; }
  var POOLS = { study: ['study1', 'study2', 'study3', 'study4'], home: ['home1', 'home2'], boss: ['boss1', 'boss2'] };
  function pick(kind) {
    var p = POOLS[kind], last = '', s, n = 0;
    try { last = localStorage.getItem(LKEY) || ''; } catch (e) {}
    do { s = p[Math.floor(Math.random() * p.length)]; } while (p.length > 1 && s === last && n++ < 20);
    try { localStorage.setItem(LKEY, s); } catch (e) {}
    return s;
  }
  function musicOn() { try { return localStorage.getItem(MKEY) !== '0'; } catch (e) { return true; } }
  function framed() { try { return window.self !== window.top; } catch (e) { return true; } }
  function panned(node, x) {
    if (!ctx.createStereoPanner) return node;
    var p = ctx.createStereoPanner(); p.pan.value = x; node.connect(p); return p;
  }
  /* one note = two voices a few cents apart, placed at side - spread and side + spread */
  function mNote(midi, t, dur, vol, type, side, spread) {
    var g = ctx.createGain(), f = 440 * Math.pow(2, (midi - 69) / 12), k, o;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol * 0.6, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(mGain);
    for (k = -1; k <= 1; k += 2) {
      o = ctx.createOscillator(); o.type = type;
      o.frequency.setValueAtTime(f, t);
      if (o.detune) o.detune.setValueAtTime(k * 6, t);
      panned(o, side + k * spread).connect(g);
      o.start(t); o.stop(t + dur + 0.05);
    }
  }
  function mTick() {
    var s = SONGS[song];
    if (!ctx || !s || !mGain) return;
    try {
      while (mNext < ctx.currentTime + 0.6) {
        var i = mStep % s.low.length;
        var b = s.beat * tempo();
        if (s.low[i]) mNote(s.low[i], mNext, b * s.lowLen, s.vol, s.lowType, -0.25, 0.2);
        if (s.lead[i]) mNote(s.lead[i], mNext, b * s.leadLen, s.vol * 0.8, s.leadType, 0.2, 0.3);
        mNext += b; mStep++;
      }
    } catch (e) {}
  }
  /* music bus: soft low-pass, then out; a quiet copy goes through a left-right echo */
  function mBus() {
    var nodes = [], lp, send, dl, dr, fb, mg, d = Math.min(0.6, SONGS[song].beat * tempo() * 1.5);
    mGain = ctx.createGain(); nodes.push(mGain);
    lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; nodes.push(lp);
    mGain.connect(lp); lp.connect(ctx.destination);
    try {
      send = ctx.createGain(); send.gain.value = 0.22;
      dl = ctx.createDelay(2); dr = ctx.createDelay(2); fb = ctx.createGain(); mg = ctx.createChannelMerger(2);
      dl.delayTime.value = d; dr.delayTime.value = d; fb.gain.value = 0.35;
      lp.connect(send); send.connect(dl); dl.connect(dr); dr.connect(fb); fb.connect(dl);
      dl.connect(mg, 0, 0); dr.connect(mg, 0, 1); mg.connect(ctx.destination);
      nodes.push(send, dl, dr, fb, mg);
    } catch (e) {}
    return nodes;
  }
  function mStop() {
    if (mTimer) { clearInterval(mTimer); mTimer = null; }
    if (mGain) {
      var old = mOld;
      try { mGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05); } catch (e) {}
      setTimeout(function () { for (var i = 0; i < old.length; i++) try { old[i].disconnect(); } catch (e) {} }, 4000);
      mGain = null; mOld = [];
    }
  }
  function mStart() {
    if (mTimer || !track || !AC || !musicOn() || framed() || document.hidden || Core.currentName() === '__fit') return;
    if (!ctx || ctx.state === 'suspended') return;   /* not allowed yet: wake() or the state change calls this again */
    if (!song) song = pick(track);
    try { mOld = mBus(); } catch (e) { mGain = null; return; }
    mNext = ctx.currentTime + 0.1; mStep = 0;
    mTick(); mTimer = setInterval(mTick, 200);
  }
  /* try to start without a touch: browsers allow it when the learner tapped on this site to get here */
  function tryAuto() {
    if (ctx || !AC || !track || !musicOn() || framed() || Core.currentName() === '__fit') return;
    try {
      ctx = new AC();
      if (ctx.addEventListener) ctx.addEventListener('statechange', function () { if (ctx && ctx.state === 'running') mStart(); }, false);
      if (ctx.state === 'running') mStart();
      else if (ctx.resume) { var r = ctx.resume(); if (r && r.then) r.then(mStart, function () {}); }
    } catch (e) { ctx = null; }
  }
  /* Core.music('study' | 'home' | 'boss' | null): the kind; the song of that kind is picked on start */
  Core.music = function (name) {
    name = POOLS[name] ? name : null;
    if (name === track) return;
    mStop(); track = name; song = null; mStart(); tryAuto();
  };
  Core.musicSong = function () { return mTimer ? song : null; };   /* for checks */
  Core.musicPlaying = function () { return mTimer ? track : null; };   /* for checks */
  document.addEventListener('visibilitychange', function () { if (document.hidden) mStop(); else mStart(); }, false);

  /* on/off buttons next to the e-ink button */
  var NOTE = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 18V6l10-2v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="6.500" cy="18" r="2.500" fill="currentColor"/><circle cx="16.500" cy="16" r="2.500" fill="currentColor"/>';
  var SLASH = '<path d="M4 4l16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
  function paintMusic(b) {
    var on = musicOn();
    b.innerHTML = NOTE + (on ? '' : SLASH) + '</svg>';
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.setAttribute('title', on ? 'Nhạc nền: đang bật' : 'Nhạc nền: đang tắt');
    b.setAttribute('aria-label', on ? 'Nhạc nền đang bật, bấm để tắt' : 'Nhạc nền đang tắt, bấm để bật');
  }

  var ICON = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/>';
  var WAVES = '<path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var CROSS = '<path d="M16.5 9.5l5 5M21.5 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  function paint(b) {
    var on = isOn();
    b.innerHTML = ICON + (on ? WAVES : CROSS);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.setAttribute('title', on ? 'Âm thanh: đang bật' : 'Âm thanh: đang tắt');
    b.setAttribute('aria-label', on ? 'Âm thanh đang bật, bấm để tắt' : 'Âm thanh đang tắt, bấm để bật');
  }
  function init() {
    var eink = document.getElementById('eink-toggle');
    if (!AC || !eink || document.querySelector('.snd-toggle')) return;
    var b = document.createElement('button');
    b.className = 'btn btn-small snd-toggle'; b.type = 'button';
    paint(b);
    eink.parentNode.insertBefore(b, eink);
    b.addEventListener('click', function () { setOn(!isOn()); paint(b); if (isOn()) Core.sound('good'); }, false);
    var mb = document.createElement('button');
    mb.className = 'btn btn-small snd-toggle mus-toggle'; mb.type = 'button';
    paintMusic(mb);
    eink.parentNode.insertBefore(mb, b);
    mb.addEventListener('click', function () {
      try { localStorage.setItem(MKEY, musicOn() ? '0' : '1'); } catch (e) {}
      paintMusic(mb);
      if (musicOn()) { wake(); mStart(); } else mStop();
    }, false);
    /* lesson pages get the study music, the home page (the only one with the topic legend) its own; the boss page asks for its own */
    if (document.querySelector('.step')) Core.music('study');
    else if (document.getElementById('topic-legend')) Core.music('home');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
