import RoomIcon from "@mui/icons-material/Room";
import LinearProgress from "@mui/material/LinearProgress";
import { ChevronLeftIcon, Menu as MenuIcon, Search as SearchIcon } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker } from "react-map-gl/maplibre";
import "./App.css";
import { useApp } from "./App.hook";
import { extractWeatherData } from "./App.utils";
import Sidebar from "./components/drawer";
import { Input } from "./components/ui/input";
import { Skeleton } from "./components/ui/skeleton";

function App() {
  const {
    clickedItem,
    bgUrl,
    expanded,
    clickedMarkers,
    isFetching,
    lastUpdated,
    locationLabel,
    locationLoading,
    open,
    search,
    showDropdown,
    loading,
    results,
    summary,
    viewState,
    apiData,
    setClickedItem,
    setOpen,
    fetchPrediction,
    setShowDropdown,
    handleSelect,
    setViewState,
    setExpanded,
    setClickedMarkers,
    setLocationLabel,
    handleInputChange,
  } = useApp();

  const { bigCards, cardsRow, sensacao, tempMax, tempMin, temperatura } =
    extractWeatherData(apiData);

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
                className="bg-white/90 hover:bg-white rounded-full p-2 shadow-lg border border-gray-200 transition w-10 h-10 flex items-center justify-center"
                onClick={() => setExpanded(false)}
                aria-label="Voltar ao menu"
                style={{ minWidth: 40, minHeight: 40 }}
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <div
              className="flex items-center bg-white/90 rounded-full shadow-lg border border-gray-200 px-3 py-2 relative"
              style={{ width: "80%" }}
            >
              <SearchIcon className="w-5 h-5 text-gray-400 mr-2" />
              <Input
                type="search"
                value={search}
                onChange={handleInputChange}
                placeholder="Digite para pesquisar..."
                className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 border-0 shadow-none"
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
                <span className="block text-white text-lg font-normal leading-relaxed">
                  {isFetching ? (
                    <Skeleton className="w-full h-6 bg-white/20" />
                  ) : (
                    summary
                  )}
                </span>
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
              setClickedMarkers((prev) => [
                ...prev,
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
      </>
    </div>
  );
}

export default App;
