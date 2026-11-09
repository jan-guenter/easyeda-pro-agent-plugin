/** Fixed remaining command-store comparisons. Callers must prove the previous
 * delta before taking each fresh entry snapshot. These recipes never call a
 * UI method, notify body, queued watcher, or application continuation. */
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_DELTA as STATUS_DELTA } from "./current-schematic-relevance-history-status-programs.ts";

const head = String.raw`"use strict";const get=native[0],proto=native[2],same=native[3],has=native[4],keys=native[5],apply=native[6],bad=()=>{throw "SCH_COMMAND_STORE_DELTA";},own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;},dense=(o,n)=>{if(!native[7](o)||proto(o)!==native[16]||own(o,"length")!==n||keys(o).length!==n+1)bad();};`;
const mapping = String.raw`dense(objects,19);dense(stores,4);dense(maps,4);for(let j=0;j<4;j++){const o=own(stores,j);if(own(objects,j)!==o||own(objects,j+15)!==own(maps,j)||own(o,"watcherIndex")!==own(maps,j))bad();for(let k=0;k<j;k++)if(o===own(stores,k))bad();}const dictionary=own(objects,4);if(own(own(stores,0),"disableCmdStoreSet")!==dictionary||own(dictionary,"file_save")!==own(stores,1)||own(dictionary,"undo")!==own(stores,2)||own(dictionary,"redo")!==own(stores,3))bad();`;
const mapProof = String.raw`dense(mapSnapshot,4);const mapProto=native[17];if(own(mapProto,"forEach")!==native[10]||get(mapProto,"size").get!==native[11])bad();for(let j=0;j<4;j++){const row=own(mapSnapshot,j),map=own(maps,j);dense(row,3);const names=own(row,1),values=own(row,2),size=own(names,"length");if(size<0||size>8||j===0&&size!==0||proto(map)!==mapProto||keys(map).length!==0||own(row,0)!==map||apply(native[11],map,[])!==size)bad();dense(names,size);dense(values,size);let used=0;apply(native[10],map,[(value,key)=>{if(used===size||!same(key,own(names,used))||value!==own(values,used))bad();used++;}]);if(used!==size)bad();}`;
const snapshot = String.raw`dense(this,19);for(let j=0;j<19;j++){const row=own(this,j);dense(row,3);if(own(row,0)!==own(objects,j)||proto(own(row,0))!==own(row,1))bad();}const before=(o,k)=>{for(let j=0;j<19;j++){const row=own(this,j);if(own(row,0)===o){const d=own(own(row,2),k);if(!has(d,"value")||keys(d).length!==4||own(d,"writable")!==true||own(d,"enumerable")!==true||own(d,"configurable")!==true)bad();return own(d,"value");}}bad();};`;
const counters = String.raw`const main=own(stores,0),oldValue=before(selected,"value");if(oldValue!==undefined&&typeof oldValue!=="boolean")bad();const changed=oldValue!==disabled;for(let j=0;j<2;j++){const o=j===0?main:selected,ticket=before(o,"ticket"),checkpoint=before(o,"checkPoint");if(typeof ticket!=="number"||typeof checkpoint!=="number"||ticket%1!==0||checkpoint%1!==0||same(ticket,-0)||same(checkpoint,-0)||checkpoint<0||checkpoint>ticket||ticket>9007199254740000||ticket-checkpoint>1)bad();}`;

/** -1 is the exact untouched entry, 0 the value assignment before notify,
 * 1 after the optional value notify, and 2 after the mandatory main notify. */
function delta(slot: 2 | 3, disabled: boolean, progress: -1 | 0 | 1 | 2): string {
  return `function(native,objects,stores,maps,mapSnapshot){${head}${mapping}${mapProof}${snapshot}const selected=own(stores,${String(slot)}),disabled=${String(disabled)};${counters}if(${String(progress)}===1&&!changed)bad();for(let j=0;j<19;j++){const row=own(this,j),o=own(row,0),saved=own(row,2),actual=keys(o),expected=keys(saved);if(actual.length!==expected.length)bad();for(let k=0;k<actual.length;k++){const key=actual[k];if(key!==expected[k])bad();const old=own(saved,key),current=get(o,key);if(!current)bad();const fields=keys(old),now=keys(current);if(fields.length!==now.length)bad();for(let m=0;m<fields.length;m++){const name=fields[m];if(name!==now[m])bad();let value=own(old,name);if(name==="value"&&key==="value"&&o===selected&&${String(progress)}>=0)value=disabled;if(name==="value"&&key==="ticket"&&(o===main&&${String(progress)}===2||o===selected&&changed&&${String(progress)}>=1)){if(value===before(o,"checkPoint"))value++;}if(!same(value,own(current,name)))bad();}}}return true;}`;
}
function entry(command: "undo" | "redo", disabled: boolean): string {
  return `function(native,stores,target){${head}dense(this,4);dense(stores,4);if(typeof target!=="function"||own(this,0)!==target||own(this,1)!==${JSON.stringify(command)}||own(this,2)!==${String(disabled)}||own(this,3)!==own(stores,0))bad();return true;}`;
}
export interface CurrentSchematicRelevanceCommandStoreRecipe {
  readonly kind: "menu" | "toolbar"; readonly command: "undo" | "redo"; readonly disabled: boolean; readonly slot: 2 | 3;
  readonly sourceRole: "menuDisabled" | "toolbarDisabled"; readonly expression: "[this,t,e,e0]";
  readonly entry: string; readonly before: string; readonly deltas: readonly [string, string, string];
  readonly continuationAuthorized: false; readonly queuedNotificationsCompleted: false; readonly modifyCompleted: false; readonly saveAuthorized: false;
}
const recipe = (kind: "menu" | "toolbar", command: "undo" | "redo", disabled: boolean, slot: 2 | 3): CurrentSchematicRelevanceCommandStoreRecipe => Object.freeze({
  kind, command, disabled, slot, sourceRole: kind === "menu" ? "menuDisabled" : "toolbarDisabled",
  expression: "[this,t,e,e0]", entry: entry(command, disabled),
  before: delta(slot, disabled, -1), deltas: Object.freeze([delta(slot, disabled, 0), delta(slot, disabled, 1), delta(slot, disabled, 2)] as const),
  continuationAuthorized: false, queuedNotificationsCompleted: false, modifyCompleted: false, saveAuthorized: false,
});
export const CURRENT_SCHEMATIC_RELEVANCE_COMMAND_STORE_RECIPES = freezeDeep([
  recipe("menu", "undo", false, 2), recipe("menu", "redo", true, 3),
  recipe("toolbar", "undo", false, 2), recipe("toolbar", "redo", true, 3),
] as const);

function replaceOne(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("SCH_COMMAND_STORE_FIXED_QUEUE"); }
  return source.replace(before, after);
}
function queue(index: 2 | 3, disposed: boolean): string {
  let source = replaceOne(STATUS_DELTA, "expected=1;", `expected=${String(index)};`);
  if (disposed) {
    source = replaceOne(source, "expected=status;", "expected=void 0;");
    source = replaceOne(source, "expected=args;", "expected=void 0;");
    source = replaceOne(source, 'key==="current"?status:args', "void 0");
  }
  return source;
}
/** Same complete original status snapshot, with only the source-owned queue
 * transitions changed. The generic SAME recipe remains unmodified. */
export const CURRENT_SCHEMATIC_RELEVANCE_COMMAND_STORE_QUEUE = Object.freeze({
  menu: queue(2, false), toolbar: queue(3, false), disposed: queue(3, true),
});
