# Sprint 4 — Sector

## Video

_(Add your narrated video link here)_

---

## Running Sector

### Install frontend dependencies
```bash
cd frontend
npm install
```

### Install Wails CLI (one-time)
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### Prepare the backend
```bash
bash generate.sh
```

### Run in development mode
```bash
wails dev
```

### Build for production
```bash
wails build
```

---

## General Notes

Sprint 4 focused on completing the remaining work from Sprint 3, deepening frontend-backend integration, and shipping the two new Vitest test files for `ProfileEditModal` and `CustomUserBadge`. All previously pending Cypress tests were resolved — registration validation and the profile edit component test are now fully passing with zero skips. A front-page `README.md` was added to the project root. All 42 backend unit tests continue to pass.

---

## Entire Team

### Sprint 3 Issues Completed This Sprint

- Activated 2 previously pending Cypress E2E registration tests (`validates form fields correctly`, `attempts registration with valid data`) — both now passing with `cy.intercept` mocking the backend.
- Activated the previously pending Cypress component test `"allows editing user profile"` in `ServerList.cy.jsx` — now fully passing.
- Added `README.md` to the project root with full setup, run, and test instructions.
- Added `vite.config.js` exclusion rule so Vitest never picks up `.cy.jsx` files as test suites.

---

## Frontend

### Work Completed

**ProfileEditModal**
Implemented inside `ServerList.jsx`. Opens via an "Edit" button in the user badge area. Allows the user to update their display name, About Me bio, status (Online / Away / DND / Invisible), and profile picture. Clicking Save updates the sidebar immediately. Clicking Cancel discards all changes. A `React.useEffect` resets the form fields every time the modal opens, so cancelling and reopening always shows the last saved values.

**CustomUserBadge**
Implemented inside `ServerList.jsx`. Renders the user's avatar, bold username, gray About Me text, status label, and a colored dot indicator — green for Online, orange for Away, red for DND, gray for Invisible. Updates immediately after saving in the ProfileEditModal.

**Cypress Tests Resolved**
- `registration.cy.js` — `"validates form fields correctly"` and `"attempts registration with valid data"` both fully passing (previously pending in Sprint 2/3).
- `ServerList.cy.jsx` — `"allows editing user profile"` fully passing (previously pending in Sprint 2/3).

**vite.config.js**
Added `exclude` array to the Vitest config to permanently prevent Vitest from treating `.cy.jsx` files as test suites.

**README.md**
Added front-page readme at the project root covering prerequisites, setup steps, how to run in dev and production, how to run all three test suites, API overview, authentication flow, directory structure, and known limitations.

---

### Frontend Unit Tests (Vitest)

Run from `frontend/` directory:
```bash
npm run test
```

**Results: ✔ 13 test files — all passing, 0 failures**

#### App.test.jsx
| Test | Description |
|---|---|
| Renders without exceptions | Mounts the top-level `App` and verifies no error is thrown |

#### Login.test.jsx
| Test | Description |
|---|---|
| Renders login form with all elements | Confirms heading, inputs, Sign In, and Register are all present |
| Prevents login when form fields are empty | Clicks Sign In with empty fields; confirms `onLogin` is not called |
| Calls onLogin with valid credentials | Fills both fields, clicks Sign In; confirms `onLogin(true)` is called |
| Calls onRegisterClick when Register is clicked | Confirms `onRegisterClick` is called |

#### Registration.test.jsx
| Test | Description |
|---|---|
| Renders registration form with all required fields | All inputs, labels, and buttons are present |
| Validates empty and invalid form inputs | Empty → required errors; short password → length error; mismatch → mismatch error |
| Submits form with valid input and sends correct API request | Verifies endpoint, method, and body |
| Displays success message and triggers callback on success | Success message shown; `onRegistrationSuccess` called |
| Displays error message when registration fails | Server error message displayed; callback not called |

#### Search.test.jsx
| Test | Description |
|---|---|
| Renders search input without crashing | Input field is present |
| Uses default id and label when none provided | Defaults to `id="Search"` and `label="Search"` |
| Accepts and displays custom id and label props | Custom props are applied |
| Calls provided return function on input change | `return` callback fires on change |

#### UserBadge.test.jsx
| Test | Description |
|---|---|
| Renders without exceptions | No error on mount |
| Renders user name | Passed `user` prop appears in DOM |
| Renders default icon | `userDefault.png` used when no `img` prop given |
| Renders provided icon | Passed `img` prop value used |

