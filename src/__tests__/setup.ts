import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, afterEach, beforeAll } from "vitest";

import { EventModel } from "../models";

// Set required env vars synchronously so validateEnv() succeeds when app.ts loads.
// MONGO_URL is overridden with the real in-memory URI inside beforeAll.
process.env.PORT = "3001";
process.env.MONGO_URL = "mongodb://localhost:27017";
process.env.MONGO_DB = "test-db";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri(), { dbName: "test-db" });
});

afterEach(async () => {
  await EventModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
