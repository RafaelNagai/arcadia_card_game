/** JSON.stringify loses Infinity (serializes to null) — config.chainDepth can legitimately be Infinity, so preserve it as a readable sentinel. */
export function telemetryToJson(telemetry: unknown, pretty = true): string {
  return JSON.stringify(telemetry, jsonReplacer, pretty ? 2 : undefined);
}

function jsonReplacer(_key: string, value: unknown): unknown {
  return value === Infinity ? 'Infinity' : value;
}
