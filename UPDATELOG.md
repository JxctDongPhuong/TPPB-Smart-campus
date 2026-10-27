# 📝 Nhật Ký Cập Nhật (Updatelog) - TPPB Smart Campus

Tài liệu ghi lại toàn bộ các thay đổi kiến trúc, sửa lỗi, kết nối API và kế hoạch mở rộng tiếp theo của dự án.

---

## 📌 Phiên Bản: v1.4.0 (28/10/2026) - Sửa Lỗi Tìm Kiếm/Lọc, Xóa Lịch, Tự Động Ẩn Phiếu & Đếm Thiết Bị Tốt

### 1. Khắc Phục Triệt Để Sự Cố Tìm Kiếm & Lọc Dữ Liệu
* **Nguyên nhân gốc rễ (Root Cause)**:
  - Trong `DevicesView.jsx` (Quản lý thiết bị): Biến `filteredDevices` đã được tính toán dựa trên `search` và bộ lọc, nhưng ở phần render bảng ERP Master-Detail, code trước đó đã map qua một mảng tĩnh `catalogItems` được hardcode với các mã giả lập (`313-DO-11-0010`, `HB_DEPOT`, `233`,...). Do đó, mọi thao tác nhập tìm kiếm hay chọn dropdown lọc đều hoàn toàn không ảnh hưởng tới bảng.
  - Trong `RoomsView.jsx`: Dropdown tòa nhà chỉ có 2 lựa chọn cứng `Tòa A` và `Tòa B`, thiếu hoàn toàn `Tòa C` và `Tòa D` có sẵn trên Neon DB. Bộ lọc tìm kiếm chưa hỗ trợ tìm theo tầng, tòa, trạng thái.
  - Trong `ScheduleView.jsx`: Chưa có thanh tìm kiếm theo phòng/môn học/giảng viên và bộ lọc theo tòa nhà cho ma trận thời khóa biểu.
  - Trong `Header.jsx`: Nhận prop `onSearch` từ `App.jsx` nhưng không hề render ô input tìm kiếm.
* **Giải pháp đã triển khai**:
  - `DevicesView.jsx`: Chuyển đổi toàn bộ `catalogItems` sang sinh động 100% từ `filteredDevices`. Cho phép tìm kiếm tức thời theo mã thiết bị, tên thiết bị, mã lô, mã phòng (`A101`, `B302`), loại thiết bị, tình trạng. Bảng tự động mở rộng chi tiết khi người dùng gõ tìm kiếm.
  - `RoomsView.jsx`: Tự động trích xuất danh sách tòa nhà (`availableBuildings`), tầng (`availableFloors`), loại phòng (`availableTypes`) từ cơ sở dữ liệu thực tế. Mở rộng tìm kiếm khớp cả mã phòng, tên phòng, loại, tòa nhà (`Tòa C`, `Tòa D`), tầng và trạng thái.
  - `ScheduleView.jsx`: Bổ sung thanh tìm kiếm phòng/môn học/giảng viên và dropdown lọc theo tòa nhà ngay phía trên ma trận thời khóa biểu.
  - `TicketsView.jsx`: Mở rộng tìm kiếm khớp mô tả, mã phòng, mã thiết bị, người gửi, ghi chú admin và mã phiếu.
  - `Header.jsx` & `App.jsx`: Bổ sung thanh tìm kiếm nhanh toàn hệ thống trên header và truyền đồng bộ `searchQuery` xuống tất cả các màn hình.

### 2. Tự Động Ẩn Phiếu Sự Cố Sau Khi Xử Lý Xong
* Mặc định tab lọc của `TicketsView.jsx` chuyển thành `PENDING` (Chỉ hiển thị phiếu *Mới* và *Đang xử lý*).
* Khi Quản trị viên cập nhật trạng thái phiếu thành `DaXuLy` (Đã xử lý), hệ thống đồng bộ lại từ cơ sở dữ liệu và phiếu tự động biến mất khỏi danh sách chờ xử lý, giúp màn hình luôn gọn gàng.

