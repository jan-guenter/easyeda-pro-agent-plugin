/** Offline pinned-source geometry check. No app constructor, file mutation,
 * native helper, renderer, SDK or original runtime authority is involved. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { parse } from "acorn";
import { CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PROFILES, inspectCurrentPcb209SpatialPadSource } from "../server/src/current-pcb-209-spatial-pad-source-profile.ts";

async function main(): Promise<void> {
  if (process.argv.length !== 3) { throw new Error("Expected exact installed PCB source path"); }
  const path = process.argv[2]; if (path === undefined) { throw new Error("PCB source path missing"); }
  const source = await readFile(path, "utf8"); assert.equal(inspectCurrentPcb209SpatialPadSource(source).sourceProfileMatches, true);
  const text = (key: string): string => { const profile = CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PROFILES.find(value => value.key === key);
    if (profile === undefined) { throw new Error(`Missing source profile ${key}`); } return source.slice(profile.sourceStart, profile.sourceEnd); };
  const classText = text("E.class"), expression = parse(`(${classText})`, { ecmaVersion: "latest" }).body[0];
  if (expression?.type !== "ExpressionStatement" || expression.expression.type !== "ClassExpression") { throw new Error("Pinned numeric vector class"); }
  const constructor = expression.expression.body.body.find(value => value.type === "MethodDefinition" && value.kind === "constructor");
  if (constructor === undefined) { throw new Error("Pinned numeric vector constructor"); }
  const vectorConstructor = classText.slice(constructor.start - 1, constructor.end - 1);
  const program = `"use strict";const Ys={${text("Ys.normal")}},e0={${text("e0.hypot")}};
    const E=class{${vectorConstructor}${text("E.distance1")}};${text("j1")};
    const Me={smartMode:false},Style=${text("tC.class")};
    const Model=class{${["tE.get:layerId", "tE.get:center", "tE.get:rotation", "tE.inShape"].map(key => text(key)).join("\n")}};
    const View=class{${text("Mi.isSelect")}};
    const style=Object.assign(Object.create(Style.prototype),{type:"ELLIPSE",width:2,height:2});
    const model=Object.assign(Object.create(Model.prototype),{_layerId:1,_top:style,_center:new E(5,0),_rotation:0});
    const view=Object.assign(Object.create(View.prototype),{model});
    const results=[view.isSelect(5,0,true),view.isSelect(6,0,true),view.isSelect(6.001,0,true),view.isSelect(5,1,true),view.isSelect(5,1.001,true)];
    model._layerId=2;model._bottom=style;results.push(view.isSelect(5,0,true),view.isSelect(3,0,true));results;`;
  const results: unknown = runInNewContext(program, {}, { timeout: 1000 });
  assert.equal(JSON.stringify(results), JSON.stringify([true, true, false, true, false, true, false]));
  process.stdout.write(`${JSON.stringify({ schema: "easyeda-pro-control.pcb209-pad-source-check.v1", sourceProfileMatches: true,
    qualifiedCallees: CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PROFILES.length, actualCircularPointCases: 7,
    nativeExecution: false, originalOwnerIssued: false, connectedAcceptance: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- Explicit bounded offline source-check CLI.
await main();
