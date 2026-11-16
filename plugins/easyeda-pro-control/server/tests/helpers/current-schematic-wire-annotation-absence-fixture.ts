/** Original opening/factory/register functions use inert canvas sinks only. */
import assert from "node:assert/strict";
import { CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_SOURCE as SOURCE, qualifyCurrentSchematicWireAnnotationAbsenceSource as qualify } from "../../src/current-schematic-wire-annotation-absence-source.ts";

export function wireAnnotationAbsenceFixture(source: string, variant: 0 | 1, privateMode: boolean): string {
  assert.equal(qualify({ scriptSource: source }), variant); const profile = SOURCE[variant]; const rows = profile.rows;
  const pieces: { start: number; end: number; text: string }[] = [];
  const add = (start: number, end: number, text: string): void => { assert.equal(text.length, end - start); pieces.push({ start, end, text }); };
  const before = (start: number, text: string): void => { add(start - text.length, start, text); };
  const after = (end: number, text: string): void => { add(end, end + text.length, text); };
  const caller = source.slice(rows.openCanvas.start, rows.openCanvas.end);
  const canvas = /this\.canvas=new ([A-Za-z_$][A-Za-z\d_$]*)\(/u.exec(caller)?.[1];
  const finish = /,([A-Za-z_$][A-Za-z\d_$]*)\(this\.canvas,r\)/u.exec(caller)?.[1];
  assert.ok(canvas !== undefined && finish !== undefined);
  const prefix = `(function(){"use strict";const ${profile.privateAlias}=${String(privateMode)},counts={globalPanel:0,watch:0,select:0,canvas:0,finish:0},globalThis={get annotationPanel(){counts.globalPanel++;return undefined}},refs={};class ${canvas}{init(){counts.canvas++}}const ${finish}=()=>{counts.finish++};`;
  add(0, prefix.length, prefix);
  for (const [role, name] of [["openCanvas", "Doc"], ["register", "Disposable"]] as const) { const row = rows[role]; before(row.start, `refs.${name}=class{`); add(row.start, row.end, source.slice(row.start, row.end)); after(row.end, "};"); }
  const factory = rows.factory; add(factory.start, factory.end, source.slice(factory.start, factory.end)); after(factory.end, ";");
  const tail = `const shapes={watchOnOpen(){counts.watch++}},page=Object.assign(new refs.Doc,{canvas:null,annotationManager:null,shapeManager:shapes,selectRepeater:{init(){counts.select++}},register:refs.Disposable.prototype.register});page.openCanvas({},false);const line={shapeManager:shapes},group={shapeManager:shapes},metadata={projectId:"inert"},host={currentProject:metadata},state={owner:null,before:{line,wire:group},failed:false,modifyAttempted:false,modifyAcknowledged:false,saveAttempted:false},b={page,shapes,line,group,metadata,host},holder=[b,state];state.owner=holder;const native=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype];return{holder,native,page,state,counts,openCanvas:refs.Doc.prototype.openCanvas,register:refs.Disposable.prototype.register,factory:${profile.factoryAlias}};})()`;
  before(source.length, tail); const out: string[] = []; let cursor = 0;
  for (const piece of pieces.toSorted((a, b) => a.start - b.start)) { assert.ok(piece.start >= cursor); out.push(source.slice(cursor, piece.start).replaceAll(/[^\r\n]/gu, c => " ".repeat(c.length)), piece.text); cursor = piece.end; }
  out.push(source.slice(cursor).replaceAll(/[^\r\n]/gu, c => " ".repeat(c.length))); return out.join("");
}
