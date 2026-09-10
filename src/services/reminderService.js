import { cfg } from "../lib/config.js";
import { getDueReminders, markReminderSent } from "../lib/db.js";
import { log, safeErr } from "../lib/log.js";
import { getDailyLesson, formatLesson, lessonKeyboard } from "./contentService.js";

let running = false;
let stopped = true;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function startReminderScheduler(bot) {
  if (running) return;
  running = true;
  stopped = false;

  const intervalMs = Number.isFinite(cfg.REMINDER_CHECK_MS) && cfg.REMINDER_CHECK_MS >= 10000
    ? cfg.REMINDER_CHECK_MS
    : 60000;

  log.info("reminder scheduler started", { intervalMs });

  (async () => {
    while (!stopped) {
      try {
        log.info("reminder cycle run");
        const reminders = await getDueReminders(new Date());
        for (const reminder of reminders) {
          try {
            const lesson = getDailyLesson(reminder.telegramUserId);
            await bot.api.sendMessage(
              reminder.chatId,
              `Daily ScripturePath reminder\n\n${formatLesson(lesson)}`,
              { reply_markup: lessonKeyboard(lesson) }
            );
            await markReminderSent(reminder.telegramUserId);
          } catch (err) {
            log.warn("reminder send failed", {
              telegramUserId: reminder.telegramUserId,
              err: safeErr(err)
            });
          }
        }
      } catch (err) {
        log.error("reminder cycle failed", { err: safeErr(err) });
      }

      await sleep(intervalMs);
    }
  })().catch((err) => {
    log.error("reminder scheduler crashed", { err: safeErr(err) });
  });
}

export function stopReminderScheduler() {
  stopped = true;
  running = false;
  log.info("reminder scheduler stopped");
}
