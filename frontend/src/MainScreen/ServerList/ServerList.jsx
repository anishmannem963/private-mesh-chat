import React, { useState, useCallback, useMemo } from 'react';
import UserBadge from "../../UserBadge/UserBadge.jsx";
import { List, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar, Select, MenuItem } from "@mui/material";
import ServerBadge from "./ServerBadge/ServerBadge.jsx";
import Search from "../../CommonComponents/Search/Search.jsx";
import "./ServerList.css";

// Constants for user statuses
const USER_STATUSES = [
  { value: 'online', label: 'Online', color: 'green' },
  { value: 'away', label: 'Away', color: 'orange' },
  { value: 'do-not-disturb', label: 'DND', color: 'red' },
  { value: 'invisible', label: 'Invisible', color: 'gray' }
];

// Create a context for global server state
export const ServerContext = React.createContext();

function ProfileEditModal({ 
  open, 
  onClose, 
  user, 
  onUpdateUser 
}) {
  const [editedUser, setEditedUser] = useState({ ...user });
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setEditedUser(prev => ({ ...prev, icon: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdateUser(editedUser);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1rem' 
        }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-image-upload"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="profile-image-upload">
            <Avatar 
              src={selectedImage || editedUser.icon} 
              sx={{ 
                width: 100, 
                height: 100, 
                cursor: 'pointer' 
              }} 
            />
          </label>
          
          <TextField
            fullWidth
            label="Username"
            value={editedUser.name}
            onChange={(e) => setEditedUser(prev => ({ 
              ...prev, 
              name: e.target.value 
            }))}
          />
          
          <Select
            fullWidth
            value={editedUser.status}
            onChange={(e) => setEditedUser(prev => ({ 
              ...prev, 
              status: e.target.value 
            }))}
          >
            {USER_STATUSES.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </Select>
          
          <TextField
            fullWidth
            label="About Me"
            multiline
            rows={4}
            value={editedUser.about || ''}
            onChange={(e) => setEditedUser(prev => ({ 
              ...prev, 
              about: e.target.value 
            }))}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

function CustomUserBadge({ 
  user, 
  status, 
  online, 
  img, 
  about,
  onEditProfile 
}) {
  const statusConfig = USER_STATUSES.find(s => s.value === status) || 
                       { value: 'online', label: 'Online', color: 'green' };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '1rem', 
      position: 'relative' 
    }}>
      <Avatar 
        src={img} 
        alt={user} 
        sx={{ 
          width: 50, 
          height: 50, 
          marginRight: '1rem' 
        }} 
      />
      <div>
        <div style={{ fontWeight: 'bold' }}>{user}</div>
        <div 
          style={{ 
            color: statusConfig.color, 
            display: 'flex', 
            alignItems: 'center' 
          }}
        >
          <div 
            style={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              backgroundColor: statusConfig.color, 
              marginRight: '0.5rem' 
            }}
          />
          {statusConfig.label}
        </div>
        {about && (
          <div style={{ 
            color: 'gray', 
            fontSize: '0.8rem', 
            marginTop: '0.25rem' 
          }}>
            {about}
          </div>
        )}
      </div>
      <Button 
        onClick={onEditProfile}
        style={{ 
          position: 'absolute', 
          right: 10, 
          top: '50%', 
          transform: 'translateY(-50%)' 
        }}
      >
        Edit
      </Button>
    </div>
  );
}

