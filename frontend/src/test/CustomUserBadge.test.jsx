import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ServerList from '../MainScreen/ServerList/ServerList.jsx';
import * as React from 'react';

/**
 * CustomUserBadge is tested through the parent ServerList component
 * because it is not exported directly.
 *
 * MUI Dialog behaviour in jsdom:
 *   - After saving a status, the hidden dialog combobox still shows the
 *     selected label (e.g. "Away"), so getByText('Away') finds both the
 *     sidebar label AND the combobox. Fix: scope sidebar assertions with
 *     within(getBadgeContainer()).
 *   - After saving About Me text, the hidden multiline textarea also holds
 *     the value. Same fix.
 *   - Status dot colour is asserted via querySelectorAll on the inline
 *     background-color style — reliable regardless of text duplication.
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

  // Finds the CustomUserBadge wrapper — the flex div that contains the bold
  // username text, the status row, and the Edit button all as siblings.
  function getBadgeContainer() {
    return screen.getByText('Your Username').closest('div[style*="position: relative"]')
      || screen.getByText('Your Username').parentElement.parentElement;
  }

  // Opens the modal, selects a status by its option label, then saves.
  function saveStatus(optionLabel) {
    fireEvent.click(screen.getByText('Edit'));
    const dialog = screen.getByRole('dialog');
    fireEvent.mouseDown(within(dialog).getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: optionLabel }));
    fireEvent.click(within(dialog).getByText('Save'));
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

  // ── Default status ──────────────────────────────────────────────────────────

  it('displays "Online" status label by default', () => {
    renderBadge();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('shows a green status dot by default', () => {
    renderBadge();
    const dots = document.querySelectorAll(
      'div[style*="border-radius: 50%"][style*="background-color: green"]'
    );
    expect(dots.length).toBeGreaterThan(0);
  });

  // ── Status changes ──────────────────────────────────────────────────────────

  it('displays "Away" label in the badge after switching status to Away', () => {
    renderBadge();
    saveStatus('Away');
    const badge = getBadgeContainer();
    expect(within(badge).getByText('Away')).toBeInTheDocument();
  });

  it('shows an orange dot after switching status to Away', () => {
    renderBadge();
    saveStatus('Away');
    const dots = document.querySelectorAll(
      'div[style*="border-radius: 50%"][style*="background-color: orange"]'
    );
    expect(dots.length).toBeGreaterThan(0);
  });

  it('displays "DND" label in the badge after switching status to DND', () => {
    renderBadge();
    saveStatus('DND');
    const badge = getBadgeContainer();
    expect(within(badge).getByText('DND')).toBeInTheDocument();
  });

  it('shows a red dot after switching status to DND', () => {
    renderBadge();
    saveStatus('DND');
    const dots = document.querySelectorAll(
      'div[style*="border-radius: 50%"][style*="background-color: red"]'
    );
    expect(dots.length).toBeGreaterThan(0);
  });

  it('displays "Invisible" label in the badge after switching status to Invisible', () => {
    renderBadge();
    saveStatus('Invisible');
    const badge = getBadgeContainer();
    expect(within(badge).getByText('Invisible')).toBeInTheDocument();
  });

  it('shows a gray dot after switching status to Invisible', () => {
    renderBadge();
    saveStatus('Invisible');
    const dots = document.querySelectorAll(
      'div[style*="border-radius: 50%"][style*="background-color: gray"]'
    );
    expect(dots.length).toBeGreaterThan(0);
  });

  // ── Edit button ─────────────────────────────────────────────────────────────

  it('opens the profile edit modal when Edit is clicked', () => {
    renderBadge();
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // ── Username update ─────────────────────────────────────────────────────────

  it('shows the new username in the badge after saving', () => {
    renderBadge();
    fireEvent.click(screen.getByText('Edit'));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Username'), {
      target: { value: 'UpdatedUser' },
    });
    fireEvent.click(within(dialog).getByText('Save'));
    const boldName = screen.getByText('UpdatedUser');
    expect(boldName).toBeInTheDocument();
    expect(boldName.style.fontWeight).toBe('bold');
  });

  it('removes the old username from the badge after saving a new name', () => {
    renderBadge();
    fireEvent.click(screen.getByText('Edit'));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Username'), {
      target: { value: 'UpdatedUser' },
    });
    fireEvent.click(within(dialog).getByText('Save'));
    expect(screen.queryByText('Your Username')).not.toBeInTheDocument();
  });

  // ── About Me update ─────────────────────────────────────────────────────────

  it('shows the new About Me text in the badge after saving', () => {
    renderBadge();
    fireEvent.click(screen.getByText('Edit'));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('About Me'), {
      target: { value: 'New bio here' },
    });
    fireEvent.click(within(dialog).getByText('Save'));
    const badge = getBadgeContainer();
    expect(within(badge).getByText('New bio here')).toBeInTheDocument();
  });

  it('removes the old About Me text after it is cleared and saved', () => {
    renderBadge();
    fireEvent.click(screen.getByText('Edit'));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('About Me'), {
      target: { value: '' },
    });
    fireEvent.click(within(dialog).getByText('Save'));
    expect(screen.queryByText("Hello! I'm using the app.")).not.toBeInTheDocument();
  });
});
// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { render, screen, fireEvent, within } from '@testing-library/react';
// import ServerList from '../MainScreen/ServerList/ServerList.jsx';
// import * as React from 'react';

// /**
//  * CustomUserBadge is tested through the parent ServerList component
//  * because it is not exported directly.
//  *
//  * MUI Dialog behaviour in jsdom:
//  *   - After saving a status, the hidden dialog combobox still shows the
//  *     selected label (e.g. "Away"), so getByText('Away') finds both the
//  *     sidebar label AND the combobox. Fix: scope sidebar assertions with
//  *     within(getBadgeContainer()).
//  *   - After saving About Me text, the hidden multiline textarea also holds
//  *     the value. Same fix.
//  *   - Status dot colour is asserted via querySelectorAll on the inline
//  *     background-color style — reliable regardless of text duplication.
//  */


