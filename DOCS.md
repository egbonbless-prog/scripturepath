ScripturePath Bot Documentation

What the bot does

ScripturePath is a Telegram Bible learning bot. It teaches through guided daily lessons, topic studies, book summaries, reading plans, quizzes, bookmarks, reminders, and saved progress.

The teaching tone is educational, respectful, and non-denominational by default. Lesson messages separate scripture focus, explanation, application, and reflection.

Public commands

/start
What it does: starts onboarding and shows quick-start buttons.
Required parameters: none.
Usage: /start

/help
What it does: lists available commands and examples.
Required parameters: none.
Usage: /help

/daily
What it does: sends today's guided Bible lesson.
Required parameters: none.
Usage: /daily

/topics
What it does: opens topic buttons for Bible themes.
Required parameters: none.
Usage: /topics

/books
What it does: lists available book summaries or shows one book summary.
Required parameters: optional book name.
Usage: /books
Usage: /books John

/plan
What it does: lets the user choose a reading plan or continue the active plan.
Required parameters: none.
Usage: /plan

/quiz
What it does: starts a short Bible quiz with inline answer buttons.
Required parameters: none.
Usage: /quiz

/ask
What it does: answers a Bible study question from the built-in lesson library.
Required parameters: question text.
Usage: /ask What does grace mean?

/bookmarks
What it does: lists saved bookmarks or adds a bookmark.
Required parameters: none for listing. For adding, use a verse reference and optional note separated by a vertical bar.
Usage: /bookmarks
Usage: /bookmarks add John 3:16 | God's love

/reminder
What it does: sets or disables a daily reminder.
Required parameters: HH:MM time or off.
Usage: /reminder 08:00
Usage: /reminder off

/privacy
What it does: explains what user data is stored.
Required parameters: none.
Usage: /privacy

/resetdata
What it does: asks for confirmation before deleting saved user data.
Required parameters: none.
Usage: /resetdata

Environment variables

TELEGRAM_BOT_TOKEN
Required: yes.
Used for: authenticating the Telegram bot through grammY.
Never commit this value.

MONGODB_URI
Required: no.
Used for: persistent users, progress, bookmarks, quiz attempts, reminders, and memory_messages.
If missing, the bot uses in-memory fallback storage and logs a warning.

REMINDER_CHECK_MS
Required: no.
Used for: reminder scheduler interval.
Default: 60000.
Minimum safe value used by code: 10000.

Setup and run

1) Install dependencies with npm install.
2) Copy .env.sample to .env.
3) Set TELEGRAM_BOT_TOKEN.
4) Optionally set MONGODB_URI for persistence.
5) Run npm run dev locally or npm start in production.

Deployment notes

Use one Node.js service process.

Build command: npm run build.
Start command: npm start.

The bot uses Telegram long polling with @grammyjs/runner. On startup it clears existing webhooks with drop_pending_updates and retries polling failures with backoff.

Database notes

MongoDB collections are created on demand. Indexes are created safely at boot for application fields only. The code does not create or modify the MongoDB _id index.

Collections used: users, progress, bookmarks, quizAttempts, reminders, and memory_messages.
