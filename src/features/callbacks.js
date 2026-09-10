import { InlineKeyboard } from "grammy";
import {
  addBookmark,
  clearUserData,
  getProgress,
  markLessonComplete,
  saveQuizAttempt,
  updateProgress,
  updateUserPreferences
} from "../lib/db.js";
import { safeErr, log } from "../lib/log.js";
import {
  formatLesson,
  formatPlanStatus,
  getDailyLesson,
  getLessonById,
  getLessonsByTopic,
  getPlan,
  getQuiz,
  lessonKeyboard,
  planKeyboard
} from "../services/contentService.js";

export function registerCallbacks(bot) {
  bot.callbackQuery(/^level:(.+)$/, async (ctx) => {
    const level = ctx.match[1];
    await updateUserPreferences(ctx.from.id, { learningLevel: level });
    await ctx.answerCallbackQuery();
    await ctx.reply(`Saved your learning level as ${level}. Try /daily to begin.`);
  });

  bot.callbackQuery("daily:open", async (ctx) => {
    await ctx.answerCallbackQuery();
    const lesson = getDailyLesson(ctx.from.id);
    await ctx.reply(formatLesson(lesson), { reply_markup: lessonKeyboard(lesson) });
  });

  bot.callbackQuery("plan:open", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("Choose a reading plan:", { reply_markup: planKeyboard() });
  });

  bot.callbackQuery(/^topic:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const topic = ctx.match[1].replace(/-/g, " ");
    const lessons = getLessonsByTopic(topic);

    if (!lessons.length) {
      await ctx.reply("No lesson is available for that topic yet. Try /daily or /books.");
      return;
    }

    const lesson = lessons[0];
    await ctx.reply(formatLesson(lesson), { reply_markup: lessonKeyboard(lesson) });
  });

  bot.callbackQuery(/^lesson:complete:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const lessonId = ctx.match[1];
    const lesson = getLessonById(lessonId);
    await markLessonComplete(ctx.from.id, lessonId);
    await ctx.reply(`Marked complete: ${lesson?.title || lessonId}`);
  });

  bot.callbackQuery(/^bookmark:lesson:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const lesson = getLessonById(ctx.match[1]);
    if (!lesson) {
      await ctx.reply("I could not find that lesson to bookmark.");
      return;
    }

    await addBookmark(ctx.from.id, {
      verseReference: lesson.passage,
      note: lesson.title,
      lessonId: lesson.id
    });
    await ctx.reply("Saved that lesson to your bookmarks.");
  });

  bot.callbackQuery(/^plan:select:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const plan = getPlan(ctx.match[1]);
    if (!plan) {
      await ctx.reply("I could not find that reading plan.");
      return;
    }

    await updateProgress(ctx.from.id, {
      activePlanId: plan.id,
      currentPlanDay: 1,
      completedReadings: [],
      lastActivityAt: new Date()
    });

    const keyboard = new InlineKeyboard().text("Mark day complete", `plan:done:${plan.id}`);
    await ctx.reply(formatPlanStatus(plan, { currentPlanDay: 1 }), { reply_markup: keyboard });
  });

  bot.callbackQuery(/^plan:done:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const plan = getPlan(ctx.match[1]);
    if (!plan) {
      await ctx.reply("I could not find that reading plan.");
      return;
    }

    const progress = await getProgress(ctx.from.id);
    const day = Math.max(1, Number(progress.currentPlanDay || 1));
    const completedReadings = Array.from(new Set([...(progress.completedReadings || []), `${plan.id}:day:${day}`]));
    const nextDay = day + 1;

    await updateProgress(ctx.from.id, {
      activePlanId: plan.id,
      currentPlanDay: nextDay,
      completedReadings,
      lastActivityAt: new Date()
    });

    if (nextDay > plan.durationDays) {
      await ctx.reply(`Great work. You completed ${plan.title}.`);
      return;
    }

    const keyboard = new InlineKeyboard().text("Mark day complete", `plan:done:${plan.id}`);
    await ctx.reply(formatPlanStatus(plan, { currentPlanDay: nextDay }), { reply_markup: keyboard });
  });

  bot.callbackQuery(/^quiz:start:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const quiz = getQuiz(ctx.match[1]);
    if (!quiz) {
      await ctx.reply("I could not find that quiz.");
      return;
    }

    const question = quiz.questions[0];
    const keyboard = new InlineKeyboard();
    question.choices.forEach((choice, index) => {
      keyboard.text(choice, `quiz:ans:${quiz.id}:${index}`).row();
    });

    await ctx.reply(`${quiz.title}\n\n${question.prompt}`, { reply_markup: keyboard });
  });

  bot.callbackQuery(/^quiz:ans:([^:]+):(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const quiz = getQuiz(ctx.match[1]);
    const selected = Number(ctx.match[2]);

    if (!quiz) {
      await ctx.reply("I could not find that quiz.");
      return;
    }

    const question = quiz.questions[0];
    const correct = selected === question.answerIndex;
    const score = correct ? 1 : 0;

    try {
      await saveQuizAttempt(ctx.from.id, quiz.id, [{ question: question.prompt, selected }], score);
    } catch (err) {
      log.warn("quiz attempt save failed", { err: safeErr(err) });
    }

    await ctx.reply([
      correct ? "Correct." : "Not quite.",
      question.explanation,
      `Score: ${score}/1`
    ].join("\n"));
  });

  bot.callbackQuery("reset:confirm", async (ctx) => {
    await ctx.answerCallbackQuery();
    await clearUserData(ctx.from.id);
    await ctx.reply("Your ScripturePath data has been deleted.");
  });
}
