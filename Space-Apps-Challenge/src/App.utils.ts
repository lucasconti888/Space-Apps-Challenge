import type { ApiResponse } from "./App.types";

export const API_URL =
  "https://weather-api-1063811848516.southamerica-east1.run.app/api/prediction";

export function fmt(n?: number, digits = 0) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toFixed(digits);
}

export const BG_IMAGES: Record<string, string> = {
  default:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1280&q=80",
  chuva:
    "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1280&q=80",
  chuva_forte:
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1280&q=80",
  sol:
    "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1280&q=80",
  sol_manha:
    "https://images.unsplash.com/photo-1465101178521-c1a9136a3fd9?auto=format&fit=crop&w=1280&q=80",
  sol_tarde:
    "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1280&q=80",
  sol_pordosol:
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1280&q=80",
  neve:
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1280&q=80",
  nublado:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1280&q=80",
  nublado_escuro:
    "https://images.unsplash.com/photo-1503437313881-503a91226419?auto=format&fit=crop&w=1280&q=80",
  noite:
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1280&q=80",
  noite_cidade:
    "https://images.unsplash.com/photo-1468436139062-f60a71c5c892?auto=format&fit=crop&w=1280&q=80",
  tempestade:
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1280&q=80",
  nevoa:
    "https://images.unsplash.com/photo-1465101178521-c1a9136a3fd9?auto=format&fit=crop&w=1280&q=80",
  seco:
    "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1280&q=80",
  calor:
    "https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=1280&q=80",
  frio:
    "https://images.unsplash.com/photo-1465101178521-c1a9136a3fd9?auto=format&fit=crop&w=1280&q=80",
};

export function getBgFromApi(apiData?: ApiResponse): string {
  if (!apiData) return BG_IMAGES.default;
  const resumo = apiData.resumo?.toLowerCase() || "";

  // Temperatura
  const temp = apiData?.clima?.temperatura_ar?.valor;
  if (temp != null) {
    if (temp >= 32) return BG_IMAGES.calor;
    if (temp <= 8) return BG_IMAGES.frio;
  }

  // Chuva forte
  if (
    resumo.includes("chuva forte") ||
    (apiData?.clima?.precipitacao?.valor ?? 0) > 10
  )
    return BG_IMAGES.chuva_forte;

  // Neve
  if (
    resumo.includes("neve") ||
    (apiData?.clima?.neve?.valor ?? 0) > 0.1
  )
    return BG_IMAGES.neve;

  // Tempestade
  if (
    resumo.includes("tempestade") ||
    resumo.includes("trovoada")
  )
    return BG_IMAGES.tempestade;

  // Nevoeiro
  if (
    resumo.includes("nevoa") ||
    resumo.includes("névoa")
  )
    return BG_IMAGES.nevoa;

  // Céu limpo por horário
  if (resumo.includes("sol") || resumo.includes("ensolarado")) {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return BG_IMAGES.sol_manha;
    if (hour >= 17 && hour < 19) return BG_IMAGES.sol_pordosol;
    if (hour >= 10 && hour < 17) return BG_IMAGES.sol_tarde;
    return BG_IMAGES.sol;
  }

  // Nublado escuro
  if (
    resumo.includes("nublado") &&
    (apiData?.clima?.radiacao_solar?.valor ?? 0) < 200
  )
    return BG_IMAGES.nublado_escuro;

  // Nublado
  if (resumo.includes("nublado") || resumo.includes("nuvem"))
    return BG_IMAGES.nublado;

  // Noite (com cidade se radiação solar for alta)
  if (resumo.includes("noite")) {
    if ((apiData?.clima?.radiacao_solar?.valor ?? 0) > 100)
      return BG_IMAGES.noite_cidade;
    return BG_IMAGES.noite;
  }

  // Seco
  if (
    resumo.includes("seco") ||
    (apiData?.clima?.umidade_do_ar?.valor ?? 100) < 3
  )
    return BG_IMAGES.seco;

  return BG_IMAGES.default;
}

export function extractWeatherData(apiData?: ApiResponse) {
  const windKmh =
    apiData?.clima?.vento?.valor != null
      ? apiData.clima.vento.valor * 3.6
      : undefined;

  const temperatura =
    apiData?.clima?.temperatura_ar?.valor != null
      ? `${fmt(apiData.clima.temperatura_ar.valor, 1)}°C`
      : undefined;

  const tempMax =
    apiData?.clima?.temperatura_ar?.valor != null
      ? `${fmt(apiData.clima.temperatura_ar.valor + 2, 0)}º`
      : undefined;

  const tempMin =
    apiData?.clima?.temperatura_ar?.valor != null
      ? `${fmt(apiData.clima.temperatura_ar.valor - 3, 0)}º`
      : undefined;

  const sensacao =
    apiData?.clima?.temperatura_ar?.valor != null
      ? `Feels like ${fmt(apiData.clima.temperatura_ar.valor, 1)}º`
      : undefined;

  const cardsRow = [
    {
      label: "Wind",
      value: windKmh != null ? `${fmt(windKmh, 1)} km/h` : "—",
      progress: windKmh != null ? Math.min(100, Math.round(windKmh * 4)) : 0,
      extra: "",
    },
    {
      label: "Air Humidity",
      value:
        apiData?.clima?.umidade_do_ar?.valor != null
          ? `${fmt(apiData.clima.umidade_do_ar.valor, 1)} g/kg`
          : "—",
      progress:
        apiData?.clima?.umidade_do_ar?.valor != null
          ? Math.min(100, Math.round(apiData.clima.umidade_do_ar.valor * 5))
          : 0,
      extra: "",
    },
    {
      label: "Radiation",
      value:
        apiData?.clima?.radiacao_solar?.valor != null
          ? `${fmt(apiData.clima.radiacao_solar.valor, 0)} W/m²`
          : "—",
      progress:
        apiData?.clima?.radiacao_solar?.valor != null
          ? Math.min(
              100,
              Math.round((apiData.clima.radiacao_solar.valor / 1000) * 100)
            )
          : 0,
      extra: "",
    },
  ];

  const bigCards = [
    {
      title: "Precipitation",
      value:
        apiData?.clima?.precipitacao?.valor != null
          ? `${fmt(apiData.clima.precipitacao.valor, 2)} mm/h`
          : "—",
      description:
        apiData?.clima?.precipitacao?.probabilidade != null
          ? `Probability: ${fmt(
              apiData.clima.precipitacao.probabilidade * 100,
              0
            )}%`
          : "No probability data.",
    },
    {
      title: "Snow",
      value:
        apiData?.clima?.neve?.valor != null
          ? `${fmt(apiData.clima.neve.valor, 2)} mm/h`
          : "—",
      description:
        apiData?.clima?.neve?.probabilidade != null
          ? `Probability: ${fmt(apiData.clima.neve.probabilidade * 100, 0)}%`
          : "No probability data.",
    },
    {
      title: "Soil Moisture",
      value:
        apiData?.clima?.umidade_do_solo?.valor != null
          ? `${fmt(apiData.clima.umidade_do_solo.valor, 1)} kg/m²`
          : "—",
      description: "Estimated water available in the soil.",
    },
  ];

  return {
    windKmh,
    temperatura,
    tempMax,
    tempMin,
    sensacao,
    cardsRow,
    bigCards,
  };
}
