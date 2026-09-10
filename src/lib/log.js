export function safeErr(err) {
  return err?.response?.data?.error?.message ||
    err?.response?.data?.message ||
    err?.message ||
    String(err);
}

function write(level, msg, meta = {}) {
  const line = JSON.stringify({
    level,
    msg,
    ...meta,
    ts: new Date().toISOString()
  });

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (msg, meta = {}) => write("info", msg, meta),
  warn: (msg, meta = {}) => write("warn", msg, meta),
  error: (msg, meta = {}) => write("error", msg, meta)
};
