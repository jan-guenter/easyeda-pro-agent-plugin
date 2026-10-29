import assert from "node:assert/strict";
import { test } from "node:test";
import { assertCurrentFootprintCopyProgramReturned } from "../src/current-footprint-copy-program-exception.ts";

void test("inspector refusals report only bounded stage and position without running exception hooks", () => {
  assert.doesNotThrow(() => { assertCurrentFootprintCopyProgramReturned({ result: { type: "boolean", value: true } }, "dependencies"); });
  assert.throws(() => { assertCurrentFootprintCopyProgramReturned({ result: { type: "object", objectId: "private-handle" },
    exceptionDetails: { text: "private-message", lineNumber: 103, columnNumber: 3 } }, "dependencies"); },
  { message: "FOOTPRINT_COPY_INSPECTOR_EXCEPTION:dependencies:104:4" });
  assert.throws(() => { assertCurrentFootprintCopyProgramReturned({ exceptionDetails: { scriptId: "original", lineNumber: 1, columnNumber: 15,
    stackTrace: { callFrames: [{ scriptId: "original", lineNumber: 1, columnNumber: 21 }, { scriptId: "original", lineNumber: 103, columnNumber: 3 },
      { scriptId: "other", lineNumber: 888, columnNumber: 888 }] } } }, "dependencies"); },
  { message: "FOOTPRINT_COPY_INSPECTOR_EXCEPTION:dependencies:104:4" });
  assert.throws(() => { assertCurrentFootprintCopyProgramReturned({ exceptionDetails: null }, "destinations"); },
  { message: "FOOTPRINT_COPY_INSPECTOR_EXCEPTION:destinations:unknown:unknown" });
  let hooks = 0;
  assert.throws(() => { assertCurrentFootprintCopyProgramReturned({ get exceptionDetails(): unknown { hooks += 1; return {}; } }, "dependencies"); },
  /PCB_STRING_CLOCK_REPLY_CAPTURE/u);
  assert.equal(hooks, 0);
});
