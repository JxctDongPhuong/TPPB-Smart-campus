import React from 'react';
import { 
  X, 
  Wind, 
  Tv, 
  Monitor, 
  Zap, 
  BookOpen, 
  User, 
  Users, 
  Clock, 
  CheckCircle2, 
  Layers, 
  MapPin,
  Calendar
} from 'lucide-react';
import { Badge } from '../common/Badge';

export function RoomInspectDrawer({ 
  room, 
  isOpen, 
  onClose, 
  onNavigateToTickets 
}) {
  if (!isOpen || !room) return null;

  const roomId = room.ma_phong || room.id || 'A101';

  // Dữ liệu thời khóa biểu / tiết học theo từng phòng
  const scheduleDataMap = {
    'A101': {
      hasSchedule: true,
      caText: 'Ca 1 (Sáng)',
      thoi_gian: '07:30 - 11:30',
      ten_mon_hoc: 'Lập trình Python Nâng Cao',
      ma_mon: 'IT3020',
      giang_vien: 'ThS. Nguyễn Văn A',
      lop: 'CNTT-K15',
      si_so: '48 / 50 sinh viên',
      trang_thai: 'Đang diễn ra',
      trang_thai_type: 'success'
    },
    'A102': {
      hasSchedule: true,
      caText: 'Ca 1 (Sáng)',
      thoi_gian: '07:30 - 11:30',
      ten_mon_hoc: 'Giải tích 2 & Đại số Tuyến tính',
      ma_mon: 'MATH102',
      giang_vien: 'TS. Lê Hồng Hạnh',
      lop: 'DTVT-K16',
      si_so: '58 / 60 sinh viên',
      trang_thai: 'Đang diễn ra',
      trang_thai_type: 'success'
    },
    'A201': {
      hasSchedule: true,
      caText: 'Ca 2 (Chiều)',
      thoi_gian: '13:00 - 17:00',
      ten_mon_hoc: 'Thực hành Mạng Máy Tính & Viễn Thông',
      ma_mon: 'NET2040',
      giang_vien: 'TS. Trần Thị B',
      lop: 'KTPM-K16',
      si_so: '44 / 45 sinh viên',
      trang_thai: 'Sắp diễn ra',
      trang_thai_type: 'warning'
    },
    'A202': {
      hasSchedule: false,
      caText: 'Không có ca',
      thoi_gian: '--:--',
      ten_mon_hoc: 'Tạm ngưng xếp lịch (Bảo trì kỹ thuật)',
      ma_mon: 'MAINTENANCE',
      giang_vien: 'Ban Quản trị Thiết bị',
      lop: 'Không xếp lớp',
      si_so: '0 / 40 chỗ',
      trang_thai: 'Đang bảo trì',
      trang_thai_type: 'danger'
    },
    'B301': {
      hasSchedule: true,
      caText: 'Ca 3 (Tối)',
      thoi_gian: '18:00 - 20:30',
      ten_mon_hoc: 'Hội thảo Xu hướng AI & Chuyển đổi số 2026',
      ma_mon: 'SEMINAR_AI',
      giang_vien: 'Khoa CNTT & Doanh nghiệp',
      lop: 'Toàn khóa K15-K18',
      si_so: '145 / 150 sinh viên',
      trang_thai: 'Sắp diễn ra',
      trang_thai_type: 'primary'
    },
    'B302': {
      hasSchedule: false,
      caText: 'Trống lịch',
      thoi_gian: '--:--',
      ten_mon_hoc: 'Phòng tự học & Thảo luận nhóm (Tự do)',
      ma_mon: 'FREE-STUDY',
      giang_vien: 'Sinh viên tự quản',
      lop: 'Nhóm đồ án',
      si_so: '0 / 15 chỗ',
      trang_thai: 'Cảnh báo lãng phí',
      trang_thai_type: 'warning'
    }
  };

  const scheduleInfo = scheduleDataMap[roomId] || {
    hasSchedule: !!room.currentSchedule,
    caText: 'Ca 1 (Sáng)',
    thoi_gian: '07:30 - 11:30',
    ten_mon_hoc: room.currentSchedule?.ten_mon_hoc || 'Sinh hoạt chuyên môn & Tự học',
    ma_mon: 'GEN101',
    giang_vien: room.currentSchedule?.giang_vien || 'ThS. Giảng viên phụ trách',
    lop: room.currentSchedule?.lop || 'Lớp sinh viên',
    si_so: `${room.suc_chua || 40} sinh viên`,
    trang_thai: room.trang_thai || 'Sẵn sàng',
    trang_thai_type: 'primary'
  };

  // Danh sách thiết bị trong phòng
  const devicesInRoom = [
    {
      id: `TB_ML_${roomId}_1`,
      name: `Điều hòa Daikin Inverter 2.5HP`,
      type: 'MAYLANH',
      code: `TB_ML_${roomId}_01`,
      locationName: 'Tường trước góc trái (gần bục giảng)',
      power: '2500W',
      status: roomId === 'A202' ? 'Hỏng' : 'Tốt',
      warranty: '12/2027',
      icon: Wind,
      color: 'text-sky-600 bg-sky-50 border-sky-200'
    },
    {
      id: `TB_MC_${roomId}`,
      name: `Máy chiếu Sony Laser 4K 5000 Lumens`,
      type: 'MAYCHIEU',
      code: `TB_MC_${roomId}_01`,
      locationName: 'Trần nhà trung tâm (hướng về màn chiếu)',
      power: '420W',
      status: 'Tốt',
      warranty: '06/2026',
      icon: Tv,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      id: `TB_ML_${roomId}_2`,
      name: `Điều hòa Daikin Inverter 2.5HP (Phụ)`,
      type: 'MAYLANH',
      code: `TB_ML_${roomId}_02`,
      locationName: 'Tường sau góc phải (cuối lớp)',
      power: '2500W',
      status: 'Tốt',
      warranty: '12/2027',
      icon: Wind,
      color: 'text-sky-600 bg-sky-50 border-sky-200'
    },
    {
      id: `TB_QT_${roomId}`,
      name: `Quạt thông gió đảo chiều Senko 45W`,
      type: 'QUAT',
      code: `TB_QT_${roomId}_01`,
      locationName: 'Vách tường cửa sổ đón gió',
      power: '45W',
      status: 'Tốt',
      warranty: '08/2025',
      icon: Wind,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      id: `TB_IOT_${roomId}`,
      name: `Công tơ điện tử thông minh IoT LoRaWAN`,
      type: 'IOT',
      code: `IOT_METER_${roomId}`,
      locationName: 'Tủ điện kỹ thuật cạnh cửa chính',
      power: '5W',
      status: 'Tốt',
      warranty: '10/2028',
      icon: Zap,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    ...(room.loai_phong?.includes('máy tính') || room.loai_phong?.includes('Lab') ? [
      {
        id: `TB_PC_${roomId}`,
        name: `Dàn 40 máy tính Dell OptiPlex Core i7`,
        type: 'MAYTINH',
        code: `PC_LAB_${roomId}`,
        locationName: 'Dãy bàn học viên 1 - 4',
        power: '4500W',
        status: 'Tốt',
        warranty: '05/2027',
        icon: Monitor,
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      }
    ] : [])
  ];

  return (
    <div className="fixed inset-0 lg:left-64 z-40 overflow-hidden animate-fade-in pointer-events-none">
      {/* 1. Backdrop: chỉ phủ vùng làm việc, KHÔNG che phủ Sidebar (Chức năng quản lý ở hình 2 luôn ở trên) */}
      <div 
        className="fixed inset-0 lg:left-64 bg-slate-900/35 backdrop-blur-2xs transition-opacity cursor-pointer pointer-events-auto"
        onClick={onClose}
      />

      {/* 2. Slide-out Right Drawer Panel (~32% - 35% trên desktop) */}
      <aside className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] lg:w-[38%] xl:w-[32%] bg-slate-50 border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 ease-out pointer-events-auto">
        
        {/* Drawer Header */}
        <div className="p-4 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-slate-900 truncate">
                {room.ten_phong || `Phòng ${roomId}`}
              </h3>
                <Badge 
                  variant={room.trang_thai === 'Đang dùng' ? 'success' : room.trang_thai === 'Bảo trì' ? 'danger' : 'primary'} 
                  size="sm"
                >
                  {room.trang_thai || 'Sẵn sàng'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                Tòa {room.toa || 'A'} • Tầng {room.tang || 1} • {room.loai_phong || 'Phòng học'} ({room.dien_tich || 65} m²)
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Đóng panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* MỤC 1: THÔNG TIN TIẾT HỌC */}
          <div className="bg-gradient-to-br from-white to-blue-50/50 p-4 rounded-2xl border border-blue-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-blue-100">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="font-extrabold text-xs text-blue-900 uppercase tracking-tight">
                  Thông tin tiết học
                </span>
              </div>
              <Badge variant={scheduleInfo.trang_thai_type} size="sm">
                {scheduleInfo.trang_thai}
              </Badge>
            </div>

            <div>
              <h4 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
                {scheduleInfo.ten_mon_hoc}
              </h4>
              <span className="inline-block mt-0.5 text-[10px] font-mono font-bold px-1.5 py-0.2 bg-blue-100/70 text-blue-800 rounded">
                Mã HP: {scheduleInfo.ma_mon}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Giảng viên:
                </span>
                <strong className="text-slate-800 text-[11px]">{scheduleInfo.giang_vien}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> Lớp & Sĩ số:
                </span>
                <span className="font-semibold text-slate-800 text-[11px]">{scheduleInfo.lop} ({scheduleInfo.si_so})</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Thời gian:
                </span>
                <span className="font-bold text-blue-700 text-[11px]">{scheduleInfo.thoi_gian} ({scheduleInfo.caText})</span>
              </div>
            </div>
          </div>

          {/* MỤC 2: DANH SÁCH THIẾT BỊ TRONG PHÒNG */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Danh sách thiết bị ({devicesInRoom.length})</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Toàn bộ trang bị</span>
            </div>

            <div className="space-y-2.5">
              {devicesInRoom.map((dev) => {
                const Icon = dev.icon;
                const isBroken = dev.status === 'Hỏng';

                return (
                  <div
                    key={dev.id}
                    className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 transition-all text-xs space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${dev.color} border shadow-2xs`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 leading-snug">{dev.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono block">{dev.code}</span>
                        </div>
                      </div>

                      <Badge variant={isBroken ? 'danger' : 'success'} size="sm">
                        {dev.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-500 border-t border-slate-200/60">
                      <div>
                        <span className="block text-[10px] text-slate-400">Vị trí:</span>
                        <span className="font-semibold text-slate-700 leading-tight block">{dev.locationName}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-slate-400">Công suất:</span>
                        <span className="font-bold text-blue-700 leading-tight block">{dev.power}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                      <span>Hạn bảo hành: <strong className="text-slate-700">{dev.warranty}</strong></span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Hoạt động chuẩn
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </aside>
    </div>
  );
}
