/** Fixed209 lower-ticket structure update sites. Source identity grants no
 * running frame, native purpose, request publication or SQL completion. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { qualifyCurrentFootprintCopyMainBackendSource, requireCurrentFootprintCopyMainBackendSource } from "./current-footprint-copy-main-backend-source.ts";

export const CURRENT_PROJECT_STRUCTURE_MAIN_FUNCTIONS = freezeDeep({
  "service": {
    "start": 2_607_932,
    "end": 2_608_036,
    "bytes": 104,
    "sha256": "7677a32225131bd4dd55cd763ca3234254a2477e44581dbb5ab53273be2b0a90",
    "functionName": "updateStructure",
    "functionLine": 8573,
    "functionColumn": 5500
  },
  "select": {
    "start": 2_608_087,
    "end": 2_608_255,
    "bytes": 168,
    "sha256": "1520a9efcdce160353a8dd816a4ed66dfb80aabe6a0178d5d1ddcb7385ec9fa8",
    "functionName": "hC",
    "functionLine": 8573,
    "functionColumn": 5651
  },
  "update": {
    "start": 2_608_471,
    "end": 2_608_772,
    "bytes": 301,
    "sha256": "b6f2dcfe9f862d209ad560731d212e8a9c1d17cb4491ec00f9f2bae14c7496f0",
    "functionName": "BB",
    "functionLine": 8573,
    "functionColumn": 6035
  },
  "controller": {
    "start": 2_609_218,
    "end": 2_609_617,
    "bytes": 399,
    "sha256": "3f8d621cfe5b696f0c5d46e54172e33c9d507f2955255f9d00892155d1ad2843",
    "functionName": "update",
    "functionLine": 8573,
    "functionColumn": 6777
  },
  "queryOne": {
    "start": 1_301_585,
    "end": 1_301_710,
    "bytes": 125,
    "sha256": "325085748d09c602f92ed54a5cbef9496780bb6a3ce1a0dcf130042841ff95d2",
    "functionName": "queryOne",
    "functionLine": 1025,
    "functionColumn": 2771
  },
  "exec": {
    "start": 1_301_798,
    "end": 1_302_020,
    "bytes": 222,
    "sha256": "e4da44ce9368c2230b6b5c8a29d19e2ee016b83762064793ebc82622ebb57a12",
    "functionName": "exec",
    "functionLine": 1025,
    "functionColumn": 2980
  },
  "driver": {
    "start": 1_375_968,
    "end": 1_376_289,
    "bytes": 321,
    "sha256": "a3b4db4adc53d6d94632b1148fababfc314eba0095377211a06d79d8c6134974",
    "functionName": "",
    "functionLine": 1164,
    "functionColumn": 2439
  }
} as const);
export const CURRENT_PROJECT_STRUCTURE_MAIN_SITES = freezeDeep({
  "driver": {
    "role": "driver",
    "lineNumber": 1164,
    "columnNumber": 2453
  },
  "context": {
    "role": "driver",
    "lineNumber": 1164,
    "columnNumber": 2540
  },
  "controller": {
    "role": "controller",
    "lineNumber": 8573,
    "columnNumber": 7096
  },
  "query-one": {
    "role": "queryOne",
    "lineNumber": 1025,
    "columnNumber": 2851
  },
  "selected": {
    "role": "service",
    "lineNumber": 8573,
    "columnNumber": 5530
  },
  "update": {
    "role": "update",
    "lineNumber": 8573,
    "columnNumber": 6192
  },
  "exec": {
    "role": "exec",
    "lineNumber": 1025,
    "columnNumber": 3166
  },
  "update-return": {
    "role": "update",
    "lineNumber": 8573,
    "columnNumber": 6318
  },
  "service-return": {
    "role": "service",
    "lineNumber": 8573,
    "columnNumber": 5582
  },
  "controller-return": {
    "role": "controller",
    "lineNumber": 8573,
    "columnNumber": 7163
  },
  "response": {
    "role": "driver",
    "lineNumber": 1164,
    "columnNumber": 2587
  }
} as const);
export const CURRENT_PROJECT_STRUCTURE_MAIN_ORDER = Object.freeze(["driver", "context", "controller", "query-one", "selected", "update", "exec", "update-return", "service-return", "controller-return", "response"] as const);
export type CurrentProjectStructureMainStage = typeof CURRENT_PROJECT_STRUCTURE_MAIN_ORDER[number];
export interface CurrentProjectStructureMainSource {
  readonly profile: "private.current-project-structure-main-source.v1";
  readonly embeddedV8Validated: false;
  readonly executionAuthorized: false;
}
const issued = new WeakMap<CurrentProjectStructureMainSource, ReturnType<typeof qualifyCurrentFootprintCopyMainBackendSource>>();
/** Preserve the whole original app hash and each fixed function span before
 * returning an opaque source comparison; this does not issue runtime custody. */
export function qualifyCurrentProjectStructureMainSource(input: unknown): CurrentProjectStructureMainSource {
  const original = qualifyCurrentFootprintCopyMainBackendSource(input);
  if (typeof input !== "string") { throw new TypeError("PROJECT_STRUCTURE_MAIN_SOURCE"); }
  for (const span of Object.values(CURRENT_PROJECT_STRUCTURE_MAIN_FUNCTIONS)) {
    const text = input.slice(span.start, span.end);
    if (Buffer.byteLength(text) !== span.bytes || createHash("sha256").update(text).digest("hex") !== span.sha256) {
      throw new Error("PROJECT_STRUCTURE_MAIN_SPAN");
    }
  }
  const token = Object.freeze({ profile: "private.current-project-structure-main-source.v1" as const,
    embeddedV8Validated: false as const, executionAuthorized: false as const });
  issued.set(token, original); return token;
}
/** Serialized digests cannot substitute for the original source token. */
export function requireCurrentProjectStructureMainSource(input: CurrentProjectStructureMainSource): void {
  const original = issued.get(input);
  if (original === undefined) { throw new Error("PROJECT_STRUCTURE_MAIN_ORIGINAL_SOURCE"); }
  requireCurrentFootprintCopyMainBackendSource(original);
}