### 3. Hiển Thị Số Lượng Thiết Bị Đang Hoạt Động Tốt Ở Sidebar
* Thẻ trạng thái góc dưới bên trái của `Sidebar.jsx` được nâng cấp hiển thị số lượng thiết bị hoạt động tốt: `{goodDevicesCount} / {totalDevicesCount} thiết bị tốt` (đồng bộ trực tiếp từ API backend).
* Đồng thời hiển thị badge cảnh báo số thiết bị lỗi (`{brokenDevicesCount} lỗi`) và số phiếu cần xử lý (`{pendingTicketsCount} phiếu`).

### 4. Bổ Sung Tính Năng Xóa Lịch Học (Delete Schedule)
* **Backend**: Thêm endpoint `DELETE /api/booking/schedule/{ma_lich}` trong `booking.py` và hàm `delete_schedule(session, ma_lich)` trong `bookingService.py`.
* **Frontend**: Thêm nút xóa (biểu tượng thùng rác `Trash2`) trên từng thẻ môn học trong `ScheduleView.jsx`.
* **Hộp thoại xác nhận**: Khi nhấn xóa, hiển thị Dialog Modal hỏi rõ: *"Bạn có chắc chắn muốn xóa lịch học này khỏi hệ thống không?"* trước khi thực thi.

### 5. Tinh Gọn Tiêu Đề Các Màn Hình (Chỉ Giữ Lại 1 Tiêu Đề Lớn)
* Loại bỏ toàn bộ các dòng chữ phụ, badge nhỏ trên/dưới tiêu đề tại `ScheduleView.jsx`, `RoomsView.jsx`, `DevicesView.jsx`, `EnergyView.jsx`. Giữ lại đúng một tiêu đề `<h1>` lớn, trang nhã và rõ ràng.

---

## 📌 Phiên Bản: v1.3.0 (28/10/2026) - Nâng Cấp Neon DB, Modal Xác Nhận & Sửa Lỗi Duyệt Lịch

### 1. Nạp Toàn Bộ Dữ Liệu Thực Tế Lên Neon Cloud PostgreSQL
* **Kịch bản khởi tạo (`seed_neon_full.py`)**: Đã kết nối và nạp dữ liệu hoàn chỉnh lên cơ sở dữ liệu Neon PostgreSQL:
  - **16 Phòng học** đầy đủ thông số thực tế trải dài các Tòa A, B, C, D (từ Tầng 1 đến Tầng 3).
  - **14 Thiết bị chính** (Điều hòa công suất lớn, máy chiếu laser, dàn máy tính thực hành Lab, quạt thông gió).
  - **11 Lịch phòng** (Lớp học lý thuyết chính khóa `HOC` và mượn phòng sinh hoạt/hội thảo `MUON`).
  - **5 Yêu cầu mượn phòng** (`ChoDuyet`, `DaDuyet`, `TuChoi`) của sinh viên và giảng viên.
  - **4 Phiếu báo sự cố** (Các trạng thái: Mới tiếp nhận, Đang xử lý, Đã hoàn tất).
  - **9 Bản ghi tiêu thụ điện năng** kèm 2 trường hợp phát hiện lãng phí điện năng (`Idle Waste Alert`).

### 2. Loại Bỏ Hoàn Toàn Dữ Liệu Rác / Mock Fallbacks Trên Frontend
* **Không còn Mock Data ảo**:
  - Gỡ bỏ toàn bộ việc inject dữ liệu fallback của `mockCampusData` trong các view: `RoomsView.jsx`, `ScheduleView.jsx`, `DevicesView.jsx`, `TicketsView.jsx`, `EnergyView.jsx` và `App.jsx`.
  - Tầng dịch vụ `Smart-campus-frontEnd/src/services/api.js` được cấu hình trả về mảng rỗng `[]` khi chưa có dữ liệu thay vì tự ý nhét các phòng giả lập không tồn tại trên Neon DB.
  - Toàn bộ giao diện người dùng hiển thị 100% dữ liệu thực tế từ cơ sở dữ liệu Neon.