// const servers = [
//   { id: 1, name: 'test1', icon: 'public/vite.svg', channels: ['General'] },
// ];

// describe('CustomUserBadge', () => {
//   let onServerSelectMock;
//   let onChannelSelectMock;

//   beforeEach(() => {
//     onServerSelectMock = vi.fn();
//     onChannelSelectMock = vi.fn();
//   });

//   function renderBadge() {
//     render(
//       <ServerList
//         servers={servers}
//         onServerSelect={onServerSelectMock}
//         onChannelSelect={onChannelSelectMock}
//       />
//     );
//   }

//   // Finds the CustomUserBadge wrapper — the flex div that contains the bold
//   // username text, the status row, and the Edit button all as siblings.
//   function getBadgeContainer() {
//     return screen.getByText('Your Username').closest('div[style*="position: relative"]')
//       || screen.getByText('Your Username').parentElement.parentElement;
//   }

//   // Opens the modal, selects a status by its option label, then saves.
//   function saveStatus(optionLabel) {
//     fireEvent.click(screen.getByText('Edit'));
//     const dialog = screen.getByRole('dialog');
//     fireEvent.mouseDown(within(dialog).getByRole('combobox'));
//     fireEvent.click(screen.getByRole('option', { name: optionLabel }));
//     fireEvent.click(within(dialog).getByText('Save'));
//   }

//   // ── Rendering ───────────────────────────────────────────────────────────────

//   it('renders without crashing', () => {
//     expect(() => renderBadge()).not.toThrow();
//   });

//   it('displays the username', () => {
//     renderBadge();
//     expect(screen.getByText('Your Username')).toBeInTheDocument();
//   });

//   it('renders the Edit button', () => {
//     renderBadge();
//     expect(screen.getByText('Edit')).toBeInTheDocument();
//   });

//   it('displays the About Me text', () => {
//     renderBadge();
//     expect(screen.getByText("Hello! I'm using the app.")).toBeInTheDocument();
//   });

