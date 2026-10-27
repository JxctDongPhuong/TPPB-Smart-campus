import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { 
  Building, 
  Layers, 
  Users, 
  Zap,
  Info,
  CalendarCheck,
  AlertTriangle,
  Wrench
} from 'lucide-react';

export function FloorPlanViewer({ rooms = [], selectedRoomId = 'A101', onSelectRoom }) {
  const [selectedBuilding, setSelectedBuilding] = useState('ALL');
  const [selectedFloor, setSelectedFloor] = useState('ALL');

  // Filter rooms by building and floor
  const displayRooms = rooms.filter(r => {
    const matchBuilding = selectedBuilding === 'ALL' || (r.toa || r.ma_phong?.charAt(0)) === selectedBuilding;
    const roomFloor = r.tang !== undefined ? String(r.tang) : r.ma_phong?.charAt(1);
    const matchFloor = selectedFloor === 'ALL' || roomFloor === selectedFloor;
    return matchBuilding && matchFloor;
  });

  const activeRoomsCount = rooms.filter(r => r.trang_thai === 'Đang dùng' || r.hasScheduleToday).length;
  const readyRoomsCount = rooms.filter(r => r.trang_thai === 'Sẵn sàng' && !r.hasScheduleToday && !r.isWasteAlert).length;
  const issueRoomsCount = rooms.filter(r => r.trang_thai === 'Bảo trì' || r.hasIssue || r.isWasteAlert).length;

  return (
    <Card className="p-6 animate-fade-in-up stagger-3">
      {/* Top Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Sơ đồ Mặt Bằng & Trạng Thái Phòng Học
            </h2>
            <Badge variant="primary" size="sm">Cơ sở CS1</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Trực quan hóa phòng học, sức chứa và lịch đào tạo thực tế từ Database
          </p>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Tòa nhà */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả Tòa</option>
              <option value="A">Tòa A</option>
              <option value="B">Tòa B</option>
            </select>
          </div>

          {/* Tầng */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả Tầng</option>
              <option value="1">Tầng 1</option>
              <option value="2">Tầng 2</option>
              <option value="3">Tầng 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blueprint Grid Container */}
      <div className="mt-5 p-5 bg-slate-50/90 rounded-2xl border border-slate-200/90 bg-grid-pattern relative overflow-hidden">
        {/* Header Blueprint label */}
        <div className="flex items-center justify-between pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-slate-700 uppercase">
              {selectedBuilding === 'ALL' ? 'KHU VỰC TOÀN KHUÔN VIÊN' : `MẶT BẰNG TÒA ${selectedBuilding}`}
              {selectedFloor !== 'ALL' && ` - TẦNG ${selectedFloor}`}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">({displayRooms.length} phòng)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Chọn phòng để xem chi tiết thiết bị & lịch học</span>
          </div>
        </div>

        {/* Dynamic Architectural Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 py-2">
          {displayRooms.map((room) => {
            const roomId = room.ma_phong || room.id;
            const isSelected = roomId === selectedRoomId;
            return (
              <RoomCard
                key={roomId}
                room={room}
                isSelected={isSelected}
                onClick={() => onSelectRoom?.(roomId)}
              />
            );
          })}
        </div>

        {displayRooms.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            Không tìm thấy phòng nào phù hợp với bộ lọc đã chọn.
          </div>
        )}
      </div>

      {/* Blueprint Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 font-medium">Đang có lớp ({activeRoomsCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="text-slate-600 font-medium">Phòng sẵn sàng ({readyRoomsCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-600 font-medium">Cảnh báo / Bảo trì ({issueRoomsCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-500">Tổng sức chứa khả dụng:</span>
          <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            {rooms.reduce((acc, r) => acc + (r.suc_chua || 40), 0)} chỗ
          </span>
        </div>
      </div>
    </Card>
  );
}

function RoomCard({ room, isSelected, onClick }) {
  const roomId = room.ma_phong || room.id;
  const isOccupied = room.trang_thai === 'Đang dùng' || room.hasScheduleToday;
  const isMaintenance = room.trang_thai === 'Bảo trì' || room.hasIssue;
  const isWaste = room.isWasteAlert;

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none text-left interactive-card ${
        isSelected
          ? 'bg-blue-50/95 border-blue-500 ring-2 ring-blue-500/30 shadow-md scale-[1.01]'
          : isWaste
          ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
          : isMaintenance
          ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
          : isOccupied
          ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-400'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Header of Room */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`font-mono font-extrabold text-base ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
            {roomId}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            Tòa {room.toa || roomId.charAt(0)} • Tầng {room.tang || roomId.charAt(1)}
          </span>
        </div>

        {/* Status indicator dot */}
        <div className="flex items-center">
          {isWaste ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          ) : isMaintenance ? (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          ) : isOccupied ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
          )}
        </div>
      </div>

      {/* Room Category */}
      <p className="text-[11px] text-slate-500 font-medium mt-1">
        {room.loai_phong || room.type || 'Phòng học'}
      </p>

      {/* Class Schedule / Current Status */}
      <div className="mt-2 min-h-6">
        {room.currentSchedule ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 truncate">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{room.currentSchedule.ten_mon_hoc}</span>
          </div>
        ) : isWaste ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 truncate">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Lãng phí điện ({room.kwh} kWh)</span>
          </div>
        ) : isMaintenance ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 truncate">
            <Wrench className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">Đang có phiếu sửa chữa</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Hiện đang trống</span>
        )}
      </div>

      {/* Bottom Info: Capacity & kWh */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px]">
        <div className="flex items-center gap-1 text-slate-500 font-mono">
          <Users className="w-3 h-3 text-slate-400" />
          <span>Sức chứa: {room.suc_chua || room.capacity || 40}</span>
        </div>

        {room.kwh > 0 && (
          <div className="flex items-center gap-1 text-amber-600 font-mono font-semibold">
            <Zap className="w-3 h-3" />
            <span>{room.kwh} kWh</span>
          </div>
        )}
      </div>
    </div>
  );
}
