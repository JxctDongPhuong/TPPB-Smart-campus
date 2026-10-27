# UI/UX WORKFLOW & DESIGN SYSTEM SPECIFICATION
## Dự án: NEXUS SMART CAMPUS - Operations & Monitoring Portal

> **Tài liệu quy chuẩn thiết kế, kiến trúc component, design tokens và luồng tương tác của hệ thống quản lý khuôn viên trường học thông minh.**

---

## 1. TỔNG QUAN & ĐỊNH HƯỚNG SẢN PHẨM (PRODUCT VISION)

* **Mục tiêu:** Cung cấp cho Ban Quản lý Tòa nhà & Quản trị viên Trường học một trung tâm giám sát & điều hành vận hành (Campus Operations Center - NOC) theo thời gian thực.
* **Vấn đề của bản phác thảo cũ (AI-generated bias):**
  - Banner Hero ảnh khổng lồ chiếm 35% diện tích vô ích, thiếu tính thực chiến.
  - Sơ đồ phòng học (Floor plan) phẳng lì, chưa tối ưu cho thao tác điều khiển thiết bị IoT (điều hòa, máy chiếu, cảm biến).
  - Thiếu tính phân cấp thị giác (visual hierarchy) giữa các chỉ số vận hành và cảnh báo khẩn cấp.
* **Định hướng UI/UX mới (Modern SaaS / Industrial IoT Standard):**
  - **Data-dense nhưng thoáng đãng:** Tận dụng whitespace thông minh, phân chia grid 12 cột mạch lạc.
  - **Live Telemetry & Interactive Blueprint:** Sơ đồ tầng trực quan, tương tác click/hover từng phòng xem tức thì cảm biến môi trường (nhiệt độ, CO2, độ ẩm), lịch học và trạng thái thiết bị.
  - **Actionable AI (Nexus Intelligence):** Các gợi ý tiết kiệm điện/tối ưu phòng học có nút bấm hành động cụ thể ("Áp dụng ngay", "Xem chi tiết"), không chỉ là văn bản tĩnh.

---

## 2. DESIGN SYSTEM & TOKENS

### 2.1. Bảng màu (Color Palette)

| Token | Tên vai trò | Hex Code | Ứng dụng |
|---|---|---|---|
| `bg-slate-50` | Base Background | `#F8FAFC` | Nền toàn bộ ứng dụng |
| `bg-white` | Card Surface | `#FFFFFF` | Thẻ container widget, popover, modal |
| `brand-primary` | Nexus Primary Blue | `#2563EB` / `#1D4ED8` | Trạng thái active, primary button, logo |
| `status-success` | Emerald Active | `#10B981` | Phòng đang dùng, cảm biến online, tiết kiệm điện |
| `status-warning` | Amber Alert | `#F59E0B` | Cảnh báo mức trung bình, phòng sắp hết giờ |
| `status-danger` | Rose Critical | `#EF4444` | Sự cố khẩn cấp, nhiệt độ/quá tải bất thường |
| `status-neutral` | Slate Standby | `#64748B` | Phòng trống, thiết bị tắt, text phụ |
| `ai-purple` | Intelligence Violet | `#8B5CF6` / `#7C3AED` | Điểm nhấn AI Copilot, thuật toán tối ưu |

### 2.2. Typography & Numbers
* **Font Family:** `Inter`, `Plus Jakarta Sans`, system-ui.
* **Data & Telemetry:** Sử dụng `tabular-nums` và `font-mono` cho các thông số công suất (kWh), nhiệt độ (°C), thời gian (HH:mm) để tránh giật số khi cập nhật real-time.
* **Heading Scale:**
  - H1 (Trang chính): `text-2xl font-bold tracking-tight text-slate-900`
  - H2 (Section Title): `text-base font-semibold text-slate-800`
  - Subtext / Meta: `text-xs font-medium text-slate-500`

### 2.3. Hiệu ứng & Micro-interactions
* **Border:** `border border-slate-200/80` mảnh sắc nét.
* **Shadow:** `shadow-sm hover:shadow-md transition-all duration-200`.
* **State Pill:** Bo góc cong chuẩn SaaS (`rounded-lg` và `rounded-full`).

---

## 3. KIẾN TRÚC THÀNH PHẦN (COMPONENT ARCHITECTURE)

```
src/
├── assets/
│   └── icons/
├── components/
│   ├── common/
│   │   ├── Badge.jsx             # Pill nhãn trạng thái (Success, Warning, Danger, AI)
│   │   ├── Button.jsx            # Nút bấm đa năng (Primary, Secondary, Ghost, Outline)
│   │   └── Card.jsx              # Khung thẻ container dùng chung chuẩn shadow/border
│   ├── layout/
│   │   ├── Sidebar.jsx           # Cột điều hướng cố định (Navigation, Campus Status, User)
│   │   └── Header.jsx            # Thanh tìm kiếm Command (⌘K), Notifications, Quick Filters
│   ├── dashboard/
│   │   ├── LiveStatusBar.jsx     # Thanh trạng thái vận hành nhanh (thay thế Hero Banner cồng kềnh)
│   │   ├── MetricCards.jsx       # 4 thẻ thống kê vận hành (Phòng, Thiết bị, Điện năng, Cảnh báo)
│   │   ├── AiInsightBanner.jsx   # Banner gợi ý tối ưu thông minh từ Nexus AI
│   │   ├── OccupancyChart.jsx    # Biểu đồ công suất sử dụng theo thời gian thực (Area Chart)
│   │   ├── EnergyDonut.jsx       # Biểu đồ phân bổ năng lượng (HVAC, Chiếu sáng, Thiết bị)
│   │   ├── AiRecommendations.jsx # Danh sách đề xuất tối ưu hóa có thể thực thi
│   │   └── AlertsList.jsx        # Danh sách sự cố & cảnh báo gần nhất phân cấp mức độ
│   └── floorplan/
│       ├── FloorPlanViewer.jsx   # Sơ đồ kiến trúc tầng 1 tương tác trực quan
│       ├── RoomTile.jsx          # Ô phòng học với trạng thái live, sĩ số, nhiệt độ
│       └── RoomDetailDrawer.jsx  # Drawer chi tiết phòng học (C101) & bảng thiết bị IoT
├── data/
│   └── mockCampusData.js         # Dữ liệu mô phỏng đầy đủ chuẩn API backend
├── App.jsx                       # Master Layout ráp nối toàn bộ Dashboard
├── index.css                     # Cấu hình Tailwind CSS & custom utilities
└── main.jsx                      # React Root mounting
```

