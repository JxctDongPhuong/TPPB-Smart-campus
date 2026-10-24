from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.database import get_session
from app.models import (
    LichPhongCreate, LichPhongRead,
    YeuCauMuonCreate, YeuCauMuonRead, YeuCauMuonDuyet
)
from app.service import bookingService

router = APIRouter(prefix="/booking", tags=["Lịch & Mượn Phòng"])

# ==================== LỊCH PHÒNG ====================

@router.get("/schedule", response_model=List[LichPhongRead], summary="Tra cứu lịch phòng theo ngày/phòng")
def get_schedules(
    ma_phong: Optional[str] = Query(None, description="Lọc theo phòng"),
    ngay: Optional[date] = Query(None, description="Lọc theo ngày (YYYY-MM-DD)"),
    session: Session = Depends(get_session)
):
    return bookingService.get_schedules(session, ma_phong=ma_phong, ngay=ngay)

@router.post("/schedule", response_model=LichPhongRead, status_code=status.HTTP_201_CREATED, summary="Thêm lịch học chính khóa")
def create_schedule(schedule_data: LichPhongCreate, session: Session = Depends(get_session)):
    return bookingService.create_schedule(session, schedule_data)

# ==================== YÊU CẦU MƯỢN PHÒNG ====================

@router.get("/requests", response_model=List[YeuCauMuonRead], summary="Lấy danh sách các đơn yêu cầu mượn phòng")
def get_booking_requests(
    trang_thai: Optional[str] = Query(None, description="ChoDuyet / DaDuyet / TuChoi / DaHuy"),
    session: Session = Depends(get_session)
):
    return bookingService.get_booking_requests(session, trang_thai=trang_thai)

@router.post("/requests", response_model=YeuCauMuonRead, status_code=status.HTTP_201_CREATED, summary="Sinh viên gửi yêu cầu mượn phòng")
def submit_booking_request(
    request_data: YeuCauMuonCreate,
    ma_tk_nguoi_gui: int = Query(..., description="Mã tài khoản sinh viên gửi"),
    session: Session = Depends(get_session)
):
    return bookingService.submit_booking_request(session, request_data, ma_tk_nguoi_gui)

@router.put("/requests/{ma_yc}/process", response_model=YeuCauMuonRead, summary="Admin xử lý duyệt hoặc từ chối đơn mượn")
def process_booking_request(
    ma_yc: int,
    action: YeuCauMuonDuyet,
    ma_tk_admin: int = Query(..., description="Mã tài khoản Admin duyệt"),
    session: Session = Depends(get_session)
):
    return bookingService.process_booking_request(session, ma_yc, action, ma_tk_admin)
