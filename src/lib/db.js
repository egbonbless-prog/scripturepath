import { MongoClient } from "mongodb";
import { cfg } from "./config.js";
import { log, safeErr } from "./log.js";

let client = null;
let db = null;
let missingMongoWarned = false;

const memory = {
  users: new Map(),
  progress: new Map(),
  bookmarks: new Map(),
  quizAttempts: [],
  reminders: new Map(),
  memoryMessages: []
};

function id(value) {
  return String(value || "");
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function cleanMutable(obj) {
  const out = { ...(obj || {}) };
  delete out._id;
  delete out.createdAt;
  return out;
}

export function getMemoryStore() {
  return memory;
}

export async function getDb() {
  if (!cfg.MONGODB_URI) {
    if (!missingMongoWarned) {
      missingMongoWarned = true;
      log.warn("mongodb disabled", { reason: "MONGODB_URI missing; using in-memory fallback" });
    }
    return null;
  }

  if (db) return db;

  try {
    client = new MongoClient(cfg.MONGODB_URI, {
      maxPoolSize: 5,
      ignoreUndefined: true
    });
    await client.connect();
    db = client.db();
    log.info("mongodb connected", { mongodbUriSet: true });
    return db;
  } catch (err) {
    log.error("mongodb connect failed", { err: safeErr(err) });
    return null;
  }
}

export async function initDb() {
  const database = await getDb();
  if (!database) return;

  try {
    await Promise.all([
      database.collection("users").createIndex({ telegramUserId: 1 }, { unique: true }),
      database.collection("progress").createIndex({ telegramUserId: 1 }, { unique: true }),
      database.collection("bookmarks").createIndex({ telegramUserId: 1, createdAt: -1 }),
      database.collection("quizAttempts").createIndex({ telegramUserId: 1, completedAt: -1 }),
      database.collection("reminders").createIndex({ enabled: 1, timeLocal: 1 }),
      database.collection("memory_messages").createIndex({ platform: 1, userId: 1, chatId: 1, ts: -1 })
    ]);
    log.info("mongodb indexes ready");
  } catch (err) {
    log.error("mongodb index failed", { collection: "multiple", operation: "createIndex", err: safeErr(err) });
  }
}

export async function saveUserProfile(from) {
  if (!from?.id) return;
  const telegramUserId = id(from.id);
  const mutable = cleanMutable({
    telegramUserId,
    username: from.username || "",
    firstName: from.first_name || "",
    languageCode: from.language_code || ""
  });
  const now = new Date();
  const database = await getDb();

  if (!database) {
    const prev = memory.users.get(telegramUserId) || { createdAt: now };
    memory.users.set(telegramUserId, { ...prev, ...mutable, updatedAt: now });
    return;
  }

  try {
    await database.collection("users").updateOne(
      { telegramUserId },
      {
        $setOnInsert: { createdAt: now },
        $set: { ...mutable, updatedAt: now }
      },
      { upsert: true }
    );
  } catch (err) {
    log.error("db write failed", { collection: "users", operation: "updateOne", err: safeErr(err) });
  }
}

export async function updateUserPreferences(telegramUserId, fields) {
  const key = id(telegramUserId);
  const mutable = cleanMutable(fields);
  const now = new Date();
  const database = await getDb();

  if (!database) {
    const prev = memory.users.get(key) || { telegramUserId: key, };
    memory.users.set(key, { ...prev, ...mutable, updatedAt: now });
    return;
  }

  try {
    await database.collection("users").updateOne(
      { telegramUserId: key },
      {
        $setOnInsert: { createdAt: now },
        $set: { ...mutable, updatedAt: now }
      },
      { upsert: true }
    );
  } catch (err) {
    log.error("db write failed", { collection: "users", operation: "updateUserPreferences", err: safeErr(err) });
  }
}

function defaultProgress(telegramUserId) {
  return {
    telegramUserId: id(telegramUserId),
    completedLessons: [],
    activePlanId: "",
    currentPlanDay: 0,
    completedReadings: [],
    streakCount: 0,
    lastActivityAt: null,
    quizStats: {
      attempts: 0,
      totalScore: 0
    }
  };
}

export async function getProgress(telegramUserId) {
  const key = id(telegramUserId);
  const database = await getDb();

  if (!database) {
    return memory.progress.get(key) || defaultProgress(key);
  }

  try {
    const row = await database.collection("progress").findOne({ telegramUserId: key });
    return row || defaultProgress(key);
  } catch (err) {
    log.error("db read failed", { collection: "progress", operation: "findOne", err: safeErr(err) });
    return defaultProgress(key);
  }
}

export async function updateProgress(telegramUserId, fields) {
  const key = id(telegramUserId);
  const mutable = cleanMutable(fields);
  const now = new Date();
  const database = await getDb();

  if (!database) {
    const prev = memory.progress.get(key) || { ...defaultProgress(key), };
    memory.progress.set(key, { ...prev, ...mutable, updatedAt: now });
    return;
  }

  try {
    await database.collection("progress").updateOne(
      { telegramUserId: key },
      {
        $setOnInsert: { createdAt: now },
        $set: { ...mutable, updatedAt: now }
      },
      { upsert: true }
    );
  } catch (err) {
    log.error("db write failed", { collection: "progress", operation: "updateOne", err: safeErr(err) });
  }
}

export async function markLessonComplete(telegramUserId, lessonId) {
  const key = id(telegramUserId);
  const now = new Date();
  const database = await getDb();

  if (!database) {
    const prev = memory.progress.get(key) || { ...defaultProgress(key), };
    const completedLessons = Array.from(new Set([...(prev.completedLessons || []), lessonId]));
    memory.progress.set(key, { ...prev, completedLessons, lastActivityAt: now, updatedAt: now });
    return;
  }

  try {
    await database.collection("progress").updateOne(
      { telegramUserId: key },
      {
        $setOnInsert: { createdAt: now },
        $addToSet: { completedLessons: lessonId },
        $set: { lastActivityAt: now, updatedAt: now }
      },
      { upsert: true }
    );
  } catch (err) {
    log.error("db write failed", { collection: "progress", operation: "markLessonComplete", err: safeErr(err) });
  }
}

export async function addBookmark(telegramUserId, bookmark) {
  const key = id(telegramUserId);
  const doc = {
    telegramUserId: key,
    verseReference: String(bookmark.verseReference || ""),
    note: String(bookmark.note || "").slice(0, 1000),
    lessonId: String(bookmark.lessonId || ""),
    };
  const database = await getDb();

  if (!database) {
    const rows = memory.bookmarks.get(key) || [];
    rows.unshift(doc);
    memory.bookmarks.set(key, rows.slice(0, 50));
    return;
  }

  try {
    await database.collection("bookmarks").insertOne(doc);
  } catch (err) {
    log.error("db write failed", { collection: "bookmarks", operation: "insertOne", err: safeErr(err) });
  }
}

export async function listBookmarks(telegramUserId, limit = 10) {
  const key = id(telegramUserId);
  const database = await getDb();

  if (!database) return (memory.bookmarks.get(key) || []).slice(0, limit);

  try {
    return await database.collection("bookmarks")
      .find({ telegramUserId: key })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  } catch (err) {
    log.error("db read failed", { collection: "bookmarks", operation: "find", err: safeErr(err) });
    return [];
  }
}

export async function saveQuizAttempt(telegramUserId, quizId, answers, score) {
  const key = id(telegramUserId);
  const doc = {
    telegramUserId: key,
    quizId,
    answers,
    score,
    completedAt: new Date()
  };
  const database = await getDb();

  if (!database) {
    memory.quizAttempts.push(doc);
    const progress = memory.progress.get(key) || defaultProgress(key);
    const quizStats = progress.quizStats || { attempts: 0, totalScore: 0 };
    await updateProgress(key, {
      quizStats: {
        attempts: quizStats.attempts + 1,
        totalScore: quizStats.totalScore + score
      },
      lastActivityAt: new Date()
    });
    return;
  }

  try {
    await database.collection("quizAttempts").insertOne(doc);
    const progress = await getProgress(key);
    const quizStats = progress.quizStats || { attempts: 0, totalScore: 0 };
    await updateProgress(key, {
      quizStats: {
        attempts: Number(quizStats.attempts || 0) + 1,
        totalScore: Number(quizStats.totalScore || 0) + score
      },
      lastActivityAt: new Date()
    });
  } catch (err) {
    log.error("db write failed", { collection: "quizAttempts", operation: "insertOne", err: safeErr(err) });
  }
}

export async function setReminder(telegramUserId, chatId, timeLocal) {
  const key = id(telegramUserId);
  const mutable = cleanMutable({
    telegramUserId: key,
    chatId: id(chatId),
    enabled: true,
    timeLocal,
    timezone: "server-local",
    frequency: "daily"
  });
  const now = new Date();
  const database = await getDb();

  if (!database) {
    const prev = memory.reminders.get(key) || { createdAt: now };
    memory.reminders.set(key, { ...prev, ...mutable, updatedAt: now });
    return;
  }

  try {
    await database.collection("reminders").updateOne(
      { telegramUserId: key },
      {
        $setOnInsert: { createdAt: now },
        $set: { ...mutable, updatedAt: now }
      },
      { upsert: true }
    );
  } catch (err) {
    log.error("db write failed", { collection: "reminders", operation: "setReminder", err: safeErr(err) });
  }
}

export async function disableReminder(telegramUserId) {
  const key = id(telegramUserId);
  const now = new Date();
  const database = await getDb();

  if (!database) {
    const prev = memory.reminders.get(key) || { telegramUserId: key, };
    memory.reminders.set(key, { ...prev, enabled: false, updatedAt: now });
    return;
  }

  try {
    await database.collection("reminders").updateOne(
      { telegramUserId: key },
      {
        $setOnInsert: { createdAt: now },
        $set: { enabled: false, updatedAt: now }
      },
      { upsert: true }
    );
  } catch (err) {
    log.error("db write failed", { collection: "reminders", operation: "disableReminder", err: safeErr(err) });
  }
}

export async function getDueReminders(now = new Date()) {
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const dueTime = `${hh}:${mm}`;
  const today = todayKey(now);
  const database = await getDb();

  const dueFilter = (r) => r.enabled && r.timeLocal === dueTime && todayKey(r.lastSentAt || new Date(0)) !== today;

  if (!database) return Array.from(memory.reminders.values()).filter(dueFilter);

  try {
    const rows = await database.collection("reminders")
      .find({ enabled: true, timeLocal: dueTime })
      .limit(100)
      .toArray();
    return rows.filter(dueFilter);
  } catch (err) {
    log.error("db read failed", { collection: "reminders", operation: "getDueReminders", err: safeErr(err) });
    return [];
  }
}

export async function markReminderSent(telegramUserId) {
  const key = id(telegramUserId);
  const now = new Date();
  const database = await getDb();

  if (!database) {
    const prev = memory.reminders.get(key);
    if (prev) memory.reminders.set(key, { ...prev, lastSentAt: now, updatedAt: now });
    return;
  }

  try {
    await database.collection("reminders").updateOne(
      { telegramUserId: key },
      { $set: { lastSentAt: now, updatedAt: now } }
    );
  } catch (err) {
    log.error("db write failed", { collection: "reminders", operation: "markReminderSent", err: safeErr(err) });
  }
}

export async function saveMemoryTurn({ userId, chatId, role, text }) {
  const doc = {
    platform: "telegram",
    userId: id(userId),
    chatId: id(chatId),
    role,
    text: String(text || "").slice(0, 4000),
    ts: new Date()
  };
  const database = await getDb();

  if (!database) {
    memory.memoryMessages.push(doc);
    if (memory.memoryMessages.length > 5000) memory.memoryMessages.shift();
    return;
  }

  try {
    await database.collection("memory_messages").insertOne(doc);
  } catch (err) {
    log.error("db write failed", { collection: "memory_messages", operation: "insertOne", err: safeErr(err) });
  }
}

export async function clearUserData(telegramUserId) {
  const key = id(telegramUserId);
  const database = await getDb();

  if (!database) {
    memory.users.delete(key);
    memory.progress.delete(key);
    memory.bookmarks.delete(key);
    memory.reminders.delete(key);
    memory.quizAttempts = memory.quizAttempts.filter((q) => q.telegramUserId !== key);
    memory.memoryMessages = memory.memoryMessages.filter((m) => m.userId !== key);
    return;
  }

  try {
    await Promise.all([
      database.collection("users").deleteMany({ telegramUserId: key }),
      database.collection("progress").deleteMany({ telegramUserId: key }),
      database.collection("bookmarks").deleteMany({ telegramUserId: key }),
      database.collection("quizAttempts").deleteMany({ telegramUserId: key }),
      database.collection("reminders").deleteMany({ telegramUserId: key }),
      database.collection("memory_messages").deleteMany({ platform: "telegram", userId: key })
    ]);
  } catch (err) {
    log.error("db write failed", { collection: "multiple", operation: "clearUserData", err: safeErr(err) });
  }
}
