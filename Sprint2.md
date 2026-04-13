# 🚀 Sprint 2 Report – PrivateMesh

## Sprint Focus: API Development, Testing & Frontend-Backend Integration

---

## 👤 Team Members

- **Backend Developer + E2E Testing:** Anish Mannem
- **Frontend Developer:** Kanakavalli Muraharisetty

---

## 📌 Sprint 2 Goal

The goal of Sprint 2 was to:

- Complete all core backend API endpoints (Account, Group, Channel, Message)
- Write comprehensive backend unit tests
- Write frontend unit tests for all components
- Write Cypress component and E2E tests
- Integrate the frontend and backend so they communicate over HTTP
- Document the full backend API in this file

---

## 📝 User Stories

### 1️⃣ Group Chats
*As a user, I would like to participate in group chats so I can communicate with multiple people at once.*

Acceptance Criteria:
- Users can create a group (server)
- Users can be added as members of a group
- Groups can be retrieved and updated

### 2️⃣ Login
*As a user, I would like to securely log into the application to access my account and personalized settings.*

Acceptance Criteria:
- User can enter a username and password
- Backend issues a challenge and verifies the signed response
- A JWT token is returned on successful login
- Protected routes reject requests without a valid token

### 3️⃣ Search Bar
*As a user, I would like to be able to search for a particular message or content within the application.*

Acceptance Criteria:
- Server list can be filtered in real time by name
- Search component is reusable across the interface

---

## 🔧 Issues Addressed This Sprint

### 🔹 Backend + E2E Testing (Anish)
1. Implemented CRUD endpoints for Account, Group, Channel, and Message
2. Implemented search endpoints with fuzzy matching for all resources
3. Implemented cascaded deletion (deleting a group removes its channels and messages)
4. Implemented JWT authentication and challenge-response login
5. Added JWT middleware to protect all non-public routes
6. Integrated Wails framework for desktop app packaging
7. Wrote unit tests for all API endpoints
8. Wrote standalone authentication unit tests
9. Generated Swagger UI documentation
10. Wrote Cypress E2E tests covering full app flow, login flow, and registration flow

### 🔹 Frontend (Kanakavalli)
1. Implemented dynamic server list with real-time search filtering
2. Built reusable Search component
3. Built UserBadge and ServerBadge components
4. Built ActiveServer view with message display and input
5. Built MenuBar with channel selector and member list toggle
6. Built Login page with username/password form
7. Built Registration page
8. Wrote Vitest unit tests for all components
9. Wrote Cypress component tests for Login, ServerList, ActiveServer

---

## ✅ Successfully Completed Tasks

### 🔹 Backend + E2E Testing – Anish

- All CRUD + search endpoints implemented for Account, Group, Channel, Message
- Challenge-response authentication with RSA public key cryptography
- JWT token generation and middleware-based route protection
- Cascaded delete logic maintaining data consistency
- Fuzzy search using `lithammer/fuzzysearch`
- Wails desktop framework integrated
- Swagger UI served at `/v1/swagger-ui/`
- All 42 backend unit tests passing
- Cypress E2E tests written covering integrated full-stack user flows

**Files Implemented:**
- `app.go`
- `main.go`
- `wails.json`
- `go.mod` / `go.sum`
- `sample.env`
- `generate.sh`
- `models/v1/schema.yaml`
- `models/v1/config.yaml`
- `internal/api/api.go`
- `internal/api/v1/sector.go`
- `internal/api/v1/sector.gen.go`
- `internal/api/v1/operations.go`
- `internal/api/v1/auth.go`
- `internal/api/v1/swagger-ui.html`
- `internal/auth/jwt.go`
- `internal/auth/challenge_store.go`
- `internal/config/config.go`
- `internal/database/database.go`
- `internal/database/ipfs_helpers.go`
- `internal/database/mock_ipfs_helpers.go`
- `internal/logger/logger.go`
- `internal/middleware/auth.go`
- `internal/middleware/logger.go`
- `tests/api/v1/sector_test.go`
- `tests/api/v1/auth_standalone_test.go`
- `frontend/cypress/e2e/app-flow.cy.js`
- `frontend/cypress/e2e/login-flow.cy.js`
- `frontend/cypress/e2e/registration.cy.js`
- `frontend/cypress/support/e2e.js`
- `frontend/cypress/fixtures/example.json`

