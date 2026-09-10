import { formatBook, getBook, listBooks } from "../services/contentService.js";

export default function register(bot) {
  bot.command("books", async (ctx) => {
    const text = ctx.message?.text || "";
    const query = text.replace(/^\/books(@\w+)?/i, "").trim();

    if (query) {
      const book = getBook(query);
      if (!book) {
        await ctx.reply("I do not have that book summary yet. Try /books John, /books Genesis, or /books Romans.");
        return;
      }
      await ctx.reply(formatBook(book));
      return;
    }

    await ctx.reply([
      "Available book summaries:",
      "",
      listBooks().map((book) => book.name).join(", "),
      "",
      "Example: /books John"
    ].join("\n"));
  });
}
