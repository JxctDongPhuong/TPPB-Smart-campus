import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Zap, Wrench, AlertTriangle } from 'lucide-react';
import { mockCampusData } from '../../data/mockData';

export function AlertsList({ alerts = mockCampusData.recentAlerts, onViewAll }) {
  const getAlertIcon = (title = '') => {
    if (title.includes('điện') || title.includes('Waste') || title.includes('lãng phí')) return Zap;
    if (title.includes('nước') || title.includes('hỏng') || title.includes('Điều hòa')) return Wrench;
    return AlertTriangle;
  };

  return (
    <Card className="p-6 flex flex-col justify-between animate-fade-in-up stagger-5 interactive-card">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Sự Cố & Báo Hỏng
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Từ bảng PhieuBaoHong & Cảnh báo Idle Waste
            </p>
          </div>
          <Badge variant="warning" size="sm">
            {alerts.length} vấn đề
          </Badge>
        </div>

        {/* Alerts Stack */}
        <div className="space-y-3 mt-4">
          {alerts.map((alt) => {
            const Icon = getAlertIcon(alt.title);
            const isCritical = alt.severity === 'critical';

            return (
              <div
                key={alt.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isCritical 
                      ? 'bg-rose-100 text-rose-600' 
                      : 'bg-amber-100 text-amber-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{alt.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {alt.location} • <span className="font-mono text-slate-400">{alt.time}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">
                      {alt.detail}
                    </p>
                  </div>
                </div>

                <Badge variant={isCritical ? 'danger' : 'warning'} size="sm" className="shrink-0">
                  {alt.severityLabel}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 mt-3 border-t border-slate-100">
        <button
          onClick={onViewAll}
          className="w-full py-2 text-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/70 rounded-xl transition-all cursor-pointer"
        >
          Quản lý toàn bộ danh sách phiếu báo hỏng →
        </button>
      </div>
    </Card>
  );
}
