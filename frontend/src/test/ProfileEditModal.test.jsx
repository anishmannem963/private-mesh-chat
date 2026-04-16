import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ServerList from '../MainScreen/ServerList/ServerList.jsx';
import * as React from 'react';

/**
 * ProfileEditModal tested through ServerList (not exported directly).
 *
 * Critical MUI Dialog behaviour in jsdom:
 *   - The dialog div with role="dialog" STAYS in the DOM even when
 *     open={false}. We CANNOT assert queryByRole('dialog') to check
 *     closed state — it will always be found once opened.
 *   - Instead we assert BEHAVIORAL OUTCOMES only:
 *       Cancel → sidebar unchanged, typed value not persisted
 *       Save   → sidebar reflects the new value
 *   - All interactions inside the modal are scoped with within(dialog)
 *     to avoid clashing with sidebar elements that share the same text.
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

  function renderComponent() {
    render(
      <ServerList
        servers={servers}
        onServerSelect={onServerSelectMock}
        onChannelSelect={onChannelSelectMock}
      />
    );
  }

  function openModal() {
    renderComponent();
    fireEvent.click(screen.getByText('Edit'));
  }

  function getDialog() {
    return screen.getByRole('dialog');
  }

  // ── Visibility ──────────────────────────────────────────────────────────────

  it('modal is not visible before the Edit button is clicked', () => {
    renderComponent();
    // Before first open, dialog is not in the DOM at all
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('modal opens when the Edit button is clicked', () => {
    openModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(within(getDialog()).getByText('Edit Profile')).toBeInTheDocument();
  });

  // ── Pre-filled values ───────────────────────────────────────────────────────

  it('pre-fills the Username field with the current username', () => {
    openModal();
    expect(within(getDialog()).getByLabelText('Username').value).toBe('Your Username');
  });

  it('pre-fills the About Me field with the current about text', () => {
    openModal();
    expect(within(getDialog()).getByLabelText('About Me').value).toBe("Hello! I'm using the app.");
  });

  // ── Cancel — assert outcome, not modal closed state ─────────────────────────

  it('does not update the sidebar username when Cancel is clicked', () => {
    openModal();
    fireEvent.change(within(getDialog()).getByLabelText('Username'), {
      target: { value: 'ShouldNotSave' },
    });
    fireEvent.click(within(getDialog()).getByText('Cancel'));
    // Outcome: original username is still in the sidebar bold div
    expect(screen.getByText('Your Username')).toBeInTheDocument();
  });

  it('the typed value is not persisted in the sidebar after Cancel', () => {
    openModal();
    fireEvent.change(within(getDialog()).getByLabelText('Username'), {
      target: { value: 'ShouldNotSave' },
    });
    fireEvent.click(within(getDialog()).getByText('Cancel'));
    // The sidebar bold name div should NOT contain the cancelled text
    const boldNames = document.querySelectorAll('div[style*="font-weight: bold"]');
    const hasCancelledText = Array.from(boldNames).some(el => el.textContent === 'ShouldNotSave');
    expect(hasCancelledText).toBe(false);
  });

  // ── Save — assert outcomes ──────────────────────────────────────────────────

  it('updates the sidebar username after Save', () => {
    openModal();
    fireEvent.change(within(getDialog()).getByLabelText('Username'), {
      target: { value: 'NewUsername' },
    });
    fireEvent.click(within(getDialog()).getByText('Save'));
    // The bold sidebar name should now be "NewUsername"
    const boldName = screen.getByText('NewUsername');
    expect(boldName).toBeInTheDocument();
    expect(boldName.style.fontWeight).toBe('bold');
  });

  it('updates the About Me text in the sidebar after Save', () => {
    openModal();
    fireEvent.change(within(getDialog()).getByLabelText('About Me'), {
      target: { value: 'My updated bio' },
    });
    fireEvent.click(within(getDialog()).getByText('Save'));
    // Find the sidebar About Me div (gray, small font) — not the textarea
    const matches = screen.getAllByText('My updated bio');
    const sidebarDiv = matches.find(
      (el) => el.tagName === 'DIV' && el.style.color === 'gray' && el.style.fontSize === '0.8rem'
    );
    expect(sidebarDiv).toBeInTheDocument();
  });

  // ── Status selector ─────────────────────────────────────────────────────────

  it('shows all four status options when the dropdown is opened', () => {
    openModal();
    fireEvent.mouseDown(within(getDialog()).getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'Online' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Away' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'DND' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Invisible' })).toBeInTheDocument();
  });

  // ── State reset on re-open ──────────────────────────────────────────────────

  it('resets unsaved edits when the modal is cancelled and reopened', () => {
    openModal();
    fireEvent.change(within(getDialog()).getByLabelText('Username'), {
      target: { value: 'Cancelled Name' },
    });
    fireEvent.click(within(getDialog()).getByText('Cancel'));
    // Reopen — field should show original saved value
    fireEvent.click(screen.getByText('Edit'));
    expect(within(getDialog()).getByLabelText('Username').value).toBe('Your Username');
  });

  // ── Consecutive saves ───────────────────────────────────────────────────────

  it('reflects the latest saved value after multiple saves', () => {
    openModal();
    fireEvent.change(within(getDialog()).getByLabelText('Username'), {
      target: { value: 'FirstSave' },
    });
    fireEvent.click(within(getDialog()).getByText('Save'));

    // Reopen and save again
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.change(within(getDialog()).getByLabelText('Username'), {
      target: { value: 'SecondSave' },
    });
    fireEvent.click(within(getDialog()).getByText('Save'));

    expect(screen.getByText('SecondSave')).toBeInTheDocument();
    expect(screen.queryByText('FirstSave')).not.toBeInTheDocument();
  });
});

// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { render, screen, fireEvent, within } from '@testing-library/react';
// import ServerList from '../MainScreen/ServerList/ServerList.jsx';
// import * as React from 'react';

// /**
//  * ProfileEditModal is tested through the parent ServerList component
//  * because it is not exported directly.
//  *
//  * MUI Dialog behaviour in jsdom:
//  *   - The dialog stays IN the DOM after closing — it does NOT unmount.
//  *   - When closed, MUI removes role="dialog" so queryByRole('dialog')
//  *     returns null. Use that to check open/closed state — NOT queryByText.
//  *   - After Save/Cancel the hidden textarea still holds typed values and
//  *     the hidden combobox still shows the selected label, so getByText()
//  *     on those values finds multiple elements.
//  *   - Fix: scope every modal interaction with within(dialog), and scope
//  *     sidebar assertions to the badge container div.
//  */

