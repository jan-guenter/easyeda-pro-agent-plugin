/** Constructor-created handler of the selected pL/fk publisher bus family.
 * Similar WIe/XIe copies elsewhere in either complete asset are excluded. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { qualifyCurrentSchematicRelevanceBroadcastCalleeSource } from "./current-schematic-relevance-broadcast-callee-source.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_SOURCE = freezeDeep([
  { variant: 0, constructorStart: 413_683, constructorEnd: 413_824, start: 413_796, end: 413_823, lineNumber: 6, columnNumber: 115_758, bytes: 27, sha256: "7ce40774efa24bcd11dfe25fc72164ae0020a0ca0846ab0b5a1c42c62600e5a6", name: "", arity: 1 },
  { variant: 1, constructorStart: 1_437_095, constructorEnd: 1_437_236, start: 1_437_208, end: 1_437_235, lineNumber: 532, columnNumber: 115_758, bytes: 27, sha256: "7ce40774efa24bcd11dfe25fc72164ae0020a0ca0846ab0b5a1c42c62600e5a6", name: "", arity: 1 },
] as const);

/** Complete selected asset and its publisher/bus spans must match before
 * matching this handler. A matching duplicate body alone is insufficient. */
export function qualifyCurrentSchematicRelevanceModifyEchoSource(source: string): 0 | 1 {
  const variant = qualifyCurrentSchematicRelevanceBroadcastCalleeSource(source);
  const row = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_SOURCE[variant];
  const text = source.slice(row.start, row.end);
  if (Buffer.byteLength(text) !== row.bytes || createHash("sha256").update(text).digest("hex") !== row.sha256 || source.slice(row.constructorStart, row.constructorEnd) !== `class extends se{constructor(j,W=crypto.randomUUID()){super(W),this.bc=new BroadcastChannel(j),this.bc.onmessage=${text}}`) { throw new Error("SCH_MODIFY_ECHO_SOURCE"); }
  return variant;
}
