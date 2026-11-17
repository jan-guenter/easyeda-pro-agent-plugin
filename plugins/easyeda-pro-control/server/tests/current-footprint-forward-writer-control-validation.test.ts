/** Actual offline API dispatch and strict data contracts; no native allocation. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { queryExtensionApiCoverage } from "../src/extension-api-coverage.ts";

function record(value:unknown):Record<string,unknown>{assert.ok(isRecord(value));return value;}
function records(value:unknown):Record<string,unknown>[]{assert.ok(Array.isArray(value));return value.map((entry:unknown)=>record(entry));}
function validate(request:unknown):Record<string,unknown>{return record(queryOfflineApi(apiRequestSchema.parse({action:"current-footprint-forward-write-validate",query:{request}})).result);}

void test("controlled footprint discovery exposes actual strict actions without granting execution",()=>{
 const result=record(queryOfflineApi(apiRequestSchema.parse({action:"current-footprint-forward-write",query:{includeSchemas:true}})).result);
 assert.equal(result["tool"],"easyeda_control_current_footprint_forward_write");assert.equal(result["mountedInPublicUtilities"],true);
 assert.equal(result["executionAuthorized"],false);assert.equal(result["connectedValidation"],false);assert.equal(result["ordinaryProjectsSupported"],false);assert.equal(result["inverseAvailable"],false);
 assert.deepEqual(result["actions"],["prepare","execute","inspect","cleanup","settle-publication"]);
 const schema=record(result["inputSchema"]);assert.ok(Array.isArray(schema["oneOf"])&&schema["oneOf"].length===4);
});
void test("offline validation accepts one exact execute and rejects serialized owners or extra Save authority",()=>{
 const original={action:"execute",operationId:"footprint-forward-flow-offline-example",confirmDisposableCopy:true,confirmCopyTriggeredPersistence:true,confirmNoExplicitSave:true,acceptUnsupportedInverse:true};
 assert.equal(validate(original)["valid"],true);assert.equal(validate(original)["executionAuthorized"],false);
 for(const request of [{...original,owner:{}},{...original,confirmNoExplicitSave:false},{...original,operationId:"footprint-forward-writer-wrong-family"}]){assert.equal(validate(request)["valid"],false);}
});
void test("copy inventory labels the controlled native equivalent and its unvalidated ordinary boundary",()=>{
 const result=queryExtensionApiCoverage({search:"lib_Footprint.copy",detail:true});
 const entries=records(result["entries"]);assert.equal(entries.length,1);const entry=entries[0];assert.ok(entry);
 assert.equal(entry["status"],"implemented-native-equivalent");assert.equal(entry["completeDeclaredContractSupported"],false);assert.equal(entry["currentGenerationLiveValidation"],"not-recorded");
 const routes=records(entry["routes"]);const route=routes.find(value=>value["tool"]==="easyeda_control_current_footprint_forward_write");assert.ok(route);assert.match(String(route["scope"]),/No ordinary-project writer/u);
 const source=route["source"],tests=route["tests"];assert.ok(Array.isArray(source)&&Array.isArray(tests));
 for(const item of["current-footprint-forward-writer-workflow-journal.ts","current-footprint-forward-writer-workflow-v2-journal.ts"]){assert.ok(source.includes(item));}
 for(const item of["current-footprint-forward-writer-workflow-journal.test.ts","current-footprint-forward-writer-workflow-v2-journal.test.ts","current-footprint-workflow-journal-durability.test.ts"]){assert.ok(tests.includes(item));}
});
