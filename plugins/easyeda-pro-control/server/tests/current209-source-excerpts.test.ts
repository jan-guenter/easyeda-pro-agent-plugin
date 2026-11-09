/** Linux fixtures retain exact function bytes without impersonating complete
 * installed scripts or entering any production authority registry. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { qualifyCurrentSchematicDisplaySaveSource, requireOriginalCurrentSchematicDisplaySaveSource } from "../src/current-schematic-display-save-source.ts";
import { qualifyCurrentProjectSaveProducerSource } from "../src/current-project-save-producer-source.ts";
import { qualifyGeneratedSchematicDisplayAccessorSource } from "../src/generated-schematic-display-accessor-replies.ts";
import { CURRENT209_SYNTHETIC_SCH_SOURCE, CURRENT209_SYNTHETIC_WORKER_SOURCE, current209SyntheticSourceModule } from "./helpers/current209-source-excerpts.ts";

const save={qualifyCurrentSchematicDisplaySaveSource,requireOriginalCurrentSchematicDisplaySaveSource};

void test("sparse pinned fixtures cannot satisfy complete source or production source-token ownership",()=>{
 assert.throws(()=>{qualifyCurrentProjectSaveProducerSource(CURRENT209_SYNTHETIC_WORKER_SOURCE);});
 assert.throws(()=>{save.qualifyCurrentSchematicDisplaySaveSource(CURRENT209_SYNTHETIC_WORKER_SOURCE);});
 assert.throws(()=>{qualifyGeneratedSchematicDisplayAccessorSource({scriptSource:CURRENT209_SYNTHETIC_SCH_SOURCE});});
 const module=current209SyntheticSourceModule("./current-schematic-display-save-source.ts",save);assert.ok(module!==null&&typeof module==="object");const qualify:unknown=Reflect.get(module,"qualifyCurrentSchematicDisplaySaveSource"),requireOriginal:unknown=Reflect.get(module,"requireOriginalCurrentSchematicDisplaySaveSource");assert.ok(typeof qualify==="function"&&typeof requireOriginal==="function");
 const token:unknown=Reflect.apply(qualify,undefined,[CURRENT209_SYNTHETIC_WORKER_SOURCE]);assert.ok(token!==null&&typeof token==="object");Reflect.apply(requireOriginal,undefined,[token]);assert.throws(()=>Reflect.apply(requireOriginal,undefined,[{...token}]));assert.throws(()=>Reflect.apply(save.requireOriginalCurrentSchematicDisplaySaveSource,undefined,[token]));assert.throws(()=>Reflect.apply(qualify,undefined,[`${CURRENT209_SYNTHETIC_WORKER_SOURCE} `]));
});
