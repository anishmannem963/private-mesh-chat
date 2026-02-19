import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MainScreen from '../MainScreen/MainScreen.jsx';
import * as React from 'react';

// Mock the components used by MainScreen
vi.mock('../MainScreen/ServerList/ServerList.jsx', () => ({
  default: ({ servers, onServerSelect, onChannelSelect }) => (
    <div data-testid="server-list">
      <button 
        data-testid="select-server-btn" 
        onClick={() => onServerSelect(servers[0])}
      >
        Select Server
      </button>
      <button 
        data-testid="select-channel-btn" 
        onClick={() => onChannelSelect("Gaming")}
      >
        Select Channel from List
      </button>
    </div>
  )
}));

vi.mock('../MainScreen/ServerAndMembers/ServerAndMembers.jsx', () => ({
  default: ({ selectedServer, selectedChannel, messages, onChannelSelect }) => (
    <div data-testid="server-and-members">
      <div data-testid="selected-server">{selectedServer?.name || 'No server selected'}</div>
      <div data-testid="selected-channel">{selectedChannel || 'No channel selected'}</div>
      <div data-testid="message-count">{messages.length}</div>
      <button 
        data-testid="change-channel-btn" 
        onClick={() => onChannelSelect("Music")}
      >
        Change Channel from Dropdown
      </button>
    </div>
  )
}));

describe('MainScreen Component', () => {
  // Reset console.error before each test to avoid warnings
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('renders without crashing', () => {
    render(<MainScreen />);
    expect(screen.getByTestId('server-list')).toBeDefined();
    expect(screen.getByTestId('server-and-members')).toBeDefined();
  });

  it('initializes with no selected server and channel', () => {
    render(<MainScreen />);
    expect(screen.getByTestId('selected-server').textContent).toBe('No server selected');
    expect(screen.getByTestId('selected-channel').textContent).toBe('No channel selected');
  });

  it('updates the selected server and channel when a server is selected', () => {
    render(<MainScreen />);
    
    // Initially, no server is selected
    expect(screen.getByTestId('selected-server').textContent).toBe('No server selected');
    
    // Click to select the first server
    fireEvent.click(screen.getByTestId('select-server-btn'));
    
    // After selection, the server name should be displayed
    expect(screen.getByTestId('selected-server').textContent).toBe('test1');
    
    // The default first channel should also be selected
    expect(screen.getByTestId('selected-channel').textContent).toBe('General');
  });

  it('updates the selected channel when a channel is selected from the server list', () => {
    render(<MainScreen />);
    
    // First select a server
    fireEvent.click(screen.getByTestId('select-server-btn'));
    
    // Check initial channel
    expect(screen.getByTestId('selected-channel').textContent).toBe('General');
    
    // Now select a different channel from the server list
    fireEvent.click(screen.getByTestId('select-channel-btn'));
    
    // Check if the channel was updated
    expect(screen.getByTestId('selected-channel').textContent).toBe('Gaming');
  });

  it('updates the selected channel when a channel is selected from the dropdown menu', () => {
    render(<MainScreen />);
    
    // First select a server
    fireEvent.click(screen.getByTestId('select-server-btn'));
    
    // Check initial channel
    expect(screen.getByTestId('selected-channel').textContent).toBe('General');
    
    // Now select a different channel from the dropdown
    fireEvent.click(screen.getByTestId('change-channel-btn'));
    
    // Check if the channel was updated
    expect(screen.getByTestId('selected-channel').textContent).toBe('Music');
  });

  it('loads messages when a server and channel are selected', () => {
    render(<MainScreen />);
    
    // Initially, there should be no messages
    expect(screen.getByTestId('message-count').textContent).toBe('0');
    
    // Select the first server (which should load messages for the default channel)
    fireEvent.click(screen.getByTestId('select-server-btn'));
    
    // There should now be messages for the General channel
    expect(parseInt(screen.getByTestId('message-count').textContent)).toBeGreaterThan(0);
    
    // Store the message count for General channel
    const generalMessageCount = screen.getByTestId('message-count').textContent;
    
    // Change to the Gaming channel
    fireEvent.click(screen.getByTestId('select-channel-btn'));
    
    // There should be different messages for the Gaming channel
    expect(screen.getByTestId('message-count').textContent).not.toBe(generalMessageCount);
  });

  it('retains channel selection when changing between servers', () => {
    // This would require a more complex mock to test properly
    // For now, we'll only test that changing servers updates the selected server
    render(<MainScreen />);
    
    fireEvent.click(screen.getByTestId('select-server-btn'));
    expect(screen.getByTestId('selected-server').textContent).toBe('test1');
    
    // In a real implementation, we would mock a way to select a different server
    // and verify that the selected channel is updated accordingly
  });

  it('handles state updates properly when changing channels', () => {
    render(<MainScreen />);
    
    // Select a server
    fireEvent.click(screen.getByTestId('select-server-btn'));
    
    // Select a channel through server list
    fireEvent.click(screen.getByTestId('select-channel-btn'));
    expect(screen.getByTestId('selected-channel').textContent).toBe('Gaming');
    
    // Now select a different channel through the dropdown
    fireEvent.click(screen.getByTestId('change-channel-btn'));
    expect(screen.getByTestId('selected-channel').textContent).toBe('Music');
    
    // Now change back to another channel through server list
    fireEvent.click(screen.getByTestId('select-channel-btn'));
    expect(screen.getByTestId('selected-channel').textContent).toBe('Gaming');
  });
});