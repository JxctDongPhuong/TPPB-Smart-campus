import React from 'react';
import { Search, Bell, RotateCw, Sparkles, Command } from 'lucide-react';

export function Header({ onSearch, onRefresh, isRefreshing, onOpenAiChat }) {
  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 font-medium">Smart Campus</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-semibold">Tổng quan</span>
      </div>

      {/* Center Search Input */}
      <div className="w-96 max-w-md relative hidden md:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm phòng, thiết bị, môn học..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full pl-10 pr-12 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-400">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* AI Copilot Quick Action */}
        <button
          onClick={onOpenAiChat}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Nexus AI</span>
        </button>

        {/* Refresh API Data */}
        <button
          onClick={onRefresh}
          title="Làm mới dữ liệu từ Backend"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-100">
          MT
        </div>
      </div>
    </header>
  );
}
