import { mockCampusData } from '../data/mockData';

const RAW_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const BASE_URL = RAW_URL.replace(/\/+$/, '').replace(/\/api$/, '');

/**
 * Helper fetch with timeout & clean fallback
 */
async function fetchWithFallback(endpoint, fallbackData = []) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout for cloud cold start
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const res = await fetch(`${BASE_URL}${cleanEndpoint}`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[Campus API] Không thể tải dữ liệu từ ${endpoint}:`, err.message);
    return fallbackData;
  }
}

export const campusApi = {
  // 1. Lấy tổng quan điện năng & vận hành
  async getSummary() {
    return fetchWithFallback('/api/metrics/summary', {
      totalRooms: 0,
      roomsOccupied: 0,
      roomsAvailable: 0,
      totalKWh: 0.0,
      averageKWhPerRoom: 0.0,
      activeReports: 0,
      wasteAlertsCount: 0,
      systemStatus: 'Trực tuyến'
    });
  },

  // 2. Lấy danh sách phòng theo tòa & tầng (phù hợp backend /api/rooms/)
  async getRooms(toa = 'A', tang = 1) {
    return fetchWithFallback(`/api/rooms/?toa=${toa}&tang=${tang}`, []);
  },

  // 3. Lấy thông tin phòng cụ thể
  async getRoomDetail(maPhong) {
    const defaultRoom = {
      ma_phong: maPhong,
      toa: maPhong ? maPhong.charAt(0) : 'A',
      tang: maPhong && parseInt(maPhong.charAt(1)) ? parseInt(maPhong.charAt(1)) : 1,
      loai_phong: 'Phòng học',
      suc_chua: 40,
      trang_thai: 'Sẵn sàng'
    };
    return fetchWithFallback(`/api/rooms/${maPhong}`, defaultRoom);
  },

  // 4. Lấy danh sách thiết bị trong phòng
  async getRoomDevices(maPhong) {
    return fetchWithFallback(`/api/devices/?ma_phong=${maPhong}`, []);
  },

  // 5. Lấy lịch học phòng hôm nay
  async getRoomSchedule(maPhong) {
    return fetchWithFallback(`/api/booking/schedule?ma_phong=${maPhong}`, null);
  },

  // 6. Lấy điện năng phòng tiêu thụ
  async getRoomMetrics(maPhong) {
    return fetchWithFallback(`/api/metrics/?ma_phong=${maPhong}`, { kwh: 0, so_gio_bat: 0 });
  },

  // 7. Lấy cảnh báo lãng phí điện từ Nexus AI
  async getWasteAlerts() {
    return fetchWithFallback('/api/metrics/waste-alerts', []);
  },

  // 8. Lấy gợi ý tối ưu tự động từ AI Agent
  async getAiRecommendations() {
    return fetchWithFallback('/api/ai/analyze', []);
  },

  // 9. Lấy danh sách sự cố & cảnh báo báo hỏng
  async getAlerts() {
    return fetchWithFallback('/api/devices/reports', []);
  },

  // ==================== A. PHÒNG HỌC (ROOMS) ====================
  async getAllRoomsList(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/api/rooms/${query ? `?${query}` : ''}`;
    return fetchWithFallback(url, []);
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
    return fetchWithFallback(url, []);
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

  async deleteSchedule(maLich) {
    const res = await fetch(`${BASE_URL}/api/booking/schedule/${maLich}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Không thể xóa lịch phòng');
    }
    return await res.json();
  },

  async getBookingRequests(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/api/booking/requests${query ? `?${query}` : ''}`;
    return fetchWithFallback(url, []);
  },

  async submitBookingRequest(data, maTk = 1) {
    try {
      const res = await fetch(`${BASE_URL}/api/booking/requests?ma_tk_nguoi_gui=${maTk}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Lỗi HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error('submitBookingRequest error:', e);
      throw e;
    }
  },

  async processBookingRequest(maYc, action, maAdmin = 1) {
    const res = await fetch(`${BASE_URL}/api/booking/requests/${maYc}/process?ma_tk_admin=${maAdmin}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action)
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.detail || `Lỗi phê duyệt HTTP ${res.status}`);
    }
    return await res.json();
  },

  // ==================== C. THIẾT BỊ (DEVICES) ====================
  async getAllDevicesList(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/api/devices/${query ? `?${query}` : ''}`;
    return fetchWithFallback(url, []);
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
    const serverReports = await fetchWithFallback(url, null);

    let localReports = [];
    try {
      const stored = localStorage.getItem('smart_campus_user_reports');
      if (stored) localReports = JSON.parse(stored);
    } catch (e) {
      console.warn('Cannot read local reports:', e);
    }

    if (serverReports && Array.isArray(serverReports) && serverReports.length > 0) {
      const serverIds = new Set(serverReports.map(r => String(r.ma_phieu || r.id)));
      const unmerged = localReports.filter(r => !serverIds.has(String(r.ma_phieu || r.id)));
      const combined = [...unmerged, ...serverReports];
      return trangThai ? combined.filter(r => r.trang_thai === trangThai) : combined;
    }

    const baseMock = mockCampusData?.allReports || [];
    const baseIds = new Set(baseMock.map(r => String(r.ma_phieu || r.id)));
    const uniqueLocal = localReports.filter(r => !baseIds.has(String(r.ma_phieu || r.id)));
    const fallbackCombined = [...uniqueLocal, ...baseMock];
    return trangThai ? fallbackCombined.filter(r => r.trang_thai === trangThai) : fallbackCombined;
  },

  async submitReport(data, maTk = 1) {
    let result = null;
    try {
      const res = await fetch(`${BASE_URL}/api/devices/reports?ma_tk_nguoi_bao=${maTk}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        result = await res.json();
      }
    } catch (err) {
      console.warn('[Campus API] Submit report server error, saving locally:', err);
    }

    if (!result) {
      result = {
        ...data,
        ma_phieu: Date.now(),
        ma_tk: maTk,
        nguoi_bao_ten: 'Quản trị viên (Admin)',
        trang_thai: 'Moi',
        ngay_bao: new Date().toISOString()
      };
    }

    try {
      const stored = localStorage.getItem('smart_campus_user_reports');
      const list = stored ? JSON.parse(stored) : [];
      const updated = [result, ...list.filter(r => String(r.ma_phieu || r.id) !== String(result.ma_phieu || result.id))];
      localStorage.setItem('smart_campus_user_reports', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('campus_report_created', { detail: result }));
    } catch (e) {
      console.warn('Cannot save report to localStorage:', e);
    }

    return result;
  },

  async updateReport(maPhieu, updateData) {
    let result = null;
    try {
      const res = await fetch(`${BASE_URL}/api/devices/reports/${maPhieu}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        result = await res.json();
      }
    } catch (err) {
      console.warn('[Campus API] Update report server error, updating locally:', err);
    }

    if (!result) {
      result = { ma_phieu: maPhieu, ...updateData };
    }

    try {
      const stored = localStorage.getItem('smart_campus_user_reports');
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.map(r => (String(r.ma_phieu || r.id) === String(maPhieu)) ? { ...r, ...updateData } : r);
        localStorage.setItem('smart_campus_user_reports', JSON.stringify(updated));
      }
      window.dispatchEvent(new CustomEvent('campus_report_updated', { detail: result }));
    } catch (e) {
      console.warn('Cannot update report in localStorage:', e);
    }

    return result;
  },

  // ==================== E. ĐIỆN NĂNG (METRICS) ====================
  async getEnergyMetricsList(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/api/metrics/${query ? `?${query}` : ''}`;
    return fetchWithFallback(url, []);
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
  async sendAiChat(message, history = [], userContext = null) {
    try {
      let activeUser = userContext;
      if (!activeUser || !activeUser.user_role) {
        try {
          const stored = localStorage.getItem('campus_current_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            activeUser = {
              user_id: parsed.ma_tk || (parsed.role?.includes('Giảng viên') ? 2 : 1),
              user_name: parsed.name,
              user_role: parsed.role,
              ...userContext
            };
          }
        } catch (e) {
          console.warn('Cannot read campus_current_user:', e);
        }
      }

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
          user_id: activeUser?.user_id || 1,
          user_name: activeUser?.user_name || 'Ban Quản Lý CSVC',
          user_role: activeUser?.user_role || 'Admin',
          model: 'gemini-3.1-flash-lite' 
        })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('sendAiChat error:', e);
      return {
        reply: `Nexus AI: Tạm thời không thể kết nối tới máy chủ AI (${e.message}). Vui lòng kiểm tra lại dịch vụ Backend.`,
        action_taken: 'error',
        tool_calls: []
      };
    }
  }
};
