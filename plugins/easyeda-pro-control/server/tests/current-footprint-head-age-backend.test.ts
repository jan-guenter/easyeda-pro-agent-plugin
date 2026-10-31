/** Maintained backend callbacks with synthetic source/capability issuers only.
 * No native owner, application process or installed runtime is connected. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_HEAD_AGE_CDP_PHASES, currentFootprintHeadAgeCdpExceptionForError } from "../src/current-footprint-head-age-cdp-exception.ts";
import { mainBackendModule, mainBackendTransportFixture } from "./helpers/footprint-main-backend-runner-fixture.ts";
import { headAgeBackendRunnerFixture } from "./helpers/footprint-head-age-backend-runner-fixture.ts";
import { footprintHeadAgeMainFixture } from "./helpers/footprint-head-age-main-fixture.ts";

const scope = { createdAtLiteral: "2020-01-15 12:34:56", referenceUtcMs: 0 };
/** Supply a complete synthetic exception with an unknown field to preserve. */
function syntheticHeadAgeCdpFailure(): Record<string, unknown> {
  return { result: { type: "object", subtype: "error", className: "Error", description: "private original context failure", objectId: "original-error" },
    exceptionDetails: { exceptionId: 1, text: "Uncaught", lineNumber: 12, columnNumber: 3, privateUnknown: { retained: "complete diagnostic" } } };
}
void test("actual retained backend preparation consumes all eight context steps and two-argument Date capture", async () => {
  const { runner, value } = await headAgeBackendRunnerFixture(); await runner.observe(); const before = value.commands.length;
  await runner.prepareHeadAge(123);
  assert.deepEqual(value.commands.slice(before).map(command => command.phase), ["require", "head-age-context-capture", "properties", "properties", "properties",
    "head-age-context-source", "properties", "properties", "head-age-context-bind", "head-age-capture", ...Array.from({ length: 11 }, () => "properties")]);
  const captured = value.commands.find(command => command.phase === "head-age-capture"); assert.equal(captured?.phase, "head-age-capture");
  if (captured?.phase === "head-age-capture") { assert.deepEqual(captured.params.arguments, [{ objectId: "capture" }, { objectId: "head-age-context-bind" }]); }
  const bound = value.commands.find(command => command.phase === "head-age-context-bind"); assert.equal(bound?.phase, "head-age-context-bind");
  if (bound?.phase === "head-age-context-bind") { assert.deepEqual(bound.params.arguments.at(-1), { value: 123 }); }
  value.state.headAgeExceptionPhase = "head-age-observe";
  value.state.headAgeExceptionReply = { result: { type: "object", value: footprintHeadAgeMainFixture(scope.createdAtLiteral) } };
  const observed = await runner.observeHeadAge(scope); assert.equal(observed.scope.createdAtLiteral, scope.createdAtLiteral);
  const count = value.commands.length; await assert.rejects(runner.observeHeadAge(scope), /HEAD_AGE_CONSUMED/u); await assert.rejects(runner.prepareHeadAge(123), /HEAD_AGE_CONSUMED/u);
  assert.equal(value.commands.length, count); await runner.release(); assert.equal(runner.retained().released, true);
});
void test("all five actual head-age request phases retain original exceptions before success decoding and remain consumed", async () => {
  for (const phase of CURRENT_FOOTPRINT_HEAD_AGE_CDP_PHASES) {
    const { runner, value } = await headAgeBackendRunnerFixture(); await runner.observe();
    if (phase === "head-age-observe") { await runner.prepareHeadAge(123); }
    const raw = syntheticHeadAgeCdpFailure(); value.state.headAgeExceptionPhase = phase; value.state.headAgeExceptionReply = raw;
    const pending = phase === "head-age-observe" ? runner.observeHeadAge(scope) : runner.prepareHeadAge(123);
    await assert.rejects(pending, error => {
      const evidence = currentFootprintHeadAgeCdpExceptionForError(error); assert.ok(evidence); assert.equal(evidence.phase, phase); assert.deepEqual(evidence.reply, raw);
      assert.ok(error instanceof Error); assert.equal(error.message, `FOOTPRINT_HEAD_AGE_CDP_EXCEPTION:${phase}:${evidence.replySha256}`); return true;
    });
    assert.equal(runner.retained().phase, phase); assert.equal(runner.retained().failed, true); assert.equal(runner.retained().pendingReplies, 0);
    const count = value.commands.length; await assert.rejects(runner.prepareHeadAge(123)); await assert.rejects(runner.observeHeadAge(scope)); assert.equal(value.commands.length, count);
    assert.equal(value.commands.filter(command => command.phase === phase).length, 1); await runner.release(); assert.equal(runner.retained().released, true);
  }
});
void test("missing, duplicate or foreign bootstrap provenance refuses before a context source or bind", async () => {
  for (const scenario of ["missing", "duplicate", "foreign"] as const) {
    const { runner, value } = await headAgeBackendRunnerFixture();
    if (scenario === "foreign") { value.state.contextScriptId = "foreign"; } else { value.state.bootstrap = scenario; }
    if (scenario === "duplicate") { await assert.rejects(runner.observe(), /HEAD_AGE_BOOTSTRAP_CHANGED/u); }
    else { await runner.observe(); await assert.rejects(runner.prepareHeadAge(123), /HEAD_AGE_CONTEXT_SCRIPT/u); }
    assert.equal(value.commands.some(command => command.phase === "head-age-context-source" || command.phase === "head-age-context-bind"), false);
  }
});
void test("malformed context exceptions preserve the exact fixed phase and original cleanup", async () => {
  const { runner, value } = await headAgeBackendRunnerFixture(); await runner.observe();
  value.state.headAgeExceptionPhase = "head-age-context-capture"; value.state.headAgeExceptionReply = { result: { type: "object" }, exceptionDetails: {} };
  await assert.rejects(runner.prepareHeadAge(123), /^Error: FOOTPRINT_HEAD_AGE_CDP_REPLY_REFUSED:head-age-context-capture$/u);
  assert.equal(value.commands.some(command => command.phase === "head-age-context-bind"), false); await runner.release();
});
void test("ordinary backend and forged bootstrap capability cannot enter dedicated preparation", async () => {
  const module = await mainBackendModule(); const value = mainBackendTransportFixture(); const runner = new module.Constructor(value.transport); await runner.observe();
  const count = value.commands.length; await assert.rejects(runner.prepareHeadAge(123), /HEAD_AGE_CONSUMED/u); assert.equal(value.commands.length, count);
  assert.throws(() => new module.Constructor(value.transport, { profile: "private.current-footprint-head-age-bootstrap-capability.v1", executionAuthorized: false }), /HEAD_AGE_BOOTSTRAP_CAPABILITY/u);
  await runner.release();
});
void test("changed context and native-method metadata refuse without widening the strict preparation profile", async () => {
  for (const role of ["head-age-context-capture", "getter", "setter", "getter-scopes", "setter-scopes", "head-age-capture", "head-method-getTime"]) {
    const { runner, value } = await headAgeBackendRunnerFixture(); await runner.observe(); value.state.metadataShapeRole = role;
    await assert.rejects(runner.prepareHeadAge(123)); assert.equal(runner.retained().failure, "REPLY_SCHEMA");
    assert.equal(value.commands.some(command => command.phase === "head-age-observe"), false);
    const count = value.commands.length; await assert.rejects(runner.prepareHeadAge(123)); assert.equal(value.commands.length, count); await runner.release();
  }
});
