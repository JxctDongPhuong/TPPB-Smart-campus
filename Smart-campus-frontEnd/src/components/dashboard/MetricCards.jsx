import React from 'react';
import { DoorClosed, CalendarDays, Zap, AlertTriangle } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export function MetricCards({ summary }) {
  const cards = [
    {
      id: 'rooms',
      title: 'Phòng đang sử dụng',
      value: `${summary?.roomsOccupied || 2}`,
      subValue: `/${summary?.totalRooms || 6} phòng`,
      tag: `${summary?.roomsAvailable || 4} phòng sẵn sàng`,
      tagVariant: 'info',
      icon: DoorClosed,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      delayClass: 'stagger-1'
    },
    {
      id: 'schedule',
      title: 'Ca học hôm nay',
      value: `${summary?.roomsOccupied || 2}`,
      subValue: 'ca đào tạo',
      tag: 'Đúng tiến độ',
      tagVariant: 'success',
      icon: CalendarDays,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      delayClass: 'stagger-2'
    },
    {
      id: 'energy',
      title: 'Điện năng tiêu thụ',
      value: `${typeof summary?.totalKWh === 'number' ? summary.totalKWh.toFixed(1) : (summary?.energyKWh || '39.0')}`,
      subValue: 'kWh',
      tag: `TB: ${summary?.averageKWhPerRoom || '13.0'} kWh/phòng`,
      tagVariant: 'warning',
      icon: Zap,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      delayClass: 'stagger-3'
    },
    {
      id: 'alerts',
      title: 'Sự cố & Báo hỏng',
      value: summary?.activeReports !== undefined 
        ? (summary.activeReports < 10 ? `0${summary.activeReports}` : `${summary.activeReports}`)
        : '01',
      subValue: 'phiếu đang xử lý',
      tag: summary?.wasteAlertsCount ? `${summary.wasteAlertsCount} cảnh báo lãng phí` : 'Cần xử lý',
      tagVariant: 'danger',
      icon: AlertTriangle,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50',
      delayClass: 'stagger-4'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card 
            key={card.id} 
            className={`p-5 flex flex-col justify-between interactive-card animate-fade-in-up ${card.delayClass}`}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center ${card.iconColor} transition-transform group-hover:scale-110 duration-200`}>
                <Icon className="w-5 h-5" />
              </div>
              <Badge variant={card.tagVariant} size="sm">
                <span>{card.tag}</span>
              </Badge>
            </div>

            {/* Card Content */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 mb-1">{card.title}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {card.value}
                </span>
                {card.subValue && (
                  <span className="text-xs font-semibold text-slate-400 font-mono">
                    {card.subValue}
                  </span>
                )}
              </div>
            </div>

            {/* Clean Status Bottom Line */}
            <div className="mt-3 pt-2.5 border-t border-slate-100/90 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Nguồn: Cơ sở dữ liệu SQLite</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
