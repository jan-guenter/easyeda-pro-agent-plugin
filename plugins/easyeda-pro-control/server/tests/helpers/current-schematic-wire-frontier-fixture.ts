/** Original callback creation methods and completion functions in inert
 * surroundings. Event transports and model/history data are stand-ins. */
import assert from "node:assert/strict";
import { CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE as SOURCE, qualifyCurrentSchematicWireCompletionSource as qualify } from "../../src/current-schematic-wire-completion-source.ts";
import { CURRENT_SCHEMATIC_WIRE_PUBLICATION_SOURCE as PUBLICATION, qualifyCurrentSchematicWirePublicationSource as publication } from "../../src/current-schematic-wire-publication-source.ts";
import { GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE as NATIVE_SOURCE } from "../../src/generated-schematic-wire-native-source.ts";

/** Preserve every selected function's vendor bytes and actual source PC. */
export function wireFrontierFixture(source: string, variant: 0 | 1): string {
  assert.equal(qualify({ scriptSource: source }), variant); assert.equal(publication({ scriptSource: source }), variant);
  const rows = SOURCE[variant].rows; const netWatch = NATIVE_SOURCE[variant]?.methods.netPointWatch; assert.ok(netWatch !== undefined);
  const historyStart = source.lastIndexOf("watch(){this._isWatched=!0;", rows.historyStart.start); const ending = "return r.forEach(s=>{n.register(s)}),n}";
  const historyEnd = source.indexOf(ending, historyStart) + ending.length;
  assert.ok(historyStart > rows.historyRecord.end && historyEnd > rows.historyStart.end);
  const pieces: { start: number; end: number; text: string }[] = [];
  const add = (start: number, end: number, text: string): void => { assert.equal(text.length, end - start); pieces.push({ start, end, text }); };
  const before = (position: number, text: string): void => { add(position - text.length, position, text); };
  const after = (position: number, text: string): void => { add(position, position + text.length, text); };
  const original = (role: "netPointBuild" | "netPointAnalyze" | "netPointRefresh" | "historyTransact" | "historyRecord"): void => { const row = rows[role]; add(row.start, row.end, source.slice(row.start, row.end)); };
  const prefix = `(function(){"use strict";const refs={},counts={historyClear:0,dispose:0,updated:0};
const subscriptions=()=>({register(value){return value},dispose(){counts.dispose++}}),tn=()=>({dispose(){}}),rn=tn,Cr=()=>{},Token=class{constructor(){this.canRecord=true}update(){counts.updated++}},pf=Token,Pf=Token;
const event=()=>({_size:0,_listenerSubscriptions:[],register(cb){const value={cb};this._listenerSubscriptions.push(value);this._size++;return{dispose(){}}},dispatch(value){for(const sub of this._listenerSubscriptions)sub.cb(value)}});
const shapes={docManager:{onAttrChange(){return{dispose(){}}}},isSchShapeManager(){return false},getModels(){return[]}},line={shapeManager:shapes},group={shapeManager:shapes},runner={_currentAction:null,running:false};
const bbox={_onUpdate:event(),_modelTypesShouldUpdateBBox:new Set(["Wire"])},historyFields={shapeManager:shapes,_watchSubscriptions:subscriptions(),_dataOnChangeSubscriptions:subscriptions(),modelCommandMap:new Map,clearTempData(){counts.historyClear++;this.modelCommandMap.clear()},batchSaveStack:new Set([new Token]),_undoCommands:[],_redoCommands:[],maxLength:50,status:{},_onWillRecord:event(),_onDidRecord:event(),_onStatusChange:event()};
const historyNames=["BatchSaveStackWillRecord","BatchSaveEnd","BatchSaveWillEnd","BatchSaveStart"];for(const name of historyNames){const e=event();historyFields["_on"+name]=e;historyFields["on"+name]=e.register.bind(e);}
const netFields={shapeManager:shapes,_watchSubscriptions:subscriptions(),junctionModels:new Set,unConnectDotModels:new Set,pointRangeRTree:{dispose(){}},netGroupConnectedMap:new Map,busEntryOrSymbolConnectedMap:new Map},before={line,wire:group},state={owner:null,before,failed:false,modifyAttempted:true,modifyAcknowledged:false,saveAttempted:false},upload={},consistency={uploadImpl:upload},b={line,group,shapes,runner,consistency},holder=[b,state];state.owner=holder;shapes.actionRunner=runner;shapes.bboxMonitor=bbox;bbox.onUpdate=bbox._onUpdate.register.bind(bbox._onUpdate);
const native=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype];
`;
  const flatPrefix = prefix.replaceAll("\n", "");
  assert.ok(!source.slice(0, flatPrefix.length).includes("\n")); add(0, flatPrefix.length, flatPrefix);
  before(rows.netPointBuild.start, "refs.Net=class{"); original("netPointBuild"); original("netPointAnalyze"); original("netPointRefresh"); add(netWatch.start, netWatch.end, source.slice(netWatch.start, netWatch.end)); after(netWatch.end, "};");
  before(rows.historyTransact.start, "refs.HistoryBase=class{"); original("historyTransact"); original("historyRecord"); after(rows.historyRecord.end, "};");
  before(historyStart, "refs.History=class extends refs.HistoryBase{"); add(historyStart, historyEnd, source.slice(historyStart, historyEnd)); after(historyEnd, "};");
  const pub = PUBLICATION[variant].rows;
  for (const [key, row] of [["bs", pub.historyBusStart], ["be", pub.historyBusEnd]] as const) {
    before(row.start, `refs.${key}=(function(e){return`); add(row.start, row.end, source.slice(row.start, row.end)); after(row.end, "}).call(upload,shapes);");
  }
  const tail = `const net=Object.assign(new refs.Net,netFields),history=Object.assign(new refs.History,historyFields);shapes.netPointManager=net;shapes.historyRecorder=history;net.watch();history.watch();history._onBatchSaveStart.register(refs.bs);history._onBatchSaveEnd.register(refs.be);return{holder,native,bbox,history,net,counts,drive(){runner._currentAction={history:"add",status:"running"};runner.running=true;history._onBatchSaveStart.dispatch();runner._currentAction.status="willDidRun";history.transactionSuccessHandler();bbox._onUpdate.dispatch({modelTypes:bbox._modelTypesShouldUpdateBBox})}};})()`;
  before(source.length, tail);
  const sorted = pieces.toSorted((a, b) => a.start - b.start); const out: string[] = []; let cursor = 0;
  for (const piece of sorted) { assert.ok(piece.start >= cursor, JSON.stringify(piece)); out.push(source.slice(cursor, piece.start).replaceAll(/[^\r\n]/gu, character => " ".repeat(character.length)), piece.text); cursor = piece.end; }
  out.push(source.slice(cursor).replaceAll(/[^\r\n]/gu, character => " ".repeat(character.length))); return out.join("");
}
