import dotenv from "dotenv";

dotenv.config();

export interface AppEnv {
  port: number;
  mongoUrl: string;
  mongoDb: string;
}

let cachedEnv: AppEnv | undefined;

function parsePort(value: string | undefined): number {
  const port = Number.parseInt(value ?? "", 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("Environment variable PORT must be a positive integer.");
  }

  return port;
}

export function getEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const mongoUrl = process.env.MONGO_URL?.trim();
  const mongoDb = process.env.MONGO_DB?.trim();
  const missingVariables = [
    ["MONGO_URL", mongoUrl],
    ["MONGO_DB", mongoDb],
    ["PORT", process.env.PORT],
  ].filter(([, value]) => !value?.trim());

  if (missingVariables.length > 0) {
    const missingNames = missingVariables.map(([name]) => name).join(", ");

    throw new Error(
      `Missing required environment variables: ${missingNames}. Create a .env file using .env.example.`,
    );
  }

  cachedEnv = {
    port: parsePort(process.env.PORT),
    mongoUrl: mongoUrl as string,
    mongoDb: mongoDb as string,
  };

  return cachedEnv;
}

export function validateEnv(): AppEnv {
  return getEnv();
}
