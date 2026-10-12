/** Discovery-only historical cases. Never use this index for dispatch admission.
 * All generations and ledger links predate this index; adding evidence does not
 * create a self-reference to the source or bundle currently being built.
 * This module performs no imports, filesystem reads or runtime observations.
 */
interface SourceBinding { readonly path: string; readonly sha256: string }
interface HistoricalGeneration {
  readonly id: string;
  readonly installedVersion: string;
  readonly payloadCommit: string;
  readonly packageTree: string;
  readonly facadeSourceSha256: string;
  readonly runtimeSha256: string;
  readonly manifestSha256: string;
  readonly manifestUrl: string;
  readonly adapterBindings: readonly SourceBinding[];
}
interface HistoricalReadCase {
  readonly id: string;
  readonly method: string;
  readonly generationId: string;
  readonly recordedOn: string;
  readonly implementation: "public-method" | "native-task-equivalent";
  readonly documentType: 1 | 3;
  readonly argumentDomain: string;
  readonly observedScope: string;
  readonly stages: readonly string[];
  readonly exclusions: readonly string[];
  readonly evidence: {
    readonly ledgerUrl: string;
    readonly resultSha256: string;
    readonly receiptSha256: string;
    readonly independentReview: "accepted-in-immutable-ledger";
    readonly independentReviewSha256: string | null;
  };
}
interface SourceReview {
  readonly path: string;
  readonly reviewedSha256: string;
  readonly reviewedOn: "2026-10-12";
  readonly scope: "historical-case-index-review-only;no-live-evidence-transfer";
}
export interface SdkReadValidationHistory {
  readonly schema: "easyeda-pro-control.sdk-read-validation-history.v1";
  readonly scope: "historical-disposable-cases-only;not-runtime-admission";
  readonly indexCoverage: "ledger-R01-R09-only;not-exhaustive";
  readonly unlistedMethods: "no-indexed-case;not-an-assertion-of-no-prior-tests";
  readonly currentGenerationLiveValidation: "not-asserted-by-this-index";
  readonly executionAuthorized: false;
  readonly completeDeclaredContractValidated: false;
  readonly externalProfile: typeof externalProfile | null;
  readonly generations: readonly HistoricalGeneration[];
  readonly cases: readonly HistoricalReadCase[];
  readonly sourceReviews: readonly SourceReview[];
}

