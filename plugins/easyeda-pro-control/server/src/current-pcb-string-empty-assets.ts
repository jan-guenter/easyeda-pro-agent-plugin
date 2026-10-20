/** Empty current-holder exclusion for the first default-font ASCII fixture.
 * PCB217199c8: G4/nb3977392, V4/H83974027, Am3979349, z83979101,
 * GSe/id4244022, PF4244146. Existing holders only, no lazy construction.
 * Stored FONT/BLOB documents, pending Image.onload and remote asset requests
 * still require separate baseline/producer proof. No default glyph API is run.
 */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_STRING_OBSERVATION_GUARDS, decodeCurrentPcbStringObservation } from "./current-pcb-string-observation-core.ts";
import type { CURRENT_PCB_STRING_OBSERVATION_LIMITS } from "./current-pcb-string-observation-core.ts";
import { CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS } from "./current-pcb-constructor-scope.ts";

export const CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION = `function(originalCallback,constructors){
${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const scope=object(own(this,"object")),klass=n=>{const c=own(scope,n);if(typeof c!=="function")bad();return c;};
${CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS.common}
const instance=(o,n)=>{object(o);if(Object.getPrototypeOf(o)!==own(klass(n),"prototype"))bad();return o;};
const env=instance(own(klass("x"),"env"),"x"),documentUuid=id(own(env,"_id"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);
if(own(env,"_doctype")!==3)bad();
const nullableManager=(name,field)=>{const value=own(klass(name),field);return value===null?null:instance(value,name);};
const last=o=>{const result=marker(o,"_last");if(result==="present")bad();return result;};
const templateManager=nullableManager("nb","manager"),template=templateManager===null?null:{keys:emptyMap(own(templateManager,"map")),last:last(templateManager)};
const baseManager=nullableManager("H8","mgr"),base=baseManager===null?null:{keys:emptyMap(own(baseManager,"map")),uuidKeys:emptyObject(own(baseManager,"uuidMap")),last:last(baseManager)};
const unresolved=instance(own(klass("Am"),"ins"),"Am"),footprints=instance(own(klass("z8"),"ins"),"z8"),blobs=constructorInstance(own(scope,"id"),"GSe");
const result={schema:"easyeda-pro-control.pcb-string-empty-assets.v1",documentUuid,template,base,
unresolvedTexts:emptySet(own(unresolved,"texts")),fontFootprints:emptyMap(own(footprints,"footprints")),
blobTemplates:{keys:emptyMap(own(blobs,"map")),last:last(blobs)}};
verifyConstructorAssociations();verify();if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
return JSON.stringify(result);
}`;

const empty = z.array(z.never()).length(0);
const last = z.enum(["absent", "undefined", "null"]);
const manager = z.object({ keys: empty, last }).strict();
const schema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-string-empty-assets.v1"),
  documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
  template: manager.nullable(), base: manager.extend({ uuidKeys: empty }).strict().nullable(),
  unresolvedTexts: empty, fontFootprints: empty, blobTemplates: manager,
}).strict();
const LIMITS = Object.freeze({ completeStoredAssetsVerified: false, pendingAssetLoadsVerified: false,
  defaultGlyphCoverageVerified: false } as const);
export type CurrentPcbStringEmptyAssets = Readonly<z.infer<typeof schema>> &
  typeof CURRENT_PCB_STRING_OBSERVATION_LIMITS & typeof LIMITS;
export function decodeCurrentPcbStringEmptyAssets(input: unknown): CurrentPcbStringEmptyAssets {
  return Object.freeze({ ...decodeCurrentPcbStringObservation(input, schema), ...LIMITS });
}
export const CURRENT_PCB_STRING_EMPTY_ASSETS_SHA256 =
  createHash("sha256").update(CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION).digest("hex");
