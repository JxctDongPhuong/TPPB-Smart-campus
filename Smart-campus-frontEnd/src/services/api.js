import { mockCampusData } from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Helper fetch with timeout & auto-fallback to mock data
 */
async function fetchWithFallback(endpoint, fallbackData) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
    const res = await fetch(`${BASE_URL}${endpoint}`, {
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
  // Lấy tổng quan chỉ số
  async getSummary() {
    return fetchWithFallback('/metrics/summary', mockCampusData.summary);
  },

  // Lấy danh sách phòng theo tòa & tầng
  async getRooms(toa = 'A', tang = 1) {
    return fetchWithFallback(`/rooms/?toa=${toa}&tang=${tang}`, mockCampusData.floorRooms);
  },

  // Lấy chi tiết 1 phòng
  async getRoomDetail(maPhong) {
    const fallback = maPhong === 'C101' ? mockCampusData.selectedRoomDetail : {
      ...mockCampusData.selectedRoomDetail,
      id: maPhong,
      name: `Phòng ${maPhong}`,
      status: 'Đang trống',
      currentStudents: 0
    };
    return fetchWithFallback(`/rooms/${maPhong}`, fallback);
  },

  // Lấy danh sách thiết bị trong phòng
  async getRoomDevices(maPhong) {
    return fetchWithFallback(`/devices/?ma_phong=${maPhong}`, mockCampusData.selectedRoomDetail.devices);
  },

  // Lấy cảnh báo lãng phí điện từ Nexus AI
  async getWasteAlerts() {
    return fetchWithFallback('/metrics/waste-alerts', [mockCampusData.aiWasteAlert]);
  },

  // Lấy gợi ý tối ưu tự động từ AI Agent
  async getAiRecommendations() {
    return fetchWithFallback('/ai/analize', mockCampusData.aiRecommendations);
  },

  // Lấy danh sách sự cố & cảnh báo báo hỏng
  async getAlerts() {
    return fetchWithFallback('/devices/reports', mockCampusData.recentAlerts);
  },

  // Gửi prompt tương tác với Nexus AI Chatbot
  async sendAiChat(message, history = []) {
    try {
      const res = await fetch(`${BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, model: 'gemini-3.1-flash-lite' })
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      return {
        reply: `Nexus AI (Offline Mode): Đã ghi nhận yêu cầu "${message}". Đang điều phối hệ thống phòng học tự động!`,
        tool_calls: []
      };
    }
  }
};
