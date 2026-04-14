# 🚀 Sprint 3 Report – PrivateMesh

## Sprint Focus: Completing Deferred Features, New Functionality & Expanded Testing

---

## 👤 Team Members

- **Backend Developer + E2E Testing:** Anish Mannem
- **Frontend Developer:** Kanakavalli Muraharisetty

---

## 📌 Sprint 3 Goal

The goal of Sprint 3 was to:

- Complete all tests that were deferred or marked `it.skip` in Sprint 2
- Implement user profile editing with status selection (Online, Away, DND, Invisible) and an "About Me" bio field
- Write new Vitest unit tests for the two new Sprint 3 components (`ProfileEditModal`, `CustomUserBadge`)
- Maintain all 42 passing backend unit tests with zero regressions

---

## 📝 User Stories

### 1️⃣ User Profile Editing

_As a user, I would like to edit my profile so I can update my display name, profile picture, status, and bio._

Acceptance Criteria:

- User can open a profile edit modal from the server list panel via an "Edit" button
- User can change their username
- User can upload a new profile picture (previewed inside the modal)
- User can set their online status: Online, Away, DND, or Invisible
- User can write an "About Me" bio
- Status is shown in the sidebar with a colored dot indicator next to the username
- All changes are reflected immediately in the sidebar after saving

### 2️⃣ Registration Form Validation (E2E)

_As a user, I would like to receive clear error messages when I fill out the registration form incorrectly._

Acceptance Criteria:

- Submitting with an empty username shows "Username is required"
- A password shorter than 6 characters shows "Password must be at least 6 characters"
- Mismatched passwords show "Passwords do not match"
- Submitting a valid form calls the backend `/v1/api/account/` endpoint
- Successful registration shows "Registration successful! You can now log in."

---

## 🔧 Issues Addressed This Sprint

### 🔹 Backend + E2E Testing (Anish)

1. Removed `it.skip` from `"validates form fields correctly"` in `registration.cy.js` — tests empty username, short password, and mismatched passwords
2. Removed `it.skip` from `"attempts registration with valid data"` in `registration.cy.js` — added `cy.intercept` to mock `POST /v1/api/account/` so the test does not need a live backend
3. Confirmed all 42 backend unit tests continue to pass with no regressions

### 🔹 Frontend (Kanakavalli)

1. Removed `it.skip` from `"allows editing user profile"` in `cypress/component/ServerList.cy.jsx` — fixed the username input selector from the fragile `cy.get('input').eq(1)` to `cy.get('input[aria-label="Username"]')`
2. Added `React.useEffect` to `ProfileEditModal` inside `ServerList.jsx` so local state resets every time the modal opens — without this, cancelling and reopening the modal would still show stale unsaved values
3. Created `frontend/src/test/ProfileEditModal.test.jsx` — 12 new Vitest unit tests
4. Created `frontend/src/test/CustomUserBadge.test.jsx` — 14 new Vitest unit tests

---

## ✅ Successfully Completed Tasks

### 🔹 Backend + E2E Testing – Anish

- All 42 backend Go unit tests passing — no regressions
- 2 previously skipped Cypress E2E tests now passing
- Full Cypress E2E suite: **17 tests, 17 passing, 0 pending**

**Files Modified:**

- `frontend/cypress/e2e/registration.cy.js`

---

### 🔹 Frontend – Kanakavalli

- 1 previously skipped Cypress component test now passing
- Full Cypress component suite: **15 tests, 15 passing, 0 pending**
- `ProfileEditModal` state-reset bug fixed via `useEffect`

**Files Modified / Added:**

- `frontend/src/MainScreen/ServerList/ServerList.jsx` — added `useEffect` to `ProfileEditModal`
- `frontend/cypress/component/ServerList.cy.jsx` — removed `it.skip`, fixed selector
- `frontend/src/test/ProfileEditModal.test.jsx` _(new)_
- `frontend/src/test/CustomUserBadge.test.jsx` _(new)_

---

## 🧪 Frontend Unit Tests (Vitest)

Run from `frontend/` directory:

```
npm run test
```

---

### ActiveServer.test.jsx

- renders a placeholder when no server is selected
- renders the main chat interface when a server is selected
- passes the correct props to MenuBar
- displays messages correctly
- forwards channel selection from MenuBar
- allows sending messages when a server and channel are selected
- does not send empty messages
- handles message sending via Enter key
- does not call onChannelSelect when no channel is selected

### App.test.jsx

- Renders without exceptions

### CustomUserBadge.test.jsx _(new — Sprint 3)_

