/* oxlint-disable node/no-top-level-await -- Node's ESM test entry point awaits each named test. */
import assert from "node:assert/strict";
import test from "node:test";
import { compactGeneratedCSharpIndentation as compact } from "../../scripts/csharp-generated-indentation.ts";

await test("generated C# packing preserves literal and comment bytes while removing code indentation", () => {
  const source = '  class C {\r\n    string a = @"line\n    literal ""quoted""\n  last";\n    string b = "escaped \\\" // ";\n    char c = \'\\\\\';\n    /* comment\n     with indentation */\n    // line comment\n    int x = 1;\n  }\n';
  const expected = source.replace("  class", "class").replace("    string a", "string a").replace("    string b", "string b")
    .replace("    char c", "char c").replace("    /*", "/*").replace("    // line", "// line").replace("    int", "int").replace("  }", "}");
  assert.equal(compact(source), expected);
  assert.equal(compact(expected), expected);
  assert.equal(source.split("\n").length, expected.split("\n").length);
});

await test("generated C# packing refuses incomplete literals and block comments", () => {
  for (const source of ['"unterminated', "'unterminated", '@"unterminated', "/*unterminated", '"escape\\']) {
    assert.throws(() => compact(source), /Generated C#/u);
  }
  assert.equal(compact("  // final comment"), "// final comment");
});
