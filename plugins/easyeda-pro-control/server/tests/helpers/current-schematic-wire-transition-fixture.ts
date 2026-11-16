/** Original qualified function spans in a padded inert Inspector fixture.
 * Stand-in roots never construct an EasyEDA model, action, app or native owner. */
import assert from "node:assert/strict";
import {CURRENT_SCHEMATIC_WIRE_GROUP_CHILD_SOURCE as CHILD} from "../../src/current-schematic-wire-group-child-source.ts";
import {CURRENT_SCHEMATIC_WIRE_GROUP_DATA_DEPENDENCY_SOURCE as DEPENDENCY} from "../../src/current-schematic-wire-group-data-dependency-source.ts";
import {CURRENT_SCHEMATIC_WIRE_GROUP_PREPARATION_SOURCE as PREPARATION} from "../../src/current-schematic-wire-group-preparation-source.ts";
import {CURRENT_SCHEMATIC_WIRE_GROUP_METHOD_SOURCE as GROUP_METHOD} from "../../src/current-schematic-wire-group-method-source.ts";
import {CURRENT_SCHEMATIC_WIRE_PARENT_PREDICATE_SOURCE as PREDICATE} from "../../src/current-schematic-wire-parent-predicate-source.ts";
import {CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_SOURCE as RTREE} from "../../src/current-schematic-wire-derived-rtree-source.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_MODEL_CALLEE_SOURCE as MODEL} from "../../src/current-schematic-relevance-model-callee-source.ts";
import { CURRENT_SCHEMATIC_WIRE_TRANSITION_SOURCE as SOURCE, qualifyCurrentSchematicWireTransitionSource } from "../../src/current-schematic-wire-transition-source.ts";
import type { CurrentSchematicWireTransitionRole as Role } from "../../src/current-schematic-wire-transition-source.ts";