//   // ── Default status ──────────────────────────────────────────────────────────

//   it('displays "Online" status label by default', () => {
//     renderBadge();
//     // Before the modal is ever opened there is exactly one "Online" in the DOM
//     expect(screen.getByText('Online')).toBeInTheDocument();
//   });

//   it('shows a green status dot by default', () => {
//     renderBadge();
//     const dots = document.querySelectorAll(
//       'div[style*="border-radius: 50%"][style*="background-color: green"]'
//     );
//     expect(dots.length).toBeGreaterThan(0);
//   });

//   // ── Status changes ──────────────────────────────────────────────────────────

//   it('displays "Away" label in the badge after switching status to Away', () => {
//     renderBadge();
//     saveStatus('Away');
//     // Scope to badge container to avoid the hidden combobox also showing "Away"
//     const badge = getBadgeContainer();
//     expect(within(badge).getByText('Away')).toBeInTheDocument();
//   });

//   it('shows an orange dot after switching status to Away', () => {
//     renderBadge();
//     saveStatus('Away');
//     const dots = document.querySelectorAll(
//       'div[style*="border-radius: 50%"][style*="background-color: orange"]'
//     );
//     expect(dots.length).toBeGreaterThan(0);
//   });

//   it('displays "DND" label in the badge after switching status to DND', () => {
//     renderBadge();
//     saveStatus('DND');
//     const badge = getBadgeContainer();
//     expect(within(badge).getByText('DND')).toBeInTheDocument();
//   });

//   it('shows a red dot after switching status to DND', () => {
//     renderBadge();
//     saveStatus('DND');
//     const dots = document.querySelectorAll(
//       'div[style*="border-radius: 50%"][style*="background-color: red"]'
//     );
//     expect(dots.length).toBeGreaterThan(0);
//   });

//   it('displays "Invisible" label in the badge after switching status to Invisible', () => {
//     renderBadge();
//     saveStatus('Invisible');
//     const badge = getBadgeContainer();
//     expect(within(badge).getByText('Invisible')).toBeInTheDocument();
//   });

//   it('shows a gray dot after switching status to Invisible', () => {
//     renderBadge();
//     saveStatus('Invisible');
//     const dots = document.querySelectorAll(
//       'div[style*="border-radius: 50%"][style*="background-color: gray"]'
//     );
//     expect(dots.length).toBeGreaterThan(0);
//   });

//   // ── Edit button ─────────────────────────────────────────────────────────────

//   it('opens the profile edit modal when Edit is clicked', () => {
//     renderBadge();
//     fireEvent.click(screen.getByText('Edit'));
//     expect(screen.getByRole('dialog')).toBeInTheDocument();
//   });

//   // ── Username update ─────────────────────────────────────────────────────────

//   it('shows the new username in the badge after saving', () => {
//     renderBadge();
//     fireEvent.click(screen.getByText('Edit'));
//     const dialog = screen.getByRole('dialog');
//     fireEvent.change(within(dialog).getByLabelText('Username'), {
//       target: { value: 'UpdatedUser' },
//     });
//     fireEvent.click(within(dialog).getByText('Save'));
//     const boldName = screen.getByText('UpdatedUser');
//     expect(boldName).toBeInTheDocument();
//     expect(boldName.style.fontWeight).toBe('bold');
//   });

//   it('removes the old username from the badge after saving a new name', () => {
//     renderBadge();
//     fireEvent.click(screen.getByText('Edit'));
//     const dialog = screen.getByRole('dialog');
//     fireEvent.change(within(dialog).getByLabelText('Username'), {
//       target: { value: 'UpdatedUser' },
//     });
//     fireEvent.click(within(dialog).getByText('Save'));
//     expect(screen.queryByText('Your Username')).not.toBeInTheDocument();
//   });

//   // ── About Me update ─────────────────────────────────────────────────────────

