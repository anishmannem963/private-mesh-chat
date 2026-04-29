# Sector — Private Mesh Chat

A decentralized, peer-to-peer desktop messaging platform that puts you in control of your own data.

---

## What Is Sector?

Sector is a desktop chat application that works without centralized servers. Conversations, groups, and messages are stored locally on each user's own device using an IPFS-backed distributed database (OrbitDB). Users authenticate with RSA public-key cryptography — no passwords are ever sent across the network — and communicate within organized groups and channels, much like a self-hosted Discord.

---

## Team

| Name                          | Role                                                    |
| ----------------------------- | ------------------------------------------------------- |
| **Anish Mannem**              | Backend Engineer — API, auth, database, peer networking |
| **Kanakavalli Muraharisetty** | Frontend Engineer — UI components, testing, UX          |

---

## Requirements

### Backend (Go)

| Requirement   | Version              |
| ------------- | -------------------- |
| Go            | 1.21 or later        |
| Wails         | v2                   |
| IPFS / libp2p | bundled via `go.mod` |

Install Wails CLI (one-time):

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

Verify your environment:

```bash
wails doctor
```

### Frontend (Node / React)

| Requirement | Version     |
| ----------- | ----------- |
| Node.js     | 18 or later |
| npm         | 9 or later  |

---

## Environment Setup

Copy the sample env file and fill in your values:

```bash
cp sample.env .env
```

Key variables in `.env`:

| Variable     | Description                               |
| ------------ | ----------------------------------------- |
| `JWT_SECRET` | Secret key used to sign JWT tokens        |
| `DB_CACHE`   | Path to the local OrbitDB cache directory |
| `LOG_FILE`   | Path to the log output file               |

---

## Running the Application

### Development mode (hot-reload)

```bash
wails dev
```

This starts the Go backend on `http://localhost:3000` and serves the React frontend with Vite's HMR. The Swagger UI is available at `http://localhost:3000/v1/swagger-ui/`.

### Production build

```bash
wails build
```

The compiled desktop binary is placed in `build/bin/`. On macOS it produces `Sector.app`; on Windows, `Sector.exe`.

---

## Running Tests

### Backend unit tests

Run from the project root:

```bash
go test -p 1 -v ./...
```

Expected output: **42 tests, 0 failures**.

### Frontend unit tests (Vitest)

```bash
cd frontend
npm install        # first time only
npm run test
```

### Cypress component tests

```bash
cd frontend
npx cypress run --component
```

### Cypress E2E tests

You need the dev server running in a separate terminal first:

```bash
# Terminal 1
cd frontend
npm run dev

# Terminal 2
cd frontend
npx cypress run --e2e
```

---

## API Overview

The backend exposes a RESTful JSON API at `http://localhost:3000/v1/api`. All routes except the four listed below require a `Bearer` JWT token in the `Authorization` header.

**Public routes (no auth required):**

- `GET  /v1/api/` — health / welcome
- `GET  /v1/api/health` — liveness check
- `GET  /v1/api/challenge` — request a login challenge
- `POST /v1/api/login` — authenticate and receive a JWT

**Protected resource routes:**

| Resource | Endpoints                                                                                                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account  | `POST /account/` · `GET /account/{id}` · `PUT /account/{id}` · `DELETE /account/{id}` · `POST /account/search`                                                                         |
| Group    | `POST /group/` · `GET /group/{id}` · `PUT /group/{id}` · `DELETE /group/{id}` · `POST /group/search` · `POST /group/{id}/members/{memberId}` · `DELETE /group/{id}/members/{memberId}` |
| Channel  | `POST /group/{id}/channel/` · `GET /group/{id}/channel/{channelId}` · `PUT /group/{id}/channel/{channelId}` · `DELETE /group/{id}/channel/{channelId}` · `POST /channel/search`        |
| Message  | `POST /group/{id}/channel/{channelId}/message` · `GET .../message/{messageId}` · `PUT .../message/{messageId}` · `DELETE .../message/{messageId}` · `POST /message/search`             |

Full interactive documentation is served at `http://localhost:3000/v1/swagger-ui/` while the app is running.

---

## Authentication Flow

1. **Register** — `POST /v1/api/account/` with your username and RSA-2048 public key (PEM format).
2. **Request a challenge** — `GET /v1/api/challenge?username=<your-username>`. The server returns a base64-encoded random nonce.
3. **Sign the challenge** — Sign the decoded nonce bytes with your RSA private key using SHA-256.
4. **Login** — `POST /v1/api/login` with your username and the base64-encoded signature. The server returns a signed JWT.
5. **Use the token** — Include `Authorization: Bearer <token>` in all subsequent requests.

---

## Project Structure

```
.
├── main.go                        # Wails entry point
├── app.go                         # Wails app bindings
├── internal/
│   ├── api/
│   │   ├── api.go                 # Router setup
│   │   └── v1/
│   │       ├── sector.go          # HTTP handler implementations
│   │       ├── sector.gen.go      # OpenAPI-generated types & interfaces
│   │       ├── operations.go      # Database operation helpers
│   │       └── auth.go            # Challenge/login handlers
│   ├── auth/
│   │   ├── jwt.go                 # JWT signing & validation
│   │   └── challenge_store.go     # In-memory challenge store
│   ├── database/
│   │   ├── database.go            # OrbitDB/IPFS setup
│   │   ├── ipfs_helpers.go        # Live IPFS node helpers
│   │   └── mock_ipfs_helpers.go   # In-memory mock for tests
│   ├── middleware/
│   │   ├── auth.go                # JWT bearer middleware
│   │   └── logger.go              # Request logging middleware
│   ├── config/config.go           # .env loader
│   └── logger/logger.go           # Zap logger setup
├── models/v1/
│   ├── schema.yaml                # OpenAPI schema (source of truth)
│   └── config.yaml                # Code-gen config
├── tests/api/v1/
│   ├── sector_test.go             # Full API integration tests
│   └── auth_standalone_test.go    # Standalone auth unit tests
└── frontend/
    ├── src/
    │   ├── App.jsx                # Root component, routing
    │   ├── Login/Login.jsx
    │   ├── Registration/Registration.jsx
    │   ├── MainScreen/
    │   │   ├── MainScreen.jsx
    │   │   ├── ServerList/
    │   │   │   ├── ServerList.jsx         # Server list + CustomUserBadge + ProfileEditModal
    │   │   │   └── ServerBadge/
    │   │   └── ServerAndMembers/
    │   │       ├── ActiveServer/          # Chat view + MenuBar
    │   │       └── Members/               # Member sidebar
    │   ├── CommonComponents/Search/
    │   ├── UserBadge/
    │   └── test/                          # Vitest unit tests
    └── cypress/
        ├── component/                     # Cypress component tests
        └── e2e/                           # Cypress E2E tests
```

---

## Known Limitations

- Messages are not yet persisted to the distributed database; sending a message logs it locally only. Full backend wiring is the next step.
- The member list is currently populated with placeholder data until it is wired to the live group members from the backend.
- File/image uploads in the profile editor are processed client-side only and are not synced to the backend yet.
- The application has been tested on macOS. Windows and Linux builds are supported by Wails but have not been fully verified.
