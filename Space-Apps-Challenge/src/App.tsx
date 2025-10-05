// App.tsx
import RoomIcon from "@mui/icons-material/Room";
import LinearProgress from "@mui/material/LinearProgress";
import "maplibre-gl/dist/maplibre-gl.css";
import React, { useEffect, useState } from "react";
import Map, { Marker, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { ApiResponse } from "./App";
import "./App.css";
import Sidebar from "./components/drawer";
import { Input } from "./components/ui/input";
import { Skeleton } from "./components/ui/skeleton";

const API_URL =
  "https://weather-api-1063811848516.southamerica-east1.run.app/api/prediction";

// ---------- Tipos ----------

function fmt(n?: number, digits = 0) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toFixed(digits);
}

const BG_IMAGES: Record<string, string> = {
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

function getBgFromApi(apiData?: ApiResponse): string {
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

function App() {
  const [clickedItem, setClickedItem] = useState<MapLayerMouseEvent>();
  const [viewState, setViewState] = useState({
    latitude: -23.5,
    longitude: -46.6,
    zoom: 12,
  });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Estados para previsão
  const [isFetching, setIsFetching] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>(
    "Detectando localização..."
  );
  const [locationLoading, setLocationLoading] = useState(true);

  // Ajuste para os novos campos da API
  const [tempC, setTempC] = useState<number | undefined>(undefined);
  const [precipMmH, setPrecipMmH] = useState<number | undefined>(undefined);
  const [precipProb, setPrecipProb] = useState<number | undefined>(undefined);
  const [neveMmH, setNeveMmH] = useState<number | undefined>(undefined);
  const [neveProb, setNeveProb] = useState<number | undefined>(undefined);
  const [windKmh, setWindKmh] = useState<number | undefined>(undefined);
  const [radWm2, setRadWm2] = useState<number | undefined>(undefined);
  const [rhGkg, setRhGkg] = useState<number | undefined>(undefined);
  const [soilKgM2, setSoilKgM2] = useState<number | undefined>(undefined);

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

    const payload = {
      lat,
      long,
      lon: long,
      date: dateISO ?? new Date().toISOString(),
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: ApiResponse = await res.json();

      setTempC(data?.clima?.temperatura_ar?.valor);
      setPrecipMmH(data?.clima?.precipitacao?.valor);
      setPrecipProb(data?.clima?.precipitacao?.probabilidade);
      setNeveMmH(data?.clima?.neve?.valor);
      setNeveProb(data?.clima?.neve?.probabilidade);
      setWindKmh(
        data?.clima?.vento?.valor ? data.clima.vento.valor * 3.6 : undefined
      ); // m/s → km/h
      setRadWm2(data?.clima?.radiacao_solar?.valor);
      setRhGkg(data?.clima?.umidade_do_ar?.valor);
      setSoilKgM2(data?.clima?.umidade_do_solo?.valor);

      setSummary(data?.resumo ?? null);
      setLastUpdated(
        data?.local?.data_referencia
          ? new Date(data.local.data_referencia).toLocaleString()
          : new Date().toLocaleString()
      );
    } catch (err: any) {
      setTempC(undefined);
      setPrecipMmH(undefined);
      setPrecipProb(undefined);
      setNeveMmH(undefined);
      setNeveProb(undefined);
      setWindKmh(undefined);
      setRadWm2(undefined);
      setRhGkg(undefined);
      setSoilKgM2(undefined);
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

  const temperatura =
    tempC != null ? `${fmt(tempC, 1)}°C` : isFetching ? "..." : "—";
  const tempMax = tempC != null ? `${fmt(tempC + 2, 0)}º` : "—";
  const tempMin = tempC != null ? `${fmt(tempC - 3, 0)}º` : "—";
  const sensacao =
    tempC != null ? `Sensação térmica de ${fmt(tempC, 1)}º` : "—";

  const cardsRow = [
    {
      label: "Vento",
      value: windKmh != null ? `${fmt(windKmh, 1)} km/h` : "—",
      progress: windKmh != null ? Math.min(100, Math.round(windKmh * 4)) : 0,
      extra: "",
    },
    {
      label: "Umidade do ar",
      value: rhGkg != null ? `${fmt(rhGkg, 1)} g/kg` : "—",
      progress: rhGkg != null ? Math.min(100, Math.round(rhGkg * 5)) : 0,
      extra: "",
    },
    {
      label: "Radiação",
      value: radWm2 != null ? `${fmt(radWm2, 0)} W/m²` : "—",
      progress:
        radWm2 != null ? Math.min(100, Math.round((radWm2 / 1000) * 100)) : 0,
      extra: "",
    },
  ];

  const bigCards = [
    {
      title: "Precipitação",
      value: precipMmH != null ? `${fmt(precipMmH, 2)} mm/h` : "—",
      description:
        precipProb != null
          ? `Probabilidade: ${fmt(precipProb * 100, 0)}%`
          : "Sem dados de probabilidade.",
    },
    {
      title: "Neve",
      value: neveMmH != null ? `${fmt(neveMmH, 2)} mm/h` : "—",
      description:
        neveProb != null
          ? `Probabilidade: ${fmt(neveProb * 100, 0)}%`
          : "Sem dados de probabilidade.",
    },
    {
      title: "Umidade do solo",
      value: soilKgM2 != null ? `${fmt(soilKgM2, 1)} kg/m²` : "—",
      description: "Estimativa de água disponível no solo.",
    },
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setViewState((vs) => ({
            ...vs,
            latitude,
            longitude,
            zoom: 12,
          }));
          try {
            setLocationLoading(true);
            // Simula delay para Skeleton ser visível
            await new Promise((res) => setTimeout(res, 600));
            const res = await fetch(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=6744060a5fd549059bd59a466bae65b6`
            );
            const data = await res.json();
            if (data.features && data.features[0]) {
              setLocationLabel(data.features[0].properties.formatted);
            } else {
              setLocationLabel(
                `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
              );
            }
          } catch {
            setLocationLabel(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          } finally {
            setLocationLoading(false);
          }
        },
        () => {
          setLocationLabel("Localização não permitida");
          setLocationLoading(false);
        }
      );
    } else {
      setLocationLabel("Localização não suportada");
      setLocationLoading(false);
    }
  }, []);

  // Sempre que mudar a localização manualmente, busca o nome do local
  useEffect(() => {
    async function fetchLocationName(lat: number, lng: number) {
      setLocationLoading(true);
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=6744060a5fd549059bd59a466bae65b6`
        );
        const data = await res.json();
        if (data.features && data.features[0]) {
          setLocationLabel(data.features[0].properties.formatted);
        } else {
          setLocationLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      } catch {
        setLocationLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      } finally {
        setLocationLoading(false);
      }
    }
    // Só busca se não for a primeira vez (evita duplo fetch ao abrir)
    if (viewState.latitude !== -23.5 && viewState.longitude !== -46.6) {
      fetchLocationName(viewState.latitude, viewState.longitude);
    }
  }, [viewState.latitude, viewState.longitude]);

  const [apiData, setApiData] = useState<ApiResponse | undefined>(undefined);
  const [bgUrl, setBgUrl] = useState(BG_IMAGES.default);

  // Quando a resposta da API chegar, atualize o background
  useEffect(() => {
    setBgUrl(getBgFromApi(apiData));
  }, [apiData]);

  // Função para buscar nome do local pela lat/long
  async function fetchLocationName(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=6744060a5fd549059bd59a466bae65b6`
      );
      const data = await res.json();
      if (data.features && data.features[0]) {
        setLocationLabel(data.features[0].properties.formatted);
      } else {
        setLocationLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch {
      setLocationLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
  }

  // Sempre que mudar a localização, busca o nome
  useEffect(() => {
    fetchLocationName(viewState.latitude, viewState.longitude);
  }, [viewState.latitude, viewState.longitude]);

  // Adicione um state para armazenar os pontos clicados:
  const [clickedMarkers, setClickedMarkers] = useState<
    { lat: number; lng: number }[]
  >([]);

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        backgroundImage: `url('${bgUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-image 0.5s",
      }}
    >
      <>
        <Sidebar
          item={clickedItem as any}
          open={open}
          setOpen={setOpen}
          onGoToData={() => {
            setOpen(false);
            setExpanded(false); // Fecha o mapa expandido ao ir para os dados
          }}
        />

        {/* Fundo escuro translúcido */}
        <div
          className="fixed inset-0 bg-black"
          style={{ opacity: 0.2, zIndex: 1 }}
        />

        {!expanded && (
          <div className="fixed top-4 z-30 flex flex-col items-start gap-2 max-h-[calc(100vh)] overflow-y-auto w-full">
            <div className="text-2xl font-semibold text-white w-full">
              {/* Header: Localização ao lado da temperatura */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-full ml-6 mt-8">
                <RoomIcon className="text-white" />
                <span className="text-lg text-left font-medium text-white">
                  {locationLoading ? (
                    <Skeleton className="w-24 h-5 bg-white/30" />
                  ) : (
                    locationLabel
                  )}
                </span>
                {lastUpdated && (
                  <span className="text-xs text-white/80 ml-2">
                    {isFetching ? (
                      <Skeleton className="w-20 h-4 bg-white/30" />
                    ) : (
                      `Ref: ${lastUpdated}`
                    )}
                  </span>
                )}
              </div>

              {/* Temperatura e resumo */}
              <div className="flex flex-row items-end ml-6 mt-2">
                <span className="text-6xl text-white leading-none">
                  {isFetching ? (
                    <Skeleton className="w-32 h-12 bg-white/30" />
                  ) : (
                    temperatura
                  )}
                </span>
              </div>

              {/* Resumo da API, estilizado e alinhado à esquerda */}
              <div className="max-w-md mx-auto mt-4 px-4 text-left">
                <span className="block text-white text-lg font-normal leading-relaxed">
                  {isFetching ? (
                    <Skeleton className="w-full h-6 bg-white/20" />
                  ) : (
                    summary
                  )}
                </span>
              </div>

              {/* Máx, Mín, Sensação */}
              <div className="text-sm text-white/80 mt-4 ml-8">
                {isFetching ? (
                  <Skeleton className="w-48 h-4 bg-white/30" />
                ) : (
                  <>
                    Máx {tempMax} · Mín {tempMin} · {sensacao}
                  </>
                )}
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
                      {isFetching ? (
                        <Skeleton className="w-full h-full rounded-xl bg-white/20" />
                      ) : (
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
                      )}
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
                {isFetching
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="flex-1 h-24 rounded-2xl bg-white/20"
                      />
                    ))
                  : cardsRow.map((card, i) => (
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
                {isFetching
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-24 rounded-2xl bg-white/20"
                      />
                    ))
                  : bigCards.map((card, idx) => (
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
          </div>
        )}

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
              const { lngLat } = e;
              // Adiciona um novo marcador onde clicou
              setClickedMarkers(() => [
                { lat: lngLat.lat, lng: lngLat.lng },
              ]);
              if (!expanded) return;
              setClickedItem(e);
              setOpen(true);
              setViewState((vs) => ({
                ...vs,
                longitude: lngLat.lng,
                latitude: lngLat.lat,
              }));
              setLocationLabel(
                `${lngLat.lat.toFixed(5)}, ${lngLat.lng.toFixed(5)}`
              );
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
            {clickedMarkers.map((marker, idx) => (
              <Marker
                key={idx}
                longitude={marker.lng}
                latitude={marker.lat}
                color="#f59e42"
              />
            ))}
          </Map>
          {!expanded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
              <span className="text-white font-semibold">
                Clique para expandir
              </span>
            </div>
          )}
        </div>
      </>
    </div>
  );
}

export default App;