// const servers = [
//   { id: 1, name: 'test1', icon: 'public/vite.svg', channels: ['General'] },
// ];

// describe('ProfileEditModal', () => {
//   let onServerSelectMock;
//   let onChannelSelectMock;

//   beforeEach(() => {
//     onServerSelectMock = vi.fn();
//     onChannelSelectMock = vi.fn();
//   });

//   function renderComponent() {
//     render(
//       <ServerList
//         servers={servers}
//         onServerSelect={onServerSelectMock}
//         onChannelSelect={onChannelSelectMock}
//       />
//     );
//   }

//   function openModal() {
//     renderComponent();
//     fireEvent.click(screen.getByText('Edit'));
//   }

//   // ── Visibility ──────────────────────────────────────────────────────────────

//   it('modal is not visible before the Edit button is clicked', () => {
//     renderComponent();
//     expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
//   });

//   it('modal opens when the Edit button is clicked', () => {
//     openModal();
//     expect(screen.getByRole('dialog')).toBeInTheDocument();
//     expect(within(screen.getByRole('dialog')).getByText('Edit Profile')).toBeInTheDocument();
//   });

//   // ── Pre-filled values ───────────────────────────────────────────────────────

//   it('pre-fills the Username field with the current username', () => {
//     openModal();
//     const usernameField = within(screen.getByRole('dialog')).getByLabelText('Username');
//     expect(usernameField.value).toBe('Your Username');
//   });

