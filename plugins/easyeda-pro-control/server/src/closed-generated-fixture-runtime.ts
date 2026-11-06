/* oxlint-disable import/max-dependencies -- Dedicated data-only custody joins fresh original no-app and file supervisors, managed locators, complete SQL qualification and durable records without bridge/native-owner adoption. */
import { randomBytes } from "node:crypto";
import { createOperation, loadOperation, operationPath } from "./artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson } from "./core.ts";
import type { TrackedDispatchOperationJournal } from "./engine.ts";
import { ClosedGeneratedFixtureFileOwner } from "./closed-generated-fixture-file.ts";
import { ClosedGeneratedFixtureCopyOwner } from "./closed-generated-fixture-copy.ts";
import { closedGeneratedFixtureDataRequestSchema, loadClosedGeneratedFixtureData } from "./closed-generated-fixture-data.ts";
import type { ClosedGeneratedDataQualification, ClosedGeneratedFixtureDataLocator, ClosedGeneratedFixtureDataRequest, ClosedGeneratedFixtureDataStart } from "./closed-generated-fixture-data.ts";
import { GeneratedFixtureJournalPublication } from "./generated-fixture-journal-publication.ts";
import type { GeneratedFixtureJournalPublicationDependencies } from "./generated-fixture-journal-publication.ts";
import { verifyManagedFixtureImportSources } from "./managed-fixture-import-profile.ts";
import { stageManagedFixtureOpeningSource } from "./managed-fixture-opening-source.ts";
import type { ManagedPcbFixtureReadOpeningSource } from "./managed-pcb-fixture-read-source.ts";
import { stageManagedPadFixtureOpeningSource } from "./managed-pad-fixture-opening-source.ts";
import { stageRequalifiedManagedSchematicFixtureOpeningSource } from "./managed-schematic-fixture-opening-source.ts";
import type { ManagedSchematicReadOpeningSource } from "./managed-schematic-fixture-read-source.ts";
import { stageRequalifiedManagedSchematicRelevanceFixtureOpeningSource } from "./managed-schematic-relevance-fixture-opening-source.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";

type ProofRuntime = Pick<WindowsControlRuntime, "status" | "observeExistingApplication" | "release" | "isReleaseAcknowledged">;
export interface ClosedGeneratedFixtureDataOptions {
  readonly operationId: string; readonly pluginRoot: string; readonly assetsRoot: string; readonly runtime: ProofRuntime;
  /** Exact independent data allocation + actual not-launched proof-runtime
   * identity. No ordinary/app/native allocation may coexist until release. */
  readonly assertOriginalOwner: () => void;
}
/** Offline seams only; never accepted by a registered tool. */
export interface ClosedGeneratedFixtureDataDependencies extends GeneratedFixtureJournalPublicationDependencies {
  readonly loadData?: typeof loadClosedGeneratedFixtureData;
  readonly createCopyOwner?: (options: ConstructorParameters<typeof ClosedGeneratedFixtureCopyOwner>[0]) => ClosedGeneratedFixtureCopyOwner;
  readonly verifySources?: typeof verifyManagedFixtureImportSources;
  readonly createFileOwner?: (options: ConstructorParameters<typeof ClosedGeneratedFixtureFileOwner>[0]) => ClosedGeneratedFixtureFileOwner;
}
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(`CLOSED_GENERATED_DATA_${message}`); } }
/** One original data-only attempt. Historical data is re-read and requalified,
 * never converted into a runtime owner. Every allocated NEW transport is kept
 * through its original release even when a reply or local publication is lost. */
