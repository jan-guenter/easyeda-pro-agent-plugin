import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { Script } from "node:vm";
import { z } from "zod";
import { CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_PROGRAMS as PROGRAMS } from "../src/current-schematic-wire-net-geometry-programs.ts";
import { currentSchematicWireNetGeometryFrame, validateCurrentSchematicWireNetGeometryCommand } from "../src/current-schematic-wire-net-geometry-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_ORDER as ORDER, CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_PINS as PINS, currentSchematicWireNetGeometryFrames, qualifyCurrentSchematicWireNetGeometrySource } from "../src/current-schematic-wire-net-geometry-source.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_WATCH_SOURCE as WATCH } from "../src/current-schematic-wire-net-watch-source.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

const breakpoint = z.strictObject({
  scriptId: z.string(), lineNumber: z.number().int(), columnNumber: z.number().int(), type: z.string().optional(),
});
const possibleBreakpoints = z.strictObject({ locations: z.array(breakpoint).length(1) });

void test("nonempty Wire geometry frame paths resolve in both complete original scripts", async context => {
  const session = new Session();
  session.connect();
  context.after(() => { session.disconnect(); });
  await session.post("Runtime.enable");
  await session.post("Debugger.enable");
  for (const variant of [0, 1] as const) {
    const scriptSource = await readConfiguredEasyedaAsset(WATCH[variant].relativePath);
    if (scriptSource === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    assert.equal(qualifyCurrentSchematicWireNetGeometrySource({ scriptSource }), variant);
    const compiled = await session.post("Runtime.compileScript", {
      expression: scriptSource, sourceURL: WATCH[variant].relativePath, persistScript: true,
    });
    assert.equal(compiled.exceptionDetails, undefined);
    const scriptId = z.string().min(1).parse(compiled.scriptId);
    for (const step of new Set(ORDER)) {
      for (const [index, [role, columnNumber]] of currentSchematicWireNetGeometryFrames(variant, step).entries()) {
        const { lineNumber } = PINS[variant][role];
        const start = { scriptId, lineNumber, columnNumber };
        const end = { scriptId, lineNumber, columnNumber: columnNumber + 1 };
        // The Node declaration omits this supported V8 Inspector command.
        const raw: unknown = await Reflect.apply(session.post.bind(session), session, ["Debugger.getPossibleBreakpoints", { start, end }]);
        const [selected] = possibleBreakpoints.parse(raw).locations;
        assert.ok(selected !== undefined);
        assert.deepEqual({ scriptId: selected.scriptId, lineNumber: selected.lineNumber, columnNumber: selected.columnNumber }, start);
        if (index === 0 && (step === "constructor" || step === "returned")) { assert.equal(selected.type, "return"); }
        if (index > 0) { assert.equal(selected.type, "call"); }
      }
    }
  }
});

void test("nonempty Wire geometry programs remain bounded and admit only fixed read requests", () => {
  for (const declaration of Object.values(PROGRAMS)) {
    assert.ok(declaration.length <= 16_384);
    assert.doesNotThrow(() => new Script(`(${declaration})`));
  }
  const frame = currentSchematicWireNetGeometryFrame("ctor0", "frame-1");
  assert.throws(() => validateCurrentSchematicWireNetGeometryCommand({ ...frame, params: { ...frame.params, expression: "Reflect.construct(t,[this,r])" } }));
  assert.throws(() => validateCurrentSchematicWireNetGeometryCommand({ ...frame, params: { ...frame.params, throwOnSideEffect: false } }));
  assert.throws(() => validateCurrentSchematicWireNetGeometryCommand({ phase: "wire-net-geometry-resume", method: "Debugger.resume", params: {} }));
});
