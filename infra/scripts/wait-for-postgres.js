const { exec } = require("node:child_process");

const spinner = ["/", "-", "\\", "|"];
let index = 0;

function checkPostgresStatus() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(_error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(
        `🔴 Waiting for Postgres to accept connections ${spinner[index++ % spinner.length]}`,
      );
      index = (index + 1) % spinner.length;
      checkPostgresStatus();
      return;
    }

    process.stdout.write(
      "\n🟢 Postgres is running and accepting connections!\n",
    );
  }
}

checkPostgresStatus();
