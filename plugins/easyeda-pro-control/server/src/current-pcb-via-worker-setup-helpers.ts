/** Via-only addition; old shared schematic/inverse setup catalogue stays exact. */
import { CURRENT_PROJECT_WORKER_SETUP_HELPERS } from "./current-project-worker-setup-helpers.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_PROGRAMS } from "./current-project-sync-quiesce-programs.ts";

export const CURRENT_PCB_VIA_WORKER_SETUP_HELPERS=Object.freeze([...CURRENT_PROJECT_WORKER_SETUP_HELPERS,CURRENT_PROJECT_SYNC_QUIESCE_PROGRAMS.capture]);
export const CURRENT_PCB_VIA_WORKER_SETUP_HELPER_REQUESTS=CURRENT_PCB_VIA_WORKER_SETUP_HELPERS.length;
export function requireCurrentPcbViaWorkerSetupHelper(program:string):void {if(!CURRENT_PCB_VIA_WORKER_SETUP_HELPERS.includes(program)){throw new Error("PCB_VIA_WORKER_SETUP_HELPER_PROGRAM");}}
export function qualifyCurrentPcbViaWorkerSetupHelperSource(input:unknown,program:string):void {requireCurrentPcbViaWorkerSetupHelper(program);if(typeof input!=="string"||input!==`(${program})`){throw new Error("PCB_VIA_WORKER_SETUP_HELPER_SOURCE");}}
