from fastapi import FastAPI, Request
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

# === Load data ===
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "processed.parquet")
df = pd.read_parquet(DATA_PATH)

state_coords = {
    "New York": (-74.0059, 40.7128),
    "California": (-119.4179, 36.7783),
    "Texas": (-99.9018, 31.9686),
}
df["lon"] = df["state"].map(lambda s: state_coords.get(s, (0, 0))[0])
df["lat"] = df["state"].map(lambda s: state_coords.get(s, (0, 0))[1])

# === Conversation memory (in-memory) ===
conversation_history = []

# === API routes ===
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

# === LLM Q&A route with memory ===
@app.post("/api/ask")
async def ask_question(request: Request):
    body = await request.json()
    question = body.get("question", "")

    # Summarize dataset to give LLM context (only first 50 rows)
    summary = df.groupby(["date", "state"])[["cases", "deaths"]].sum().reset_index()
    stats_text = summary.head(50).to_csv(index=False)

    system_prompt = """You are a helpful assistant answering questions 
    about a spatiotemporal disease dataset with cases and deaths per state over time.
    Use the dataset provided to answer clearly and concisely."""

    # Check API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {"answer": "No OPENAI_API_KEY found. Please set it in Render."}

    client = OpenAI(api_key=api_key)

    # Add current user message to conversation
    conversation_history.append({"role": "user", "content": f"Question: {question}"})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": system_prompt},
                      {"role": "user", "content": f"Dataset sample:\n{stats_text}"}] + conversation_history,
        )
        answer = response.choices[0].message.content

        # Add assistant response to conversation memory
        conversation_history.append({"role": "assistant", "content": answer})
    except Exception as e:
        answer = f"Error: {e}"

    return {"answer": answer}

# === Serve frontend (MOUNT LAST) ===
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
