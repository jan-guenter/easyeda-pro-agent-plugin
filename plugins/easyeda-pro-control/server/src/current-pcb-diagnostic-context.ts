/** Observed CDP identity only. Matching URLs or bytes never admit a CAD owner,
 * project worker, compiler, writable receiver or arbitrary JavaScript. */
import { createHash } from "node:crypto";
import { DIAGNOSTIC_SOURCE_BYTES, diagnosticExact, diagnosticRecord, diagnosticToken } from "./current-pcb-diagnostic-protocol.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";

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
    if (event.method === "Runtime.executionContextCreated") {
      const context = params["context"];
      if (!diagnosticRecord(context) || !integer(context["id"]) || !diagnosticToken(context["uniqueId"]) ||
          !text(context["origin"]) || !text(context["name"]) || !diagnosticRecord(context["auxData"]) ||
          this.#contexts.has(context["id"]) || [...this.#contexts.values()].some(value => value["uniqueId"] === context["uniqueId"])) { this.#refuse(); }
      this.#contexts.set(context["id"], clone(context)); return;
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
    const matching = [...this.#contexts.values()].filter(value => {
      const aux = value["auxData"];
      return diagnosticRecord(aux) && aux["frameId"] === this.#frame?.["id"] && aux["isDefault"] === true && aux["type"] === "default";
    });
    const context = matching[0]; if (matching.length !== 1 || context === undefined || context["origin"] !== this.#frame["securityOrigin"]) { return this.#refuse(); }
    const scripts = [...this.#scripts.values()].filter(value => value["executionContextId"] === context["id"] &&
      (this.#expected === null ? this.#profile !== null && scriptUrlMatches(value["url"], this.#profile) : value["url"] === this.#expected.scriptUrl));
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
  public assertCurrent(): void { if (this.#failed || this.#sessionId === null) { this.#refuse(); } }
  #refuse(): never { this.#failed = true; return refuse(); }
}
