from sqlalchemy.orm import Session
from sqlalchemy import desc
import models, schemas

def get_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.SystemLog).order_by(desc(models.SystemLog.timestamp)).offset(skip).limit(limit).all()

def create_log(db: Session, log: schemas.LogCreate):
    db_log = models.SystemLog(**log.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
