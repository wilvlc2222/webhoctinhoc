/* Pretend video player (like Windows Media Player). A "video" is a list of drawn frames with a
   narration line each, so it works offline and on e-ink. ES5 only. Needs core.js + icons.js.

   Player(host, { title, frames: [{ art: '<svg...>', text: 'narration' }], frameMs: 3000,
                  onEnd: fn, onControl: fn(name) }) */
(function () {
  var E = Core.el;
  window.Player = function (host, cfg) {
    var frames = cfg.frames, n = frames.length, i = 0, playing = false, timer = null, muted = false, full = false, ended = false;
    var ms = cfg.frameMs || (Core.isEink() ? 5000 : 3500);
    var wrap = E('div', 'pl');
    var bar = E('div', 'pl-title', Core.icon('video') + '<span></span>');
    bar.lastChild.appendChild(document.createTextNode((cfg.title || 'Video') + ' – Windows Media Player'));
    var screen = E('div', 'pl-screen');
    var art = E('div', 'pl-art');
    var cap = E('div', 'pl-cap');
    var big = E('button', 'pl-big', Core.icon('play'));
    big.setAttribute('aria-label', 'Phát video');
    screen.appendChild(art); screen.appendChild(cap); screen.appendChild(big);
    var prog = E('div', 'pl-prog');
    var ctr = E('div', 'pl-ctr');
    var time = E('span', 'pl-time');
    function b(icon, label, fn) {
      var el = E('button', 'pl-btn', Core.icon(icon));
      el.setAttribute('title', label); el.setAttribute('aria-label', label);
      Core.on(el, function () { fn(); if (cfg.onControl) cfg.onControl(label); });
      return el;
    }
    var bStop = b('stopSq', 'Stop: dừng hẳn, về đầu video', stop);
    var bPrev = b('prevBar', 'Previous: lùi lại đoạn trước', function () { go(i - 1); });
    var bPlay = b('play', 'Play/Pause: phát hoặc tạm dừng', toggle);
    var bNext = b('nextBar', 'Next: tua tới đoạn sau', function () { go(i + 1); });
    var bMute = b('vol', 'Volume: bật/tắt lời kể', function () { muted = !muted; draw(); });
    var bFull = b('fullscr', 'Full screen: xem toàn màn hình', function () { full = !full; if (full) Core.addClass(wrap, 'is-full'); else Core.removeClass(wrap, 'is-full'); });
    ctr.appendChild(bStop); ctr.appendChild(bPrev); ctr.appendChild(bPlay); ctr.appendChild(bNext);
    ctr.appendChild(time); ctr.appendChild(bMute); ctr.appendChild(bFull);
    wrap.appendChild(bar); wrap.appendChild(screen); wrap.appendChild(prog); wrap.appendChild(ctr);
    host.appendChild(wrap);
    for (var k = 0; k < n; k++) {
      (function (k) {
        var seg = E('button', 'pl-seg');
        seg.setAttribute('aria-label', 'Tua tới đoạn ' + (k + 1));
        Core.on(seg, function () { go(k); if (cfg.onControl) cfg.onControl('seek'); });
        prog.appendChild(seg);
      })(k);
    }
    Core.on(big, function () { toggle(); if (cfg.onControl) cfg.onControl('Play/Pause'); });

    function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
    function draw() {
      art.innerHTML = frames[i].art;
      cap.innerHTML = muted ? '<i>(Đã tắt tiếng: bấm nút loa để nghe lời kể)</i>' : frames[i].text;
      var segs = prog.children;
      for (var k = 0; k < segs.length; k++) segs[k].className = 'pl-seg' + (k < i ? ' done' : k === i ? ' cur' : '');
      var sec = Math.round(ms / 1000);
      time.innerHTML = fmt(i * sec) + ' / ' + fmt(n * sec);
      bPlay.innerHTML = Core.icon(playing ? 'pause' : 'play');
      bMute.innerHTML = Core.icon(muted ? 'volOff' : 'vol');
      big.style.display = playing ? 'none' : '';
    }
    function tick() {
      timer = null;
      if (!playing) return;
      if (i >= n - 1) { playing = false; ended = true; draw(); if (cfg.onEnd) cfg.onEnd(); return; }
      i++; draw();
      timer = setTimeout(tick, ms);
    }
    function play() { if (ended) { i = 0; ended = false; } playing = true; draw(); if (timer) clearTimeout(timer); timer = setTimeout(tick, ms); }
    function pause() { playing = false; if (timer) clearTimeout(timer); timer = null; draw(); }
    function toggle() { if (playing) pause(); else play(); }
    function stop() { pause(); i = 0; draw(); }
    function go(k) { i = Math.max(0, Math.min(n - 1, k)); if (i === n - 1 && cfg.onEnd) { ended = true; cfg.onEnd(); } draw(); if (playing) { if (timer) clearTimeout(timer); timer = setTimeout(tick, ms); } }
    draw();
    return { play: play, pause: pause, stop: stop, go: go, end: function () { go(n - 1); } };
  };
})();
