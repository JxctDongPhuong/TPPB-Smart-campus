import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  DoorClosed, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Layers, 
  Monitor, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  X,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { RoomScheduleDropdown } from './RoomScheduleDropdown';
import { campusApi } from '../../services/api';
import { mockCampusData } from '../../data/mockData';

export function RoomsView({ onSelectRoomForInspection, onNavigateToTickets }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterToa, setFilterToa] = useState('ALL');
  const [filterTang, setFilterTang] = useState('ALL');
  const [filterLoai, setFilterLoai] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Phòng đang mở rộng danh sách các ca học / ca trống (đổ xuống ngay dưới dòng)
  const [expandedRoomId, setExpandedRoomId] = useState(null);

  // Modal thêm / sửa phòng
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    ma_phong: '',
    ma_cs: 'CS1',
    toa: 'A',
    tang: 1,
    loai_phong: 'Phòng lý thuyết',
    suc_chua: 40,
    so_ban: 20,
    dien_tich: 60.0,
    trang_thai: 'Sẵn sàng'
  });

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await campusApi.getAllRoomsList();
      if (data && data.length) {
        setRooms(data);
      } else {
        setRooms(mockCampusData.allRooms);
      }
    } catch {
      setRooms(mockCampusData.allRooms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Filter logic
  const filteredRooms = rooms.filter(r => {
    if (r.da_xoa) return false;
    const matchSearch = (r.ma_phong || '').toLowerCase().includes(search.toLowerCase()) ||
                        (r.ten_phong || '').toLowerCase().includes(search.toLowerCase()) ||
                        (r.loai_phong || '').toLowerCase().includes(search.toLowerCase());
    const matchToa = filterToa === 'ALL' || r.toa === filterToa;
    const matchTang = filterTang === 'ALL' || String(r.tang) === filterTang;
    const matchLoai = filterLoai === 'ALL' || r.loai_phong === filterLoai;
    const matchStatus = filterStatus === 'ALL' || r.trang_thai === filterStatus;
    return matchSearch && matchToa && matchTang && matchLoai && matchStatus;
  });

  // KPI metrics
  const totalRooms = rooms.filter(r => !r.da_xoa).length;
  const inUseCount = rooms.filter(r => !r.da_xoa && r.trang_thai === 'Đang dùng').length;
  const readyCount = rooms.filter(r => !r.da_xoa && r.trang_thai === 'Sẵn sàng').length;
  const maintenanceCount = rooms.filter(r => !r.da_xoa && r.trang_thai === 'Bảo trì').length;
  const totalCapacity = rooms.filter(r => !r.da_xoa).reduce((acc, curr) => acc + (curr.suc_chua || 0), 0);

  // Mở modal thêm mới
  const handleOpenAddModal = () => {
    setEditingRoom(null);
    setFormData({
      ma_phong: '',
      ma_cs: 'CS1',
      toa: 'A',
      tang: 1,
      loai_phong: 'Phòng lý thuyết',
      suc_chua: 40,
      so_ban: 20,
      dien_tich: 60.0,
      trang_thai: 'Sẵn sàng'
    });
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const handleOpenEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      ma_phong: room.ma_phong,
      ma_cs: room.ma_cs || 'CS1',
      toa: room.toa || 'A',
      tang: room.tang || 1,
      loai_phong: room.loai_phong || 'Phòng lý thuyết',
      suc_chua: room.suc_chua || 40,
      so_ban: room.so_ban || 20,
      dien_tich: room.dien_tich || 60.0,
      trang_thai: room.trang_thai || 'Sẵn sàng'
    });
    setIsModalOpen(true);
  };

  // Lưu phòng (POST hoặc PUT)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.ma_phong) return alert('Vui lòng nhập mã phòng!');

    if (editingRoom) {
      await campusApi.updateRoom(editingRoom.ma_phong, formData);
      setRooms(prev => prev.map(r => r.ma_phong === editingRoom.ma_phong ? { ...r, ...formData } : r));
    } else {
      await campusApi.createRoom(formData);
      setRooms(prev => [formData, ...prev]);
    }
    setIsModalOpen(false);
  };

  // Xóa mềm phòng (DELETE)
  const handleDeleteRoom = async (maPhong) => {
    if (window.confirm(`Xác nhận xóa phòng ${maPhong} khỏi hệ thống vận hành?`)) {
      await campusApi.deleteRoom(maPhong);
      setRooms(prev => prev.filter(r => r.ma_phong !== maPhong));
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Header Bar with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Cơ sở dữ liệu Phong</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Danh mục phòng</h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị không gian giảng dạy, phân loại giảng đường, số chỗ ngồi và trạng thái vận hành thực tế.
          </p>
        </div>

        <Button 
          variant="primary" 
          icon={Plus} 
          onClick={handleOpenAddModal}
          className="shadow-md shadow-blue-500/20 active:scale-95"
        >
          Thêm Phòng Học Mới
        </Button>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Tổng số phòng</p>
            <DoorClosed className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totalRooms}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Toàn bộ CS1</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-800 dark:to-emerald-950/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Đang có lớp học</p>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-2">{inUseCount}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Theo LichPhong ca này</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-950/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Phòng sẵn sàng</p>
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-2">{readyCount}</p>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Có thể tiếp nhận mượn</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-rose-50/30 dark:from-slate-800 dark:to-rose-950/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Đang bảo trì</p>
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-2">{maintenanceCount}</p>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Có phiếu báo hỏng</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/30 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Tổng sức chứa</p>
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-700 dark:text-indigo-400 mt-2">{totalCapacity}</p>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Chỗ ngồi sinh viên</span>
        </Card>
      </div>

      {/* 3. Filter and Search Controls */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm theo mã phòng (A101, B302), tên phòng, loại phòng..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            <select 
              value={filterToa} 
              onChange={(e) => setFilterToa(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="ALL">Mọi Tòa nhà</option>
              <option value="A">Tòa A</option>
              <option value="B">Tòa B</option>
            </select>

            <select 
              value={filterTang} 
              onChange={(e) => setFilterTang(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="ALL">Mọi Tầng</option>
              <option value="1">Tầng 1</option>
              <option value="2">Tầng 2</option>
              <option value="3">Tầng 3</option>
            </select>

            <select 
              value={filterLoai} 
              onChange={(e) => setFilterLoai(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="ALL">Tất cả loại phòng</option>
              <option value="Phòng lý thuyết">Phòng lý thuyết</option>
              <option value="Phòng máy tính">Phòng máy tính</option>
              <option value="Hội trường">Hội trường</option>
              <option value="Phòng học nhóm">Phòng học nhóm</option>
            </select>

            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Đang dùng">Đang dùng</option>
              <option value="Sẵn sàng">Sẵn sàng</option>
              <option value="Bảo trì">Bảo trì</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 4. Room List Table (Danh sách phòng học) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200 select-none text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 w-28">Mã phòng</th>
                <th className="py-3.5 px-4">Tên phòng</th>
                <th className="py-3.5 px-4">Vị trí</th>
                <th className="py-3.5 px-4">Loại phòng</th>
                <th className="py-3.5 px-4 text-center">Sức chứa</th>
                <th className="py-3.5 px-4 text-center">Diện tích</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.map((room) => {
                const isExpanded = expandedRoomId === room.ma_phong;
                const isOccupied = room.trang_thai === 'Đang dùng';
                const isMaintenance = room.trang_thai === 'Bảo trì';

                return (
                  <React.Fragment key={room.ma_phong}>
                    <tr 
                      onClick={() => setExpandedRoomId(isExpanded ? null : room.ma_phong)}
                      className={`transition-colors cursor-pointer select-none ${
                        isExpanded 
                          ? 'bg-blue-50/90 font-bold border-l-4 border-l-blue-600 text-blue-950 shadow-2xs' 
                          : 'hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        {room.ma_phong}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {room.ten_phong || `Phòng ${room.ma_phong}`}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        Tòa {room.toa} • Tầng {room.tang}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {room.loai_phong}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-600">
                        {room.suc_chua || 40} người ({room.so_ban || 20} bàn)
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                        {room.dien_tich || 60} m²
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={isOccupied ? 'success' : isMaintenance ? 'danger' : 'primary'} size="sm">
                          {room.trang_thai}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleOpenEditModal(room)}
                            title="Sửa phòng"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRoom(room.ma_phong)}
                            title="Xóa phòng"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setExpandedRoomId(isExpanded ? null : room.ma_phong)}
                            title="Xem ca nào đang học và ca nào đang trống"
                            className={`ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isExpanded 
                                ? 'bg-blue-600 text-white shadow-xs' 
                                : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                            }`}
                          >
                            <span>{isExpanded ? 'Đóng lịch' : 'Xem lịch ca'}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Vùng thông tin đổ từ vị trí phòng đổ xuống */}
                    {isExpanded && (
                      <tr className="border-b-2 border-blue-200">
                        <td colSpan={8} className="p-0">
                          <RoomScheduleDropdown 
                            room={room} 
                            onClose={() => setExpandedRoomId(null)} 
                          />
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

      {/* 5. Modal Thêm / Chỉnh sửa phòng học */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {editingRoom ? `Cập nhật Phòng ${editingRoom.ma_phong}` : 'Thêm Phòng Học Mới'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Đồng bộ trực tiếp với SQLite Table `phong`</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mã phòng *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: A103, B205"
                    disabled={!!editingRoom}
                    value={formData.ma_phong}
                    onChange={(e) => setFormData(prev => ({ ...prev, ma_phong: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mã Cơ sở</label>
                  <input 
                    type="text" 
                    value={formData.ma_cs}
                    onChange={(e) => setFormData(prev => ({ ...prev, ma_cs: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tòa nhà</label>
                  <select 
                    value={formData.toa}
                    onChange={(e) => setFormData(prev => ({ ...prev, toa: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="A">Tòa A</option>
                    <option value="B">Tòa B</option>
                    <option value="C">Tòa C</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tầng</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={formData.tang}
                    onChange={(e) => setFormData(prev => ({ ...prev, tang: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Loại phòng</label>
                  <select 
                    value={formData.loai_phong}
                    onChange={(e) => setFormData(prev => ({ ...prev, loai_phong: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="Phòng lý thuyết">Phòng lý thuyết</option>
                    <option value="Phòng máy tính">Phòng máy tính</option>
                    <option value="Hội trường">Hội trường</option>
                    <option value="Phòng học nhóm">Phòng học nhóm</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Trạng thái vận hành</label>
                  <select 
                    value={formData.trang_thai}
                    onChange={(e) => setFormData(prev => ({ ...prev, trang_thai: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="Sẵn sàng">Sẵn sàng</option>
                    <option value="Đang dùng">Đang dùng</option>
                    <option value="Bảo trì">Bảo trì</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Sức chứa (người)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.suc_chua}
                    onChange={(e) => setFormData(prev => ({ ...prev, suc_chua: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Số bàn</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.so_ban}
                    onChange={(e) => setFormData(prev => ({ ...prev, so_ban: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Diện tích (m²)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={formData.dien_tich}
                    onChange={(e) => setFormData(prev => ({ ...prev, dien_tich: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy bỏ
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                >
                  {editingRoom ? 'Lưu Thay Đổi' : 'Tạo Phòng Ngay'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
