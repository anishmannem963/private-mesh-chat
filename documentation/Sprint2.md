# Sprint 2 — Sector

## Video

https://www.youtube.com/watch?v=ji-p_NHyHpk

---

## General Notes

Sprint 2 focused on two parallel tracks: expanding and testing the frontend UI components, and completing the core backend API with comprehensive unit tests and documentation. The frontend and backend have been able to communicate since Sprint 1 via HTTP requests, and this sprint built on that foundation to deepen integration.

The backend ran into a significant blocker: mocking the underlying IPFS instance for unit testing is substantially more involved than anticipated, requiring a mock `libp2p` network and a test IPFS node rather than a simple in-memory stub. This slowed test coverage expansion and delayed some API route completions, particularly around cascaded deletes (e.g., deleting a group must also remove its channels and their messages). Future sprints will address authentication and encryption on top of the working API layer.

---

## Frontend

### Work Completed

**User Badge**
Designed and implemented a flexible `UserBadge` component used throughout the interface. The badge is now interactable, showing the user's name and icon with a placeholder action that will be replaced by a detailed profile dropdown in a later sprint.

**Search Component**
A standardized `Search` component was developed for reuse across the interface. It accepts a custom `id`, `label`, and `return` callback, making it straightforward to wire up to any list for real-time filtering.

**Dynamic Server List**
The server list was upgraded to consume an array of server objects (suitable for fetching from the backend). It integrates the `Search` component for real-time name filtering and emits `onServerSelect` and `onChannelSelect` callbacks when the user interacts with entries.

**Active Server Top Bar (MenuBar)**
Added a menu bar at the top of the active server view. It includes a `ServerBadge` displaying the active server's name and icon, a `Search` component for filtering messages, a channel selector dropdown, and a toggle button to show or hide the member list.

**Dynamic Member List**
Added toggle functionality to the member list panel. Clicking the menu button in the top bar shows or hides the member list, keeping the message area usable at any window width.

**CSS / Layout Fixes**
Resolved wrapping and overflow issues that caused components to render incorrectly at non-standard window aspect ratios. The layout now scales correctly across a wide range of desktop window sizes.

---

### Frontend Unit Tests

Unit tests are written using **Vitest** with **@testing-library/react** and are located in `frontend/src/test/`. Run all unit tests from the `frontend/` directory:

```
npm run test
```

#### UserBadge.test.jsx
| Test | Description |
|---|---|
| Renders without exceptions | Mounts `UserBadge` with no props and verifies no error is thrown |
| Renders user name | Passes `user="testName"` and confirms the name appears in the DOM |
| Renders default icon | Confirms the `img` element uses `userDefault.png` when no `img` prop is passed |
| Renders provided icon | Confirms the `img` element uses the passed `img` prop value |

#### ServerBadge.test.jsx
| Test | Description |
|---|---|
| Renders without exceptions | Mounts `ServerBadge` with no props and verifies no error is thrown |
| Renders server name | Passes a server object and confirms the name renders |
| Renders default icon | Confirms `serverDefault.png` is used when no icon is supplied |
| Renders provided icon | Confirms the server object's `icon` path is used when supplied |

#### Search.test.jsx
| Test | Description |
|---|---|
| Renders without crashing | Mounts `Search` and confirms the text field is present |
| Has default id and label | Confirms the field defaults to `id="Search"` and `label="Search"` |
| Accepts custom id and label | Passes custom `id` and `label` props and confirms they are applied |
| Calls return function on change | Fires a change event and confirms the `return` callback is invoked |

