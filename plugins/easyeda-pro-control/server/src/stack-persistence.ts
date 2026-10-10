import { canonicalJson, sha256Json } from "./core.ts";
import { verifyDesignPersistence } from "./design-persistence.ts";
import { expectedDesignStackSource } from "./design-stack-adapter.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";

/** Native setLayerPhys deletes retired LAYER_PHYS but leaves the prior unused
 * SUBSTRATE LAYER record. getfilterPhyLayers omits only substrate rows without
 * a matching physical model. Preserve their exact durable bodies, not a generic
 * layer exemption. Every remaining record uses the ordinary whole-DB proof.
 */
export function verifyStackPersistence(input: Parameters<typeof verifyDesignPersistence>[0], operation: unknown): ReturnType<typeof verifyDesignPersistence> {
  const expected = expectedDesignStackSource(operation, input.expectedBefore);
  if (canonicalJson(expected) !== canonicalJson(input.expectedAfter)) {throw new Error("Stack persistence requires the exact intended source, without normalization.");}
  const retired = input.expectedBefore.objects.filter((object) => object.type === "LAYER" && object.body["layerType"] === "SUBSTRATE" &&
    !input.expectedAfter.objects.some((candidate) => candidate.id === object.id));
  for (const object of retired) {
    const key: unknown = JSON.parse(object.id);
    if (!Array.isArray(key) || key[0] !== "LAYER" || typeof key[1] !== "number" || object.body["layerId"] !== key[1] ||
        !input.expectedBefore.objects.some((candidate) => candidate.id === JSON.stringify(["LAYER_PHYS", key[1]]) && candidate.type === "LAYER_PHYS") ||
        input.expectedAfter.objects.some((candidate) => candidate.id === JSON.stringify(["LAYER_PHYS", key[1]]))) {throw new Error("Retired substrate does not match the native physical-layer filter.");}
  }
  const base = { schema: input.expectedAfter.schema, document: input.expectedAfter.document,
    objects: [...input.expectedAfter.objects, ...retired].toSorted((left, right) => left.id.localeCompare(right.id)) };
  const projected: NativeSourceSnapshot = { ...base, sha256: sha256Json(base) };
  const proof = verifyDesignPersistence({ ...input, expectedAfter: projected });
  return { ...proof, stackNativeStorage: { profile: "easyeda-pro-control.native-stack-storage.v1", exportedAfterSha256: input.expectedAfter.sha256,
    comparisonAfterSha256: projected.sha256, retainedSubstrateIds: retired.map((object) => object.id), predicate: "SUBSTRATE without matching LAYER_PHYS; exact preexisting body retained" } };
}
