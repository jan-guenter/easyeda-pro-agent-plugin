/** Direct synchronous boundary assertions using only the fixed synthetic helper. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { INPUT, closedSessionFixture } from "./helpers/windows-copy-current-fixture.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority } from "../src/windows-authority.ts";

async function prepared(): Promise<{
  fixture: ReturnType<typeof closedSessionFixture>;
  binding: Awaited<ReturnType<ReturnType<typeof closedSessionFixture>["capture"]>>;
  proof: Awaited<ReturnType<ReturnType<typeof closedSessionFixture>["supervisor"]["proveClosedSession"]>>;
}> {
  const fixture = closedSessionFixture();
  const binding = await fixture.capture();
  const intent = await fixture.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  const closeReceipt = await fixture.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  const proof = await fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  return { fixture, binding, proof };
}
void test("current-copy guard accepts only an original current proof without another native request", async () => {
  const f = await prepared(); assert.equal(await assertClosedSessionCopyAuthority(f.proof), f.proof);
  const count = f.fixture.requests.length; assert.doesNotThrow(() => { assertCurrentClosedSessionCopyAuthority(f.proof); });
  assert.equal(f.fixture.requests.length, count);
  assert.equal(await assertClosedSessionCopyAuthority(f.proof), f.proof);
});
void test("current-copy guard does not replace asynchronous helper source validation", async () => {
  const f = await prepared(); f.fixture.behavior.helperDrift = true;
  assert.doesNotThrow(() => { assertCurrentClosedSessionCopyAuthority(f.proof); });
  await assert.rejects(assertClosedSessionCopyAuthority(f.proof), /helper source drift/u);
});
for (const candidate of [null, undefined, true, 1, "proof", {}, { verifyCopyCurrent: (): void => { throw new Error("must not call"); } }]) {
  void test(`current-copy guard rejects unissued ${typeof candidate}`, () => { assert.throws(() => { assertCurrentClosedSessionCopyAuthority(candidate); }, /not issued/u); });
}
for (const mode of ["json", "clone", "spread"] as const) {
  void test(`current-copy guard rejects ${mode} reconstruction`, async () => {
    const f = await prepared(); let copied: unknown;
    // oxlint-disable-next-line unicorn/prefer-structured-clone -- Explicit JSON reconstruction is distinct from the adjacent structuredClone refusal case.
    if (mode === "json") { copied = JSON.parse(JSON.stringify(f.proof)); }
    else if (mode === "clone") { copied = structuredClone(f.proof); } else { copied = { ...f.proof }; }
    assert.throws(() => { assertCurrentClosedSessionCopyAuthority(copied); }, /not issued/u);
  });
}
for (const change of ["helper-lost", "checker-replaced", "helper-function", "helper-hash", "scope-hash", "executable-hash", "executable-path", "release", "new-generation", "capture", "release-capture"] as const) {
  void test(`current-copy guard rejects ${change} after original proof`, async () => {
    const f = await prepared();
    if (change === "helper-lost") { f.fixture.behavior.helperLost = true; }
    if (change === "checker-replaced") { Reflect.set(f.fixture.transport, "assertClosedSessionAvailable", (): void => {
      // A replacement checker cannot impersonate the retained helper.
    }); }
    if (change === "helper-function") { f.fixture.policy.revalidateClosedSessionHelper = (): Promise<void> => Promise.resolve(); }
    if (change === "helper-hash") { f.fixture.policy.helperSha256 = "f".repeat(64); }
    if (change === "scope-hash") { f.fixture.policy.reviewedExecutionScopeSha256 = "f".repeat(64); }
    if (change === "executable-hash") { f.fixture.policy.expectedExecutableSha256 = "f".repeat(64); }
    if (change === "executable-path") { f.fixture.policy.expectedExecutable = String.raw`C:\Other\easyeda-pro.exe`; }
    if (change === "release") { await f.fixture.supervisor.release(); }
    if (change === "new-generation") { await f.fixture.supervisor.launch({ confirmLaunch: true }); }
    if (change === "capture") { await f.fixture.supervisor.capture({ ...INPUT, bindingSha256: "7".repeat(64) }); }
    if (change === "release-capture") { await f.fixture.supervisor.releaseCapture(f.binding.executionAuthority); }
    const count = f.fixture.requests.length; assert.throws(() => { assertCurrentClosedSessionCopyAuthority(f.proof); }); assert.equal(f.fixture.requests.length, count);
    await assert.rejects(assertClosedSessionCopyAuthority(f.proof));
  });
}
