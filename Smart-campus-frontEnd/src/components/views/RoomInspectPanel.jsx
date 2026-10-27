import React from 'react';
import {
  X,
  BookOpen,
  User,
  Users,
  Clock
} from 'lucide-react';
import { Badge } from '../common/Badge';

export function RoomInspectPanel({
  room,
  onClose
}) {
  if (!room) return null;

  const roomId = room.ma_phong || room.id || 'A101';
  const isOccupied = room.trang_thai === 'Đang dùng';
  const isMaintenance = room.trang_thai === 'Bảo trì';

  // Dữ liệu thời khóa biểu / thông tin tiết học theo từng phòng
  const scheduleDataMap = {
    'A101': {
      hasSchedule: true,
      caText: 'Ca 1 (Sáng)',
      thoi_gian: '07:30 - 11:30 (Ca 1 (Sáng))',
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
      thoi_gian: '07:30 - 11:30 (Ca 1 (Sáng))',
      ten_mon_hoc: 'Giải tích 2 & Đại số Tuyến tính',
      ma_mon: 'MATH102',
      giang_vien: 'TS. Lê Hồng Hạnh',
      lop: 'DTVT-K16',
      si_so: '58 / 60 sinh viên',
      trang_thai: 'Sắp diễn ra',
      trang_thai_type: 'primary'
    },
    'A201': {
      hasSchedule: true,
      caText: 'Ca 1 (Sáng)',
      thoi_gian: '07:30 - 11:30 (Ca 1 (Sáng))',
      ten_mon_hoc: 'Thực hành Mạng Máy Tính & Viễn Thông',
      ma_mon: 'NET2040',
      giang_vien: 'TS. Trần Thị B',
      lop: 'KTPM-K16',
      si_so: '44 / 45 sinh viên',
      trang_thai: 'Đang diễn ra',
      trang_thai_type: 'success'
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
      thoi_gian: '18:00 - 20:30 (Ca 3 (Tối))',
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
      thoi_gian: 'Tự do trong ngày',
      ten_mon_hoc: 'Phòng tự học & Thảo luận nhóm (Tự do)',
      ma_mon: 'FREE-STUDY',
      giang_vien: 'Sinh viên tự quản',
      lop: 'Nhóm đồ án',
      si_so: '0 / 15 chỗ',
      trang_thai: 'Sẵn sàng',
      trang_thai_type: 'primary'
    }
  };

  const scheduleInfo = scheduleDataMap[roomId] || {
    hasSchedule: !!room.currentSchedule,
    caText: 'Ca 1 (Sáng)',
    thoi_gian: '07:30 - 11:30 (Ca 1 (Sáng))',
    ten_mon_hoc: room.currentSchedule?.ten_mon_hoc || 'Sinh hoạt chuyên môn & Tự học',
    ma_mon: 'GEN101',
    giang_vien: room.currentSchedule?.giang_vien || 'ThS. Giảng viên phụ trách',
    lop: room.currentSchedule?.lop || 'Lớp sinh viên',
    si_so: `${room.suc_chua || 40} sinh viên`,
    trang_thai: room.trang_thai || 'Sẵn sàng',
    trang_thai_type: isOccupied ? 'success' : isMaintenance ? 'danger' : 'primary'
  };

  return (
    <div className="bg-white flex flex-col h-full overflow-hidden select-none">

      {/* 1. Header (Mã phòng, Tên phòng, Trạng thái, Vị trí & Nút X) */}
      <div className="p-5 border-b border-slate-100 flex items-start justify-between shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-slate-900 truncate">
              {room.ten_phong || `Phòng Lý Thuyết ${roomId}`}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${isOccupied
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
              : isMaintenance
                ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                : 'bg-blue-50 text-blue-600 border border-blue-200/60'
              }`}>
              {room.trang_thai || 'Sẵn sàng'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            Tòa {room.toa || 'A'} • Tầng {room.tang || 1} • {room.loai_phong || 'Phòng lý thuyết'} ({room.dien_tich || 65} m²)
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-2"
          title="Đóng chi tiết"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Body: THÔNG TIN TIẾT HỌC */}
      <div className="p-5 overflow-y-auto">
        <div className="bg-white p-5 rounded-2xl border border-blue-200/90 shadow-2xs space-y-4">

          {/* Card Header: Biểu tượng sách + THÔNG TIN TIẾT HỌC + Badge Đang diễn ra */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-blue-600">
              <BookOpen className="w-4 h-4 stroke-[2.2]" />
              <span className="font-black text-xs tracking-wider uppercase text-blue-900">
                THÔNG TIN TIẾT HỌC
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/70">
              {scheduleInfo.trang_thai}
            </span>
          </div>

          {/* Tên môn học */}
          <div>
            <h4 className="font-black text-lg text-slate-900 leading-tight">
              {scheduleInfo.ten_mon_hoc}
            </h4>
            <div className="mt-2">
              <span className="inline-block text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md">
                Mã HP: {scheduleInfo.ma_mon}
              </span>
            </div>
          </div>

          {/* Các dòng thông tin: Giảng viên, Lớp & Sĩ số, Thời gian */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-slate-500 shrink-0 font-medium">
                <User className="w-4 h-4 text-slate-400" />
                <span>Giảng viên:</span>
              </span>
              <strong className="text-slate-900 text-right truncate font-bold">{scheduleInfo.giang_vien}</strong>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-slate-500 shrink-0 font-medium">
                <Users className="w-4 h-4 text-slate-400" />
                <span>Lớp & Sĩ số:</span>
              </span>
              <span className="font-bold text-slate-900 text-right truncate">
                {scheduleInfo.lop} ({scheduleInfo.si_so})
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-slate-500 shrink-0 font-medium">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Thời gian:</span>
              </span>
              <span className="font-extrabold text-blue-600 text-right">
                {scheduleInfo.thoi_gian}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

