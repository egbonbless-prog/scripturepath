import { InlineKeyboard } from "grammy";
import { BOOKS, LESSONS, QUIZZES, READING_PLANS, TOPICS } from "../data/content.js";

export function getBotProfile() {
  return [
    "ScripturePath helps people learn the Bible through guided lessons, daily devotionals, topic studies, book summaries, quizzes, reading plans, bookmarks, reminders, and progress tracking.",
    "Public commands: /start, /help, /daily, /topics, /books, /plan, /quiz, /ask, /bookmarks, /reminder, /privacy, /resetdata.",
    "Rules: the tone is educational, respectful, and non-denominational by default. Scripture focus, explanation, and application are kept separate. In groups, users should use slash commands directly."
  ].join("\n");
}

export function commandHelpText() {
  return [
    "ScripturePath commands",
    "",
    "/daily gives a short guided Bible lesson.",
    "/topics opens study themes like Faith, Prayer, Jesus, Wisdom, and Forgiveness.",
    "/books lists book summaries. Try /books John.",
    "/plan lets you choose or continue a reading plan.",
    "/quiz starts a short quiz from recent lesson content.",
    "/ask answers a Bible study question from the built-in lesson library.",
    "/bookmarks lists saved bookmarks. Try /bookmarks add John 3:16 | God's love.",
    "/reminder 08:00 sets a daily reminder. Use /reminder off to disable it.",
    "/privacy explains stored data.",
    "/resetdata deletes your saved data."
  ].join("\n");
}

export function getDailyLesson(userId) {
  const numeric = Number(String(userId || "0").replace(/\D/g, "")) || 0;
  const day = Math.floor(Date.now() / 86400000);
  return LESSONS[(numeric + day) % LESSONS.length];
}

export function getLessonById(id) {
  return LESSONS.find((lesson) => lesson.id === id) || null;
}

export function getTopicNames() {
  return TOPICS;
}

export function getLessonsByTopic(topic) {
  const t = String(topic || "").toLowerCase();
  return LESSONS.filter((lesson) =>
    lesson.category.toLowerCase() === t ||
    lesson.tags.some((tag) => tag.toLowerCase() === t)
  );
}

export function getBook(name) {
  const q = String(name || "").trim().toLowerCase();
  return BOOKS.find((book) => book.name.toLowerCase() === q) || null;
}

export function listBooks() {
  return BOOKS;
}

export function listPlans() {
  return READING_PLANS;
}

export function getPlan(planId) {
  return READING_PLANS.find((plan) => plan.id === planId) || null;
}

export function getQuiz(quizId = "") {
  if (quizId) return QUIZZES.find((quiz) => quiz.id === quizId) || null;
  const day = Math.floor(Date.now() / 86400000);
  return QUIZZES[day % QUIZZES.length];
}

export function getQuizForLesson(lessonId) {
  return QUIZZES.find((quiz) => quiz.lessonId === lessonId) || null;
}

export function searchContent(query) {
  const terms = String(query || "")
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  if (!terms.length) return [];

  return LESSONS.map((lesson) => {
    const haystack = [
      lesson.title,
      lesson.category,
      lesson.book,
      lesson.passage,
      lesson.summary,
      lesson.explanation,
      lesson.application,
      lesson.tags.join(" ")
    ].join(" ").toLowerCase();

    const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
    return { lesson, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((row) => row.lesson);
}

export function lessonKeyboard(lesson) {
  const quiz = getQuizForLesson(lesson.id);
  const keyboard = new InlineKeyboard()
    .text("Mark complete", `lesson:complete:${lesson.id}`)
    .text("Bookmark", `bookmark:lesson:${lesson.id}`);

  if (quiz) keyboard.row().text("Take quiz", `quiz:start:${quiz.id}`);
  return keyboard;
}

export function topicKeyboard() {
  const keyboard = new InlineKeyboard();
  TOPICS.forEach((topic, index) => {
    keyboard.text(topic, `topic:${topic.toLowerCase().replace(/\s+/g, "-")}`);
    if (index % 2 === 1) keyboard.row();
  });
  return keyboard;
}

export function planKeyboard() {
  const keyboard = new InlineKeyboard();
  READING_PLANS.forEach((plan) => {
    keyboard.text(plan.title, `plan:select:${plan.id}`).row();
  });
  return keyboard;
}

export function onboardingKeyboard() {
  return new InlineKeyboard()
    .text("New to the Bible", "level:beginner")
    .row()
    .text("Some experience", "level:returning")
    .row()
    .text("Start today's lesson", "daily:open")
    .text("Choose a plan", "plan:open");
}

export function formatLesson(lesson) {
  return [
    lesson.title,
    "",
    `Passage: ${lesson.passage}`,
    `Category: ${lesson.category}`,
    "",
    `Scripture focus: ${lesson.scripture.replace(/^Scripture focus:\s*/i, "")}`,
    "",
    `Explanation: ${lesson.explanation}`,
    "",
    `Application: ${lesson.application}`,
    "",
    `Reflection: ${lesson.reflection}`
  ].join("\n");
}

export function formatBook(book) {
  return [
    book.name,
    "",
    `Section: ${book.testament}`,
    `Summary: ${book.summary}`,
    `Key themes: ${book.themes.join(", ")}`,
    `Suggested passages: ${book.keyPassages.join(", ")}`
  ].join("\n");
}

export function formatPlanStatus(plan, progress) {
  const day = Math.max(1, Number(progress.currentPlanDay || 1));
  const assignment = plan.days[Math.min(day - 1, plan.days.length - 1)];
  const done = day > plan.durationDays;

  if (done) {
    return [
      `${plan.title}`,
      "",
      "You have completed this reading plan.",
      "You can choose another plan with /plan."
    ].join("\n");
  }

  return [
    `${plan.title}`,
    "",
    `Day ${day} of ${plan.durationDays}`,
    `Today's reading: ${assignment}`,
    "",
    "Read slowly, note one observation, and ask: What does this passage show about God, people, and faithful response?"
  ].join("\n");
}
