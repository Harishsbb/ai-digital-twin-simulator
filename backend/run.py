import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("  AI Digital Twin Simulator - Backend API Server")
    print("  URL: http://127.0.0.1:8000")
    print("  Docs: http://127.0.0.1:8000/docs")
    print("  WebSocket: ws://127.0.0.1:8000/api/v1/sensors/ws")
    print("=" * 60)
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
