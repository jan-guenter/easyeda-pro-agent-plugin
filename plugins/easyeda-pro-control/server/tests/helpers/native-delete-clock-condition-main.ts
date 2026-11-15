/** Original inert condition fixture process; it creates no application owner. */
import assert from "node:assert/strict";
import { Worker } from "node:worker_threads";
import { z } from "zod";

async function run(): Promise<void> {
  const worker = new Worker(new URL("native-delete-clock-condition-worker.ts", import.meta.url));
  const messages: unknown[] = []; worker.on("message", message => { messages.push(message); });
  // oxlint-disable-next-line promise/avoid-new -- Join the original fixture worker's exact exit event.
  const code = await new Promise<number>((resolve, reject) => { worker.once("error", reject); worker.once("exit", resolve); });
  assert.equal(code, 0); assert.equal(messages.length, 1);
  const packet = z.strictObject({ conditionEvaluations: z.literal(10), falseEvaluations: z.literal(4), originalConditionSourcesQualified: z.literal(10),
    actualPauses: z.literal(6), actualResumes: z.literal(6), rendererRequests: z.literal(58), nativeOwnerIssued: z.literal(false), applicationExecuted: z.literal(false) }).parse(messages[0]);
  process.stdout.write(JSON.stringify(packet));
}
try {
  // oxlint-disable-next-line node/no-top-level-await -- This standalone process joins its exact Inspector worker before returning its bounded data packet.
  await run();
} catch (caughtError) { process.stderr.write(caughtError instanceof Error ? caughtError.message : "condition fixture failed"); process.exitCode = 1; }
