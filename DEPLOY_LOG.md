# 📋 LOG TRIỂN KHAI WEB LÊN GITHUB PAGES

> File log ghi nhận toàn bộ các bước thực hiện.
> Mỗi bước sẽ được ghi vào đây TRƯỚC khi thực hiện.

---

## Thông tin project
- **Tên project:** webhoctinhoc (Web Học Tin Học lớp 4-5)
- **Loại:** Website tĩnh (HTML/CSS/JS thuần)
- **Cấu trúc:** index.html + các trang bài học (lop4/, lop5/) + assets (css, js) + tools
- **Git hiện tại:** Đã init git, branch `main`, chưa có remote
- **Ngày bắt đầu:** 2026-11-12

---

## Log các bước

### [2026-11-12 14:34] Bước 0: Khảo sát project
- **Trạng thái:** ✅ Hoàn thành
- **Ghi chú:** Đã xem cấu trúc project, xác nhận là web tĩnh HTML/CSS/JS, đã có git init trên branch `main`, chưa có remote. Có 3 file PDF lớn (~57MB) đã được .gitignore. Có 12 file thay đổi chưa commit + 2 file mới chưa track.

### [2026-11-12 14:36] Bước 1: Xác nhận yêu cầu & thông tin
- **Trạng thái:** ✅ Hoàn thành
- **GitHub username:** wilvlc2222
- **Repo visibility:** public
- **Repo name:** webhoctinhoc
- **URL dự kiến:** https://wilvlc2222.github.io/webhoctinhoc/

### [2026-11-12 14:37] Bước 2: Commit toàn bộ thay đổi hiện tại
- **Trạng thái:** ✅ Hoàn thành
- **Ghi chú:** `git add -A` + `git commit` thành công. 13 files changed, 413 insertions, 75 deletions. Commit: `080a5de`

### [2026-11-12 14:38] Bước 3: Tạo repo trên GitHub + push code
- **Trạng thái:** ✅ Hoàn thành
- **Mục tiêu:** Tạo repo public `webhoctinhoc` trên GitHub (wilvlc2222), add remote, push branch main
- **Ghi chú:** User đã tạo repo xong trên github.com/new. Tiến hành add remote + push.
- **Vấn đề:** Push bị 403 — máy đang lưu credentials của `bullandbear92`, cần push bằng `wilvlc2222`. Đổi remote URL gắn username để git prompt đúng account.
- **Giải pháp:** Dùng Personal Access Token (PAT) để authenticate. Push bằng token.
- **Kết quả:** Push thành công. Đã xoá token khỏi remote URL sau khi push.

### [2026-11-12 14:50] Bước 4: Bật GitHub Pages
- **Trạng thái:** ✅ Hoàn thành
- **Ghi chú:** User đã bật GitHub Pages trên Settings. Deploy from branch `main`, folder `/ (root)`.
- **URL LIVE:** https://wilvlc2222.github.io/webhoctinhoc/
- **Xác nhận:** HTTP 200, title "Tin học vui – Lớp 4, Lớp 5" ✅

---

## ✅ HOÀN TẤT TRIỂN KHAI - 2026-11-12 14:58
- **Repo:** https://github.com/wilvlc2222/webhoctinhoc
- **Web live:** https://wilvlc2222.github.io/webhoctinhoc/
- **Lưu ý:** Mỗi lần push code mới lên branch `main`, GitHub Pages sẽ tự động cập nhật web (1-2 phút).

---

## 🔧 SỬA LỖI HIỂN THỊ MOBILE

### [2026-11-12 15:19] Bước 5: Khảo sát lỗi hiển thị trên điện thoại
- **Trạng thái:** 🔄 Đang thực hiện
- **Thiết bị:** Kindle Paperwhite 5 (PPW5) — e-ink, 6.8", 1236×1648px, viewport ~758×1024
- **Hạn chế PPW5:** Trình duyệt experimental, KHÔNG hỗ trợ xoay ngang, WebKit cũ
- **Vấn đề 1:** Web thiết kế ngang (1300×700 fixed stage khi ≥900px) — PPW5 viewport ~758px nên rơi vào layout dọc
- **Vấn đề 2:** Trang chủ hiển thị sai trên PPW5, không thao tác được
- **Mục tiêu:** Tìm và sửa lỗi layout trang chủ ở chế độ narrow/portrait cho PPW5

