# Gom kết quả học sinh về Google Sheet

Sau khi cài xong, mỗi học sinh là một dòng trong bảng tính: tên, mã số, tổng sao, sao từng bài, lần học gần nhất.
Số dòng chính là số em đã tham gia học.

Trang web chỉ gửi **tên, mã số 4 chữ số và số sao**. Không gửi gì khác.

## Bước 1. Tạo bảng tính

1. Vào <https://sheets.google.com>, tạo một bảng tính trống. Đặt tên tuỳ ý, ví dụ "Tin học vui – kết quả".
2. Trên thanh trình đơn, chọn **Tiện ích mở rộng › Apps Script** (Extensions › Apps Script).

## Bước 2. Dán đoạn script

1. Trong trang Apps Script, xoá hết chữ có sẵn trong tệp `Code.gs`.
2. Mở tệp `tools/sheet-sync.gs` của dự án, chép toàn bộ, dán vào.
3. Bấm biểu tượng đĩa mềm để lưu.

## Bước 3. Triển khai thành ứng dụng web

1. Bấm **Triển khai › Tuỳ chọn triển khai mới** (Deploy › New deployment).
2. Ở "Chọn loại", chọn **Ứng dụng web** (Web app).
3. Điền:
   - **Thực thi dưới dạng** (Execute as): **Tôi** (Me).
   - **Người có quyền truy cập** (Who has access): **Bất kỳ ai** (Anyone).
4. Bấm **Triển khai**. Google hỏi cấp quyền: chọn tài khoản của mình, bấm **Cho phép**.
   Nếu gặp màn hình "Google chưa xác minh ứng dụng này", bấm **Nâng cao › Đi tới … (không an toàn)**. Script này là của chính mình nên an toàn.
5. Chép dòng **URL ứng dụng web** (Web app URL). Nó có dạng `https://script.google.com/macros/s/…/exec`.

Thử nhanh: dán URL đó vào trình duyệt. Nếu hiện dòng "Tin học vui: máy chủ kết quả đang chạy." là đúng.

## Bước 4. Gắn URL vào trang web

1. Mở tệp `assets/js/sync.js`.
2. Tìm dòng `var SYNC_URL = '';` và dán URL vào giữa hai dấu nháy:
   `var SYNC_URL = 'https://script.google.com/macros/s/…/exec';`
3. Lưu lại, rồi đưa trang web lên như bình thường.

## Dùng thế nào

- Học sinh nhập tên, nhận mã số, rồi học. Mỗi lần được sao, vài giây sau dòng của em đó trong bảng tính được cập nhật.
- Trang tính tên **HocSinh** tự được tạo ở lần gửi đầu tiên.
- Em nào đổi máy: ở trang chủ bấm **"Em đã có mã số (học ở máy khác)"**, nhập đúng tên và mã số là lấy lại được sao.
- Em nào quên mã số: thầy cô tra trong cột **Mã số** của bảng tính.
- Máy mất mạng lúc học: sao vẫn lưu trên máy, khi có mạng lại thì tự gửi.
- Sao chỉ cộng thêm, không bị trừ: học trên hai máy thì bảng tính gộp sao của cả hai.

## Lưu ý

- Cột **Dữ liệu (không sửa)** bị ẩn. Đừng sửa hay xoá cột này, trang web dùng nó để trả sao về cho học sinh.
- Muốn xoá một học sinh: xoá cả dòng của em đó.
- Nếu sau này sửa script: vào **Triển khai › Quản lý các tuỳ chọn triển khai**, bấm bút chì, chọn **Phiên bản mới**, rồi **Triển khai**. URL giữ nguyên.
- Ai có URL đều gửi được dữ liệu vào bảng. URL nằm trong mã nguồn trang web, nên đừng dùng bảng này cho việc gì khác quan trọng.
- Đây là dữ liệu của trẻ em: nên dùng tên gọi ở lớp hoặc biệt danh, không dùng họ tên đầy đủ, và báo cho phụ huynh hoặc nhà trường biết.

## Cập nhật script (bản có kim cương và mục tiêu chung của lớp)

Tệp `tools/sheet-sync.gs` đã có thêm hai thứ. Muốn dùng thì dán lại toàn bộ tệp này vào Apps Script, rồi triển khai **Phiên bản mới** như phần Lưu ý ở trên (URL giữ nguyên).

- **Kim cương** (học sinh làm đúng ngay lần đầu) được ghi vào cột `gems` ở cuối bảng, và không còn bị cộng vào cột **Tổng sao**.
- **Mục tiêu chung của lớp**: trang chủ hiện "Cả lớp: … bạn · … sao". Trang chỉ nhận tổng số, không nhận tên của ai.

Nếu chưa cập nhật: trang web vẫn chạy bình thường, nhưng cột **Tổng sao** sẽ gồm cả kim cương, và dòng mục tiêu chung của lớp không hiện.

## Trang giáo viên

Trang `giaovien.html` (có đường dẫn "Dành cho giáo viên" ở trang Hướng dẫn) hiện kết quả của mọi học sinh: tên, mã số, số sao, kim cương, huy chương, lần học gần nhất và số sao từng bài. Có lọc theo lớp, tìm theo tên, sắp xếp theo cột và tải tệp CSV.

Cần làm một lần:

1. Cập nhật script như mục trên (dán lại `tools/sheet-sync.gs`, triển khai **Phiên bản mới**).
2. Mở `giaovien.html`, gõ đại một mật khẩu rồi bấm **Xem kết quả**. Trang sẽ báo chưa đặt mật khẩu, và bảng tính có thêm trang tính **CaiDat**.
3. Trong bảng tính, mở trang tính **CaiDat**, gõ mật khẩu thầy cô muốn dùng vào ô **B1**. Nên dài từ 8 kí tự.
4. Quay lại `giaovien.html`, nhập đúng mật khẩu đó.

Mật khẩu chỉ nằm trong bảng tính của thầy cô. Trang web không lưu mật khẩu: tải lại trang là phải nhập lại. Muốn đổi mật khẩu thì sửa ô B1.
