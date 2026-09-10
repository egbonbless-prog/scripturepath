import "dotenv/config";
import { run } from "@grammyjs/runner";
import { cfg } from "./lib/config.js";
import { createBot } from "./bot.js";
import { registerCommands } from "./commands/loader.js";
import { initDb } from "./lib/db.js";
import { log, safeErr } from "./lib/log.js";
import { registerCallbacks } from "./features/callbacks.js";
import { startReminderScheduler, stopReminderScheduler } from "./services/reminderService.js";

let runnerHandle = null;
let shuttingDown = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startMemoryLogs() {
  setInterval(() => {
    const m = process.memoryUsage();
    log.info("memory", {
      rssMB: Math.round(m.rss / 1e6),
      heapUsedMB: Math.round(m.heapUsed / 1e6)
    });
  }, 60000).unref();
}

async function stopRunner() {
  if (!runnerHandle) return;
  try {
    await runnerHandle.stop?.();
  } catch (err) {
    log.warn("runner stop failed", { err: safeErr(err) });
  } finally {
    runnerHandle = null;
  }
}

async function runPollingWithRecovery(bot) {
  const backoffs = [2000, 5000, 10000, 20000];
  let attempt = 0;

  while (!shuttingDown) {
    try {
      log.info("polling preparing", { dropPendingUpdates: true });
      await bot.api.deleteWebhook({ drop_pending_updates: true });

      log.info("polling started", { method: "long_polling" });
      runnerHandle = run(bot, {
        runner: {
          fetch: {
            allowed_updates: [
              "message",
              "callback_query"
            ]
          }
        }
      });

      await runnerHandle.task();
      if (!shuttingDown) {
        log.warn("polling stopped unexpectedly");
      }
      attempt = 0;
    } catch (err) {
      const msg = safeErr(err);
      const conflict = String(msg).includes("409") || String(msg).toLowerCase().includes("conflict");
      log.warn("polling failure", { err: msg, conflict });
      await stopRunner();
      const waitMs = backoffs[Math.min(attempt, backoffs.length - 1)];
      attempt += 1;
      await sleep(waitMs);
    }
  }
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  log.info("shutdown started", { signal });
  stopReminderScheduler();
  await stopRunner();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  log.error("unhandled rejection", { err: safeErr(reason) });
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  log.error("uncaught exception", { err: safeErr(err) });
  process.exit(1);
});

async function boot() {
  try {
    log.info("boot start", {
      telegramTokenSet: Boolean(cfg.TELEGRAM_BOT_TOKEN),
      mongodbUriSet: Boolean(cfg.MONGODB_URI),
      reminderCheckMs: cfg.REMINDER_CHECK_MS
    });

    if (!cfg.TELEGRAM_BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN is required. Add it in your environment or .env file, then redeploy.");
      process.exit(1);
    }

    await initDb();

    const bot = createBot(cfg.TELEGRAM_BOT_TOKEN);
    await registerCommands(bot);
    registerCallbacks(bot);

    bot.catch((err) => {
      log.error("bot update error", {
        err: safeErr(err.error),
        updateId: err.ctx?.update?.update_id || "unknown"
      });
    });

    await bot.init();

    try {
      await bot.api.setMyCommands([
        { command: "start", description: "Start Bible study onboarding" },
        { command: "help", description: "Show commands and examples" },
        { command: "daily", description: "Get today's guided devotional" },
        { command: "topics", description: "Study by Bible theme" },
        { command: "books", description: "Explore Bible book summaries" },
        { command: "plan", description: "Choose or view a reading plan" },
        { command: "quiz", description: "Take a short Bible quiz" },
        { command: "ask", description: "Ask a Bible study question" },
        { command: "bookmarks", description: "View or add bookmarks" },
        { command: "reminder", description: "Set or disable daily reminders" },
        { command: "privacy", description: "View privacy details" },
        { command: "resetdata", description: "Delete your saved data" }
      ]);
    } catch (err) {
      log.warn("set commands failed", { err: safeErr(err) });
    }

    startMemoryLogs();
    startReminderScheduler(bot);

    await runPollingWithRecovery(bot);
  } catch (err) {
    log.error("boot failed", {
      code: err?.code || "unknown",
      err: safeErr(err)
    });
    if (err?.code === "ERR_MODULE_NOT_FOUND") {
      console.error("A module could not be found. Check relative import paths and .js file extensions.");
    }
    process.exit(1);
  }
}

boot();
