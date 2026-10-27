import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Tv,
  Wind,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Archive,
  Cpu,
  Zap,
  Layers,
  XCircle,
  FileWarning,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  Inbox
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { campusApi } from '../../services/api';

const TYPE_CONFIG = {
  MAYLANH: { label: 'Máy điều hòa', icon: Wind, color: 'text-emerald-600 bg-emerald-50' },
  MAYCHIEU: { label: 'Máy chiếu', icon: Tv, color: 'text-amber-600 bg-amber-50' },
  MAYTINH: { label: 'Máy tính Lab', icon: Monitor, color: 'text-blue-600 bg-blue-50' },
  QUAT: { label: 'Quạt thông gió', icon: Wind, color: 'text-sky-600 bg-sky-50' }
};

export function DevicesView({ onNavigateToTickets, searchQuery = '' }) {
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchQuery);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterRoom, setFilterRoom] = useState('ALL');
  // Row 1 expanded by default (matching Image 4)
  const [expandedRowKeys, setExpandedRowKeys] = useState(['MAYLANH']);

  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== null) {
      setSearch(searchQuery);
    }
  }, [searchQuery]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedDeviceForReport, setSelectedDeviceForReport] = useState(null);

  // Forms
  const [deviceForm, setDeviceForm] = useState({
    ma_tb: '',
    ma_loai: 'MAYLANH',
    ma_phong: 'A101',
    ma_lo: 'ML_02',
    ten_tb: '',
    cong_suat_w: 2500,
    nam_mua: 2024,
    tinh_trang: 'Tốt'
  });

  const [batchForm, setBatchForm] = useState({
    ma_loai: 'MAYTINH',
    ma_lo: 'PC_LAB3',
    so_luong: 20,
    ma_phong: 'A202',
    cong_suat_w: 300,
    nam_mua: 2024
  });

  const [reportForm, setReportForm] = useState({
    mo_ta: '',
    muc_do: 'TrungBinh'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [devs, rms] = await Promise.all([
        campusApi.getAllDevicesList(),
        campusApi.getAllRoomsList()
      ]);
      setDevices(Array.isArray(devs) ? devs : []);
      setRooms(Array.isArray(rms) ? rms : []);
    } catch (err) {
      console.error('[DevicesView] Lỗi tải thiết bị:', err);
      setDevices([]);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleReportUpdated = (e) => {
      if (e.detail) {
        const { ma_tb, trang_thai } = e.detail;
        if (ma_tb && (trang_thai === 'DaXuLy' || trang_thai === 'TuChoi')) {
          setDevices(prev => prev.map(d => d.ma_tb === ma_tb ? { ...d, tinh_trang: 'Tốt' } : d));
        } else if (ma_tb && trang_thai === 'DangXuLy') {
          setDevices(prev => prev.map(d => d.ma_tb === ma_tb ? { ...d, tinh_trang: 'Đang sửa' } : d));
        } else {
          loadData();
        }
      }
    };

    window.addEventListener('campus_report_created', loadData);
    window.addEventListener('campus_report_updated', handleReportUpdated);

    return () => {
      window.removeEventListener('campus_report_created', loadData);
      window.removeEventListener('campus_report_updated', handleReportUpdated);
    };
  }, []);

  // Filter dynamic
  const filteredDevices = devices.filter(d => {
    if (d.da_xoa) return false;
    const q = (search || '').trim().toLowerCase();
    const matchSearch = !q ||
      (d.ma_tb || '').toLowerCase().includes(q) ||
      (d.ten_tb || '').toLowerCase().includes(q) ||
      (d.ma_lo || '').toLowerCase().includes(q) ||
      (d.ma_phong || '').toLowerCase().includes(q) ||
      (`phòng ${d.ma_phong || ''}`).toLowerCase().includes(q) ||
      (d.ma_loai || '').toLowerCase().includes(q) ||
      (d.tinh_trang || '').toLowerCase().includes(q);
    const matchType = filterType === 'ALL' || d.ma_loai === filterType;
    const matchStatus = filterStatus === 'ALL' || d.tinh_trang === filterStatus;
    const matchRoom = filterRoom === 'ALL' || (filterRoom === 'KHO' ? !d.ma_phong : d.ma_phong === filterRoom);
    return matchSearch && matchType && matchStatus && matchRoom;
  });

  // KPI
  const totalCount = devices.filter(d => !d.da_xoa).length;
  const goodCount = devices.filter(d => !d.da_xoa && d.tinh_trang === 'Tốt').length;
  const brokenCount = devices.filter(d => !d.da_xoa && d.tinh_trang === 'Hỏng').length;
  const repairingCount = devices.filter(d => !d.da_xoa && d.tinh_trang === 'Đang sửa').length;
  const inStorageCount = devices.filter(d => !d.da_xoa && !d.ma_phong).length;

  // Thêm thiết bị đơn lẻ
  const handleCreateDevice = async (e) => {
    e.preventDefault();
    if (!deviceForm.ma_tb) return alert('Vui lòng nhập mã thiết bị!');

    const res = await campusApi.createDevice({
      ...deviceForm,
      cong_suat_w: Number(deviceForm.cong_suat_w),
      nam_mua: Number(deviceForm.nam_mua),
      ma_phong: deviceForm.ma_phong === 'KHO' ? null : deviceForm.ma_phong
    });

    setDevices(prev => [res, ...prev]);
    setIsAddModalOpen(false);
    alert('Thêm thiết bị thành công!');
  };

  // Thêm lô hàng loạt (Batch)
  const handleCreateBatch = async (e) => {
    e.preventDefault();
    const createdList = await campusApi.createDevicesBatch({
      ...batchForm,
      so_luong: Number(batchForm.so_luong),
      cong_suat_w: Number(batchForm.cong_suat_w),
      nam_mua: Number(batchForm.nam_mua),
      ma_phong: batchForm.ma_phong === 'KHO' ? null : batchForm.ma_phong
    });

    setDevices(prev => [...createdList, ...prev]);
    setIsBatchModalOpen(false);
    alert(`Đã tự động khởi tạo thành công ${batchForm.so_luong} thiết bị theo lô ${batchForm.ma_lo}!`);
  };

  // Mở modal gửi báo hỏng cho thiết bị này
  const handleOpenReportModal = (dev) => {
    const cleanRoom = dev.ma_phong ? String(dev.ma_phong).replace(/^Phòng\s*/i, '').trim() : '';
    setSelectedDeviceForReport({
      ...dev,
      ma_phong: cleanRoom
    });
    setReportForm({
      mo_ta: `Thiết bị ${dev.ten_tb} (${dev.ma_tb}) gặp sự cố: `,
      muc_do: 'TrungBinh'
    });
    setIsReportModalOpen(true);
  };

  // Gửi báo hỏng
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportForm.mo_ta) return alert('Vui lòng nhập mô tả sự cố!');

    let cleanRoom = selectedDeviceForReport.ma_phong || '';
    if (typeof cleanRoom === 'string') {
      cleanRoom = cleanRoom.replace(/^Phòng\s*/i, '').trim();
    }
    if (!cleanRoom || cleanRoom.toLowerCase().includes('kho') || cleanRoom.toLowerCase().includes('depot')) {
      cleanRoom = 'A101';
    }

    await campusApi.submitReport({
      ma_phong: cleanRoom,
      ma_tb: selectedDeviceForReport.ma_tb,
      ten_tb: selectedDeviceForReport.ten_tb,
      mo_ta: reportForm.mo_ta,
      muc_do: reportForm.muc_do
    });

    // Cập nhật tình trạng thiết bị thành "Đang sửa"
    setDevices(prev => prev.map(d => d.ma_tb === selectedDeviceForReport.ma_tb ? { ...d, tinh_trang: 'Đang sửa' } : d));
    setIsReportModalOpen(false);
    alert('Đã tạo phiếu báo hỏng thành công và đồng bộ sang danh sách Phiếu Báo Cáo Sự Cố!');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with concise 3-word title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý thiết bị</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={Layers}
            onClick={() => setIsBatchModalOpen(true)}
            className="text-xs"
          >
            Nhập Theo Lô (Batch)
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs shadow-md shadow-blue-500/20"
          >
            Thêm Thiết Bị Mới
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">Tổng thiết bị</p>
            <Monitor className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalCount}</p>
          <span className="text-[10px] text-slate-400">Đã đăng ký hệ thống</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">Hoạt động tốt</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{goodCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Sẵn sàng phục vụ học</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-rose-50/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">Hư hỏng / Lỗi</p>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700 mt-2">{brokenCount}</p>
          <span className="text-[10px] text-rose-600 font-medium">Cần xử lý gấp</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">Đang sửa chữa</p>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{repairingCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Có phiếu đang xử lý</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-purple-50/40 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">Trong kho dự phòng</p>
            <Archive className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700 mt-2">{inStorageCount}</p>
          <span className="text-[10px] text-purple-600 font-medium">Chưa gán phòng</span>
        </Card>
      </div>

      {/* 3. Filter and Search Controls */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã thiết bị (TB_ML_A101), tên thiết bị, mã lô..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="ALL">Mọi loại thiết bị</option>
              <option value="MAYLANH">Máy điều hòa nhiệt độ</option>
              <option value="MAYCHIEU">Máy chiếu Projector</option>
              <option value="MAYTINH">Dàn máy tính Lab</option>
              <option value="QUAT">Quạt thông gió</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="ALL">Mọi tình trạng</option>
              <option value="Tốt">Tốt</option>
              <option value="Hỏng">Hỏng</option>
              <option value="Đang sửa">Đang sửa</option>
              <option value="Thanh lý">Thanh lý</option>
            </select>

            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="ALL">Mọi vị trí</option>
              <option value="KHO">Trong kho lưu trữ</option>
              {rooms.map(r => (
                <option key={r.ma_phong} value={r.ma_phong}>Phòng {r.ma_phong}</option>
              ))}
            </select>
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
                    <span>Mã Hàng</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <span>Tên Hàng</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <span>Bin Location</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Hàng Seri</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span>Số Lượng</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Hạn Bảo Hành</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span>Chờ Xử Lý</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-normal text-slate-800">
              {(() => {
                // Nhóm danh mục thiết bị động từ danh sách filteredDevices
                const catalogMap = new Map();

                filteredDevices.forEach(d => {
                  const groupKey = d.ma_loai || 'KHAC';
                  if (!catalogMap.has(groupKey)) {
                    const typeLabel = TYPE_CONFIG[groupKey]?.label || groupKey;
                    catalogMap.set(groupKey, {
                      key: groupKey,
                      code: d.ma_lo || groupKey,
                      name: d.ten_tb ? `${typeLabel} - ${d.ten_tb}` : typeLabel,
                      bin: d.ma_phong ? `PHONG_${d.ma_phong}` : 'HB_DEPOT',
                      dvt: 'BỘ',
                      seri: 'Có',
                      totalQty: 0,
                      warranty: d.nam_mua ? `24 Tháng (${d.nam_mua + 2})` : '24 Tháng (12/2026)',
                      warrantyExpired: d.nam_mua ? (d.nam_mua + 2 < 2026) : false,
                      pending: 0,
                      subRows: []
                    });
                  }

                  const group = catalogMap.get(groupKey);
                  group.totalQty += 1;
                  const isBroken = d.tinh_trang === 'Hỏng';
                  const isRepairing = d.tinh_trang === 'Đang sửa';
                  if (isBroken || isRepairing) {
                    group.pending += 1;
                  }

                  group.subRows.push({
                    devId: d.ma_tb,
                    rawRoom: d.ma_phong,
                    location: d.ma_phong ? `Phòng ${d.ma_phong}` : 'Kho dự phòng',
                    lot: d.ma_lo || d.ma_tb,
                    qty: 1,
                    status: isBroken ? 'Báo hỏng' : isRepairing ? 'Đang sửa' : 'Hoạt động',
                    tinh_trang: d.tinh_trang
                  });
                });

                const catalogItems = Array.from(catalogMap.values());

                if (catalogItems.length === 0) {
                  return (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <span>Không tìm thấy thiết bị nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại.</span>
                      </td>
                    </tr>
                  );
                }

                const toggleExpand = (rowKey) => {
                  setExpandedRowKeys(prev =>
                    prev.includes(rowKey) ? prev.filter(k => k !== rowKey) : [...prev, rowKey]
                  );
                };

                return catalogItems.map((item) => {
                  const isExpanded = search.trim() ? true : expandedRowKeys.includes(item.key);
                  return (
                    <React.Fragment key={item.key}>
                      {/* Master Row */}
                      <tr
                        onClick={() => toggleExpand(item.key)}
                        className={`hover:bg-blue-50/50 cursor-pointer transition-colors text-[11px] ${isExpanded ? 'bg-blue-50/70 font-semibold' : 'bg-white'
                          }`}
                      >
                        <td className="py-2 px-2 text-center text-slate-400">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-blue-600 inline" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 inline" />
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-900 whitespace-nowrap">{item.code}</td>
                        <td className="py-2 px-3 max-w-sm truncate text-slate-800" title={item.name}>{item.name}</td>
                        <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">{item.bin}</td>
                        <td className="py-2 px-3 text-center text-slate-600">{item.seri}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{item.totalQty.toLocaleString()}</td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${item.warrantyExpired
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                            {item.warranty}
                          </span>
                        </td>
                        <td className={`py-2 px-3 text-right font-bold ${item.pending > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                          {item.pending}
                        </td>
                      </tr>

                      {/* Sub-table exactly as in Image 4 */}
                      {isExpanded && item.subRows && item.subRows.length > 0 && (
                        <tr className="bg-slate-50/60">
                          <td colSpan={8} className="py-2 px-3 pl-8">
                            <div className="w-full max-w-2xl rounded border border-blue-200 overflow-hidden shadow-2xs">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-[#1e88e5] text-white font-bold text-[11px]">
                                    <th className="py-1 px-3">Trạng Thái</th>
                                    <th className="py-1 px-3">Vị Trí</th>
                                    <th className="py-1 px-3">Lô</th>
                                    <th className="py-1 px-3 text-right">Số Lượng</th>
                                    <th className="py-1 px-3 text-right">Thao Tác</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-100 bg-white text-[11px]">
                                  {item.subRows.map((sub, sIdx) => {
                                    const isBroken = sub.status === 'Báo hỏng';
                                    const isRepairing = sub.status === 'Đang sửa';
                                    return (
                                      <tr key={sIdx} className="hover:bg-blue-50/50">
                                        <td className="py-1.5 px-3">
                                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${isBroken
                                              ? 'bg-rose-100 text-rose-700'
                                              : isRepairing
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-blue-50 text-blue-700'
                                            }`}>
                                            {sub.status}
                                          </span>
                                        </td>
                                        <td className="py-1.5 px-3 font-semibold text-slate-800">{sub.location}</td>
                                        <td className="py-1.5 px-3 font-mono text-slate-700">{sub.lot}</td>
                                        <td className="py-1.5 px-3 text-right font-bold text-slate-900">{sub.qty}</td>
                                        <td className="py-1.5 px-3 text-right">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (isBroken || isRepairing) {
                                                if (onNavigateToTickets) {
                                                  onNavigateToTickets();
                                                  return;
                                                }
                                              }
                                              handleOpenReportModal({
                                                ma_tb: sub.devId || sub.lot,
                                                ten_tb: item.name,
                                                ma_phong: sub.rawRoom || ''
                                              });
                                            }}
                                            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                                          >
                                            {isBroken || isRepairing ? 'Xem phiếu lỗi' : 'Báo hỏng'}
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal Thêm Thiết Bị Đơn Lẻ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-base text-slate-900">Thêm Thiết Bị Mới Vào Hệ Thống</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDevice} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mã thiết bị (duy nhất) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: TB_ML_A103"
                  value={deviceForm.ma_tb}
                  onChange={(e) => setDeviceForm(prev => ({ ...prev, ma_tb: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tên thiết bị</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Điều hòa Daikin 2.5HP"
                  value={deviceForm.ten_tb}
                  onChange={(e) => setDeviceForm(prev => ({ ...prev, ten_tb: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Loại thiết bị</label>
                  <select
                    value={deviceForm.ma_loai}
                    onChange={(e) => setDeviceForm(prev => ({ ...prev, ma_loai: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="MAYLANH">Máy điều hòa (MAYLANH)</option>
                    <option value="MAYCHIEU">Máy chiếu (MAYCHIEU)</option>
                    <option value="MAYTINH">Dàn máy tính (MAYTINH)</option>
                    <option value="QUAT">Quạt thông gió (QUAT)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Vị trí lắp đặt</label>
                  <select
                    value={deviceForm.ma_phong}
                    onChange={(e) => setDeviceForm(prev => ({ ...prev, ma_phong: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="KHO">📦 Lưu trong kho</option>
                    {rooms.map(r => (
                      <option key={r.ma_phong} value={r.ma_phong}>Phòng {r.ma_phong}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Công suất (W)</label>
                  <input
                    type="number"
                    value={deviceForm.cong_suat_w}
                    onChange={(e) => setDeviceForm(prev => ({ ...prev, cong_suat_w: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Năm mua</label>
                  <input
                    type="number"
                    value={deviceForm.nam_mua}
                    onChange={(e) => setDeviceForm(prev => ({ ...prev, nam_mua: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tình trạng</label>
                  <select
                    value={deviceForm.tinh_trang}
                    onChange={(e) => setDeviceForm(prev => ({ ...prev, tinh_trang: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="Tốt">Tốt</option>
                    <option value="Hỏng">Hỏng</option>
                    <option value="Đang sửa">Đang sửa</option>
                    <option value="Thanh lý">Thanh lý</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary">
                  Lưu Thiết Bị
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal Tạo Hàng Loạt Theo Lô (Batch) */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-base text-slate-900">Sinh Thiết Bị Hàng Loạt Theo Lô (Batch)</h3>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Loại thiết bị</label>
                  <select
                    value={batchForm.ma_loai}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, ma_loai: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="MAYTINH">Dàn máy tính (MAYTINH)</option>
                    <option value="MAYLANH">Máy điều hòa (MAYLANH)</option>
                    <option value="MAYCHIEU">Máy chiếu (MAYCHIEU)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mã lô (ví dụ: PC_LAB3) *</label>
                  <input
                    type="text"
                    required
                    value={batchForm.ma_lo}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, ma_lo: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Số lượng máy tự sinh *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={batchForm.so_luong}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, so_luong: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold text-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Gán vào phòng</label>
                  <select
                    value={batchForm.ma_phong}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, ma_phong: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="KHO">📦 Lưu trong kho</option>
                    {rooms.map(r => (
                      <option key={r.ma_phong} value={r.ma_phong}>Phòng {r.ma_phong}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Công suất mỗi máy (W)</label>
                  <input
                    type="number"
                    value={batchForm.cong_suat_w}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, cong_suat_w: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Năm trang bị</label>
                  <input
                    type="number"
                    value={batchForm.nam_mua}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, nam_mua: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsBatchModalOpen(false)}>
                  Đóng
                </Button>
                <Button type="submit" variant="primary">
                  Sinh Hàng Loạt
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal Báo Hỏng Thiết Bị Nhanh */}
      {isReportModalOpen && selectedDeviceForReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900">Gửi Phiếu Báo Hỏng Thiết Bị</h3>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <p className="font-bold text-slate-800">{selectedDeviceForReport.ten_tb}</p>
                <p className="text-slate-500 font-mono">Mã TB: {selectedDeviceForReport.ma_tb} • Vị trí: {selectedDeviceForReport.ma_phong ? `Phòng ${selectedDeviceForReport.ma_phong}` : 'Trong kho'}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mô tả hiện tượng hư hỏng *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Ghi rõ hiện tượng (Ví dụ: Chập điện, không lên nguồn, quạt kêu rít to...)"
                  value={reportForm.mo_ta}
                  onChange={(e) => setReportForm(prev => ({ ...prev, mo_ta: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mức độ ảnh hưởng</label>
                <select
                  value={reportForm.muc_do}
                  onChange={(e) => setReportForm(prev => ({ ...prev, muc_do: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                >
                  <option value="Nhe">Nhẹ (Vẫn dùng tạm được)</option>
                  <option value="TrungBinh">Trung bình (Ảnh hưởng tiết học)</option>
                  <option value="NghiemTrong">Nghiêm trọng (Hỏng hoàn toàn, nguy cơ chập cháy)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsReportModalOpen(false)}>
                  Hủy bỏ
                </Button>
                <Button type="submit" variant="primary" className="bg-rose-600 hover:bg-rose-700">
                  Gửi Báo Hỏng Ngay
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
