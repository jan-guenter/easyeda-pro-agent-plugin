/** Unmounted saved-copy variant of the maintained cache-only source reader.
 * Only its actor shapes differ: raw replay has the backend actor triple;
 * the new footprint's chunk-cache replay has its destination UUID alone.
 * The saved projection separately compares both complete content candidates.
 */
import { CURRENT_FOOTPRINT_CACHE_SOURCE_READ_FUNCTION } from "./current-footprint-cache-source-read.ts";

const before = 'const result=copy(v,0);if(typeof result.uuid!=="string"||!/^[a-f0-9]{32}$/.test(result.uuid)||typeof result.username!=="string"||typeof result.nickname!=="string")bad();';
const after = 'const result=copy(v,0),keys=Reflect.ownKeys(result);if(!(keys.length===1&&keys[0]==="uuid"&&result.uuid===footprintUuid&&typeof result.uuid==="string"&&/^[a-f0-9]{16}$/.exec(result.uuid)?.[0]===result.uuid||keys.length===3&&keys.every(k=>["uuid","username","nickname"].includes(k))&&typeof result.uuid==="string"&&/^[a-f0-9]{32}$/.exec(result.uuid)?.[0]===result.uuid&&typeof result.username==="string"&&typeof result.nickname==="string"))bad();';
const parts = CURRENT_FOOTPRINT_CACHE_SOURCE_READ_FUNCTION.split(before);
if (parts.length !== 2) { throw new Error("FOOTPRINT_COPY_V2_SAVED_CACHE_TEMPLATE"); }

/** The native owner must select this exact source-qualified program under its
 * own fixed vocabulary. No current native owner dispatches this variant. */
export const CURRENT_FOOTPRINT_COPY_V2_SAVED_CACHE_READ_FUNCTION = parts.join(after);
