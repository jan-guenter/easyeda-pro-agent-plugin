/** Separate seven-row Relevance display data. This module issues no native,
 * action, worker, SQL or persistence authority. The old six-row profile stays
 * immutable and its checkpoint/argument brand cannot enter this branch. */
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import type { GeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import { MANAGED_SCHEMATIC_FIXTURE_TEXT } from "./managed-schematic-fixture-generator.ts";
import { MANAGED_SCHEMATIC_RELEVANCE_ATTRIBUTE } from "./managed-schematic-relevance-fixture-generator.ts";
import { prepareGeneratedSchematicDisplayBodyPlan } from "./generated-schematic-display-source.ts";
import type { GeneratedSchematicDisplayPatch } from "./generated-schematic-display.ts";

export const generatedSchematicRelevanceDisplayOperationIdSchema = z.string().min(30).max(80).regex(/^sch209-relevance-display-[a-z0-9][a-z0-9-]*$/u);
/** Full files and UTF16 half-open methods, including actual watched sorting.
 * Renderer.init may normalize the root before our capture. Our fixed stage
 * never invokes sorting and refuses an unsettled root. */
export const GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_SOURCE = freezeDeep({
  schema: "easyeda-pro-control.generated-schematic-relevance-display-source.v1",
  files: [
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "methods": {
      "source": {
        "start": 4_455_784,
        "end": 4_456_079,
        "sha256": "d299c279b5f29861d1df203dd81881f3abdde788a0d5d450fb5d70c87d47d877"
      },
      "sort": {
        "start": 1_740_471,
        "end": 1_741_299,
        "sha256": "b0a16246bfd5a6f486cb5a0ffe098e0af6f4f681ab04442a8a905a5435fec7cf"
      },
      "recalculate": {
        "start": 1_740_040,
        "end": 1_740_207,
        "sha256": "f0615f09a0ab51b94a413fa511e91eb2a5ef5a10a9abd3682e6905c36ff5a59a"
      },
      "childIndex": {
        "start": 1_740_207,
        "end": 1_740_471,
        "sha256": "26168bcd4b2f5979f402e6e93d4adf3a6da6f667e586bde2977dab71bb14e9c5"
      },
      "indexSetter": {
        "start": 1_733_277,
        "end": 1_733_587,
        "sha256": "b342b509208b78958765173a9e56bda1d1c5744f6a7d8310318adf9ecb3133f0"
      },
      "renderInit": {
        "start": 4_370_097,
        "end": 4_370_272,
        "sha256": "df867107efab6778daaae56162bcae89cfdf568690a6c265488af858a1d2eb1f"
      },
      "attr": {
        "start": 5_579_424,
        "end": 5_580_206,
        "sha256": "eeb46edad8f5219ade12032c24526e4c807fe124a2048f03dcba9ab95a5cd09e"
      },
      "attrValue": {
        "start": 4_079_456,
        "end": 4_079_554,
        "sha256": "d6e0ee0ade2d48e9a3cb150f1f70cffe3472683dfee1de5a6d13cdd1d0e647e2"
      },
      "blockValue": {
        "start": 5_586_613,
        "end": 5_586_793,
        "sha256": "fed10906091ac1ae607ab00a6705298f8a675f6d8c083a76e427d71c43480b35"
      },
      "blockValueSetter": {
        "start": 5_586_793,
        "end": 5_586_985,
        "sha256": "b5befbee0d678127f9e5370285732547b973cba7e396bc6c27f3e220c02eadf8"
      },
      "modifyAttr": {
        "start": 4_433_039,
        "end": 4_433_326,
        "sha256": "34783ace83b76875c91d4dee535015a339bdf5f3da06d0c5a87e88f3aab29df3"
      },
      "modifyText": {
        "start": 4_434_269,
        "end": 4_435_060,
        "sha256": "2eb7f55c415bcba6a75dd22f62cd578ee2a97115cca23167c04722203f4b7b91"
      },
      "commit": {
        "start": 4_443_306,
        "end": 4_444_140,
        "sha256": "b58cc7aebad6948327015c6469d1adec791f30f81ac2b5ec5c40125cef489bf5"
      },
      "decodeAttr": {
        "start": 4_442_730,
        "end": 4_443_306,
        "sha256": "ad8544c1e6b160499db08ed284615d44eb7ba88cbb413eff9c3db3d102ef122c"
      },
      "line": {
        "start": 3_855_644,
        "end": 3_855_929,
        "sha256": "8925258cc628592c187f1ef2d6a7390d95f4bab9768eb9c5cee540e78a50f699"
      },
      "common": {
        "start": 1_731_862,
        "end": 1_732_248,
        "sha256": "71ba3ff796a1f52b2772ae0ed35d979112f417bf5d687af085921a85290b3066"
      },
      "text": {
        "start": 4_126_698,
        "end": 4_127_069,
        "sha256": "7d2e85b1288bf1ea018db7e6629414ab69b432331f2f5018445b2aa76f63f6c5"
      }
    }
  },
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "methods": {
      "source": {
        "start": 4_678_553,
        "end": 4_678_848,
        "sha256": "041a8daf82e987282e134c8c751dbc18afb6b5d2f4c5f8671891127a58c7ae22"
      },
      "sort": {
        "start": 1_937_025,
        "end": 1_937_853,
        "sha256": "b0a16246bfd5a6f486cb5a0ffe098e0af6f4f681ab04442a8a905a5435fec7cf"
      },
      "recalculate": {
        "start": 1_936_594,
        "end": 1_936_761,
        "sha256": "f0615f09a0ab51b94a413fa511e91eb2a5ef5a10a9abd3682e6905c36ff5a59a"
      },
      "childIndex": {
        "start": 1_936_761,
        "end": 1_937_025,
        "sha256": "26168bcd4b2f5979f402e6e93d4adf3a6da6f667e586bde2977dab71bb14e9c5"
      },
      "indexSetter": {
        "start": 1_929_831,
        "end": 1_930_141,
        "sha256": "b342b509208b78958765173a9e56bda1d1c5744f6a7d8310318adf9ecb3133f0"
      },
      "renderInit": {
        "start": 4_595_458,
        "end": 4_595_633,
        "sha256": "df867107efab6778daaae56162bcae89cfdf568690a6c265488af858a1d2eb1f"
      },
      "attr": {
        "start": 6_320_094,
        "end": 6_320_876,
        "sha256": "eeb46edad8f5219ade12032c24526e4c807fe124a2048f03dcba9ab95a5cd09e"
      },
      "attrValue": {
        "start": 4_295_593,
        "end": 4_295_691,
        "sha256": "d6e0ee0ade2d48e9a3cb150f1f70cffe3472683dfee1de5a6d13cdd1d0e647e2"
      },
      "blockValue": {
        "start": 6_327_283,
        "end": 6_327_463,
        "sha256": "dd5332b62e7888dadf31ea34eb71e51131ea053a41e531cf4863374ca5daa2f8"
      },
      "blockValueSetter": {
        "start": 6_327_463,
        "end": 6_327_655,
        "sha256": "79c41a6c696ce481e9b5b192da3f3d1e2efbff7acd2cbce2a04aa9504d30ceab"
      },
      "modifyAttr": {
        "start": 4_655_808,
        "end": 4_656_095,
        "sha256": "34783ace83b76875c91d4dee535015a339bdf5f3da06d0c5a87e88f3aab29df3"
      },
      "modifyText": {
        "start": 4_657_038,
        "end": 4_657_829,
        "sha256": "9c1cdea6f0e0553c91854ea8d01c6e1edf476968ee13638ce84df7576dfd8082"
      },
      "commit": {
        "start": 4_666_075,
        "end": 4_666_909,
        "sha256": "6e4d06929d777e61d0480a074741dd474fcc83178f20e47b681b069f3ec54190"
      },
      "decodeAttr": {
        "start": 4_665_499,
        "end": 4_666_075,
        "sha256": "d99f517adaece13c38738a8084ef1b8d12ed871832e5538d7235cfaa8d763a5c"
      },
      "line": {
        "start": 2_155_076,
        "end": 2_155_361,
        "sha256": "8925258cc628592c187f1ef2d6a7390d95f4bab9768eb9c5cee540e78a50f699"
      },
      "common": {
        "start": 1_928_416,
        "end": 1_928_802,
        "sha256": "71ba3ff796a1f52b2772ae0ed35d979112f417bf5d687af085921a85290b3066"
      },
      "text": {
        "start": 4_331_870,
        "end": 4_332_241,
        "sha256": "7d2e85b1288bf1ea018db7e6629414ab69b432331f2f5018445b2aa76f63f6c5"
      }
    }
  }
],
  originalSerializerExecutionObserved: false, rootNormalizationIsInMemoryBookkeeping: true,
  initialNullIndexByteInverseAvailable: false, writerAuthority: false,
});
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`SCH209_RELEVANCE_DISPLAY_${reason}`); } }
export function projectGeneratedSchematicRelevanceNativeAttributeBody(input: Readonly<Record<string, unknown>>, wireId: string): Readonly<Record<string, unknown>> {
  need(/^0[a-f0-9]{15}$/u.test(wireId) && canonicalJson(input) === canonicalJson({ ...MANAGED_SCHEMATIC_RELEVANCE_ATTRIBUTE, parentId: wireId }), "ATTRIBUTE_INPUT");
  const { groupId: _group, version: _version, ...body } = input;
  // Original NetPointManager.init adds two source-excluded endpoint markers.
  // The original Wire sort then orders LINE, both markers, Relevance ATTR.
  return freezeDeep({ ...body, zIndex: 3, fillColor: input["color"] });
}
export interface GeneratedSchematicRelevanceDisplayBodyPlan {
  readonly schema: "easyeda-pro-control.generated-schematic-relevance-display-body-plan.v1";
  readonly patch: GeneratedSchematicDisplayPatch;
  /** Root zIndex is deliberately absent: only the retained native capture
   * supplies its actual already-normalized value. */
  readonly nativeBeforeBody: Readonly<Record<string, unknown>>;
  readonly nativeAfterBody: Readonly<Record<string, unknown>>;
  readonly sourceProfileSha256: string;
  readonly rootIndexMustBeRetainedFromNativeCapture: true;
  readonly inverseBaseline: "already-normalized-native-capture";
  readonly inverseAvailable: false; readonly writerAuthority: false; readonly persistenceVerified: false;
}
export function prepareGeneratedSchematicRelevanceDisplayBodyPlan(patch: unknown): GeneratedSchematicRelevanceDisplayBodyPlan {
  const old = prepareGeneratedSchematicDisplayBodyPlan(patch);
  need(old.nativeBeforeBody["zIndex"] === null && old.nativeAfterBody["zIndex"] === null, "TEXT_PROJECTION");
  const { zIndex: _beforeIndex, ...before } = old.nativeBeforeBody, { zIndex: _afterIndex, ...after } = old.nativeAfterBody;
  return freezeDeep({ schema: "easyeda-pro-control.generated-schematic-relevance-display-body-plan.v1", patch: old.patch,
    nativeBeforeBody: before, nativeAfterBody: after, sourceProfileSha256: sha256Json(GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_SOURCE),
    rootIndexMustBeRetainedFromNativeCapture: true, inverseBaseline: "already-normalized-native-capture", inverseAvailable: false,
    writerAuthority: false, persistenceVerified: false });
}
export interface GeneratedSchematicRelevanceDisplayNativeArguments {
  readonly schema: "private.generated-schematic-relevance-display-args.v1";
  readonly target: GeneratedSchematicRelevanceFixtureOpenCheckpoint["qualification"]["target"];
  readonly operation: Readonly<{ operationId: string; textId: string; rootIds: readonly string[];
    beforeBody: Readonly<Record<string, unknown>>; afterBody: Readonly<Record<string, unknown>>;
    peers: readonly Readonly<{ id: string; type: "CANVAS" | "WIRE" | "LINE" | "BUS" | "ATTR"; body: Readonly<Record<string, unknown>> }>[] }>;
}
const originals = new WeakMap<GeneratedSchematicRelevanceDisplayNativeArguments, Readonly<{ prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint; text: string }>>();
export function buildGeneratedSchematicRelevanceDisplayNativeArguments(prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint, operationId: string, patch: unknown): GeneratedSchematicRelevanceDisplayNativeArguments {
  assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared); generatedSchematicRelevanceDisplayOperationIdSchema.parse(operationId);
  const plan = prepareGeneratedSchematicRelevanceDisplayBodyPlan(patch), target = prepared.qualification.target;
  const page = prepared.history.documents.find(document => document.uuid === target.pageUuid && document.docType === "SCH_PAGE"); need(page !== undefined, "PAGE");
  const texts = page.records.filter(row => row.type === "TEXT"); const wires = page.records.filter(row => row.type === "WIRE"); const buses = page.records.filter(row => row.type === "BUS");
  const text = texts[0]; const wire = wires[0]; const bus = buses[0]; need(texts.length === 1 && wires.length === 1 && buses.length === 1 && text !== undefined && wire !== undefined && bus !== undefined, "ROOT_ROSTER");
  need(canonicalJson(text.body) === canonicalJson(MANAGED_SCHEMATIC_FIXTURE_TEXT), "INITIAL_TEXT");
  const peers: { id: string; type: "CANVAS" | "WIRE" | "LINE" | "BUS" | "ATTR"; body: Readonly<Record<string, unknown>> }[] = [{ id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } }];
  for (const row of page.records.filter(record => record.id !== "META" && record.id !== text.id)) {
    need(row.type === "WIRE" || row.type === "LINE" || row.type === "BUS" || row.type === "ATTR", "PEER_TYPE");
    let body = structuredClone(row.body);
    if (row.type === "WIRE" || row.type === "BUS") {
      need(body["groupId"] === 0 && body["zIndex"] === null, "GROUP_BODY"); const { groupId: _group, zIndex: _index, ...rest } = body; body = rest;
    } else if (row.type === "ATTR") { body = { ...projectGeneratedSchematicRelevanceNativeAttributeBody(body, wire.id) }; }
    peers.push({ id: row.id, type: row.type, body });
  }
  need(peers.length === 6 && new Set(peers.map(row => row.id)).size === 6 && peers.filter(row => row.type === "ATTR").length === 1 && peers.filter(row => row.type === "LINE").length === 2, "COMPLETE_PEERS");
  const result: GeneratedSchematicRelevanceDisplayNativeArguments = freezeDeep({ schema: "private.generated-schematic-relevance-display-args.v1", target: structuredClone(target),
    operation: { operationId, textId: text.id, rootIds: [text.id, wire.id, bus.id].toSorted(), beforeBody: plan.nativeBeforeBody, afterBody: plan.nativeAfterBody,
      peers: peers.toSorted((left, right) => left.id.localeCompare(right.id)) } });
  originals.set(result, { prepared, text: canonicalJson(result) }); return result;
}
export function requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments(value: GeneratedSchematicRelevanceDisplayNativeArguments, prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint): void {
  const original = originals.get(value); need(original !== undefined && original.prepared === prepared && original.text === canonicalJson(value), "ORIGINAL_ARGUMENTS");
  assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared);
}
