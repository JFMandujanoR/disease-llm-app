from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import pandas as pd
import os

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === API routes ===
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "processed.parquet")
df = pd.read_parquet(DATA_PATH)

state_coords = {
    "New York": (-74.0059, 40.7128),
    "California": (-119.4179, 36.7783),
    "Texas": (-99.9018, 31.9686),
}

df["lon"] = df["state"].map(lambda s: state_coords.get(s, (0, 0))[0])
df["lat"] = df["state"].map(lambda s: state_coords.get(s, (0, 0))[1])

@app.get("/api/diseases")
def get_diseases():
    return {"diseases": ["cases", "deaths"]}

@app.get("/api/data")
def get_data(disease: str = "cases", start: str = None, end: str = None):
    data = df.copy()
    if start:
        data = data[data["date"] >= start]
    if end:
        data = data[data["date"] <= end]
    return data[["date", "state", disease, "lat", "lon"]].to_dict(orient="records")

# === Serve frontend (MOUNT LAST) ===
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
