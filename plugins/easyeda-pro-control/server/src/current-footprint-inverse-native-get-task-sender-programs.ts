/** Fixed native-task GET sender. It uses the original MessageBus directly,
 * omits public UI-row/toast parity and never falls back from a spent UI call. */
import { createHash } from "node:crypto";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SENDER_PROGRAMS as BEFORE } from "./current-footprint-inverse-native-delete-sender-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const rows = Object.entries(BEFORE);
if (rows.length !== 12 || createHash("sha256").update(JSON.stringify(rows)).digest("hex") !== "d0d281d7bec503240b37cfcf29e37b97255d6a0ce0bfb653dcfcef61b22da7ac") { throw new Error("INVERSE_NATIVE_GET_TASK_FIXED_SOURCE"); }
/** Replace only the one reviewed endpoint, with an exact source-table digest
 * and per-program census. Caller data cannot choose a topic or source body. */
function fixed(role: keyof typeof BEFORE, count: number): string { const source = BEFORE[role]; if (source.split("/PrjDB/footprint/delete").length !== count + 1) { throw new Error("INVERSE_NATIVE_GET_TASK_TOPIC_CENSUS"); } return source.replaceAll("/PrjDB/footprint/delete", "/PrjDB/footprint/getData"); }
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_SENDER_PROGRAMS = freezeDeep({ roots: fixed("roots", 0), context: fixed("context", 0), bus: fixed("bus", 0), methods: fixed("methods", 0), queue: fixed("queue", 1), task: fixed("task", 0), members: fixed("members", 0), taskMethods: fixed("taskMethods", 0), prepare: fixed("prepare", 3), before: fixed("before", 0), invokeOnce: fixed("invokeOnce", 0), entry: fixed("entry", 1) } as const);
export { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SENDER_ENTRY as CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_SENDER_ENTRY } from "./current-footprint-inverse-native-delete-sender-programs.ts";