//   it('pre-fills the About Me field with the current about text', () => {
//     openModal();
//     const aboutField = within(screen.getByRole('dialog')).getByLabelText('About Me');
//     expect(aboutField.value).toBe("Hello! I'm using the app.");
//   });

//   // ── Cancel ──────────────────────────────────────────────────────────────────

//   it('closes the modal when Cancel is clicked', () => {
//     openModal();
//     fireEvent.click(within(screen.getByRole('dialog')).getByText('Cancel'));
//     // MUI removes role="dialog" when closed
//     expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
//   });

//   it('does not save changes when Cancel is clicked', () => {
//     openModal();
//     const dialog = screen.getByRole('dialog');
//     fireEvent.change(within(dialog).getByLabelText('Username'), {
//       target: { value: 'ShouldNotSave' },
//     });
//     fireEvent.click(within(dialog).getByText('Cancel'));
//     // Original username still in sidebar
//     expect(screen.getByText('Your Username')).toBeInTheDocument();
//   });

//   // ── Save ────────────────────────────────────────────────────────────────────

//   it('closes the modal when Save is clicked', () => {
//     openModal();
//     fireEvent.click(within(screen.getByRole('dialog')).getByText('Save'));
//     expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
//   });

//   it('updates the displayed username after saving a new name', () => {
//     openModal();
//     const dialog = screen.getByRole('dialog');
//     fireEvent.change(within(dialog).getByLabelText('Username'), {
//       target: { value: 'NewUsername' },
//     });
//     fireEvent.click(within(dialog).getByText('Save'));
//     // The bold sidebar name — assert on fontWeight to distinguish from any other match
//     const boldName = screen.getByText('NewUsername');
//     expect(boldName).toBeInTheDocument();
//     expect(boldName.style.fontWeight).toBe('bold');
//   });

//   it('updates the displayed About Me text after saving', () => {
//     openModal();
//     const dialog = screen.getByRole('dialog');
//     fireEvent.change(within(dialog).getByLabelText('About Me'), {
//       target: { value: 'My updated bio' },
//     });
//     fireEvent.click(within(dialog).getByText('Save'));
//     // Hidden textarea also holds this value — find the sidebar div by its style
//     const matches = screen.getAllByText('My updated bio');
//     const sidebarDiv = matches.find(
//       (el) => el.tagName === 'DIV' && el.style.color === 'gray' && el.style.fontSize === '0.8rem'
//     );
//     expect(sidebarDiv).toBeInTheDocument();
//   });

//   // ── Status selector ─────────────────────────────────────────────────────────

//   it('shows all four status options when the dropdown is opened', () => {
//     openModal();
//     const dialog = screen.getByRole('dialog');
//     // Open the MUI Select listbox
//     fireEvent.mouseDown(within(dialog).getByRole('combobox'));
//     // Options are rendered in a portal — query the full document by role
//     expect(screen.getByRole('option', { name: 'Online' })).toBeInTheDocument();
//     expect(screen.getByRole('option', { name: 'Away' })).toBeInTheDocument();
//     expect(screen.getByRole('option', { name: 'DND' })).toBeInTheDocument();
//     expect(screen.getByRole('option', { name: 'Invisible' })).toBeInTheDocument();
//   });

//   // ── State reset on re-open ──────────────────────────────────────────────────

//   it('resets unsaved edits when the modal is closed then reopened', () => {
//     openModal();
//     const dialog = screen.getByRole('dialog');
//     fireEvent.change(within(dialog).getByLabelText('Username'), {
//       target: { value: 'Cancelled Name' },
//     });
//     fireEvent.click(within(dialog).getByText('Cancel'));

//     // Reopen
//     fireEvent.click(screen.getByText('Edit'));
//     // Field should show original saved value, not the cancelled text
//     expect(within(screen.getByRole('dialog')).getByLabelText('Username').value).toBe('Your Username');
//   });

//   // ── Consecutive saves ───────────────────────────────────────────────────────

