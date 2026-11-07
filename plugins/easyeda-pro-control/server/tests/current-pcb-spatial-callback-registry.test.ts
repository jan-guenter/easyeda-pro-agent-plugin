import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION } from "../src/current-pcb-209-spatial-capture-program.ts";

/** Minimal descriptor graph using constructor identifiers reviewed against the
 * complete admitted a8405930 PCB asset; the callback must never execute. */
function fixture(bridge: string, bus: string, task: string, running: boolean): string { return `
    class ${task} { constructor(callback) { this.callback=callback; this.isRunning=${String(running)}; } }
    class ${bus} { constructor() { this.subscribed={"pcb/extensionAPI/document-getPrimitiveAtPoint":[new ${task}(()=>{throw Error("callback executed")})]}; } }
    class ${bridge} { constructor() { this.messageBus=new ${bus}(); } }
    globalThis.MSG_BUS_PCB=new ${bridge}();`; }
/** Execute only the fixed callback capture in the synthetic registry realm. */
function capture(bridge: string, bus: string, task: string, running: boolean): unknown {
  return runInNewContext(`${fixture(bridge, bus, task, running)}\n${CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION}`, {}, { timeout: 1000 });
}

void test("current209 registry capture accepts its actual constructor names and rejects stale names or canceled tasks", () => {
  assert.equal(typeof capture("YJ", "Net", "rye", true), "function");
  for (const names of [["HJ", "Net", "rye"], ["YJ", "Oet", "rye"], ["YJ", "Net", "Z1e"]] as const) {
    assert.throws(() => capture(names[0], names[1], names[2], true), /PCB209_SPATIAL_CAPTURE_REFUSED/u);
  }
  assert.throws(() => capture("YJ", "Net", "rye", false), /PCB209_SPATIAL_CAPTURE_REFUSED/u);
});
