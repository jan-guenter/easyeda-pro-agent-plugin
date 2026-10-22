/** Historical fixture evidence, not runtime admission or current-generation
 * validation. These file commitments are deliberately maintained by review;
 * do not generate or refresh them when an adapter changes, even in a comment.
 * Offline tests bind the record to source bytes without runtime filesystem I/O.
 * Source revisions retain the original historical commitments separately; a
 * reviewed revision never transfers live validation to an added adapter branch.
 */
export interface OperationValidationRecord {
  readonly id: string;
  readonly action: string;
  readonly adapterProfile: string;
  readonly scope: "historical-profile-validation;not-this-facade-generation";
  readonly recordedAt: string;
  readonly evidence: {
    readonly kind: "maintained-engineering-record";
    readonly reference: string;
    readonly artifacts: "historical-private-artifacts-not-distributed";
  };
  readonly externalProfile: {
    readonly applicationVersion: string;
    readonly publicApiVersion: string;
    readonly publicApiImplementationSha256: string;
    readonly dispatcherBuildId: string;
    readonly schematicBundleVersion: string;
    readonly schematicImplementationSha256: string;
  };
  readonly adapterBindings: readonly {
    readonly path: string;
    readonly sha256: string;
  }[];
  readonly sourceRevisionReviews?: readonly {
    readonly path: string;
    readonly historicalSha256: string;
    readonly reviewedSha256: string;
    readonly reviewedAt: string;
    readonly scope: "historical-explicit-false-profile-only;omitted-lock-and-sealed-wire-live-unvalidated";
    readonly reference: string;
  }[];
  readonly fixture: {
    readonly category: "disposable-schematic-validation";
    readonly case: "existing-named-wire-cardinal-split-with-junction";
    readonly durableDocumentCount: number;
  };
  readonly stages: readonly {
    readonly stage: "historical-live-native-effect" | "historical-live-saved-reopened" | "historical-live-retained-save-recovery";
    readonly date: string;
    readonly evidenceScope: string;
  }[];
  readonly exclusions: readonly string[];
}

export interface OperationValidationRegistry {
  readonly schema: "easyeda-pro-control.operation-validation-registry.v1";
  readonly scope: "historical-profile-validation;not-this-facade-generation";
  readonly unlistedActions: "no-recorded-status;no-inherited-sibling-validation";
  readonly records: readonly OperationValidationRecord[];
}

const records: readonly OperationValidationRecord[] = [{
  id: "schematic-native-wire-v2-disposable-2026-09-25",
  action: "sch.wire.modify",
  adapterProfile: "easyeda-pro-control.schematic-native-wire.v2",
  scope: "historical-profile-validation;not-this-facade-generation",
  recordedAt: "2026-10-10",
  evidence: {
    kind: "maintained-engineering-record",
    reference: "AGENTS.md#2026-10-10-plugin-revamp",
    artifacts: "historical-private-artifacts-not-distributed",
  },
  externalProfile: {
    applicationVersion: "3.2.149.88089769",
    publicApiVersion: "0.2.53.aee2f57a",
    publicApiImplementationSha256: "5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc",
    dispatcherBuildId: "ded07x99dcxb504",
    schematicBundleVersion: "3.2.149.35ae2987",
    schematicImplementationSha256: "3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f",
  },
  adapterBindings: [
    { path: "schematic-native-wire.ts", sha256: "13db7218226c6636c51136ea9b96fc99a4bb784ad21ba10731d81ecd25e3a837" },
    { path: "schematic-wire-order.ts", sha256: "7bb6624c95a58d97f01ce4fbb631f5859850bd483b0bd275196b941293ae51d6" },
    { path: "schematic-wire-persistence.ts", sha256: "fc97eac7cb16c4db3b284a356bcce1afecc7877168442758b462478cf8be047b" },
  ],
  sourceRevisionReviews: [{
    path: "schematic-native-wire.ts",
    historicalSha256: "13db7218226c6636c51136ea9b96fc99a4bb784ad21ba10731d81ecd25e3a837",
    reviewedSha256: "a4336c2fae96b142a50cdfbba722e35f3456ef290847c937d23292db8f298ec9",
    reviewedAt: "2026-10-12",
    scope: "historical-explicit-false-profile-only;omitted-lock-and-sealed-wire-live-unvalidated",
    reference: "docs/history/2026-10-12-api-coverage-220050-release.md#historical-wire-source-review",
  }],
  fixture: {
    category: "disposable-schematic-validation",
    case: "existing-named-wire-cardinal-split-with-junction",
    durableDocumentCount: 16,
  },
  stages: [
    { stage: "historical-live-native-effect", date: "2026-09-25", evidenceScope: "exact-cardinal-segments-and-attributes;retained-components-and-connectivity" },
    { stage: "historical-live-saved-reopened", date: "2026-09-25", evidenceScope: "disposable-fixture-complete-lifecycle;all-16-durable-documents-verified" },
    { stage: "historical-live-retained-save-recovery", date: "2026-09-25", evidenceScope: "same-retained-lifecycle-completed-without-save-or-navigation-replay;all-16-durable-documents-verified" },
  ],
  exclusions: [
    "no-current-facade-generation-live-validation",
    "no-new-runtime-or-guard-live-validation",
    "no-sibling-operation-validation",
    "no-blanket-native-shape-or-style-coverage",
    "no-runtime-admission-or-mutation-authority",
    "no-flat-wire-reroute-v1-live-validation",
    "no-omitted-lock-live-validation",
  ],
}];

/** Return an isolated copy, including nested records. The historical record
 * cannot be rewritten through capability responses or a caller's mutation.
 */
export function getOperationValidationRegistry(): OperationValidationRegistry {
  return {
    schema: "easyeda-pro-control.operation-validation-registry.v1",
    scope: "historical-profile-validation;not-this-facade-generation",
    unlistedActions: "no-recorded-status;no-inherited-sibling-validation",
    records: structuredClone(records),
  };
}

export function getOperationValidationRecord(action: string): OperationValidationRecord | undefined {
  const record = records.find((entry) => entry.action === action);
  return record === undefined ? undefined : structuredClone(record);
}
