# Product Requirements Document

## Project

Event Planner API

## Purpose

Build a RESTful API for managing events with Express, MongoDB, Mongoose, and TypeScript. The implementation must follow MVC structure, use environment-based configuration, support full CRUD for events, provide category and date filtering, and return consistent HTTP errors.

## Primary Goal

Deliver a working backend project that satisfies the capstone README requirements and is ready for manual validation in Postman.

## Success Criteria

- All 5 CRUD endpoints are implemented and working.
- Filtering by category and date works correctly.
- Database connectivity is managed through reusable `connectDB()` and `closeDB()` functions.
- TypeScript types are used across models, controllers, routes, and config.
- Validation and error paths return appropriate `200`, `201`, `400`, `404`, and `500` responses.
- `.env.example` is present and `.env` is ignored.
- README setup and testing instructions are accurate for the finished implementation.

## Functional Requirements

### Event fields

- `title`: required string, trimmed, non-empty
- `description`: optional string, trimmed
- `date`: required date
- `location`: optional string, trimmed
- `category`: enum of `Meeting`, `Conference`, `Personal`, `Workshop`, `Other`
- `attendees`: array of strings
- `createdAt`: timestamp
- `updatedAt`: timestamp

### API endpoints

- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

### Filters

- `category`
- `date` for events on or after the given date

## Non-Functional Requirements

- Use Express and Mongoose.
- Use `dotenv` for config.
- Use TypeScript for source code.
- Keep the project organized under `src/config`, `src/models`, `src/controllers`, `src/routes`, and `src/app.ts`.
- Provide clear error messages and predictable JSON responses.

## Assumptions And Clarifications

- Invalid MongoDB ObjectIds should return `400`, not `404`.
- Missing resources should return `404`.
- Validation failures from request data or Mongoose should return `400`.
- Unhandled server errors should return `500`.
- The project will be manually tested with Postman rather than an automated test suite unless the implementation adds one as an enhancement.
- On Windows, `.env` creation instructions should use a Windows-friendly approach instead of relying only on `cp`.

## Implementation Plan

### Task 1. Initialize project scaffold

Objective: create the Node.js and TypeScript project structure required by the capstone.

Subtasks:
- Create `src/config`, `src/models`, `src/controllers`, and `src/routes`.
- Initialize `package.json` if missing.
- Add TypeScript config with appropriate `rootDir`, `outDir`, module settings, and strictness.
- Add scripts for `dev`, `build`, and `start`.

Acceptance criteria:
- Folder structure matches the README target structure.
- TypeScript compiles to `dist`.
- `npm run dev`, `npm run build`, and `npm run start` are defined.

### Task 2. Install runtime and development dependencies

Objective: add the packages needed to run and build the API.

Subtasks:
- Install runtime packages: `express`, `mongoose`, `dotenv`.
- Install development packages: `typescript`, `tsx`, `@types/express`, `@types/node`.
- Verify versions are compatible.

Acceptance criteria:
- `package.json` lists required dependencies.
- The project can build without missing package errors.

### Task 3. Set up environment configuration

Objective: externalize runtime configuration and protect secrets.

Subtasks:
- Create `.env.example` with `MONGO_URL`, `MONGO_DB`, and `PORT`.
- Ensure `.env` is included in `.gitignore`.
- Load environment variables early in app startup.
- Validate required environment variables before connecting to MongoDB.

Acceptance criteria:
- `.env.example` exists with placeholder values.
- `.env` is ignored by git.
- App startup fails clearly if required variables are missing.

### Task 4. Implement database connection module

Objective: create a reusable Mongoose connection layer in `src/config/db.ts`.

Subtasks:
- Export `connectDB()`.
- Export `closeDB()`.
- Build the MongoDB connection string using env variables.
- Add connection success and failure handling.
- Ensure disconnect logic can be reused during shutdown or testing.

Acceptance criteria:
- `connectDB()` connects via Mongoose using environment configuration.
- `closeDB()` closes the connection safely.
- Failures surface meaningful logs or error messages.

### Task 5. Build the Event model and types

Objective: define the Mongoose schema, model, and TypeScript types for events.

Subtasks:
- Create `src/models/Event.ts`.
- Define a TypeScript interface for event input and persisted event documents.
- Implement schema constraints for required, trimmed, enum, and array fields.
- Add timestamps or explicit `createdAt` and `updatedAt` handling.
- Add a pre-save hook if timestamps are not fully managed by schema options.
- Export the model and related types.

