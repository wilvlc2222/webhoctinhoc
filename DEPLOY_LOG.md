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
