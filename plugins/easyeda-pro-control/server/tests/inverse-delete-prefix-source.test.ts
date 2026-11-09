/** Builtin-only inert counter instrumentation; no app source or owner runs. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { instrumentInertInverseDeleteHandlerSource } from "./helpers/inverse-delete-prefix-source.ts";

const initialization = ";w.messageBus=new(KU().MessageBus);";
const handler = 'w.messageBus.rpcService("/PrjDB/footprint/delete",()=>true);';
const fixture = `const w={},KU=()=>({MessageBus:class{rpcService(topic,callback){globalThis.inertCallback=callback;}}})${initialization}${handler}`;

void test("inert delete instrumentation initializes zero and counts an actual callback execution", () => {
  const context = createContext({});
  runInContext(instrumentInertInverseDeleteHandlerSource(fixture), context);
  assert.equal(runInContext("inertDeleteHandlerCalls", context), 0);
  assert.equal(runInContext("inertCallback()", context), true);
  assert.equal(runInContext("inertDeleteHandlerCalls", context), 1);
});

void test("missing or repeated initialization and handler targets refuse as fixture drift before execution", () => {
  for (const target of [initialization, handler]) {
    for (const changed of [fixture.replace(target, ""), fixture + target]) {
      assert.throws(() => instrumentInertInverseDeleteHandlerSource(changed), /^Error: INERT_DELETE_PREFIX_FIXTURE_DRIFT$/u);
    }
  }
});
