import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { Drawer, DrawerContent } from "../ui/drawer";
import React, { useState } from "react";

interface SidebarProps {
  item: {
    [name: string]: any;
  } | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ item, open, setOpen }: SidebarProps) {
  // Filtros de data
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  function handleBuscar() {
    setLoading(true);
    // Chame aqui sua função de busca de previsão com a data
    setTimeout(() => setLoading(false), 1000); // simulação
  }

  function handleLimpar() {
    setDate("");
    // Chame aqui sua função de limpar filtros
  }

  return (
    <Drawer open={open} onClose={() => setOpen(false)}>
      <DrawerContent>
        <List>
          <ListItem>
            <Typography variant="h6" sx={{ width: "100%" }}>
              Filtros de Previsão
            </Typography>
          </ListItem>
          <ListItem>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                width: "100%",
              }}
            />
          </ListItem>
          <ListItem>
            <button
              onClick={handleBuscar}
              disabled={loading}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                marginRight: "8px",
                cursor: "pointer",
              }}
            >
              Buscar
            </button>
            <button
              onClick={handleLimpar}
              style={{
                background: "#6b7280",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Limpar
            </button>
          </ListItem>
          {loading && (
            <ListItem>
              <Typography variant="body2" color="text.secondary">
                Carregando...
              </Typography>
            </ListItem>
          )}
        </List>
      </DrawerContent>
    </Drawer>
  );
}
