import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// FIXED: was '../../src/...' — correct relative path from src/test/
import MenuBar from '../MainScreen/ServerAndMembers/ActiveServer/MenuBar/MenuBar.jsx';
import * as React from 'react';

vi.mock('../MainScreen/ServerList/ServerBadge/ServerBadge.jsx', () => ({
  default: ({ server }) => <div data-testid="server-badge">{server?.name || 'No server'}</div>
}));

vi.mock('../CommonComponents/Search/Search.jsx', () => ({
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
        data-testid={typeof children === 'string' ? 'channel-button' : 'members-toggle-button'}
        onClick={onClick}
      >
        {children}
      </button>
    );
  },
  Paper:    ({ children, sx }) => <div data-testid="paper-component">{children}</div>,
  Menu:     ({ children, anchorEl, open, onClose }) =>
    open ? <div data-testid="menu-component">{children}</div> : null,
  MenuItem: ({ children, onClick, selected }) => (
    <div
      data-testid="menu-item"
      data-selected={selected || false}
      onClick={onClick}
    >
      {children}
    </div>
  ),
}));

vi.mock('@mui/icons-material/Menu', () => ({
  default: () => <div data-testid="menu-icon">MenuIcon</div>
}));

describe('MenuBar Component', () => {
  let setVisibleMock;
  let onChannelSelectMock;
  const testServer = {
    name: 'Test Server',
    channels: ['General', 'Gaming', 'Music'],
  };

  beforeEach(() => {
    setVisibleMock      = vi.fn();
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
    expect(screen.getByTestId('search-component').textContent).toBe('Search messages');
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
    expect(screen.getByTestId('members-toggle-button')).toBeDefined();
    expect(screen.getByTestId('menu-icon')).toBeDefined();
  });

  it('calls setVisible with a toggle function when menu button is clicked', () => {
    render(
      <MenuBar
        setVisible={setVisibleMock}
        selectedServer={testServer}
        selectedChannel={null}
        onChannelSelect={onChannelSelectMock}
      />
    );
    fireEvent.click(screen.getByTestId('members-toggle-button'));
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
    expect(screen.getByTestId('channel-button').textContent).toBe('Gaming');
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
    expect(screen.getByTestId('channel-button').textContent).toBe('Select Channel');
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
    expect(screen.queryByTestId('menu-component')).toBeNull();
    fireEvent.click(screen.getByTestId('channel-button'));

    expect(screen.getByTestId('menu-component')).toBeDefined();
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
    fireEvent.click(screen.getByTestId('channel-button'));
    fireEvent.click(screen.getAllByTestId('menu-item')[1]); // Gaming
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
    fireEvent.click(screen.getByTestId('channel-button'));
    const menuItems = screen.getAllByTestId('menu-item');
    expect(menuItems[0].getAttribute('data-selected')).toBe('true');
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
    fireEvent.click(screen.getByTestId('channel-button'));
    expect(screen.getByTestId('menu-component')).toBeDefined();
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
    expect(screen.getByTestId('server-badge').textContent).toBe('No server');
    expect(screen.getByTestId('channel-button').textContent).toBe('Select Channel');
  });
});