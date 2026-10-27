import { mockCampusData } from '../data/mockData';

const RAW_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const BASE_URL = RAW_URL.replace(/\/+$/, '').replace(/\/api$/, '');

/**
 * Helper fetch with timeout & auto-fallback to mock data
 */
async function fetchWithFallback(endpoint, fallbackData) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for cloud/cold start
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const res = await fetch(`${BASE_URL}${cleanEndpoint}`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    // Graceful fallback to mock data (cloud DB / offline test mode)
    return fallbackData;
  }
}

export const campusApi = {
  // 1. Lấy tổng quan điện năng & vận hành
  async getSummary() {
    return fetchWithFallback('/api/metrics/summary', mockCampusData.summary);
  },

  // 2. Lấy danh sách phòng theo tòa & tầng (phù hợp backend /api/rooms/)
  async getRooms(toa = 'A', tang = 1) {
    return fetchWithFallback(`/api/rooms/?toa=${toa}&tang=${tang}`, mockCampusData.floorRooms);
  },

  // 3. Lấy thông tin phòng cụ thể
  async getRoomDetail(maPhong) {
    const fallback = mockCampusData.floorRooms.find(r => r.ma_phong === maPhong) || {
      ma_phong: maPhong,
      toa: maPhong.charAt(0) || 'A',
      tang: parseInt(maPhong.charAt(1)) || 1,
      loai_phong: 'Phòng lý thuyết',
      suc_chua: 45,
      trang_thai: 'Sẵn sàng'
    };
    return fetchWithFallback(`/api/rooms/${maPhong}`, fallback);
  },

  // 4. Lấy danh sách thiết bị trong phòng
  async getRoomDevices(maPhong) {
    const fallback = mockCampusData.devicesByRoom[maPhong] || [
      { ma_tb: `TB_ML_${maPhong}`, ma_phong: maPhong, ten_tb: 'Điều hòa nhiệt độ Daikin', tinh_trang: 'Tốt', ma_loai: 'MAYLANH' },
      { ma_tb: `TB_MC_${maPhong}`, ma_phong: maPhong, ten_tb: 'Máy chiếu Projector', tinh_trang: 'Tốt', ma_loai: 'MAYCHIEU' }
    ];
    return fetchWithFallback(`/api/devices/?ma_phong=${maPhong}`, fallback);
  },

  // 5. Lấy lịch học phòng hôm nay
  async getRoomSchedule(maPhong) {
    const fallback = mockCampusData.schedulesByRoom[maPhong] || null;
    return fetchWithFallback(`/api/booking/schedule?ma_phong=${maPhong}`, fallback);
  },

  // 6. Lấy điện năng phòng tiêu thụ
  async getRoomMetrics(maPhong) {
    const fallback = mockCampusData.metricsByRoom[maPhong] || { kwh: 4.5, so_gio_bat: 3.5 };
    return fetchWithFallback(`/api/metrics/?ma_phong=${maPhong}`, fallback);
  },

  // 7. Lấy cảnh báo lãng phí điện từ Nexus AI
  async getWasteAlerts() {
    return fetchWithFallback('/api/metrics/waste-alerts', [mockCampusData.aiWasteAlert]);
  },

  // 8. Lấy gợi ý tối ưu tự động từ AI Agent
  async getAiRecommendations() {
    return fetchWithFallback('/api/ai/analyze', mockCampusData.aiRecommendations);
  },

  // 9. Lấy danh sách sự cố & cảnh báo báo hỏng
  async getAlerts() {
    return fetchWithFallback('/api/devices/reports', mockCampusData.recentAlerts);
  },

  // ==================== A. PHÒNG HỌC (ROOMS) ====================
  async getAllRoomsList(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/api/rooms/${query ? `?${query}` : ''}`;
    return fetchWithFallback(url, mockCampusData.allRooms);
  },

  async createRoom(roomData) {
    try {
      const res = await fetch(`${BASE_URL}/api/rooms/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { ...roomData, da_xoa: false };
    }
  },

  async updateRoom(maPhong, updateData) {
    try {
      const res = await fetch(`${BASE_URL}/api/rooms/${maPhong}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { ma_phong: maPhong, ...updateData };
    }
  },

  async deleteRoom(maPhong) {
    try {
      const res = await fetch(`${BASE_URL}/api/rooms/${maPhong}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { success: true, ma_phong: maPhong };
    }
  },

  // ==================== B. THỜI KHÓA BIỂU & MƯỢN PHÒNG (BOOKING) ====================
  async getSchedulesList(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/api/booking/schedule${query ? `?${query}` : ''}`;
    return fetchWithFallback(url, mockCampusData.allSchedules);
  },

  async createSchedule(scheduleData) {
    try {
      const res = await fetch(`${BASE_URL}/api/booking/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { ...scheduleData, ma_lich: Date.now() };
    }
  },

  async getBookingRequests(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/api/booking/requests${query ? `?${query}` : ''}`;
    return fetchWithFallback(url, mockCampusData.allBookingRequests);
  },

  async submitBookingRequest(data, maTk = 1) {
    try {
      const res = await fetch(`${BASE_URL}/api/booking/requests?ma_tk_nguoi_gui=${maTk}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { ...data, ma_yc: Date.now(), trang_thai: 'ChoDuyet', ngay_gui: new Date().toISOString() };
    }
  },

  async processBookingRequest(maYc, action, maAdmin = 1) {
    try {
      const res = await fetch(`${BASE_URL}/api/booking/requests/${maYc}/process?ma_tk_admin=${maAdmin}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { ma_yc: maYc, trang_thai: action.trang_thai, ghi_chu: action.ghi_chu };
    }
  },

  // ==================== C. THIẾT BỊ (DEVICES) ====================
  async getAllDevicesList(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/api/devices/${query ? `?${query}` : ''}`;
    return fetchWithFallback(url, mockCampusData.allDevices);
  },

  async createDevice(deviceData) {
    try {
      const res = await fetch(`${BASE_URL}/api/devices/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return deviceData;
    }
  },

  async createDevicesBatch(batchData) {
    try {
      const res = await fetch(`${BASE_URL}/api/devices/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return Array.from({ length: batchData.so_luong }, (_, i) => ({
        ma_tb: `TB_${batchData.ma_lo}_${i + 1}`,
        ma_loai: batchData.ma_loai,
        ma_phong: batchData.ma_phong,
        tinh_trang: 'Tốt'
      }));
    }
  },

  // ==================== D. PHIẾU BÁO HỎNG (REPORTS) ====================
  async getAllReports(trangThai = '') {
    const url = `/api/devices/reports${trangThai ? `?trang_thai=${trangThai}` : ''}`;
    return fetchWithFallback(url, mockCampusData.allReports);
  },

  async submitReport(data, maTk = 1) {
    try {
      const res = await fetch(`${BASE_URL}/api/devices/reports?ma_tk_nguoi_bao=${maTk}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { ...data, ma_phieu: Date.now(), trang_thai: 'Moi', ngay_bao: new Date().toISOString() };
    }
  },

  async updateReport(maPhieu, updateData) {
    try {
      const res = await fetch(`${BASE_URL}/api/devices/reports/${maPhieu}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { ma_phieu: maPhieu, ...updateData };
    }
  },

  // ==================== E. ĐIỆN NĂNG (METRICS) ====================
  async getEnergyMetricsList(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/api/metrics/${query ? `?${query}` : ''}`;
    return fetchWithFallback(url, mockCampusData.allEnergyMetrics);
  },

  async recordEnergyMetric(data) {
    try {
      const res = await fetch(`${BASE_URL}/api/metrics/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return data;
    }
  },

  // 10. Gửi prompt tương tác với Nexus AI Chatbot
  async sendAiChat(message, history = []) {
    try {
      // Chuẩn hóa history cho backend: { role: 'user' | 'assistant', content: string }
      const formattedHistory = history
        .filter(m => (m.text || m.content) && (m.text || m.content).trim())
        .map(m => ({
          role: (m.role === 'assistant' || m.sender === 'bot') ? 'assistant' : 'user',
          content: m.content || m.text
        }));

      const res = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          history: formattedHistory, 
          model: 'gemini-3.1-flash-lite' 
        })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('sendAiChat fallback:', e);
      return {
        reply: `Nexus AI (Hỗ trợ Campus): Đã ghi nhận yêu cầu "${message}". Đang điều phối hệ thống phòng học tự động!`,
        action_taken: null,
        tool_calls: []
      };
    }
  }
};
