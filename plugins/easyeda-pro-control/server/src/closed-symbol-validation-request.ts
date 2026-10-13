/** Internal request parser. Scope attestation is not technical execution authority. */
export interface ClosedSymbolValidationRequest {
  readonly action: "run-disposable-once";
  readonly target: Readonly<{ projectPath: string; projectUuid: string; branchUuid: string; ownerUuid: string; symbolUuid: string; companionPcbUuid: string }>;
  readonly metadata: Readonly<{ name: string; description: string }>;
  readonly confirmDisposableMetadataEdit: true;
}

export function requireValue(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }
export function exactData(input: unknown, keys: readonly string[]): Record<string, unknown> {
  requireValue(input !== null && typeof input === "object" && (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null), "Validation requires plain own-data objects.");
  requireValue(Reflect.ownKeys(input).length === keys.length, "Validation object has missing or extra fields.");
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const item = Object.getOwnPropertyDescriptor(input, key);
    requireValue(item !== undefined && Object.hasOwn(item, "value") && item.enumerable === true, "Validation requires enumerable own-data fields.");
    result[key] = item.value as unknown;
  }
  return result;
}
export function boundedText(input: unknown, maximum: number, minimum = 0): string {
  requireValue(typeof input === "string" && input.length >= minimum && input.length <= maximum && input.isWellFormed(), "Validation string bounds or Unicode refused.");
  return input;
}
export function hashText(input: unknown): string {
  const value = boundedText(input, 64, 64);
  requireValue(/^[a-f0-9]{64}$/u.test(value), "Validation hash refused.");
  return value;
}
function uuid(input: unknown, project = false): string {
  const value = boundedText(input, project ? 64 : 32, 32);
  requireValue((project ? /^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u : /^[a-f0-9]{32}$/u).test(value), "Validation UUID must be canonical lowercase hexadecimal.");
  return value;
}
export function parseClosedSymbolValidationRequest(input: unknown): ClosedSymbolValidationRequest {
  const value = exactData(input, ["action", "target", "metadata", "confirmDisposableMetadataEdit"]);
  requireValue(value["action"] === "run-disposable-once" && value["confirmDisposableMetadataEdit"] === true, "Validation requires the fixed disposable metadata scope attestation.");
  const target = exactData(value["target"], ["projectPath", "projectUuid", "branchUuid", "ownerUuid", "symbolUuid", "companionPcbUuid"]);
  const projectPath = boundedText(target["projectPath"], 2058, 1);
  requireValue(/^(?:\/|[A-Za-z]:[\\/])[^\0\r\n]{1,2048}\.eprj2$/u.test(projectPath), "Validation requires a bounded absolute project path.");
  const companionPcbUuid = uuid(target["companionPcbUuid"]), symbolUuid = uuid(target["symbolUuid"]);
  requireValue(symbolUuid !== companionPcbUuid, "Validation symbol and companion PCB must differ.");
  const metadata = exactData(value["metadata"], ["name", "description"]);
  const result: ClosedSymbolValidationRequest = Object.freeze({ action: "run-disposable-once",
    target: Object.freeze({ projectPath, projectUuid: uuid(target["projectUuid"], true), branchUuid: uuid(target["branchUuid"]), ownerUuid: uuid(target["ownerUuid"]), symbolUuid, companionPcbUuid }),
    metadata: Object.freeze({ name: boundedText(metadata["name"], 512, 1), description: boundedText(metadata["description"], 65_536) }), confirmDisposableMetadataEdit: true });
  requireValue(Buffer.byteLength(JSON.stringify(result)) <= 32_768, "Validation request exceeds 32768 UTF-8 JSON bytes.");
  return result;
}
