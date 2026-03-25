import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuBar from '../../src/MainScreen/ServerAndMembers/ActiveServer/MenuBar/MenuBar.jsx';
import * as React from 'react';

vi.mock('../../src/MainScreen/ServerList/ServerBadge/ServerBadge.jsx', () => ({
  default: ({ server }) => <div data-testid="server-badge">{server?.name || 'No server'}</div>
}));

vi.mock('../../src/CommonComponents/Search/Search.jsx', () => ({
  default: ({ label }) => <div data-testid="search-component">{label}</div>
}));

vi.mock('@mui/material', () => ({
  Button: ({ children, onClick, sx }) => {
    
    if (children && children.type && children.type.name === 'default') {
      return (
        <button data-testid="members-toggle-button" onClick={onClick}>
          {children}
        </button>
      );
    }
    return (
      <button 
        data-testid={typeof children === 'string' ? "channel-button" : "members-toggle-button"} 
        onClick={onClick}
      >
        {children}
      </button>
    );
  },
  Paper: ({ children, sx }) => <div data-testid="paper-component">{children}</div>,
  Menu: ({ children, anchorEl, open, onClose }) => 
    open ? <div data-testid="menu-component">{children}</div> : null,
  MenuItem: ({ children, onClick, selected }) => 
    <div 
      data-testid="menu-item" 
      data-selected={selected || false}
      onClick={onClick}
    >
      {children}
    </div>
}));

vi.mock('@mui/icons-material/Menu', () => ({
  default: () => <div data-testid="menu-icon">MenuIcon</div>
}));

