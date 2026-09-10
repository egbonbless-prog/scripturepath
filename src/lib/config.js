export const cfg = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  MONGODB_URI: process.env.MONGODB_URI || "",
  REMINDER_CHECK_MS: Number(process.env.REMINDER_CHECK_MS || 60000)
};
