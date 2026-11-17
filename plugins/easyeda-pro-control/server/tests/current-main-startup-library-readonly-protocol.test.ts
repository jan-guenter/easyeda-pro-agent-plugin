/** Fixed codec-only cases; no source admission or transport is allocated. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentMainStartupLibraryReadonlyNativeCases, currentMainStartupLibraryReadonlyNativeRows, currentMainStartupLibraryReadonlyWire } from "../src/current-main-startup-library-readonly-native.ts";
import { validateCurrentMainStartupLibraryReadonlyCommand } from "../src/current-main-startup-library-readonly-protocol.ts";
import { validateCurrentMainStartupLibraryV2Command } from "../src/current-main-startup-library-v2-protocol.ts";

void test("finite native rows reject caller programs, side-effect flags, cross-script points and all V2 phase admission",()=>{
  const cases=currentMainStartupLibraryReadonlyNativeCases();assert.equal(currentMainStartupLibraryReadonlyNativeRows().length,9);
  for(const command of cases) {
    assert.equal(currentMainStartupLibraryReadonlyWire(command,73).request["phase"],command.phase);
    assert.throws(()=>validateCurrentMainStartupLibraryV2Command(command));
    assert.throws(()=>validateCurrentMainStartupLibraryReadonlyCommand({...command,params:{...command.params,sessionId:"foreign"}}));
    if(command.method==="Runtime.callFunctionOn") { for(const params of [{...command.params,functionDeclaration:"function(){return true}"},{...command.params,throwOnSideEffect:false}]) { assert.throws(()=>validateCurrentMainStartupLibraryReadonlyCommand({...command,params})); } }
    if(command.method==="Debugger.getPossibleBreakpoints") { assert.throws(()=>validateCurrentMainStartupLibraryReadonlyCommand({...command,params:{...command.params,end:{...command.params.end,scriptId:"other"}}})); }
  }
});
