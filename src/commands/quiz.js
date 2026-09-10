import { InlineKeyboard } from "grammy";
import { getQuiz } from "../services/contentService.js";

export default function register(bot) {
  bot.command("quiz", async (ctx) => {
    const quiz = getQuiz();
    const question = quiz.questions[0];
    const keyboard = new InlineKeyboard();

    question.choices.forEach((choice, index) => {
      keyboard.text(choice, `quiz:ans:${quiz.id}:${index}`).row();
    });

    await ctx.reply(`${quiz.title}\n\n${question.prompt}`, {
      reply_markup: keyboard
    });
  });
}