#### ServerList.test.jsx
| Test | Description |
|---|---|
| Renders without exceptions | Mounts `ServerList` with a server array and verifies no error is thrown |
| Renders all test servers | Confirms every server name in the test array appears in the rendered list |
| Search filters servers | Types a query into the search field and verifies only matching servers remain |
| Selecting a server calls callbacks | Clicks a server entry and verifies both `onServerSelect` and `onChannelSelect` are called with the correct arguments |
| Clicking a channel calls onChannelSelect | Expands a server and clicks a channel name; verifies `onChannelSelect` is called |
| Adding a new channel works | Selects a server, enters a channel name in the add-channel field, submits, and verifies the callback fires |
| Visual indication on selected channel | Verifies the selected channel entry receives an active style class |

---

### Cypress Component Tests

Cypress component tests are located in `frontend/cypress/component/`. Run them from the `frontend/` directory:

```
npx cypress open --component
```

or headlessly:

```
npx cypress run --component
```

#### Login.cy.jsx
| Test | Description |
|---|---|
| Renders the login form correctly | Verifies the heading, username input, password input, Sign In button, and Register button are all visible |
| Prevents login with empty fields | Clicks Sign In without filling any fields; confirms `onLogin` is not called |
| Allows login with valid credentials | Fills in username and password, clicks Sign In, confirms `onLogin` is called |
| Navigates to registration | Clicks the Register button and confirms `onRegisterClick` is called |

#### ServerList.cy.jsx
| Test | Description |
|---|---|
| Displays all servers initially | Confirms every server name in the test array is visible on mount |
| Filters servers based on search input | Types `test1` in the search box; confirms matching servers remain and non-matching ones disappear |
| Selects a server and its first channel | Clicks a server entry; confirms both `onServerSelect` and `onChannelSelect` stubs are called |
| Can add a new channel | Selects a server, clicks `+ Add Channel`, types a name, and confirms the `onServerSelect` stub is called with updated data |

#### ActiveServer.cy.jsx
| Test | Description |
|---|---|
| Displays placeholder when no server is selected | Mounts with `selectedServer={null}` and confirms the "Select a server" message is visible |
| Displays chat interface with server and channel | Mounts with a server and channel; confirms messages and the message input are visible |
| Allows sending messages | Types a message and clicks Send; confirms the input clears and the send action fires |

---

## Backend

### Work Completed

**Core API Routes**
All primary CRUD endpoints for `Account`, `Group`, `Channel`, and `Message` resources were implemented and are operational. This includes create, read, update, delete, and search operations for each resource.

**Data Consistency**
Implemented cascaded deletion logic — deleting a `Group` removes all of its `Channel` entries and their associated `Message` entries. Deleting a `Channel` removes its `Message` entries. This logic lives in `internal/api/v1/operations.go`.

**Search with Fuzzy Matching**
The search endpoints accept a filter body and perform fuzzy matching on string fields using the `lithammer/fuzzysearch` library, supporting partial and case-insensitive queries for names, usernames, and message content.

**Swagger UI**
API documentation is auto-generated and served at `http://localhost:3000/v1/swagger-ui/` while the server is running. A PDF export is included in the repository: [Swagger UI.pdf](Swagger%20UI.pdf).

---

### Backend Unit Tests

Unit tests use the standard **Go testing framework** and are located in `tests/api/v1/`. A mock IPFS node and in-memory OrbitDB instance are used so tests run without a live IPFS daemon. Run from the repository root:

```
go test -p 1 ./...
```

#### Account Management (`sector_test.go`)
| Test | Description |
|---|---|
| TestPutAccount | Creates an account via `PUT /v1/api/account/` and verifies a 201 response with the created account body |
| TestGetAccountByID | Retrieves a previously created account by UUID and verifies all fields match |
| TestUpdateAccountByID | Updates account fields (username, description) and verifies the response reflects the changes |
| TestDeleteAccountByID | Deletes an account and confirms a subsequent GET returns 404 |
| TestSearchAccounts | Searches by username and verifies only matching accounts are returned |

