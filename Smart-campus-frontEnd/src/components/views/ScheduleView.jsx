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
  Inbox
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { campusApi } from '../../services/api';
import { mockCampusData } from '../../data/mockData';

const CA_INFO = {
  1: { label: 'Ca 1 (Sáng)', time: '07:30 - 11:30', bg: 'bg-amber-50 text-amber-700 border-amber-200/60' },
  2: { label: 'Ca 2 (Chiều)', time: '13:00 - 17:00', bg: 'bg-blue-50 text-blue-700 border-blue-200/60' },
  3: { label: 'Ca 3 (Tối)', time: '17:30 - 21:00', bg: 'bg-purple-50 text-purple-700 border-purple-200/60' }
};

export function ScheduleView() {
  const [activeSubTab, setActiveSubTab] = useState('timetable'); // 'timetable' or 'requests'
  const [schedules, setSchedules] = useState([]);
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

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
    ma_phong: 'B302',
    ngay: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    ca: 2,
    so_nguoi: 15,
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
      setSchedules(schedRes?.length ? schedRes : mockCampusData.allSchedules);
      setRequests(reqRes?.length ? reqRes : mockCampusData.allBookingRequests);
      setRooms(roomsRes?.length ? roomsRes : mockCampusData.allRooms);
    } catch {
      setSchedules(mockCampusData.allSchedules);
      setRequests(mockCampusData.allBookingRequests);
      setRooms(mockCampusData.allRooms);
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

    const newSched = await campusApi.createSchedule({
      ...scheduleForm,
      ca: Number(scheduleForm.ca),
      so_nguoi: Number(scheduleForm.so_nguoi)
    });
    setSchedules(prev => [newSched, ...prev]);
    setIsAddScheduleModalOpen(false);
    alert('Thêm lịch phòng thành công!');
  };

  // Mở modal đặt lịch phòng khi bấm vào ô ca trống
  const handleOpenBookingSlot = (maPhong, caNum) => {
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

    const newReq = await campusApi.submitBookingRequest({
      ...requestForm,
      ca: Number(requestForm.ca),
      so_nguoi: Number(requestForm.so_nguoi)
    });
    setRequests(prev => [newReq, ...prev]);
    setIsRequestModalOpen(false);
    alert('Đã gửi yêu cầu mượn phòng tới Ban Quản Lý CSVC!');
  };

  // Duyệt / Từ chối yêu cầu mượn
  const handleProcessRequest = async (maYc, trangThai) => {
    const ghiChu = trangThai === 'DaDuyet' ? 'Chấp thuận cấp phòng sử dụng' : 'Từ chối do trùng kế hoạch vệ sinh';
    await campusApi.processBookingRequest(maYc, { trang_thai: trangThai, ghi_chu: ghiChu });

    setRequests(prev => prev.map(r => r.ma_yc === maYc ? { ...r, trang_thai: trangThai, ghi_chu: ghiChu } : r));

    // Nếu duyệt, tự động bổ sung vào lịch phòng (LichPhong)
    if (trangThai === 'DaDuyet') {
      const req = requests.find(r => r.ma_yc === maYc);
      if (req) {
        const generatedSchedule = {
          ma_lich: Date.now(),
          ma_phong: req.ma_phong,
          ngay: req.ngay,
          ca: req.ca,
          loai: 'MUON',
          noi_dung: req.muc_dich,
          so_nguoi: req.so_nguoi,
          trang_thai: 'Đã xếp lịch'
        };
        setSchedules(prev => [generatedSchedule, ...prev]);
      }
    }
  };

  const pendingRequestsCount = requests.filter(r => r.trang_thai === 'ChoDuyet').length;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Hệ thống LichPhong & YeuCauMuon</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lịch phòng học</h1>
          <p className="text-xs text-slate-500 mt-1">
            Điều phối ca học chính khóa, tránh xung đột lịch phòng học và xét duyệt mượn không gian campus.
          </p>
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
          <span>Thời Khóa Biểu Phòng Học ({filteredSchedules.length} ca hôm nay)</span>
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
          <span>Duyệt Yêu Cầu Mượn Phòng</span>
          {pendingRequestsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-extrabold">
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* 3. SUBTAB 1: TIMETABLE & MATRIX VIEW */}
      {activeSubTab === 'timetable' && (
        <div className="space-y-4">
          {/* Date Controller */}
          <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevDay}
                title="Chuyển qua lịch ngày trước đó"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-400 text-slate-700 hover:text-blue-600 shadow-2xs transition-all cursor-pointer group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Ngày trước</span>
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700">Ngày hiển thị:</span>
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200">
                <Button 
                  size="sm" 
                  variant={selectedDate === new Date().toISOString().split('T')[0] ? 'primary' : 'outline'}
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                >
                  Hôm nay
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedDate === new Date(Date.now() + 86400000).toISOString().split('T')[0] ? 'primary' : 'outline'}
                  onClick={() => setSelectedDate(new Date(Date.now() + 86400000).toISOString().split('T')[0])}
                >
                  Ngày mai
                </Button>
              </div>

              <button
                type="button"
                onClick={handleNextDay}
                title="Chuyển qua lịch ngày tiếp theo"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-400 text-slate-700 hover:text-blue-600 shadow-2xs transition-all cursor-pointer group"
              >
                <span>Ngày tiếp</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </Card>

          {/* Timetable Matrix Grid */}
          <Card className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[760px]">
              <colgroup>
                <col className="w-44" />
                <col className="w-1/3" />
                <col className="w-1/3" />
                <col className="w-1/3" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="p-4 w-44">Phòng học</th>
                  <th className="p-4 w-1/3">{CA_INFO[1].label}<br/><span className="text-[10px] lowercase text-slate-400 font-medium">{CA_INFO[1].time}</span></th>
                  <th className="p-4 w-1/3">{CA_INFO[2].label}<br/><span className="text-[10px] lowercase text-slate-400 font-medium">{CA_INFO[2].time}</span></th>
                  <th className="p-4 w-1/3">{CA_INFO[3].label}<br/><span className="text-[10px] lowercase text-slate-400 font-medium">{CA_INFO[3].time}</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {rooms.map((room) => {
                  return (
                    <tr key={room.ma_phong} className="hover:bg-slate-50/60 transition-colors">
                      {/* Room Column */}
                      <td className="p-4 align-top font-bold text-slate-900 bg-slate-50/30">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{room.ma_phong}</p>
                          <span className="text-[10px] text-slate-400 font-medium">{room.loai_phong}</span>
                        </div>
                      </td>

                      {/* Ca 1 to 3 */}
                      {[1, 2, 3].map((caNum) => {
                        const sched = filteredSchedules.find(s => s.ma_phong === room.ma_phong && s.ca === caNum);

                        if (sched) {
                          const isMuon = sched.loai === 'MUON';
                          return (
                            <td key={caNum} className="p-3 align-top">
                              <div className={`p-2.5 rounded-xl border ${
                                isMuon ? 'bg-purple-50/70 border-purple-200 text-purple-900' : 'bg-blue-50/70 border-blue-200 text-blue-900'
                              } space-y-1.5 shadow-2xs`}>
                                <div className="flex items-center justify-between">
                                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                    isMuon ? 'bg-purple-200 text-purple-800' : 'bg-blue-200 text-blue-800'
                                  }`}>
                                    {isMuon ? 'Mượn phòng' : 'Chính khóa'}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400 font-mono">#{sched.ma_lich}</span>
                                </div>
                                
                                <p className="font-extrabold text-xs line-clamp-2 leading-tight break-words">
                                  {sched.noi_dung || sched.ten_mon_hoc}
                                </p>

                                {/* Hiển thị hợp lý theo yêu cầu Hình 3: Lịch học là GV & Lớp, Mượn phòng là Bên mượn & Đối tượng tham gia */}
                                {isMuon ? (
                                  <div className="pt-1 border-t border-purple-200/60 space-y-0.5 text-[10px] text-purple-950">
                                    <p className="truncate">
                                      <span className="text-slate-500 font-normal">Bên mượn: </span>
                                      <strong className="font-bold">{sched.ben_muon || sched.giang_vien || 'Đoàn Thanh Niên'}</strong>
                                    </p>
                                    <p className="truncate">
                                      <span className="text-slate-500 font-normal">Đối tượng tham gia: </span>
                                      <strong className="font-bold">{sched.doi_tuong || sched.lop || 'Toàn trường'}</strong>
                                    </p>
                                  </div>
                                ) : (
                                  <div className="pt-1 border-t border-blue-200/60 space-y-0.5 text-[10px] text-blue-950">
                                    {sched.giang_vien && (
                                      <p className="truncate">
                                        <span className="text-slate-500 font-normal">GV: </span>
                                        <strong className="font-bold">{sched.giang_vien}</strong>
                                      </p>
                                    )}
                                    {sched.lop && (
                                      <p className="truncate">
                                        <span className="text-slate-500 font-normal">Lớp: </span>
                                        <strong className="font-bold">{sched.lop}</strong>
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        }

                        {/* Ô ca trống: Nhấp vào để đặt phòng theo yêu cầu Hình 3 */}
                        return (
                          <td key={caNum} className="p-2.5 align-middle text-center">
                            <button
                              onClick={() => handleOpenBookingSlot(room.ma_phong, caNum)}
                              title={`Bấm để đặt phòng ${room.ma_phong} (Ca ${caNum})`}
                              className="w-full py-3 px-2 rounded-xl border border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/70 text-slate-400 hover:text-blue-700 transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer"
                            >
                              <div className="flex items-center gap-1">
                                <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold group-hover:underline">
                                  Trống ca
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-400 group-hover:text-blue-600 font-normal">
                                + Đặt lịch ca này
                              </span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* 4. SUBTAB 2: BOOKING REQUESTS (YeuCauMuon) */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-white to-amber-50/40">
              <p className="text-xs font-bold text-slate-500">Đang chờ xét duyệt</p>
              <p className="text-2xl font-black text-amber-700 mt-1">{pendingRequestsCount}</p>
              <span className="text-[10px] text-amber-600">Cần Admin phê duyệt</span>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-white to-emerald-50/40">
              <p className="text-xs font-bold text-slate-500">Đã chấp thuận</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {requests.filter(r => r.trang_thai === 'DaDuyet').length}
              </p>
              <span className="text-[10px] text-emerald-600">Đã tự động chuyển vào LichPhong</span>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-white to-slate-50">
              <p className="text-xs font-bold text-slate-500">Từ chối / Đã hủy</p>
              <p className="text-2xl font-black text-slate-700 mt-1">
                {requests.filter(r => r.trang_thai === 'TuChoi').length}
              </p>
              <span className="text-[10px] text-slate-500">Không đủ điều kiện</span>
            </Card>
          </div>

          <div className="space-y-3">
            {requests.map((req) => {
              const isPending = req.trang_thai === 'ChoDuyet';
              const isApproved = req.trang_thai === 'DaDuyet';

              return (
                <Card key={req.ma_yc} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">Yêu cầu #{req.ma_yc}</span>
                      <Badge variant={isApproved ? 'success' : isPending ? 'warning' : 'default'} size="sm">
                        {req.trang_thai === 'ChoDuyet' ? 'Chờ Duyệt' : req.trang_thai === 'DaDuyet' ? 'Đã Chấp Thuận' : 'Từ Chối'}
                      </Badge>
                      <span className="text-xs text-slate-400">• Người gửi: {req.nguoi_gui_ten || `Tài khoản #${req.ma_tk}`}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-800">{req.muc_dich}</h4>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-blue-700">
                        <DoorClosed className="w-3.5 h-3.5" /> Phòng {req.ma_phong}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Ngày: {req.ngay}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {CA_INFO[req.ca]?.label || `Ca ${req.ca}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {req.so_nguoi} người
                      </span>
                    </div>

                    {req.ghi_chu && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100">
                        Ghi chú Admin: {req.ghi_chu}
                      </p>
                    )}
                  </div>

                  {/* Admin Actions */}
                  {isPending && (
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <Button 
                        size="sm" 
                        variant="primary" 
                        icon={CheckCircle2}
                        onClick={() => handleProcessRequest(req.ma_yc, 'DaDuyet')}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Phê Duyệt
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        icon={XCircle}
                        onClick={() => handleProcessRequest(req.ma_yc, 'TuChoi')}
                        className="text-rose-600 hover:bg-rose-50"
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

      {/* 5. MODAL XẾP LỊCH PHÒNG MỚI (LichPhong) */}
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

      {/* 6. MODAL GỬI YÊU CẦU MƯỢN (YeuCauMuon) */}
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
