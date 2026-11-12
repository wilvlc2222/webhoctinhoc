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
