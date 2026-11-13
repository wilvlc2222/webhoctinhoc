/* Test tool: plays the boss challenge of every topic to the end, by itself.
   Use: open any page of the site at 1280x720, then in the console
     var s = document.createElement('script'); s.src = 'tools/bossplay.js?g=4'; document.body.appendChild(s);
   and read window.__boss when window.__done is true.
   Each topic runs in a frame as the learner "__thu" (names starting with "__" are never sent to the sheet).
   It loses on purpose to learn the answers (a wrong pick no longer shows the right one, so it tries the
   options in turn and fails if the right one is revealed), then wins twice (first win gives gems, second must not).
   localStorage is put back as it was at the end. Not loaded by any page of the site. */
window.__boss = {}; window.__done = false;
(async function () {
  var grade = (/[?&]g=(\d)/.exec((document.currentScript || {}).src || '') || [0, 4])[1];
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var snap = {}, i, k;
  for (i = 0; i < localStorage.length; i++) { k = localStorage.key(i); snap[k] = localStorage.getItem(k); }
  localStorage.setItem('whth-profiles', JSON.stringify({ list: ['__thu'], current: '__thu', codes: { '__thu': '1234' } }));
  var R = window.__boss;
  try {
    for (var t = 1; t <= 6; t++) {
      var r = R[t] = { games: 0, wins: 0, losses: 0, qs: 0, err: [], maxMain: 0, maxDoc: 0, cls: {}, htmlQs: [], res: [] };
      var f = document.createElement('iframe');
      f.style.cssText = 'position:fixed;left:0;top:0;width:1280px;height:720px;border:0;z-index:9999;background:#fff';
      f.src = 'thuthach.html?g=' + grade + '&t=' + t;
      document.body.appendChild(f);
      await new Promise(function (x) { f.onload = x; });
      var d = function () { return f.contentDocument; }, w = 0;
      /* game.js stays quiet inside a frame and does not call Core.onGameReady, so start the page by hand */
      while (!(f.contentWindow.Core && f.contentWindow.Core.topicLessons) && w++ < 50) await sleep(200);
      if (f.contentWindow.Core && f.contentWindow.Core.onGameReady) f.contentWindow.Core.onGameReady();
      w = 0;
      while (!d().getElementById('boss-go') && w++ < 50) await sleep(200);
      if (!d().getElementById('boss-go')) { r.err.push('no start: ' + f.contentWindow.location.href); f.remove(); continue; }
      d().getElementById('boss-go').click();
      w = 0;
      while (!d().querySelector('.quiz-opt') && w++ < 400) await sleep(200);
      r.loadSec = Math.round(w * 0.2);
      if (!d().querySelector('.quiz-opt')) { r.err.push('no q: ' + d().getElementById('boss-main').textContent.slice(0, 80)); f.remove(); continue; }
      r.hp = d().getElementById('boss-hp-n').textContent;
      var known = {}, bad = {}, seen = {}, guard = 0;
      var meas = function (doc, key) {
        var m = doc.querySelector('main'), a = m.scrollHeight - m.clientHeight, b = doc.documentElement.scrollHeight;
        if (a > r.maxMain) { r.maxMain = a; r.overQ = key.slice(0, 60); }
        if (b > r.maxDoc) r.maxDoc = b;
      };
      while (guard++ < 3000) {
        var doc = d(), opts = [].slice.call(doc.querySelectorAll('.quiz-opt'));
        if (opts.length) {
          var key = doc.querySelector('.boss-q').textContent.trim();
          if (!seen[key]) {
            seen[key] = 1; r.qs++;
            var els = doc.querySelectorAll('.boss-q [class], .quiz-opt span:not(.opt-letter) [class]');
            if (els.length) {
              r.htmlQs.push(key.slice(0, 50));
              [].forEach.call(els, function (e) {
                var c = e.tagName.toLowerCase() + '.' + String(e.className.baseVal !== undefined ? e.className.baseVal : e.className);
                r.cls[c] = (r.cls[c] || 0) + 1;
              });
            }
          }
          var texts = opts.map(function (o) { return o.lastElementChild.textContent.trim(); });
          var tried = bad[key] || (bad[key] = []);
          var idx = known[key] != null ? texts.indexOf(known[key]) : texts.findIndex(function (s) { return tried.indexOf(s) < 0; });
          if (idx < 0) { r.err.push('known answer missing: ' + key.slice(0, 50)); idx = 0; }
          meas(doc, key);
          opts[idx].click();
          var right = doc.querySelector('.quiz-opt.is-right'), wrong = doc.querySelector('.quiz-opt.is-wrong');
          if (!right && !wrong) { r.err.push('no is-right/is-wrong: ' + key.slice(0, 50)); break; }
          if (right && wrong) r.err.push('answer revealed after wrong pick: ' + key.slice(0, 50));
          if (right) known[key] = right.lastElementChild.textContent.trim(); else tried.push(texts[idx]);
          if (!doc.getElementById('boss-fb').textContent.trim()) r.err.push('no feedback: ' + key.slice(0, 50));
          meas(doc, key);
          var nx = doc.querySelector('.boss-next');
          if (!nx) { r.err.push('no next'); break; }
          nx.click();
        } else {
          var h = doc.querySelector('.boss-card h2');
          if (!h) { r.err.push('blank screen'); break; }
          r.games++;
          var lead = (doc.querySelector('.boss-lead') || {}).textContent || '';
          var sc = (/(\d+\/\d+) điểm/.exec(lead) || [])[1];
          if (/thắng Bọ Lỗi/.test(h.textContent)) {
            r.wins++; r.res.push('W' + sc + (doc.querySelector('.boss-reward') ? '+gem' : ''));
            if (r.wins >= 2) break;
          } else if (/Bọ Lỗi thắng/.test(h.textContent)) {
            r.losses++; if (r.losses <= 2) r.res.push('L' + sc);
          } else { r.err.push('odd: ' + h.textContent); break; }
          doc.getElementById('boss-again').click();
        }
      }
      r.won = f.contentWindow.Core.gems.bossWon(grade, t);
      f.remove();
    }
  } catch (e) { R.fatal = String((e && e.stack) || e).slice(0, 300); }
  localStorage.clear();
  for (k in snap) localStorage.setItem(k, snap[k]);
  window.__done = true;
})();
