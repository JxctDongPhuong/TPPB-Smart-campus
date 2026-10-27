import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  RotateCw, 
  Sparkles, 
  Command, 
  CheckCheck, 
  AlertTriangle, 
  Zap, 
  Wrench, 
  Calendar, 
  Clock, 
  ChevronRight,
  X,
  CheckCircle2,
  Menu
} from 'lucide-react';

import { UserAccountMenu } from './UserAccountMenu';

export function Header({ 
  activeTab = 'overview', 
  onSelectTab, 
  onSearch, 
  onRefresh, 
  isRefreshing, 
  onOpenAiChat,
  onToggleMobileSidebar
}) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountRef = useRef(null);

  // Danh sách thông báo thực tế đồng bộ từ Backend & Hệ thống AI
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Phát hiện lãng phí điện (Idle Waste)',
      message: 'Phòng B302 tiêu thụ 8.5 kWh ngoài giờ học. Đề xuất ngắt nguồn tự động.',
      time: '10 phút trước',
      type: 'waste',
      severity: 'warning',
      isRead: false,
      targetTab: 'energy',
      icon: Zap
    },
    {
      id: 'notif-2',
      title: 'Phiếu báo hỏng mới #1',
      message: 'Điều hòa phòng A202 bị chảy nước và kêu to, đang cần kỹ thuật viên xử lý.',
      time: '45 phút trước',
      type: 'repair',
      severity: 'danger',
      isRead: false,
      targetTab: 'tickets',
      icon: Wrench
    },
    {
      id: 'notif-3',
      title: 'Yêu cầu mượn phòng chờ duyệt',
      message: 'Lê Văn Cường xin mượn phòng B302 cho buổi họp đồ án tốt nghiệp.',
      time: '2 giờ trước',
      type: 'booking',
      severity: 'info',
      isRead: false,
      targetTab: 'schedule',
      icon: Calendar
    },
    {
      id: 'notif-4',
      title: 'Ca học 1 bắt đầu',
      message: 'Phòng A101 đang diễn ra môn Lập trình Python Nâng Cao (ThS. Nguyễn Văn A).',
      time: '07:30',
      type: 'schedule',
      severity: 'success',
      isRead: true,
      targetTab: 'schedule',
      icon: CheckCircle2
    }
  ]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Click vào thông báo để chuyển trang
  const handleItemClick = (notif) => {
    // Đánh dấu đã đọc
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    setIsNotifOpen(false);
    if (notif.targetTab && onSelectTab) {
      onSelectTab(notif.targetTab);
    }
  };

  const tabTitles = {
    overview: 'Tổng quan',
    rooms: 'Phòng học',
    'room-plan': 'Sơ đồ phòng',
    schedule: 'Lịch học',
    devices: 'Thiết bị',
    energy: 'Điện năng',
    tickets: 'Báo hỏng'
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Left Area: Mobile Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title="Mở menu chức năng"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0">
          <span className="text-slate-400 font-medium hidden sm:inline shrink-0">Smart Campus</span>
          <span className="text-slate-300 hidden sm:inline shrink-0">/</span>
          <span className="text-slate-900 font-bold truncate max-w-[160px] xs:max-w-[220px] sm:max-w-none">
            {tabTitles[activeTab] || 'Vận hành'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* AI Copilot Quick Action */}
        <button
          onClick={onOpenAiChat}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-all active:scale-95 hover:shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse shrink-0" />
          <span className="hidden sm:inline">Trợ Lý Nexus AI</span>
          <span className="sm:hidden text-[11px]">AI</span>
        </button>

        {/* Interactive Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(prev => !prev)}
            title="Xem thông báo hệ thống"
            className={`relative p-2 rounded-xl transition-all cursor-pointer ${
              isNotifOpen 
                ? 'bg-blue-50 text-blue-600 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[9px] font-black text-white bg-rose-500 rounded-full ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popover Dropdown (Mobile-first responsive) */}
          {isNotifOpen && (
            <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-96 max-w-sm sm:max-w-none bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 overflow-hidden animate-scale-in">
              {/* Dropdown Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">Thông báo hệ thống</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                      {unreadCount} mới
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Đọc tất cả</span>
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Không có thông báo nào.
                  </div>
                ) : (
                  notifications.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50/90 ${
                          !item.isRead ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        {/* Icon Indicator */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          item.severity === 'warning'
                            ? 'bg-amber-100 text-amber-700'
                            : item.severity === 'danger'
                            ? 'bg-rose-100 text-rose-700'
                            : item.severity === 'success'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className={`text-xs truncate ${!item.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                              {item.title}
                            </h4>
                            {!item.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{item.time}</span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 self-center" />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    onSelectTab?.('tickets');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Xem danh sách sự cố & phiếu báo hỏng →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar: Admin with YouTube-like Account Menu */}
        <div className="relative" ref={accountRef}>
          <button 
            onClick={() => setIsAccountMenuOpen(prev => !prev)}
            title="Quản lý thông tin tài khoản và đăng nhập/đăng xuất"
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-500/30 hover:ring-blue-500 shadow-xs cursor-pointer transition-all active:scale-95"
          >
            QL
          </button>

          <UserAccountMenu 
            isOpen={isAccountMenuOpen} 
            onClose={() => setIsAccountMenuOpen(false)} 
          />
        </div>
      </div>
    </header>
  );
}
