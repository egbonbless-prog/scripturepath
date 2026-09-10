import { saveUserProfile } from "../lib/db.js";
import { formatLesson, getDailyLesson, lessonKeyboard } from "../services/contentService.js";

export default function register(bot) {
  bot.command("daily", async (ctx) => {
    await saveUserProfile(ctx.from);
    const lesson = getDailyLesson(ctx.from?.id);
    await ctx.reply(formatLesson(lesson), {
      reply_markup: lessonKeyboard(lesson)
    });
  });
}
