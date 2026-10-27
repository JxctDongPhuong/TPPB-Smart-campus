import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, CheckCircle2, AlertOctagon } from 'lucide-react';
import { Badge } from '../common/Badge';

export function AiInsightBanner({ alert, onApplyRecommendation }) {
  const [dismissed, setDismissed] = useState(false);
  const [applied, setApplied] = useState(false);

  if (dismissed || !alert) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-indigo-500/10 border border-amber-300/60 p-4 transition-all shadow-xs animate-fade-in-up hover:border-amber-400">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-500/20 animate-float-slow">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-900">
                {alert?.title || 'Phát hiện cơ hội tối ưu điện năng'}
              </span>
              <Badge variant="warning" size="sm">
                <AlertOctagon className="w-3 h-3 text-amber-600 inline mr-1" />
                {alert?.canh_bao || 'Cảnh báo lãng phí Idle Waste'}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {alert?.message || 'Hệ thống đối chiếu phát hiện phòng đang bật thiết bị nhưng không có lịch học trong LichPhong.'}
              {alert?.kwh_tieu_thu && (
                <span className="ml-2 font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded text-[11px]">
                  Tiêu thụ: {alert.kwh_tieu_thu} kWh
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {applied ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl animate-scale-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Đã gửi lệnh xử lý
            </span>
          ) : (
            <button
              onClick={() => {
                setApplied(true);
                onApplyRecommendation?.(alert);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 hover:shadow-md cursor-pointer"
            >
              <span>{alert?.actionText || 'Xử lý ngay'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            title="Đóng thông báo"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