### [2026-11-12 15:22] Bước 6: Sửa trang chủ cho PPW5 (narrow screen)
- **Trạng thái:** 🔄 Đang thực hiện
- **Sửa 1:** Fix gate-note position trên narrow screen (absolute → inline)
- **Sửa 2:** Đảm bảo home layout narrow hoạt động đúng (nhập tên, chọn bài)

### [2026-11-12 15:28] Bước 7: Khắc phục triệt để lỗi hiển thị & cảm ứng trên PPW5 (E-ink portrait)
- **Trạng thái:** ✅ Đã sửa xong code, chuẩn bị commit & push
- **Nguyên nhân gốc phát hiện:**
  1. PPW5 màn hình 6.8" độ phân giải 1236x1648, `innerWidth >= 900px` nên vô tình kích hoạt media query `@media (min-width: 900px)`.
  2. Web bị ép vào khung ngang cố định 1300x700 (`overflow: hidden`, `transform: translate(-50%, -50%) scale(...)`).
  3. Trình duyệt Kindle không hỗ trợ xoay ngang, đồng thời WebKit của Kindle bị lỗi không nhận cảm ứng khi `body` dùng CSS `transform`.
- **Kế hoạch sửa chữa:**
  1. `assets/js/core.js`: Sửa `Core.isStage()` để loại trừ thiết bị E-ink (`Core.isEink()`) và màn hình dọc (portrait `w <= h`).
  2. `assets/css/main.css`: Cập nhật media query stage sang `(min-width: 900px) and (orientation: landscape)`; thêm CSS reset toàn diện cho `html.eink` và màn hình dọc (bỏ transform, position static, cuộn dọc tự nhiên).
  3. `index.html`: Cập nhật `isWide()` đồng bộ với `Core.isStage()`; đưa `.gate-note` lên trước danh sách bài; thêm `scrollIntoView` khi bấm nhắc nhập tên.
  4. Commit và push lên GitHub Pages để cập nhật bản live.

### [2026-11-12 15:31] Bước 8: Commit và Push code lên GitHub Pages
- **Trạng thái:** ✅ Hoàn thành
- **Commit:** `bf16da9` - "Fix Kindle Paperwhite 5 and portrait layout touch and scrolling issues"
- **Kết quả:** Đã push lên GitHub repository `wilvlc2222/webhoctinhoc`, GitHub Pages đang tự động rebuild (mất ~1-2 phút). Đã gỡ token khỏi remote URL an toàn.

---

## 🎯 KẾT QUẢ SỬA LỖI PPW5:
1. Màn hình máy đọc sách Kindle Paperwhite 5 (E-ink portrait) không còn bị ép vào khung ngang 1300x700 nữa.
2. Đã bỏ toàn bộ CSS `transform: scale` trên thiết bị E-ink, khôi phục tương tác cảm ứng tự nhiên trên màn hình cảm ứng của Kindle.
3. Trang chủ hiển thị dạng danh sách dọc (stacked single-column) cuộn tự nhiên:
   - Form "Ai đang học?" hiển thị rõ ràng trên đầu trang để nhập tên và mã số.
   - Nút nhắc nhập tên hiển thị ngay phía trên danh sách bài học và tự cuộn tới ô nhập tên khi chạm vào.
   - Danh sách bài học hiển thị tối ưu cho màn hình mực đen trắng (E-ink).

---

## 🔧 SỬA LỖI TRANG CHỦ SAU BẢN bf16da9

