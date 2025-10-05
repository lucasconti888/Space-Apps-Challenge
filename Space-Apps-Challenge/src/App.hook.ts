import type { MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useState } from "react";
import type { ApiResponse } from "./App.types";
import { API_URL, BG_IMAGES, getBgFromApi } from "./App.utils";

const API_KEY_GEOAPP = "6744060a5fd549059bd59a466bae65b6";

export const useApp = () => {
  const [clickedItem, setClickedItem] = useState<MapLayerMouseEvent>();
  const [viewState, setViewState] = useState({
    latitude: -23.5,
    longitude: -46.6,
    zoom: 12,
  });
  const [viewToPredict, setViewToPredict] = useState({
    latitude: -23.5,
    longitude: -46.6,
  });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [apiData, setApiData] = useState<ApiResponse | undefined>(undefined);
  const [bgUrl, setBgUrl] = useState(BG_IMAGES.default);
  const [isFetching, setIsFetching] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>(
    "Detectando localização..."
  );
  const [locationLoading, setLocationLoading] = useState(true);
  const [clickedMarkers, setClickedMarkers] = useState<
    { lat: number; lng: number }[]
  >([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Busca nome do local (apenas quando viewToPredict muda)
  async function fetchLocationName(lat: number, lng: number) {
    setLocationLoading(true);
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${API_KEY_GEOAPP}`
      );
      const data = await res.json();
      if (data.features && data.features[0] && !!data.features[0].properties.county_code) {
        setLocationLabel(
          `${data.features[0].properties.city}, ${data.features[0].properties.county_code}`
        );
      } 
    } finally {
      setLocationLoading(false);
    }
  }

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

      setApiData(data);

      setSummary(data?.resumo ?? null);
      setLastUpdated(
        data?.local?.data_referencia
          ? new Date(data.local.data_referencia).toLocaleString()
          : new Date().toLocaleString()
      );
    } catch (err: any) {
      setSummary("Não foi possível obter a previsão no momento.");
    } finally {
      setIsFetching(false);
    }
  }

  // Ao montar, pega a localização do usuário e inicializa tudo
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setViewState((vs) => ({
            ...vs,
            latitude,
            longitude,
            zoom: 12,
          }));
          setViewToPredict({
            latitude,
            longitude,
          });
        },
        () => {
          setUserLocation(null);
          // Mantém o valor default
        }
      );
    }
  }, []);

  // Só busca o nome do local e previsão quando viewToPredict mudar
  useEffect(() => {
    fetchLocationName(viewToPredict.latitude, viewToPredict.longitude);
    fetchPrediction(viewToPredict.latitude, viewToPredict.longitude);
  }, [viewToPredict.latitude, viewToPredict.longitude]);

  // Atualiza o background quando os dados mudam
  useEffect(() => {
    setBgUrl(getBgFromApi(apiData));
  }, [apiData]);

  // handleSelect, handleMapClick, handleGoToUserLocation devem SEMPRE alterar viewToPredict
  function handleSelect(place: any) {
    const longitude = place.geometry.coordinates[0];
    const latitude = place.geometry.coordinates[1];
    setViewState((vs) => ({ ...vs, longitude, latitude, zoom: 14 }));
    setViewToPredict({ latitude, longitude });
    setSearch(place.properties.formatted);
    setLocationLabel(place.properties.formatted);
    setShowDropdown(false);
  }

  function handleMapClick(lat: number, lng: number) {
    setViewState((vs) => ({ ...vs, latitude: lat, longitude: lng }));
    setViewToPredict({ latitude: lat, longitude: lng });
  }

  function handleGoToUserLocation() {
    if (userLocation) {
      setViewState((vs) => ({
        ...vs,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        zoom: 12,
      }));
      setViewToPredict({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
      });
    }
    setOpen(false);
    setExpanded(false);
  }

  return {
    clickedItem,
    bgUrl,
    expanded,
    clickedMarkers,
    isFetching,
    userLocation,
    lastUpdated,
    locationLabel,
    locationLoading,
    open,
    search,
    showDropdown,
    loading,
    results,
    apiData,
    summary,
    viewState,
    setClickedItem,
    setOpen,
    fetchPrediction,
    setShowDropdown,
    handleSelect,
    setViewState,
    setExpanded,
    setClickedMarkers,
    setLocationLabel,
    viewToPredict,
    setViewToPredict,
    handleMapClick,
    handleGoToUserLocation,
  };
};