/** Preserve qualified function bytes and original PCs while replacing the app with inert surroundings. */
export function wireTransitionFixture(source: string, variant: 0 | 1, firstChildAttributes=false): string {
  assert.equal(qualifyCurrentSchematicWireTransitionSource({ scriptSource: source }), variant);
  const profile = SOURCE[variant], rows = profile.methods;
  const pieces: { start: number; end: number; text: string }[] = [];
  const add = (start: number, end: number, text: string): void => { assert.equal(text.length, end - start); pieces.push({ start, end, text }); };
  const before = (position: number, text: string): void =>{  add(position - text.length, position, text); };
  const after = (position: number, text: string): void =>{  add(position, position + text.length, text); };
  const original = (role: Role): void => { const row = rows[role]; add(row.start, row.end, source.slice(row.start, row.end)); };
  if(firstChildAttributes){const child=CHILD[variant];before(child.start,"refs.childAttributesObject={");add(child.start,child.end,source.slice(child.start,child.end));after(child.end,'};refs.childAttributes=Object.getOwnPropertyDescriptor(refs.childAttributesObject,"attributes").get;');}
  const dependency=DEPENDENCY[variant];
  for(const role of ["baseAttributes","groupAttributes","highlightGet"]as const){const row=dependency[role];before(row.start,`refs.${role}Object={`);add(row.start,row.end,source.slice(row.start,row.end));after(row.end,`};refs.${role}=${role==="highlightGet"?`refs.${role}Object.getNetHighlighted`:`Object.getOwnPropertyDescriptor(refs.${role}Object,"attributes").get`};`);}
  const numeric=dependency.numeric;before(numeric.start,'ia=(function(){"use strict";return ');add(numeric.start,numeric.end,source.slice(numeric.start,numeric.end));after(numeric.end,';})();refs.numeric=ia;');
  const parent = MODEL[variant].roles.parentGet;
  before(parent.start,"refs.parentObject={");add(parent.start,parent.end,source.slice(parent.start,parent.end));after(parent.end,'};refs.parentGet=Object.getOwnPropertyDescriptor(refs.parentObject,"parent").get;');
  const stack=PREPARATION[variant].rows.stackAdd;before(stack.start,"refs.stackObject={");add(stack.start,stack.end,source.slice(stack.start,stack.end));after(stack.end,"};refs.stackAdd=refs.stackObject.add;");
  const tag=GROUP_METHOD[variant].rows.lineTagName;before(tag.start,"refs.tagObject={");add(tag.start,tag.end,source.slice(tag.start,tag.end));after(tag.end,'};refs.lineTag=Object.getOwnPropertyDescriptor(refs.tagObject,"tagName").get;');
  const predicate=PREDICATE[variant];before(predicate.start,"refs.predicateObject={");add(predicate.start,predicate.end,source.slice(predicate.start,predicate.end));after(predicate.end,"};refs.parentPredicate=refs.predicateObject.shouldUpdateParentBBox;");
  const rtree=RTREE[variant].rows.groupRTreeAddible;before(rtree.start,"refs.rtreeObject={");add(rtree.start,rtree.end,source.slice(rtree.start,rtree.end));after(rtree.end,'};refs.groupRtree=Object.getOwnPropertyDescriptor(refs.rtreeObject,"rTreeAddible").get;');
  const moduleName = variant === 0 ? "uc" : "cc";
  const prefix = `(function(){const refs={monitor:{},bbox:{},attr:{},history:{}};let ia,${profile.baseAlias},${profile.groupAlias};var ${variant===0?"Fl":"Zl"}="parent";const ${moduleName}={bboxAttributes:{points:true}};refs.module=${moduleName};`; add(0, prefix.length, prefix);
  // Consecutive getter/setter and core arrows preserve actual inferred names.
  for (const role of ["pointsGet", "pointsSet"] as const) { original(role); }
  before(rows.pointsGet.start, "refs.pointObject=class{");
  after(rows.pointsSet.end, '};refs.pointsGet=Object.getOwnPropertyDescriptor(refs.pointObject.prototype,"points").get;refs.pointsSet=Object.getOwnPropertyDescriptor(refs.pointObject.prototype,"points").set;');
  original("setLines"); before(rows.setLines.start, "refs.setObject={"); after(rows.setLines.end, "};refs.setLines=refs.setObject.setLines;");
  for (const role of ["bboxUpdate", "historyGroup"] as const) { original(role); before(rows[role].start, "refs.method={"); after(rows[role].end, `};refs.${  role  }=refs.method.${  role === "bboxUpdate" ? "update" : "getGroupModelHistoryCommand"  };`); }
  for (const role of ["modifyView", "bboxAttribute", "bboxAdd", "bboxTryParent", "attrWatcher", "historyAttribute", "historyTryGroup"] as const) {
    original(role);
    let methodPrefix = `refs.${role}=`; let suffix = ";";
    if (role === "modifyView") { methodPrefix = "(function(){refs.modifyView="; suffix = ";}).call(refs.monitor);"; }
    else if (role === "attrWatcher") { methodPrefix="(function(){let n={Attr:[],NetLabel:[]};refs.watchTable=n;refs.replaceWatchTable=value=>{n=value};const C={get actionRunner(){fixtureModuleGetterCalls++;throw Error('unused C')}};refs.attrWatcher=";suffix=";}).call(refs.attr);"; }
    else if (role === "historyAttribute") { methodPrefix="(function(){refs.historyAttribute=";suffix=";}).call(refs.history);"; }
    else if (role === "historyTryGroup") { methodPrefix="(function(){refs.historyTryGroup=";suffix=";}).call(refs.history);"; }
    else if (role === "bboxAdd") { methodPrefix = "(function(){refs.bboxAdd="; }
    else if (role === "bboxAttribute") { suffix = ";}).call(refs.bbox);"; }
    before(rows[role].start, methodPrefix); after(rows[role].end, suffix);
  }
  for (const role of ["bboxCommon", "bboxUpdating"] as const) { original(role); }
  before(rows.bboxCommon.start, "refs.core={forCommon:");
  before(rows.bboxUpdating.start, ",forUpdating:");
  after(rows.bboxUpdating.end, "};");
  original("modifyAst"); original("modifyRecord");
  before(rows.modifyAst.start, "function watch(){const t=");
  before(rows.modifyRecord.start, ";this.record=");
  after(rows.modifyRecord.end, ";refs.modifyAst=t;}watch.call(refs.monitor);refs.modifyRecord=refs.monitor.record;");
  for (const [role, alias] of [["historyBaseClass", profile.baseAlias], ["historyGroupClass", profile.groupAlias]] as const) { original(role); before(rows[role].start, `${alias  }=`); after(rows[role].end, `;refs.${  role  }=${  alias  };`); }
  // Group and base methods are already inside the complete original classes.
  const tail = 'for(const role of["baseAttributes","groupAttributes"])Object.defineProperty(refs[role+"Object"],"attributes",{get:refs[role],enumerable:false,configurable:true});refs.replaceNumeric=value=>{ia=value};Object.setPrototypeOf(refs.groupAttributesObject,refs.baseAttributesObject);refs.bboxCommon=refs.core.forCommon;refs.bboxUpdating=refs.core.forUpdating;refs.historyInitOldData=refs.historyGroupClass.prototype.initOldData;refs.historyGroupData=refs.historyGroupClass.prototype.getData;refs.historyGroupUpdate=refs.historyGroupClass.prototype.update;refs.historyBaseData=refs.historyBaseClass.prototype.getData;return refs;})()';
  before(source.length, tail);
  const sorted = pieces.toSorted((a, b) => a.start - b.start); let cursor = 0; const out: string[] = [];
  for (const piece of sorted) { assert.ok(piece.start >= cursor, JSON.stringify(piece)); out.push(source.slice(cursor, piece.start).replaceAll(/[^\r\n]/gu, character => " ".repeat(character.length)), piece.text); cursor = piece.end; }
  out.push(source.slice(cursor).replaceAll(/[^\r\n]/gu, character => " ".repeat(character.length))); return out.join("");
}
