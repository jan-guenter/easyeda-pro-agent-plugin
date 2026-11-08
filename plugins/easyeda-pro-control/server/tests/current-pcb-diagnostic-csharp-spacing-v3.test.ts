import assert from "node:assert/strict";
import { test } from "node:test";
import { compactCurrentPcbDiagnosticCSharp as compactV2, currentPcbDiagnosticCSharpTokenSha256 as hashTokens, currentPcbDiagnosticCSharpLexicalTokens as tokens } from "../src/current-pcb-diagnostic-csharp-spacing.ts";
import { compactCurrentPcbDiagnosticCSharpV3 as compact, restoreCurrentPcbDiagnosticCSharpV3 as restore } from "../src/current-pcb-diagnostic-csharp-spacing-v3.ts";
import { currentPcbDiagnosticCSharpRuntimeCompilerInput as compiler, expandCurrentPcbDiagnosticCSharpReviewSource as expand, packCurrentPcbDiagnosticCSharpTokenFusionStorage as pack, packCurrentPcbDiagnosticCSharpReviewStorage as packV2, retainCurrentPcbDiagnosticCSharpReviewStorage as retain } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";

const cases = ["class C { int n = a + + b; }", "class C { int n = a - - b; }", "class C { int n = a / * b; }", "class C { int n = a > > b; }", "class C { object n = 1 .ToString(); }", "class C { int n = 1 /*gone*/ + 2; }", "class C { string n = @\"a \"\" b\"; }", "class C { string n = \"/*literal*/\"; }", String.raw`class C { string n = "line\n"; }`, String.raw`class C { char n = '\''; }`];
void test("v3 preserves every literal and token across fusion boundaries", () => {
  for (const source of cases) {
    const value = compact(source);
    assert.equal(hashTokens(source), hashTokens(value.compact));
    assert.equal(restore(value.compact, value.spacing, value.tokenSha256), source);
    assert.ok(value.compact.length <= compactV2(source).compact.length);
  }
  assert.match(compact(cases[4] ?? "").compact, /1 \.ToString/u);
  const observed = tokens("class C {}");
  assert.ok(Object.isFrozen(observed) && observed.every(token => Object.isFrozen(token)));
});
void test("v3 restoration refuses changed compiler, malformed metadata and unsupported forms", () => {
  const value = compact("\nclass C { public int n = 1; }\n");
  assert.throws(() => restore(`${value.compact  };`, value.spacing, value.tokenSha256));
  assert.throws(() => restore(value.compact, Buffer.concat([value.spacing, Buffer.from([0])]), value.tokenSha256));
  assert.throws(() => restore(value.compact, value.spacing.subarray(0, -1), value.tokenSha256));
  assert.throws(() => restore(value.compact, Buffer.from([128, 0]), value.tokenSha256));
  assert.throws(() => restore(value.compact, value.spacing, "0".repeat(64)));
  for (const source of ['#if false\nclass C {}\n#endif', 'class C {string x=$"unsupported";}', String.raw`class C {int \u0061;}`, 'class C {int CallerLineNumber;}', `${" ".repeat(131_073)  }class C {}`] ) { assert.throws(() => compact(source)); }
});
void test("explicit v3 storage round trips while v2 packing retains its original format", () => {
  const source = "# before\nAdd-Type @'\nclass C { public string S = \"/*literal*/\"; }\n'@\n# after\n";
  const old = packV2(source);
  const stored = pack(source);
  assert.match(old, /REVIEW STORAGE V2/u);
  assert.doesNotMatch(old, /REVIEW STORAGE V3/u);
  assert.match(stored, /REVIEW STORAGE V3/u);
  assert.equal(expand(old), source);
  assert.equal(expand(stored), source);
  assert.equal(compiler(stored), compact("class C { public string S = \"/*literal*/\"; }").compact);
  assert.equal(pack(stored), stored);
  assert.equal(retain(source, stored), stored);
  assert.equal(retain(source, old), old);
  assert.throws(() => expand(`${stored  }# BEGIN FIXED CURRENT209 CSHARP REVIEW STORAGE V2\n`));
  assert.throws(() => expand(stored.replace("# fixed-review-spacing", "# changed-review-spacing")));
  assert.throws(() => expand(stored + stored));
});
