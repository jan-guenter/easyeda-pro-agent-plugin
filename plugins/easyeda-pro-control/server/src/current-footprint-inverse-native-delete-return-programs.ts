/** Fixed descriptor-only joins for one original native DEL Promise. No app,
 * Promise resolver, serializer, cache or publication method is invoked. */
import{CURRENT_NATIVE_OWN_DATA_CHECK as CHECK}from"./current-native-own-data-intrinsics.ts";
import{freezeDeep}from"./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_RETURN_PROGRAMS=freezeDeep({
 frame:`function(frame,bundle,target){${CHECK}dense(frame,2);dense(bundle,8);const ready=value(bundle,"5");dense(ready,4);const state=value(ready,"1");dense(state,9);
 const project=value(state,"0"),manager=value(state,"2");if(value(frame,"0")!==manager||value(frame,"1")!==target||value(root,"PROJECT")!==project||value(project,"footprint")!==manager||value(manager,"projectManager")!==project)bad();return true;}`,
 retain:'function(){"use strict";return this;}',
 result:`function(result){${CHECK}if(result===null||typeof result!=="object"||proto(result)!==objectProto||count(result)!==1)bad();const d=get(result,"success");if(!d||!has(d,"value")||d.value!==true||!d.writable||!d.enumerable||!d.configurable)bad();return true;}`,
});