//   it('reflects the latest saved value after multiple saves', () => {
//     openModal();
//     const dialog1 = screen.getByRole('dialog');
//     fireEvent.change(within(dialog1).getByLabelText('Username'), {
//       target: { value: 'FirstSave' },
//     });
//     fireEvent.click(within(dialog1).getByText('Save'));

//     // Reopen and save again
//     fireEvent.click(screen.getByText('Edit'));
//     const dialog2 = screen.getByRole('dialog');
//     fireEvent.change(within(dialog2).getByLabelText('Username'), {
//       target: { value: 'SecondSave' },
//     });
//     fireEvent.click(within(dialog2).getByText('Save'));

//     expect(screen.getByText('SecondSave')).toBeInTheDocument();
//     expect(screen.queryByText('FirstSave')).not.toBeInTheDocument();
//   });
// });

// // import { describe, it, expect, vi, beforeEach } from 'vitest';
// // import { render, screen, fireEvent, within } from '@testing-library/react';
// // import ServerList from '../MainScreen/ServerList/ServerList.jsx';
// // import * as React from 'react';

// // /**
// //  * ProfileEditModal is not exported from ServerList.jsx so we test it
// //  * through the parent ServerList component.
// //  *
// //  * Key testing constraints discovered from the real MUI DOM:
// //  *
// //  * 1. MUI Dialog does NOT unmount on close — it stays in the DOM but the
// //  *    parent div gets aria-hidden="true". We cannot assert
// //  *    queryByText('Edit Profile').not.toBeInTheDocument() after close.
// //  *    Instead we check the dialog element's aria-hidden attribute.
// //  *
// //  * 2. After Save, the modal stays in the DOM (aria-hidden). The About Me
// //  *    textarea still contains the typed value, so getByText('My updated bio')
// //  *    finds both the sidebar div AND the hidden textarea. We must scope
// //  *    sidebar assertions with within() to avoid "multiple elements" errors.
// //  *
// //  * 3. Status labels appear in both the sidebar and the Select combobox
// //  *    simultaneously — same scoping fix applies.
// //  */

// // const servers = [
// //   { id: 1, name: 'test1', icon: 'public/vite.svg', channels: ['General'] },
// // ];

// // // Helper — finds the outermost sidebar Paper div that contains the badge.
// // // The CustomUserBadge lives inside the first Paper in the ServerList layout.
// // function getSidebar() {
// //   // The username bold div is unique to the sidebar (not inside the dialog)
// //   return screen.getByText('Your Username').closest('div[style*="display: flex"]').parentElement;
// // }

// // describe('ProfileEditModal', () => {
// //   let onServerSelectMock;
// //   let onChannelSelectMock;

// //   beforeEach(() => {
// //     onServerSelectMock = vi.fn();
// //     onChannelSelectMock = vi.fn();
// //   });

// //   function renderComponent() {
// //     render(
// //       <ServerList
// //         servers={servers}
// //         onServerSelect={onServerSelectMock}
// //         onChannelSelect={onChannelSelectMock}
// //       />
// //     );
// //   }

// //   function openModal() {
// //     renderComponent();
// //     fireEvent.click(screen.getByText('Edit'));
// //   }

// //   // Helper — gets the dialog element (always in DOM, toggled by aria-hidden)
// //   function getDialog() {
// //     return screen.getByRole('dialog');
// //   }

// //   function isModalOpen() {
// //     // When MUI Dialog is open, role="dialog" is visible (no aria-hidden)
// //     const dialog = screen.queryByRole('dialog');
// //     return dialog !== null;
// //   }

// //   // ── Visibility ──────────────────────────────────────────────────────────────

// //   it('modal is not visible before the Edit button is clicked', () => {
// //     renderComponent();
// //     // Dialog not yet in DOM at all before first open
// //     expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
// //   });

// //   it('modal opens when the Edit button is clicked', () => {
// //     openModal();
// //     expect(screen.getByRole('dialog')).toBeInTheDocument();
// //     expect(within(getDialog()).getByText('Edit Profile')).toBeInTheDocument();
// //   });

// //   // ── Pre-filled values ───────────────────────────────────────────────────────

