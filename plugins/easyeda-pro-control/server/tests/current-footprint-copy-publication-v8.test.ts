/** Actual Node V8 metadata and closure descriptors over pinned worker bodies.
 * This is not EasyEDA's runtime or evidence of an arrow's hidden receiver. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { decodeCurrentFootprintCopyDependencyFunction, decodeCurrentFootprintCopyStructureCallback,
  decodeCurrentFootprintCopyStructureCallbackMetadata, decodeCurrentFootprintCopyStructureScope } from "../src/current-footprint-copy-dependency-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_STRUCTURE_CALLBACK_PROFILE as CALLBACK, CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES as PROFILES } from "../src/current-footprint-copy-dependency-profiles.ts";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_FIXTURE as SOURCES, CURRENT_FOOTPRINT_COPY_STRUCTURE_CALLBACK_FIXTURE as SOURCE_CALLBACK } from "./helpers/current-footprint-copy-dependency-fixture.ts";

/** Extract the actual inspector-assigned script ID for location comparisons. */
function scriptId(input: unknown): string {
  assert.ok(isRecord(input) && typeof input["scriptId"] === "string"); return input["scriptId"];
}
/** Read only Nd.e through V8's virtual scope wrapper in this isolated Node test;
 * the captured vendor callback is returned as a handle and never invoked. */
function readScope(session: Session, objectId: string, objectGroup: string): Promise<unknown> {
  const params = { objectId, functionDeclaration: "function(){return this.object.e}", arguments: [], objectGroup, throwOnSideEffect: true };
  return session.post("Runtime.callFunctionOn", params);
}
void test("native V8 metadata retains both publication methods and exact Nd.e callback without invoking them", async () => {
  const session = new Session(); session.connect(); const group = "footprint-publication-v8";
  try {
    await session.post("Runtime.enable");
    for (const index of [61, 62]) {
      const body = SOURCES[index], profile = PROFILES[index]; assert.ok(profile !== undefined && body !== undefined);
      const prefix = `"use strict";${"\n".repeat(profile.lineNumber)}${" ".repeat(profile.columnNumber - body.indexOf("(") - 2)}`;
      const reply = await session.post("Runtime.evaluate", { expression: `${prefix}({${body}})[${JSON.stringify(profile.name)}]`, objectGroup: group });
      const id = reply.result.objectId; assert.ok(id !== undefined && reply.exceptionDetails === undefined);
      const metadata = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true });
      const location: unknown = metadata.internalProperties?.find(item => item.name === "[[FunctionLocation]]")?.value?.value;
      decodeCurrentFootprintCopyDependencyFunction(metadata, scriptId(location), index);
    }
    const wrapper = PROFILES[63], wrapperSource = SOURCES[63]; assert.ok(wrapper !== undefined && wrapperSource !== undefined);
    const declaration = `function Nd(e){let t=null,s=null,r;return${wrapperSource}}`;
    const prefix = `"use strict";${"\n".repeat(wrapper.lineNumber)}${" ".repeat(wrapper.columnNumber - declaration.indexOf(wrapperSource))}`;
    const assignment = "globalThis.__easyedaFootprintNdV8=Nd(";
    const expression = `${prefix}${declaration}${"\n".repeat(CALLBACK.lineNumber - wrapper.lineNumber)}${" ".repeat(CALLBACK.columnNumber - assignment.length)}${assignment}${SOURCE_CALLBACK})`;
    const reply = await session.post("Runtime.evaluate", { expression, objectGroup: group });
    const wrapperId = reply.result.objectId; assert.ok(wrapperId !== undefined && reply.exceptionDetails === undefined);
    const metadata = await session.post("Runtime.getProperties", { objectId: wrapperId, ownProperties: true });
    const location: unknown = metadata.internalProperties?.find(item => item.name === "[[FunctionLocation]]")?.value?.value;
    const originalScript = scriptId(location), scopesId = decodeCurrentFootprintCopyDependencyFunction(metadata, originalScript, 63);
    const scope = decodeCurrentFootprintCopyStructureScope(await session.post("Runtime.getProperties", { objectId: scopesId, ownProperties: true }));
    const callback = await readScope(session, scope, group);
    const callbackId = decodeCurrentFootprintCopyStructureCallback(callback);
    decodeCurrentFootprintCopyStructureCallbackMetadata(await session.post("Runtime.getProperties", { objectId: callbackId, ownProperties: true }), originalScript);
  } finally {
    try {
      await session.post("Runtime.evaluate", { expression: "delete globalThis.__easyedaFootprintNdV8" });
      await session.post("Runtime.releaseObjectGroup", { objectGroup: group });
    } finally { session.disconnect(); }
  }
});
