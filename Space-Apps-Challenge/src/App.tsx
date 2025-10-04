import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo, useRef, useState } from "react";
import Map, { Marker, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import "./App.css";
import Sidebar from "./components/drawer";
import { Input } from "./components/ui/input";

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
    setResults(data.features); // Geoapify retorna features
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

  return (
    <>
      <Sidebar item={item} open={open} setOpen={setOpen} />
      <div className="w-screen flex items-center justify-center px-2 py-3 bg-gray-100/95 absolute top-0 left-0 z-20">
        <div className="relative flex-1 w-full">
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
                <div className="px-2 py-1 text-sm text-gray-500">
                  Carregando...
                </div>
              )}
              {results.length === 0 && !loading && search.length >= 3 && (
                <div className="px-2 py-1 text-sm text-gray-500">
                  Nenhum resultado
                </div>
              )}
              {results.map((item) => (
                <button
                  key={item.properties.place_id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                  onMouseDown={() => handleSelect(item)}
                >
                  {item.properties.formatted}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
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
          setClickedItem(e);
          setOpen(true);
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="https://api.maptiler.com/maps/streets/style.json?key=nNpWDVPlrqIFXJhqS2Kw"
      >
        <Marker
          longitude={16.62662018}
          latitude={49.2125578}
          color="#61dbfb"
        ></Marker>
      </Map>
    </>
  );
}

export default App;
