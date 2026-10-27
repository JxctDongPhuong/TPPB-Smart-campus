import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Moon,
  Sun,
  Users,
  LogOut,
  ChevronRight,
  ChevronDown,
  Check,
  ShieldCheck,
  LogIn,
  KeyRound,
  ArrowRight
} from 'lucide-react';

export function UserAccountMenu({ isOpen, onClose }) {
  // Trạng thái theme sáng / tối được đọc từ documentElement hoặc localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') ||
      localStorage.getItem('campus_theme') === 'dark';
  });

  // Trạng thái mở rộng danh sách chuyển đổi tài khoản (đổ xuống inline)
  const [isSwitchExpanded, setIsSwitchExpanded] = useState(false);

  // Trạng thái đăng xuất / đăng nhập
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // Trạng thái mở form nhập mật khẩu đăng nhập (đổ xuống inline tại vị trí Đăng nhập)
  const [isLoginFormExpanded, setIsLoginFormExpanded] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Danh sách tài khoản demo
  const [accounts, setAccounts] = useState([
    {
      id: 'ql-1',
      ma_tk: 1,
      name: 'Lê Khánh Nam',
      email: 'khanhnam.ql@campus.edu.vn',
      role: 'Ban Quản Lý Campus (Admin)',
      avatarText: 'QL',
      avatarBg: 'bg-slate-900',
      isActive: true
    },
    {
      id: 'gv-1',
      ma_tk: 2,
      name: 'TS. Nguyễn Văn Hùng',
      email: 'nguyenvanhung.gv@campus.edu.vn',
      role: 'Giảng viên Khoa CNTT',
      avatarText: 'GV',
      avatarBg: 'bg-blue-600',
      isActive: false
    },
    {
      id: 'sv-1',
      ma_tk: 4,
      name: 'Đặng Minh Trang',
      email: 'minhtrang.sv@campus.edu.vn',
      role: 'Sinh viên',
      avatarText: 'SV',
      avatarBg: 'bg-amber-600',
      isActive: false
    },
    {
      id: 'kt-1',
      ma_tk: 3,
      name: 'Trần Minh Tuấn',
      email: 'tuan.ktv@campus.edu.vn',
      role: 'Kỹ thuật viên Thiết bị & Điện',
      avatarText: 'KT',
      avatarBg: 'bg-emerald-600',
      isActive: false
    }
  ]);

  const currentAccount = accounts.find(a => a.isActive) || accounts[0];

  // Lưu tài khoản hiện tại vào localStorage để Nexus AI Copilot nhận diện vai trò
  useEffect(() => {
    localStorage.setItem('campus_current_user', JSON.stringify({
      id: currentAccount.id,
      ma_tk: currentAccount.ma_tk || (currentAccount.id === 'gv-1' ? 2 : currentAccount.id === 'sv-1' ? 4 : 1),
      name: currentAccount.name,
      email: currentAccount.email,
      role: currentAccount.role
    }));
  }, [currentAccount]);

  // Đảm bảo class 'dark' được áp dụng chuẩn xác trên html tag
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('campus_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('campus_theme', 'light');
    }
  }, [isDarkMode]);

  // Xử lý chuyển đổi theme sáng/tối
  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Chọn tài khoản khác (đổi ngay trong menu đổ xuống)
  const handleSelectAccount = (id) => {
    setAccounts(prev => prev.map(a => ({
      ...a,
      isActive: a.id === id
    })));
    setIsSwitchExpanded(false);
  };

  // Bấm Đăng xuất -> chuyển thành nút Đăng nhập
  const handleLogoutClick = () => {
    setIsLoggedOut(true);
    setIsLoginFormExpanded(false);
  };

  // Bấm Đăng nhập -> đổ xuống form nhập mật khẩu tại vị trí đăng nhập
  const handleLoginClick = () => {
    setLoginEmail(currentAccount.email);
    setLoginPassword('');
    setIsLoginFormExpanded(prev => !prev);
  };

  // Xử lý submit form đăng nhập đổ xuống
  const handleSubmitLogin = (e) => {
    e.preventDefault();
    setIsLoggedOut(false);
    setIsLoginFormExpanded(false);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 overflow-hidden animate-scale-in select-none text-slate-800">

      {/* 1. Header Thông tin tài khoản (Ảnh + Tên + Email) */}
      <div className="p-4 border-b border-slate-100 flex items-start gap-3 bg-slate-50/70">
        <div className={`w-10 h-10 rounded-full ${isLoggedOut ? 'bg-slate-400' : currentAccount.avatarBg} text-white font-black text-sm flex items-center justify-center shrink-0 ring-2 ring-blue-500/20 shadow-xs`}>
          {isLoggedOut ? '?' : currentAccount.avatarText}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-extrabold text-sm text-slate-900 truncate">
            {isLoggedOut ? 'Chưa đăng nhập' : currentAccount.name}
          </h4>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {isLoggedOut ? 'Vui lòng đăng nhập để thao tác' : currentAccount.email}
          </p>
          {!isLoggedOut && (
            <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md w-fit">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>{currentAccount.role}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Danh sách mục menu */}
      <div className="py-1 text-xs divide-y divide-slate-100">

        {/* Mục 1: Giao diện (Sáng / Tối) - Click đổi ngay màu toàn trang */}
        <div className="py-0.5">
          <button
            onClick={handleToggleTheme}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center text-slate-600 transition-colors">
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </div>
              <div>
                <span className="font-bold text-slate-800 block">Giao diện</span>
                <span className="text-[11px] text-slate-400">
                  {isDarkMode ? 'Đang bật Giao diện Tối' : 'Đang bật Giao diện Sáng'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 group-hover:text-blue-600">
              <span>{isDarkMode ? 'Tối' : 'Sáng'}</span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
            </div>
          </button>
        </div>

        {/* Mục 2: Chuyển đổi tài khoản (ĐỔ XUỐNG TỪ VỊ TRÍ NÀY, KHÔNG HIỆN MODAL Ở GIỮA) */}
        {!isLoggedOut && (
          <div className="py-0.5">
            <button
              onClick={() => setIsSwitchExpanded(prev => !prev)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center text-slate-600 transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Chuyển đổi tài khoản</span>
                  <span className="text-[11px] text-slate-400">Chọn vai trò đăng nhập khác</span>
                </div>
              </div>

              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSwitchExpanded ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            {/* Vùng đổ xuống các tài khoản ngay tại vị trí này */}
            {isSwitchExpanded && (
              <div className="px-3 pb-2 pt-1 space-y-1 bg-slate-50/80 border-t border-b border-slate-100 animate-fade-in-down">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 pt-1">
                  Chọn tài khoản sử dụng:
                </p>
                {accounts.map(acc => (
                  <div
                    key={acc.id}
                    onClick={() => handleSelectAccount(acc.id)}
                    className={`p-2 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition-all ${acc.isActive
                        ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-2xs'
                        : 'hover:bg-white text-slate-700'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-full ${acc.avatarBg} text-white font-black text-[11px] flex items-center justify-center shrink-0`}>
                        {acc.avatarText}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs truncate font-bold text-slate-900">{acc.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{acc.role}</p>
                      </div>
                    </div>

                    {acc.isActive ? (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-[10px] text-blue-600 font-bold opacity-0 hover:opacity-100">
                        Chọn
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mục 3: Đăng xuất / Đăng nhập (ĐỔ XUỐNG TẠI VỊ TRÍ NÀY, KHÔNG HIỆN MODAL Ở GIỮA) */}
        <div className="py-0.5">
          {!isLoggedOut ? (
            /* Khi đang đăng nhập: Hiện nút Đăng xuất */
            <button
              onClick={handleLogoutClick}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer font-bold group"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center text-rose-600 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <span>Đăng xuất</span>
            </button>
          ) : (
            /* Khi đã bấm Đăng xuất: Hiển thị là Đăng nhập, nhấp vào sẽ đổ xuống form nhập mật khẩu */
            <div>
              <button
                onClick={handleLoginClick}
                className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer font-bold group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-colors">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-blue-700 block">Đăng nhập</span>
                    <span className="text-[11px] text-slate-400 font-normal">Nhấn để mở form đăng nhập</span>
                  </div>
                </div>

                <ChevronDown className={`w-4 h-4 text-blue-500 transition-transform duration-200 ${isLoginFormExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Form nhập tài khoản & mật khẩu ĐỔ XUỐNG NGAY TẠI VỊ TRÍ ĐĂNG NHẬP */}
              {isLoginFormExpanded && (
                <form
                  onSubmit={handleSubmitLogin}
                  className="p-3.5 bg-blue-50/50 border-t border-b border-blue-100 space-y-2.5 animate-fade-in-down"
                >
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Tài khoản / Email trường:
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="email@campus.edu.vn"
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Mật khẩu:
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-1"
                  >
                    <span>Đăng Nhập Trở Lại</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Footer nhỏ */}
      <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 text-[10px] text-slate-400 text-center">
        Phiên bản Smart Campus v2.4 • Đại Học 2026
      </div>
    </div>
  );
}
