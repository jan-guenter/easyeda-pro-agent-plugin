/** Additional registration pauses for the distinct footprint execution owner.
 * Both entries are inside the pinned209 ja methods called directly by Lg.
 * Existing preparation and historical construction sequences stay unchanged. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_ASYNC_PROFILES } from "./current-footprint-copy-async-profiles.ts";
import { CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES } from "./current-pcb-209-worker-startup-profile.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_CONSTRUCTION_SITES = freezeDeep({ ...CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES,
  parserHead: { name: "onHeadChange", start: 276_360, end: 276_399, offset: 276_381, lineNumber: 9, columnNumber: 9022,
    bytes: 39, sha256: "c75541a20b1142ef50fa9cec68114d574f88ee13a79eccffb56592b0aa8fbe4b" },
  parserChange: { name: "onChange", start: 295_782, end: 295_813, offset: 295_799, lineNumber: 17, columnNumber: 1168,
    bytes: 31, sha256: "65fadef33a14c5f9d6a9ae6797a48f742bc85e558e5a84c4bc71c27b73416e0c" },
});
export const CURRENT_FOOTPRINT_COPY_CONSTRUCTION_SEQUENCE = Object.freeze([
  "channel", "upload", "base", "cooperation", "serial", "debounce", "serial", "parserHead", "parserChange", "project", "bootstrap",
] as const);
export type CurrentFootprintCopyConstructionSite = typeof CURRENT_FOOTPRINT_COPY_CONSTRUCTION_SEQUENCE[number];
const reads = [3, 3, 3, 4, 4, 4, 3, 6, 7, 7, 1] as const, requestMs = 2000;
export const CURRENT_FOOTPRINT_COPY_CONSTRUCTION_TIMING = Object.freeze({
  armMs: requestMs + 10 * 3 * requestMs,
  pauseMs: Object.freeze(reads.map((count, index) => (index === 0 ? 0 : requestMs) + requestMs + count * 3 * requestMs +
    (index === reads.length - 1 ? requestMs : 0) + 2 * requestMs)),
  // Ten breakpoint allocations/removals,45 pause reads and11 resumes. Release
  // Object group and later original/state/assignment proofs are additional.
  captureRequests: 10 + reads.reduce((total, count) => total + count, 0) + 11 + 10,
});
const helpers = String.raw`"use strict";
const bad=()=>{throw new Error("FOOTPRINT_PARSER_CONSTRUCTION");},seen=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();};
const verify=()=>{for(const[o,k,d]of seen){const v=Object.getOwnPropertyDescriptor(o,k);if(!v||!Object.hasOwn(v,"value")||!Object.is(v.value,d.value)||v.writable!==d.writable||v.enumerable!==d.enumerable||v.configurable!==d.configurable)bad();}};
const roster=()=>{if(own(project,"consistencyManager")!==this)bad();const h=own(this,"headCbArr"),c=own(this,"cbArr");if(h===c)bad();return[h,c];};`;
const original = 'array(registered,2);if(own(registered,"0")!==h||own(registered,"1")!==c)bad();';
export const CURRENT_FOOTPRINT_COPY_PARSER_CONSTRUCTION_CALLS = freezeDeep({
  head: { program: `function(project){${helpers}\nconst[h,c]=roster();array(h,0);array(c,0);verify();return[h,c];}`, arguments: 1, returnByValue: false },
  change: { program: `function(project,registered,head){${helpers}\nconst[h,c]=roster();${original}array(h,1);array(c,0);if(typeof head!=="function"||own(h,"0")!==head)bad();verify();return true;}`, arguments: 3, returnByValue: true },
  registered: { program: `function(project,registered,head,change){${helpers}\nconst[h,c]=roster();${original}array(h,1);array(c,1);if(typeof head!=="function"||typeof change!=="function"||own(h,"0")!==head||own(c,"0")!==change)bad();verify();return true;}`, arguments: 4, returnByValue: true },
});
export function decodeCurrentFootprintCopyParserArgument(input: unknown, index: 0 | 1): string {
  const expected = CURRENT_FOOTPRINT_COPY_ASYNC_PROFILES[index];
  const result = z.object({ result: z.object({ type: z.literal("function"), className: z.literal("Function"),
    description: z.string().max(8192), objectId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u) }).strict() }).strict()
    .parse(captureCurrentPcbStringClockReply(input).value).result;
  if (Buffer.byteLength(result.description) !== expected.bytes || createHash("sha256").update(result.description).digest("hex") !== expected.sha256) {
    throw new Error("FOOTPRINT_PARSER_ARGUMENT_SOURCE");
  }
  return result.objectId;
}
