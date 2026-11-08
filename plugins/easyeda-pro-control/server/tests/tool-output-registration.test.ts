/* oxlint-disable import/max-dependencies -- Actual Via and schematic output properties need their independent immutable contracts and separate diagnostic schemas in the same registration check. */
/** Registration contracts must cover every named tool before facade startup.
 * These checks evaluate the actual schema property without importing the owner. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { parse } from "acorn";
import type { ObjectExpression } from "acorn";
import { z } from "zod";
import {CURRENT_PCB_VIA_WRITE_TOOL,currentPcbViaWriteResultSchema} from "../src/current-pcb-via-write-contract.ts";
import {currentPcbViaWriteDiagnosticSchema} from "../src/current-pcb-via-write-diagnostic.ts";
import {currentPcbViaWriteMainFailure,currentPcbViaWriteMainFailureSchema} from "../src/current-pcb-via-write-main-failure.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL, currentSchematicRelevanceDisplayWriteResultSchema } from "../src/current-schematic-relevance-display-write-contract.ts";
import { currentSchematicRelevanceDisplayWriteDiagnostic, currentSchematicRelevanceDisplayWriteDiagnosticSchema } from "../src/current-schematic-relevance-display-write-diagnostic.ts";

const constants = new Map([
  ["CURRENT_PCB_VIA_WRITE_TOOL", CURRENT_PCB_VIA_WRITE_TOOL],
  ["CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL", CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL],
]);
async function sourceTable(): Promise<Readonly<{ source: string; properties: ObjectExpression["properties"] }>> {
  const source = stripTypeScriptTypes(await readFile(new URL("../src/index.ts", import.meta.url), "utf8"));
  const declarations = parse(source, { ecmaVersion: "latest", sourceType: "module" }).body.filter(row => row.type === "VariableDeclaration" && row.declarations.some(value => value.id.type === "Identifier" && value.id.name === "toolOutputSchemas"));
  assert.equal(declarations.length, 1);
  const declaration = declarations[0];
  assert.ok(declaration?.type === "VariableDeclaration");
  const value = declaration.declarations[0]?.init;
  assert.ok(value?.type === "ObjectExpression");
  // Retain the actual object properties, including computed constant keys.
  return { source, properties: value.properties };
}
void test("every named facade registration has a reviewed output schema", async () => {
  const { source, properties } = await sourceTable();
  const keys = new Set(properties.map(row => {
    assert.equal(row.type, "Property");
    assert.ok(row.type === "Property" && row.key.type === "Identifier");
    if (!row.computed) { return row.key.name; }
    const name = constants.get(row.key.name);
    assert.ok(name !== undefined);
    return name;
  }));
  let count = 0;
  for (const match of source.matchAll(/registerFacadeTool\(\s*(?:"([a-z\d_]+)"|(CURRENT_[A-Z_]+)),/gu)) {
    const name = match[1] ?? constants.get(match[2] ?? "");
    assert.ok(name !== undefined && keys.has(name), `Missing reviewed output schema: ${name ?? "unresolved constant"}`);
    count += 1;
  }
  assert.ok(count > 40);
});
void test("schematic writer registration retains its strict result and diagnostic schemas", async () => {
  const { source, properties } = await sourceTable();
  const selected = properties.filter(row => row.type === "Property" && row.computed && row.key.type === "Identifier" && row.key.name === "CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL");
  assert.equal(selected.length, 1);
  const row = selected[0];
  assert.ok(row !== undefined);
  const result: unknown = runInNewContext(`({${source.slice(row.start, row.end)}})[CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL]`, {
    z, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL, currentSchematicRelevanceDisplayWriteResultSchema,
    currentSchematicRelevanceDisplayWriteDiagnosticSchema, optionalFailureOutputShape: {},
  });
  assert.ok(result instanceof z.ZodObject);
  const diagnostic = currentSchematicRelevanceDisplayWriteDiagnostic("created", null);
  assert.equal(result.safeParse({ diagnostic }).success, true);
  assert.equal(result.safeParse({ diagnostic: { ...diagnostic, executionAuthorized: true } }).success, false);
  assert.equal(result.safeParse({ result: { completed: true } }).success, false);
  assert.equal(result.safeParse({ diagnostic, arbitraryAuthority: true }).success, false);
});

void test("Via output exposes Main failure data separately from immutable operation and diagnostic contracts",async()=>{
 const {source,properties}=await sourceTable();const selected=properties.filter(row=>row.type==="Property"&&row.computed&&row.key.type==="Identifier"&&row.key.name==="CURRENT_PCB_VIA_WRITE_TOOL");assert.equal(selected.length,1);const row=selected[0];assert.ok(row!==undefined);
 const output:unknown=runInNewContext(`({${source.slice(row.start,row.end)}})[CURRENT_PCB_VIA_WRITE_TOOL]`,{z,CURRENT_PCB_VIA_WRITE_TOOL,currentPcbViaWriteResultSchema,currentPcbViaWriteDiagnosticSchema,currentPcbViaWriteMainFailureSchema,optionalFailureOutputShape:{}});assert.ok(output instanceof z.ZodObject);
 const mainFailure=currentPcbViaWriteMainFailure(null);assert.equal(output.safeParse({mainFailure}).success,true);assert.equal(output.safeParse({mainFailure:null}).success,true);
 assert.equal(output.safeParse({mainFailure:{...mainFailure,cleanupAuthorized:true}}).success,false);assert.equal(output.safeParse({mainFailure:{...mainFailure,privatePath:"private"}}).success,false);
 assert.equal(currentPcbViaWriteDiagnosticSchema.safeParse({schema:"easyeda-pro-control.pcb209-via-write-diagnostic.v1",stage:"main",originalFailureObserved:false,errorCode:null,executionAuthorized:false,persistenceVerified:false,stackIncluded:false,mainFailure}).success,false);
});
