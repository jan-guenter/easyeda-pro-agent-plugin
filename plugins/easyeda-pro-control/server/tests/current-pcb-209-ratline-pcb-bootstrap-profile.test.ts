import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES, CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_SOURCES,
  currentPcb209RatlinePcbBootstrapCopy, currentPcb209RatlinePcbBootstrapRoleUrl,
  qualifyCurrentPcb209RatlinePcbBootstrapCopyCreator, qualifyCurrentPcb209RatlinePcbBootstrapCopyPause,
  qualifyCurrentPcb209RatlinePcbBootstrapSource } from "../src/current-pcb-209-ratline-pcb-bootstrap-profile.ts";

void test("PCB bootstrap pins the inline modes and exact imported script sources before PCB execution", () => {
  assert.equal(CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES.length, 29);
  const assets = CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES.filter(role => currentPcb209RatlinePcbBootstrapCopy(role) === null);
  assert.deepEqual(assets, ["bootstrap", "define-top", "preload", "api", "engine", "pcb"]);
  assert.equal(currentPcb209RatlinePcbBootstrapRoleUrl("bootstrap", "https://client/editor?entry=pcb"), "https://client/editor?entry=pcb");
  assert.throws(() => currentPcb209RatlinePcbBootstrapRoleUrl("bootstrap", "https://client/editor?entry=pcb.js"));
  assert.equal(currentPcb209RatlinePcbBootstrapRoleUrl("engine", "ignored"), "https://modules.lceda.cn/smt-gl-engine/3.2.56.b216263a/smt-gl-engine.js");
  for (const source of CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_SOURCES) {
    assert.doesNotThrow(() => { qualifyCurrentPcb209RatlinePcbBootstrapSource("bootstrap", { scriptSource: source }); });
    for (const changed of [`${source}\n`, source.replace("3.2.209", "3.2.210"), source.replace("EASYEDA", "LCEDA")]) {
      assert.throws(() => { qualifyCurrentPcb209RatlinePcbBootstrapSource("bootstrap", { scriptSource: changed }); });
    }
  }
  const defineTop = "(()=>{window.EDITOR_TOP=window.parent;})();\n//# sourceMappingURL=https://modules.lceda.cn/pro-mgr/3.2.185.bf63a159/js/define-top.js.map\n";
  assert.doesNotThrow(() => { qualifyCurrentPcb209RatlinePcbBootstrapSource("define-top", { scriptSource: defineTop }); });
  assert.throws(() => { qualifyCurrentPcb209RatlinePcbBootstrapSource("define-top", { scriptSource: defineTop.replace("window.parent", "window.top") }); });
  for (const role of CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES) {
    assert.throws(() => { qualifyCurrentPcb209RatlinePcbBootstrapSource(role, { scriptSource: "unqualified source" }); });
  }
});

void test("PCB bootstrap refuses hostile getScriptSource replies without invoking hooks", () => {
  let hooks = 0;
  const getter = (): never => { hooks += 1; throw new Error("Unexpected source getter"); };
  const first = CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_SOURCES[0]; assert.ok(first !== undefined);
  const accessor = Object.defineProperty({}, "scriptSource", { get: getter }), ordinary = { scriptSource: first };
  const hidden = Object.defineProperty({}, "scriptSource", { value: first });
  for (const raw of [accessor, hidden, new Proxy(ordinary, { ownKeys: getter }), Object.create(ordinary) as unknown,
    { ...ordinary, extra: true }, { ...ordinary, [Symbol("extra")]: true }, { scriptSource: "\uD800" }]) {
    assert.throws(() => { qualifyCurrentPcb209RatlinePcbBootstrapSource("bootstrap", raw); });
  }
  assert.equal(hooks, 0);
});

void test("all 23 PCB copied-function stages bind their original asset, creator and distinct ordered caller", () => {
  const callers = new Set<string>(), counts = { preload: 0, api: 0, engine: 0 };
  for (const role of CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES) {
    const copy = currentPcb209RatlinePcbBootstrapCopy(role);
    if (copy !== null) {
    counts[copy.ownerRole] += 1; assert.equal(currentPcb209RatlinePcbBootstrapRoleUrl(role, "frame-url"), "");
    const identity = `${copy.ownerRole}:${String(copy.caller.lineNumber)}:${String(copy.caller.columnNumber)}`;
    assert.equal(callers.has(identity), false); callers.add(identity);
    const frame = { ...copy.creator, scriptId: "original-source", url: currentPcb209RatlinePcbBootstrapRoleUrl(copy.ownerRole, "") };
    const parsed = { url: "", hasSourceURL: false, isLiveEdit: false, stackTrace: { callFrames: [frame] } };
    assert.doesNotThrow(() => { qualifyCurrentPcb209RatlinePcbBootstrapCopyCreator(role, "original-source", parsed); });
    assert.throws(() => { qualifyCurrentPcb209RatlinePcbBootstrapCopyCreator(role, "foreign-source", parsed); });
    assert.throws(() => { qualifyCurrentPcb209RatlinePcbBootstrapCopyCreator(role, "original-source", { ...parsed,
      stackTrace: { callFrames: [{ ...frame, columnNumber: frame.columnNumber + 1 }] } }); });
    const callFrames = [
      { functionName: "", location: { scriptId: "copy", lineNumber: 0, columnNumber: 0 } },
      { functionName: copy.creator.functionName, location: { scriptId: "original-source", lineNumber: copy.creator.lineNumber, columnNumber: copy.creator.columnNumber } },
      { functionName: "", location: { scriptId: "original-source", lineNumber: copy.caller.lineNumber, columnNumber: copy.caller.columnNumber } },
    ];
    const pause = { reason: "instrumentation", data: { scriptId: "copy", url: "" }, hitBreakpoints: [], callFrames };
    assert.doesNotThrow(() => { qualifyCurrentPcb209RatlinePcbBootstrapCopyPause(role, "copy", "original-source", pause); });
    assert.throws(() => { qualifyCurrentPcb209RatlinePcbBootstrapCopyPause(role, "other-copy", "original-source", pause); });
    assert.throws(() => { qualifyCurrentPcb209RatlinePcbBootstrapCopyPause(role, "copy", "original-source", { ...pause,
      callFrames: [...callFrames.slice(0, 2), { functionName: "", location: { scriptId: "original-source", lineNumber: copy.caller.lineNumber, columnNumber: copy.caller.columnNumber + 1 } }] }); });
    }
  }
  assert.deepEqual(counts, { preload: 4, api: 4, engine: 15 });
});
