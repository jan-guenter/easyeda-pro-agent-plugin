/** Fixed passive row snapshots under the original same-UI native receipt.
 * Native constructor metadata and original paused-frame custody stay with Core. */
import { CURRENT_NATIVE_OWN_DATA_CHECK } from "./current-native-own-data-intrinsics.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const slots = `[${Array.from({ length: 129 }, () => "null").join(",")}]`;
const capture = `function(row,prototype,constructor,kind){"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}
if((kind!=="Object"&&kind!=="Array")||row===null||typeof row!=="object"||proto(row)!==prototype||typeof constructor!=="function")bad();
const pc=get(prototype,"constructor"),cp=get(constructor,"prototype"),cn=get(constructor,"name"),cl=get(constructor,"length");
if(!pc||!has(pc,"value")||pc.value!==constructor||!cp||!has(cp,"value")||cp.value!==prototype||cp.writable||cp.enumerable||cp.configurable||!cn||!has(cn,"value")||cn.value!==kind||!cl||!has(cl,"value")||cl.value!==1||isArray(row)!==(kind==="Array"))bad();
const keys=names(row),size=keys.length,fields=${slots};if(size<1||size>129||symbols(row).length!==0)bad();for(let j=0;j<size;j++){const key=keys[j],d=get(row,key);if(typeof key!=="string"||!d||!has(d,"value")||has(d,"get")||has(d,"set"))bad();fields[j]=[key,d];}fields.length=size;
const eq=(a,b)=>(a===b&&(a!==0||1/a===1/b))||(a!==a&&b!==b);
const guard=()=>{if(proto(row)!==prototype||get(prototype,"constructor").value!==constructor||get(constructor,"prototype").value!==prototype||symbols(row).length!==0)bad();const next=names(row);if(next.length!==size)bad();for(let j=0;j<size;j++){const old=fields[j],key=old[0],before=old[1],after=get(row,key);if(next[j]!==key||!after)bad();for(let k=0;k<6;k++){const part=descriptorKeys[k];if(has(before,part)!==has(after,part)||has(before,part)&&!eq(before[part],after[part]))bad();}}return true;};return[row,prototype,constructor,guard];}`;
const reprove = `function(snapshot,row){"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}dense(snapshot,4);if(value(snapshot,"0")!==row||typeof value(snapshot,"3")!=="function"||value(snapshot,"3")()!==true)bad();return true;}`;
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_PROGRAMS_V2 = freezeDeep({ capture, reprove } as const);
