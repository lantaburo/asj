type LogLevel = "info" | "warn" | "error";

type LogPayload = {
  message: string;
  scope?: string;
  meta?: Record<string, unknown>;
  error?: unknown;
};

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return error;
}

function writeLog(level: LogLevel, payload: LogPayload) {
  const entry = {
    level,
    service: "ajs-k3-system",
    time: new Date().toISOString(),
    scope: payload.scope ?? "app",
    message: payload.message,
    meta: payload.meta ?? null,
    error: payload.error ? serializeError(payload.error) : null
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const logger = {
  info(payload: LogPayload) {
    writeLog("info", payload);
  },
  warn(payload: LogPayload) {
    writeLog("warn", payload);
  },
  error(payload: LogPayload) {
    writeLog("error", payload);
  }
};
