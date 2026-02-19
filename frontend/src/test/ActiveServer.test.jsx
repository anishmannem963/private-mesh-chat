import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActiveServer from '../MainScreen/ServerAndMembers/ActiveServer/ActiveServer.jsx';
import * as React from 'react';

// Mock the components used by ActiveServer
vi.mock('../CommonComponents/Search/Search.jsx', () => ({
  default: ({ label }) => <div data-testid="search-component">{label}</div>
}));

vi.mock('../MainScreen/ServerList/ServerBadge/ServerBadge.jsx', () => ({
  default: ({ server }) => <div data-testid="server-badge">{server?.name || 'No server'}</div>
}));

vi.mock('../MainScreen/ServerAndMembers/ActiveServer/MenuBar/MenuBar.jsx', () => ({
  default: ({ setVisible, selectedServer, selectedChannel, onChannelSelect }) => (
    <div data-testid="menu-bar">
      <div data-testid="menu-server">{selectedServer?.name || 'No server'}</div>
      <div data-testid="menu-channel">{selectedChannel || 'No channel'}</div>
      <button 
        data-testid="menu-visible-toggle" 
        onClick={() => setVisible(prev => !prev)}
      >
        Toggle Visible
      </button>
      <button 
        data-testid="menu-channel-change" 
        onClick={() => onChannelSelect('NewChannel')}
      >
        Change Channel
      </button>
    </div>
  )
}));

vi.mock('@mui/material', () => ({
  Paper: ({ children, elevation, sx, className }) => (
    <div data-testid="paper-component" data-elevation={elevation} className={className}>
      {children}
    </div>
  ),
  TextField: ({ sx, placeholder, value, onChange, onKeyPress }) => (
    <input 
      data-testid="text-field"
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
      onKeyPress={onKeyPress}
    />
  )
}));

describe('ActiveServer Component', () => {
  let setVisibleMock;
  let onChannelSelectMock;
  
  const sampleServer = { 
    id: 1, 
    name: "test1", 
    icon: "public/vite.svg", 
    channels: ["General", "Gaming", "Music"] 
  };
  
  const sampleMessages = [
    { id: 1, user: "Alice", text: "Hello!" },
    { id: 2, user: "Bob", text: "Hi there!" }
  ];
  
  beforeEach(() => {
    setVisibleMock = vi.fn();
    onChannelSelectMock = vi.fn();
  });
  
  it('renders a placeholder when no server is selected', () => {
    render(
      <ActiveServer 
        setVisible={setVisibleMock}
        selectedServer={null}
        selectedChannel={null}
        messages={[]}
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    expect(screen.getByText('Select a server to start chatting')).toBeDefined();
  });
  
  it('renders the main chat interface when a server is selected', () => {
    render(
      <ActiveServer 
        setVisible={setVisibleMock}
        selectedServer={sampleServer}
        selectedChannel="General"
        messages={sampleMessages}
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    expect(screen.getByTestId('menu-bar')).toBeDefined();
    expect(screen.getByTestId('text-field')).toBeDefined();
    expect(screen.getByText('Send')).toBeDefined();
  });
  
  it('passes the correct props to MenuBar', () => {
    render(
      <ActiveServer 
        setVisible={setVisibleMock}
        selectedServer={sampleServer}
        selectedChannel="General"
        messages={sampleMessages}
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    expect(screen.getByTestId('menu-server').textContent).toBe('test1');
    expect(screen.getByTestId('menu-channel').textContent).toBe('General');
  });
  
  it('displays messages correctly', () => {
    render(
      <ActiveServer 
        setVisible={setVisibleMock}
        selectedServer={sampleServer}
        selectedChannel="General"
        messages={sampleMessages}
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    expect(screen.getByText('Alice:')).toBeDefined();
    expect(screen.getByText('Hello!')).toBeDefined();
    expect(screen.getByText('Bob:')).toBeDefined();
    expect(screen.getByText('Hi there!')).toBeDefined();
  });
  
  it('forwards channel selection from MenuBar', () => {
    render(
      <ActiveServer 
        setVisible={setVisibleMock}
        selectedServer={sampleServer}
        selectedChannel="General"
        messages={sampleMessages}
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    fireEvent.click(screen.getByTestId('menu-channel-change'));
    expect(onChannelSelectMock).toHaveBeenCalledWith('NewChannel');
  });
  
  it('allows sending messages when a server and channel are selected', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(
      <ActiveServer 
        setVisible={setVisibleMock}
        selectedServer={sampleServer}
        selectedChannel="General"
        messages={sampleMessages}
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    const textField = screen.getByTestId('text-field');
    fireEvent.change(textField, { target: { value: 'Test message' } });
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Sending message:', 'Test message');
    
    expect(textField.value).toBe('');
    
    consoleSpy.mockRestore();
  });
  
  it('does not send empty messages', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(
      <ActiveServer 
        setVisible={setVisibleMock}
        selectedServer={sampleServer}
        selectedChannel="General"
        messages={sampleMessages}
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('handles message sending via Enter key', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(
      <ActiveServer 
        setVisible={setVisibleMock}
        selectedServer={sampleServer}
        selectedChannel="General"
        messages={sampleMessages}
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    const textField = screen.getByTestId('text-field');
    fireEvent.change(textField, { target: { value: 'Test message with Enter' } });
    
    fireEvent.keyPress(textField, { key: 'Enter', code: 13, charCode: 13 });
    
    expect(consoleSpy).toHaveBeenCalledWith('Sending message:', 'Test message with Enter');
    
    consoleSpy.mockRestore();
  });

  it('does not call onChannelSelect when no channel is selected', () => {
    render(
      <ActiveServer 
        setVisible={setVisibleMock}
        selectedServer={sampleServer}
        selectedChannel={null}
        messages={[]}
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    expect(screen.getByTestId('menu-channel').textContent).toBe('No channel');
    
    fireEvent.click(screen.getByTestId('menu-channel-change'));
    
    expect(onChannelSelectMock).toHaveBeenCalledWith('NewChannel');
  });
});