import os
import json
import threading
from datetime import date, datetime
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
from sqlmodel import Session, select, func

from google import genai
from google.genai import types

from app.models import (
    Phong, LichPhong, DienNang, ThietBi, PhieuBaoHong, YeuCauMuon
)
from app.service.metricService import detect_waste_energy, get_energy_summary

# Nạp biến môi trường từ .env
load_dotenv()

# Danh sách các model hỗ trợ với ưu tiên hàng đầu theo yêu cầu
SUPPORTED_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
]

# PROMPT TỐI ƯU: TRẢ LỜI NGẮN GỌN, HỎI GÌ ĐÁP ĐẤY, KHÔNG RƯỜM RÀ
CAMPUS_SYSTEM_PROMPT = """
Bạn là Trợ lý AI Điều Hành Smart Campus trường đại học.
QUY TẮC PHẢN HỒI BẮT BUỘC (TUÂN THỦ 100%):
1. TRẢ LỜI NGẮN GỌN, TRỰC DIỆN, ĐI THẲNG VÀO VẤN ĐỀ:
   - TUYỆT ĐỐI KHÔNG chào hỏi rườm rà (Bỏ toàn bộ các câu: "Chào bạn, tôi là trợ lý... rất vui được hỗ trợ...").
   - TUYỆT ĐỐI KHÔNG lặp lại câu hỏi của người dùng ("Bạn đang tìm kiếm...", "Dựa trên dữ liệu...").
   - TUYỆT ĐỐI KHÔNG chia mục phân tích dài dòng (Cấm viết kiểu: "1. Phân tích yêu cầu", "2. Kết quả kiểm tra", "3. Hướng dẫn tiếp theo").
2. HỎI ĐÂU ĐÁP ĐÓ (Chỉ từ 1 đến 3 câu ngắn gọn):
   - Hỏi tìm phòng trống: Báo ngay danh sách phòng trống kèm mã phòng, loại phòng và sức chứa.
     Ví dụ: "Hiện tại Ca 3 có phòng máy tính A203 (45 máy) và A204 (40 máy) đang trống. Bạn có muốn tạo đơn mượn không?"
   - Nếu chưa có phòng hoặc thiếu dữ liệu: Nói thẳng ngắn gọn: "Hiện tại hệ thống chưa ghi nhận phòng trống nào đáp ứng yêu cầu của bạn. Bạn vui lòng liên hệ Ban quản lý cơ sở vật chất."
   - Hỏi về điện năng: Trả lời ngay số phòng lãng phí và mức tiêu thụ (kWh).
3. ĐỐI VỚI HỘI THOẠI NHIỀU LƯỢT (MULTI-TURN):
   - Phải ghi nhớ ngữ cảnh câu hỏi trước đó để trả lời liền mạch, tự nhiên và súc tích.
4. Căn cứ đúng [DỮ LIỆU THỰC TẾ CAMPUS] được cung cấp. Không tự bịa đặt thông tin.
"""

def build_campus_context_from_db(session: Session) -> str:
    """
    Truy vấn trực tiếp Database SQLite để đóng gói toàn bộ dữ liệu cơ sở vật chất.
    Hàm này chỉ được chạy 1 LẦN khi nạp cache (Lazy Loading), không bị gọi lặp lại.
    """
    today = date.today()
    
    # 1. Danh sách phòng
    rooms = session.exec(select(Phong).where(Phong.da_xoa == False)).all()
    room_summary = []
    for r in rooms:
        room_summary.append(
            f"- Phòng {r.ma_phong} ({r.ten_phong}): {r.loai_phong}, Tòa {r.toa} Tầng {r.tang}, {r.suc_chua} chỗ, trạng thái: {r.trang_thai}"
        )
    rooms_text = "\n".join(room_summary) if room_summary else "Chưa có dữ liệu phòng học trong hệ thống."

    # 2. Lịch phòng hôm nay và sắp tới
    schedules = session.exec(
        select(LichPhong).where(LichPhong.ngay >= today).order_by(LichPhong.ngay, LichPhong.ca)
    ).all()
    schedule_summary = []
    for s in schedules:
        schedule_summary.append(
            f"- Ngày {s.ngay}: Phòng {s.ma_phong} có lịch Ca {s.ca} (Môn: {s.ten_mon_hoc})"
        )
    schedules_text = "\n".join(schedule_summary) if schedule_summary else "Hôm nay không có lịch học nào được xếp."

    # 3. Phân tích điện năng & Idle Waste hôm nay
    waste_data = detect_waste_energy(session, today)
    energy_summary = get_energy_summary(session)
    
    waste_text = f"Số phòng nghi vấn lãng phí điện: {waste_data['tong_so_phong_lang_phi']}"
    if waste_data["danh_sach_canh_bao"]:
        for w in waste_data["danh_sach_canh_bao"]:
            waste_text += f", Phòng {w['ma_phong']} ({w['kwh_tieu_thu']} kWh - không ca học)"

    # 4. Phiếu báo hỏng thiết bị đang xử lý
    pending_tickets = session.exec(
        select(PhieuBaoHong).where(PhieuBaoHong.trang_thai != "Đã xử lý")
    ).all()
    tickets_summary = [f"Phòng/TB #{t.ma_tb}: {t.mo_ta_loi}" for t in pending_tickets]
    tickets_text = "; ".join(tickets_summary) if tickets_summary else "Không có thiết bị báo hỏng tồn đọng."

    return f"""
[DỮ LIỆU CAMPUS THỜI ĐIỂM {datetime.now().strftime('%H:%M %d/%m/%Y')}]:
- PHÒNG HỌC:
{rooms_text}
- LỊCH HỌC:
{schedules_text}
- TIÊU THỤ ĐIỆN & LÃNG PHÍ: {waste_text}. Tổng điện: {energy_summary['tong_kwh']} kWh.
- BÁO HỎNG: {tickets_text}
"""


