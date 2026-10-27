import React from 'react';
import { Card } from '../common/Card';
import { mockCampusData } from '../../data/mockData';
import { ArrowUpRight } from 'lucide-react';

export function EnergyDonut({ data = mockCampusData.energyBreakdown }) {
  // SVG Donut chart math
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <Card className="p-6 flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Phân bổ năng lượng
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                Future • Sub-metering
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân tách phụ tải chi tiết (Dự kiến mở rộng công tơ phụ)
            </p>
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
            <span>Chi tiết</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Donut Chart & Center Text */}
        <div className="flex items-center justify-center py-4">
          <div className="relative">
            <svg width={size} height={size} className="transform -rotate-90">
              {data.categories.map((cat, i) => {
                const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = - (accumulatedPercent / 100) * circumference;
                accumulatedPercent += cat.percentage;

                return (
                  <circle
                    key={i}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 hover:opacity-85"
                  />
                );
              })}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-900 font-mono">8.2k</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">kWh</span>
            </div>
          </div>
        </div>

        {/* Legend list */}
        <div className="space-y-2 mt-1">
          {data.categories.map((cat, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-600 font-medium">{cat.name}</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-slate-400">{cat.percentage}%</span>
                <span className="font-bold text-slate-800">{cat.kwh} kWh</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
