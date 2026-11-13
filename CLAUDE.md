# webhoctinhoc

Việc còn lại nằm trong `plan.md`; lịch sử đưa lên mạng nằm trong `DEPLOY_LOG.md`.

## Tiết kiệm token (bắt buộc)

Lý do: phiên 10–12/11/2026 chạy 2 ngày, 1.049 lượt gọi, ngữ cảnh trung bình 439k tokens (đỉnh 966k), đọc lại
455 triệu tokens. Phần viết ra chỉ 1,48 triệu. Tốn là do ngữ cảnh dài, không phải do repo.

- **Mỗi bài học một phiên.** Xong một bài (hoặc một việc trong `plan.md`): cập nhật `plan.md`, rồi nhắc master
  mở phiên mới hoặc gõ `/compact`. Ngữ cảnh qua ~150k tokens mà việc chưa xong thì cũng nhắc `/compact`.
- **Kiểm tra giao diện bằng chữ trước.** Dùng `read_page`, `get_page_text`, hoặc `javascript_tool` trả về vài con
  số (kích thước, có tràn 1280×720 hay không, lỗi console). Chỉ chụp một ảnh cuối làm bằng chứng cho mỗi thay đổi
  nhìn thấy được; không chụp sau từng bước.
- **Kết quả `javascript_tool` phải ngắn.** Trả về đúng giá trị cần xem, không trả cả DOM, cả mảng dài hay cả
  `outerHTML`.
- **SGK scan chỉ đọc bằng ảnh một lần.** Đọc xong thì ghi nội dung cần dùng ra file chữ trong `docs/sgk/`
  (ví dụ `docs/sgk/lop4-bai05.md`); các phiên sau đọc file chữ đó, không render lại PDF.
- **Đọc file theo đoạn.** `assets/css/main.css` (~1.600 dòng) và `assets/js/scratch.js` (~1.100 dòng): tìm bằng
  Grep rồi đọc đúng khoảng dòng cần, không đọc cả file.
- **Lệnh in dài thì lọc trước.** Chỉ lấy phần cần (dòng lỗi, vài dòng cuối), không đổ nguyên đầu ra vào hội thoại.
