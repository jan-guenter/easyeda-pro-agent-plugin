/** Fixed inverse compiler markers cannot transfer a schematic or runtime
 * capability. Source restoration is exact; no C# or native owner executes. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { expandCurrentFootprintInverseNativeTypeAliases as expand, projectCurrentFootprintInverseNativeTypeAliases as project } from "../src/current-footprint-inverse-native-type-aliases.ts";
import { expandCurrentSchematicNativeTypeAliases, projectCurrentSchematicNativeTypeAliases } from "../src/current-schematic-native-type-aliases.ts";

void test("inverse-only fixed aliases restore every old byte and refuse the other marker family", () => {
  const source = 'using System;\nusing System.Collections;\nclass Program { /* System.Collections.IDictionary */ string text="System.Text.StringBuilder"; System.Collections.IDictionary F(System.Collections.Hashtable x){System.Text.StringBuilder b=new System.Text.StringBuilder();return x;} }\n';
  const projected = project(source); assert.ok(projected.includes("// BEGIN FIXED INVERSE TYPE ALIASES V1\n")); assert.ok(!projected.includes("FIXED SCHEMATIC TYPE ALIASES") && projected.includes('"System.Text.StringBuilder"') && projected.includes("/* System.Collections.IDictionary */")); assert.equal(expand(projected), source); assert.equal(project(projected), projected); assert.equal(expand(source), source);
  assert.throws(() => expand(projectCurrentSchematicNativeTypeAliases(source))); assert.throws(() => project(projectCurrentSchematicNativeTypeAliases(source))); assert.throws(() => expandCurrentSchematicNativeTypeAliases(projected));
  for (const changed of [projected + projected, projected.replace("fixed-inverse-type-alias-source", "fixed-schematic-type-alias-source"), projected.replace("using ZQ0=", "using ZQ16="), projected.replace("return x", "return null"), projected.replace("// END FIXED INVERSE TYPE ALIASES V1\n", "")]) { assert.throws(() => expand(changed)); }
});
void test("inverse projection preserves the fixed root System, using and fresh alias collision refusals", () => {
  for (const source of ['using System;\nclass ZQ0 {System.Collections.Hashtable x;}', 'using System;\nclass Program {int System; System.Collections.Hashtable x;}', 'using System;\nusing ZQ1=System.String;\nclass Program {System.Collections.Hashtable x;}', 'using System;\nnamespace Changed {class Program {System.Collections.Hashtable x;}}', 'using Other;\nusing System;\nclass Program {System.Collections.Hashtable x;}']) { assert.throws(() => project(source)); }
  const source = 'using System;\nclass Program {System./*keep*/Collections.IDictionary a;System.Collections.Hashtable b;}'; const projected = project(source); assert.equal(expand(projected), source); assert.ok(projected.includes("System./*keep*/Collections.IDictionary"));
});
