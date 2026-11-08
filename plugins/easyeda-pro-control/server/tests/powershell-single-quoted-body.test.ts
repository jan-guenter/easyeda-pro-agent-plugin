/** Actual bootstrap sinks share the complete PowerShell delimiter encoding. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { powershellSingleQuotedBody } from "../src/powershell-single-quoted-body.ts";

void test("all five single-quote delimiters preserve hostile path text as literal data", () => {
  const text = "C:\\quoted'\u2018\u2019\u201A\u201B+$($global:probe=1;\"x\")+`end\\file.ps1";
  assert.equal(powershellSingleQuotedBody(text), "C:\\quoted''\u2018\u2018\u2019\u2019\u201A\u201A\u201B\u201B+$($global:probe=1;\"x\")+`end\\file.ps1");
  assert.equal(powershellSingleQuotedBody(String.raw`C:\ordinary path\file.ps1`), String.raw`C:\ordinary path\file.ps1`);
});

void test("both graph loaders and all three native helper loaders encode their actual File.Open path", async () => {
  for (const name of ["current-footprint-forward-native-graph", "current-footprint-forward-cold-native-graph",
    "current-footprint-inverse-native-helper", "current-schematic-edit-native-helper", "current-pcb-diagnostic-owner"]) {
    const source = await readFile(new URL(`../src/${name}.ts`, import.meta.url), "utf8");
    assert.equal(source.split('from "./powershell-single-quoted-body.ts"').length, 2);
    assert.equal(source.split("[IO.File]::Open('${powershellSingleQuotedBody(").length, 2);
    assert.equal(source.includes('replaceAll("\'", "\'\'")'), false);
  }
});
