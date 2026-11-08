/** Offset-only synthetic source fixture. No application source or owner is issued. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {buildCurrentFootprintInverseDeleteJobInertSource as build} from "./fixtures/current-footprint-inverse-delete-job-fixture.ts";

void test("inert source blanking keeps UTF-16 positions across astral characters and CRLF",()=>{
  const full=" ".repeat(2_181_308);
  const changed=`${full.slice(0,700)}😀${full.slice(702,18_550)}😀${full.slice(18_552,30_000)}\r\n${full.slice(30_002)}`;
  assert.equal(changed.length,full.length);
  const withLines=`${full.slice(0,30_000)}\r\n${full.slice(30_002)}`;
  for(const callback of[false,true]){
    const expected=build(withLines,callback);
    const actual=build(changed,callback);
    assert.equal(actual,expected);assert.equal(actual.slice(804,814),";exports=(");assert.equal(actual.slice(30_000,30_002),"\r\n");
  }
});