---

---

## 4. KIẾN TRÚC KẾT NỐI API & DATABASE (CLOUD & LOCAL TEST)

* **Cơ chế kết nối:**
  - Frontend giao tiếp 100% với Backend thông qua RESTful API chuẩn JSON.
  - Sử dụng biến môi trường `VITE_API_BASE_URL` trong file `.env` (mặc định trỏ về `http://127.0.0.1:8000` khi test local, hoặc URL Cloud API như Render/Fly.io/AWS khi deploy).
  - **Tích hợp cơ chế Hybrid Mode (Auto-Fallback):** Khi Backend chưa khởi động hoặc gặp lỗi mạng trong quá trình test, frontend tự động chuyển sang dữ liệu Mock phong phú, đảm bảo giao diện luôn hiển thị trực quan và mượt mà mà không bị crash hay trống dữ liệu.

* **Bản đồ API Endpoints đối ứng với Backend:**
  - `GET /rooms/?toa=A&tang=1`: Lấy danh sách phòng học và trạng thái theo tầng/tòa nhà.
  - `GET /rooms/{ma_phong}`: Lấy chi tiết thông số phòng (sức chứa, loại phòng).
  - `GET /devices/?ma_phong={ma_phong}`: Lấy danh sách thiết bị IoT trong phòng.
  - `GET /metrics/summary`: Lấy số liệu tiêu thụ điện năng tổng hợp và biểu đồ xu hướng.
  - `GET /metrics/waste-alerts`: Lấy danh sách cảnh báo lãng phí điện năng (Nexus AI).
  - `GET /devices/reports`: Lấy danh sách sự cố và yêu cầu báo hỏng khẩn cấp.
  - `GET /ai/analize`: Lấy các đề xuất tối ưu hóa thông minh từ AI Agent.
  - `POST /ai/chat`: Tương tác trò chuyện với Nexus AI Copilot.

---

## 5. QUY TRÌNH THỰC THI (WORKFLOW STEP-BY-STEP)

### Bước 1: Khởi tạo Project & Cài đặt Dependencies
- Tạo dự án React hiện đại bằng **Vite**.
- Cài đặt **Tailwind CSS**, **Lucide React** (bộ icon cao cấp chuẩn công nghiệp), và các tiện ích quản lý class `clsx`, `tailwind-merge`.

### Bước 2: Xây dựng Tầng API Client & Mock Data Fallback
- Xây dựng module `src/services/api.js` với các hàm gọi API chuẩn FastAPI backend.
- Tạo file `.env` chứa `VITE_API_BASE_URL=http://127.0.0.1:8000`.
- Thiết lập dữ liệu Mock chi tiết cho Tòa A, Tòa B, Tầng 1 (phòng C101, B101, A101...), biểu đồ năng lượng và các cảnh báo sự cố.

### Bước 3: Phát triển Layout Framework & Design System
- Hoàn thiện `Sidebar.jsx` với badge đếm và trạng thái hệ thống `● 148 cảm biến trực tuyến`.
- Hoàn thiện `Header.jsx` với ô tìm kiếm có phím tắt `⌘K`.

### Bước 4: Xây dựng Trung tâm Bản đồ Tầng (Floor Plan Interactive Core)
- Xây dựng sơ đồ mặt bằng Tầng 1 dạng blueprint kiến trúc hiện đại:
  - Phân chia khu Tòa B, Tòa C, Sảnh trung tâm, Tòa A, Tòa D.
  - Trạng thái rõ ràng: Đang học (xanh lá), Phòng trống (xám), Có cảnh báo (cam/đỏ).
  - Click chọn phòng sẽ mở Drawer hoặc Panel chi tiết ngay bên cạnh (hiển thị đầy đủ thiết bị máy chiếu, điều hòa 24°C, nhiệt độ, độ ẩm).

### Bước 5: Hoàn thiện Dashboard Analytics & AI Insights
- Tích hợp 4 Thẻ KPI với mini sparklines.
- Biểu đồ công suất sử dụng (Occupancy rate) & thanh tiến độ từng tòa nhà.
- Biểu đồ tròn phân bổ năng lượng 8.2k kWh.
- Widget Đề xuất thông minh & Cảnh báo gần đây.

### Bước 6: Kiểm thử trải nghiệm người dùng & Sẵn sàng kết nối Backend
- Đảm bảo độ mượt mà khi lọc tầng, chọn phòng, tương tác với thiết bị.
- Hỗ trợ đổi cấu hình API endpoint linh hoạt khi chuyển database lên Cloud.
