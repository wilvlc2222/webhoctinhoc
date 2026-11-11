/* Sends each learner's name, 4-digit code and stars to the teacher's Google
   Sheet, and gets them back on another device. Loaded by core.js on every page.
   ES5. Server side: tools/sheet-sync.gs, setup: tools/HUONG-DAN-GOOGLE-SHEET.md.

   Only the name, the code and the stars are sent. Nothing else. */
(function () {
  var Core = window.Core;
  if (!Core) return;

  /* ↓↓↓ Dán địa chỉ "Web app URL" của Google Apps Script vào giữa hai dấu nháy. Để trống = không gửi gì. ↓↓↓ */
  var SYNC_URL = 'https://script.google.com/macros/s/AKfycbytlzWMZWuKJsIL-CJPx0Ms64FBnAB5Qj93yBMKGDppSDxlVpF2nEYaIgOdulckEhoxBg/exec';
  /* ↑↑↑ */

  var DIRTY_KEY = 'whth-sync-dirty';
  var url = SYNC_URL;
  try { url = url || localStorage.getItem('whth-sync-url') || ''; } catch (e) {}   /* test hook */
  url = String(url).replace(/\s+/g, '');

  function readDirty() { try { return JSON.parse(localStorage.getItem(DIRTY_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function setDirty(name, on) {
    var d = readDirty();
    if (on) d[name] = 1; else delete d[name];
    try { localStorage.setItem(DIRTY_KEY, JSON.stringify(d)); } catch (e) {}
    paint();
  }
  function skip(name) { return !url || !name || name.indexOf('__') === 0; }

  function post(data, cb) {
    var x;
    try {
      x = new XMLHttpRequest();
      x.open('POST', url, true);
      /* text/plain keeps this a "simple" request, which Apps Script accepts from any site */
      x.setRequestHeader('Content-Type', 'text/plain;charset=utf-8');
      x.timeout = 20000;
      x.onreadystatechange = function () {
        if (x.readyState !== 4) return;
        var res = null;
        try { res = JSON.parse(x.responseText); } catch (e) {}
        cb(res && res.ok ? null : 'failed', res);
      };
      x.send(JSON.stringify(data));
    } catch (e) { cb('failed', null); }
  }

  var busy = {}, state = '';
  /* send this learner's stars; the server answers with the stars from all devices, which are added here */
  function push(name, cb) {
    if (skip(name) || !Core.hasProfile(name)) { if (cb) cb('off'); return; }
    if (busy[name]) { setDirty(name, true); if (cb) cb('busy'); return; }
    busy[name] = true; state = 'sending'; paint();
    post({ action: 'save', name: name, code: Core.codeOf(name), progress: Core.exportProgress(name) }, function (err, res) {
      busy[name] = false;
      if (err) { state = 'failed'; setDirty(name, true); if (cb) cb(err); return; }
      state = 'saved';
      var before = JSON.stringify(Core.exportProgress(name));
      Core.importProgress(name, res.progress);
      if (JSON.stringify(Core.exportProgress(name)) !== before) { Core.renderStars(); if (Core.refreshBip) Core.refreshBip(); }
      setDirty(name, false);
      if (cb) cb(null);
    });
  }
  var timer = null;
  function soon(name, ms) {
    if (skip(name)) return;
    setDirty(name, true);
    clearTimeout(timer);
    timer = setTimeout(function () { push(name); }, ms);
  }

  /* a learner who studied on another device: get the stars back with name + code */
  function restore(name, code, cb) {
    name = Core.cleanName(name); code = String(code || '').replace(/\D/g, '');
    if (!url) return cb('off');
    if (!name || code.length !== 4) return cb('bad');
    post({ action: 'load', name: name, code: code }, function (err, res) {
      if (err) return cb('failed');
      if (!res.found) return cb('notfound');
      Core.restoreProfile(name, code, res.progress);
      setDirty(name, false);
      cb(null);
    });
  }

  /* small status line on the home page: <span data-sync-state> */
  function paint() {
    var els = document.querySelectorAll('[data-sync-state]'), name = Core.currentName();
    if (!els.length) return;
    var text = '';
    if (!skip(name)) {
      text = state === 'sending' ? 'Đang lưu kết quả lên mạng...' :
        readDirty()[name] ? 'Chưa lưu được lên mạng. Máy sẽ tự thử lại.' : 'Kết quả đã lưu lên mạng.';
    }
    for (var i = 0; i < els.length; i++) els[i].innerHTML = text;
  }

  Core.sync = { on: !!url, push: push, restore: restore, paint: paint, soon: function (name) { soon(name, 2500); }, stats: function (cb) { if (!url) return cb('off'); post({ action: 'stats' }, cb); },
    /* any other request to the sheet script (the teacher page uses this); cb(err, answer) */
    call: function (data, cb) { if (!url) return cb('off', null); post(data, cb); } };
  if (!url) return;

  /* a new star → send a little later (several stars in a row go as one message) */
  var award = Core.award;
  Core.award = function (lessonId, activityId) {
    var isNew = award(lessonId, activityId);
    if (isNew) soon(Core.currentName(), 2500);
    return isNew;
  };
  /* a new learner, or a learner coming back → send / fetch right away, so the teacher sees who joined */
  ['addProfile', 'useProfile'].forEach(function (k) {
    var f = Core[k];
    Core[k] = function () {
      var r = f.apply(Core, arguments), name = Core.currentName();
      if (name) soon(name, 300);
      paint();
      return r;
    };
  });
  /* leaving the page with stars not sent yet */
  window.addEventListener('pagehide', function () {
    var name = Core.currentName();
    if (skip(name) || !readDirty()[name] || !navigator.sendBeacon) return;
    try {
      navigator.sendBeacon(url, new Blob([JSON.stringify({ action: 'save', name: name, code: Core.codeOf(name), progress: Core.exportProgress(name) })], { type: 'text/plain;charset=utf-8' }));
    } catch (e) {}
  });
  function start() {
    var name = Core.currentName();
    /* on every page: send what is still waiting; on the home page also fetch stars earned on other devices */
    if (!skip(name) && (readDirty()[name] || document.getElementById('lessons'))) push(name);
    /* controls that only make sense with a server (home page: "Em đã có mã số") */
    var only = document.querySelectorAll('[data-sync-only]');
    for (var i = 0; i < only.length; i++) only[i].style.display = '';
    paint();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
