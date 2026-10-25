import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcb209RatlineStageDiagnostics, currentPcb209RatlineFailureReason,
  currentPcb209RatlineStageDiagnosticsSchema } from "../src/current-pcb-209-ratline-diagnostics.ts";

void test("ratline stage diagnostics retain only exact owned reasons and preserve the first cause through cleanup", () => {
  for (const reason of ["PCB209_RATLINE_CREATION_CHILD_ORDER", "PCB209_RATLINE_CAPTURE_PAUSE_LOCATION",
    "PCB209_RATLINE_DISPATCH_UNKNOWN_BREAKPOINT", "PCB209_RATLINE_CHILD_GATE_CHILD_HELD", "PCB209_RATLINE_COMPOSITE_DEADLINE",
    "PCB209_RATLINE_ORIGIN_PARENT_BINDING"]) {
    const diagnostics = new CurrentPcb209RatlineStageDiagnostics();
    diagnostics.stage = "constructor-before"; diagnostics.step = "native-request"; diagnostics.lastCommand = "Target.getTargets";
    diagnostics.lastEvent = "attached"; diagnostics.record(new Error(reason));
    const original = diagnostics.snapshot().firstFailure;
    diagnostics.stage = "cleanup"; diagnostics.step = "cleanup"; diagnostics.lastCommand = "Debugger.resume";
    diagnostics.record(new Error("PCB209_RATLINE_COMPOSITE_ABORTED"));
    const result = currentPcb209RatlineStageDiagnosticsSchema.parse(diagnostics.snapshot());
    assert.equal(result.firstFailure?.reason, reason); assert.deepEqual(result.firstFailure, original);
    assert.equal(diagnostics.snapshot().firstFailure, original); assert.ok(Object.isFrozen(original));
    assert.equal(result.firstFailure?.stage, "constructor-before"); assert.equal(result.stage, "cleanup");
    assert.ok(JSON.stringify(result).length < 600);
  }
});

void test("diagnostic exceptions cannot execute accessors or publish unowned vendor text", () => {
  let invoked = 0;
  const accessor = Object.defineProperties({}, {
    message: { get(): string { invoked += 1; return "PCB209_RATLINE_CREATION_CHILD_ORDER"; } },
    name: { get(): string { invoked += 1; return "ZodError"; } },
  });
  const proxy = new Proxy({}, { getOwnPropertyDescriptor(): PropertyDescriptor { invoked += 1; throw new Error("Private detail"); } });
  const forgedPrefix = new Error("PCB209_RATLINE_CREATION_PRIVATE_DESIGN_NAME");
  for (const error of [accessor, proxy, forgedPrefix, new Error("https://private/project?secret=1"), null]) {
    const diagnostics = new CurrentPcb209RatlineStageDiagnostics(); diagnostics.record(error);
    assert.equal(currentPcb209RatlineFailureReason(error), "UNCLASSIFIED");
    const result = currentPcb209RatlineStageDiagnosticsSchema.parse(diagnostics.snapshot());
    assert.equal(result.firstFailure?.reason, "UNCLASSIFIED"); assert.equal(JSON.stringify(result).includes("private"), false);
  }
  assert.equal(invoked, 0);
  assert.throws(() => currentPcb209RatlineStageDiagnosticsSchema.parse({ ...new CurrentPcb209RatlineStageDiagnostics().snapshot(), stage: "private design" }));
});
