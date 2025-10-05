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
      ? `Sensação térmica de ${fmt(apiData.clima.temperatura_ar.valor, 1)}º`
      : undefined;

  const cardsRow = [
    {
      label: "Vento",
      value: windKmh != null ? `${fmt(windKmh, 1)} km/h` : "—",
      progress: windKmh != null ? Math.min(100, Math.round(windKmh * 4)) : 0,
      extra: "",
    },
    {
      label: "Umidade do ar",
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
      label: "Radiação",
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
      title: "Precipitação",
      value:
        apiData?.clima?.precipitacao?.valor != null
          ? `${fmt(apiData.clima.precipitacao.valor, 2)} mm/h`
          : "—",
      description:
        apiData?.clima?.precipitacao?.probabilidade != null
          ? `Probabilidade: ${fmt(
              apiData.clima.precipitacao.probabilidade * 100,
              0
            )}%`
          : "Sem dados de probabilidade.",
    },
    {
      title: "Neve",
      value:
        apiData?.clima?.neve?.valor != null
          ? `${fmt(apiData.clima.neve.valor, 2)} mm/h`
          : "—",
      description:
        apiData?.clima?.neve?.probabilidade != null
          ? `Probabilidade: ${fmt(apiData.clima.neve.probabilidade * 100, 0)}%`
          : "Sem dados de probabilidade.",
    },
    {
      title: "Umidade do solo",
      value:
        apiData?.clima?.umidade_do_solo?.valor != null
          ? `${fmt(apiData.clima.umidade_do_solo.valor, 1)} kg/m²`
          : "—",
      description: "Estimativa de água disponível no solo.",
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
