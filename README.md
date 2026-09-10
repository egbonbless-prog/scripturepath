ScripturePath Bot

ScripturePath is a Telegram bot that helps people study the Bible through daily lessons, guided topics, book summaries, quizzes, reading plans, bookmarks, reminders, and progress tracking.

Features

1) Daily devotional-style lessons with passage, scripture focus, explanation, application, and reflection.
2) Topic studies for Faith, Prayer, Jesus, Wisdom, Forgiveness, Old Testament, New Testament, and Parables.
3) Book summaries for selected Bible books.
4) Reading plans with progress tracking.
5) Short quizzes with inline answer buttons and saved scores.
6) Bookmarks for verses and lessons.
7) Daily reminders from the same Node.js process.
8) Privacy and reset commands.
9) MongoDB persistence when MONGODB_URI is available, with in-memory fallback for local testing.

Architecture

The bot runs as one Node.js ESM process.

The main layers are:

1) src/index.js starts the app, validates env, initializes MongoDB, registers commands and callbacks, clears Telegram webhooks, and starts long polling with recovery.
2) src/bot.js creates the grammY bot and session middleware.
3) src/commands contains one public command per file.
4) src/features/callbacks.js handles inline keyboard actions.
5) src/services/contentService.js formats lessons, topics, books, plans, quizzes, and onboarding keyboards.
6) src/services/reminderService.js runs the in-process reminder loop.
7) src/lib/db.js manages MongoDB and safe in-memory fallback storage.
8) src/data/content.js contains first-version Bible learning content.

Setup

Prerequisites:

1) Node.js 18 or newer.
2) A Telegram bot token from BotFather.
3) Optional MongoDB database for persistent progress, bookmarks, reminders, and study memory.

Install:

npm install

Create a .env file from .env.sample and set:

TELEGRAM_BOT_TOKEN is required. It is the token from BotFather.
MONGODB_URI is optional but recommended. It stores user progress and learning data.
REMINDER_CHECK_MS is optional. It defaults to 60000.

Run locally:

npm run dev

Start production:

npm start

Build command for Render or similar:

npm run build

Commands

/start
Starts onboarding and explains the bot.
Example: /start
Expected output: welcome message with learning level and quick-start buttons.

/help
Shows command help.
Example: /help
Expected output: list of available public commands.

/daily
Returns the daily Bible lesson.
Example: /daily
Expected output: passage, scripture focus, explanation, application, reflection, and buttons.

/topics
Shows study topics.
Example: /topics
Expected output: topic buttons such as Faith, Prayer, Jesus, Wisdom, and Forgiveness.

/books
Lists available book summaries.
Example: /books
Expected output: available books.
Example: /books John
Expected output: summary, themes, and key passages for John.

/plan
Shows active reading plan status or lets the user choose a plan.
Example: /plan
Expected output: reading plan choices or current assignment.

/quiz
Starts a short quiz.
Example: /quiz
Expected output: one question with inline answer buttons.

/ask
Answers a Bible study question using the built-in lesson library.
Example: /ask What does grace mean?
Expected output: relevant passage, short answer, explanation, and application.

/bookmarks
Lists bookmarks.
Example: /bookmarks
Expected output: recent saved bookmarks.
Example: /bookmarks add John 3:16 | God's love
Expected output: bookmark saved.

/reminder
Sets or disables daily reminders.
Example: /reminder 08:00
Expected output: daily reminder set.
Example: /reminder off
Expected output: reminders disabled.

/privacy
Explains stored data.
Example: /privacy
Expected output: privacy summary.

/resetdata
Asks for confirmation before deleting saved data.
Example: /resetdata
Expected output: confirmation button.

Integrations

Telegram Bot API is used through grammY and @grammyjs/runner.

No external Bible API is required in this first version. Content is stored in src/data/content.js.

MongoDB is optional. If MONGODB_URI is missing or connection fails, the bot logs a warning and uses in-memory storage. In-memory data disappears on restart.

Error handling strategy:

1) Startup logs only env presence booleans, never secrets.
2) Telegram polling clears webhooks before long polling.
3) Polling failures are logged and retried with backoff.
4) MongoDB failures are logged with collection and operation names.
5) Reminder cycles never overlap because the loop sleeps after each cycle.

Database

Collections used when MongoDB is configured:

users stores telegramUserId, username, firstName, languageCode, preferences, createdAt, and updatedAt.
progress stores completedLessons, activePlanId, currentPlanDay, completedReadings, streakCount, quizStats, and timestamps.
bookmarks stores telegramUserId, verseReference, note, lessonId, and createdAt.
quizAttempts stores telegramUserId, quizId, answers, score, and completedAt.
reminders stores telegramUserId, chatId, enabled, timeLocal, timezone, frequency, lastSentAt, createdAt, and updatedAt.
memory_messages stores /ask turns with platform, userId, chatId, role, text, and ts.

Indexes:

users: telegramUserId unique.
progress: telegramUserId unique.
bookmarks: telegramUserId and createdAt.
quizAttempts: telegramUserId and completedAt.
reminders: enabled and timeLocal.
memory_messages: platform, userId, chatId, and ts.

No migration step is required. Indexes are created idempotently on boot.

Deployment

For Render or a similar service:

1) Set build command to npm run build.
2) Set start command to npm start.
3) Add TELEGRAM_BOT_TOKEN.
4) Add MONGODB_URI if you want persistent data.
5) Deploy as one long-running Node.js service.

The bot uses long polling by default. It deletes existing webhooks with drop_pending_updates before polling, which avoids webhook conflicts on first deploy.

Troubleshooting

If the bot exits immediately, check that TELEGRAM_BOT_TOKEN is set.

If commands do not respond, confirm the deployed service is running and check logs for polling failure messages.

If data disappears after restart, set MONGODB_URI.

If reminders do not arrive, confirm the reminder time uses the server local HH:MM time in this first version and check logs for reminder cycle messages.

If Telegram reports a 409 conflict during deploy overlap, the bot logs it and retries with backoff.

Extending

Add new commands under src/commands and export a default register(bot) function.

Add new callback handlers in src/features/callbacks.js.

Add more lessons, quizzes, plans, or book summaries in src/data/content.js.

Keep /help, README.md, DOCS.md, and the Telegram command menu in src/index.js in sync when public commands change.
