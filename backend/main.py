from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import pandas as pd
import os
from openai import OpenAI

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Paths ===
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
COVID_PATH = os.path.join(DATA_DIR, "processed.parquet")
MEASLES_PATH = os.path.join(DATA_DIR, "measles.parquet")

# State coordinates for mapping
state_coords = {
    "Alabama": (-86.7911, 32.8067),
    "Alaska": (-152.4044, 61.3707),
    "Arizona": (-111.4312, 33.7298),
    "Arkansas": (-92.3731, 34.9697),
    "California": (-119.4179, 36.7783),
    "Colorado": (-105.5477, 39.0598),
    "Connecticut": (-72.7554, 41.599998),
    "Delaware": (-75.5071, 39.3185),
    "Florida": (-81.5158, 27.6648),
    "Georgia": (-82.9001, 32.1656),
    "Hawaii": (-157.8583, 20.5510),
    "Idaho": (-114.742, 44.0682),
    "Illinois": (-89.3985, 40.6331),
    "Indiana": (-86.1349, 40.2672),
    "Iowa": (-93.0977, 41.878),
    "Kansas": (-98.4842, 39.0119),
    "Kentucky": (-84.2700, 37.8393),
    "Louisiana": (-91.9623, 30.9843),
    "Maine": (-69.4455, 45.2538),
    "Maryland": (-76.6413, 39.0458),
    "Massachusetts": (-71.3824, 42.4072),
    "Michigan": (-85.6024, 44.1822),
    "Minnesota": (-94.6859, 46.3924),
    "Mississippi": (-89.3985, 32.3547),
    "Missouri": (-92.2884, 37.9643),
    "Montana": (-110.4544, 46.8797),
    "Nebraska": (-99.9018, 41.4925),
    "Nevada": (-116.4194, 38.8026),
    "New Hampshire": (-71.5724, 43.1939),
    "New Jersey": (-74.4057, 40.0583),
    "New Mexico": (-105.8701, 34.5199),
    "New York": (-74.0059, 40.7128),
    "North Carolina": (-79.0193, 35.7596),
    "North Dakota": (-101.0020, 47.5515),
    "Ohio": (-82.9071, 40.4173),
    "Oklahoma": (-97.0929, 35.0078),
    "Oregon": (-120.5542, 43.8041),
    "Pennsylvania": (-77.1945, 41.2033),
    "Rhode Island": (-71.4774, 41.5801),
    "South Carolina": (-81.1637, 33.8361),
    "South Dakota": (-99.9018, 43.9695),
    "Tennessee": (-86.5804, 35.5175),
    "Texas": (-99.9018, 31.9686),
    "Utah": (-111.0937, 39.3210),
    "Vermont": (-72.5778, 44.5588),
    "Virginia": (-78.6569, 37.4316),
    "Washington": (-120.7401, 47.7511),
    "West Virginia": (-80.4549, 38.5976),
    "Wisconsin": (-88.7879, 43.7844),
    "Wyoming": (-107.2903, 43.0759),
    "District of Columbia": (-77.0369, 38.9072),
}

# === Utility: load dataset with coords ===
def load_dataset(path, metric="cases"):
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=f"{path} not found")
    df = pd.read_parquet(path)
    if "lat" not in df.columns or "lon" not in df.columns:
        df["lon"] = df["state"].map(lambda s: state_coords.get(s, (0, 0))[0])
        df["lat"] = df["state"].map(lambda s: state_coords.get(s, (0, 0))[1])
    return df

# === Utility: summarize dataset for context ===
def summarize_dataset(df: pd.DataFrame, dataset: str, metric: str) -> str:
    if df.empty:
        return f"The {dataset} dataset is empty."

    latest_date = df["date"].max() if "date" in df.columns else None
    total = df[metric].sum()
    max_state = df.groupby("state")[metric].sum().idxmax()
    max_val = df.groupby("state")[metric].sum().max()

    summary = (
        f"The dataset is {dataset}. "
        f"It has {len(df)} records. "
        f"Total {metric}: {total:,}. "
        f"Highest cumulative {metric} is in {max_state} with {max_val:,}. "
    )
    if latest_date:
        summary += f"The most recent date in the dataset is {latest_date}. "
    return summary

# === API routes ===
@app.get("/api/diseases")
def get_diseases():
    return {"diseases": ["cases", "deaths"]}

@app.get("/api/data")
def get_data(dataset: str = "covid19", metric: str = "cases", start: str = None, end: str = None):
    if dataset == "covid19":
        df = load_dataset(COVID_PATH)
    elif dataset == "measles":
        df = load_dataset(MEASLES_PATH)
        metric = "cases" if "cases" in df.columns else "value"
    else:
        raise HTTPException(status_code=400, detail="Dataset not supported")

    if start:
        df = df[df["date"] >= start]
    if end:
        df = df[df["date"] <= end]

    if metric not in df.columns:
        raise HTTPException(status_code=400, detail=f"Metric {metric} not in dataset")

    return df[["date", "state", metric, "lat", "lon"]].rename(columns={metric: "value"}).to_dict(orient="records")

# === Conversation memory ===
conversation_history = []

@app.post("/api/ask")
async def ask(request: Request):
    body = await request.json()
    question = body.get("question", "")
    dataset = body.get("dataset", "covid19")
    metric = body.get("metric", "cases")

    # Load the dataset for context
    if dataset == "covid19":
        df = load_dataset(COVID_PATH)
    elif dataset == "measles":
        df = load_dataset(MEASLES_PATH)
        metric = "cases" if "cases" in df.columns else "value"
    else:
        raise HTTPException(status_code=400, detail="Dataset not supported")

    if metric not in df.columns:
        return {"answer": f"Metric {metric} not found in {dataset} dataset."}

    context_summary = summarize_dataset(df, dataset, metric)

    system_prompt = (
        f"You are a helpful assistant answering questions about {dataset} data. "
        f"The key metric is {metric}. "
        f"Here is a quick summary you can use for context: {context_summary}"
    )

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {"answer": "No OPENAI_API_KEY found. Please set it in Render."}

    client = OpenAI(api_key=api_key)

    conversation_history.append({"role": "user", "content": question})
    messages = [{"role": "system", "content": system_prompt}] + conversation_history

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
        )
        answer = response.choices[0].message.content
        conversation_history.append({"role": "assistant", "content": answer})
    except Exception as e:
        answer = f"Error: {e}"

    return {"answer": answer}

# === Serve frontend (MOUNT LAST) ===
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
