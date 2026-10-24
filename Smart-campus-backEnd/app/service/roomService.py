from typing import List, Optional
from fastapi import HTTPException, status
from sqlmodel import Session, select
from datetime import datetime

from app.models import (
    Phong, PhongCreate, PhongUpdate,
    ThietBi, ThietBiCreate, ThietBiCreateBatch,
    PhieuBaoHong, PhieuBaoHongCreate, PhieuBaoHongUpdate
)

# ==================== PHÒNG HỌC ====================

def get_rooms(
    session: Session,
    ma_cs: Optional[str] = None,
    toa: Optional[str] = None,
    tang: Optional[int] = None,
    loai_phong: Optional[str] = None
) -> List[Phong]:
    query = select(Phong).where(Phong.da_xoa == False)
    if ma_cs:
        query = query.where(Phong.ma_cs == ma_cs)
    if toa:
        query = query.where(Phong.toa == toa)
    if tang is not None:
        query = query.where(Phong.tang == tang)
    if loai_phong:
        query = query.where(Phong.loai_phong == loai_phong)
    return session.exec(query).all()

def get_room_by_id(session: Session, ma_phong: str) -> Phong:
    phong = session.get(Phong, ma_phong)
    if not phong or phong.da_xoa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy phòng học")
    return phong

def create_room(session: Session, room_data: PhongCreate) -> Phong:
    existing = session.get(Phong, room_data.ma_phong)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã phòng đã tồn tại")
    
    db_room = Phong.model_validate(room_data)
    session.add(db_room)
    session.commit()
    session.refresh(db_room)

    from app.service.chatBotSvc import campus_cache
    campus_cache.invalidate()

    return db_room

def update_room(session: Session, ma_phong: str, room_data: PhongUpdate) -> Phong:
    db_room = get_room_by_id(session, ma_phong)
    update_dict = room_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_room, key, value)
        
    session.add(db_room)
    session.commit()
    session.refresh(db_room)

    from app.service.chatBotSvc import campus_cache
    campus_cache.invalidate()

    return db_room

def delete_room(session: Session, ma_phong: str) -> dict:
    db_room = get_room_by_id(session, ma_phong)
    db_room.da_xoa = True
    session.add(db_room)
    session.commit()

    from app.service.chatBotSvc import campus_cache
    campus_cache.invalidate()

    return {"message": f"Đã xóa phòng {ma_phong} thành công"}

# ==================== THIẾT BỊ ====================

def get_devices(
    session: Session,
    ma_phong: Optional[str] = None,
    ma_loai: Optional[str] = None,
    tinh_trang: Optional[str] = None
) -> List[ThietBi]:
    query = select(ThietBi).where(ThietBi.da_xoa == False)
    if ma_phong is not None:
        query = query.where(ThietBi.ma_phong == ma_phong)
    if ma_loai:
        query = query.where(ThietBi.ma_loai == ma_loai)
    if tinh_trang:
        query = query.where(ThietBi.tinh_trang == tinh_trang)
    return session.exec(query).all()

def create_device(session: Session, data: ThietBiCreate) -> ThietBi:
    existing = session.get(ThietBi, data.ma_tb)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã thiết bị đã tồn tại")
    
    db_device = ThietBi.model_validate(data)
    session.add(db_device)
    session.commit()
    session.refresh(db_device)
    return db_device

def create_devices_batch(session: Session, batch: ThietBiCreateBatch) -> List[ThietBi]:
    """
    Tự động sinh mã hàng loạt theo lô:
    ML_01-01, ML_01-02, ... ML_01-10
    """
    created_list = []
    for i in range(1, batch.so_luong + 1):
        ma_tb = f"{batch.ma_lo}-{i:02d}"
        
        while session.get(ThietBi, ma_tb):
            i += 1
            ma_tb = f"{batch.ma_lo}-{i:02d}"

        new_device = ThietBi(
            ma_tb=ma_tb,
            ma_loai=batch.ma_loai,
            ma_lo=batch.ma_lo,
            ma_phong=batch.ma_phong,
            cong_suat_w=batch.cong_suat_w,
            nam_mua=batch.nam_mua,
            tinh_trang="Tốt"
        )
        session.add(new_device)
        created_list.append(new_device)

    session.commit()
    for d in created_list:
        session.refresh(d)
    return created_list

# ==================== PHIẾU BÁO HỎNG ====================

def get_reports(session: Session, trang_thai: Optional[str] = None) -> List[PhieuBaoHong]:
    query = select(PhieuBaoHong)
    if trang_thai:
        query = query.where(PhieuBaoHong.trang_thai == trang_thai)
    return session.exec(query).all()

def submit_report(session: Session, data: PhieuBaoHongCreate, ma_tk_nguoi_bao: int) -> PhieuBaoHong:
    report = PhieuBaoHong(
        ma_tk=ma_tk_nguoi_bao,
        ma_phong=data.ma_phong,
        ma_tb=data.ma_tb,
        mo_ta=data.mo_ta,
        trang_thai="Moi",
        ngay_bao=datetime.utcnow()
    )
    session.add(report)
    session.commit()
    session.refresh(report)
    return report

def update_report(session: Session, ma_phieu: int, update_data: PhieuBaoHongUpdate) -> PhieuBaoHong:
    report = session.get(PhieuBaoHong, ma_phieu)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy phiếu báo hỏng")

    data_dict = update_data.model_dump(exclude_unset=True)
    for k, v in data_dict.items():
        setattr(report, k, v)
        
    if update_data.trang_thai in ["DaXuLy", "TuChoi"] and not report.ngay_xu_ly:
        report.ngay_xu_ly = datetime.utcnow()

    session.add(report)
    session.commit()
    session.refresh(report)
    return report