# =====================================================================
# BỘ NHỚ ĐỆM LAZY LOADING (Thread-Safe In-Memory Cache)
# Đảm bảo an toàn đa luồng (Fix 4) & Không bị lặp query DB
# =====================================================================

class CampusContextCache:
    def __init__(self, ttl_seconds: int = 600):
        self.ttl_seconds = ttl_seconds
        self.cached_context: Optional[str] = None
        self.last_loaded_at: Optional[datetime] = None
        self._lock = threading.Lock()

    def is_valid(self) -> bool:
        if self.cached_context is None or self.last_loaded_at is None:
            return False
        elapsed = (datetime.now() - self.last_loaded_at).total_seconds()
        return elapsed < self.ttl_seconds

    def invalidate(self):
        """Xóa cache an toàn khi có sự kiện đặt phòng, duyệt phòng, sửa phòng (Fix 2)"""
        with self._lock:
            self.cached_context = None
            self.last_loaded_at = None
            print("[Cache Hook] Da xoa cache CampusContext. Luot chat tiep theo se nap lai du lieu.")

    def get_or_load(self, session: Session, force_reload: bool = False) -> tuple[str, bool]:
        """
        Thread-safe Double Checked Locking:
        - Lần đầu tiên gọi: Thực hiện nạp DB vào RAM.
        - Các lần gọi tiếp theo: Trả về dữ liệu ngay từ RAM (0ms, không query DB).
        """
        if not force_reload and self.is_valid():
            return self.cached_context, False

        with self._lock:
            # Double check tránh race condition khi nhiều luồng cùng gọi (Fix 4)
            if not force_reload and self.is_valid():
                return self.cached_context, False

            print("[Lazy Loading] Dang doc du lieu tu Database vao bo nho dem RAM...")
            self.cached_context = build_campus_context_from_db(session)
            self.last_loaded_at = datetime.now()
            print("[Lazy Loading] Da nap xong toan bo du lieu Campus vao RAM!")
            return self.cached_context, True


# Tạo đối tượng cache duy nhất (Singleton)
campus_cache = CampusContextCache(ttl_seconds=600)


def refresh_campus_cache(session: Session) -> str:
    """Chủ động làm mới dữ liệu cache"""
    ctx, _ = campus_cache.get_or_load(session, force_reload=True)
    return ctx


