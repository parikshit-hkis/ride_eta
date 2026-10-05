"""
Backend configuration for the Ride ETA Platform.
Dynamically reads from .env environment variables with robust fallbacks.
"""
import os
from pathlib import Path

# Load python-dotenv if available
try:
    from dotenv import load_dotenv
    # Load .env file from project root directory
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
    else:
        load_dotenv()
except ImportError:
    pass

# =====================================================
# PROJECT PATHS
# =====================================================
PROJECT_ROOT = Path(__file__).resolve().parent.parent  # Ride_ETA/
BACKEND_DIR = Path(__file__).resolve().parent  # Ride_ETA/backend/
ML_DIR = PROJECT_ROOT / "ml"
DATA_DIR = ML_DIR / "data"
SAVED_MODEL_DIR = ML_DIR / "saved_models"
UPLOAD_DIR = DATA_DIR / "uploads"

# Create upload directory if it doesn't exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# =====================================================
# DATABASE
# =====================================================
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:1632@localhost:5432/ride_eta_db"
)

# =====================================================
# AUTHENTICATION & SECURITY
# =====================================================
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "ride-eta-secret-key-change-in-production-super-secure"
)
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# =====================================================
# CORS (for Next.js frontend)
# =====================================================
raw_cors = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
CORS_ORIGINS = [origin.strip() for origin in raw_cors.split(",") if origin.strip()]

# =====================================================
# API
# =====================================================
API_PREFIX = os.getenv("API_PREFIX", "/api")
