# Disease LLM Explorer

Minimal example of a web app where an LLM answers natural language queries using spatiotemporal disease data (COVID-19 from JHU).

## Run locally

### Backend
```markdown
# Disease LLM Explorer

Live demo: https://disease-llm-app.onrender.com

Small web prototype that uses an LLM to answer natural-language questions about spatiotemporal disease data and visualize the data on a map. The app currently includes two datasets (COVID-19 sample and measles):

- Interactive map with time slider and circle markers by state
- Dataset selector (covid19 or measles) and metric selector (cases/deaths for covid)
- Time slider to explore values over dates
- QA/chat box that sends a question to the backend LLM endpoint; backend provides a dataset summary as context for the LLM

The backend is a FastAPI app that serves dataset APIs and an `/api/ask` endpoint which forwards a conversation + dataset summary to the OpenAI API. The frontend is a small React app (Vite) that consumes these APIs and renders the map and QA UI.

Important: the QA/chat feature requires an OpenAI API key in the environment (see Run locally below). If no key is set the backend responds with a helpful message.

Quick status
- Frontend: React + Vite, components `MapView` and `QABox` provide the main UI.
- Backend: FastAPI app in `backend/main.py` exposing `/api/diseases`, `/api/data`, `/api/ask` and optionally serving the built frontend from `frontend/dist` when present.
- Data: processed parquet files are expected in `backend/data` (see ingest scripts).

Run locally
Prereqs
- Python 3.8+ and pip
- Node.js (recommended 16+ or current LTS)

1) Start the backend

```bash
# change into the backend folder
cd backend

# (optional) create and activate a virtualenv
python -m venv .venv
source .venv/bin/activate

# install Python deps
pip install -r requirements.txt

# create processed dataset used by the app (covid sample)
python ingest.py

# optionally create measles parquet (downloads/processes remote CSV)
python ingest_measles.py

# set your OpenAI key (required to use the /api/ask chat feature)
export OPENAI_API_KEY="sk-..."

# run the backend (default example uses port 10000)
uvicorn main:app --reload --port 10000
```

The backend will expose APIs at http://localhost:10000 (or whichever port you choose).

2) Start the frontend (development)

```bash
cd frontend
npm install
npm run dev
```

Visit the Vite dev server (typically http://localhost:5173) to use the app with hot-reload.

3) Build frontend and serve via backend (optional)

```bash
cd frontend
npm run build

# after building, the backend will serve the built files from ../frontend/dist
# run the backend (same as above) and open http://localhost:10000
cd ../backend
uvicorn main:app --reload --port 10000
```

API overview (useful for debugging)
- GET /api/diseases -> returns available metrics/diseases
- GET /api/data?dataset=<covid19|measles>&metric=<metric>&start=<YYYY-MM-DD>&end=<YYYY-MM-DD>
- POST /api/ask -> body { question, dataset, metric } returns { answer }

Notes & caveats
- The backend expects `backend/data/processed.parquet` (covid sample) and `backend/data/measles.parquet` (measles). Use the ingest scripts to generate them.
- The chat endpoint uses the OpenAI client and requires `OPENAI_API_KEY` to be set. If not set the endpoint returns a message telling you to set it.
- The app is a demo/prototype and may not be robust for production traffic. Be mindful of OpenAI usage/quotas when testing the QA feature.

If you'd like, I can:
- add a small startup script that runs ingestion then starts uvicorn
- add a brief troubleshooting section for common errors (CORS, missing data files, build issues)

Enjoy exploring the data!

```
