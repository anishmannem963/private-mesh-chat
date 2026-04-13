import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ServerList from '../MainScreen/ServerList/ServerList.jsx';
import * as React from 'react';

/**
 * ProfileEditModal is not exported from ServerList.jsx so we test it
 * through the parent ServerList component — open it via the Edit button,
 * interact with it, then assert outcomes on the rendered sidebar.
 *
 * Component structure being tested (from ServerList.jsx):
 *   ProfileEditModal
 *     props: open, onClose, user, onUpdateUser
 *     fields: Username (TextField label="Username")
 *             Status   (Select)
 *             About Me (TextField label="About Me", multiline)
 *             Avatar   (clickable label -> hidden file input)
 *     actions: Cancel button  -> calls onClose, discards changes
 *              Save button    -> calls onUpdateUser(editedUser), then onClose
 *
 * Default YourUser state inside ServerList:
 *   { name: "Your Username", status: "online", icon: "/default-profile.png",
 *     about: "Hello! I'm using the app." }
 */

const servers = [
  { id: 1, name: 'test1', icon: 'public/vite.svg', channels: ['General'] },
];

describe('ProfileEditModal', () => {
  let onServerSelectMock;
  let onChannelSelectMock;

  beforeEach(() => {
    onServerSelectMock = vi.fn();
    onChannelSelectMock = vi.fn();
  });

  // helper — renders ServerList and opens the modal
  function renderAndOpen() {
    render(
      <ServerList
        servers={servers}
        onServerSelect={onServerSelectMock}
        onChannelSelect={onChannelSelectMock}
      />
    );
    fireEvent.click(screen.getByText('Edit'));
  }

  // ── Visibility ──────────────────────────────────────────────────────────────

  it('modal is not visible before the Edit button is clicked', () => {
    render(
      <ServerList
        servers={servers}
        onServerSelect={onServerSelectMock}
        onChannelSelect={onChannelSelectMock}
      />
    );
    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
  });

  it('modal opens when the Edit button is clicked', () => {
    renderAndOpen();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });

  // ── Pre-filled values ───────────────────────────────────────────────────────

  it('pre-fills the Username field with the current username', () => {
    renderAndOpen();
    const usernameField = screen.getByLabelText('Username');
    expect(usernameField.value).toBe('Your Username');
  });

  it('pre-fills the About Me field with the current about text', () => {
    renderAndOpen();
    const aboutField = screen.getByLabelText('About Me');
    expect(aboutField.value).toBe("Hello! I'm using the app.");
  });

  // ── Cancel ──────────────────────────────────────────────────────────────────

  it('closes the modal when Cancel is clicked', () => {
    renderAndOpen();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
  });

  it('does not save changes when Cancel is clicked', () => {
    renderAndOpen();
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'ShouldNotSave' },
    });
    fireEvent.click(screen.getByText('Cancel'));
    // modal gone
    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
    // original username still shown in sidebar
    expect(screen.getByText('Your Username')).toBeInTheDocument();
    // the typed value never made it to the sidebar
    expect(screen.queryByText('ShouldNotSave')).not.toBeInTheDocument();
  });

  // ── Save ────────────────────────────────────────────────────────────────────

  it('closes the modal when Save is clicked', () => {
    renderAndOpen();
    fireEvent.click(screen.getByText('Save'));
    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
  });

  it('updates the displayed username after saving a new name', () => {
    renderAndOpen();
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'NewUsername' },
    });
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText('NewUsername')).toBeInTheDocument();
  });

  it('updates the displayed About Me text after saving', () => {
    renderAndOpen();
    fireEvent.change(screen.getByLabelText('About Me'), {
      target: { value: 'My updated bio' },
    });
    fireEvent.click(screen.getByText('Save'));
    // bio is shown in the CustomUserBadge sidebar
    expect(screen.getByText('My updated bio')).toBeInTheDocument();
  });

  // ── Status selector ─────────────────────────────────────────────────────────

  it('shows all four status options in the dropdown', () => {
    renderAndOpen();
    // MUI Select renders options as role="option" inside the listbox
    // The options exist in the DOM even when the menu is closed
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText('Away')).toBeInTheDocument();
    expect(screen.getByText('DND')).toBeInTheDocument();
    expect(screen.getByText('Invisible')).toBeInTheDocument();
  });

  // ── State reset on re-open ──────────────────────────────────────────────────

  it('resets unsaved edits when the modal is closed then reopened', () => {
    renderAndOpen();
    // type a new name but cancel
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'Cancelled Name' },
    });
    fireEvent.click(screen.getByText('Cancel'));

    // reopen
    fireEvent.click(screen.getByText('Edit'));
    // field should show the original value, not the cancelled one
    expect(screen.getByLabelText('Username').value).toBe('Your Username');
  });

  // ── Consecutive saves ───────────────────────────────────────────────────────

  it('reflects the latest saved value after multiple saves', () => {
    renderAndOpen();
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'FirstSave' },
    });
    fireEvent.click(screen.getByText('Save'));

    // reopen and save again
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'SecondSave' },
    });
    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('SecondSave')).toBeInTheDocument();
    expect(screen.queryByText('FirstSave')).not.toBeInTheDocument();
  });
});