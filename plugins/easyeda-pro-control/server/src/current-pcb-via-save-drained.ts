/** Opaque result of the same original producer cursor and native drain ACK.
 * JSON, copied objects and data plans cannot reproduce its private registry. */
export interface CurrentPcbViaSaveDrained {readonly profile:"private.current-pcb-via-save-drained.v1"}
export interface CurrentPcbViaSaveDrainProgress {readonly uploadDispatched:boolean;readonly acknowledgedResumes:number;readonly postHistorySyncExpected:boolean;readonly postHistorySyncStarted:boolean;readonly postHistorySyncCompleted:boolean;readonly allCallsResumed:boolean;readonly canSettle:boolean;readonly settlementExhausted:boolean;readonly completed:boolean}
