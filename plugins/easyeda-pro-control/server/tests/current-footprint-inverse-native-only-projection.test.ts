/** Closed-graph source projection tests. They establish no native owner,
 * process, live effect or saved-content acceptance. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { projectCurrentFootprintInverseNativeOnly as project } from "../src/current-footprint-inverse-native-only-projection.ts";

const first = "public sealed partial class Owner{public int Native(){return Keep()+Codec.Encode()+ (publicBound?1:0);}}\n";
const fragment = 'public sealed partial class Owner{bool publicBound=false,unused=false;static readonly int[] Hidden=new[]{1,2};int Keep(){return Shared();}int Shared(){return 7;}int Omitted(){return Hidden[0];}public int PublicCall(){unused=true;return Omitted();}}public static class Codec{static readonly System.Collections.Generic.Dictionary<string,int> Map=new System.Collections.Generic.Dictionary<string,int>();static int Helper(){return Map.Count;}public static int Encode(){return Helper();}public static void Verify(){Encode();}}';
const source = `${first  }// BEGIN NATIVE ONLY CLOSED PUBLIC PublicOne\n${  fragment  }\n// END NATIVE ONLY CLOSED PUBLIC PublicOne\n`;
void test("native-only graph preserves reachable bodies, closes public entries and omits unused private state", () => {
  const result = project(source); assert.ok(result.source.startsWith(first)); assert.equal(result.retainedMethods, 4); assert.equal(result.omittedPrivateMethods, 1); assert.equal(result.omittedFields, 2);
  assert.deepEqual(result.closedPublicMethods, ["Owner.PublicCall", "Codec.Verify"]);
  for (const text of ["int Keep(){return Shared();}", "int Shared(){return 7;}", "static int Helper(){return Map.Count;}", "public static int Encode(){return Helper();}", "bool publicBound=false;"]) { assert.ok(result.source.includes(text), text); }
  assert.equal(result.source.includes("Hidden"), false); assert.equal(result.source.includes("unused"), false); assert.equal(result.source.includes("int Omitted"), false);
  assert.ok(result.source.includes('public int PublicCall(){throw new System.InvalidOperationException("native-only-public-route-closed");}'));
  assert.ok(result.source.includes("Dictionary<string,int> Map=new System.Collections.Generic.Dictionary<string,int>();"));
});
void test("native-only projection refuses unpaired/duplicate markers and malformed generated syntax", () => {
  assert.throws(() => project(first)); assert.throws(() => project(`${source  }// END NATIVE ONLY CLOSED PUBLIC PublicOne`));
  assert.throws(() => project(source.replace("PublicOne\n", "PublicOne\n// BEGIN NATIVE ONLY CLOSED PUBLIC PublicOne\n")));
  assert.throws(() => project(source.replace("int Keep(){return Shared();}", "int Keep(){return Shared();")));
});
