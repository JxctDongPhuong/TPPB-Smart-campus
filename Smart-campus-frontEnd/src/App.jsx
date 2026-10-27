import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LiveStatusBar } from './components/dashboard/LiveStatusBar';
import { AiInsightBanner } from './components/dashboard/AiInsightBanner';
import { MetricCards } from './components/dashboard/MetricCards';
import { OccupancyChart } from './components/dashboard/OccupancyChart';
import { FloorPlanViewer } from './components/dashboard/FloorPlanViewer';
import { RoomDetailDrawer } from './components/dashboard/RoomDetailDrawer';
import { EnergyDonut } from './components/dashboard/EnergyDonut';
import { AiRecommendations } from './components/dashboard/AiRecommendations';
import { AlertsList } from './components/dashboard/AlertsList';
import { AiChatModal } from './components/common/AiChatModal';
import { campusApi } from './services/api';
import { mockCampusData } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(mockCampusData.summary);
  const [rooms, setRooms] = useState(mockCampusData.floorRooms);
  const [selectedRoomId, setSelectedRoomId] = useState('C101');
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(mockCampusData.selectedRoomDetail);
  const [wasteAlert, setWasteAlert] = useState(mockCampusData.aiWasteAlert);
  const [alerts, setAlerts] = useState(mockCampusData.recentAlerts);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial load & refresh handler
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [sumRes, roomsRes, wasteRes] = await Promise.all([
        campusApi.getSummary(),
        campusApi.getRooms('A', 1),
        campusApi.getWasteAlerts()
      ]);
      setSummary(sumRes);
      setRooms(roomsRes);
      if (wasteRes?.length) setWasteAlert(wasteRes[0]);
    } catch (e) {
      console.warn('API error or fallback:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle selecting a room on the floor plan
  const handleSelectRoom = async (roomId) => {
    setSelectedRoomId(roomId);
    const detail = await campusApi.getRoomDetail(roomId);
    setSelectedRoomDetail(detail);
  };

  // Filter rooms by search query if any
  const filteredRooms = searchQuery.trim()
    ? rooms.filter(r => 
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rooms;

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* 1. Left Fixed Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onSearch={setSearchQuery}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
          onOpenAiChat={() => setIsAiModalOpen(true)}
        />

        {/* Dashboard Scrollable Body */}
        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* A. Live Status & Greetings */}
          <LiveStatusBar 
            onExportReport={() => alert('Đang xuất báo cáo thống kê vận hành định dạng PDF/Excel...')} 
          />

          {/* B. Nexus AI Insight Banner */}
          <AiInsightBanner 
            alert={wasteAlert}
            onApplyRecommendation={() => {
              setSummary(prev => ({ ...prev, energyKWh: prev.energyKWh - 182 }));
              alert('Đã áp dụng kịch bản tối ưu điều hòa Tòa B! Tiết kiệm dự kiến 182 kWh.');
            }}
          />

          {/* C. 4 Key Telemetry Metric Cards */}
          <MetricCards summary={summary} />

          {/* D. Occupancy Telemetry Chart */}
          <OccupancyChart />

          {/* E. Interactive Blueprint Floor Plan & Room Detail Drawer */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-8">
              <FloorPlanViewer 
                rooms={filteredRooms}
                selectedRoomId={selectedRoomId}
                onSelectRoom={handleSelectRoom}
              />
            </div>
            <div className="xl:col-span-4">
              <RoomDetailDrawer 
                roomDetail={selectedRoomDetail}
                onToggleDevice={(devId) => console.log('Toggled IoT device:', devId)}
              />
            </div>
          </div>

          {/* F. Bottom 3 Analytical Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <EnergyDonut />
            <AiRecommendations 
              onExecute={(id) => alert(`Đã kích hoạt kịch bản điều khiển tự động: ${id}`)}
            />
            <AlertsList 
              alerts={alerts}
              onViewAll={() => alert('Mở danh sách toàn bộ phiếu báo hỏng và cảnh báo')}
            />
          </div>
        </main>
      </div>

      {/* 3. AI Copilot Chat Modal */}
      <AiChatModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
      />
    </div>
  );
}
