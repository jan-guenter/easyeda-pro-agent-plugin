/** Compile original complete helpers at their qualified PCs; the held AST
 * method is resumed only into an explicit inert missing-environment failure. */
import assert from "node:assert/strict";
import {CURRENT_SCHEMATIC_WIRE_PARSER_HELPERS as HELPERS,CURRENT_SCHEMATIC_WIRE_PARSER_HELPER_ROLES as ROLES,qualifyCurrentSchematicWireParserSource as qualify} from "../../src/current-schematic-wire-parser-source.ts";
import {CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE as COMPLETION} from "../../src/current-schematic-wire-completion-source.ts";

export function wireParserHelperFixture(source:string,variant:0|1):string{
 assert.equal(qualify({scriptSource:source}),variant);const helperRows=HELPERS[variant].rows; const ast=COMPLETION[variant].rows.sheetAst;const parts:{start:number;end:number;text:string}[]=[];const prefix='(function(){"use strict";';parts.push({start:0,end:prefix.length,text:prefix});
 for(const row of [...ROLES.map(role=>helperRows[role]),ast]){parts.push({start:row.start,end:row.end,text:source.slice(row.start,row.end)});}
 const name=ast.name;const tail=`return{fn:${name},invoke(){return ${name}({},"page").then(()=>({unexpectedCompletion:true}),error=>({inertFailure:String(error)}))}}})()`;parts.push({start:source.length-tail.length,end:source.length,text:tail});const out:string[]=[];let cursor=0;
 for(const part of parts.toSorted((a,b)=>a.start-b.start)){assert.ok(part.start>=cursor);out.push(source.slice(cursor,part.start).replaceAll(/[^\r\n]/gu,value=>" ".repeat(value.length)),part.text);cursor=part.end;}out.push(source.slice(cursor).replaceAll(/[^\r\n]/gu,value=>" ".repeat(value.length)));return out.join("");
}
