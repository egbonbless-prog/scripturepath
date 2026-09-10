import { addBookmark, listBookmarks } from "../lib/db.js";

export default function register(bot) {
  bot.command("bookmarks", async (ctx) => {
    const raw = ctx.message?.text || "";
    const args = raw.replace(/^\/bookmarks(@\w+)?/i, "").trim();

    if (args.toLowerCase().startsWith("add ")) {
      const payload = args.slice(4).trim();
      const [reference, ...noteParts] = payload.split("|");
      const verseReference = String(reference || "").trim();
      const note = noteParts.join("|").trim();

      if (!verseReference) {
        await ctx.reply("Use this format: /bookmarks add John 3:16 | optional note");
        return;
      }

      await addBookmark(ctx.from.id, { verseReference, note, lessonId: "" });
      await ctx.reply("Bookmark saved.");
      return;
    }

    const rows = await listBookmarks(ctx.from.id, 10);
    if (!rows.length) {
      await ctx.reply("You do not have bookmarks yet. Use a lesson bookmark button, or try /bookmarks add John 3:16 | God's love.");
      return;
    }

    await ctx.reply([
      "Your recent bookmarks:",
      "",
      ...rows.map((row, index) => `${index + 1}) ${row.verseReference}${row.note ? ` — ${row.note}` : ""}`)
    ].join("\n"));
  });
}
