import express from "express";

import { validateEnv } from "./config/env";
import eventRoutes from "./routes/eventRoutes";

validateEnv();

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", message: "Event Planner API is running." });
});

app.use("/api/events", eventRoutes);

export default app;
