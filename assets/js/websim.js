/* Pretend web browser with a pretend search engine, for the lessons about searching.
   Nothing goes to the real Internet: results come from the small DB below
   (facts written for children, in our own words).  ES5 only. Needs core.js + icons.js. */
(function () {
  var E = Core.el;

  var VN_FROM = 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ';
  var VN_TO = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd';
  function norm(s) {
    s = String(s || '').toLowerCase();
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i), k = VN_FROM.indexOf(c);
      out += k < 0 ? c : VN_TO.charAt(k);
    }
    return out.replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').replace(/^ | $/g, '');
  }
  Core.plain = norm;

  /* ---------- pictures ---------- */
  var ART = {
    lake: '<svg viewBox="0 0 160 90"><rect width="160" height="90" fill="#d0ebff"/><path d="M0 55h160v35H0z" fill="#4dabf7"/><rect x="72" y="30" width="16" height="26" fill="#e8d5b7" stroke="#7a5c3a" stroke-width="2"/><path d="M68 32l12-10 12 10z" fill="#c92a2a"/><path d="M20 58q20-8 40 0" stroke="#2f9e44" stroke-width="6" fill="none"/><circle cx="130" cy="20" r="9" fill="#ffd43b"/></svg>',
    temple: '<svg viewBox="0 0 160 90"><rect width="160" height="90" fill="#fff4e6"/><rect x="40" y="40" width="80" height="40" fill="#ffd8a8" stroke="#a0611a" stroke-width="2"/><path d="M30 42l50-24 50 24z" fill="#c92a2a"/><rect x="72" y="56" width="16" height="24" fill="#a0611a"/><path d="M0 80h160v10H0z" fill="#8ce99a"/></svg>',
    king: '<svg viewBox="0 0 160 90"><rect width="160" height="90" fill="#e6fcf5"/><path d="M20 80l40-50 30 30 20-20 30 40z" fill="#69db7c"/><rect x="66" y="44" width="28" height="22" fill="#ffe8cc" stroke="#a0611a" stroke-width="2"/><path d="M60 46l20-14 20 14z" fill="#c92a2a"/></svg>',
    museum: '<svg viewBox="0 0 160 90"><rect width="160" height="90" fill="#f3f0ff"/><path d="M30 36l50-22 50 22z" fill="#7048e8"/><rect x="34" y="36" width="92" height="8" fill="#9775fa"/><path d="M44 46v28M62 46v28M80 46v28M98 46v28M116 46v28" stroke="#5f3dc4" stroke-width="6"/><rect x="30" y="74" width="100" height="8" fill="#9775fa"/></svg>',
    air: '<svg viewBox="0 0 160 90"><rect width="160" height="90" fill="#e7f5ff"/><path d="M20 30h80a12 12 0 1 0-12-12M20 50h110a12 12 0 1 1-12 12M30 70h50" stroke="#339af0" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="130" cy="24" r="10" fill="#ffd43b"/></svg>',
    sea: '<svg viewBox="0 0 160 90"><rect width="160" height="90" fill="#e3fafc"/><path d="M0 60h160v30H0z" fill="#22b8cf"/><path d="M30 62q6-34 18 0M64 62q10-44 22 0M104 62q8-30 16 0" fill="#2b8a3e"/></svg>',
    town: '<svg viewBox="0 0 160 90"><rect width="160" height="90" fill="#fff9db"/><rect x="20" y="40" width="36" height="40" fill="#ffd43b" stroke="#a0611a" stroke-width="2"/><rect x="62" y="34" width="36" height="46" fill="#ffa94d" stroke="#a0611a" stroke-width="2"/><rect x="104" y="42" width="36" height="38" fill="#ffd43b" stroke="#a0611a" stroke-width="2"/><circle cx="80" cy="22" r="7" fill="#fa5252"/><circle cx="38" cy="30" r="6" fill="#fa5252"/><circle cx="122" cy="32" r="6" fill="#fa5252"/></svg>',
    hills: '<svg viewBox="0 0 160 90"><rect width="160" height="90" fill="#ebfbee"/><path d="M0 80l40-46 30 30 30-40 60 56z" fill="#40c057"/><path d="M0 84h160v6H0z" fill="#2b8a3e"/><circle cx="128" cy="20" r="9" fill="#ffd43b"/></svg>',
    market: '<svg viewBox="0 0 160 90"><rect width="160" height="90" fill="#f8f9fa"/><rect x="30" y="34" width="100" height="46" fill="#ffe066" stroke="#5c4b00" stroke-width="2"/><rect x="66" y="16" width="28" height="22" fill="#fff" stroke="#5c4b00" stroke-width="2"/><circle cx="80" cy="27" r="6" fill="none" stroke="#5c4b00" stroke-width="2"/><rect x="70" y="56" width="20" height="24" fill="#5c4b00"/></svg>',
    church: '<svg viewBox="0 0 160 90"><rect width="160" height="90" fill="#e7f5ff"/><rect x="50" y="44" width="60" height="38" fill="#e8590c" stroke="#862e05" stroke-width="2"/><rect x="40" y="24" width="18" height="58" fill="#e8590c" stroke="#862e05" stroke-width="2"/><rect x="102" y="24" width="18" height="58" fill="#e8590c" stroke="#862e05" stroke-width="2"/><path d="M38 26l11-18 11 18zM100 26l11-18 11 18z" fill="#868e96"/><path d="M70 82v-20a10 10 0 0 1 20 0v20z" fill="#862e05"/><circle cx="80" cy="52" r="5" fill="#fff4e6"/><path d="M0 82h160v8H0z" fill="#8ce99a"/></svg>',
    zoo: '<svg viewBox="0 0 160 90"><rect width="160" height="90" fill="#ebfbee"/><circle cx="28" cy="34" r="18" fill="#40c057"/><rect x="25" y="48" width="6" height="32" fill="#8d6e63"/><circle cx="134" cy="30" r="16" fill="#40c057"/><rect x="131" y="42" width="6" height="38" fill="#8d6e63"/><ellipse cx="80" cy="62" rx="26" ry="16" fill="#adb5bd"/><circle cx="56" cy="54" r="11" fill="#adb5bd"/><path d="M50 60q-4 14 4 20" stroke="#adb5bd" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M66 74v8M76 76v6M88 76v6M98 74v8" stroke="#868e96" stroke-width="6"/><circle cx="54" cy="51" r="2" fill="#212529"/><path d="M0 82h160v8H0z" fill="#2b8a3e"/></svg>',
    lantern: '<svg viewBox="0 0 160 90"><rect width="160" height="90" fill="#1c3d6e"/><circle cx="128" cy="22" r="11" fill="#fff3bf"/><path d="M60 14v14" stroke="#c4a484" stroke-width="3"/><polygon points="60,28 65,41 79,41 68,50 72,64 60,56 48,64 52,50 41,41 55,41" fill="#ffd43b" stroke="#e8590c" stroke-width="2"/></svg>'
  };
  function art(name) { return '<div class="pic">' + (ART[name] || ART.hills) + '</div>'; }

  /* ---------- the pretend Internet ---------- */
  function R(title, site, snip, body, pic, video) { return { title: title, site: site, snip: snip, body: body, pic: pic, video: !!video }; }
  var DB = [
    { keys: ['cac doi vua hung', 'vua hung', 'hung vuong', 'doi vua hung'], label: 'Các đời vua Hùng', results: [
      R('18 đời vua Hùng gồm những ai?', 'lichsu.vn', 'Theo truyền thuyết, nước Văn Lang do 18 đời vua Hùng nối tiếp nhau trị vì...',
        'Theo truyền thuyết, các vua Hùng là những vị vua đầu tiên của nước <b>Văn Lang</b>. Sử cũ kể lại có <b>18 đời vua Hùng</b> nối tiếp nhau. Người Việt gọi các vua Hùng là Tổ tiên của dân tộc.', 'king'),
      R('Đền Hùng và ngày Giỗ Tổ Hùng Vương', 'dulichviet.vn', 'Ngày 10 tháng 3 âm lịch hằng năm là ngày Giỗ Tổ Hùng Vương...',
        'Khu di tích <b>Đền Hùng</b> nằm trên núi Nghĩa Lĩnh, tỉnh Phú Thọ. Ngày <b>10 tháng 3 âm lịch</b> hằng năm là ngày Giỗ Tổ Hùng Vương, cả nước cùng tưởng nhớ các vua Hùng.', 'king'),
      R('Video: Câu chuyện các vua Hùng dựng nước', 'kenhthieunhi.vn', 'Phim hoạt hình kể chuyện các vua Hùng · 6 phút',
        'Đoạn phim hoạt hình kể lại thời các vua Hùng dựng nước Văn Lang, với những truyền thuyết như Thánh Gióng, Sơn Tinh – Thuỷ Tinh, bánh chưng bánh giầy.', 'king', true)
    ] },
    { keys: ['ho guom', 'ho hoan kiem', 'hoan kiem'], label: 'Hồ Gươm', results: [
      R('Hồ Gươm – viên ngọc giữa lòng Hà Nội', 'dulichhanoi.vn', 'Hồ Gươm hay hồ Hoàn Kiếm nằm ở trung tâm Thủ đô Hà Nội...',
        '<b>Hồ Gươm</b> (còn gọi là hồ Hoàn Kiếm) nằm ở trung tâm Thủ đô Hà Nội. Giữa hồ có <b>Tháp Rùa</b>. Bên bờ hồ có <b>đền Ngọc Sơn</b> với <b>cầu Thê Húc</b> sơn màu đỏ.', 'lake'),
      R('Truyền thuyết vua Lê Lợi trả gươm', 'truyenco.vn', 'Vì sao hồ có tên là Hoàn Kiếm (trả gươm)?...',
        'Truyền thuyết kể rằng sau khi đánh thắng giặc, vua <b>Lê Lợi</b> đi thuyền trên hồ thì Rùa Vàng nổi lên đòi lại thanh gươm thần. Vua trả gươm, từ đó hồ được gọi là <b>hồ Hoàn Kiếm</b>, nghĩa là "trả gươm".', 'lake'),
      R('Video: Một vòng quanh Hồ Gươm', 'kenhdulich.vn', 'Ngắm Tháp Rùa, đền Ngọc Sơn, cầu Thê Húc · 4 phút',
        'Đoạn phim đưa em đi dạo một vòng quanh Hồ Gươm: ngắm Tháp Rùa, đền Ngọc Sơn và cầu Thê Húc.', 'lake', true)
    ] },
    { keys: ['van mieu quoc tu giam', 'van mieu', 'quoc tu giam'], label: 'Văn Miếu – Quốc Tử Giám', results: [
      R('Văn Miếu – Quốc Tử Giám, trường đại học đầu tiên', 'disanvn.vn', 'Văn Miếu được xây năm 1070, Quốc Tử Giám năm 1076...',
        '<b>Văn Miếu</b> ở Hà Nội được xây năm <b>1070</b> dưới thời vua Lý Thánh Tông. Năm <b>1076</b>, <b>Quốc Tử Giám</b> được lập ngay bên cạnh, được xem là <b>trường đại học đầu tiên</b> của nước ta.', 'temple'),
      R('82 tấm bia tiến sĩ ở Văn Miếu', 'disanvn.vn', 'Những tấm bia đá ghi tên các vị tiến sĩ thời xưa...',
        'Trong Văn Miếu có <b>82 tấm bia đá</b> đặt trên lưng rùa đá, ghi tên những người đỗ tiến sĩ thời xưa. Các tấm bia nhắc chúng ta về truyền thống hiếu học.', 'temple'),
      R('Video: Tham quan Văn Miếu – Quốc Tử Giám', 'kenhdulich.vn', 'Đi qua cổng Văn Miếu, Khuê Văn Các, nhà bia · 5 phút',
        'Đoạn phim giới thiệu cổng Văn Miếu, gác <b>Khuê Văn Các</b> và khu nhà bia tiến sĩ.', 'temple', true)
    ] },
    { keys: ['bao tang dan toc hoc viet nam', 'bao tang dan toc hoc'], label: 'Bảo tàng Dân tộc học Việt Nam', results: [
      R('Bảo tàng Dân tộc học Việt Nam', 'baotang.vn', 'Nơi giới thiệu văn hoá của 54 dân tộc Việt Nam...',
        '<b>Bảo tàng Dân tộc học Việt Nam</b> ở Hà Nội giới thiệu đời sống, trang phục, đồ dùng của <b>54 dân tộc</b> Việt Nam. Ngoài trời có vườn với nhiều ngôi nhà truyền thống như nhà rông, nhà sàn.', 'museum'),
      R('Đi bảo tàng cùng con: những điều thú vị', 'giadinh.vn', 'Các bạn nhỏ có thể xem múa rối nước, vào nhà sàn...',
        'Ở bảo tàng, các bạn nhỏ được vào thăm nhà sàn, nhà rông, xem trang phục và đồ chơi dân gian của các dân tộc.', 'museum')
    ] },
    { keys: ['bao tang', 'bao tang viet nam'], label: 'Bảo tàng', results: [
      R('Các bảo tàng ở Việt Nam', 'baotang.vn', 'Có rất nhiều bảo tàng: lịch sử, mĩ thuật, dân tộc học...',
        'Nước ta có rất nhiều bảo tàng về lịch sử, mĩ thuật, quân đội, phụ nữ, dân tộc học... Từ khoá "bảo tàng" quá chung nên kết quả rất nhiều, khó tìm đúng bảo tàng em cần.', 'museum')
    ] },
    { keys: ['vai tro cua khong khi doi voi con nguoi', 'vai tro cua khong khi', 'khong khi'], label: 'Vai trò của không khí', results: [
      R('Vai trò của không khí đối với con người', 'khoahoc.vn', 'Con người cần không khí để thở...',
        'Con người cần <b>không khí</b> để thở. Trong không khí có <b>khí ô-xi</b> giúp cơ thể sống. Không có không khí, con người chỉ sống được vài phút. Vì vậy em cần giữ cho không khí trong lành.', 'air'),
      R('Vì sao phải giữ không khí trong lành?', 'moitruong.vn', 'Khói bụi làm không khí bị ô nhiễm...',
        'Khói xe, khói nhà máy, đốt rác làm không khí bị ô nhiễm, gây bệnh về đường hô hấp. Trồng cây xanh giúp không khí trong lành hơn.', 'air')
    ] },
    { keys: ['vinh ha long', 'ha long'], label: 'Vịnh Hạ Long', results: [
      R('Vịnh Hạ Long – kì quan thiên nhiên', 'dulichviet.vn', 'Vịnh Hạ Long ở tỉnh Quảng Ninh có gần hai nghìn hòn đảo...',
        '<b>Vịnh Hạ Long</b> ở tỉnh Quảng Ninh có gần <b>hai nghìn hòn đảo</b> đá vôi lớn nhỏ. Vịnh được UNESCO công nhận là <b>Di sản thiên nhiên thế giới</b>.', 'sea')
    ] },
    { keys: ['pho co hoi an', 'hoi an'], label: 'Phố cổ Hội An', results: [
      R('Phố cổ Hội An lung linh đèn lồng', 'dulichviet.vn', 'Hội An nổi tiếng với những ngôi nhà cổ và đèn lồng...',
        '<b>Phố cổ Hội An</b> ở miền Trung có nhiều ngôi nhà cổ mái ngói, chùa Cầu và những con phố treo <b>đèn lồng</b> nhiều màu. Hội An là Di sản văn hoá thế giới.', 'town')
    ] },
    { keys: ['co do hue', 'kinh thanh hue', 'hue'], label: 'Cố đô Huế', results: [
      R('Cố đô Huế bên dòng sông Hương', 'dulichviet.vn', 'Huế từng là kinh đô của nước ta thời nhà Nguyễn...',
        '<b>Huế</b> từng là kinh đô của nước ta thời nhà Nguyễn. Ở đây có Kinh thành, Đại Nội, chùa Thiên Mụ bên bờ <b>sông Hương</b>.', 'temple')
    ] },
    { keys: ['cho ben thanh', 'ben thanh'], label: 'Chợ Bến Thành', results: [
      R('Chợ Bến Thành – biểu tượng của Thành phố Hồ Chí Minh', 'dulichviet.vn', 'Ngôi chợ có tháp đồng hồ nổi tiếng...',
        '<b>Chợ Bến Thành</b> ở trung tâm Thành phố Hồ Chí Minh có cổng chính với <b>tháp đồng hồ</b>. Chợ bán rất nhiều món ăn và đồ thủ công.', 'market'),
      R('Chợ Bến Thành đã hơn 100 tuổi', 'sacmausaigon.vn', 'Chợ được xây xong năm 1914, có bốn cổng lớn...',
        'Ngôi chợ được xây xong năm <b>1914</b>, có <b>bốn cổng</b> lớn ở bốn phía. Tháp đồng hồ ở cổng nam đã thành hình ảnh quen thuộc của <b>Sài Gòn</b>.', 'market'),
      R('Video: Đi chợ Bến Thành buổi tối', 'kenhdulich.vn', 'Ghé chợ đêm, ngắm tháp đồng hồ lên đèn · 4 phút',
        'Đoạn phim đưa em dạo quanh <b>Chợ Bến Thành</b> lúc tối: tháp đồng hồ lên đèn, các gian hàng trái cây, bánh trái và đồ thủ công.', 'market', true)
    ] },
    { keys: ['nha tho duc ba', 'duc ba', 'nha tho lon'], label: 'Nhà thờ Đức Bà', results: [
      R('Nhà thờ Đức Bà – công trình gạch đỏ giữa Sài Gòn', 'sacmausaigon.vn', 'Nhà thờ được xây từ năm 1877 đến năm 1880...',
        '<b>Nhà thờ Đức Bà</b> ở Quận 1, Thành phố Hồ Chí Minh, được xây từ năm <b>1877</b> đến năm <b>1880</b>. Tường xây bằng <b>gạch đỏ</b> và có <b>hai tháp chuông</b> cao.', 'church'),
      R('Video: Ghé thăm Nhà thờ Đức Bà', 'kenhdulich.vn', 'Ngắm hai tháp chuông và công viên trước nhà thờ · 3 phút',
        'Đoạn phim giới thiệu hai tháp chuông, mặt tường gạch đỏ và công viên nhỏ trước <b>Nhà thờ Đức Bà</b>.', 'church', true)
    ] },
    { keys: ['thao cam vien', 'so thu sai gon', 'thao cam vien sai gon'], label: 'Thảo Cầm Viên', results: [
      R('Thảo Cầm Viên Sài Gòn', 'dulichviet.vn', 'Một trong những vườn thú lâu đời nhất thế giới...',
        '<b>Thảo Cầm Viên</b> ở Thành phố Hồ Chí Minh được lập năm <b>1864</b>. Ở đây có nhiều loài thú như voi, hươu cao cổ, hổ và rất nhiều cây cổ thụ.', 'zoo'),
      R('Video: Một ngày ở Thảo Cầm Viên', 'kenhdulich.vn', 'Gặp voi, hươu cao cổ, đi dạo dưới tán cây · 5 phút',
        'Đoạn phim đưa em đi thăm chuồng voi, hươu cao cổ và vườn cây xanh mát trong <b>Thảo Cầm Viên</b>.', 'zoo', true)
    ] },
    { keys: ['da lat', 'thanh pho da lat'], label: 'Đà Lạt', results: [
      R('Đà Lạt – thành phố ngàn hoa', 'dulichviet.vn', 'Đà Lạt có khí hậu mát mẻ quanh năm...',
        '<b>Đà Lạt</b> nằm trên cao nguyên Lâm Viên nên mát mẻ quanh năm. Thành phố có nhiều hoa, đồi thông và hồ Xuân Hương.', 'hills')
    ] },
    { keys: ['sa pa', 'sapa'], label: 'Sa Pa', results: [
      R('Sa Pa – thị trấn trong mây', 'dulichviet.vn', 'Sa Pa có ruộng bậc thang và đỉnh Phan-xi-păng...',
        '<b>Sa Pa</b> ở vùng núi phía Bắc, có những <b>ruộng bậc thang</b> đẹp và đỉnh <b>Phan-xi-păng</b>, nóc nhà của Đông Dương.', 'hills')
    ] },
    { keys: ['mui ca mau', 'ca mau'], label: 'Mũi Cà Mau', results: [
      R('Mũi Cà Mau – điểm cực Nam của Tổ quốc', 'dulichviet.vn', 'Nơi có cột mốc toạ độ quốc gia...',
        '<b>Mũi Cà Mau</b> là điểm cực Nam trên đất liền của nước ta, có rừng đước xanh và cột mốc toạ độ quốc gia.', 'sea')
    ] },
    { keys: ['tet trung thu', 'trung thu'], label: 'Tết Trung thu', results: [
      R('Tết Trung thu của thiếu nhi', 'thieunhi.vn', 'Rằm tháng Tám, các bạn nhỏ rước đèn, phá cỗ...',
        '<b>Tết Trung thu</b> vào ngày Rằm tháng Tám âm lịch. Các bạn nhỏ rước đèn ông sao, xem múa lân và phá cỗ với bánh nướng, bánh dẻo.', 'lantern')
    ] }
  ];
  /* extra topics can be added by a lesson: WebSim.add({ keys, label, results }) */
  var WebSim = { DB: DB, art: art, R: R, norm: norm };
  WebSim.add = function (topic) { DB.unshift(topic); };
  window.WebSim = WebSim;

  function find(q) {
    var n = norm(q);
    if (n.length < 2) return null;
    var best = null, bestScore = 0;
    for (var i = 0; i < DB.length; i++) {
      for (var k = 0; k < DB[i].keys.length; k++) {
        var key = DB[i].keys[k], score = 0;
        if (n === key) score = 1000;
        else if (n.indexOf(key) >= 0) score = 100 + key.length;
        else if (key.indexOf(n) >= 0 && n.length >= 3) score = 50 + n.length;
        if (score > bestScore) { bestScore = score; best = DB[i]; }
      }
    }
    return best;
  }
  function suggest(q) {
    var n = norm(q), out = [];
    if (n.length < 2) return out;
    for (var i = 0; i < DB.length && out.length < 4; i++) {
      for (var k = 0; k < DB[i].keys.length; k++) {
        if (DB[i].keys[k].indexOf(n) === 0 || (' ' + DB[i].keys[k]).indexOf(' ' + n) >= 0) { out.push(DB[i].label); break; }
      }
    }
    return out;
  }
  WebSim.find = find;

  /* WebSim.search(host, cfg)
     cfg.start: 'blank' (type the engine address first) or 'engine'
     cfg.height: page height in px
     cfg.task: { lesson, id, keys: [normalized keywords that count], text } star when a matching result page is opened
     cfg.onEvent(type, data): 'address' | 'search' (data: { q, topic }) | 'open' (data: { result, topic }) */
  WebSim.search = function (host, cfg) {
    cfg = cfg || {};
    var wrap = E('div', 'browser websim');
    var bar = E('div', 'br-bar');
    var backBtn = E('button', 'br-btn', Core.icon('back'));
    backBtn.setAttribute('aria-label', 'Quay lại');
    var addrForm = E('form', 'br-addr-form');
    var addr = E('input', 'br-addr');
    addr.setAttribute('aria-label', 'Thanh địa chỉ');
    addr.setAttribute('autocomplete', 'off');
    addr.setAttribute('autocapitalize', 'off');
    addrForm.appendChild(addr);
    bar.appendChild(backBtn);
    bar.appendChild(addrForm);
    var page = E('div', 'br-page');
    if (cfg.height) page.style.height = cfg.height + 'px';
    wrap.appendChild(bar);
    wrap.appendChild(page);
    host.appendChild(wrap);
    var engine = cfg.engine || 'timkiem.vn';
    var history = [], awarded = false;

    function emit(t, d) { if (cfg.onEvent) cfg.onEvent(t, d || {}); }
    function go(view, push) { if (push !== false) history.push(view); render(view); }
    Core.on(backBtn, function (ev) {
      ev.preventDefault();
      if (history.length > 1) { history.pop(); render(history[history.length - 1]); }
    });
    function submitAddr() {
      var a = norm(addr.value);
      if (/(timkiem|google|bing|ask|coccoc|yahoo)/.test(a)) { emit('address', { value: addr.value }); go({ v: 'engine' }); }
      else if (!a) render(history[history.length - 1] || { v: 'blank' });
      else go({ v: 'notfound', a: addr.value });
    }
    addrForm.addEventListener('submit', function (ev) { ev.preventDefault(); submitAddr(); }, false);

    function render(view) {
      page.innerHTML = '';
      page.scrollTop = 0;
      if (view.v === 'blank') {
        addr.value = '';
        addr.setAttribute('placeholder', 'Gõ địa chỉ vào đây, ví dụ: ' + engine);
        page.appendChild(E('div', 'ws-blank', Core.icon('globe') + '<p>Trang trống. Em chạm vào <b>thanh địa chỉ</b> ở trên, gõ địa chỉ máy tìm kiếm <b>' + engine + '</b> rồi nhấn <b>Enter</b>.</p>'));
        var quick = E('button', 'btn btn-small', 'Gõ giúp em: ' + engine);
        Core.on(quick, function () { addr.value = engine; submitAddr(); });
        page.appendChild(quick);
      } else if (view.v === 'notfound') {
        page.appendChild(E('div', 'ws-blank', Core.icon('warning') + '<p>Không mở được trang "<b></b>". Em gõ địa chỉ máy tìm kiếm <b>' + engine + '</b> nha.</p>'));
        page.querySelector('.ws-blank b').appendChild(document.createTextNode(view.a));
      } else if (view.v === 'engine') {
        addr.value = 'https://www.' + engine;
        page.appendChild(searchBox('', true));
      } else if (view.v === 'results') {
        addr.value = 'https://www.' + engine + '/?q=' + view.q;
        page.appendChild(searchBox(view.q, false));
        var t = find(view.q);
        emit('search', { q: view.q, topic: t });
        var list = E('div', 'ws-results');
        if (!t) {
          list.appendChild(E('p', 'ws-none', 'Trang tập luyện này không có kết quả cho từ khoá đó. Trên máy tính thật, máy tìm kiếm biết nhiều hơn rất nhiều! Em thử từ khoá khác, ví dụ: <i>Chợ Bến Thành, Nhà thờ Đức Bà, Vịnh Hạ Long, Tết Trung thu</i>.'));
        } else {
          list.appendChild(E('div', 'ws-count', 'Khoảng ' + (t.results.length * 1234567 + 8910).toLocaleString('vi-VN') + ' kết quả'));
          for (var i = 0; i < t.results.length; i++) {
            (function (r) {
              var item = E('div', 'ws-item' + (r.video ? ' ws-video' : ''));
              var link = E('button', 'ws-title br-link', (r.video ? Core.icon('play') : '') + r.title);
              Core.on(link, function () { go({ v: 'page', q: view.q, r: r, t: t }); });
              item.appendChild(E('div', 'ws-site', 'https://' + r.site));
              item.appendChild(link);
              item.appendChild(E('div', 'ws-snip', r.snip));
              list.appendChild(item);
            })(t.results[i]);
          }
        }
        page.appendChild(list);
      } else if (view.v === 'page') {
        var r = view.r;
        addr.value = 'https://' + r.site + '/bai-viet';
        var art1 = E('div', 'ws-page');
        art1.appendChild(E('div', 'br-h', r.title));
        var row = E('div', 'ws-page-row');
        row.appendChild(E('div', 'ws-page-pic' + (r.video ? ' ws-page-vid' : ''), r.video ? '<div class="vid">' + Core.icon('play') + '</div>' : art(r.pic)));
        row.appendChild(E('div', 'ws-page-body', r.body));
        art1.appendChild(row);
        page.appendChild(art1);
        emit('open', { result: r, topic: view.t, q: view.q });
        if (cfg.task && !awarded) {
          /* cfg.task.topic: the topic label that counts, e.g. 'Hồ Gươm' */
          if (view.t && find(cfg.task.topic) === view.t) {
            awarded = true;
            if (cfg.task.fb) Core.celebrate(cfg.task.fb, cfg.task.lesson, cfg.task.id, cfg.task.text || 'Em đã tìm được thông tin rồi!');
          }
        }
      }
    }

    function searchBox(q, big) {
      var box = E('form', 'ws-search' + (big ? ' ws-big' : ''));
      if (big) box.appendChild(E('div', 'ws-logo', '<span>T</span><span>ì</span><span>m</span> <span>k</span><span>i</span><span>ế</span><span>m</span>'));
      var row = E('div', 'ws-row');
      var input = E('input', 'ws-input');
      input.value = q;
      input.setAttribute('aria-label', 'Ô tìm kiếm');
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('placeholder', 'Gõ từ khoá rồi nhấn Enter');
      var btn = E('button', 'btn btn-primary btn-small', Core.icon('search') + 'Tìm');
      btn.setAttribute('type', 'submit');
      row.appendChild(Core.el('span', 'ws-ico', Core.icon('search')));
      row.appendChild(input);
      row.appendChild(btn);
      box.appendChild(row);
      var sug = E('div', 'ws-suggest');
      box.appendChild(sug);
      function showSug() {
        sug.innerHTML = '';
        var s = suggest(input.value);
        for (var i = 0; i < s.length; i++) {
          (function (label) {
            var b = E('button', 'ws-sug', Core.icon('search') + '<span></span>');
            b.setAttribute('type', 'button');
            b.lastChild.appendChild(document.createTextNode(label));
            Core.on(b, function () { input.value = label; sug.innerHTML = ''; submit(); });
            sug.appendChild(b);
          })(s[i]);
        }
      }
      function submit() {
        var v = input.value.replace(/^\s+|\s+$/g, '');
        if (!v) { input.focus(); return; }
        go({ v: 'results', q: v });
      }
      input.addEventListener('input', showSug, false);
      input.addEventListener('keyup', showSug, false);
      box.addEventListener('submit', function (ev) { ev.preventDefault(); submit(); }, false);
      return box;
    }

    go(cfg.start === 'engine' ? { v: 'engine' } : { v: 'blank' });
    return {
      /* for tools/fit.html */
      solve: function (keyword) {
        addr.value = engine;
        submitAddr();
        go({ v: 'results', q: keyword });
        var link = page.querySelector('.ws-title');
        if (link) link.click();
      }
    };
  };
})();
