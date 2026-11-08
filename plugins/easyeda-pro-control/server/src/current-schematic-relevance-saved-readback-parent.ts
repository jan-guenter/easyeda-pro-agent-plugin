/** A fixed original writer-journal join, never a callback table or a native
 * grant. The saved reader continues to own its distinct durable journal. */
import { assertOriginalGeneratedSchematicRelevanceDisplayJournal } from "./generated-schematic-relevance-display-journal.ts";
import type { GeneratedSchematicRelevanceDisplayJournal } from "./generated-schematic-relevance-display-journal.ts";
import { requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import type { GeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import type { CurrentSchematicRelevanceSavedReadbackJournalKind } from "./current-schematic-relevance-saved-readback-journal.ts";

export interface CurrentSchematicRelevanceSavedReadbackParent { readonly profile: "private.current-schematic-relevance-saved-readback-parent.v1" }
export interface CurrentSchematicRelevanceSavedReadbackParentBinding {
 readonly assertCurrent: () => void; readonly ready: () => Promise<void>;
 readonly record: (kind: CurrentSchematicRelevanceSavedReadbackJournalKind, evidence: Readonly<Record<string,unknown>>) => Promise<void>;
}
const phases = Object.freeze({
 "allocation-intent":"reopen-intent", "cold-result":"reopen-result", "scene-intent":"reopened-effect-intent", "scene-result":"reopened-effect-result",
 "close-intent":"reopen-close-intent", "close-result":"reopen-close-result", "exit-intent":"reopen-exit-intent", "release-result":"reopen-exit-result",
 "closed-sql-intent":"reopened-sql-intent", "closed-sql-result":"reopened-sql-result",
} as const);
type ParentKind = typeof phases[keyof typeof phases];
interface Original {
 readonly journal: GeneratedSchematicRelevanceDisplayJournal; readonly prepared: GeneratedSchematicRelevanceSavedReadbackPlan;
 readonly original: ReturnType<typeof requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan>;
 readonly initial: ReturnType<typeof assertOriginalGeneratedSchematicRelevanceDisplayJournal>;
 readonly publications: Map<ParentKind, Promise<void>>; pending: Promise<void> | null; reader: object | null;
}
const originals = new WeakMap<CurrentSchematicRelevanceSavedReadbackParent,Original>();
const attempts = new WeakMap<GeneratedSchematicRelevanceSavedReadbackPlan,CurrentSchematicRelevanceSavedReadbackParent>();
function need(value:boolean,reason:string):asserts value { if(!value){throw new Error(`SCHEMATIC_SAVED_PARENT_${reason}`);} }
function current(state:Original):void {
 const actual=requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(state.prepared);
 need(actual.closed===state.original.closed&&actual.lifecycle===state.original.lifecycle&&actual.data===state.original.data,"ORIGINAL_SAVED_PLAN");
 const closed=state.original.closed;
 need(assertOriginalGeneratedSchematicRelevanceDisplayJournal(state.journal,closed.owner,closed.args)===state.initial,"ORIGINAL_JOURNAL");
}
/** The genuine saved-plan lookup already joins its new closed checkpoint to
 * this exact old owner/args, drained Save, complete SQL and released helper. */
export function prepareOriginalCurrentSchematicRelevanceSavedReadbackParent(journal:GeneratedSchematicRelevanceDisplayJournal,prepared:GeneratedSchematicRelevanceSavedReadbackPlan):CurrentSchematicRelevanceSavedReadbackParent {
 const original=requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(prepared);const closed=original.closed;
 const initial=assertOriginalGeneratedSchematicRelevanceDisplayJournal(journal,closed.owner,closed.args);
 const prior=attempts.get(prepared);if(prior!==undefined){const state=originals.get(prior);need(state!==undefined&&state.journal===journal,"ORIGINAL_PARENT");current(state);return prior;}
 const records:unknown=journal.retained()["records"];need(Array.isArray(records),"ORIGINAL_RECORDS");const last:unknown=records.at(-1);
 need(last!==null&&typeof last==="object"&&"kind"in last&&last.kind==="release-result"&&journal.retained()["publicationPending"]===false,"ORIGINAL_WRITER_RELEASE_STAGE");
 const token:CurrentSchematicRelevanceSavedReadbackParent=Object.freeze({profile:"private.current-schematic-relevance-saved-readback-parent.v1"});
 const state:Original={journal,prepared,original,initial,publications:new Map(),pending:null,reader:null};current(state);originals.set(token,state);attempts.set(prepared,token);return token;
}
async function ready(state:Original,pending:Promise<void>|null):Promise<void>{
 current(state);if(pending!==null){try{await pending;}catch{
  // The original publication stays retained; only its actual candidate settles.
 }}current(state);if(state.journal.retained()["publicationPending"]===true){await state.journal.settlePublication();}current(state);await state.journal.assertOriginalPublication();current(state);
}
/** Reserve synchronously before any reader allocation/await. There is no
 * caller publisher or authority callback, and a copied token never runs code. */
export function consumeOriginalCurrentSchematicRelevanceSavedReadbackParent(token:CurrentSchematicRelevanceSavedReadbackParent,prepared:GeneratedSchematicRelevanceSavedReadbackPlan,reader:object):CurrentSchematicRelevanceSavedReadbackParentBinding {
 const state=originals.get(token);need(state!==undefined&&state.prepared===prepared&&state.reader===null,"ORIGINAL_PARENT_CONSUMED");current(state);need(reader!==null&&typeof reader==="object","ORIGINAL_READER");state.reader=reader;
 const check=():void=>{need(originals.get(token)===state&&state.reader===reader,"ORIGINAL_READER");current(state);};
 return Object.freeze({assertCurrent:check,ready:async():Promise<void>=>{check();await ready(state,state.pending);check();},
  record:(kind:CurrentSchematicRelevanceSavedReadbackJournalKind,evidence:Readonly<Record<string,unknown>>):Promise<void>=>{
   check();const descriptor=Object.getOwnPropertyDescriptor(phases,kind);if(descriptor===undefined){return Promise.resolve();}
   // The fixed own-data table is created above and never accepts caller keys.
   const mapped:unknown=descriptor.value;need(typeof mapped==="string","FIXED_PHASE");
   const phase=Object.values(phases).find(value=>value===mapped);need(phase!==undefined,"FIXED_PHASE");need(!state.publications.has(phase),"PUBLICATION_CONSUMED");const prior=state.pending;
   const publication=(async():Promise<void>=>{await ready(state,prior);check();await state.journal.append(phase,evidence);check();await state.journal.assertOriginalPublication();check();})();
   state.publications.set(phase,publication);state.pending=publication;
   void(async():Promise<void>=>{try{await publication;}catch{
    // Preserve this original rejection in the publication map and its caller.
   }finally{if(state.pending===publication){state.pending=null;}}})();return publication;
  }});
}
