/** Original209 worker transport sites. The catch site is refusal-only; an
 * implicit return after a caught synchronous send error proves no dispatch. */
import { createHash } from "node:crypto";
import { CURRENT_PROJECT_SAVE_STRUCTURE_SOURCE as SOURCE } from "./current-project-save-structure-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PROJECT_STRUCTURE_TRANSPORT_SOURCE = freezeDeep({ ...SOURCE,
  liveness: { start: 1_430_822, end: 1_431_273, bytes: 451, sha256: "e17cc8986e758fa05d8b7f401c533cbb361d0d629401be2b7fb60b113e4b60b1" },
  wrapper: { start: 1_431_577, end: 1_431_704, bytes: 127, sha256: "5a85f502b7d2ab23337fc59cb3039872452d2d34f98c8bf8b646df9b85ee5f54" },
  permission: { start: 1_431_704, end: 1_431_742, bytes: 38, sha256: "f729102258affc631d66d08040ecbba8c7bb3f9eee4f52edb21298100b4d853a" },
  transport: { start: 1_431_742, end: 1_433_672, bytes: 1930, sha256: "19b7255c69ed60bae00d780cda39cd45c9bbd2b02969abf3addaa2dfb5ff5a8d" },
});
export const CURRENT_PROJECT_STRUCTURE_TRANSPORT_SITES = freezeDeep({
  send: { lineNumber: 103, columnNumber: 111_729, offset: 1_433_560, functionColumn: 109_995, name: "l", expression: "[e,t,s,r,i,n,a,o,c,l,p,u,d,m,XMLHttpRequest,t1,qh]", length: 17 },
  returned: { lineNumber: 103, columnNumber: 111_827, offset: 1_433_658, functionColumn: 109_995, name: "l", expression: "[e,t,s,r,i,n,a,o,c,l]", length: 10 },
  failed: { lineNumber: 103, columnNumber: 111_748, offset: 1_433_579, functionColumn: 109_995, name: "l", expression: "[e,t,s,r,i,n,a,o,c,l,h]", length: 11 },
});
export type CurrentProjectStructureTransportRole = keyof typeof CURRENT_PROJECT_STRUCTURE_TRANSPORT_SITES;
export const CURRENT_PROJECT_STRUCTURE_TRANSPORT_CONDITION = String.raw`(function(){try{if(typeof e!=="string"||typeof t!=="string")return true;return e==="POST"&&/^\/api\/v4\/projects\/[a-f0-9]{64}\/branches\/[a-f0-9]{32}\/structures$/.test(t);}catch{return true;}})()`;
export function qualifyCurrentProjectStructureTransportSource(input: unknown): void {
  const expected = CURRENT_PROJECT_STRUCTURE_TRANSPORT_SOURCE;
  if (typeof input !== "string" || !input.isWellFormed() || Buffer.byteLength(input) !== expected.bytes || createHash("sha256").update(input).digest("hex") !== expected.sha256) { throw new Error("PROJECT_STRUCTURE_TRANSPORT_SOURCE"); }
  for (const span of [expected.transport, expected.liveness, expected.wrapper, expected.permission]) { const text = input.slice(span.start, span.end); if (Buffer.byteLength(text) !== span.bytes || createHash("sha256").update(text).digest("hex") !== span.sha256) { throw new Error("PROJECT_STRUCTURE_TRANSPORT_SPAN"); } }
  const lines = input.split("\n");
  for (const point of Object.values(CURRENT_PROJECT_STRUCTURE_TRANSPORT_SITES)) { const offset = lines.slice(0, point.lineNumber).reduce((sum, line) => sum + line.length + 1, 0) + point.columnNumber; if (offset !== point.offset) { throw new Error("PROJECT_STRUCTURE_TRANSPORT_LOCATION"); } }
}
