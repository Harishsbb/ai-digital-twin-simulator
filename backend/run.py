import os
import subprocess
import sys

# Automatically switch to the project's virtual environment if invoked via global python
current_dir = os.path.dirname(os.path.abspath(__file__))
venv_python = os.path.join(current_dir, "venv", "Scripts", "python.exe")

if os.path.exists(venv_python) and os.path.normcase(sys.executable) != os.path.normcase(venv_python):
    sys.exit(subprocess.call([venv_python] + sys.argv))

import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("  AI Digital Twin Simulator - Backend API Server")
    print("  URL: http://127.0.0.1:8000")
    print("  Docs: http://127.0.0.1:8000/docs")
    print("  WebSocket: ws://127.0.0.1:8000/api/v1/sensors/ws")
    print("=" * 60)
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
