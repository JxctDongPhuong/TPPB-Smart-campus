import React from 'react';
import { 
  DoorClosed, 
  Monitor, 
  Zap, 
  Calendar, 
  AlertTriangle, 
  Building2,
  Activity,
  ShieldCheck,
  X,
  CheckCircle2
} from 'lucide-react';

export function Sidebar({ 
  activeTab = 'rooms', 
  onSelectTab, 
  isOpen = false, 
  onClose,
  goodDevicesCount = 13,
  totalDevicesCount = 14,
  brokenDevicesCount = 0,
  pendingTicketsCount = 0
}) {
  // Navigation tabs with dynamic real-time badges
  const navItems = [
    { id: 'rooms', label: 'Phòng học', icon: DoorClosed },
    { id: 'schedule', label: 'Lịch học', icon: Calendar },
    { 
      id: 'devices', 
      label: 'Thiết bị', 
      icon: Monitor, 
      badge: brokenDevicesCount > 0 ? `${brokenDevicesCount} lỗi` : undefined, 
      badgeVariant: 'warning' 
    },
    { id: 'energy', label: 'Điện năng', icon: Zap },
    { 
      id: 'tickets', 
      label: 'Báo cáo sự cố', 
      icon: AlertTriangle, 
      badge: pendingTicketsCount > 0 ? `${pendingTicketsCount} phiếu` : undefined, 
      badgeVariant: 'danger' 
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden animate-fade-in-down"
        />
      )}

      {/* Sidebar: sticky top-0 on desktop so it always stays with mouse scroll and above drawers */}
      <aside className={`fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 lg:z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen select-none shadow-2xl lg:shadow-xs transition-transform duration-300 ease-in-out shrink-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 animate-scale-in">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">SMART</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">CAMPUS</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 tracking-wider">HỆ THỐNG VẬN HÀNH</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav List */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2 overscroll-contain">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Chức năng Quản lý
          </p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab?.(item.id);
                    onClose?.();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-xs translate-x-1.5'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600 hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      item.badgeVariant === 'danger'
                        ? 'bg-rose-100 text-rose-700'
                        : item.badgeVariant === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer System Status & Real User Profile */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          {/* Live Device Operational Status */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="absolute w-4 h-4 rounded-full bg-emerald-400 animate-ping opacity-60"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Thiết bị hoạt động</p>
              <p className="text-[10px] text-emerald-600 font-bold truncate">
                {goodDevicesCount} / {totalDevicesCount} thiết bị tốt
              </p>
            </div>
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
          </div>

          {/* Real User Profile from Backend TaiKhoan (Admin) */}
          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Ban Quản Lý CSVC</p>
              <p className="text-[10px] text-slate-500 truncate">Tài khoản Quản trị (Admin)</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
