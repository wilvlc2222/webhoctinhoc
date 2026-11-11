/* Inline SVG icons. Drawn with currentColor so they stay readable in grayscale (e-ink).
   Emoji are avoided: the Kindle browser may not have an emoji font. */
(function () {
  function svg(body) {
    return '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" ' +
      'stroke-linecap="round" stroke-linejoin="round" focusable="false">' + body + '</svg>';
  }
  /* a "software" tile: an app window with a symbol inside */
  function app(inner) {
    return svg('<rect x="6" y="8" width="52" height="48" rx="8"/><path d="M6 20h52"/>' +
      '<circle cx="13" cy="14" r="1.5" fill="currentColor"/><circle cx="19" cy="14" r="1.5" fill="currentColor"/>' + inner);
  }

  window.Icons = {
    /* hardware */
    keyboard: svg('<rect x="4" y="18" width="56" height="28" rx="4"/>' +
      '<path d="M11 26h2M19 26h2M27 26h2M35 26h2M43 26h2M51 26h2M11 32h2M19 32h2M27 32h2M35 32h2M43 32h2M51 32h2M18 39h28"/>'),
    mouse: svg('<rect x="18" y="8" width="28" height="48" rx="14"/><path d="M32 8v16M18 24h28"/>'),
    monitor: svg('<rect x="6" y="8" width="52" height="34" rx="3"/><path d="M26 42l-3 10M38 42l3 10M18 54h28"/>'),
    tower: svg('<rect x="18" y="4" width="28" height="56" rx="3"/><path d="M24 12h16M24 18h16"/>' +
      '<circle cx="32" cy="44" r="4"/>'),
    printer: svg('<path d="M18 22V8h28v14"/><rect x="6" y="22" width="52" height="22" rx="4"/>' +
      '<rect x="18" y="36" width="28" height="20"/><path d="M24 44h16M24 50h10"/><circle cx="49" cy="30" r="2" fill="currentColor"/>'),
    speaker: svg('<rect x="16" y="4" width="32" height="56" rx="4"/><circle cx="32" cy="40" r="10"/>' +
      '<circle cx="32" cy="40" r="3" fill="currentColor"/><circle cx="32" cy="16" r="5"/>'),
    harddisk: svg('<rect x="8" y="14" width="48" height="36" rx="4"/><circle cx="28" cy="32" r="11"/>' +
      '<circle cx="28" cy="32" r="2" fill="currentColor"/><path d="M28 32l20 10M48 20v2"/>'),
    phone: svg('<rect x="18" y="4" width="28" height="56" rx="5"/><path d="M28 52h8"/><rect x="22" y="11" width="20" height="35" rx="1"/>'),
    lens: svg('<rect x="18" y="4" width="28" height="56" rx="5"/><circle cx="28" cy="14" r="5"/>' +
      '<circle cx="28" cy="14" r="1.5" fill="currentColor"/><circle cx="38" cy="14" r="1.5" fill="currentColor"/>'),
    webcam: svg('<circle cx="32" cy="26" r="18"/><circle cx="32" cy="26" r="7"/><path d="M22 52h20M32 44v8"/>'),
    headset: svg('<path d="M12 38v-6a20 20 0 0 1 40 0v6"/><rect x="8" y="36" width="10" height="16" rx="3"/>' +
      '<rect x="46" y="36" width="10" height="16" rx="3"/><path d="M50 52c0 5-6 7-12 7"/>'),

    /* software */
    game: app('<path d="M20 38h10M25 33v10"/><circle cx="40" cy="36" r="2.5" fill="currentColor"/><circle cx="46" cy="42" r="2.5" fill="currentColor"/>'),
    slides: app('<rect x="16" y="27" width="32" height="20" rx="2"/><path d="M22 33h20M22 39h12"/>'),
    dictionary: app('<path d="M18 46V28c6-3 10-3 14 0 4-3 8-3 14 0v18c-6-3-10-3-14 0-4-3-8-3-14 0zM32 28v18"/>'),
    video: app('<path d="M27 28v18l15-9z" fill="currentColor"/>'),
    typing: app('<rect x="14" y="30" width="36" height="16" rx="2"/><path d="M19 36h2M25 36h2M31 36h2M37 36h2M43 36h2M22 41h20"/>'),
    camera: app('<rect x="16" y="30" width="32" height="18" rx="3"/><circle cx="32" cy="39" r="6"/><path d="M26 30l3-4h6l3 4"/>'),
    meet: app('<circle cx="24" cy="34" r="5"/><path d="M15 48c1-5 5-7 9-7s8 2 9 7"/><rect x="36" y="30" width="14" height="10" rx="2"/>'),

    /* UI */
    check: svg('<path d="M12 34l13 13 27-30" stroke-width="7"/>'),
    cross: svg('<path d="M16 16l32 32M48 16L16 48" stroke-width="7"/>'),
    star: svg('<path d="M32 5l8 17 18 2-13 13 4 19-17-9-17 9 4-19L6 24l18-2z" fill="currentColor"/>'),
    starEmpty: svg('<path d="M32 5l8 17 18 2-13 13 4 19-17-9-17 9 4-19L6 24l18-2z"/>'),
    flag: svg('<path d="M14 58V6"/><path d="M14 8h34l-8 10 8 10H14" fill="currentColor"/>'),
    rock: svg('<path d="M8 50l8-22 14-10 16 6 10 26z" fill="currentColor" stroke-width="2"/>'),
    home: svg('<path d="M8 30L32 8l24 22M14 26v30h36V26"/><rect x="26" y="38" width="12" height="18"/>'),
    play: svg('<path d="M18 10v44l36-22z" fill="currentColor"/>'),
    reset: svg('<path d="M14 32a18 18 0 1 0 6-13"/><path d="M12 8v13h13"/>'),
    trash: svg('<path d="M10 16h44M24 16V9h16v7M15 16l3 40h28l3-40M27 26v22M37 26v22"/>'),
    plus: svg('<path d="M32 10v44M10 32h44" stroke-width="6"/>'),
    minus: svg('<path d="M10 32h44" stroke-width="6"/>'),
    power: svg('<path d="M32 6v24"/><path d="M18 16a20 20 0 1 0 28 0"/>'),
    windows: svg('<path d="M8 12l20-3v21H8zM32 8l24-4v26H32zM8 34h20v21L8 52zM32 34h24v26l-24-4z" fill="currentColor" stroke-width="1"/>'),

    /* mascot "Bíp" – an original robot character, facing up (rotated by CSS) */
    robot: svg('<rect x="14" y="18" width="36" height="32" rx="8" fill="#fff"/>' +
      '<path d="M32 18V8"/><circle cx="32" cy="6" r="3" fill="currentColor"/>' +
      '<circle cx="24" cy="32" r="4" fill="currentColor"/><circle cx="40" cy="32" r="4" fill="currentColor"/>' +
      '<path d="M25 42h14"/><path d="M8 30v10M56 30v10"/>'),
    arrowUp: svg('<path d="M32 8v48M14 26L32 8l18 18" stroke-width="6"/>'),
    turnLeft: svg('<path d="M46 54V30a10 10 0 0 0-10-10H14"/><path d="M24 8L12 20l12 12" stroke-width="5"/>'),
    turnRight: svg('<path d="M18 54V30a10 10 0 0 1 10-10h22"/><path d="M40 8l12 12-12 12" stroke-width="5"/>'),
    loop: svg('<path d="M48 22a18 18 0 1 0 4 14"/><path d="M52 8v14H38" stroke-width="5"/>')
  };

  var I = window.Icons;
  /* mouse pointers (what the cursor looks like over a page) */
  I.cursorArrow = svg('<path d="M16 6v44l11-11 8 18 7-3-8-18h16z" fill="#fff" stroke-width="3.5"/>');
  I.cursorHand = svg('<path d="M24 34V10a4 4 0 0 1 8 0v18M32 26a4 4 0 0 1 8 0v4M40 28a4 4 0 0 1 8 0v4M48 32a4 4 0 0 1 8 0v8c0 10-6 18-16 18h-4c-6 0-9-3-12-7l-9-12a4 4 0 0 1 6-5l5 5" fill="#fff" stroke-width="3.5"/>');
  I.cursorText = svg('<path d="M24 8h16M24 56h16M32 8v48M26 30h12" stroke-width="4"/>');
  I.zoom = svg('<circle cx="26" cy="26" r="16"/><path d="M38 38l16 16M26 18v16M18 26h16" stroke-width="4"/>');
  /* kinds of information */
  I.text = svg('<rect x="12" y="6" width="40" height="52" rx="4"/><path d="M20 18h24M20 26h24M20 34h24M20 42h14"/>');
  I.image = svg('<rect x="6" y="10" width="52" height="44" rx="4"/><circle cx="22" cy="24" r="5"/><path d="M6 46l16-14 12 10 8-6 16 12"/>');
  I.audio = svg('<path d="M24 46V14l28-6v32"/><circle cx="18" cy="46" r="7"/><circle cx="46" cy="40" r="7"/>');
  I.link = svg('<path d="M28 36a10 10 0 0 0 14 0l8-8a10 10 0 0 0-14-14l-4 4"/><path d="M36 28a10 10 0 0 0-14 0l-8 8a10 10 0 0 0 14 14l4-4"/>');
  I.globe = svg('<circle cx="32" cy="32" r="24"/><path d="M8 32h48M32 8c-8 8-8 40 0 48M32 8c8 8 8 40 0 48"/>');
  I.search = svg('<circle cx="27" cy="27" r="16"/><path d="M39 39l15 15" stroke-width="5"/>');
  I.back = svg('<path d="M40 12L20 32l20 20" stroke-width="5"/>');
  I.forward = svg('<path d="M24 12l20 20-20 20" stroke-width="5"/>');
  /* files and folders */
  I.folder = svg('<path d="M6 16a4 4 0 0 1 4-4h14l6 6h24a4 4 0 0 1 4 4v26a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z"/>');
  I.folderOpen = svg('<path d="M6 48V16a4 4 0 0 1 4-4h14l6 6h20a4 4 0 0 1 4 4v6"/><path d="M6 48l8-20h46l-8 20z"/>');
  I.file = svg('<path d="M16 6h22l12 12v40H16z"/><path d="M38 6v12h12"/>');
  I.copy = svg('<rect x="20" y="18" width="32" height="38" rx="3"/><path d="M14 44V10a3 3 0 0 1 3-3h25"/>');
  I.cut = svg('<circle cx="18" cy="46" r="8"/><circle cx="46" cy="46" r="8"/><path d="M23 40L46 8M41 40L18 8"/>');
  I.paste = svg('<rect x="12" y="10" width="40" height="48" rx="4"/><rect x="22" y="5" width="20" height="10" rx="3"/><path d="M22 30h20M22 40h14"/>');
  I.rename = svg('<rect x="6" y="20" width="40" height="24" rx="3"/><path d="M52 14v36M46 14h12M46 50h12M14 32h18"/>');
  I.usb = svg('<rect x="22" y="4" width="20" height="16"/><path d="M27 10h2M35 10h2"/><rect x="16" y="20" width="32" height="38" rx="5"/>');
  I.lock = svg('<rect x="12" y="28" width="40" height="28" rx="4"/><path d="M20 28V20a12 12 0 0 1 24 0v8"/><circle cx="32" cy="42" r="3" fill="currentColor"/>');
  I.warning = svg('<path d="M32 6L60 54H4z"/><path d="M32 24v14" stroke-width="5"/><circle cx="32" cy="46" r="2" fill="currentColor"/>');
  I.people = svg('<circle cx="22" cy="20" r="8"/><circle cx="44" cy="22" r="7"/><path d="M6 54c0-10 7-18 16-18s16 8 16 18M36 54c0-8 4-14 10-14s12 6 12 14"/>');
  I.chat = svg('<path d="M8 12h48v30H26l-12 10V42H8z"/><path d="M18 24h28M18 32h18"/>');
  I.bulb = svg('<path d="M22 40a16 16 0 1 1 20 0v8H22z"/><path d="M24 54h16M28 60h8"/>');
  I.book = svg('<path d="M8 12c8-4 16-4 24 2v40c-8-6-16-6-24-2zM56 12c-8-4-16-4-24 2v40c8-6 16-6 24-2z"/>');
  I.pencil = svg('<path d="M44 8l12 12-32 32H12V40z"/><path d="M38 14l12 12"/>');
  I.brush = svg('<path d="M54 8L30 36"/><path d="M28 34c-6 0-12 4-12 12 0 4-4 6-8 8 12 2 26-2 26-14z"/>');
  I.shapes = svg('<circle cx="20" cy="20" r="12"/><rect x="34" y="34" width="22" height="22"/><path d="M44 8l12 20H32z"/>');
  I.cloud = svg('<path d="M18 48a12 12 0 0 1 0-24 16 16 0 0 1 30 4 10 10 0 0 1-2 20z"/>');
  I.download = svg('<path d="M32 8v32M20 28l12 12 12-12" stroke-width="4"/><path d="M10 46v8h44v-8"/>');
  I.gift = svg('<rect x="8" y="24" width="48" height="32" rx="3"/><path d="M4 24h56M32 24v32M32 24c-6-12-18-12-18-4 0 4 8 4 18 4zM32 24c6-12 18-12 18-4 0 4-8 4-18 4z"/>');
  I.eye = svg('<path d="M4 32c8-14 18-20 28-20s20 6 28 20c-8 14-18 20-28 20S12 46 4 32z"/><circle cx="32" cy="32" r="8"/>');
  I.clock = svg('<circle cx="32" cy="32" r="24"/><path d="M32 18v14l10 6"/>');
  I.heart = svg('<path d="M32 54S8 40 8 22a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 18-24 32-24 32z"/>');
  /* media player */
  I.pause = svg('<path d="M22 14v36M42 14v36" stroke-width="8"/>');
  I.stopSq = svg('<rect x="16" y="16" width="32" height="32" rx="3" fill="currentColor"/>');
  I.prevBar = svg('<path d="M18 14v36" stroke-width="5"/><path d="M48 14L24 32l24 18z" fill="currentColor"/>');
  I.nextBar = svg('<path d="M46 14v36" stroke-width="5"/><path d="M16 14l24 18-24 18z" fill="currentColor"/>');
  I.vol = svg('<path d="M10 26h10l14-12v36L20 38H10z" fill="currentColor"/><path d="M42 24a10 10 0 0 1 0 16M48 18a18 18 0 0 1 0 28"/>');
  I.volOff = svg('<path d="M10 26h10l14-12v36L20 38H10z" fill="currentColor"/><path d="M42 24l14 16M56 24L42 40"/>');
  I.fullscr = svg('<path d="M8 22V8h14M42 8h14v14M56 42v14H42M22 56H8V42" stroke-width="5"/>');
})();