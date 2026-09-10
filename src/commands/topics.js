import { getTopicNames, topicKeyboard } from "../services/contentService.js";

export default function register(bot) {
  bot.command("topics", async (ctx) => {
    await ctx.reply([
      "Choose a Bible study topic:",
      "",
      getTopicNames().join(", ")
    ].join("\n"), {
      reply_markup: topicKeyboard()
    });
  });
}
