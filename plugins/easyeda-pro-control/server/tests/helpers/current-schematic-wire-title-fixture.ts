/** Copy the actual numeric document enum while retaining every function offset. */
import assert from"node:assert/strict";
import{CURRENT_SCHEMATIC_WIRE_TITLE_DOCUMENT_TYPES as TYPES,qualifyCurrentSchematicWireTitleSource as qualify}from"../../src/current-schematic-wire-title-source.ts";
import{wireParserTreeFixture}from"./current-schematic-wire-parser-tree-fixture.ts";

export function wireTitleFixture(source:string,variant:0|1,uiKey:string,role:"objectContent"|"pageContent"="objectContent"):string{
 assert.equal(qualify({scriptSource:source}),variant);
 const text=wireParserTreeFixture(source,variant,uiKey,role);
 const match=/const Ie=\{SCH:"sch",PCB:"pcb"\};let [^;]+;/u.exec(text);assert.ok(match!==null);
 const row=TYPES[variant];const literal=source.slice(row.start,row.end);
 const declaration=`const Ie=${literal};${match[0].slice(match[0].indexOf("let "))}`;
 const end=match.index+declaration.length;assert.match(text.slice(match.index+match[0].length,end),/^[\s]*$/u);
 return text.slice(0,match.index)+declaration+text.slice(end);
}
