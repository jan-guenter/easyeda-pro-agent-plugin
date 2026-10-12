import { isRecord } from "./core.ts";

export const LEGACY_RECOVERY_FAMILY_REFUSAL = "Legacy recovery requires its original legacy mutation-plan shape without a profile. Use the owning typed tool for other journal families; do not navigate, Save or rewrite them through the legacy endpoint.";

/** State names overlap across coordinators. Require the maintained legacy
 * plan structure before authority recovery or target activation can run.
 * Existing legacy state, runtime and proof checks remain independent gates;
 * this is not the stricter current fresh-write plan validator.
 */
export function assertLegacyRecoveryJournalFamily(value: unknown): void {
  const plan = isRecord(value) ? value["plan"] : undefined;
  if (!isRecord(plan) || Object.hasOwn(plan, "profile") || !isRecord(plan["expectedContext"]) ||
      !isRecord(plan["expectedContext"]["project"]) || !isRecord(plan["expectedContext"]["document"]) ||
      !isRecord(plan["expectedFingerprint"]) || !isRecord(plan["applyCall"]) || !isRecord(plan["checkpoint"]) ||
      typeof plan["capabilityLevel"] !== "string" ||
      ["targetPrimitiveIds", "targetChanges", "preflightCalls", "verifyCalls", "rollbackCalls", "reopenedVerifyCalls"].some((key) => !Array.isArray(plan[key]))) {
    throw new Error(LEGACY_RECOVERY_FAMILY_REFUSAL);
  }
}
