import { isRecord } from "./core.ts";
import { libraryOperationSchema } from "./library-operations.ts";

export interface DeviceModelIdentity { readonly uuid: string; readonly libraryUuid: string }
export interface DeviceModelEvidence extends DeviceModelIdentity { readonly metadata: Record<string, unknown> }
const identity = /^[a-f0-9]{32}$/u;

export function deviceRequestedModel(input: unknown): DeviceModelIdentity | undefined {
  const operation = libraryOperationSchema.parse(input);
  let model: DeviceModelIdentity | null | undefined;
  if (operation.action === "library.device.create") { model = operation.association.model3D; }
  else if (operation.action === "library.device.modify") { model = operation.patch.association?.model3D; }
  if (model === undefined || model === null) { return undefined; }
  if (!identity.test(model.uuid) || !identity.test(model.libraryUuid)) { throw new Error("Existing model assignment requires exact 32-hex asset and external collection identities, not filenames or paths."); }
  return { uuid: model.uuid, libraryUuid: model.libraryUuid };
}

export function validateDeviceModelMetadata(input: unknown, expected: DeviceModelIdentity): DeviceModelEvidence {
  if (!identity.test(expected.uuid) || !identity.test(expected.libraryUuid) || !isRecord(input) || input["uuid"] !== expected.uuid || input["libraryUuid"] !== expected.libraryUuid || input["libraryType"] !== "5" || typeof input["name"] !== "string" || input["name"].length === 0 || input["name"].length > 512) { throw new Error("Existing external model metadata identity, owner, type or title differs."); }
  return { ...expected, metadata: structuredClone(input) };
}

/** Embedded only in fixed device programs where stable and assertProject exist. */
export const DEVICE_MODEL_RUNTIME_GUARD = `if(PLAN.model!==undefined){const api=eda.lib_3DModel;if(typeof api?.get!=='function')throw new Error('DEVICE_MODEL_GETTER_MISSING');const actual=await api.get(PLAN.model.uuid,PLAN.model.libraryUuid);const encoded=JSON.stringify(actual);if(typeof encoded!=='string'||new TextEncoder().encode(encoded).byteLength>1048576||stable(JSON.parse(encoded))!==stable(PLAN.model.metadata))throw new Error('DEVICE_MODEL_METADATA_DRIFT');await assertProject();}`;
