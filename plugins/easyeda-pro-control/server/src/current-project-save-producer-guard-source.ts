/** Fixed refusal points before original producer effects. Arming these sites
 * grants no producer resume, cache/write completion or persistence authority. */
import {createHash} from "node:crypto";
import {CURRENT_PCB_209_WORKER_STARTUP_SOURCE as SOURCE} from "./current-pcb-209-worker-startup-profile.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_PROJECT_SAVE_PRODUCER_GUARD_SITES=freezeDeep({
  "historySeed": {
    "lineNumber": 108,
    "columnNumber": 100_932,
    "offset": 1_802_428
  },
  "historyFlow": {
    "lineNumber": 108,
    "columnNumber": 122_604,
    "offset": 1_824_100
  },
  "historyUpload": {
    "lineNumber": 108,
    "columnNumber": 141_685,
    "offset": 1_843_181
  },
  "historyCloud": {
    "lineNumber": 110,
    "columnNumber": 9344,
    "offset": 2_023_554
  },
  "historyConverted": {
    "lineNumber": 110,
    "columnNumber": 109_860,
    "offset": 2_124_070
  },
  "localIngress": {
    "lineNumber": 110,
    "columnNumber": 17_028,
    "offset": 2_031_238
  },
  "cloudIngress": {
    "lineNumber": 110,
    "columnNumber": 8677,
    "offset": 2_022_887
  },
  "bufferIngress": {
    "lineNumber": 110,
    "columnNumber": 15_525,
    "offset": 2_029_735
  },
  "pendingCache": {
    "lineNumber": 110,
    "columnNumber": 7789,
    "offset": 2_021_999
  },
  "pendingLocal": {
    "lineNumber": 110,
    "columnNumber": 8079,
    "offset": 2_022_289
  }
});
export const CURRENT_PROJECT_SAVE_PRODUCER_GUARD_METHODS=freezeDeep([
  {
    "start": 1_802_345,
    "end": 1_802_609,
    "bytes": 264,
    "sha256": "e218343323c35e0d20c3470bf8da35b30930348c1de3c721b8cb4631df21a584"
  },
  {
    "start": 1_822_850,
    "end": 1_824_938,
    "bytes": 2088,
    "sha256": "b1426693d15b62f7d944a6386286157ed73bc24fad3c66fb1e0e8f6dbe0f0009"
  },
  {
    "start": 1_843_024,
    "end": 1_843_616,
    "bytes": 592,
    "sha256": "f8e8cd8b6299ecdb4055b19f1cb77d6b4123df32937535bd8a8e08e0af2d9bf6"
  },
  {
    "start": 2_021_757,
    "end": 2_022_380,
    "bytes": 623,
    "sha256": "624d97b03cbcb2747b400ab24d603ddd6ae3760ea41b0233b8dd61c857973159"
  },
  {
    "start": 2_022_867,
    "end": 2_024_986,
    "bytes": 2119,
    "sha256": "7175c3c38cab0dc6026c461488a90b5c08ca8e235abff4d0a8ad469174aa4964"
  },
  {
    "start": 2_029_672,
    "end": 2_030_081,
    "bytes": 409,
    "sha256": "ab5308d9747401e42204794c3a3d8eb7dfa99af4a34bcb90481c7761752f83a7"
  },
  {
    "start": 2_031_202,
    "end": 2_031_622,
    "bytes": 420,
    "sha256": "5add70c985bd271d5683fc48abd3d69ed0627cb54a9638acc73a164e583b5ea4"
  },
  {
    "start": 2_123_569,
    "end": 2_124_630,
    "bytes": 1061,
    "sha256": "c7c2baa12c0f5389928f0a7566bea96febc4274fadc1974a6382a4b1228cf3a4"
  }
]);
export type CurrentProjectSaveProducerGuardRole=keyof typeof CURRENT_PROJECT_SAVE_PRODUCER_GUARD_SITES;
export function qualifyCurrentProjectSaveProducerGuardSource(input:unknown):void {
 if(typeof input!=="string"||!input.isWellFormed()||Buffer.byteLength(input)!==SOURCE.bytes||createHash("sha256").update(input).digest("hex")!==SOURCE.sha256){throw new Error("PROJECT_SAVE_PRODUCER_GUARD_SOURCE");}
 const lines=input.split("\n");for(const site of Object.values(CURRENT_PROJECT_SAVE_PRODUCER_GUARD_SITES)){const offset=lines.slice(0,site.lineNumber).reduce((sum,line)=>sum+line.length+1,0)+site.columnNumber;if(offset!==site.offset){throw new Error("PROJECT_SAVE_PRODUCER_GUARD_LOCATION");}}
 for(const method of CURRENT_PROJECT_SAVE_PRODUCER_GUARD_METHODS){const text=input.slice(method.start,method.end);if(Buffer.byteLength(text)!==method.bytes||createHash("sha256").update(text).digest("hex")!==method.sha256){throw new Error("PROJECT_SAVE_PRODUCER_GUARD_METHOD");}}
 if(input.split("projectHistory.set(").length!==6){throw new Error("PROJECT_SAVE_PRODUCER_HISTORY_ROOT_ROSTER");}
}
