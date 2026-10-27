import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Sparkles, Leaf, Wrench, ChevronRight, CheckCircle2 } from 'lucide-react';
import { mockCampusData } from '../../data/mockData';

export function AiRecommendations({ recommendations = mockCampusData.aiRecommendations, onExecute }) {
  const [executedIds, setExecutedIds] = React.useState({});

  const handleExecute = (id) => {
    setExecutedIds(prev => ({ ...prev, [id]: true }));
    onExecute?.(id);
  };

  return (
    <Card className="p-6 flex flex-col justify-between animate-fade-in-up stagger-5 interactive-card">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Gợi Ý Từ Nexus AI
              </h3>
              <Badge variant="ai" size="sm">Tối ưu tự động</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân tích từ API /api/ai/analize
            </p>
          </div>
        </div>

        {/* List of recommendations */}
        <div className="space-y-3 mt-4">
          {recommendations.map((rec) => {
            const isDone = executedIds[rec.id];
            const isEnergy = rec.category === 'Năng lượng';

            return (
              <div
                key={rec.id}
                onClick={() => !isDone && handleExecute(rec.id)}
                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
                  isDone 
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-purple-300 hover:shadow-xs hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isEnergy 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isEnergy ? (
                        <Leaf className="w-4 h-4" />
                      ) : (
                        <Wrench className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {rec.description}
                      </p>
                      <div className="mt-2">
                        <span className="inline-block text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                          {rec.benefit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pt-1">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-scale-in" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