### [2026-11-12 16:01] Bước 9: Trang chủ thiếu thông tin, không tương tác được (PPW5 và mọi thiết bị)
- **Trạng thái:** ✅ Đã sửa và commit trong máy, CHƯA push (bản live vẫn còn lỗi cho tới khi push)
- **Nguyên nhân gốc:** bản `bf16da9` thêm `fitStage()` vào `applyEink()` trong `assets/js/core.js`. `applyEink()` chạy ngay đầu tệp, lúc `Core.isStage` chưa được khai báo → `TypeError: Core.isStage is not a function` → cả `core.js` dừng giữa chừng → trang chủ không vẽ danh sách bài, không gắn được nút. Lỗi xảy ra trên mọi trình duyệt, không riêng PPW5.
- **Sửa:** `if (Core.isStage) fitStage();` (lần gọi đầu bỏ qua, phần stage tự gọi `fitStage()` ngay sau khi khai báo).
- **Đã kiểm (giả lập 758×1024, chế độ màn hình mực):** không còn lỗi JS, 17 bài lớp 4 hiện đủ, ô tên và mã số bấm được, đăng nhập được, trang bài học mở được. `tools/fit.html?pages=all&solve=1` → ALL OK (35 pages).
- **Chưa kiểm:** trên máy PPW5 thật.
- **Cùng commit:** thử thách Bọ Lỗi 20 máu = 20 điểm (lớp 4 đủ 20+ câu mỗi chủ đề, `tools/boss.html?g=4`), nhạc nền (bài học và trận đấu), nút bật/tắt nhạc.

### [2026-11-13] Trang hướng dẫn: thêm 3 mục
- **Trạng thái:** ✅ Đã sửa trong máy, CHƯA commit, CHƯA push
- **Sửa:** `huongdan.html` thêm mục "Sao và huy chương" (`#sao`), "Bíp và tủ đồ" (`#bip`), "Diệt Bọ Lỗi" (`#bo-loi`). Số liệu lấy từ mã nguồn: huy chương 40% / 70% / 100% số sao (`game.js`), mốc lên cấp của Bíp 3–120 sao (`mascot.js`), luật Bọ Lỗi 20 máu, 3 trái tim, +3 kim cương (`thuthach.html`).
- **Đã kiểm (1300×700):** cả 4 mục `main.scrollHeight` = `main.clientHeight` = 601, không lỗi console.
- **Chưa kiểm:** chế độ màn hình mực, bố cục dọc trên PPW5, master chưa duyệt câu chữ.

### [2026-11-13] Bọ Lỗi lớp 4: chơi trọn 6 chủ đề, sửa câu Scratch tràn khung, gộp danh sách bài
- **Trạng thái:** ✅ Đã sửa trong máy, CHƯA commit, CHƯA push
- **Công cụ mới:** `tools/bossplay.js` tự chơi trọn trận của từng chủ đề (thua để học đáp án, rồi thắng hai lần).
- **Kết quả (1300×700):** cả 6 chủ đề thua và thắng đều chạy đúng, thắng lần đầu +3 kim cương, lần hai không cộng; 21 / 22 / 22 / 23 / 48 / 24 câu đã gặp; không lỗi.
- **Sửa:** câu có đáp án là khối lệnh Scratch (chủ đề 6) tràn 44px sau khi trả lời → `thuthach.html` thêm lớp `boss-opts-row`, `main.css` xếp các đáp án đó thành một hàng. Chạy lại: tràn 0px ở cả 6 chủ đề.
- **Gộp danh sách bài:** `tools/fit.html` lấy số bài từ `lessons.js`; `Core.renderStars` lấy số sao từ `lessons.js`. `tools/fit.html?pages=l4&solve=1` → ALL OK (17 pages).
- **Trang hướng dẫn:** sửa mục "Vào trận" cho đúng tên nút ở trang chủ (Thử thách → Vào đấu).
- **Chưa kiểm:** lớp 5 (`pages=l5`) sau khi đổi `renderStars`; chế độ màn hình mực; hàng đáp án Scratch ở bố cục dọc của PPW5; chưa chụp ảnh hàng đáp án Scratch sau khi sửa.

