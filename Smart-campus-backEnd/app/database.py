from sqlmodel import SQLModel, create_engine, Session

# Đường dẫn file SQLite lưu trữ ngay trong project
DATABASE_URL = "sqlite:///./campus.db"

# connect_args={"check_same_thread": False} cần thiết khi dùng SQLite với FastAPI đa luồng
engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)

def init_db():
    """Khởi tạo toàn bộ các bảng trong database nếu chưa tồn tại"""
    # Import models để nạp metadata
    import app.models  # noqa: F401
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency cung cấp session làm việc với DB cho các Router"""
    with Session(engine) as session:
        yield session
