import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { 
  Building, 
  Layers, 
  Calendar, 
  Clock, 
  Thermometer, 
  Users, 
  Zap,
  Info
} from 'lucide-react';

export function FloorPlanViewer({ rooms = [], selectedRoomId = 'C101', onSelectRoom }) {
  const [selectedBuilding, setSelectedBuilding] = useState('A');
  const [selectedFloor, setSelectedFloor] = useState('1');
  const [selectedSession, setSelectedSession] = useState('morning');

  // Room categorization
  const activeRoomsCount = rooms.filter(r => r.status === 'active').length;
  const emptyRoomsCount = rooms.filter(r => r.status === 'empty').length;
  const totalOccupancyPercent = Math.round((activeRoomsCount / (rooms.length || 1)) * 100);

  return (
    <Card className="p-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Bản đồ phòng học & Sơ đồ mặt bằng
            </h2>
            <Badge variant="primary" size="sm">Trực quan hóa IoT</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi trạng thái, sĩ số thực tế và điều khiển thiết bị phòng theo thời gian thực
          </p>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Tòa nhà */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="A">Tòa A</option>
              <option value="B">Tòa B</option>
              <option value="C">Lab C</option>
            </select>
          </div>

          {/* Tầng */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="1">Tầng 1</option>
              <option value="2">Tầng 2</option>
              <option value="3">Tầng 3</option>
            </select>
          </div>

          {/* Ngày */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>21/05/2024</span>
          </div>

          {/* Buổi */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="morning">Buổi sáng (07:00 - 11:30)</option>
              <option value="afternoon">Buổi chiều (13:00 - 17:30)</option>
              <option value="evening">Buổi tối (18:00 - 21:00)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blueprint Sơ đồ Tầng */}
      <div className="mt-5 p-5 bg-slate-50/90 rounded-2xl border border-slate-200/90 bg-grid-pattern relative overflow-hidden">
        {/* Header Blueprint label */}
        <div className="flex items-center justify-between pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-slate-700 uppercase">
              SƠ ĐỒ MẶT BẰNG TÒA {selectedBuilding} - TẦNG {selectedFloor}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Cập nhật lúc 10:35</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Nhấp vào phòng để xem trạng thái thiết bị chi tiết</span>
          </div>
        </div>

        {/* Dynamic Architectural Grid */}
        <div className="space-y-3">
          {/* HÀNG TRÊN: Khu C & B */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {rooms.slice(0, 5).map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isSelected={room.id === selectedRoomId}
                onClick={() => onSelectRoom?.(room.id)}
              />
            ))}
          </div>

          {/* HÀNG GIỮA: Sảnh trung tâm & Lối đi hành lang */}
          <div className="grid grid-cols-12 gap-3 items-center py-2">
            <div className="col-span-3">
              {rooms.slice(5, 6).map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isSelected={room.id === selectedRoomId}
                  onClick={() => onSelectRoom?.(room.id)}
                />
              ))}
            </div>

            {/* Sảnh hành lang thông thoáng */}
            <div className="col-span-6 border-2 border-dashed border-slate-300 rounded-xl p-3 flex flex-col items-center justify-center bg-white/70 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                SẢNH TRUNG TÂM & HÀNH LANG CHÍNH
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Khu sinh hoạt chung • Wi-Fi Mesh công suất cao</span>
            </div>

            <div className="col-span-3 space-y-2">
              {rooms.slice(6, 8).map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isSelected={room.id === selectedRoomId}
                  onClick={() => onSelectRoom?.(room.id)}
                />
              ))}
            </div>
          </div>

          {/* HÀNG DƯỚI: Khu Tòa A & D */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {rooms.slice(8, 14).map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isSelected={room.id === selectedRoomId}
                onClick={() => onSelectRoom?.(room.id)}
              />
            ))}
          </div>

          {/* Lối vào chính */}
          <div className="flex justify-center pt-2">
            <div className="px-6 py-1.5 bg-slate-200/80 border border-slate-300 rounded-full text-[11px] font-bold text-slate-600 tracking-wider flex items-center gap-2">
              <span>▼ LỐI VÀO CHÍNH TÒA NHÀ ▼</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blueprint Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 font-medium">Đang sử dụng ({activeRoomsCount} phòng)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="text-slate-600 font-medium">Phòng trống ({emptyRoomsCount} phòng)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-slate-500">Công suất toàn tầng:</span>
          <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            {totalOccupancyPercent}%
          </span>
        </div>
      </div>
    </Card>
  );
}

function RoomCard({ room, isSelected, onClick }) {
  const isActive = room.status === 'active';

  return (
    <div
      onClick={onClick}
      className={`relative p-3.5 rounded-xl border transition-all cursor-pointer select-none text-left ${
        isSelected
          ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/30 shadow-md'
          : isActive
          ? 'bg-emerald-50/50 border-emerald-200/90 hover:border-emerald-400 hover:shadow-xs'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs opacity-80 hover:opacity-100'
      }`}
    >
      {/* Top Header of Room */}
      <div className="flex items-center justify-between">
        <span className={`font-mono font-bold text-sm ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
          {room.id}
        </span>
        <span
          className={`w-2 h-2 rounded-full ${
            isActive ? 'bg-emerald-500 shadow-xs shadow-emerald-400' : 'bg-slate-300'
          }`}
        />
      </div>

      {/* Room Category */}
      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{room.type}</p>

      {/* Subject Name */}
      <p className={`text-xs font-semibold truncate mt-1 ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
        {room.subject}
      </p>

      {/* Bottom Info: Capacity & Temp */}
      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100/80 text-[10px]">
        <div className="flex items-center gap-1 text-slate-500 font-mono">
          <Users className="w-3 h-3 text-slate-400" />
          <span>{isActive ? `${room.current}/${room.capacity}` : `0/${room.capacity}`}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-500 font-mono">
          <Thermometer className="w-3 h-3 text-slate-400" />
          <span>{room.temperature}°C</span>
        </div>
      </div>
    </div>
  );
}