- renders without crashing
- displays the username
- renders the Edit button
- displays the About Me text
- displays "Online" status label by default
- displays "Away" label after switching status to away
- displays "DND" label after switching status to do-not-disturb
- displays "Invisible" label after switching status to invisible
- opens the profile edit modal when Edit is clicked
- shows the new username in the badge after saving
- shows the new About Me text in the badge after saving
- removes the old About Me text after it is cleared and saved
- reflects the latest saved value after multiple saves
- does not call onUpdateUser when Cancel is clicked _(via cancel + reopen check)_

### Login.test.jsx

- renders without crashing
- handles empty form submission
- handles valid form submission
- navigates to registration when Register is clicked

### MainScreen.test.jsx

- renders without crashing
- initializes with no selected server and channel
- updates the selected server and channel when a server is selected
- updates the selected channel when a channel is selected from the server list
- updates the selected channel when a channel is selected from the dropdown menu
- loads messages when a server and channel are selected
- retains channel selection when changing between servers
- handles state updates properly when changing channels

### MenuBar.test.jsx

- renders without crashing
- renders ServerBadge with correct props
- renders Search component with correct label
- renders menu button with icon
- calls setVisible with a toggle function when menu button is clicked
- displays the selected channel name in the channel button
- displays "select channel" when no channel is selected
- opens the channel menu when the channel button is clicked
- selects a channel when a menu item is clicked
- marks the current selected channel as selected in the menu
- handles the case when selectedServer has no channels
- handles the case when selectedServer is null

### ProfileEditModal.test.jsx _(new — Sprint 3)_

- modal is not visible before the Edit button is clicked
- modal opens when the Edit button is clicked
- pre-fills the Username field with the current username
- pre-fills the About Me field with the current about text
- closes the modal when Cancel is clicked
- does not save changes when Cancel is clicked
- closes the modal when Save is clicked
- updates the displayed username after saving a new name
- updates the displayed About Me text after saving
- shows all four status options in the dropdown
- resets unsaved edits when the modal is closed then reopened
- reflects the latest saved value after multiple saves

### Registration.test.jsx

- renders without crashing
- shows required-field errors when submitted empty
- shows minimum-length error for a short password
- shows mismatch error when passwords differ
- calls fetch with correct endpoint and method on valid submit
- includes id and username in the request body
- shows the success message after a 200 response
- calls onRegistrationSuccess after a 200 response
- shows the server error message on a non-ok response
- does not call onRegistrationSuccess on a failed response
- navigates to login page when Login link is clicked

### Search.test.jsx

- renders without crashing
- has default id and label
- accepts custom id and label
- calls return function on change

### ServerAndMembers.test.jsx

- renders without crashing
- passes the correct props to ActiveServer
- does not render Members by default (visible is false)
- renders Members when visible state is true
- forwards channel selection to parent component
- handles null server and channel gracefully

### ServerBadge.test.jsx

- Renders without exceptions
- Renders server name
- Renders default server icon
- Renders provided server icon

### ServerList.test.jsx

- Renders without exceptions
- Server list renders all test servers
- Search filters servers returned
- Selecting a server calls onServerSelect and onChannelSelect with default channel
- Clicking on a channel calls onChannelSelect
- Adding a new channel works
- Visual indication is applied to the selected channel

### UserBadge.test.jsx

- Renders without exceptions
- Renders server name
- Renders default server icon
- Renders provided server icon

---

## 🌲 Cypress Component Tests

Run from `frontend/` directory:

```
npx cypress run --component
```

**Final results: ✔ All specs passed — 15 tests, 15 passing, 0 pending**

| Spec                | Tests | Passing | Pending |
| ------------------- | ----- | ------- | ------- |
| ActiveServer.cy.jsx | 3     | 3       | 0       |
| Login.cy.jsx        | 5     | 5       | 0       |
| ServerList.cy.jsx   | 7     | 7       | 0       |

### ActiveServer.cy.jsx — 3/3 passing ✅

- displays a placeholder when no server is selected
- displays the chat interface when a server and channel are selected
- allows sending messages

### Login.cy.jsx — 5/5 passing ✅

- renders the login form correctly
- prevents login with empty fields
- allows login with valid credentials
- navigates to registration when Register button is clicked
- debug input fields

### ServerList.cy.jsx — 7/7 passing ✅ _(was 5/5 passing + 1 pending in Sprint 2)_

- displays all servers initially
- filters servers based on search input
- selects a server and its first channel when clicked
- can add a new channel to a selected server
- debug selectors
- **allows editing user profile** _(previously `it.skip` — now passing)_
- **verifies status label updates after saving a new status** _(new — Sprint 3)_

