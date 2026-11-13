/* Extra questions for the boss challenge (thuthach.html), on top of the ones it takes from the lessons.
   A challenge needs 20 questions (20 points). Topics whose lessons have fewer get the rest here.
   Key = 'grade-topic'. Each item: { q, options, answer } (answer = index), or { t, ok } for a Đúng / Sai sentence.
   A question must make sense on its own: no "hình trên", "bảng dưới đây"... tools/boss.html counts them. ES5. */
window.BOSS_EXTRA = {
  /* Lớp 4, chủ đề 2 (Bài 3. Thông tin trên trang web) */
  '4-2': [
    { q: 'Truyện cổ tích để đọc trên trang web là thông tin dạng nào?', options: ['Văn bản', 'Hình ảnh', 'Âm thanh', 'Video'], answer: 0 },
    { q: 'Bài hát thiếu nhi là thông tin dạng nào?', options: ['Văn bản', 'Hình ảnh', 'Âm thanh', 'Video'], answer: 2 },
    { q: 'Phim hoạt hình là thông tin dạng nào?', options: ['Văn bản', 'Hình ảnh', 'Âm thanh', 'Video'], answer: 3 },
    { q: 'Ảnh chú mèo con là thông tin dạng nào?', options: ['Văn bản', 'Hình ảnh', 'Âm thanh', 'Video'], answer: 1 },
    { q: 'Tin dự báo thời tiết viết bằng chữ là thông tin dạng nào?', options: ['Văn bản', 'Hình ảnh', 'Âm thanh', 'Video'], answer: 0 },
    { q: 'Khi em đưa chuột vào siêu liên kết, con trỏ chuột thường đổi thành hình gì?', options: ['Hình mũi tên', 'Hình bàn tay', 'Hình kính lúp'], answer: 1 },
    { q: 'Em nháy chuột vào siêu liên kết thì điều gì xảy ra?', options: ['Không có gì thay đổi.', 'Máy tính tự tắt.', 'Mở ra trang web hoặc nội dung mà nó liên kết tới.'], answer: 2 },
    { q: 'Điều nào là tác hại em có thể gặp khi xem trang web không phù hợp lứa tuổi?', options: ['Bị dụ dỗ làm những việc không đúng.', 'Biết thêm nhiều điều bổ ích.', 'Gõ bàn phím nhanh hơn.'], answer: 0 },
    { t: 'Nháy chuột vào siêu liên kết thì không có gì thay đổi.', ok: false },
    { t: 'Xem những trang web không phù hợp lứa tuổi có thể làm em lãng phí thời gian.', ok: true },
    { t: 'Khi vào những trang web không phù hợp, em có thể bị bắt nạt, đe doạ trên mạng.', ok: true },
    { t: 'Trang web nào trên Internet cũng bổ ích và phù hợp với em.', ok: false }
  ],
  /* Lớp 4, chủ đề 4 (Bài 6. Sử dụng phần mềm khi được phép) */
  '4-4': [
    { q: 'Trong kho ứng dụng, phần mềm có ghi giá tiền là phần mềm gì?', options: ['Phần mềm miễn phí', 'Phần mềm không miễn phí', 'Phần mềm bị hư'], answer: 1 },
    { q: 'Phần mềm không miễn phí là phần mềm ra sao?', options: ['Ai cũng được dùng mà không cần trả tiền.', 'Phải trả tiền mới được dùng.', 'Chỉ người lớn mới dùng được.'], answer: 1 },
    { q: 'Phần mềm nào là phần mềm miễn phí?', options: ['Word', 'PowerPoint', 'Scratch 3'], answer: 2 },
    { q: 'Unikey (bộ gõ tiếng Việt) là phần mềm miễn phí hay không miễn phí?', options: ['Miễn phí', 'Không miễn phí'], answer: 0 },
    { q: 'Dùng phần mềm không có bản quyền, máy tính có thể gặp chuyện gì?', options: ['Chạy nhanh hơn.', 'Bị nhiễm virus.', 'Bị mất điện.'], answer: 1 },
    { q: 'Phần mềm bị "bẻ khoá" là phần mềm ra sao?', options: ['Phần mềm được tác giả tặng miễn phí.', 'Phần mềm mới mua ở cửa hàng.', 'Phần mềm bị làm cho không phải trả tiền, vi phạm bản quyền.'], answer: 2 },
    { q: 'Muốn có phần mềm học tiếng Anh, cách nào <b>không nên</b> làm?', options: ['Mua phần mềm từ nhà cung cấp rồi cài đặt.', 'Dùng phần mềm đã bị "bẻ khoá".', 'Tìm một phần mềm miễn phí để cài đặt.'], answer: 1 },
    { q: 'Lợi ích nào có được khi dùng phần mềm có bản quyền?', options: ['Được hỗ trợ nếu phần mềm bị trục trặc.', 'Được xem nhiều đoạn video quảng cáo.', 'Máy tính không bao giờ bị mất điện.'], answer: 0 },
    { q: 'Em chỉ nên dùng một phần mềm khi nào?', options: ['Khi bạn bè cũng đang dùng.', 'Khi tìm được bản "bẻ khoá".', 'Khi được phép: đã mua hoặc được tác giả cho dùng miễn phí.'], answer: 2 },
    { t: 'Dùng phần mềm không có bản quyền là vi phạm pháp luật.', ok: true },
    { t: 'Dùng phần mềm không có bản quyền có thể làm em bị đánh cắp thông tin.', ok: true },
    { t: 'Dùng phần mềm có bản quyền giúp giữ an toàn thông tin trong máy tính.', ok: true },
    { t: 'Dùng phần mềm có bản quyền là góp phần bảo vệ người làm ra phần mềm.', ok: true },
    { t: 'Mọi phần mềm cài vào máy tính đều miễn phí.', ok: false },
    { t: 'Sao chép phần mềm phải trả tiền để dùng mà không trả tiền là việc làm đúng.', ok: false }
  ],
  /* Lớp 4, chủ đề 6 (Bài 13 – 16. Làm quen với Scratch) */
  '4-6': [
    { q: 'Scratch là gì?', options: ['Phần mềm soạn thảo văn bản', 'Ngôn ngữ lập trình trực quan', 'Trình duyệt web'], answer: 1 },
    { q: 'Trong Scratch, em bấm vào đâu để chạy chương trình?', options: ['Lá cờ xanh', 'Nút đỏ', 'Thùng rác'], answer: 0 },
    { q: 'Trong Scratch, em bấm vào đâu để dừng chương trình?', options: ['Lá cờ xanh', 'Nút đỏ', 'Quả địa cầu'], answer: 1 },
    { q: 'Trong Scratch, nhóm lệnh Chuyển động có màu gì?', options: ['Màu vàng', 'Màu đỏ', 'Màu xanh dương'], answer: 2 },
    { q: 'Trong Scratch, nhóm lệnh Sự kiện có màu gì?', options: ['Màu vàng', 'Màu xanh dương', 'Màu tím'], answer: 0 },
    { q: 'Lệnh "di chuyển 10 bước" thuộc nhóm lệnh nào?', options: ['Sự kiện', 'Chuyển động', 'Điều khiển', 'Bút vẽ'], answer: 1 },
    { q: 'Lệnh "đợi 1 giây" thuộc nhóm lệnh nào?', options: ['Sự kiện', 'Chuyển động', 'Điều khiển', 'Bút vẽ'], answer: 2 },
    { q: 'Chương trình máy tính là gì?', options: ['Các câu lệnh được sắp xếp theo thứ tự xác định.', 'Một bức tranh vẽ bằng máy tính.', 'Một bài hát lưu trong máy tính.'], answer: 0 },
    { q: 'Muốn xoá một nhân vật trong Scratch, em chọn nhân vật đó rồi bấm biểu tượng nào?', options: ['Lá cờ xanh', 'Quả địa cầu', 'Thùng rác'], answer: 2 },
    { q: 'Muốn Scratch hiển thị các lệnh bằng tiếng Việt, em bấm biểu tượng nào?', options: ['Quả địa cầu', 'Thùng rác', 'Nút đỏ'], answer: 0 },
    { t: 'Trong Scratch, các lệnh của cùng một nhóm lệnh có cùng màu.', ok: true }
  ]
};