export class ClosedGeneratedFixtureDataCoordinator {
  readonly #options: ClosedGeneratedFixtureDataOptions; readonly #dependencies: ClosedGeneratedFixtureDataDependencies; readonly #methods: readonly unknown[]; readonly #runtimeRelease: ProofRuntime["release"];
  #reserved = true; #busy = false; #attempted = false; #staged = false; #phase = "allocated"; #lastError: string | null = null;
  #journal: TrackedDispatchOperationJournal | undefined; #publication: GeneratedFixtureJournalPublication | undefined;
  #file: ClosedGeneratedFixtureFileOwner | undefined; #copy: ClosedGeneratedFixtureCopyOwner | undefined; #copyMethods: readonly unknown[] | undefined; #cleanup: Promise<void> | undefined;
  #fileRelease: Awaited<ReturnType<ClosedGeneratedFixtureFileOwner["release"]>> | undefined;
  #resourcesClosed = false; #proofReleaseStarted = false; #noApplicationCount = 0;
  #locator: ClosedGeneratedFixtureDataLocator | undefined; #qualification: ClosedGeneratedDataQualification | undefined;
  #terminal: Readonly<Record<string, unknown>> | undefined; #terminalSubmitted = false; #terminalPublished = false; #journalCreationSettled = false; #journalAbsent = false;
  #fileMethods: readonly unknown[] | undefined; #fileReleaseMethod: ClosedGeneratedFixtureFileOwner["release"] | undefined;
  public constructor(options: ClosedGeneratedFixtureDataOptions, dependencies: ClosedGeneratedFixtureDataDependencies = {}) {
    closedGeneratedFixtureDataRequestSchema.options[1].shape.operationId.parse(options.operationId);
    this.#options = Object.freeze({ ...options }); this.#dependencies = Object.freeze({ ...dependencies }); this.#methods = this.#identities(); this.#runtimeRelease = options.runtime.release; this.#current();
  }
  #identities(): readonly unknown[] { const runtime = this.#options.runtime; return [runtime.status, runtime.observeExistingApplication, runtime.release, runtime.isReleaseAcknowledged]; }
  #current(): void {
    this.#options.assertOriginalOwner();
    if (this.#file !== undefined) { need(this.#fileMethods !== undefined && this.#fileIdentities(this.#file).every((method, index) => method === this.#fileMethods?.[index]), "ORIGINAL_FILE_OWNER_CHANGED"); }
    need(this.#identities().every((method, index) => method === this.#methods[index]), "ORIGINAL_PROOF_METHOD_CHANGED");
    if (this.#copy !== undefined) { need(this.#copyMethods !== undefined && this.#copyIdentities(this.#copy).every((method, index) => method === this.#copyMethods?.[index]), "ORIGINAL_COPY_OWNER_CHANGED"); }
    const status = this.#options.runtime.status();
    need(status.launch === null &&
      (this.#proofReleaseStarted ? status.state === "released" : status.state === "not-launched"), "ORIGINAL_PROOF_RUNTIME_CHANGED");
  }
  #fileIdentities(file: ClosedGeneratedFixtureFileOwner): readonly unknown[] {
    need(this.#file === undefined || file === this.#file, "ORIGINAL_FILE_OBJECT_REQUIRED");
    // oxlint-disable-next-line typescript/unbound-method -- Identity only; original release retains this same receiver.
    return [file.initialize, file.inspect, file.release, file.snapshot, file.hasOriginalTransport, file.isOriginalTransportClosed];
  }
  #copyIdentities(copy: ClosedGeneratedFixtureCopyOwner): readonly unknown[] {
    need(this.#copy === undefined || copy === this.#copy, "ORIGINAL_COPY_OBJECT_REQUIRED");
    // oxlint-disable-next-line typescript/unbound-method -- Identity only; original copy/release methods keep their original receiver.
    return [copy.capture, copy.isReleaseAcknowledged, copy.settleRelease];
  }
  async #checked<T>(work: () => Promise<T>): Promise<T> { this.#current(); try { return await work(); } finally { this.#current(); } }
  async #noApplication(): Promise<void> { const observed = await this.#checked(() => this.#options.runtime.observeExistingApplication()); need(!observed.running, "APPLICATION_MUST_BE_CLOSED"); this.#noApplicationCount += 1; }
  public hasActiveReservation(): boolean { return this.#reserved || this.#busy || this.#publication?.pending() === true; }
  public hasPendingWork(): boolean { return this.hasActiveReservation(); }
  public inspect(operationId: string): Record<string, unknown> {
    need(operationId === this.#options.operationId, "ORIGINAL_OPERATION_REQUIRED");
    return { schema: "easyeda-pro-control.closed-generated-data-owner.v1", operationId, phase: this.#phase, ownerReservation: this.#reserved ? "reserved" : "released",
      operationInFlight: this.#busy, publicationPending: this.#publication?.pending() ?? false, freshResourcesClosed: this.#resourcesClosed,
      freshFileRelease: this.#fileRelease ?? null, freshLinuxDescriptorsReleased: this.#copy?.isReleaseAcknowledged() ?? true, freshProofHelperReleaseAcknowledged: this.#options.runtime.isReleaseAcknowledged(), freshNoApplicationBoundaryObservations: this.#noApplicationCount, continuousGlobalNoApplicationProofClaimed: false,
      requalifiedDataAvailable: this.#terminalPublished && this.#resourcesClosed && this.#qualification !== undefined && !this.#staged,
      sourceStaged: this.#staged, journal: this.#journal === undefined ? null : structuredClone(this.#journal), lastError: this.#lastError,
      oldRuntimeAdopted: false, oldClosureAcceptedAsAuthority: false, oldHmacPidJobReconstructed: false, appLaunchDispatched: false, bridgeDispatchEntered: false,
      sourceSqliteAttached: false, sourceFileModified: false, postOpenChangesAccepted: false, writerAuthority: false, filesDeleted: false };
  }
  public async execute(input: unknown): Promise<Record<string, unknown>> {
    const request = closedGeneratedFixtureDataRequestSchema.parse(input); need(request.operationId === this.#options.operationId, "ORIGINAL_OPERATION_REQUIRED");
    if (request.action === "inspect") { return this.inspect(request.operationId); }
    this.#current(); need(this.#reserved && !this.#busy, "OWNER_BUSY_OR_RELEASED"); this.#busy = true;
    try { return await this.#run(request); } catch (error) { this.#lastError ??= error instanceof Error ? error.message.slice(0, 1024) : "Fresh closed data qualification refused."; throw error; }
    finally { this.#busy = false; }
  }
  async #run(request: ClosedGeneratedFixtureDataRequest): Promise<Record<string, unknown>> {
    if (request.action === "settle-records") {
      need(this.#publication !== undefined, "ORIGINAL_RECORDS_REQUIRED"); await this.#publication.settle();
      if (this.#terminalSubmitted) { this.#terminalPublished = true; } else { await this.#publishTerminal(); } return this.inspect(request.operationId);
    }
    need(this.#publication?.pending() !== true, "SETTLE_ORIGINAL_RECORDS_FIRST");
    if (request.action === "release-owner") {
      if (!this.#attempted) { await this.#releaseResources(); }
      need(this.#resourcesClosed && (!this.#attempted || this.#terminalPublished || this.#journalAbsent || !this.#journalCreationSettled && this.#file === undefined), "ORIGINAL_RESOURCE_AND_RECORD_RELEASE_REQUIRED");
      this.#reserved = false; this.#phase = "released"; return this.inspect(request.operationId);
    }
    need(request.action === "requalify-closed-generated-fixture", "STAGE_LOCAL_AFTER_RELEASE_OWNER");
    need(!this.#attempted, "DATA_ATTEMPT_CONSUMED"); this.#attempted = true; return this.#qualify(request);
  }
  async #publishTerminal(): Promise<void> {
    if (this.#terminalSubmitted || this.#terminal === undefined || this.#publication === undefined || !this.#journalCreationSettled) { return; }
    this.#terminalSubmitted = true;
    await this.#publication.change({ state: this.#resourcesClosed ? "completed" : "closed-data-resource-release-unresolved", hardStop: !this.#resourcesClosed,
      mutationMayHaveOccurred: false, mutationState: this.#qualification === undefined ? "closed-data-refused-no-native-dispatch" : "closed-data-qualified-no-native-dispatch", nextSafeAction: "Release this original data owner, then stage its new in-memory source once. No earlier runtime is adopted." },
    { phase: "fresh-data-result", value: this.#terminal }); this.#terminalPublished = true;
  }
  #releaseResources(): Promise<void> {
    this.#cleanup ??= this.#closeResources(); return this.#cleanup;
  }
  async #closeResources(): Promise<void> {
    const errors: unknown[] = [];
    if (this.#copy !== undefined) { try { await this.#copy.settleRelease(); } catch (error) { errors.push(error); } }
    if (this.#file?.hasOriginalTransport() === true) {
      try { need(this.#fileReleaseMethod !== undefined, "ORIGINAL_FILE_RELEASE_REQUIRED"); this.#fileRelease = await this.#fileReleaseMethod.call(this.#file); } catch (error) { errors.push(error); }
    }
    this.#proofReleaseStarted = true;
    try { await this.#runtimeRelease.call(this.#options.runtime); } catch (error) { errors.push(error); }
    this.#current(); this.#resourcesClosed = (this.#file === undefined || !this.#file.hasOriginalTransport() || this.#file.isOriginalTransportClosed()) && (this.#copy?.isReleaseAcknowledged() ?? true) && this.#options.runtime.isReleaseAcknowledged();
    if (errors.length > 0 || !this.#resourcesClosed) { throw new AggregateError(errors, "Fresh closed-data original resource release is incomplete; retain this owner and do not allocate another runtime."); }
  }
  async #qualify(request: ClosedGeneratedFixtureDataStart): Promise<Record<string, unknown>> {
    const plan = { profile: "closed-generated-initial-data209-v1", dataLocators: { importOperationId: request.importOperationId,
      generatedArchiveArtifactSha256: request.generatedArchiveArtifactSha256, closedCaptureArtifactSha256: request.closedCaptureArtifactSha256 },
      oldRuntimeAdopted: false, applicationLaunchDispatched: false, nativeOwnerTransfer: false, postOpenChangesAccepted: false };
    const at = new Date().toISOString(); const journal: TrackedDispatchOperationJournal = { schema: OPERATION_SCHEMA, operationId: request.operationId,
      journalPath: operationPath(request.operationId), plan, planHash: buildPlanHash(plan), createdAt: at, updatedAt: at, sequence: 0, artifacts: [], state: "prepared",
      mutationState: "data-only-intent", mutationMayHaveOccurred: false, saved: false, reopened: false, hardStop: true, orphanedCallPossible: false,
      nextSafeAction: "Await this original data-only qualification and release its new file/proof helpers; no application is launched." };
    this.#journal = journal; this.#publication = new GeneratedFixtureJournalPublication(journal, (): void => { this.#current(); }, this.#dependencies);
    let report: Readonly<Record<string, unknown>> | null = null; let qualification: ClosedGeneratedDataQualification | undefined; let failure: unknown;
    try {
      try { await this.#checked(() => createOperation(journal)); this.#journalCreationSettled = true; }
      catch (error) {
        // A lost create acknowledgement is local publication only. Admit only
        // The exact original sealed bytes; never rerun native/data acquisition.
        try { const found = await this.#checked(() => loadOperation(journal.operationId));
          const { journalSha256: _actual, integrityModel: _model, ...actual } = found;
          const { journalSha256: _expected, integrityModel: _expectedModel, ...expected } = journal;
          need(canonicalJson(actual) === canonicalJson(expected), "ORIGINAL_CREATE_RECORD_CHANGED"); Object.assign(journal, found); this.#journalCreationSettled = true;
        } catch (readError) { if (readError instanceof Error && "code" in readError && readError.code === "ENOENT") { this.#journalAbsent = true; } throw error; }
      }
      this.#phase = "loading-managed-data";
      await this.#noApplication(); await this.#checked(() => (this.#dependencies.verifySources ?? verifyManagedFixtureImportSources)(this.#options.assetsRoot));
      const locator = await this.#checked(() => (this.#dependencies.loadData ?? loadClosedGeneratedFixtureData)(request, (): void => { this.#current(); })); this.#locator = locator;
      await this.#publication.artifact("data-locators", locator.locatorReceipt); this.#phase = "acquiring-fresh-file-lease";
      const file = (this.#dependencies.createFileOwner ?? ((options): ClosedGeneratedFixtureFileOwner => new ClosedGeneratedFixtureFileOwner(options)))({
        pluginRoot: this.#options.pluginRoot, assetsRoot: this.#options.assetsRoot, nonce: randomBytes(32).toString("hex"), windowsPath: locator.rawWindowsPath,
        expectedSha256: locator.snapshot.sha256, expectedBytes: locator.snapshot.bytes }); this.#fileMethods = this.#fileIdentities(file);
      // oxlint-disable-next-line typescript/unbound-method -- Retained original release is called once with its original file owner receiver.
      this.#fileReleaseMethod = file.release; this.#file = file;
      const lease = await this.#checked(() => file.initialize()); await this.#publication.artifact("fresh-windows-file-lease", lease); this.#phase = "qualifying-fresh-closed-data";
      const copy = (this.#dependencies.createCopyOwner ?? ((options): ClosedGeneratedFixtureCopyOwner => new ClosedGeneratedFixtureCopyOwner(options)))({ locator, lease,
        assertOriginalOwner: (): void => { this.#current(); }, inspectOriginalLease: () => this.#checked(() => file.inspect()), observeNoApplication: () => this.#noApplication() });
      this.#copyMethods = this.#copyIdentities(copy); this.#copy = copy;
      const captured = await this.#checked(() => copy.capture());
      report = captured.report; qualification = captured.qualification;
      await this.#checked(() => (this.#dependencies.verifySources ?? verifyManagedFixtureImportSources)(this.#options.assetsRoot)); await this.#noApplication();
    } catch (error) { failure = error; this.#lastError = error instanceof Error ? error.message.slice(0, 1024) : "Fresh closed data qualification refused."; }
    try { await this.#releaseResources(); } catch (error) { failure ??= error; qualification = undefined; }
    if (qualification !== undefined && this.#fileRelease?.fileLeaseHeldUntilRelease === true && this.#resourcesClosed) { this.#qualification = qualification; }
    else if (qualification !== undefined) { this.#lastError ??= "Fresh original read-only file/watch release proof was not complete."; }
    let schema = "easyeda-pro-control.closed-generated-data-result.v1";
    if (this.#locator?.kind === "pad") { schema = "easyeda-pro-control.closed-generated-pad-data-result.v1"; }
    else if (this.#locator?.kind === "schematic-relevance") { schema = "easyeda-pro-control.closed-generated-schematic-relevance-data-result.v1"; }
    this.#terminal = Object.freeze({ schema, capture: report,
      freshFileRelease: this.#fileRelease ?? null, freshLinuxDescriptorsReleased: this.#copy?.isReleaseAcknowledged() ?? true, freshResourcesClosed: this.#resourcesClosed, freshProofHelperReleaseAcknowledged: this.#options.runtime.isReleaseAcknowledged(), freshNoApplicationBoundaryObservations: this.#noApplicationCount, continuousGlobalNoApplicationProofClaimed: false,
      exactInitialDataRequalified: this.#qualification !== undefined, qualificationFailure: this.#lastError, oldRuntimeAdopted: false, oldClosureAcceptedAsAuthority: false,
      newDataTokenAvailable: this.#qualification !== undefined, applicationLaunchDispatched: false, writerAuthority: false });
    this.#phase = this.#qualification === undefined ? "qualification-refused" : "data-qualified";
    if (this.#publication.pending()) { this.#phase = "records-pending"; } else { await this.#publishTerminal(); }
    if (failure !== undefined) { throw failure instanceof Error ? failure : new Error("Fresh closed-data qualification refused with an unstructured failure."); } return this.inspect(request.operationId);
  }
  #staging(operationId: string): Readonly<{ qualification: ClosedGeneratedDataQualification; locator: ClosedGeneratedFixtureDataLocator }> {
    need(operationId === this.#options.operationId, "ORIGINAL_OPERATION_REQUIRED"); this.#current();
    need(!this.#reserved && !this.#busy && this.#terminalPublished && this.#resourcesClosed && this.#publication?.pending() === false && !this.#staged && this.#qualification !== undefined && this.#locator !== undefined, "NEW_COMPLETED_DATA_SOURCE_REQUIRED");
    return { qualification: this.#qualification, locator: this.#locator };
  }
  public stageSourceForFreshOpening(operationId: string): ManagedPcbFixtureReadOpeningSource {
    const { qualification, locator } = this.#staging(operationId);
    if (qualification.schema === "easyeda-pro-control.qualified-generated-pad-fixture-target.v1") {
      const source = stageManagedPadFixtureOpeningSource({ qualification, archive: locator.archive }); this.#staged = true; return source;
    }
    need(qualification.schema === "easyeda-pro-control.qualified-generated-fixture-target.v1", "PCB_DATA_REQUIRED");
    const source = stageManagedFixtureOpeningSource({ qualification, archive: locator.archive }); this.#staged = true; return source;
  }
  public stageSchematicSourceForFreshOpening(operationId: string): ManagedSchematicReadOpeningSource {
    const { qualification, locator } = this.#staging(operationId);
    if (qualification.schema === "easyeda-pro-control.qualified-generated-schematic-relevance-fixture-target.v1") {
      const source = stageRequalifiedManagedSchematicRelevanceFixtureOpeningSource({ qualification, archive: locator.archive }); this.#staged = true; return source;
    }
    need(qualification.schema === "easyeda-pro-control.qualified-generated-schematic-fixture-target.v1", "SCHEMATIC_DATA_REQUIRED");
    const source = stageRequalifiedManagedSchematicFixtureOpeningSource({ qualification, archive: locator.archive }); this.#staged = true; return source;
  }
}
