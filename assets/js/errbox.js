/* Old readers (Kindle) have no console: show script errors on the page, so a photo of the screen tells us what broke.
   Loaded first on every page. The box only appears when something went wrong. Written in ES5. */
(function () {
  var log = [];
  function show() {
    if (!document.body) return;
    var b = document.getElementById('err-box');
    if (!b) {
      b = document.createElement('pre');
      b.id = 'err-box';
      b.style.cssText = 'margin:8px;padding:8px;border:2px solid #000;background:#fff;color:#000;font:12px/1.4 monospace;white-space:pre-wrap;word-break:break-all';
      document.body.insertBefore(b, document.body.firstChild);
    }
    b.innerHTML = '';
    b.appendChild(document.createTextNode('Trang gặp lỗi. Em chụp màn hình này gửi thầy cô nhé.\n' + log.join('\n') + '\n' + window.innerWidth + 'x' + window.innerHeight + ' | ' + navigator.userAgent));
  }
  window.__err = function (m) { log.push(m); show(); };
  window.onerror = function (msg, src, line, col) { window.__err(msg + ' @ ' + String(src || '').replace(/^.*\//, '') + ':' + line + ':' + (col || 0)); };
  /* for <script src="..." onerror="__miss(this)"> */
  window.__miss = function (el) { window.__err('không tải được ' + el.getAttribute('src')); };
  document.addEventListener('DOMContentLoaded', function () {
    if (log.length) show();
    /* core.js that stopped half way leaves no error on some readers: check that it finished */
    setTimeout(function () {
      var c = window.Core || {}, w = document.getElementById('who-box');
      if (typeof c.renderStars !== 'function' || typeof c.initSteps !== 'function' || (w && !w.innerHTML)) {
        window.__err('trang chưa khởi động xong (Core: ' + typeof window.Core + ', renderStars: ' + typeof c.renderStars + ')');
      }
    }, 3000);
  });
})();
