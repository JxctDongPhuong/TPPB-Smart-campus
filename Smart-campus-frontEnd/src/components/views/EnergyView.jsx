import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Leaf, 
  ShieldAlert, 
  XCircle,
  BarChart2,
  DollarSign
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { campusApi } from '../../services/api';
import { mockCampusData } from '../../data/mockData';

export function EnergyView() {
  const [metrics, setMetrics] = useState([]);
  const [summary, setSummary] = useState(mockCampusData.summary);
  const [wasteAlerts, setWasteAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Tab lọc mốc thời gian cho biểu đồ đường: ngày | tuần | tháng | năm
  const [timeframe, setTimeframe] = useState('day'); // 'day' | 'week' | 'month' | 'year'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Dữ liệu tổng lượng điện năng sử dụng của TẤT CẢ các phòng theo ngày, tuần, tháng, năm
  const totalEnergySeries = {
    day: {
      title: 'Hôm nay (Theo các khung giờ trong ngày)',
      unit: 'kWh',
      total: '39.0',
      peak: { label: '14:00 (Đỉnh tải ca chiều)', value: 7.8 },
      avg: '4.3',
      points: [
        { label: '06:00', kwh: 1.2 },
        { label: '08:00', kwh: 4.8 },
        { label: '10:00', kwh: 6.9 },
        { label: '12:00', kwh: 3.1 },
        { label: '14:00', kwh: 7.8 },
        { label: '16:00', kwh: 6.4 },
        { label: '18:00', kwh: 4.5 },
        { label: '20:00', kwh: 2.8 },
        { label: '22:00', kwh: 1.5 }
      ]
    },
    week: {
      title: 'Tuần này (Từ Thứ 2 đến Chủ Nhật)',
      unit: 'kWh',
      total: '286.2',
      peak: { label: 'Thứ 4 (Nhiều ca thực hành)', value: 52.8 },
      avg: '40.9',
      points: [
        { label: 'Thứ 2', kwh: 42.5 },
        { label: 'Thứ 3', kwh: 48.0 },
        { label: 'Thứ 4', kwh: 52.8 },
        { label: 'Thứ 5', kwh: 45.4 },
        { label: 'Thứ 6', kwh: 49.5 },
        { label: 'Thứ 7', kwh: 30.2 },
        { label: 'Chủ Nhật', kwh: 17.8 }
      ]
    },
    month: {
      title: 'Tháng này (Theo 4 tuần trong tháng)',
      unit: 'kWh',
      total: '1,142.0',
      peak: { label: 'Tuần 3 (Tuần thi & thí nghiệm)', value: 318.5 },
      avg: '285.5',
      points: [
        { label: 'Tuần 1', kwh: 268.0 },
        { label: 'Tuần 2', kwh: 290.5 },
        { label: 'Tuần 3', kwh: 318.5 },
        { label: 'Tuần 4', kwh: 265.0 }
      ]
    },
    year: {
      title: 'Năm học 2026 (Theo 12 tháng)',
      unit: 'kWh',
      total: '13,750.0',
      peak: { label: 'Tháng 5 (Mùa nắng nóng)', value: 1490.0 },
      avg: '1,145.8',
      points: [
        { label: 'T1', kwh: 980 },
        { label: 'T2', kwh: 760 },
        { label: 'T3', kwh: 1120 },
        { label: 'T4', kwh: 1310 },
        { label: 'T5', kwh: 1490 },
        { label: 'T6', kwh: 1340 },
        { label: 'T7', kwh: 890 },
        { label: 'T8', kwh: 930 },
        { label: 'T9', kwh: 1250 },
        { label: 'T10', kwh: 1390 },
        { label: 'T11', kwh: 1210 },
        { label: 'T12', kwh: 1080 }
      ]
    }
  };

  const activeSeries = totalEnergySeries[timeframe];
  const maxKwh = Math.max(...activeSeries.points.map(p => p.kwh)) * 1.15 || 10;

  // Tính tọa độ SVG cho biểu đồ đường
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const pointsCoord = activeSeries.points.map((pt, idx) => {
    const x = paddingLeft + (idx / (activeSeries.points.length - 1)) * chartW;
    const y = paddingTop + chartH - (pt.kwh / maxKwh) * chartH;
    return { ...pt, x, y };
  });

  // Tạo đường dẫn cong Bezier mượt mà
  const linePathD = pointsCoord.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[idx - 1];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }, '');

  // Vùng diện tích gradient phía dưới đường
  const areaPathD = `${linePathD} L ${pointsCoord[pointsCoord.length - 1].x} ${paddingTop + chartH} L ${pointsCoord[0].x} ${paddingTop + chartH} Z`;

  const [metricForm, setMetricForm] = useState({
    ma_phong: 'A101',
    ngay: new Date().toISOString().split('T')[0],
    kwh: 10.5,
    so_gio_bat: 4.0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsRes, sumRes, wasteRes] = await Promise.all([
        campusApi.getEnergyMetricsList(),
        campusApi.getSummary(),
        campusApi.getWasteAlerts()
      ]);
      setMetrics(metricsRes?.length ? metricsRes : mockCampusData.allEnergyMetrics);
      if (sumRes) setSummary(sumRes);
      setWasteAlerts(wasteRes?.length ? wasteRes : [mockCampusData.aiWasteAlert]);
    } catch {
      setMetrics(mockCampusData.allEnergyMetrics);
      setWasteAlerts([mockCampusData.aiWasteAlert]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Ghi nhận chỉ số điện năng thủ công
  const handleRecordMetric = async (e) => {
    e.preventDefault();
    const newMetric = await campusApi.recordEnergyMetric({
      ...metricForm,
      kwh: Number(metricForm.kwh),
      so_gio_bat: Number(metricForm.so_gio_bat)
    });

    setMetrics(prev => [newMetric, ...prev]);
    setIsRecordModalOpen(false);
    alert(`Đã ghi nhận chỉ số điện năng cho phòng ${metricForm.ma_phong} thành công!`);
  };

  // Tắt điện khẩn cấp phòng lãng phí
  const handleCutPower = (maPhong) => {
    alert(`Đã gửi lệnh ngắt điện khẩn cấp đến phòng ${maPhong}! Tiết kiệm ước tính ~8.5 kWh.`);
    setWasteAlerts(prev => prev.filter(w => w.ma_phong !== maPhong));
  };

  const totalKwh = metrics.reduce((acc, m) => acc + (m.kwh || 0), 0);
  const totalCostVnd = Math.round(totalKwh * 2500); // 2,500đ/kWh

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Hệ thống Giám sát Điện năng DienNang</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Giám sát điện</h1>
          <p className="text-xs text-slate-500 mt-1">
            Phân tích số liệu tiêu thụ kWh theo ngày, phát hiện lãng phí ngoài giờ học (Idle Waste) bằng thuật toán thông minh.
          </p>
        </div>

        <Button 
          variant="primary" 
          icon={Plus} 
          onClick={() => setIsRecordModalOpen(true)}
          className="text-xs shadow-md shadow-blue-500/20"
        >
          Ghi Nhận Chỉ Số Điện
        </Button>
      </div>

      {/* 2. Nexus AI Idle Waste Warning Banner */}
      {wasteAlerts.length > 0 && (
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 shadow-xs animate-fade-in-down">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-500/20">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">
                    Cảnh Báo Idle Waste
                  </span>
                  <span className="text-xs font-bold text-amber-900">Phát hiện tiêu thụ điện ngoài giờ</span>
                </div>
                <h4 className="text-sm font-black text-slate-900 mt-1">
                  {wasteAlerts[0].title || `Phát hiện lãng phí điện năng tại Phòng ${wasteAlerts[0].ma_phong}`}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
                  {wasteAlerts[0].message || `Phòng ${wasteAlerts[0].ma_phong} không có lịch trong LichPhong nhưng phát sinh tiêu thụ điện bất thường (${wasteAlerts[0].kwh_tieu_thu || 8.5} kWh).`}
                </p>
              </div>
            </div>

            <Button 
              size="sm" 
              variant="primary"
              onClick={() => handleCutPower(wasteAlerts[0].ma_phong || 'B302')}
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm shrink-0 font-bold"
            >
              Ngắt Nguồn Phòng {wasteAlerts[0].ma_phong || 'B302'}
            </Button>
          </div>
        </div>
      )}

      {/* 3. KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-white to-blue-50/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">Tổng điện năng hôm nay</p>
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2">{summary.totalKWh || 39.0} <span className="text-sm font-semibold text-slate-500">kWh</span></p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Giảm 12.4% so với tuần trước
          </span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">Trung bình mỗi phòng</p>
            <BarChart2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{summary.averageKWhPerRoom || 13.0} <span className="text-sm font-semibold text-slate-500">kWh</span></p>
          <span className="text-[10px] text-emerald-600 font-medium">Đạt chuẩn Green Campus</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">Điện lãng phí (Idle)</p>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">8.5 <span className="text-sm font-semibold text-slate-500">kWh</span></p>
          <span className="text-[10px] text-amber-600 font-medium">Chiếm ~21% tổng tiêu thụ</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-purple-50/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">Chi phí tạm tính</p>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700 mt-2">{totalCostVnd.toLocaleString('vi-VN')} <span className="text-sm font-semibold text-slate-500">VNĐ</span></p>
          <span className="text-[10px] text-purple-600 font-medium">Đơn giá điện trường học</span>
        </Card>
      </div>

      {/* 4. Biểu Đồ Dạng Đường (Line Chart) Tổng Lượng Sử Dụng Điện Năng Tất Cả Các Phòng Theo Ngày / Tuần / Tháng / Năm */}
      <Card className="p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Biểu Đồ Tiêu Thụ Điện Năng Toàn Trường (Line Chart)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeSeries.title} • Tổng cộng tất cả các phòng học
            </p>
          </div>

          {/* Các nút bấm chuyển đổi Ngày / Tuần / Tháng / Năm */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto select-none">
            {[
              { key: 'day', label: 'Ngày' },
              { key: 'week', label: 'Tuần' },
              { key: 'month', label: 'Tháng' },
              { key: 'year', label: 'Năm' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setTimeframe(tab.key);
                  setHoveredPoint(null);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  timeframe === tab.key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Thanh thông số nhanh của mốc thời gian đã chọn */}
        <div className="flex flex-wrap items-center gap-4 pt-3 pb-2 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span>Tổng điện năng:</span>
            <strong className="text-blue-700 font-black text-sm">{activeSeries.total} {activeSeries.unit}</strong>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span>Đỉnh tải cao nhất:</span>
            <span className="font-bold text-amber-600">{activeSeries.peak.value} {activeSeries.unit} ({activeSeries.peak.label})</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span>Mức trung bình:</span>
            <strong className="text-slate-900 font-bold">{activeSeries.avg} {activeSeries.unit}</strong>
          </div>
        </div>

        {/* Khung Biểu Đồ Dạng Đường SVG Responsive */}
        <div className="relative mt-2 w-full overflow-x-auto">
          <div className="min-w-[650px] relative">
            
            {/* Tooltip khi rê chuột vào điểm */}
            {hoveredPoint && (
              <div 
                className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-xl shadow-xl flex flex-col items-center animate-fade-in-down"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${hoveredPoint.y}px`
                }}
              >
                <span className="text-slate-400 font-normal">{hoveredPoint.label}</span>
                <span className="text-blue-300 font-black text-xs">{hoveredPoint.kwh} {activeSeries.unit}</span>
                <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1"></div>
              </div>
            )}

            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-56 select-none"
            >
              <defs>
                {/* Gradient diện tích dưới đường */}
                <linearGradient id="energyLineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
                </linearGradient>

                {/* Gradient cho nét đường */}
                <linearGradient id="lineStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>

              {/* Đường lưới ngang (Grid Lines) */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const yPos = paddingTop + chartH * (1 - pct);
                const valLabel = Math.round(maxKwh * pct);
                return (
                  <g key={idx}>
                    <line 
                      x1={paddingLeft} 
                      y1={yPos} 
                      x2={svgWidth - paddingRight} 
                      y2={yPos} 
                      stroke="#e2e8f0" 
                      strokeDasharray="4 4" 
                      strokeWidth="1" 
                    />
                    <text 
                      x={paddingLeft - 8} 
                      y={yPos + 4} 
                      textAnchor="end" 
                      className="text-[10px] fill-slate-400 font-mono font-bold"
                    >
                      {valLabel}
                    </text>
                  </g>
                );
              })}

              {/* Vùng diện tích mờ (Area Under Curve) */}
              <path 
                d={areaPathD} 
                fill="url(#energyLineGrad)" 
                className="transition-all duration-500 ease-out"
              />

              {/* Đường biểu đồ (Curve Stroke) */}
              <path 
                d={linePathD} 
                fill="none" 
                stroke="url(#lineStrokeGrad)" 
                strokeWidth="3.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="transition-all duration-500 ease-out filter drop-shadow-xs"
              />

              {/* Các điểm nút (Nodes) & Nhãn trục hoành */}
              {pointsCoord.map((pt, idx) => {
                const isHovered = hoveredPoint?.label === pt.label;
                return (
                  <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
                    {/* Đường gióng dọc khi hover */}
                    {isHovered && (
                      <line 
                        x1={pt.x} 
                        y1={paddingTop} 
                        x2={pt.x} 
                        y2={paddingTop + chartH} 
                        stroke="#3b82f6" 
                        strokeDasharray="2 2" 
                        strokeWidth="1.5" 
                      />
                    )}

                    {/* Vòng tròn điểm */}
                    <circle 
                      cx={pt.x} 
                      cy={pt.y} 
                      r={isHovered ? 6.5 : 4} 
                      className={`transition-all duration-150 ${
                        isHovered 
                          ? 'fill-white stroke-blue-600 stroke-[3.5]' 
                          : 'fill-white stroke-blue-600 stroke-[2.5]'
                      }`}
                    />

                    {/* Nhãn trục thời gian bên dưới */}
                    <text 
                      x={pt.x} 
                      y={svgHeight - 10} 
                      textAnchor="middle" 
                      className={`text-[11px] font-bold transition-colors ${
                        isHovered ? 'fill-blue-600 font-black' : 'fill-slate-500'
                      }`}
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </Card>

      {/* 5. Energy Consumption Table per Room (ĐÃ XÓA Ô VUÔNG SỐ PHÒNG THEO HÌNH 3) */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-slate-50/60">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Chi Tiết Tiêu Thụ Điện Theo Phòng (Bảng DienNang)</h3>
            <p className="text-xs text-slate-500">Đối chiếu trực tiếp với lịch học thực tế để phát hiện phòng bất thường</p>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-[11px] font-bold text-slate-500 uppercase">
                <th className="p-4">Phòng học</th>
                <th className="p-4">Ngày ghi nhận</th>
                <th className="p-4">Điện năng (kWh)</th>
                <th className="p-4">Số giờ hoạt động</th>
                <th className="p-4">Đối chiếu LichPhong</th>
                <th className="p-4">Đánh giá AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {metrics.map((m, idx) => {
                const isWaste = m.isWaste || (m.kwh > 5 && !m.co_lich);

                return (
                  <tr key={idx} className={`hover:bg-slate-50/70 transition-colors ${isWaste ? 'bg-amber-50/30' : ''}`}>
                    {/* Cột Phòng học: ĐÃ BỎ Ô VUÔNG NHỎ CHỨA SỐ PHÒNG THEO YÊU CẦU HÌNH 3 */}
                    <td className="p-4 font-bold text-slate-900">
                      <span>Phòng {m.ma_phong}</span>
                    </td>

                    <td className="p-4 text-slate-600 font-mono">
                      {m.ngay}
                    </td>

                    <td className="p-4 font-extrabold text-slate-900">
                      <span className={m.kwh > 15 ? 'text-blue-700' : isWaste ? 'text-amber-700 font-black' : 'text-slate-800'}>
                        {m.kwh} kWh
                      </span>
                    </td>

                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.so_gio_bat || 0} giờ</span>
                      </div>
                    </td>

                    <td className="p-4">
                      {m.co_lich ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          <CheckCircle2 className="w-3 h-3" /> Có lịch học
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Không có lịch
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {isWaste ? (
                        <Badge variant="warning" size="sm" className="font-bold">
                          ⚠️ Cảnh báo lãng phí (Idle Waste)
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          {m.danh_gia || 'Hợp lý'}
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 6. Modal Ghi Nhận Chỉ Số Điện Năng */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-base text-slate-900">Ghi Nhận Chỉ Số Điện Tiêu Thụ</h3>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordMetric} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Chọn phòng học</label>
                <select 
                  value={metricForm.ma_phong}
                  onChange={(e) => setMetricForm(prev => ({ ...prev, ma_phong: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold"
                >
                  <option value="A101">Phòng A101</option>
                  <option value="A102">Phòng A102</option>
                  <option value="A201">Phòng A201</option>
                  <option value="A202">Phòng A202</option>
                  <option value="B301">Phòng B301</option>
                  <option value="B302">Phòng B302</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ngày ghi nhận</label>
                <input 
                  type="date" 
                  required
                  value={metricForm.ngay}
                  onChange={(e) => setMetricForm(prev => ({ ...prev, ngay: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Điện năng tiêu thụ (kWh)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0"
                  required
                  value={metricForm.kwh}
                  onChange={(e) => setMetricForm(prev => ({ ...prev, kwh: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Số giờ hoạt động</label>
                <input 
                  type="number" 
                  step="0.5" 
                  min="0"
                  max="24"
                  required
                  value={metricForm.so_gio_bat}
                  onChange={(e) => setMetricForm(prev => ({ ...prev, so_gio_bat: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setIsRecordModalOpen(false)}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit">
                  Lưu Chỉ Số
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
