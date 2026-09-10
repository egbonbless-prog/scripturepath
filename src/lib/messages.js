export function chunkText(text, max = 3800) {
  const value = String(text || "");
  if (value.length <= max) return [value];

  const chunks = [];
  let rest = value;

  while (rest.length > max) {
    let cut = rest.lastIndexOf("\n", max);
    if (cut < 500) cut = rest.lastIndexOf(". ", max);
    if (cut < 500) cut = max;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  if (rest) chunks.push(rest);
  return chunks;
}

export async function replyLong(ctx, text, options = undefined) {
  const chunks = chunkText(text);
  for (let i = 0; i < chunks.length; i += 1) {
    await ctx.reply(chunks[i], i === chunks.length - 1 ? options : undefined);
  }
}
