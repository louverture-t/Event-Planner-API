import app from "./app";
import { closeDB, connectDB } from "./config/db";
import { getEnv } from "./config/env";

async function startServer(): Promise<void> {
  await connectDB();

  const { port } = getEnv();
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  async function shutdown(signal: string): Promise<void> {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await closeDB();
      console.log("Server closed.");
      process.exit(0);
    });
  }

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
