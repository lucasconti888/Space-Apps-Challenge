// App.tsx
import CloudIcon from "@mui/icons-material/Cloud";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import RoomIcon from "@mui/icons-material/Room";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import "maplibre-gl/dist/maplibre-gl.css";
import React, { useEffect, useMemo, useState } from "react";
import Map, { Marker, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import "./App.css";
import Sidebar from "./components/drawer";
import { Input } from "./components/ui/input";
import LinearProgress from "@mui/material/LinearProgress";

const API_URL =
  "https://weather-api-1063811848516.southamerica-east1.run.app/api/prediction";

// ---------- Tipos ----------
type ApiResponse = {
  local: {
    bounding_box?: { lat: number; long: number };
    data_referencia?: string; // ISO
  };
  clima: {
    temperatura_ar?: { valor: number; unidade: string }; // K
    precipitacao?: { valor: number; unidade: string }; // kg m-2 s-1
    vento?: { valor: number; unidade: string }; // m/s
    radiacao_solar?: { valor: number; unidade: string }; // W m-2
    ["umidade do ar"]?: { valor: number; unidade: string };
    ["umidade do solo"]?: { valor: number; unidade: string };
  };
  resumo?: string;
};

// ---------- Helpers ----------
function kToC(k?: number) {
  if (k == null) return undefined;
  return k - 273.15;
}
function msToKmh(ms?: number) {
  if (ms == null) return undefined;
  return ms * 3.6;
}
// 1 kg·m^-2 ≈ 1 mm; por segundo → ×3600 para mm/h
function kgm2s1ToMmPerHour(val?: number) {
  if (val == null) return undefined;
  return val * 3600;
}
function fmt(n?: number, digits = 0) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toFixed(digits);
}
function log(...args: any[]) {
  console.log("[prediction]", ...args);
}

