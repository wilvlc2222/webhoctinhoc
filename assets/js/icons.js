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
})();