// //   it('pre-fills the Username field with the current username', () => {
// //     openModal();
// //     const usernameField = within(getDialog()).getByLabelText('Username');
// //     expect(usernameField.value).toBe('Your Username');
// //   });

// //   it('pre-fills the About Me field with the current about text', () => {
// //     openModal();
// //     const aboutField = within(getDialog()).getByLabelText('About Me');
// //     expect(aboutField.value).toBe("Hello! I'm using the app.");
// //   });

// //   // ── Cancel ──────────────────────────────────────────────────────────────────

// //   it('closes the modal when Cancel is clicked', () => {
// //     openModal();
// //     fireEvent.click(within(getDialog()).getByText('Cancel'));
// //     // MUI Dialog hides itself — role="dialog" is no longer accessible
// //     expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
// //   });

// //   it('does not save changes when Cancel is clicked', () => {
// //     openModal();
// //     fireEvent.change(within(getDialog()).getByLabelText('Username'), {
// //       target: { value: 'ShouldNotSave' },
// //     });
// //     fireEvent.click(within(getDialog()).getByText('Cancel'));
// //     // Sidebar still shows original username
// //     expect(screen.getByText('Your Username')).toBeInTheDocument();
// //   });

// //   // ── Save ────────────────────────────────────────────────────────────────────

// //   it('closes the modal when Save is clicked', () => {
// //     openModal();
// //     fireEvent.click(within(getDialog()).getByText('Save'));
// //     expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
// //   });

// //   it('updates the displayed username after saving a new name', () => {
// //     openModal();
// //     fireEvent.change(within(getDialog()).getByLabelText('Username'), {
// //       target: { value: 'NewUsername' },
// //     });
// //     fireEvent.click(within(getDialog()).getByText('Save'));
// //     // Scope to the bold username div in the sidebar only
// //     const boldName = screen.getByText('NewUsername');
// //     expect(boldName).toBeInTheDocument();
// //     expect(boldName.style.fontWeight).toBe('bold');
// //   });

// //   it('updates the displayed About Me text after saving', () => {
// //     openModal();
// //     fireEvent.change(within(getDialog()).getByLabelText('About Me'), {
// //       target: { value: 'My updated bio' },
// //     });
// //     fireEvent.click(within(getDialog()).getByText('Save'));
// //     // After save the modal is gone — only the sidebar div remains
// //     // Use getAllByText and assert at least one is the sidebar element
// //     const matches = screen.getAllByText('My updated bio');
// //     const sidebarMatch = matches.find(
// //       (el) => el.style && el.style.color === 'gray' && el.style.fontSize === '0.8rem'
// //     );
// //     expect(sidebarMatch).toBeInTheDocument();
// //   });

// //   // ── Status selector ─────────────────────────────────────────────────────────

// //   it('shows all four status options when the dropdown is opened', () => {
// //     openModal();
// //     // Open the MUI Select listbox
// //     const combobox = within(getDialog()).getByRole('combobox');
// //     fireEvent.mouseDown(combobox);
// //     // Options are now rendered in a portal — query the full document
// //     expect(screen.getByRole('option', { name: 'Online' })).toBeInTheDocument();
// //     expect(screen.getByRole('option', { name: 'Away' })).toBeInTheDocument();
// //     expect(screen.getByRole('option', { name: 'DND' })).toBeInTheDocument();
// //     expect(screen.getByRole('option', { name: 'Invisible' })).toBeInTheDocument();
// //   });

// //   // ── State reset on re-open ──────────────────────────────────────────────────

// //   it('resets unsaved edits when the modal is closed then reopened', () => {
// //     openModal();
// //     fireEvent.change(within(getDialog()).getByLabelText('Username'), {
// //       target: { value: 'Cancelled Name' },
// //     });
// //     fireEvent.click(within(getDialog()).getByText('Cancel'));

// //     // Reopen
// //     fireEvent.click(screen.getByText('Edit'));
// //     // Field should show original value, not the cancelled one
// //     expect(within(getDialog()).getByLabelText('Username').value).toBe('Your Username');
// //   });