#### ServerBadge.test.jsx
| Test | Description |
|---|---|
| Renders without exceptions | No error on mount |
| Renders server name | Server object name renders |
| Renders default server icon | `serverDefault.png` used when no icon supplied |
| Renders provided server icon | Server object's `icon` path used |

#### ServerList.test.jsx
| Test | Description |
|---|---|
| Renders without exceptions | No error on mount |
| Server list renders all test servers | Every server name in the array is visible |
| Search filters servers returned | Typing a query hides non-matching servers |
| Selecting a server calls onServerSelect and onChannelSelect with default channel | Both callbacks fire with correct args |
| Clicking on a channel calls onChannelSelect | `onChannelSelect` fires with the channel name |
| Adding a new channel works | Add form calls `onServerSelect` with updated channels |
| Visual indication is applied to the selected channel | `onChannelSelect` called with the correct channel |

#### MenuBar.test.jsx
| Test | Description |
|---|---|
| Renders without crashing | Paper container is present |
| Renders ServerBadge with correct props | Server name shows in badge |
| Renders search component with correct label | "Search messages" label present |
| Renders menu button with icon | Toggle button and MenuIcon present |
| Calls setVisible with opposite value when menu button is clicked | `setVisible` receives a toggle function |
| Displays the selected channel name in the channel button | Correct channel name shown |
| Displays "Select Channel" when no channel is selected | Fallback text shown |
| Opens the channel menu when the channel button is clicked | Dropdown opens with all channels listed |
| Selects a channel when a menu item is clicked | `onChannelSelect` called with that channel |
| Marks the current selected channel as selected in the menu | Active channel has `data-selected="true"` |
| Handles the case when selectedServer has no channels | Empty dropdown renders without errors |
| Handles the case when selectedServer is null | Graceful fallback rendering |

#### ActiveServer.test.jsx
| Test | Description |
|---|---|
| Renders a placeholder when no server is selected | "Select a server to start chatting" visible |
| Renders the main chat interface when a server is selected | MenuBar, input, and Send button present |
| Passes the correct props to MenuBar | Mocked MenuBar receives correct server and channel |
| Displays messages correctly | Each message's user label and text body render |
| Forwards channel selection from MenuBar | `onChannelSelect` propagates to parent |
| Allows sending messages when a server and channel are selected | `console.log` called; input clears |
| Does not send empty messages | `console.log` not called on empty submit |
| Handles message sending via Enter key | Enter key triggers send |
| Does not call onChannelSelect when no channel is selected | Null channel handled gracefully |

#### ServerAndMembers.test.jsx
| Test | Description |
|---|---|
| Renders without crashing | Paper container and ActiveServer mock present |
| Passes the correct props to ActiveServer | Server name, channel, and message count forwarded correctly |
| Does not render Members by default | Members panel absent on initial mount |
| Renders Members when visible state is true | Toggle reveals Members panel |
| Forwards channel selection to parent component | `onChannelSelect` propagates |
| Handles null server and channel gracefully | Shows "No server", "No channel", count 0 |

#### MainScreen.test.jsx
| Test | Description |
|---|---|
| Renders without crashing | Both panels render |
| Initializes with no selected server and channel | Initial state is empty |
| Updates the selected server and channel when a server is selected | Server name and first channel appear |
| Updates the selected channel from the server list | Channel state updates via list mock |
| Updates the selected channel from the dropdown menu | Channel state updates via ServerAndMembers mock |
| Loads messages when a server and channel are selected | Message count > 0; differs between channels |
| Retains channel selection when changing between servers | Server name reflected correctly |
| Handles state updates properly when changing channels | Multiple channel switches update state correctly |

#### ProfileEditModal.test.jsx *(new — Sprint 4)*
| Test | Description |
|---|---|
| Modal is not visible before the Edit button is clicked | `queryByRole('dialog')` returns null |
| Modal opens when the Edit button is clicked | Dialog renders with "Edit Profile" heading |
| Pre-fills the Username field with the current username | Input value matches current username |
| Pre-fills the About Me field with the current about text | Textarea value matches current bio |
| Does not update the sidebar username when Cancel is clicked | Original username remains in sidebar |
| Typed value is not persisted in sidebar after Cancel | No bold element shows the cancelled text |
| Updates the sidebar username after Save | New username appears bold in sidebar |
| Updates the About Me text in the sidebar after Save | New bio appears in correct styled div |
| Shows all four status options when dropdown is opened | Online, Away, DND, Invisible all present |
| Resets unsaved edits when the modal is cancelled and reopened | Reopening shows original username |
| Reflects the latest saved value after multiple saves | Second save overwrites first |

