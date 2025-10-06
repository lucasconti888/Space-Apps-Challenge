import type { ApiResponse } from "./App.types";

// Substitua a API_URL pelo endpoint do Open-Meteo
export const API_URL = "https://api.open-meteo.com/v1/forecast";

export function fmt(n?: number, digits = 0) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toFixed(digits);
}

// Imagens de fundo mais variadas, incluindo manhã, tarde, noite, neve, tempestade, etc.
export const BG_IMAGES: Record<string, string> = {
  default:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1280&q=80",
  chuva:
    "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1280&q=80",
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
  noite:
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1280&q=80",
  tempestade:
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1280&q=80",
  nevoa:
    "https://images.unsplash.com/photo-1465101178521-c1a9136a3fd9?auto=format&fit=crop&w=1280&q=80",
  cidade_noite:
    "https://images.unsplash.com/photo-1468436139062-f60a71c5c892?auto=format&fit=crop&w=1280&q=80",
  cidade_dia:
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1280&q=80",
  campo_dia:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1280&q=80",
  campo_noite:
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1280&q=80",
  // Adicione mais se quiser!
};

export function getBgFromApi(apiData?: ApiResponse): string {
  if (!apiData) return BG_IMAGES.default;

  const weatherCode = apiData.current?.weathercode;
  const now = new Date();
  const sunrise = apiData.daily?.sunrise?.[0];
  const sunset = apiData.daily?.sunset?.[0];
  let isNight = false;
  if (sunrise && sunset) {
    const sunriseDate = new Date(sunrise);
    const sunsetDate = new Date(sunset);
    if (now < sunriseDate || now > sunsetDate) {
      isNight = true;
    }
  }

  // Se tiver latitude, longitude, pode customizar ainda mais (exemplo: cidade/campo)
  const lat = apiData.latitude;
  const lon = apiData.longitude;
  let isUrban = false;
  if (lat && lon) {
    // Exemplo simples: se latitude entre -35 e -23 e longitude entre -55 e -40, assume cidade (Sudeste BR)
    if (lat < -23 && lat > -35 && lon < -40 && lon > -55) isUrban = true;
  }

  // Weathercode do Open-Meteo
  if (typeof weatherCode === "number") {
    // Chuva
    if (
      [
        51,
        53,
        55,
        56,
        57,
        61,
        63,
        65,
        66,
        67,
        80,
        81,
        82,
      ].includes(weatherCode)
    ) {
      if (isNight) return BG_IMAGES.noite;
      return BG_IMAGES.chuva;
    }
    // Neve
    if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
      return BG_IMAGES.neve;
    }
    // Céu limpo
    if ([0, 1].includes(weatherCode)) {
      if (isNight) {
        if (isUrban) return BG_IMAGES.cidade_noite;
        return BG_IMAGES.noite;
      }
      // Manhã, tarde ou pôr do sol
      const hour = now.getHours();
      if (hour >= 5 && hour < 10) return BG_IMAGES.sol_manha;
      if (hour >= 17 && hour < 19) return BG_IMAGES.sol_pordosol;
      if (hour >= 10 && hour < 17) {
        if (isUrban) return BG_IMAGES.cidade_dia;
        return BG_IMAGES.sol_tarde;
      }
      return BG_IMAGES.sol;
    }
    // Nublado, nevoeiro
    if ([2, 3, 45, 48].includes(weatherCode)) {
      if (isNight) return BG_IMAGES.noite;
      if ([45, 48].includes(weatherCode)) return BG_IMAGES.nevoa;
      return BG_IMAGES.nublado;
    }
    // Tempestade
    if ([95, 96, 99].includes(weatherCode)) {
      return BG_IMAGES.tempestade;
    }
  }

  // Fallback: tenta pelo resumo textual
  const resumo = apiData.resumo?.toLowerCase() || "";
  if (resumo.includes("chuva")) return BG_IMAGES.chuva;
  if (resumo.includes("neve")) return BG_IMAGES.neve;
  if (resumo.includes("sol") || resumo.includes("ensolarado")) {
    if (isNight) return BG_IMAGES.noite;
    return BG_IMAGES.sol;
  }
  if (resumo.includes("nublado") || resumo.includes("nuvem")) return BG_IMAGES.nublado;
  if (resumo.includes("noite")) return BG_IMAGES.noite;
  return BG_IMAGES.default;
}

// Função para buscar previsão do tempo do Open-Meteo
export async function fetchOpenMeteo(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current:
      "temperature_2m,precipitation,weathercode,wind_speed_10m,relative_humidity_2m",
    daily:
      "sunrise,sunset,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
  });
  const url = `${API_URL}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao buscar dados do Open-Meteo");
  // Adiciona latitude/longitude manualmente na resposta para o getBgFromApi
  const data = await res.json();
  data.latitude = lat;
  data.longitude = lon;
  return data;
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
