/**
 * Structured JSON logger for server-side code.
 *
 * Outputs one JSON object per log line — compatible with Vercel's log drain,
 * Datadog, Sentry, and any structured logging pipeline.
 */

type Severity = "info" | "warn" | "error" | "critical";

interface LogEntry {
  severity: Severity;
  event: string;
  [key: string]: unknown;
}

function emit(entry: LogEntry) {
  const line = JSON.stringify({ ...entry, timestamp: new Date().toISOString() });
  if (entry.severity === "error" || entry.severity === "critical") {
    console.error(line);
  } else if (entry.severity === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const log = {
  info(event: string, data?: Record<string, unknown>) {
    emit({ severity: "info", event, ...data });
  },
  warn(event: string, data?: Record<string, unknown>) {
    emit({ severity: "warn", event, ...data });
  },
  error(event: string, data?: Record<string, unknown>) {
    emit({ severity: "error", event, ...data });
  },
  /** For alerts that need immediate attention (disputes, fulfillment failures). */
  critical(event: string, data?: Record<string, unknown>) {
    emit({ severity: "critical", event, ...data });
  },
};
