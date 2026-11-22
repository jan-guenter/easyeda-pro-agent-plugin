import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_COPY_HELD_SAVED_CAPACITY, CurrentFootprintCopyHeldSavedResourceLedger, requireOriginalHeldSavedLedgerBinding } from "../src/current-footprint-copy-held-saved-capacity.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_PROFILE as PROFILE } from "../src/current-footprint-inverse-native-delete-cold-profile.ts";
import { captureCurrentFootprintInverseNativeDeleteColdSuccessor } from "../src/current-footprint-inverse-native-delete-cold-successor-helper.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_SUCCESSOR_IDENTITY as IDENTITY } from "../src/current-footprint-inverse-native-delete-cold-successor-identity.ts";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_BYTES, CURRENT_PCB_DIAGNOSTIC_HELPER_SHA256 } from "../src/current-pcb-diagnostic-helper-identity.ts";

void test("cold successor captures the dedicated helper under an exact launch switch", async () => {
  const distribution = "test-distro";
  const capture = await captureCurrentFootprintInverseNativeDeleteColdSuccessor(distribution);
  await capture.verify();
  assert.ok(capture.bootstrap.includes("footprint-inverse-native-delete-cold-successor.ps1"));
  assert.ok(capture.bootstrap.includes("[IO.FileShare]::Read"));
  assert.ok(capture.bootstrap.includes(IDENTITY.helper.sha256));
  assert.ok(capture.bootstrap.includes(`${PROFILE.nativeSwitch}}finally{$file.Dispose()}`));
  await assert.rejects(captureCurrentFootprintInverseNativeDeleteColdSuccessor("test-distro' unexpected"), /INVERSE_NATIVE_DELETE_COLD_HELPER_SOURCE/u);
});

void test("cold successor is single purpose and keeps historical shared pins", async () => {
  const helper = await readFile(new URL(`../../${IDENTITY.helper.relativePath}`, import.meta.url), "utf8");
  assert.equal(helper.split("\n")[0], "param([switch]$FootprintInverseNativeDeleteCold209,[switch]$CompileOnly)");
  assert.match(helper, /\$owner=\[EasyedaDiagnosticOwner\]::CreateFootprintInverseNativeDeleteCold209\(\)\n\$owner.RequireNativeDeleteColdBirth\(\)/u);
  assert.ok(helper.indexOf("[EasyedaDiagnosticOwner]::VerifyNativeDeleteColdBirthSmoke()") < helper.indexOf("$owner.Initialize()"));
  assert.ok(helper.includes("$startupRequestLimit=[EasyedaDiagnosticOwner]::NativeDeleteColdRequests"));
  assert.deepEqual(IDENTITY.predecessor, { bytes: CURRENT_PCB_DIAGNOSTIC_HELPER_BYTES, sha256: CURRENT_PCB_DIAGNOSTIC_HELPER_SHA256 });
  assert.equal(PROFILE.normalRequestLimit + PROFILE.cleanupRequestLimit, PROFILE.requestLimit);
});

