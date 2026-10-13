import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { isRecord } from "../src/core.ts";
import { inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";

// Exact method excerpts from api.js SHA5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc.
// These offline snippets test the reviewed behavior, not current installed bytes.
// Class mounts and UTF-16 offsets are retained in the adjacent research note.
const snippets = [
  { namespace: "sch_Document", methods: ["navigateToCoordinates", "navigateToRegion"],
    code: "new(class{async navigateToCoordinates(t,i){return!1}async navigateToRegion(t,i,n,r){return!1}})", result: false },
  { namespace: "pcb_PrimitiveAttribute", methods: ["create"], code: "new(class{create(){}})", result: undefined },
  { namespace: "pcb_PrimitivePoured", methods: ["create", "modify"], code: "new(class{create(){}modify(){}})", result: undefined },
] as const;
for (const snippet of snippets) {
  for (const name of snippet.methods) {
    void test(`reviewed public stub ${snippet.namespace}.${name} has no effect or useful acknowledgment`, async () => {
      const receiver: unknown = runInNewContext(snippet.code); assert.ok(isRecord(receiver));
      const method = receiver[name]; assert.equal(typeof method, "function");
      if (typeof method !== "function") { throw new TypeError("Reviewed stub is not callable."); }
      const input = Object.freeze({ id: "synthetic", x: 1, y: 2 });
      const pending: unknown = Reflect.apply(method, receiver, [input, input, input, input]);
      assert.equal(await pending, snippet.result);
      const row = inventoryExtensionApiCoverage().find((entry) => entry.path === `eda.${snippet.namespace}.${name}`);
      assert.equal(row?.omission?.code, "reviewed-native-stub"); assert.equal(row?.routes.length, 0);
    });
  }
}
void test("reviewed singular PCB primitive stub makes the unchanged plural wrapper silently empty", async () => {
  const receiver: unknown = runInNewContext("new(class{async getPrimitiveByPrimitiveId(t){}async getPrimitivesByPrimitiveId(t){let i=[];for(let n of t){let r=await this.getPrimitiveByPrimitiveId(n);r&&i.push(r)}return i}})");
  assert.ok(isRecord(receiver)); const method = receiver["getPrimitivesByPrimitiveId"];
  if (typeof method !== "function") { throw new TypeError("Reviewed plural wrapper is not callable."); }
  const pending: unknown = Reflect.apply(method, receiver, [["first", "second"]]);
  assert.equal(JSON.stringify(await pending), "[]");
  for (const path of ["eda.pcb_Primitive.getPrimitiveByPrimitiveId", "eda.pcb_Primitive.getPrimitivesByPrimitiveId"]) {
    const row = inventoryExtensionApiCoverage().find((entry) => entry.path === path);
    assert.equal(row?.status, "implemented-native-equivalent"); assert.equal(row?.completeDeclaredContractSupported, false);
  }
});
