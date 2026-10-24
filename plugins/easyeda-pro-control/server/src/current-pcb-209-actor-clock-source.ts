/** Exact 209 actor/clock source closure only. Complete source text is supplied
 * by a private owner; this module observes no runtime, native Date intrinsic,
 * responder object, file lease or future Save. Never interpret a source digest
 * or this issuer's private token as reconstructed process ownership. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { canonicalJson } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE = freezeDeep({
  "ui": {
    "relativePath": "pro-ui/3.2.198.2800f583/js/ui.js",
    "bytes": 17_468_192,
    "sha256": "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6",
    "spans": {
      "loginUser": {
        "start": 16_968_890,
        "end": 16_969_078,
        "bytes": 188,
        "sha256": "82f0c483741bca76baf8969a8cfee818e3a04d5f428f6615eb62a7c7e0a68f48"
      }
    }
  },
  "worker": {
    "relativePath": "pro-mgr/3.2.185.bf63a159/js/project-worker.js",
    "bytes": 2_181_308,
    "sha256": "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046",
    "spans": {
      "subscribe": {
        "start": 2_115_324,
        "end": 2_115_567,
        "bytes": 243,
        "sha256": "03caca33f54106c064c07ef2a1ee7199b5e803beda2884e8b1da2ba8e24a37d3"
      },
      "saveCanvas": {
        "start": 2_144_996,
        "end": 2_145_566,
        "bytes": 570,
        "sha256": "689bf1d38385331693dcfb9b28887ce2a46ada8b077495616f0e703d0a802178"
      },
      "rpcCall": {
        "start": 8711,
        "end": 8984,
        "bytes": 273,
        "sha256": "1721483546085355a236ebc6ac113012cfafca7ba4a0853af18f3d45848a3d9c"
      }
    }
  },
  "wsService": {
    "relativePath": "pro-mgr/3.2.185.bf63a159/js/ws-service.js",
    "bytes": 855_142,
    "sha256": "7adb29ba4ea0bee9729caadc01c154d9299b1fc42e12f1c3f46e4343b5040e00",
    "spans": {
      "serverTimeService": {
        "start": 851_566,
        "end": 851_624,
        "bytes": 58,
        "sha256": "789a4d12b6c4a8eddd12246f67b572e2d4d7e6613242c085b5d8355acc454fb5"
      },
      "serverOffset": {
        "start": 853_123,
        "end": 853_152,
        "bytes": 29,
        "sha256": "c21f39c8f5a9f094809f03f2e841525f7bc92bf6eccfd8c691a84c9d980ed83f"
      },
      "serverOffsetInitial": {
        "start": 851_550,
        "end": 851_554,
        "bytes": 4,
        "sha256": "12d330e6a796f724a39e2b1e45d9c225d398b1a62b87abca92825b914ece1f07"
      }
    }
  },
  "backend": {
    "relativePath": "../app.js",
    "bytes": 2_657_192,
    "sha256": "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c",
    "spans": {
      "backendHead": {
        "start": 2_602_357,
        "end": 2_602_467,
        "bytes": 110,
        "sha256": "f88eeb5a380c3e50c0566db1eeadc4d41b8ccc8e443d9a590284bd77e778f12b"
      },
      "backendActor": {
        "start": 2_602_467,
        "end": 2_602_820,
        "bytes": 353,
        "sha256": "4f35768c1e8fd199dcbd67f44b3bb841215080e9f80e384b1712e01995bd7d2d"
      }
    }
  },
  "pcb": {
    "relativePath": "pro-pcb/3.2.195.6b67774e/js/pcb.js",
    "bytes": 10_991_441,
    "sha256": "a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b",
    "spans": {}
  }
} as const);
export type CurrentPcb209ActorClockSourceKind = keyof typeof CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE;
export type CurrentPcb209ActorClockSources = Readonly<Record<CurrentPcb209ActorClockSourceKind, string>>;
const kinds = ["ui", "worker", "wsService", "backend", "pcb"] as const;
const limits = Object.freeze({ suppliedSourceBytesOnly: true, nativeSourceContextsOwned: false,
  responderOwnershipVerified: false, nativeIntrinsicsVerified: false, clockProvenanceVerified: false,
  futureSaveClockVerified: false, compatibilityAdmitted: false, executionAuthorized: false, saveAuthorized: false } as const);
export interface CurrentPcb209ActorClockSourceQualification extends Readonly<typeof limits> {
  readonly profile: "private.pcb209-actor-clock-source.v1";
  readonly application: "3.2.209.8a704eab";
  readonly sourceSha256: Readonly<Record<CurrentPcb209ActorClockSourceKind, string>>;
  readonly sourceClosureSha256: string;
}
const issued = new WeakSet<CurrentPcb209ActorClockSourceQualification>();
function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB209_ACTOR_CLOCK_SOURCE"); } }
/** Complete immutable strings and all UTF-16 slices must match. This reads no
 * path or app API, and accepts no caller-selected profile or digest. */
export function qualifyCurrentPcb209ActorClockSources(input: CurrentPcb209ActorClockSources): CurrentPcb209ActorClockSourceQualification {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null));
  const keys = Reflect.ownKeys(input);
  need(keys.length === kinds.length && keys.every(key => kinds.some(kind => kind === key)));
  const sourceSha256 = { ui: "", worker: "", wsService: "", backend: "", pcb: "" };
  for (const kind of kinds) {
    const descriptor = Object.getOwnPropertyDescriptor(input, kind), profile = CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE[kind];
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"));
    const source: unknown = descriptor.value;
    need(typeof source === "string" && source.length <= profile.bytes && source.isWellFormed() &&
      Buffer.byteLength(source) === profile.bytes && digest(source) === profile.sha256);
    const spans: Readonly<Record<string, Readonly<{ start: number; end: number; bytes: number; sha256: string }>>> = profile.spans;
    for (const span of Object.values(spans)) {
      const text = source.slice(span.start, span.end);
      need(Buffer.byteLength(text) === span.bytes && digest(text) === span.sha256);
    }
    sourceSha256[kind] = profile.sha256;
  }
  const qualification = freezeDeep({ profile: "private.pcb209-actor-clock-source.v1" as const,
    application: "3.2.209.8a704eab" as const, sourceSha256,
    sourceClosureSha256: digest(canonicalJson(sourceSha256)), ...limits });
  issued.add(qualification); return qualification;
}
/** Reject copied/forged source reports. This is issuer identity only; it grants
 * no runtime ownership and cannot replace original session/context checks. */
export function requireCurrentPcb209ActorClockSourceQualification(value: CurrentPcb209ActorClockSourceQualification): void {
  need(issued.has(value));
}