//   it('shows the new About Me text in the badge after saving', () => {
//     renderBadge();
//     fireEvent.click(screen.getByText('Edit'));
//     const dialog = screen.getByRole('dialog');
//     fireEvent.change(within(dialog).getByLabelText('About Me'), {
//       target: { value: 'New bio here' },
//     });
//     fireEvent.click(within(dialog).getByText('Save'));
//     // Scope to badge container — hidden textarea also holds this value
//     const badge = getBadgeContainer();
//     expect(within(badge).getByText('New bio here')).toBeInTheDocument();
//   });

//   it('removes the old About Me text after it is cleared and saved', () => {
//     renderBadge();
//     fireEvent.click(screen.getByText('Edit'));
//     const dialog = screen.getByRole('dialog');
//     fireEvent.change(within(dialog).getByLabelText('About Me'), {
//       target: { value: '' },
//     });
//     fireEvent.click(within(dialog).getByText('Save'));
//     expect(screen.queryByText("Hello! I'm using the app.")).not.toBeInTheDocument();
//   });
// });

// // import { describe, it, expect, vi, beforeEach } from 'vitest';
// // import { render, screen, fireEvent, within } from '@testing-library/react';
// // import ServerList from '../MainScreen/ServerList/ServerList.jsx';
// // import * as React from 'react';

// // /**
// //  * CustomUserBadge is not exported from ServerList.jsx so we test it
// //  * through the parent ServerList component.
// //  *
// //  * Key testing constraints discovered from the real MUI DOM:
// //  *
// //  * 1. After saving a status, the MUI Select combobox inside the (now hidden)
// //  *    dialog still shows the selected label text. getByText('Away') finds both
// //  *    the sidebar status label AND the combobox. We must scope sidebar
// //  *    assertions using within() on the badge container.
// //  *
// //  * 2. After saving About Me text, the multiline textarea in the hidden dialog
// //  *    still holds the value. Same fix — scope with within().
// //  *
// //  * 3. The status dot div has a known inline style: backgroundColor matches
// //  *    the status color. We assert on that directly when text scoping is tricky.
// //  *
// //  * Sidebar container strategy:
// //  *   The CustomUserBadge renders a div with style="display:flex; align-items:center;
// //  *   padding:1rem; position:relative". We locate it via the bold username div.
// //  */

// // const servers = [
// //   { id: 1, name: 'test1', icon: 'public/vite.svg', channels: ['General'] },
// // ];

// // describe('CustomUserBadge', () => {
// //   let onServerSelectMock;
// //   let onChannelSelectMock;

// //   beforeEach(() => {
// //     onServerSelectMock = vi.fn();
// //     onChannelSelectMock = vi.fn();
// //   });

// //   function renderBadge() {
// //     render(
// //       <ServerList
// //         servers={servers}
// //         onServerSelect={onServerSelectMock}
// //         onChannelSelect={onChannelSelectMock}
// //       />
// //     );
// //   }

// //   // Finds the CustomUserBadge wrapper div in the sidebar
// //   function getBadgeContainer() {
// //     // Bold username div -> its parent is the text block -> its parent is the badge flex div
// //     return screen.getByText('Your Username').closest('div[style*="position: relative"]') ||
// //            screen.getByText('Your Username').parentElement.parentElement;
// //   }

// //   // Opens modal, selects a status option, and saves
// //   function saveStatus(statusLabel) {
// //     fireEvent.click(screen.getByText('Edit'));
// //     const dialog = screen.getByRole('dialog');
// //     const combobox = within(dialog).getByRole('combobox');
// //     fireEvent.mouseDown(combobox);
// //     fireEvent.click(screen.getByRole('option', { name: statusLabel }));
// //     fireEvent.click(within(dialog).getByText('Save'));
// //   }

// //   // ── Rendering ───────────────────────────────────────────────────────────────

// //   it('renders without crashing', () => {
// //     expect(() => renderBadge()).not.toThrow();
// //   });

// //   it('displays the username', () => {
// //     renderBadge();
// //     expect(screen.getByText('Your Username')).toBeInTheDocument();
// //   });

