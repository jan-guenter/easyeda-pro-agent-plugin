/** Genuine original getter returns; reuses the retained hook/dependency graphs. */
import {CURRENT_SCHEMATIC_WIRE_CALLBACK_SELECTED_GUARD as BASE} from "./current-schematic-wire-callback-ast-view-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_GROUP_DATA_DEPENDENCY_PROGRAMS as DEPENDENCY} from "./current-schematic-wire-group-data-dependency-programs.ts";

const common=BASE+String.raw`const apply=native[6],is=native[3],fail=()=>{throw "WIRE_DATA_RETURNS";},group=own(own(holder,0),"group");apply((${DEPENDENCY.compared}),holder,[native,holder,event,bindings,graph]);const scalar=(o,key)=>{for(let depth=0;o!==null;depth++){if(depth===12)fail();const d=get(o,key);if(d!==undefined){if(!has(d,"value"))fail();return d.value;}o=proto(o);}return undefined;},highlight=scalar(scalar(group,"shapeManager"),"highlightManager"),targets=scalar(highlight,"_netHighlightedTargets"),connected=scalar(group,"isConnected"),map=scalar(targets,connected?"staged":"notStaged"),value=apply(native[8],map,[scalar(group,"id")]),numeric=typeof value==="number",combination=scalar(group,"_combination"),parent=scalar(group,"_parent"),ordinary=o=>{if(o===null||typeof o!=="object"||proto(o)!==native[15])fail();},field=(o,key,v)=>{const d=get(o,key);if(!d||!has(d,"value")||!is(d.value,v)||!d.writable||!d.enumerable||!d.configurable)fail();},attrs=(o,stage)=>{ordinary(o);const names=["id","locked","hitable","visible","zIndex"],sources=["id","_locked","_hitable","visible","zIndex"];for(let i=0;i<5;i++)field(o,names[i],scalar(group,sources[i]));let count=5;if(stage>=1&&numeric){field(o,"netHighlighted",value);count++;}if(stage>=2&&combination){field(o,"combination",combination);count++;}if(stage===3){for(const key of["type","strokeWidth","strokeStyle","strokeColor"])field(o,key,scalar(group,key));count+=4;}if(keys(o).length!==count)fail();};`;
const make=(body:string):string=>`function(native,holder,event,snapshot,init,instance,oldBorn,newBorn,bindings,graph,held,born,returned){${common}${body}}`;
const programs={
 group:make('dense(this,1);if(own(this,0)!==group)fail();return true;'),
 base:make('dense(this,2);if(own(this,0)!==instance||own(this,1)!==group)fail();return true;'),
 born:make('dense(this,2);if(own(this,0)!==group)fail();const e=own(this,1);attrs(e,0);return e;'),
 highlight:make('dense(this,2);if(own(this,0)!==highlight||own(this,1)!==group)fail();attrs(born,0);return value;'),
 afterHighlight:make('dense(this,3);if(own(this,0)!==group||own(this,1)!==born||!is(own(this,2),value))fail();attrs(born,0);return true;'),
 numeric:make('dense(this,1);if(!is(own(this,0),value))fail();attrs(born,0);return numeric;'),
 combination:make('dense(this,3);if(own(this,0)!==group||own(this,1)!==born||!is(own(this,2),value))fail();attrs(born,1);return true;'),
 finalBase:make('dense(this,3);if(own(this,0)!==group||own(this,1)!==born||!is(own(this,2),value))fail();attrs(born,2);return true;'),
 baseReturned:make('dense(this,3);if(own(this,0)!==group||own(this,1)!==born||returned!==born||!is(own(this,2),value))fail();attrs(born,2);return true;'),
 assign:make('dense(this,1);if(own(this,0)!==group)fail();attrs(born,2);return true;'),
 groupReturned:make('dense(this,1);if(own(this,0)!==group||returned!==born)fail();attrs(born,3);return true;'),
 parent:make('dense(this,1);if(own(this,0)!==group)fail();attrs(born,3);return parent;'),
 baseReturnedData:make('dense(this,2);if(own(this,0)!==instance||own(this,1)!==group)fail();attrs(born,3);ordinary(returned);if(keys(returned).length!==2)fail();field(returned,"attrs",born);field(returned,"parent",parent);return true;')
};
const objectScope=`function(native,expected){${BASE}const d=get(own(this,"object"),"Object");if(d===undefined)return undefined;if(!has(d,"value")||d.value!==expected)bad();return true;}`;
export const CURRENT_SCHEMATIC_WIRE_GROUP_DATA_RETURN_PROGRAMS=Object.freeze({...programs,objectScope,identity:`function(native,expected){${BASE}if(this!==expected)bad();return true;}`});