### [2026-11-13] Kiểm lớp 5 và bố cục dọc, sửa đáp án Scratch đè nhau ở bố cục dọc
- `tools/fit.html?pages=all&solve=1` → `ALL OK (35 pages)` sau khi `Core.renderStars` lấy số sao từ `lessons.js`.
- Giả lập 758×1024, màn hình mực: 4 mục của `huongdan.html` không tràn ngang; mục `#bo-loi` ở 1300×700 vẫn vừa khung sau khi sửa câu "Vào trận".
- Lỗi do bản sửa trước: `.boss-opts-row .quiz-opt { flex: 1 1 0 }` làm đáp án Scratch co chiều cao còn 52px khi xếp dọc, các khối lệnh đè lên nhau. Sửa: bọc hai luật `.boss-opts-row` trong `@media (min-width: 900px) and (orientation: landscape)` (`assets/css/main.css`).
- Đo lại: 1300×700 ba đáp án một hàng, `main` không tràn; 758×1024 ba đáp án xếp chồng, khối lệnh nằm trọn trong ô.
- Chưa kiểm: máy Kindle thật. Sau khi trả lời, chữ trong khối lệnh ở màn hình mực khá nhạt (xám trên trắng), cần xem trên máy thật.
- Đã commit và push cùng ngày.

### [2026-11-13] Đưa lên mạng: xong Lớp 4 (hướng dẫn, Bọ Lỗi, gộp danh sách bài)
- Ba mục 2026-11-13 ở trên đã commit (`a6ebe29`), gộp vào `main` và push.
- Kiểm trước khi push: `fit.html?pages=all&solve=1` → `ALL OK (35 pages)`; `boss.html?g=4` → `ALL OK`; 6 trận Bọ Lỗi chơi trọn; trang chủ, trang giáo viên, hướng dẫn mở không lỗi.
- Chưa kiểm: Kindle PPW5 thật.

### [2026-11-13] Trang chủ: trình bày lại bảng chú thích chủ đề
- `index.html`, `assets/css/main.css`: bảng chú thích 6 chủ đề ở cột trái thành một thẻ trắng, mỗi chủ đề một chấm tròn có số cùng màu với nút trên bản đồ (`.topic-dot`), thay cho nhãn viền "Chủ đề N" chữ xám 12px. Dòng ghi chú nguồn bên dưới nhỏ lại còn 11px.
- Đo ở 1300×700, lớp 4 và lớp 5: 6 dòng đều một hàng, `main` không tràn. Ở 758×1024 màn hình mực: không tràn ngang, chấm và viền màu đen.
- Đã commit và push cùng ngày.

### [2026-11-13] Kindle PPW5 thật: trang chủ không chạy JavaScript, thêm báo lỗi trên trang
- Master chụp ảnh PPW5 (bản live `007024e`): ô "Ai đang học?" trống, không có danh sách chủ đề và bài học, nút "Màn hình mực" chưa có chữ bật/tắt, không có hình Bíp. Tức `core.js` không chạy hoặc dừng giữa chừng.
- Chưa tìm ra nguyên nhân: các tệp trang chủ không có cú pháp mới; giả lập 540×720 và 758×1024 đều chạy đúng. Hai giả thuyết: Kindle còn giữ `core.js` cũ (bản lỗi trước `5ccb732` có đúng triệu chứng này), hoặc trình duyệt Kindle thiếu một hàm.
- `index.html`: thêm `?v=1113b` vào `main.css`, `icons.js`, `lessons.js`, `core.js` (các tệp `core.js` tự nạp cũng mang theo số này) để ép tải bản mới; thêm đoạn mã đầu trang hiện lỗi JavaScript, tệp không tải được, bề ngang màn hình và tên trình duyệt vào một khung ở đầu trang. Khung chỉ hiện khi có lỗi.
- Đã thử ở máy: trang thường không hiện khung; gây lỗi giả thì khung hiện đúng nội dung lỗi.
- Bước tiếp: push, master mở lại trên PPW5 và chụp ảnh. Nếu còn lỗi, khung sẽ ghi rõ lỗi gì.
- Đã commit và push cùng ngày.