// //   it('renders the Edit button', () => {
// //     renderBadge();
// //     expect(screen.getByText('Edit')).toBeInTheDocument();
// //   });

// //   it('displays the About Me text', () => {
// //     renderBadge();
// //     expect(screen.getByText("Hello! I'm using the app.")).toBeInTheDocument();
// //   });

// //   // ── Default status (online) ─────────────────────────────────────────────────

// //   it('displays "Online" status label by default', () => {
// //     renderBadge();
// //     // Before the modal is ever opened there is only one "Online" — in the sidebar
// //     expect(screen.getByText('Online')).toBeInTheDocument();
// //   });

// //   it('shows a green status dot by default', () => {
// //     renderBadge();
// //     // Find the small dot div by its distinctive inline style
// //     const dots = document.querySelectorAll(
// //       'div[style*="border-radius: 50%"][style*="background-color: green"]'
// //     );
// //     expect(dots.length).toBeGreaterThan(0);
// //   });

// //   // ── Status changes reflected after profile save ─────────────────────────────

// //   it('displays "Away" label in the badge after switching status to Away', () => {
// //     renderBadge();
// //     saveStatus('Away');
// //     // After modal closes, scope to the badge area to avoid the hidden combobox
// //     const badge = getBadgeContainer();
// //     expect(within(badge).getByText('Away')).toBeInTheDocument();
// //   });

// //   it('shows an orange dot after switching status to Away', () => {
// //     renderBadge();
// //     saveStatus('Away');
// //     const dots = document.querySelectorAll(
// //       'div[style*="border-radius: 50%"][style*="background-color: orange"]'
// //     );
// //     expect(dots.length).toBeGreaterThan(0);
// //   });

// //   it('displays "DND" label in the badge after switching status to DND', () => {
// //     renderBadge();
// //     saveStatus('DND');
// //     const badge = getBadgeContainer();
// //     expect(within(badge).getByText('DND')).toBeInTheDocument();
// //   });

// //   it('shows a red dot after switching status to DND', () => {
// //     renderBadge();
// //     saveStatus('DND');
// //     const dots = document.querySelectorAll(
// //       'div[style*="border-radius: 50%"][style*="background-color: red"]'
// //     );
// //     expect(dots.length).toBeGreaterThan(0);
// //   });

// //   it('displays "Invisible" label in the badge after switching status to Invisible', () => {
// //     renderBadge();
// //     saveStatus('Invisible');
// //     const badge = getBadgeContainer();
// //     expect(within(badge).getByText('Invisible')).toBeInTheDocument();
// //   });

// //   it('shows a gray dot after switching status to Invisible', () => {
// //     renderBadge();
// //     saveStatus('Invisible');
// //     const dots = document.querySelectorAll(
// //       'div[style*="border-radius: 50%"][style*="background-color: gray"]'
// //     );
// //     expect(dots.length).toBeGreaterThan(0);
// //   });

// //   // ── Edit button interaction ─────────────────────────────────────────────────

// //   it('opens the profile edit modal when Edit is clicked', () => {
// //     renderBadge();
// //     fireEvent.click(screen.getByText('Edit'));
// //     expect(screen.getByRole('dialog')).toBeInTheDocument();
// //   });

// //   // ── Username update reflected immediately ───────────────────────────────────

// //   it('shows the new username in the badge after saving', () => {
// //     renderBadge();
// //     fireEvent.click(screen.getByText('Edit'));
// //     const dialog = screen.getByRole('dialog');
// //     fireEvent.change(within(dialog).getByLabelText('Username'), {
// //       target: { value: 'UpdatedUser' },
// //     });
// //     fireEvent.click(within(dialog).getByText('Save'));
// //     // The bold name div in the sidebar
// //     const boldName = screen.getByText('UpdatedUser');
// //     expect(boldName).toBeInTheDocument();
// //     expect(boldName.style.fontWeight).toBe('bold');
// //   });

