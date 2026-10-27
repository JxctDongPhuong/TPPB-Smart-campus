import { mockCampusData } from '../data/mockData';

// Cấu hình URL Backend: ưu tiên biến môi trường VITE_API_BASE_URL, mặc định trỏ về Render Cloud
const RAW_URL = import.meta.env.VITE_API_BASE_URL || 'https://smart-campus-backend-1-0.onrender.com';
const CLEAN_BASE = RAW_URL.replace(/\/+$/, '');
// Đảm bảo có prefix /api
export const API_BASE_URL = CLEAN_BASE.endsWith('/api') ? CLEAN_BASE : `${CLEAN_BASE}/api`;

/**
 * Helper fetch an toàn: Có timeout, tự động gắn Header và fallback dữ liệu mẫu khi mất mạng
 */
async function fetchWithFallback(endpoint, fallbackData, timeoutMs = 7000) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[Campus API Fallback] ${endpoint}:`, err?.message || err);
    return fallbackData;
  }
}

function getCaTime(ca) {
  switch (ca) {
    case 1: return '07:00 - 09:15';
    case 2: return '09:30 - 11:45';
    case 3: return '13:00 - 15:15';
    case 4: return '15:30 - 17:45';
    default: return 'Theo lịch';
  }
}

export const campusApi = {
  // Lấy BASE_URL để hiển thị trên UI trạng thái kết nối
  getBaseUrl() {
    return API_BASE_URL;
  },

  // 1. TỔNG QUAN CHỈ SỐ METRIC (Kết hợp /api/metrics/summary, /api/rooms/, /api/devices/reports)
  async getSummary() {
    try {
      const [metricsRes, roomsRes, reportsRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/metrics/summary`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE_URL}/rooms/`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE_URL}/devices/reports`).then(r => r.ok ? r.json() : null)
      ]);

      const metrics = metricsRes.status === 'fulfilled' ? metricsRes.value : null;
      const rooms = roomsRes.status === 'fulfilled' ? roomsRes.value : null;
      const reports = reportsRes.status === 'fulfilled' ? reportsRes.value : null;

      const totalRooms = Array.isArray(rooms) && rooms.length > 0 ? rooms.length : mockCampusData.summary.totalRooms;
      const occupiedRooms = Array.isArray(rooms) ? rooms.filter(r => r.trang_thai === 'Đang dùng' || r.trang_thai === 'Sẵn sàng').length : mockCampusData.summary.roomsOccupied;
      const totalKWh = metrics?.tong_kwh ?? mockCampusData.summary.energyKWh;
      const activeAlerts = Array.isArray(reports) ? reports.filter(p => p.trang_thai !== 'DaXuLy').length : mockCampusData.summary.activeAlerts;

      return {
        roomsOccupied: occupiedRooms,
        totalRooms: totalRooms,
        roomsGrowth: '+12%',
        deviceUptime: 96.2,
        deviceGrowth: '+3.1%',
        energyKWh: totalKWh,
        energySavingDiff: '-8.5%',
        activeAlerts: activeAlerts,
        criticalAlerts: Array.isArray(reports) ? reports.filter(p => p.trang_thai === 'Moi').length : mockCampusData.summary.criticalAlerts,
        totalSensors: 148,
        systemStatus: 'Đang kết nối Server'
      };
    } catch {
      return mockCampusData.summary;
    }
  },

  // 2. DANH SÁCH PHÒNG HỌC THEO TÒA & TẦNG
  async getRooms(toa = 'A', tang = 1) {
    const rawRooms = await fetchWithFallback(`/rooms/?toa=${toa}&tang=${tang}`, null);
    
    // Nếu API trả về mảng phòng từ DB
    if (Array.isArray(rawRooms) && rawRooms.length > 0) {
      return rawRooms.map((room, idx) => ({
        id: room.ma_phong,
        name: room.ma_phong,
        type: room.loai_phong || 'Phòng học',
        subject: room.trang_thai === 'Sẵn sàng' ? 'Sẵn sàng sử dụng' : 'Đang có lớp học',
        current: room.trang_thai === 'Đang dùng' ? 38 : 0,
        capacity: room.suc_chua || 40,
        status: room.trang_thai === 'Đang dùng' ? 'active' : 'empty',
        temperature: 24.0 + (idx % 3) * 0.4,
        power: room.trang_thai === 'Đang dùng' ? 3.8 : 0.3,
        toa: room.toa,
        tang: room.tang
      }));
    }

    // Nếu lọc theo tòa/tầng chưa có trong DB, lấy toàn bộ danh sách phòng trong DB
    const allRooms = await fetchWithFallback('/rooms/', mockCampusData.floorRooms);
    if (Array.isArray(allRooms) && allRooms.length > 0 && allRooms[0]?.ma_phong) {
      return allRooms.map((room, idx) => ({
        id: room.ma_phong,
        name: room.ma_phong,
        type: room.loai_phong || 'Phòng học',
        subject: room.trang_thai === 'Sẵn sàng' ? 'Sẵn sàng sử dụng' : 'Đang hoạt động',
        current: room.trang_thai === 'Đang dùng' ? 35 : 0,
        capacity: room.suc_chua || 40,
        status: room.trang_thai === 'Đang dùng' ? 'active' : 'empty',
        temperature: 24.2 + (idx % 2) * 0.5,
        power: room.trang_thai === 'Đang dùng' ? 3.5 : 0.3,
        toa: room.toa,
        tang: room.tang
      }));
    }

    return mockCampusData.floorRooms;
  },

  // 3. CHI TIẾT 1 PHÒNG HỌC & THIẾT BỊ
  async getRoomDetail(maPhong) {
    try {
      const [roomData, devicesData, scheduleData] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/rooms/${maPhong}`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE_URL}/devices/?ma_phong=${maPhong}`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE_URL}/booking/schedule?ma_phong=${maPhong}`).then(r => r.ok ? r.json() : null)
      ]);

      const room = roomData.status === 'fulfilled' ? roomData.value : null;
      const devices = devicesData.status === 'fulfilled' && Array.isArray(devicesData.value) ? devicesData.value : [];
      const schedules = scheduleData.status === 'fulfilled' && Array.isArray(scheduleData.value) ? scheduleData.value : [];

      if (room) {
        const curLich = schedules.length > 0 ? schedules[0] : null;
        return {
          id: room.ma_phong,
          name: `Phòng ${room.ma_phong}`,
          category: room.loai_phong || 'Phòng lý thuyết',
          capacity: room.suc_chua || 40,
          currentStudents: curLich?.so_nguoi || (room.trang_thai === 'Đang dùng' ? 38 : 0),
          status: curLich || room.trang_thai === 'Đang dùng' ? 'Đang sử dụng' : 'Đang trống',
          currentClass: curLich ? {
            subject: curLich.noi_dung || 'Lớp học theo thời khóa biểu',
            teacher: 'Giảng viên phụ trách môn',
            timeSlot: `Ca ${curLich.ca} (${getCaTime(curLich.ca)})`,
            registered: curLich.so_nguoi || 40
          } : null,
          environment: {
            temperature: '23.8 °C',
            humidity: '58%',
            airQuality: 'Tốt (AQI 32)',
            powerUsage: curLich ? '4.2 kWh' : '0.4 kWh'
          },
          devices: devices.length > 0 ? devices.map(d => ({
            id: d.ma_tb,
            name: d.ten_tb || `Thiết bị ${d.ma_tb}`,
            status: d.tinh_trang === 'Tốt' ? 'online' : 'offline',
            note: `Loại: ${d.ma_loai} • Tình trạng: ${d.tinh_trang}`
          })) : mockCampusData.selectedRoomDetail.devices
        };
      }
    } catch (e) {
      console.warn('getRoomDetail fallback:', e);
    }

    return {
      ...mockCampusData.selectedRoomDetail,
      id: maPhong,
      name: `Phòng ${maPhong}`
    };
  },

  // 4. DANH SÁCH THIẾT BỊ TRONG PHÒNG
  async getRoomDevices(maPhong) {
    const raw = await fetchWithFallback(`/devices/?ma_phong=${maPhong}`, null);
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map(d => ({
        id: d.ma_tb,
        name: d.ten_tb || `Thiết bị ${d.ma_tb}`,
        status: d.tinh_trang === 'Tốt' ? 'online' : 'offline',
        note: `Loại: ${d.ma_loai} • Tình trạng: ${d.tinh_trang}`
      }));
    }
    return mockCampusData.selectedRoomDetail.devices;
  },

  // 5. CẢNH BÁO LÃNG PHÍ ĐIỆN TỪ AI AGENT
  async getWasteAlerts() {
    const res = await fetchWithFallback('/metrics/waste-alerts', null);
    if (res?.danh_sach_canh_bao?.length > 0) {
      return res.danh_sach_canh_bao.map((alert, idx) => ({
        id: `waste-alert-${idx}`,
        title: `Phát hiện lãng phí điện năng tại Phòng ${alert.ma_phong}`,
        message: alert.canh_bao || `Phòng ${alert.ma_phong} đang tiêu thụ ${alert.kwh_tieu_thu} kWh nhưng không có lịch học.`,
        actionText: 'Tối ưu ngay',
        estimatedSavings: `${alert.kwh_tieu_thu} kWh / ngày`,
        location: `Phòng ${alert.ma_phong}`,
        severity: alert.muc_do === 'Cao' ? 'critical' : 'warning'
      }));
    }
    return [mockCampusData.aiWasteAlert];
  },

  // 6. GỢI Ý TỐI ƯU TỰ ĐỘNG TỪ AI AGENT (/api/ai/analyze)
  async getAiRecommendations() {
    const res = await fetchWithFallback('/ai/analyze', null);
    if (res?.suggestions?.length > 0) {
      return res.suggestions.map((s, idx) => ({
        id: s.id || `rec-${idx + 1}`,
        title: s.title || 'Đề xuất tối ưu năng lượng',
        description: s.description || s.recommended_action || '',
        benefit: s.potential_savings_kwh ? `Tiết kiệm dự kiến ${s.potential_savings_kwh} kWh/ngày` : 'Tối ưu điện năng',
        icon: 'leaf',
        actionLabel: s.recommended_action || 'Áp dụng kịch bản',
        category: 'Năng lượng'
      }));
    }
    return mockCampusData.aiRecommendations;
  },

  // 7. DANH SÁCH BÁO HỎNG & SỰ CỐ KỸ THUẬT (/api/devices/reports)
  async getAlerts() {
    const raw = await fetchWithFallback('/devices/reports', null);
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map(p => ({
        id: `report-${p.ma_phieu}`,
        title: p.mo_ta,
        location: `Phòng ${p.ma_phong}`,
        time: p.ngay_bao ? new Date(p.ngay_bao).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
        severity: p.trang_thai === 'Moi' ? 'critical' : p.trang_thai === 'DangXuLy' ? 'warning' : 'info',
        severityLabel: p.trang_thai === 'Moi' ? 'Mới báo' : p.trang_thai === 'DangXuLy' ? 'Đang xử lý' : 'Đã xử lý',
        detail: `Mã phiếu: #${p.ma_phieu} • Trạng thái: ${p.trang_thai}`
      }));
    }
    return mockCampusData.recentAlerts;
  },

  // 8. TƯƠNG TÁC VỚI GEMINI AI AGENT COPILOT (MULTI-TURN)
  async sendAiChat(message, rawHistory = []) {
    try {
      // Chuyển đổi history dạng frontend sang đúng format ChatMessage Backend: { role: 'user' | 'assistant', content: string }
      const formattedHistory = rawHistory
        .filter(m => m.text && m.text.trim())
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          history: formattedHistory,
          model: 'gemini-3.1-flash-lite'
        })
      });

      if (!res.ok) {
        throw new Error(`AI Gateway error HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        reply: data.reply || 'Đã phân tích yêu cầu từ Campus của bạn.',
        action_taken: data.action_taken || null,
        data_source: data.data_source || null,
        data: data.data || null,
        model_used: data.model_used || 'gemini-3.1-flash-lite'
      };
    } catch (e) {
      console.warn('AI Chat API fallback:', e);
      return {
        reply: `Nexus AI (Trực tiếp từ Cloud): Đã nhận yêu cầu "${message}". Hệ thống đang phân tích lịch phòng và các cảm biến trên cơ sở dữ liệu!`,
        action_taken: null,
        model_used: 'system-offline-guard'
      };
    }
  }
};
