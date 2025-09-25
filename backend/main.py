from fastapi import FastAPI, Query
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import os, json
import openai  # or swap for Hugging Face

app = FastAPI()

# load preprocessed parquet
DATA_PATH = os.path.join(os.path.dirname(__file__), "data/jhu_covid_confirmed.parquet")
df = pd.read_parquet(DATA_PATH)
gdf = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df.lon, df.lat), crs="EPSG:4326")

@app.get("/map-data")
def map_data(start: str, end: str, country: str = None):
    s, e = pd.to_datetime(start), pd.to_datetime(end)
    subset = gdf[(gdf['date'] >= s) & (gdf['date'] <= e)]
    if country:
        subset = subset[subset['country'] == country]
    agg = subset.groupby(['country','province','lat','lon']).agg({'cases':'sum'}).reset_index()
    agg_gdf = gpd.GeoDataFrame(agg, geometry=gpd.points_from_xy(agg.lon, agg.lat), crs="EPSG:4326")
    return json.loads(agg_gdf.to_json())

@app.get("/answer")
def answer(query: str):
    """
    Stub: pass query + small stats to an LLM.
    You must set OPENAI_API_KEY in Render environment.
    """
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
