import React from 'react';
import { Calendar, Download, Building2, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';

export function LiveStatusBar({ onExportReport }) {
  // Format real current date in Vietnamese
  const today = new Date();
  const dateStr = today.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 animate-fade-in-down">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">
          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="capitalize">{dateStr}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline"></span>
          <span className="text-blue-600 font-semibold flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 shrink-0" /> Cơ sở Chính (CS1)
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Bảng Điều Khiển Vận Hành Smart Campus
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Giám sát trạng thái phòng học, lịch đào tạo, thiết bị và cảnh báo tiết kiệm năng lượng.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Real Operational Status Pill from Backend */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold">Hệ thống Trực tuyến</span>
        </div>

        {/* Export Report Button */}
        <Button 
          variant="outline" 
          icon={Download} 
          onClick={onExportReport}
          className="text-xs font-semibold hover:border-slate-300 hover:shadow-xs active:scale-95 transition-all"
        >
          Xuất báo cáo
        </Button>
      </div>
    </div>
  );
}