#### Group Management (`sector_test.go`)
| Test | Description |
|---|---|
| TestPutGroup | Creates a group and verifies the 201 response |
| TestGetGroupByID | Retrieves a group by UUID and confirms fields match |
| TestUpdateGroupByID | Updates group name and description; verifies the response |
| TestDeleteGroupByID | Deletes a group and confirms cascaded removal of its channels |
| TestSearchGroups | Searches groups by name; verifies only matching groups are returned |
| TestAddMemberToGroup | Adds a member account to an existing group; verifies the member appears in the group's member list |
| TestRemoveMemberFromGroup | Removes a member and verifies they no longer appear in the group |

#### Channel Management (`sector_test.go`)
| Test | Description |
|---|---|
| TestPutChannel | Creates a channel within a group; verifies 201 and correct group association |
| TestGetChannelByID | Retrieves a channel by UUID and verifies fields |
| TestUpdateChannelByID | Updates channel name; verifies the response |
| TestDeleteChannelByID | Deletes a channel and confirms its messages are also removed |
| TestSearchChannels | Searches channels by group ID and name; verifies results |

#### Message Management (`sector_test.go`)
| Test | Description |
|---|---|
| TestPutMessage | Creates a message in a channel; verifies 201 and correct channel/author association |
| TestGetMessageByID | Retrieves a message by UUID and verifies all fields |
| TestUpdateMessageByID | Updates message body content; verifies the change is persisted |
| TestDeleteMessageByID | Deletes a message; confirms a subsequent GET returns 404 |
| TestSearchMessages | Searches messages by channel ID, author, and content; verifies filter accuracy |

---

## Backend API Documentation

The API is served from `http://localhost:3000` during development (`wails dev`). All endpoints are prefixed with `/v1/api`. A live Swagger UI is available at `/v1/swagger-ui/` and a PDF export is included in this repository.

All endpoints except `/v1/api/`, `/v1/api/health`, `/v1/api/challenge`, and `/v1/api/login` require a `Bearer` JWT in the `Authorization` header.

---

### Authentication

#### `GET /v1/api/challenge`
Issues a one-time challenge string that the client must sign with their RSA private key to prove identity.

**Query parameters**
- `username` (string, required) — the username whose challenge should be generated

**Response `200 OK`**
```json
{ "challenge": "<base64-encoded random bytes>" }
```

**Error responses**
- `400 Bad Request` — username not provided
- `404 Not Found` — no account with that username exists

---

#### `POST /v1/api/login`
Authenticates a user by verifying their signed challenge and returns a JWT token.

**Request body**
```json
{
  "username": "alice",
  "signature": "<base64-encoded RSA-SHA256 signature of the challenge>"
}
```

**Response `200 OK`**
```json
{ "token": "<JWT>" }
```

**Error responses**
- `400 Bad Request` — malformed body or no active challenge for the user
- `401 Unauthorized` — signature verification failed
- `404 Not Found` — user not found

---

### Account

#### `POST /v1/api/account/`
Creates a new user account.

**Request body**
```json
{
  "username": "alice",
  "pubkey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
  "icon": "<base64-encoded image or empty string>",
  "description": "Hey there!"
}
```

**Response `201 Created`** — the created account object including its generated `id` and `created_at`.

---

#### `GET /v1/api/account/{id}`
Retrieves an account by UUID.

**Path parameters**
- `id` (UUID, required)

**Response `200 OK`** — the account object.

**Error responses**
- `404 Not Found` — no account with that ID

---

#### `PUT /v1/api/account/{id}`
Replaces an account's fields. All writable fields must be supplied.

**Path parameters**
- `id` (UUID, required)

**Request body** — same shape as the creation body.

**Response `200 OK`** — the updated account object.

---

#### `DELETE /v1/api/account/{id}`
Deletes an account.

**Path parameters**
- `id` (UUID, required)

**Response `204 No Content`**

---

#### `POST /v1/api/account/search`
Searches for accounts using a filter.

**Request body**
```json
{
  "username": "ali",
  "created_after": "2024-01-01T00:00:00Z",
  "created_before": "2025-01-01T00:00:00Z"
}
```
All fields are optional; omitted fields are not filtered on. String fields use fuzzy matching.

