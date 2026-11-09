/** Fixed build aliases round-trip original C# without touching CDP literals. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { expandCurrentSchematicNativeTypeAliases as expand, projectCurrentSchematicNativeTypeAliases as project } from "../src/current-schematic-native-type-aliases.ts";
import { currentPcbDiagnosticCSharpLexicalTokens as tokenize } from "../src/current-pcb-diagnostic-csharp-spacing.ts";
import { currentPcbDiagnosticCSharpRuntimeCompilerInput as compiler, packCurrentPcbDiagnosticCSharpTokenFusionStorage as pack, currentPcbDiagnosticCSharpReviewSource as review } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";

const source = `// original System.InvalidOperationException ZQ0 comment
using System;
using OtherEncoding=System.Text.Encoding;
class Probe {
 string text="System.InvalidOperationException ZQ0";
 string verbatim=@"System.Collections.IDictionary ZQ1";
 char character='.';
 System.Collections.IDictionary map=new System.Collections.Hashtable();
 object spaced=typeof(System /* untouched */ . Collections . IDictionary);
 object openGeneric=typeof(System.Collections.Generic.Dictionary<string,int>);
 object Native(){var e=System.Text.Encoding.UTF8;return new System.InvalidOperationException("original");}
}
`;

/** Observe only literal-token text so added build metadata cannot hide a
 * rewritten application program, smoke vector or quoted diagnostic value. */
function literals(text: string): readonly string[] {
  return tokenize(text).filter(token => ["string", "verbatim", "char"].includes(token.kind)).map(token => token.text);
}

void test("only fixed type tokens change, global using aliases do not chain, and original bytes survive v3 storage", () => {
  const projected = project(source);
  assert.equal(expand(projected), source); assert.equal(project(projected), projected);
  assert.ok(projected.includes("using OtherEncoding=System.Text.Encoding;"));
  assert.ok(projected.includes("System /* untouched */ . Collections . IDictionary"));
  assert.ok(projected.includes("System.Collections.Generic.Dictionary<string,int>"));
  assert.ok(projected.includes("new ZQ0(")); assert.ok(projected.includes("ZQ1 map=new ZQ2()"));
  assert.deepEqual(literals(projected), literals(source));
  const helper = pack(`Add-Type @'\n${projected}\n'@\n`);
  assert.equal(review(helper), projected); assert.equal(expand(review(helper)), source);
  assert.ok(compiler(helper).includes("using ZQ0=System.InvalidOperationException;"));
});

void test("fresh alias/root binding and exact versioned restoration reject collisions, changed blocks and mixed bytes", () => {
  const projected = project(source);
  for (const collision of ["class ZQ0{}", "class @ZQ1{}", "class System{}", "namespace Other{}", "using System=Other;\nclass P{}"] as const) {
    assert.throws(() => project(`${source}\n${collision}`));
  }
  const begin = "// BEGIN FIXED SCHEMATIC TYPE ALIASES V1\n", end = "// END FIXED SCHEMATIC TYPE ALIASES V1\n";
  const stop = projected.indexOf(end) + end.length; assert.ok(stop > end.length);
  for (const changed of [projected.replace("using ZQ0=System.InvalidOperationException;", "using ZQ0=System.ArgumentException;"),
    projected.replace("new ZQ0(", "new ZQ1("), projected.replace('"original"', '"changed"'), projected.slice(stop),
    projected.replace(begin, begin + begin), projected.replace(end, ""), projected.replace("ZQ1 map", "@ZQ1 map")]) {
    assert.throws(() => expand(changed));
  }
});