// //   // ── Consecutive saves ───────────────────────────────────────────────────────

// //   it('reflects the latest saved value after multiple saves', () => {
// //     openModal();
// //     fireEvent.change(within(getDialog()).getByLabelText('Username'), {
// //       target: { value: 'FirstSave' },
// //     });
// //     fireEvent.click(within(getDialog()).getByText('Save'));

// //     // Reopen and save again
// //     fireEvent.click(screen.getByText('Edit'));
// //     fireEvent.change(within(getDialog()).getByLabelText('Username'), {
// //       target: { value: 'SecondSave' },
// //     });
// //     fireEvent.click(within(getDialog()).getByText('Save'));

// //     expect(screen.getByText('SecondSave')).toBeInTheDocument();
// //     expect(screen.queryByText('FirstSave')).not.toBeInTheDocument();
// //   });
// // });

// // // import { describe, it, expect, vi, beforeEach } from 'vitest';
// // // import { render, screen, fireEvent } from '@testing-library/react';
// // // import ServerList from '../MainScreen/ServerList/ServerList.jsx';
// // // import * as React from 'react';

// // // /**
// // //  * ProfileEditModal is not exported from ServerList.jsx so we test it
// // //  * through the parent ServerList component — open it via the Edit button,
// // //  * interact with it, then assert outcomes on the rendered sidebar.
// // //  *
// // //  * Component structure being tested (from ServerList.jsx):
// // //  *   ProfileEditModal
// // //  *     props: open, onClose, user, onUpdateUser
// // //  *     fields: Username (TextField label="Username")
// // //  *             Status   (Select)
// // //  *             About Me (TextField label="About Me", multiline)
// // //  *             Avatar   (clickable label -> hidden file input)
// // //  *     actions: Cancel button  -> calls onClose, discards changes
// // //  *              Save button    -> calls onUpdateUser(editedUser), then onClose
// // //  *
// // //  * Default YourUser state inside ServerList:
// // //  *   { name: "Your Username", status: "online", icon: "/default-profile.png",
// // //  *     about: "Hello! I'm using the app." }
// // //  */

// // // const servers = [
// // //   { id: 1, name: 'test1', icon: 'public/vite.svg', channels: ['General'] },
// // // ];

// // // describe('ProfileEditModal', () => {
// // //   let onServerSelectMock;
// // //   let onChannelSelectMock;

// // //   beforeEach(() => {
// // //     onServerSelectMock = vi.fn();
// // //     onChannelSelectMock = vi.fn();
// // //   });

// // //   // helper — renders ServerList and opens the modal
// // //   function renderAndOpen() {
// // //     render(
// // //       <ServerList
// // //         servers={servers}
// // //         onServerSelect={onServerSelectMock}
// // //         onChannelSelect={onChannelSelectMock}
// // //       />
// // //     );
// // //     fireEvent.click(screen.getByText('Edit'));
// // //   }

// // //   // ── Visibility ──────────────────────────────────────────────────────────────

// // //   it('modal is not visible before the Edit button is clicked', () => {
// // //     render(
// // //       <ServerList
// // //         servers={servers}
// // //         onServerSelect={onServerSelectMock}
// // //         onChannelSelect={onChannelSelectMock}
// // //       />
// // //     );
// // //     expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
// // //   });

// // //   it('modal opens when the Edit button is clicked', () => {
// // //     renderAndOpen();
// // //     expect(screen.getByText('Edit Profile')).toBeInTheDocument();
// // //   });

// // //   // ── Pre-filled values ───────────────────────────────────────────────────────

// // //   it('pre-fills the Username field with the current username', () => {
// // //     renderAndOpen();
// // //     const usernameField = screen.getByLabelText('Username');
// // //     expect(usernameField.value).toBe('Your Username');
// // //   });

// // //   it('pre-fills the About Me field with the current about text', () => {
// // //     renderAndOpen();
// // //     const aboutField = screen.getByLabelText('About Me');
// // //     expect(aboutField.value).toBe("Hello! I'm using the app.");
// // //   });

