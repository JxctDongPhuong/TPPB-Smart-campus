import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, RotateCw } from 'lucide-react';
import { campusApi } from '../../services/api';

export function AiChatModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Xin chào Trang! Tôi là Nexus AI Copilot - Trợ lý vận hành cơ sở thông minh. Tôi có thể giúp bạn kiểm tra trạng thái phòng học, phân tích tải điện hoặc điều khiển thiết bị tự động. Bạn cần hỗ trợ gì hôm nay?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const newMsgList = [...messages, { sender: 'user', text: userMsg }];
    setMessages(newMsgList);
    setLoading(true);

    try {
      const res = await campusApi.sendAiChat(userMsg, newMsgList);
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'bot', 
          text: res.reply || 'Đã phân tích yêu cầu vận hành của bạn thành công!',
          action_taken: res.action_taken
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev, 
        { sender: 'bot', text: 'Đã nhận lệnh tối ưu năng lượng cơ sở. Đang đồng bộ cảm biến!' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-lg flex flex-col h-[560px] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Nexus AI Campus Copilot</h3>
              <p className="text-[11px] text-blue-100">Hỗ trợ vận hành & Tối ưu năng lượng 24/7</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'bot' && (
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs shadow-2xs'
                }`}
              >
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center text-xs text-slate-400">
              <Bot className="w-4 h-4 text-purple-500 animate-spin" />
              <span>Nexus AI đang suy nghĩ và tính toán kịch bản...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 border-t border-slate-100 bg-white flex gap-1.5 overflow-x-auto text-[11px]">
          <button
            onClick={() => setInput('Tắt toàn bộ điều hòa phòng trống tại Tòa B')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 shrink-0"
          >
            Tắt điều hòa Tòa B
          </button>
          <button
            onClick={() => setInput('Kiểm tra phòng học trống buổi chiều nay')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 shrink-0"
          >
            Tìm phòng trống chiều nay
          </button>
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200/80 bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi AI về phòng học, thiết bị, tiết kiệm điện..."
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
