export const mockCampusData = {
  summary: {
    roomsOccupied: 128,
    totalRooms: 164,
    roomsGrowth: '+12%',
    deviceUptime: 94.6,
    deviceGrowth: '+2.4%',
    energyKWh: 8240,
    energySavingDiff: '-8.1%',
    activeAlerts: 7,
    criticalAlerts: 3,
    totalSensors: 148,
    systemStatus: 'Ổn định'
  },

  aiWasteAlert: {
    id: 'ai-alert-1',
    title: 'Nexus AI vừa phát hiện một cơ hội tiết kiệm',
    message: '12 phòng tại Tòa B đang bật điều hòa nhưng không có lịch sử dụng trong 2 giờ tới.',
    actionText: 'Xem đề xuất',
    estimatedSavings: '182 kWh / ngày',
    location: 'Tòa B (Tầng 2 & 3)'
  },

  occupancyHourly: [
    { time: '06:00', rate: 22 },
    { time: '08:00', rate: 38 },
    { time: '09:00', rate: 52 },
    { time: '11:00', rate: 61 },
    { time: '12:00', rate: 64 },
    { time: '14:00', rate: 76, peak: true },
    { time: '15:00', rate: 71 },
    { time: '17:00', rate: 73 },
    { time: '18:00', rate: 74 },
    { time: '20:00', rate: 58 },
    { time: '21:00', rate: 42 }
  ],

  buildingsOccupancy: [
    { id: 'toa-a', name: 'Tòa A', occupied: 24, total: 28, rate: 87, color: 'bg-blue-500' },
    { id: 'toa-b', name: 'Tòa B', occupied: 26, total: 36, rate: 72, color: 'bg-emerald-500' },
    { id: 'thu-vien', name: 'Thư viện', occupied: 14, total: 22, rate: 64, color: 'bg-indigo-500' },
    { id: 'lab-c', name: 'Lab C', occupied: 20, total: 22, rate: 91, color: 'bg-amber-500' }
  ],

  floorRooms: [
    // Hàng trên
    { id: 'B103', name: 'B103', type: 'Phòng học', subject: 'Kinh tế vi mô', current: 36, capacity: 50, status: 'active', temperature: 24.5, power: 3.2 },
    { id: 'C101', name: 'C101', type: 'Phòng máy', subject: 'Lập trình Web', current: 38, capacity: 40, status: 'active', isSelected: true, temperature: 23.8, power: 4.6 },
    { id: 'C102', name: 'C102', type: 'Phòng học', subject: 'Đang trống', current: 0, capacity: 45, status: 'empty', temperature: 28.0, power: 0.4 },
    { id: 'C103', name: 'C103', type: 'Phòng máy', subject: 'Cơ sở dữ liệu', current: 35, capacity: 40, status: 'active', temperature: 24.0, power: 4.1 },
    { id: 'C104', name: 'C104', type: 'Phòng học', subject: 'Đang trống', current: 0, capacity: 45, status: 'empty', temperature: 27.5, power: 0.3 },

    // Hàng giữa
    { id: 'B102', name: 'B102', type: 'Phòng học', subject: 'Đang trống', current: 0, capacity: 50, status: 'empty', temperature: 27.8, power: 0.2 },
    { id: 'D103', name: 'D103', type: 'Phòng học', subject: 'Trí tuệ nhân tạo', current: 42, capacity: 45, status: 'active', temperature: 23.5, power: 3.8 },
    { id: 'D102', name: 'D102', type: 'Phòng lab', subject: 'Đang trống', current: 0, capacity: 35, status: 'empty', temperature: 28.2, power: 0.2 },

    // Hàng dưới
    { id: 'B101', name: 'B101', type: 'Phòng học', subject: 'Luật đại cương', current: 48, capacity: 50, status: 'active', temperature: 24.2, power: 3.6 },
    { id: 'A101', name: 'A101', type: 'Phòng học', subject: 'Toán cao cấp', current: 56, capacity: 60, status: 'active', temperature: 23.9, power: 4.0 },
    { id: 'A102', name: 'A102', type: 'Phòng học', subject: 'Đang trống', current: 0, capacity: 60, status: 'empty', temperature: 28.5, power: 0.3 },
    { id: 'A103', name: 'A103', type: 'Phòng máy', subject: 'Mạng máy tính', current: 37, capacity: 40, status: 'active', temperature: 24.1, power: 4.4 },
    { id: 'A104', name: 'A104', type: 'Phòng học', subject: 'Đang trống', current: 0, capacity: 50, status: 'empty', temperature: 27.9, power: 0.2 },
    { id: 'D101', name: 'D101', type: 'Phòng học', subject: 'Quản trị học', current: 33, capacity: 35, status: 'active', temperature: 24.4, power: 2.9 },
  ],

  selectedRoomDetail: {
    id: 'C101',
    name: 'Phòng C101',
    category: 'Phòng máy thực hành',
    capacity: 40,
    currentStudents: 38,
    status: 'Đang sử dụng',
    currentClass: {
      subject: 'Lập trình Web & Ứng dụng Cloud',
      teacher: 'TS. Nguyễn Văn Hùng',
      timeSlot: '07:30 - 11:30',
      registered: 38
    },
    environment: {
      temperature: '23.8 °C',
      humidity: '58%',
      airQuality: 'Tốt (AQI 32)',
      powerUsage: '4.6 kWh'
    },
    devices: [
      { id: 'pj-01', name: 'Máy chiếu Epson Laser Pro', status: 'online', note: 'Hoạt động tốt • Độ sáng 100%' },
      { id: 'pc-lec', name: 'Máy tính trạm giảng viên', status: 'online', note: 'Core i7 • Win 11 Pro' },
      { id: 'hvac-01', name: 'Điều hòa trung tâm Daikin', status: 'online', note: '24°C • Chế độ Auto Eco' },
      { id: 'env-sens', name: 'Cảm biến môi trường IoT', status: 'online', note: 'CO2: 480ppm • Cập nhật 10s trước' },
      { id: 'smart-door', name: 'Khóa cửa thông minh RFID', status: 'online', note: 'Trạng thái: Đã mở khóa' }
    ]
  },

  energyBreakdown: {
    totalKWh: 8240,
    categories: [
      { name: 'Điều hòa (HVAC)', percentage: 45, kwh: 3708, color: '#3b82f6', bgTailwind: 'bg-blue-500' },
      { name: 'Chiếu sáng', percentage: 24, kwh: 1978, color: '#10b981', bgTailwind: 'bg-emerald-500' },
      { name: 'Thiết bị & Máy tính', percentage: 20, kwh: 1648, color: '#f59e0b', bgTailwind: 'bg-amber-500' },
      { name: 'Khác (Bơm, Thang máy)', percentage: 11, kwh: 906, color: '#94a3b8', bgTailwind: 'bg-slate-400' }
    ]
  },

  aiRecommendations: [
    {
      id: 'rec-1',
      title: 'Tối ưu điều hòa Tòa B',
      description: 'Tắt 12 cụm điều hòa không cần thiết tại các phòng trống từ 14:00 - 16:00.',
      benefit: 'Tiết kiệm dự kiến 182 kWh/ngày',
      icon: 'leaf',
      actionLabel: 'Áp dụng kịch bản',
      category: 'Năng lượng'
    },
    {
      id: 'rec-2',
      title: 'Phân bổ lại phòng học Tòa A',
      description: 'Gộp 3 lớp ít người tại Tòa A để giải phóng 2 phòng học tầng 3.',
      benefit: 'Tăng hiệu suất sử dụng +6.4%',
      icon: 'building',
      actionLabel: 'Điều chỉnh lịch',
      category: 'Không gian'
    }
  ],

  recentAlerts: [
    {
      id: 'alt-1',
      title: 'Tiêu thụ điện bất thường',
      location: 'Phòng Lab C-203',
      time: '10 phút trước',
      severity: 'critical',
      severityLabel: 'Khẩn cấp',
      detail: 'Công suất vượt ngưỡng dự báo 45% ngoài giờ học'
    },
    {
      id: 'alt-2',
      title: 'Máy chiếu mất kết nối',
      location: 'Phòng A-105',
      time: '25 phút trước',
      severity: 'warning',
      severityLabel: 'Trung bình',
      detail: 'Không nhận tín hiệu HDMI / IP controller offline'
    },
    {
      id: 'alt-3',
      title: 'Không gian sắp quá tải',
      location: 'Thư viện tầng 2',
      time: '42 phút trước',
      severity: 'info',
      severityLabel: 'Thông tin',
      detail: 'Sĩ số đạt 96% sức chứa tối đa'
    }
  ]
};
