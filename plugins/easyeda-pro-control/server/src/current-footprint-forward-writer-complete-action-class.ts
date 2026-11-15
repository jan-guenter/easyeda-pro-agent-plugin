/** Closed complete-only stream classification. This data grants no native
 * owner, command, current pause or original Main origin. */
export const CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_TAIL_ACTIONS=Object.freeze([
 "footprint-forward-startup-ws","footprint-forward-ticket-timer","footprint-forward-ticket-timer-control","footprint-forward-own-data","footprint-forward-own-data-control","footprint-forward-branch-query","footprint-forward-writer-branch","footprint-forward-live-history",
 "footprint-forward-copy-local","footprint-forward-copy-upload","footprint-forward-copy-drain",
 "footprint-forward-copy-post-sync","footprint-forward-copy-delete","footprint-forward-copy-tail-observe",
 "footprint-forward-copy-tail-control","footprint-forward-copy-publication","footprint-forward-copy-publication-control",
] as const);
const branch=new Set(["forward-writer-branch-arm","forward-writer-branch-frame","forward-writer-branch-join-capture","forward-writer-branch-properties-packet","forward-writer-branch-properties-promise","forward-writer-branch-join-resolved","forward-writer-branch-join-value","forward-writer-branch-remove","forward-writer-branch-step","forward-writer-branch-release"]);
const history=new Set(["inverse-main-history-arm","inverse-main-history-frame","inverse-main-history-join-capture","inverse-main-history-properties-packet","inverse-main-history-properties-promise","inverse-main-history-join-resolved","inverse-main-history-properties-projectSql","inverse-main-history-properties-table","inverse-main-history-properties-branches","inverse-main-history-join-value","inverse-main-history-remove","inverse-main-history-step","inverse-main-history-release"]);
export function isCurrentFootprintForwardWriterCompleteAction(action:unknown):boolean{return typeof action==="string"&&CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_TAIL_ACTIONS.some(candidate=>candidate===action);}
export function currentFootprintForwardWriterCompleteMainCleanup(action:unknown,phase:unknown):boolean|null{
 if(typeof phase!=="string"){return null;}
 if(action==="footprint-forward-writer-branch"&&branch.has(phase)){return phase==="forward-writer-branch-remove"||phase==="forward-writer-branch-release";}
 if(action==="footprint-forward-live-history"&&history.has(phase)){return phase==="inverse-main-history-remove"||phase==="inverse-main-history-release";}return null;
}
