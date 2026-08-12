export type TelemetryEvent = {
  name: string;
  at: string; // ISO timestamp
  requestId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields?: Record<string, any>;
};

/**
 * Emit structured telemetry.
 *
 * For v1 local development we emit JSON lines to stdout.
 * This keeps the "structured event as primitive telemetry" principle actionable
 * without introducing an observability backend dependency.
 */
export function emitTelemetry(event: Omit<TelemetryEvent, "at">): void {
  const payload: TelemetryEvent = {
    ...event,
    at: new Date().toISOString(),
  };
  console.log(JSON.stringify(payload));
}

