/** Actual vendor tick and actionFinish bodies run at their original PCs.
 * Empty original listeners and inert application roots do not prove native SDK completion. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {CURRENT_SCHEMATIC_WIRE_POSTCONDITION_LIMIT as LIMIT} from "../src/current-schematic-wire-postcondition-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_ACTION_COMPLETE_SOURCE as SOURCE} from "../src/current-schematic-wire-action-complete-source.ts";
import {wireActionCompleteFixture} from "./helpers/current-schematic-wire-action-complete-fixture.ts";
import {runWireContinuationFixture} from "./helpers/current-schematic-wire-continuation-fixture.ts";
import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAsset} from "./helpers/installed-easyeda-source.ts";

void test("original Wire postconditions return the genuine refused receipt while derived publication is absent",{timeout:360_000},async context=>{
 const source=await readConfiguredEasyedaAsset(SOURCE.relativePath);if(source===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 const raw=await runWireContinuationFixture(context,source,{ fixture: wireActionCompleteFixture, completion: "postcondition" });
 const ledger:unknown=Reflect.get(raw,"postLedger");const events:unknown=Reflect.get(raw,"postEvents");const replies:unknown=Reflect.get(raw,"postRaw");const packet:unknown=Reflect.get(raw,"packet");
  assert.ok(Array.isArray(ledger)&&Array.isArray(events)&&Array.isArray(replies)&&packet!==null&&typeof packet==="object");
  assert.deepEqual(Reflect.get(raw,"state"),{getters:0,failed:true,acknowledged:false,saveAttempted:false,actions:0,save:0,current:null});
  assert.equal(Reflect.get(raw,"originalFixtureModifyPending"),false);assert.equal(Reflect.get(raw,"postSteps"),3);
  assert.equal(Reflect.get(packet,"schema"),"private.schematic-wire-original-postconditions-receipt.v1");assert.equal(Reflect.get(packet,"normalRequests"),ledger.length);
  const helpers=ledger.filter(row=>row!==null&&typeof row==="object"&&Reflect.get(row,"method")==="Runtime.callFunctionOn").length;
  assert.equal(Reflect.get(packet,"helperSources"),helpers);assert.equal(helpers,7);assert.equal(replies.length,ledger.length);assert.equal(events.length,helpers+5);assert.ok(ledger.length<=LIMIT.normalMaximum);
  for(const flag of["originalRunCompletionConsumed","originalWriterPostconditionsRun","originalGeneratedReceiptReturned","originalInnerWriterPromiseFulfilledWithSameReceipt","originalPrivateStateAndActionConsistencyRecompared","originalCompletedPromiseAndWeakEntriesRecompared"]){assert.equal(Reflect.get(packet,flag),true);}
  for(const flag of["originalWriterPostconditionsAccepted","markerGeometryMatchedAtEntry","originalNativeOwnerJoined","continuousGlobalsVerified","workerCompleted","mainCompleted","sqlCompleted","modifyCompleted","saveAuthorized"]){assert.equal(Reflect.get(packet,flag),false);}
  const receipt:unknown=Reflect.get(packet,"receipt");assert.ok(receipt!==null&&typeof receipt==="object");assert.equal(Reflect.get(receipt,"ok"),false);assert.equal(Reflect.get(receipt,"modifyAttempted"),true);assert.equal(Reflect.get(receipt,"modifyAcknowledged"),false);assert.equal(Reflect.get(receipt,"originalPromiseSettled"),true);assert.equal(Reflect.get(receipt,"source"),null);
  const historic:unknown=Reflect.get(raw,"postBase");assert.ok(historic!==null&&typeof historic==="object");const previous:unknown=Reflect.get(historic,"completePacket");assert.ok(previous!==null&&typeof previous==="object");assert.equal(Reflect.get(previous,"schema"),"private.schematic-wire-original-empty-roster-action-complete-held.v1");assert.equal(Reflect.get(previous,"writerPostconditionsRun"),false);assert.equal(Reflect.get(previous,"originalWriterPostAwaitStillHeld"),true);
 });
