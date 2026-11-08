/* oxlint-disable import/max-dependencies -- This extracted-module fixture retains the independent production schemas and exact source/gate collaborators. */
/** Exact index helper bodies for extracted registration tests. These fixtures
 * have no generated/Via/data owner; they must still execute the real gate. */
import assert from "node:assert/strict";
import { stripTypeScriptTypes } from "node:module";
import { runInContext } from "node:vm";
import type { Context } from "node:vm";
import { parse } from "acorn";
import { z } from "zod";
import { generatedSchematicOpeningRequestSchema } from "../../src/managed-schematic-fixture-opening.ts";
import { currentSchematicPageOpeningRequestSchema } from "../../src/current-schematic-page-opening.ts";
import { currentSchematicPageReadRequestSchema } from "../../src/current-schematic-page-read.ts";
import { currentPcbOrdinaryReadRequestSchema } from "../../src/current-pcb-ordinary-read-validation.ts";
import { currentPcbComponentSpatialRequestSchema } from "../../src/current-pcb-component-spatial-validation.ts";
import { currentGeneratedReaderRelinquishmentRequestSchema } from "../../src/current-generated-reader-relinquishment-contract.ts";

export function indexFixtureGateSource(source:string):string {
 const text=stripTypeScriptTypes(source);const rows=parse(text,{ecmaVersion:"latest",sourceType:"module"}).body.filter(row=>row.type==="FunctionDeclaration"&&row.id?.name==="runFacadeGate");assert.equal(rows.length,1);const row=rows[0];assert.ok(row!==undefined&&row.end-row.start<5000);return text.slice(row.start,row.end);
}
export function indexFixtureToolRegistrationSource(source:string,tools:readonly string[]):string {
 const text=stripTypeScriptTypes(source);const body=parse(text,{ecmaVersion:"latest",sourceType:"module"}).body;
 return tools.map(tool=>{const rows=body.filter(row=>row.type==="IfStatement"&&row.test.type==="CallExpression"&&row.test.callee.type==="Identifier"&&row.test.callee.name==="facadeToolRegistered"&&row.test.arguments[1]?.type==="Literal"&&row.test.arguments[1].value===tool);assert.equal(rows.length,1);const row=rows[0];assert.ok(row!==undefined&&row.end-row.start<20_000);return text.slice(row.start,row.end);}).join("\n");
}

export function installIndexFixtureDependencies(scope:Context,source:string):void {
 for(const name of ["closedGeneratedDataAllocation","closedGeneratedDataCoordinator","generatedSchematicAllocation","generatedSchematicOpening","currentPcbViaWriteCoordinator","currentSchematicRelevanceDisplayWriteCoordinator","generatedReaderHistoricalOriginal","stagedFixtureOpeningSource","stagedSchematicOpeningSource","stagedComponentOpeningSource","fixtureImportCoordinator"]){if(!Object.hasOwn(scope,name)){Reflect.set(scope,name,undefined);}}
 // These old-route fixtures never select a new fingerprint-bearing route.
 // Reject that input rather than supplying a permissive missing schema.
 if(!Object.hasOwn(scope,"privateFingerprintSchema")){Reflect.set(scope,"privateFingerprintSchema",z.never());}
 if(!Object.hasOwn(scope,"generatedSchematicOpeningRequestSchema")){Reflect.set(scope,"generatedSchematicOpeningRequestSchema",generatedSchematicOpeningRequestSchema);}
 if(!Object.hasOwn(scope,"currentSchematicPageOpeningRequestSchema")){Reflect.set(scope,"currentSchematicPageOpeningRequestSchema",currentSchematicPageOpeningRequestSchema);}
 if(!Object.hasOwn(scope,"currentSchematicPageReadRequestSchema")){Reflect.set(scope,"currentSchematicPageReadRequestSchema",currentSchematicPageReadRequestSchema);}
 if(!Object.hasOwn(scope,"currentPcbOrdinaryReadRequestSchema")){Reflect.set(scope,"currentPcbOrdinaryReadRequestSchema",currentPcbOrdinaryReadRequestSchema);}
 if(!Object.hasOwn(scope,"currentPcbComponentSpatialRequestSchema")){Reflect.set(scope,"currentPcbComponentSpatialRequestSchema",currentPcbComponentSpatialRequestSchema);}
 if(!Object.hasOwn(scope,"currentGeneratedReaderRelinquishmentRequestSchema")){Reflect.set(scope,"currentGeneratedReaderRelinquishmentRequestSchema",currentGeneratedReaderRelinquishmentRequestSchema);}
 const text=stripTypeScriptTypes(source);const body=parse(text,{ecmaVersion:"latest",sourceType:"module"}).body;
 for(const name of ["hasClosedGeneratedDataCustody","hasGeneratedSchematicCustody","hasViaWriteCustody","hasSchematicDisplayWriteCustody","hasFixtureImportCustody","runFacadeGate"]){
  if(!Object.hasOwn(scope,name)){const rows=body.filter(row=>row.type==="FunctionDeclaration"&&row.id?.name===name);assert.equal(rows.length,1);const row=rows[0];assert.ok(row!==undefined&&row.end-row.start<5000);runInContext(text.slice(row.start,row.end),scope);}
 }
}

/** Actual helper declarations only. Adjacent registrations or new top-level
 * schema initializers must not accidentally enter the extracted fixture. */
export function indexFixtureRegistrationHelpersSource(source: string): string {
 const text = stripTypeScriptTypes(source); const body = parse(text, { ecmaVersion: "latest", sourceType: "module" }).body;
 return ["guarded", "registerFacadeTool"].map(name => {
  const rows = body.filter(row => row.type === "FunctionDeclaration" && row.id?.name === name); assert.equal(rows.length, 1);
  const row = rows[0]; assert.ok(row !== undefined && row.end - row.start < 20_000); return text.slice(row.start, row.end);
 }).join("\n");
}
