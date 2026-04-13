import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ServerList from '../MainScreen/ServerList/ServerList.jsx';
import * as React from 'react';

/**
 * CustomUserBadge is not exported from ServerList.jsx so we test it
 * through the parent ServerList component.
 *
 * Component structure being tested (from ServerList.jsx):
 *   CustomUserBadge
 *     props: user, status, online, img, about, onEditProfile
 *     renders:
 *       - Avatar  (src={img}, alt={user})
 *       - username div  (fontWeight: bold)
 *       - status dot    (div with backgroundColor: statusConfig.color)
 *       - status label  (text: statusConfig.label)
 *       - about snippet (only when about prop is truthy)
 *       - Edit button   (calls onEditProfile on click)
 *
 * USER_STATUSES (from ServerList.jsx):
 *   online          -> label "Online",    color "green"
 *   away            -> label "Away",      color "orange"
 *   do-not-disturb  -> label "DND",       color "red"
 *   invisible       -> label "Invisible", color "gray"
 *
 * Default YourUser state:
 *   { name: "Your Username", status: "online",
 *     icon: "/default-profile.png", about: "Hello! I'm using the app." }
 */

const servers = [
  { id: 1, name: 'test1', icon: 'public/vite.svg', channels: ['General'] },
];

describe('CustomUserBadge', () => {
  let onServerSelectMock;
  let onChannelSelectMock;

  beforeEach(() => {
    onServerSelectMock = vi.fn();
    onChannelSelectMock = vi.fn();
  });

  function renderBadge() {
    render(
      <ServerList
        servers={servers}
        onServerSelect={onServerSelectMock}
        onChannelSelect={onChannelSelectMock}
      />
    );
  }

  // ── Rendering ───────────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    expect(() => renderBadge()).not.toThrow();
  });

  it('displays the username', () => {
    renderBadge();
    expect(screen.getByText('Your Username')).toBeInTheDocument();
  });

  it('renders the Edit button', () => {
    renderBadge();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('displays the About Me text', () => {
    renderBadge();
    expect(screen.getByText("Hello! I'm using the app.")).toBeInTheDocument();
  });

  // ── Default status (online) ─────────────────────────────────────────────────

  it('displays "Online" status label by default', () => {
    renderBadge();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  // ── Status changes reflected after profile save ─────────────────────────────
  // We change status via the ProfileEditModal and assert the badge updates.

  function saveStatus(statusValue, statusLabel) {
    renderBadge();
    // open modal
    fireEvent.click(screen.getByText('Edit'));
    // MUI Select — click the currently displayed value to open the listbox,
    // then click the desired option
    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    fireEvent.click(screen.getByText(statusLabel));
    // save
    fireEvent.click(screen.getByText('Save'));
  }

  it('displays "Away" label after switching status to away', () => {
    saveStatus('away', 'Away');
    expect(screen.getByText('Away')).toBeInTheDocument();
  });

  it('displays "DND" label after switching status to do-not-disturb', () => {
    saveStatus('do-not-disturb', 'DND');
    expect(screen.getByText('DND')).toBeInTheDocument();
  });

  it('displays "Invisible" label after switching status to invisible', () => {
    saveStatus('invisible', 'Invisible');
    expect(screen.getByText('Invisible')).toBeInTheDocument();
  });

  // ── Edit button interaction ─────────────────────────────────────────────────

  it('opens the profile edit modal when Edit is clicked', () => {
    renderBadge();
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });

  // ── Username update reflected immediately ───────────────────────────────────

  it('shows the new username in the badge after saving', () => {
    renderBadge();
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'UpdatedUser' },
    });
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText('UpdatedUser')).toBeInTheDocument();
    expect(screen.queryByText('Your Username')).not.toBeInTheDocument();
  });

  // ── About Me update reflected immediately ───────────────────────────────────

  it('shows the new About Me text in the badge after saving', () => {
    renderBadge();
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.change(screen.getByLabelText('About Me'), {
      target: { value: 'New bio here' },
    });
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText('New bio here')).toBeInTheDocument();
  });

  it('removes the old About Me text after it is cleared and saved', () => {
    renderBadge();
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.change(screen.getByLabelText('About Me'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByText('Save'));
    expect(
      screen.queryByText("Hello! I'm using the app.")
    ).not.toBeInTheDocument();
  });
});