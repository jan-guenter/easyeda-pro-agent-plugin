/** Reprove original shared read-only algorithms, without their old owners. */
import {CurrentPcbViaSaveTailObservationCursor} from "./current-pcb-via-save-tail-observation-cursor.ts";
import {CurrentPcbViaSaveDrainCursor} from "./current-pcb-via-save-drain-cursor.ts";
import {CurrentFootprintForwardWriterPostHistorySyncCursor} from "./current-footprint-forward-writer-post-history-sync-cursor.ts";
import {captureCurrentFootprintForwardExecutionPrototypes,requireCurrentFootprintForwardExecutionPrototypes} from "./current-footprint-forward-execution-opening-identity.ts";

const originals=[CurrentPcbViaSaveTailObservationCursor,CurrentPcbViaSaveDrainCursor,CurrentFootprintForwardWriterPostHistorySyncCursor].map(value=>captureCurrentFootprintForwardExecutionPrototypes(value.prototype));
export function assertOriginalCurrentFootprintForwardWriterCopyTailClasses():void{for(const original of originals){requireCurrentFootprintForwardExecutionPrototypes(original);}}
