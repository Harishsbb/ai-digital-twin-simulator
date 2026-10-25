import logging
import time
from typing import Generator, Optional
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_engine: Optional[Engine] = None
_SessionLocal: Optional[sessionmaker] = None


def get_engine() -> Optional[Engine]:
    """Retrieve or initialize the SQLAlchemy engine using application settings."""
    global _engine, _SessionLocal
    if _engine is not None:
        return _engine

    settings = get_settings()
    db_url = settings.get_database_url()

    if not db_url:
        logger.warning("No database URL configured. Database persistence will operate in fallback mode.")
        return None

    try:
        connect_args = {}
        # Apply SQLite-specific thread safety args if testing with SQLite
        if db_url.startswith("sqlite"):
            connect_args["check_same_thread"] = False
            _engine = create_engine(
                db_url,
                connect_args=connect_args,
                echo=settings.db_echo,
            )
        else:
            # PostgreSQL engine with robust connection pooling for Supabase Session Pooler
            _engine = create_engine(
                db_url,
                pool_size=settings.db_pool_size,
                max_overflow=settings.db_max_overflow,
                pool_timeout=settings.db_pool_timeout,
                pool_pre_ping=True,  # Proactively test connection before dispatching queries
                pool_recycle=300,    # Recycle connections every 5 minutes to prevent stale pooler disconnects
                echo=settings.db_echo,
            )

        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
        logger.info(f"Database engine initialized: {settings.get_masked_database_url()}")
        return _engine

    except Exception as err:
        logger.error(f"Failed to initialize database engine for {settings.get_masked_database_url()}: {err}")
        _engine = None
        _SessionLocal = None
        return None


def get_session_factory() -> Optional[sessionmaker]:
    """Get the current sessionmaker factory."""
    global _SessionLocal
    if _SessionLocal is None:
        get_engine()
    return _SessionLocal


def set_custom_engine(engine: Engine):
    """Override engine for isolated testing (e.g. SQLite in-memory)."""
    global _engine, _SessionLocal
    _engine = engine
    _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def reset_engine():
    """Reset the cached engine and session factory to force re-initialization."""
    global _engine, _SessionLocal
    if _engine is not None:
        try:
            _engine.dispose()
        except Exception:
            pass
    _engine = None
    _SessionLocal = None


def get_db() -> Generator[Optional[Session], None, None]:
    """FastAPI dependency yielding a managed database session with safe transaction lifecycle."""
    session_factory = get_session_factory()
    if session_factory is None:
        # Graceful degradation: yield None when database is not configured
        yield None
        return

    db: Session = session_factory()
    try:
        yield db
        db.commit()
    except Exception as err:
        db.rollback()
        logger.error(f"Database session transaction error: {err}")
        raise
    finally:
        db.close()


def check_db_connection() -> dict:
    """Perform a live ping (SELECT 1) against the database and measure latency."""
    settings = get_settings()
    masked_url = settings.get_masked_database_url()

    engine = get_engine()
    if engine is None:
        return {
            "status": "not_configured",
            "connected": False,
            "database_url": masked_url,
            "latency_ms": None,
            "error": "No database connection credentials configured in environment",
        }

    start = time.perf_counter()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        return {
            "status": "connected",
            "connected": True,
            "database_url": masked_url,
            "latency_ms": latency_ms,
            "error": None,
        }
    except Exception as err:
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.warning(f"Database connection check failed for {masked_url}: {err}")
        return {
            "status": "disconnected",
            "connected": False,
            "database_url": masked_url,
            "latency_ms": latency_ms,
            "error": str(err),
        }
