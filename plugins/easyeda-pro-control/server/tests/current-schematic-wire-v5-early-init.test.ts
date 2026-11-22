import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentSchematicWireEventObserver } from "../src/current-schematic-wire-event-observer.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_BIRTH_SOURCE as SOURCE, currentSchematicWireNetBirthSite as siteFor } from "../src/current-schematic-wire-net-birth-source.ts";
import { CURRENT_SCHEMATIC_WIRE_V5_EARLY_INIT_NATIVE_LIMITS as LIMIT, currentSchematicWireV5EarlyInitNativeDispatch } from "../src/current-schematic-wire-v5-early-init-native.ts";
import { CurrentSchematicWireV5EarlyInit } from "../src/current-schematic-wire-v5-early-init.ts";
import type { CurrentSchematicWireV5EarlyInitHeld as Held, CurrentSchematicWireV5EarlyInitRequest as Request } from "../src/current-schematic-wire-v5-early-init.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

const scriptId = "original-script", session = "original-session";
const owner = Object.freeze({});
const observer = new CurrentSchematicWireEventObserver(owner);

function held(variant: 0 | 1, length: number): Held {
  const site = siteFor(variant);
  const pins = SOURCE[variant];
  const script = observer.captureRaw(JSON.stringify({ method: "Debugger.scriptParsed", sessionId: session, params: {
    scriptId, url: site.url, length, startLine: 0, startColumn: 0, endLine: 5000, endColumn: 0,
    executionContextId: 1, hash: "1".repeat(64),
  } }), owner);
  const callFrames = [pins.page, pins.caller].map((pin, index) => ({
    callFrameId: index === 0 ? "held-page" : "held-caller", functionName: index === 0 ? "_init" : "", url: site.url,
    location: { scriptId, lineNumber: pin.lineNumber, columnNumber: pin.held },
    functionLocation: { scriptId, lineNumber: pin.lineNumber, columnNumber: pin.columnNumber },
    this: { type: "object" }, scopeChain: [],
  }));
  const pause = observer.captureRaw(JSON.stringify({ method: "Debugger.paused", sessionId: session, params: {
    reason: "other", hitBreakpoints: [site.breakpointId], callFrames,
  } }), owner);
  return Object.freeze({ script, variant, pause, resolution: {
    method: "Debugger.breakpointResolved", sessionId: session,
    params: { breakpointId: site.breakpointId, location: { scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } },
  } });
}

void test("the early initializer retires a relocated arm without reading source", async () => {
  assert.deepEqual(LIMIT, { requests: 6, polls: 2750, controls: 2756 });
  assert.match(currentSchematicWireV5EarlyInitNativeDispatch(), /\$owner\.SendWireV5EarlyInit/u);
  const ledger: Request[] = [];
  const site = siteFor(0);
  const scope = new CurrentSchematicWireV5EarlyInit(session, {
    assertCurrent: (): void => { assert.ok(ledger.length <= LIMIT.requests); },
    assertBeforeNavigation: (): void => { assert.ok(ledger.length <= 1); },
    requireOriginalHeld: (): never => assert.fail("No pause was acquired"),
    request: (command): Promise<unknown> => {
      ledger.push(command);
      if (command.phase === "arm") {
        return Promise.resolve({ breakpointId: site.breakpointId,
          locations: [{ scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber + 1 }] });
      }
      assert.deepEqual(command, { phase: "remove", variant: 0, breakpointId: site.breakpointId });
      return Promise.resolve({});
    },
    waitForOriginalResumed: (): never => assert.fail("No resume is authorized"),
  });
  await assert.rejects(scope.arm(), /CUSTODY/u);
  await scope.retireArms();
  assert.deepEqual(ledger.map(row => row.phase), ["arm", "remove"]);
  await assert.rejects(scope.arm(), /CUSTODY/u);
});

void test("the early initializer releases only its original arms and a whole-source-qualified owned pause", async context => {
  const source = await readConfiguredEasyedaAsset(SOURCE[0].relativePath);
  if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }

  for (const mode of ["original", "changed-source", "lost-pause"] as const) {
    const original = held(0, source.length);
    let currentHold = original;
    const ledger: Request[] = [];
    let navigated = false, resumed = false;
    const scope = new CurrentSchematicWireV5EarlyInit(session, {
      assertCurrent: (): void => { assert.ok(ledger.length <= LIMIT.requests); },
      assertBeforeNavigation: (): void => { assert.equal(navigated, false); },
      requireOriginalHeld: (): Held => {
        assert.equal(navigated, true); assert.equal(resumed, false);
        assert.equal(observer.requireOriginal(original.script, owner), original.script);
        assert.equal(observer.requireOriginal(original.pause, owner), original.pause);
        return currentHold;
      },
      request: (command): Promise<unknown> => {
        ledger.push(command);
        const site = siteFor(command.variant);
        if (command.phase === "arm") {
          return Promise.resolve({ breakpointId: site.breakpointId, locations: [] });
        }
        if (command.phase === "source") {
          assert.equal(command.scriptId, scriptId);
          return Promise.resolve({ scriptSource: mode === "changed-source" ? source.replace(/^./u, " ") : source });
        }
        if (command.phase === "remove") {
          assert.equal(command.breakpointId, site.breakpointId);
          if (mode === "lost-pause" && command.variant === 0) { currentHold = held(0, source.length); }
        }
        if (command.phase === "resume") { resumed = true; }
        return Promise.resolve({});
      },
      waitForOriginalResumed: (event): Promise<void> => {
        assert.equal(event, original); assert.equal(resumed, true); return Promise.resolve();
      },
    });
    await scope.arm();
    navigated = true;
    if (mode === "changed-source") {
      await assert.rejects(scope.readOriginalHold());
      await scope.retireArms();
      assert.deepEqual(ledger.map(row => row.phase), ["arm", "arm", "source", "remove", "remove"]);
      assert.equal(resumed, false);
    } else {
      const receipt = await scope.readOriginalHold();
      scope.requireOriginalHold(receipt);
      assert.equal(receipt.event, original.pause);
      assert.equal(receipt.source.scriptSource, source);
      assert.deepEqual(ledger.map(row => row.phase), ["arm", "arm", "source"]);
      await assert.rejects(scope.releaseOriginal({ ...receipt }), /CUSTODY/u);
      if (mode === "lost-pause") {
        await assert.rejects(scope.releaseOriginal(receipt), /CUSTODY/u);
        assert.deepEqual(ledger.map(row => row.phase), ["arm", "arm", "source", "remove"]);
        await scope.retireArms();
        assert.deepEqual(ledger.map(row => row.phase), ["arm", "arm", "source", "remove", "remove"]);
        assert.equal(resumed, false);
      } else {
        await scope.releaseOriginal(receipt);
        assert.deepEqual(ledger.map(row => row.phase), ["arm", "arm", "source", "remove", "remove", "resume"]);
        assert.equal(resumed, true);
      }
      await assert.rejects(scope.releaseOriginal(receipt), /CUSTODY/u);
    }
    await assert.rejects(scope.readOriginalHold(), /CUSTODY/u);
  }
});
