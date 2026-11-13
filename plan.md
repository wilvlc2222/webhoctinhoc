# Việc còn lại của web Tin học vui

Cập nhật: 2026-11-14. Thứ tự ưu tiên: **xong hẳn Lớp 4 rồi mới tới Lớp 5**. Lớp 4 chỉ còn 4 việc ở mục 1 (master thử/duyệt); phần em làm được đã xong hết.

Bản live (GitHub Pages, repo `wilvlc2222/webhoctinhoc`) đi theo `main`; lịch sử đưa lên mạng ở `DEPLOY_LOG.md`.

---

## 1. Cần master làm hoặc xác nhận (em không tự làm được)

- [ ] **Thử trên Kindle PPW5 thật** sau bản sửa lỗi trang chủ (`5ccb732`, đã có trên bản live): trang chủ có hiện đủ bài không, ô tên và mã số có bấm được không, vào bài học có chạm được không. Xem luôn cỡ chữ và khoảng cách ở bố cục dọc (PPW5 cuộn tự nhiên, không có khung 1280×720). Em mới thử bằng giả lập 758×1024 ở chế độ màn hình mực.
- [ ] **Đọc duyệt câu chữ trang hướng dẫn** (`huongdan.html`, 4 mục).
- [ ] **Nghe thử nhạc trang chủ** (bài `home` trong `SONGS` của `assets/js/sound.js`, thêm 2026-11-14: vui, vừa nhanh, vòng C – G – Am – F). Nhạc bài học và nhạc trận Bọ Lỗi master đã nghe, có rồi (2026-11-14). Nếu chưa hợp thì sửa nốt nhạc trong `SONGS`.
- [ ] **Duyệt 38 câu hỏi em viết thêm** cho Bọ Lỗi lớp 4 (chủ đề 2, 4, 6) trong `assets/js/bossbank.js`: đúng nội dung sách chưa, câu chữ có hợp với học sinh không.

## 2. Lớp 4 – việc còn phải làm

- [x] **Trang hướng dẫn (`huongdan.html`)** — xong 2026-11-13, chưa commit: đã thêm 3 mục (`#sao`, `#bip`, `#bo-loi`), cả 4 mục vừa khung 1300×700. Cần master đọc duyệt câu chữ. Yêu cầu gốc:
  - Sao, kim cương và huy chương.
  - Bíp và tủ đồ.
  - Thử thách diệt Bọ Lỗi (ghi đúng luật mới: 20 máu = 20 điểm, 3 trái tim, câu sai được hỏi lại).
  - Yêu cầu: mỗi mục vừa khung 1280×720 (`main.scrollHeight` bằng `main.clientHeight`), không dùng class `step`. Cách thêm mục ghi trong chú thích đầu tệp.
- [x] **Chơi thử trọn trận Bọ Lỗi ở cả 6 chủ đề** — xong 2026-11-13 bằng `tools/bossplay.js` (tự chơi: thua, thắng lần đầu +3 kim cương, thắng lần hai không cộng). Cả 6 chủ đề đạt, không câu nào tràn khung 1300×700.
- [x] **Câu hỏi có đáp án là khối lệnh Scratch trên trang đấu** — xong 2026-11-13. Khối lệnh hiện đúng hình và màu (kiểu dáng nằm trong `main.css`), giữ cả 3 câu. Một câu tràn 44px sau khi trả lời; đã sửa bằng cách xếp các đáp án Scratch thành một hàng (`.boss-opts-row`). Luật một hàng chỉ áp cho bố cục ngang; ở bố cục dọc 758×1024 (màn hình mực) các đáp án xếp chồng, đã đo không đè nhau, không tràn ngang.
- [x] **Điểm Bọ Lỗi không lưu** — master quyết định 2026-11-14: không cần. Thầy cô chỉ biết thắng hay chưa (qua kim cương), "x/20" chỉ hiện cuối trận.
- [x] **Trả lời sai không còn hiện đáp án** — xong 2026-11-14 theo lời master: `thuthach.html` chỉ tô xanh khi chọn đúng; sai thì báo "Câu này sẽ quay lại sau, em suy nghĩ kĩ nha." `tools/bossplay.js` thử lần lượt các đáp án và báo lỗi nếu đáp án đúng lộ ra. 6 chủ đề lớp 4 đều thắng 2 lần, không lỗi.

## 3. Lớp 4 – điểm nhỏ, chưa gấp

- [x] Tiêu đề bài trên thanh trên cùng luôn nằm một dòng; tên dài bị cắt bằng "…" — master chấp nhận 2026-11-14.
- [x] "Bóng đá", "Đá bóng vào khung thành" ở mẫu trình chiếu bài 8, 9 — master chọn giữ 2026-11-14.
- [x] Danh sách bài lặp ở hai chỗ — xong 2026-11-13: `tools/fit.html` lấy số bài từ `lessons.js`; số sao trên trang bài lấy từ `lessons.js` (`Core.renderStars`), `data-stars-total` trong từng trang chỉ còn là số dự phòng lúc danh sách chưa nạp xong.
- Ghi chú (không phải lỗi): Kindle không có Web Audio nên im lặng, không có nút nhạc, nút âm thanh.

