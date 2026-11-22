/** Original Core enrollment; matching JSON cannot reconstruct this custody. */
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import type {CurrentFootprintInverseWorkerController} from "./current-footprint-inverse-v4-worker-controller.ts";
import type {CurrentFootprintInverseNativeDeletePublicationController} from "./current-footprint-inverse-native-delete-publication-controller.ts";
import type {CurrentFootprintInverseNativeDeletePublicationData} from "./current-footprint-inverse-native-delete-publication-observer.ts";

export interface CurrentFootprintInverseNativeDeletePublicationOrigin{readonly profile:"private.current-footprint-inverse-native-delete-publication-origin.v1"}
export interface CurrentFootprintInverseNativeDeletePublicationOriginal{readonly worker:CurrentFootprintInverseWorkerController;readonly controller:CurrentFootprintInverseNativeDeletePublicationController;readonly event:DiagnosticEvent;readonly current:()=>void}
export type {CurrentFootprintInverseNativeDeletePublicationResult}from "./current-footprint-inverse-native-delete-publication-token.ts";
export interface CurrentFootprintInverseNativeDeletePublicationResultOriginal extends CurrentFootprintInverseNativeDeletePublicationOriginal{readonly data:Readonly<CurrentFootprintInverseNativeDeletePublicationData>}
export {requireOriginalCurrentFootprintInverseNativeDeletePublicationOrigin,requireOriginalCurrentFootprintInverseNativeDeletePublicationResult} from "./current-footprint-inverse-v4-native-owner.ts";
