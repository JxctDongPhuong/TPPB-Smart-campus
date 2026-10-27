import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { 
  Monitor, 
  Tv, 
  Wind, 
  Activity, 
  Calendar, 
  User, 
  Clock, 
  Zap, 
  CheckCircle2,
  AlertCircle,
  Wrench,
  Sparkles
} from 'lucide-react';

export function RoomDetailDrawer({ roomDetail, onToggleDevice, onReportIssue }) {
  const roomId = roomDetail?.ma_phong || roomDetail?.id || 'A101';
  const isOccupied = roomDetail?.trang_thai === 'Đang dùng' || roomDetail?.hasScheduleToday;
  const isMaintenance = roomDetail?.trang_thai === 'Bảo trì' || roomDetail?.hasIssue;
  const isWaste = roomDetail?.isWasteAlert;

  const getDeviceIcon = (maLoai = '', name = '') => {
    const text = `${maLoai} ${name}`.toUpperCase();
    if (text.includes('MAYCHIEU') || text.includes('CHIẾU') || text.includes('PROJECTOR')) return Tv;
    if (text.includes('MAYTINH') || text.includes('TÍNH') || text.includes('PC')) return Monitor;
    if (text.includes('MAYLANH') || text.includes('HÒA') || text.includes('LẠNH') || text.includes('DAIKIN')) return Wind;
    return Activity;
  };

  const devices = roomDetail?.devices || [];

  return (
    <Card className="p-6 h-full flex flex-col justify-between animate-slide-in-right border-slate-200/90 shadow-sm">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              CHI TIẾT PHÒNG HỌC
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                Phòng {roomId}
              </h3>
              <Badge 
                variant={isWaste ? 'warning' : isMaintenance ? 'danger' : isOccupied ? 'success' : 'neutral'} 
                size="sm"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isWaste ? 'bg-amber-500' : isMaintenance ? 'bg-rose-500' : isOccupied ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`} />
                <span>{roomDetail?.trang_thai || (isOccupied ? 'Đang dùng' : 'Sẵn sàng')}</span>
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {roomDetail?.loai_phong || roomDetail?.category || 'Phòng lý thuyết'} • Sức chứa {roomDetail?.suc_chua || roomDetail?.capacity || 40} chỗ
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-mono font-extrabold text-sm shadow-2xs">
            {roomId}
          </div>
        </div>

        {/* Lịch học hôm nay (LichPhong từ Backend) */}
        {roomDetail?.currentSchedule ? (
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/70 animate-scale-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> LỊCH HỌC CHÍNH KHÓA (CA {roomDetail.currentSchedule.ca})
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                {roomDetail.currentSchedule.trang_thai || 'Đang diễn ra'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-1">
              {roomDetail.currentSchedule.ten_mon_hoc}
            </h4>
            
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-blue-200/60 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5 truncate">
                <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">{roomDetail.currentSchedule.giang_vien}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{roomDetail.currentSchedule.thoi_gian || '07:30 - 11:30'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Hôm nay chưa có lịch học chính khóa tại phòng này.</span>
          </div>
        )}

        {/* Thông số điện năng thực tế từ Backend (DienNang) */}
        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Tiêu thụ điện hôm nay</p>
              <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
                {roomDetail?.kwh !== undefined ? `${roomDetail.kwh} kWh` : 'Chưa đo'}
              </p>
            </div>
          </div>
          {isWaste && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-2 py-1 rounded-md">
              Bất thường ngoài giờ
            </span>
          )}
        </div>

        {/* Danh sách thiết bị trong phòng (Bảng ThietBi) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Thiết bị trong phòng ({devices.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Bảng ThietBi</span>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {devices.length > 0 ? (
              devices.map((dev) => {
                const Icon = getDeviceIcon(dev.ma_loai, dev.ten_tb);
                const isGood = dev.tinh_trang === 'Tốt';
                return (
                  <div
                    key={dev.ma_tb || dev.id}
                    className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:bg-white hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isGood ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{dev.ten_tb || dev.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{dev.ma_tb} • {dev.cong_suat || dev.ma_loai}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                      isGood ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isGood ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>{dev.tinh_trang || 'Tốt'}</span>
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic py-2">Chưa có thiết bị đăng ký trong phòng.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Quick Action */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => alert(`Đã gửi yêu cầu kiểm tra kỹ thuật phòng ${roomId}`)}
          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <Wrench className="w-3.5 h-3.5 text-slate-500" />
          <span>Báo hỏng phòng</span>
        </button>

        <button
          onClick={() => alert(`Điều hòa phòng ${roomId} đang được hệ thống AI giám sát tự động.`)}
          className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>AI Tối ưu</span>
        </button>
      </div>
    </Card>
  );
}
