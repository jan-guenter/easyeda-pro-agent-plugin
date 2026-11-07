/** Pin actual installed source, then execute only the existing-ID selection
 * branch on inert records. No EasyEDA class, setter, action or app is created. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { GENERATED_SCHEMATIC_WIRE_SET_LINES_SOURCE, GENERATED_SCHEMATIC_WIRE_SOURCE_PROFILE } from "../server/src/generated-schematic-wire-source.ts";

async function main(): Promise<void> {
const assetsRoot = process.argv[2] ?? "/mnt/c/Program Files/easyeda-pro/resources/app/assets";
for (const file of GENERATED_SCHEMATIC_WIRE_SOURCE_PROFILE.files) {
  const bytes = await readFile(join(assetsRoot, file.relativePath)); assert.equal(bytes.length, file.bytes); assert.equal(createHash("sha256").update(bytes).digest("hex"), file.sha256);
  const method = bytes.toString("utf8").slice(file.setLines.start, file.setLines.end);
  assert.equal(createHash("sha256").update(method).digest("hex"), file.setLines.sha256); assert.equal(method, GENERATED_SCHEMATIC_WIRE_SET_LINES_SOURCE);
  const result: unknown = runInNewContext(`const line={id:"original-line",points:[{x:0,y:0},{x:100,y:0}]},originalPoints=line.points;
    const group={_lines:new Set([line]),createLineBaseOn(){throw Error("unexpected allocation");}},Cr=()=>{throw Error("unexpected deletion");},qt={};
    const replacement=[{x:20,y:-30},{x:120,y:-30}],methods={${method}};
    methods.setLines.call(group,[{id:line.id,points:replacement}]);
    ({sameLine:[...group._lines][0]===line,originalPointsIntact:JSON.stringify(originalPoints)==='[{"x":0,"y":0},{"x":100,"y":0}]',replacementInstalled:line.points===replacement,points:line.points,lines:group._lines.size});`, {}, { timeout: 1000 });
  assert.equal(JSON.stringify(result), JSON.stringify({ sameLine: true, originalPointsIntact: true, replacementInstalled: true, points: [{ x: 20, y: -30 }, { x: 120, y: -30 }], lines: 1 }));
}
process.stdout.write(`${JSON.stringify({ ok: true, exactFiles: 2, existingIdSelectionOnly: true, nativeSettersExecuted: false, originalInvocationObserved: false, writerAuthority: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- Offline CLI awaits its source checks; runtime does not import it.
await main();
