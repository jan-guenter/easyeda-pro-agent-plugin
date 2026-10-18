/** Pure native-create argument and STRING-body model. No observation, identity,
 * header, upload, SQL, lifecycle token or executable writer is supplied here. */
import { types } from "node:util";
import { z } from "zod";
import { sha256Json, sha256Text } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const MAX_BODY_BYTES = 4096;
const coordinate = z.number().int().min(-1_000_000).max(1_000_000)
  .refine(value => !Object.is(value, -0) && value % 10 === 0, "A non-negative-zero 10-mil grid coordinate is required.");
const requestSchema = z.object({ x: coordinate, y: coordinate,
  text: z.string().min(1).max(256).regex(/^[\u0020-\u007E]+$/u).regex(/[\u0021-\u007E]/u) }).strict();
const LIMITS = Object.freeze({ originalNativeIdVerified: false, liveReceiverVerified: false,
  emptyRootPcbVerified: false, sourceOwnershipVerified: false, nativeModelVerified: false,
  completeLiveBaselineVerified: false, completeStoredBaselineVerified: false, queueCompletionVerified: false,
  completeEffectVerified: false, renderingVerified: false, persistenceVerified: false,
  writerSupported: false, executionAuthorized: false } as const);
type NativeArguments = Readonly<z.infer<typeof requestSchema> & {
  layer: 3; fontFamily: "default"; fontSize: 120; lineWidth: 8; alignMode: 3;
  rotation: 0; reverse: false; expansion: 0; mirror: false; primitiveLock: false;
}>;
interface StringBody {
  readonly partitionId: ""; readonly groupId: 0; readonly layerId: 3;
  readonly x: number; readonly y: number; readonly text: string;
  readonly fontFamily: "default"; readonly fontSize: 120; readonly strokeWidth: 8;
  readonly bold: 0; readonly italic: 0; readonly origin: "LEFT_BOTTOM"; readonly angle: 0;
  readonly reverse: false; readonly expansion: 0; readonly mirror: false; readonly locked: false;
  readonly zIndex: -1; readonly specialColor: "#000000";
}
interface ModelScalars {
  readonly type: 0; readonly modelType: "Text"; readonly layerId: 3;
  readonly key: ""; readonly showKey: false; readonly value: string; readonly showValue: true;
  readonly fontFamily: "default"; readonly fontSize: 12; readonly strokeWidth: 0.8;
  readonly position: Readonly<{ x: number; y: number }>;
  readonly origin: 3; readonly rotation: 0; readonly reverse: false; readonly reverseExpansion: 0;
  readonly mirror: false; readonly locked: false; readonly positionIsNull: false;
  readonly zIndex: -1; readonly silkColor: "#000000";
}

function need(value: boolean, detail: string): asserts value {
  if (!value) { throw new Error(`Current PCB STRING create candidate: ${detail}.`); }
}
function request(input: unknown): z.infer<typeof requestSchema> {
  need(input !== null && typeof input === "object" && !types.isProxy(input), "plain own-data request required");
  const prototype: unknown = Object.getPrototypeOf(input);
  need(prototype === Object.prototype || prototype === null, "plain own-data request required");
  const keys = Reflect.ownKeys(input);
  need(keys.length === 3 && keys.every(key => typeof key === "string" && ["x", "y", "text"].includes(key)), "request fields differ");
  const copied: Record<string, unknown> = {};
  for (const key of ["x", "y", "text"]) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && descriptor.enumerable === true, "own enumerable data fields required");
    copied[key] = descriptor.value as unknown;
  }
  return requestSchema.parse(copied);
}
function argumentsFor(value: z.infer<typeof requestSchema>): NativeArguments {
  // PCB217199c8 string-create@10393687 divides x/y/fontSize/lineWidth by10,
  // But passes expansion unchanged. Fix zero expansion instead of claiming the
  // Modify handler's different scaling. All native parameters are explicit.
  return { layer: 3, x: value.x, y: value.y, text: value.text, fontFamily: "default", fontSize: 120,
    lineWidth: 8, alignMode: 3, rotation: 0, reverse: false, expansion: 0, mirror: false, primitiveLock: false } as const;
}
function bodyFor(value: z.infer<typeof requestSchema>): StringBody {
  // Pinned PCB SHA217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33.
  // Native getSTRING@4000773 gives this exact format2.0 order; O3.getData@4418517
  // Applies we@3214815. Integer internal coordinates and the fixed dimensions
  // Round back exactly. Do not extend this to arbitrary floating-point inputs.
  // Jr.addText@7959947 defaults color Tz@1309844 to #000000. ee.of7@1452796
  // And its toString@1453688 preserve that explicit black, not null. The proposed
  // Empty-root scope needs partition@3424578 and Ya@4006194 defaults; this body
  // Does not establish that those preconditions actually hold in a renderer.
  return { partitionId: "", groupId: 0, layerId: 3, x: value.x, y: value.y, text: value.text,
    fontFamily: "default", fontSize: 120, strokeWidth: 8, bold: 0, italic: 0, origin: "LEFT_BOTTOM",
    angle: 0, reverse: false, expansion: 0, mirror: false, locked: false, zIndex: -1, specialColor: "#000000" } as const;
}
function modelScalarsFor(value: z.infer<typeof requestSchema>): ModelScalars {
  // Jr.addText/bo.addText@7959947/3988954 create the display values below.
  // Co@3214604 does not clamp12 or0.8. yr.fixFontFamily@7380394 and RGe@4407316
  // Select numeric type0 for default-font ASCII. Qy.fontPath@3628338..3635614
  // Contains these glyphs. ki@3959524 separately calls its modelType "Text".
  // Native zIndex@3424346 defaults to -1. These are predictions, not inspected fields.
  return { type: 0, modelType: "Text", layerId: 3, key: "", showKey: false, value: value.text, showValue: true,
    fontFamily: "default", fontSize: 12, strokeWidth: 0.8, position: { x: value.x / 10, y: value.y / 10 },
    origin: 3, rotation: 0, reverse: false, reverseExpansion: 0, mirror: false, locked: false,
    positionIsNull: false, zIndex: -1, silkColor: "#000000" } as const;
}

