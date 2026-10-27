# 🏫 TPPB Smart Campus Management System

Hệ thống Quản lý Cơ sở Vật chất, Tối ưu Năng lượng & Trợ lý Điều hành AI dành cho Smart Campus trường đại học.  
Dự án được xây dựng theo kiến trúc hiện đại **Monorepo**, tách biệt độc lập giữa **FastAPI Backend (REST API + PostgreSQL Neon)** và **React Vite Frontend**, giao tiếp hoàn toàn qua HTTP/JSON và sẵn sàng mở rộng phần cứng IoT.

---

## 🏗️ 1. Kiến Trúc & Công Nghệ

```
                                    +-----------------------------------+
                                    |       React Vite Frontend         |
                                    |    (Tailwind CSS + Lucide Icons)  |
                                    +-----------------+-----------------+
                                                      |
                                             REST API (JSON / CORS)
                                                      |
                                    +-----------------v-----------------+
                                    |       FastAPI REST Backend        |
                                    |     (Python 3.11 + SQLModel)      |
                                    +--------+-----------------+--------+
                                             |                 |
                   +-------------------------+                 +-------------------------+
                   |                                                                     |
         +---------v---------+                                                 +---------v---------+
         | Neon PostgreSQL DB|                                                 |  Google Gemini AI |
         |   (Cloud Database)|                                                 |  (gemini-3.1-lite)|
         +-------------------+                                                 +-------------------+
```

### Công Nghệ Sử Dụng:
* **Backend**: FastAPI, SQLModel (SQLAlchemy 2.0), Pydantic v2, PostgreSQL (Neon Cloud), Google GenAI SDK.
* **Frontend**: React 18, Vite 6, Tailwind CSS v3, Lucide React, Nginx.
* **DevOps & CI/CD**: Docker, Docker Compose, GitHub Actions.

---

## 🚀 2. Hướng Dẫn Cài Đặt & Chạy Dự Án

### Cách 1: Chạy Cục Bộ (Local Development)

#### Bước 1: Khởi động Backend
1. Di chuyển vào thư mục backend và tạo môi trường ảo:
   ```bash
   cd Smart-campus-backEnd
   python -m venv venv
   ```
2. Kích hoạt môi trường ảo:
   * **Windows**: `venv\Scripts\activate`
   * **Linux/Mac**: `source venv/bin/activate`
3. Cài đặt các thư viện phụ thuộc:
   ```bash
   pip install -r requirements.txt
   ```
4. Cấu hình file `.env` trong thư mục `Smart-campus-backEnd/`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   NEON_API_DB=postgresql://user:password@ep-xxxx.neon.tech/neondb?sslmode=require
   ```
5. Chạy server backend:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   * Tài liệu API Swagger: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### Bước 2: Khởi động Frontend
1. Mở một terminal mới và di chuyển vào thư mục frontend:
   ```bash
   cd Smart-campus-frontEnd
   ```
2. Cài đặt các gói npm:
   ```bash
   npm install
   ```
3. Cấu hình file `.env` trong thư mục `Smart-campus-frontEnd/`:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000
   ```
4. Khởi chạy giao diện web:
   ```bash
   npm run dev
   ```
   * Giao diện Dashboard: [http://localhost:3000](http://localhost:3000)

---

### Cách 2: Chạy Bằng Docker & Docker Compose

Dự án đã được đóng gói sẵn file `docker-compose.yaml` ở thư mục gốc để khởi động toàn bộ hệ sinh thái chỉ với 1 câu lệnh:

```bash
docker compose up --build
```

* **Frontend**: [http://localhost:3000](http://localhost:3000)
* **Backend**: [http://localhost:8000](http://localhost:8000)

---

## 📋 3. Danh Sách Phân Hệ & Tính Năng

| Phân hệ | Màn hình / Component | API Backend tương ứng | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Trợ lý AI Copilot** | `AiChatModal.jsx` | `POST /api/ai/chat` | ✅ Hoạt động (Multi-turn + Tool calling) |
| **Tối ưu năng lượng AI** | `AiRecommendations.jsx` | `GET /api/ai/analyze` | ✅ Hoạt động (Gemini 3.1 Live) |
| **Cảnh báo lãng phí điện**| `AiInsightBanner.jsx` | `GET /api/metrics/waste-alerts` | ✅ Hoạt động (Thuật toán Idle Waste) |
| **Quản lý phòng học** | `RoomsView.jsx` | `GET /api/rooms/`, `POST`, `PUT`, `DELETE` | ✅ Hoạt động đầy đủ CRUD với Neon DB |
| **Lịch & Mượn phòng** | `ScheduleView.jsx` | `GET /api/booking/schedule`, `requests` | ✅ Hoạt động (Tra cứu ca học & duyệt mượn) |
| **Quản lý thiết bị** | `DevicesView.jsx` | `GET /api/devices/`, `POST /devices/batch` | ✅ Hoạt động (Quản lý kho & thêm theo lô) |
| **Sự cố & Báo hỏng** | `TicketsView.jsx` | `GET /api/devices/reports`, `POST`, `PUT` | ✅ Hoạt động (Tiếp nhận và xử lý sự cố) |
| **Sơ đồ không gian** | `RoomPlanView.jsx` | `GET /api/rooms/`, `devices`, `schedule` | ✅ Hoạt động (Inspector Drawer tương tác) |
| **IoT Telemetry theo giờ**| `OccupancyChart.jsx` | Chưa có phần cứng Stream | ⏱️ Gắn nhãn `[FUTURE]` |
| **Phân rã phụ tải điện**| `EnergyDonut.jsx` | Chưa có Sub-metering | ⏱️ Gắn nhãn `[FUTURE]` |
| **Công tắc Relay phần cứng**| `RoomDetailDrawer.jsx` | Chưa có MQTT Relay | ⏱️ Gắn nhãn `[FUTURE]` |

---

## 🔄 4. Tích Hợp CI / CD Pipeline

Workflow tại [.github/workflows/deploy.yaml](.github/workflows/deploy.yaml) tự động kích hoạt khi có commit lên nhánh `main`/`master`:
1. Tự động build Docker Image cho Backend và Frontend.
2. Tự động đẩy lên Docker Hub:
   * `[DOCKERHUB_USERNAME]/smart-campus-backend:1.0`
   * `[DOCKERHUB_USERNAME]/smart-campus-frontend:1.0`

> **Lưu ý cấu hình**: Vào repository GitHub -> **Settings -> Secrets and variables -> Actions** và thêm 2 biến:
> * `DOCKERHUB_USERNAME`
> * `DOCKERHUB_TOKEN`
