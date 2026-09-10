import { Bot, session } from "grammy";

export function createBot(token) {
  const bot = new Bot(token);

  bot.use(session({
    initial: () => ({
      store: {}
    })
  }));

  bot.use(async (ctx, next) => {
    ctx.session.store ??= {};
    await next();
  });

  return bot;
}
