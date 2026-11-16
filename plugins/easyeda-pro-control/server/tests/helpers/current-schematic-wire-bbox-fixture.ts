/** Original bbox scheduling, core modes and update run on inert model,
 * event, transaction and rTree sinks. No application geometry is constructed. */
import assert from "node:assert/strict";
import { CURRENT_SCHEMATIC_WIRE_TRANSITION_SOURCE as TRANSITION, qualifyCurrentSchematicWireTransitionSource as qualify } from "../../src/current-schematic-wire-transition-source.ts";

export function wireBboxFixture(source: string, variant: 0 | 1, mode: "complete" | "pending-change" | "callback-error" | "reused-promise"): string {
  assert.equal(qualify({ scriptSource: source }), variant); const rows = TRANSITION[variant].methods;
  const pieces: { start: number; end: number; text: string }[] = [];
  const add = (start: number, end: number, text: string): void => { assert.equal(text.length, end - start); pieces.push({ start, end, text }); };
  const before = (start: number, text: string): void => { add(start - text.length, start, text); };
  const after = (end: number, text: string): void => { add(end, end + text.length, text); };
  const prefix = `(function(){"use strict";const mode=${JSON.stringify(mode)},refs={},counts={async:0,updated:0,afterAll:0,modelBBox:0,rTreeClear:0,warnings:0},console={warn(){counts.warnings++}},qt={},action={history:"add",status:"running"},runner={_currentAction:action,get running(){return this._currentAction!==null}},shapes={actionRunner:runner,rTree:{clearOldBBoxMap(){counts.rTreeClear++}}},line={shapeManager:shapes,modelType:"Wire",updateSelfBBox(){counts.modelBBox++}},group={shapeManager:shapes,modelType:"NetGroup",updateSelfBBox(){counts.modelBBox++}},markers=[0,1].map(()=>({shapeManager:shapes,modelType:"UnConnectDot",updateSelfBBox(){counts.modelBBox++}})),foreign={modelType:"foreign"},bbox={shapeManager:shapes,shouldUpdateInAsync:true,_nextTickPromise:null,_modelsShouldUpdateBBox:new Map,_modelTypesShouldUpdateBBox:new Set,_modelMapForOnBBoxChangeAsync:new Map,_onModelsBBoxChangeAsync:{dispatch(){counts.async++;if(mode==="callback-error")throw Error("inert bbox observer failure");if(mode==="pending-change")bbox._modelsShouldUpdateBBox.set(foreign,1)}},_onUpdate:{dispatch(){counts.updated++;for(const marker of markers)bbox.add(marker)}}},metadata={projectId:"inert"},host={currentProject:metadata},page={shapeManager:shapes},state={owner:null,before:{line,wire:group},failed:false,modifyAttempted:true,modifyAcknowledged:false,saveAttempted:false},b={runner,shapes,line,group,metadata,host,page},holder=[b,state];state.owner=holder;shapes.bboxMonitor=bbox;const native=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype];`;
  add(0, prefix.length, prefix);
  const initial = rows.bboxAdd; const last = rows.bboxUpdating;
  const suffix = "};this._addCore=this._addCoreMethods.forCommon;";
  assert.equal(source.slice(last.end, last.end + suffix.length), suffix);
  before(initial.start, "refs.install=function(){this.add=");
  add(initial.start, last.end + suffix.length, source.slice(initial.start, last.end + suffix.length));
  after(last.end + suffix.length, "};refs.install.call(bbox);");
  const update = rows.bboxUpdate; before(update.start, "refs.update={"); add(update.start, update.end, source.slice(update.start, update.end)); after(update.end, "};");
  const tail = 'bbox.update=refs.update.update;return{holder,native,bbox,action,counts,drive(){bbox.add(line);bbox.add(group);const first=bbox._nextTickPromise;return first.then(()=>{if(mode==="callback-error"||mode==="pending-change")return;action.status="willDidRun";bbox.update({success:true,afterAll(){counts.afterAll++}});action.status="didRun";runner._currentAction=null;if(mode==="reused-promise")bbox._nextTickPromise=first;return bbox._nextTickPromise}).then(()=>{state.modifyAcknowledged=true})}};})()';
  before(source.length, tail); const out: string[] = []; let cursor = 0;
  for (const piece of pieces.toSorted((a, b) => a.start - b.start)) { assert.ok(piece.start >= cursor); out.push(source.slice(cursor, piece.start).replaceAll(/[^\r\n]/gu, c => " ".repeat(c.length)), piece.text); cursor = piece.end; }
  out.push(source.slice(cursor).replaceAll(/[^\r\n]/gu, c => " ".repeat(c.length))); return out.join("");
}
