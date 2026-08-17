from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import subprocess
import sys

app = FastAPI(title="Collision Risk API")

# Allow frontend to access the API (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WARNINGS_FILE = "collision_warnings.json"
DEMO_CATALOG_FILE = "demo_catalog.json"

# State to keep track of if we are serving the demo catalog
is_demo_mode = False

@app.get("/")
def root():
    return {"status": "AI Collision Engine API is running"}

@app.get("/api/satellites")
def get_satellites():
    """Returns the demo catalog if in demo mode, otherwise returns 404 so frontend uses default."""
    if is_demo_mode and os.path.exists(DEMO_CATALOG_FILE):
        try:
            with open(DEMO_CATALOG_FILE, 'r') as f:
                return json.load(f)
        except Exception:
            pass
    raise HTTPException(status_code=404, detail="Not in demo mode, use frontend default catalog.")

@app.get("/collision-warnings")
def get_collision_warnings():
    """Returns the latest generated collision warnings."""
    if not os.path.exists(WARNINGS_FILE):
        return []
    try:
        with open(WARNINGS_FILE, 'r') as f:
            data = json.load(f)
            return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read warnings: {e}")

def run_engine_task(demo_mode: bool = False):
    """Runs the collision engine as a subprocess."""
    global is_demo_mode
    is_demo_mode = demo_mode
    try:
        print(f"Starting AI Collision Engine analysis... (Demo Mode: {demo_mode})")
        cmd = [sys.executable, "collision_engine.py"]
        if demo_mode:
            cmd.append("demo")
        subprocess.run(cmd, check=True)
        print("AI Collision Engine analysis complete.")
    except subprocess.CalledProcessError as e:
        print(f"Engine crashed with error: {e}")

@app.post("/run-collision")
def trigger_collision_analysis(background_tasks: BackgroundTasks):
    """Triggers the Python collision engine to run asynchronously."""
    background_tasks.add_task(run_engine_task, False)
    return {"message": "Collision analysis triggered and is running in the background."}

@app.post("/run-demo")
def trigger_demo_analysis(background_tasks: BackgroundTasks):
    """Triggers the rigged Hollywood Demo simulation."""
    background_tasks.add_task(run_engine_task, True)
    return {"message": "Hollywood Demo triggered and is running in the background."}