#### CustomUserBadge.test.jsx *(new — Sprint 4)*
| Test | Description |
|---|---|
| Renders without crashing | No error on mount |
| Displays the username | "Your Username" text visible |
| Renders the Edit button | "Edit" button present |
| Displays the About Me text | Bio text visible |
| Displays "Online" status label by default | "Online" label present |
| Shows a green status dot by default | Green dot in DOM |
| Displays "Away" label after switching status to Away | "Away" label in badge |
| Shows an orange dot after switching status to Away | Orange dot in DOM |
| Displays "DND" label after switching status to DND | "DND" label in badge |
| Shows a red dot after switching status to DND | Red dot in DOM |
| Displays "Invisible" label after switching status to Invisible | "Invisible" label in badge |
| Shows a gray dot after switching status to Invisible | Gray dot in DOM |
| Opens the profile edit modal when Edit is clicked | Dialog appears |
| Shows the new username in the badge after saving | Updated name renders bold |
| Removes the old username from the badge after saving | Old name no longer present |
| Shows the new About Me text in the badge after saving | New bio visible in badge |
| Removes the old About Me text after it is cleared and saved | Old bio no longer present |

---

### Cypress Component Tests

Run from `frontend/` directory:
```bash
npx cypress run --component
```

**Results: ✔ 15 tests — 15 passing, 0 pending**

#### ActiveServer.cy.jsx — 3/3 passing ✅
| Test | Description |
|---|---|
| Displays placeholder when no server is selected | "Select a server to start chatting" visible |
| Displays chat interface with server and channel | Messages and input visible |
| Allows sending messages | Input clears; `console.log` fires |

#### Login.cy.jsx — 5/5 passing ✅
| Test | Description |
|---|---|
| Renders the login form correctly | All elements visible |
| Prevents login with empty fields | `onLogin` stub not called |
| Allows login with valid credentials | `onLogin` stub called |
| Navigates to registration when Register is clicked | `onRegisterClick` stub called |
| Debug input fields | Logs input attributes |

#### ServerList.cy.jsx — 7/7 passing ✅ *(previously 1 pending)*
| Test | Description |
|---|---|
| Displays all servers initially | All server names visible |
| Filters servers based on search input | Non-matching servers hidden |
| Selects a server and its first channel when clicked | Both stubs called |
| Can add a new channel to a selected server | `onServerSelect` called with updated data |
| Debug selectors | Logs input attributes |
| Allows editing user profile ✅ *(was pending)* | Opens modal, updates username, confirms sidebar |

---

### Cypress E2E Tests

Start the dev server first, then run from `frontend/`:
```bash
npm run dev             # Terminal 1
npx cypress run --e2e   # Terminal 2
```

**Results: ✔ 17 tests — 17 passing, 0 pending** *(3 tests resolved from Sprint 2/3)*

#### app-flow.cy.js — 7/7 passing ✅
| Test | Description |
|---|---|
| Shows the server list on the main screen | All server names visible after login |
| Selects a server and shows its channel panel | Channels appear |
| Filters servers with the search box | Search narrows list; clear restores all |
| Selects a channel and shows the message input | Input and Send button visible |
| Clears the message input after clicking Send | Input empty after send |
| Adds a new channel via + Add Channel | New channel appears |
| Cancels adding a channel without changing the list | Cancelled name does not appear |

#### login-flow.cy.js — 4/4 passing ✅
| Test | Description |
|---|---|
| Displays the login form | Heading, inputs, Sign In visible |
| Prevents login with empty fields | Login page still visible |
| Allows navigation to registration page | "Create an Account" heading appears |
| Transitions to main screen after successful login | `div.ColorBox` visible |

#### registration.cy.js — 6/6 passing ✅ *(previously 4/6 + 2 pending)*
| Test | Description |
|---|---|
| Displays all registration form elements | All inputs and buttons visible |
| Validates form fields correctly ✅ *(was pending)* | All three validation errors verified |
| Attempts registration with valid data ✅ *(was pending)* | `cy.intercept` mocks backend; form stays on screen |
| Navigates back to the Login page | Login page shown |
| Debug registration form fields and buttons | Logs attributes |

---

## Backend

### Work Completed

All 42 backend unit tests from Sprint 3 continue to pass without modification. The backend API is stable and fully integrated with the frontend.

Run from the project root:
```bash
go test -p 1 -v ./...
```

**Results: PASS — 42 tests, 0 failures**

---

### Backend Unit Tests

