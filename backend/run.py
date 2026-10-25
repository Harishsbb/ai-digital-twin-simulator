import os
import subprocess
import sys

# Auto-switch to virtual environment if available and not already active
backend_dir = os.path.dirname(os.path.abspath(__file__))
# Check Windows Scripts or Unix bin
venv_python_win = os.path.join(backend_dir, "venv", "Scripts", "python.exe")
venv_python_nix = os.path.join(backend_dir, "venv", "bin", "python")
venv_python = venv_python_win if os.path.exists(venv_python_win) else venv_python_nix

if (
    os.path.exists(venv_python)
    and os.path.normcase(sys.executable) != os.path.normcase(venv_python)
):
    try:
        sys.exit(subprocess.call([venv_python] + sys.argv))
    except KeyboardInterrupt:
        sys.exit(0)

# Ensure backend directory is in sys.path
sys.path.insert(0, backend_dir)

import uvicorn

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    is_dev = os.getenv("ENVIRONMENT", "development").lower() != "production"

    print("=" * 60)
    print("  AI Digital Twin Simulator - Backend API Server")
    print(f"  URL: http://{host}:{port}")
    print(f"  Docs: http://{host}:{port}/docs")
    print(f"  WebSocket: ws://{host}:{port}/api/v1/sensors/ws")
    print(f"  Environment: {'development (auto-reload)' if is_dev else 'production'}")
    print("=" * 60)
    uvicorn.run("app.main:app", host=host, port=port, reload=is_dev)