// //   it('removes the old username from the badge after saving a new name', () => {
// //     renderBadge();
// //     fireEvent.click(screen.getByText('Edit'));
// //     const dialog = screen.getByRole('dialog');
// //     fireEvent.change(within(dialog).getByLabelText('Username'), {
// //       target: { value: 'UpdatedUser' },
// //     });
// //     fireEvent.click(within(dialog).getByText('Save'));
// //     expect(screen.queryByText('Your Username')).not.toBeInTheDocument();
// //   });

// //   // ── About Me update reflected immediately ───────────────────────────────────

// //   it('shows the new About Me text in the badge after saving', () => {
// //     renderBadge();
// //     fireEvent.click(screen.getByText('Edit'));
// //     const dialog = screen.getByRole('dialog');
// //     fireEvent.change(within(dialog).getByLabelText('About Me'), {
// //       target: { value: 'New bio here' },
// //     });
// //     fireEvent.click(within(dialog).getByText('Save'));
// //     // Scope to sidebar — the hidden textarea also holds this value
// //     const badge = getBadgeContainer();
// //     expect(within(badge).getByText('New bio here')).toBeInTheDocument();
// //   });

// //   it('removes the old About Me text after it is cleared and saved', () => {
// //     renderBadge();
// //     fireEvent.click(screen.getByText('Edit'));
// //     const dialog = screen.getByRole('dialog');
// //     fireEvent.change(within(dialog).getByLabelText('About Me'), {
// //       target: { value: '' },
// //     });
// //     fireEvent.click(within(dialog).getByText('Save'));
// //     expect(
// //       screen.queryByText("Hello! I'm using the app.")
// //     ).not.toBeInTheDocument();
// //   });
// // });

// // // import { describe, it, expect, vi, beforeEach } from 'vitest';
// // // import { render, screen, fireEvent } from '@testing-library/react';
// // // import ServerList from '../MainScreen/ServerList/ServerList.jsx';
// // // import * as React from 'react';

// // // /**
// // //  * CustomUserBadge is not exported from ServerList.jsx so we test it
// // //  * through the parent ServerList component.
// // //  *
// // //  * Component structure being tested (from ServerList.jsx):
// // //  *   CustomUserBadge
// // //  *     props: user, status, online, img, about, onEditProfile
// // //  *     renders:
// // //  *       - Avatar  (src={img}, alt={user})
// // //  *       - username div  (fontWeight: bold)
// // //  *       - status dot    (div with backgroundColor: statusConfig.color)
// // //  *       - status label  (text: statusConfig.label)
// // //  *       - about snippet (only when about prop is truthy)
// // //  *       - Edit button   (calls onEditProfile on click)
// // //  *
// // //  * USER_STATUSES (from ServerList.jsx):
// // //  *   online          -> label "Online",    color "green"
// // //  *   away            -> label "Away",      color "orange"
// // //  *   do-not-disturb  -> label "DND",       color "red"
// // //  *   invisible       -> label "Invisible", color "gray"
// // //  *
// // //  * Default YourUser state:
// // //  *   { name: "Your Username", status: "online",
// // //  *     icon: "/default-profile.png", about: "Hello! I'm using the app." }
// // //  */

// // // const servers = [
// // //   { id: 1, name: 'test1', icon: 'public/vite.svg', channels: ['General'] },
// // // ];

// // // describe('CustomUserBadge', () => {
// // //   let onServerSelectMock;
// // //   let onChannelSelectMock;

// // //   beforeEach(() => {
// // //     onServerSelectMock = vi.fn();
// // //     onChannelSelectMock = vi.fn();
// // //   });

// // //   function renderBadge() {
// // //     render(
// // //       <ServerList
// // //         servers={servers}
// // //         onServerSelect={onServerSelectMock}
// // //         onChannelSelect={onChannelSelectMock}
// // //       />
// // //     );
// // //   }

// // //   // ── Rendering ───────────────────────────────────────────────────────────────

// // //   it('renders without crashing', () => {
// // //     expect(() => renderBadge()).not.toThrow();
// // //   });

