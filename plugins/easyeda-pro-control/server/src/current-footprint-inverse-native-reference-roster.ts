/** One native inverse reference roster. These immutable routes/payloads match
 * original source syntax and grant neither calls nor reference completion. */
import { createHash } from "node:crypto";
import { CURRENT_FOOTPRINT_INVERSE_REFERENCE_UI_ROUTES as SOURCE } from "./current-footprint-inverse-reference-ui-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_SENDER_PROGRAMS as BEFORE } from "./current-footprint-inverse-native-get-task-sender-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_ORDER = Object.freeze(["pcb-all", "schematic", "footprint-derived", "device-all"] as const);
export type CurrentFootprintInverseNativeReferenceKind = typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_ORDER[number];
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_ROSTER = freezeDeep({
  "pcb-all": { topic: "/PrjDB/pcb/getAllArrDatas", argument: "[projectId]", entry: 'dense(args,1);if(value(args,"0")!==value(prepared,"4"))bad();', workerTopic: "/mgr/projectWorker/pcb/getAllArrData", managerBody: "managerPcbCallback" },
  schematic: { topic: "getDeviceByUuid", argument: '{uuid:id,type:"Footprint"}', entry: 'if(proto(args)!==objectProto||count(args)!==2||data(args,"uuid")!==value(prepared,"3")||data(args,"type")!=="Footprint")bad();', workerTopic: null, managerBody: null },
  "footprint-derived": { topic: "/PrjDB/footprint/getKeysBySource", argument: "[id,projectId]", entry: 'dense(args,2);if(value(args,"0")!==value(prepared,"3")||value(args,"1")!==value(prepared,"4"))bad();', workerTopic: "/mgr/projectWorker/footprint/getKeysBySource", managerBody: "managerFootprintCallback" },
  "device-all": { topic: "/PrjDB/device/getAllArrDatas", argument: "[projectId]", entry: 'dense(args,1);if(value(args,"0")!==value(prepared,"4"))bad();', workerTopic: "/mgr/projectWorker/device/getAllArrData", managerBody: "managerDeviceCallback" },
} as const);
for (const kind of CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_ORDER) {
  if (CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_ROSTER[kind].topic !== SOURCE[kind].topic) { throw new Error("INVERSE_NATIVE_REFERENCE_ORIGINAL_TOPIC"); }
}
if (Object.entries(BEFORE).length !== 12 || createHash("sha256").update(JSON.stringify(Object.entries(BEFORE))).digest("hex") !== "b31a042b8f1cdd6d7980d99e33d7b045d2defe327ab4cdaa0d590481bbe5a7ff") { throw new Error("INVERSE_NATIVE_REFERENCE_SENDER_SOURCE"); }
/** Replace only one reviewed operation after its exact source occurrence count. */
function replace(source: string, from: string, to: string, count: number): string {
  if (source.split(from).length !== count + 1) { throw new Error("INVERSE_NATIVE_REFERENCE_SENDER_CENSUS"); }
  return source.replaceAll(from, to);
}
/** Derive fixed syntax for a declared original query. No arbitrary endpoint,
 * payload, program or continuation can be supplied by an external caller. */
function programs(kind: CurrentFootprintInverseNativeReferenceKind): Readonly<typeof BEFORE> {
  const row = CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_ROSTER[kind];
  const fixed = (role: keyof typeof BEFORE, count: number): string => replace(BEFORE[role], "/PrjDB/footprint/getData", row.topic, count);
  const prepare = replace(fixed("prepare", 3), "args=[id,projectId]", `args=${  row.argument}`, 1);
  const entry = replace(fixed("entry", 1), 'dense(args,2);if(value(args,"0")!==value(prepared,"3")||value(args,"1")!==value(prepared,"4"))bad();', row.entry, 1);
  return Object.freeze({ roots: fixed("roots", 0), context: fixed("context", 0), bus: fixed("bus", 0), methods: fixed("methods", 0), queue: fixed("queue", 1), task: fixed("task", 0), members: fixed("members", 0), taskMethods: fixed("taskMethods", 0), prepare, before: fixed("before", 0), invokeOnce: fixed("invokeOnce", 0), entry });
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_SENDER_PROGRAMS = freezeDeep({
  "pcb-all": programs("pcb-all"), schematic: programs("schematic"), "footprint-derived": programs("footprint-derived"), "device-all": programs("device-all"),
});
