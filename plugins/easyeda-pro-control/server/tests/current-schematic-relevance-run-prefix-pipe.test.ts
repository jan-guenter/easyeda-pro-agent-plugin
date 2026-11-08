import {currentSchematicRelevanceRenderDelegateCases} from "../src/current-schematic-relevance-render-delegate-wire.ts";
import {currentSchematicRelevanceStatusTabMutationCases} from "../src/current-schematic-relevance-status-tab-mutation-wire.ts";
import {currentSchematicRelevanceStatusTabLookupCases} from "../src/current-schematic-relevance-status-tab-lookup-wire.ts";
import {currentSchematicRelevanceStatusSubscriberCases} from "../src/current-schematic-relevance-status-subscriber-wire.ts";
/* oxlint-disable import/max-dependencies -- The same original retained Modify is tested through each independently fixed callback grammar and its purpose decoder. */
import {currentSchematicRelevanceStatusCloneCases} from "../src/current-schematic-relevance-status-clone-wire.ts";
import {currentSchematicRelevanceStatusBusCases} from "../src/current-schematic-relevance-status-bus-wire.ts";
import {currentSchematicRelevanceStatusDeliveryCases} from "../src/current-schematic-relevance-status-delivery-wire.ts";
import {currentSchematicRelevanceHistoryStatusCases} from "../src/current-schematic-relevance-history-status-wire.ts";
import {currentSchematicRelevanceUploadReturnCases} from "../src/current-schematic-relevance-upload-return-wire.ts";
import {currentSchematicRelevancePendingCacheCases} from "../src/current-schematic-relevance-pending-cache-wire.ts";
import {currentSchematicRelevanceUploadCmCases} from "../src/current-schematic-relevance-upload-cm-wire.ts";
import {currentSchematicRelevanceUploadSerializeCases} from "../src/current-schematic-relevance-upload-serialize-wire.ts";
import {currentSchematicRelevanceUploadModelCases} from "../src/current-schematic-relevance-upload-model-wire.ts";
import {currentSchematicRelevanceUploadEntryCases} from "../src/current-schematic-relevance-upload-entry-wire.ts";
import {currentSchematicRelevanceNoEchoCases} from "../src/current-schematic-relevance-noecho-wire.ts";
/** Real pipe and inert byte streams. No original owner, renderer, actor,
 * native helper, mutation, receiver or durability is established. */
