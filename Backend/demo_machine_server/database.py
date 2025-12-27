from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Default to a local postgres instance, but allow override via env var
# Format: postgresql://user:password@host:port/dbname
POSTGRES_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:password@localhost/digital_twin_logs"
)

# Try to connect to Postgres first, fallback to SQLite if it fails
try:
    engine = create_engine(POSTGRES_URL)
    # Test connection
    with engine.connect() as connection:
        print(f"Successfully connected to PostgreSQL database.")
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    print(f"WARNING: Could not connect to PostgreSQL ({e}).")
    print("Falling back to SQLite database (digital_twin.db) to ensure system runs.")
    
    SQLALCHEMY_DATABASE_URL = "sqlite:///./digital_twin.db"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
