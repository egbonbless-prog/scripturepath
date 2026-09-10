import { InlineKeyboard } from "grammy";

export default function register(bot) {
  bot.command("resetdata", async (ctx) => {
    const keyboard = new InlineKeyboard().text("Yes, delete my data", "reset:confirm");
    await ctx.reply("This will delete your saved progress, bookmarks, reminders, quiz history, and study memory. Continue?", {
      reply_markup: keyboard
    });
  });
}
