import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Drawer, DrawerContent } from "../ui/drawer";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Skeleton } from "../ui/skeleton";

interface SidebarProps {
  item: {
    [name: string]: any;
    lngLat?: { lat: number; lng: number };
  } | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  setValues: (data: string) => void;
  onGoToData?: () => void;
}

export default function Sidebar({
  item,
  open,
  setOpen,
  onGoToData,
  setValues,
}: SidebarProps) {
  const [address, setAddress] = React.useState<string>("");
  const [addressLoading, setAddressLoading] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [openCalendar, setOpenCalendar] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Busca endereço quando lat/lng mudam
  React.useEffect(() => {
    async function fetchAddress(lat: number, lng: number) {
      setAddressLoading(true);
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=6744060a5fd549059bd59a466bae65b6`
        );
        const data = await res.json();
        if (data.features && data.features[0]) {
          setAddress(data.features[0].properties.formatted);
        } else {
          setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      } catch {
        setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      } finally {
        setAddressLoading(false);
      }
    }
    if (item && item.lngLat) {
      fetchAddress(item.lngLat.lat, item.lngLat.lng);
    } else {
      setAddress("");
      setAddressLoading(false);
    }
  }, [item]);

  function handleBuscar() {
    if (!onGoToData) return;
    setLoading(true);
    setValues(date ? date.toISOString() : new Date().toISOString());
    setDate(undefined);
    setTimeout(() => setLoading(false), 500); // ou use um callback/promise se setValues for assíncrono
  }

  return (
    <Drawer open={open} onClose={() => setOpen(false)}>
      <DrawerContent
        className="!bg-gradient-to-br from-white z-30 via-blue-50 to-blue-100 max-w-md w-full mx-auto rounded-t-2xl shadow-2xl border border-blue-200"
        style={{
          maxHeight: "calc(100vh - 64px)", // 64px de espaço para barra superior, ajuste se necessário
          overflowY: "auto",
        }}
      >
        <List>
          <ListItem>
            <Typography variant="h6" sx={{ width: "100%" }}>
              Filtros de Previsão
            </Typography>
          </ListItem>
          <ListItem>
            {addressLoading ? (
              <Skeleton className="w-3/4 h-6 bg-gray-200" />
            ) : address ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ width: "100%", fontWeight: 500, color: "#222" }}
              >
                Endereço selecionado:
                <br />
                <span style={{ color: "#444" }}>{address}</span>
              </Typography>
            ) : null}
          </ListItem>
          <ListItem>
            <div className="flex flex-col gap-3 w-full">
              <Label htmlFor="date-picker" className="px-1">
                Data
              </Label>
              <div className="flex gap-2 items-center">
                <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date-picker"
                      className="w-32 justify-between font-normal"
                    >
                      {date ? date.toLocaleDateString() : "Selecionar data"}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setDate(date);
                        setOpenCalendar(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </ListItem>
          <ListItem>
            <div className="flex gap-2 w-full">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleBuscar}
                disabled={loading || !date}
              >
                Buscar previsão filtrada
              </Button>
            </div>
          </ListItem>
          <ListItem>
            <Button
              variant="default"
              className="w-full font-semibold text-lg py-4 shadow-lg border-2 border-blue-400"
              style={{
                background: "linear-gradient(90deg, #38bdf8 0%, #2563eb 100%)",
                color: "#fff",
                marginTop: 12,
                letterSpacing: 1,
              }}
              onClick={() => {
                if (onGoToData) onGoToData();
              }}
            >
              Ver dados atuais do local
            </Button>
          </ListItem>
        </List>
      </DrawerContent>
    </Drawer>
  );
}
