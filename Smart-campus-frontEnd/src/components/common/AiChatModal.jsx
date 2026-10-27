import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Bot, User, Wrench, Database, CheckCircle2, Cloud } from 'lucide-react';
import { campusApi } from '../../services/api';

export function AiChatModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ lý AI Điều Hành Smart Campus kết nối trực tiếp với hệ thống cơ sở dữ liệu. Tôi có thể giúp bạn tra cứu phòng trống, kiểm tra lịch học, phát hiện lãng phí điện năng và tiếp nhận báo hỏng thiết bị. Bạn cần hỗ trợ gì hôm nay?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');

    // Thêm tin nhắn của user vào danh sách
    const updatedMessages = [...messages, { sender: 'user', text: userMsg }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Gửi toàn bộ lịch sử trò chuyện cho AI để duy trì ngữ cảnh multi-turn
      const res = await campusApi.sendAiChat(userMsg, updatedMessages);
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'bot', 
          text: res.reply || 'Đã phân tích yêu cầu vận hành của bạn thành công!',
          action_taken: res.action_taken,
          data: res.data,
          model_used: res.model_used
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'bot', 
          text: 'Không thể kết nối đến máy chủ AI lúc này. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-xl flex flex-col h-[600px] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">AI Campus Copilot</h3>
                <span className="text-[10px] bg-emerald-500/80 px-2 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  Gemini 3.1 Live
                </span>
              </div>
              <p className="text-[11px] text-blue-100 flex items-center gap-1.5 mt-0.5">
                <Cloud className="w-3 h-3 text-blue-200" />
                <span>Kết nối trực tiếp Render Cloud API</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'bot' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              
              <div className={`max-w-[85%] space-y-2 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Tool execution badge nếu có */}
                {m.action_taken && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-lg text-[11px] text-amber-800 font-medium">
                    <Wrench className="w-3 h-3 text-amber-600" />
                    <span>Hành động AI: <strong>{m.action_taken}</strong></span>
                  </div>
                )}

                {/* Bong bóng tin nhắn */}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-sm'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {m.text}

                  {/* Hiển thị bảng tóm tắt nếu AI trả về dữ liệu danh sách */}
                  {Array.isArray(m.data) && m.data.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-600 overflow-x-auto">
                      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 mb-1">
                        <Database className="w-3 h-3" />
                        <span>Dữ liệu thực tế từ Database:</span>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/60 max-h-36 overflow-y-auto">
                        {m.data.map((item, itemIdx) => (
                          <div key={itemIdx} className="py-1 border-b border-slate-200/40 last:border-0 flex items-center justify-between">
                            <span className="font-semibold">{item.ma_phong || item.id || `Mục #${itemIdx + 1}`}</span>
                            <span className="text-slate-500">{item.loai_phong || item.tinh_trang || item.trang_thai || ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200/80 w-fit">
              <Bot className="w-4 h-4 text-purple-600 animate-spin" />
              <span>AI đang tra cứu cơ sở dữ liệu và phân tích ngữ cảnh...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 border-t border-slate-100 bg-white flex gap-2 overflow-x-auto text-[11px] select-none">
          <button
            onClick={() => setInput('Kiểm tra phòng học trống chiều nay')}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors shrink-0 font-medium cursor-pointer"
          >
            🔍 Tìm phòng trống chiều nay
          </button>
          <button
            onClick={() => setInput('Kiểm tra các phòng có dấu hiệu lãng phí điện')}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors shrink-0 font-medium cursor-pointer"
          >
            ⚡ Phát hiện lãng phí điện
          </button>
          <button
            onClick={() => setInput('Báo hỏng máy lạnh tại phòng A202')}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors shrink-0 font-medium cursor-pointer"
          >
            🛠️ Báo hỏng máy lạnh A202
          </button>
          <button
            onClick={() => setInput('Hôm nay có những phòng nào có lịch học?')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors shrink-0 font-medium cursor-pointer"
          >
            📅 Tra cứu lịch học hôm nay
          </button>
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200/80 bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi AI về phòng học, thiết bị, lãng phí điện năng..."
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
}
