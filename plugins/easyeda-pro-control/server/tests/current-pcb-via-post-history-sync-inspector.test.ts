/** Only inert function definitions are compiled in our Node process. No
 * original method, decoder, network or EasyEDA worker is executed. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLEES as CALLEES, CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLER as CALLER } from "../src/current-pcb-via-post-history-sync-source.ts";
import { decodeCurrentGeneratedSyncCallee } from "../src/current-generated-initial-sync-replies.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_METHODS as METHODS, CURRENT_PROJECT_SAVE_PRODUCER_METHOD_SOURCE as SOURCE } from "../src/current-project-save-producer-source.ts";

void test("actual V8 function metadata and cloud-finally call site agree with the pinned source offsets", async () => {
  const source = await readFile("/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.185.bf63a159/js/project-worker.js", "utf8");
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    for (const row of CALLEES) {
      const method = row.name === "getFlowParse" || row.name === "applySnap" || row.name === "getLastHistoryUuid", prefix = method ? "({" : "(";
      const definition = method ? `${prefix}${row.source}}).${row.name}` : `${prefix}${row.source})`;
      const strict = '"use strict";'; const compiled = await session.post("Runtime.compileScript", { expression: strict + definition, sourceURL: `inert-post-sync-${row.name}.js`, persistScript: true }); assert.ok(compiled.scriptId !== undefined && compiled.exceptionDetails === undefined);
      const original = await session.post("Runtime.runScript", { scriptId: compiled.scriptId, objectGroup: "inert-post-sync-metadata" }); assert.ok(original.result.objectId !== undefined && original.exceptionDetails === undefined);
      const metadata = await session.post("Runtime.getProperties", { objectId: original.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      const before = source.slice(0, row.start).split("\n"), column = before.at(-1); assert.ok(column !== undefined);
      decodeCurrentGeneratedSyncCallee(metadata, { ...row, lineNumber: 0, columnNumber: row.columnNumber - column.length + prefix.length + strict.length }, compiled.scriptId);
    }
    const compiled = await session.post("Runtime.compileScript", { expression: `({${SOURCE.uploadCloud}})`, sourceURL: "inert-upload-finally-site.js", persistScript: true }); assert.ok(compiled.scriptId !== undefined && compiled.exceptionDetails === undefined);
    const possible = await session.post("Debugger.getPossibleBreakpoints", { start: { scriptId: compiled.scriptId, lineNumber: 0, columnNumber: 0 } });
    const before = source.slice(0, METHODS.uploadCloud.start).split("\n"), column = before.at(-1); assert.ok(column !== undefined);
    assert.ok(possible.locations.some(point => point.lineNumber === 0 && point.columnNumber === CALLER.columnNumber - column.length + 2 && point.type === "call"));
    await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-post-sync-metadata" });
  } finally { session.disconnect(); }
});
