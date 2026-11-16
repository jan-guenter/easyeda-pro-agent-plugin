/* oxlint-disable import/max-dependencies -- This full-purpose wire composes independently fixed producer, cache, sync and frontier grammars without combining their owner ledgers. */
/** The genuine full channel supplies its own worker session/context. Native
 * input carries fixed case identifiers and original scalar handles only. */
import { currentProjectSaveProducerTemplate } from "./current-project-save-producer-wire.ts";
import { validateCurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import { validateCurrentProjectSaveProducerGuardCommand } from "./current-project-save-producer-guard-protocol.ts";
import type { CurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import type { CurrentProjectSaveProducerGuardCommand } from "./current-project-save-producer-guard-protocol.ts";
import { currentFootprintForwardWriterProfile } from "./current-footprint-forward-writer-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentFootprintInverseInitialCacheTemplate } from "./current-footprint-inverse-initial-cache-wire.ts";
import { validateCurrentFootprintInverseInitialCacheCommand } from "./current-footprint-inverse-initial-cache-protocol.ts";
import type { CurrentFootprintInverseInitialCacheCommand } from "./current-footprint-inverse-initial-cache-protocol.ts";
import { currentFootprintInverseInitialSyncTemplate } from "./current-footprint-inverse-initial-sync-wire.ts";
import { validateCurrentFootprintInverseInitialSyncNativeCommand } from "./current-footprint-inverse-initial-sync-protocol.ts";
import type { CurrentFootprintInverseInitialSyncCommand } from "./current-footprint-inverse-initial-sync-protocol.ts";
import { currentFootprintForwardWriterFrontierTemplate } from "./current-footprint-forward-writer-frontier-protocol.ts";
import type { CurrentFootprintForwardWriterFrontierChannelCommand } from "./current-footprint-forward-writer-frontier-protocol.ts";
import { z } from "zod";

export type CurrentFootprintForwardWriterProducerChannelCommand = (CurrentProjectSaveProducerCommand | CurrentProjectSaveProducerGuardCommand | CurrentFootprintInverseInitialCacheCommand | CurrentFootprintInverseInitialSyncCommand | CurrentFootprintForwardWriterFrontierChannelCommand) & Readonly<{ sessionId: string }>;
/** Project only an original fixed producer command into the new native action. */
export function currentFootprintForwardWriterProducerWire(input: unknown, id: number, sessionId: string): Readonly<{
  command: CurrentFootprintForwardWriterProducerChannelCommand & Readonly<{ id: number }>;
  request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > currentFootprintForwardWriterProfile().renderer.requestLimit || !/^[A-Za-z\d_.:-]{1,256}$/u.test(sessionId)) { throw new Error("FORWARD_WRITER_PRODUCER_WIRE"); }
  const inert = captureCurrentPcbStringClockReply(input).value;
  if (inert !== null && typeof inert === "object" && Object.hasOwn(inert, "forwardStartupFrontier")) {
    const { forwardStartupFrontier, ...command } = z.record(z.string(), z.unknown()).parse(inert);
    const row = currentFootprintForwardWriterFrontierTemplate({ phase: "forward-startup-frontier", lane: forwardStartupFrontier, command });
    return freezeDeep({ command: { ...row.command.command, forwardStartupFrontier: row.lane, sessionId, id },
      request: { action: "footprint-forward-startup-frontier-send", requestId: id, lane: row.lane, phase: row.phase, method: row.method, ...row.values } });
  }
  const phase: unknown = inert !== null && typeof inert === "object" ? Object.getOwnPropertyDescriptor(inert, "phase")?.value : null;
  if (typeof phase === "string" && phase.startsWith("inverse-initial-cache-")) {
    const fixed = validateCurrentFootprintInverseInitialCacheCommand(inert);
    if (fixed.phase === "inverse-initial-cache-helper") { throw new Error("FORWARD_WRITER_CACHE_HELPER_UNMOUNTED"); }
    const row = currentFootprintInverseInitialCacheTemplate(fixed);
    return freezeDeep({ command: { ...fixed, sessionId, id }, request: { action: "footprint-forward-initial-cache-send", requestId: id, phase: row.phase, method: row.method, ...row.values } });
  }
  if (typeof phase === "string" && phase.startsWith("inverse-initial-sync-")) {
    const fixed = validateCurrentFootprintInverseInitialSyncNativeCommand(inert);
    if (fixed.phase === "inverse-initial-sync-helper") { throw new Error("FORWARD_WRITER_SYNC_HELPER_UNMOUNTED"); }
    const row = currentFootprintInverseInitialSyncTemplate(fixed);
    return freezeDeep({ command: { ...fixed, sessionId, id }, request: { action: "footprint-forward-initial-sync-send", requestId: id, phase: row.phase, method: row.method, ...row.values } });
  }
  const command = validate(input);
  if (command.phase === "project-save-producer-guard") {
    return freezeDeep({ command: { ...command, sessionId, id }, request: { action: "footprint-forward-producer-guard", requestId: id,
      phase: `${command.phase}-${command.role}`, method: command.method, scriptId: command.params.location.scriptId } });
  }
  const row = currentProjectSaveProducerTemplate(command);
  return freezeDeep({ command: { ...command, sessionId, id }, request: { action: "footprint-forward-producer-observe", requestId: id,
    phase: row.phase, method: row.method, ...row.values } });
}
/** Decode inert own data before inspecting the disjoint fixed phase label. */
function validate(input: unknown): CurrentProjectSaveProducerCommand | CurrentProjectSaveProducerGuardCommand {
  const value = captureCurrentPcbStringClockReply(input).value;
  return value !== null && typeof value === "object" && Object.getOwnPropertyDescriptor(value, "phase")?.value === "project-save-producer-guard" ?
    validateCurrentProjectSaveProducerGuardCommand(value) : validateCurrentProjectSaveProducerCommand(value);
}
