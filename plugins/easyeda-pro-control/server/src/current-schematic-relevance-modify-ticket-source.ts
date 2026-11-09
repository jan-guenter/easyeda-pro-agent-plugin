/** Inert original-worker ticket publication facts. These source profiles and
 * frame coordinates issue no timer, cancellation, receiver or Save authority. */
import {createHash} from "node:crypto";
import {CURRENT_PCB_209_WORKER_STARTUP_SOURCE as WORKER} from "./current-pcb-209-worker-startup-profile.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_SOURCE=freezeDeep({
  "localPublishTicket": {
    "kind": "localPublishTicket",
    "start": 2_108_156,
    "end": 2_108_544,
    "line": 110,
    "column": 93_946,
    "bytes": 388,
    "sha256": "64330265b94b7b37d13e4c9acc7f77e91e886269a4fc9f44538e58bf0f9cc9aa",
    "source": "localPublishTicket(s){if(s){this.isReady&&this.workerBus.publish(\"/pro-mgr/project/ticket\",{ticket:s,force:!0}),this.publishTimer&&clearTimeout(this.publishTimer),this.publishTimer=null;return}this.publishTimer||(this.publishTimer=setTimeout(()=>{this.isReady&&this.workerBus.publish(\"/pro-mgr/project/ticket\",{ticket:this.consistencyManager.getMaxTicket()}),this.publishTimer=null},20))}",
    "name": "localPublishTicket",
    "arity": 1,
    "functionLineNumber": 110,
    "functionColumnNumber": 93_964
  },
  "canWsPublish": {
    "kind": "canWsPublish",
    "start": 2_108_544,
    "end": 2_108_622,
    "line": 110,
    "column": 94_334,
    "bytes": 78,
    "sha256": "787898cdd71f5e2031ed21899efa65f187185fbb80edb8118b8ecd1931b1aab3",
    "source": "canWsPublish(){return!(!jr||!this.isReady||this.isReadOnly()||this.isSyncing)}",
    "name": "canWsPublish",
    "arity": 0,
    "functionLineNumber": 110,
    "functionColumnNumber": 94_346
  },
  "timerCallback": {
    "kind": "ticketTimerCallback",
    "start": 2_108_398,
    "end": 2_108_538,
    "line": 110,
    "column": 94_188,
    "bytes": 140,
    "sha256": "9ba895bd7c5df21fb0a4e062a17ccee510e596778cabd110d21772f47b1cc106",
    "source": "()=>{this.isReady&&this.workerBus.publish(\"/pro-mgr/project/ticket\",{ticket:this.consistencyManager.getMaxTicket()}),this.publishTimer=null}",
    "name": "",
    "arity": 0,
    "functionLineNumber": 110,
    "functionColumnNumber": 94_188
  }
} as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_FLAG_DECLARATION=freezeDeep({
  "kind": "flagDeclaration",
  "start": 1_654_634,
  "end": 1_654_778,
  "line": 106,
  "column": 26_174,
  "bytes": 144,
  "sha256": "af9a5efefd999bb0b1f77acafc6dc10ed1acad914b0bde5e8fd311810993a24f",
  "source": "{IS_EASYEDA:eX,IS_LCEDA:tX,IS_CLIENT:ln,IS_PRIVATE:jr,IS_ONLINE:nA,IS_OFFLINE:sX,IS_HALF_OFFLINE:rX,IS_DEV:iX,IS_ECAD:nX,PRO_EDITOR_MODES:V9}=L1"
} as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_CALLSITES=freezeDeep([
  {
    "kind": "onChangeCalllocalPublishTicket",
    "start": 2_106_970,
    "end": 2_106_995,
    "line": 110,
    "column": 92_760,
    "bytes": 25,
    "sha256": "6b5940d8f0f037543e2bb3dcccb404f53740606a36d3ac4e015f2e0e74510d82",
    "source": "this.localPublishTicket()"
  },
  {
    "kind": "onChangeCallcanWsPublish",
    "start": 2_106_996,
    "end": 2_107_015,
    "line": 110,
    "column": 92_786,
    "bytes": 19,
    "sha256": "aa452b183c04576a0a69cb6ae3dbee6df05ecebc8c3978978aaec69d8d34d31a",
    "source": "this.canWsPublish()"
  }
] as const);
export type CurrentSchematicRelevanceModifyTicketRole=keyof typeof CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_SOURCE;
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_FRAMES=Object.freeze({local:"[this,s]",websocket:"[this,jr]",timer:"[this]"} as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_FACTS=Object.freeze({delayMilliseconds:20,privateAlias:"jr",privateProperty:"IS_PRIVATE",clientAlias:"ln",clientProperty:"IS_CLIENT",flagProvider:"L1",localMethodAsync:false,localReturnsPromise:false,callerAwaitsLocal:false,callerAwaitsNd:false,localReturnProvesTimerSettlement:false,sdkTimerJoinProven:false,workerTimerJoinProven:false,cancellationAuthorized:false,workerCompleted:false,modifyCompleted:false,saveAuthorized:false} as const);
/** Check complete pinned bytes, selected method/arrow spans and the actual
 * private/client alias declaration. Runtime flags still require a held frame. */
export function qualifyCurrentSchematicRelevanceModifyTicketSource(input: string): void {
  if (!input.isWellFormed() || Buffer.byteLength(input) !== WORKER.bytes || createHash("sha256").update(input).digest("hex") !== WORKER.sha256) {
    throw new Error("SCH_MODIFY_TICKET_SOURCE");
  }
  const rows = [...Object.values(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_SOURCE), CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_FLAG_DECLARATION, ...CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_CALLSITES];
  for (const row of rows) {
    const actual = input.slice(row.start, row.end);
    if (actual !== row.source || Buffer.byteLength(actual) !== row.bytes || createHash("sha256").update(actual).digest("hex") !== row.sha256) {
      throw new Error("SCH_MODIFY_TICKET_SOURCE_SPAN");
    }
  }
}
