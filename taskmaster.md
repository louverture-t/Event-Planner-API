## Taskmaster: Event Planner API

**Project Goal**

Build a greenfield REST API using Express, MongoDB with Mongoose, and TypeScript that satisfies the requirements in `PRD.md`, supports full CRUD for events, category and date filtering, consistent error handling, safe environment management, and both automated plus manual verification.

**Tech Stack**
- Express
- MongoDB with Mongoose
- TypeScript
- dotenv
- tsx
- Supertest
- Vitest or Jest

**Execution Strategy**
- Keep foundational setup sequential through the point where contracts are stable.
- Split database, model, and environment work in parallel only after project and tooling setup is complete.
- Keep controller and routing integration gated by shared validation and response contracts.
- Treat `.env` hygiene and secret protection as delivery requirements, not optional cleanup.

### [ ] Task 1: Initialize Project Scaffold
Depends on: None  
Parallel with: None

Subtasks
- [ ] Initialize `package.json`
- [ ] Create `src/config`, `src/models`, `src/controllers`, `src/routes`
- [ ] Create `src/app.ts`
- [ ] Create `tsconfig.json`
- [ ] Add npm scripts for `dev`, `build`, `start`, and `test`
- [ ] Configure `dist` as build output
- [ ] Ensure strict TypeScript defaults are enabled

Acceptance Criteria
- [ ] Project structure matches the PRD target layout
- [ ] TypeScript source compiles into `dist`
- [ ] `npm run dev` is defined
- [ ] `npm run build` is defined
- [ ] `npm run start` is defined
- [ ] `npm run test` is defined

### [ ] Task 2: Install and Baseline the Tech Stack
Depends on: Task 1  
Parallel with: None

Subtasks
- [ ] Install runtime dependencies: `express`, `mongoose`, `dotenv`
- [ ] Install development dependencies: `typescript`, `tsx`, `@types/node`, `@types/express`
- [ ] Install HTTP/API test dependency: `supertest`
- [ ] Install one test runner: `vitest` or `jest`
- [ ] Confirm version compatibility across runtime and test tooling
- [ ] Verify scripts align with installed tooling

Acceptance Criteria
- [ ] `package.json` contains the required runtime dependencies
- [ ] `package.json` contains the required development dependencies
- [ ] No required package is missing for local development
- [ ] Tooling supports build, run, and test workflows without dependency errors

### [ ] Task 3: Set Up Environment Configuration and Secret Hygiene
Depends on: Task 1, Task 2  
Parallel with: Task 4, Task 5

Subtasks
- [ ] Create `.env.example`
- [ ] Add `PORT`, `MONGO_URL`, and `MONGO_DB` placeholders to `.env.example`
- [ ] Ensure `.env` is listed in `.gitignore`
- [ ] Define startup validation rules for missing environment variables
- [ ] Ensure no real credentials are committed anywhere in tracked files
- [ ] Ensure documentation uses placeholders only
- [ ] Document both local MongoDB and MongoDB Atlas environment patterns

Acceptance Criteria
- [ ] `.env.example` exists with placeholder values only
- [ ] `.env` is ignored by git
- [ ] No real MongoDB URI, API key, or secret appears in tracked files
- [ ] App startup fails clearly when required environment variables are missing
- [ ] Setup docs do not leak credentials or connection strings

### [ ] Task 4: Implement Database Connection Module
Depends on: Task 2, Task 3  
Parallel with: Task 5

Subtasks
- [ ] Create `src/config/db.ts`
- [ ] Implement `connectDB()`
- [ ] Implement `closeDB()`
- [ ] Build connection logic from environment variables
- [ ] Add success logging or equivalent visibility for successful connection
- [ ] Add failure handling for database connection errors
- [ ] Ensure disconnect logic is safe for shutdown and testing flows

Acceptance Criteria
- [ ] `connectDB()` opens a Mongoose connection using environment config
- [ ] `closeDB()` closes the connection cleanly
- [ ] Connection errors surface meaningful failure information
- [ ] Connection lifecycle can be reused by app startup and tests

