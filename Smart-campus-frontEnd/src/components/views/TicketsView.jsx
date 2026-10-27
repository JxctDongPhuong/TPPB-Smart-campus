import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Wrench, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  DoorClosed, 
  Monitor, 
  User, 
  Calendar,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { campusApi } from '../../services/api';

const STATUS_CONFIG = {
  Moi: { label: 'Mới tiếp nhận', variant: 'warning', icon: AlertTriangle },
  DangXuLy: { label: 'Đang xử lý', variant: 'primary', icon: Wrench },
  DaXuLy: { label: 'Đã hoàn tất', variant: 'success', icon: CheckCircle2 },
  TuChoi: { label: 'Từ chối', variant: 'danger', icon: XCircle }
};

export function TicketsView({ searchQuery = '' }) {
  const [reports, setReports] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('PENDING'); // 'PENDING' | 'Moi' | 'DangXuLy' | 'DaXuLy' | 'ALL'
  const [search, setSearch] = useState(searchQuery);
  const [expandedTicketIds, setExpandedTicketIds] = useState([1]);

  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== null) {
      setSearch(searchQuery);
    }
  }, [searchQuery]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    ma_phong: 'A202',
    ma_tb: 'TB_ML_A202',
    mo_ta: '',
    muc_do: 'TrungBinh'
  });

  const [processForm, setProcessForm] = useState({
    trang_thai: 'DangXuLy',
    ghi_chu_admin: '',
    ma_tb: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [reps, rms, devs] = await Promise.all([
        campusApi.getAllReports(),
        campusApi.getAllRoomsList(),
        campusApi.getAllDevicesList()
      ]);
      setReports(Array.isArray(reps) ? reps : []);
      setRooms(Array.isArray(rms) ? rms : []);
      setDevices(Array.isArray(devs) ? devs : []);
    } catch (err) {
      console.error('[TicketsView] Lỗi tải phiếu báo hỏng:', err);
      setReports([]);
      setRooms([]);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleCreated = (e) => {
      if (e.detail) {
        setReports(prev => [e.detail, ...prev.filter(r => String(r.ma_phieu || r.id) !== String(e.detail.ma_phieu || e.detail.id))]);
      }
    };

    const handleUpdated = (e) => {
      if (e.detail) {
        setReports(prev => prev.map(r => String(r.ma_phieu || r.id) === String(e.detail.ma_phieu || e.detail.id) ? { ...r, ...e.detail } : r));
      }
    };

    window.addEventListener('campus_report_created', handleCreated);
    window.addEventListener('campus_report_updated', handleUpdated);

    return () => {
      window.removeEventListener('campus_report_created', handleCreated);
      window.removeEventListener('campus_report_updated', handleUpdated);
    };
  }, []);

  // Filter: Ở chế độ mặc định PENDING, chỉ hiển thị phiếu CẦN XỬ LÝ (Mới, Đang xử lý). 
  // Phiếu sau khi Đã xử lý (DaXuLy) sẽ tự động biến mất khỏi danh sách chính!
  const filteredReports = reports.filter(r => {
    const matchStatus = activeFilter === 'ALL' 
      ? true 
      : activeFilter === 'PENDING'
      ? (r.trang_thai === 'Moi' || r.trang_thai === 'DangXuLy')
      : r.trang_thai === activeFilter;
    const q = (search || '').trim().toLowerCase();
    const matchSearch = !q ||
                        (r.mo_ta || '').toLowerCase().includes(q) ||
                        (r.ma_phong || '').toLowerCase().includes(q) ||
                        (`phòng ${r.ma_phong || ''}`).toLowerCase().includes(q) ||
                        (r.ma_tb || '').toLowerCase().includes(q) ||
                        (r.nguoi_gui || '').toLowerCase().includes(q) ||
                        (r.ghi_chu_admin || '').toLowerCase().includes(q) ||
                        (String(r.id || r.ma_phieu || '')).includes(q);
    return matchStatus && matchSearch;
  });

  // KPI
  const totalReports = reports.length;
  const moiCount = reports.filter(r => r.trang_thai === 'Moi').length;
  const inProgressCount = reports.filter(r => r.trang_thai === 'DangXuLy').length;
  const resolvedCount = reports.filter(r => r.trang_thai === 'DaXuLy').length;

  // Mở modal xử lý
  const handleOpenProcess = (report) => {
    setSelectedReport(report);
    setProcessForm({
      trang_thai: report.trang_thai,
      ghi_chu_admin: report.ghi_chu_admin || '',
      ma_tb: report.ma_tb || ''
    });
    setIsProcessModalOpen(true);
  };

  // Cập nhật tiến độ xử lý: Sau khi xử lý xong (DaXuLy), phiếu tự động biến mất khỏi màn hình chờ
  const handleSaveProcess = async (e) => {
    e.preventDefault();
    const updatePayload = {
      trang_thai: processForm.trang_thai,
      ghi_chu_admin: processForm.ghi_chu_admin,
      ma_tb: processForm.ma_tb || undefined,
      ngay_xu_ly: processForm.trang_thai === 'DaXuLy' ? new Date().toISOString() : null
    };

    await campusApi.updateReport(selectedReport.ma_phieu, updatePayload);
    setIsProcessModalOpen(false);
    await loadData();
    alert('Đã cập nhật tiến độ và hoàn tất phiếu sự cố thành công!');
  };

  // Tạo phiếu mới
  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!createForm.mo_ta) return alert('Vui lòng nhập mô tả sự cố hư hỏng!');

    const newRep = await campusApi.submitReport({
      ma_phong: createForm.ma_phong,
      ma_tb: createForm.ma_tb || undefined,
      mo_ta: createForm.mo_ta
    });

    setReports(prev => [newRep, ...prev]);
    setIsCreateModalOpen(false);
    alert('Đã gửi phiếu báo hỏng lên Ban Quản Lý CSVC thành công!');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with concise 3-word title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Phiếu báo cáo sự cố</h1>
        </div>

        <Button 
          variant="primary" 
          icon={Plus} 
          onClick={() => setIsCreateModalOpen(true)}
          className="text-xs shadow-md shadow-blue-500/20 active:scale-95"
        >
          Gửi Phiếu Báo Cáo Mới
        </Button>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Tổng số phiếu</p>
            <AlertTriangle className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalReports}</p>
          <span className="text-[10px] text-slate-400">Ghi nhận toàn trường</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">Mới tiếp nhận</p>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{moiCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Chờ phân công kỹ thuật</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-blue-50/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">Đang sửa chữa</p>
            <Wrench className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2">{inProgressCount}</p>
          <span className="text-[10px] text-blue-600 font-medium">Kỹ thuật viên đang xử lý</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">Đã giải quyết xong</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{resolvedCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Thiết bị hoạt động lại</span>
        </Card>
      </div>

      {/* 3. Filter tabs & Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'PENDING', label: `Cần xử lý (${moiCount + inProgressCount})` },
              { id: 'Moi', label: `Mới (${moiCount})` },
              { id: 'DangXuLy', label: `Đang sửa (${inProgressCount})` },
              { id: 'DaXuLy', label: `Đã hoàn tất (${resolvedCount})` },
              { id: 'ALL', label: `Tất cả (${totalReports})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Tìm theo mô tả, phòng, mã thiết bị..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {/* 4. ERP Master-Detail Table Layout (Bố cục theo Hình 4) */}
      <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            {/* Primary Dark Blue Table Header */}
            <thead>
              <tr className="bg-[#1976d2] text-white font-bold select-none text-[11px] whitespace-nowrap">
                <th className="py-2.5 px-3 w-8 text-center"></th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <span>Mã Phiếu</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <span>Mô Tả Sự Cố</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <span>Thiết Bị</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <span>Vị Trí</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <span>Người Báo</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Mức Độ</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Ngày Báo</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Trạng Thái</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <span>Thao Tác</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-normal text-slate-800">
              {filteredReports.map((report) => {
                const isExpanded = expandedTicketIds.includes(report.ma_phieu);
                const statusConf = STATUS_CONFIG[report.trang_thai] || STATUS_CONFIG.Moi;

                const toggleExpand = (id) => {
                  setExpandedTicketIds(prev =>
                    prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
                  );
                };

                return (
                  <React.Fragment key={report.ma_phieu}>
                    {/* Master Row */}
                    <tr
                      onClick={() => toggleExpand(report.ma_phieu)}
                      className={`hover:bg-blue-50/50 cursor-pointer transition-colors text-[11px] ${
                        isExpanded ? 'bg-blue-50/70 font-semibold' : 'bg-white'
                      }`}
                    >
                      <td className="py-2 px-2 text-center text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-600 inline" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 inline" />
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        #{report.ma_phieu}
                      </td>
                      <td className="py-2 px-3 max-w-xs truncate text-slate-800" title={report.mo_ta}>
                        {report.mo_ta}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap">
                        {report.ten_tb ? `${report.ten_tb} (${report.ma_tb})` : (report.ma_tb || 'Không xác định')}
                      </td>
                      <td className="py-2 px-3 font-semibold text-blue-700 whitespace-nowrap">
                        Phòng {report.ma_phong}
                      </td>
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                        {report.nguoi_bao_ten || `TK #${report.ma_tk}`}
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          report.muc_do === 'NghiemTrong' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {report.muc_do === 'NghiemTrong' ? 'Nghiêm trọng' : 'Bình thường'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-slate-600 whitespace-nowrap font-mono">
                        {new Date(report.ngay_bao).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <Badge variant={statusConf.variant} size="sm">
                          {statusConf.label}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProcess(report);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Cập nhật
                        </button>
                      </td>
                    </tr>

                    {/* Sub-table (Bố cục Hình 4) */}
                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={10} className="py-2 px-3 pl-8">
                          <div className="w-full max-w-3xl rounded border border-blue-200 overflow-hidden shadow-2xs">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-[#1e88e5] text-white font-bold text-[11px]">
                                  <th className="py-1 px-3">Trạng Thái</th>
                                  <th className="py-1 px-3">Vị Trí</th>
                                  <th className="py-1 px-3">Lô / Mã TB</th>
                                  <th className="py-1 px-3">Nội Dung Chi Tiết Sự Cố & Tiến Độ Kỹ Thuật</th>
                                  <th className="py-1 px-3 text-right">Xử Lý</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-blue-100 bg-white text-[11px]">
                                <tr className="hover:bg-blue-50/50">
                                  <td className="py-2 px-3 align-top">
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                      {statusConf.label}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 font-semibold text-slate-800 align-top">
                                    Phòng {report.ma_phong}
                                  </td>
                                  <td className="py-2 px-3 font-mono text-slate-700 align-top">
                                    {report.ma_tb || 'TB_CHUNG'}
                                  </td>
                                  <td className="py-2 px-3 text-slate-700 space-y-1 align-top">
                                    <p className="font-semibold text-slate-900">{report.mo_ta}</p>
                                    {report.ghi_chu_admin ? (
                                      <p className="text-blue-700 bg-blue-50 p-1.5 rounded text-[10px]">
                                        <span className="font-bold">Ghi chú kỹ thuật: </span>
                                        {report.ghi_chu_admin}
                                      </p>
                                    ) : (
                                      <p className="text-slate-400 italic text-[10px]">Chưa có ghi chú xử lý từ kỹ thuật viên</p>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-right align-top">
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      onClick={() => handleOpenProcess(report)}
                                      className="text-[10px] py-1 px-2.5"
                                    >
                                      Xử Lý Ngay
                                    </Button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal Cập nhật tiến độ xử lý (Admin) */}
      {isProcessModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-base text-slate-900">
                Xử Lý Phiếu #{selectedReport.ma_phieu}
              </h3>
              <button onClick={() => setIsProcessModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProcess} className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1">
                <p className="font-bold text-slate-900">Phòng {selectedReport.ma_phong} - Sự cố:</p>
                <p className="text-slate-600">{selectedReport.mo_ta}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Cập nhật trạng thái xử lý</label>
                <select 
                  value={processForm.trang_thai}
                  onChange={(e) => setProcessForm(prev => ({ ...prev, trang_thai: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold"
                >
                  <option value="Moi">Mới tiếp nhận</option>
                  <option value="DangXuLy">Đang xử lý (Đã điều kỹ thuật)</option>
                  <option value="DaXuLy">Đã xử lý (Sửa chữa xong)</option>
                  <option value="TuChoi">Từ chối (Báo hỏng sai sự thật / Không lỗi)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mã thiết bị liên quan</label>
                <input 
                  type="text"
                  placeholder="Gán mã TB nếu lúc báo để trống..."
                  value={processForm.ma_tb}
                  onChange={(e) => setProcessForm(prev => ({ ...prev, ma_tb: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ghi chú của Quản trị viên / Kỹ thuật viên *</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="Ghi rõ hành động (Ví dụ: Đã thay tụ máy lạnh, bơm gas r410a, kiểm tra máy hoạt động bình thường...)"
                  value={processForm.ghi_chu_admin}
                  onChange={(e) => setProcessForm(prev => ({ ...prev, ghi_chu_admin: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsProcessModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary">
                  Cập Nhật Tiến Độ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal Tạo phiếu báo hỏng mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-base text-slate-900">Gửi Phiếu Báo Hỏng Thiết Bị</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phòng xảy ra sự cố *</label>
                  <select 
                    value={createForm.ma_phong}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, ma_phong: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold"
                  >
                    {rooms.map(r => (
                      <option key={r.ma_phong} value={r.ma_phong}>Phòng {r.ma_phong}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mã thiết bị (nếu biết)</label>
                  <input 
                    type="text"
                    placeholder="Ví dụ: TB_ML_A202"
                    value={createForm.ma_tb}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, ma_tb: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mô tả chi tiết hư hỏng *</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="Ghi rõ hiện tượng (Ví dụ: Máy chiếu nhấp nháy đèn đỏ, điều hòa không lạnh, rò điện...)"
                  value={createForm.mo_ta}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, mo_ta: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary">
                  Gửi Báo Hỏng
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
