/** Complete installed functions execute with inert tree/project sinks only. */
import assert from "node:assert/strict";
import { CURRENT_SCHEMATIC_WIRE_ASYNC_SOURCE as SOURCE, qualifyCurrentSchematicWireAsyncSource as qualify } from "../../src/current-schematic-wire-async-source.ts";
import type { CurrentSchematicWireAsyncRole as Role, CurrentSchematicWireAsyncTree as Tree } from "../../src/current-schematic-wire-async-source.ts";
import { CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE as COMPLETION } from "../../src/current-schematic-wire-completion-source.ts";

function padded(source: string, pieces: readonly Readonly<{ start: number; end: number; text: string }>[]): string {
  const out: string[] = []; let cursor = 0;
  for (const piece of pieces.toSorted((a, b) => a.start - b.start)) { assert.ok(piece.start >= cursor); assert.equal(piece.text.length, piece.end - piece.start); out.push(source.slice(cursor, piece.start).replaceAll(/[^\r\n]/gu, c => " ".repeat(c.length)), piece.text); cursor = piece.end; }
  out.push(source.slice(cursor).replaceAll(/[^\r\n]/gu, c => " ".repeat(c.length))); return out.join("");
}
/** One complete selected function keeps its exact original source PC. */
export function wireAsyncMetadataFixture(source: string, variant: 0 | 1, role: Role): string {
  assert.equal(qualify({ scriptSource: source }), variant); const row = SOURCE[variant].rows[role]; let prefix: string; let suffix: string;
  if (row.form === "declaration") { prefix = '(function(){"use strict";'; suffix = `;return ${row.name};})()`; }
  else if (row.form === "method") { prefix = '(function(){"use strict";const refs={'; suffix = `};return refs.${row.name};})()`; }
  else { prefix = '(function(){"use strict";return '; suffix = ";})()"; }
  return padded(source, [{ start: row.start - prefix.length, end: row.start, text: prefix }, { start: row.start, end: row.end, text: source.slice(row.start, row.end) }, { start: row.end, end: row.end + suffix.length, text: suffix }]);
}
/** The original object-tree async body waits at inert ft before completing.
 * Original UG.passContentData ignores its child Promise exactly as installed. */
export function wireAsyncFixture(source: string, variant: 0 | 1, treeRole: Tree = "objectContent", dirty = true): string {
  assert.equal(qualify({ scriptSource: source }), variant); const rows = SOURCE[variant].rows; const pass = COMPLETION[variant].rows.astPassContent;
  const pieces: { start: number; end: number; text: string }[] = [];
  const add = (start: number, end: number, text: string): void => { pieces.push({ start, end, text }); };
  const before = (start: number, text: string): void => { add(start - text.length, start, text); };
  const after = (end: number, text: string): void => { add(end, end + text.length, text); };
  const prefix = '(function(){"use strict";let resolve;const deferred=new Promise(r=>{resolve=r}),counts={parent:0,fills:0},refs={},ho={debug(){},info(){}},co=ho,nu=()=>()=>0,cu=nu,Z={isBuild:false,isPass:false,lastModify:1,prjName:"inert",schematics:{sch:{sort:["page"],displayTitle:"sheet"}},pureSchematics:{sch:{nlNetWires:new Set,displayTitle:"sheet"}},pcbs:{}},_e={PRJ:1,SCH:2,BLOCK:3},C={leftTreeNetActiveTab:"Net"},W_={COMPONENT:"Component"},B1=()=>({blocks:[{sch:"sch",name:"sheet"}],exceptBoards:[{sch:"sch",name:"sheet",type:2}],boards:[]}),ev=B1,V=(rows,cb)=>{for(const [i,row]of Object.entries(rows))cb(i,row)},ft=async(rows,cb)=>{await deferred;for(const [i,row]of rows.entries())await cb(i,row)};let Ue;const tree={ticket:0,renderTicket:0,isSearch:false,tempContentDataIndex:{},expandAllIndex:new Map,partLenCache:{sch:{partLen:0,realPartLen:0}},divideSymbolCollect(){},generateContentData(){return{status:true,margin:0}},fillSchematic(){counts.fills++},lastModify:0},shapes={},line={shapeManager:shapes},group={shapeManager:shapes},metadata={projectId:"inert"},page={shapeManager:shapes},host={currentProject:metadata},state={owner:null,before:{line,wire:group},failed:false,modifyAttempted:true,modifyAcknowledged:false,saveAttempted:false},b={line,group,shapes,page,host,metadata},holder=[b,state];state.owner=holder;const native=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype];';
  add(0, prefix.length, prefix);
  for (const role of ["serial", "astOn"] as const) { const row = rows[role]; add(row.start, row.end, source.slice(row.start, row.end)); after(row.end, ";"); }
  const target = rows[treeRole]; before(target.start, "refs.target=(function(){return "); add(target.start, target.end, source.slice(target.start, target.end)); after(target.end, "}).call(tree);");
  for (const [field, row] of [["getBatch", rows.astGetBatch], ["pass", pass]] as const) { before(row.start, `refs.${field}={`); add(row.start, row.end, source.slice(row.start, row.end)); after(row.end, "};"); }
  const manager = { objectContent: "objectTreeManager", pageContent: "pageTreeManager", netContent: "netTreeManager", symbolContent: "symbolTreeManager" } as const;
  const chosen = manager[treeRole];
  const tail = `if(!${String(dirty)}){tree.ticket=tree.renderTicket=1;tree.lastModify=Z.lastModify;}tree.passContentData=${rows.serial.name}(refs.target);Ue={event:tree,${chosen}:tree,prjUuid:"project",batchDepth:0,getBatch:refs.getBatch.getBatch,passContentData:refs.pass.passContentData};return{holder,native,tree,wrapper:tree.passContentData,target:refs.target,resolve,ast:Ue,counts,state,drive(){return Ue.passContentData(false,false).then(()=>{state.modifyAcknowledged=true;counts.parent++})},queue(){return tree.passContentData("project",false,false)}}})()`;
  before(source.length, tail); return padded(source, pieces);
}