void test("the original cold accounting method spends controls without consuming CDP IDs", async () => {
  const source = await readFile(new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url), "utf8");
  const start = source.indexOf("  #heldSavedRequest(request:");
  const end = source.indexOf("\n  /** Validate canonical bounded poll bytes", start);
  assert.ok(start !== -1 && end > start);
  // The original method and ledger execute against inert channel and owner stand-ins.
  const context = vm.createContext({
    assert, CURRENT_FOOTPRINT_COPY_HELD_SAVED_CAPACITY, CurrentFootprintCopyHeldSavedResourceLedger,
    requireOriginalHeldSavedLedgerBinding, error: (code: string): Error => new Error(code),
    MAX_LINE: 4096, TRANSPORT: { maximumNativePollBytes: 65_536 },
  });
  const program = `
    class CurrentFootprintCopyHeldSavedStartupChannel {}
    class CurrentFootprintInverseNativeDeleteColdStartupChannel {}
    class CurrentFootprintInverseNativeDeleteColdUiStartupChannel {}
    const channel = new CurrentFootprintInverseNativeDeleteColdStartupChannel();
    function requireNativeColdChannel(value){assert.equal(value,channel);}
    function assertOriginalCurrentFootprintInverseNativeDeleteColdOwner(value){assert.equal(value,original);}
    function classifyForwardRequest(id){assert.equal(this,channel);assert.equal(id,1);return false;}
    function forwardPollWaiting(){assert.equal(this,channel);return true;}
    class Fixture {
      #startupChannel;
      #nativeDeleteColdBirth;
      #nativeDeleteColdUiBirth = null;
      #nativeDeleteColdReadCurrent = () => { assert.equal(this,original); };
      #heldSavedFailed = false; #heldSavedAbortAttempted = false; #closeConsumed = false; #releaseConsumed = false;
      #heldSavedLastCommandCleanup = false; #heldSavedReadCleanup = false;
      #ledger = new CurrentFootprintCopyHeldSavedResourceLedger();
      #pipe = { status(){throw new Error("incorrect legacy poll classifier");} };
      constructor(selected,birth){this.#startupChannel=selected;this.#nativeDeleteColdBirth=birth;this.#ledger.bind(this);}
      #heldSavedResources(){return {ledger:this.#ledger,methods:requireOriginalHeldSavedLedgerBinding(this.#ledger)};}
      invoke(request){return this.#heldSavedRequest(request);}
      ${source.slice(start,end)}
    }
    const original = new Fixture(channel, {});
    const control={action:"footprint-inverse-native-delete-cold-control",requestId:0,phase:"bind",method:"control"};
    assert.throws(()=> new Fixture(new CurrentFootprintCopyHeldSavedStartupChannel(), null).invoke(control), /COLD_CONTROL_ACCOUNTING/u);
    assert.throws(()=> original.invoke({...control,requestId:1}), /COLD_CONTROL_ACCOUNTING/u);
    assert.throws(()=> original.invoke({...control,phase:"other"}), /COLD_CONTROL_ACCOUNTING/u);
    original.invoke(control);
    original.invoke({...control,phase:"own-ready"});
    original.invoke({...control,phase:"get-complete"});
    original.invoke({action:"footprint-inverse-native-delete-cold-own-data",requestId:1,method:"Runtime.getProperties"});
    assert.equal(original.invoke({action:"poll"}).waiting,true);
  `;
  vm.runInContext(stripTypeScriptTypes(program), context);
});

