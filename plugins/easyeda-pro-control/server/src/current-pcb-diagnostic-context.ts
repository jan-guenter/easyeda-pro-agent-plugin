/** Observed CDP identity only. Matching URLs or bytes never admit a CAD owner,
 * project worker, compiler, writable receiver or arbitrary JavaScript. */
import { createHash } from "node:crypto";
import { DIAGNOSTIC_SOURCE_BYTES, diagnosticExact, diagnosticRecord, diagnosticToken } from "./current-pcb-diagnostic-protocol.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { diagnosticAncillaryOwner } from "./current-pcb-diagnostic-ancillary.ts";
import { CurrentPcbDiagnosticSameDocument } from "./current-pcb-diagnostic-same-document.ts";
import { CurrentPcbDiagnosticChildNavigation } from "./current-pcb-diagnostic-child-navigation.ts";

type Row = Readonly<Record<string, unknown>>;
export interface DiagnosticFrameExpectation {
  readonly targetId: string; readonly frameId: string; readonly frameUrl: string;
  readonly scriptUrl: string; readonly scriptSha256: string; readonly scriptBytes: number;
}
/** Internal reviewed asset profile, never accepted from a public request. */
export interface DiagnosticScriptProfile {
  readonly family: "ui" | "pcb" | "public-api";
  readonly relativePath: string;
  readonly scriptSha256: string;
  readonly scriptBytes: number;
}
interface PcbOpeningTransition {
  readonly projectUuid: string; readonly documentUuid: string; readonly tabId: string; readonly url: string;
  readonly originalRoot: Row; readonly uiIdentity: Readonly<{ scriptId: string; contextId: number; uniqueContextId: string }>;
  childId: string | null; child: Row | null; navigation: CurrentPcbDiagnosticChildNavigation | null;
  readonly initialChildContexts: Set<number>;
  domBackendNodeId: number | null; profile: DiagnosticScriptProfile | null;
  sourceIdentity: Readonly<{ scriptId: string; contextId: number; uniqueContextId: string }> | null;
  completed: boolean;
}
function refuse(): never { throw new Error("PCB_DIAGNOSTIC_CONTEXT_IDENTITY"); }
function text(value: unknown, maximum = 8192): value is string { return typeof value === "string" && value.length <= maximum && !value.includes("\0"); }
function integer(value: unknown): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value > 0; }
function equal(left: unknown, right: unknown): boolean { return JSON.stringify(left) === JSON.stringify(right); }
function clone(value: Row): Row { return Object.freeze(structuredClone(value)); }
export function diagnosticBoundedObservation(value: Row): Row {
  if (Buffer.byteLength(JSON.stringify(value), "utf8") > 128 * 1024) { return refuse(); }
  return Object.freeze(value);
}
export function diagnosticTargetSummary(value: Row): Row {
  return Object.freeze({ targetId: value["targetId"], type: value["type"], url: value["url"], attached: value["attached"] });
}
function frameSummary(value: Row): Row {
  return Object.freeze({ id: value["id"], loaderId: value["loaderId"], url: value["url"], securityOrigin: value["securityOrigin"],
    ...(value["parentId"] === undefined ? {} : { parentId: value["parentId"] }) });
}

export function validateDiagnosticFrameExpectation(value: DiagnosticFrameExpectation): DiagnosticFrameExpectation {
  if (!diagnosticExact(value, ["targetId", "frameId", "frameUrl", "scriptUrl", "scriptSha256", "scriptBytes"]) ||
      !diagnosticToken(value.targetId) || !diagnosticToken(value.frameId) || !text(value.frameUrl) || value.frameUrl.length === 0 ||
      !text(value.scriptUrl) || value.scriptUrl.length === 0 || !/^[a-f\d]{64}$/u.test(value.scriptSha256) ||
      !integer(value.scriptBytes) || value.scriptBytes > DIAGNOSTIC_SOURCE_BYTES) { return refuse(); }
  return Object.freeze({ ...value });
}

