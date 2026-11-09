/** V2 source-only aliases preserve both historical V1 bytes and all original
 * literals. These checks execute no C#, native helper or application actor. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_REVIEW_MAX_BYTES as MAXIMUM, currentPcbDiagnosticCSharpRuntimeCompilerInput as compiler, packCurrentPcbDiagnosticCSharpTokenFusionStorage as pack, currentPcbDiagnosticCSharpReviewSource as review } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import { currentPcbDiagnosticCSharpLexicalTokens as tokenize } from "../src/current-pcb-diagnostic-csharp-spacing.ts";
import { expandCurrentSchematicNativeTypeAliases as expandV1, projectCurrentSchematicNativeTypeAliases as projectV1 } from "../src/current-schematic-native-type-aliases.ts";
import { expandCurrentSchematicNativeTypeAliasesV2 as expand, hasCurrentSchematicNativeTypeAliasesV2 as has, projectCurrentSchematicNativeTypeAliasesV2 as project } from "../src/current-schematic-native-type-aliases-v2.ts";

const BEGIN = "// BEGIN FIXED SCHEMATIC TYPE ALIASES V2\n", END = "// END FIXED SCHEMATIC TYPE ALIASES V2\n";
const helper = "EasyedaDiagnosticFixedTable";
const original = `// System.StringComparison ZV0 EasyedaDiagnosticFixedTable
using System;
using System.Collections.Generic;
using OtherEncoding=System.Text.Encoding;
public static class ${helper}{public static int Read(){return 1;}}
class Probe {
 string text="System.IntPtr StringComparison ZV0 EasyedaDiagnosticFixedTable";
 string verbatim=@"InvalidOperationException ZV14";
 char character='.';
 object spaced=typeof(System /* unchanged */ . Collections . Generic . List<>);
 object different=typeof(Other.System.Collections.Generic.List<>);
 static void Run(){
 ${Array.from({ length: 40 }, (_value, index) => `System.Collections.Generic.Dictionary<string,int> values${String(index)}=null;
 System.IntPtr pointer${String(index)}=System.IntPtr.Zero;
 System.StringComparison qualified${String(index)}=System.StringComparison.Ordinal;
 var comparison${String(index)}=StringComparison.Ordinal;var comparer${String(index)}=StringComparer.Ordinal;
 var bytes${String(index)}=System.Text.Encoding.UTF8.GetBytes("preserved");
 int helper${String(index)}=${helper}.Read();
 try{throw new InvalidOperationException("original");}catch(InvalidOperationException exception${String(index)}){}`).join("\n")}
 }
}
`;
/** Observe literal tokens independently of both codec metadata formats. */
function literals(source: string): readonly string[] {
  return tokenize(source).filter(token => ["string", "verbatim", "char"].includes(token.kind)).map(token => token.text);
}

void test("V2 composes with immutable V1 and V3 storage without changing original data or declarations", () => {
  const old = projectV1(original), projected = project(original);
  assert.ok(has(projected)); assert.equal(expand(projected), original); assert.equal(project(projected), projected);
  assert.equal(expand(old), original); assert.equal(project(old), projected); assert.equal(expandV1(old), original);
  assert.equal(projectV1(original), old); assert.ok(projected.length < old.length - 5000);
  assert.ok(projected.includes("using ZV0=global::System.Collections.Generic;"));
  assert.ok(projected.includes("// fixed-schematic-type-alias-catalogue-v2 60ff2369145476db7f25091bfcabe453fdf5a3cb13b868c4c58709c37aa1567d\n"));
  assert.ok(projected.includes("using ZV14=global::System.InvalidOperationException;"));
  assert.ok(projected.includes(`using ZV17=global::${helper};`));
  assert.ok(projected.includes(`public static class ${helper}{`));
  assert.ok(projected.includes("using OtherEncoding=System.Text.Encoding;"));
  assert.ok(projected.includes("System /* unchanged */ . Collections . Generic . List<>"));
  assert.ok(projected.includes("Other.System.Collections.Generic.List<>"));
  assert.ok(projected.includes("ZV0.Dictionary<string,int>")); assert.ok(projected.includes("ZV17.Read()"));
  assert.deepEqual(literals(projected), literals(original));
  const stored = pack(`Add-Type @'\n${projected}\n'@\n`);
  assert.equal(review(stored), projected); assert.equal(expand(review(stored)), original);
  assert.ok(compiler(stored).includes("using ZV0=global::System.Collections.Generic;"));
});

void test("V1-only historical output stays canonical when no V2 entry pays for its metadata", () => {
  const small = "using System;\nclass Probe{object Read(){return System.Text.Encoding.UTF8;}}\n";
  assert.equal(project(small), projectV1(small)); assert.equal(has(project(small)), false);
  assert.equal(expand(small), small); assert.equal(expand(project(small)), small);
});

void test("the complete census refuses aliases, escaped candidates, helper shadows and unsupported bare type positions", () => {
  for (const collision of [
    "class ZV0{}", "class @ZV36{}", "class @StringComparison{}", "class @IntPtr{}", `class @${helper}{}`,
    `class Outer{public static class ${helper}{}}`, `public static class ${helper}{}`,
    `class Shadow{void Run(int ${helper}){}}`, `class Shadow{object Read(){return typeof(${helper});}}`,
    `class Shadow{object Read(){return new ${helper}();}}`, `class Shadow{void Read(){Other.${helper}.Read();}}`,
    `class Shadow{void Read(){${helper} x=null;}}`, `class Shadow<${helper}>{}`,
    "class StringComparison{}", "class StringComparer{}", "class InvalidOperationException{}",
    "class Shadow{void Run(int StringComparison){}}", "class Shadow{void Run(int InvalidOperationException){}}",
    "class Shadow<StringComparer>{}", "class Shadow{object Read(){return typeof(InvalidOperationException);}}",
    "class Shadow{object Read(){return typeof(StringComparison);}}", "class Shadow{void Run(){StringComparer x=null;}}",
  ]) { assert.throws(() => project(original + collision), /SCHEMATIC_NATIVE_TYPE_ALIASES/u, collision); }
  for (const directive of ["using Other;", "using System.Unreviewed;", "using StringComparison=System.StringComparison;", `using ${helper}=System.StringComparer;`]) {
    assert.throws(() => project(original.replace("using System;", `using System;\n${directive}`)), /SCHEMATIC_NATIVE_TYPE_ALIASES/u, directive);
  }
  assert.throws(() => project(original.replace(`public static class ${helper}`, `public class ${helper}`)));
  assert.throws(() => project(original.replace(`public static class ${helper}{public static int Read(){return 1;}}`, "")));
  assert.throws(() => project(`${original.replace(`public static class ${helper}`, `namespace Other{public static class ${helper}`)  }}`));
});

void test("canonical V2 decode rejects block, index, placement, escaped alias and full-source changes", () => {
  const projected = project(original), stop = projected.indexOf(END) + END.length; assert.ok(stop > END.length);
  for (const changed of [
    projected.replace(BEGIN, BEGIN + BEGIN), projected.replace(END, ""), projected + END,
    projected.replace("using ZV0=global::System.Collections.Generic;", "using ZV0=System.Collections.Generic;"),
    projected.replace("using ZV0=global::System.Collections.Generic;", "using ZV0=global::System.Collections;"),
    projected.replace(/(fixed-schematic-type-alias-source-v2 \d+ [a-f\d]{64} )0,/u, (_match, prefix: string) => `${prefix}01,`),
    projected.replace("fixed-schematic-type-alias-catalogue-v2 60ff", "fixed-schematic-type-alias-catalogue-v2 61ff"),
    projected.replace("ZV0.Dictionary", "@ZV0.Dictionary"), projected.replace("ZV17.Read()", "ZV16.Read()"),
    projected.replace('"original"', '"changed"'), projected.slice(stop), `// moved\n${projected}`,
    projected.replace("TYPE ALIASES V2", "TYPE ALIASES V9"),
  ]) { assert.throws(() => expand(changed)); }
  assert.throws(() => expand(`${original  }class ZV0{}`)); assert.throws(() => expand(`${original  }class @ZV0{}`));
});

void test("review caps and the restricted lexer refuse before any alias output", () => {
  const huge = " ".repeat(MAXIMUM + 1);
  assert.throws(() => project(huge)); assert.throws(() => expand(huge));
  for (const suffix of ["#define NEW\n", 'class P{string x=$"value";}', String.raw`class \u0053tringComparison{}`, "class P{string x=\"\"\"raw\"\"\";}", "class P{int é;}"]) {
    assert.throws(() => project(original + suffix));
  }
});
