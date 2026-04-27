import { checkDatabaseConnection, getLivenessSnapshot } from "../src/lib/health";
import { logger } from "../src/lib/logger";

async function main() {
  const live = getLivenessSnapshot();
  const database = await checkDatabaseConnection();

  logger.info({
    scope: "ops",
    message: "Operational readiness check passed.",
    meta: {
      ...live,
      database
    }
  });
}

main().catch((error) => {
  logger.error({
    scope: "ops",
    message: "Operational readiness check failed.",
    error
  });

  process.exit(1);
});
