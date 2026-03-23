import express from "express";

import { validateEnv } from "./config/env";

validateEnv();

const app = express();

export default app;