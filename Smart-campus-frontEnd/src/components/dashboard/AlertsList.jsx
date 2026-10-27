import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Zap, Tv, Users, ArrowUpRight } from 'lucide-react';
import { mockCampusData } from '../../data/mockData';

export function AlertsList({ alerts = mockCampusData.recentAlerts, onViewAll }) {
  const getAlertIcon = (title) => {
    if (title.includes('điện')) return Zap;
    if (title.includes('chiếu') || title.includes('tính')) return Tv;
    return Users;
  };

  const getSeverityBadgeVariant = (severity) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Card className="p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Cảnh báo gần đây
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {alerts.length} cảnh báo cần xử lý theo dõi
            </p>
          </div>
          <button 
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Xem tất cả</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alerts Stack */}
        <div className="space-y-3 mt-4">
          {alerts.map((alt) => {
            const Icon = getAlertIcon(alt.title);
            const variant = getSeverityBadgeVariant(alt.severity);

            return (
              <div
                key={alt.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    alt.severity === 'critical' 
                      ? 'bg-rose-100 text-rose-600' 
                      : alt.severity === 'warning' 
                      ? 'bg-amber-100 text-amber-600' 
                      : 'bg-sky-100 text-sky-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{alt.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {alt.location} • <span className="font-mono">{alt.time}</span>
                    </p>
                  </div>
                </div>

                <Badge variant={variant} size="sm" className="shrink-0">
                  {alt.severityLabel}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
