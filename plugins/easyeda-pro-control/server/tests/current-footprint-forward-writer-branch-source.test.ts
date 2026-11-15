import assert from "node:assert/strict";
import { test } from "node:test";
import { qualifyCurrentFootprintForwardWriterBranchMainSource } from "../src/current-footprint-forward-writer-branch-source.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaApp } from "./helpers/installed-easyeda-source.ts";

void test("installed Main source qualifies the complete fixed readonly branch closure",async context=>{
 const source=await readConfiguredEasyedaApp();if(source===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return}qualifyCurrentFootprintForwardWriterBranchMainSource(source);assert.throws(()=>{ qualifyCurrentFootprintForwardWriterBranchMainSource(`${source.slice(0,2_606_895)}x${source.slice(2_606_896)}`); });
});
