/** Synthetic original transport callback ordering. No application or design is
 * connected, and source qualification below is explicitly an identity issuer. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE as SOURCE } from "../src/current-footprint-copy-main-backend-source.ts";
import type { CurrentFootprintCopyMainBackendRunner } from "../src/current-footprint-copy-main-backend-runner.ts";
import { mainBackendTransportFixture as fixture, mainBackendModule } from "./helpers/footprint-main-backend-runner-fixture.ts";

async function constructor(): Promise<typeof CurrentFootprintCopyMainBackendRunner> { const module = await mainBackendModule(); return module.Constructor; }
void test("the real ESM origin entry and journal schema initialize without constructing a native owner", async () => {
  const origin = await import("../src/current-footprint-copy-main-request-origin.ts");
  const journal = await import("../src/current-pcb-diagnostic-lifecycle-journal.ts");
  assert.equal(typeof origin.requireCurrentFootprintCopyMainRequestOrigin, "function"); assert.equal(typeof journal.diagnosticLifecycleRecordSchemas, "object");
  assert.throws(() => origin.requireCurrentFootprintCopyMainRequestOrigin({ profile: "private.current-footprint-copy-main-request-origin.v1", executionAuthorized: false }));
});
void test("original main startup arms registration before its one initial continuation and retains exact construction without invoking app methods", async () => {
  const Constructor = await constructor(), value = fixture(); const runner = new Constructor(value.transport); const packet = await runner.observe();
  assert.equal(value.state.resumeCount, 2); assert.equal(packet.initialContinuationCount, 1); assert.equal(packet.executionAuthorized, false); assert.equal(packet.protocolRegistrationObserved, false);
  assert.equal(runner.retained().metadataRole, null); assert.equal(runner.retained().schemaIssues, null);
  assert.deepEqual(value.commands.slice(0, 6).map(command => command.phase), ["runtime-enable", "debugger-enable", "registration-arm", "run-waiting", "resume", "source"]);
  await runner.reprove(packet); await runner.release(); assert.equal(runner.retained().released, true); assert.equal(runner.retained().pendingReplies, 0);
  await assert.rejects(runner.observe()); await assert.rejects(runner.reprove(structuredClone(packet))); await assert.rejects(runner.release());
});
void test("a rejected original registration retains bounded location and script-membership evidence before lexical evaluation", async () => {
  const Constructor = await constructor();
  for (const foreign of [false, true]) {
    const value = fixture(); value.state.foreignRegistrationScript = foreign; value.state.registrationColumnDelta = foreign ? 0 : 9;
    const runner = new Constructor(value.transport); await assert.rejects(runner.observe(), /REGISTRATION_LOCATION/u);
    const retained = runner.retained().registrationLocationFailure;
    assert.deepEqual(retained, { lineNumber: SOURCE.registration.https.lineNumber,
      columnNumber: SOURCE.registration.https.breakpointColumnNumber + value.state.registrationColumnDelta, scriptObserved: !foreign });
    assert.ok(Object.isFrozen(retained));
    assert.equal(runner.retained().failure, "REGISTRATION_LOCATION");
    assert.equal(value.commands.some(command => command.phase === "source" || command.phase === "frame" || command.phase === "capture"), false);
    value.state.current = false; await assert.rejects(runner.release());
    assert.equal(runner.retained().registrationLocationFailure, retained);
  }
});
void test("metadata schema failure retains only a bounded role and immutable issue codes and paths", async () => {
  const Constructor = await constructor();
  for (const role of ["capture", "Date", "now", "protocolCallback", "driverIntercept", "driverCallback", "router", "actorClock", "projectSql"]) {
    const value = fixture(); value.state.metadataShapeRole = role; const runner = new Constructor(value.transport);
    await assert.rejects(runner.observe()); const retained = runner.retained();
    assert.equal(retained.metadataRole, role === "capture" ? "retained-array" : role); assert.equal(retained.failure, "REPLY_SCHEMA");
    assert.ok(retained.schemaIssues !== null && retained.schemaIssues.length > 0 && retained.schemaIssues.length <= 6);
    assert.ok(Object.isFrozen(retained.schemaIssues));
    for (const issue of retained.schemaIssues) { assert.ok(Object.isFrozen(issue) && Object.isFrozen(issue.path)); assert.ok(issue.path.length <= 8); }
    assert.equal(JSON.stringify(retained).includes("sensitive-foreign-value"), false);
    const first = retained.schemaIssues; value.state.current = false; await assert.rejects(runner.release());
    assert.equal(runner.retained().schemaIssues, first); assert.equal(runner.retained().metadataRole, retained.metadataRole);
  }
});
void test("foreign errors cannot claim a locally issued construction reason by matching its text", async () => {
  const Constructor = await constructor(), value = fixture(); value.state.sendFailure = "runtime-enable";
  value.state.sendFailureText = "FOOTPRINT_MAIN_CONSTRUCTION_REGISTRATION_LOCATION";
  const runner = new Constructor(value.transport); await assert.rejects(runner.observe(), /REGISTRATION_LOCATION/u);
  assert.equal(runner.retained().failure, "ORIGINAL_TRANSPORT_OR_CAPTURE"); assert.equal(runner.retained().schemaIssues, null);
});
void test("schema diagnostics cannot echo foreign values or arbitrary path keys", async () => {
  const Constructor = await constructor(), value = fixture(); value.state.sendFailure = "runtime-enable";
  value.state.sendError = new z.ZodError(Array.from({ length: 9 }, () => ({ code: "custom", message: "sensitive-foreign-message",
    path: ["sensitive-unapproved-key", ...Array.from({ length: 12 }, (_, index) => index + 1000)] })));
  const runner = new Constructor(value.transport); await assert.rejects(runner.observe()); const issues = runner.retained().schemaIssues;
  assert.ok(issues !== null && issues.length === 6); assert.ok(issues.every(issue => issue.code === "custom" && issue.path.length === 8 && issue.path.every(key => key === "$unknown")));
  assert.equal(JSON.stringify(runner.retained()).includes("sensitive"), false);
});
void test("a completed diagnostic or synthetic construction cannot adopt a copied combined owner capability", async () => {
  const Constructor = await constructor(), value = fixture(); const runner = new Constructor(value.transport);
  const packet = await runner.observe();
  const count = value.commands.length;
  const capability = Object.freeze({ profile: "private.current-footprint-combined-main-capability.v1" as const, executionAuthorized: false as const });
  await assert.rejects(runner.issueRequestOrigin(capability, packet));
  await assert.rejects(runner.issueRequestOrigin(capability, structuredClone(packet)));
  assert.equal(value.commands.length, count); assert.equal(runner.retained().requestOriginIssued, false); assert.equal(runner.retained().requestOriginActive, false);
  await runner.reprove(packet); await runner.release();
});
void test("source drift, foreign pauses and duplicate resume events refuse before lexical evaluation without repeating continuation", async () => {
  const Constructor = await constructor();
  for (const failure of ["wrongSource", "foreignPause", "duplicateResume"] as const) {
    const value = fixture(); value.state[failure] = true; const runner = new Constructor(value.transport); await assert.rejects(runner.observe());
    assert.equal(value.commands.some(command => command.phase === "frame" || command.phase === "capture"), false); assert.ok(value.state.resumeCount <= 1);
    const count = value.commands.length; await assert.rejects(runner.observe()); assert.equal(value.commands.length, count); assert.equal(runner.retained().failed, true);
  }
});
void test("a lost original write acknowledgment or malformed framing consumes the attempt and retains its pending reply", async () => {
  const Constructor = await constructor();
  for (const failure of ["send", "chunk"] as const) {
    const value = fixture(); if (failure === "send") { value.state.sendFailure = "runtime-enable"; } else { value.state.malformedChunk = true; }
    const runner = new Constructor(value.transport); await assert.rejects(runner.observe()); assert.equal(value.commands.length, 1); assert.equal(runner.retained().pendingReplies, 1);
    await assert.rejects(runner.release()); assert.equal(value.commands.length, 1); await assert.rejects(runner.observe());
  }
});
