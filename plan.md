# Việc còn lại của web Tin học vui

Cập nhật: 2026-11-12. Tạm dừng một tuần theo lời master. Thứ tự ưu tiên: **xong hẳn Lớp 4 rồi mới tới Lớp 5**.

Trạng thái mã nguồn lúc dừng:
- Bản live (GitHub Pages, repo `wilvlc2222/webhoctinhoc`) đang ở commit `5ccb732`.
- Trong máy có thêm commit `b898f60` (gộp danh sách bài về `assets/js/lessons.js`, sửa 2 câu chữ) **chưa push**.

---

## 1. Cần master làm hoặc xác nhận (em không tự làm được)

- [ ] **Push `b898f60`** lên GitHub bằng token của `wilvlc2222` (`git push origin main`). Không gấp: bản live vẫn chạy khi thiếu commit này.
- [ ] **Thử trên Kindle PPW5 thật** sau bản sửa `5ccb732`: trang chủ có hiện đủ bài không, ô tên và mã số có bấm được không, vào bài học có chạm được không. Em mới thử bằng giả lập 758×1024 ở chế độ màn hình mực.
- [ ] **Nghe thử nhạc**: nhạc bài học (nhẹ, chậm) và nhạc trận Bọ Lỗi. Em chỉ đo được là nhạc chạy và tắt đúng lúc, không nghe được giai điệu. Nếu chưa hợp thì sửa nốt nhạc trong `SONGS` của `assets/js/sound.js`.
- [ ] **Duyệt 38 câu hỏi em viết thêm** cho Bọ Lỗi lớp 4 (chủ đề 2, 4, 6) trong `assets/js/bossbank.js`: đúng nội dung sách chưa, câu chữ có hợp với học sinh không.

## 2. Lớp 4 – việc còn phải làm

- [ ] **Trang hướng dẫn (`huongdan.html`)** mới có mục "Đăng nhập". Thêm 3 mục ngắn:
  - Sao, kim cương và huy chương.
  - Bíp và tủ đồ.
  - Thử thách diệt Bọ Lỗi (ghi đúng luật mới: 20 máu = 20 điểm, 3 trái tim, câu sai được hỏi lại).
  - Yêu cầu: mỗi mục vừa khung 1300×700 (`main.scrollHeight` bằng `main.clientHeight`), không dùng class `step`. Cách thêm mục ghi trong chú thích đầu tệp.
- [ ] **Chơi thử trọn trận Bọ Lỗi ở chủ đề 1, 3, 4, 5, 6.** Mới chơi trọn chủ đề 2 (thắng và thua); các chủ đề kia mới đếm câu.
- [ ] **Kiểm tra câu hỏi có đáp án là khối lệnh Scratch trên trang đấu** (chủ đề 6: bài 14 và bài 16). Trang `thuthach.html` không nạp kiểu dáng riêng của bài học, nên chưa chắc khối lệnh hiện đúng hình. Nếu hiện xấu thì lọc bỏ các câu này (chủ đề 6 đang có 24 câu, bỏ 3 câu vẫn đủ 20).
- [ ] **Điểm Bọ Lỗi chưa được lưu.** Hiện chỉ hiện "x/20" cuối trận; trang giáo viên và bảng tính Google chỉ biết thắng hay chưa (qua kim cương). Nếu master muốn thầy cô xem được điểm cao nhất của từng chủ đề thì phải thêm vào dữ liệu tiến độ, `sync.js`, `tools/sheet-sync.gs` và `giaovien.html`. Cần master quyết định có làm không.
- [ ] **Câu trả lời sai được hỏi lại ở cuối hàng, nhưng đáp án đúng đã hiện ra lúc sai.** Nếu master muốn khó hơn thì đổi thành không hiện đáp án, hoặc thay bằng câu khác.

## 3. Lớp 4 – điểm nhỏ, chưa gấp

- [ ] Tiêu đề bài trên thanh trên cùng giờ luôn nằm một dòng (để khỏi tràn khung). Học sinh tên dài thì tiêu đề dài bị cắt bằng dấu "…".
- [ ] Danh sách bài còn lặp ở hai chỗ chưa gộp: số sao `data-stars-total` ghi trong từng trang bài (hiện đang khớp với `lessons.js`), và danh sách tên tệp `ALL4`, `ALL5` trong `tools/fit.html`.
- [ ] Kindle không có Web Audio nên sẽ im lặng và không có nút nhạc, nút âm thanh. Đây là chủ ý, chỉ ghi lại để khỏi nhầm là lỗi.
- [ ] Trên PPW5 trang chạy ở bố cục dọc, cuộn tự nhiên (không còn khung 1300×700). Chưa ai xem cỡ chữ và khoảng cách ở bố cục này trên máy thật.

## 4. Lớp 5 – đang tạm dừng, chỉ làm sau khi Lớp 4 xong

- [ ] **Bọ Lỗi lớp 5 chưa đủ 20 câu ở mọi chủ đề.** Số đếm lần đầu (bộ lọc cũ): chủ đề 1 có 3 câu, chủ đề 2 có 10, chủ đề 3 có 20, chủ đề 4 có 12, chủ đề 5 có 27, chủ đề 6 có 56. Cần đếm lại bằng `tools/boss.html?g=5&list=1` rồi viết thêm câu vào `assets/js/bossbank.js` (khoá `'5-1'`, `'5-2'`, `'5-4'`...).
- [ ] Trong lúc chưa đủ câu, các chủ đề thiếu vẫn đấu được nhưng Bọ Lỗi có ít máu hơn, trong khi phần luật vẫn ghi "20 máu". Hết lệch khi đủ 20 câu.
- [ ] Soát lại các câu lớp 5 mà bộ lọc bỏ nhầm hoặc giữ nhầm (xem danh sách `?list=1`).

## 5. Cách kiểm tra khi làm tiếp

- Chạy máy chủ thử: cấu hình `webhoctinhoc` trong `.claude/launch.json` (cổng 8765).
- Vừa khung: mở `tools/fit.html?pages=all&solve=1`, đọc `window.fitShort`. Đạt là `ALL OK (35 pages)`. Chỉ lớp 4: `pages=l4`.
- Đếm câu Bọ Lỗi: mở `tools/boss.html?g=4`, đọc `window.bossShort`. Đạt là `ALL OK (6 topics, 20+ questions each)`.
- Tên học sinh để thử phải bắt đầu bằng `__` (không gửi lên bảng tính Google thật). Thử xong xoá tên đó khỏi localStorage.
- Chữ cho học sinh: tiếng Việt chuẩn ("không", không dùng "hông"); dòng hướng dẫn chỉ nói cách thao tác, không gợi ý đáp án.
- Mỗi bước làm xong ghi vào `DEPLOY_LOG.md`. Chỉ commit hoặc push khi master bảo.
