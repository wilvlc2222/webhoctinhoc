/* Tin học vui – máy chủ kết quả chạy trên Google Sheet (Google Apps Script).
   Cách cài: xem tools/HUONG-DAN-GOOGLE-SHEET.md.

   The lesson pages send each learner's name, 4-digit code and stars here.
   One row per learner (name + code). Stars from several devices are merged,
   never removed, so a slow or old device cannot erase newer progress. */

var SHEET_NAME = 'HocSinh';
var FIXED = ['Tên', 'Mã số', 'Tổng sao', 'Sao lớp 4', 'Sao lớp 5', 'Bắt đầu học', 'Học gần nhất', 'Dữ liệu (không sửa)'];
var DATA_COL = 8;
var LESSONS = ['l4-b01', 'l4-b02', 'l4-b03', 'l4-b04', 'l4-b05', 'l4-b06', 'l4-b07', 'l4-b08', 'l4-b09', 'l4-b10', 'l4-b11',
  'l4-b12a', 'l4-b12b', 'l4-b13', 'l4-b14', 'l4-b15', 'l4-b16',
  'l5-b01', 'l5-b02', 'l5-b03', 'l5-b04', 'l5-b05', 'l5-b06', 'l5-b07', 'l5-b08a', 'l5-b09a', 'l5-b08b', 'l5-b09b',
  'l5-b10', 'l5-b11', 'l5-b12', 'l5-b13', 'l5-b14', 'l5-b15', 'l5-b16'];

function doGet() {
  return ContentService.createTextOutput('Tin học vui: máy chủ kết quả đang chạy.');
}

