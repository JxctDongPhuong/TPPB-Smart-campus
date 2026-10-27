import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';

export function AiInsightBanner({ alert, onApplyRecommendation }) {
  const [dismissed, setDismissed] = useState(false);
  const [applied, setApplied] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/80 border border-blue-200/80 p-4 transition-all">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-900">
                {alert?.title || 'Nexus AI vừa phát hiện một cơ hội tiết kiệm'}
              </span>
              <Badge variant="ai" size="sm">Tối ưu tự động</Badge>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {alert?.message || '12 phòng tại Tòa B đang bật điều hòa nhưng không có lịch sử dụng trong 2 giờ tới.'}
              <span className="ml-2 font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[11px]">
                Dự kiến tiết kiệm: 182 kWh
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {applied ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              Đã gửi lệnh tắt
            </span>
          ) : (
            <button
              onClick={() => {
                setApplied(true);
                onApplyRecommendation?.(alert);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <span>Xem đề xuất & Áp dụng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