Acceptance criteria:
- Title is required and trimmed.
- Date is required and stored as a valid date.
- Category only accepts allowed enum values.
- `createdAt` and `updatedAt` are persisted and updated correctly.

### Task 6. Implement controller logic for CRUD and filtering

Objective: centralize API business logic in `src/controllers/eventController.ts`.

Subtasks:
- Add controller for listing events with optional filters.
- Add controller for retrieving an event by ID.
- Add controller for creating an event.
- Add controller for updating an event.
- Add controller for deleting an event.
- Validate and parse query parameters for `category` and `date`.
- Validate `:id` as a MongoDB ObjectId before querying.

Acceptance criteria:
- `GET /api/events` returns all events when no filters are provided.
- `GET /api/events?category=Workshop` filters correctly.
- `GET /api/events?date=2026-03-01` returns events on or after the date.
- Single-item CRUD operations return correct status codes and JSON bodies.

### Task 7. Define route layer and mount API paths

Objective: expose the controller actions through Express routes.

Subtasks:
- Create `src/routes/eventRoutes.ts`.
- Map HTTP verbs and paths to controller handlers.
- Mount routes under `/api/events` from the main app.
- Keep route files thin and controller-driven.

Acceptance criteria:
- All required routes exist and are wired correctly.
- Route definitions are separated from business logic.

### Task 8. Build the Express app entry point

Objective: assemble the server in `src/app.ts`.

Subtasks:
- Configure Express JSON middleware.
- Load `dotenv`.
- Connect to the database before accepting requests.
- Mount event routes.
- Add a basic health or root route if useful for quick verification.
- Start the server using `PORT`.
- Add graceful shutdown logic that calls `closeDB()`.

Acceptance criteria:
- Server starts successfully with valid environment variables.
- Requests reach `/api/events` endpoints.
- Database disconnects cleanly on shutdown.

### Task 9. Implement consistent error handling

Objective: make failure cases explicit and aligned with the README requirements.

Subtasks:
- Handle invalid ObjectIds with `400`.
- Handle missing records with `404`.
- Handle Mongoose validation errors with `400`.
- Handle malformed dates or unsupported categories with `400`.
- Return `500` for unexpected server errors.
- Standardize JSON error response shape.

Acceptance criteria:
- Error responses are meaningful and consistent.
- Required status codes are used in the correct scenarios.
- No route leaks raw stack traces in normal responses.

### Task 10. Verify, document, and prepare submission artifacts

Objective: align the finished implementation with the submission checklist.

Subtasks:
- Test all endpoints manually in Postman.
- Verify create, read, update, delete, and filter scenarios.
- Test edge cases for missing fields, invalid IDs, invalid category, and invalid dates.
- Update `README.md` with final setup steps, Windows-friendly env instructions, and testing steps.
- Ensure project files are clean and organized.

Acceptance criteria:
- Postman tests pass for happy paths and edge cases.
- README matches the actual implementation.
- Submission checklist items can all be marked complete.

## Endpoint-Level Acceptance Matrix

| Endpoint | Success | Failure Cases |
|---|---|---|
| `GET /api/events` | `200` with array | `400` for invalid filter values, `500` unexpected error |
| `GET /api/events/:id` | `200` with event | `400` invalid ObjectId, `404` not found, `500` unexpected error |
| `POST /api/events` | `201` with created event | `400` validation error, `500` unexpected error |
| `PUT /api/events/:id` | `200` with updated event | `400` invalid ObjectId or bad payload, `404` not found, `500` unexpected error |
| `DELETE /api/events/:id` | `200` with success message | `400` invalid ObjectId, `404` not found, `500` unexpected error |

## Deliverables

- `src/config/db.ts`
- `src/models/Event.ts`
- `src/models/index.ts`
- `src/controllers/eventController.ts`
- `src/routes/eventRoutes.ts`
- `src/app.ts`
- `.env.example`
- `.gitignore`
- `package.json`
- `tsconfig.json`
- updated `README.md`

## Definition Of Done

- The API runs locally against MongoDB.
- All required endpoints behave as specified.
- Codebase follows MVC structure.
- Types are present and exported where needed.
- Error handling is explicit and tested.
- Environment variables are documented and safely managed.
- The README and Postman validation steps reflect the final implementation.