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

  /* on/off button next to the e-ink button */
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
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
