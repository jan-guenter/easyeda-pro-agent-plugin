/** Fixed, effect-checked identity reads for the original construction runner.
 * These follow source-qualified wrapper scopes, never call their callbacks.
 * The constructor events supply lexical receiver provenance; these later reads
 * only associate those same callbacks with the current PROJECT assignments. */
import { CURRENT_PCB_STRING_OBSERVATION_GUARDS } from "./current-pcb-string-observation-core.ts";

const GUARDS = `${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
const fn=v=>{if(typeof v!=="function")bad();return v;};
const scope=o=>object(own(o,"object"));
const current=p=>{object(p);if(own(globalThis,"PROJECT")!==p)bad();};
`;
export const CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_FIELDS = Object.freeze({
  uploadStructure: "uploadStructure", structure: "structure", cooperation: "bufferedPendDataStream", upload: "bufferedUploadCloud",
} as const);
export type CurrentPcbWorkerConstructionAssignment = keyof typeof CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_FIELDS;
const selector = (field: string): string => `function(){${GUARDS}
current(this);const selected=fn(own(this,${JSON.stringify(field)}));verify();return selected;}`;
export const CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_SELECTORS = Object.freeze({
  uploadStructure: selector("uploadStructure"), structure: selector("structure"),
  cooperation: selector("bufferedPendDataStream"), upload: selector("bufferedUploadCloud"),
});
const relation = (field: string, callback: "e" | "t", extra = ""): string =>
  `function(project,wrapper,callback){${GUARDS}
current(project);if(own(project,${JSON.stringify(field)})!==fn(wrapper))bad();
const s=scope(this);if(own(s,${JSON.stringify(callback)})!==fn(callback))bad();${extra}
verify();return true;}`;
export const CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RELATIONS = Object.freeze({
  uploadStructure: relation("uploadStructure", "e"), structure: relation("structure", "e"),
  cooperation: relation("bufferedPendDataStream", "e", 'if(own(s,"t")!==10)bad();'),
  upload: relation("bufferedUploadCloud", "t", 'if(own(s,"a")!==project||own(s,"s")!==500)bad();'),
});
/** Nd's e is the original QA wrapper; QA's separate parameter scope holds the
 * actual constructor arrow. Neither matching source text nor another QA
 * wrapper with a matching arrow can substitute for the originally captured QA. */
export const CURRENT_PCB_WORKER_CONSTRUCTION_DEBOUNCE_RELATION = `function(project,wrapper,serialScope,debounce,callback){${GUARDS}
current(project);if(own(project,"structure")!==fn(wrapper)||own(scope(serialScope),"e")!==fn(debounce))bad();
const s=scope(this);if(own(s,"e")!==fn(callback)||own(s,"t")!==300)bad();verify();return true;}`;
export const CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RECHECK = `function(bus,uploadStructure,structure,cooperation,upload){${GUARDS}
current(this);if(own(this,"workerBus")!==bus||own(this,"uploadStructure")!==fn(uploadStructure)||
own(this,"structure")!==fn(structure)||own(this,"bufferedPendDataStream")!==fn(cooperation)||
own(this,"bufferedUploadCloud")!==fn(upload))bad();verify();return true;}`;

/** Four selector/metadata/scope/relation groups, the three QA-scope requests,
 * then final current PROJECT/wrapper reproof. No sampling or retry loop. */
export const CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_REQUEST_COUNT = 20;
export const CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_CALLS = Object.freeze({
  "upload-structure-select": Object.freeze({ program: CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_SELECTORS.uploadStructure, arguments: 0, returnByValue: false }),
  "structure-select": Object.freeze({ program: CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_SELECTORS.structure, arguments: 0, returnByValue: false }),
  "cooperation-select": Object.freeze({ program: CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_SELECTORS.cooperation, arguments: 0, returnByValue: false }),
  "upload-select": Object.freeze({ program: CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_SELECTORS.upload, arguments: 0, returnByValue: false }),
  "upload-structure-relation": Object.freeze({ program: CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RELATIONS.uploadStructure, arguments: 3, returnByValue: true }),
  "structure-relation": Object.freeze({ program: CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RELATIONS.structure, arguments: 3, returnByValue: true }),
  "cooperation-relation": Object.freeze({ program: CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RELATIONS.cooperation, arguments: 3, returnByValue: true }),
  "upload-relation": Object.freeze({ program: CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RELATIONS.upload, arguments: 3, returnByValue: true }),
  "debounce-relation": Object.freeze({ program: CURRENT_PCB_WORKER_CONSTRUCTION_DEBOUNCE_RELATION, arguments: 5, returnByValue: true }),
  "assignments-recheck": Object.freeze({ program: CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RECHECK, arguments: 5, returnByValue: true }),
});
export type CurrentPcbWorkerConstructionAssignmentCall = keyof typeof CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_CALLS;

export interface CurrentPcbWorkerConstructionAssignments {
  readonly profile: "private.current-pcb-worker-construction-assignments.v1";
  readonly callbackKinds: readonly ["uploadStructure", "structure", "cooperation", "upload"];
  readonly originalConstructionCallbacksMatched: true;
  readonly originalCallbackReceiversVerified: true;
  readonly currentProjectWrapperRelationsVerified: true;
  readonly continuousAssignmentOwnershipVerified: false;
  readonly nativeChannelIntrinsicAndPeerOwnershipVerified: false;
  readonly completePublishersVerified: false;
  readonly writeDestinationsContained: false;
  readonly atomicSnapshotVerified: false;
  readonly queueCompletionVerified: false;
  readonly executionAuthorized: false;
}
