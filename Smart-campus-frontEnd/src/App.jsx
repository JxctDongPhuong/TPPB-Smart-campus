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
import { RoomsView } from './components/views/RoomsView';
import { ScheduleView } from './components/views/ScheduleView';
import { DevicesView } from './components/views/DevicesView';
import { EnergyView } from './components/views/EnergyView';
import { TicketsView } from './components/views/TicketsView';
import { RoomPlanView } from './components/views/RoomPlanView';
import { campusApi } from './services/api';
import { mockCampusData } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('rooms');
  const [summary, setSummary] = useState(mockCampusData.summary);
  const [rooms, setRooms] = useState(mockCampusData.floorRooms);
  const [selectedRoomId, setSelectedRoomId] = useState('A101');
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(mockCampusData.floorRooms[0]);
  const [wasteAlert, setWasteAlert] = useState(mockCampusData.aiWasteAlert);
  const [alerts, setAlerts] = useState(mockCampusData.recentAlerts);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Initial load & refresh handler from Backend
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [sumRes, roomsRes, wasteRes, alertsRes] = await Promise.all([
        campusApi.getSummary(),
        campusApi.getRooms('A', 1),
        campusApi.getWasteAlerts(),
        campusApi.getAlerts()
      ]);
      if (sumRes) setSummary(sumRes);
      if (roomsRes?.length) setRooms(roomsRes);
      if (wasteRes?.length) setWasteAlert(wasteRes[0]);
      if (alertsRes?.length) setAlerts(alertsRes);
    } catch (e) {
      console.warn('API error or fallback:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    loadData();
    handleSelectRoom('A101');
  }, []);

  // Handle selecting a room on the floor plan
  const handleSelectRoom = async (roomId) => {
    setSelectedRoomId(roomId);
    
    // Find base room object from state or mock
    const baseRoom = rooms.find(r => (r.ma_phong || r.id) === roomId) || mockCampusData.floorRooms.find(r => r.ma_phong === roomId);
    
    try {
      const [devices, schedule, metric] = await Promise.all([
        campusApi.getRoomDevices(roomId),
        campusApi.getRoomSchedule(roomId),
        campusApi.getRoomMetrics(roomId)
      ]);

      setSelectedRoomDetail({
        ...baseRoom,
        devices: devices || mockCampusData.devicesByRoom[roomId] || [],
        currentSchedule: schedule || baseRoom?.currentSchedule || mockCampusData.schedulesByRoom[roomId] || null,
        kwh: metric?.kwh !== undefined ? metric.kwh : baseRoom?.kwh || 0.0
      });
    } catch (err) {
      setSelectedRoomDetail({
        ...baseRoom,
        devices: mockCampusData.devicesByRoom[roomId] || []
      });
    }
  };

  // Filter rooms by search query
  const filteredRooms = searchQuery.trim()
    ? rooms.filter(r => {
        const id = (r.ma_phong || r.id || '').toLowerCase();
        const loai = (r.loai_phong || r.type || '').toLowerCase();
        const mon = (r.currentSchedule?.ten_mon_hoc || r.subject || '').toLowerCase();
        const q = searchQuery.toLowerCase();
        return id.includes(q) || loai.includes(q) || mon.includes(q);
      })
    : rooms;

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Left Responsive Sidebar (Slide-over on mobile, fixed on desktop) */}
      <Sidebar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onSearch={setSearchQuery}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
          onOpenAiChat={() => setIsAiModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        {/* Dynamic Body Content by Active Tab with Responsive Padding */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1680px] w-full mx-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* A. Live Status & Operational Context */}
              <LiveStatusBar 
                onExportReport={() => alert('Đang trích xuất báo cáo vận hành phòng học & năng lượng theo chuẩn SQLite...')} 
              />

              {/* B. Nexus AI Insight Banner: Idle Waste Alert */}
              <AiInsightBanner 
                alert={wasteAlert}
                onApplyRecommendation={() => {
                  alert('Đã gửi tín hiệu ngắt nguồn tự động đến phòng B302! Dự kiến tiết kiệm 8.5 kWh.');
                  setSummary(prev => ({ ...prev, wasteAlertsCount: 0 }));
                }}
              />

              {/* C. 4 Key Metric Cards (Synchronized with Backend Models) */}
              <MetricCards summary={summary} />

              {/* D. Room Energy & Schedule Telemetry Chart */}
              <OccupancyChart />

              {/* E. Architectural Floor Plan & Room Detail Drawer */}
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
                    onToggleDevice={(devId) => console.log('Toggled device:', devId)}
                  />
                </div>
              </div>

              {/* F. Analytical Widgets: Real Breakdown, AI Suggestions & Reports */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <EnergyDonut />
                <AiRecommendations 
                  onExecute={(id) => alert(`Đã kích hoạt kịch bản điều khiển từ AI: ${id}`)}
                />
                <AlertsList 
                  alerts={alerts}
                  onViewAll={() => setActiveTab('tickets')}
                />
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <RoomsView 
              onNavigateToTickets={() => setActiveTab('tickets')}
            />
          )}

          {activeTab === 'room-plan' && (
            <RoomPlanView 
              roomId={selectedRoomId}
              rooms={rooms}
              roomDetail={selectedRoomDetail}
              onSelectRoom={(rId) => handleSelectRoom(rId)}
              onBack={() => setActiveTab('rooms')}
              onNavigateToTickets={() => setActiveTab('tickets')}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView />
          )}

          {activeTab === 'devices' && (
            <DevicesView 
              onNavigateToTickets={() => setActiveTab('tickets')}
            />
          )}

          {activeTab === 'energy' && (
            <EnergyView />
          )}

          {activeTab === 'tickets' && (
            <TicketsView />
          )}
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
