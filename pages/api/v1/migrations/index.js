import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];

  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method ${request.method} not allowed.`,
    });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationOptions = {
      dbClient: dbClient,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: true,
      });

      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const executedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      if (executedMigrations.length > 0) {
        return response.status(201).json(executedMigrations);
      }

      return response.status(200).json(executedMigrations);
    }
  } catch (error) {
    console.error("Migrations error:", error);
    throw error;
  } finally {
    await dbClient?.end();
  }
}

export default migrations;
