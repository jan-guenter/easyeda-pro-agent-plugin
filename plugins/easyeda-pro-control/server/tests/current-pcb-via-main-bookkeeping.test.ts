/* oxlint-disable import/max-dependencies -- Independently exercise fixed source adaptation, three protocol tables and actual observer scheduling without a native owner. */
/** Local source compiler and extracted original observer methods only. No
 * original facade registry entry, application, SQL or resume grant is issued. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { runInNewContext, runInThisContext } from "node:vm";
import { CURRENT_PCB_VIA_MAIN_BEGIN_CALLS as BEGIN } from "../src/current-pcb-via-main-begin-programs.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_BOOKKEEPING as BOOKKEEPING, CURRENT_PCB_VIA_MAIN_HISTORY_BOOKKEEPING as HISTORY, CURRENT_PCB_VIA_MAIN_BEGIN_REBASE as REBASE, CURRENT_PCB_VIA_MAIN_STRUCTURE_BOOKKEEPING as STRUCTURE } from "../src/current-pcb-via-main-captured-rebase.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_FLAGS as FLAGS, CURRENT_PCB_VIA_MAIN_BEGIN_RUN_EXPRESSION as RUN_FRAME, CURRENT_PCB_VIA_MAIN_BEGIN_SITES as SITES, validateCurrentPcbViaMainBeginCommand } from "../src/current-pcb-via-main-begin-protocol.ts";
import { CURRENT_PROJECT_HISTORY_MAIN_PROGRAMS as OLD_HISTORY } from "../src/current-project-history-main-programs.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_PROGRAMS as OLD_STRUCTURE } from "../src/current-pcb-via-main-structure-protocol.ts";
import { CURRENT_MAIN_CAPTURED_SCOPE_FRAMES as CAPTURED } from "../src/current-main-captured-scope-frames.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP } from "../src/current-footprint-copy-main-request-programs.ts";
import { decodeCurrentFootprintCopyMainRequestArrayCapture as decodeArray } from "../src/current-footprint-copy-main-request-protocol.ts";
import { currentPcbViaMainBeginResultSchema as resultSchema } from "../src/current-pcb-via-main-begin-custody.ts";
import { z } from "zod";

void test("closed bookkeeping metadata matches every unchanged consumer and rejects unknown copy/fromEntries forms before execution", async () => {
  for (const [fixed, original] of [[BOOKKEEPING, BEGIN], [HISTORY, OLD_HISTORY], [STRUCTURE, OLD_STRUCTURE]] as const) {
    for (const [role, row] of Object.entries(fixed)) { const old: unknown = Object.getOwnPropertyDescriptor(original, role)?.value; assert.ok(old !== null && typeof old === "object"); for (const key of ["arguments", "length", "returnByValue"]) { assert.equal(Object.getOwnPropertyDescriptor(row, key)?.value, Object.getOwnPropertyDescriptor(old, key)?.value); } assert.ok(!row.program.includes("Object.fromEntries")); }
  }
  const source = await readFile(new URL("../src/current-pcb-via-main-captured-rebase.ts", import.meta.url), "utf8"); const start = source.indexOf("const copies ="); const end = source.indexOf("export const CURRENT_PCB_VIA_MAIN_BEGIN_REBASE"); const fields = source.indexOf("const scratchFields ="); const stop = source.indexOf("export const CURRENT_PCB_VIA_MAIN_BEGIN_BOOKKEEPING"); assert.ok(start > 0 && end > start && fields > end && stop > fields);
  const compiler: unknown = runInNewContext(`${stripTypeScriptTypes(source.slice(start, end) + source.slice(fields, stop))};({readonlyProgram,bookkeeping})`); assert.ok(compiler !== null && typeof compiler === "object");
  const transform: unknown = Reflect.get(compiler, "readonlyProgram"); const build: unknown = Reflect.get(compiler, "bookkeeping"); assert.ok(typeof transform === "function" && typeof build === "function");
  for (const changed of [BEGIN.save.program.replace("return{...z,input,save:o};", "return{...unknown,input,save:o};"), `${BEGIN.save.program}return{...unknown,x};`, `${BEGIN.save.program}copyCapturedState`, `${BEGIN.save.program}copyCapturedFields`, `${BEGIN.save.program}writeCapturedField`]) { assert.throws(() => Reflect.apply(transform, undefined, [changed, 13]), /PCB_VIA_CAPTURED_COPY/u); }
  assert.throws(() => Reflect.apply(transform, undefined, [BEGIN.save.program.replace("return{...z,input,save:o};", "return{...z,input,save:o};return{...z,input,save:o};"), 13]), /COPY_DUPLICATE/u);
  assert.throws(() => Reflect.apply(build, undefined, [{ ...BEGIN.save, program: `${BEGIN.save.program}Object.fromEntries([])` }, 13]), /FIELDS_UNKNOWN/u);
  assert.throws(() => Reflect.apply(build, undefined, [OLD_HISTORY.branch, 19, "encrypt"]), /FIELDS_CENSUS/u);
});
void test("actual BEGIN observer bookkeeping scheduling stops after a malformed frame or lost next pause before any join", async () => {
  const source = await readFile(new URL("../src/current-pcb-via-main-begin-observer.ts", import.meta.url), "utf8"); const start = source.indexOf("  async #capture("); const end = source.indexOf("  async #step(", start); assert.ok(start > 0 && end > start);
  const method = source.slice(start, end).replace("#capture", "capture").replaceAll("this.#", "this."); const factory: unknown = runInThisContext(stripTypeScriptTypes(`(function(CAPTURED,REBASE,BOOKKEEPING,FLAGS,RUN_FRAME,SITES,GROUP,decodeArray,resultSchema){return ({${method}}).capture;})`)); assert.ok(typeof factory === "function");
  const result = z.strictObject({ type: z.literal("object"), value: resultSchema }); const replySchema = z.strictObject({ result });
  const capture: unknown = Reflect.apply(factory, undefined, [CAPTURED, REBASE, BOOKKEEPING, FLAGS, RUN_FRAME, SITES, GROUP, decodeArray, replySchema]); assert.ok(typeof capture === "function");
  for (const role of ["save", "transaction", "returned"] as const) {
    for (const fault of ["none", "pause", "frame"] as const) {
      const phases: string[] = []; const receiver = {
        bindings: { sqlCaptureObjectId: "original-capture" }, next: (): Promise<string> => fault === "pause" ? Promise.reject(new Error("original pause changed")) : Promise.resolve("original-frame"),
        send: (input: unknown): Promise<unknown> => { const command = validateCurrentPcbViaMainBeginCommand(input); phases.push(command.phase); assert.notEqual(command.method, "Debugger.resume");
          if (command.phase === "via-main-begin-frame") { const length = { save: 4, transaction: 2, returned: 2 }[role] + (fault === "frame" ? 1 : 0); return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(length)})`, objectId: "original-frame-packet" } }); }
          assert.equal(command.phase, "via-main-begin-bookkeeping"); if (role !== "returned") { return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(BOOKKEEPING[role].length)})`, objectId: "original-proof" } }); }
          return Promise.resolve({ result: { type: "object", value: { schema: "private.current-pcb-via-main-begin-result.v1", originalNativeCallbackSucceeded: true, originalBeginAwaitCompleted: true, transactionDepth: 1, historySqlCompleted: false, furtherSelectedSqlAuthorized: false, persistenceVerified: false } } }); },
      };
      const pending: unknown = Reflect.apply(capture, receiver, [role, role === "save" ? ["actor", "sql"] : ["original-prior"]]); assert.ok(pending instanceof Promise);
      if (fault === "none") { await pending; assert.deepEqual(phases, ["via-main-begin-frame", "via-main-begin-bookkeeping"]); }
      else { await assert.rejects(pending); assert.deepEqual(phases, fault === "pause" ? [] : ["via-main-begin-frame"]); }
    }
  }
});
