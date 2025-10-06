import RoomIcon from "@mui/icons-material/Room";
import LinearProgress from "@mui/material/LinearProgress";
import { ChevronLeftIcon, Search as SearchIcon } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker } from "react-map-gl/maplibre";
import "./App.css";
import { useApp } from "./App.hook";
import { extractWeatherData } from "./App.utils";
import Sidebar from "./components/drawer";
import { Input } from "./components/ui/input";
import { Skeleton } from "./components/ui/skeleton";
import { useEffect, useRef, useState } from "react";

function App() {
  const {
    clickedItem,
    expanded,
    clickedMarkers,
    isFetching,
    lastUpdated,
    locationLabel,
    locationLoading,
    open,
    search,
    setClickedItem,
    setOpen,
    setShowDropdown,
    handleSelect,
    fetchLocationName,
    setViewState,
    setExpanded,
    setClickedMarkers,
    handleInputChange,
    setViewToPredict,
    setUnderstood,
    fetchPrediction,
    handleRecenter,
    setShowTutorial,
    showTutorial,
    hasLeftUserLoc,
    userLocation,
    viewState,
    results,
    loading,
    showDropdown,
    summary,
    apiData,
    bgUrl,
  } = useApp();

  const { sensacao, tempMax, tempMin, temperatura } =
    extractWeatherData(apiData);

  // Utilidades para exibir valores extras do Open-Meteo
  const weatherCode = apiData?.current?.weathercode;
  const weatherDesc = getWeatherDescription(weatherCode);
  const pressure = apiData?.current?.pressure_msl;
  const cloudcover = apiData?.current?.cloudcover;
  const visibility = apiData?.current?.visibility;
  const windDir = apiData?.current?.wind_direction_10m;
  const dewpoint = apiData?.current?.dew_point_2m;
  const apparentTemp = apiData?.current?.apparent_temperature;
  const uvIndex = apiData?.current?.uv_index;
  const sunrise = apiData?.daily?.sunrise?.[0];
  const sunset = apiData?.daily?.sunset?.[0];

  // Função para converter UTC para hora local bonitinha
  function formatHour(iso?: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const [currentBg, setCurrentBg] = useState(bgUrl);
  const [fade, setFade] = useState(false);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    if (bgUrl !== currentBg) {
      setFade(true);
      timeoutRef.current = setTimeout(() => {
        setCurrentBg(bgUrl);
        setFade(false);
      }, 500);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [bgUrl, currentBg]); // <-- Remova o currentBg das dependências!

  return (
    <>
      <Sidebar
        item={clickedItem as any}
        open={open}
        setOpen={setOpen}
        setValues={(data: string) => {
          if (!viewState) return;
          fetchLocationName(viewState.latitude, viewState.longitude);
          fetchPrediction(viewState.latitude, viewState.longitude, data);
          setOpen(false);
          setExpanded(false);
        }}
        onGoToData={() => {
          if (viewState) {
            setViewToPredict({
              latitude: viewState.latitude,
              longitude: viewState.longitude,
            });
          }
          setOpen(false);
          setExpanded(false);
        }}
      />

      <div
        className="fixed inset-0 bg-black"
        style={{ opacity: 0.2, zIndex: 1 }}
      />

      {expanded && (
        <div className="absolute top-6 left-0 flex flex-row items-center gap-3 z-30 w-full px-4">
          <div className="flex" style={{ width: "15%" }}>
            <button
              className="bg-[#f3f4f6] hover:bg-white rounded-full p-2 shadow-lg border border-gray-200 transition w-10 flex items-center justify-center"
              onClick={() => setExpanded(false)}
              aria-label="Voltar ao menu"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          <div
            className="flex items-center bg-[#f3f4f6] rounded-md shadow-lg border border-gray-200 px-3 py-2 relative"
            style={{ width: "80%" }}
          >
            <SearchIcon className="w-5 h-5 text-gray-400 mr-2" />
            <Input
              type="search"
              value={search}
              placeholder="Digite para pesquisar..."
              className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 border-0 shadow-none"
              onInput={handleInputChange}
              onFocus={() => search.length >= 3 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              style={{ boxShadow: "none" }}
            />
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-auto z-30">
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

      {/* Tutorial abaixo da search bar, centralizado */}
      {expanded && showTutorial && (
        <div className="absolute left-0 right-0 top-[20rem] z-40 flex justify-center pointer-events-none">
          <div
            className="bg-white rounded-xl shadow-lg p-6 max-w-xs text-center flex flex-col items-center pointer-events-auto"
            style={{ marginTop: 24 }} // Adiciona margin top
          >
            <span className="text-2xl mb-2">👆</span>
            <h2 className="text-lg font-semibold mb-2">
              Clique no local desejado
            </h2>
            <p className="text-gray-700 mb-4">
              Clique no mapa para obter as informações climáticas do local
              selecionado.
            </p>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-blue-700 transition"
              onClick={() => {
                setShowTutorial(false);
                setUnderstood(true);
              }}
            >
              Entendi!
            </button>
          </div>
        </div>
      )}

      {expanded && hasLeftUserLoc && userLocation && (
        <div
          className="absolute left-4 bottom-4 z-2 flex justify-left cursor-pointer"
          onClick={handleRecenter}
          aria-label="Recentrar no usuário"
        >
          <svg
            width={50}
            height={50}
            viewBox="0 0 140 120"
            fill="none"
            stroke="#2563eb"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: "block" }}
          >
            <circle cx="60" cy="60" r="50" />
            <circle cx="60" cy="60" r="20" fill="#2563eb" />
            <line x1="60" y1="10" x2="60" y2="30" />
            <line x1="60" y1="90" x2="60" y2="110" />
            <line x1="10" y1="60" x2="30" y2="60" />
            <line x1="90" y1="60" x2="110" y2="60" />
          </svg>
        </div>
      )}

      {!expanded && (
        <div className="fixed top-4 z-30 flex flex-col items-start gap-2 max-h-[calc(100vh)] overflow-y-auto w-full">
          <div className="text-2xl font-semibold text-white w-full">
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

            <div className="flex flex-row items-end ml-6 mt-2">
              <span className="text-6xl text-white leading-none">
                {isFetching ? (
                  <Skeleton className="w-32 h-12 bg-white/30" />
                ) : (
                  temperatura
                )}
              </span>
            </div>

            <div className="max-w-md mx-auto mt-4 px-4 text-left">
              <div className="bg-black/30 rounded-xl p-4 shadow-lg">
                <span className="block text-white text-lg font-normal leading-relaxed">
                  {isFetching ? (
                    <Skeleton className="w-full h-6 bg-white/20" />
                  ) : (
                    summary
                  )}
                </span>
              </div>
            </div>

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
                    <Map
                      initialViewState={{
                        longitude: userLocation?.lng,
                        latitude: userLocation?.lat,
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
                        longitude={userLocation?.lng ?? 0}
                        latitude={userLocation?.lat ?? 0}
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

            {/* Cards principais do Open-Meteo */}
            <div className="w-full max-w-md mx-auto px-4 mt-4 flex gap-4">
              {isFetching
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="flex-1 h-24 rounded-2xl bg-white/20"
                    />
                  ))
                : [
                    // Vento
                    <div
                      key="vento"
                      className="flex-1 bg-black/20 rounded-2xl shadow p-4 flex flex-col items-start"
                    >
                      <span className="text-sm text-white">Vento</span>
                      <span className="text-xl font-bold text-white">
                        {apiData?.current?.wind_speed_10m != null
                          ? `${apiData.current.wind_speed_10m.toFixed(1)} km/h`
                          : "—"}
                      </span>
                      <LinearProgress
                        variant="determinate"
                        value={
                          apiData?.current?.wind_speed_10m != null
                            ? Math.min(100, Math.round(apiData.current.wind_speed_10m * 4))
                            : 0
                        }
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
                    </div>,
                    // Umidade
                    <div
                      key="umidade"
                      className="flex-1 bg-black/20 rounded-2xl shadow p-4 flex flex-col items-start"
                    >
                      <span className="text-sm text-white">Umidade do ar</span>
                      <span className="text-xl font-bold text-white">
                        {apiData?.current?.relative_humidity_2m != null
                          ? `${apiData.current.relative_humidity_2m.toFixed(1)}%`
                          : "—"}
                      </span>
                      <LinearProgress
                        variant="determinate"
                        value={
                          apiData?.current?.relative_humidity_2m != null
                            ? Math.min(100, Math.round(apiData.current.relative_humidity_2m))
                            : 0
                        }
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
                    </div>,
                    // Precipitação
                    <div
                      key="precipitacao"
                      className="flex-1 bg-black/20 rounded-2xl shadow p-4 flex flex-col items-start"
                    >
                      <span className="text-sm text-white">Precipitação</span>
                      <span className="text-xl font-bold text-white">
                        {apiData?.current?.precipitation != null
                          ? `${apiData.current.precipitation.toFixed(2)} mm`
                          : "—"}
                      </span>
                      <LinearProgress
                        variant="determinate"
                        value={
                          apiData?.current?.precipitation != null
                            ? Math.min(100, Math.round(apiData.current.precipitation * 10))
                            : 0
                        }
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
                    </div>,
                  ]}
            </div>

            {/* NOVOS CARDS EXTRAS */}
            <div className="w-full max-w-md mx-auto px-4 mt-4 flex gap-4">
              {/* Pressão atmosférica */}
              <div className="flex-1 bg-black/20 rounded-2xl shadow p-4 flex flex-col items-start">
                <span className="text-sm text-white">Pressão</span>
                <span className="text-xl font-bold text-white">
                  {pressure != null ? `${pressure.toFixed(0)} hPa` : "—"}
                </span>
              </div>
              {/* Cobertura de nuvens */}
              <div className="flex-1 bg-black/20 rounded-2xl shadow p-4 flex flex-col items-start">
                <span className="text-sm text-white">Nuvens</span>
                <span className="text-xl font-bold text-white">
                  {cloudcover != null ? `${cloudcover.toFixed(0)}%` : "—"}
                </span>
              </div>
              {/* Visibilidade */}
              <div className="flex-1 bg-black/20 rounded-2xl shadow p-4 flex flex-col items-start">
                <span className="text-sm text-white">Visibilidade</span>
                <span className="text-xl font-bold text-white">
                  {visibility != null ? `${(visibility / 1000).toFixed(1)} km` : "—"}
                </span>
              </div>
            </div>

            <div className="w-full max-w-md mx-auto px-4 mt-4 flex gap-4">
              {/* Direção do vento */}
              <div className="flex-1 bg-black/20 rounded-2xl shadow p-4 flex flex-col items-start">
                <span className="text-sm text-white">Direção do vento</span>
                <span className="text-xl font-bold text-white">
                  {windDir != null ? `${windDir.toFixed(0)}°` : "—"}
                </span>
              </div>
              {/* Ponto de orvalho */}
              <div className="flex-1 bg-black/20 rounded-2xl shadow p-4 flex flex-col items-start">
                <span className="text-sm text-white">Ponto de orvalho</span>
                <span className="text-xl font-bold text-white">
                  {dewpoint != null ? `${dewpoint.toFixed(1)}°C` : "—"}
                </span>
              </div>
              {/* Sensação térmica */}
              <div className="flex-1 bg-black/20 rounded-2xl shadow p-4 flex flex-col items-start">
                <span className="text-sm text-white">Sensação térmica</span>
                <span className="text-xl font-bold text-white">
                  {apparentTemp != null ? `${apparentTemp.toFixed(1)}°C` : "—"}
                </span>
              </div>
            </div>

            <div className="w-full max-w-md mx-auto px-4 mt-4 flex gap-4">
              {/* UV Index */}
              <div className="flex-1 bg-black/20 rounded-2xl shadow p-4 flex flex-col items-start">
                <span className="text-sm text-white">Índice UV</span>
                <span className="text-xl font-bold text-white">
                  {uvIndex != null ? uvIndex.toFixed(1) : "—"}
                </span>
              </div>
              {/* Nascer do sol */}
              <div className="flex-1 bg-black/20 rounded-2xl shadow p-4 flex flex-col items-start">
                <span className="text-sm text-white">Nascer do sol</span>
                <span className="text-xl font-bold text-white">
                  {formatHour(sunrise)}
                </span>
              </div>
              {/* Pôr do sol */}
              <div className="flex-1 bg-black/20 rounded-2xl shadow p-4 flex flex-col items-start">
                <span className="text-sm text-white">Pôr do sol</span>
                <span className="text-xl font-bold text-white">
                  {formatHour(sunset)}
                </span>
              </div>
            </div>

            {/* Card de condição do tempo */}
            <div className="w-full max-w-md mx-auto px-4 mt-4">
              <div className="bg-black/20 rounded-2xl shadow p-6 flex flex-col items-center">
                <span className="text-lg font-semibold text-white mb-2">
                  Condição atual
                </span>
                <span className="text-3xl font-bold text-white mb-2">
                  {weatherDesc}
                </span>
                <span className="text-sm text-white/80">
                  Código: {weatherCode != null ? weatherCode : "—"}
                </span>
              </div>
            </div>

            {/* Big cards: Temperatura máxima, Temperatura mínima */}
            <div className="w-full max-w-md mx-auto px-4 mt-4 flex flex-col gap-4">
              {isFetching
                ? Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-24 rounded-2xl bg-white/20"
                    />
                  ))
                : [
                    <div
                      key="max"
                      className="bg-black/20 rounded-2xl shadow p-6 flex flex-col items-start"
                    >
                      <span className="text-lg font-semibold text-white">
                        Temperatura máxima
                      </span>
                      <span className="text-3xl font-bold text-white mt-2">
                        {apiData?.daily?.temperature_2m_max?.[0] != null
                          ? `${apiData.daily.temperature_2m_max[0].toFixed(0)}º`
                          : "—"}
                      </span>
                      <span className="text-sm text-white mt-2">
                        Temperatura máxima prevista para hoje.
                      </span>
                    </div>,
                    <div
                      key="min"
                      className="bg-black/20 rounded-2xl shadow p-6 flex flex-col items-start"
                    >
                      <span className="text-lg font-semibold text-white">
                        Temperatura mínima
                      </span>
                      <span className="text-3xl font-bold text-white mt-2">
                        {apiData?.daily?.temperature_2m_min?.[0] != null
                          ? `${apiData.daily.temperature_2m_min[0].toFixed(0)}º`
                          : "—"}
                      </span>
                      <span className="text-sm text-white mt-2">
                        Temperatura mínima prevista para hoje.
                      </span>
                    </div>,
                  ]}
            </div>
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
          {...viewState}
          onZoom={(evt) => setViewState(evt.viewState)}
          onDrag={(evt) => setViewState(evt.viewState)}
          onClick={(e) => {
            const { lngLat } = e;
            setClickedMarkers(() => [{ lat: lngLat.lat, lng: lngLat.lng }]);
            if (!expanded) return;
            setClickedItem(e);
            setOpen(true);
            setViewState((vs) => ({
              ...vs,
              longitude: lngLat.lng,
              latitude: lngLat.lat,
            }));
          }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: expanded ? 0 : "1rem",
            pointerEvents: expanded ? "auto" : "none",
          }}
          mapStyle="https://api.maptiler.com/maps/streets/style.json?key=nNpWDVPlrqIFXJhqS2Kw"
        >
          {userLocation && (
            <Marker
              longitude={userLocation.lng}
              latitude={userLocation.lat}
              anchor="center"
            >
              <div
                style={{
                  position: "relative",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Outer pulsing circle */}
                <span
                  style={{
                    position: "absolute",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(37,99,235,0.25)",
                    animation: "pulse 1.5s infinite",
                    zIndex: 1,
                  }}
                />
                {/* Inner solid circle */}
                <span
                  style={{
                    position: "absolute",
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "rgba(37,99,235,1)",
                    border: "2px solid #fff",
                    zIndex: 2,
                    boxShadow: "0 2px 8px 0 rgba(37,99,235,0.25)",
                  }}
                />
                <style>
                  {`
                  @keyframes pulse {
                  0% {
                    transform: scale(0.8);
                    opacity: 0.7;
                  }
                  70% {
                    transform: scale(1);
                    opacity: 0.2;
                  }
                  100% {
                    transform: scale(0.8);
                    opacity: 0.7;
                  }
                  }
                `}
                </style>
              </div>
            </Marker>
          )}
          {clickedMarkers.map((marker, idx) => (
            <Marker
              key={idx}
              longitude={marker.lng}
              latitude={marker.lat}
              color="#f59e42"
            />
          ))}
        </Map>
      </div>

      <div
        className={`fixed inset-0 transition-colors duration-500`}
        style={{
          zIndex: 0, 
          backgroundImage: `url('${currentBg}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: fade ? 0.3 : 1,
          transition: "opacity 0.5s, background-image 0.5s",
        }}
      />
    </>
  );
}

// Função para traduzir weathercode do Open-Meteo
function getWeatherDescription(code?: number) {
  if (code == null) return "—";
  // Veja todos os códigos em https://open-meteo.com/en/docs#api_form
  const map: Record<number, string> = {
    0: "Céu limpo",
    1: "Principalmente limpo",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Névoa",
    48: "Névoa gelada",
    51: "Chuvisco leve",
    53: "Chuvisco moderado",
    55: "Chuvisco denso",
    56: "Chuvisco gelado leve",
    57: "Chuvisco gelado denso",
    61: "Chuva leve",
    63: "Chuva moderada",
    65: "Chuva forte",
    66: "Chuva gelada leve",
    67: "Chuva gelada forte",
    71: "Neve leve",
    73: "Neve moderada",
    75: "Neve forte",
    77: "Cristais de neve",
    80: "Aguaceiros leves",
    81: "Aguaceiros moderados",
    82: "Aguaceiros violentos",
    85: "Aguaceiros de neve leves",
    86: "Aguaceiros de neve fortes",
    95: "Trovoada",
    96: "Trovoada com granizo leve",
    99: "Trovoada com granizo forte",
  };
  return map[code] ?? "Desconhecido";
}

export default App;
