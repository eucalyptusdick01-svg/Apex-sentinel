import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function initStripe() {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    logger.warn("Stripe init skipped — DATABASE_URL not set");
    return;
  }

  // Step 1: Run DB migrations — only needs the database URL, always attempt this.
  try {
    const { runMigrations } = await import("stripe-replit-sync");
    await runMigrations({ databaseUrl });
    logger.info("Stripe DB migrations complete");
  } catch (err: unknown) {
    logger.error({ err }, "Stripe DB migration failed — stripe.* tables may be missing");
    return;
  }

  // Step 2: Connect to Stripe API — needs credentials, may skip gracefully.
  try {
    const { getStripeSync } = await import("./stripeClient");
    const stripeSync = await getStripeSync();
    const webhookBaseUrl = `https://${process.env["REPLIT_DOMAINS"]?.split(",")[0]}`;
    await stripeSync.findOrCreateManagedWebhook(`${webhookBaseUrl}/api/stripe/webhook`);
    stripeSync.syncBackfill().catch((err: unknown) => logger.error({ err }, "Stripe backfill error"));
    logger.info("Stripe initialized");
  } catch (err: unknown) {
    logger.warn({ err }, "Stripe sync skipped — integration not connected yet");
  }
}

await initStripe();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
