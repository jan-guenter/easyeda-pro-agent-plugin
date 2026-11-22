/** Fixed schematic encoder source checkpoints. The spans were derived from both
 * complete reviewed scripts. Neither the pins nor the returned checkpoints
 * identify a live native receiver or admit a writer. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureQualifiedCurrentSchematicWireCompletionSource } from "./current-schematic-wire-completion-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentSchematicWireEncoderRole =
  | "delegation" | "handler" | "sourceIds" | "documentIsSymbol"
  | "factory" | "lineUpload" | "lineChecked" | "lineBody"
  | "symbolClass" | "commonClass" | "baseClass" | "pageClass"
  | "consistencyClass" | "consistencyParentClass" | "groupUpload" | "attributeUpload"
  | "textUpload" | "lineChecker" | "uploadCanvas" | "encodeLine"
  | "getData" | "clearData";

interface SourceSite {
  readonly lineNumber: number;
  readonly columnNumber: number;
}
interface SourceSpan {
  readonly start: number;
  readonly end: number;
  readonly bytes: number;
  readonly sha256: string;
}
export interface CurrentSchematicWireEncoderSourceRow extends SourceSpan {
  readonly name: string;
  readonly arity: number;
  readonly kind: "method" | "function" | "class";
  readonly location: SourceSite;
  readonly endLocation: SourceSite;
  readonly parent: CurrentSchematicWireEncoderRole | "native" | null;
}
const rows = freezeDeep([
  {
    delegation: { start: 4_460_076, end: 4_460_149, bytes: 73,
      sha256: "ceb0f199c26ec8f4d9228f895b42587fce3a4e48e9ccd490f6c2f0d217fd11f7", name: "getSourceCode", arity: 0, kind: "method",
      location: { lineNumber: 3614, columnNumber: 24_961 },
      endLocation: { lineNumber: 3614, columnNumber: 25_021 }, parent: "native" },
    handler: { start: 4_455_784, end: 4_456_079, bytes: 295,
      sha256: "d299c279b5f29861d1df203dd81881f3abdde788a0d5d450fb5d70c87d47d877", name: "getSourceCode", arity: 0, kind: "method",
      location: { lineNumber: 3614, columnNumber: 20_669 },
      endLocation: { lineNumber: 3614, columnNumber: 20_951 }, parent: "native" },
    sourceIds: { start: 4_455_726, end: 4_455_784, bytes: 58,
      sha256: "f22ffb991e504f48e01b29c575faaa68029982ad17d81b5cef8a723ac3165b9c", name: "getSourceCodeIdMap", arity: 0, kind: "method",
      location: { lineNumber: 3614, columnNumber: 20_616 },
      endLocation: { lineNumber: 3614, columnNumber: 20_656 }, parent: "native" },
    documentIsSymbol: { start: 4_462_044, end: 4_462_086, bytes: 42,
      sha256: "0cdeb41fdfb9a2d3937aaeff8bb0fee255d9d744f8ef61984bc7344c8d4d0eab", name: "isSymbolDoc", arity: 0, kind: "method",
      location: { lineNumber: 3614, columnNumber: 26_927 },
      endLocation: { lineNumber: 3614, columnNumber: 26_958 }, parent: "native" },
    factory: { start: 4_451_936, end: 4_452_018, bytes: 82,
      sha256: "236bce57df800d3d6632d266cb3660f26901776ff3a388aa1785c86b5435a1b6", name: "t", arity: 1, kind: "function",
      location: { lineNumber: 3614, columnNumber: 16_818 },
      endLocation: { lineNumber: 3614, columnNumber: 16_890 }, parent: "native" },
    lineUpload: { start: 3_855_247, end: 3_855_324, bytes: 77,
      sha256: "db4ace52f96583eadd471a4139ab730e7488dcf388d444663f84e93c3b35e353", name: "uploadTo", arity: 2, kind: "method",
      location: { lineNumber: 3606, columnNumber: 188_371 },
      endLocation: { lineNumber: 3606, columnNumber: 188_440 }, parent: "native" },
    lineChecked: { start: 3_855_033, end: 3_855_247, bytes: 214,
      sha256: "e1363b1dde4c219aca4cbd09fdf9e5f1845beae88d56247ce77d5cdba6c38c5f", name: "getCheckedConsistencyData", arity: 1, kind: "method",
      location: { lineNumber: 3606, columnNumber: 188_174 },
      endLocation: { lineNumber: 3606, columnNumber: 188_363 }, parent: "native" },
    lineBody: { start: 3_855_644, end: 3_855_929, bytes: 285,
      sha256: "8925258cc628592c187f1ef2d6a7390d95f4bab9768eb9c5cee540e78a50f699", name: "getConsistencyData", arity: 0, kind: "method",
      location: { lineNumber: 3606, columnNumber: 188_778 },
      endLocation: { lineNumber: 3606, columnNumber: 189_045 }, parent: "native" },
    symbolClass: { start: 791_149, end: 791_346, bytes: 197,
      sha256: "06cb53d15d329042e26b5f9616f2e4016c2f3b5a792eb55165f37f83058f061d", name: "hse", arity: 2, kind: "class",
      location: { lineNumber: 30, columnNumber: 34_944 },
      endLocation: { lineNumber: 30, columnNumber: 34_970 }, parent: "commonClass" },
    commonClass: { start: 788_384, end: 790_501, bytes: 2117,
      sha256: "49848654ae1aca1e37bd79eb7ef442a6a644f1bfb75130abc02d3f1c35b5e25d", name: "cse", arity: 3, kind: "class",
      location: { lineNumber: 30, columnNumber: 32_179 },
      endLocation: { lineNumber: 30, columnNumber: 32_212 }, parent: "baseClass" },
    baseClass: { start: 787_546, end: 788_375, bytes: 829,
      sha256: "9eb9384664740ba2a24b38e2c5c52b297d0115ca423acb841d8ec0eec4a5245d", name: "ODe", arity: 3, kind: "class",
      location: { lineNumber: 30, columnNumber: 31_329 },
      endLocation: { lineNumber: 30, columnNumber: 31_537 }, parent: "native" },
    pageClass: { start: 790_506, end: 791_144, bytes: 638,
      sha256: "a641a128914769e2a09ef72e0fa7822adf9665a14e147cb81b51d3f66a6b156e", name: "use", arity: 2, kind: "class",
      location: { lineNumber: 30, columnNumber: 34_301 },
      endLocation: { lineNumber: 30, columnNumber: 34_329 }, parent: "commonClass" },
    consistencyClass: { start: 452_335, end: 473_600, bytes: 21_265,
      sha256: "239be153c3533d5cd27ef5dcc09b5841b6528c683252a8c1ae7cea623e406c77", name: "LEe", arity: 1, kind: "class",
      location: { lineNumber: 10, columnNumber: 21_587 },
      endLocation: { lineNumber: 10, columnNumber: 22_049 }, parent: "consistencyParentClass" },
    consistencyParentClass: { start: 425_934, end: 427_781, bytes: 1847,
      sha256: "68355b4a09f3f84f35a71b9909dce54280e809a1bbb153fd38386c79f3359929", name: "EO", arity: 1, kind: "class",
      location: { lineNumber: 8, columnNumber: 2717 },
      endLocation: { lineNumber: 8, columnNumber: 2882 }, parent: null },
    groupUpload: { start: 3_913_366, end: 3_913_488, bytes: 122,
      sha256: "0e1ef263696fa44d0e52d8603e7389f13a086fd62da9ce0ec5982f8e17690045", name: "uploadTo", arity: 1, kind: "method",
      location: { lineNumber: 3606, columnNumber: 246_490 },
      endLocation: { lineNumber: 3606, columnNumber: 246_604 }, parent: "native" },
    attributeUpload: { start: 5_580_258, end: 5_580_336, bytes: 78,
      sha256: "a88d4d6f5fb43a55feccd9a32ed04b396b24b29c05fcf8fe641564354bec7efb", name: "uploadTo", arity: 1, kind: "method",
      location: { lineNumber: 3673, columnNumber: 268_089 },
      endLocation: { lineNumber: 3673, columnNumber: 268_159 }, parent: "native" },
    textUpload: { start: 4_127_121, end: 4_127_199, bytes: 78,
      sha256: "ec81fb812c073ad6b09ed843e561c5133c168d2dce5120e770168b6b68a578a1", name: "uploadTo", arity: 1, kind: "method",
      location: { lineNumber: 3606, columnNumber: 460_245 },
      endLocation: { lineNumber: 3606, columnNumber: 460_315 }, parent: "native" },
    lineChecker: { start: 4_429_685, end: 4_429_835, bytes: 150,
      sha256: "257c378a58544f05a4a8efaeb590356965303af7141b4815a38849eac24473b6", name: "netGroupLine", arity: 1, kind: "method",
      location: { lineNumber: 3613, columnNumber: 116_082 },
      endLocation: { lineNumber: 3613, columnNumber: 116_220 }, parent: "native" },
    uploadCanvas: { start: 788_537, end: 788_617, bytes: 80,
      sha256: "e1c05e0547be80545c9dd54e796aac13cbf1c61a1a3bbd52669ba85e93437dfe", name: "uploadCanvas", arity: 1, kind: "method",
      location: { lineNumber: 30, columnNumber: 32_315 },
      endLocation: { lineNumber: 30, columnNumber: 32_383 }, parent: "native" },
    encodeLine: { start: 791_002, end: 791_073, bytes: 71,
      sha256: "e0be6970f6e6094330e5cce04256406d2edacc27a8ca59e2b9e624ebcf97ffc8", name: "uploadLine", arity: 2, kind: "method",
      location: { lineNumber: 30, columnNumber: 34_778 },
      endLocation: { lineNumber: 30, columnNumber: 34_839 }, parent: "native" },
    getData: { start: 788_029, end: 788_106, bytes: 77,
      sha256: "4c61da11199a9424b4a5207a6427c9847c5fd43bd715f48164ba404a752ae186", name: "getDataStr", arity: 0, kind: "method",
      location: { lineNumber: 30, columnNumber: 31_805 },
      endLocation: { lineNumber: 30, columnNumber: 31_872 }, parent: "native" },
    clearData: { start: 788_106, end: 788_159, bytes: 53,
      sha256: "aeb931d55f7c051ea99d04dc7fe351448bed9acfd655668519c3420b1fe4f48d", name: "removeDataStr", arity: 0, kind: "method",
      location: { lineNumber: 30, columnNumber: 31_885 },
      endLocation: { lineNumber: 30, columnNumber: 31_925 }, parent: "native" },
  },
  {
    delegation: { start: 4_682_845, end: 4_682_918, bytes: 73,
      sha256: "ceb0f199c26ec8f4d9228f895b42587fce3a4e48e9ccd490f6c2f0d217fd11f7", name: "getSourceCode", arity: 0, kind: "method",
      location: { lineNumber: 4113, columnNumber: 24_961 },
      endLocation: { lineNumber: 4113, columnNumber: 25_021 }, parent: "native" },
    handler: { start: 4_678_553, end: 4_678_848, bytes: 295,
      sha256: "041a8daf82e987282e134c8c751dbc18afb6b5d2f4c5f8671891127a58c7ae22", name: "getSourceCode", arity: 0, kind: "method",
      location: { lineNumber: 4113, columnNumber: 20_669 },
      endLocation: { lineNumber: 4113, columnNumber: 20_951 }, parent: "native" },
    sourceIds: { start: 4_678_495, end: 4_678_553, bytes: 58,
      sha256: "f22ffb991e504f48e01b29c575faaa68029982ad17d81b5cef8a723ac3165b9c", name: "getSourceCodeIdMap", arity: 0, kind: "method",
      location: { lineNumber: 4113, columnNumber: 20_616 },
      endLocation: { lineNumber: 4113, columnNumber: 20_656 }, parent: "native" },
    documentIsSymbol: { start: 4_684_813, end: 4_684_855, bytes: 42,
      sha256: "0cdeb41fdfb9a2d3937aaeff8bb0fee255d9d744f8ef61984bc7344c8d4d0eab", name: "isSymbolDoc", arity: 0, kind: "method",
      location: { lineNumber: 4113, columnNumber: 26_927 },
      endLocation: { lineNumber: 4113, columnNumber: 26_958 }, parent: "native" },
    factory: { start: 4_674_705, end: 4_674_787, bytes: 82,
      sha256: "35b946a6c1d226a749558fee3041235210dae354601f8a5b2c62601bf4fe77e0", name: "t", arity: 1, kind: "function",
      location: { lineNumber: 4113, columnNumber: 16_818 },
      endLocation: { lineNumber: 4113, columnNumber: 16_890 }, parent: "native" },
    lineUpload: { start: 2_154_679, end: 2_154_756, bytes: 77,
      sha256: "db4ace52f96583eadd471a4139ab730e7488dcf388d444663f84e93c3b35e353", name: "uploadTo", arity: 2, kind: "method",
      location: { lineNumber: 557, columnNumber: 241_590 },
      endLocation: { lineNumber: 557, columnNumber: 241_659 }, parent: "native" },
    lineChecked: { start: 2_154_465, end: 2_154_679, bytes: 214,
      sha256: "e1363b1dde4c219aca4cbd09fdf9e5f1845beae88d56247ce77d5cdba6c38c5f", name: "getCheckedConsistencyData", arity: 1, kind: "method",
      location: { lineNumber: 557, columnNumber: 241_393 },
      endLocation: { lineNumber: 557, columnNumber: 241_582 }, parent: "native" },
    lineBody: { start: 2_155_076, end: 2_155_361, bytes: 285,
      sha256: "8925258cc628592c187f1ef2d6a7390d95f4bab9768eb9c5cee540e78a50f699", name: "getConsistencyData", arity: 0, kind: "method",
      location: { lineNumber: 557, columnNumber: 241_997 },
      endLocation: { lineNumber: 557, columnNumber: 242_264 }, parent: "native" },
    symbolClass: { start: 1_814_561, end: 1_814_758, bytes: 197,
      sha256: "94cb5ec38f84af0a5a5d0ea4647d4e848d40f4c7acf937200c3080d23feb0c5b", name: "Ble", arity: 2, kind: "class",
      location: { lineNumber: 556, columnNumber: 34_944 },
      endLocation: { lineNumber: 556, columnNumber: 34_970 }, parent: "commonClass" },
    commonClass: { start: 1_811_796, end: 1_813_913, bytes: 2117,
      sha256: "7cf4f4bd21cfdc4f5cf235e0f4c91059ae846425212ab3f1fe9ee99f740fbddd", name: "Dle", arity: 3, kind: "class",
      location: { lineNumber: 556, columnNumber: 32_179 },
      endLocation: { lineNumber: 556, columnNumber: 32_212 }, parent: "baseClass" },
    baseClass: { start: 1_810_958, end: 1_811_787, bytes: 829,
      sha256: "707857a4dd4f6227e87767f177ae051ae8a26095e341c2eb22bcd8e67f441e96", name: "s4e", arity: 3, kind: "class",
      location: { lineNumber: 556, columnNumber: 31_329 },
      endLocation: { lineNumber: 556, columnNumber: 31_537 }, parent: "native" },
    pageClass: { start: 1_813_918, end: 1_814_556, bytes: 638,
      sha256: "f260cedc5c7df7c79b48507adcf2d3af7d6a4dc85d795af38133499f72be643e", name: "Nle", arity: 2, kind: "class",
      location: { lineNumber: 556, columnNumber: 34_301 },
      endLocation: { lineNumber: 556, columnNumber: 34_329 }, parent: "commonClass" },
    consistencyClass: { start: 1_475_747, end: 1_497_012, bytes: 21_265,
      sha256: "aad89b6971b7d947710e63314643faacd4a17177fae8302835f326de24db7039", name: "Oke", arity: 1, kind: "class",
      location: { lineNumber: 536, columnNumber: 21_587 },
      endLocation: { lineNumber: 536, columnNumber: 22_049 }, parent: "consistencyParentClass" },
    consistencyParentClass: { start: 1_449_346, end: 1_451_193, bytes: 1847,
      sha256: "7335df5c217cca301d797b64d565a1fd1dac03621b3782c6459b14e62d8ae7ca", name: "jO", arity: 1, kind: "class",
      location: { lineNumber: 534, columnNumber: 2717 },
      endLocation: { lineNumber: 534, columnNumber: 2882 }, parent: null },
    groupUpload: { start: 3_967_011, end: 3_967_133, bytes: 122,
      sha256: "0e1ef263696fa44d0e52d8603e7389f13a086fd62da9ce0ec5982f8e17690045", name: "uploadTo", arity: 1, kind: "method",
      location: { lineNumber: 4098, columnNumber: 7731 },
      endLocation: { lineNumber: 4098, columnNumber: 7845 }, parent: "native" },
    attributeUpload: { start: 6_320_928, end: 6_321_006, bytes: 78,
      sha256: "a88d4d6f5fb43a55feccd9a32ed04b396b24b29c05fcf8fe641564354bec7efb", name: "uploadTo", arity: 1, kind: "method",
      location: { lineNumber: 4331, columnNumber: 116_718 },
      endLocation: { lineNumber: 4331, columnNumber: 116_788 }, parent: "native" },
    textUpload: { start: 4_332_293, end: 4_332_371, bytes: 78,
      sha256: "ec81fb812c073ad6b09ed843e561c5133c168d2dce5120e770168b6b68a578a1", name: "uploadTo", arity: 1, kind: "method",
      location: { lineNumber: 4105, columnNumber: 323_684 },
      endLocation: { lineNumber: 4105, columnNumber: 323_754 }, parent: "native" },
    lineChecker: { start: 4_652_454, end: 4_652_604, bytes: 150,
      sha256: "2eaacb6606cca1cbe6ce06b65b01027e067edb632148c1cfa2a0c52df831f24a", name: "netGroupLine", arity: 1, kind: "method",
      location: { lineNumber: 4112, columnNumber: 113_490 },
      endLocation: { lineNumber: 4112, columnNumber: 113_628 }, parent: "native" },
    uploadCanvas: { start: 1_811_949, end: 1_812_029, bytes: 80,
      sha256: "e1c05e0547be80545c9dd54e796aac13cbf1c61a1a3bbd52669ba85e93437dfe", name: "uploadCanvas", arity: 1, kind: "method",
      location: { lineNumber: 556, columnNumber: 32_315 },
      endLocation: { lineNumber: 556, columnNumber: 32_383 }, parent: "native" },
    encodeLine: { start: 1_814_414, end: 1_814_485, bytes: 71,
      sha256: "e0be6970f6e6094330e5cce04256406d2edacc27a8ca59e2b9e624ebcf97ffc8", name: "uploadLine", arity: 2, kind: "method",
      location: { lineNumber: 556, columnNumber: 34_778 },
      endLocation: { lineNumber: 556, columnNumber: 34_839 }, parent: "native" },
    getData: { start: 1_811_441, end: 1_811_518, bytes: 77,
      sha256: "4c61da11199a9424b4a5207a6427c9847c5fd43bd715f48164ba404a752ae186", name: "getDataStr", arity: 0, kind: "method",
      location: { lineNumber: 556, columnNumber: 31_805 },
      endLocation: { lineNumber: 556, columnNumber: 31_872 }, parent: "native" },
    clearData: { start: 1_811_518, end: 1_811_571, bytes: 53,
      sha256: "aeb931d55f7c051ea99d04dc7fe351448bed9acfd655668519c3420b1fe4f48d", name: "removeDataStr", arity: 0, kind: "method",
      location: { lineNumber: 556, columnNumber: 31_885 },
      endLocation: { lineNumber: 556, columnNumber: 31_925 }, parent: "native" },
  },
] as const satisfies readonly [
  Readonly<Record<CurrentSchematicWireEncoderRole, CurrentSchematicWireEncoderSourceRow>>,
  Readonly<Record<CurrentSchematicWireEncoderRole, CurrentSchematicWireEncoderSourceRow>>,
]);

export const currentSchematicWireEncoderScriptId = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
export interface CurrentSchematicWireEncoderSourceCheckpoint {
  readonly schema: "private.schematic-wire-encoder-source-checkpoint.v1";
  readonly variant: 0 | 1;
  readonly scriptId: string;
  readonly sourceQualified: true;
  readonly originalNativeOwnerJoined: false;
  readonly executionAuthorized: false;
}

const checkpoints = new WeakSet<CurrentSchematicWireEncoderSourceCheckpoint>();
function need(value: boolean): asserts value {
  if (!value) { throw new Error("WIRE_ENCODER_SOURCE"); }
}
export function currentSchematicWireEncoderSourceDigest(source: string): string {
  return createHash("sha256").update(source).digest("hex");
}
export function currentSchematicWireEncoderSourceRow(
  variant: 0 | 1, role: CurrentSchematicWireEncoderRole,
): CurrentSchematicWireEncoderSourceRow {
  need((variant === 0 || variant === 1) && !Object.is(variant, -0) && Object.hasOwn(rows[variant], role));
  return rows[variant][role];
}

/** Whole source first, then every selected complete body. The chosen script ID
 * must come from the correlated Debugger.getScriptSource request at its owner. */
export function qualifyCurrentSchematicWireEncoderSource(
  scriptId: string, input: unknown,
): CurrentSchematicWireEncoderSourceCheckpoint {
  currentSchematicWireEncoderScriptId.parse(scriptId);
  const { variant, scriptSource } = captureQualifiedCurrentSchematicWireCompletionSource(input);
  const expectedRows: Readonly<Record<CurrentSchematicWireEncoderRole, CurrentSchematicWireEncoderSourceRow>> = rows[variant];
  for (const row of Object.values(expectedRows)) {
    const text = scriptSource.slice(row.start, row.end);
    need(Buffer.byteLength(text) === row.bytes && currentSchematicWireEncoderSourceDigest(text) === row.sha256);
  }
  const checkpoint: CurrentSchematicWireEncoderSourceCheckpoint = Object.freeze({
    schema: "private.schematic-wire-encoder-source-checkpoint.v1", variant, scriptId,
    sourceQualified: true, originalNativeOwnerJoined: false, executionAuthorized: false,
  });
  checkpoints.add(checkpoint);
  return checkpoint;
}
export function requireCurrentSchematicWireEncoderSourceCheckpoint(
  input: CurrentSchematicWireEncoderSourceCheckpoint,
): void {
  need(checkpoints.has(input));
}