const repository = "https://github.com/jan-guenter/easyeda-pro-agent-plugin";
const ledger = `${repository}/blob/a805ffeef142a760eb8b86b2c466bd84f0b3b534/docs/api-connected-validation-ledger.md`;
const externalProfile = {
  applicationVersion: "3.2.149.88089769",
  publicApiVersion: "0.2.53.aee2f57a",
  publicApiSha256: "5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc",
  publicAdapterSha256: "4da5b5184a78e2d3aca843dad6b147d7feb7ec1368160d73f49c4acbcf97dfdb",
  declarationSha256: "32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1",
  uiVersion: "3.2.149.43637efe", uiSha256: "12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a",
  pcbVersion: "3.2.149.5378b690", pcbSha256: "65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54",
  schematicVersion: "3.2.149.35ae2987", schematicSha256: "3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f",
  desktopSha256: "10a427460d498667f6d1df9cd8899a1740afd9644cbf83ecaf80365d590869bb",
  upstreamVersion: "1.0.0-rc.1", extensionVersion: "1.0.0-rc.1", nodeVersion: "24.18.0",
  bridgeVersion: "1.0.0", dispatcherBuildId: "ded07x99dcxb504", dispatcherMethods: 67, dispatcherRegistry: "34f1dcf29ebdf3cf",
  upstreamTools: 116, upstreamToolCatalogSha256: "25d2575d98934d0b975b84bd235b5c263ce7b61279ba106a0fe330de7d5a7c45",
  upstreamImplementationSha256: "d8335ae0ce52bd3bb2b62d72261499587df598265076a797dbd6e9300bbaa9c0",
  upstreamExecutionClosureSha256: "c7d7bb429315d4c504158de2e0eac75505f7de1daf6defc11fccb59c01a7e029",
} as const;
const pcbBindings: readonly SourceBinding[] = [
  { path: "pcb-source-objects.ts", sha256: "2969bae7c4b555fb6dcd8c2ca28ac2114c2d657d80e13376bc6663c717ad9cbd" },
  { path: "pcb-source-objects-read.ts", sha256: "e2897f43efe0df11c40f616a0f63f558d296e6fcd5fe4631fb47e5978e9a421e" },
];
const schematicBinding: SourceBinding = { path: "schematic-primitive-read.ts", sha256: "cdb1c08365f6af749fc95f0903b66dbbfdb3c6a67b508ea0ddbbfcbd91d945e6" };
const fontBinding: SourceBinding = { path: "configured-font-read.ts", sha256: "d662d4aeb294b779494ba63ca89c7bb9a2446d430f36302b2463cc96d2e8a1c1" };
const sharedPath = "public-sdk-read.ts";
const reviewedSharedSha256 = "a80476c3cc61b272feae138b53a6cc056630c744848ee5138b0f44cb63e08cf9";
const generations: readonly HistoricalGeneration[] = [
  { id: "G20261011-164600", installedVersion: "0.3.0+codex.20261011164600",
    payloadCommit: "b2f60013123fb94d1fee2f3d6ddf2dad1f97fffe", packageTree: "db98b5e1ef0bf5934e949e0904fbc9405c65deac",
    facadeSourceSha256: "6c7f57ee8c970d8c0e845ad0764d1d6a5babc6c8edb4e036a2a5841e03e88590",
    runtimeSha256: "8610ba8c5ae61406526379fe205003ce5b3418de288cdcabdd3c31c573086d77",
    manifestSha256: "bda17ee5420c04ada6c3c9f5c176c5a493f85e592f99259d958a98ec4ff99224",
    manifestUrl: `${repository}/blob/b2f60013123fb94d1fee2f3d6ddf2dad1f97fffe/plugins/easyeda-pro-control/reviewed-compatibility.json`,
    adapterBindings: [{ path: sharedPath, sha256: "429ae05953345040a0eab5d827e667cdfb39b33f48d925d3d94d8a6c5635f847" }, ...pcbBindings] },
  { id: "G20261011-204104", installedVersion: "0.3.0+codex.20261011204104",
    payloadCommit: "10972c0d68b11f87fffa5570c74c2294e1068aba", packageTree: "fe9acf1d0da7caa942a6ac3599efc7b337995709",
    facadeSourceSha256: "234eb8aa7f8263649ac654ac513ff318b0ac68a23fb22bf52aa970593b512556",
    runtimeSha256: "c4d9b3243e4679c55914b340813193fcd34878cc4a92b05e47dded2015fc6802",
    manifestSha256: "00e5fac66a3044ce7f057ecee1cad3d3414ae29c1ebbf74a6f2ec39ea3944f32",
    manifestUrl: `${repository}/blob/10972c0d68b11f87fffa5570c74c2294e1068aba/plugins/easyeda-pro-control/reviewed-compatibility.json`,
    adapterBindings: [{ path: sharedPath, sha256: "fa6220e37eff8df1c6a33402282b90f6d91d0f22e2bd6957aca6327521c56d69" }, schematicBinding] },
  { id: "G20261011-220050", installedVersion: "0.3.0+codex.20261011220050",
    payloadCommit: "e566f2ab8bc73c8748e86c5f2cecdf5f2a86114b", packageTree: "2cfe8e8e1054efd44eb4035bb4a569097b6ebdad",
    facadeSourceSha256: "bea391898a967dc51a49fee7d04b34372fdcd0758c267f914043713db6a0e083",
    runtimeSha256: "a350c6fe19e782d595a173d9208d7e4c394eb49d9b88dba88e8ef2719224acbc",
    manifestSha256: "e1baee7c8aeb9eb30c673c2f27e0e2fde627096e20bb61c1caf69dc4eaef6144",
    manifestUrl: `${repository}/blob/e566f2ab8bc73c8748e86c5f2cecdf5f2a86114b/plugins/easyeda-pro-control/reviewed-compatibility.json`,
    adapterBindings: [{ path: sharedPath, sha256: reviewedSharedSha256 }, fontBinding] },
];
// File-level source review is not a complete execution-closure proof. Historical
// Generation fingerprints retain that older closure. Later registry/catalog or
// Adapter edits never promote its cases into current-generation live evidence.
const sourceReviews: readonly SourceReview[] = [
  { path: sharedPath, sha256: reviewedSharedSha256 }, ...pcbBindings, schematicBinding, fontBinding,
].map(({ path, sha256 }) => ({ path, reviewedSha256: sha256, reviewedOn: "2026-10-12",
  scope: "historical-case-index-review-only;no-live-evidence-transfer" }));
