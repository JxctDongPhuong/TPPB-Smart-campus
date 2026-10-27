/**
 * Mock data đồng bộ chuẩn 100% với Backend Database Schema (seed_data.py)
 * Loại bỏ toàn bộ các trường không có trong backend như cảm biến AQI, độ ẩm, nhiệt độ giả, khóa RFID.
 */
export const mockCampusData = {
  // Thống kê tổng quan từ Backend metrics/summary & rooms
  summary: {
    totalRooms: 6,
    roomsOccupied: 2,
    roomsAvailable: 4,
    totalKWh: 39.0,
    averageKWhPerRoom: 13.0,
    activeReports: 1, // 1 phiếu báo hỏng tại A202
    wasteAlertsCount: 1, // 1 phòng B302 lãng phí điện
    systemStatus: 'Ổn định'
  },

  // Cảnh báo lãng phí điện năng (Idle Waste) từ Backend /api/metrics/waste-alerts
  aiWasteAlert: {
    id: 'waste-b302',
    ma_phong: 'B302',
    title: 'Phát hiện lãng phí điện năng tại Phòng B302',
    message: 'Phòng B302 không có lịch học hôm nay nhưng phát sinh tiêu thụ 8.5 kWh (6.0 giờ bật). Nghi vấn quên tắt thiết bị làm mát.',
    kwh_tieu_thu: 8.5,
    muc_do: 'Trung bình',
    actionText: 'Tắt thiết bị B302',
    canh_bao: 'Idle Waste: Tiêu thụ điện bất thường ngoài lịch học'
  },

  // Danh sách phòng học thực tế từ Backend (Bảng Phong & LichPhong)
  floorRooms: [
    {
      ma_phong: 'A101',
      ma_cs: 'CS1',
      toa: 'A',
      tang: 1,
      loai_phong: 'Phòng lý thuyết',
      suc_chua: 50,
      trang_thai: 'Đang dùng',
      hasScheduleToday: true,
      currentSchedule: {
        ca: 1,
        ten_mon_hoc: 'Lập trình Python Nâng Cao',
        giang_vien: 'ThS. Nguyễn Văn A',
        lop: 'CNTT-K15',
        thoi_gian: '07:30 - 11:30'
      },
      kwh: 12.5
    },
    {
      ma_phong: 'A102',
      ma_cs: 'CS1',
      toa: 'A',
      tang: 1,
      loai_phong: 'Phòng lý thuyết',
      suc_chua: 60,
      trang_thai: 'Sẵn sàng',
      hasScheduleToday: false,
      currentSchedule: null,
      kwh: 0.0
    },
    {
      ma_phong: 'A201',
      ma_cs: 'CS1',
      toa: 'A',
      tang: 2,
      loai_phong: 'Phòng máy tính',
      suc_chua: 45,
      trang_thai: 'Đang dùng',
      hasScheduleToday: true,
      currentSchedule: {
        ca: 2,
        ten_mon_hoc: 'Thực hành Mạng Máy Tính',
        giang_vien: 'TS. Trần Thị B',
        lop: 'KTPM-K16',
        thoi_gian: '13:00 - 17:00'
      },
      kwh: 18.0
    },
    {
      ma_phong: 'A202',
      ma_cs: 'CS1',
      toa: 'A',
      tang: 2,
      loai_phong: 'Phòng máy tính',
      suc_chua: 40,
      trang_thai: 'Bảo trì',
      hasScheduleToday: false,
      currentSchedule: null,
      hasIssue: true,
      issueDesc: 'Điều hòa Panasonic bị chảy nước và kêu to',
      kwh: 0.0
    },
    {
      ma_phong: 'B301',
      ma_cs: 'CS1',
      toa: 'B',
      tang: 3,
      loai_phong: 'Hội trường',
      suc_chua: 150,
      trang_thai: 'Sẵn sàng',
      hasScheduleToday: false,
      currentSchedule: null,
      kwh: 0.0
    },
    {
      ma_phong: 'B302',
      ma_cs: 'CS1',
      toa: 'B',
      tang: 3,
      loai_phong: 'Phòng học nhóm',
      suc_chua: 15,
      trang_thai: 'Cảnh báo lãng phí',
      hasScheduleToday: false,
      currentSchedule: null,
      isWasteAlert: true,
      kwh: 8.5
    }
  ],

  // Chi tiết thiết bị theo từng phòng (Bảng ThietBi)
  devicesByRoom: {
    'A101': [
      { ma_tb: 'TB_ML_A101', ten_tb: 'Điều hòa Daikin 1', ma_loai: 'MAYLANH', cong_suat: '2500W', tinh_trang: 'Tốt' },
      { ma_tb: 'TB_MC_A101', ten_tb: 'Máy chiếu Panasonic', ma_loai: 'MAYCHIEU', cong_suat: '400W', tinh_trang: 'Tốt' }
    ],
    'A102': [
      { ma_tb: 'TB_ML_A102', ten_tb: 'Điều hòa Daikin A102', ma_loai: 'MAYLANH', cong_suat: '2500W', tinh_trang: 'Tốt' },
      { ma_tb: 'TB_MC_A102', ten_tb: 'Máy chiếu Sony', ma_loai: 'MAYCHIEU', cong_suat: '400W', tinh_trang: 'Tốt' }
    ],
    'A201': [
      { ma_tb: 'TB_PC_A201', ten_tb: 'Dàn 45 PC Dell OptiPlex', ma_loai: 'MAYTINH', cong_suat: '5000W', tinh_trang: 'Tốt' },
      { ma_tb: 'TB_ML_A201', ten_tb: 'Điều hòa công suất lớn', ma_loai: 'MAYLANH', cong_suat: '3500W', tinh_trang: 'Tốt' }
    ],
    'A202': [
      { ma_tb: 'TB_ML_A202', ten_tb: 'Điều hòa Panasonic A202', ma_loai: 'MAYLANH', cong_suat: '2500W', tinh_trang: 'Hỏng' },
      { ma_tb: 'TB_PC_A202', ten_tb: 'Dàn 40 PC Dell Lab 2', ma_loai: 'MAYTINH', cong_suat: '4500W', tinh_trang: 'Tốt' }
    ],
    'B301': [
      { ma_tb: 'TB_MC_B301', ten_tb: 'Máy chiếu hội trường Epson', ma_loai: 'MAYCHIEU', cong_suat: '800W', tinh_trang: 'Tốt' },
      { ma_tb: 'TB_ML_B301', ten_tb: 'Hệ thống điều hòa trung tâm', ma_loai: 'MAYLANH', cong_suat: '6000W', tinh_trang: 'Tốt' }
    ],
    'B302': [
      { ma_tb: 'TB_ML_B302', ten_tb: 'Điều hòa Inverter B302', ma_loai: 'MAYLANH', cong_suat: '1800W', tinh_trang: 'Tốt' }
    ]
  },

  // Lịch học hôm nay theo phòng (Bảng LichPhong)
  schedulesByRoom: {
    'A101': {
      ma_lich: 1,
      ca: 1,
      thoi_gian: '07:30 - 11:30',
      ten_mon_hoc: 'Lập trình Python Nâng Cao',
      giang_vien: 'ThS. Nguyễn Văn A',
      lop: 'CNTT-K15',
      trang_thai: 'Đang diễn ra'
    },
    'A201': {
      ma_lich: 2,
      ca: 2,
      thoi_gian: '13:00 - 17:00',
      ten_mon_hoc: 'Thực hành Mạng Máy Tính',
      giang_vien: 'TS. Trần Thị B',
      lop: 'KTPM-K16',
      trang_thai: 'Sắp diễn ra'
    }
  },

  // Điện năng theo phòng (Bảng DienNang)
  metricsByRoom: {
    'A101': { kwh: 12.5, so_gio_bat: 4.0 },
    'A102': { kwh: 0.0, so_gio_bat: 0.0 },
    'A201': { kwh: 18.0, so_gio_bat: 3.5 },
    'A202': { kwh: 0.0, so_gio_bat: 0.0 },
    'B301': { kwh: 0.0, so_gio_bat: 0.0 },
    'B302': { kwh: 8.5, so_gio_bat: 6.0 }
  },

  // Phân bổ tiêu thụ theo nhóm thiết bị thực tế (LoaiThietBi)
  energyBreakdown: {
    totalKWh: 39.0,
    categories: [
      { name: 'Máy tính Lab (MAYTINH)', percentage: 46, kwh: 18.0, color: '#3b82f6' },
      { name: 'Máy điều hòa (MAYLANH)', percentage: 44, kwh: 17.0, color: '#10b981' },
      { name: 'Máy chiếu & Thiết bị khác', percentage: 10, kwh: 4.0, color: '#f59e0b' }
    ]
  },

  // Gợi ý từ AI Agent (/api/ai/analize)
  aiRecommendations: [
    {
      id: 'rec-1',
      title: 'Tự động ngắt điện phòng B302',
      description: 'Phòng B302 đang tiêu thụ 8.5 kWh ngoài giờ không có lịch học. Gửi lệnh tắt điều hòa tức thì.',
      benefit: 'Tiết kiệm ngay 8.5 kWh',
      category: 'Năng lượng'
    },
    {
      id: 'rec-2',
      title: 'Xử lý phiếu sửa chữa điều hòa A202',
      description: 'Phiếu báo hỏng TB_ML_A202 đang chờ kỹ thuật viên tiếp nhận để khôi phục phòng máy tính.',
      benefit: 'Đảm bảo phòng sẵn sàng học',
      category: 'Thiết bị'
    }
  ],

  // Danh sách sự cố & cảnh báo báo hỏng (Bảng PhieuBaoHong & DienNang Idle Waste)
  recentAlerts: [
    {
      id: 'alt-waste-1',
      title: 'Lãng phí điện bất thường (Idle Waste)',
      location: 'Phòng B302 (Tòa B - Tầng 3)',
      time: 'Hôm nay',
      severity: 'warning',
      severityLabel: 'Lãng phí điện',
      detail: 'Tiêu thụ 8.5 kWh không có lịch học trong LichPhong'
    },
    {
      id: 'alt-issue-1',
      title: 'Điều hòa bị chảy nước và kêu to',
      location: 'Phòng A202 (Tòa A - Tầng 2)',
      time: 'Phiếu #1',
      severity: 'critical',
      severityLabel: 'Đang xử lý',
      detail: 'Thiết bị TB_ML_A202 - Người báo: Admin'
    }
  ],

  // 1. Toàn bộ danh mục phòng học chuẩn PhongRead
  allRooms: [
    { ma_phong: 'A101', ten_phong: 'Phòng Lý Thuyết A101', ma_cs: 'CS1', toa: 'A', tang: 1, loai_phong: 'Phòng lý thuyết', suc_chua: 50, so_ban: 25, dien_tich: 65.0, trang_thai: 'Đang dùng', da_xoa: false },
    { ma_phong: 'A102', ten_phong: 'Phòng Lý Thuyết A102', ma_cs: 'CS1', toa: 'A', tang: 1, loai_phong: 'Phòng lý thuyết', suc_chua: 60, so_ban: 30, dien_tich: 75.0, trang_thai: 'Sẵn sàng', da_xoa: false },
    { ma_phong: 'A201', ten_phong: 'Phòng Máy Tính Lab 1', ma_cs: 'CS1', toa: 'A', tang: 2, loai_phong: 'Phòng máy tính', suc_chua: 45, so_ban: 45, dien_tich: 80.0, trang_thai: 'Đang dùng', da_xoa: false },
    { ma_phong: 'A202', ten_phong: 'Phòng Máy Tính Lab 2', ma_cs: 'CS1', toa: 'A', tang: 2, loai_phong: 'Phòng máy tính', suc_chua: 40, so_ban: 40, dien_tich: 70.0, trang_thai: 'Bảo trì', da_xoa: false },
    { ma_phong: 'B301', ten_phong: 'Hội Trường Lớn B301', ma_cs: 'CS1', toa: 'B', tang: 3, loai_phong: 'Hội trường', suc_chua: 150, so_ban: 75, dien_tich: 200.0, trang_thai: 'Sẵn sàng', da_xoa: false },
    { ma_phong: 'B302', ten_phong: 'Phòng Học Nhóm B302', ma_cs: 'CS1', toa: 'B', tang: 3, loai_phong: 'Phòng học nhóm', suc_chua: 15, so_ban: 5, dien_tich: 28.0, trang_thai: 'Sẵn sàng', da_xoa: false }
  ],

  // 2. Toàn bộ thiết bị chuẩn ThietBiRead
  allDevices: [
    { ma_tb: 'TB_ML_A101', ma_loai: 'MAYLANH', ma_phong: 'A101', ma_lo: 'ML_01', ten_tb: 'Điều hòa Daikin 1', cong_suat_w: 2500, nam_mua: 2023, tinh_trang: 'Tốt' },
    { ma_tb: 'TB_MC_A101', ma_loai: 'MAYCHIEU', ma_phong: 'A101', ma_lo: 'MC_01', ten_tb: 'Máy chiếu Panasonic', cong_suat_w: 400, nam_mua: 2022, tinh_trang: 'Tốt' },
    { ma_tb: 'TB_ML_A102', ma_loai: 'MAYLANH', ma_phong: 'A102', ma_lo: 'ML_01', ten_tb: 'Điều hòa Daikin A102', cong_suat_w: 2500, nam_mua: 2023, tinh_trang: 'Tốt' },
    { ma_tb: 'TB_MC_A102', ma_loai: 'MAYCHIEU', ma_phong: 'A102', ma_lo: 'MC_01', ten_tb: 'Máy chiếu Sony Laser', cong_suat_w: 420, nam_mua: 2023, tinh_trang: 'Tốt' },
    { ma_tb: 'TB_PC_A201', ma_loai: 'MAYTINH', ma_phong: 'A201', ma_lo: 'PC_DELL', ten_tb: 'Dàn 45 PC Dell OptiPlex', cong_suat_w: 5000, nam_mua: 2024, tinh_trang: 'Tốt' },
    { ma_tb: 'TB_ML_A201', ma_loai: 'MAYLANH', ma_phong: 'A201', ma_lo: 'ML_INVERTER', ten_tb: 'Điều hòa 2.5HP Sharp', cong_suat_w: 3500, nam_mua: 2023, tinh_trang: 'Tốt' },
    { ma_tb: 'TB_ML_A202', ma_loai: 'MAYLANH', ma_phong: 'A202', ma_lo: 'ML_PANA', ten_tb: 'Điều hòa Panasonic A202', cong_suat_w: 2500, nam_mua: 2021, tinh_trang: 'Hỏng' },
    { ma_tb: 'TB_PC_A202', ma_loai: 'MAYTINH', ma_phong: 'A202', ma_lo: 'PC_DELL', ten_tb: 'Dàn 40 PC Dell Lab 2', cong_suat_w: 4500, nam_mua: 2023, tinh_trang: 'Tốt' },
    { ma_tb: 'TB_MC_B301', ma_loai: 'MAYCHIEU', ma_phong: 'B301', ma_lo: 'MC_EPSON', ten_tb: 'Máy chiếu Epson 5000 ANSI', cong_suat_w: 800, nam_mua: 2023, tinh_trang: 'Tốt' },
    { ma_tb: 'TB_ML_B301', ma_loai: 'MAYLANH', ma_phong: 'B301', ma_lo: 'ML_VRV', ten_tb: 'Hệ thống VRV Trung tâm B301', cong_suat_w: 6000, nam_mua: 2022, tinh_trang: 'Tốt' },
    { ma_tb: 'TB_ML_B302', ma_loai: 'MAYLANH', ma_phong: 'B302', ma_lo: 'ML_INVERTER', ten_tb: 'Điều hòa Inverter B302', cong_suat_w: 1800, nam_mua: 2024, tinh_trang: 'Tốt' },
    { ma_tb: 'TB_KHO_01', ma_loai: 'MAYCHIEU', ma_phong: null, ma_lo: 'MC_DU_PHONG', ten_tb: 'Máy chiếu di động dự phòng', cong_suat_w: 350, nam_mua: 2024, tinh_trang: 'Tốt' }
  ],

  // 3. Toàn bộ lịch phòng chuẩn LichPhongRead
  allSchedules: [
    { ma_lich: 1, ma_phong: 'A101', ngay: new Date().toISOString().split('T')[0], ca: 1, loai: 'HOC', noi_dung: 'Lập trình Python Nâng Cao', ten_mon_hoc: 'Lập trình Python Nâng Cao', giang_vien: 'ThS. Nguyễn Văn A', lop: 'CNTT-K15', so_nguoi: 48, trang_thai: 'Đang diễn ra' },
    { ma_lich: 2, ma_phong: 'A201', ngay: new Date().toISOString().split('T')[0], ca: 2, loai: 'HOC', noi_dung: 'Thực hành Mạng Máy Tính', ten_mon_hoc: 'Thực hành Mạng Máy Tính', giang_vien: 'TS. Trần Thị B', lop: 'KTPM-K16', so_nguoi: 42, trang_thai: 'Sắp diễn ra' },
    { ma_lich: 3, ma_phong: 'B301', ngay: new Date(Date.now() + 86400000).toISOString().split('T')[0], ca: 1, loai: 'MUON', noi_dung: 'Hội thảo Khoa học Sinh viên 2026', ten_mon_hoc: 'Hội thảo Khoa học Sinh viên', giang_vien: 'Đoàn Thanh Niên', ben_muon: 'Đoàn Thanh Niên', lop: 'Toàn trường', doi_tuong: 'Toàn trường', so_nguoi: 120, trang_thai: 'Đã xếp lịch' },
    { ma_lich: 4, ma_phong: 'A102', ngay: new Date(Date.now() + 86400000).toISOString().split('T')[0], ca: 3, loai: 'HOC', noi_dung: 'Cơ sở Dữ liệu Phân tán', ten_mon_hoc: 'Cơ sở Dữ liệu Phân tán', giang_vien: 'ThS. Lê Hoàng C', lop: 'HTTT-K15', so_nguoi: 55, trang_thai: 'Đã xếp lịch' }
  ],

  // 4. Yêu cầu mượn phòng chuẩn YeuCauMuonRead
  allBookingRequests: [
    { ma_yc: 1, ma_tk: 2, nguoi_gui_ten: 'Lê Văn Cường (SV)', ma_phong: 'B302', ngay: new Date(Date.now() + 86400000).toISOString().split('T')[0], ca: 2, so_nguoi: 10, muc_dich: 'Họp nhóm đồ án tốt nghiệp ngành Trí tuệ Nhân tạo', trang_thai: 'ChoDuyet', ngay_gui: '2026-10-26T08:30:00' },
    { ma_yc: 2, ma_tk: 3, nguoi_gui_ten: 'Nguyễn Thị Dung (CLB)', ma_phong: 'B301', ngay: new Date(Date.now() + 172800000).toISOString().split('T')[0], ca: 1, so_nguoi: 80, muc_dich: 'Tập luyện văn nghệ chào tân sinh viên K17', trang_thai: 'ChoDuyet', ngay_gui: '2026-10-26T09:15:00' },
    { ma_yc: 3, ma_tk: 4, nguoi_gui_ten: 'Phạm Minh Tuấn (GV)', ma_phong: 'A102', ngay: new Date(Date.now() - 86400000).toISOString().split('T')[0], ca: 2, so_nguoi: 50, muc_dich: 'Học bù môn Toán rời rạc', trang_thai: 'DaDuyet', ngay_gui: '2026-10-24T14:00:00' }
  ],

  // 5. Phiếu báo hỏng thiết bị chuẩn PhieuBaoHongRead
  allReports: [
    {
      ma_phieu: 1,
      ma_phong: 'A202',
      ma_tb: 'TB_ML_A202',
      ten_tb: 'Điều hòa Panasonic A202',
      mo_ta: 'Điều hòa A202 bị chảy nước nhiều xuống sàn và kêu to, không mát',
      muc_do: 'NghiemTrong',
      trang_thai: 'DangXuLy',
      ma_tk: 1,
      nguoi_bao_ten: 'Admin (Ban Quản Lý)',
      ngay_bao: '2026-10-26T07:15:00',
      ghi_chu_admin: 'Đã điều thợ bảo trì kiểm tra đường ống gas và lốc máy',
      ngay_xu_ly: null
    },
    {
      ma_phieu: 2,
      ma_phong: 'A101',
      ma_tb: 'TB_MC_A101',
      ten_tb: 'Máy chiếu Panasonic',
      mo_ta: 'Hình ảnh trình chiếu bị mờ nhạt và ám vàng góc phải màn hình',
      muc_do: 'TrungBinh',
      trang_thai: 'Moi',
      ma_tk: 2,
      nguoi_bao_ten: 'ThS. Nguyễn Văn A',
      ngay_bao: '2026-10-26T10:45:00',
      ghi_chu_admin: null,
      ngay_xu_ly: null
    },
    {
      ma_phieu: 3,
      ma_phong: 'B301',
      ma_tb: 'TB_MC_B301',
      ten_tb: 'Máy chiếu Epson Hội trường',
      mo_ta: 'Cổng HDMI 1 tiếp xúc chập chờn khi cắm laptop',
      muc_do: 'Nhe',
      trang_thai: 'DaXuLy',
      ma_tk: 1,
      nguoi_bao_ten: 'Admin',
      ngay_bao: '2026-10-24T15:20:00',
      ghi_chu_admin: 'Đã thay dây cáp tín hiệu HDMI 4K mạ vàng mới',
      ngay_xu_ly: '2026-10-25T09:00:00'
    }
  ],

  // 6. Lịch sử tiêu thụ điện năng chuẩn DienNangRead
  allEnergyMetrics: [
    { ma_phong: 'A101', ngay: new Date().toISOString().split('T')[0], kwh: 12.5, so_gio_bat: 4.0, danh_gia: 'Tiêu chuẩn', co_lich: true },
    { ma_phong: 'A102', ngay: new Date().toISOString().split('T')[0], kwh: 0.0, so_gio_bat: 0.0, danh_gia: 'Tắt hoàn toàn', co_lich: false },
    { ma_phong: 'A201', ngay: new Date().toISOString().split('T')[0], kwh: 18.0, so_gio_bat: 3.5, danh_gia: 'Phòng Lab (Hiệu suất cao)', co_lich: true },
    { ma_phong: 'A202', ngay: new Date().toISOString().split('T')[0], kwh: 0.0, so_gio_bat: 0.0, danh_gia: 'Đang bảo trì', co_lich: false },
    { ma_phong: 'B301', ngay: new Date().toISOString().split('T')[0], kwh: 0.0, so_gio_bat: 0.0, danh_gia: 'Sẵn sàng', co_lich: false },
    { ma_phong: 'B302', ngay: new Date().toISOString().split('T')[0], kwh: 8.5, so_gio_bat: 6.0, danh_gia: 'Cảnh báo lãng phí (Idle Waste)', co_lich: false, isWaste: true },
    // Dữ liệu hôm qua
    { ma_phong: 'A101', ngay: new Date(Date.now() - 86400000).toISOString().split('T')[0], kwh: 14.2, so_gio_bat: 5.0, danh_gia: 'Tiêu chuẩn', co_lich: true },
    { ma_phong: 'A102', ngay: new Date(Date.now() - 86400000).toISOString().split('T')[0], kwh: 11.0, so_gio_bat: 4.0, danh_gia: 'Tiêu chuẩn', co_lich: true },
    { ma_phong: 'A201', ngay: new Date(Date.now() - 86400000).toISOString().split('T')[0], kwh: 20.5, so_gio_bat: 4.5, danh_gia: 'Phòng Lab', co_lich: true }
  ]
};
