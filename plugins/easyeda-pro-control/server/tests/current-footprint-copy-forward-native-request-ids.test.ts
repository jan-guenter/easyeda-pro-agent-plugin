import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { assertCurrentFootprintCopyForwardNativeRequestIds, currentFootprintCopyForwardNativeLimits } from "../src/current-footprint-copy-forward-profile.ts";

const helper = new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url);

void test("generated native parser ID policy and actual C# smoke retain forward1002 and legacy811/856 boundaries", async () => {
  const generated = currentFootprintCopyForwardNativeLimits(), source = await readFile(helper, "utf8");
  assert.ok(source.includes(generated));
  assert.ok(generated.includes("return id>=1&&id<=(forwardPurpose?Requests:workerCommand?EasyedaFootprintExecutionLimits.NormalRequests:EasyedaFootprintExecutionLimits.Requests);"));
  assert.ok(generated.includes("AllowsExecutionRequestId(1002,true,worker)&&!AllowsExecutionRequestId(1003,true,worker)"));
  assert.ok(generated.includes("AllowsExecutionRequestId(811,false,true)&&!AllowsExecutionRequestId(812,false,true)"));
  assert.ok(generated.includes("AllowsExecutionRequestId(856,false,false)&&!AllowsExecutionRequestId(857,false,false)"));
  assert.ok(generated.includes("!AllowsExecutionRequestId(0,true,worker)"));
  assert.ok(generated.includes("!AllowsExecutionRequestId(0,false,true)&&!AllowsExecutionRequestId(0,false,false)"));
  assert.match(source, /if \(\$CompileOnly\) \{[\s\S]*?\[EasyedaFootprintForwardLimits\]::VerifyExecutionRequestIdsSmoke\(\)/u);
  assert.match(source, /class EasyedaFootprintExecutionLimits \{ public const int Requests=856; public const int NormalRequests=811;/u);
});

void test("each dedicated parser selects the original forward purpose and refuses stale or caller-selected ID guards", async () => {
  const source = await readFile(helper, "utf8");
  assert.doesNotThrow(() => { assertCurrentFootprintCopyForwardNativeRequestIds(source); });
  for (const [action, worker] of [["footprint-copy-parent", false], ["footprint-copy-worker", true], ["footprint-cache-construction", false]] as const) {
    const start = source.indexOf(`        '${action}' {`);
    const end = source.indexOf("\n        '", start + 1);
    const block = source.slice(start, end);
    const guard = `-not [EasyedaFootprintForwardLimits]::AllowsExecutionRequestId([long]$request.requestId,$WorkerStartupFootprintForward209.IsPresent,$${String(worker)})`;
    assert.ok(block.includes("($request.requestId -isnot [int] -and $request.requestId -isnot [long])"));
    assert.equal(block.split(guard).length, 2);
    for (const replacement of ["$request.requestId -gt [EasyedaFootprintExecutionLimits]::Requests",
      guard.replace("$WorkerStartupFootprintForward209.IsPresent", "$request.forwardPurpose"),
      guard.replace(`,$${String(worker)})`, `,$${String(!worker)})`)]) {
      assert.throws(() => { assertCurrentFootprintCopyForwardNativeRequestIds(source.slice(0, start) + block.replace(guard, replacement) + source.slice(end)); }, /NATIVE_REQUEST_ID_GUARD/u);
    }
  }
});
