import React from "react";
import ServerBadge from "../../../ServerList/ServerBadge/ServerBadge.jsx";
import Search from "../../../../CommonComponents/Search/Search.jsx";
import { Button, Paper, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

function MenuBar({ 
  setVisible, 
  selectedServer, 
  selectedChannel,
  onChannelSelect 
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleChannelMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChannelMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChannelSelect = (channel) => {
    onChannelSelect(channel);
    handleChannelMenuClose();
  };

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "row",
        overflow: "hidden"
      }}
    >
      <div style={{display: "flex", flexShrink: "0", width: "15rem"}}>
        <ServerBadge server={selectedServer}/>
      </div>

      <Button 
        onClick={handleChannelMenuOpen}
        sx={{ textTransform: 'none', marginLeft: '1rem' }}
      >
        {selectedChannel || 'Select Channel'}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleChannelMenuClose}
      >
        {selectedServer?.channels?.map((channel) => (
          <MenuItem 
            key={channel} 
            onClick={() => handleChannelSelect(channel)}
            selected={channel === selectedChannel}
          >
            {channel}
          </MenuItem>
        ))}
      </Menu>

      <Search label="Search messages"/>

      <Button
        onClick={() => setVisible((prev) => !prev)}
        sx={{
          width: "4rem",
          height: "4rem",
          alignSelf: "center",
          margin: "auto",
          marginRight: "0",
          borderRadius: 7.5,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0
        }}
      >
        <MenuIcon/>
      </Button>
    </Paper>
  );
}

export default MenuBar;