def call_gemini(
    contents: List[Any],
    system_instruction: str = CAMPUS_SYSTEM_PROMPT,
    requested_model: str = "gemini-3.1-flash-lite"
) -> tuple[str, str]:
    """
    Gọi Gemini API qua google-genai SDK hỗ trợ Multi-turn chat contents và fallback linh hoạt.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return (
            "Chưa cấu hình GEMINI_API_KEY trong file .env.",
            "none"
        )

    client = genai.Client(api_key=api_key)
    candidates = [requested_model] + [m for m in SUPPORTED_MODELS if m != requested_model]
    
    last_error = None
    for model_name in candidates:
        try:
            print(f"[Gemini API] Dang gui request toi model: {model_name}...")
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.2, # Nhiệt độ thấp để trả lời ngắn gọn, chuẩn xác
                ),
            )
            if response and response.text:
                print(f"[Gemini API] Goi thanh cong! Nhan ket qua tu model: {model_name}")
                return response.text.strip(), model_name
        except Exception as e:
            print(f"[Gemini API] Model {model_name} gap loi: {e}. Chuyen sang model tiep theo...")
            last_error = e
            continue

    return (
        f"Không thể kết nối AI lúc này: {str(last_error)}",
        "error"
    )


def handle_chat(
    session: Session,
    message: str,
    history: Optional[List[Dict[str, str]]] = None,
    user_id: Optional[int] = None,
    model_name: Optional[str] = "gemini-3.1-flash-lite"
) -> Dict[str, Any]:
    """
    Xử lý câu hỏi với Multi-turn Chat History (Fix 1), Lazy Loading Cache (Fix 4),
    và câu trả lời siêu súc tích trực diện.
    """
    model_to_use = model_name or "gemini-3.1-flash-lite"
    
    # 1. Lấy context dữ liệu qua Thread-safe Lazy Loading Cache
    context, was_lazy_loaded = campus_cache.get_or_load(session)

    # 2. Xây dựng danh sách Contents cho Gemini hỗ trợ Chat History
    gemini_contents = []

    # Nạp lịch sử hội thoại trước đó nếu có (Fix 1)
    if history:
        for item in history:
            role = "model" if item.get("role") in ["assistant", "model"] else "user"
            content_text = item.get("content", "")
            if content_text:
                gemini_contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=content_text)]
                    )
                )

    # Tin nhắn hiện tại kèm Context trường học
    current_message_text = f"""{context}

---
CÂU HỎI HIỆN TẠI CỦA NGƯỜI DÙNG:
"{message}"

(Yêu cầu: Trả lời trực diện, đúng trọng tâm, siêu ngắn gọn trong 1-3 câu, không chào hỏi, không chia mục dài dòng)."""

    gemini_contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=current_message_text)]
        )
    )

    # 3. Gọi Gemini API
    reply, actual_model = call_gemini(
        contents=gemini_contents,
        system_instruction=CAMPUS_SYSTEM_PROMPT,
        requested_model=model_to_use
    )

    # 4. Phân loại hành động
    cau_hoi = message.lower()
    if any(k in cau_hoi for k in ["phòng trống", "mượn phòng", "tìm phòng"]):
        action = "room_availability_check"
    elif any(k in cau_hoi for k in ["điện", "tiết kiệm", "lãng phí", "kwh"]):
        action = "energy_waste_consulting"
    elif any(k in cau_hoi for k in ["hỏng", "sửa", "bảo trì", "thiết bị"]):
        action = "device_maintenance_inquiry"
    else:
        action = "smart_campus_consulting"

    return {
        "reply": reply,
        "action_taken": action,
        "model_used": actual_model,
        "data_source": "lazy_loaded_from_db" if was_lazy_loaded else "memory_cache"
    }


def get_ai_suggestions(
    session: Session,
    model_name: Optional[str] = "gemini-3.1-flash-lite"
) -> Dict[str, Any]:
    """
    AI phân tích tối ưu điện năng dạng JSON có cấu trúc.
    """
    today = date.today()
    waste_info = detect_waste_energy(session, today)
    energy_summary = get_energy_summary(session)

    prompt = f"""
Số liệu điện năng Smart Campus hôm nay ({today}):
- Cảnh báo lãng phí: {json.dumps(waste_info['danh_sach_canh_bao'], ensure_ascii=False)}
- Tổng hợp điện năng: {json.dumps(energy_summary, ensure_ascii=False)}

Yêu cầu:
Giả sử giá điện là 2.500 VNĐ / kWh, trả về JSON duy nhất (không bọc markdown):
{{
  "summary": "Tóm tắt ngắn gọn trong 1 câu",
  "total_wasted_kwh": <số>,
  "estimated_wasted_vnd": <số>,
  "suggestions": [
    {{
      "id": 1,
      "title": "Tiêu đề đề xuất",
      "description": "Mô tả ngắn",
      "potential_savings_kwh": <số>,
      "priority": "Cao" hoặc "Trung bình" hoặc "Thấp",
      "recommended_action": "Hành động ngắn"
    }}
  ],
  "policy_advice": "Khuyến nghị chính sách ngắn"
}}
"""

    model_to_use = model_name or "gemini-3.1-flash-lite"
    raw_response, actual_model = call_gemini(
        contents=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])],
        system_instruction="Chỉ trả về JSON thuần túy, không có text dẫn nhập.",
        requested_model=model_to_use
    )

    try:
        clean_text = raw_response.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()
        
        parsed = json.loads(clean_text)
        parsed["model_used"] = actual_model
        return parsed
    except Exception:
        return {
            "summary": f"Phân tích năng lượng ngày {today}",
            "ai_analysis": raw_response,
            "waste_detection_raw": waste_info,
            "model_used": actual_model
        }
