import database from "infra/database.js";

async function status(request, response) {
  const updateAt = new Date().toISOString();

  const databaseVersion = await database.query("SHOW server_version;");
  const maxConnections = await database.query("SHOW max_connections;");

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnections = await database.query({
    text: `SELECT count(*)::int as opened_connections
           FROM pg_stat_activity
           WHERE datname = $1;`,
    values: [databaseName],
  });

  response.status(200).json({
    updatedAt: updateAt,
    dependencies: {
      database: {
        version: databaseVersion[0].server_version,
        maxConnections: parseInt(maxConnections[0].max_connections),
        openedConnections: databaseOpenedConnections[0].opened_connections,
      },
    },
  });
}

export default status;