#### Authentication (`auth_standalone_test.go`)
| Test | Description |
|---|---|
| Authentication Flow | Gets challenge, signs it, logs in, confirms JWT; verifies authorized access succeeds and unauthorized/invalid-token access returns 401 |
| JWT Token Persistence | Obtains a valid JWT and makes 3 successive requests; each returns 200 |
| Invalid Authentication Attempts | Non-existent username → 404; invalid signature → 401 |

#### Root & Health (`sector_test.go`)
| Test | Description |
|---|---|
| Get Root | `GET /v1/api/` returns 200 with welcome message |
| Get Health | `GET /v1/api/health` returns 200 |

#### Account Management
| Test | Description |
|---|---|
| Create Account | `POST /v1/api/account/` returns 201; duplicate ID returns 500 |
| Update Account By Id | Updates username; response reflects change |
| Delete Account By Id | Deletes account; second delete returns 500 |
| Get By Id | Retrieves account by UUID; all fields match |
| Search Accounts / By Id | UUID search returns exactly that account |
| Search Accounts / By creation time | Date-range filter returns accounts within range |
| Search Accounts / By username | Fuzzy username search returns matching accounts |

#### Group Management
| Test | Description |
|---|---|
| Create Group | `POST /v1/api/group/` returns 201 |
| Update Group By Id | Updates group name; response reflects change |
| Delete Group By Id | Deletes group; second delete returns 500 |
| Get Group By Id | Retrieves group; all fields match |
| Search Groups / By Id | UUID search returns correct groups |
| Search Groups / By creation time | Date-range filter returns groups within range |
| Search Groups / By name | Fuzzy name search returns matching groups |
| Search Groups / By members | Member ID filter returns correct groups |
| Add Member | Adds account to group; returns 201 |
| Remove Member | Removes member; confirmed by subsequent GET |

#### Channel Management
| Test | Description |
|---|---|
| Create Channel | `POST /v1/api/group/{id}/channel/` returns 201; invalid group returns 500 |
| Update Channel By Id | Updates channel name; response reflects change |
| Delete Channel By Id | Deletes channel; second delete returns 500 |
| Get Channel By Id | Retrieves channel; all fields match |
| Search Channels / By Id | UUID search returns correct channel |
| Search Channels / By creation time | Date-range filter returns channels within range |
| Search Channels / By name | Fuzzy name search returns matching channels |
| Search Channels / By group | Group ID filter returns channels in that group |

#### Message Management
| Test | Description |
|---|---|
| Create Message | `POST .../message` returns 201; invalid channel/author returns 500 |
| Update Message By Id | Updates message body; response reflects change |
| Delete Message By Id | Deletes message; second delete returns 500 |
| Get Message By Id | Retrieves message; all fields match |
| Search Message / By Id | UUID search returns correct message |
| Search Message / By creation time | Date-range filter returns messages within range |
| Search Message / By author | Author UUID filter returns messages by that author |
| Search Message / By channel | Channel UUID filter returns messages in that channel |
| Search Message / By pinned | `pinned=true` filter returns only pinned messages |
| Search Message / By body | Fuzzy body search returns matching messages |

#### Authentication Middleware
| Test | Description |
|---|---|
| Test Unauthenticated Access | Request without token returns 401 |
| Test Authentication Flow | Creates account, gets challenge, signs it, logs in, confirms JWT grants access |

---

## Backend API Documentation

The API runs on `http://localhost:3000` during development. All endpoints are prefixed with `/v1/api`. Live Swagger UI at `http://localhost:3000/v1/swagger-ui/`.

All endpoints except `GET /v1/api/`, `GET /v1/api/health`, `GET /v1/api/challenge`, and `POST /v1/api/login` require `Authorization: Bearer <token>`.

---

### Authentication

#### `GET /v1/api/challenge`
Issues a one-time challenge string the client signs with their RSA private key.

**Query parameters:** `username` (string, required)

**Response `200 OK`**
```json
{ "challenge": "<base64-encoded random bytes>" }
```
**Errors:** `400` username missing · `404` user not found

---

#### `POST /v1/api/login`
Verifies the signed challenge and returns a JWT.

**Request body**
```json
{ "username": "alice", "signature": "<base64-encoded RSA-SHA256 signature>" }
```
**Response `200 OK`**
```json
{ "token": "<JWT>" }
```
**Errors:** `400` bad body · `401` bad signature · `404` user not found

---

### Account

