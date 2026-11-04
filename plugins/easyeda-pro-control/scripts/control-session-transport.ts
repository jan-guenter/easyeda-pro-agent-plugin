import { spawn } from "node:child_process";
import type { ChildProcessByStdio } from "node:child_process";
import { once } from "node:events";
import type { Readable, Writable } from "node:stream";
import { setTimeout as wait } from "node:timers/promises";

import { ReadBuffer, serializeMessage } from "@modelcontextprotocol/sdk/shared/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

interface LaunchDefinition {
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly env: Readonly<Record<string, string>>;
}
export interface ForegroundClosure {
  readonly pid: number;
  readonly exitObserved: true;
  readonly closeObserved: true;
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly stdinEof: boolean;
}

/** Own the exact child handle through exit AND stdio closure. SDK stdio close
 * escalates to signals and clears its process handle before observed exit, so
 * it cannot implement this cooperative handoff. This transport never signals,
 * reconnects, replaces a child, or drops custody after a close timeout. */
export class ForegroundSessionTransport implements Transport {
  private readonly definition: LaunchDefinition;
  private readonly closeTimeoutMs: number;
  private readonly buffer = new ReadBuffer({ maxBufferSize: 67_108_864 });
  private child: ChildProcessByStdio<Writable, Readable, null> | undefined;
  private readonly closed = Promise.withResolvers<ForegroundClosure>();
  private exitObserved = false;
  private closeObserved = false;
  private stdinEof = false;
  private started = false;
  private failed = false;
  private tailBytes = 0;
  private closure: ForegroundClosure | null = null;
  public onclose?: () => void;
  public onerror?: (error: Error) => void;
  public onmessage?: (message: JSONRPCMessage) => void;

  /** Only the maintained verifier supplies this definition in the executable. */
  public constructor(definition: LaunchDefinition, closeTimeoutMs = 30_000) {
    this.definition = definition;
    this.closeTimeoutMs = closeTimeoutMs;
  }

  /** The PID remains retained after close, unlike SDK transport.pid. */
  public get pid(): number | undefined { return this.child?.pid; }

  /** A snapshot reports observed child events, never a close request. */
  public inspectClosure(): ForegroundClosure | null { return this.closure; }

  /** A failed spawn has no PID or process allocation to transfer. A child with
   * a PID requires both original exit and close observations. */
  public hasUnclosedChild(): boolean {
    return this.started && !(this.closeObserved && (this.exitObserved || this.child?.pid === undefined));
  }

  /** Starts once with explicit environment and no shell or inherited options. */
  public async start(): Promise<void> {
    if (this.started) { throw new Error("foreground-transport-start-consumed"); }
    this.started = true;
    const child = spawn(this.definition.command, [...this.definition.args], {
      cwd: this.definition.cwd, env: this.definition.env,
      stdio: ["pipe", "pipe", "ignore"], shell: false, windowsHide: true,
    });
    this.child = child;
    child.once("exit", () => { this.exitObserved = true; });
    child.once("close", (exitCode, signal) => {
      this.closeObserved = true;
      if (child.pid !== undefined && this.exitObserved) {
        this.closure = Object.freeze({ pid: child.pid, exitObserved: true, closeObserved: true,
          exitCode, signal, stdinEof: this.stdinEof });
        this.closed.resolve(this.closure);
      } else {
        this.closed.reject(new Error("foreground-child-exit-unproven"));
      }
      this.onclose?.();
    });
    // The close promise is retained even if startup fails before a caller awaits
    // It. Observing a rejection here grants no replacement authority.
    // oxlint-disable-next-line promise/prefer-await-to-then -- Observe this retained event rejection without blocking transport startup on child exit.
    void this.closed.promise.catch(() => null);
    child.on("error", error => { this.fail(error); });
    child.stdin.on("error", error => { this.fail(error); });
    child.stdout.on("error", error => { this.fail(error); });
    child.stdout.on("data", (chunk: Buffer) => {
      if (this.failed) { return; }
      try {
        const lastNewline = chunk.lastIndexOf(10);
        this.tailBytes = lastNewline === -1 ? this.tailBytes + chunk.length : chunk.length - lastNewline - 1;
        this.buffer.append(chunk);
        for (;;) {
          const message = this.buffer.readMessage();
          if (message === null) { break; }
          this.onmessage?.(message);
        }
      } catch {
        this.fail(new Error("foreground-child-invalid-frame"));
      }
    });
    child.stdout.once("end", () => {
      if (this.tailBytes !== 0) { this.fail(new Error("foreground-child-incomplete-frame")); }
    });
    await once(child, "spawn");
  }

  /** Latch transport failure before notifying the SDK. Subsequent writes refuse,
   * while the original child handle remains available for observed closure. */
  private fail(error: Error): void {
    this.failed = true;
    this.onerror?.(error);
  }

  /** Sends one SDK-framed message to the retained original child only. */
  public async send(message: JSONRPCMessage): Promise<void> {
    const child = this.child;
    if (child === undefined || this.failed || this.stdinEof || this.closeObserved) {
      throw new Error("foreground-transport-unavailable");
    }
    const completion = Promise.withResolvers<null>();
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Writable's completion callback proves buffer consumption; drain alone does not.
    child.stdin.write(serializeMessage(message), error => {
      if (error === null || error === undefined) { completion.resolve(null); }
      else { completion.reject(error); }
    });
    await completion.promise;
  }

  /** SDK connect failure discards its close promise. Keep this request inert:
   * EOF only, no rejecting wait or signals. Explicit handoff separately awaits
   * awaitOwnedClosure, whose bounded failure remains visible to the manager. */
  public close(): Promise<void> {
    const child = this.child;
    if (child === undefined) { return Promise.resolve(); }
    if (!this.stdinEof && !this.closeObserved) {
      this.stdinEof = true;
      try { child.stdin.end(); }
      catch { this.fail(new Error("foreground-child-eof-failed")); }
    }
    return Promise.resolve();
  }

  /** Closure is independent of SDK connection/close acknowledgements. Timeout
   * retains the exact child and never kills or retries the EOF request. */
  public async awaitOwnedClosure(): Promise<ForegroundClosure> {
    const abort = new AbortController();
    try {
      const closure = await Promise.race([this.closed.promise,
        wait(this.closeTimeoutMs, undefined, { signal: abort.signal }).then(() => {
          throw new Error("foreground-child-closure-unproven");
        })]);
      if (this.failed) { throw new Error("foreground-child-transport-failed"); }
      return closure;
    } finally { abort.abort(); }
  }
}
