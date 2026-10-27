import React from 'react';
import { 
  LayoutDashboard, 
  DoorClosed, 
  Monitor, 
  Layers, 
  Zap, 
  Users, 
  Calendar, 
  AlertTriangle, 
  Settings,
  Building2,
  Activity
} from 'lucide-react';

export function Sidebar({ activeTab = 'overview', onSelectTab }) {
  const workspaceItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'rooms', label: 'Phòng học', icon: DoorClosed },
    { id: 'devices', label: 'Thiết bị', icon: Monitor, badge: 12 },
    { id: 'spaces', label: 'Không gian', icon: Layers },
    { id: 'energy', label: 'Năng lượng', icon: Zap },
    { id: 'users', label: 'Người dùng', icon: Users },
  ];

  const adminItems = [
    { id: 'schedule', label: 'Lịch vận hành', icon: Calendar },
    { id: 'tickets', label: 'Sự cố & yêu cầu', icon: AlertTriangle, badge: 7, badgeVariant: 'warning' },
    { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-slate-900">NEXUS</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">IoT</span>
          </div>
          <p className="text-[11px] font-medium text-slate-400 tracking-wider">SMART CAMPUS</p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Không gian làm việc
          </p>
          <div className="space-y-1">
            {workspaceItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab?.(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Quản trị
          </p>
          <div className="space-y-1">
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab?.(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer System Status & Profile */}
      <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
        {/* Live System Health */}
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="absolute w-4 h-4 rounded-full bg-emerald-400 animate-ping opacity-60"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">Hệ thống ổn định</p>
            <p className="text-[11px] text-slate-500 truncate">148 cảm biến trực tuyến</p>
          </div>
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            MT
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">Minh Trang</p>
            <p className="text-[11px] text-slate-400 truncate">Quản trị viên cơ sở</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
