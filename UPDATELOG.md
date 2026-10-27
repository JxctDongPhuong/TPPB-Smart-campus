# 📝 Nhật Ký Cập Nhật (Updatelog) - TPPB Smart Campus

Tài liệu ghi lại toàn bộ các thay đổi kiến trúc, sửa lỗi, kết nối API và kế hoạch mở rộng tiếp theo của dự án.

---

## 📌 Phiên Bản Hiện Tại: v1.2.0 (28/10/2026)

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

### 3. Đồng Bộ Toàn Bộ Giao Diện UI & Kết Nối API
* **Đồng bộ toàn bộ các View quản trị**:
  * `RoomsView.jsx`: Thêm, xóa, sửa, tìm kiếm phòng học kết nối trực tiếp `/api/rooms/`.
  * `ScheduleView.jsx`: Tra cứu thời khóa biểu, nộp đơn mượn phòng và xét duyệt yêu cầu kết nối `/api/booking/`.
  * `DevicesView.jsx`: Quản lý kho thiết bị, lọc theo trạng thái và thêm thiết bị theo lô kết nối `/api/devices/`.
  * `TicketsView.jsx`: Tiếp nhận và cập nhật tiến độ xử lý sự cố thiết bị kết nối `/api/devices/reports`.
  * `EnergyView.jsx`: Theo dõi tổng điện năng tiêu thụ và cảnh báo lãng phí qua `/api/metrics/`.
  * `RoomPlanView.jsx`: Bản đồ mặt bằng tòa nhà tương tác kèm bảng Inspector Drawer xem chi tiết từng phòng.
* **Nâng cấp Trợ lý AI Copilot (`AiChatModal.jsx`)**:
  * Nâng cấp lên cơ chế hội thoại đa lượt (**Multi-turn conversation**) với Gemini 3.1 Flash Lite.
  * Chuẩn hóa cấu trúc `history` `{ role: 'user' | 'assistant', content: string }`.
  * Kiểm thử thành công công cụ gọi tự động (**Function Calling / Tool Use**): tra cứu phòng trống `tim_phong_trong`, phân tích lãng phí điện `kiem_tra_lang_phi_dien`, tiếp nhận sự cố `bao_hong_thiet_bi`.
* **Loại bỏ Hardcode & Khả năng mở rộng (Scalability)**:
  * Không còn dữ liệu tĩnh gán chết trong code; toàn bộ đều đọc từ API backend và cơ sở dữ liệu.
  * Khi mất kết nối hoặc server đang khởi động lại (cold start), tầng Adapter `api.js` tự động fallback mượt mà về dữ liệu mẫu để giao diện không bị crash.

### 4. Gắn Nhãn Rõ Ràng Các Tính Năng Chưa Có Phần Cứng `[FUTURE]`
* **Biểu đồ tỷ lệ chiếm dụng phòng theo từng giờ** (`OccupancyChart.jsx`): Gắn nhãn `[Future • IoT Telemetry]` vì cần thiết bị cảm biến người thời gian thực.
* **Biểu đồ phân bổ điện năng dạng Donut** (`EnergyDonut.jsx`): Gắn nhãn `[Future • Sub-metering]` vì cần công tơ phụ cho từng nhánh điều hòa / đèn / máy tính.
* **Công tắc bật/tắt thiết bị** (`RoomDetailDrawer.jsx`): Gắn nhãn `[Future • Relay Switch]` để chuẩn bị tích hợp rơ-le thông minh.

### 5. Đóng Gói Docker & CI/CD Pipeline
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
3. **Mở Rộng Module Xuất Báo Cáo**:
   - Thêm endpoint backend `/api/reports/export` để kết xuất số liệu tiêu thụ điện năng và tỷ lệ sử dụng phòng ra định dạng PDF và Excel (.xlsx).
4. **Cơ Chế Caching Nâng Cao**:
   - Thêm Redis Cache cho các truy vấn danh sách phòng học và thời khóa biểu để giảm tải kết nối tới Neon PostgreSQL khi số lượng sinh viên truy cập đồng thời tăng cao.
