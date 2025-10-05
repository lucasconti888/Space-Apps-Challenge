import earthaccess
import xarray as xr
import numpy as np
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Carrega credenciais
load_dotenv()

# Faz login automaticamente via variáveis de ambiente (.env)
auth = earthaccess.login(strategy="environment")

def get_history_json(hour: int, day: int, month: int, lat: float, lon: float):
    """
    Busca o mesmo horário/dia/mês nos últimos 5 anos válidos (respeitando o limite 2025-06)
    e retorna JSON compacto com as principais variáveis meteorológicas convertidas.
    Inclui precipitação de neve.
    """
    start_year = 2025 if month < 6 else 2024
    years = list(range(start_year, start_year - 5, -1))
    fs = earthaccess.get_fsspec_https_session()
    output = []

    vars_map = {
        "temperatura_ar": ("Tair_f_inst", lambda v: v - 273.15),
        "precipitacao": ("Rainf_f_tavg", lambda v: v * 3600),
        "neve": ("Snowf_tavg", lambda v: v * 3600),
        "vento": ("Wind_f_inst", lambda v: v),
        "radiacao_solar": ("SWdown_f_tavg", lambda v: v),
        "umidade_do_ar": ("Qair_f_inst", lambda v: v * 1000),
        "umidade_do_solo": ("SoilMoi0_10cm_inst", lambda v: v),
    }

    def get_scalar(ds, var):
        try:
            return float(np.asarray(ds[var].values).squeeze())
        except Exception:
            return np.nan

    for year in years:
        try:
            start_dt = datetime(year, month, day, hour)
            end_dt = start_dt + timedelta(hours=2)

            results = earthaccess.search_data(
                short_name="GLDAS_NOAH025_3H",
                version="2.1",
                temporal=(start_dt.isoformat(), end_dt.isoformat())
            )
            if not results:
                print(f"⚠️ Nenhum arquivo em {year}-{month:02d}-{day:02d} {hour:02d}h")
                continue

            ds = xr.open_dataset(fs.open(results[0].data_links()[0], mode="rb"))
            p = ds.sel(lat=lat, lon=lon, method="nearest")

            rec = {"year": year}
            for key, (var, conv) in vars_map.items():
                val = get_scalar(p, var)
                rec[key] = round(conv(val), 3) if np.isfinite(val) else None

            output.append(rec)
            print(f"✅ {year}: dados coletados")

        except Exception as e:
            print(f"❌ Erro {year}: {e}")
            continue

    if not output:
        raise ValueError("Nenhum dado retornado para o histórico solicitado.")

    return {
        "lat": float(p.lat.values),
        "lon": float(p.lon.values),
        "dados": output
    }
