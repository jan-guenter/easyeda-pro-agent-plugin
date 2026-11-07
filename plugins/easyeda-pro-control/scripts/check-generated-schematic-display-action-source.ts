/** Offline source and inert history-data check. No application construction,
 * renderer/native process, SDK action, getter/setter, Save or SQL is executed. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { canonicalJson } from "../server/src/core.ts";
import { qualifyGeneratedSchematicDisplayActionSource } from "../server/src/generated-schematic-display-action-replies.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE_ROLES as ROLES, GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE as SOURCES } from "../server/src/generated-schematic-display-action-source.ts";

async function main(): Promise<void> {
  const assetsRoot = process.argv[2] ?? "/mnt/c/Program Files/easyeda-pro/resources/app/assets";
  for (const [index, profile] of SOURCES.entries()) {
    const bytes = await readFile(join(assetsRoot, profile.relativePath)), source = bytes.toString("utf8");
    assert.equal(bytes.length, profile.bytes); assert.equal(createHash("sha256").update(bytes).digest("hex"), profile.sha256);
    assert.equal(qualifyGeneratedSchematicDisplayActionSource({ scriptSource: source }), index);
    assert.ok(source.includes(index === 0 ? 'var Fl="parent";' : 'var Zl="parent";'));
    const body = (role: typeof ROLES[number]): string => { const method = profile.methods[role]; return source.slice(method.start, method.end); };
    for (const role of ROLES) {
      const method = profile.methods[role]; if (method.kind !== "implicit-class") {
      const text = body(role); let parameter = 0;
      if (method.kind !== "arrow") { parameter = text.indexOf("(", method.kind === "class" ? text.indexOf("constructor") : 0); }
      assert.ok(parameter >= 0); const lines = source.slice(0, method.start + parameter).split("\n");
      assert.equal(lines.length - 1, method.lineNumber); assert.equal(lines.at(-1)?.length, method.columnNumber);
      }
    }
    const value: unknown = runInNewContext(`
const Fl="parent",Zl=Fl,Cr=(${body("noop")}),cleanups=[],tn=callback=>({dispose:callback}),rn=tn,text={tagName:"Text",notAddHistory:false,parent:{id:"root"}},command={model:text,oldData:{},newData:{}};
const commandMethods={${body("commandAttribute")}},factory={${body("historyWithResolvers")}};command.onAttrChange=commandMethods.onAttrChange;
const t={docManager:{onAttrChange:()=>({dispose:Cr})}},history={batchSaveStack:undefined,_createGroupHistoryCommand:()=>({inert:true}),_dataOnChangeSubscriptions:{register:entry=>cleanups.push(entry)},getModelHistoryCommand:model=>{if(model!==text)throw new Error("Model changed");return command;}};
history._tryHandleGroupModelCommand=(function(){return ${body("historyTryGroup")};}).call(history);
history.onModelAttributeChange=Cr;const batchStart=(function(){return ${body("historyBatchStart")};}).call(history);
let starts=0;history._onBatchSaveStart={dispatch:()=>{starts++;batchStart();}};history.withResolvers=factory.withResolvers;history.isWatched=true;
const unused=history.withResolvers();if(history.onModelAttributeChange!==Cr)throw new Error("Premature history callback");
const shapes={historyRecorder:history},runner={currentAction:{history:"add",status:"running"},_historyResolversMap:new WeakMap(),${body("runnerTryStartHistory")}};
runner._tryStartHistory(shapes);const resolver=runner._historyResolversMap.get(shapes);runner._tryStartHistory(shapes);
if(resolver===unused||starts!==1)throw new Error("Original runner resolver mismatch");
const names=[resolver.start.name,resolver.complete.name,resolver.failure.name],arities=[resolver.start.length,resolver.complete.length,resolver.failure.length];
const started=history.batchSaveStack!==undefined,active=history.onModelAttributeChange;if(active===Cr||resolver.start()!==false)throw new Error("Batch startup mismatch");
active({model:text,attr:"rotation",oldValue:0,newValue:90});
const result={started,names,arities,activeName:active.name,activeArity:active.length,activeSource:Function.prototype.toString.call(active),oldRotation:command.oldData.attrs.rotation,newRotation:command.newData.attrs.rotation,parentKept:command.oldData.parent===text.parent&&command.newData.parent===text.parent,cleanupEntries:cleanups.length};
cleanups[0].dispose();result.resetToIdle=history.onModelAttributeChange===Cr;JSON.parse(JSON.stringify(result));`, {}, { timeout: 1000 });
    assert.ok(value !== null && typeof value === "object");
    assert.equal(canonicalJson(value), canonicalJson({ started: true, names: [profile.methods.resolverStart.name, profile.methods.resolverComplete.name, profile.methods.resolverFailure.name],
      arities: [0, 0, 0], activeName: profile.methods.historyActiveAttribute.name, activeArity: 1, activeSource: body("historyActiveAttribute"), oldRotation: 0, newRotation: 90,
      parentKept: true, cleanupEntries: 2, resetToIdle: true }));
  }
  process.stdout.write(`${JSON.stringify({ ok: true, completeSourceFiles: 2, exactSourceSpans: 60, inertResolverAndTextHistoryCases: 2,
    nativeExecutionVerified: false, actualActionCallbackObserved: false, completeActionFrontierQualified: false, writerAuthority: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- Await only this fixed offline source/data checker.
await main();
