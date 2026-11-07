/** Pure source/effect comparison. The comparator issues no native authority;
 * the actual central issuer separately refuses structural owner/packet data. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { compareGeneratedSchematicDisplayEffect } from "../src/generated-schematic-display-effect-data.ts";
import { qualifyOriginalGeneratedSchematicDisplayEffect } from "../src/generated-schematic-display-effect.ts";
import { prepareGeneratedSchematicDisplayBodyPlan } from "../src/generated-schematic-display-source.ts";
import type { GeneratedSchematicDisplayNativeArguments } from "../src/generated-schematic-display-source.ts";

function packet(stage: "preflight" | "modify" | "observe", source: string, windowTabId = "synthetic-window"): object {
  return Object.freeze({ schema: "easyeda-pro-control.generated-schematic-display-stage.v1", stage, ok: true, dispatchAttempted: stage === "modify", originalPromiseSettled: stage === "modify",
    modifyAttempted: stage !== "preflight", modifyAcknowledged: stage !== "preflight", saveAttempted: false, saveAcknowledged: false, savePromiseSettled: false,
    source, windowTabId, originalContextIntact: true, connectivityVerified: false, sourceVersionAliased: false, workerCompletionVerified: false,
    structureCompletionVerified: false, persistenceVerified: false, inverseAvailable: false });
}
function fixture(corrupt: "none" | "peer" | "window" = "none"): Readonly<{ compare: () => object; qualify: () => unknown }> {
  const body = prepareGeneratedSchematicDisplayBodyPlan({ x: 20 }), target = Object.freeze({ rawWindowsPath: "C:\\Synthetic\\fixture.eprj2", projectUuid: "1".repeat(64), branchUuid: "2".repeat(32),
    schematicUuid: "3".repeat(32), pageUuid: "4".repeat(32), expectedSourceSha256: "5".repeat(64) });
  const textId = `0${"6".repeat(15)}`; const peers = [{ id: "CANVAS", type: "CANVAS" as const, body: { originX: 0, originY: 0 } },
    ...["7", "8", "9", "a"].map((id, index) => ({ id: `0${id.repeat(15)}`, type: index % 2 === 0 ? "WIRE" as const : "LINE" as const, body: { syntheticPeer: id } }))].toSorted((left, right) => left.id.localeCompare(right.id));
  const argumentsValue: GeneratedSchematicDisplayNativeArguments = { target, operation: { operationId: "sch209-display-effect-test", textId, beforeBody: body.nativeBeforeBody, afterBody: body.nativeAfterBody, peers } };
  const encode = (textBody: Readonly<Record<string, unknown>>, changed: boolean): string => {
    const rows = [{ id: textId, type: "TEXT", body: textBody }, ...peers].map((row, index) => `${JSON.stringify({ type: row.type, id: row.id, ticket: index + 1 })}||${JSON.stringify(changed && row.id === peers[0]?.id ? { unsupportedPeer: true } : row.body)}`).join("|\n");
    return `${JSON.stringify({ type: "DOCHEAD" })}||${JSON.stringify({ uuid: target.pageUuid, docType: "SCH_PAGE" })}|\n${rows}|\n`;
  };
  const before = packet("preflight", encode(body.nativeBeforeBody, false)), modified = packet("modify", encode(body.nativeAfterBody, false)),
    observed = packet("observe", encode(body.nativeAfterBody, corrupt === "peer"), corrupt === "window" ? "foreign-window" : "synthetic-window");
  return { compare: (): object => compareGeneratedSchematicDisplayEffect(argumentsValue, before, modified, observed),
    qualify: (): unknown => Reflect.apply(qualifyOriginalGeneratedSchematicDisplayEffect, undefined, [Object.freeze({ explicitSyntheticOwner: true }), argumentsValue, before, modified, observed]) };
}

void test("complete literal Text and peer comparison is inert and cannot issue an original native effect", () => {
  const f = fixture(); const effect = f.compare();
  assert.equal(Reflect.get(effect, "exactProjectedTextBodyVerified"), true); assert.equal(Reflect.get(effect, "originalNativeStageProvenanceVerified"), false);
  assert.equal(Reflect.get(effect, "selectedSqlAuthorized"), false); assert.throws(f.qualify, /ORIGINAL_FACTORY/u);
});
void test("an unexpected peer body or a changed original window prevents projected effect qualification", () => {
  const peer = fixture("peer"); assert.throws(peer.compare, /COMPLETE_PEER_BODY_ROSTER/u);
  const window = fixture("window"); assert.throws(window.compare, /ORIGINAL_WINDOW_CHANGED/u);
});
