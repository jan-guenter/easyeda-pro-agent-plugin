/** Distinct footprint registration program. Shared registry/API behavior stays
 * fixed; its canonical path and sixteen/32-character copied UUID are selected
 * only by the original inverse Core, never by a public path argument. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { diagnosticGeneratedFixtureRegistrationParams } from "./current-pcb-diagnostic-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { GENERATED_FIXTURE_REGISTRATION_FUNCTION as PCB, generatedFixtureRegistrationResultSchema } from "./managed-fixture-registration-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const oldPredicate = PCB.split("\n").find(line => line.startsWith("if(!/^[a-f0-9]{64}$/.test(target.projectUuid)"));
if (oldPredicate === undefined || PCB.split(oldPredicate).length !== 2) { throw new Error("FOOTPRINT_INVERSE_REGISTRATION_SOURCE_ANCHOR"); }
const predicate = String.raw`if(!/^[a-f0-9]{64}$/.test(target.projectUuid)||!/^[a-f0-9]{32}$/.test(target.branchUuid)||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(target.documentUuid)||!/^[a-f0-9]{64}$/.test(target.expectedSourceSha256))bad();
const path=target.rawWindowsPath;if(path.length<12||path.length>1024||!path.isWellFormed()||!/^[A-Za-z]:\\[^\u0000-\u001F\u007F<>:"|?*/]+\.eprj2$/.test(path))bad();
for(const part of path.slice(3).split('\\'))if(!part||part.trim()!==part||part==='.'||part==='..'||/[. ]$/.test(part)||/~[0-9]/.test(part)||/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part))bad();`;
const oldBefore = "check();const before=await registry(),beforeKeys=Object.keys(before).sort(),prior=Object.hasOwn(before,target.projectUuid);let dispatched=false;";
if (PCB.split(oldBefore).length !== 2) { throw new Error("FOOTPRINT_INVERSE_REGISTRATION_HASH_ANCHOR"); }
export const CURRENT_FOOTPRINT_INVERSE_REGISTRATION_FUNCTION = PCB.replace(oldPredicate, predicate).replace(oldBefore,
  `check();const pathHash=new Uint8Array(await Reflect.apply(digest.fn,subtle,['SHA-256',new Encoder().encode(target.rawWindowsPath)]));check();if(Array.from(pathHash,x=>x.toString(16).padStart(2,'0')).join('')!==target.projectUuid)bad();${oldBefore}`)
  .replace("GENERATED_FIXTURE_PATH_REGISTRATION_REFUSED", "FOOTPRINT_INVERSE_PATH_REGISTRATION_REFUSED")
  .replace("schema:'easyeda-pro-control.generated-fixture-path-registration.v1'", "schema:'easyeda-pro-control.footprint-inverse-path-registration.v1'");
export const currentFootprintInverseRegistrationResultSchema = z.strictObject({ ...generatedFixtureRegistrationResultSchema.shape, schema: z.literal("easyeda-pro-control.footprint-inverse-path-registration.v1") })
  .refine(value => generatedFixtureRegistrationResultSchema.safeParse({ ...value, schema: "easyeda-pro-control.generated-fixture-path-registration.v1" }).success);
export function currentFootprintInverseRegistrationParams(context: string, target: CurrentDisposableOpenSealedTarget): ReturnType<typeof diagnosticGeneratedFixtureRegistrationParams> {
  const sealed = currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(target).value);
  if (sealed.rawWindowsPath.length > 1024) { throw new Error("FOOTPRINT_INVERSE_REGISTRATION_PATH_BOUND"); }
  return Object.freeze({ ...diagnosticGeneratedFixtureRegistrationParams(context, sealed), functionDeclaration: CURRENT_FOOTPRINT_INVERSE_REGISTRATION_FUNCTION });
}
export function decodeCurrentFootprintInverseRegistrationReply(input: unknown, target: CurrentDisposableOpenSealedTarget): z.infer<typeof currentFootprintInverseRegistrationResultSchema> {
  const sealed = currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(target).value);
  const remote = z.strictObject({ type: z.literal("string"), value: z.string().max(32_768) });
  const reply = z.strictObject({ result: remote }).parse(captureCurrentPcbStringClockReply(input).value);
  const result = currentFootprintInverseRegistrationResultSchema.parse(JSON.parse(reply.result.value) as unknown);
  if (result.projectUuid !== sealed.projectUuid || result.rawWindowsPath !== sealed.rawWindowsPath || result.registrationDispatched === result.priorRegistrationPresent ||
    result.recentPathRowMayHaveChanged !== result.registrationDispatched || result.afterCount !== result.beforeCount + Number(result.registrationDispatched) ||
    result.priorRegistrationPresent && result.beforeRegistrySha256 !== result.afterRegistrySha256) { throw new Error("FOOTPRINT_INVERSE_REGISTRATION_REPLY"); }
  return freezeDeep(result);
}
export function currentFootprintInverseRegistrationNativeFrame(chunk: Buffer, sessionId: string, context: string, target: CurrentDisposableOpenSealedTarget): Readonly<Record<string, string | number>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("FOOTPRINT_INVERSE_REGISTRATION_FRAME"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1))), value = captureCurrentPcbStringClockReply(raw).value;
  if (value === null || typeof value !== "object" || !("id" in value) || typeof value.id !== "number" || !Number.isSafeInteger(value.id) || value.id < 1) { throw new Error("FOOTPRINT_INVERSE_REGISTRATION_FRAME"); }
  const expected = { id: value.id, method: "Runtime.callFunctionOn", params: currentFootprintInverseRegistrationParams(context, target), sessionId };
  if (canonicalJson(value) !== canonicalJson(expected) || chunk.toString("utf8") !== `${JSON.stringify(expected)}\0`) { throw new Error("FOOTPRINT_INVERSE_REGISTRATION_FRAME"); }
  return Object.freeze({ action: "footprint-inverse-register", requestId: value.id, sessionId, uniqueContextId: context });
}