// // //   it('displays the username', () => {
// // //     renderBadge();
// // //     expect(screen.getByText('Your Username')).toBeInTheDocument();
// // //   });

// // //   it('renders the Edit button', () => {
// // //     renderBadge();
// // //     expect(screen.getByText('Edit')).toBeInTheDocument();
// // //   });

// // //   it('displays the About Me text', () => {
// // //     renderBadge();
// // //     expect(screen.getByText("Hello! I'm using the app.")).toBeInTheDocument();
// // //   });

// // //   // ── Default status (online) ─────────────────────────────────────────────────

// // //   it('displays "Online" status label by default', () => {
// // //     renderBadge();
// // //     expect(screen.getByText('Online')).toBeInTheDocument();
// // //   });

// // //   // ── Status changes reflected after profile save ─────────────────────────────
// // //   // We change status via the ProfileEditModal and assert the badge updates.

// // //   function saveStatus(statusValue, statusLabel) {
// // //     renderBadge();
// // //     // open modal
// // //     fireEvent.click(screen.getByText('Edit'));
// // //     // MUI Select — click the currently displayed value to open the listbox,
// // //     // then click the desired option
// // //     const combobox = screen.getByRole('combobox');
// // //     fireEvent.mouseDown(combobox);
// // //     fireEvent.click(screen.getByText(statusLabel));
// // //     // save
// // //     fireEvent.click(screen.getByText('Save'));
// // //   }

// // //   it('displays "Away" label after switching status to away', () => {
// // //     saveStatus('away', 'Away');
// // //     expect(screen.getByText('Away')).toBeInTheDocument();
// // //   });

// // //   it('displays "DND" label after switching status to do-not-disturb', () => {
// // //     saveStatus('do-not-disturb', 'DND');
// // //     expect(screen.getByText('DND')).toBeInTheDocument();
// // //   });

// // //   it('displays "Invisible" label after switching status to invisible', () => {
// // //     saveStatus('invisible', 'Invisible');
// // //     expect(screen.getByText('Invisible')).toBeInTheDocument();
// // //   });

// // //   // ── Edit button interaction ─────────────────────────────────────────────────

// // //   it('opens the profile edit modal when Edit is clicked', () => {
// // //     renderBadge();
// // //     fireEvent.click(screen.getByText('Edit'));
// // //     expect(screen.getByText('Edit Profile')).toBeInTheDocument();
// // //   });

// // //   // ── Username update reflected immediately ───────────────────────────────────

// // //   it('shows the new username in the badge after saving', () => {
// // //     renderBadge();
// // //     fireEvent.click(screen.getByText('Edit'));
// // //     fireEvent.change(screen.getByLabelText('Username'), {
// // //       target: { value: 'UpdatedUser' },
// // //     });
// // //     fireEvent.click(screen.getByText('Save'));
// // //     expect(screen.getByText('UpdatedUser')).toBeInTheDocument();
// // //     expect(screen.queryByText('Your Username')).not.toBeInTheDocument();
// // //   });

// // //   // ── About Me update reflected immediately ───────────────────────────────────

// // //   it('shows the new About Me text in the badge after saving', () => {
// // //     renderBadge();
// // //     fireEvent.click(screen.getByText('Edit'));
// // //     fireEvent.change(screen.getByLabelText('About Me'), {
// // //       target: { value: 'New bio here' },
// // //     });
// // //     fireEvent.click(screen.getByText('Save'));
// // //     expect(screen.getByText('New bio here')).toBeInTheDocument();
// // //   });

// // //   it('removes the old About Me text after it is cleared and saved', () => {
// // //     renderBadge();
// // //     fireEvent.click(screen.getByText('Edit'));
// // //     fireEvent.change(screen.getByLabelText('About Me'), {
// // //       target: { value: '' },
// // //     });
// // //     fireEvent.click(screen.getByText('Save'));
// // //     expect(
// // //       screen.queryByText("Hello! I'm using the app.")
// // //     ).not.toBeInTheDocument();
// // //   });
// // // });