void test("V4 effect writes reprove the cold admission and honors cancellation while waiting", async () => {
  const source = await readFile(new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url), "utf8");
  const queueStart = source.indexOf("  #queuedRequest(request:");
  const queueEnd = source.indexOf("\n  #requestNow(", queueStart);
  const proofStart = source.indexOf("function inverseFullEffectNeedsColdSuccessor(");
  const proofEnd = source.indexOf("\ninterface FootprintInverseFullAllocation", proofStart);
  assert.ok(queueStart !== -1 && queueEnd > queueStart && proofStart !== -1 && proofEnd > proofStart);
  const context = vm.createContext({ assert, error: (code: string): Error => new Error(code) });
  const program = `
    const purpose = "original-v4";
    const CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_PROFILE = { purpose };
    const footprintInverseV4Factories = new WeakMap();
    const footprintForwardWriterCompleteFactories = new WeakMap();
    const options = Object.freeze({ powershellBytes: 1, powershellSha256: "pin" });
    const effects = [
      { action:"footprint-inverse-native-delete-execution", method:"Runtime.callFunctionOn", phase:"inverse-native-delete-sender-invoke" },
      { action:"footprint-inverse-native-delete-execution-forward", method:"Debugger.resume", phase:"inverse-native-delete-execution-forward-resume" },
      { action:"footprint-inverse-native-delete-flow", method:"Debugger.resume", phase:"local//inverse-native-delete-local-resume/localIngress/" },
    ];
    const events = [];
    const gate = Promise.withResolvers();
    const entered = Promise.withResolvers();
    let transportValid = true;
    let helperValid = true;
    let suspend = false;
    function requireFootprintInverseV4Preparation(allocation) { assert.equal(allocation.options, options); }
    function bornFootprintTransport(value) { return value === purpose; }
    function heldCachePurpose() { return false; }
    function selectedFileMainPurpose() { return false; }
    async function verifyCurrentPcbDiagnosticPowerShell(path, pin) {
      assert.equal(path, "fixed.exe");
      assert.equal(pin.bytes, 1);
      assert.equal(pin.sha256, "pin");
      events.push("transport");
      if (!transportValid) { throw new Error("transport changed"); }
    }
    const helper = Object.freeze({async verify() {
      events.push("helper");
      if (!helperValid) { throw new Error("helper changed"); }
      if (suspend) { entered.resolve(); await gate.promise; }
    }});
    const admission = Object.freeze({ helper, options, powershellExecutable:"fixed.exe" });
    ${source.slice(proofStart,proofEnd)}
    class Fixture {
      #startupParent = null; #purpose = purpose; #nativeTail = Promise.resolve();
      #heldSavedFailed = false; #heldSavedAbortAttempted = false; #nativeDeleteColdReadCurrent = null;
      #nativeDeleteColdUiBirth = null; #nativeDeleteColdUiReadCurrent = null;
      #mainTerminateAttempted = false; #closeConsumed = false; #terminationObserved = false; #releaseConsumed = false;
      constructor(coldAdmission) { footprintInverseV4Factories.set(this, {allocation:{coldAdmission,options,sourceKind:"full"}}); }
      #available() {}
      #reproveForwardWriterCreateAtWrite() { throw new Error("unexpected forward writer"); }
      #reproveInverseFullUploadAtWrite() { events.push("workflow"); }
      #requireNativeDeleteColdRequestAtWrite() {}
      #requireNativeDeleteColdUiRequestAtWrite() {}
      #reproveNativeDeleteColdUiAtWrite() { throw new Error("unexpected cold UI branch"); }
      #requestNow() { events.push("native write"); }
      close() { this.#mainTerminateAttempted = true; }
      invoke(request) { return this.#queuedRequest(request, () => { events.push("existing cutoff"); }); }
      ${source.slice(queueStart,queueEnd)}
    }
    (async () => {
      const original = new Fixture(admission);
      await assert.rejects(new Fixture(null).invoke(effects[0]), /COLD_ORIGINAL_ADMISSION/u);
      transportValid = false;
      await assert.rejects(original.invoke(effects[0]), /transport changed/u);
      assert.equal(events.splice(0).join(","), "transport");
      transportValid = true;
      helperValid = false;
      await assert.rejects(original.invoke(effects[0]), /helper changed/u);
      assert.equal(events.splice(0).join(","), "transport,helper");
      helperValid = true;
      for (const effect of effects) { await original.invoke(effect); }
      assert.equal(events.splice(0).join(","), "transport,helper,existing cutoff,native write,transport,helper,existing cutoff,native write,workflow,transport,helper,existing cutoff,native write");
      await original.invoke({action:"poll"});
      assert.equal(events.splice(0).join(","), "existing cutoff,native write");
      suspend = true;
      const pending = original.invoke(effects[1]);
      await entered.promise;
      assert.equal(events.join(","), "transport,helper");
      original.close();
      gate.resolve();
      await assert.rejects(pending, /COLD_EFFECT_CANCELLED/u);
      assert.equal(events.join(","), "transport,helper");
    })()
  `;
  // The only potential write is an event marker in the inert Core fixture.
  await vm.runInContext(stripTypeScriptTypes(program), context);
});
