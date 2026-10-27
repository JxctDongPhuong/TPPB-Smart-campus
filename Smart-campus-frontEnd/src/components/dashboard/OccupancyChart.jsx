import React, { useState } from 'react';
import { Card } from '../common/Card';
import { mockCampusData } from '../../data/mockData';

export function OccupancyChart({ data = mockCampusData.occupancyHourly, buildings = mockCampusData.buildingsOccupancy }) {
  const [activeRange, setActiveRange] = useState('today');
  const [hoveredPoint, setHoveredPoint] = useState({ time: '14:00', rate: 76 });

  // Compute SVG polyline points
  const width = 800;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartWidth;
    const y = height - paddingY - (d.rate / 100) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[idx - 1];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <Card className="p-6">
      {/* Chart Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Tỷ lệ sử dụng phòng theo thời gian
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu cảm biến đo theo thời gian thực (Occupancy Telemetry)
          </p>
        </div>

        {/* Range Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveRange('today')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeRange === 'today' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setActiveRange('week')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeRange === 'week' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            7 ngày
          </button>
          <button
            onClick={() => setActiveRange('month')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeRange === 'month' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            30 ngày
          </button>
        </div>
      </div>

      {/* SVG Smooth Area Chart */}
      <div className="relative mt-4">
        {/* Tooltip display */}
        {hoveredPoint && (
          <div 
            className="absolute top-2 right-4 px-3 py-1.5 bg-slate-900 text-white rounded-xl shadow-md text-xs font-mono flex items-center gap-2 pointer-events-none"
          >
            <span className="text-blue-400 font-bold">{hoveredPoint.rate}%</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">{hoveredPoint.time}</span>
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((level) => {
            const y = height - paddingY - (level / 100) * chartHeight;
            return (
              <g key={level}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Fill Area */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Stroke Line */}
          <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

          {/* Interactive points */}
          {points.map((pt, idx) => (
            <g 
              key={idx} 
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredPoint(pt)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={pt.time === hoveredPoint.time ? 5 : 3}
                fill={pt.time === hoveredPoint.time ? '#1d4ed8' : '#ffffff'}
                stroke="#2563eb"
                strokeWidth={pt.time === hoveredPoint.time ? 3 : 2}
                className="transition-all"
              />
              {/* X-axis labels */}
              {['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'].includes(pt.time) && (
                <text
                  x={pt.x}
                  y={height - 5}
                  textAnchor="middle"
                  className="text-[11px] fill-slate-400 font-mono"
                >
                  {pt.time}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Buildings Breakdown Progress Bars */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 mt-2 border-t border-slate-100">
        {buildings.map((b) => (
          <div key={b.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-800">{b.name}</span>
              <span className="font-bold text-slate-900 font-mono">{b.rate}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${b.color}`}
                style={{ width: `${b.rate}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              {b.occupied}/{b.total} phòng
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
