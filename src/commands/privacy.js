export default function register(bot) {
  bot.command("privacy", async (ctx) => {
    await ctx.reply([
      "ScripturePath privacy",
      "",
      "I store only what is needed to run Bible study features: your Telegram ID, basic profile fields, progress, bookmarks, quiz attempts, reminder settings, and /ask study history.",
      "",
      "Secrets and Telegram tokens are never stored in chat memory.",
      "",
      "Use /resetdata to delete your saved ScripturePath data."
    ].join("\n"));
  });
}
