/** A distinct immutable observation for genuine generated cloned Pads. */
import {z} from "zod";
import {canonicalJson} from "./core.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_PCB_SPATIAL_RESULT_MAX_BYTES} from "./current-pcb-spatial-validation.ts";
import {currentPcb209ComponentClonedPointResultSchema,currentPcb209ComponentClonedPointResultV1Schema} from "./current-pcb-209-component-cloned-point-read.ts";
import type {CurrentDisposableOpenSealedTarget} from "./current-disposable-open.ts";
import type {CurrentPcb209SpatialQuery} from "./current-pcb-209-spatial-read.ts";

const legacy=z.strictObject({schema:z.literal("easyeda-pro-control.pcb209-component-cloned-point-observation.v1"),results:z.array(currentPcb209ComponentClonedPointResultV1Schema).min(1).max(11),executionAuthorized:z.literal(false),saveAuthorized:z.literal(false)});
export const currentPcbComponentClonedSpatialObservationV1Schema=legacy.refine(value=>Buffer.byteLength(canonicalJson(value))<=CURRENT_PCB_SPATIAL_RESULT_MAX_BYTES);
export const currentPcbComponentClonedSpatialObservationSchema=legacy.extend({schema:z.literal("easyeda-pro-control.pcb209-component-cloned-point-observation.v2"),results:z.array(currentPcb209ComponentClonedPointResultSchema).min(1).max(11)}).refine(value=>Buffer.byteLength(canonicalJson(value))<=CURRENT_PCB_SPATIAL_RESULT_MAX_BYTES);
export function currentPcbComponentClonedSpatialObservation(input:unknown):Readonly<z.infer<typeof currentPcbComponentClonedSpatialObservationSchema>>{return freezeDeep(currentPcbComponentClonedSpatialObservationSchema.parse({schema:"easyeda-pro-control.pcb209-component-cloned-point-observation.v2",results:input,executionAuthorized:false,saveAuthorized:false}));}
export function requireCurrentPcbComponentClonedSpatialObservation(input:unknown,target:CurrentDisposableOpenSealedTarget,queries:readonly CurrentPcb209SpatialQuery[]):void{const value=currentPcbComponentClonedSpatialObservationSchema.parse(input);if(value.results.length!==queries.length||value.results.some((row,index)=>row.documentUuid!==target.documentUuid||canonicalJson(row.query)!==canonicalJson(queries[index]))){throw new Error("COMPONENT_CLONED_OBSERVATION_BINDING");}}

/** Historical shape validation only. This never issues a live reader owner. */
export function requireHistoricalCurrentPcbComponentClonedSpatialObservation(input:unknown,target:CurrentDisposableOpenSealedTarget,queries:readonly CurrentPcb209SpatialQuery[]):void{
 const value=z.union([currentPcbComponentClonedSpatialObservationV1Schema,currentPcbComponentClonedSpatialObservationSchema]).parse(input);
 if(value.results.length!==queries.length||value.results.some((row,index)=>row.documentUuid!==target.documentUuid||canonicalJson(row.query)!==canonicalJson(queries[index]))){throw new Error("COMPONENT_CLONED_HISTORICAL_BINDING");}
}
