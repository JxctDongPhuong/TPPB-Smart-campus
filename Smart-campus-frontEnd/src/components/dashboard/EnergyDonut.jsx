import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { mockCampusData } from '../../data/mockData';
import { ArrowUpRight, Zap, RotateCw } from 'lucide-react';

export function EnergyDonut({ data = mockCampusData.energyBreakdown }) {
  const [isAnimated, setIsAnimated] = useState(false);
  const [hoveredCat, setHoveredCat] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  // SVG Donut chart math
  const size = 150;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    setIsAnimated(false);
    const timer = setTimeout(() => setIsAnimated(true), 60);
    return () => clearTimeout(timer);
  }, [animKey]);

  let accumulatedPercent = 0;
  const totalKWh = data?.totalKWh || 39.0;

  return (
    <Card className="p-6 flex flex-col justify-between animate-fade-in-up stagger-4 interactive-card">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Phân bổ điện năng
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo danh mục loại thiết bị (LoaiThietBi)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              {totalKWh} kWh
            </span>
            <button
              onClick={() => setAnimKey(prev => prev + 1)}
              title="Phát lại hiệu ứng vẽ biểu đồ tròn"
              className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Donut Chart with Formation Sweep Animation */}
        <div className="flex items-center justify-center py-4" key={animKey}>
          <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="donut-spin-in overflow-visible">
              {/* Background circle track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />

              {data.categories.map((cat, i) => {
                const targetDash = (cat.percentage / 100) * circumference;
                const strokeDasharray = isAnimated
                  ? `${targetDash} ${circumference}`
                  : `0 ${circumference}`;
                const strokeDashoffset = isAnimated
                  ? - (accumulatedPercent / 100) * circumference
                  : 0;
                accumulatedPercent += cat.percentage;

                const isHovered = hoveredCat === i;

                return (
                  <circle
                    key={i}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                      transition: 'stroke-dasharray 1.1s cubic-bezier(0.16, 1, 0.3, 1), stroke-dashoffset 1.1s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.25s ease, filter 0.25s ease',
                      filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none'
                    }}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredCat(i)}
                    onMouseLeave={() => setHoveredCat(null)}
                  />
                );
              })}
            </svg>

            {/* Inner Center Label with Pop-in scale */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none chart-value-pop">
              <span className="text-xl font-black text-slate-900 font-mono tracking-tight">{totalKWh}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">kWh</span>
            </div>
          </div>
        </div>

        {/* Legend list with Interactive Hover */}
        <div className="space-y-1.5 mt-1">
          {data.categories.map((cat, i) => {
            const isHovered = hoveredCat === i;
            return (
              <div 
                key={i} 
                onMouseEnter={() => setHoveredCat(i)}
                onMouseLeave={() => setHoveredCat(null)}
                className={`flex items-center justify-between text-xs p-1.5 rounded-xl transition-all cursor-pointer ${
                  isHovered ? 'bg-slate-100/90 shadow-2xs translate-x-1' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform" 
                    style={{ 
                      backgroundColor: cat.color,
                      transform: isHovered ? 'scale(1.4)' : 'scale(1)'
                    }} 
                  />
                  <span className={`truncate font-medium ${isHovered ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-400">{cat.percentage}%</span>
                  <span className="font-bold text-slate-800">{cat.kwh} kWh</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

