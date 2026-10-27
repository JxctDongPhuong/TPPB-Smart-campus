import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  BookOpen, 
  UserCheck, 
  Users, 
  DoorClosed,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Inbox,
  AlertTriangle,
  HelpCircle,
  Trash2,
  Search
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { campusApi } from '../../services/api';

const CA_INFO = {
  1: { label: 'Ca 1 (Sáng)', time: '07:30 - 11:30', bg: 'bg-amber-50 text-amber-700 border-amber-200/60' },
  2: { label: 'Ca 2 (Chiều)', time: '13:00 - 17:00', bg: 'bg-blue-50 text-blue-700 border-blue-200/60' },
  3: { label: 'Ca 3 (Tối)', time: '17:30 - 21:00', bg: 'bg-purple-50 text-purple-700 border-purple-200/60' }
};

export function ScheduleView({ searchQuery = '' }) {
  const [activeSubTab, setActiveSubTab] = useState('timetable'); // 'timetable' or 'requests'
  const [schedules, setSchedules] = useState([]);
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchQuery);
  const [filterToa, setFilterToa] = useState('ALL');

  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== null) {
      setSearch(searchQuery);
    }
  }, [searchQuery]);

  // Modals
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Confirmation Dialog Modal State (supports APPROVE, REJECT, DELETE_SCHEDULE)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    action: 'DaDuyet', // 'DaDuyet' | 'TuChoi' | 'DELETE_SCHEDULE'
    request: null,
    schedule: null,
    ghiChu: '',
    loading: false,
    error: null
  });

  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    ma_phong: 'A101',
    ngay: new Date().toISOString().split('T')[0],
    ca: 1,
    loai: 'HOC',
    noi_dung: '',
    so_nguoi: 40
  });

  const [requestForm, setRequestForm] = useState({
    ma_phong: 'A102',
    ngay: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    ca: 2,
    so_nguoi: 30,
    muc_dich: '',
    ghi_chu: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [schedRes, reqRes, roomsRes] = await Promise.all([
        campusApi.getSchedulesList(),
        campusApi.getBookingRequests(),
        campusApi.getAllRoomsList()
      ]);
      setSchedules(Array.isArray(schedRes) ? schedRes : []);
      setRequests(Array.isArray(reqRes) ? reqRes : []);
      setRooms(Array.isArray(roomsRes) ? roomsRes : []);
    } catch (err) {
      console.error('[ScheduleView] Lỗi tải dữ liệu:', err);
      setSchedules([]);
      setRequests([]);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Chuyển ngày trước / ngày tiếp theo
  const handlePrevDay = () => {
    const parts = (selectedDate || '').split('-');
    const current = parts.length === 3 
      ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) 
      : new Date();
    current.setDate(current.getDate() - 1);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const handleNextDay = () => {
    const parts = (selectedDate || '').split('-');
    const current = parts.length === 3 
      ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) 
      : new Date();
    current.setDate(current.getDate() + 1);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  // Filter schedules by date
  const filteredSchedules = schedules.filter(s => s.ngay === selectedDate);

  // Filter rooms & schedules for matrix table
  const availableBuildings = Array.from(new Set(rooms.map(r => r.toa).filter(Boolean))).sort();

  const filteredRooms = rooms.filter(r => {
    if (r.da_xoa) return false;
    const q = (search || '').trim().toLowerCase();
    const matchToa = filterToa === 'ALL' || r.toa === filterToa;

    const roomSchedules = schedules.filter(s => s.ma_phong === r.ma_phong && s.ngay === selectedDate);
    const hasMatchingSchedule = roomSchedules.some(s => 
      (s.noi_dung || '').toLowerCase().includes(q) ||
      (s.ten_mon_hoc || '').toLowerCase().includes(q) ||
      (s.giang_vien || '').toLowerCase().includes(q) ||
      (s.ma_lich || '').toLowerCase().includes(q)
    );

    const matchSearch = !q ||
                        (r.ma_phong || '').toLowerCase().includes(q) ||
                        (r.ten_phong || '').toLowerCase().includes(q) ||
                        (r.loai_phong || '').toLowerCase().includes(q) ||
                        (r.toa || '').toLowerCase().includes(q) ||
                        (`tòa ${r.toa || ''}`).toLowerCase().includes(q) ||
                        hasMatchingSchedule;

    return matchToa && matchSearch;
  });

  // Thêm lịch học
  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.noi_dung) return alert('Vui lòng nhập nội dung môn học!');

    // Check duplicate room & ca on date
    const isExisted = schedules.some(
      s => s.ma_phong === scheduleForm.ma_phong && s.ngay === scheduleForm.ngay && s.ca === Number(scheduleForm.ca)
    );
    if (isExisted) {
      return alert(`Lỗi trùng lịch: Phòng ${scheduleForm.ma_phong} ngày ${scheduleForm.ngay} trong Ca ${scheduleForm.ca} đã có người sử dụng!`);
    }

    try {
      await campusApi.createSchedule({
        ...scheduleForm,
        ca: Number(scheduleForm.ca),
        so_nguoi: Number(scheduleForm.so_nguoi)
      });
      setIsAddScheduleModalOpen(false);
      setScheduleForm({
        ma_phong: rooms[0]?.ma_phong || 'A101',
        ngay: selectedDate,
        ca: 1,
        loai: 'HOC',
        noi_dung: '',
        so_nguoi: 40
      });
      await loadData();
      alert('Đã xếp lịch phòng thành công!');
    } catch (err) {
      alert(`Không thể xếp lịch: ${err.message}`);
    }
  };

  // Mở đăng ký nhanh từ ô trống
  const handleQuickBook = (maPhong, caNum) => {
    setRequestForm(prev => ({
      ...prev,
      ma_phong: maPhong,
      ca: caNum,
      ngay: selectedDate,
      so_nguoi: 30,
      muc_dich: ''
    }));
    setIsRequestModalOpen(true);
  };

  // Gửi yêu cầu mượn
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.muc_dich) return alert('Vui lòng nhập mục đích mượn!');

    try {
      await campusApi.submitBookingRequest({
        ...requestForm,
        ca: Number(requestForm.ca),
        so_nguoi: Number(requestForm.so_nguoi)
      });
      setIsRequestModalOpen(false);
      await loadData();
      alert('Đã gửi yêu cầu mượn phòng tới Ban Quản Lý CSVC thành công!');
    } catch (err) {
      alert(`Lỗi gửi yêu cầu: ${err.message}`);
    }
  };

  // Mở hộp thoại xác nhận Duyệt hoặc Từ chối yêu cầu
  const handleOpenConfirmDialog = (request, action) => {
    setConfirmDialog({
      isOpen: true,
      action: action,
      request: request,
      schedule: null,
      ghiChu: action === 'DaDuyet' 
        ? 'Chấp thuận cấp phòng sử dụng theo kế hoạch' 
        : 'Từ chối do trùng kế hoạch bảo trì hoặc không phù hợp',
      loading: false,
      error: null
    });
  };

  // Mở hộp thoại xác nhận Xóa lịch phòng
  const handleOpenDeleteScheduleDialog = (sched) => {
    setConfirmDialog({
      isOpen: true,
      action: 'DELETE_SCHEDULE',
      request: null,
      schedule: sched,
      ghiChu: '',
      loading: false,
      error: null
    });
  };

  // Đóng hộp thoại xác nhận
  const handleCloseConfirmDialog = () => {
    if (confirmDialog.loading) return;
    setConfirmDialog({
      isOpen: false,
      action: 'DaDuyet',
      request: null,
      schedule: null,
      ghiChu: '',
      loading: false,
      error: null
    });
  };

  // Thực hiện Duyệt / Từ chối / Xóa lịch sau khi bấm xác nhận trong Dialog Box
  const handleExecuteConfirm = async () => {
    setConfirmDialog(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (confirmDialog.action === 'DELETE_SCHEDULE' && confirmDialog.schedule) {
        await campusApi.deleteSchedule(confirmDialog.schedule.ma_lich);
        handleCloseConfirmDialog();
        await loadData();
        return;
      }

      if (confirmDialog.request) {
        const maYc = confirmDialog.request.ma_yc;
        const trangThai = confirmDialog.action;
        const ghiChu = confirmDialog.ghiChu.trim();

        await campusApi.processBookingRequest(maYc, { 
          trang_thai: trangThai, 
          ghi_chu: ghiChu 
        });

        handleCloseConfirmDialog();
        await loadData();
      }
    } catch (err) {
      console.error('[handleExecuteConfirm Error]', err);
      setConfirmDialog(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Lỗi khi xử lý thao tác!'
      }));
    }
  };

  const pendingRequestsCount = requests.filter(r => r.trang_thai === 'ChoDuyet').length;

  return (
    <div className="space-y-6">
      {/* 1. Header (Chỉ giữ lại Title lớn duy nhất theo yêu cầu) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lịch phòng học</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            icon={BookOpen} 
            onClick={() => setIsRequestModalOpen(true)}
            className="text-xs"
          >
            Đăng Ký Mượn Phòng
          </Button>

          <Button 
            variant="primary" 
            icon={Plus} 
            onClick={() => setIsAddScheduleModalOpen(true)}
            className="text-xs shadow-md shadow-blue-500/20"
          >
            Xếp Lịch Học Mới
          </Button>
        </div>
      </div>

      {/* 2. Sub-tab switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('timetable')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'timetable'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Thời Khóa Biểu Phòng Học ({filteredSchedules.length} ca ngày này)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
            activeSubTab === 'requests'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Phê Duyệt Mượn Phòng</span>
          {pendingRequestsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
              {pendingRequestsCount} chờ duyệt
            </span>
          )}
        </button>
      </div>

      {/* 3. TAB 1: THỜI KHÓA BIỂU MATRIX THEO CA (1, 2, 3) */}
      {activeSubTab === 'timetable' && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Controls: Chọn ngày & ca & Tìm kiếm / Lọc */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Xem ngày:</span>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button 
                    onClick={handlePrevDay} 
                    className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Ngày trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-2 py-1 text-xs font-bold bg-transparent border-0 focus:outline-none text-slate-800"
                  />
                  <button 
                    onClick={handleNextDay} 
                    className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Ngày sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="text-xs text-blue-600 font-bold hover:underline ml-1"
                >
                  Hôm nay
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
                  <span className="text-slate-600 font-medium">Lớp chính khóa (HOC)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-purple-500"></span>
                  <span className="text-slate-600 font-medium">Mượn sự kiện (MUON)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-slate-100 border border-dashed border-slate-300"></span>
                  <span className="text-slate-600 font-medium">Phòng trống</span>
                </span>
              </div>
            </div>

            {/* Sub-bar: Search & Filter Rooms & Classes */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Tìm theo phòng (A101, B302), môn học, hoặc giảng viên..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select 
                  value={filterToa}
                  onChange={(e) => setFilterToa(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-none"
                >
                  <option value="ALL">Mọi Tòa nhà</option>
                  {availableBuildings.map(b => (
                    <option key={b} value={b}>Tòa {b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Matrix Bảng Lịch Học & Phòng */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-44 sticky left-0 bg-slate-50/95 z-10 backdrop-blur-xs">
                      Phòng học ({filteredRooms.length})
                    </th>
                    <th className="py-3.5 px-4 w-1/3 border-l border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <span>Ca 1 (Sáng)</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">07:30 - 11:30</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-4 w-1/3 border-l border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <span>Ca 2 (Chiều)</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">13:00 - 17:00</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-4 w-1/3 border-l border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <span>Ca 3 (Tối)</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">17:30 - 21:00</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRooms.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400">
                        <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        Không tìm thấy phòng hoặc lịch học nào khớp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredRooms.map((room) => (
                      <tr key={room.ma_phong} className="hover:bg-slate-50/50 transition-colors">
                        {/* Phòng header cột trái */}
                        <td className="py-3 px-4 font-bold sticky left-0 bg-white z-10 border-r border-slate-100 shadow-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-700 flex items-center justify-center text-xs font-black">
                              {room.ma_phong}
                            </span>
                            <div>
                              <div className="text-slate-900 font-bold text-xs">{room.ma_phong}</div>
                              <div className="text-[10px] text-slate-400 font-medium">{room.loai_phong || 'Phòng học'} • {room.suc_chua || 40} chỗ</div>
                            </div>
                          </div>
                        </td>

                        {/* 3 Ca: 1, 2, 3 */}
                        {[1, 2, 3].map(caNum => {
                          const sched = filteredSchedules.find(s => s.ma_phong === room.ma_phong && s.ca === caNum);

                          return (
                            <td key={caNum} className="p-2 border-l border-slate-100 align-top">
                              {sched ? (
                                <div className={`p-3 rounded-xl border transition-all relative group ${
                                  sched.loai === 'HOC'
                                    ? 'bg-blue-50/80 border-blue-200/80 hover:border-blue-300'
                                    : 'bg-purple-50/80 border-purple-200/80 hover:border-purple-300'
                                }`}>
                                  <div className="flex items-start justify-between gap-1 mb-1.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase ${
                                      sched.loai === 'HOC' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                                    }`}>
                                      {sched.loai === 'HOC' ? 'Lớp học' : 'Mượn phòng'}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                                        {CA_INFO[caNum].time}
                                      </span>
                                      {/* Nút xóa lịch học */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenDeleteScheduleDialog(sched);
                                        }}
                                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                        title="Xóa lịch này"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="font-bold text-slate-900 text-xs line-clamp-1 mb-1">
                                    {sched.noi_dung || sched.ten_mon_hoc || 'Hoạt động học tập'}
                                  </div>

                                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/40">
                                    <span className="truncate max-w-[130px]">
                                      {sched.giang_vien || sched.ben_muon || 'Giảng viên phụ trách'}
                                    </span>
                                    <span className="flex items-center gap-1 font-mono text-[10px]">
                                      <Users className="w-3 h-3" />
                                      {sched.so_nguoi || room.suc_chua || 40}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleQuickBook(room.ma_phong, caNum)}
                                  className="w-full h-20 rounded-xl border-2 border-dashed border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 group cursor-pointer"
                                >
                                  <Plus className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
                                  <span className="text-[11px] font-medium">Trống • Nhấn mượn</span>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: QUẢN LÝ VÀ PHÊ DUYỆT YÊU CẦU MƯỢN (YeuCauMuon) */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Danh Sách Yêu Cầu Mượn Phòng ({requests.length})</h2>
              <p className="text-xs text-slate-500">Xét duyệt cấp quyền sử dụng phòng cho sinh viên, giảng viên và CLB.</p>
            </div>

            <Button 
              size="sm" 
              variant="outline" 
              icon={Plus} 
              onClick={() => setIsRequestModalOpen(true)}
            >
              Tạo Yêu Cầu Mới
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
                <Inbox className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold">Chưa có yêu cầu mượn phòng nào trong hệ thống Neon DB.</p>
              </div>
            ) : requests.map((req) => {
              const isPending = req.trang_thai === 'ChoDuyet';
              const isApproved = req.trang_thai === 'DaDuyet';
              const isRejected = req.trang_thai === 'TuChoi';

              return (
                <Card key={req.ma_yc} className="p-4 border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex flex-col items-center justify-center font-black shrink-0">
                      <span className="text-sm">{req.ma_phong}</span>
                      <span className="text-[9px] font-bold uppercase text-blue-500">Ca {req.ca}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          Yêu cầu #{req.ma_yc}: {req.muc_dich}
                        </span>
                        {isPending && <Badge variant="warning">Chờ Duyệt</Badge>}
                        {isApproved && <Badge variant="success">Đã Phê Duyệt</Badge>}
                        {isRejected && <Badge variant="danger">Từ Chối</Badge>}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Ngày mượn: <strong className="text-slate-700">{req.ngay}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {CA_INFO[req.ca]?.label} ({CA_INFO[req.ca]?.time})
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {req.so_nguoi} người tham gia
                        </span>
                        <span className="text-slate-400">
                          Người gửi: <strong className="text-slate-600">{req.nguoi_gui_info?.ho_ten || req.nguoi_muon || 'Người dùng'}</strong>
                        </span>
                      </div>

                      {req.ghi_chu && (
                        <div className="text-xs text-slate-600 italic bg-slate-50 px-2 py-1 rounded border border-slate-100 max-w-xl">
                          Ghi chú: {req.ghi_chu}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Actions: Có hộp thoại xác nhận khi bấm */}
                  {isPending && (
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <Button 
                        size="sm" 
                        variant="primary" 
                        icon={CheckCircle2}
                        onClick={() => handleOpenConfirmDialog(req, 'DaDuyet')}
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer"
                      >
                        Phê Duyệt
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        icon={XCircle}
                        onClick={() => handleOpenConfirmDialog(req, 'TuChoi')}
                        className="text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
                      >
                        Từ Chối
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. HỘP THOẠI XÁC NHẬN PHÊ DUYỆT / HỦY BỎ / XÓA LỊCH */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className={`p-5 border-b flex items-center justify-between ${
              confirmDialog.action === 'DaDuyet' 
                ? 'bg-emerald-50/80 border-emerald-100' 
                : 'bg-rose-50/80 border-rose-100'
            }`}>
              <div className="flex items-center gap-2.5">
                {confirmDialog.action === 'DaDuyet' ? (
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : confirmDialog.action === 'DELETE_SCHEDULE' ? (
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Trash2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {confirmDialog.action === 'DaDuyet' 
                      ? 'Xác nhận Phê Duyệt Cấp Phòng' 
                      : confirmDialog.action === 'DELETE_SCHEDULE'
                      ? 'Xác nhận Xóa Lịch Phòng Học'
                      : 'Xác nhận Hủy / Từ Chối Yêu Cầu'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {confirmDialog.action === 'DaDuyet' 
                      ? 'Cấp phép sử dụng phòng học và tạo lịch phòng chính thức.' 
                      : confirmDialog.action === 'DELETE_SCHEDULE'
                      ? 'Giải phóng lịch phòng này để ca học trở lại trạng thái trống.'
                      : 'Hủy bỏ hoặc từ chối đề xuất mượn phòng này.'}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleCloseConfirmDialog} 
                disabled={confirmDialog.loading}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Question Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-800">
                    {confirmDialog.action === 'DaDuyet' 
                      ? 'Bạn có chắc chắn muốn phê duyệt yêu cầu này không?' 
                      : confirmDialog.action === 'DELETE_SCHEDULE'
                      ? 'Bạn có thực sự muốn xóa lịch phòng này khỏi hệ thống không?'
                      : 'Bạn có thực sự muốn hủy bỏ / từ chối yêu cầu này không?'}
                  </span>
                </div>

                {/* Case 1: Booking Request details */}
                {confirmDialog.request && (
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-slate-100 font-medium">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Phòng & Ca:</span>
                      <strong className="text-blue-700 font-bold">
                        Phòng {confirmDialog.request.ma_phong} (Ca {confirmDialog.request.ca})
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Ngày mượn:</span>
                      <strong className="text-slate-800">{confirmDialog.request.ngay}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Người mượn:</span>
                      <strong className="text-slate-800">
                        {confirmDialog.request.nguoi_gui_info?.ho_ten || confirmDialog.request.nguoi_muon || 'Người dùng'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Số lượng sinh viên:</span>
                      <strong className="text-slate-800">{confirmDialog.request.so_nguoi} người</strong>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-50">
                      <span className="text-slate-400 block text-[11px]">Mục đích:</span>
                      <strong className="text-slate-900">{confirmDialog.request.muc_dich}</strong>
                    </div>
                  </div>
                )}

                {/* Case 2: Schedule details */}
                {confirmDialog.schedule && (
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-slate-100 font-medium">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Phòng & Ca:</span>
                      <strong className="text-blue-700 font-bold">
                        Phòng {confirmDialog.schedule.ma_phong} ({CA_INFO[confirmDialog.schedule.ca]?.label})
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Ngày học:</span>
                      <strong className="text-slate-800">{confirmDialog.schedule.ngay}</strong>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-50">
                      <span className="text-slate-400 block text-[11px]">Tên môn / Hoạt động:</span>
                      <strong className="text-slate-900">{confirmDialog.schedule.noi_dung || confirmDialog.schedule.ten_mon_hoc}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Note / Reason input (only for booking request) */}
              {confirmDialog.action !== 'DELETE_SCHEDULE' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {confirmDialog.action === 'DaDuyet' ? 'Ghi chú phê duyệt (Tùy chọn)' : 'Lý do từ chối / hủy bỏ *'}
                  </label>
                  <textarea
                    rows="2"
                    value={confirmDialog.ghiChu}
                    onChange={(e) => setConfirmDialog(prev => ({ ...prev, ghiChu: e.target.value }))}
                    placeholder={confirmDialog.action === 'DaDuyet' ? 'Ví dụ: Đã kiểm tra cơ sở vật chất, cấp phòng...' : 'Ví dụ: Phòng đang bảo dưỡng điều hòa, đề nghị chuyển phòng khác...'}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Error Alert */}
              {confirmDialog.error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{confirmDialog.error}</span>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseConfirmDialog}
                disabled={confirmDialog.loading}
              >
                Hủy Bỏ / Giữ Lại
              </Button>

              <Button
                type="button"
                variant={confirmDialog.action === 'DaDuyet' ? 'primary' : 'danger'}
                onClick={handleExecuteConfirm}
                disabled={confirmDialog.loading}
                className={confirmDialog.action === 'DaDuyet' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}
              >
                {confirmDialog.loading ? 'Đang Xử Lý...' : (
                  confirmDialog.action === 'DaDuyet' 
                    ? 'Xác Nhận Phê Duyệt' 
                    : confirmDialog.action === 'DELETE_SCHEDULE'
                    ? 'Xác Nhận Xóa Lịch'
                    : 'Xác Nhận Hủy / Từ Chối'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL XẾP LỊCH PHÒNG MỚI (LichPhong) */}
      {isAddScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-base text-slate-900">Xếp Lịch Học / Mượn Phòng Mới</h3>
              <button onClick={() => setIsAddScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Chọn phòng học</label>
                <select 
                  value={scheduleForm.ma_phong}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, ma_phong: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold"
                >
                  {rooms.map(r => (
                    <option key={r.ma_phong} value={r.ma_phong}>Phòng {r.ma_phong} ({r.loai_phong})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ngày học (YYYY-MM-DD)</label>
                  <input 
                    type="date"
                    required
                    value={scheduleForm.ngay}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, ngay: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ca học</label>
                  <select 
                    value={scheduleForm.ca}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, ca: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="1">Ca 1 (Sáng 07:30 - 11:30)</option>
                    <option value="2">Ca 2 (Chiều 13:00 - 17:00)</option>
                    <option value="3">Ca 3 (Tối 17:30 - 21:00)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tên môn học / Hoạt động *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ví dụ: Hệ Quản Trị Cơ Sở Dữ Liệu"
                  value={scheduleForm.noi_dung}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, noi_dung: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Loại lịch</label>
                  <select 
                    value={scheduleForm.loai}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, loai: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="HOC">Chính khóa (HOC)</option>
                    <option value="MUON">Mượn sự kiện (MUON)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Số sinh viên</label>
                  <input 
                    type="number"
                    min="1"
                    value={scheduleForm.so_nguoi}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, so_nguoi: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddScheduleModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary">
                  Lưu Vào Lịch Phòng
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL GỬI YÊU CẦU MƯỢN (YeuCauMuon) */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-base text-slate-900">Đăng Ký Mượn Phòng Campus</h3>
              <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Chọn phòng cần mượn</label>
                <select 
                  value={requestForm.ma_phong}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, ma_phong: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold"
                >
                  {rooms.map(r => (
                    <option key={r.ma_phong} value={r.ma_phong}>Phòng {r.ma_phong} - {r.loai_phong}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ngày mượn</label>
                  <input 
                    type="date"
                    required
                    value={requestForm.ngay}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, ngay: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ca mượn</label>
                  <select 
                    value={requestForm.ca}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, ca: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="1">Ca 1 (07:30 - 11:30)</option>
                    <option value="2">Ca 2 (13:00 - 17:00)</option>
                    <option value="3">Ca 3 (17:30 - 21:00)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mục đích sử dụng *</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="Ghi rõ lý do mượn (Ví dụ: Họp CLB Tin học, bảo vệ đồ án, luyện tập thuyết trình...)"
                  value={requestForm.muc_dich}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, muc_dich: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Số lượng người tham gia</label>
                <input 
                  type="number"
                  min="1"
                  value={requestForm.so_nguoi}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, so_nguoi: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsRequestModalOpen(false)}>
                  Đóng
                </Button>
                <Button type="submit" variant="primary">
                  Gửi Yêu Cầu Duyệt
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
