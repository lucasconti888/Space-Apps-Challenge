import CloudIcon from "@mui/icons-material/Cloud";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import RoomIcon from "@mui/icons-material/Room";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import "maplibre-gl/dist/maplibre-gl.css";
import React, { useMemo, useState } from "react";
import Map, { Marker, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import "./App.css";
import Sidebar from "./components/drawer";
import { Input } from "./components/ui/input";
import LinearProgress from "@mui/material/LinearProgress";

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
    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        value
      )}&limit=5&apiKey=${API_KEY_GEOAPP}`
    );
    const data = await res.json();
    setResults(data.features);
    setLoading(false);
  }

  function handleSelect(place: any) {
    setViewState((vs) => ({
      ...vs,
      longitude: place.geometry.coordinates[0],
      latitude: place.geometry.coordinates[1],
      zoom: 14,
    }));
    setSearch(place.properties.formatted);
    setShowDropdown(false);
  }

  // Exemplo de temperatura e condição (você pode substituir por dados reais)
  const temperatura = "22°C";
  const condicao = "Encoberto";

  // Exemplo de temperatura máxima, mínima e sensação
  const tempMax = "25º";
  const tempMin = "19º";
  const sensacao = "Sensação térmica de 24º";

  // Exemplo de dados de previsão por hora
  const hourlyForecast = [
    { hour: "09:00", temp: "20°C", type: "cloud" },
    { hour: "10:00", temp: "21°C", type: "cloud" },
    { hour: "11:00", temp: "22°C", type: "sun" },
    { hour: "12:00", temp: "23°C", type: "sun" },
    { hour: "13:00", temp: "24°C", type: "sun" },
    { hour: "14:00", temp: "24°C", type: "cloud" },
  ];

  // Exemplo de dados para o grid extra
  const gridForecast = [
    { hour: "15:00", percent: "20%", cloud: true, moon: false, temp: "22°C" },
    { hour: "16:00", percent: "10%", cloud: false, moon: true, temp: "21°C" },
    { hour: "17:00", percent: "30%", cloud: true, moon: true, temp: "20°C" },
    { hour: "18:00", percent: "40%", cloud: true, moon: false, temp: "19°C" },
    { hour: "19:00", percent: "50%", cloud: false, moon: true, temp: "18°C" },
  ];

  // Exemplo de dados para os cards extras
  const iqar = 72; // valor do IQAR
  const cardsRow = [
    { label: "Vento", value: "12 km/h", progress: 60, extra: "N" },
    { label: "Umidade", value: "68%", progress: 68, extra: "" },
    { label: "UV", value: "3", progress: 30, extra: "Moderado" },
  ];
  const cardsRow2 = [
    { label: "Visibilidade", value: "8 km", progress: 80, extra: "" },
    { label: "Pressão", value: "1012 hPa", progress: 50, extra: "" },
    { label: "Chuva", value: "0 mm", progress: 0, extra: "Sem chuva" },
  ];

  // Exemplo de dados para os cards grandes
  const bigCards = [
    {
      title: "Índice de Calor",
      value: "27°C",
      description: "Sensação térmica elevada devido à umidade.",
    },
    {
      title: "Ponto de Orvalho",
      value: "18°C",
      description: "Condições favoráveis para formação de orvalho.",
    },
  ];

  return (
    <>
      <Sidebar item={item} open={open} setOpen={setOpen} />

      <div className="fixed top-4 z-30 flex flex-col items-start gap-2 max-h-[calc(100vh)] overflow-y-auto w-full">
        {!expanded && (
          <div className="text-2xl font-semibold text-white w-full">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full ">
              <RoomIcon className="text-white" />
              <span className="text-sm font-medium text-white">
                {/* {viewState.latitude.toFixed(5)},{" "}
                {viewState.longitude.toFixed(5)} */}
                Pirituba
              </span>
            </div>
            <div className="mt-8 flex flex-col items-start ml-6">
              <span className="text-6xl text-white">{temperatura}</span>
              <span className="text-2xl text-white mt-2">{condicao}</span>
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
            {/* Card IQAR com progress bar */}
            <div className="w-full max-w-md mx-auto px-4 mt-4">
              <div className="bg-black/20 rounded-2xl shadow p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base text-white font-semibold">
                    IQAR
                  </span>
                  <span className="text-lg font-bold text-white">{iqar}</span>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={iqar}
                  sx={{
                    height: 10,
                    borderRadius: 8,
                    backgroundColor: "#e5e7eb",
                    "& .MuiLinearProgress-bar": { backgroundColor: "#38bdf8" },
                  }}
                />
                <span className="text-xs text-white mt-2">
                  Índice de qualidade do ar razoável
                </span>
              </div>
            </div>
            {/* Linha de cards pequenos com progress, 3 vezes */}
            {[cardsRow, cardsRow2, cardsRow].map((row, idx) => (
              <div
                key={idx}
                className="w-full max-w-md mx-auto px-4 mt-4 flex gap-4"
              >
                {row.map((card, i) => (
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
            ))}
            {/* Dois cards grandes com dados */}
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
                  <div className="px-2 py-1 text-sm text-white bg-transparent">
                    Carregando...
                  </div>
                )}
                {results.length === 0 && !loading && search.length >= 3 && (
                  <div className="px-2 py-1 text-sm text-white bg-transparent">
                    Nenhum resultado
                  </div>
                )}
                {results.map((item) => (
                  <button
                    key={item.properties.place_id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-white bg-transparent"
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
            setClickedItem(e);
            setOpen(true);
          }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: expanded ? 0 : "1rem",
            pointerEvents: expanded ? "auto" : "none",
          }}
          mapStyle="https://api.maptiler.com/maps/streets/style.json?key=nNpWDVPlrqIFXJhqS2Kw"
        >
          <Marker
            longitude={16.62662018}
            latitude={49.2125578}
            color="#61dbfb"
          ></Marker>
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
  );
}

export default App;
