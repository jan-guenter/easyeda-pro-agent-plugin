/** The native phase delta must contain every fixed transformation, including
 * the SDK wait tail. This test constructs no owner or application. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_STAGE_FUNCTION as BASE} from "../src/generated-schematic-relevance-display-program.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_CAPTURE_FUNCTION as CAPTURE,CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_CAPTURE_REPLACEMENTS as CAPTURE_ROWS,CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_FUNCTION as MODIFY,CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_REPLACEMENTS as MODIFY_ROWS} from "../src/current-schematic-relevance-display-action-programs.ts";

void test("the complete native phase catalogue reconstructs both fixed programs and retains the distinct SDK wait",()=>{
 for(const[target,rows]of[[CAPTURE,CAPTURE_ROWS],[MODIFY,MODIFY_ROWS]]as const){let text=BASE;for(const[before,after]of rows){assert.equal(text.split(before).length,2);text=text.replace(before,after);}assert.equal(text,target);}
 assert.equal(MODIFY_ROWS.length,4);assert.equal(CAPTURE_ROWS.length,1);assert.ok(MODIFY.includes("const originalCompletionResult=await originalCompletionWait;"));assert.equal([...MODIFY.matchAll(/debugger;/gu)].length,6);
});
