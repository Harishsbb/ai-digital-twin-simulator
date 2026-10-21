import os
import subprocess
import sys

# Auto-switch to virtual environment if available and not already active
backend_dir = os.path.dirname(os.path.abspath(__file__))
venv_python = os.path.join(backend_dir, "venv", "Scripts", "python.exe")

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
    print("=" * 60)
    print("  AI Digital Twin Simulator - Backend API Server")
    print("  URL: http://127.0.0.1:8000")
    print("  Docs: http://127.0.0.1:8000/docs")
    print("  WebSocket: ws://127.0.0.1:8000/api/v1/sensors/ws")
    print("=" * 60)
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

