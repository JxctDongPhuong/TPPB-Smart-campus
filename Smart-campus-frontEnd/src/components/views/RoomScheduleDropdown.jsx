import React from 'react';
import { 
  X, 
  ChevronUp, 
  Clock, 
  BookOpen, 
  User, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  CalendarCheck,
  DoorOpen,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Badge } from '../common/Badge';

export function RoomScheduleDropdown({ room, onClose }) {
  if (!room) return null;

  const roomId = room.ma_phong || room.id || 'A101';
  const isMaintenanceRoom = room.trang_thai === 'Bảo trì';

  // Dữ liệu ca học chuẩn cho từng phòng (Ca 1: Sáng, Ca 2: Chiều, Ca 3: Tối)
  const roomSchedulesMap = {
    'A101': [
      {
        ca: 1,
        buoi: 'Sáng',
        gio: '07:30 – 11:30',
        trang_thai_ca: 'HOC', // 'HOC' | 'TRONG' | 'BAOTRI'
        trang_thai_text: 'Đang diễn ra',
        ten_mon_hoc: 'Lập trình Python Nâng Cao',
        ma_mon: 'IT3020',
        giang_vien: 'ThS. Nguyễn Văn A',
        lop: 'CNTT-K15',
        si_so: '48 / 50 sinh viên',
        ghi_chu: 'Lớp học chính khóa theo thời khóa biểu học kỳ'
      },
      {
        ca: 2,
        buoi: 'Chiều',
        gio: '13:00 – 17:00',
        trang_thai_ca: 'TRONG',
        trang_thai_text: 'Ca đang trống',
        ghi_chu: 'Phòng trống, không có lịch giảng dạy. Sẵn sàng tiếp nhận mượn phòng hoặc tự học.'
      },
      {
        ca: 3,
        buoi: 'Tối',
        gio: '17:30 – 21:00',
        trang_thai_ca: 'HOC',
        trang_thai_text: 'Sắp diễn ra',
        ten_mon_hoc: 'Kiến trúc Máy tính & Hệ điều hành',
        ma_mon: 'IT2010',
        giang_vien: 'TS. Hoàng Minh Tuấn',
        lop: 'KTPM-K16',
        si_so: '45 / 50 sinh viên',
        ghi_chu: 'Lớp học tín chỉ tăng cường buổi tối'
      }
    ],
    'A102': [
      {
        ca: 1,
        buoi: 'Sáng',
        gio: '07:30 – 11:30',
        trang_thai_ca: 'TRONG',
        trang_thai_text: 'Ca đang trống',
        ghi_chu: 'Phòng trống buổi sáng, sẵn sàng phục vụ sinh viên sinh hoạt học thuật.'
      },
      {
        ca: 2,
        buoi: 'Chiều',
        gio: '13:00 – 17:00',
        trang_thai_ca: 'HOC',
        trang_thai_text: 'Có lớp học',
        ten_mon_hoc: 'Giải tích 2 & Đại số Tuyến tính',
        ma_mon: 'MATH102',
        giang_vien: 'TS. Lê Hồng Hạnh',
        lop: 'DTVT-K16',
        si_so: '58 / 60 sinh viên',
        ghi_chu: 'Lớp lý thuyết chung giảng đường'
      },
      {
        ca: 3,
        buoi: 'Tối',
        gio: '17:30 – 21:00',
        trang_thai_ca: 'TRONG',
        trang_thai_text: 'Ca đang trống',
        ghi_chu: 'Không xếp lịch ca tối, các thiết bị đã được ngắt điện an toàn.'
      }
    ],
    'A201': [
      {
        ca: 1,
        buoi: 'Sáng',
        gio: '07:30 – 11:30',
        trang_thai_ca: 'TRONG',
        trang_thai_text: 'Ca đang trống',
        ghi_chu: 'Phòng Lab trống buổi sáng - hoàn tất kiểm tra đường truyền cáp quang.'
      },
      {
        ca: 2,
        buoi: 'Chiều',
        gio: '13:00 – 17:00',
        trang_thai_ca: 'HOC',
        trang_thai_text: 'Đang diễn ra',
        ten_mon_hoc: 'Thực hành Mạng Máy Tính & Viễn Thông',
        ma_mon: 'NET2040',
        giang_vien: 'TS. Trần Thị B',
        lop: 'KTPM-K16',
        si_so: '44 / 45 sinh viên',
        ghi_chu: 'Thực hành cấu hình Cisco Packet Tracer tại phòng máy'
      },
      {
        ca: 3,
        buoi: 'Tối',
        gio: '17:30 – 21:00',
        trang_thai_ca: 'TRONG',
        trang_thai_text: 'Ca đang trống',
        ghi_chu: 'Ca tối trống lịch thực hành.'
      }
    ],
    'A202': [
      {
        ca: 1,
        buoi: 'Sáng',
        gio: '07:30 – 11:30',
        trang_thai_ca: 'BAOTRI',
        trang_thai_text: 'Đang bảo trì',
        ghi_chu: 'Tạm ngưng phục vụ - Kỹ thuật viên đang kiểm tra lốc máy lạnh Panasonic A202.'
      },
      {
        ca: 2,
        buoi: 'Chiều',
        gio: '13:00 – 17:00',
        trang_thai_ca: 'BAOTRI',
        trang_thai_text: 'Đang bảo trì',
        ghi_chu: 'Tạm ngưng phục vụ - Chờ thay thế linh kiện theo Phiếu báo hỏng #1.'
      },
      {
        ca: 3,
        buoi: 'Tối',
        gio: '17:30 – 21:00',
        trang_thai_ca: 'BAOTRI',
        trang_thai_text: 'Đang bảo trì',
        ghi_chu: 'Phòng đóng cửa để đảm bảo an toàn thiết bị.'
      }
    ],
    'B301': [
      {
        ca: 1,
        buoi: 'Sáng',
        gio: '07:30 – 11:30',
        trang_thai_ca: 'TRONG',
        trang_thai_text: 'Ca đang trống',
        ghi_chu: 'Hội trường lớn đang trống, sẵn sàng tiếp nhận đăng ký sự kiện.'
      },
      {
        ca: 2,
        buoi: 'Chiều',
        gio: '13:00 – 17:00',
        trang_thai_ca: 'TRONG',
        trang_thai_text: 'Ca đang trống',
        ghi_chu: 'Hội trường sẵn sàng cho các hội thảo hoặc buổi lễ ký kết.'
      },
      {
        ca: 3,
        buoi: 'Tối',
        gio: '17:30 – 21:00',
        trang_thai_ca: 'HOC',
        trang_thai_text: 'Đã xếp lịch',
        ten_mon_hoc: 'Hội thảo Khoa học Sinh viên & Khởi nghiệp 2026',
        ma_mon: 'SEMINAR_2026',
        giang_vien: 'Đoàn Thanh Niên & Hội Sinh Viên',
        lop: 'Toàn trường',
        si_so: '120 / 150 chỗ ngồi',
        ghi_chu: 'Mượn hội trường tổ chức diễn đàn công nghệ trẻ'
      }
    ],
    'B302': [
      {
        ca: 1,
        buoi: 'Sáng',
        gio: '07:30 – 11:30',
        trang_thai_ca: 'TRONG',
        trang_thai_text: 'Ca đang trống',
        ghi_chu: 'Phòng học nhóm trống buổi sáng - Cảnh báo AI: phát hiện mở điều hòa ngoài giờ.'
      },
      {
        ca: 2,
        buoi: 'Chiều',
        gio: '13:00 – 17:00',
        trang_thai_ca: 'HOC',
        trang_thai_text: 'Đã duyệt mượn',
        ten_mon_hoc: 'Họp nhóm đồ án tốt nghiệp ngành Trí tuệ Nhân tạo',
        ma_mon: 'AI_CAPSTONE',
        giang_vien: 'Lê Văn Cường (Trưởng nhóm SV)',
        lop: 'KTPM-K15',
        si_so: '10 / 15 sinh viên',
        ghi_chu: 'Yêu cầu mượn phòng số #1 đã được phê duyệt'
      },
      {
        ca: 3,
        buoi: 'Tối',
        gio: '17:30 – 21:00',
        trang_thai_ca: 'TRONG',
        trang_thai_text: 'Ca đang trống',
        ghi_chu: 'Phòng học nhóm sẵn sàng cho sinh viên tự học.'
      }
    ]
  };

  // Fallback mặc định cho phòng thêm mới
  const defaultSchedules = [
    {
      ca: 1,
      buoi: 'Sáng',
      gio: '07:30 – 11:30',
      trang_thai_ca: room.trang_thai === 'Đang dùng' ? 'HOC' : (isMaintenanceRoom ? 'BAOTRI' : 'TRONG'),
      trang_thai_text: room.trang_thai === 'Đang dùng' ? 'Đang diễn ra' : (isMaintenanceRoom ? 'Đang bảo trì' : 'Ca đang trống'),
      ten_mon_hoc: room.trang_thai === 'Đang dùng' ? 'Môn học chuyên ngành' : null,
      ma_mon: 'MH101',
      giang_vien: 'Giảng viên bộ môn',
      lop: 'Lớp sinh viên',
      si_so: `${room.suc_chua || 40} sinh viên`,
      ghi_chu: room.trang_thai === 'Đang dùng' ? 'Tiết học diễn ra bình thường' : 'Phòng trống, sẵn sàng tiếp nhận lịch'
    },
    {
      ca: 2,
      buoi: 'Chiều',
      gio: '13:00 – 17:00',
      trang_thai_ca: isMaintenanceRoom ? 'BAOTRI' : 'TRONG',
      trang_thai_text: isMaintenanceRoom ? 'Đang bảo trì' : 'Ca đang trống',
      ghi_chu: 'Chưa có lịch đăng ký cho ca này.'
    },
    {
      ca: 3,
      buoi: 'Tối',
      gio: '17:30 – 21:00',
      trang_thai_ca: isMaintenanceRoom ? 'BAOTRI' : 'TRONG',
      trang_thai_text: isMaintenanceRoom ? 'Đang bảo trì' : 'Ca đang trống',
      ghi_chu: 'Chưa có lịch đăng ký cho ca này.'
    }
  ];

  const shiftList = roomSchedulesMap[roomId] || defaultSchedules;

  // Thống kê ca
  const hocCount = shiftList.filter(s => s.trang_thai_ca === 'HOC').length;
  const trongCount = shiftList.filter(s => s.trang_thai_ca === 'TRONG').length;
  const baoTriCount = shiftList.filter(s => s.trang_thai_ca === 'BAOTRI').length;

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-b from-blue-50/60 via-slate-50/40 to-white border-l-4 border-l-[#1e7fd8] shadow-inner animate-fade-in-down space-y-3.5 select-none">
      
      {/* 1. Header tóm tắt của phần đổ xuống */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-blue-100">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
              Lịch sử dụng các ca trong ngày • {room.ten_phong || `Phòng ${roomId}`}
            </h4>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              room.trang_thai === 'Đang dùng' 
                ? 'bg-emerald-100 text-emerald-800' 
                : isMaintenanceRoom 
                  ? 'bg-rose-100 text-rose-800' 
                  : 'bg-blue-100 text-blue-800'
            }`}>
              {room.trang_thai || 'Sẵn sàng'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tòa {room.toa || 'A'} • Tầng {room.tang || 1} • {room.loai_phong || 'Phòng học'} • Sức chứa: {room.suc_chua || 40} người ({room.so_ban || 20} bàn) • {room.dien_tich || 60} m²
          </p>
        </div>

        {/* Thống kê ca & Nút thu gọn */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {hocCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold border border-blue-200">
                {hocCount} ca có học
              </span>
            )}
            {trongCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                {trongCount} ca đang trống
              </span>
            )}
            {baoTriCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold border border-rose-200">
                {baoTriCount} ca bảo trì
              </span>
            )}
          </div>

          <button 
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Đóng chi tiết ca phòng"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Thu gọn</span>
          </button>
        </div>
      </div>

      {/* 2. Bảng bố cục con theo đúng yêu cầu: Ca | Môn học | Giảng viên | Giờ | Sĩ số | Trạng thái */}
      <div className="rounded-xl overflow-hidden border border-blue-300 shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1e7fd8] text-white font-bold text-xs select-none">
                <th className="py-2.5 px-4 w-28 border-r border-blue-400/50">Ca</th>
                <th className="py-2.5 px-4 min-w-[200px] border-r border-blue-400/50">Môn học</th>
                <th className="py-2.5 px-4 min-w-[160px] border-r border-blue-400/50">Giảng viên</th>
                <th className="py-2.5 px-4 w-36 border-r border-blue-400/50">Giờ</th>
                <th className="py-2.5 px-4 w-44 border-r border-blue-400/50">Sĩ số</th>
                <th className="py-2.5 px-4 w-36 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {shiftList.map((shift, idx) => {
                const isShiftHoc = shift.trang_thai_ca === 'HOC';
                const isShiftTrong = shift.trang_thai_ca === 'TRONG';
                const isShiftBaoTri = shift.trang_thai_ca === 'BAOTRI';
                
                // Hàng so le: hàng chẵn màu trắng, hàng lẻ màu xanh nhạt (#cde4f7) như hình
                const rowBg = idx % 2 === 1 ? 'bg-[#cde4f7]/80 hover:bg-[#c3def5]' : 'bg-white hover:bg-slate-50';

                return (
                  <tr 
                    key={shift.ca} 
                    className={`${rowBg} transition-colors text-slate-800 font-medium`}
                  >
                    {/* Cột 1: Ca */}
                    <td className="py-3 px-4 font-bold border-r border-blue-100/60 text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] text-white ${
                          isShiftHoc ? 'bg-blue-600' : isShiftTrong ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}>
                          {shift.ca}
                        </span>
                        <span>Ca {shift.ca} ({shift.buoi})</span>
                      </div>
                    </td>

                    {/* Cột 2: Môn học */}
                    <td className="py-3 px-4 border-r border-blue-100/60 font-semibold text-slate-900">
                      {isShiftHoc ? (
                        <div>
                          <span>{shift.ten_mon_hoc}</span>
                          {shift.ma_mon && (
                            <span className="ml-2 inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                              {shift.ma_mon}
                            </span>
                          )}
                        </div>
                      ) : isShiftTrong ? (
                        <span className="text-emerald-700 italic font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Phòng trống (Chưa xếp lịch học)</span>
                        </span>
                      ) : (
                        <span className="text-rose-700 italic font-medium flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Tạm ngưng phục vụ (Đang bảo trì)</span>
                        </span>
                      )}
                    </td>

                    {/* Cột 3: Giảng viên */}
                    <td className="py-3 px-4 border-r border-blue-100/60 text-slate-800 whitespace-nowrap">
                      {isShiftHoc ? (
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{shift.giang_vien}</span>
                        </div>
                      ) : isShiftTrong ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <span className="text-rose-700 font-medium">Ban bảo trì kỹ thuật</span>
                      )}
                    </td>

                    {/* Cột 4: Giờ */}
                    <td className="py-3 px-4 border-r border-blue-100/60 font-mono font-bold text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{shift.gio}</span>
                      </div>
                    </td>

                    {/* Cột 5: Sĩ số */}
                    <td className="py-3 px-4 border-r border-blue-100/60 text-slate-800 whitespace-nowrap">
                      {isShiftHoc ? (
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{shift.si_so}</span>
                          {shift.lop && (
                            <span className="text-slate-500 font-normal text-[11px]">({shift.lop})</span>
                          )}
                        </div>
                      ) : isShiftTrong ? (
                        <span className="text-emerald-700 font-medium">
                          0 / {room.suc_chua || 40} SV (Trống {room.suc_chua || 40} chỗ)
                        </span>
                      ) : (
                        <span className="text-rose-600 font-medium">
                          0 chỗ (Tạm đóng cửa)
                        </span>
                      )}
                    </td>

                    {/* Cột 6: Trạng thái */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                        isShiftHoc 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : isShiftTrong 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {shift.trang_thai_text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