---

### 🔹 Frontend – Kanakavalli

- Dynamic server list with search filtering
- Reusable Search, UserBadge, ServerBadge components
- ActiveServer chat view with message display and send
- MenuBar with channel selector dropdown and member list toggle
- Login and Registration pages connected to backend
- All frontend unit tests passing
- All Cypress component tests passing

**Files Implemented:**
- `frontend/src/App.jsx`
- `frontend/src/main.jsx`
- `frontend/src/index.css`
- `frontend/src/Login/Login.jsx`
- `frontend/src/Registration/Registration.jsx`
- `frontend/src/MainScreen/MainScreen.jsx`
- `frontend/src/MainScreen/ServerList/ServerList.jsx`
- `frontend/src/MainScreen/ServerList/ServerBadge/ServerBadge.jsx`
- `frontend/src/MainScreen/ServerAndMembers/ServerAndMembers.jsx`
- `frontend/src/MainScreen/ServerAndMembers/ActiveServer/ActiveServer.jsx`
- `frontend/src/MainScreen/ServerAndMembers/ActiveServer/MenuBar/MenuBar.jsx`
- `frontend/src/MainScreen/ServerAndMembers/Members/Members.jsx`
- `frontend/src/CommonComponents/Search/Search.jsx`
- `frontend/src/UserBadge/UserBadge.jsx`
- `frontend/src/test/ActiveServer.test.jsx`
- `frontend/src/test/App.test.jsx`
- `frontend/src/test/Login.test.jsx`
- `frontend/src/test/MainScreen.test.jsx`
- `frontend/src/test/MenuBar.test.jsx`
- `frontend/src/test/Registration.test.jsx`
- `frontend/src/test/Search.test.jsx`
- `frontend/src/test/ServerAndMembers.test.jsx`
- `frontend/src/test/ServerBadge.test.jsx`
- `frontend/src/test/ServerList.test.jsx`
- `frontend/src/test/UserBadge.test.jsx`
- `frontend/cypress/component/ActiveServer.cy.jsx`
- `frontend/cypress/component/Login.cy.jsx`
- `frontend/cypress/component/ServerList.cy.jsx`
- `frontend/cypress/support/commands.js`
- `frontend/cypress/support/component-index.html`
- `frontend/cypress/support/component.js`
- `frontend/cypress.config.js`

---

## 🧪 Frontend Unit Tests (Vitest)

Run from `frontend/` directory:
```
npm run test
```

### ActiveServer.test.jsx
- Renders a placeholder when no server is selected
- Renders the main chat interface when a server is selected
- Passes the correct props to MenuBar
- Displays messages correctly
- Forwards channel selection from MenuBar
- Allows sending messages when a server and channel are selected
- Does not send empty messages
- Handles message sending via Enter key
- Does not call onChannelSelect when no channel is selected

### App.test.jsx
- Renders without exceptions

### Login.test.jsx
- Renders login form with Username, Password, Sign In, and Register elements
- Prevents login when form fields are empty
- Calls onLogin with valid credentials
- Calls onRegisterClick when Register button is clicked

### MainScreen.test.jsx
- Renders without crashing
- Initializes with no selected server and channel
- Updates the selected server and channel when a server is selected
- Updates the selected channel when a channel is selected from the server list
- Updates the selected channel when a channel is selected from the dropdown menu
- Loads messages when a server and channel are selected
- Retains channel selection when changing between servers
- Handles state updates properly when changing channels

