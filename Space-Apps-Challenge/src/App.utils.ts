import type { ApiResponse } from "./App.types";

// Substitua a API_URL pelo endpoint do Open-Meteo
export const API_URL = "https://api.open-meteo.com/v1/forecast";

export function fmt(n?: number, digits = 0) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toFixed(digits);
}

export const BG_IMAGES: Record<string, string> = {
  default:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1280&q=80",
  chuva:
    "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1280&q=80",
  sol: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1280&q=80",
  neve: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1280&q=80",
  nublado:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1280&q=80",
  noite:
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1280&q=80",
};

export function getBgFromApi(apiData?: ApiResponse): string {
  if (!apiData) return BG_IMAGES.default;
  const resumo = apiData.resumo?.toLowerCase() || "";
  if (resumo.includes("chuva")) return BG_IMAGES.chuva;
  if (resumo.includes("neve")) return BG_IMAGES.neve;
  if (resumo.includes("sol") || resumo.includes("ensolarado"))
    return BG_IMAGES.sol;
  if (resumo.includes("nublado") || resumo.includes("nuvem"))
    return BG_IMAGES.nublado;
  if (resumo.includes("noite")) return BG_IMAGES.noite;
  return BG_IMAGES.default;
}

// Função para buscar previsão do tempo do Open-Meteo
export async function fetchOpenMeteo(lat: number, lon: number) {
  // Você pode ajustar os parâmetros conforme desejar
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current:
      "temperature_2m,precipitation,weathercode,wind_speed_10m,relative_humidity_2m",
    hourly:
      "temperature_2m,precipitation,weathercode,wind_speed_10m,relative_humidity_2m",
    timezone: "auto",
  });
  const url = `${API_URL}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao buscar dados do Open-Meteo");
  return res.json();
}

// Ajuste dos cards para o formato do Open-Meteo
export function extractWeatherData(apiData?: any) {
  // apiData esperado: resposta do Open-Meteo
  const current = apiData?.current || {};
  const temperature = current.temperature_2m;
  const windKmh = current.wind_speed_10m;
  const humidity = current.relative_humidity_2m;
  const precipitation = current.precipitation;

  const temperatura =
    temperature != null ? `${temperature.toFixed(1)}°C` : undefined;

  const tempMax =
    apiData?.daily?.temperature_2m_max?.[0] != null
      ? `${apiData.daily.temperature_2m_max[0].toFixed(0)}º`
      : undefined;

  const tempMin =
    apiData?.daily?.temperature_2m_min?.[0] != null
      ? `${apiData.daily.temperature_2m_min[0].toFixed(0)}º`
      : undefined;

  const sensacao =
    temperature != null
      ? `Sensação térmica de ${temperature.toFixed(1)}º`
      : undefined;

  const cardsRow = [
    {
      label: "Vento",
      value: windKmh != null ? `${windKmh.toFixed(1)} km/h` : "—",
      progress: windKmh != null ? Math.min(100, Math.round(windKmh * 4)) : 0,
      extra: "",
    },
    {
      label: "Umidade do ar",
      value: humidity != null ? `${humidity.toFixed(1)}%` : "—",
      progress: humidity != null ? Math.min(100, Math.round(humidity)) : 0,
      extra: "",
    },
    {
      label: "Precipitação",
      value: precipitation != null ? `${precipitation.toFixed(2)} mm` : "—",
      progress:
        precipitation != null
          ? Math.min(100, Math.round(precipitation * 10))
          : 0,
      extra: "",
    },
  ];

  const bigCards = [
    {
      title: "Precipitação",
      value: precipitation != null ? `${precipitation.toFixed(2)} mm` : "—",
      description: "Precipitação atual.",
    },
    {
      title: "Temperatura máxima",
      value: tempMax ?? "—",
      description: "Temperatura máxima prevista para hoje.",
    },
    {
      title: "Temperatura mínima",
      value: tempMin ?? "—",
      description: "Temperatura mínima prevista para hoje.",
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
