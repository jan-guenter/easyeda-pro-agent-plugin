/** Original worker peer data only, privately captured before SDK dispatch.
 * Native receiver/event and execution grants remain separate. */
export interface CurrentFootprintInverseDeleteWorkerPeerBindings{readonly workerUuid:string;readonly projectUuid:string;readonly assertCurrent:()=>void}
export { requireOriginalCurrentFootprintInverseDeleteWorkerPeer } from "./current-pcb-diagnostic-owner.ts";