describe('MenuBar Component', () => {
  let setVisibleMock;
  let onChannelSelectMock;
  const testServer = { 
    name: 'Test Server', 
    channels: ['General', 'Gaming', 'Music'] 
  };
  
  beforeEach(() => {
    setVisibleMock = vi.fn();
    onChannelSelectMock = vi.fn();
  });
  
  it('renders without crashing', () => {
    render(
      <MenuBar 
        setVisible={setVisibleMock} 
        selectedServer={testServer}
        selectedChannel={null}
        onChannelSelect={onChannelSelectMock}
      />
    );
    expect(screen.getByTestId('paper-component')).toBeDefined();
  });
  
  it('renders ServerBadge with correct props', () => {
    render(
      <MenuBar 
        setVisible={setVisibleMock} 
        selectedServer={testServer}
        selectedChannel={null}
        onChannelSelect={onChannelSelectMock}
      />
    );
    const serverBadge = screen.getByTestId('server-badge');
    expect(serverBadge).toBeDefined();
    expect(serverBadge.textContent).toBe('Test Server');
  });
  
  it('renders Search component with correct label', () => {
    render(
      <MenuBar 
        setVisible={setVisibleMock} 
        selectedServer={testServer}
        selectedChannel={null}
        onChannelSelect={onChannelSelectMock}
      />
    );
    const searchComponent = screen.getByTestId('search-component');
    expect(searchComponent).toBeDefined();
    expect(searchComponent.textContent).toBe('Search messages');
  });
  
  it('renders menu button with icon', () => {
    render(
      <MenuBar 
        setVisible={setVisibleMock} 
        selectedServer={testServer}
        selectedChannel={null}
        onChannelSelect={onChannelSelectMock}
      />
    );
    const menuButton = screen.getByTestId('members-toggle-button');
    expect(menuButton).toBeDefined();
    const menuIcon = screen.getByTestId('menu-icon');
    expect(menuIcon).toBeDefined();
  });
  
  it('calls setVisible with opposite value when menu button is clicked', () => {
    render(
      <MenuBar 
        setVisible={setVisibleMock} 
        selectedServer={testServer}
        selectedChannel={null}
        onChannelSelect={onChannelSelectMock}
      />
    );
    const menuButton = screen.getByTestId('members-toggle-button');
    
    fireEvent.click(menuButton);
    expect(setVisibleMock).toHaveBeenCalledTimes(1);
    expect(setVisibleMock).toHaveBeenCalledWith(expect.any(Function));
    
    const updateFn = setVisibleMock.mock.calls[0][0];
    expect(updateFn(true)).toBe(false);
    expect(updateFn(false)).toBe(true);
  });

  it('displays the selected channel name in the channel button', () => {
    render(
      <MenuBar 
        setVisible={setVisibleMock} 
        selectedServer={testServer}
        selectedChannel="Gaming"
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    const channelButton = screen.getByTestId('channel-button');
    expect(channelButton).toBeDefined();
    expect(channelButton.textContent).toBe('Gaming');
  });

  it('displays "Select Channel" when no channel is selected', () => {
    render(
      <MenuBar 
        setVisible={setVisibleMock} 
        selectedServer={testServer}
        selectedChannel={null}
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    const channelButton = screen.getByTestId('channel-button');
    expect(channelButton).toBeDefined();
    expect(channelButton.textContent).toBe('Select Channel');
  });

  it('opens the channel menu when the channel button is clicked', () => {
    render(
      <MenuBar 
        setVisible={setVisibleMock} 
        selectedServer={testServer}
        selectedChannel="General"
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    const channelButton = screen.getByTestId('channel-button');
    
    // The menu should not be visible initially
    expect(screen.queryByTestId('menu-component')).toBeNull();
    
    // Click to open the menu
    fireEvent.click(channelButton);
    
    // The menu should now be visible
    const menu = screen.getByTestId('menu-component');
    expect(menu).toBeDefined();
    
    // The menu should contain the channel items
    const menuItems = screen.getAllByTestId('menu-item');
    expect(menuItems.length).toBe(3);
    expect(menuItems[0].textContent).toBe('General');
    expect(menuItems[1].textContent).toBe('Gaming');
    expect(menuItems[2].textContent).toBe('Music');
  });

  it('selects a channel when a menu item is clicked', () => {
    render(
      <MenuBar 
        setVisible={setVisibleMock} 
        selectedServer={testServer}
        selectedChannel="General"
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    const channelButton = screen.getByTestId('channel-button');
    
    // Click to open the menu
    fireEvent.click(channelButton);
    
    // Click on the Gaming channel
    const menuItems = screen.getAllByTestId('menu-item');
    fireEvent.click(menuItems[1]);  // Gaming channel
    
    // The onChannelSelect should be called with "Gaming"
    expect(onChannelSelectMock).toHaveBeenCalledWith('Gaming');
  });

  it('marks the current selected channel as selected in the menu', () => {
    render(
      <MenuBar 
        setVisible={setVisibleMock} 
        selectedServer={testServer}
        selectedChannel="General"
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    const channelButton = screen.getByTestId('channel-button');
    
    // Click to open the menu
    fireEvent.click(channelButton);
    
    // Get the menu items
    const menuItems = screen.getAllByTestId('menu-item');
    
    // Check that the General channel is marked as selected
    expect(menuItems[0].getAttribute('data-selected')).toBe('true');
    
    // Check that the other channels are not selected
    expect(menuItems[1].getAttribute('data-selected')).toBe('false');
    expect(menuItems[2].getAttribute('data-selected')).toBe('false');
  });

  it('handles the case when selectedServer has no channels', () => {
    render(
      <MenuBar 
        setVisible={setVisibleMock} 
        selectedServer={{ name: 'Empty Server', channels: [] }}
        selectedChannel={null}
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    const channelButton = screen.getByTestId('channel-button');
    
    // Click to open the menu
    fireEvent.click(channelButton);
    
    // The menu should be visible but have no items
    const menu = screen.getByTestId('menu-component');
    expect(menu).toBeDefined();
    expect(screen.queryAllByTestId('menu-item').length).toBe(0);
  });

  it('handles the case when selectedServer is null', () => {
    render(
      <MenuBar 
        setVisible={setVisibleMock} 
        selectedServer={null}
        selectedChannel={null}
        onChannelSelect={onChannelSelectMock}
      />
    );
    
    // Server badge should still render with a default value
    const serverBadge = screen.getByTestId('server-badge');
    expect(serverBadge.textContent).toBe('No server');
    
    // Channel button should show "Select Channel"
    const channelButton = screen.getByTestId('channel-button');
    expect(channelButton.textContent).toBe('Select Channel');
  });
});