#### `POST /v1/api/account/`
Creates a new user account.
```json
{ "id": "<UUID>", "username": "alice", "pubkey": "-----BEGIN PUBLIC KEY-----\n...", "profile_pic": "" }
```
**`201 Created`** — created account with `id` and `created_at`.

#### `GET /v1/api/account/{id}`
Retrieves an account by UUID. **`200 OK`**

#### `PUT /v1/api/account/{id}`
Updates account fields. **`201 Created`** — updated account.

#### `DELETE /v1/api/account/{id}`
Deletes an account and removes it from all group member lists. **`204 No Content`**

#### `POST /v1/api/account/search`
Fuzzy-searches accounts.
```json
{ "username": "ali", "from": "2024-01-01T00:00:00Z", "until": "2025-01-01T00:00:00Z" }
```
**`200 OK`** — array of matching accounts.

---

### Group

#### `POST /v1/api/group/`
Creates a new group.
```json
{ "id": "<UUID>", "name": "My Server", "description": "", "members": [] }
```
**`201 Created`** — created group.

#### `GET /v1/api/group/{groupId}`
Retrieves a group including its `members` array. **`200 OK`**

#### `PUT /v1/api/group/{groupId}`
Updates group fields. **`201 Created`** — updated group.

#### `DELETE /v1/api/group/{groupId}`
Deletes a group and cascades to all its channels and messages. **`204 No Content`**

#### `POST /v1/api/group/search`
Searches groups.
```json
{ "name": "server", "members": ["<UUID>"] }
```
**`200 OK`** — array of matching groups.

#### `POST /v1/api/group/{groupId}/members/{memberId}`
Adds an account as a group member. **`201 Created`** — updated group.

#### `DELETE /v1/api/group/{groupId}/members/{memberId}`
Removes a member from a group. **`204 No Content`**

---

### Channel

#### `POST /v1/api/group/{groupId}/channel/`
Creates a channel inside a group.
```json
{ "id": "<UUID>", "name": "general", "description": "", "group": "<groupId>" }
```
**`201 Created`** — created channel.

#### `GET /v1/api/group/{groupId}/channel/{channelId}`
Retrieves a channel. **`200 OK`**

#### `PUT /v1/api/group/{groupId}/channel/{channelId}`
Updates channel fields. **`201 Created`** — updated channel.

#### `DELETE /v1/api/group/{groupId}/channel/{channelId}`
Deletes a channel and all its messages. **`204 No Content`**

#### `POST /v1/api/channel/search`
Searches channels.
```json
{ "name": "general", "group": ["<UUID>"] }
```
**`200 OK`** — array of matching channels.

---

### Message

#### `POST /v1/api/group/{groupId}/channel/{channelId}/message`
Creates a message.
```json
{ "id": "<UUID>", "body": "Hello!", "author": "<UUID>", "channel": "<UUID>", "pinned": false }
```
**`201 Created`** — created message.

#### `GET /v1/api/group/{groupId}/channel/{channelId}/message/{messageId}`
Retrieves a message. **`200 OK`**

#### `PUT /v1/api/group/{groupId}/channel/{channelId}/message/{messageId}`
Updates a message (edit body, pin/unpin). **`201 Created`** — updated message.

#### `DELETE /v1/api/group/{groupId}/channel/{channelId}/message/{messageId}`
Deletes a message. **`204 No Content`**

#### `POST /v1/api/message/search`
Searches messages. All fields optional; strings use fuzzy matching.
```json
{
  "body": "hello",
  "author": ["<UUID>"],
  "channel": ["<UUID>"],
  "pinned": true,
  "from": "2024-01-01T00:00:00Z",
  "until": "2025-01-01T00:00:00Z"
}
```
**`200 OK`** — array of matching messages.

---

### Miscellaneous

#### `GET /v1/api/`
Returns `{"message":"Hello, World!"}`. No auth required.

#### `GET /v1/api/health`
Returns `200 OK` if the server is running. No auth required.

---

## Sprint 4 Outcome

✔ 3 previously pending Cypress tests now fully passing (0 pending total)  
✔ 2 new Vitest test files added — `ProfileEditModal` (11 tests) and `CustomUserBadge` (17 tests)  
✔ `ProfileEditModal` and `CustomUserBadge` components fully implemented  
✔ `vite.config.js` updated to exclude `.cy.jsx` files from Vitest collection  
✔ `README.md` added to project root  
✔ All 42 backend unit tests passing  
✔ All 13 Vitest test files passing — 0 failures  
✔ 15 Cypress component tests passing — 0 pending  
✔ 17 Cypress E2E tests passing — 0 pending