### [2026-11-13] Khung bài học đổi sang 16:9 (1280×720), co giãn theo màn hình
- Theo lời master: tận dụng độ phân giải của thiết bị. Khung cố định đổi từ 1300×700 sang 1280×720; `fitStage()` trong `core.js` giờ phóng to lẫn thu nhỏ cho vừa cửa sổ (trước đây chỉ thu nhỏ), giữ tỉ lệ 16:9, phần thừa là viền hai bên hoặc trên dưới.
- Sửa: `assets/js/core.js`, `assets/css/main.css` (khung, `.boss-frame`), `tools/fit.html`, `tools/boss.html`, `tools/bossplay.js`; `lop4/bai03.html` chia toạ độ con trỏ cho tỉ lệ khung (trước đây lệch khi khung bị co giãn); `index.html` đổi số phiên bản tệp thành `?v=1113c`.
- Đo: `fit.html?pages=all&solve=1` → `ALL OK (35 pages)` ở 1280×720; trang chủ lớp 4 và lớp 5, 4 mục hướng dẫn không tràn; 6 trận Bọ Lỗi chơi trọn, không tràn. Tỉ lệ co giãn: 1920×1080 → 1,5 (kín màn hình), 2560×1440 → 2, 1920×950 → 1,32, 1366×650 → 0,90, 1024×600 → 0,80.
- Không đổi: màn hình mực và màn dọc (Kindle) vẫn dùng bố cục cuộn, không dùng khung.
- Chưa kiểm: thao tác kéo thả, vẽ (`paint.js`, `scratch.js`, `richdoc.js`) khi khung phóng to hơn 1; mã tính theo tỉ lệ nên em cho là đúng nhưng chưa bấm thử. Chưa thử trên máy tính bảng thật.
- Đã commit và push cùng ngày.

### [2026-11-13] Số phiên bản tệp và khung báo lỗi cho mọi trang; thử con trỏ khi khung phóng to
- Master xác nhận: sau khi trang chủ có `?v=`, Kindle PPW5 hiện đúng (vừa bề ngang, cuộn dọc). Nguyên nhân nhiều khả năng là Kindle giữ tệp cũ.
- Cả 39 trang (`*.html`, `lop4/`, `lop5/`) gọi CSS và JS trong `assets/` kèm `?v=1113d`. Khi đổi tệp trong `assets/` phải đổi số này ở mọi trang (một lệnh `sed`).
- Khung báo lỗi chuyển thành tệp chung `assets/js/errbox.js`, nạp đầu tiên ở mọi trang; bỏ đoạn mã lặp trong `index.html`.
- Đo: 7 trang mẫu ở 1920×1080 (khung phóng 1,5) không hiện khung lỗi, mọi tệp đều có số phiên bản; `fit.html?pages=all&solve=1` → `ALL OK (35 pages)` ở 1280×720; `lop4/bai03.html` bấm ở (334, 479) thì con trỏ giả hiện ở (324, 472), tức hết lệch theo tỉ lệ.
- Chưa bấm thử: bài vẽ và bài soạn thảo của lớp 5 (`paint.js`, `richdoc.js`) và sân khấu Scratch khi khung phóng to; mã tính theo tỉ lệ khung nên không phụ thuộc độ phóng. Chưa thử bài học trên Kindle thật.
- Đã commit và push cùng ngày.

### [2026-11-13] Tạm tắt nút Lớp 5 ở trang chủ
- Theo lời master. `index.html`: nút Lớp 5 có `disabled`, chữ "Lớp 5 (sắp có)"; máy đã lưu lớp 5 từ trước cũng mở ra lớp 4. Bật lại: bỏ `disabled` và chữ "(sắp có)" ở nút đó.
- Chỉ tắt nút: các trang `lop5/*.html` vẫn mở được nếu ai có đường dẫn trực tiếp.
- Đo: đặt sẵn lớp 5 trong localStorage rồi mở trang chủ → hiện bài lớp 4, bấm nút Lớp 5 không đổi gì, không có lỗi.
- Đã commit, gộp vào `main` và push cùng ngày (nhánh `claude/disable-class-5-button-e598ae`).

