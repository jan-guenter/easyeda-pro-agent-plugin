/** One original manager-to-worker delete request. The private issuer must join
 * the public Call, actual manager RPC/native send, original worker peer and
 * retained manager Promise. A caller replyTopic or SDK result cannot issue it. */
import type { CurrentFootprintInversePublicDeleteCall } from "./current-footprint-inverse-public-delete-call.ts";

export interface CurrentFootprintInversePublicDeleteJob {
  readonly profile: "private.current-footprint-inverse-public-delete-job.v1";
}
export interface CurrentFootprintInversePublicDeleteJobBindings {
  readonly call: CurrentFootprintInversePublicDeleteCall;
  readonly projectUuid: string;
  readonly footprintUuid: string;
  readonly replyTopic: string;
  /** Actual original native sender envelope and serialized security origin. */
  readonly nativeEnvelope: Readonly<{
    type: "IGIVE";
    uuid: string;
    topic: "/mgr/projectWorker/footprint/delete";
    /** Actual nonnegative safe-integer parent push id. */
    id: number;
    target: string;
    message: Readonly<{message:string;replyTopic:string}>;
  }>;
  readonly nativeOrigin: string;
  readonly assertCurrent: () => void;
  /** Actual original forwarded request, before its worker result. */
  readonly assertOriginalForwarded: () => void;
}
export { requireOriginalCurrentFootprintInversePublicDeleteJob } from "./current-pcb-diagnostic-owner.ts";