---

## 🌐 Cypress E2E Tests

Start the frontend dev server first, then run from `frontend/`:

```
npm run dev             # Terminal 1
npx cypress run --e2e   # Terminal 2
```

**Final results: ✔ All specs passed — 17 tests, 17 passing, 0 pending**

| Spec               | Tests | Passing | Pending |
| ------------------ | ----- | ------- | ------- |
| app-flow.cy.js     | 6     | 6       | 0       |
| login-flow.cy.js   | 4     | 4       | 0       |
| registration.cy.js | 7     | 7       | 0       |

### app-flow.cy.js — 6/6 passing ✅

- allows server selection and displays channels
- allows channel selection and message sending
- allows adding a new channel
- allows toggling members sidebar
- can search for servers
- debug UI elements

### login-flow.cy.js — 4/4 passing ✅

- displays the login form
- prevents login with empty fields
- allows navigation to registration page
- handles login and displays the main screen

### registration.cy.js — 7/7 passing ✅ _(was 3/3 passing + 2 pending in Sprint 2)_

- displays the registration form
- **validates form fields correctly** _(previously `it.skip` — now passing)_
- **attempts registration with valid data** _(previously `it.skip` — now passing, uses `cy.intercept`)_
- navigates back to login
- debug registration form fields and buttons
- shows username required error on empty submit _(new — Sprint 3)_
- shows password length error when password is too short _(new — Sprint 3)_

---

## 🧪 Backend Unit Tests (Go)

Run from project root:

```
go test -p 1 -v ./...
```

**Final results: PASS — 42 tests, 0 failures — no regressions from Sprint 2**

### auth_standalone_test.go — TestAuthenticationStandalone

- Authentication Flow
- JWT Token Persistence
- Invalid Authentication Attempts

### sector_test.go — TestSectorV1

**Root & Health**

- Get Root
- Get Health

**Account Management**

- Create Account
- Update Account By Id
- Delete Account By Id
- Get By Id
- Search Accounts / By Id
- Search Accounts / By creation time
- Search Accounts / By username

**Group Management**

- Create Group
- Update Group By Id
- Delete Group By Id
- Get Group By Id
- Search Groups / By Id
- Search Groups / By creation time
- Search Groups / By name
- Search Groups / By members
- Add Member
- Remove Member

**Channel Management**

- Create Channel
- Update Channel By Id
- Delete Channel By Id
- Get Channel By Id
- Search Channels / By Id
- Search Channels / By creation time
- Search Channels / By name
- Search Channels / By group

**Message Management**

- Create Message
- Update Message By Id
- Delete Message By Id
- Get Message By Id
- Search Message / By Id
- Search Message / By creation time
- Search Message / By author
- Search Message / By channel
- Search Message / By pinned
- Search Message / By body

**Authentication Middleware**

- Test Unauthenticated Access
- Test Authentication Flow

---

## 📖 Backend API Documentation

The API runs on `http://localhost:3000` during development (`wails dev`).
All endpoints are prefixed with `/v1/api`.
Live Swagger UI is available at `http://localhost:3000/v1/swagger-ui/`.

All endpoints except `/v1/api/`, `/v1/api/health`, `/v1/api/challenge`, and `/v1/api/login` require a JWT token in the `Authorization` header as `Bearer {token}`.

---

### Authentication

#### `GET /v1/api/challenge`

Issues a one-time challenge string for the client to sign with their RSA private key.

**Query parameters**

- `username` (string, required)

**Response `200 OK`**

```json
{ "challenge": "<base64-encoded random bytes>" }
```

**Errors:** `400` username missing · `404` user not found

---

#### `POST /v1/api/login`

Verifies the signed challenge and returns a JWT token.

**Request body**

```json
{
  "username": "alice",
  "signature": "<base64-encoded RSA-SHA256 signature>"
}
```

**Response `200 OK`**

```json
{ "token": "<JWT>" }
```

**Errors:** `400` bad body or no active challenge · `401` bad signature · `404` user not found

---

### Account

#### `POST /v1/api/account/`

Creates a new user account.

**Request body**

```json
{
  "username": "alice",
  "pubkey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
  "icon": "",
  "description": "Hey there!"
}
```

**Response `201 Created`** — created account object with generated `id` and `created_at`.

---

#### `GET /v1/api/account/{id}`

Retrieves an account by UUID.
**Response `200 OK`** — account object. **`404`** if not found.

---