### 3. Sửa Triệt Để Lỗi "Duyệt Đúp Đôi" (Duplicate Schedule on Approve)
* **Nguyên nhân gốc rễ (Root Cause)**:
  1. *Lỗi Backend*: Trong `bookingService.py`, dòng lệnh `from app.service.chatBotSvc import campus_cache` phát sinh lỗi `ImportError` vì module không có đối tượng này. Lỗi xảy ra sau khi transaction `session.commit()` đã ghi dữ liệu vào bảng `LichPhong`, khiến request HTTP trả về mã 500.
  2. *Lỗi Frontend*: Do API trả về lỗi, frontend rơi vào block `catch` và đồng thời hàm `handleProcessRequest` tự ý gọi `setSchedules(prev => [generatedSchedule, ...prev])` tạo thêm 1 lịch ảo cục bộ. Khi tải lại trang, cả 2 lịch (1 từ DB và 1 từ state) cùng hiển thị gây trùng lặp hàng loạt.
* **Giải pháp khắc phục**:
  - Xóa bỏ import lỗi trong `bookingService.py`, thay bằng hàm làm mới dữ liệu an toàn có bọc `try-except`.
  - Bổ sung kiểm tra **Idempotency (chống trùng lặp)** tại backend: Nếu yêu cầu đã có lịch hoặc đã được duyệt, từ chối thực hiện lại với mã lỗi HTTP 400.
  - Bỏ hoàn toàn thao tác tự chèn lịch ảo vào state ở frontend; sau khi phê duyệt thành công, gọi `await loadData()` để đồng bộ chính xác dữ liệu từ Neon DB.

### 4. Bổ Sung Hộp Thoại Xác Nhận (Confirmation Dialog Modal Box)
* **Tính năng xác nhận hành động quản trị**:
  - Khi quản trị viên nhấn **"Phê Duyệt"**: Hệ thống mở hộp thoại xác nhận nổi bật với màu xanh Emerald, hỏi rõ: *"Bạn có chắc chắn muốn phê duyệt yêu cầu này không?"*, hiển thị đầy đủ thông tin phòng, ca mượn, ngày mượn, người mượn, số người và mục đích sử dụng.
  - Khi quản trị viên nhấn **"Từ Chối"**: Hệ thống mở hộp thoại cảnh báo với màu đỏ Rose, hỏi rõ: *"Bạn có thực sự muốn hủy bỏ / từ chối yêu cầu này không?"*, đồng thời cung cấp ô nhập lý do từ chối để thông báo cho người nộp đơn.
  - Cung cấp nút **"Hủy Bỏ / Giữ Lại"** để người dùng có thể đóng modal và hủy thao tác bất cứ lúc nào mà không làm thay đổi trạng thái dữ liệu.

### 5. Cơ Chế Gọi Hàm Của Trợ Lý AI (AI Agent Architecture Analysis)
* **Cơ chế hoạt động**:
  - **100% qua Mô Hình Ngôn Ngữ (Agentic Tool Calling)**: Hệ thống **luôn gửi câu hỏi của người dùng tới Gemini AI trước** kèm theo danh sách khai báo công cụ (`FunctionDeclaration`).
  - **Tự động nhận diện ý định (Intent Recognition)**: Gemini đọc hiểu ngữ nghĩa câu hỏi tự nhiên (không dùng regex if-else tĩnh) và tự quyết định:
    + Nếu câu hỏi cần truy vấn DB (tìm phòng trống, kiểm tra lịch học, báo hỏng, kiểm tra lãng phí điện): Gemini trả về `function_calls`. Backend nhận lệnh và thực thi hàm tương ứng với cơ sở dữ liệu Neon.
    + Nếu câu hỏi thông thường (chào hỏi, hỏi đáp chính sách): Gemini trả về câu trả lời dạng văn bản trực tiếp `response.text`.
  - **Đảm bảo tính linh hoạt**: Mô hình hiểu được hàng ngàn cách diễn đạt khác nhau của người dùng tiếng Việt mà không cần lập trình viên phải liệt kê trước các từ khóa gợi ý.

