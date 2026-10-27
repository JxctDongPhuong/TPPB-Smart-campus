import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Sparkles, Leaf, Building2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { mockCampusData } from '../../data/mockData';

export function AiRecommendations({ recommendations = mockCampusData.aiRecommendations, onExecute }) {
  const [executedIds, setExecutedIds] = React.useState({});

  const handleExecute = (id) => {
    setExecutedIds(prev => ({ ...prev, [id]: true }));
    onExecute?.(id);
  };

  return (
    <Card className="p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Đề xuất thông minh
              </h3>
              <Badge variant="ai" size="sm">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>AI</span>
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Được phân tích tự động bởi Nexus AI Agent
            </p>
          </div>
        </div>

        {/* List of recommendations */}
        <div className="space-y-3 mt-4">
          {recommendations.map((rec) => {
            const isDone = executedIds[rec.id];
            return (
              <div
                key={rec.id}
                onClick={() => !isDone && handleExecute(rec.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                  isDone 
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-blue-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      rec.category === 'Năng lượng' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {rec.category === 'Năng lượng' ? (
                        <Leaf className="w-4 h-4" />
                      ) : (
                        <Building2 className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {rec.description}
                      </p>
                      <div className="mt-2">
                        <span className="inline-block text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          {rec.benefit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pt-1">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
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