const readStages = ["two-matching-observations", "independent-receipt-review", "complete-source-correlation", "immutable-checkpoint-review"];
const commonExclusions = ["no-current-generation-or-whole-method-validation", "no-runtime-admission-or-execution-authority",
  "no-other-arguments-or-document-types", "no-atomic-or-continuing-state-isolation", "no-writer-save-inverse-or-rollback-validation"];
const cases: readonly HistoricalReadCase[] = [
  { id: "R01", method: "eda.pcb_Primitive.getPrimitiveByPrimitiveId", generationId: "G20261011-164600", recordedOn: "2026-10-11",
    implementation: "native-task-equivalent", documentType: 3, argumentDomain: "id: one existing standalone STRING",
    observedScope: "Complete seed STRING body and empty direct-ATTR array; 130 source objects. A separate open-existing proof and original checkpoint rehash covered 11 documents.",
    stages: readStages, exclusions: [...commonExclusions, "no-public-getter-or-sdk-instance-parity", "no-other-families-or-live-invalid-selector-tests"],
    evidence: { ledgerUrl: `${ledger}#2026-10-11-r01-and-r02-explicit-id-standalone-string-reads`,
      resultSha256: "c4384d6b3b14efff509aa0cb00a8e7f6010e2b0fb3555fbc016330cf3407d722",
      receiptSha256: "f05974639f6bbfa7befac50eacec39dd8226d3a36678f184ace8c535636246fd",
      independentReview: "accepted-in-immutable-ledger", independentReviewSha256: null } },
  { id: "R02", method: "eda.pcb_Primitive.getPrimitivesByPrimitiveId", generationId: "G20261011-164600", recordedOn: "2026-10-11",
    implementation: "native-task-equivalent", documentType: 3, argumentDomain: "ids: one-element array containing the R01 STRING",
    observedScope: "Exactly the R01 DTO in a one-element array; complete source correlation. A separate open-existing proof and original checkpoint rehash covered 11 documents.",
    stages: readStages, exclusions: [...commonExclusions, "no-multiple-id-ordering", "no-public-getter-or-sdk-instance-parity", "no-other-families-or-live-invalid-selector-tests"],
    evidence: { ledgerUrl: `${ledger}#2026-10-11-r01-and-r02-explicit-id-standalone-string-reads`,
      resultSha256: "c8ca0f52fd4a76132cb3f0d502fb120622d0e4b850659ef919a58100cd888f86",
      receiptSha256: "cb72e3bd39401d936976bdbe7a75ee8358d01773a6c3d13d218f2183530e6f10",
      independentReview: "accepted-in-immutable-ledger", independentReviewSha256: null } },
  { id: "R03", method: "eda.lib_LibrariesList.getSystemLibraryUuid", generationId: "G20261011-204104", recordedOn: "2026-10-11",
    implementation: "public-method", documentType: 1, argumentDomain: "empty arguments",
    observedScope: "One 32-character lowercase hexadecimal system-library constant; unchanged 61-object native/source and 12-document checkpoint boundaries.",
    stages: readStages, exclusions: [...commonExclusions, "no-account-library-enumeration-or-asset-access"],
    evidence: { ledgerUrl: `${ledger}#2026-10-11-r03-public-system-library-identity`,
      resultSha256: "14511deb68514a57677eed2c4483b386b09d40fb7e58b3d5b1ac6baeffb00c18",
      receiptSha256: "96c834500a530dfcf7054ac671cce300d2d46d0233e9c5085b1a9f17e45a8ba6",
      independentReview: "accepted-in-immutable-ledger", independentReviewSha256: "38c43c8d2348e57e09efe19397d2dd7c0367b888c9f8f3276eafdd57c42d0073" } },
  { id: "R04", method: "eda.sch_Primitive.getPrimitiveByPrimitiveId", generationId: "G20261011-204104", recordedOn: "2026-10-11",
    implementation: "native-task-equivalent", documentType: 1, argumentDomain: "id: one existing root Text",
    observedScope: "All 14 DTO fields including null styles/alignment; unchanged 61-object native/source and 12-document checkpoint boundaries.",
    stages: readStages, exclusions: [...commonExclusions, "no-public-getter-or-sdk-instance-parity", "no-theme-default-resolution", "no-other-families-or-live-invalid-selector-tests"],
    evidence: { ledgerUrl: `${ledger}#2026-10-11-r04-and-r05-explicit-id-root-text-reads`,
      resultSha256: "adf6260bccb415162f5dd8944d5941896a153846dadeccf3e377515c1d966098",
      receiptSha256: "629c7d4c13693eed755ee2797fb4e9459b38f2a9f6a63c67ef539cf4e8b86953",
      independentReview: "accepted-in-immutable-ledger", independentReviewSha256: "38c43c8d2348e57e09efe19397d2dd7c0367b888c9f8f3276eafdd57c42d0073" } },
  { id: "R05", method: "eda.sch_Primitive.getPrimitivesByPrimitiveId", generationId: "G20261011-204104", recordedOn: "2026-10-11",
    implementation: "native-task-equivalent", documentType: 1, argumentDomain: "ids: one-element array containing the R04 Text",
    observedScope: "Exactly the R04 14-field DTO in a one-element array; unchanged complete native/source and 12-document checkpoint boundaries.",
    stages: readStages, exclusions: [...commonExclusions, "no-multiple-id-ordering", "no-public-getter-or-sdk-instance-parity", "no-theme-default-resolution"],
    evidence: { ledgerUrl: `${ledger}#2026-10-11-r04-and-r05-explicit-id-root-text-reads`,
      resultSha256: "4e7a657c92aecf2eb1512242165646c9bd3c8f4bf03cd6fd74bb0b19275ef137",
      receiptSha256: "4540ac573c8b066d79e3dedb67e4875b470456edff7013727c5e565cbec7f05b",
      independentReview: "accepted-in-immutable-ledger", independentReviewSha256: "38c43c8d2348e57e09efe19397d2dd7c0367b888c9f8f3276eafdd57c42d0073" } },
  { id: "R06", method: "eda.sch_Primitive.getPrimitiveByPrimitiveId", generationId: "G20261011-204104", recordedOn: "2026-10-11",
    implementation: "native-task-equivalent", documentType: 1, argumentDomain: "id: one root Wire with three orthogonal LINE children",
    observedScope: "Six Wire fields, five fields per LINE, one literal NET and one custom Relevance identity; null styles; unchanged 67-object source and 12-document checkpoint.",
    stages: readStages, exclusions: [...commonExclusions, "no-public-getter-or-sdk-instance-parity", "no-resolved-net-or-custom-attribute-value-proof", "no-bus-or-live-invalid-selector-tests"],
    evidence: { ledgerUrl: `${ledger}#2026-10-11-r06r08-populated-wire-and-mixed-caller-order-reads`,
      resultSha256: "216af27971981e4b6ba0d2d9b0b804e99803cff99ed045ad3edf190c2b6dd873",
      receiptSha256: "10ac76da6ee0a9683d1e73cd88570bdc2011b9d16de2c81d972e92d79482bc3d",
      independentReview: "accepted-in-immutable-ledger", independentReviewSha256: "49c904e28cc9a16054ab0ed65a037702aef5871aad031a801d7dc32ae7026a59" } },
  { id: "R07", method: "eda.sch_Primitive.getPrimitivesByPrimitiveId", generationId: "G20261011-204104", recordedOn: "2026-10-11",
    implementation: "native-task-equivalent", documentType: 1, argumentDomain: "ids: two-element array in Wire then Text caller order",
    observedScope: "Exact R06 Wire and existing 14-field Text in caller order; unchanged 67-object native/source and 12-document checkpoint boundaries.",
    stages: readStages, exclusions: [...commonExclusions, "no-public-getter-or-sdk-instance-parity", "no-resolved-net-or-custom-attribute-value-proof", "no-bus-or-live-invalid-selector-tests"],
    evidence: { ledgerUrl: `${ledger}#2026-10-11-r06r08-populated-wire-and-mixed-caller-order-reads`,
      resultSha256: "f8d274fdefd8f1560de25f0e1c960910ddaec3c1c4fe071a1d59e1bfd5f1a1aa",
      receiptSha256: "a4d4b3a476c6776ff8459b07b1cba101400954384787cd16a9661bce9098651d",
      independentReview: "accepted-in-immutable-ledger", independentReviewSha256: "49c904e28cc9a16054ab0ed65a037702aef5871aad031a801d7dc32ae7026a59" } },
  { id: "R08", method: "eda.sch_Primitive.getPrimitivesByPrimitiveId", generationId: "G20261011-204104", recordedOn: "2026-10-11",
    implementation: "native-task-equivalent", documentType: 1, argumentDomain: "ids: two-element array in Text then Wire caller order, opposite lexical ID order",
    observedScope: "Exact R07 DTOs in reversed caller order; unchanged 67-object native/source and 12-document checkpoint boundaries.",
    stages: readStages, exclusions: [...commonExclusions, "no-public-getter-or-sdk-instance-parity", "no-resolved-net-or-custom-attribute-value-proof", "no-bus-or-live-invalid-selector-tests"],
    evidence: { ledgerUrl: `${ledger}#2026-10-11-r06r08-populated-wire-and-mixed-caller-order-reads`,
      resultSha256: "5a0353f2134a186842d48b7e2ae8b125d52529ca909ffb628d837971f7d65b06",
      receiptSha256: "4a69d1f2d354943b3ce8c384e56ddb4fe6c20d1e4789f3f619bcf381abbf0ba1",
      independentReview: "accepted-in-immutable-ledger", independentReviewSha256: "49c904e28cc9a16054ab0ed65a037702aef5871aad031a801d7dc32ae7026a59" } },
  { id: "R09", method: "eda.sys_FontManager.getFontsList", generationId: "G20261011-220050", recordedOn: "2026-10-12",
    implementation: "native-task-equivalent", documentType: 1, argumentDomain: "empty arguments",
    observedScope: "10 ordered configured titles, 52 UTF-16 code units; unchanged 67-object native/source, 12 documents, 171 current records and 66 imported header occurrences.",
    stages: readStages, exclusions: [...commonExclusions, "no-public-getter-parity", "no-installed-font-or-rendering-proof",
      "no-current-account-or-persisted-preference-proof", "no-whole-preference-equality"],
    evidence: { ledgerUrl: `${ledger}#2026-10-12-r09-configured-font-title-observation`,
      resultSha256: "6d4628d0229ff3dec07190f32b12b034b8b47c5da1482ba171b9940d794b9493",
      receiptSha256: "f361cb1bbff69d19b93ae778d60aba2d391c4969c03f49e5f32df0be14b39755",
      independentReview: "accepted-in-immutable-ledger", independentReviewSha256: "a9d75f59d31fd1530bbae8804822be317b4eac1713692a76011efedd501e42d9" } },
];

/** Exact method lookup only. Copies prevent callers from altering later pages.
 * Hashes are corruption commitments, not authentication against an evidence
 * writer. Missing review hashes mean the ledger did not publish one.
 */
export function getSdkReadValidationHistory(method: string): SdkReadValidationHistory {
  const selected = cases.filter((entry) => entry.method === method);
  const generationIds = new Set(selected.map((entry) => entry.generationId));
  const selectedGenerations = generations.filter((generation) => generationIds.has(generation.id));
  const paths = new Set(selectedGenerations.flatMap((generation) => generation.adapterBindings.map((binding) => binding.path)));
  return structuredClone({ schema: "easyeda-pro-control.sdk-read-validation-history.v1",
    scope: "historical-disposable-cases-only;not-runtime-admission", indexCoverage: "ledger-R01-R09-only;not-exhaustive",
    unlistedMethods: "no-indexed-case;not-an-assertion-of-no-prior-tests", currentGenerationLiveValidation: "not-asserted-by-this-index",
    executionAuthorized: false, completeDeclaredContractValidated: false, externalProfile: selected.length === 0 ? null : externalProfile,
    generations: selectedGenerations, cases: selected, sourceReviews: sourceReviews.filter((review) => paths.has(review.path)) });
}
