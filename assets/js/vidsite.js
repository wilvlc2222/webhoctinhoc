/* Pretend video-sharing website ("Video Vui") for Bài 8B / 9B: search box, filter chips (Tất cả / Shorts / Video / Chưa xem),
   result cards with the length in the bottom-right corner of the picture, and a watch page using player.js.
   Everything is drawn here, so it works offline and on e-ink. ES5 only. Needs core.js, icons.js, player.js.

   var v = VidSite(host, { videos: [{ id, title, ch, dur: '9:40', short: false, keys: ['gap hac giay'], thumb: '<svg..>', frames: [{ art, text }] }],
                          height: 330, onEvent: function (type, data) {} })
     events: 'search' { q, hits }, 'filter' { f }, 'open' { video }, 'control' { name, video }, 'end' { video }
   v: { search(q), filter(f), open(id), back(), player() } */
(function () {
  var E = Core.el;
  var FILTERS = [['all', 'Tất cả'], ['shorts', 'Shorts'], ['video', 'Video'], ['new', 'Chưa xem']];
  function P(s) { return (Core.plain ? Core.plain(String(s)) : String(s)).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').replace(/^ | $/g, ''); }

  window.VidSite = function (host, cfg) {
    var vids = cfg.videos || [], q = '', hits = null, filt = 'all', watched = {}, cur = null, pl = null;
    function fire(t, d) { if (cfg.onEvent) cfg.onEvent(t, d || {}); }
    var app = E('div', 'vs');
    var top = E('div', 'vs-top');
    var logo = E('div', 'vs-logo', Core.icon('play') + '<span>Video Vui</span>');
    var form = E('form', 'vs-search');
    var inp = E('input', 'vs-in');
    inp.setAttribute('placeholder', 'Tìm kiếm video'); inp.setAttribute('aria-label', 'Ô tìm kiếm video');
    var go = E('button', 'vs-go', Core.icon('search'));
    go.setAttribute('aria-label', 'Tìm');
    form.appendChild(inp); form.appendChild(go);
    top.appendChild(logo); top.appendChild(form);
    var chips = E('div', 'vs-chips');
    var body = E('div', 'vs-body');
    if (cfg.height) body.style.height = cfg.height + 'px';
    app.appendChild(top); app.appendChild(chips); app.appendChild(body);
    host.appendChild(app);
    if (window.Telex) Telex.attach(inp, { mode: function () { return 'telex'; } });
    form.addEventListener('submit', function (ev) { ev.preventDefault(); search(inp.value); });

    function renderChips() {
      chips.innerHTML = '';
      for (var i = 0; i < FILTERS.length; i++) (function (f) {
        var b = E('button', 'vs-chip' + (filt === f[0] ? ' is-on' : ''), f[1]);
        Core.on(b, function () { filter(f[0]); });
        chips.appendChild(b);
      })(FILTERS[i]);
    }
    function search(text) {
      q = String(text || '').replace(/^\s+|\s+$/g, ''); inp.value = q; cur = null;
      var k = P(q); hits = [];
      if (k) for (var i = 0; i < vids.length; i++) {
        var v = vids[i], ok = false;
        for (var j = 0; j < v.keys.length && !ok; j++) { var key = P(v.keys[j]); if (k.indexOf(key) > -1 || key.indexOf(k) > -1) ok = true; }
        if (ok) hits.push(v);
      }
      fire('search', { q: q, hits: hits });
      render();
    }
    function filter(f) { filt = f; cur = null; renderChips(); fire('filter', { f: f }); render(); }
    function shown() {
      var o = [];
      if (!hits) return o;
      for (var i = 0; i < hits.length; i++) {
        var v = hits[i];
        if (filt === 'shorts' && !v.short) continue;
        if (filt === 'video' && v.short) continue;
        if (filt === 'new' && watched[v.id]) continue;
        o.push(v);
      }
      return o;
    }
    function thumb(v) {
      return '<div class="vs-thumb' + (v.short ? ' is-short' : '') + '">' + (v.thumb || '') + '<span class="vs-dur">' + v.dur + '</span>' + (v.short ? '<span class="vs-sh">Shorts</span>' : '') + '</div>';
    }
    function render() {
      body.innerHTML = '';
      if (cur) {
        var back = E('button', 'btn btn-small vs-back', '‹ Quay lại kết quả');
        Core.on(back, function () { api.back(); });
        var head = E('div', 'vs-whead');
        head.appendChild(back);
        head.appendChild(E('div', 'vs-wtitle', '<b></b><small></small>'));
        head.lastChild.firstChild.appendChild(document.createTextNode(cur.title));
        head.lastChild.lastChild.appendChild(document.createTextNode(cur.ch + ' · ' + cur.dur));
        body.appendChild(head);
        var ph = E('div', 'vs-player');
        body.appendChild(ph);
        var v = cur;
        pl = Player(ph, { title: v.title, frames: v.frames, frameMs: cfg.frameMs,
          onControl: function (name) { fire('control', { name: name, video: v }); },
          onEnd: function () { watched[v.id] = 1; fire('end', { video: v }); } });
        return;
      }
      if (!hits) { body.appendChild(E('div', 'vs-empty', 'Gõ từ khoá vào ô tìm kiếm ở trên rồi nhấn <b>Enter</b>.')); return; }
      var list = shown();
      if (!list.length) { body.appendChild(E('div', 'vs-empty', hits.length ? 'Không có video nào trong mục này.' : 'Không tìm thấy video nào. Em thử từ khoá khác nha.')); return; }
      var grid = E('div', 'vs-grid');
      for (var i = 0; i < list.length; i++) (function (v) {
        var card = E('button', 'vs-card');
        card.innerHTML = thumb(v) + '<span class="vs-t"></span><span class="vs-ch"></span>';
        card.querySelector('.vs-t').appendChild(document.createTextNode(v.title));
        card.querySelector('.vs-ch').appendChild(document.createTextNode(v.ch + (watched[v.id] ? ' · đã xem' : '')));
        Core.on(card, function () { api.open(v.id); });
        grid.appendChild(card);
      })(list[i]);
      body.appendChild(grid);
    }
    var api = {
      search: search, filter: filter,
      open: function (id) { for (var i = 0; i < vids.length; i++) if (vids[i].id === id) cur = vids[i]; if (cur) { fire('open', { video: cur }); render(); } },
      back: function () { if (pl) pl.pause(); cur = null; render(); },
      player: function () { return pl; },
      current: function () { return cur; }
    };
    renderChips();
    render();
    return api;
  };

  /* helpers to draw simple step pictures (160 × 90) */
  VidSite.pic = function (inner, bg) { return '<svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="90" fill="' + (bg || '#f1f3f5') + '"/>' + inner + '</svg>'; };
})();