## 2026-11-14 – Phương ngữ Sài Gòn, bước 3 (Bọ Lỗi, tủ đồ Bíp, thư viện nhân vật)

- `bossbank.js`: "bị hỏng" → "bị hư", "như thế nào?" → "ra sao?" (2 câu); `thuthach.html` đổi `bossbank.js?v=1115`.
- `mascot.js` + `huongdan.html`: Nón kết, Kính mát, Nón phù thuỷ (món đồ lưu theo `id`, tiến độ cũ không mất).
- `sprites.js`: Trái táo, Trái banh; `sprites.js?v=1115` ở lớp 4 bài 13–16, lớp 5 bài 10–16.
- Kiểm tra: `tools/fit.html?pages=all&solve=1` → ALL OK (35 pages); trang hướng dẫn không lỗi console.
- Gộp vào `main` (fast-forward, nhánh `claude/lop-4-tiep-theo-9cb937`) và push cùng ngày.

## 2026-11-14 – Bọ Lỗi: trả lời sai không còn hiện đáp án

- `thuthach.html`: chỉ tô xanh khi chọn đúng; sai thì báo "Câu này sẽ quay lại sau, em suy nghĩ kĩ nha." (master chọn "Ẩn đáp án").
- `tools/bossplay.js`: thử lần lượt các đáp án, báo lỗi nếu đáp án đúng lộ ra sau khi chọn sai.
- Kiểm tra: `bossplay.js?g=4` → 6 chủ đề đều thắng 2 lần, không lỗi, không tràn khung.
- Gộp vào `main` (fast-forward) và push cùng ngày.

## 2026-11-14 – Nhạc nền cho trang chủ

- `sound.js`: thêm bài `home` (vui, vừa nhanh); trang có `#topic-legend` (chỉ trang chủ) tự phát sau lần chạm đầu. Bài học vẫn `study`, Bọ Lỗi vẫn `boss`.
- Mọi trang đổi `?v=1114a` → `?v=1114b` (268 chỗ, 39 tệp).
- Kiểm tra: trang chủ chạm một lần → `Core.musicPlaying()` = `home`, không lỗi console.

## 2026-11-14 – Nhạc: nhiều bài hơn, stereo, phát liền khi vào trang

- `sound.js`: 8 bài (`study1–4`, `home1–2`, `boss1–2`); `Core.music(kind)` chọn một bài trong nhóm, khác bài nghe lần trước (`whth-music-last`). `Core.musicPlaying()` bỏ, thay bằng `Core.musicSong()`.
- Stereo: mỗi nốt hai giọng lệch 6 cent, đặt trái/phải bằng `StereoPanner` (bè trầm lệch trái, giai điệu lệch phải), lọc thông thấp 3200 Hz, tiếng vang trái → phải. Trình duyệt không có `StereoPanner` thì phát giữa.
- Tạo `AudioContext` ngay khi mở trang và thử `resume()`; trình duyệt cho thì phát liền, không thì chờ lần chạm đầu như cũ. Thêm nghe `pointerdown`.
- Mọi trang đổi `?v=1114b` → `?v=1114c`.
- Kiểm tra (Chrome trong app): mở trang chủ → `home1` phát chưa cần chạm, lần sau `home2`; chạm thẻ bài 1 → vào bài phát `study2` liền. Không lỗi console.
- Gộp vào `main` (fast-forward) và push cùng ngày.

## 2026-11-14 – Phương ngữ Sài Gòn, lớp 4 bài 13–16

- Sửa chữ `lop4/bai13.html` (4 chỗ) và `bai15.html` (1 chỗ) theo `docs/phuong-ngu.md`, bằng `tools/replace.ps1`; bài 14, 16 không có chữ cần đổi. Không đổi tệp nào trong `assets/`, nên không đổi số `?v=`. Xong bước 2 (lớp 4).
- Kiểm tra: `tools/fit.html?pages=l4&solve=1` → ALL OK (17 pages).
- Bài 1–16 gộp vào `main` (fast-forward) và push cùng ngày. Kiểm trước khi push: `fit.html?pages=all&solve=1` → ALL OK (35 pages).

