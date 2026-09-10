import { disableReminder, setReminder } from "../lib/db.js";

function validTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export default function register(bot) {
  bot.command("reminder", async (ctx) => {
    const raw = ctx.message?.text || "";
    const arg = raw.replace(/^\/reminder(@\w+)?/i, "").trim();

    if (!arg) {
      await ctx.reply("Set a daily reminder with /reminder 08:00. The first version uses the server's local time. Use /reminder off to disable it.");
      return;
    }

    if (arg.toLowerCase() === "off") {
      await disableReminder(ctx.from.id);
      await ctx.reply("Daily reminders are off.");
      return;
    }

    if (!validTime(arg)) {
      await ctx.reply("Please use 24-hour HH:MM format, like /reminder 08:00 or /reminder 21:30.");
      return;
    }

    await setReminder(ctx.from.id, ctx.chat.id, arg);
    await ctx.reply(`Daily reminder set for ${arg}.`);
  });
}
