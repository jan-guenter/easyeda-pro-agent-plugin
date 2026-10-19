import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { ReadBuffer, serializeMessage } from "@modelcontextprotocol/sdk/shared/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

interface ValidationProcessOptions {
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly env: NodeJS.ProcessEnv;
}

/** Package-check child only. Never adopts a PID or escalates EOF to a signal. */
export class ValidationStdioTransport implements Transport {
  public onclose?: () => void;
  public onerror?: (error: Error) => void;
  public onmessage?: (message: JSONRPCMessage) => void;
  readonly #options: ValidationProcessOptions;
  readonly #buffer = new ReadBuffer({ maxBufferSize: 10 * 1024 * 1024 });
  #child: ChildProcessWithoutNullStreams | undefined;
  #attempted = false;
  #closed = false;
  #closeFailure: Error | undefined;
  #closePromise: Promise<void> | undefined;
  #exit: Promise<void> | undefined;

  public constructor(options: ValidationProcessOptions) {
    this.#options = options;
  }

  public get closureVerified(): boolean { return !this.#attempted || this.#closed; }

  public async start(): Promise<void> {
    if (this.#attempted || this.#closePromise !== undefined) {
      throw new Error("Validation transport cannot be started twice or after closure.");
    }
    this.#attempted = true;
    const child = spawn(this.#options.command, [...this.#options.args], {
      cwd: this.#options.cwd,
      env: this.#options.env,
      stdio: ["pipe", "pipe", "pipe"],
      shell: false,
      windowsHide: true,
    });
    this.#child = child;
    // oxlint-disable-next-line promise/avoid-new -- Retain the original child's close event, independently of request errors.
    this.#exit = new Promise<void>((resolve) => {
      child.once("close", () => {
        this.#closed = true;
        this.#buffer.clear();
        resolve();
        this.onclose?.();
      });
    });
    child.on("error", (error) => { this.onerror?.(error); });
    child.stdin.on("error", (error) => { this.onerror?.(error); });
    child.stdout.on("error", (error) => { this.onerror?.(error); });
    child.stderr.on("error", (error) => { this.onerror?.(error); });
    // Drain the private child's stderr without embedding arbitrary output in the report.
    child.stderr.resume();
    child.stdout.on("data", (chunk: Buffer) => {
      try {
        this.#buffer.append(chunk);
        let message = this.#buffer.readMessage();
        while (message !== null) {
          this.onmessage?.(message);
          message = this.#buffer.readMessage();
        }
      } catch (error) {
        this.onerror?.(error instanceof Error ? error : new Error("Invalid validation reply.", { cause: error }));
        void this.close();
      }
    });
    // oxlint-disable-next-line promise/avoid-new -- Spawn and error are separate original-child events.
    await new Promise<void>((resolve, reject) => {
      child.once("spawn", resolve);
      child.once("error", reject);
    });
  }

  public async send(message: JSONRPCMessage): Promise<void> {
    const child = this.#child;
    if (child === undefined || this.#closed || this.#closePromise !== undefined) {
      throw new Error("Validation transport is not connected.");
    }
    // oxlint-disable-next-line promise/avoid-new -- The writable callback reports completion or EPIPE for this exact message.
    await new Promise<void>((resolve, reject) => {
      child.stdin.write(serializeMessage(message), (error) => {
        if (error === null || error === undefined) { resolve(); }
        else { reject(error); }
      });
    });
  }

  public close(): Promise<void> {
    // The SDK calls void client.close() on initialize failure. Keep its detached
    // Promise settled; the validator must separately await verifyClosed().
    this.#closePromise ??= this.#closeAndRetainFailure();
    return this.#closePromise;
  }

  async #closeAndRetainFailure(): Promise<void> {
    try { await this.#closeOriginalChild(); }
    catch (error) {
      this.#closeFailure = error instanceof Error ? error : new Error("Validation child closure failed.", { cause: error });
    }
  }

  public async verifyClosed(): Promise<void> {
    await this.close();
    if (this.#closeFailure !== undefined) { throw this.#closeFailure; }
    if (!this.closureVerified) { throw new Error("Validation original-child closure is unproved."); }
  }

  async #closeOriginalChild(): Promise<void> {
    const child = this.#child, exit = this.#exit;
    if (child === undefined) {
      if (this.#attempted) { throw new Error("Validation child creation is uncertain; retain the smoke directory."); }
      return;
    }
    if (exit === undefined) { throw new Error("Validation child closure observer is absent."); }
    if (!this.#closed) { child.stdin.end(); }
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      // oxlint-disable-next-line promise/avoid-new -- The bounded close wait must cancel its timer when original closure wins.
      const deadline = new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => {
          // Keep original handles alive on uncertainty. The validator reports failure
          // And retains its directory; it does not detach or terminate a live child.
          reject(new Error("Validation child did not close after stdin EOF; no signal sent, retain its smoke directory."));
        }, 10_000);
      });
      await Promise.race([exit, deadline]);
    } finally {
      clearTimeout(timer);
    }
    if (child.exitCode !== 0 || child.signalCode !== null) {
      throw new Error(`Validation child exited unsuccessfully: code=${String(child.exitCode)}, signal=${String(child.signalCode)}.`);
    }
  }
}
