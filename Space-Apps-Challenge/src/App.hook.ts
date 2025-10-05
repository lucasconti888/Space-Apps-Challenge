import type { MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useState } from "react";
import type { ApiResponse } from "./App.types";
import { API_URL, BG_IMAGES, getBgFromApi } from "./App.utils";

const API_KEY_GEOAPP = "6744060a5fd549059bd59a466bae65b6";

export const useApp = () => {
  const [clickedItem, setClickedItem] = useState<MapLayerMouseEvent>();
  const [viewState, setViewState] = useState<{
    latitude: number;
    longitude: number;
    zoom: number;
  }>();
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

  function handleSelect(place: any) {
    const longitude = place.geometry.coordinates[0];
    const latitude = place.geometry.coordinates[1];
    setViewState((vs) => ({ ...vs, longitude, latitude, zoom: 14 }));
    setSearch(place.properties.formatted);
    setLocationLabel(place.properties.formatted);
    setShowDropdown(false);
    fetchPrediction(latitude, longitude);
  }

  async function fetchLocationName(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=6744060a5fd549059bd59a466bae65b6`
      );
      const data = await res.json();
      if (data.features && data.features[0]) {
        setLocationLabel(
          `${data.features[0].properties.city}, ${data.features[0].properties.county_code}`
        );
      } else {
        setLocationLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch {
      setLocationLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
  }

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
            await new Promise((res) => setTimeout(res, 600));
            const res = await fetch(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=6744060a5fd549059bd59a466bae65b6`
            );
            const data = await res.json();
            if (data.features && data.features[0]) {
              setLocationLabel(
                `${data.features[0].properties.city}, ${data.features[0].properties.county_code}`
              );
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

  useEffect(() => {
    if (!viewState?.latitude || !viewState?.longitude) return;

    async function fetchLocationName(lat: number, lng: number) {
      setLocationLoading(true);
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=6744060a5fd549059bd59a466bae65b6`
        );
        const data = await res.json();
        if (data.features && data.features[0]) {
          setLocationLabel(
            `${data.features[0].properties.city}, ${data.features[0].properties.county_code}`
          );
        } else {
          setLocationLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      } catch {
        setLocationLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      } finally {
        setLocationLoading(false);
      }
    }
    if (viewState?.latitude !== -23.5 && viewState?.longitude !== -46.6) {
      fetchLocationName(viewState?.latitude, viewState?.longitude);
    }
  }, [viewState]);

  useEffect(() => {
    setBgUrl(getBgFromApi(apiData));
  }, [apiData]);

  useEffect(() => {
    if (!viewState?.latitude || !viewState?.longitude) return;

    fetchLocationName(viewState.latitude, viewState.longitude);
  }, [viewState]);

  useEffect(() => {
    if (!viewState?.latitude || !viewState?.longitude) return;

    fetchPrediction(viewState.latitude, viewState.longitude);
  }, [viewState]);

  return {
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
    handleInputChange,
  };
};