### [ ] Task 5: Build the Event Model and Shared Types
Depends on: Task 2  
Parallel with: Task 3, Task 4

Subtasks
- [ ] Create `src/models/Event.ts`
- [ ] Create `src/models/index.ts` if used for exports
- [ ] Define TypeScript types or interfaces for event input and persisted documents
- [ ] Add required `title` field with trimming and non-empty behavior
- [ ] Add optional `description` field with trimming
- [ ] Add required `date` field
- [ ] Add optional `location` field with trimming
- [ ] Add `category` enum with allowed values: `Meeting`, `Conference`, `Personal`, `Workshop`, `Other`
- [ ] Add `attendees` as an array of strings
- [ ] Enable `createdAt` and `updatedAt` timestamps
- [ ] Export model and associated types cleanly

Acceptance Criteria
- [ ] Title is required and trimmed
- [ ] Date is required and stored as a valid date
- [ ] Category accepts only allowed values
- [ ] Attendees persist as an array of strings
- [ ] `createdAt` is persisted
- [ ] `updatedAt` is persisted and updated correctly
- [ ] Model exports are reusable by controller code

### [ ] Task 6: Define Shared API Contracts and Error Rules
Depends on: Task 3, Task 5  
Parallel with: Late Task 4 work

Subtasks
- [ ] Define a consistent JSON success response shape
- [ ] Define a consistent JSON error response shape
- [ ] Define ObjectId validation behavior before database queries
- [ ] Define invalid ObjectId handling as `400`
- [ ] Define missing resource handling as `404`
- [ ] Define request validation and Mongoose validation failures as `400`
- [ ] Define unexpected server failures as `500`
- [ ] Define category query validation rules
- [ ] Define date query parsing and invalid date handling rules

Acceptance Criteria
- [ ] Error semantics match the PRD exactly
- [ ] ObjectId handling is standardized before controller implementation
- [ ] Query validation behavior is explicit for category and date
- [ ] Success and error response formats are predictable across endpoints

### [ ] Task 7: Implement Controllers for CRUD and Filtering
Depends on: Task 4, Task 5, Task 6  
Parallel with: None

Subtasks
- [ ] Create `src/controllers/eventController.ts`
- [ ] Implement list-events controller
- [ ] Implement get-event-by-id controller
- [ ] Implement create-event controller
- [ ] Implement update-event controller
- [ ] Implement delete-event controller
- [ ] Add category filtering logic to list-events
- [ ] Add date filtering logic for events on or after the provided date
- [ ] Validate ObjectIds before querying
- [ ] Handle Mongoose validation failures correctly
- [ ] Return consistent JSON responses across all controller actions

Acceptance Criteria
- [ ] `GET /api/events` returns all events when no filters are supplied
- [ ] `GET /api/events?category=Workshop` filters correctly
- [ ] `GET /api/events?date=2026-03-01` returns events on or after the given date
- [ ] `GET /api/events/:id` returns `200` for a valid existing item
- [ ] `POST /api/events` returns `201` for a valid payload
- [ ] `PUT /api/events/:id` returns `200` for a successful update
- [ ] `DELETE /api/events/:id` returns `200` for a successful delete
- [ ] Invalid ObjectIds return `400`
- [ ] Missing resources return `404`
- [ ] Validation failures return `400`
- [ ] Unexpected failures return `500`

### [ ] Task 8: Implement Routes and Compose the Express App
Depends on: Task 3, Task 4, Task 6, Task 7  
Parallel with: Early Task 10 documentation drafting

Subtasks
- [ ] Create `src/routes/eventRoutes.ts`
- [ ] Map all required HTTP methods and paths
- [ ] Mount routes under `/api/events`
- [ ] Configure `express.json()` middleware
- [ ] Load dotenv at startup
- [ ] Connect to the database before serving requests
- [ ] Add optional root or health route for manual verification
- [ ] Start server using `PORT`
- [ ] Add graceful shutdown logic that calls `closeDB()`

