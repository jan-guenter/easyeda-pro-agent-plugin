/** Offline decoder/style math only, with the model allocation tail replaced
 * by an explicit inert capture. No application or native project is created. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { MANAGED_PAD_FIXTURE_BODY, MANAGED_PAD_FIXTURE_FIELDS, MANAGED_PAD_FIXTURE_PROFILE } from "../server/src/managed-pad-fixture-generator.ts";

async function main(): Promise<void> {
  const path = process.argv[2]; if (process.argv.length !== 3 || path === undefined) { throw new Error("Expected exact installed PCB source path"); }
  const profile = MANAGED_PAD_FIXTURE_PROFILE; const source = await readFile(path, "utf8");
  assert.equal(Buffer.byteLength(source), profile.source.bytes); assert.equal(createHash("sha256").update(source).digest("hex"), profile.source.sha256);
  for (const method of profile.sourceMethods) { assert.equal(createHash("sha256").update(source.slice(method.start, method.end)).digest("hex"), method.sha256); }
  const text = (name: string): string => { const method = profile.sourceMethods.find(value => value.name === name); if (method === undefined) { throw new Error(`Missing Pad source ${name}`); } return source.slice(method.start, method.end); };
  const methods = ["feed", "parseHole", "parseSpecialPad", "parseDefaultPad", "check", "padVerify", "initData", "padCheck", "prepareExpansion", "finish"].map(name => text(`padDecoder.${name}`));
  const program = `"use strict";const Yg={ELLIPSE:"ELLIPSE",OVAL:"OVAL",RECT:"RECT",POLYGON:"POLYGON"},MA={NORMAL:"NORMAL",TEST:"TEST",MARKER:"MARKER"};
    class E{constructor(x,y){this.x=x;this.y=y}};E.ORIGIN=new E(0,0);const ph=.003937;
    ${text("Xa")}${text("LVe")}${text("cGe")}${text("$S")}
    const tC=${text("tC.class")},Factory=${text("ZCe.class")},Zo=new Factory;${text("HFe")}
    const Base=class{${text("decodeBase.isNumber")}},Decoder=class extends Base{${text("padDecoder.constructor")}${methods.join("\n")}};
    const decoder=new Decoder;decoder.resultNeedToBeCached=false;decoder.getItem=function(styles){return{layerId:this.layerId,num:this.num,center:this.center,rotation:this.rotation,locked:this.locked,styles};};
    const fields=({${text("Jg.getPAD")}}).getPAD("2.0");decoder.feed(${JSON.stringify({ id: "0a00000000000001", ...MANAGED_PAD_FIXTURE_BODY })});
    const checked=decoder.check(),result=decoder.finish();JSON.stringify({fields,checked,result});`;
  const raw: unknown = runInNewContext(program, {}, { timeout: 1000 }); assert.equal(typeof raw, "string");
  assert.equal(raw, JSON.stringify({ fields: MANAGED_PAD_FIXTURE_FIELDS, checked: true, result: { layerId: 1, num: "1", center: { x: 0, y: 0 }, rotation: 0, locked: false,
    styles: { top: { type: "ELLIPSE", width: 20, height: 20, ratio: 0, pl: null }, bottom: null, inner: null, hole: null }, padType: 0 } }));
  process.stdout.write(`${JSON.stringify({ schema: "easyeda-pro-control.generated-pad-fixture-source-check.v1", fullSourceAndMethodSpansMatched: true,
    actualDecoderAndStyleProjectionMatched: true, modelAllocationTailExecuted: false, nativeImportExecuted: false, connectedAcceptance: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- Explicit bounded offline source-check CLI.
await main();