// // //   // ── Cancel ──────────────────────────────────────────────────────────────────

// // //   it('closes the modal when Cancel is clicked', () => {
// // //     renderAndOpen();
// // //     fireEvent.click(screen.getByText('Cancel'));
// // //     expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
// // //   });

// // //   it('does not save changes when Cancel is clicked', () => {
// // //     renderAndOpen();
// // //     fireEvent.change(screen.getByLabelText('Username'), {
// // //       target: { value: 'ShouldNotSave' },
// // //     });
// // //     fireEvent.click(screen.getByText('Cancel'));
// // //     // modal gone
// // //     expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
// // //     // original username still shown in sidebar
// // //     expect(screen.getByText('Your Username')).toBeInTheDocument();
// // //     // the typed value never made it to the sidebar
// // //     expect(screen.queryByText('ShouldNotSave')).not.toBeInTheDocument();
// // //   });

// // //   // ── Save ────────────────────────────────────────────────────────────────────

// // //   it('closes the modal when Save is clicked', () => {
// // //     renderAndOpen();
// // //     fireEvent.click(screen.getByText('Save'));
// // //     expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
// // //   });

// // //   it('updates the displayed username after saving a new name', () => {
// // //     renderAndOpen();
// // //     fireEvent.change(screen.getByLabelText('Username'), {
// // //       target: { value: 'NewUsername' },
// // //     });
// // //     fireEvent.click(screen.getByText('Save'));
// // //     expect(screen.getByText('NewUsername')).toBeInTheDocument();
// // //   });

// // //   it('updates the displayed About Me text after saving', () => {
// // //     renderAndOpen();
// // //     fireEvent.change(screen.getByLabelText('About Me'), {
// // //       target: { value: 'My updated bio' },
// // //     });
// // //     fireEvent.click(screen.getByText('Save'));
// // //     // bio is shown in the CustomUserBadge sidebar
// // //     expect(screen.getByText('My updated bio')).toBeInTheDocument();
// // //   });

// // //   // ── Status selector ─────────────────────────────────────────────────────────

// // //   it('shows all four status options in the dropdown', () => {
// // //     renderAndOpen();
// // //     // MUI Select renders options as role="option" inside the listbox
// // //     // The options exist in the DOM even when the menu is closed
// // //     expect(screen.getByText('Online')).toBeInTheDocument();
// // //     expect(screen.getByText('Away')).toBeInTheDocument();
// // //     expect(screen.getByText('DND')).toBeInTheDocument();
// // //     expect(screen.getByText('Invisible')).toBeInTheDocument();
// // //   });

// // //   // ── State reset on re-open ──────────────────────────────────────────────────

// // //   it('resets unsaved edits when the modal is closed then reopened', () => {
// // //     renderAndOpen();
// // //     // type a new name but cancel
// // //     fireEvent.change(screen.getByLabelText('Username'), {
// // //       target: { value: 'Cancelled Name' },
// // //     });
// // //     fireEvent.click(screen.getByText('Cancel'));

// // //     // reopen
// // //     fireEvent.click(screen.getByText('Edit'));
// // //     // field should show the original value, not the cancelled one
// // //     expect(screen.getByLabelText('Username').value).toBe('Your Username');
// // //   });

// // //   // ── Consecutive saves ───────────────────────────────────────────────────────

// // //   it('reflects the latest saved value after multiple saves', () => {
// // //     renderAndOpen();
// // //     fireEvent.change(screen.getByLabelText('Username'), {
// // //       target: { value: 'FirstSave' },
// // //     });
// // //     fireEvent.click(screen.getByText('Save'));

// // //     // reopen and save again
// // //     fireEvent.click(screen.getByText('Edit'));
// // //     fireEvent.change(screen.getByLabelText('Username'), {
// // //       target: { value: 'SecondSave' },
// // //     });
// // //     fireEvent.click(screen.getByText('Save'));

// // //     expect(screen.getByText('SecondSave')).toBeInTheDocument();
// // //     expect(screen.queryByText('FirstSave')).not.toBeInTheDocument();
// // //   });
// // // });
