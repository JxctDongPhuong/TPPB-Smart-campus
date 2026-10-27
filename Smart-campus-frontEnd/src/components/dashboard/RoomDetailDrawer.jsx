import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  Monitor, 
  Tv, 
  Wind, 
  Activity, 
  Lock, 
  Calendar, 
  User, 
  Clock, 
  Zap, 
  Thermometer, 
  Droplets, 
  ShieldCheck,
  Power
} from 'lucide-react';

export function RoomDetailDrawer({ roomDetail, onToggleDevice }) {
  const [deviceStatuses, setDeviceStatuses] = useState(
    roomDetail?.devices?.reduce((acc, dev) => ({ ...acc, [dev.id]: dev.status === 'online' }), {}) || {}
  );

  const toggleStatus = (id) => {
    setDeviceStatuses(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    onToggleDevice?.(id);
  };

  const getDeviceIcon = (name) => {
    if (name.includes('chiếu')) return Tv;
    if (name.includes('tính')) return Monitor;
    if (name.includes('hòa')) return Wind;
    if (name.includes('khóa')) return Lock;
    return Activity;
  };

  return (
    <Card className="p-6 h-full flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              PHÒNG ĐANG CHỌN
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-xl font-extrabold text-slate-900 font-mono">
                {roomDetail?.name || 'Phòng C101'}
              </h3>
              <Badge variant="success" size="sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{roomDetail?.status || 'Đang sử dụng'}</span>
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {roomDetail?.category || 'Phòng máy thực hành'} • Sức chứa {roomDetail?.capacity || 40} người
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-mono font-bold text-sm">
            {roomDetail?.id || 'C101'}
          </div>
        </div>

        {/* Lớp đang diễn ra */}
        {roomDetail?.currentClass && (
          <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              LỚP ĐANG DIỄN RA
            </span>
            <h4 className="text-sm font-bold text-slate-800 mt-0.5">
              {roomDetail.currentClass.subject}
            </h4>
            
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{roomDetail.currentClass.teacher}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{roomDetail.currentClass.timeSlot}</span>
              </div>
            </div>
          </div>
        )}

        {/* Các chỉ số môi trường (Telemetry) */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Nhiệt độ</p>
            <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">
              {roomDetail?.environment?.temperature || '23.8°C'}
            </p>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-1">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Độ ẩm</p>
            <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">
              {roomDetail?.environment?.humidity || '58%'}
            </p>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-1">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Công suất</p>
            <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">
              {roomDetail?.environment?.powerUsage || '4.6 kWh'}
            </p>
          </div>
        </div>

        {/* Thiết bị IoT trong phòng */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Thiết bị & Cảm biến ({roomDetail?.devices?.length || 0})
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Future • Relay Switch
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Mô phỏng bật/tắt</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {roomDetail?.devices?.map((dev) => {
              const Icon = getDeviceIcon(dev.name);
              const isOn = deviceStatuses[dev.id] !== false;
              return (
                <div
                  key={dev.id}
                  className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isOn ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{dev.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{dev.note}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStatus(dev.id)}
                    title={isOn ? 'Tắt thiết bị' : 'Bật thiết bị'}
                    className={`p-1.5 rounded-lg transition-all ${
                      isOn 
                        ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' 
                        : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-4 mt-4 border-t border-slate-100">
        <a 
          href="#schedule" 
          className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/70 rounded-xl transition-all"
        >
          <span>Xem thời khóa biểu đầy đủ</span>
          <span>→</span>
        </a>
      </div>
    </Card>
  );
}
