from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LogBase(BaseModel):
    event: str
    type: str
    user: str
    machine_id: Optional[str] = None

class LogCreate(LogBase):
    pass

class Log(LogBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
