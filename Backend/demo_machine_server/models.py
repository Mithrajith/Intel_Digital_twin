from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    event = Column(String, index=True)
    type = Column(String) # info, warning, error, success
    user = Column(String) # System, Admin, Operator
    machine_id = Column(String, nullable=True)
