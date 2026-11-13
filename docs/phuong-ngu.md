# Đổi chữ bài học sang phương ngữ Sài Gòn – bảng từ (plan.md mục 6, bước 1)

Quét ngày 2026-11-13: `lop4/*.html`, `assets/js/bossbank.js`, `huongdan.html`, `assets/js/mascot.js`
(số trong ngoặc: số lần gặp). Chữ hiện tại phần lớn đã trung tính; từ miền Bắc rõ chỉ có vài chục chỗ.

## A. Đổi (lời dẫn, ví dụ, lời thoại)

| Từ cũ | Từ mới | Ghi chú |
|---|---|---|
| bố (13) | ba | "kể cho bố mẹ nghe" → "kể cho ba mẹ nghe" |
| mẹ (19) | mẹ | giữ: Sài Gòn nói "ba mẹ" vẫn tự nhiên (đổi "má" nếu master muốn) |
| quả táo, quả bóng… (quả, 43) | trái táo, trái banh | chỉ khi là trái cây/đồ vật; giữ "kết quả", "hiệu quả", "quả là" |
| tớ / cậu (5 / 2, bài 4) | mình / bạn | lời thoại Khoa – Minh |
| hỏng (15) | hư | "làm hư máy tính", "ống kính bị hư" |
| thế nào (21) | sao / ra sao / làm sao | "Gõ thế nào cho đúng?" → "Gõ sao cho đúng?" |
| nhỉ (2) | ta | "đổi thành hình gì ta?" |
| nhé (4) | nha | |
| bông/hoa | giữ "hoa" | "chữ hoa" là thuật ngữ; "hoa đào/hoa mai" giữ |
| xem (59) | giữ "xem" trong hướng dẫn thao tác; "coi" chỉ trong lời thoại | |

## Xưng hô của Bíp (master dặn 2026-11-14)

Bíp gọi học sinh là "em" thì Bíp xưng **"anh"**, không xưng "mình" ("Chào em! Anh là Bíp."). Học sinh nói với
nhau (Khoa – Minh) thì vẫn "mình – bạn".

## Tiến độ

- 2026-11-14: xong bài 1–4 (bài 4 đổi Hồ Gươm → Chợ Bến Thành, Văn Miếu → Nhà thờ Đức Bà, Chùa Một Cột →
  Thảo Cầm Viên; `websim.js` thêm kết quả và hình cho ba nơi này). `fit.html?pages=l4&solve=1`: ALL OK.
