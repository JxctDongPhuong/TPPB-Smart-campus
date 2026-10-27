import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Monitor, 
  Tv, 
  Wind, 
  Zap, 
  DoorClosed, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Sparkles,
  Info,
  Maximize2,
  Cpu,
  Power,
  Layers,
  Building,
  GraduationCap,
  BookOpen,
  Users,
  ChevronRight,
  ChevronLeft,
  X,
  SlidersHorizontal,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export function RoomPlanView({ 
  roomId = 'A101', 
  rooms = [], 
  roomDetail, 
  onSelectRoom, 
  onBack,
  onNavigateToTickets 
}) {
  const currentRoom = rooms.find(r => (r.ma_phong || r.id) === roomId) || roomDetail || {
    ma_phong: roomId,
    toa: roomId.charAt(0) || 'A',
    tang: parseInt(roomId.charAt(1)) || 1,
    loai_phong: 'Phòng lý thuyết',
    suc_chua: 50,
    so_ban: 25,
    dien_tich: 65.0,
    trang_thai: 'Đang dùng'
  };

  // Trạng thái mở/đóng của panel bên phải (chiếm 30%)
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [devicePowerState, setDevicePowerState] = useState({});

  // Dữ liệu thời khóa biểu / thông tin tiết học theo phòng
  const scheduleDataMap = {
    'A101': {
      hasSchedule: true,
      ca: 1,
      caText: 'Ca 1 (Sáng)',
      thoi_gian: '07:30 - 11:30',
      ten_mon_hoc: 'Lập trình Python Nâng Cao',
      ma_mon: 'IT3020',
      giang_vien: 'ThS. Nguyễn Văn A',
      lop: 'CNTT-K15',
      si_so: '48 / 50 sinh viên',
      trang_thai: 'Đang diễn ra',
      trang_thai_type: 'success',
      tien_do_percent: 65,
      tien_do_text: 'Đã học 2h35p / 4h00p',
      bai_hoc: 'Chương 4: Lập trình Socket đa luồng & RESTful API'
    },
    'A102': {
      hasSchedule: true,
      ca: 1,
      caText: 'Ca 1 (Sáng)',
      thoi_gian: '07:30 - 11:30',
      ten_mon_hoc: 'Giải tích 2 & Đại số Tuyến tính',
      ma_mon: 'MATH102',
      giang_vien: 'TS. Lê Hồng Hạnh',
      lop: 'DTVT-K16',
      si_so: '58 / 60 sinh viên',
      trang_thai: 'Đang diễn ra',
      trang_thai_type: 'success',
      tien_do_percent: 50,
      tien_do_text: 'Đã học 2h00p / 4h00p',
      bai_hoc: 'Chuỗi Fourier và tích phân mặt loại 2'
    },
    'A201': {
      hasSchedule: true,
      ca: 2,
      caText: 'Ca 2 (Chiều)',
      thoi_gian: '13:00 - 17:00',
      ten_mon_hoc: 'Thực hành Mạng Máy Tính & Viễn Thông',
      ma_mon: 'NET2040',
      giang_vien: 'TS. Trần Thị B',
      lop: 'KTPM-K16',
      si_so: '44 / 45 sinh viên',
      trang_thai: 'Sắp diễn ra',
      trang_thai_type: 'warning',
      tien_do_percent: 0,
      tien_do_text: 'Bắt đầu lúc 13:00',
      bai_hoc: 'Lab 5: Cấu hình VLAN Trunking & Định tuyến OSPF'
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
      trang_thai_type: 'danger',
      tien_do_percent: 0,
      tien_do_text: 'Chờ sửa điều hòa',
      bai_hoc: 'Phòng học tạm khóa do sự cố rò nước điều hòa Panasonic'
    },
    'B301': {
      hasSchedule: true,
      ca: 3,
      caText: 'Ca 3 (Tối)',
      thoi_gian: '18:00 - 20:30',
      ten_mon_hoc: 'Hội thảo Xu hướng AI & Chuyển đổi số 2026',
      ma_mon: 'SEMINAR_AI',
      giang_vien: 'Khoa CNTT & Doanh nghiệp',
      lop: 'Toàn khóa K15-K18',
      si_so: '145 / 150 sinh viên',
      trang_thai: 'Sắp diễn ra',
      trang_thai_type: 'primary',
      tien_do_percent: 0,
      tien_do_text: 'Chuẩn bị check-in 17:30',
      bai_hoc: 'Diễn thuyết và Q&A cùng chuyên gia công nghệ'
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
      trang_thai_type: 'warning',
      tien_do_percent: 0,
      tien_do_text: 'Chưa có lịch đăng ký',
      bai_hoc: 'Hệ thống AI ghi nhận thiết bị đang bật khi không có ca học'
    }
  };

  const scheduleInfo = scheduleDataMap[roomId] || {
    hasSchedule: !!currentRoom.currentSchedule,
    caText: 'Ca 1 (Sáng)',
    thoi_gian: '07:30 - 11:30',
    ten_mon_hoc: currentRoom.currentSchedule?.ten_mon_hoc || 'Sinh hoạt chuyên môn & Tự học',
    ma_mon: 'GEN101',
    giang_vien: currentRoom.currentSchedule?.giang_vien || 'ThS. Giảng viên phụ trách',
    lop: currentRoom.currentSchedule?.lop || 'Lớp sinh viên',
    si_so: `${currentRoom.suc_chua || 40} sinh viên`,
    trang_thai: currentRoom.trang_thai || 'Sẵn sàng',
    trang_thai_type: 'primary',
    tien_do_percent: 40,
    tien_do_text: 'Đang diễn ra',
    bai_hoc: 'Tiết học theo phân công lịch phòng'
  };

  // Danh sách thiết bị trong phòng cùng vị trí tọa độ trên sơ đồ phòng học
  const devicesInRoom = [
    {
      id: `TB_ML_${roomId}_1`,
      name: `Điều hòa Daikin Inverter 2.5HP`,
      type: 'MAYLANH',
      code: `TB_ML_${roomId}_01`,
      locationName: 'Tường trước góc trái (gần bục giảng)',
      posX: 16,
      posY: 14,
      power: '2500W',
      status: roomId === 'A202' ? 'Hỏng' : 'Tốt',
      warranty: '12/2027',
      year: 2023,
      icon: Wind,
      color: 'text-sky-600 bg-sky-50 border-sky-300'
    },
    {
      id: `TB_MC_${roomId}`,
      name: `Máy chiếu Sony Laser 4K 5000 Lumens`,
      type: 'MAYCHIEU',
      code: `TB_MC_${roomId}_01`,
      locationName: 'Trần nhà trung tâm (hướng về màn chiếu)',
      posX: 50,
      posY: 28,
      power: '420W',
      status: 'Tốt',
      warranty: '06/2026',
      year: 2023,
      icon: Tv,
      color: 'text-amber-600 bg-amber-50 border-amber-300'
    },
    {
      id: `TB_ML_${roomId}_2`,
      name: `Điều hòa Daikin Inverter 2.5HP (Phụ)`,
      type: 'MAYLANH',
      code: `TB_ML_${roomId}_02`,
      locationName: 'Tường sau góc phải (cuối lớp)',
      posX: 84,
      posY: 70,
      power: '2500W',
      status: 'Tốt',
      warranty: '12/2027',
      year: 2023,
      icon: Wind,
      color: 'text-sky-600 bg-sky-50 border-sky-300'
    },
    {
      id: `TB_QT_${roomId}`,
      name: `Quạt thông gió đảo chiều Senko 45W`,
      type: 'QUAT',
      code: `TB_QT_${roomId}_01`,
      locationName: 'Vách tường cửa sổ đón gió',
      posX: 88,
      posY: 38,
      power: '45W',
      status: 'Tốt',
      warranty: '08/2025',
      year: 2024,
      icon: Wind,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-300'
    },
    {
      id: `TB_IOT_${roomId}`,
      name: `Công tơ điện tử thông minh IoT LoRaWAN`,
      type: 'IOT',
      code: `IOT_METER_${roomId}`,
      locationName: 'Tủ điện kỹ thuật cạnh cửa chính',
      posX: 88,
      posY: 84,
      power: '5W',
      status: 'Tốt',
      warranty: '10/2028',
      year: 2024,
      icon: Zap,
      color: 'text-purple-600 bg-purple-50 border-purple-300'
    },
    ...(currentRoom.loai_phong?.includes('máy tính') || currentRoom.loai_phong?.includes('Lab') ? [
      {
        id: `TB_PC_${roomId}`,
        name: `Dàn 40 máy tính Dell OptiPlex Core i7`,
        type: 'MAYTINH',
        code: `PC_LAB_${roomId}`,
        locationName: 'Dãy bàn học viên 1 - 4',
        posX: 50,
        posY: 62,
        power: '4500W',
        status: 'Tốt',
        warranty: '05/2027',
        year: 2023,
        icon: Monitor,
        color: 'text-blue-600 bg-blue-50 border-blue-300'
      }
    ] : [])
  ];

  const activeDevice = devicesInRoom.find(d => d.id === selectedDeviceId) || devicesInRoom[0];

  const togglePower = (devId) => {
    setDevicePowerState(prev => ({
      ...prev,
      [devId]: !prev[devId]
    }));
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Quay lại danh mục phòng"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Sơ đồ phòng {roomId}
              </h1>
              <Badge 
                variant={currentRoom.trang_thai === 'Đang dùng' ? 'success' : currentRoom.trang_thai === 'Bảo trì' ? 'danger' : 'primary'} 
                size="sm"
              >
                {currentRoom.trang_thai || 'Sẵn sàng'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tòa {currentRoom.toa || 'A'} • Tầng {currentRoom.tang || 1} • {currentRoom.loai_phong || 'Phòng học'} ({currentRoom.dien_tich || 65} m²)
            </p>
          </div>
        </div>

        {/* Action Controls & Room Switcher */}
        <div className="flex items-center gap-2">
          {/* Toggle Panel Button */}
          <button
            onClick={() => setIsPanelOpen(prev => !prev)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              isPanelOpen 
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isPanelOpen ? 'Đóng panel thông tin (30%)' : 'Mở panel thông tin (30%)'}</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <select
            value={roomId}
            onChange={(e) => onSelectRoom?.(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            {rooms.map(r => (
              <option key={r.ma_phong} value={r.ma_phong}>
                Phòng {r.ma_phong} ({r.loai_phong || 'Phòng học'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Main Flex Workspace: ~70% Floor Plan Blueprint & ~30% Slide-out Detail Panel */}
      <div className="flex flex-col lg:flex-row items-start gap-4">
        
        {/* Left Area: 2D Classroom Floor Plan Blueprint (~70% width or 100% if panel collapsed) */}
        <div className={`transition-all duration-300 w-full ${isPanelOpen ? 'lg:w-[68%] xl:w-[70%]' : 'lg:w-full'}`}>
          <Card className="p-5 sm:p-6 bg-white border-slate-200/90 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight uppercase">
                  Mặt bằng kiến trúc & Vị trí thiết bị
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                <span>Nhấp vào thiết bị trên sơ đồ để xem vị trí và thao tác</span>
              </div>
            </div>

            {/* 2D Interactive Blueprint Canvas */}
            <div className="relative w-full aspect-[16/10] bg-slate-900 rounded-2xl border-4 border-slate-800 shadow-inner overflow-hidden select-none p-6 flex flex-col justify-between">
              {/* Background Grid Pattern */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, #60a5fa 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />

              {/* Front Wall: Bục giảng, Bảng viết & Màn chiếu */}
              <div className="relative z-10 w-full flex flex-col items-center">
                {/* Bảng viết Whiteboard */}
                <div className="w-3/5 h-6 bg-slate-700 border-2 border-slate-600 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-300 tracking-wider shadow-md">
                  BẢNG VIẾT / MÀN CHIẾU THÔNG MINH
                </div>
                {/* Bục giảng giáo viên */}
                <div className="mt-2 w-32 h-7 bg-amber-900/60 border border-amber-600/50 rounded flex items-center justify-center text-[10px] font-semibold text-amber-200">
                  Bục giảng & Bàn GV
                </div>
              </div>

              {/* Middle Area: Dãy bàn ghế học sinh / sinh viên */}
              <div className="relative z-10 w-full px-8 py-4">
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((desk) => (
                    <div 
                      key={desk} 
                      className="h-10 bg-slate-800/80 border border-slate-700/80 rounded-lg flex flex-col items-center justify-center text-[10px] text-slate-400 font-medium shadow-xs"
                    >
                      <div className="w-full text-center truncate px-1">Dãy bàn #{desk}</div>
                      <div className="flex gap-1 mt-0.5 opacity-60">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Wall: Cửa ra vào & Cửa sổ */}
              <div className="relative z-10 w-full flex items-center justify-between text-[10px] font-bold px-4">
                {/* Cửa sổ Windows */}
                <div className="flex items-center gap-1 text-sky-400/80">
                  <span className="w-16 h-1.5 bg-sky-500/40 rounded-full" />
                  <span>Hệ thống Cửa sổ</span>
                </div>
                {/* Cửa ra vào Door */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded text-amber-300">
                  <DoorClosed className="w-3.5 h-3.5" />
                  <span>Cửa ra vào chính</span>
                </div>
              </div>

              {/* DEVICE HOTSPOTS / PINS ON FLOOR PLAN */}
              {devicesInRoom.map((dev) => {
                const Icon = dev.icon;
                const isSelected = activeDevice.id === dev.id;
                const isBroken = dev.status === 'Hỏng';
                const isPoweredOn = devicePowerState[dev.id] !== false;

                return (
                  <button
                    key={dev.id}
                    onClick={() => {
                      setSelectedDeviceId(dev.id);
                      if (!isPanelOpen) setIsPanelOpen(true);
                    }}
                    style={{ left: `${dev.posX}%`, top: `${dev.posY}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group transition-all duration-200 cursor-pointer ${
                      isSelected ? 'scale-125' : 'hover:scale-110'
                    }`}
                  >
                    {/* Glowing pulse ring */}
                    <span className={`absolute -inset-2.5 rounded-full opacity-70 animate-ping ${
                      isBroken ? 'bg-rose-500' : isSelected ? 'bg-blue-400' : 'bg-emerald-400'
                    }`} />

                    {/* Main device pin icon */}
                    <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center shadow-lg border-2 transition-colors ${
                      isSelected 
                        ? 'bg-blue-600 text-white border-white ring-4 ring-blue-500/30' 
                        : isBroken 
                        ? 'bg-rose-600 text-white border-rose-200' 
                        : 'bg-slate-800 text-white border-slate-600 hover:border-blue-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Pin Label tooltip */}
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded text-[9px] font-bold whitespace-nowrap shadow-md transition-opacity pointer-events-none ${
                      isSelected 
                        ? 'bg-blue-600 text-white opacity-100 z-30' 
                        : 'bg-slate-800 text-slate-200 opacity-80 group-hover:opacity-100'
                    }`}>
                      {dev.name.split(' ')[0]} {dev.name.split(' ')[1]}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Blueprint Legend */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Hoạt động tốt</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Đang báo hỏng</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-200" />
                  <span>Đang chọn kiểm tra</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">Tỷ lệ bản vẽ chuẩn: 1:50</span>
            </div>
          </Card>
        </div>

        {/* Right Area: ~30% Slide-out Side Panel (Thông tin tiết học + Danh sách thiết bị + Chi tiết thiết bị) */}
        {isPanelOpen && (
          <div className="w-full lg:w-[32%] xl:w-[30%] shrink-0 space-y-4 animate-in slide-in-from-right-8 duration-300 ease-out">
            
            {/* 1. THÔNG TIN TIẾT HỌC (Schedule & Lesson Information) */}
            <Card className="p-4 bg-gradient-to-br from-white to-blue-50/40 border-blue-200/80 shadow-xs space-y-3">
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
                <h4 className="font-black text-sm text-slate-900 leading-snug">
                  {scheduleInfo.ten_mon_hoc}
                </h4>
                <span className="inline-block mt-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 bg-blue-100/70 text-blue-800 rounded">
                  Mã học phần: {scheduleInfo.ma_mon}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Giảng viên:
                  </span>
                  <strong className="text-slate-800">{scheduleInfo.giang_vien}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> Lớp & Sĩ số:
                  </span>
                  <span className="font-semibold text-slate-800">{scheduleInfo.lop} ({scheduleInfo.si_so})</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Thời gian:
                  </span>
                  <span className="font-bold text-blue-700">{scheduleInfo.thoi_gian} ({scheduleInfo.caText})</span>
                </div>
              </div>

              {/* Tiết học progress */}
              {scheduleInfo.tien_do_percent > 0 && (
                <div className="pt-2 border-t border-blue-100/80">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500 font-medium">Tiến độ ca học:</span>
                    <span className="font-bold text-blue-800">{scheduleInfo.tien_do_text}</span>
                  </div>
                  <div className="w-full bg-blue-100/80 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${scheduleInfo.tien_do_percent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Lesson topic notes */}
              <div className="p-2.5 bg-white/80 rounded-xl border border-blue-100/80 text-[11px] text-slate-600">
                <span className="font-bold text-slate-800 block mb-0.5">Nội dung ca học:</span>
                <span className="italic">{scheduleInfo.bai_hoc}</span>
              </div>
            </Card>

            {/* 2. CHI TIẾT THIẾT BỊ ĐANG CHỌN (Active Device Details & Control) */}
            <Card className="p-4 border-slate-200/90 shadow-xs space-y-3 bg-white">
              <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${activeDevice.color}`}>
                    <activeDevice.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                      {activeDevice.name}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400">{activeDevice.code}</p>
                  </div>
                </div>
                <Badge variant={activeDevice.status === 'Hỏng' ? 'danger' : 'success'} size="sm">
                  {activeDevice.status}
                </Badge>
              </div>

              {/* Device specs list */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 text-[11px]">Vị trí trong phòng:</span>
                  <span className="font-bold text-slate-800 text-[11px] text-right">{activeDevice.locationName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 text-[11px]">Công suất tiêu thụ:</span>
                  <span className="font-bold text-blue-700 text-[11px]">{activeDevice.power}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 text-[11px]">Hạn bảo hành:</span>
                  <span className="font-semibold text-slate-700 text-[11px]">{activeDevice.warranty}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 text-[11px]">Vận hành tự động:</span>
                  <span className="font-bold text-emerald-700 text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Chuẩn AI IoT
                  </span>
                </div>
              </div>

              {/* Quick device actions: Bật/Tắt & Báo hỏng */}
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant={devicePowerState[activeDevice.id] === false ? 'outline' : 'primary'}
                  icon={Power}
                  onClick={() => togglePower(activeDevice.id)}
                  className="w-full text-xs font-bold justify-center py-2"
                >
                  {devicePowerState[activeDevice.id] === false ? 'Bật Nguồn Thiết Bị' : 'Ngắt Nguồn Tức Thì'}
                </Button>

                <Button
                  variant="outline"
                  icon={Wrench}
                  onClick={onNavigateToTickets}
                  className="w-full text-xs font-bold justify-center py-2 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                >
                  Gửi Phiếu Báo Hỏng Thiết Bị
                </Button>
              </div>
            </Card>

            {/* 3. DANH SÁCH THIẾT BỊ TRONG PHÒNG (Room Device List) */}
            <Card className="p-4 border-slate-200/90 shadow-xs bg-white">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Danh sách thiết bị ({devicesInRoom.length})</span>
                </h4>
                <span className="text-[10px] text-slate-400">Nhấp để xem</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[260px] overflow-y-auto pr-1">
                {devicesInRoom.map((dev) => {
                  const Icon = dev.icon;
                  const isSelected = activeDevice.id === dev.id;
                  const isPowerOff = devicePowerState[dev.id] === false;

                  return (
                    <div
                      key={dev.id}
                      onClick={() => setSelectedDeviceId(dev.id)}
                      className={`p-2 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer text-xs mb-1 ${
                        isSelected 
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200 ring-2 ring-blue-500/10' 
                          : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${dev.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-xs">{dev.name}</p>
                          <span className="text-[10px] text-slate-400 block font-mono">{dev.code}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end">
                        <span className="font-mono text-[10px] font-bold text-slate-600">{dev.power}</span>
                        <span className={`text-[9px] font-semibold ${
                          dev.status === 'Hỏng' 
                            ? 'text-rose-600' 
                            : isPowerOff 
                            ? 'text-slate-400' 
                            : 'text-emerald-600'
                        }`}>
                          {dev.status === 'Hỏng' ? 'Sự cố' : isPowerOff ? 'Đã tắt' : 'Đang bật'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

          </div>
        )}

      </div>
    </div>
  );
}