export interface CurrentPcbStringCreateCandidate extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-string-create-candidate.v1";
  readonly requestSha256: string;
  readonly candidateArguments: NativeArguments;
  readonly expectedBody: StringBody;
  readonly expectedBodyText: string;
  readonly expectedBodySha256: string;
  readonly expectedModelScalars: ModelScalars;
}
export interface CurrentPcbStringCreateBodyComparison extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-string-create-body-comparison.v1";
  readonly requestSha256: string;
  readonly bodySha256: string;
  readonly suppliedBodyMatchesPrediction: true;
}
const candidates = new WeakSet<CurrentPcbStringCreateCandidate>();

/** The future lifecycle must independently establish a fresh empty root PCB,
 * receiver ownership and complete baselines. Native create generates its ID;
 * this candidate reserves none. A returned ID can precede publication, and
 * command execution can flush unrelated queued work. This models only the
 * selected STRING body, not its header/ticket, full upload or saved effect. */
export function planCurrentPcbStringCreate(input: unknown): CurrentPcbStringCreateCandidate {
  const value = request(input);
  const expectedBody = bodyFor(value), expectedBodyText = JSON.stringify(expectedBody);
  need(Buffer.byteLength(expectedBodyText) <= MAX_BODY_BYTES, "encoded body exceeds bound");
  const result: CurrentPcbStringCreateCandidate = freezeDeep({ profile: "private.current-pcb-string-create-candidate.v1",
    requestSha256: sha256Json(value), candidateArguments: argumentsFor(value), expectedBody, expectedBodyText,
    expectedBodySha256: sha256Text(expectedBodyText), expectedModelScalars: modelScalarsFor(value), ...LIMITS });
  candidates.add(result); return result;
}

/** Exact supplied-byte relation only. Never normalize field order, JSON syntax,
 * color/null, extra fields or numeric encodings. Original candidate identity
 * protects this comparison's intent; it grants no observation/dispatch authority. */
export function compareCurrentPcbStringCreateBody(candidate: CurrentPcbStringCreateCandidate, suppliedBodyText: unknown): CurrentPcbStringCreateBodyComparison {
  need(candidates.has(candidate), "original candidate required");
  need(typeof suppliedBodyText === "string" && suppliedBodyText.length <= MAX_BODY_BYTES &&
    Buffer.byteLength(suppliedBodyText) <= MAX_BODY_BYTES && suppliedBodyText === candidate.expectedBodyText, "exact encoded body differs");
  return Object.freeze({ profile: "private.current-pcb-string-create-body-comparison.v1", requestSha256: candidate.requestSha256,
    bodySha256: candidate.expectedBodySha256, suppliedBodyMatchesPrediction: true, ...LIMITS } as const);
}