## 4. Lớp 5 – đang tạm dừng, chỉ làm sau khi Lớp 4 xong

- [ ] **Bọ Lỗi lớp 5 chưa đủ 20 câu ở mọi chủ đề.** Số đếm lần đầu (bộ lọc cũ): chủ đề 1 có 3 câu, chủ đề 2 có 10, chủ đề 3 có 20, chủ đề 4 có 12, chủ đề 5 có 27, chủ đề 6 có 56. Cần đếm lại bằng `tools/boss.html?g=5&list=1` rồi viết thêm câu vào `assets/js/bossbank.js` (khoá `'5-1'`, `'5-2'`, `'5-4'`...).
- [ ] Trong lúc chưa đủ câu, các chủ đề thiếu vẫn đấu được nhưng Bọ Lỗi có ít máu hơn, trong khi phần luật vẫn ghi "20 máu". Hết lệch khi đủ 20 câu.
- [ ] Soát lại các câu lớp 5 mà bộ lọc bỏ nhầm hoặc giữ nhầm (xem danh sách `?list=1`).

## 5. Cách kiểm tra khi làm tiếp

- Chạy máy chủ thử: cấu hình `webhoctinhoc` trong `.claude/launch.json` (cổng 8765).
- Khung bài học từ 2026-11-13 là **1280×720 (16:9)**, co giãn lên xuống theo màn hình (`Core.STAGE_W`, `Core.STAGE_H` trong `core.js`; kích thước trong `main.css`). Các mục cũ ghi 1300×700 là số của khung trước.
- Vừa khung: mở `tools/fit.html?pages=all&solve=1`, đọc `window.fitShort`. Đạt là `ALL OK (35 pages)`. Chỉ lớp 4: `pages=l4`.
- Chơi trọn Bọ Lỗi: mở một trang bất kì ở 1280×720 rồi nạp `tools/bossplay.js?g=4` (cách dùng ghi ở đầu tệp), chờ `window.__done`, đọc `window.__boss`. Đừng chuyển trang trước khi `__done` là true, nếu không tên thử `__thu` còn lại trong localStorage.
- Đếm câu Bọ Lỗi: mở `tools/boss.html?g=4`, đọc `window.bossShort`. Đạt là `ALL OK (6 topics, 20+ questions each)`.
- Tên học sinh để thử phải bắt đầu bằng `__` (không gửi lên bảng tính Google thật). Thử xong xoá tên đó khỏi localStorage.
- Chữ cho học sinh: phương ngữ Sài Gòn theo `docs/phuong-ngu.md` (vẫn viết "không", không "hông"; Bíp xưng "anh"); dòng hướng dẫn chỉ nói cách thao tác, không gợi ý đáp án.
- Mỗi bước làm xong ghi vào `DEPLOY_LOG.md`. Chỉ commit hoặc push khi master bảo.

## 6. Đổi chữ bài học sang phương ngữ Sài Gòn (master đồng ý 2026-11-13)

Phạm vi master đã duyệt: **chỉ đổi lời dẫn, ví dụ, tên người và địa danh**. **Giữ nguyên thuật ngữ sách giáo khoa** (thư mục, tệp, phần mềm, phần cứng…) vì bài kiểm tra ở trường dùng đúng các từ đó. Quy tắc cũ "chữ cho học sinh dùng tiếng Việt chuẩn" được thay bằng mục này.

- [x] Bước 1: đã quét, bảng "từ cũ → từ mới" nằm ở `docs/phuong-ngu.md` (2026-11-13). Master duyệt "đổi theo bảng" ngày 2026-11-14.
- [x] Bước 2: sửa lớp 4, mỗi phiên 3–4 bài. **Xong bài 1–16 (2026-11-14).** Thay chữ bằng `powershell -ExecutionPolicy Bypass -File tools/replace.ps1 -Rules <tệp quy tắc>` (máy chặn chạy script nên phải có `-ExecutionPolicy Bypass`) (mỗi dòng: tệp, chữ cũ, chữ mới, số lần phải gặp, cách nhau bằng Tab; sai số lần thì bỏ qua tệp đó). Sau mỗi bài chạy `tools/fit.html?pages=l4&solve=1` vì đổi chữ làm đổi độ dài dòng. Đáp án và câu hỏi phải khớp nhau sau khi đổi.
- [x] Bước 3: câu hỏi Bọ Lỗi, trang hướng dẫn, lời của Bíp — xong 2026-11-14 (chi tiết trong `docs/phuong-ngu.md`). Lớp 4 đã đổi giọng xong hết.
- [ ] Bước 4: lớp 5, sau khi lớp 4 xong.
- Ước lượng: lớp 4 khoảng 80 lượt gọi, 60–80% một khung 5 tiếng nếu chia 4–5 phiên ngắn; lớp 5 gấp đôi.
- Mỗi lần đổi tệp nhớ đổi số `?v=` ở mọi trang (xem `DEPLOY_LOG.md` 2026-11-13).
