/** One original branch-query Promise; two bounded metadata samples cannot
 * repeat its application call. Only the Core installs the real bindings. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_QUERY_CALLEE as CALLEE, CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_QUERY_CAPTURE as CAPTURE, CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_QUERY_INVOKE as INVOKE } from "./current-footprint-forward-writer-branch-query-programs.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_QUERY_FLAGS as FLAGS, validateCurrentFootprintForwardWriterBranchQueryCommand } from "./current-footprint-forward-writer-branch-query-protocol.ts";
import type { CurrentFootprintForwardWriterBranchQueryCommand } from "./current-footprint-forward-writer-branch-query-protocol.ts";
import { currentFootprintCopyClockRpcV2ArrayObject, decodeCurrentFootprintCopyClockRpcV2Array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { decodeCurrentGeneratedSyncCallee } from "./current-generated-initial-sync-replies.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentProjectSaveProducerCachePromiseHandle } from "./current-project-save-producer-cache-replies.ts";

export interface CurrentFootprintForwardWriterBranchQueryBindings {
  readonly project: string; readonly branchUuid: string; readonly scriptId: string;
  readonly assertCurrent: () => Promise<void>;
  readonly request: (command: CurrentFootprintForwardWriterBranchQueryCommand) => Promise<unknown>;
  readonly originalMainBody: () => Promise<string>;
  readonly fail: (cause: unknown) => void;
}
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.union([z.strictObject({ type: z.literal("object"), className: z.literal("Promise"), description: z.literal("Promise"), objectId: handle }),
  z.strictObject({ type: z.literal("string"), value: z.string().max(4096) }), z.strictObject({ type: z.literal("undefined") })]);
const property = z.strictObject({ name: z.enum(["[[Prototype]]", "[[PromiseState]]", "[[PromiseResult]]"]), value: remote });
const metadata = z.strictObject({ result: z.tuple([]), internalProperties: z.array(property).length(3) });
function need(value: boolean): asserts value { if (!value) { throw new Error("FORWARD_BRANCH_QUERY_ORIGINAL_PROMISE"); } }
const properties = (objectId: string): Readonly<{ objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false }> => ({ objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
export class CurrentFootprintForwardWriterBranchQueryCursor {
  readonly #binding: CurrentFootprintForwardWriterBranchQueryBindings;
  #pending: Promise<string> | null = null; #promise: string | null = null; #requests = 0; #failed = false; #failure: unknown; #failureReportFailed = false; #failureReportFailure: unknown; #body: string | null = null;
  public constructor(binding: CurrentFootprintForwardWriterBranchQueryBindings) { this.#binding = binding; Object.freeze(this); }
  async #current(): Promise<void> { need(!this.#failed); await this.#binding.assertCurrent(); need(!this.#failed); }
  async #send(input: CurrentFootprintForwardWriterBranchQueryCommand): Promise<unknown> {
    const command = validateCurrentFootprintForwardWriterBranchQueryCommand(input); await this.#current(); this.#requests += 1; need(this.#requests <= 6);
    const reply = captureCurrentPcbStringClockReply(await this.#binding.request(command)).value; await this.#current(); return reply;
  }
  public start(): Promise<string> {
    if (this.#pending !== null) { return this.#pending; }
    const completion = Promise.withResolvers<string>(); this.#pending = completion.promise;
    void (async (): Promise<void> => { try { completion.resolve(await this.#run()); } catch (caughtError) { this.#failure = caughtError; this.#failed = true; try { this.#binding.fail(caughtError); } catch (reportError) { this.#failureReportFailed = true; this.#failureReportFailure = reportError; } completion.reject(caughtError); } })(); return completion.promise;
  }
  async #run(): Promise<string> {
    await this.#current();
    const tuple = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "forward-branch-query-capture", method: "Runtime.callFunctionOn",
      params: { ...FLAGS, objectId: this.#binding.project, throwOnSideEffect: true, functionDeclaration: CAPTURE, arguments: [{ value: this.#binding.branchUuid }] } }), 3);
    const fields = decodeCurrentFootprintCopyClockRpcV2Array(await this.#send({ phase: "forward-branch-query-tuple", method: "Runtime.getProperties", params: properties(tuple) }), 3);
    const method = currentFootprintCopyClockRpcV2ArrayObject(fields, 1);
    decodeCurrentGeneratedSyncCallee(await this.#send({ phase: "forward-branch-query-callee", method: "Runtime.getProperties", params: properties(method) }), CALLEE, this.#binding.scriptId);
    const invocation = await this.#send({ phase: "forward-branch-query-invoke", method: "Runtime.callFunctionOn",
      params: { ...FLAGS, objectId: tuple, throwOnSideEffect: false, functionDeclaration: INVOKE, arguments: [{ value: this.#binding.branchUuid }] } });
    const capture = z.strictObject({ result: z.unknown() }).parse(invocation); this.#promise = currentProjectSaveProducerCachePromiseHandle(capture.result);
    const expected = await this.#binding.originalMainBody(); await this.#current();
    need(expected.length > 0 && expected.length <= 4096 && expected.isWellFormed());
    for (const ordinal of [1, 2] as const) {
      const reply = metadata.parse(await this.#send({ phase: ordinal === 1 ? "forward-branch-query-promise-1" : "forward-branch-query-promise-2",
        method: "Runtime.getProperties", params: properties(this.#promise) }));
      const slots = new Map(reply.internalProperties.map(value => [value.name, value.value]));
      const parent = slots.get("[[Prototype]]"), result = slots.get("[[PromiseResult]]"), state = slots.get("[[PromiseState]]");
      need(slots.size === 3 && parent?.type === "object" && state?.type === "string");
      if (state.value === "fulfilled") { need(result?.type === "string" && result.value === expected); this.#body = expected; return expected; }
      need(state.value === "pending" && result?.type === "undefined" && ordinal === 1);
    }
    throw new Error("FORWARD_BRANCH_QUERY_PROMISE_BOUND");
  }
  public retained(): Readonly<{ attempted: boolean; requests: number; promiseRetained: boolean; failed: boolean; failureReportFailed: boolean; completed: boolean; executionAuthorized: false }> {
    return Object.freeze({ attempted: this.#pending !== null, requests: this.#requests, promiseRetained: this.#promise !== null, failed: this.#failed, failureReportFailed: this.#failureReportFailed, completed: this.#body !== null && !this.#failed, executionAuthorized: false });
  }
  public failure(): unknown { return this.#failure; }
  public failureReport(): unknown { return this.#failureReportFailure; }
}
Object.freeze(CurrentFootprintForwardWriterBranchQueryCursor.prototype); Object.freeze(CurrentFootprintForwardWriterBranchQueryCursor);
