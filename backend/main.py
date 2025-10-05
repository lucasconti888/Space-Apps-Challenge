from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from services.gldas_fetcher import get_history_json
from services.stats_engine import compute_weather_stats
from services.ai_summary import summarize_weather

app = FastAPI(title="Weather Prediction API")

# 🚀 Libera CORS (para testes — ajuste em produção)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    lat: float
    long: float
    date: datetime

@app.post("/api/prediction")
def predict_weather(req: PredictionRequest):
    date = req.date
    history = get_history_json(date.hour, date.day, date.month, req.lat, req.long)
    stats = compute_weather_stats(history)
    resumo = summarize_weather(stats, date_iso=date.isoformat())  # 👈 aqui!

    clima = stats["estatisticas"]
    return {
        "local": {
            "bounding_box": {"lat": history["lat"], "long": history["lon"]},
            "data_referencia": date.strftime("%Y-%m-%dT%H:%M:%SZ"),
        },
        "clima": {
            "temperatura_ar": {"valor": clima["temperatura_ar"]["media"], "unidade": "°C"},
            "precipitacao": {"valor": clima["precipitacao"]["media"], "unidade": "mm/h", "probabilidade": clima["precipitacao"]["prob"]},
            "neve": {"valor": clima["neve"]["media"], "unidade": "mm/h", "probabilidade": clima["neve"]["prob"]},
            "vento": {"valor": clima["vento"]["media"], "unidade": "m/s"},
            "radiacao_solar": {"valor": clima["radiacao_solar"]["media"], "unidade": "W/m²"},
            "umidade_do_ar": {"valor": clima["umidade_do_ar"]["media"], "unidade": "g/kg"},
            "umidade_do_solo": {"valor": clima["umidade_do_solo"]["media"], "unidade": "kg/m²"}
        },
        "resumo": resumo
    }