- 2026-11-14: xong bài 5–8. Bài 6: tớ/cậu → mình/bạn, bố mẹ → ba mẹ, hỏng → hư. Bài 7, 8 (và mẫu trình chiếu ở bài 9): "Một số cảnh đẹp ở Sài Gòn" – Bến Nhà Rồng, Chợ Bến Thành, Nhà thờ Đức Bà, Dinh Độc Lập, Thảo Cầm Viên; ảnh cầu ghi "Cầu Sài Gòn"; lời mời "Mời bạn đến thăm Sài Gòn nha!". "thế nào" → "sao", "ra sao", "cách nào". Tiêu đề tệp "Cảnh đẹp quê hương" giữ.
- 2026-11-14: xong bài 9–12. Bài 9 luyện tập: Hồ Hoàn Kiếm → **Chợ Bến Thành** (tháp đồng hồ, các gian hàng; hình `market` có sẵn trong `art.js`; tệp "Cho Ben Thanh"), "đá bóng" → "đá banh". Bài 10: "Em yêu mùa thu Hà Nội." → "Em yêu mùa mưa Sài Gòn.". Bài 11: "quả ngọt" → "trái ngọt" (bài thơ Bíp viết). Bài 12a: "những quả nào" → "những trái nào"; truyện "Sự tích quả dưa hấu", "mâm ngũ quả", "phương Bắc" giữ. "thế nào" → "ra sao"/"làm sao", "nhỉ" → "ta". Bài 12b không có chữ cần đổi.
- 2026-11-14: xong bài 13–16. Bài 13: sprite "Quả táo" → "Trái táo", "3 quả táo" → "3 trái táo", đáp án nhiễu "Quả bóng" → "Trái banh", "đi như thế nào" → "đi ra sao". Bài 15: "em làm thế nào" → "em làm sao". Bài 14, 16 không có chữ cần đổi. Giữ "quả địa cầu" (tên nút trong Scratch, đúng SGK) và "Mình cùng…" (giống bài 6, 10, 12a). Thư viện nhân vật `assets/js/sprites.js` còn "Quả táo", "Quả bóng" (dùng chung với lớp 5, đổi thì phải đổi số `?v=`): để bước 3.
- 2026-11-14: xong bước 3. Bọ Lỗi lớp 4 (`bossbank.js`, `?v=1115` trong `thuthach.html`): "Phần mềm bị hỏng" → "bị hư", "phần mềm như thế nào?" → "ra sao?" (2 câu); "Quả địa cầu" giữ (tên nút Scratch); "quảng cáo" không phải "quả". Tủ đồ của Bíp (`mascot.js` + `huongdan.html`): "Mũ lưỡi trai" → "Nón kết", "Kính râm" → "Kính mát", "Mũ phù thuỷ" → "Nón phù thuỷ" (món đồ lưu theo `id` nên tiến độ cũ không mất). `sprites.js`: "Quả táo" → "Trái táo", "Quả bóng" → "Trái banh" (`?v=1115` ở lớp 4 bài 13–16, lớp 5 bài 10–16; các trang lớp 5 đó không nhắc tên này). Lời Bíp trên trang chủ đã xưng "anh"; lời Bíp trong `mascot.js` không có chữ cần đổi. Trang hướng dẫn chỉ có hai chỗ trên. `fit.html?pages=all&solve=1`: ALL OK (35 pages).
- Giữ, chưa đổi: "Bóng đá", "Đá bóng vào khung thành" trong mẫu trình chiếu bài 8, 9 (tên môn thể thao).
- Còn: lớp 5 (bước 4); lớp 5 bài 8a, 9a có "quả bóng".

## B. Giữ nguyên

- Thuật ngữ SGK: thư mục, tệp, phần mềm, phần cứng, chữ hoa, siêu liên kết, từ khoá…
- "không" giữ nguyên, không viết "hông" (master dặn 2026-11-11: sách trẻ em không được sai chính tả).
- Ca dao, thơ, câu đố, nội dung lịch sử (Hai Bà Trưng, "phương Bắc", Tết ba miền ở bài 12a).
- Tên người: Na, An, Minh, Khoa, Nam, anh Bình – tên trung tính, giữ.
- "tay trái", "bên trái" (là hướng, không phải trái cây).

## C. Địa danh – cần master chọn

Đây là bài thực hành lấy đúng từ SGK; đổi thì phải sửa cả trang tìm kiếm giả (`assets/js/websim.js`) và hình.

| Chỗ | Hiện tại | Đề nghị |
|---|---|---|
| Bài 4 thực hành | Hồ Gươm | Chợ Bến Thành |
| Bài 4 bài 2 | Văn Miếu – Quốc Tử Giám | Nhà thờ Đức Bà |
| Bài 4 sắp xếp bước | Chùa Một Cột | Thảo Cầm Viên |
| Bài 7, 8, 9 trình chiếu | Cảnh đẹp ở Huế; Mời bạn đến thăm Huế | Cảnh đẹp Sài Gòn: Bến Nhà Rồng, Chợ Bến Thành, Nhà thờ Đức Bà, Dinh Độc Lập |
| Bài 9 luyện tập | Giới thiệu Hồ Hoàn Kiếm (Tháp Rùa, đền Ngọc Sơn, cầu Thê Húc) | Giới thiệu Thảo Cầm Viên hoặc Chợ Bến Thành |
| Bài 10 sửa lỗi gõ | Em yêu mùa thu Hà Nội. | Em yêu mùa mưa Sài Gòn. |