### MenuBar.test.jsx
- Renders without crashing
- Renders ServerBadge with correct props
- Renders search component with correct label
- Renders menu button with icon
- Calls setVisible with opposite value when menu button is clicked
- Displays the selected channel name in the channel button
- Displays "select channel" when no channel is selected
- Opens the channel menu when the channel button is clicked
- Selects a channel when a menu item is clicked
- Marks the current selected channel as selected in the menu
- Handles the case when selected server has no channels
- Handles the case when selectedServer is null

### Registration.test.jsx
- Renders registration form with all required fields and buttons
- Validates empty and invalid form inputs
- Submits registration form with valid input and sends correct API request
- Displays success message on successful registration
- Displays error message when registration fails
- Navigates to login page when Login button is clicked

### Search.test.jsx
- Renders without crashing
- Uses default id and label when none are provided
- Accepts and displays custom id and label props
- Calls provided return function on input change

### ServerAndMembers.test.jsx
- Renders without crashing
- Passes the correct props to ActiveServer
- Does not render Members by default (visible is false)
- Renders Members when visible state is true
- Forwards channel selection to parent component
- Handles null server and channel gracefully

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
- Renders user name
- Renders default user icon
- Renders provided user icon

---

## 🌲 Cypress Component Tests

Run from `frontend/` directory:
```
npx cypress run --component
```

**Final results: ✔ All specs passed — 14 tests, 13 passing, 1 pending**

| Spec | Tests | Passing | Pending |
|---|---|---|---|
| ActiveServer.cy.jsx | 3 | 3 | 0 |
| Login.cy.jsx | 5 | 5 | 0 |
| ServerList.cy.jsx | 6 | 5 | 1 |

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

### ServerList.cy.jsx — 5/5 passing, 1 pending ✅
- displays all servers initially
- filters servers based on search input
- selects a server and its first channel when clicked
- can add a new channel to a selected server
- debug selectors
- *(pending)* allows editing user profile — deferred to Sprint 3

---

## 🌐 Cypress E2E Tests

Start the frontend dev server first, then run from `frontend/`:
```
npm run dev             # Terminal 1
npx cypress run --e2e   # Terminal 2
```

**Final results: ✔ All specs passed — 15 tests, 13 passing, 2 pending**

| Spec | Tests | Passing | Pending |
|---|---|---|---|
| app-flow.cy.js | 6 | 6 | 0 |
| login-flow.cy.js | 4 | 4 | 0 |
| registration.cy.js | 5 | 3 | 2 |

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

### registration.cy.js — 3/3 passing, 2 pending ✅
- displays the registration form
- navigates back to login
- debug registration form fields and buttons
- *(pending)* validates form fields correctly — deferred to Sprint 3
- *(pending)* attempts registration with valid data — deferred to Sprint 3

---

## 🧪 Backend Unit Tests (Go)

Run from project root:
```
go test -p 1 -v ./...
```

**Final results: PASS — 42 tests, 0 failures — completed in 2.258s**

### Authentication Tests (auth_standalone_test.go)
- Authentication Flow
- JWT Token Persistence
- Invalid Authentication Attempts

### Root & Health (sector_test.go)
- Get Root
- Get Health

### Account Management
- Create Account
- Update Account By Id
- Delete Account By Id
- Get By Id
- Search Accounts / By Id
- Search Accounts / By creation time
- Search Accounts / By username

### Group Management
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

### Channel Management
- Create Channel
- Update Channel By Id
- Delete Channel By Id
- Get Channel By Id
- Search Channels / By Id
- Search Channels / By creation time
- Search Channels / By name
- Search Channels / By group

### Message Management
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

### Authentication Middleware
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

## 🎯 Sprint 2 Outcome

✔ Full backend API implemented and documented  
✔ 42 backend unit tests passing  
✔ 13 Cypress component tests passing (1 pending — deferred to Sprint 3)  
✔ 13 Cypress E2E tests passing (2 pending — deferred to Sprint 3)  
✔ Frontend unit tests written for all 11 components  
✔ Frontend and backend fully integrated over HTTP  
✔ Desktop app packaged via Wails framework
