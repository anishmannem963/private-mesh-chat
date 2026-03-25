import { Box, List, ListItemButton, ListItemText } from "@mui/material";

export default function ServerSelectionWindow() {
  return (
    <Box width="250px" bgcolor="#1e1e1e" color="white" height="100vh">
      <List>
        <ListItemButton>
          <ListItemText primary="Server 1" />
        </ListItemButton>
        <ListItemButton>
          <ListItemText primary="Server 2" />
        </ListItemButton>
      </List>
    </Box>
  );
}
