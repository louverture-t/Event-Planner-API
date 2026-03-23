import mongoose from "mongoose";

import { getEnv } from "./env";

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState === 2) {
    await mongoose.connection.asPromise();
    return;
  }

  const { mongoUrl, mongoDb } = getEnv();

  try {
    await mongoose.connect(mongoUrl, {
      dbName: mongoDb,
    });

    console.log(`MongoDB connected: ${mongoDb}`);
  } catch (error) {
    console.error("MongoDB connection failed.", error);
    throw error;
  }
}

export async function closeDB(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  try {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("MongoDB disconnect failed.", error);
    throw error;
  }
}
