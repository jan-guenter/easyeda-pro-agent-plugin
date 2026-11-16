/** Actual ready driver/callback method tables cannot be replaced after issue. */
// oxlint-disable-next-line import/no-cycle -- Only later Core calls reprove these original local prototypes.
import {CurrentFootprintForwardWriterPublicationDriver} from "./current-footprint-forward-writer-publication-driver.ts";
// oxlint-disable-next-line import/no-cycle -- Only later Core calls reprove these original local prototypes.
import {CurrentFootprintForwardWriterPublicationCallbacks} from "./current-footprint-forward-writer-publication-callbacks.ts";
import {captureCurrentFootprintForwardExecutionPrototypes,requireCurrentFootprintForwardExecutionPrototypes} from "./current-footprint-forward-execution-opening-identity.ts";

const prototypes=[CurrentFootprintForwardWriterPublicationDriver,CurrentFootprintForwardWriterPublicationCallbacks].map(value=>captureCurrentFootprintForwardExecutionPrototypes(value.prototype));
export function assertOriginalCurrentFootprintForwardWriterPublicationClasses():void{for(const value of prototypes){requireCurrentFootprintForwardExecutionPrototypes(value);}}