#### `PUT /v1/api/account/{id}`

Updates an account. All writable fields must be supplied.
**Response `200 OK`** — updated account object.

---

#### `DELETE /v1/api/account/{id}`

Deletes an account.
**Response `204 No Content`**

---

#### `POST /v1/api/account/search`

Searches accounts. All fields optional; strings use fuzzy matching.

**Request body**

```json
{ "username": "ali" }
```

**Response `200 OK`** — array of matching accounts.

---

### Group

#### `POST /v1/api/group/`

Creates a new group.

**Request body**

```json
{
  "name": "My Server",
  "description": "A place for us",
  "icon": "",
  "members": []
}
```

**Response `201 Created`** — created group object.

---

#### `GET /v1/api/group/{groupId}`

Retrieves a group by UUID.
**Response `200 OK`** — group object including `members` array.

---

#### `PUT /v1/api/group/{groupId}`

Updates a group.
**Response `200 OK`** — updated group object.

---

#### `DELETE /v1/api/group/{groupId}`

Deletes a group and cascades deletion to all its channels and messages.
**Response `204 No Content`**

---

#### `POST /v1/api/group/search`

Searches groups.

**Request body**

```json
{ "name": "server", "member_id": "<UUID>" }
```

**Response `200 OK`** — array of matching groups.

---

#### `POST /v1/api/group/{groupId}/members/{memberId}`

Adds an existing account as a group member.
**Response `200 OK`** — updated group object.

---

#### `DELETE /v1/api/group/{groupId}/members/{memberId}`

Removes a member from a group.
**Response `204 No Content`**

---

### Channel

#### `POST /v1/api/group/{groupId}/channel/`

Creates a channel inside a group.

**Request body**

```json
{ "name": "general", "description": "General discussion" }
```

**Response `201 Created`** — created channel object with `group` UUID.

---

#### `GET /v1/api/group/{groupId}/channel/{channelId}`

Retrieves a channel.
**Response `200 OK`** — channel object.

---

#### `PUT /v1/api/group/{groupId}/channel/{channelId}`

Updates a channel.
**Response `200 OK`** — updated channel object.

---

#### `DELETE /v1/api/group/{groupId}/channel/{channelId}`

Deletes a channel and all its messages.
**Response `204 No Content`**

---

#### `POST /v1/api/channel/search`

Searches channels across all groups.

**Request body**

```json
{ "name": "general", "group_id": "<UUID>" }
```

**Response `200 OK`** — array of matching channels.

---

### Message

#### `POST /v1/api/group/{groupId}/channel/{channelId}/message`

Creates a message in a channel.

**Request body**

```json
{
  "body": "Hello, world!",
  "author": "<UUID of account>",
  "pinned": false
}
```

**Response `201 Created`** — created message object.

---

#### `GET /v1/api/group/{groupId}/channel/{channelId}/message/{messageId}`

Retrieves a message.
**Response `200 OK`** — message object.

---

#### `PUT /v1/api/group/{groupId}/channel/{channelId}/message/{messageId}`

Updates a message (edit body, pin/unpin).
**Response `200 OK`** — updated message object.

---

#### `DELETE /v1/api/group/{groupId}/channel/{channelId}/message/{messageId}`

Deletes a message.
**Response `204 No Content`**

---

#### `POST /v1/api/message/search`

Searches messages across all channels. All fields optional; strings use fuzzy matching.

**Request body**

```json
{
  "body": "hello",
  "author_id": "<UUID>",
  "channel_id": "<UUID>",
  "pinned": true
}
```

**Response `200 OK`** — array of matching messages.

---

### Miscellaneous

#### `GET /v1/api/`

Root endpoint. Returns a plain-text welcome message. No auth required.

#### `GET /v1/api/health`

Health check. Returns `200 OK` if the server is running. No auth required.

---

## 🎯 Sprint 3 Outcome

✔ All Sprint 2 pending/skipped tests resolved — 0 pending tests remaining  
✔ 42 backend unit tests continuing to pass — 0 regressions  
✔ 15 Cypress component tests passing (0 pending)  
✔ 17 Cypress E2E tests passing (0 pending)  
✔ `ProfileEditModal` state-reset bug fixed via `React.useEffect`  
✔ New Vitest test file `ProfileEditModal.test.jsx` — 12 tests  
✔ New Vitest test file `CustomUserBadge.test.jsx` — 14 tests  
✔ Registration E2E validation fully covered with `cy.intercept` for backend independence



Video link
Anish - https://github.com/anishmannem963/private-mesh-chat
Kanakavalli - 
