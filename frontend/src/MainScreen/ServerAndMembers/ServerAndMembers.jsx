import React, { useState } from "react";
import { Paper } from "@mui/material";
import ActiveServer from "./ActiveServer/ActiveServer.jsx";
import Members from "./Members/Members.jsx";

function ServerAndMembers({ 
  selectedServer, 
  selectedChannel, 
  messages, 
  onChannelSelect 
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Paper 
      elevation={3} 
      sx={{
        borderRadius: 7.5
      }} 
      style={{ 
        display: "flex", 
        margin: "1rem", 
        width: "100%", 
        overflow: "hidden"
      }}
    >
      <ActiveServer 
        setVisible={setVisible}
        selectedServer={selectedServer}
        selectedChannel={selectedChannel}
        messages={messages}
        onChannelSelect={onChannelSelect}
      />

      {visible && <Members selectedServer={selectedServer} />}
    </Paper>
  );
}

export default ServerAndMembers;