Acceptance Criteria
- [ ] All required routes are mounted correctly
- [ ] Requests reach `/api/events` handlers successfully
- [ ] App starts successfully with valid environment configuration
- [ ] App shuts down without leaving the DB connection open
- [ ] Route layer remains thin and controller-driven

### [ ] Task 9: Add Automated Verification Coverage
Depends on: Task 6, Task 7, Task 8  
Parallel with: Early Task 10 documentation completion

Subtasks
- [ ] Set up test runner configuration
- [ ] Set up API testing with Supertest
- [ ] Add test coverage for create event
- [ ] Add test coverage for get all events
- [ ] Add test coverage for get event by ID
- [ ] Add test coverage for update event
- [ ] Add test coverage for delete event
- [ ] Add test coverage for category filtering
- [ ] Add test coverage for date filtering
- [ ] Add test coverage for invalid ObjectId behavior
- [ ] Add test coverage for validation failure behavior
- [ ] Add test coverage for not-found behavior
- [ ] Ensure DB setup and teardown is safe for test execution

Acceptance Criteria
- [ ] At least one happy-path test exists for each CRUD endpoint
- [ ] Category filtering is tested
- [ ] Date filtering is tested
- [ ] Invalid ObjectId behavior is tested
- [ ] Validation failure behavior is tested
- [ ] Not-found behavior is tested
- [ ] Test runs are repeatable and do not depend on leaked local secrets

### [ ] Task 10: Final Documentation and Manual Validation Assets
Depends on: Task 3, Task 8, Task 9  
Parallel with: Can begin partially after Task 3

Subtasks
- [ ] Create `README.md`
- [ ] Document the tech stack explicitly
- [ ] Document local setup steps for Windows
- [ ] Document local MongoDB setup path
- [ ] Document MongoDB Atlas setup path
- [ ] Document environment variable setup using placeholders only
- [ ] Document build, run, and test commands
- [ ] Document all API endpoints
- [ ] Add Postman and manual validation checklist
- [ ] Add edge-case validation checklist
- [ ] Review documentation for secret leakage
- [ ] Confirm deliverables align with the PRD

Acceptance Criteria
- [ ] README matches actual implementation behavior
- [ ] README includes Windows-friendly environment instructions
- [ ] README includes both local MongoDB and Atlas setup paths
- [ ] README lists Express, MongoDB with Mongoose, TypeScript, dotenv, and the chosen test stack
- [ ] README includes no real credentials, API keys, or live connection strings
- [ ] Manual validation steps cover CRUD, filters, and error paths
- [ ] Submission artifacts match the PRD deliverables

## Dependency Summary
- [ ] Task 1 completed before any implementation work
- [ ] Task 2 completed before environment, DB, and model work
- [ ] Task 3 completed before final DB integration and secure documentation
- [ ] Task 4 and Task 5 can proceed in parallel after Task 2 and Task 3 are stable
- [ ] Task 6 should be finalized before controller implementation is considered complete
- [ ] Task 7 must complete before final route and app integration
- [ ] Task 8 must complete before full automated verification
- [ ] Task 9 and Task 10 close the quality and delivery phase

## Safe Parallel Workstreams
- [ ] Workstream A: Task 3 environment configuration
- [ ] Workstream B: Task 4 database connection module
- [ ] Workstream C: Task 5 event model and types
- [ ] Workstream D: Early Task 10 README scaffolding after environment contract is stable
- [ ] Merge point: Task 6 shared contracts
- [ ] Final integration point: Task 8 app composition
- [ ] Quality gate: Task 9 automated verification
- [ ] Delivery gate: Task 10 final documentation review

## Global Done Checks
- [ ] All 5 CRUD endpoints are implemented
- [ ] Category filtering works correctly
- [ ] Date filtering works correctly
- [ ] `connectDB()` and `closeDB()` are reusable and integrated
- [ ] Error handling uses `200`, `201`, `400`, `404`, and `500` correctly
- [ ] `.env.example` exists
- [ ] `.env` is gitignored
- [ ] No secrets leak through committed code or docs
- [ ] README setup and testing instructions are accurate
- [ ] Project is ready for Postman validation and automated test execution