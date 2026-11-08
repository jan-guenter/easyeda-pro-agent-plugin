/** A single fixed native-equivalent notification cancellation. The original
 * consumed Modify intent, held ticket return and native function metadata are
 * Core prerequisites; this source string cannot issue any of them. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceModifyTicketSource } from "./current-schematic-relevance-modify-ticket-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE as WORKER_SOURCE } from "./current-schematic-relevance-modify-worker-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_PROGRAMS as TICKET } from "./current-schematic-relevance-modify-ticket-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_PROGRAMS as WORKER } from "./current-schematic-relevance-modify-worker-programs.ts";

/** Derive only from the unchanged complete descriptor comparator. Core must
 * first prove the source-created timer delta, retain that exact fresh snapshot,
 * and reprove it here before the native call and sole own-data assignment.
 * The separate post-call delta must prove all peers unchanged before use. */
function cancellation(): string {
  const signature = "function(snapshot,qualified){"; const ending = "return true;}"; const nativeStart = "dense(natives,3);";
  if (!WORKER.same.startsWith(signature) || !WORKER.same.endsWith(ending) || TICKET.nativeProof.split(nativeStart).length !== 2 || !TICKET.nativeProof.endsWith(ending)) { throw new Error("SCH_MODIFY_TICKET_CANCEL_DERIVATION"); }
  const native = TICKET.nativeProof.slice(TICKET.nativeProof.indexOf(nativeStart), -ending.length);
  const prefix = WORKER.same.slice(signature.length, -ending.length);
  return `function(snapshot,qualified,project,natives){${prefix}known(project);if(own(root,"PROJECT")!==project)bad();${native}const d=get(project,"publishTimer");if(!d||!has(d,"value")||!d.writable)bad();const timer=d.value;if(typeof timer!=="number"||timer<=0||timer>2147483647||timer%1!==0)bad();if(invoke(clear,root,[timer])!==undefined)bad();project.publishTimer=null;if(own(project,"publishTimer")!==null)bad();return timer;}`;
}
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_CANCEL_PROGRAM = cancellation();

/** Count only the pinned spelling; the complete worker hash binds its syntax. */
function references(text: string): number { return text.split("publishTimer").length - 1; }

/** Bind the notification-only scope to all complete worker bytes. Its only
 * field references are the constructor's null initialization and this exact
 * synchronous method/arrow; no worker Promise or persistence method reads it.
 * Core must additionally retain the original parked SDK wait and preserve the
 * distinct canvas publishTask Promise before authorizing the once-only call. */
export function qualifyCurrentSchematicRelevanceModifyTicketCancellationScope(source: string): void {
  qualifyCurrentSchematicRelevanceModifyTicketSource(source);
  const local = SOURCE.localPublishTicket;
  const constructor = WORKER_SOURCE.roles.projectConstructor;
  const classSource = source.slice(constructor.start, constructor.end);
  const initialization = "this.publishTimer=null;this.publishTask=new Set";
  if (classSource.split(initialization).length !== 2 || references(source) !== references(local.source) + 1 || references(classSource) !== references(source) || local.source.includes("Promise") || local.source.includes("publishTask") || local.source.includes("await") || !SOURCE.timerCallback.source.includes('this.workerBus.publish("/pro-mgr/project/ticket",')) { throw new Error("SCH_MODIFY_TICKET_CANCEL_SCOPE"); }
}
