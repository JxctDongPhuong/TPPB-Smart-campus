import React from 'react';
import { Calendar, Download, Sun, CloudRain, Cpu } from 'lucide-react';
import { Button } from '../common/Button';

export function LiveStatusBar({ onExportReport }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Thứ Ba, 21 Tháng 05</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="text-blue-600 font-semibold">Học kỳ II • Tuần 14</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Chào buổi sáng, Trang
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Đây là tình hình vận hành và giám sát khuôn viên trường hôm nay.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Campus Weather & Environment Pill */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>28°C • Nắng nhẹ</span>
          </div>
          <span className="w-px h-3.5 bg-slate-200"></span>
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Cpu className="w-4 h-4 text-emerald-500" />
            <span>AQI: 32 (Tốt)</span>
          </div>
        </div>

        {/* Export Report Button */}
        <Button 
          variant="outline" 
          icon={Download} 
          onClick={onExportReport}
          className="text-xs font-semibold hover:border-slate-300"
        >
          Xuất báo cáo
        </Button>
      </div>
    </div>
  );
}
