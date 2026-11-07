/** Readonly precondition for the source-pinned second-start assignment.
 * Existing raw descriptors and all shared guards remain unchanged. */
export const CURRENT_SCHEMATIC_RELEVANCE_BUS_GROUP_PREFIX_CONSTRUCTOR = String.raw`function(native){"use strict";const d=native[0](native[15],"constructor");if(!d||!native[4](d,"value")||typeof d.value!=="function")throw "SCH209_BUS_GROUP_OBJECT";return[d.value];}`;
export const CURRENT_SCHEMATIC_RELEVANCE_BUS_GROUP_PREFIX_EXTENSIBILITY = String.raw`function(native){"use strict";const get=native[0],has=native[4],p=get(this,"prototype"),d=get(this,"isExtensible");if(!p||!has(p,"value")||p.value!==native[15]||!d||!has(d,"value")||typeof d.value!=="function")throw "SCH209_BUS_GROUP_EXTENSIBILITY";return[d.value];}`;
/** Actual original object and every inspected prototype are already qualified
 * non-Proxy references. A missing field must be creatable without a setter. */
export const CURRENT_SCHEMATIC_RELEVANCE_BUS_GROUP_PREFIX_IDLE = String.raw`function(native,refs,qualified,objectConstructor,isExtensible){"use strict";
const get=native[0],has=native[4],proto=native[2],bad=()=>{throw "SCH209_BUS_GROUP_IDLE";},own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;};
if(this!==own(refs,10)||!native[7](qualified)||qualified.length<20||qualified.length>384)bad();const known=o=>{for(let i=0;i<qualified.length;i++)if(own(qualified,""+i)===o)return;bad();};known(objectConstructor);if(own(objectConstructor,"prototype")!==native[15]||own(objectConstructor,"isExtensible")!==isExtensible||typeof isExtensible!=="function")bad();
const before=get(this,"changedBusGroupIds");if(before&&(!has(before,"value")||before.value!==null||before.writable!==true||before.enumerable!==true||before.configurable!==true))bad();
let current=this;for(let depth=0;current!==null&&depth<12;depth++){known(current);const d=get(current,"changedBusGroupIds");if(d&&(!has(d,"value")||d.writable!==true))bad();current=proto(current);}if(current!==null||!before&&native[6](isExtensible,undefined,[this])!==true)bad();return true;}`;
