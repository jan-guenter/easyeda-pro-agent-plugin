import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import vm from "node:vm";
import { isRecord } from "../src/core.ts";
import { CURRENT_FOOTPRINT_COPY_DESTINATION_CALLS as CALLS, decodeCurrentFootprintCopyDestinationFunction } from "../src/current-footprint-copy-destination-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_DESTINATION_PROFILES as PROFILES } from "../src/current-footprint-copy-destination-profiles.ts";
import { CURRENT_FOOTPRINT_COPY_DESTINATION_FIXTURE as SOURCES } from "./helpers/current-footprint-copy-destination-fixture.ts";
import { footprintDestinationWorldSource } from "./helpers/current-footprint-copy-destination-world.ts";

void test("28 destination methods match actual V8 source locations and arities without invoking application code", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    for (const [index, profile] of PROFILES.entries()) {
      const body = SOURCES[index]; assert.ok(body !== undefined);
      assert.equal(Buffer.byteLength(body), profile.bytes); assert.equal(createHash("sha256").update(body).digest("hex"), profile.sha256);
      const offset = profile.kind === "arrow" ? 0 : body.indexOf("(");
      const method = profile.kind === "method";
      let expression = method ? `({${body}})[${JSON.stringify(profile.name)}]` : `(${body})`;
      let insertion = method ? 2 : 1;
      if (profile.kind === "arrow") { insertion = JSON.stringify(profile.name).length + 3; expression = `({${JSON.stringify(profile.name)}:${body}})[${JSON.stringify(profile.name)}]`; }
      const prefix = `"use strict";${"\n".repeat(profile.lineNumber)}${" ".repeat(profile.columnNumber - offset - insertion)}`;
      const response = await session.post("Runtime.evaluate", { expression: prefix + expression, objectGroup: "destination-metadata" });
      assert.equal(response.exceptionDetails, undefined); const id = response.result.objectId; assert.ok(id !== undefined);
      const metadata = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true });
      const position: unknown = metadata.internalProperties?.find(item => item.name === "[[FunctionLocation]]")?.value?.value;
      assert.ok(isRecord(position)); const scriptId = position["scriptId"]; assert.equal(typeof scriptId, "string");
      assert.doesNotThrow(() => { decodeCurrentFootprintCopyDestinationFunction(metadata, String(scriptId), index); }, profile.key);
      assert.throws(() => { decodeCurrentFootprintCopyDestinationFunction(metadata, "different", index); });
    }
  } finally { try { await session.post("Runtime.releaseObjectGroup", { objectGroup: "destination-metadata" }); } finally { session.disconnect(); } }
});

void test("original local route selector rejects cooperative, cloud URL, singleton, queue, owner and method drift without invoking getters", () => {
  for (const mutation of ["", "scope.jr=true", "scope.ln=false", "scope.mc.tool={}", "instance.projectHistory=Object.assign(Object.create(scope._d.prototype),history)",
    "scope.ae.PROJECT_HISTORY.SET='https://foreign.invalid/upload'", "project.uuid='a'.repeat(32)", "project.task1.add(Promise.resolve())",
    "project.localCache={}", "project.isReady=false", "consistency.maxTicket++", "project.canWsPublish=()=>false",
    "Object.defineProperty(scope,'jr',{get(){hooks++;return false;}})"]) {
    const context = vm.createContext({});
    vm.runInContext(`${footprintDestinationWorldSource()}let hooks=0;const original=(${CALLS.capture.program}).call({object:scope},...args);${mutation}`, context);
    const check = (): unknown => vm.runInContext(`(${CALLS.recheck.program}).call({object:scope},...args,original)`, context);
    if (mutation === "") { assert.equal(check(), true); } else { assert.throws(check, /FOOTPRINT_COPY_DESTINATION/u); }
    assert.equal(vm.runInContext("hooks", context), 0);
  }
});