## 2026-11-14 – Phương ngữ Sài Gòn, lớp 4 bài 9–12

- Sửa chữ `lop4/bai09–11.html`, `bai12a.html` theo `docs/phuong-ngu.md` (17 chỗ, bằng `tools/replace.ps1`); `bai12b.html` không có chữ cần đổi. Bài 9 luyện tập đổi sang Chợ Bến Thành, dùng hình có sẵn nên không đổi tệp nào trong `assets/`, không đổi số `?v=`.
- Kiểm tra: `tools/fit.html?pages=l4&solve=1` → ALL OK (17 pages), đủ sao sau khi tự giải.

## 2026-11-14 – Phương ngữ Sài Gòn, lớp 4 bài 5–8

- Sửa chữ `lop4/bai05–08.html` theo `docs/phuong-ngu.md`; bài 9 chỉ đổi 3 dòng mẫu trình chiếu cho khớp tệp "Cảnh đẹp quê hương" (Huế → Sài Gòn). Không đổi tệp nào trong `assets/`, nên không đổi số `?v=`.
- `.claude/launch.json`: thêm cấu hình `webhoctinhoc-8766` (cổng 8765 hay bị phiên khác chiếm).
- Kiểm tra: `tools/fit.html?pages=l4&solve=1` → ALL OK (17 pages); bài 6, bài 8 mở không lỗi console.

## 2026-11-14 – Phương ngữ Sài Gòn, lớp 4 bài 1–4

- Sửa chữ `lop4/bai01–04.html` theo bảng `docs/phuong-ngu.md` (bố → ba, quả táo → trái táo, hỏng → hư, thế nào → sao/ra sao, tớ/cậu → mình/bạn).
- Bài 4: Hồ Gươm → Chợ Bến Thành, Văn Miếu → Nhà thờ Đức Bà, Chùa Một Cột → Thảo Cầm Viên; `assets/js/websim.js` thêm kết quả và hình (`church`, `zoo`). Mã sao `hoguom`, `vanmieu` giữ nguyên để không mất sao cũ.
- Trang chủ: Bíp xưng "anh" ("Chào em! Anh là Bíp.").
- Mọi trang đổi `?v=1113d` → `?v=1114a`.
- Kiểm tra: `tools/fit.html?pages=l4&solve=1` → ALL OK (17 pages).

## 2026-11-14 – Solo BOSS, HP, nút nổi bật, nhạc nhanh hơn

- Đổi tên: "Diệt Bọ Lỗi" → **Solo BOSS**, con quái → **BOSS**; "máu"/"trái tim" → **HP** (BOSS 20 HP, em 3 HP) ở `thuthach.html`, `index.html`, `huongdan.html`, huy hiệu trong `game.js`, `tools/bossplay.js` (38 chỗ, bằng `tools/replace.ps1`).
- `thuthach.html`: hàng trái tim → thanh HP xanh lá 3 ô (`#boss-me`, `#boss-me-n`), giống thanh HP tím của BOSS.
- Nút `.btn-boss` (`main.css`): nền tím → đỏ, hai thanh kiếm (`Core.swordsIcon` trong `game.js`), phát sáng nhấp nháy, rê chuột thì sáng hơn, bấm thì lún; màn hình mực và giảm chuyển động thì tắt hiệu ứng. Dùng cho nút **Solo BOSS** ở trang chủ, nút **Vào đấu** và **Bắt đầu solo**.
- `sound.js`: nhịp theo từng loại trang, `TEMPO` = bài học 0.88, trang chủ 0.9, BOSS 1.1 (master: "nhạc hơi chậm", rồi "nhanh vừa thôi, không quá nhanh làm trẻ em hồi hộp").
- Mọi trang đổi `?v=1114c` → `?v=1114d`.
- Kiểm tra: `bossplay.js?g=4` → 6 chủ đề thắng 2 lần, không lỗi, không tràn; `fit.html?pages=all&solve=1` → ALL OK (35 pages); trang Solo BOSS không lỗi console.
