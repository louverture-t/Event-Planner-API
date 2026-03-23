# Event Planner API

A RESTful API for managing events built with Express, MongoDB, Mongoose, and TypeScript. Supports full CRUD operations, category and date filtering, and consistent JSON error responses.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB with Mongoose |
| Language | TypeScript (strict mode) |
| Config | dotenv |
| Dev server | tsx |
| Test runner | Vitest |
| API testing | Supertest |
| Test database | mongodb-memory-server |

---

## Project Structure

```
src/
  app.ts              # Express app factory (routes, middleware)
  server.ts           # Entry point (DB connect, listen, graceful shutdown)
  config/
    db.ts             # connectDB() / closeDB()
    env.ts            # Environment validation and accessor
  contracts/
    errors.ts         # Custom error classes
    http.ts           # Response shape helpers
    validation.ts     # Query filter parsing and ObjectId validation
    index.ts          # Barrel export
  controllers/
    eventController.ts
    index.ts
  models/
    Event.ts          # Mongoose schema, types, and model
    index.ts
  routes/
    eventRoutes.ts
  __tests__/
    events.test.ts
    setup.ts
```

---

## Local Setup (Windows)

### Prerequisites

- Node.js 20 or later
- npm 10 or later
- MongoDB (local) **or** a MongoDB Atlas cluster

### 1. Clone the repository

```powershell
git clone <repository-url>
cd Event-Planner-API
```

### 2. Install dependencies

```powershell
npm install
```

### 3. Create the environment file

Copy the example file and fill in your values. Do **not** paste real credentials into `.env.example` or commit `.env`.

**Option A — PowerShell (Windows)**

```powershell
Copy-Item .env.example .env
```

**Option B — Command Prompt**

```cmd
copy .env.example .env
```

