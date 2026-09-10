import { InlineKeyboard } from "grammy";
import { getProgress } from "../lib/db.js";
import { formatPlanStatus, getPlan, listPlans, planKeyboard } from "../services/contentService.js";

export default function register(bot) {
  bot.command("plan", async (ctx) => {
    const progress = await getProgress(ctx.from?.id);

    if (progress.activePlanId) {
      const active = getPlan(progress.activePlanId);
      if (active) {
        const keyboard = new InlineKeyboard()
          .text("Mark day complete", `plan:done:${active.id}`)
          .row()
          .text("Choose another plan", "plan:open");
        await ctx.reply(formatPlanStatus(active, progress), { reply_markup: keyboard });
        return;
      }
    }

    await ctx.reply([
      "Choose a reading plan:",
      "",
      ...listPlans().map((plan) => `${plan.title}: ${plan.description}`)
    ].join("\n"), {
      reply_markup: planKeyboard()
    });
  });
}