function App() {
  const [clickedItem, setClickedItem] = useState<MapLayerMouseEvent>();
  const [viewState, setViewState] = useState({
    longitude: -100,
    latitude: 40,
    zoom: 3.5,
  });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Estados para previsão
  const [isFetching, setIsFetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>("Pirituba");

  const [tempC, setTempC] = useState<number | undefined>(undefined);
  const [precipMmH, setPrecipMmH] = useState<number | undefined>(undefined);
  const [windKmh, setWindKmh] = useState<number | undefined>(undefined);
  const [radWm2, setRadWm2] = useState<number | undefined>(undefined);
  const [rhPct, setRhPct] = useState<number | undefined>(undefined);
  const [soilVal, setSoilVal] = useState<number | undefined>(undefined);

  const item = useMemo(() => {
    if (!clickedItem) return null;
    return clickedItem.lngLat || null;
  }, [clickedItem]);

  const API_KEY_GEOAPP = "6744060a5fd549059bd59a466bae65b6";

  async function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearch(value);
    if (value.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    setShowDropdown(true);
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          value
        )}&limit=5&apiKey=${API_KEY_GEOAPP}`
      );
      const data = await res.json();
      setResults(data.features);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // Chama a API pública
  async function fetchPrediction(lat: number, long: number, dateISO?: string) {
    setIsFetching(true);
    log("→ fetchPrediction called", { lat, long, dateISO });

    const payload = {
      lat,
      long,
      lon: long, // compatibilidade
      date: dateISO ?? new Date().toISOString(),
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      log("← HTTP status", res.status);

      if (!res.ok) {
        const text = await res.text().catch(() => "(sem body)");
        log("✖ erro HTTP", { status: res.status, text });
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data: ApiResponse = await res.json();
      log("✓ resposta JSON", data);

      const tC = kToC(data?.clima?.temperatura_ar?.valor);
      const vKmh = msToKmh(data?.clima?.vento?.valor);
      const pMmH = kgm2s1ToMmPerHour(data?.clima?.precipitacao?.valor);

      setTempC(tC);
      setWindKmh(vKmh);
      setPrecipMmH(pMmH);
      setRadWm2(data?.clima?.radiacao_solar?.valor);

      const rawUmid = data?.clima?.["umidade do ar"]?.valor;
      let rh: number | undefined;
      if (typeof rawUmid === "number") {
        rh = rawUmid <= 1 ? rawUmid * 100 : rawUmid <= 100 ? rawUmid : undefined;
      }
      setRhPct(rh);

      const rawSoil = data?.clima?.["umidade do solo"]?.valor;
      setSoilVal(typeof rawSoil === "number" ? rawSoil : undefined);

      setSummary(data?.resumo ?? null);
      setLastUpdated(
        data?.local?.data_referencia
          ? new Date(data.local.data_referencia).toLocaleString()
          : new Date().toLocaleString()
      );
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (msg.includes("Failed to fetch") || msg.includes("TypeError")) {
        log("⚠ possivel CORS/preflight bloqueado pelo navegador");
      }
      console.error(err);

      setTempC(undefined);
      setWindKmh(undefined);
      setPrecipMmH(undefined);
      setRadWm2(undefined);
      setRhPct(undefined);
      setSoilVal(undefined);
      setSummary("Não foi possível obter a previsão no momento.");
    } finally {
      setIsFetching(false);
    }
  }

  function handleSelect(place: any) {
    const longitude = place.geometry.coordinates[0];
    const latitude = place.geometry.coordinates[1];
    setViewState((vs) => ({ ...vs, longitude, latitude, zoom: 14 }));
    setSearch(place.properties.formatted);
    setLocationLabel(place.properties.formatted);
    setShowDropdown(false);
    fetchPrediction(latitude, longitude);
  }

  // Valores para UI
  const temperatura =
    tempC != null ? `${fmt(tempC, 0)}°C` : isFetching ? "..." : "—";
  const condicao = summary ?? (isFetching ? "Buscando previsão..." : "Sem resumo");
  const tempMax = tempC != null ? `${fmt(tempC + 2, 0)}º` : "—";
  const tempMin = tempC != null ? `${fmt(tempC - 3, 0)}º` : "—";
  const sensacao = tempC != null ? `Sensação térmica de ${fmt(tempC, 0)}º` : "—";

  // Placeholders (seu endpoint não retorna hora-a-hora)
  const hourlyForecast = [
    { hour: "09:00", temp: temperatura, type: "cloud" },
    { hour: "12:00", temp: temperatura, type: "sun" },
    { hour: "15:00", temp: temperatura, type: "cloud" },
  ];

  const probChuva = precipMmH != null ? Math.min(100, Math.round(precipMmH * 10)) : 0;
  const gridForecast = [
    { hour: "15:00", percent: `${probChuva}%`, cloud: true, moon: false, temp: temperatura },
    { hour: "16:00", percent: `${Math.max(0, probChuva - 5)}%`, cloud: false, moon: true, temp: temperatura },
    { hour: "17:00", percent: `${Math.max(0, probChuva - 10)}%`, cloud: true, moon: true, temp: temperatura },
  ];

  const iqar = 72; // placeholder
  const cardsRow = [
    {
      label: "Vento",
      value: windKmh != null ? `${fmt(windKmh, 0)} km/h` : "—",
      progress: Math.min(100, Math.round((windKmh ?? 0) * 4)),
      extra: "",
    },
    {
      label: "Umidade",
      value: rhPct != null ? `${fmt(rhPct, 0)}%` : "—",
      progress: rhPct != null ? Math.round(rhPct) : 0,
      extra: "",
    },
    {
      label: "Radiação",
      value: radWm2 != null ? `${fmt(radWm2, 0)} W/m²` : "—",
      progress: Math.min(100, Math.round(((radWm2 ?? 0) / 1000) * 100)),
      extra: "",
    },
  ];

  const bigCards = [
    {
      title: "Índice de Calor",
      value: tempC != null ? `${fmt(tempC, 0)}°C` : "—",
      description:
        rhPct != null
          ? "Sensação térmica estimada considerando a umidade."
          : "Aguardando dados de umidade para sensação térmica.",
    },
    {
      title: "Ponto de Orvalho",
      value:
        tempC != null && rhPct != null
          ? `${fmt(tempC - (100 - rhPct) / 5, 0)}°C`
          : "—",
      description: "Estimativa aproximada com base em T e UR.",
    },
  ];

  // Chamada inicial (opcional para já popular a tela)
  useEffect(() => {
    fetchPrediction(viewState.latitude, viewState.longitude);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Sidebar item={clickedItem as any} open={open} setOpen={setOpen} />

      <div className="fixed top-4 z-30 flex flex-col items-start gap-2 max-h-[calc(100vh)] overflow-y-auto w-full">
        {!expanded && (
          <div className="text-2xl font-semibold text-white w-full">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full ">
              <RoomIcon className="text-white" />
              <span className="text-sm font-medium text-white">{locationLabel}</span>
              {lastUpdated && (
                <span className="text-xs text-white/80 ml-2">
                  {isFetching ? "Atualizando..." : `Ref: ${lastUpdated}`}
                </span>
              )}
            </div>

            <div className="mt-8 flex flex-col items-start ml-6">
              <span className="text-6xl text-white">{temperatura}</span>
              <span className="text-2xl text-white mt-2">{condicao}</span>
              <div className="text-sm text-white/80 mt-2">
                Máx {tempMax} · Mín {tempMin} · {sensacao}
              </div>
            </div>

            <div className="w-full max-w-md mx-auto px-4 mt-2">
              <div className="w-full max-w-md mx-auto mt-4">
                <div className="bg-black/20 rounded-2xl shadow p-4 flex flex-col">
                  <span className="text-base text-left text-white font-semibold mb-2">
                    Radar
                  </span>
                  <div
                    className="w-full h-40 rounded-xl overflow-hidden relative cursor-pointer"
                    style={{ border: "2px solid #e5e7eb" }}
                    onClick={() => setExpanded(true)}
                  >
                    <Map
                      initialViewState={{
                        longitude: viewState.longitude,
                        latitude: viewState.latitude,
                        zoom: 7,
                      }}
                      {...viewState}
                      style={{ width: "100%", height: "100%" }}
                      mapStyle="https://api.maptiler.com/maps/streets/style.json?key=nNpWDVPlrqIFXJhqS2Kw"
                      dragPan={false}
                      dragRotate={false}
                      scrollZoom={false}
                      doubleClickZoom={false}
                      touchZoomRotate={false}
                    >
                      <Marker
                        longitude={viewState.longitude}
                        latitude={viewState.latitude}
                        color="#61dbfb"
                      />
                    </Map>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <span className="text-white font-semibold text-sm">
                        Clique para expandir
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Linha única de cards pequenos */}
            <div className="w-full max-w-md mx-auto px-4 mt-4 flex gap-4">
              {cardsRow.map((card, i) => (
                <div
                  key={i}
                  className="flex-1 bg-black/20 rounded-2xl shadow p-4 flex flex-col items-start"
                >
                  <span className="text-sm text-white">{card.label}</span>
                  <span className="text-xl font-bold text-white">
                    {card.value}
                  </span>
                  <LinearProgress
                    variant="determinate"
                    value={card.progress}
                    sx={{
                      width: "100%",
                      height: 8,
                      borderRadius: 8,
                      backgroundColor: "#e5e7eb",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#38bdf8",
                      },
                      marginTop: "0.5rem",
                    }}
                  />
                  {card.extra && (
                    <span className="text-xs text-white mt-1">
                      {card.extra}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Cards grandes */}
            <div className="w-full max-w-md mx-auto px-4 mt-4 flex flex-col gap-4">
              {bigCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-black/20 rounded-2xl shadow p-6 flex flex-col items-start"
                >
                  <span className="text-lg font-semibold text-white">
                    {card.title}
                  </span>
                  <span className="text-3xl font-bold text-white mt-2">
                    {card.value}
                  </span>
                  <span className="text-sm text-white mt-2">
                    {card.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {expanded && (
        <div className="w-screen flex items-center justify-start px-6 py-4 bg-gray-100/95 absolute top-0 left-0 z-20">
          <div className="relative flex-1 w-full max-w-xl">
            <Input
              type="search"
              value={search}
              onChange={handleInputChange}
              placeholder="Digite para pesquisar..."
              className="w-full"
              onFocus={() => search.length >= 3 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            />
            {showDropdown && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-auto z-30">
                {loading && (
                  <div className="px-2 py-1 text-sm text-gray-600">
                    Carregando...
                  </div>
                )}
                {results.length === 0 && !loading && search.length >= 3 && (
                  <div className="px-2 py-1 text-sm text-gray-600">
                    Nenhum resultado
                  </div>
                )}
                {results.map((item) => (
                  <button
                    key={item.properties.place_id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-gray-800"
                    onMouseDown={() => handleSelect(item)}
                    style={{ background: "transparent" }}
                  >
                    {item.properties.formatted}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={`fixed bottom-0 left-0 transition-all duration-300 ${
          expanded
            ? "w-screen h-screen z-10"
            : "w-full h-0 max-w-md mx-auto mb-4 rounded-xl shadow-lg z-10 cursor-pointer"
        } bg-transparent`}
        style={{ right: 0 }}
        onClick={() => !expanded && setExpanded(true)}
      >
        <Map
          initialViewState={{
            longitude: -122.4,
            latitude: 37.8,
            zoom: 14,
          }}
          {...viewState}
          onZoom={(evt) => setViewState(evt.viewState)}
          onDrag={(evt) => setViewState(evt.viewState)}
          onClick={(e) => {
            if (!expanded) return;
            const { lngLat } = e;
            setClickedItem(e);
            setOpen(true);
            setViewState((vs) => ({
              ...vs,
              longitude: lngLat.lng,
              latitude: lngLat.lat,
            }));
            setLocationLabel(`${lngLat.lat.toFixed(5)}, ${lngLat.lng.toFixed(5)}`);
            fetchPrediction(lngLat.lat, lngLat.lng);
          }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: expanded ? 0 : "1rem",
            pointerEvents: expanded ? "auto" : "none",
          }}
          mapStyle="https://api.maptiler.com/maps/streets/style.json?key=nNpWDVPlrqIFXJhqS2Kw"
        >
          {/* <Marker
            longitude={viewState.longitude}
            latitude={viewState.latitude}
            color="#61dbfb"
          /> */}
        </Map>
        {!expanded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
            <span className="text-white font-semibold">Clique para expandir</span>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
