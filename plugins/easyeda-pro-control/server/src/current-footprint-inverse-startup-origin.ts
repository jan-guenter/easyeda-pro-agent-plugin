/** Purpose-specific one-use bootstrap permit. Only the original Core registry
 * can issue or consume it; serialized fields carry no resume authority. */
export interface CurrentFootprintInverseBootstrapPermit{readonly profile:"private.current-footprint-inverse-bootstrap-permit.v1"}
export interface CurrentFootprintInverseColdHeld{readonly profile:"private.current-footprint-inverse-cold-held.v1"}
