/** Bounded exception labels only. Local Inspector evidence is separate from
 * target EasyEDA execution, original paused-frame custody and persistence. */
import assert from "node:assert/strict";
import { Session } from "node:inspector";
import { test } from "node:test";
import { currentSelectedMainRawFrameFailure as classify } from "../src/current-selected-main-raw-frame-failure.ts";

const errorReply = (className: string, description: string): unknown => ({ result: { type: "object", subtype: "error", className, description }, exceptionDetails: {} });

/** Ask the in-process Node Inspector for its actual exception envelope.
 * Both fixed test expressions leave every application/global object unchanged. */
async function inspectorReply(expression: string): Promise<unknown> {
  const session = new Session(); session.connect();
  try {
    const pending = Promise.withResolvers<unknown>();
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- The fixed Inspector callback preserves its typed reply; promisify loses params and pinned tsgolint misclassifies the promises overload as void.
    session.post("Runtime.evaluate", { expression, throwOnSideEffect: true }, (error, reply) => {
      if (error === null) { pending.resolve(reply); } else { pending.reject(error); }
    });
    return await pending.promise;
  } finally { session.disconnect(); }
}

void test("actual Inspector ReferenceError and side-effect refusals produce fixed site labels", async () => {
  assert.equal(classify("startupVersion", await inspectorReply("[Je]")), "SELECTED_SQL_RAW_FRAME_STARTUPVERSION_BINDING_JE");
  assert.equal(classify("keeperBirth", await inspectorReply("Object.freeze({})")), "SELECTED_SQL_RAW_FRAME_KEEPERBIRTH_SIDE_EFFECT_CHECK");
});

void test("only this fixed site's binding names survive a bounded exception reply", () => {
  assert.equal(classify("initializerBirth", errorReply("ReferenceError", "ReferenceError: t is not defined\nprivate stack/path")), "SELECTED_SQL_RAW_FRAME_INITIALIZERBIRTH_BINDING_T");
  assert.equal(classify("initializerBirth", errorReply("ReferenceError", "ReferenceError: Cannot access 't' before initialization")), "SELECTED_SQL_RAW_FRAME_INITIALIZERBIRTH_BINDING_T");
  for (const name of ["privateAccount", "r", "sourcePath"]) {
    assert.equal(classify("initializerBirth", errorReply("ReferenceError", `ReferenceError: ${name} is not defined`)), "SELECTED_SQL_RAW_FRAME_INITIALIZERBIRTH_REFERENCE_ERROR");
  }
  assert.equal(classify("keeperBirth", errorReply("EvalError", "EvalError: private value")), "SELECTED_SQL_RAW_FRAME_KEEPERBIRTH_EVAL_ERROR");
  assert.equal(classify("keeperBirth", errorReply("TypeError", "TypeError: private value")), "SELECTED_SQL_RAW_FRAME_KEEPERBIRTH_TYPE_ERROR");
  assert.equal(classify("keeperBirth", errorReply("SyntaxError", "SyntaxError: private value")), "SELECTED_SQL_RAW_FRAME_KEEPERBIRTH_SYNTAX_ERROR");
});

void test("Proxy, accessor, inherited and oversized error data cannot run hooks or reveal values", () => {
  let hooks = 0;
  const proxy = new Proxy({}, { getOwnPropertyDescriptor(): never { hooks += 1; throw new Error("private"); }, getPrototypeOf(): never { hooks += 1; throw new Error("private"); } });
  const accessor = Object.defineProperty({}, "result", { get(): never { hooks += 1; throw new Error("private"); } });
  const inherited: unknown = Object.create({ result: { type: "object", subtype: "error", className: "ReferenceError", description: "ReferenceError: t is not defined" }, exceptionDetails: {} });
  for (const input of [proxy, accessor, inherited, errorReply("ReferenceError", "x".repeat(16_385)), errorReply("private", "private")]) {
    assert.equal(classify("keeperBirth", input), "SELECTED_SQL_RAW_FRAME_KEEPERBIRTH_SCHEMA");
  }
  assert.equal(hooks, 0);
});
