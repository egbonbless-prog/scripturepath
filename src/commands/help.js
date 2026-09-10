import { commandHelpText } from "../services/contentService.js";

export default function register(bot) {
  bot.command("help", async (ctx) => {
    await ctx.reply(commandHelpText());
  });
}