function ServerList({ servers, onServerSelect, onChannelSelect }) {
  const [state, setState] = useState({
    query: "",
    selectedServer: null,
    selectedChannel: null,
    newChannelName: "",
    showAddChannelForm: false,
    joinServerInput: "",
    isProfileEditOpen: false,
    YourUser: {
      name: "Your Username",
      status: "online",
      online: true,
      icon: "/default-profile.png",
      about: "Hello! I'm using the app."
    }
  });

  const handleServerSearch = useCallback((event) => {
    setState(prev => ({ ...prev, query: event.target.value }));
  }, []);

  const handleServerClick = useCallback((server) => {
    setState(prev => ({ 
      ...prev, 
      selectedServer: server,
      selectedChannel: server.channels && server.channels.length > 0 ? server.channels[0] : null,
      showAddChannelForm: false
    }));
    
    // Propagate server selection to parent
    onServerSelect(server);
    
    // Also select the first channel by default
    if (server.channels && server.channels.length > 0) {
      onChannelSelect(server.channels[0]);
    }
  }, [onServerSelect, onChannelSelect]);

  const handleChannelClick = useCallback((channel) => {
    setState(prev => ({
      ...prev,
      selectedChannel: channel
    }));
    
    // Propagate channel selection to parent
    onChannelSelect(channel);
  }, [onChannelSelect]);

  const handleInputChange = useCallback((field, value) => {
    setState(prev => ({ ...prev, [field]: value }));
  }, []);

  const filteredServers = useMemo(() => 
    servers.filter((server) => 
      server.name.toLowerCase().includes(state.query.toLowerCase())
    ), 
    [servers, state.query]
  );

  const searchServer = useCallback((event) => {
    event.preventDefault();
    const serverId = state.joinServerInput.trim();
    
    if (serverId) {
      console.log("Attempting to join server with ID:", serverId);
      setState(prev => ({ ...prev, joinServerInput: "" }));
    }
  }, [state.joinServerInput]);

  const handleAddChannel = useCallback((event) => {
    event.preventDefault();
    const channelName = state.newChannelName.trim();
    
    if (channelName && state.selectedServer) {
      const updatedServer = {
        ...state.selectedServer,
        channels: [...(state.selectedServer.channels || []), channelName]
      };

      setState(prev => ({
        ...prev,
        selectedServer: updatedServer,
        newChannelName: "",
        showAddChannelForm: false
      }));

      // Notify parent of channel addition
      onServerSelect(updatedServer);
    }
  }, [state.newChannelName, state.selectedServer, onServerSelect]);

  const handleUpdateUser = useCallback((updatedUser) => {
    setState(prev => ({
      ...prev,
      YourUser: updatedUser,
      isProfileEditOpen: false
    }));
  }, []);

  return (
    <ServerContext.Provider value={state.selectedServer}>
      <div style={{ display: "flex" }}>
        <Paper elevation={3} sx={{
          borderRadius: 7.5,
          display: "flex",
          flexDirection: "column",
          width: "15rem",
          height: "calc(100vh - 2rem)",
          margin: "1rem",
          overflow: "hidden"
        }}>
          <CustomUserBadge 
            user={state.YourUser.name} 
            status={state.YourUser.status} 
            online={state.YourUser.online} 
            img={state.YourUser.icon}
            about={state.YourUser.about}
            onEditProfile={() => handleInputChange('isProfileEditOpen', true)}
          />
          <Search 
            id="serverSearchInput" 
            return={handleServerSearch} 
          />
          <List sx={{
            display: "flex", 
            flexDirection: "column", 
            width: "100%", 
            height: "100%", 
            overflow: "auto"
          }}>
            <div id="serverBadgeHolder">
              {filteredServers.map((server) => (
                <li
                  key={server.id}
                  onClick={() => handleServerClick(server)}
                  style={{ cursor: "pointer" }}
                >
                  <ServerBadge server={server} />
                </li>
              ))}
            </div>
          </List>
          <div className="joinServer">
            <form onSubmit={searchServer}>
              <input 
                name="serverID" 
                placeholder="Enter a Server ID" 
                value={state.joinServerInput}
                onChange={(e) => handleInputChange('joinServerInput', e.target.value)}
              />
              <button type="submit">Join</button>
            </form>
          </div>
        </Paper>
        
        {state.selectedServer && (
          <Paper elevation={3} sx={{
            borderRadius: 7.5,
            display: "flex",
            flexDirection: "column",
            width: "15rem",
            height: "calc(100vh - 2rem)",
            margin: "1rem",
            overflow: "hidden"
          }}>
            <h3 style={{ textAlign: "center", marginTop: "1rem" }}>
              {state.selectedServer.name} Channels
            </h3>
            
            <List sx={{ overflow: 'auto', flexGrow: 1 }}>
              {state.selectedServer.channels && state.selectedServer.channels.map((channel, index) => (
                <li 
                  key={`${state.selectedServer.id}-channel-${index}`}
                  style={{ 
                    cursor: "pointer",
                    backgroundColor: state.selectedChannel === channel ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                  }}
                  onClick={() => handleChannelClick(channel)}
                >
                  <ServerBadge 
                    server={{ 
                      id: `${state.selectedServer.id}-channel-${index}`, 
                      name: channel 
                    }} 
                  />
                </li>
              ))}
            </List>
            
            {state.showAddChannelForm ? (
              <div className="addChannelForm">
                <form onSubmit={handleAddChannel}>
                  <input
                    type="text"
                    value={state.newChannelName}
                    onChange={(e) => handleInputChange('newChannelName', e.target.value)}
                    placeholder="Channel name"
                  />
                  <div className="formButtons">
                    <button type="submit">Add</button>
                    <button 
                      type="button" 
                      onClick={() => handleInputChange('showAddChannelForm', false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="addChannelButton">
                <button onClick={() => handleInputChange('showAddChannelForm', true)}>
                  + Add Channel
                </button>
              </div>
            )}
          </Paper>
        )}
      </div>

      <ProfileEditModal 
        open={state.isProfileEditOpen}
        onClose={() => handleInputChange('isProfileEditOpen', false)}
        user={state.YourUser}
        onUpdateUser={handleUpdateUser}
      />
    </ServerContext.Provider>
  );
}

export default ServerList;