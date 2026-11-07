/** Actual byte transport only: synthetic replies issue no native owner or
 * runtime source/call/delete authority. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { CurrentFootprintInversePipe, CurrentPcbViaWritePipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { currentFootprintInversePublicServiceCases } from "../src/current-footprint-inverse-public-service-protocol.ts";

function ignoreEvent(): void {
  // No application event is emitted by this inert peer.
}
void test("all service phases use the retained original UI session after inverse opening", async context => {
  const input = new PassThrough(), sent: Buffer[] = [];
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Exercise the actual Writable completion boundary.
  const output = new Writable({ write(chunk: unknown, _encoding, callback): void { assert.ok(Buffer.isBuffer(chunk)); sent.push(Buffer.from(chunk)); callback(); } });
  const pipe = new CurrentFootprintInversePipe(input, output); pipe.start();
  context.after(async () => { const closed = [input, output].filter(stream=>!stream.closed).map(stream=>once(stream,"close")); input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners(); });
  const last = (): Readonly<{ id: number; sessionId?: string }> => { const raw = sent.at(-1); assert.ok(raw !== undefined); const packet: unknown = JSON.parse(raw.subarray(0,-1).toString("utf8")); assert.ok(packet !== null && typeof packet === "object" && "id" in packet && typeof packet.id === "number"); if ("sessionId" in packet) { assert.ok(typeof packet.sessionId === "string"); return { id: packet.id, sessionId: packet.sessionId }; } return { id: packet.id }; };
  const reply = (result: object): void => { const envelope={...last(),result};const bytes=Buffer.from(`${JSON.stringify(envelope)}\0`);input.write(bytes); };
  pipe.retainInverseActorEvents(()=>"held");
  for (const stage of ["before","arm","after"] as const) { const pending=pipe.observeInverseActors(stage); reply({}); await pending; }
  const attached=pipe.attachTarget("original-ui-target",ignoreEvent); reply({sessionId:"original-ui"}); await attached;
  const path=String.raw`C:\Synthetic\Footprint_Validation.eprj2`;const target=Object.freeze({rawWindowsPath:path,projectUuid:sha256Text(path),branchUuid:"b".repeat(32),documentUuid:"c".repeat(16),expectedSourceSha256:"d".repeat(64)});
  const preflight=pipe.preflightInverseProject("original-context",target); reply({}); await preflight;
  const registration=pipe.dispatchInverseRegistration("original-context",target);reply({result:{type:"string",value:JSON.stringify({schema:"easyeda-pro-control.footprint-inverse-path-registration.v1",projectUuid:target.projectUuid,rawWindowsPath:path,beforeRegistrySha256:"e".repeat(64),afterRegistrySha256:"e".repeat(64),beforeCount:1,afterCount:1,registrationDispatched:false,priorRegistrationPresent:true,exactOtherRegistrationRosterUnchanged:true,selectedRawPathMatched:true,selectedNonCbbMatched:true,recentPathRowMayHaveChanged:false,projectNavigationDispatched:false,cadEditDispatched:false,explicitSaveDispatched:false,persistentRegistrationVerified:false,replayAllowed:false,writerAuthority:false})}});await registration;
  const parent=pipe.armInverseParent(ignoreEvent);reply({});await parent;const opened=pipe.openInverseProject("original-context",target);reply({});await opened;
  for (const command of currentFootprintInversePublicServiceCases()) { const pending=pipe.observeInversePublicService(command);const request=last();assert.equal(request.sessionId,"original-ui");reply({});await pending; }
  assert.equal(pipe.status().failureObservation,null);
  const before=sent.length;const first=currentFootprintInversePublicServiceCases()[0];assert.ok(first!==undefined);const other:unknown=Object.create(CurrentPcbViaWritePipe.prototype);
  // oxlint-disable-next-line typescript/unbound-method -- Invalid sibling receiver must reject before emitting bytes.
  assert.throws(()=>Reflect.apply(CurrentFootprintInversePipe.prototype.observeInversePublicService,other,[first]));assert.equal(sent.length,before);
});