Then open `.env` in your editor and update the values (see [Environment Variables](#environment-variables) below).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Port the HTTP server will listen on |
| `MONGO_URL` | Yes | MongoDB connection URI (no database name) |
| `MONGO_DB` | Yes | Name of the MongoDB database |

The app will **throw and exit** at startup if any required variable is missing or blank.

### Local MongoDB example

```env
PORT=3000
MONGO_URL=mongodb://127.0.0.1:27017
MONGO_DB=event_planner
```

### MongoDB Atlas example

Replace all placeholder values with your own. Do **not** commit this file.

```env
PORT=3000
MONGO_URL=mongodb+srv://<username>:<password>@<cluster-host>/?retryWrites=true&w=majority
MONGO_DB=event_planner
```

> **Security note**: `.env` is listed in `.gitignore`. Never commit real credentials, connection strings, or API keys.

---

## Local MongoDB Setup (Windows)

1. Download **MongoDB Community Server** from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
2. Run the installer and choose **Complete** setup.
3. Start the `MongoDB` Windows service (it starts automatically after installation, or run `net start MongoDB` in an elevated PowerShell).
4. Verify the server is running:

   ```powershell
   mongosh --eval "db.adminCommand('ping')"
   ```

5. Use the connection string `mongodb://127.0.0.1:27017` in your `.env`.

---

## MongoDB Atlas Setup

1. Create a free account at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a new **Shared (M0 Free Tier)** cluster.
3. Under **Database Access**, add a database user with a strong password.
4. Under **Network Access**, add your IP address (or `0.0.0.0/0` for development only).
5. Click **Connect → Drivers** and copy the connection string.
6. Replace `<username>` and `<password>` in the string, then paste it as `MONGO_URL` in your `.env`.
7. Set `MONGO_DB` to the database name you want to use (e.g. `event_planner`).

---

## Build, Run, and Test Commands

```powershell
# Development server with hot reload
npm run dev

# Compile TypeScript to dist/
npm run build

# Run compiled output
npm run start

# Run automated test suite
npm test
```

The automated tests use `mongodb-memory-server` and require no running MongoDB instance.

---

## API Reference

**Base URL**: `http://localhost:<PORT>`

All responses follow a consistent JSON envelope:

**Success**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

**Error codes**: `INVALID_OBJECT_ID` · `VALIDATION_ERROR` · `NOT_FOUND` · `INTERNAL_SERVER_ERROR`

---

### Health Check

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Returns `{ status: "ok" }` |

---

### Events

#### List Events

```
GET /api/events
```

**Query parameters** (all optional)

| Parameter | Type | Description |
|---|---|---|
| `category` | string | Filter by category enum value |
| `date` | string (ISO 8601) | Return events on or after this date |

**Example requests**

```
GET /api/events
GET /api/events?category=Workshop
GET /api/events?date=2026-03-01
GET /api/events?category=Conference&date=2026-01-01
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Team Kickoff",
      "date": "2026-04-15T09:00:00.000Z",
      "category": "Meeting",
      "attendees": ["Alice", "Bob"],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

#### Get Event by ID

```
GET /api/events/:id
```

**Response** `200 OK` — event object  
**Errors** `400` invalid ObjectId · `404` not found

---

#### Create Event

```
POST /api/events
Content-Type: application/json
```

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | Yes | Trimmed, non-empty |
| `date` | string / Date | Yes | ISO 8601 recommended |
| `category` | string | Yes | `Meeting` `Conference` `Personal` `Workshop` `Other` |
| `description` | string | No | Trimmed |
| `location` | string | No | Trimmed |
| `attendees` | string[] | No | Defaults to `[]` |

**Example request body**

```json
{
  "title": "Q2 Planning Workshop",
  "date": "2026-06-10T14:00:00.000Z",
  "category": "Workshop",
  "description": "Quarterly planning session",
  "location": "Conference Room B",
  "attendees": ["Alice", "Bob", "Carol"]
}
```

**Response** `201 Created`

```json
{
  "success": true,
  "data": { "_id": "...", "title": "Q2 Planning Workshop", "..." : "..." },
  "message": "Event created successfully."
}
```

**Errors** `400` validation failure

---

#### Update Event

```
PUT /api/events/:id
Content-Type: application/json
```

Send only the fields you want to change. All fields are optional for partial updates.

**Response** `200 OK` — updated event  
**Errors** `400` invalid ObjectId or validation failure · `404` not found

---

#### Delete Event

```
DELETE /api/events/:id
```

**Response** `200 OK` — deleted event document  
**Errors** `400` invalid ObjectId · `404` not found

---

## Manual Validation Checklist (Postman)

Use Postman or any HTTP client to walk through each scenario below after starting the server with `npm run dev`.

### Setup

1. Set a Postman environment variable `baseUrl` to `http://localhost:3000`.
2. Import the requests below or create them manually.
3. After each create, copy the returned `_id` to use in subsequent requests.

---

### CRUD Happy Paths

| # | Step | Method | URL | Body | Expected Status |
|---|---|---|---|---|---|
| 1 | Create event | `POST` | `{{baseUrl}}/api/events` | valid payload (see body below) | `201` |
| 2 | List all events | `GET` | `{{baseUrl}}/api/events` | — | `200`, array with at least 1 item |
| 3 | Get by ID | `GET` | `{{baseUrl}}/api/events/{{id}}` | — | `200`, matching event |
| 4 | Update event | `PUT` | `{{baseUrl}}/api/events/{{id}}` | `{ "title": "Updated Title" }` | `200`, updated title |
| 5 | Delete event | `DELETE` | `{{baseUrl}}/api/events/{{id}}` | — | `200`, deleted event |
| 6 | Confirm deleted | `GET` | `{{baseUrl}}/api/events/{{id}}` | — | `404` |

**Reusable create body**
```json
{
  "title": "Q2 Planning Workshop",
  "date": "2026-06-10T14:00:00.000Z",
  "category": "Workshop",
  "description": "Quarterly planning session",
  "location": "Conference Room B",
  "attendees": ["Alice", "Bob"]
}
```

---

### Filter Paths

| # | Step | Method | URL | Expected |
|---|---|---|---|---|
| 7 | Filter by category | `GET` | `{{baseUrl}}/api/events?category=Workshop` | `200`, only Workshop events |
| 8 | Filter by date | `GET` | `{{baseUrl}}/api/events?date=2026-06-01` | `200`, events on/after 2026-06-01 |
| 9 | Combined filter | `GET` | `{{baseUrl}}/api/events?category=Workshop&date=2026-06-01` | `200`, filtered intersection |
| 10 | No results | `GET` | `{{baseUrl}}/api/events?date=2099-01-01` | `200`, empty array |

---

### Error Paths

| # | Test | Method | URL | Body | Expected Status | Expected `error.code` |
|---|---|---|---|---|---|---|
| 11 | Invalid ObjectId (get) | `GET` | `{{baseUrl}}/api/events/not-an-id` | — | `400` | `INVALID_OBJECT_ID` |
| 12 | Invalid ObjectId (update) | `PUT` | `{{baseUrl}}/api/events/not-an-id` | `{}` | `400` | `INVALID_OBJECT_ID` |
| 13 | Invalid ObjectId (delete) | `DELETE` | `{{baseUrl}}/api/events/not-an-id` | — | `400` | `INVALID_OBJECT_ID` |
| 14 | Not found (get) | `GET` | `{{baseUrl}}/api/events/000000000000000000000000` | — | `404` | `NOT_FOUND` |
| 15 | Not found (update) | `PUT` | `{{baseUrl}}/api/events/000000000000000000000000` | `{ "title": "X" }` | `404` | `NOT_FOUND` |
| 16 | Not found (delete) | `DELETE` | `{{baseUrl}}/api/events/000000000000000000000000` | — | `404` | `NOT_FOUND` |
| 17 | Missing title | `POST` | `{{baseUrl}}/api/events` | `{ "date": "2026-06-01", "category": "Meeting" }` | `400` | `VALIDATION_ERROR` |
| 18 | Missing date | `POST` | `{{baseUrl}}/api/events` | `{ "title": "X", "category": "Meeting" }` | `400` | `VALIDATION_ERROR` |
| 19 | Invalid category | `POST` | `{{baseUrl}}/api/events` | `{ "title": "X", "date": "2026-06-01", "category": "BadValue" }` | `400` | `VALIDATION_ERROR` |
| 20 | Invalid category filter | `GET` | `{{baseUrl}}/api/events?category=BadValue` | — | `400` | `VALIDATION_ERROR` |
| 21 | Invalid date filter | `GET` | `{{baseUrl}}/api/events?date=not-a-date` | — | `400` | `VALIDATION_ERROR` |

---

## Edge-Case Validation Checklist

- [ ] `title` with only whitespace is rejected (`400` `VALIDATION_ERROR`)
- [ ] `attendees` field omitted — event is created with `attendees: []`
- [ ] `attendees` as a non-array value — rejected (`400`)
- [ ] `date` as a plain string `"2026-06-10"` (no time) — accepted and stored
- [ ] `description` and `location` omitted — event is created without those fields
- [ ] `category` with different casing (e.g. `"workshop"`) — rejected (`400` `VALIDATION_ERROR`)
- [ ] `PUT` with an empty body `{}` — returns `200` with unchanged event
- [ ] `PUT` with an unknown field — field is ignored, event is unchanged beyond known fields
- [ ] `GET /api/events` with no data in DB — returns `200` with empty array `[]`
- [ ] Multiple events created with same category — filter returns all of them
- [ ] `date` filter with future date — returns only events on or after that date
- [ ] Response envelope always has `success: true` on success and `success: false` on error

---

## Automated Tests

Run the full suite:

```powershell
npm test
```

Tests use `mongodb-memory-server` for an isolated in-memory database. No real MongoDB connection or `.env` file is required to run tests.

Coverage areas:
- `POST /api/events` — happy path, missing title, missing date, invalid category
- `GET /api/events` — list all, category filter, date filter
- `GET /api/events/:id` — happy path, invalid ObjectId, not found
- `PUT /api/events/:id` — happy path, invalid ObjectId, not found, validation failure
- `DELETE /api/events/:id` — happy path, invalid ObjectId, not found

---

## PRD Deliverables Checklist

- [x] All 5 CRUD endpoints implemented (`GET`, `POST`, `GET/:id`, `PUT/:id`, `DELETE/:id`)
- [x] Category filtering via `?category=`
- [x] Date filtering via `?date=` (events on or after)
- [x] `connectDB()` and `closeDB()` implemented and integrated
- [x] `200`, `201`, `400`, `404`, `500` status codes used correctly
- [x] `.env.example` present with placeholder values only
- [x] `.env` listed in `.gitignore`
- [x] No real credentials or connection strings in tracked files
- [x] TypeScript used across models, controllers, routes, and config
- [x] MVC folder structure: `config/`, `models/`, `controllers/`, `routes/`
- [x] Automated test suite (Vitest + Supertest + mongodb-memory-server)
- [x] README setup and testing instructions accurate for finished implementation
