import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Zap, Calendar, AlertTriangle, CheckCircle2, RotateCw } from 'lucide-react';

export function OccupancyChart() {
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  // Dữ liệu tiêu thụ điện và lịch học thực tế từ bảng DienNang & LichPhong (seed_data.py)
  const roomMetrics = [
    { ma_phong: 'A101', kwh: 12.5, hours: 4.0, status: 'Có ca 1 (Lập trình Python)', type: 'normal' },
    { ma_phong: 'A102', kwh: 0.0, hours: 0.0, status: 'Không có ca học', type: 'idle' },
    { ma_phong: 'A201', kwh: 18.0, hours: 3.5, status: 'Có ca 2 (Mạng Máy Tính)', type: 'normal' },
    { ma_phong: 'A202', kwh: 0.0, hours: 0.0, status: 'Bảo trì điều hòa', type: 'issue' },
    { ma_phong: 'B301', kwh: 0.0, hours: 0.0, status: 'Hội trường trống', type: 'idle' },
    { ma_phong: 'B302', kwh: 8.5, hours: 6.0, status: 'Lãng phí: Không có lịch học', type: 'waste' }
  ];

  const maxKWh = 20.0;

  return (
    <Card className="p-6 animate-fade-in-up stagger-2 interactive-card">
      {/* Chart Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Biểu đồ Tiêu Thụ Điện Năng Theo Phòng
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Đối chiếu số đo thực tế (bảng DienNang) với lịch đào tạo (bảng LichPhong)
          </p>
        </div>

        {/* Legend & Replay Animation Button */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Học chính khóa</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Phát hiện lãng phí (Idle Waste)</span>
          </div>

          <button
            onClick={() => setAnimKey(prev => prev + 1)}
            title="Phát lại hiệu ứng hình thành biểu đồ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors ml-1 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bar Chart Visualization with Keyframe Entrance Formation */}
      <div className="mt-6" key={animKey}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end h-44 pb-2 border-b border-slate-200">
          {roomMetrics.map((item, idx) => {
            const heightPercent = Math.max(8, (item.kwh / maxKWh) * 100);
            const isWaste = item.type === 'waste';
            const isHovered = hoveredRoom?.ma_phong === item.ma_phong;
            const delayClass = `chart-bar-delay-${Math.min(idx + 1, 6)}`;

            return (
              <div 
                key={item.ma_phong}
                className="flex flex-col items-center justify-end h-full gap-2 group cursor-pointer"
                onMouseEnter={() => setHoveredRoom(item)}
                onMouseLeave={() => setHoveredRoom(null)}
              >
                {/* Value on top with animated pop-in */}
                <span className={`text-[11px] font-bold font-mono chart-value-pop ${delayClass} transition-transform duration-200 ${
                  isHovered ? '-translate-y-1 text-slate-900' : 'text-slate-500'
                }`}>
                  {item.kwh > 0 ? `${item.kwh} kWh` : '0 kWh'}
                </span>

                {/* Animated Column Bar with Rising Formation */}
                <div className="w-full max-w-14 bg-slate-100 rounded-t-xl h-full flex items-end p-1 overflow-hidden">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg chart-bar-animate ${delayClass} transition-all duration-300 ${
                      isWaste
                        ? 'bg-gradient-to-t from-amber-500 to-amber-400 group-hover:from-amber-600 group-hover:to-amber-500 shadow-xs shadow-amber-300'
                        : item.kwh > 0
                        ? 'bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-blue-700 group-hover:to-blue-500 shadow-xs shadow-blue-300'
                        : 'bg-slate-200'
                    }`}
                  />
                </div>

                {/* X-axis Label */}
                <span className={`text-xs font-mono font-bold mt-1 transition-colors ${
                  isHovered ? 'text-blue-700' : 'text-slate-700'
                }`}>
                  {item.ma_phong}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hover / Detail Status Bar */}
        <div className="mt-3.5 flex items-center justify-between text-xs text-slate-500 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Chi tiết chọn:</span>
            {hoveredRoom ? (
              <span className="font-medium text-slate-900">
                Phòng <strong className="font-mono">{hoveredRoom.ma_phong}</strong> — {hoveredRoom.status} ({hoveredRoom.hours} giờ bật thiết bị)
              </span>
            ) : (
              <span className="text-slate-400 italic">Rê chuột vào cột phòng để xem trạng thái vận hành và số giờ đo được</span>
            )}
          </div>
          <span className="font-mono font-semibold text-blue-600">
            Tổng cộng: 39.0 kWh
          </span>
        </div>
      </div>
    </Card>
  );
}
