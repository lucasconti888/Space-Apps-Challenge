import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { Drawer, DrawerContent } from "../ui/drawer";

interface SidebarProps {
  item: {
    [name: string]: any;
  } | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ item, open, setOpen }: SidebarProps) {
  return (
    <Drawer open={open} onClose={() => setOpen(false)}>
      <DrawerContent>
        {item ? (
          <List>
            <ListItem>
              <ListItemText
                primary={<Typography variant="h4">{item?.lng}</Typography>}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="h5">Host: {item?.lat}</Typography>
                }
                secondary={<Typography>id: {item?.host_id}</Typography>}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Typography>
                    <b>Room type:</b> {item?.room_type}
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Typography>
                    <b>Minimum night:</b> {item?.minimum_nights}
                  </Typography>
                }
              />
            </ListItem>
            <ListItem key={item.id}>
              <ListItemText
                primary={
                  <Typography>
                    <b>Neighbourhood: </b>
                    {item.neighbourhood}, {item?.neighbourhood_group}
                  </Typography>
                }
              />
            </ListItem>
          </List>
        ) : (
          <List>
            <Typography component="p" sx={{ padding: 2 }}>
              Click to point to see more details
            </Typography>
          </List>
        )}
      </DrawerContent>
    </Drawer>
  );
}
