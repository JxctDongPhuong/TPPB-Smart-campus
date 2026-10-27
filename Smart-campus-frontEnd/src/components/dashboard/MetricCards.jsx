import React from 'react';
import { DoorClosed, Monitor, Zap, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export function MetricCards({ summary }) {
  const cards = [
    {
      id: 'rooms',
      title: 'Phòng đang sử dụng',
      value: `${summary?.roomsOccupied || 128}`,
      subValue: `/${summary?.totalRooms || 164}`,
      change: summary?.roomsGrowth || '+12%',
      changeType: 'up',
      icon: DoorClosed,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      bars: [40, 55, 60, 75, 65, 80, 85, 90, 78, 88]
    },
    {
      id: 'devices',
      title: 'Thiết bị hoạt động',
      value: `${summary?.deviceUptime || 94.6}%`,
      subValue: '',
      change: summary?.deviceGrowth || '+2.4%',
      changeType: 'up',
      icon: Monitor,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      bars: [85, 90, 92, 91, 95, 94, 96, 94, 95, 96]
    },
    {
      id: 'energy',
      title: 'Tiêu thụ hôm nay',
      value: `${summary?.energyKWh?.toLocaleString() || '8,240'}`,
      subValue: 'kWh',
      change: summary?.energySavingDiff || '-8.1%',
      changeType: 'down',
      icon: Zap,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      bars: [95, 90, 85, 82, 80, 78, 76, 75, 72, 70]
    },
    {
      id: 'alerts',
      title: 'Cảnh báo cần xử lý',
      value: summary?.activeAlerts < 10 ? `0${summary?.activeAlerts || 7}` : `${summary?.activeAlerts || 7}`,
      subValue: '',
      change: `${summary?.criticalAlerts || 3} khẩn cấp`,
      changeType: 'critical',
      icon: AlertTriangle,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50',
      bars: [20, 40, 30, 60, 50, 70, 80, 65, 90, 100]
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.id} hover className="p-5 flex flex-col justify-between">
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center ${card.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <Badge 
                variant={card.changeType === 'critical' ? 'danger' : 'success'} 
                size="sm"
              >
                {card.changeType === 'up' && <TrendingUp className="w-3 h-3" />}
                {card.changeType === 'down' && <TrendingDown className="w-3 h-3" />}
                <span>{card.change}</span>
              </Badge>
            </div>

            {/* Card Content */}
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500 mb-1">{card.title}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {card.value}
                </span>
                {card.subValue && (
                  <span className="text-sm font-semibold text-slate-400 font-mono">
                    {card.subValue}
                  </span>
                )}
              </div>
            </div>

            {/* Mini Sparkline Bar Chart */}
            <div className="mt-3 flex items-end gap-1 h-5 pt-1">
              {card.bars.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-xs transition-all ${
                    card.changeType === 'critical'
                      ? 'bg-rose-200 group-hover:bg-rose-300'
                      : card.id === 'energy'
                      ? 'bg-amber-200'
                      : card.id === 'devices'
                      ? 'bg-emerald-200'
                      : 'bg-blue-200'
                  }`}
                />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
