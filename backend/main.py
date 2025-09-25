from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import geopandas as gpd
import os

app = FastAPI()

# Allow CORS so frontend can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dataset
DATA_PATH = os.path.join("backend", "data", "processed.parquet")
df = pd.read_parquet(DATA_PATH)

# Example state centroids (expand this dict as needed)
state_coords = {
    "New York": (-74.0059, 40.7128),
    "California": (-119.4179, 36.7783),
    "Texas": (-99.9018, 31.9686),
}

# Add lon/lat columns
df["lon"] = df["state"].map(lambda s: state_coords.get(s, (0, 0))[0])
df["lat"] = df["state"].map(lambda s: state_coords.get(s, (0, 0))[1])

# Convert to GeoDataFrame
gdf = gpd.GeoDataFrame(
    df,
    geometry=gpd.points_from_xy(df["lon"], df["lat"]),
    crs="EPSG:4326"
)


@app.get("/api/diseases")
def get_diseases():
    """Return list of available diseases (from columns)."""
    # Right now dataset only has 'cases' and 'deaths'
    return {"diseases": ["cases", "deaths"]}


@app.get("/api/data")
def get_data(disease: str = "cases", start: str = None, end: str = None):
    """Return disease data filtered by time range."""
    data = df.copy()

    if start:
        data = data[data["date"] >= start]
    if end:
        data = data[data["date"] <= end]

    return data[["date", "state", disease, "lat", "lon"]].to_dict(orient="records")