import {currentSchematicRelevanceNormalUpdateCases} from "../src/current-schematic-relevance-normal-update-wire.ts";
import {currentSchematicRelevanceNormalDisposalCases} from "../src/current-schematic-relevance-normal-disposal-wire.ts";
import {currentSchematicRelevanceNormalRecordCases} from "../src/current-schematic-relevance-normal-record-wire.ts";
import assert from "node:assert/strict";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import { CurrentSchematicRelevanceDisplayWritePipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { currentSchematicRelevanceRunPrefixCases } from "../src/current-schematic-relevance-run-prefix-wire.ts";
import { currentSchematicRelevanceRunGuardCases } from "../src/current-schematic-relevance-run-guard-wire.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest } from "../src/current-schematic-relevance-display-write-protocol.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";

void test("finite run and normal callback lanes remain duplex with the original pending Modify and original UI session", async context => {
  const input = new PassThrough(); const sent: Record<string, unknown>[] = [];
  const output = new Writable({ write(bytes: Buffer, _encoding, done): void {
    const value: unknown = JSON.parse(bytes.subarray(0, -1).toString()); assert.ok(value !== null && typeof value === "object" && !Array.isArray(value));
    const command: Record<string, unknown> = Object.fromEntries(Object.entries(value)); sent.push(command);
    if (command["schematicRelevanceModifyGeneration"] !== true) {
      const result = command["method"] === "Target.attachToTarget" ? { sessionId: "original-ui" } : {};
      input.write(Buffer.from(`${JSON.stringify({ id: command["id"], result, sessionId: "sessionId" in command ? command["sessionId"] : undefined })}\0`));
    } done();
  } });
  const closedInput = Promise.withResolvers<true>(); const closedOutput = Promise.withResolvers<true>();
  input.once("close", () => { closedInput.resolve(true); }); output.once("close", () => { closedOutput.resolve(true); });
  const pipe = new CurrentSchematicRelevanceDisplayWritePipe(input, output); pipe.start();
  context.after(async () => { input.destroy(); output.destroy(); await Promise.all([closedInput.promise, closedOutput.promise]); pipe.releaseClosedListeners(); });
  await pipe.attachTarget("original-ui-target", () => { assert.fail("No actor event in inert transport test"); }); pipe.bindSchematicDisplayActionGuard("original-script", 0);
  const args = data().args; const original = pipe.generateSchematicRelevanceDisplayModify("original-holder", args.target, args.operation);
  const failed = assert.rejects(original); const turn = Promise.withResolvers<true>(); setImmediate(() => { turn.resolve(true); }); await turn.promise;
  pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);
  for (const command of currentSchematicRelevanceRunPrefixCases()) { await pipe.observeSchematicRelevanceRunPrefix(command); pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original); }
  for (const step of currentSchematicRelevanceRunGuardCases()) { await pipe.observeSchematicRelevanceRunGuard(step); pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original); }
  for(const command of currentSchematicRelevanceNormalUpdateCases()){await pipe.observeSchematicRelevanceNormalUpdate(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceNormalDisposalCases()){await pipe.observeSchematicRelevanceNormalDisposal(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceNormalRecordCases()){await pipe.observeSchematicRelevanceNormalRecord(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceNoEchoCases()){await pipe.observeSchematicRelevanceNoEcho(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceUploadEntryCases()){await pipe.observeSchematicRelevanceUploadEntry(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceUploadModelCases()){await pipe.observeSchematicRelevanceUploadModel(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceUploadSerializeCases()){await pipe.observeSchematicRelevanceUploadSerialize(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceUploadCmCases()){await pipe.observeSchematicRelevanceUploadCm(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevancePendingCacheCases()){await pipe.observeSchematicRelevancePendingCache(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceUploadReturnCases()){await pipe.observeSchematicRelevanceUploadReturn(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceHistoryStatusCases()){await pipe.observeSchematicRelevanceHistoryStatus(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceStatusBusCases()){await pipe.observeSchematicRelevanceStatusBus(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceStatusDeliveryCases()){await pipe.observeSchematicRelevanceStatusDelivery(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceRenderDelegateCases()){await pipe.observeSchematicRelevanceRenderDelegate(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceStatusTabMutationCases()){await pipe.observeSchematicRelevanceStatusTabMutation(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceStatusTabLookupCases()){await pipe.observeSchematicRelevanceStatusTabLookup(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceStatusSubscriberCases()){await pipe.observeSchematicRelevanceStatusSubscriber(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceStatusCloneCases()){await pipe.observeSchematicRelevanceStatusClone(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  assert.equal(pipe.status().pendingRequestId, 2); assert.equal(pipe.status().failure, null);
  for (const row of sent.slice(2)) {
    assert.equal(row["sessionId"], "original-ui");
    const native = currentSchematicRelevanceDisplayWriteNativeRequest(Buffer.from(`${JSON.stringify(row)}\0`));
    assert.ok(native["action"] === "schematic-relevance-render-delegate" || native["action"] === "schematic-relevance-status-tab-mutation" || native["action"] === "schematic-relevance-status-tab-lookup" || native["action"] === "schematic-relevance-run-prefix" || native["action"] === "schematic-relevance-run-guard" || native["action"] === "schematic-relevance-normal-update" || native["action"] === "schematic-relevance-normal-disposal" || native["action"] === "schematic-relevance-normal-record" || native["action"] === "schematic-relevance-noecho" || native["action"] === "schematic-relevance-upload-entry" || native["action"] === "schematic-relevance-upload-model" || native["action"] === "schematic-relevance-upload-serialize" || native["action"] === "schematic-relevance-upload-cm" || native["action"] === "schematic-relevance-pending-cache" || native["action"] === "schematic-relevance-upload-return" || native["action"] === "schematic-relevance-history-status" || native["action"] === "schematic-relevance-status-bus" || native["action"] === "schematic-relevance-status-delivery" || native["action"] === "schematic-relevance-status-subscriber" || native["action"] === "schematic-relevance-status-clone");
  }
  input.emit("error", new Error("inert original request finished")); await failed;
});
