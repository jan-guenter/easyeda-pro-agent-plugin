/** Fixed original callers and final published-AST joins for the three RPCs.
 * Caller PCs and these comparisons cannot authenticate a native event. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_ORIGIN_FRAMES = Object.freeze({
  closing: "[i,e,a,C]", language: "[i,C]", titles: "[this,C,t]",
} as const);
const prelude = String.raw`"use strict";const get=native[0],has=native[4],bad=()=>{throw "WIRE_RPC_ORIGIN";},own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;};
const current=entry=>{const b=entry[1],state=entry[2],before=entry[3],page=entry[4],host=entry[5];if(own(holder,0)!==b||own(holder,1)!==state||own(state,"owner")!==holder||own(state,"before")!==before||own(state,"failed")!==false||own(state,"modifyAttempted")!==true||typeof own(state,"modifyAcknowledged")!=="boolean"||own(state,"saveAttempted")!==false||own(b,"page")!==page||own(b,"host")!==host||own(b,"metadata")!==entry[6]||own(b,"line")!==entry[7]||own(b,"group")!==entry[8]||own(host,"currentProject")!==entry[6]||own(host,"messageBus")!==entry[9]||own(before,"line")!==entry[7]||own(before,"wire")!==entry[8])bad();return page;};`;
export const CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_ORIGIN_PROGRAMS = freezeDeep({
 closing: `function(native,holder,entry){${prelude}const page=current(entry);if(own(this,"length")!==4||this[0]!==page||this[1]!==own(page,"uuid")||this[3]!==entry[5]||entry[10]!=="isClosing")bad();return[entry,this[0],this[1],this[2],this[3]];}`,
 language: `function(native,holder,entry){${prelude}current(entry);if(own(this,"length")!==2||this[1]!==entry[5]||entry[10]!=="i18n")bad();return[entry,this[0],this[1]];}`,
 titles: `function(native,holder,entry){${prelude}const page=current(entry);if(own(this,"length")!==3||this[1]!==entry[5]||this[2]!==own(page,"uuid")||own(this[0],"shapeManager")!==own(page,"shapeManager")||entry[10]!=="getSheetAllTitle")bad();return[entry,this[0],this[1],this[2]];}`,
 join: `function(native,holder,language,titles,context,sheet){${prelude}const closing=this,page=current(closing[0]);current(language[0]);current(titles[0]);const b=closing[0][1],state=closing[0][2];if(context[0]!==holder||context[1]!==b||context[2]!==state||context[4]!==page||context[6]!==closing[0][5]||context[7]!==closing[0][6]||closing[1]!==page||closing[2]!==context[14]||closing[4]!==context[6]||language[1]!==closing[3]||language[2]!==context[6]||titles[2]!==context[6]||titles[3]!==context[14]||own(titles[1],"shapeManager")!==context[5]||own(sheet[4],context[14])!==closing[3]||own(sheet[3],"sheets")!==sheet[4])bad();return true;}`,
} as const);
