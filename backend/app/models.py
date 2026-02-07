from sqlalchemy import Column, DateTime, JSON, String, Text, ForeignKey, DECIMAL, Boolean
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

Base = declarative_base()

class Relatorio(Base):
    __tablename__ = "relatorios"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    timestamp_iso = Column(String(40))
    site_id = Column(String(100), index=True)
    operadora = Column(String(100), index=True)
    cidade = Column(String(100), index=True)
    status = Column(String(20))
    payload = Column(JSON)
    observacoes = Column(Text)

    fotos = relationship("Foto", back_populates="relatorio", cascade="all, delete-orphan")
    user = relationship("User", back_populates="relatorios")

class Foto(Base):
    __tablename__ = "fotos"

    id = Column(String(36), primary_key=True)
    relatorio_id = Column(String(36), ForeignKey("relatorios.id"), index=True)
    categoria = Column(String(50))
    path = Column(String(255))
    coords_lat = Column(DECIMAL(10, 7))
    coords_lng = Column(DECIMAL(10, 7))
    created_at = Column(DateTime, server_default=func.now())

    relatorio = relationship("Relatorio", back_populates="fotos")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    username = Column(String(120), unique=True, index=True)
    password_hash = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    relatorios = relationship("Relatorio", back_populates="user")
