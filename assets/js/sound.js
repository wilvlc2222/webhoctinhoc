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
     study: a slow, soft loop for lesson pages. boss: a livelier one, started by thuthach.html.
     Notes are MIDI numbers (0 = rest), one per step; a timer schedules them a little ahead.
     Never plays inside a frame (boss page and fit checker load lessons in frames). */
  var MKEY = 'whth-music', track = null, mGain = null, mTimer = null, mNext = 0, mStep = 0;
  var SONGS = {
    study: { beat: 0.8, vol: 0.05, lowType: 'sine', lowLen: 1.5, leadType: 'sine', leadLen: 2.2,
      low: [60, 64, 67, 64, 57, 60, 64, 60, 53, 57, 60, 57, 55, 59, 62, 59, 60, 64, 67, 64, 57, 60, 64, 60, 53, 57, 60, 57, 55, 59, 62, 59],
      lead: [76, 0, 79, 0, 76, 0, 72, 0, 69, 0, 72, 0, 74, 0, 71, 0, 79, 0, 76, 0, 72, 0, 76, 0, 77, 0, 72, 0, 74, 0, 67, 0] },
    boss: { beat: 0.24, vol: 0.045, lowType: 'triangle', lowLen: 0.9, leadType: 'triangle', leadLen: 1.6,
      low: [57, 57, 64, 57, 57, 57, 64, 57, 53, 53, 60, 53, 53, 53, 60, 53, 60, 60, 67, 60, 60, 60, 67, 60, 52, 52, 59, 52, 56, 56, 59, 64],
      lead: [69, 0, 72, 0, 76, 0, 72, 0, 69, 0, 72, 0, 77, 0, 72, 0, 67, 0, 72, 0, 76, 0, 79, 0, 76, 0, 71, 0, 68, 0, 71, 0] }
  };
  function musicOn() { try { return localStorage.getItem(MKEY) !== '0'; } catch (e) { return true; } }
  function framed() { try { return window.self !== window.top; } catch (e) { return true; } }
  function mNote(midi, t, dur, vol, type) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(440 * Math.pow(2, (midi - 69) / 12), t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(mGain);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function mTick() {
    var s = SONGS[track];
    if (!ctx || !s || !mGain) return;
    try {
      while (mNext < ctx.currentTime + 0.6) {
        var i = mStep % s.low.length;
        if (s.low[i]) mNote(s.low[i], mNext, s.beat * s.lowLen, s.vol, s.lowType);
        if (s.lead[i]) mNote(s.lead[i], mNext, s.beat * s.leadLen, s.vol * 0.8, s.leadType);
        mNext += s.beat; mStep++;
      }
    } catch (e) {}
  }
  function mStop() {
    if (mTimer) { clearInterval(mTimer); mTimer = null; }
    if (mGain) { try { mGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05); } catch (e) {} mGain = null; }
  }
  function mStart() {
    if (mTimer || !track || !AC || !musicOn() || framed() || document.hidden || Core.currentName() === '__fit') return;
    if (!ctx || ctx.state === 'suspended') return;   /* not touched yet: wake() calls this again */
    try { mGain = ctx.createGain(); mGain.connect(ctx.destination); } catch (e) { mGain = null; return; }
    mNext = ctx.currentTime + 0.1; mStep = 0;
    mTick(); mTimer = setInterval(mTick, 200);
  }
  /* Core.music('study' | 'boss' | null) */
  Core.music = function (name) {
    name = SONGS[name] ? name : null;
    if (name === track) return;
    mStop(); track = name; mStart();
  };
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
    /* lesson pages get the study music; the boss page asks for its own */
    if (document.querySelector('.step')) Core.music('study');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
