import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app";

const BASE = "/api/events";

const validPayload = {
  title: "Test Conference",
  date: "2026-05-01T10:00:00.000Z",
  category: "Conference",
  attendees: ["Alice", "Bob"],
};

// ---------------------------------------------------------------------------
// POST /api/events
// ---------------------------------------------------------------------------
describe("POST /api/events", () => {
  it("creates an event and returns 201", async () => {
    const res = await request(app).post(BASE).send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Test Conference");
    expect(res.body.data.category).toBe("Conference");
    expect(res.body.data.attendees).toEqual(["Alice", "Bob"]);
    expect(res.body.data._id).toBeDefined();
    expect(res.body.data.createdAt).toBeDefined();
  });

  it("returns 400 when title is missing", async () => {
    const { title: _omit, ...noTitle } = validPayload;
    const res = await request(app).post(BASE).send(noTitle);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when date is missing", async () => {
    const { date: _omit, ...noDate } = validPayload;
    const res = await request(app).post(BASE).send(noDate);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for an invalid category value", async () => {
    const res = await request(app)
      .post(BASE)
      .send({ ...validPayload, category: "InvalidCategory" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

// ---------------------------------------------------------------------------
// GET /api/events
// ---------------------------------------------------------------------------
describe("GET /api/events", () => {
  it("returns an empty array when no events exist", async () => {
    const res = await request(app).get(BASE);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it("returns all events", async () => {
    await request(app).post(BASE).send(validPayload);
    await request(app).post(BASE).send({ ...validPayload, title: "Second Event" });

    const res = await request(app).get(BASE);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it("filters events by category", async () => {
    await request(app).post(BASE).send(validPayload); // Conference
    await request(app)
      .post(BASE)
      .send({ ...validPayload, title: "Workshop Event", category: "Workshop" });

    const res = await request(app).get(`${BASE}?category=Workshop`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].category).toBe("Workshop");
  });

  it("filters events by date — returns only events on or after the given date", async () => {
    await request(app)
      .post(BASE)
      .send({ ...validPayload, title: "Early Event", date: "2026-01-01T00:00:00.000Z" });
    await request(app)
      .post(BASE)
      .send({ ...validPayload, title: "Late Event", date: "2026-06-01T00:00:00.000Z" });

    const res = await request(app).get(`${BASE}?date=2026-04-01`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Late Event");
  });

  it("returns 400 for an unrecognised category filter value", async () => {
    const res = await request(app).get(`${BASE}?category=NotACategory`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for an invalid date filter value", async () => {
    const res = await request(app).get(`${BASE}?date=not-a-date`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

// ---------------------------------------------------------------------------
// GET /api/events/:id
// ---------------------------------------------------------------------------
describe("GET /api/events/:id", () => {
  it("returns the event for a valid existing id", async () => {
    const create = await request(app).post(BASE).send(validPayload);
    const id: string = create.body.data._id;

    const res = await request(app).get(`${BASE}/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(id);
    expect(res.body.data.title).toBe("Test Conference");
  });

  it("returns 400 for a malformed ObjectId", async () => {
    const res = await request(app).get(`${BASE}/not-an-id`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_OBJECT_ID");
  });

  it("returns 404 when no event matches the given id", async () => {
    const res = await request(app).get(`${BASE}/000000000000000000000001`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

// ---------------------------------------------------------------------------
// PUT /api/events/:id
// ---------------------------------------------------------------------------
describe("PUT /api/events/:id", () => {
  it("updates the event and returns 200", async () => {
    const create = await request(app).post(BASE).send(validPayload);
    const id: string = create.body.data._id;

    const res = await request(app)
      .put(`${BASE}/${id}`)
      .send({ title: "Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Updated Title");
    expect(res.body.data._id).toBe(id);
  });

  it("returns 400 for a malformed ObjectId", async () => {
    const res = await request(app).put(`${BASE}/not-an-id`).send({ title: "X" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_OBJECT_ID");
  });

  it("returns 404 when no event matches the given id", async () => {
    const res = await request(app)
      .put(`${BASE}/000000000000000000000001`)
      .send({ title: "X" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 400 when the update payload contains an invalid category", async () => {
    const create = await request(app).post(BASE).send(validPayload);
    const id: string = create.body.data._id;

    const res = await request(app)
      .put(`${BASE}/${id}`)
      .send({ category: "InvalidCategory" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/events/:id
// ---------------------------------------------------------------------------
describe("DELETE /api/events/:id", () => {
  it("deletes the event and returns 200 with the deleted document", async () => {
    const create = await request(app).post(BASE).send(validPayload);
    const id: string = create.body.data._id;

    const res = await request(app).delete(`${BASE}/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(id);

    // Confirm it's gone
    const check = await request(app).get(`${BASE}/${id}`);
    expect(check.status).toBe(404);
  });

  it("returns 400 for a malformed ObjectId", async () => {
    const res = await request(app).delete(`${BASE}/not-an-id`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_OBJECT_ID");
  });

  it("returns 404 when no event matches the given id", async () => {
    const res = await request(app).delete(`${BASE}/000000000000000000000001`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
