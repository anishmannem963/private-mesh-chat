import {Avatar, Button, Paper, Stack} from "@mui/material";
import {useState} from "react";

function ServerBadge({ server, onSelect }) {
  const [hovered, setHovered] = useState(false);
  
  // Default server object for when none is provided
  const defaultServer = { name: "Server Name" };
  const currentServer = server || defaultServer;
  
  const handleClick = () => {
    if (onSelect && server) {
      onSelect(server);
    }
  };
  
  return (
    <Button 
      onClick={handleClick}
      sx={{
        display: "flex", width: "calc(100% - 1rem)", margin: ".5rem", padding: "0", borderRadius: 10,
        color: "orange", textTransform: "none"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Paper elevation={hovered ? 24 : 7} className="UserBadgeContainer" sx={{
        display: "flex", width: "100%", height: "fit-content", margin: "0", borderRadius: 10
      }}>
        <Stack sx={{display: "flex", width: "100%", height: "fit-content", margin: ".5rem"}} direction="row-reverse" spacing={2}>
          <Avatar 
            sx={{ width: "3rem", height: "3rem" }} 
            src={server?.icon || "serverDefault.png"} 
            alt="ServerBadgeIcon"
          />
          <div style={{ display: "flex" }}>
            {currentServer.name}
          </div>
        </Stack>
      </Paper>
    </Button>
  );
}

export default ServerBadge;