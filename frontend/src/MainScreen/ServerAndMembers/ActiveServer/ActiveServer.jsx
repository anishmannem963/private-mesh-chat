import React, { useState, useCallback } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { Button, Paper, TextField } from "@mui/material";
import "./ActiveServer.css";
import Search from "../../../CommonComponents/Search/Search.jsx";
import ServerBadge from "../../ServerList/ServerBadge/ServerBadge.jsx";
import MenuBar from "./MenuBar/MenuBar.jsx";

function ActiveServer({ 
  setVisible, 
  selectedServer, 
  selectedChannel, 
  messages,
  onChannelSelect 
}) {
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = useCallback(() => {
    if (messageInput.trim() && selectedServer && selectedChannel) {
      // In a real app, this would send to backend
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  }, [messageInput, selectedServer, selectedChannel]);

  // Render nothing if no server selected
  if (!selectedServer) {
    return (
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: '100%'
      }}>
        Select a server to start chatting
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", 
      flexDirection: "column", 
      height: "100%", 
      width: "100%"
    }}>
      <MenuBar 
        setVisible={setVisible} 
        selectedServer={selectedServer}
        selectedChannel={selectedChannel}
        onChannelSelect={onChannelSelect}
      />

      {/* Message Display Area */}
      <div style={{
        flexGrow: 1, 
        overflowY: 'auto', 
        padding: '1rem'
      }}>
        {messages.map(message => (
          <div 
            key={message.id} 
            style={{ 
              marginBottom: '0.5rem', 
              textAlign: 'left' 
            }}
          >
            <strong>{message.user}: </strong>
            {message.text}
          </div>
        ))}
      </div>

      <Paper
        elevation={7}
        sx={{
          borderRadius: 7.5,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
        className="text"
      >
        <TextField
          sx={{
            width: "100%",
            margin: ".5rem",
            marginLeft: "1rem",
          }}
          placeholder="Text Message"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button 
          className="sendButton"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </Paper>
    </div>
  );
}

export default ActiveServer;