import type { MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useState, useRef } from "react";
import type { ApiResponse } from "./App.types";
import { fetchOpenMeteo, BG_IMAGES, getBgFromApi } from "./App.utils"; // ajuste aqui

const API_KEY_GEOAPP = "6744060a5fd549059bd59a466bae65b6";

export const useApp = () => {
  const [clickedItem, setClickedItem] = useState<MapLayerMouseEvent>();
  const [viewState, setViewState] = useState<{
    latitude: number;
    longitude: number;
  } | null>();
  const [viewToPredict, setViewToPredict] = useState({
    latitude: -23.5,
    longitude: -46.6,
  });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
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
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasLeftUserLoc, setHasLeftUserLoc] = useState(false);
  const [understood, setUnderstood] = useState(false);

  // Ref para controlar se já inicializou a busca inicial
  const hasFetchedInitial = useRef(false);

  // Busca nome do local (apenas quando viewToPredict muda)
  async function fetchLocationName(lat: number, lng: number) {
    setLocationLoading(true);
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${API_KEY_GEOAPP}`
      );
      const data = await res.json();
      if (
        data.features &&
        data.features[0] &&
        !!data.features[0].properties.county_code
      ) {
        setLocationLabel(
          `${data.features[0].properties.city}, ${data.features[0].properties.county_code}`
        );
      }
    } finally {
      setLocationLoading(false);
    }
  }

  // Agora usando Open-Meteo
  async function fetchPrediction(lat: number, long: number, dateISO?: string) {
    setIsFetching(true);
    try {
      const data = await fetchOpenMeteo(lat, long); // usa util Open-Meteo
      setApiData(data);

      // Atualiza o background imediatamente ao receber novos dados
      setBgUrl(getBgFromApi(data));

      // Resumo simples do Open-Meteo
      setSummary(
        data?.current
          ? `Temperatura: ${data.current.temperature_2m}°C, Umidade: ${data.current.relative_humidity_2m}%, Vento: ${data.current.wind_speed_10m} km/h`
          : "Sem dados climáticos para este local."
      );
      setLastUpdated(new Date().toLocaleString());
    } catch {
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
    if (
      !hasFetchedInitial.current &&
      userLocation &&
      viewToPredict.latitude === userLocation.lat &&
      viewToPredict.longitude === userLocation.lng
    ) {
      hasFetchedInitial.current = true;
      fetchLocationName(viewToPredict.latitude, viewToPredict.longitude);
      fetchPrediction(viewToPredict.latitude, viewToPredict.longitude);
      return;
    }

    if (hasFetchedInitial.current) {
      fetchLocationName(viewToPredict.latitude, viewToPredict.longitude);
      fetchPrediction(viewToPredict.latitude, viewToPredict.longitude);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewToPredict.latitude, viewToPredict.longitude, userLocation]);

  useEffect(() => {
    setBgUrl(getBgFromApi(apiData));
  }, [apiData]);

  function handleSelect(place: any) {
    const longitude = place.geometry.coordinates[0];
    const latitude = place.geometry.coordinates[1];
    setViewState((vs) => ({ ...vs, longitude, latitude, zoom: 14 }));
    setSearch(place.properties.formatted);
    setLocationLabel(place.properties.formatted);
    setShowDropdown(false);
  }

  function handleMapClick(lat: number, lng: number) {
    setViewState((vs) => ({ ...vs, latitude: lat, longitude: lng }));
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
      setResults(data.features || []);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const handleRecenter = () => {
    if (userLocation) {
      setViewState((vs) => ({
        ...vs,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        zoom: 12,
      }));
    }
  };

  useEffect(() => {
    if (expanded && !understood) {
      setShowTutorial(true);
    }
  }, [expanded, understood]);

  useEffect(() => {
    if (
      userLocation && viewState &&
      (Math.abs((viewState?.latitude) - userLocation.lat) > 0.0005 ||
        Math.abs(viewState?.longitude - userLocation.lng) > 0.0005)
    ) {
      setHasLeftUserLoc(true);
    } else {
      setHasLeftUserLoc(false);
    }
  }, [viewState?.latitude, viewState?.longitude, userLocation, viewState]);

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
    apiData,
    summary,
    viewState,
    results,
    loading,
    hasLeftUserLoc,
    showTutorial,
    setUnderstood,
    handleRecenter,
    setClickedItem,
    setOpen,
    fetchPrediction,
    fetchLocationName,
    setShowDropdown,
    handleSelect,
    setShowTutorial,
    setViewState,
    setExpanded,
    setClickedMarkers,
    setLocationLabel,
    viewToPredict,
    setViewToPredict,
    handleMapClick,
    handleGoToUserLocation,
    handleInputChange,
  };
};
