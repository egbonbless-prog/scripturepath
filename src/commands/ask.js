import { saveMemoryTurn } from "../lib/db.js";
import { searchContent } from "../services/contentService.js";

export default function register(bot) {
  bot.command("ask", async (ctx) => {
    const raw = ctx.message?.text || "";
    const question = raw.replace(/^\/ask(@\w+)?/i, "").trim();

    if (!question) {
      await ctx.reply("Ask a Bible study question after the command. Example: /ask What does grace mean in Ephesians 2?");
      return;
    }

    await saveMemoryTurn({
      userId: ctx.from?.id,
      chatId: ctx.chat?.id,
      role: "user",
      text: question
    });

    const matches = searchContent(question);
    let answer = "I could not find a strong match in the built-in lesson library yet. Try asking about grace, prayer, wisdom, forgiveness, Jesus, John, Proverbs, or Romans.";

    if (matches.length) {
      const primary = matches[0];
      answer = [
        `Question: ${question}`,
        "",
        `Relevant passage: ${primary.passage}`,
        "",
        `Short answer: ${primary.summary}`,
        "",
        `Explanation: ${primary.explanation}`,
        "",
        `Application: ${primary.application}`,
        "",
        "Note: Scripture focus, explanation, and application are separated here. For debated topics, compare passages carefully and consider trusted teachers in your church tradition."
      ].join("\n");
    }

    await saveMemoryTurn({
      userId: ctx.from?.id,
      chatId: ctx.chat?.id,
      role: "assistant",
      text: answer
    });

    await ctx.reply(answer);
  });
}
