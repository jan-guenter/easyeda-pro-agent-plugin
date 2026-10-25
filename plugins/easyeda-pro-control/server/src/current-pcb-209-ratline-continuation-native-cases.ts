/** Separate finite syntax for a fresh three-realm continuation launch. Existing
 * held-import cases retain their original role set and action vocabulary. */
import { CURRENT_PCB_209_RATLINE_NATIVE_CASES } from "./current-pcb-209-ratline-native-cases.ts";
import type { CurrentPcb209RatlineNativeCommand } from "./current-pcb-209-ratline-native-cases.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export { currentPcb209RatlineNativePlaceholder as currentPcb209RatlineContinuationNativePlaceholder } from "./current-pcb-209-ratline-native-cases.ts";
export type CurrentPcb209RatlineContinuationNativeRole = "pcb" | "worker" | "subordinate";
export type CurrentPcb209RatlineContinuationNativeCommand = CurrentPcb209RatlineNativeCommand;
export interface CurrentPcb209RatlineContinuationNativeCase {
  readonly role: CurrentPcb209RatlineContinuationNativeRole;
  readonly phase: string;
  readonly command: CurrentPcb209RatlineContinuationNativeCommand;
}
const subordinate = CURRENT_PCB_209_RATLINE_NATIVE_CASES.filter(entry => entry.role === "worker" &&
  (entry.phase.startsWith("bootstrap-") || entry.phase === "remove" || entry.phase === "resume"));
export const CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_CASES: readonly CurrentPcb209RatlineContinuationNativeCase[] = freezeDeep([
  ...CURRENT_PCB_209_RATLINE_NATIVE_CASES.filter(entry => entry.phase !== "relation-construction"),
  ...subordinate.map(entry => ({ command: entry.command, phase: entry.phase, role: "subordinate" as const })),
]);
