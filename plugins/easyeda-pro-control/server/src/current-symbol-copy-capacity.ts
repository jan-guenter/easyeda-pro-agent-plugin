/** Pre-dispatch upper bounds for the fixed copy reader. Size placeholders are
 * never destination identities, native observations or persistence evidence.
 */
import { currentSymbolCopySourceRows } from "./current-symbol-copy-plan.ts";
import type { CurrentSymbolCopyPlan } from "./current-symbol-copy-plan.ts";
import { reserveCurrentSymbolCopySavedProgramCapacity } from "./current-symbol-copy-saved-read-program.ts";
import { CURRENT_SAVED_SYMBOL_CONTENT_LIMIT, CURRENT_SAVED_SYMBOL_ENVELOPE_LIMIT } from "./current-symbol-saved-read-program.ts";
import type { CurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";
import { ACTOR_NAME_MAX_CODE_UNITS } from "./symbol-dual-actor.ts";
import type { ActorProjection } from "./symbol-dual-actor.ts";

export function reserveCurrentSymbolCopySavedReadCapacity(original: CurrentSymbolCopyPlan, expectedActor: ActorProjection,
  startup: CurrentSymbolStartupExpectation): Readonly<{ maximumContentBytes: number; maximumEnvelopeBytes: number }> {
  // Obtaining rows also requires the original plan and completed SQL reader.
  const rows = currentSymbolCopySourceRows(original), stamp = 8_640_000_000_000_000, uuid = "0".repeat(16);
  reserveCurrentSymbolCopySavedProgramCapacity(original, expectedActor, startup);
  const wanted = original.destinationMetadata;
  const target = { projectUuid: original.source.projectUuid, branchUuid: original.source.branchUuid,
    ownerUuid: original.ownerUuid, symbolUuid: uuid };
  const expectedBefore = { name: wanted.title, description: wanted.description, tagsJson: JSON.stringify(wanted.tags),
    source: "", version: String(stamp), ticket: original.metadataTicket };
  const request = { target, expectedBefore, expectedActor, maximumTicket: original.canvasHeaderTicket, startup };
  if (Buffer.byteLength(JSON.stringify(request)) > 262_144) { throw new Error("CURRENT_SYMBOL_COPY_SAVED_REQUEST_CAPACITY"); }
  /* Each NUL expands to six ASCII bytes in the header JSON, seven in the
   * result JSON and nine in its envelope. These bounds dominate every admitted
   * UTF-16 name unit, including quotes, backslashes and supplementary Unicode. */
  const longestName = "\0".repeat(ACTOR_NAME_MAX_CODE_UNITS);
  const actors = [{ uuid: "0".repeat(32), username: longestName, nickname: longestName }, { uuid }];
  let maximumContentBytes = 0, maximumEnvelopeBytes = 0;
  for (const user of actors) {
    const header = (ticket: number): string => `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({
      docType: "SYMBOL", client: uuid, uuid, updateTime: stamp, version: String(stamp), editVersion: "3.2.206", user })}`;
    // Fresh copied atoms have one occurrence and therefore no firstTicket.
    // Equal creation clocks select M+1 instead; M+2 is no shorter in decimal.
    const content = [header(original.exportedHeaderTicket),
      `${JSON.stringify({ type: "META", ticket: original.metadataTicket, id: "META" })}||${JSON.stringify(wanted)}`,
      header(original.canvasHeaderTicket), ...rows].join("|\n");
    const result = { profile: "private.current-symbol-copy-saved-read-observation.v1", target, expectedBefore, expectedActor,
      observation: { profile: "private.saved-symbol-content-observation.v1", projectUuid: target.projectUuid, targetUuid: uuid,
        maximumTicket: original.canvasHeaderTicket, workerClient: uuid, content,
        executionAuthorized: false, producerBindingVerified: false, completionProved: false },
      samples: 2, noEditorTabsObserved: true, mutationDispatched: false, explicitSaveDispatched: false, executionAuthorized: false };
    const json = JSON.stringify(result), utf8Bytes = Buffer.byteLength(json);
    const envelopeBytes = Buffer.byteLength(JSON.stringify({ schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes, json }));
    maximumContentBytes = Math.max(maximumContentBytes, Buffer.byteLength(content));
    maximumEnvelopeBytes = Math.max(maximumEnvelopeBytes, utf8Bytes, envelopeBytes);
  }
  if (maximumContentBytes > CURRENT_SAVED_SYMBOL_CONTENT_LIMIT || maximumEnvelopeBytes > CURRENT_SAVED_SYMBOL_ENVELOPE_LIMIT) {
    throw new Error("CURRENT_SYMBOL_COPY_SAVED_READ_CAPACITY");
  }
  return Object.freeze({ maximumContentBytes, maximumEnvelopeBytes });
}
