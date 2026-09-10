import { saveUserProfile } from "../lib/db.js";
import { onboardingKeyboard } from "../services/contentService.js";

export default function register(bot) {
  bot.command("start", async (ctx) => {
    await saveUserProfile(ctx.from);
    await ctx.reply([
      "Welcome to ScripturePath.",
      "",
      "I can help you study the Bible through daily lessons, topics, book summaries, quizzes, reading plans, bookmarks, and reminders.",
      "",
      "Choose your experience level, or use /daily to begin."
    ].join("\n"), {
      reply_markup: onboardingKeyboard()
    });
  });
}
