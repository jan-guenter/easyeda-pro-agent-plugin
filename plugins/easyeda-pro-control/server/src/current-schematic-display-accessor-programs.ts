/** Fixed descriptor projections over the original Array2 display holder.
 * These wrappers parse retained inert target data and invoke only our fixed
 * projections, never a model getter/setter/action/Save or application factory. */
import { GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CALLEE_FUNCTION as CALLEES, GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CLOSURE_FUNCTION as CLOSURE,
  GENERATED_SCHEMATIC_DISPLAY_MONITOR_CLOSURE_FUNCTION as MONITOR } from "./generated-schematic-display-accessor-program.ts";

export const CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_GROUP = "easyeda-pro-control-schematic-display-accessor-v1";
export const CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_CALLS = Object.freeze({
  callees: `function(targetJson,operationJson){"use strict";const read=(${CALLEES});return Reflect.apply(read,this,[JSON.parse(targetJson),JSON.parse(operationJson)]);}`,
  closure: `function(holder,targetJson,operationJson,field,decorator,capturedField){"use strict";const read=(${CLOSURE});return Reflect.apply(read,this,[holder,JSON.parse(targetJson),JSON.parse(operationJson),field,decorator,capturedField]);}`,
  monitor: `function(holder,targetJson,operationJson){"use strict";const read=(${MONITOR});return Reflect.apply(read,this,[holder,JSON.parse(targetJson),JSON.parse(operationJson)]);}`,
  same: `function(holder,targetJson,operationJson){"use strict";const bad=()=>{throw new Error("SCHEMATIC_DISPLAY_ACCESSOR_SAME");};const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};if(!Array.isArray(this)||Object.getPrototypeOf(this)!==Array.prototype||own(this,"length")!==26||Reflect.ownKeys(this).length!==27)bad();const read=(${CALLEES}),current=Reflect.apply(read,holder,[JSON.parse(targetJson),JSON.parse(operationJson)]);for(let i=0;i<26;i++)if(own(this,String(i))!==own(current,String(i)))bad();return true;}`
});
