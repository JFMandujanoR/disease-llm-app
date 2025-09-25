# Disease LLM Explorer

Minimal example of a web app where an LLM answers natural language queries using spatiotemporal disease data (COVID-19 from JHU).

## Run locally

### Backend
```bash
cd backend
pip install -r requirements.txt
python ingest.py
uvicorn main:app --reload --port 10000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173
