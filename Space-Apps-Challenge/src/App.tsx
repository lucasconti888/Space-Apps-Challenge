import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo, useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import "./App.css";
import Sidebar from "./components/drawer";

function App() {
  const [clickedItem, setClickedItem] = useState<MapLayerMouseEvent>();
  const [open, setOpen] = useState(false);

  const item = useMemo(() => {
    if (!clickedItem) return null;
    return clickedItem.lngLat || null;
  }, [clickedItem]);

  return (
    <>
      <Sidebar item={item} open={open} setOpen={setOpen} />
      <Map
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14,
        }}
        onClick={(e) => {
          setClickedItem(e);
          setOpen(true);
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="https://api.maptiler.com/maps/streets/style.json?key=nNpWDVPlrqIFXJhqS2Kw"
      >
        <NavigationControl position="top-left" />
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
