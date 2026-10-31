/** Synthetic source and native-capability issuers exist only inside this test
 * module loader. The maintained runner still executes every preparation call,
 * bootstrap/event decoder and metadata check; no production seam is added. */
import assert from "node:assert/strict";
import type { CurrentFootprintHeadAgeBootstrapCapability } from "../../src/current-footprint-head-age-context.ts";
import type { CurrentFootprintCopyMainBackendRunner } from "../../src/current-footprint-copy-main-backend-runner.ts";
import { mainBackendModule, mainBackendTransportFixture } from "./footprint-main-backend-runner-fixture.ts";

export async function headAgeBackendRunnerFixture(): Promise<Readonly<{ runner: CurrentFootprintCopyMainBackendRunner; value: ReturnType<typeof mainBackendTransportFixture> }>> {
  const value = mainBackendTransportFixture(true);
  const context = await import("../../src/current-footprint-head-age-context.ts"), owner = await import("../../src/current-pcb-diagnostic-owner.ts");
  const capability: CurrentFootprintHeadAgeBootstrapCapability = Object.freeze({ profile: "private.current-footprint-head-age-bootstrap-capability.v1", executionAuthorized: false });
  const source = Object.freeze({ profile: "private.current-footprint-head-age-context-source.v1" as const, runtimeProcessVerified: false as const, executionAuthorized: false as const });
  const module = await mainBackendModule({ "./current-pcb-diagnostic-owner.ts": { ...owner,
    requireCurrentFootprintHeadAgeBootstrapCapability(actual: unknown, transport: unknown): void { assert.equal(actual, capability); assert.equal(transport, value.transport); } },
  "./current-footprint-head-age-context.ts": { ...context,
    qualifyCurrentFootprintHeadAgeContextSource(actual: unknown): typeof source { assert.equal(actual, "s".repeat(context.CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_SOURCE.bytes)); return source; },
    requireCurrentFootprintHeadAgeContextSource(actual: unknown): void { assert.equal(actual, source); } } });
  return { runner: new module.Constructor(value.transport, capability), value };
}
