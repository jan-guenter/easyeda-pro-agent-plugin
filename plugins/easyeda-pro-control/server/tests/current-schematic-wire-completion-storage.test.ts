/** Exact generated source data; no app, native owner, mutation or saved proof. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { generateCurrentSchematicWireCompletionData } from "../../scripts/generate-schematic-wire-completion-data.ts";
import { PACKED_SCHEMATIC_WIRE_COMPLETION_DATA as PACKED } from "../src/current-schematic-wire-completion-data-packed.ts";
import { CURRENT_SCHEMATIC_WIRE_COMPLETION_ROLES as REVIEW_ROLES, CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE as REVIEW_SOURCE } from "../src/current-schematic-wire-completion-source.review.ts";
import { CURRENT_SCHEMATIC_WIRE_COMPLETION_ROLES as ROLES, CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE as SOURCE } from "../src/current-schematic-wire-completion-source.ts";
import { unpackFixedRuntimeData } from "../src/fixed-runtime-data-storage.ts";

void test("Wire completion storage exactly reproduces its readable review input and refuses trailing data",async()=>{
 const raw=[REVIEW_SOURCE,REVIEW_ROLES];assert.deepEqual([SOURCE,ROLES],raw);assert.deepEqual(unpackFixedRuntimeData(PACKED),raw);
 assert.equal(PACKED.rawBytes,20_585);assert.equal(PACKED.rawSha256,"0db726fa99d2418e2cba998583e624c5e60c8720a92fd55a0d1914d702f6e9f9");
 const generated=generateCurrentSchematicWireCompletionData(),stored=await readFile(new URL("../src/current-schematic-wire-completion-data-packed.ts",import.meta.url),"utf8");assert.equal(stored,generated);
 const appended=Buffer.concat([Buffer.from(PACKED.base64,"base64"),Buffer.from([0])]);
 const trailing={...PACKED,base64:appended.toString("base64"),packedBytes:appended.length,packedSha256:createHash("sha256").update(appended).digest("hex")};
 assert.throws(()=>unpackFixedRuntimeData(trailing));assert.throws(()=>unpackFixedRuntimeData({...PACKED,rawBytes:PACKED.rawBytes-1}));
});