function doPost(e) {
  var out;
  try {
    out = handle(JSON.parse(e.postData.contents));
  } catch (err) {
    out = { ok: false, error: String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- pure helpers (no spreadsheet) ---------- */
function cleanName(name) {
  /* no leading = + - @ so a name can never become a spreadsheet formula */
  return String(name || '').replace(/\s+/g, ' ').replace(/^[\s=+\-@]+|\s+$/g, '').slice(0, 20);
}
function sanitize(progress) {
  var out = {}, nl = 0, l, a, na;
  if (!progress || typeof progress !== 'object') return out;
  for (l in progress) {
    if (!/^[a-z0-9-]{1,20}$/.test(l) || ++nl > 80 || !progress[l] || typeof progress[l] !== 'object') continue;
    na = 0;
    for (a in progress[l]) {
      if (!/^[A-Za-z0-9_-]{1,40}$/.test(a) || !progress[l][a] || ++na > 80) continue;
      out[l] = out[l] || {};
      out[l][a] = 1;
    }
  }
  return out;
}
function merge(a, b) {
  var out = {}, src = [a || {}, b || {}], i, l, k;
  for (i = 0; i < 2; i++) for (l in src[i]) for (k in src[i][l]) { out[l] = out[l] || {}; out[l][k] = 1; }
  return out;
}
function countStars(progress) {
  var c = { total: 0, g4: 0, g5: 0, lessons: {} }, l, k, n;
  for (l in progress) {
    n = 0;
    for (k in progress[l]) n++;
    c.lessons[l] = n;
    if (!/^l\d/.test(l)) continue;   /* "gems" (kim cương) and other extras are not stars */
    c.total += n;
    if (l.indexOf('l4-') === 0) c.g4 += n;
    if (l.indexOf('l5-') === 0) c.g5 += n;
  }
  return c;
}
function parse(text) {
  try { return sanitize(JSON.parse(text || '{}')); } catch (e) { return {}; }
}

/* ---------- spreadsheet ---------- */
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, FIXED.length + LESSONS.length).setValues([FIXED.concat(LESSONS)]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setFrozenColumns(2);
    sh.hideColumns(DATA_COL);
  }
  return sh;
}
function findRow(sh, name, code) {
  var last = sh.getLastRow();
  if (last < 2) return 0;
  var v = sh.getRange(2, 1, last - 1, 2).getValues();
  for (var i = 0; i < v.length; i++) if (String(v[i][0]) === name && String(v[i][1]) === code) return i + 2;
  return 0;
}

/* totals for the class goal on the home page: how many learners and how many stars, no names */
function stats() {
  var sh = getSheet(), last = sh.getLastRow(), stars = 0;
  if (last < 2) return { ok: true, learners: 0, stars: 0 };
  var v = sh.getRange(2, 3, last - 1, 1).getValues();
  for (var i = 0; i < v.length; i++) stars += Number(v[i][0]) || 0;
  return { ok: true, learners: last - 1, stars: stars };
}

/* ---------- teacher page (giaovien.html) ----------
   The teacher's password is typed by the teacher into cell B1 of the sheet "CaiDat".
   It is checked here, on Google's side, and is never part of the web page. */
var SETTINGS_NAME = 'CaiDat';
function teacherKey() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(SETTINGS_NAME);
  if (!sh) {
    sh = ss.insertSheet(SETTINGS_NAME);
    sh.getRange(1, 1, 1, 2).setValues([['Mật khẩu giáo viên (gõ vào ô B1 bên cạnh)', '']]);
    sh.setColumnWidth(1, 320);
  }
  return String(sh.getRange(1, 2).getValue() || '').replace(/^\s+|\s+$/g, '');
}
function list(req) {
  var key = teacherKey();
  if (!key) return { ok: false, error: 'no key set' };
  if (String(req.key || '') !== key) { Utilities.sleep(1500); return { ok: false, error: 'bad key' }; }   /* slow down guessing */
  var sh = getSheet(), last = sh.getLastRow(), cols = sh.getLastColumn(), rows = [];
  if (last >= 2) {
    var head = sh.getRange(1, 1, 1, cols).getValues()[0], v = sh.getRange(2, 1, last - 1, cols).getValues();
    for (var i = 0; i < v.length; i++) {
      var r = v[i], lessons = {};
      for (var c = FIXED.length; c < head.length; c++) if (r[c] !== '' && r[c] != null) lessons[head[c]] = Number(r[c]) || 0;
      rows.push({ name: String(r[0]), code: String(r[1]), total: Number(r[2]) || 0, started: r[5], last: r[6], lessons: lessons });
    }
  }
  return { ok: true, rows: rows };
}

function handle(req) {
  if (req.action === "stats") return stats();
  if (req.action === "list") return list(req);
  var name = cleanName(req.name), code = String(req.code || '');
  if (!name || !/^\d{4}$/.test(code)) return { ok: false, error: 'bad name or code' };
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = getSheet(), row = findRow(sh, name, code);
    if (req.action === 'load') {
      if (!row) return { ok: true, found: false };
      return { ok: true, found: true, progress: parse(sh.getRange(row, DATA_COL).getValue()) };
    }
    if (req.action !== 'save') return { ok: false, error: 'unknown action' };

    var merged = merge(row ? parse(sh.getRange(row, DATA_COL).getValue()) : {}, sanitize(req.progress));
    var c = countStars(merged), now = new Date();
    /* a lesson the sheet has no column for yet gets one at the end */
    var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0], l;
    for (l in c.lessons) if (head.indexOf(l) < 0) { head.push(l); sh.getRange(1, head.length).setValue(l).setFontWeight('bold'); }
    var started = row ? sh.getRange(row, 6).getValue() : now;
    var line = [name, code, c.total, c.g4, c.g5, started || now, now, JSON.stringify(merged)];
    for (var i = FIXED.length; i < head.length; i++) line.push(c.lessons[head[i]] || '');
    if (!row) row = sh.getLastRow() + 1;
    sh.getRange(row, 1, 1, line.length).setValues([line]);
    return { ok: true, progress: merged };
  } finally {
    lock.releaseLock();
  }
}
