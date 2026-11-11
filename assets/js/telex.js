/* A small Vietnamese input method (Telex and VNI), like Unikey, for text boxes in the lessons.
   Telex.attach(textarea, { mode: function () { return 'telex' | 'vni' | 'off'; } })
   Telex.convert('Uoongs nuwowcs', 'telex') -> 'Uống nước'
   Tone marks follow the "new" style used in the textbooks (hoà, khoẻ, thuỷ).  ES5 only. */
(function () {
  var BASES = 'aăâeêioôơuưy';
  var TONED = [
    'aáàảãạ', 'ăắằẳẵặ', 'âấầẩẫậ', 'eéèẻẽẹ', 'êếềểễệ', 'iíìỉĩị',
    'oóòỏõọ', 'ôốồổỗộ', 'ơớờởỡợ', 'uúùủũụ', 'ưứừửữự', 'yýỳỷỹỵ'
  ];
  /* plain vowel + mark -> letter */
  var MARK = { a: { circ: 'â', breve: 'ă' }, e: { circ: 'ê' }, o: { circ: 'ô', horn: 'ơ' }, u: { horn: 'ư' } };
  var PLAIN = { 'ă': ['a', 'breve'], 'â': ['a', 'circ'], 'ê': ['e', 'circ'], 'ô': ['o', 'circ'], 'ơ': ['o', 'horn'], 'ư': ['u', 'horn'] };

  /* letter -> { b: plain base, m: mark, t: tone 0..5, up: uppercase, v: isVowel } */
  function split(ch) {
    var lc = ch.toLowerCase(), up = ch !== lc;
    if (lc === 'đ') return { b: 'd', m: 'stroke', t: 0, up: up, v: false };
    for (var i = 0; i < TONED.length; i++) {
      var k = TONED[i].indexOf(lc);
      if (k >= 0) {
        var base = TONED[i].charAt(0);
        var p = PLAIN[base];
        return { b: p ? p[0] : base, m: p ? p[1] : '', t: k, up: up, v: true };
      }
    }
    return { b: lc, m: '', t: 0, up: up, v: false };
  }
  function join(L) {
    var ch;
    if (L.b === 'd' && L.m === 'stroke') ch = 'đ';
    else if (L.v) {
      var base = L.m ? (MARK[L.b] && MARK[L.b][L.m]) || L.b : L.b;
      ch = TONED[BASES.indexOf(base)].charAt(L.t);
    } else ch = L.b;
    return L.up ? ch.toUpperCase() : ch;
  }
  function isV(c) { return 'aeiouy'.indexOf(c) >= 0; }
  function toLetters(word) {
    var out = [];
    for (var i = 0; i < word.length; i++) {
      var L = split(word.charAt(i));
      L.v = isV(L.b);
      out.push(L);
    }
    return out;
  }
  function toneOf(Ls) { for (var i = 0; i < Ls.length; i++) if (Ls[i].v && Ls[i].t) return Ls[i].t; return 0; }
  function clearTone(Ls) { for (var i = 0; i < Ls.length; i++) Ls[i].t = 0; }

  /* where the tone goes (new style) */
  function tonePos(Ls) {
    var s = 0, e, i;
    /* vowel cluster: first run of vowels */
    while (s < Ls.length && !Ls[s].v) s++;
    if (s >= Ls.length) return -1;
    e = s;
    while (e + 1 < Ls.length && Ls[e + 1].v) e++;
    /* "qu" and "gi": the u / i belongs to the consonant */
    if (s > 0 && e > s) {
      var prev = Ls[s - 1].b, first = Ls[s].b;
      if ((prev === 'q' && first === 'u') || (prev === 'g' && first === 'i')) s++;
    }
    var hasEnd = e + 1 < Ls.length;
    /* a vowel with a mark wins; "ươ" -> on ơ */
    for (i = e; i >= s; i--) if (Ls[i].m) return (Ls[i].b === 'u' && i < e && Ls[i + 1].m) ? i + 1 : i;
    var n = e - s + 1;
    if (n === 1) return s;
    var pair = Ls[s].b + Ls[s + 1].b;
    if (n === 2 && (pair === 'oa' || pair === 'oe' || pair === 'uy')) return s + 1;
    if (hasEnd) return e;
    if (n === 3) return s + 1;
    return s;
  }
  function setTone(Ls, t) {
    clearTone(Ls);
    var p = tonePos(Ls);
    if (p >= 0) Ls[p].t = t;
  }
  function str(Ls) { var s = ''; for (var i = 0; i < Ls.length; i++) s += join(Ls[i]); return s; }

  var TELEX_TONE = { s: 1, f: 2, r: 3, x: 4, j: 5 };
  var VNI_TONE = { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 };

  /* apply one key to the word typed so far; returns the new word */
  function applyKey(word, key, mode) {
    var Ls = toLetters(word), k = key.toLowerCase(), up = key !== k, t = toneOf(Ls), i;
    var hasVowel = false;
    for (i = 0; i < Ls.length; i++) if (Ls[i].v) hasVowel = true;
    var toneKey = mode === 'vni' ? VNI_TONE[k] : TELEX_TONE[k];
    if (toneKey && hasVowel) {
      if (t === toneKey) { clearTone(Ls); return str(Ls) + key; }
      setTone(Ls, toneKey); return str(Ls);
    }
    if (((mode === 'telex' && k === 'z') || (mode === 'vni' && k === '0')) && t) { clearTone(Ls); return str(Ls); }
    /* put mark m on the last vowel whose base is in `bases` */
    function mark(m, bases) {
      for (var j = Ls.length - 1; j >= 0; j--) {
        if (!Ls[j].v || bases.indexOf(Ls[j].b) < 0 || !MARK[Ls[j].b] || !MARK[Ls[j].b][m]) continue;
        if (Ls[j].m === m) {
          Ls[j].m = '';
          if (m === 'horn' && Ls[j].b === 'o' && j > 0 && Ls[j - 1].b === 'u') Ls[j - 1].m = '';
          return 'undo';
        }
        /* "uo" + horn -> "ươ" */
        if (m === 'horn' && Ls[j].b === 'o' && j > 0 && Ls[j - 1].b === 'u' && !Ls[j - 1].m) Ls[j - 1].m = 'horn';
        Ls[j].m = m;
        return 'ok';
      }
      return '';
    }
    function lastVowel() { for (var j = Ls.length - 1; j >= 0; j--) if (Ls[j].v) return Ls[j]; return null; }
    var r = '';
    if (mode === 'telex') {
      if ((k === 'a' || k === 'e' || k === 'o') && Ls.length && Ls[Ls.length - 1].b === k && Ls[Ls.length - 1].v) {
        var last = Ls[Ls.length - 1];
        if (last.m === 'circ') { last.m = ''; if (t) setTone(Ls, t); return str(Ls) + key; }
        if (!last.m) { last.m = 'circ'; if (t) setTone(Ls, t); return str(Ls); }
      }
      /* "a...a", "e...e", "o...o" with a final consonant: toan + o? no; tieng: tiee -> tiê handled above; "tieng" + e -> "tiêng" */
      if ((k === 'a' || k === 'e' || k === 'o') && hasVowel) {
        var lv = lastVowel();
        if (lv && lv.b === k && !lv.m && Ls[Ls.length - 1] !== lv) { lv.m = 'circ'; if (t) setTone(Ls, t); return str(Ls); }
      }
      if (k === 'w') {
        var lw = lastVowel();
        r = lw && lw.b === 'a' ? mark('breve', 'a') : '';
        if (!r) r = mark('horn', 'ou');
        if (!r) r = mark('breve', 'a');
        if (r === 'ok') { if (t) setTone(Ls, t); return str(Ls); }
        if (r === 'undo') { if (t) setTone(Ls, t); return str(Ls) + key; }
        if (!hasVowel) return word + (up ? 'Ư' : 'ư');
      }
      if (k === 'd' && Ls.length && Ls[Ls.length - 1].b === 'd') {
        var d = Ls[Ls.length - 1];
        if (d.m === 'stroke') { d.m = ''; return str(Ls) + key; }
        d.m = 'stroke'; return str(Ls);
      }
    } else if (mode === 'vni') {
      if (k === '6') { r = mark('circ', 'aeo'); }
      else if (k === '7') { r = mark('horn', 'ou'); }
      else if (k === '8') { r = mark('breve', 'a'); }
      else if (k === '9') {
        for (i = 0; i < Ls.length; i++) if (Ls[i].b === 'd') { Ls[i].m = Ls[i].m === 'stroke' ? '' : 'stroke'; return str(Ls); }
      }
      if (r === 'ok') { if (t) setTone(Ls, t); return str(Ls); }
      if (r === 'undo') { if (t) setTone(Ls, t); return str(Ls) + key; }
    }
    /* ordinary letter: append, and keep the tone on the right vowel */
    var out = toLetters(word + key);
    if (t) setTone(out, t);
    return str(out);
  }

  function convert(text, mode) {
    var out = '', word = '';
    for (var i = 0; i < text.length; i++) {
      var c = text.charAt(i);
      if (/[A-Za-z0-9À-ỹ]/.test(c)) word = word ? applyKey(word, c, mode) : (mode === 'telex' && (c === 'w' || c === 'W') ? (c === 'w' ? 'ư' : 'Ư') : c);
      else { out += word + c; word = ''; }
    }
    return out + word;
  }

  /* attach to a textarea / input: convert the word being typed */
  function attach(el, opts) {
    var prev = el.value;
    el.setAttribute('autocomplete', 'off');
    el.setAttribute('autocorrect', 'off');
    el.setAttribute('autocapitalize', 'off');
    el.setAttribute('spellcheck', 'false');
    el.addEventListener('input', function () {
      var mode = opts && opts.mode ? opts.mode() : 'telex';
      var v = el.value, pos = el.selectionStart;
      if (mode !== 'off' && v.length === prev.length + 1 && pos > 0 && v.slice(0, pos - 1) + v.slice(pos) === prev) {
        var key = v.charAt(pos - 1);
        if (/[A-Za-z0-9]/.test(key)) {
          var start = pos - 1;
          while (start > 0 && /[A-Za-z0-9À-ỹ]/.test(v.charAt(start - 1))) start--;
          var word = v.slice(start, pos - 1);
          var rep = word ? applyKey(word, key, mode) : (mode === 'telex' && /w/i.test(key) ? (key === 'w' ? 'ư' : 'Ư') : key);
          el.value = v.slice(0, start) + rep + v.slice(pos);
          var np = start + rep.length;
          try { el.setSelectionRange(np, np); } catch (e) {}
        }
      }
      prev = el.value;
      if (opts && opts.onChange) opts.onChange(el.value);
    }, false);
    el._telexSync = function () { prev = el.value; };
  }

  window.Telex = { convert: convert, applyKey: applyKey, attach: attach };

  /* A Unikey-like switch: [V] Vietnamese (Telex/VNI) / [E] English.
     Telex.switcher(host) returns a function giving the current mode. */
  Telex.switcher = function (host, startMode) {
    var mode = startMode || 'telex';
    var wrap = Core.el('div', 'ime');
    var opts = [['telex', 'V · Telex'], ['vni', 'V · VNI'], ['off', 'E · Tiếng Anh']];
    var btns = [];
    for (var i = 0; i < opts.length; i++) {
      (function (o) {
        var b = Core.el('button', 'btn btn-small ime-btn', o[1]);
        b.setAttribute('aria-pressed', o[0] === mode ? 'true' : 'false');
        Core.on(b, function () {
          mode = o[0];
          for (var j = 0; j < btns.length; j++) btns[j].setAttribute('aria-pressed', btns[j] === b ? 'true' : 'false');
        });
        btns.push(b);
        wrap.appendChild(b);
      })(opts[i]);
    }
    host.appendChild(wrap);
    return function () { return mode; };
  };
})();
