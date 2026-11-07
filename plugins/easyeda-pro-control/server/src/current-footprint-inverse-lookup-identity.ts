/** A data projection, never an owner or lookup grant. The original factory
 * target also carries its path and source digest; those stay outside CDP. */
export interface CurrentFootprintInverseLookupIdentity {
  readonly projectUuid: string;
  readonly branchUuid: string;
  readonly documentUuid: string;
}
export function currentFootprintInverseLookupIdentity(target: CurrentFootprintInverseLookupIdentity): Readonly<CurrentFootprintInverseLookupIdentity> {
  return Object.freeze({ projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid });
}