export function diagnosticTargetInventory(reply: Row): readonly Row[] {
  const rows = reply["targetInfos"];
  if (!diagnosticExact(reply, ["targetInfos"]) || !Array.isArray(rows) || rows.length > 256) { return refuse(); }
  const ids = new Set<string>(); const result: Row[] = [];
  for (const item of rows as unknown[]) {
    if (!diagnosticRecord(item) || !diagnosticToken(item["targetId"]) || ids.has(item["targetId"]) ||
        !text(item["type"], 64) || !text(item["url"]) || typeof item["attached"] !== "boolean") { return refuse(); }
    ids.add(item["targetId"]);
    result.push(clone(item));
  }
  return Object.freeze(result);
}
function target(reply: Row, targetId: string, attached: boolean): Row {
  const found = diagnosticTargetInventory(reply).find(item => item["targetId"] === targetId);
  if (found?.["type"] !== "page" || found["attached"] !== attached) { return refuse(); }
  return found ?? refuse();
}
function frames(reply: Row): readonly Row[] {
  if (!diagnosticExact(reply, ["frameTree"]) || !diagnosticRecord(reply["frameTree"])) { return refuse(); }
  const pending: { node: Row; parent: string | null; depth: number }[] = [{ node: reply["frameTree"], parent: null, depth: 0 }];
  const ids = new Set<string>(); const result: Row[] = [];
  while (pending.length > 0) {
    const current = pending.pop(); if (current === undefined) { return refuse(); }
    const children = current.node["childFrames"], item = current.node["frame"];
    if (current.depth > 16 || !diagnosticRecord(item) || !diagnosticToken(item["id"]) || ids.has(item["id"]) ||
        ids.size >= 128 || !diagnosticToken(item["loaderId"]) || !text(item["url"]) || !text(item["securityOrigin"]) ||
        (current.parent === null ? item["parentId"] !== undefined : item["parentId"] !== current.parent)) { return refuse(); }
    ids.add(item["id"]);
    result.push(clone(item));
    if (children !== undefined) {
      if (!Array.isArray(children) || children.length > 128) { return refuse(); }
      for (const child of children as unknown[]) {
        if (!diagnosticRecord(child)) { return refuse(); }
        pending.push({ node: child, parent: item["id"], depth: current.depth + 1 });
      }
    }
  }
  return Object.freeze(result);
}
export function validateDiagnosticScriptProfile(value: DiagnosticScriptProfile): DiagnosticScriptProfile {
  if (!diagnosticExact(value, ["family", "relativePath", "scriptSha256", "scriptBytes"]) ||
      !["ui", "pcb", "public-api"].includes(value.family) || !text(value.relativePath, 512) ||
      !/^[A-Za-z\d_.-]+(?:\/[A-Za-z\d_.-]+)+\.js$/u.test(value.relativePath) ||
      value.relativePath.split("/").some(part => part === "." || part === "..") ||
      !/^[a-f\d]{64}$/u.test(value.scriptSha256) || !integer(value.scriptBytes) || value.scriptBytes > DIAGNOSTIC_SOURCE_BYTES) { return refuse(); }
  return Object.freeze({ ...value });
}
function scriptUrlMatches(value: unknown, profile: DiagnosticScriptProfile): boolean {
  if (!text(value) || value.includes("\\") || /[\s?#@]/u.test(value) ||
      !/^[A-Za-z][A-Za-z\d+.-]*:\/\//u.test(value) || /\/(?:\.|\.\.)(?:\/|$)/u.test(value)) { return false; }
  try {
    const url = new URL(value);
    return url.username === "" && url.password === "" && url.search === "" && url.hash === "" &&
      url.pathname.endsWith(`/${profile.relativePath}`) && !url.pathname.split("/").some(part => part === "." || part === "..");
  } catch { return false; }
}
function startPageBase(frame: Row): string {
  const fragment = frame["urlFragment"], url = frame["url"];
  // CDP Frame.url excludes the fragment; Frame.urlFragment includes '#'.
  // This is the empty-fragment subset of the pinned ordinary UI URL grammar.
  if (!text(url) || !/^https:\/\/client\/editor\?cll=(?:trace|debug|info|warn|error)$/u.test(url) ||
      (fragment !== undefined && fragment !== "#") || frame["parentId"] !== undefined ||
      frame["securityOrigin"] !== "https://client") { return refuse(); }
  return url;
}

/** One original attachment and its ordered event stream. Any identity loss is
 * terminal. Unrelated new contexts/scripts remain bounded evidence, not errors;
 * unknown event kinds refuse rather than being silently ignored. */
export class CurrentPcbDiagnosticContext {
  readonly #expected: DiagnosticFrameExpectation | null;
  readonly #targetId: string;
  readonly #events: DiagnosticEvent[] = [];
  readonly #contexts = new Map<number, Row>();
  readonly #scripts = new Map<string, Row>();
  #sessionId: string | null = null;
  #target: Row | null = null;
  #frame: Row | null = null;
  #frames: readonly Row[] | null = null;
  #profile: DiagnosticScriptProfile | null = null;
  #failed = false;
  #attachmentEvent: Row | null = null;
  #sourceIdentity: Readonly<{ scriptId: string; contextId: number; uniqueContextId: string }> | null = null;
  #openingConsumed = false;
  #opening: { readonly base: string; readonly url: string; readonly expectedTitle: string | null } | null = null;
  #rootNavigation: CurrentPcbDiagnosticSameDocument | null = null;
  #priorRootNavigation: CurrentPcbDiagnosticSameDocument | null = null;
  #pcbOpening: PcbOpeningTransition | null = null;
  #ancillaryFrame: Row | null = null;
  #ancillaryOwner: ReturnType<typeof diagnosticAncillaryOwner> | null = null;

  public constructor(expected: DiagnosticFrameExpectation | string) {
    if (typeof expected === "string") {
      if (!diagnosticToken(expected)) { refuse(); }
      this.#targetId = expected; this.#expected = null;
    } else { this.#expected = validateDiagnosticFrameExpectation(expected); this.#targetId = this.#expected.targetId; }
  }
  public selectTarget(reply: Row): void {
    if (this.#failed || this.#target !== null) { this.#refuse(); }
    try { this.#target = target(reply, this.#targetId, false); } catch { this.#refuse(); }
  }
  public bindSession(sessionId: string): void {
    if (this.#sessionId !== null || !diagnosticToken(sessionId) || this.#target === null) { return this.#refuse(); }
    this.#sessionId = sessionId;
    if (this.#attachmentEvent !== null && this.#attachmentEvent["sessionId"] !== sessionId) { this.#refuse(); }
  }
  public observeFrame(reply: Row): void {
    this.assertCurrent();
    try {
      if (this.#expected === null) { this.observeFrames(reply); return; }
      const current = frames(reply).find(item => item["id"] === this.#expected?.frameId);
      if (current === undefined || current["url"] !== this.#expected.frameUrl) { this.#refuse(); }
      if (this.#frame !== null && !equal(this.#frame, current)) { this.#refuse(); }
      this.#frame = current;
    } catch { this.#refuse(); }
  }
  public observeFrames(reply: Row): Readonly<Record<string, unknown>> {
    this.assertCurrent();
    try {
      if (this.#expected !== null) { this.#refuse(); }
      const current = frames(reply);
      if (this.#frames !== null && !equal(this.#frames, current)) { this.#refuse(); }
      this.#frames = current;
      return diagnosticBoundedObservation({ schema: "easyeda-pro-control.pcb-diagnostic-frame-inventory.v1", targetId: this.#targetId,
        sessionId: this.#sessionId, frames: current.map(value => frameSummary(value)), frameIdentityVerified: false,
        projectWorkerAssociationVerified: false, executionAuthorized: false, continuousObservation: false });
    } catch { return this.#refuse(); }
  }
  public selectFrame(frameId: string, input: DiagnosticScriptProfile): void {
    this.assertCurrent();
    if (this.#expected !== null || this.#frame !== null || this.#frames === null || !diagnosticToken(frameId)) { this.#refuse(); }
    const profile = validateDiagnosticScriptProfile(input), selected = this.#frames.find(item => item["id"] === frameId);
    if (selected === undefined) { this.#refuse(); }
    this.#profile = profile; this.#frame = selected;
  }
  public observeTarget(reply: Row): void {
    this.assertCurrent();
    try {
      const current = target(reply, this.#targetId, true);
      if (this.#target === null || !equal({ ...this.#target, attached: true }, current)) { this.#refuse(); }
    } catch { this.#refuse(); }
  }
  public observeEvent(event: DiagnosticEvent): void {
    try { this.#acceptEvent(event); } catch { this.#failed = true; throw new Error("PCB_DIAGNOSTIC_CONTEXT_INVALIDATED"); }
  }
  #acceptEvent(event: DiagnosticEvent): void {
    if (this.#failed || this.#events.length >= 4096) { this.#refuse(); }
    // Console and exception arguments are unrelated private data, not identity
    // Evidence. Retain only event kinds here; exact identity rows live below.
    this.#events.push({ method: event.method, params: {}, ...(event.sessionId === undefined ? {} : { sessionId: event.sessionId }) });
    const params = event.params;
    if (event.sessionId === undefined) {
      if (event.method !== "Target.attachedToTarget" || this.#attachmentEvent !== null || !diagnosticRecord(params["targetInfo"]) ||
          params["targetInfo"]["targetId"] !== this.#targetId || params["targetInfo"]["type"] !== "page" ||
          !diagnosticToken(params["sessionId"]) || params["waitingForDebugger"] !== false ||
          (this.#sessionId !== null && this.#sessionId !== params["sessionId"])) { this.#refuse(); }
      this.#attachmentEvent = clone(params); return;
    }
    if (event.sessionId !== this.#sessionId) { this.#refuse(); }
    if (this.#priorRootNavigation?.acceptLateNavigation(event) === true ||
        this.#rootNavigation?.accept(event) === true) { this.#uiSourceContext(); return; }
    if (this.#pcbOpening !== null && this.#pcbEvent(event)) { return; }
    if (this.#rootNavigation !== null &&
        (event.method === "Page.frameStartedLoading" || event.method === "Page.frameStoppedLoading")) { this.#refuse(); }
    if (event.method === "Runtime.executionContextCreated") {
      const context = params["context"];
      if (!diagnosticRecord(context) || !integer(context["id"]) || !diagnosticToken(context["uniqueId"]) ||
          !text(context["origin"]) || !text(context["name"]) || !diagnosticRecord(context["auxData"]) ||
          this.#contexts.has(context["id"]) || [...this.#contexts.values()].some(value => value["uniqueId"] === context["uniqueId"])) { this.#refuse(); }
      this.#contexts.set(context["id"], clone(context));
      const pcb = this.#pcbOpening;
      if (pcb !== null && pcb.childId !== null && pcb.navigation !== null &&
          context["auxData"]["frameId"] === pcb.childId && pcb.navigation.committedLoader === null) {
        pcb.initialChildContexts.add(context["id"]);
      }
      return;
    }
    if (event.method === "Debugger.scriptParsed") {
      if (!diagnosticToken(params["scriptId"]) || !integer(params["executionContextId"]) || !text(params["url"]) ||
          this.#scripts.has(params["scriptId"])) { this.#refuse(); }
      this.#scripts.set(params["scriptId"], clone(params)); return;
    }
    // Enabling Runtime may report historical console/exception data. Count its
    // Event kind under the transport bounds without retaining the payload.
    if (["Runtime.consoleAPICalled", "Runtime.exceptionThrown", "Runtime.exceptionRevoked", "Runtime.inspectRequested",
      "Page.domContentEventFired", "Page.loadEventFired", "Page.frameStoppedLoading", "Page.frameResized"].includes(event.method)) { return; }
    // Includes navigation, frame attachment/detachment, context destruction or
    // Clearing, target detach/crash and an unexpected debugger pause. No resume.
    this.#refuse();
  }
  public script(): Readonly<{ scriptId: string; context: Row; parsed: Row }> {
    this.assertCurrent(); if (this.#frame === null) { return this.#refuse(); }
    return this.#scriptFor(this.#frame, this.#profile);
  }
  #scriptFor(frame: Row, profile: DiagnosticScriptProfile | null): Readonly<{ scriptId: string; context: Row; parsed: Row }> {
    const matching = [...this.#contexts.values()].filter(value => {
      const aux = value["auxData"];
      return diagnosticRecord(aux) && aux["frameId"] === frame["id"] && aux["isDefault"] === true && aux["type"] === "default";
    });
    const context = matching[0]; if (matching.length !== 1 || context === undefined || context["origin"] !== frame["securityOrigin"]) { return this.#refuse(); }
    const scripts = [...this.#scripts.values()].filter(value => value["executionContextId"] === context["id"] &&
      (this.#expected === null ? profile !== null && scriptUrlMatches(value["url"], profile) : value["url"] === this.#expected.scriptUrl));
    const parsed = scripts[0];
    if (scripts.length !== 1 || parsed === undefined || !diagnosticToken(parsed["scriptId"]) || parsed["hasSourceURL"] === true ||
        (parsed["scriptLanguage"] !== undefined && parsed["scriptLanguage"] !== "JavaScript") || parsed["isLiveEdit"] === true) { return this.#refuse(); }
    return Object.freeze({ scriptId: parsed["scriptId"], context: clone(context), parsed: clone(parsed) });
  }
  public finish(source: Row, targetReply: Row, frameReply: Row): Readonly<Record<string, unknown>> {
    this.assertCurrent(); this.observeFrame(frameReply);
    this.observeTarget(targetReply);
    const current = target(targetReply, this.#targetId, true);
    const profile = this.#expected ?? this.#profile, scriptSource = source["scriptSource"], selected = this.script();
    if (profile === null) { return this.#refuse(); }
    if (!diagnosticExact(source, ["scriptSource"]) || typeof scriptSource !== "string" || scriptSource.length > DIAGNOSTIC_SOURCE_BYTES ||
        !scriptSource.isWellFormed() || Buffer.byteLength(scriptSource, "utf8") !== profile.scriptBytes ||
        createHash("sha256").update(scriptSource, "utf8").digest("hex") !== profile.scriptSha256) { return this.#refuse(); }
    const contextId = selected.context["id"], uniqueContextId = selected.context["uniqueId"];
    if (!integer(contextId) || !diagnosticToken(uniqueContextId)) { return this.#refuse(); }
    this.#sourceIdentity = Object.freeze({ scriptId: selected.scriptId, contextId, uniqueContextId });
    if (this.#profile !== null && this.#frame !== null) {
      return diagnosticBoundedObservation({ schema: "easyeda-pro-control.pcb-diagnostic-frame-observation.v1", target: diagnosticTargetSummary(current),
        sessionId: this.#sessionId, frame: frameSummary(this.#frame),
        context: { id: selected.context["id"], uniqueId: selected.context["uniqueId"], origin: selected.context["origin"],
          auxData: { frameId: this.#frame["id"], isDefault: true, type: "default" } },
        script: { scriptId: selected.scriptId, url: selected.parsed["url"], executionContextId: selected.context["id"] },
        sourceSha256: profile.scriptSha256, sourceBytes: profile.scriptBytes, family: this.#profile.family, relativePath: this.#profile.relativePath,
        eventCount: this.#events.length, eventKinds: [...new Set(this.#events.map(value => value.method))].toSorted(), sourceVerified: true,
        projectWorkerAssociationVerified: false, compilerOwnerVerified: false, executionAuthorized: false, continuousObservation: false });
    }
    return Object.freeze({ schema: "easyeda-pro-control.pcb-diagnostic-frame-observation.v1", target: current, sessionId: this.#sessionId,
      frame: structuredClone(this.#frame), context: selected.context, script: selected.parsed, sourceSha256: profile.scriptSha256,
      sourceBytes: profile.scriptBytes, ...(this.#profile === null ? {} : { family: this.#profile.family, relativePath: this.#profile.relativePath }),
      events: structuredClone(this.#events), sourceVerified: true,
      projectWorkerAssociationVerified: false, compilerOwnerVerified: false, executionAuthorized: false, continuousObservation: false });
  }
  /** An internal selector for the one fixed opening function, not generic eval
   * authority. Exact source admission must precede this call. The caller still
   * owns checkpoint reproof, durable intent and one-shot request consumption. */
  #uiSourceContext(): Readonly<{ sessionId: string; uniqueContextId: string }> {
    this.assertCurrent();
    const selected = this.script(), source = this.#sourceIdentity;
    if (this.#expected !== null || this.#profile?.family !== "ui" || this.#frame === null || this.#frames === null ||
        this.#frame["parentId"] !== undefined ||
        this.#frames[0]?.["id"] !== this.#frame["id"] || source === null || this.#sessionId === null ||
        selected.scriptId !== source.scriptId || selected.context["id"] !== source.contextId ||
        selected.context["uniqueId"] !== source.uniqueContextId) { return this.#refuse(); }
    return Object.freeze({ sessionId: this.#sessionId, uniqueContextId: source.uniqueContextId });
  }
  /** Derive only the optional original blank child. This selector grants no
   * opening: the original CDP DOM-owner replies must establish its closed
   * source-shaped OBJECT contract first. Never infer an iframe from its URL. */
  public openingAncillaryFrame(): string | null {
    this.#uiSourceContext();
    if (this.#frames === null || this.#frame === null) { return this.#refuse(); }
    if (this.#pcbOpening !== null) {
      if (this.#ancillaryFrame !== null && !this.#frames.some(row => equal(row, this.#ancillaryFrame))) { return this.#refuse(); }
      return this.#ancillaryFrame === null ? null : String(this.#ancillaryFrame["id"]);
    }
    const other = this.#frames.filter(row => row["id"] !== this.#frame?.["id"]);
    if (other.length === 0) {
      if (this.#ancillaryFrame !== null || this.#ancillaryOwner !== null) { return this.#refuse(); }
      return null;
    }
    const child = other[0];
    if (other.length !== 1 || child === undefined || child["parentId"] !== this.#frame["id"] ||
        child["url"] !== "about:blank" || child["urlFragment"] !== undefined || child["securityOrigin"] !== "://" ||
        this.#ancillaryFrame !== null && !equal(child, this.#ancillaryFrame)) { return this.#refuse(); }
    this.#ancillaryFrame = child;
    return String(child["id"]);
  }
  public observeOpeningAncillaryOwner(ownerReply: Row, describeReply: Row): void {
    try {
      const frameId = this.openingAncillaryFrame();
      if (frameId === null) { this.#refuse(); }
      const proof = diagnosticAncillaryOwner(frameId, ownerReply, describeReply);
      if (this.#ancillaryOwner !== null && !equal(this.#ancillaryOwner, proof)) { this.#refuse(); }
      this.#ancillaryOwner = proof;
    } catch { this.#refuse(); }
  }
  /** Retained structural evidence only. The two fixed DOM calls cannot prove
   * the direct DOM parent, private observer registry or future inactivity. */
  public ancillaryObservation(): Row | null {
    const frameId = this.openingAncillaryFrame();
    if (frameId === null) { return null; }
    if (this.#ancillaryFrame === null || this.#ancillaryOwner === null) { return this.#refuse(); }
    return diagnosticBoundedObservation({ schema: "easyeda-pro-control.pcb-diagnostic-ancillary-frame.v1",
      frame: frameSummary(this.#ancillaryFrame), backendNodeId: this.#ancillaryOwner.backendNodeId,
      attributes: this.#ancillaryOwner.attributes, shape: "source-shaped-ui-resize-sensor-object",
      domParentVerified: false, observerRegistryOwnershipVerified: false, continuousObservation: false, executionAuthorized: false });
  }
  public openingContext(): Readonly<{ sessionId: string; uniqueContextId: string }> {
    const selected = this.#uiSourceContext();
    const ancillary = this.openingAncillaryFrame();
    if (this.#frames?.length !== (ancillary === null ? 1 : 2) || ancillary !== null && this.#ancillaryOwner === null) { return this.#refuse(); }
    return selected;
  }
  /** Fixed model observer only, after the existing PCB frame's complete source
   * was admitted. UI opening and model inspection are intentionally disjoint;
   * a worker-only opening never upgrades its context into a PCB compiler. */
  public modelContext(): Readonly<{ sessionId: string; scriptId: string; uniqueContextId: string }> {
    this.assertCurrent();
    const pcb = this.#pcbOpening;
    if (pcb !== null) {
      this.pcbOpeningContext();
      if (!pcb.completed || pcb.child === null || pcb.profile === null || pcb.sourceIdentity === null || pcb.domBackendNodeId === null || this.#sessionId === null) { return this.#refuse(); }
      const selected = this.#scriptFor(pcb.child, pcb.profile), source = pcb.sourceIdentity;
      if (selected.scriptId !== source.scriptId || selected.context["id"] !== source.contextId ||
          selected.context["uniqueId"] !== source.uniqueContextId) { return this.#refuse(); }
      return Object.freeze({ sessionId: this.#sessionId, scriptId: source.scriptId, uniqueContextId: source.uniqueContextId });
    }
    const selected = this.script(), source = this.#sourceIdentity;
    if (this.#expected !== null || this.#profile?.family !== "pcb" || this.#frame === null || this.#frames === null ||
        !this.#frames.some(frame => frame["id"] === this.#frame?.["id"]) || this.#openingConsumed ||
        this.#opening !== null || source === null || this.#sessionId === null ||
        selected.scriptId !== source.scriptId || selected.context["id"] !== source.contextId ||
        selected.context["uniqueId"] !== source.uniqueContextId) { return this.#refuse(); }
    return Object.freeze({ sessionId: this.#sessionId, scriptId: source.scriptId, uniqueContextId: source.uniqueContextId });
  }
  /** Permit only the selected project's one same-document hash transition.
   * No frame creation/restored editor tabs are admitted: CDP frame URLs alone
   * cannot prove those frames belong to the checkpoint-selected project.
   * Any failure remains terminal; this method never resets an invalid context. */
  public beginOpeningTransition(projectUuid: string, titleProof?: Readonly<{ initialTitle: string; expectedOpenedTitle: string }>): Readonly<{ sessionId: string; uniqueContextId: string }> {
    const selected = this.openingContext();
    if (this.#openingConsumed) { return this.#refuse(); }
    this.#openingConsumed = true;
    try {
      if (!/^[a-f\d]{64}$/u.test(projectUuid) || this.#frame === null || this.#target === null) { this.#refuse(); }
      const base = startPageBase(this.#frame), fragment = this.#frame["urlFragment"] === "#" ? "#" : "";
      if (this.#target["url"] !== `${base}${fragment}`) { this.#refuse(); }
      if (titleProof !== undefined && (!diagnosticExact(titleProof, ["initialTitle", "expectedOpenedTitle"]) ||
          !text(titleProof.initialTitle, 512) || !text(titleProof.expectedOpenedTitle, 512) || titleProof.initialTitle.length === 0 ||
          titleProof.expectedOpenedTitle.length === 0 || this.#target["title"] !== titleProof.initialTitle)) { this.#refuse(); }
      this.#opening = { base, url: `${base}#id=${projectUuid}`, expectedTitle: titleProof?.expectedOpenedTitle ?? null };
      this.#rootNavigation = new CurrentPcbDiagnosticSameDocument(String(this.#frame["id"]), this.#opening.url);
      return selected;
    } catch { return this.#refuse(); }
  }
  /** Complete only after the fixed call has returned and original target/frame
   * reads have settled. An acknowledgement or missing reply is not enough.
   * Keep all fields except the expected URL fragment byte-for-byte equivalent,
   * including loader, origin, title and the retained default-context/script. */
  public finishOpeningTransition(targetReply: Row, frameReply: Row): void {
    this.openingContext();
    try {
      const opening = this.#opening, original = this.#frame;
      if (opening === null || original === null || this.#target === null || this.#rootNavigation === null) { this.#refuse(); }
      this.#rootNavigation.seal();
      const currentFrames = frames(frameReply), currentTarget = target(targetReply, this.#targetId, true);
      const currentFrame = currentFrames[0];
      if (currentFrames.length !== (this.#ancillaryFrame === null ? 1 : 2) || currentFrame === undefined ||
          this.#ancillaryFrame !== null && !currentFrames.some(row => equal(row, this.#ancillaryFrame))) { this.#refuse(); }
      const { urlFragment: currentFragment, ...currentFields } = currentFrame;
      const { urlFragment: _originalFragment, ...originalFields } = original;
      if (currentFragment !== opening.url.slice(opening.base.length) || !equal(originalFields, currentFields) ||
          !equal({ ...this.#target, url: opening.url, attached: true,
            ...(opening.expectedTitle === null ? {} : { title: opening.expectedTitle }) }, currentTarget)) { this.#refuse(); }
      this.openingContext();
      this.#frame = currentFrame; this.#frames = currentFrames;
      this.#target = Object.freeze({ ...currentTarget, attached: false });
      this.#opening = null;
    } catch { this.#refuse(); }
  }
  /** Separate document-opening branch. The original source-shaped ancillary
   * child stays unchanged. Only this one-shot branch can add an editor child. */
  public beginPcbOpeningTransition(projectUuid: string, documentUuid: string): Readonly<{ sessionId: string; uniqueContextId: string }> {
    const selected = this.openingContext();
    if (this.#pcbOpening !== null || !this.#openingConsumed || this.#opening !== null || this.#frame === null ||
        this.#sourceIdentity === null || this.#target === null || !/^[a-f\d]{64}$/u.test(projectUuid) ||
        !/^(?:[a-f\d]{16}|[a-f\d]{32})$/u.test(documentUuid) ||
        this.#frame["urlFragment"] !== `#id=${projectUuid}`) { return this.#refuse(); }
    const base = this.#frame["url"];
    if (typeof base !== "string" || this.#target["url"] !== `${base}#id=${projectUuid}`) { return this.#refuse(); }
    const tabId = `${documentUuid}@${projectUuid}`;
    this.#pcbOpening = { projectUuid, documentUuid, tabId, url: `${base}#id=${projectUuid},tab=*${tabId}`,
      originalRoot: this.#frame, uiIdentity: this.#sourceIdentity, childId: null, child: null, navigation: null, initialChildContexts: new Set(),
      domBackendNodeId: null, profile: null, sourceIdentity: null, completed: false };
    this.#priorRootNavigation = this.#rootNavigation;
    this.#rootNavigation = new CurrentPcbDiagnosticSameDocument(String(this.#frame["id"]), this.#pcbOpening.url);
    return selected;
  }
  public pcbOpeningContext(): Readonly<{ sessionId: string; uniqueContextId: string }> {
    this.assertCurrent();
    const pcb = this.#pcbOpening, selected = this.script();
    if (pcb === null || this.#sessionId === null || this.#frame === null || this.#profile?.family !== "ui" ||
        this.#frame["id"] !== pcb.originalRoot["id"] || this.#frame["loaderId"] !== pcb.originalRoot["loaderId"] ||
        selected.scriptId !== pcb.uiIdentity.scriptId || selected.context["id"] !== pcb.uiIdentity.contextId ||
        selected.context["uniqueId"] !== pcb.uiIdentity.uniqueContextId) { return this.#refuse(); }
    return Object.freeze({ sessionId: this.#sessionId, uniqueContextId: pcb.uiIdentity.uniqueContextId });
  }
  #pcbEvent(event: DiagnosticEvent): boolean {
    const pcb = this.#pcbOpening;
    if (pcb === null) { return false; }
    const params = event.params;
    if (event.method === "Page.frameAttached") {
      if (pcb.child !== null || pcb.childId !== null || !diagnosticToken(params["frameId"]) ||
          params["frameId"] === pcb.originalRoot["id"] || params["frameId"] === this.#ancillaryFrame?.["id"] ||
          params["parentFrameId"] !== pcb.originalRoot["id"] ||
          !diagnosticExact(params, params["stack"] === undefined ? ["frameId", "parentFrameId"] : ["frameId", "parentFrameId", "stack"])) { this.#refuse(); }
      pcb.childId = params["frameId"];
      pcb.navigation = new CurrentPcbDiagnosticChildNavigation(pcb.childId, String(pcb.originalRoot["id"]));
      return true;
    }
    if (pcb.navigation?.accept(event) === true) {
      // Chromium clears old window contexts before emitting this commit.
      // A same-origin context may be reused; it must no longer be eligible
      // For initial-blank teardown after becoming the actual PCB context.
      if (event.method === "Page.frameNavigated" && pcb.navigation.committedLoader !== null) { pcb.initialChildContexts.clear(); }
      return true;
    }
    if (event.method === "Runtime.executionContextDestroyed") {
      const id = params["executionContextId"];
      const context = typeof id === "number" ? this.#contexts.get(id) : undefined;
      const aux = context?.["auxData"];
      if (pcb.child !== null || pcb.childId === null || typeof id !== "number" || !pcb.initialChildContexts.has(id) ||
          !diagnosticExact(params, ["executionContextId", "executionContextUniqueId"]) ||
          params["executionContextUniqueId"] !== context?.["uniqueId"] ||
          !diagnosticRecord(aux) || aux["frameId"] !== pcb.childId) { this.#refuse(); }
      pcb.initialChildContexts.delete(id);
      this.#contexts.delete(id);
      for (const [scriptId, row] of this.#scripts) { if (row["executionContextId"] === id) { this.#scripts.delete(scriptId); } }
      return true;
    }
    return false;
  }
  public observePcbOpeningFrames(targetReply: Row, frameReply: Row): Readonly<{ frameId: string; rootFrameId: string }> {
    this.pcbOpeningContext();
    try {
      const currentFrames = frames(frameReply), currentTarget = target(targetReply, this.#targetId, true), pcb = this.#pcbOpening;
      if (pcb === null || pcb.childId === null || pcb.navigation === null || pcb.navigation.committedLoader === null ||
          pcb.child !== null || this.#rootNavigation === null ||
          this.#target === null || currentFrames.length !== (this.#ancillaryFrame === null ? 2 : 3) ||
          this.#ancillaryFrame !== null && !currentFrames.some(row => equal(row, this.#ancillaryFrame))) { this.#refuse(); }
      this.#rootNavigation.seal();
      pcb.navigation.assertReady();
      const root = currentFrames.find(frame => frame["id"] === pcb.originalRoot["id"]);
      const child = currentFrames.find(frame => frame["id"] === pcb.childId);
      if (root === undefined || child === undefined) { this.#refuse(); }
      const { urlFragment: _originalFragment, ...originalFields } = pcb.originalRoot;
      const { urlFragment, ...currentFields } = root;
      if (!equal(originalFields, currentFields) || urlFragment !== pcb.url.slice(String(root["url"]).length) ||
          !equal({ ...this.#target, url: pcb.url, attached: true }, currentTarget) ||
          child["parentId"] !== root["id"] || child["loaderId"] !== pcb.navigation.committedLoader || child["url"] !== "https://client/editor?entry=pcb" ||
          child["securityOrigin"] !== "https://client" || child["urlFragment"] !== undefined) { this.#refuse(); }
      pcb.child = child; this.#frames = currentFrames; this.#frame = root;
      this.#target = Object.freeze({ ...currentTarget, attached: false });
      return Object.freeze({ frameId: pcb.childId, rootFrameId: String(root["id"]) });
    } catch { return this.#refuse(); }
  }
  public observePcbFrameOwner(ownerReply: Row, describeReply: Row): void {
    this.pcbOpeningContext();
    const backend = ownerReply["backendNodeId"], node = describeReply["node"], pcb = this.#pcbOpening;
    if (pcb === null || pcb.child === null || pcb.domBackendNodeId !== null || !integer(backend) ||
        !diagnosticExact(ownerReply, ownerReply["nodeId"] === undefined ? ["backendNodeId"] : ["backendNodeId", "nodeId"]) ||
        ownerReply["nodeId"] !== undefined && !integer(ownerReply["nodeId"]) ||
        !diagnosticExact(describeReply, ["node"]) || !diagnosticRecord(node) || node["backendNodeId"] !== backend ||
        node["nodeType"] !== 1 || node["nodeName"] !== "IFRAME" || node["localName"] !== "iframe" || node["frameId"] !== pcb.childId ||
        !Array.isArray(node["attributes"]) || node["attributes"].length > 256 || node["attributes"].length % 2 !== 0) { this.#refuse(); }
    const attributes = new Map<string, string>(), raw: unknown[] = node["attributes"];
    for (let index = 0; index < raw.length; index += 2) {
      const key = raw[index], value = raw[index + 1];
      if (!text(key, 128) || key !== key.toLowerCase() || !text(value, 8192) || attributes.has(key)) { this.#refuse(); }
      attributes.set(key, value);
    }
    if (attributes.get("id") !== `frame_${pcb.tabId}` || attributes.get("c_dbid") !== pcb.tabId ||
        attributes.get("c_doctype") !== "3" || attributes.get("src") !== "editor?entry=pcb" ||
        attributes.get("pcb-canvas") !== "true" || attributes.get("class")?.split(/\s+/u).includes("editframe") !== true ||
        ["blankIframe", "fromFile", "jsonCacheReady"].some(name => attributes.has(name.toLowerCase()))) { this.#refuse(); }
    pcb.domBackendNodeId = backend;
  }
  public pcbScript(input: DiagnosticScriptProfile): Readonly<{ scriptId: string; context: Row; parsed: Row }> {
    this.pcbOpeningContext();
    const pcb = this.#pcbOpening, profile = validateDiagnosticScriptProfile(input);
    if (pcb === null || pcb.child === null || pcb.domBackendNodeId === null || profile.family !== "pcb" ||
        pcb.profile !== null && !equal(pcb.profile, profile)) { return this.#refuse(); }
    pcb.profile = profile;
    const selected = this.#scriptFor(pcb.child, profile), source = pcb.sourceIdentity;
    if (source !== null && (selected.scriptId !== source.scriptId || selected.context["id"] !== source.contextId ||
        selected.context["uniqueId"] !== source.uniqueContextId)) { return this.#refuse(); }
    return selected;
  }
  public finishPcbOpening(source: Row, targetReply: Row, frameReply: Row): Readonly<Record<string, unknown>> {
    this.pcbOpeningContext(); this.observeFrames(frameReply); this.observeTarget(targetReply);
    const pcb = this.#pcbOpening;
    if (pcb === null || pcb.profile === null || pcb.child === null || pcb.domBackendNodeId === null || pcb.sourceIdentity !== null) { return this.#refuse(); }
    const scriptSource = source["scriptSource"], selected = this.pcbScript(pcb.profile);
    if (!diagnosticExact(source, ["scriptSource"]) || typeof scriptSource !== "string" || !scriptSource.isWellFormed() ||
        Buffer.byteLength(scriptSource, "utf8") !== pcb.profile.scriptBytes ||
        createHash("sha256").update(scriptSource, "utf8").digest("hex") !== pcb.profile.scriptSha256 ||
        !integer(selected.context["id"]) || !diagnosticToken(selected.context["uniqueId"])) { return this.#refuse(); }
    pcb.sourceIdentity = Object.freeze({ scriptId: selected.scriptId, contextId: selected.context["id"], uniqueContextId: selected.context["uniqueId"] });
    return diagnosticBoundedObservation({ schema: "easyeda-pro-control.pcb-diagnostic-pcb-frame-observation.v1",
      projectUuid: pcb.projectUuid, documentUuid: pcb.documentUuid, tabId: pcb.tabId, family: "pcb", sourceVerified: true,
      sourceSha256: pcb.profile.scriptSha256, sourceBytes: pcb.profile.scriptBytes, domOwnerVerified: true,
      targetId: this.#targetId, sessionId: this.#sessionId, frame: frameSummary(pcb.child),
      context: { id: selected.context["id"], uniqueId: selected.context["uniqueId"] }, scriptId: selected.scriptId,
      projectWorkerAssociationVerified: false, compilerOwnerVerified: false, startupQualified: false,
      executionAuthorized: false, continuousObservation: false });
  }
  /** Owner calls only after the fixed native-identity observation and all
   * original process/installation/frame postchecks have succeeded. Source
   * identity alone must not expose the model receiver. */
  public completePcbOpening(): void {
    this.pcbOpeningContext();
    const pcb = this.#pcbOpening;
    if (pcb === null || pcb.completed || pcb.child === null || pcb.profile === null || pcb.sourceIdentity === null ||
        pcb.domBackendNodeId === null) { this.#refuse(); }
    const selected = this.#scriptFor(pcb.child, pcb.profile);
    if (selected.scriptId !== pcb.sourceIdentity.scriptId || selected.context["id"] !== pcb.sourceIdentity.contextId ||
        selected.context["uniqueId"] !== pcb.sourceIdentity.uniqueContextId) { this.#refuse(); }
    pcb.completed = true;
  }
  public assertCurrent(): void { if (this.#failed || this.#sessionId === null) { this.#refuse(); } }
  #refuse(): never { this.#failed = true; return refuse(); }
}