---

## 📌 Phiên Bản: v1.2.0 (28/10/2026) - Khởi Tạo Monorepo & Chuẩn Hóa Kiến Trúc

### 1. Đồng Bộ & Cấu Trúc Monorepo
* **Chuyển đổi sang Monorepo**: Gom toàn bộ `Smart-campus-frontEnd` và `Smart-campus-backEnd` vào một repository duy nhất: [JxctDongPhuong/TPPB-Smart-campus](https://github.com/JxctDongPhuong/TPPB-Smart-campus).
* **Làm sạch lịch sử Git (GitHub Push Protection)**: 
  * Sử dụng `git filter-branch` để loại bỏ hoàn toàn các file `.env` và database cũ khỏi lịch sử commit trước đây để vượt qua cơ chế kiểm duyệt bảo mật của GitHub.
  * Cấu hình lại `.gitignore` ở thư mục gốc và các thư mục con để ngăn chặn rò rỉ API key, file bí mật và thư mục build (`node_modules`, `dist`, `__pycache__`).

### 2. Sửa Lỗi & Nâng Cấp Backend (FastAPI + SQLModel)
* **Sửa lỗi cú pháp `booking.py`**: Bổ sung lời gọi `return bookingService.get_schedules(session, ma_phong=ma_phong, ngay=ngay)` tại endpoint tra cứu thời khóa biểu.
* **Bổ sung Alias Endpoints AI**: Thêm alias route `@router.get("/analyze")` và `@router.get("/suggestions")` song song với route `/analyzize` cũ để tương thích với tất cả các client frontend.
* **Kiểm thử kết nối Neon PostgreSQL**:
  * Kiểm tra thành công kết nối tới cơ sở dữ liệu đám mây **Neon PostgreSQL** qua connection string `NEON_API_DB`.
  * Xác nhận toàn bộ 7 bảng dữ liệu (`phong`, `thietbi`, `lichphong`, `diennang`, `phieubaohong`, `taikhoan`, `coso`) truy vấn và ghi dữ liệu ổn định 100%.

### 3. Đóng Gói Docker & CI/CD Pipeline
* **Tạo Frontend Dockerfile & Nginx**: Tạo multi-stage build Node.js + Nginx Alpine phục vụ giao diện tĩnh và định tuyến SPA mượt mà qua `nginx.conf`.
* **Tạo Docker Compose tổng**: Quản lý cả 2 service Backend (`8000:8000`) và Frontend (`3000:80`) qua file `docker-compose.yaml`.
* **Tối ưu GitHub Actions**: Rút gọn file `.github/workflows/deploy.yaml` thành luồng CI/CD chuẩn, tự động build và push image lên Docker Hub khi người dùng nhập secret `DOCKERHUB_USERNAME` và `DOCKERHUB_TOKEN`.

---

## 🔮 Kế Hoạch Mở Rộng Tiếp Theo (Upcoming Tasks & Roadmap)

### Giai Đoạn 2: Tích Hợp Phần Cứng IoT & Tự Động Hóa
1. **Giao thức MQTT / WebSocket**:
   - Xây dựng broker MQTT (Mosquitto hoặc EMQX) để kết nối công tắc rơ-le (Relay) và cảm biến PIR phát hiện chuyển động.
   - Khi phát hiện phòng không có người trong 15 phút, AI tự động phát lệnh tắt điều hòa và đèn qua MQTT.
2. **Hệ Thống Phân Quyền (RBAC)**:
   - Tích hợp JWT Authentication cho 3 nhóm người dùng:
     * *Sinh viên*: Chỉ tra cứu phòng trống và gửi yêu cầu mượn phòng / báo hỏng.
     * *Giảng viên*: Đặt phòng ưu tiên và quản lý lịch dạy.
     * *Ban quản lý (Admin)*: Toàn quyền duyệt lịch, quản lý tài sản và cấu hình thiết bị.