**Response `200 OK`** — array of matching account objects.

---

### Group

#### `POST /v1/api/group/`
Creates a new group (server).

**Request body**
```json
{
  "name": "My Server",
  "description": "A place for us",
  "icon": "<base64-encoded image or empty string>",
  "members": []
}
```

**Response `201 Created`** — the created group object.

---

#### `GET /v1/api/group/{groupId}`
Retrieves a group by UUID.

**Response `200 OK`** — the group object including its `members` array.

---

#### `PUT /v1/api/group/{groupId}`
Replaces a group's fields.

**Response `200 OK`** — the updated group object.

---

#### `DELETE /v1/api/group/{groupId}`
Deletes a group and cascades deletion to all its channels and messages.

**Response `204 No Content`**

---

#### `POST /v1/api/group/search`
Searches for groups.

**Request body**
```json
{
  "name": "server",
  "member_id": "<UUID of a member>"
}
```

**Response `200 OK`** — array of matching group objects.

---

#### `POST /v1/api/group/{groupId}/members/{memberId}`
Adds an existing account as a member of a group.

**Response `200 OK`** — the updated group object.

**Error responses**
- `404 Not Found` — group or account not found

---

#### `DELETE /v1/api/group/{groupId}/members/{memberId}`
Removes a member from a group.

**Response `204 No Content`**

---

### Channel

#### `POST /v1/api/group/{groupId}/channel/`
Creates a new channel within a group.

**Request body**
```json
{
  "name": "general",
  "description": "General discussion"
}
```

**Response `201 Created`** — the created channel object, including `group` (UUID of parent group).

**Error responses**
- `404 Not Found` — parent group not found

---

#### `GET /v1/api/group/{groupId}/channel/{channelId}`
Retrieves a channel.

**Response `200 OK`** — the channel object.

---

#### `PUT /v1/api/group/{groupId}/channel/{channelId}`
Replaces a channel's fields.

**Response `200 OK`** — the updated channel object.

---

#### `DELETE /v1/api/group/{groupId}/channel/{channelId}`
Deletes a channel and all messages within it.

**Response `204 No Content`**

---

#### `POST /v1/api/channel/search`
Searches for channels across all groups.

**Request body**
```json
{
  "name": "general",
  "group_id": "<UUID>"
}
```

**Response `200 OK`** — array of matching channel objects.

---

### Message

#### `POST /v1/api/group/{groupId}/channel/{channelId}/message`
Creates a new message in a channel.

**Request body**
```json
{
  "body": "Hello, world!",
  "author": "<UUID of account>",
  "pinned": false
}
```

**Response `201 Created`** — the created message object.

**Error responses**
- `404 Not Found` — channel or author account not found

---

#### `GET /v1/api/group/{groupId}/channel/{channelId}/message/{messageId}`
Retrieves a message.

**Response `200 OK`** — the message object.

---

#### `PUT /v1/api/group/{groupId}/channel/{channelId}/message/{messageId}`
Replaces a message's fields (e.g., to support editing or pinning).

**Response `200 OK`** — the updated message object.

---

#### `DELETE /v1/api/group/{groupId}/channel/{channelId}/message/{messageId}`
Deletes a message.

**Response `204 No Content`**

---

#### `POST /v1/api/message/search`
Searches for messages across all channels.

**Request body**
```json
{
  "body": "hello",
  "author_id": "<UUID>",
  "channel_id": "<UUID>",
  "pinned": true,
  "created_after": "2024-01-01T00:00:00Z"
}
```

All fields are optional. String fields use fuzzy matching.

**Response `200 OK`** — array of matching message objects.

---

### Miscellaneous

#### `GET /v1/api/`
Root endpoint. Returns a plain-text welcome message. No authentication required.

#### `GET /v1/api/health`
Health check. Returns `200 OK` if the server is running. No authentication required.
