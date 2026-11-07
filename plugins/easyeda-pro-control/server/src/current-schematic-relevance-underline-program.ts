/** Fixed readonly namespace proof. Correlated metadata must first qualify
 * namespace/map as original non-Proxy objects from the actual held run. */
export const CURRENT_SCHEMATIC_RELEVANCE_UNDERLINE_EXPRESSIONS = Object.freeze(["[uc]", "[cc]"] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_UNDERLINE_PROGRAM = String.raw`function(native,map){"use strict";
const get=native[0],proto=native[2],has=native[4],keys=native[5],objectProto=native[15],bad=()=>{throw "SCH209_UNDERLINE_BBOX";},own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;};
if(proto(this)!==objectProto||proto(map)!==objectProto||proto(objectProto)!==null||keys(this).length!==3||own(this,"bboxAttributes")!==map||own(this,"isConstructFromShapeManager")!==false)bad();const decompress=own(this,"isConstructFromDecompress");if(decompress===null||typeof decompress!=="object")bad();
if(get(map,"underline")!==undefined||get(objectProto,"underline")!==undefined)bad();const names=keys(map);if(names.length>128)bad();for(let i=0;i<names.length;i++){const key=names[i],d=get(map,key);if(typeof key!=="string"||!d||!has(d,"value")||d.value!==true||d.writable!==true||d.enumerable!==true||d.configurable!==true)bad();}return true;}`;
