import pandas as pd, numpy as np

def compute_weather_stats(history_json, rain_thresh=0.1, snow_thresh=0.1):
    df = pd.DataFrame(history_json["dados"])
    stats, total = {}, len(df)

    def mean_or_none(s): 
        s = s.dropna(); return round(float(s.mean()), 3) if len(s) else None

    stats["temperatura_ar"] = {"media": mean_or_none(df["temperatura_ar"]), "prob": None}
    stats["vento"] = {"media": mean_or_none(df["vento"]), "prob": None}
    stats["radiacao_solar"] = {"media": mean_or_none(df["radiacao_solar"]), "prob": None}
    stats["umidade_do_ar"] = {"media": mean_or_none(df["umidade_do_ar"]), "prob": None}
    stats["umidade_do_solo"] = {"media": mean_or_none(df["umidade_do_solo"]), "prob": None}

    rain_hits = int((df["precipitacao"].dropna() >= rain_thresh).sum())
    stats["precipitacao"] = {
        "media": mean_or_none(df["precipitacao"]),
        "prob": round(rain_hits / total, 2) if total else None,
    }

    snow_hits = int((df["neve"].dropna() >= snow_thresh).sum())
    stats["neve"] = {
        "media": mean_or_none(df["neve"]),
        "prob": round(snow_hits / total, 2) if total else None,
    }

    return {"lat": history_json["lat"], "lon": history_json["lon"], "estatisticas": stats}
