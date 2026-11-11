/* Drawn "videos" for Bài 8B / 9B (paper folding and recycled crafts). Narration is our own wording.
   CraftVideos.list: array for VidSite. ES5 only. Needs vidsite.js. */
(function () {
  var pic = function (s, bg) { return VidSite.pic(s, bg); };
  var B = 'fill="#74c0fc" stroke="#1864ab" stroke-width="2" stroke-linejoin="round"';
  var G = 'fill="#8ce99a" stroke="#2b8a3e" stroke-width="2" stroke-linejoin="round"';
  var Y = 'fill="#ffe066" stroke="#e67700" stroke-width="2" stroke-linejoin="round"';
  var dash = 'stroke="#495057" stroke-width="1.5" stroke-dasharray="4 3" fill="none"';
  var CRANE = '<polygon points="34,58 66,54 80,22 94,54 128,58 94,62 80,70 66,62" ' + B + '/><path d="M34 58l-8-12" stroke="#1864ab" stroke-width="3"/>';
  var FROG = '<ellipse cx="80" cy="55" rx="34" ry="22" ' + G + '/><circle cx="66" cy="34" r="8" ' + G + '/><circle cx="94" cy="34" r="8" ' + G + '/><circle cx="66" cy="34" r="3" fill="#000"/><circle cx="94" cy="34" r="3" fill="#000"/><path d="M50 72l-10 8M110 72l10 8" stroke="#2b8a3e" stroke-width="4"/>';
  var PLANE = '<polygon points="20,50 140,40 20,30 50,40" ' + Y + '/><path d="M50 40L140 40" stroke="#e67700" stroke-width="2"/>';
  var ROBOT = '<rect x="62" y="12" width="36" height="26" ' + B + '/><circle cx="72" cy="25" r="4" fill="#1864ab"/><circle cx="88" cy="25" r="4" fill="#1864ab"/><rect x="56" y="40" width="48" height="34" ' + B + '/><rect x="44" y="42" width="10" height="26" ' + B + '/><rect x="106" y="42" width="10" height="26" ' + B + '/>';
  var BOAT = '<polygon points="30,50 130,50 112,72 48,72" ' + Y + '/><polygon points="80,14 80,50 108,50" fill="#fff" stroke="#e67700" stroke-width="2"/><path d="M0 76q20-6 40 0t40 0 40 0 40 0V90H0z" fill="#74c0fc"/>';
  var BOX = '<rect x="58" y="30" width="44" height="46" rx="4" fill="#ffd8a8" stroke="#e8590c" stroke-width="2"/><path d="M58 40h44M58 66h44" stroke="#e03131" stroke-width="4"/><path d="M66 30l-4-18M78 30l2-20M90 30l6-16" stroke="#1c7ed6" stroke-width="4" stroke-linecap="round"/>';
  var BOTTLE = '<rect x="68" y="12" width="24" height="10" fill="#a5d8ff" stroke="#1864ab" stroke-width="2"/><path d="M64 22h32l6 12v44H58V34z" fill="#d0ebff" stroke="#1864ab" stroke-width="2"/>';
  var POT = '<path d="M54 44h52l-6 32H60z" fill="#ffc9c9" stroke="#c92a2a" stroke-width="2"/><path d="M80 44V24M80 30q-14-10-20 0q10 8 20 0M80 30q14-12 22-2q-10 8-22 2" fill="#8ce99a" stroke="#2b8a3e" stroke-width="2"/>';
  var BIN = '<path d="M60 30h40l-4 46H64z" fill="#b2f2bb" stroke="#2b8a3e" stroke-width="2"/><rect x="56" y="24" width="48" height="8" rx="3" fill="#69db7c" stroke="#2b8a3e" stroke-width="2"/>';
  var FRAME = '<rect x="46" y="14" width="68" height="62" fill="#ffd8a8" stroke="#a5673f" stroke-width="3"/><rect x="58" y="26" width="44" height="38" fill="#fff" stroke="#a5673f" stroke-width="2"/><circle cx="72" cy="40" r="5" fill="#fab005"/><path d="M60 62l14-12 10 8 8-6 10 10z" fill="#69db7c"/>';
  function F(art, text, bg) { return { art: pic(art, bg), text: text }; }

  var crane = [
    F('<rect x="50" y="15" width="60" height="60" ' + B + '/>', 'Chuẩn bị một tờ giấy hình vuông.'),
    F('<rect x="50" y="15" width="60" height="60" ' + B + '/><path d="M50 15L110 75M110 15L50 75" ' + dash + '/>', 'Gấp theo hai đường chéo rồi mở ra, để có các nếp gấp.'),
    F('<polygon points="80,12 108,45 80,78 52,45" ' + B + '/>', 'Gấp gọn lại thành một hình vuông nhỏ (đế vuông).'),
    F('<polygon points="80,8 98,48 80,82 62,48" ' + B + '/><path d="M80 8V82" ' + dash + '/>', 'Gấp hai cạnh vào đường giữa thành hình con diều, làm cả hai mặt. Bước này hơi khó, em xem lại nhiều lần nha.'),
    F('<polygon points="62,62 80,48 98,62 80,74" ' + B + '/><path d="M66 62L44 26M94 62L116 26" stroke="#1864ab" stroke-width="4"/>', 'Gấp ngược hai chân nhọn lên làm cổ và đuôi.'),
    F(CRANE, 'Gấp một đầu nhỏ xuống làm mỏ, kéo nhẹ hai cánh ra. Con hạc giấy đã xong!')
  ];
  function simple(first, last, mid, doneText, firstText, midText) {
    return [F(first, firstText || 'Chuẩn bị giấy và dụng cụ.'), F(mid, midText || 'Gấp theo các nếp như trong video, miết thật phẳng.'), F(last, doneText)];
  }
  var paper = '<rect x="50" y="15" width="60" height="60" ' + G + '/>';
  var paperY = '<rect x="35" y="20" width="90" height="56" ' + Y + '/>';
  var paperB = '<rect x="50" y="15" width="60" height="60" ' + B + '/>';

  window.CraftVideos = {
    list: [
      { id: 'crane', title: 'Hướng dẫn gấp hạc giấy đơn giản', ch: 'Kênh Thủ công Vui', dur: '9:45', keys: ['gap hac giay', 'hac giay', 'con hac', 'gap giay origami', 'origami', 'gap giay'], thumb: pic(CRANE, '#e7f5ff'), frames: crane },
      { id: 'crane-s', title: 'Gấp hạc giấy trong 30 giây', ch: 'Bé Khéo Tay', dur: '0:30', short: true, keys: ['gap hac giay', 'hac giay', 'origami'], thumb: pic(CRANE, '#fff0f6'), frames: [crane[0], crane[5]] },
      { id: 'frog', title: 'Gấp con ếch biết nhảy', ch: 'Kênh Thủ công Vui', dur: '7:12', keys: ['gap con ech', 'con ech', 'ech giay', 'gap giay', 'origami', 'gap giay origami'], thumb: pic(FROG, '#ebfbee'),
        frames: simple(paper, FROG, '<polygon points="50,20 110,20 80,70" ' + G + '/>', 'Ấn nhẹ vào lưng, chú ếch sẽ bật nhảy!', 'Chuẩn bị một tờ giấy vuông màu xanh lá.', 'Gấp đôi thành hình tam giác, rồi gấp hai chân trước, hai chân sau.') },
      { id: 'plane', title: 'Gấp máy bay giấy bay thật xa', ch: 'Bé Khéo Tay', dur: '6:05', keys: ['may bay giay', 'gap may bay', 'may bay', 'gap giay', 'origami'], thumb: pic(PLANE, '#fff9db'),
        frames: simple(paperY, PLANE, '<polygon points="35,20 125,20 125,76 35,76" ' + Y + '/><path d="M80 20V76M35 20L80 48L125 20" ' + dash + '/>', 'Cầm phần thân, phóng nhẹ: máy bay lượn thật xa!', 'Chuẩn bị một tờ giấy hình chữ nhật.', 'Gấp đôi theo chiều dọc, gấp hai góc trên vào giữa, rồi gấp cánh.') },
      { id: 'robot', title: 'Cách gấp rô-bốt origami', ch: 'Góc Origami', dur: '11:20', keys: ['ro bot origami', 'gap ro bot', 'ro bot', 'robot', 'origami'], thumb: pic(ROBOT, '#e7f5ff'),
        frames: simple(paperB, ROBOT, '<rect x="62" y="12" width="36" height="26" ' + B + '/><rect x="56" y="40" width="48" height="34" ' + B + '/>', 'Vẽ thêm mắt, mũi: chú rô-bốt giấy chào em!', 'Chuẩn bị hai tờ giấy vuông màu xanh.', 'Gấp đầu rô-bốt và thân rô-bốt, rồi ghép lại.') },
      { id: 'boat', title: 'Paper Boat Origami Tutorial', ch: 'Origami World', dur: '5:48', keys: ['paper boat', 'thuyen giay', 'gap thuyen', 'con thuyen', 'origami'], thumb: pic(BOAT, '#e3fafc'),
        frames: simple(paperY, BOAT, '<polygon points="35,70 80,20 125,70" ' + Y + '/>', 'Mở rộng thân thuyền ra. Thuyền giấy nổi trên nước được đó!', 'Chuẩn bị một tờ giấy hình chữ nhật.', 'Gấp đôi, gấp hai góc thành hình mũ, rồi kéo hai bên ra.') },
      { id: 'box', title: 'Cách làm hộp đựng bút từ chai nhựa', ch: 'Tái Chế Xanh', dur: '8:30', keys: ['hop dung but', 'hop but', 'lam hop but', 'chai nhua', 'tai che', 'vat lieu tai che', 'do dung thu cong'], thumb: pic(BOX, '#fff4e6'),
        frames: [F(BOTTLE, 'Chuẩn bị một chai nhựa đã dùng, rửa sạch, lau khô.'), F(BOTTLE + '<path d="M54 48h52" stroke="#e03131" stroke-width="3" stroke-dasharray="5 3"/>', 'Nhờ người lớn cắt ngang chai, giữ lại phần đáy.'),
          F('<rect x="58" y="30" width="44" height="46" rx="4" fill="#d0ebff" stroke="#1864ab" stroke-width="2"/><path d="M58 40h44" stroke="#e03131" stroke-width="4"/>', 'Dán giấy màu, ruy băng quanh thân chai để trang trí.'),
          F(BOX, 'Cắm bút vào. Hộp đựng bút xinh xắn đã xong, lại giảm được rác thải nhựa!')] },
      { id: 'pot', title: 'Làm chậu cây mini từ vỏ hộp sữa', ch: 'Tái Chế Xanh', dur: '6:40', keys: ['chau cay', 'tai che', 'vat lieu tai che', 'do dung thu cong', 'hop sua'], thumb: pic(POT, '#fff5f5'),
        frames: [F('<rect x="62" y="16" width="36" height="60" fill="#fff" stroke="#495057" stroke-width="2"/>', 'Chuẩn bị vỏ hộp sữa đã rửa sạch.'), F('<path d="M54 44h52l-6 32H60z" fill="#ffc9c9" stroke="#c92a2a" stroke-width="2"/>', 'Cắt bỏ phần trên, dán giấy màu quanh hộp.'), F(POT, 'Cho đất vào, trồng một cây nhỏ. Chậu cây mini đã xong!')] },
      { id: 'bin', title: 'Thùng rác mini để bàn từ bìa cũ', ch: 'Bé Khéo Tay', dur: '5:15', keys: ['thung rac', 'tai che', 'vat lieu tai che', 'do dung thu cong', 'bia cu'], thumb: pic(BIN, '#ebfbee'),
        frames: [F('<rect x="40" y="20" width="80" height="56" fill="#e9ecef" stroke="#868e96" stroke-width="2"/>', 'Chuẩn bị bìa các-tông cũ.'), F(BIN, 'Cuộn, dán thành thùng nhỏ, trang trí. Dùng để đựng giấy vụn trên bàn học.')] },
      { id: 'frame', title: 'Khung ảnh từ bìa cũ và ống hút', ch: 'Tái Chế Xanh', dur: '7:50', keys: ['khung anh', 'lam khung anh', 'tai che', 'vat lieu tai che', 'ong hut', 'bia cu'], thumb: pic(FRAME, '#fff4e6'),
        frames: [F('<rect x="40" y="20" width="80" height="56" fill="#e9ecef" stroke="#868e96" stroke-width="2"/><path d="M30 80h100" stroke="#f783ac" stroke-width="5"/>', 'Chuẩn bị bìa cũ, ống hút và keo dán.'), F('<rect x="46" y="14" width="68" height="62" fill="#ffd8a8" stroke="#a5673f" stroke-width="3"/><rect x="58" y="26" width="44" height="38" fill="#fff"/>', 'Cắt bìa thành khung, dán ống hút quanh viền.'), F(FRAME, 'Gắn ảnh em thích vào giữa. Khung ảnh xinh đã xong!')] },
      { id: 'shorts-fun', title: 'Mẹo gấp giấy siêu nhanh', ch: 'Bé Khéo Tay', dur: '0:45', short: true, keys: ['gap giay', 'origami', 'tai che', 'do dung thu cong', 'gap giay origami'], thumb: pic(PLANE, '#f3f0ff'), frames: [F(paperY, 'Gấp nhanh trong vài giây...'), F(PLANE, 'Xong! (Video ngắn nên không hướng dẫn kĩ.)')] }
    ]
  };
})();
