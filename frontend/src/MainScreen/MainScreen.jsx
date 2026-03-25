import React, { useState } from 'react'
import './MainScreen.css'
import ServerAndMembers from "./ServerAndMembers/ServerAndMembers.jsx";
import ServerList from "./ServerList/ServerList.jsx";

// IMPROVEMENT: Create mock messages structure to simulate backend
const mockMessages = {
  1: {
    "General": [
      { id: 1, user: "Alice", text: "Welcome to the server!" },
      { id: 2, user: "Bob", text: "Hey everyone!" }
    ],
    "Gaming": [
      { id: 3, user: "Charlie", text: "Anyone up for a game?" }
    ]
  },
  2: {
    "General": [
      { id: 4, user: "Dave", text: "New server, who dis?" }
    ],
    "Discussions": [
      { id: 5, user: "Eve", text: "Let's discuss something interesting!" }
    ]
  }
};

function MainScreen() {
  // IMPROVEMENT: Centralized state management for server and channel
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);

  // IMPROVEMENT: Unified server selection handler
  const handleServerSelect = (server) => {
    setSelectedServer(server);
    
    // Default to first channel if exists
    if (server && server.channels && server.channels.length > 0) {
      setSelectedChannel(server.channels[0]);
      
      // Fetch messages for the selected server and channel
      const serverMessages = mockMessages[server.id]?.[server.channels[0]] || [];
      setMessages(serverMessages);
    } else {
      setSelectedChannel(null);
      setMessages([]);
    }
  };

  // IMPROVEMENT: Channel selection handler
  const handleChannelSelect = (channel) => {
    if (selectedServer) {
      setSelectedChannel(channel);
      
      // Fetch messages for the selected channel
      const channelMessages = mockMessages[selectedServer.id]?.[channel] || [];
      setMessages(channelMessages);
    }
  };


  const servers = [
    { id: 1, name: "test1", icon: "public/vite.svg", channels: ["General", "Gaming", "Music"] },
    { id: 2, name: "test2", icon: "public/vite.svg", channels: ["General", "Discussions", "Voice"] },
    { id: 3, name: "Test1", icon: "public/vite.svg", channels: ["Forum", "one", "two"] },
    { id: 4, name: "Test2", icon: "public/vite.svg", channels: ["dljfnadll", "Gadlfkndlg", "fkld"] },
    { id: 5, name: "thisIsATest1", icon: "public/vite.svg", channels: ["kn", "dknf", "kdlfna"] },
    { id: 6, name: "Alice", icon: "public/vite.svg", channels: ["1", "2", "3"] },
    { id: 7, name: "George", icon: "public/vite.svg", channels: ["H", "E", "Y"] }
  ];

  return (
    <div className="ColorBox" style={{ display: "flex", height: "100vh", width: "100vw"}}>
      <ServerList 
        servers={servers} 
        onServerSelect={handleServerSelect}
        onChannelSelect={handleChannelSelect} 
      />
      <ServerAndMembers 
        selectedServer={selectedServer}
        selectedChannel={selectedChannel}
        messages={messages}
        onChannelSelect={handleChannelSelect}
      />
    </div>
  );
}

export default MainScreen;