import os
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from fastapi import FastAPI
import json
import openai

app = FastAPI()

# Use the processed sample data
DATA_PATH = os.path.join(os.path.dirname(__file__), "data/processed.parquet")

# Check file exists
if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"{DATA_PATH} not found. Make sure ingest.py has run or processed.parquet is committed.")

df = pd.read_parquet(DATA_PATH)
gdf = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df.get("lon", 0), df.get("lat", 0)), crs="EPSG:4326")

@app.get("/map-data")
def map_data(start: str, end: str, state: str = None):
    s, e = pd.to_datetime(start), pd.to_datetime(end)
    subset = gdf[(gdf['date'] >= s) & (gdf['date'] <= e)]
    if state:
        subset = subset[subset['state'] == state]
    # Aggregate by state
    agg = subset.groupby(['state']).agg({'cases':'sum'}).reset_index()
    # Create GeoDataFrame with dummy coordinates for display
    agg['lat'] = 0  # placeholder
    agg['lon'] = 0
    agg_gdf = gpd.GeoDataFrame(agg, geometry=gpd.points_from_xy(agg.lon, agg.lat))
    return json.loads(agg_gdf.to_json())

@app.get("/answer")
def answer(query: str):
    openai.api_key = os.getenv("OPENAI_API_KEY")
    prompt = f"User asked: {query}\n\nAnswer as a public health analyst."
    try:
        resp = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role":"system","content":"You are an epidemiology assistant."},
                      {"role":"user","content": prompt}]
        )
        return {"answer": resp["choices"][0]["message"]["content"]}
    except Exception as e:
        return {"answer": f"(Stub) Could not call model. Query was: {query}"}
