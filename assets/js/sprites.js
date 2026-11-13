/* Costumes and backdrops for the mini Scratch (scratch.js). All drawn for this site.
   Sprites face RIGHT (direction 90) in a 64x64 box; backdrops are 480x360. */
(function () {
  function S(body) { return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>'; }
  function B(body) { return '<svg viewBox="0 0 480 360" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>'; }
  var cat = function (tail) {
    return S('<path d="M10 40q' + (tail ? '-8 -10 -4 -22' : '-10 -4 -8 -18') + '" stroke="#e8890c" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="28" cy="42" rx="18" ry="12" fill="#ffa94d" stroke="#a65e00" stroke-width="2"/>' +
      '<circle cx="46" cy="28" r="12" fill="#ffa94d" stroke="#a65e00" stroke-width="2"/>' +
      '<path d="M38 20l2-10 6 7M50 17l6-6 0 10" fill="#ffa94d" stroke="#a65e00" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="44" cy="26" r="2" fill="#222"/><circle cx="52" cy="26" r="2" fill="#222"/><path d="M47 32q2 2 4 0" stroke="#222" stroke-width="1.5" fill="none"/>' +
      '<path d="M20 52v6M34 52v6" stroke="#a65e00" stroke-width="4" stroke-linecap="round"/>');
  };
  var dog = function (leg) {
    return S('<ellipse cx="28" cy="40" rx="18" ry="11" fill="#c9a27a" stroke="#6b4423" stroke-width="2"/>' +
      '<path d="M10 36q-6-6-2-12" stroke="#6b4423" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<circle cx="46" cy="28" r="11" fill="#c9a27a" stroke="#6b4423" stroke-width="2"/><ellipse cx="57" cy="31" rx="6" ry="4" fill="#c9a27a" stroke="#6b4423" stroke-width="2"/>' +
      '<circle cx="62" cy="30" r="2" fill="#222"/><path d="M40 20q-6 2-6 14" stroke="#6b4423" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<circle cx="48" cy="25" r="2" fill="#222"/>' +
      '<path d="M' + (leg ? '16 50l-3 8M38 50l3 8' : '18 50v8M36 50v8') + '" stroke="#6b4423" stroke-width="4" stroke-linecap="round"/>');
  };
  var fish = function (t) {
    return S('<path d="M14 32l-10 ' + (t ? '-12' : '-8') + 'v' + (t ? '24' : '16') + 'z" fill="#f76707" stroke="#a63c00" stroke-width="2" stroke-linejoin="round"/>' +
      '<ellipse cx="34" cy="32" rx="22" ry="14" fill="#ff922b" stroke="#a63c00" stroke-width="2"/>' +
      '<circle cx="46" cy="28" r="3" fill="#fff"/><circle cx="47" cy="28" r="1.5" fill="#222"/><path d="M30 22q4 10 0 20" stroke="#a63c00" stroke-width="2" fill="none"/>');
  };
  var bfly = function (open) {
    var w = open ? 16 : 8;
    return S('<ellipse cx="' + (32 - w) + '" cy="22" rx="' + w + '" ry="14" fill="#cc5de8" stroke="#862e9c" stroke-width="2"/><ellipse cx="' + (32 + w) + '" cy="22" rx="' + w + '" ry="14" fill="#cc5de8" stroke="#862e9c" stroke-width="2"/>' +
      '<ellipse cx="' + (32 - w * 0.8) + '" cy="42" rx="' + (w * 0.8) + '" ry="10" fill="#f783ac" stroke="#862e9c" stroke-width="2"/><ellipse cx="' + (32 + w * 0.8) + '" cy="42" rx="' + (w * 0.8) + '" ry="10" fill="#f783ac" stroke="#862e9c" stroke-width="2"/>' +
      '<rect x="30" y="16" width="4" height="34" rx="2" fill="#343a40"/><path d="M32 16l-6-8M32 16l6-8" stroke="#343a40" stroke-width="2"/>');
  };
  var bug = S('<ellipse cx="30" cy="32" rx="20" ry="17" fill="#e03131" stroke="#7a1c1c" stroke-width="2"/><path d="M30 15v34" stroke="#7a1c1c" stroke-width="2"/>' +
    '<circle cx="52" cy="32" r="8" fill="#343a40"/><circle cx="22" cy="24" r="4" fill="#212529"/><circle cx="38" cy="24" r="4" fill="#212529"/><circle cx="22" cy="40" r="4" fill="#212529"/><circle cx="38" cy="40" r="4" fill="#212529"/>' +
    '<path d="M56 26l6-6M56 38l6 6" stroke="#343a40" stroke-width="2"/>');
  var robot = S('<rect x="14" y="16" width="36" height="30" rx="8" fill="#4dabf7" stroke="#1864ab" stroke-width="2"/><circle cx="26" cy="30" r="4" fill="#fff"/><circle cx="40" cy="30" r="4" fill="#fff"/><circle cx="27" cy="30" r="2" fill="#222"/><circle cx="41" cy="30" r="2" fill="#222"/><path d="M50 30h8" stroke="#1864ab" stroke-width="3"/><circle cx="59" cy="30" r="3" fill="#fa5252"/><rect x="20" y="48" width="8" height="8" rx="2" fill="#1864ab"/><rect x="36" y="48" width="8" height="8" rx="2" fill="#1864ab"/>');
  var bird = function (up) {
    return S('<ellipse cx="30" cy="36" rx="16" ry="11" fill="#74c0fc" stroke="#1864ab" stroke-width="2"/><circle cx="46" cy="28" r="8" fill="#74c0fc" stroke="#1864ab" stroke-width="2"/><path d="M53 28l8 2-8 3z" fill="#fab005"/><circle cx="48" cy="26" r="1.8" fill="#222"/>' +
      (up ? '<path d="M26 32l-6-18 14 14z" fill="#4dabf7" stroke="#1864ab" stroke-width="2"/>' : '<path d="M26 38l-8 14 14-10z" fill="#4dabf7" stroke="#1864ab" stroke-width="2"/>'));
  };
  var ball = S('<circle cx="32" cy="32" r="22" fill="#fff" stroke="#212529" stroke-width="3"/><polygon points="32,22 41,29 38,40 26,40 23,29" fill="#212529"/>');
  var star = S('<polygon points="32,6 39,24 58,24 43,36 49,56 32,44 15,56 21,36 6,24 25,24" fill="#ffd43b" stroke="#e67700" stroke-width="2"/>');
  var apple = S('<circle cx="32" cy="36" r="18" fill="#e03131" stroke="#7a1c1c" stroke-width="2"/><path d="M32 18q2-8 8-10" stroke="#2b8a3e" stroke-width="3" fill="none"/>');

  var SPRITES = {
    meo: { name: 'Mèo', costumes: [cat(0), cat(1)], r: 26 },
    cho: { name: 'Chó', costumes: [dog(0), dog(1)], r: 26, sound: 'gau' },
    ca: { name: 'Cá', costumes: [fish(0), fish(1)], r: 22 },
    ca2: { name: 'Cá vàng', costumes: [fish(1).replace(/#ff922b/g, '#ffd43b').replace(/#f76707/g, '#fab005'), fish(0).replace(/#ff922b/g, '#ffd43b').replace(/#f76707/g, '#fab005')], r: 22 },
    buom: { name: 'Bướm', costumes: [bfly(1), bfly(0)], r: 22 },
    bodua: { name: 'Bọ dừa', costumes: [bug], r: 22 },
    robot: { name: 'Rô-bốt', costumes: [robot], r: 24 },
    chim: { name: 'Chim', costumes: [bird(1), bird(0)], r: 22 },
    bong: { name: 'Trái banh', costumes: [ball], r: 20 },
    sao: { name: 'Ngôi sao', costumes: [star], r: 22 },
    tao: { name: 'Trái táo', costumes: [apple], r: 18 }
  };
  var BACKDROPS = {
    trang: { name: 'Trắng', svg: B('<rect width="480" height="360" fill="#fff"/>') },
    vuon: { name: 'Khu vườn', svg: B('<rect width="480" height="360" fill="#d3f9d8"/><rect y="250" width="480" height="110" fill="#69db7c"/><circle cx="420" cy="60" r="34" fill="#ffd43b"/>' +
      '<path d="M40 250v-60M120 250v-40M380 250v-70" stroke="#7a5230" stroke-width="10"/><circle cx="40" cy="180" r="34" fill="#2f9e44"/><circle cx="120" cy="200" r="26" fill="#2f9e44"/><circle cx="380" cy="170" r="38" fill="#2f9e44"/>' +
      '<circle cx="220" cy="300" r="8" fill="#f06595"/><circle cx="260" cy="320" r="8" fill="#fcc419"/><circle cx="300" cy="296" r="8" fill="#f06595"/>') },
    be: { name: 'Bể cá', svg: B('<rect width="480" height="360" fill="#a5d8ff"/><rect y="310" width="480" height="50" fill="#f1d9a7"/><path d="M60 310q-10-60 10-120M80 310q20-50 0-110M400 310q-14-70 6-130" stroke="#2f9e44" stroke-width="8" fill="none"/>' +
      '<circle cx="200" cy="120" r="8" fill="none" stroke="#fff" stroke-width="3"/><circle cx="214" cy="90" r="5" fill="none" stroke="#fff" stroke-width="3"/>') },
    troi: { name: 'Bầu trời', svg: B('<rect width="480" height="360" fill="#e7f5ff"/><circle cx="90" cy="80" r="26" fill="#fff"/><circle cx="120" cy="74" r="32" fill="#fff"/><circle cx="150" cy="84" r="24" fill="#fff"/><circle cx="360" cy="140" r="20" fill="#fff"/><circle cx="386" cy="134" r="26" fill="#fff"/><rect y="320" width="480" height="40" fill="#8ce99a"/>') },
    lop: { name: 'Lớp học', svg: B('<rect width="480" height="360" fill="#fff4e6"/><rect x="90" y="40" width="300" height="150" rx="6" fill="#2b8a3e" stroke="#7a5230" stroke-width="10"/><rect y="290" width="480" height="70" fill="#e8d5b7"/>') },
    san: { name: 'Sân trường', svg: B('<rect width="480" height="360" fill="#fff9db"/><rect y="230" width="480" height="130" fill="#e9ecef"/><rect x="40" y="60" width="200" height="150" fill="#ffe8cc" stroke="#a0611a" stroke-width="4"/><path d="M30 64l110-44 110 44z" fill="#e8590c"/><path d="M380 230v-150" stroke="#495057" stroke-width="5"/><path d="M380 80h50v30h-50z" fill="#e03131"/>') }
  };
  window.ScratchArt = { sprites: SPRITES, backdrops: BACKDROPS };
})();
