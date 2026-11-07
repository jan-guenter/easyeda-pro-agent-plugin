import assert from "node:assert/strict";
import { test } from "node:test";
import { installNativeCompileOnlyHook } from "../src/native-compile-only-hook.ts";

const base = "    [EasyedaDiagnosticOwner]::VerifyPcbViaClockSmoke()";
const schematic = "    [EasyedaDiagnosticOwner]::VerifySchematicDisplaySmoke()";
const begin = "    [EasyedaDiagnosticOwner]::VerifyPcbViaMainBeginSmoke()";
void test("independent compile hooks preserve each other through repeated interleaved generation", () => {
  const apply = (source: string): string => installNativeCompileOnlyHook(installNativeCompileOnlyHook(source, begin, base), schematic, base);
  const once = apply(`${schematic}\n${base}\n`);
  assert.equal(apply(once), once); assert.equal(once, `${begin}\n${schematic}\n${base}\n`);
});
void test("duplicate, changed or missing compile hooks refuse rather than silently replacing unknown source", () => {
  for (const source of [`${schematic}\n${schematic}\n${base}\n`, `${schematic} \n${base}\n`, `${base} \n`, `${base}\n${base}\n`]) {
    assert.throws(() => installNativeCompileOnlyHook(source, schematic, base), /NATIVE_COMPILE_ONLY_HOOK/u);
  }
});
