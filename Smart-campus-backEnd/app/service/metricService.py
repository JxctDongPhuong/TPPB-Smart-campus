from datetime import date
from typing import List, Optional, Dict, Any
from sqlmodel import Session, select, func

from app.models import DienNang, DienNangCreate, LichPhong

def get_energy_metrics(
    session: Session,
    ma_phong: Optional[str] = None,
    tu_ngay: Optional[date] = None,
    den_ngay: Optional[date] = None
) -> List[DienNang]:
    query = select(DienNang)
    if ma_phong:
        query = query.where(DienNang.ma_phong == ma_phong)
    if tu_ngay:
        query = query.where(DienNang.ngay >= tu_ngay)
    if den_ngay:
        query = query.where(DienNang.ngay <= den_ngay)
    return session.exec(query).all()

def record_energy_metric(session: Session, data: DienNangCreate) -> DienNang:
    existing = session.get(DienNang, (data.ma_phong, data.ngay))
    if existing:
        existing.kwh = data.kwh
        existing.so_gio_bat = data.so_gio_bat
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    db_metric = DienNang.model_validate(data)
    session.add(db_metric)
    session.commit()
    session.refresh(db_metric)
    return db_metric

def detect_waste_energy(
    session: Session,
    ngay: date,
    nguong_kwh_lang_phi: float = 5.0
) -> Dict[str, Any]:
    """
    Thuật toán phát hiện lãng phí điện năng (Idle Waste):
    Đối chiếu DienNang với LichPhong: nếu phòng tiêu thụ điện > ngưỡng quy định
    nhưng trong ngày không có ca học nào, cảnh báo thiết bị bị bỏ quên.
    """
    alerts = []
    metrics_in_day = session.exec(select(DienNang).where(DienNang.ngay == ngay)).all()

    for item in metrics_in_day:
        count_schedules = session.exec(
            select(func.count(LichPhong.ma_lich)).where(
                LichPhong.ma_phong == item.ma_phong,
                LichPhong.ngay == ngay
            )
        ).one()

        if count_schedules == 0 and item.kwh >= nguong_kwh_lang_phi:
            alerts.append({
                "ma_phong": item.ma_phong,
                "ngay": str(item.ngay),
                "kwh_tieu_thu": item.kwh,
                "so_ca_hoc": 0,
                "muc_do": "Cao" if item.kwh > 15 else "Trung bình",
                "canh_bao": "Phòng không có lịch học nhưng phát sinh tiêu thụ điện bất thường (Nghi vấn quên tắt thiết bị)."
            })

    return {
        "ngay": str(ngay),
        "tong_so_phong_lang_phi": len(alerts),
        "danh_sach_canh_bao": alerts
    }

def get_energy_summary(
    session: Session,
    tu_ngay: Optional[date] = None,
    den_ngay: Optional[date] = None
) -> Dict[str, Any]:
    query = select(DienNang)
    if tu_ngay:
        query = query.where(DienNang.ngay >= tu_ngay)
    if den_ngay:
        query = query.where(DienNang.ngay <= den_ngay)
        
    records = session.exec(query).all()
    tong_kwh = sum(r.kwh for r in records)
    
    return {
        "tong_kwh": round(tong_kwh, 2),
        "so_ban_ghi": len(records),
        "trung_binh_kwh_moi_phong": round(tong_kwh / len(records), 2) if records else 0
    }
