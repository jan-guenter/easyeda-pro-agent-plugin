/** Read-only native cache source projection. Unlike the copy writer profile,
 * this preserves native Map order, all nonignored record families, complete
 * bounded actor JSON and empty tombstones. The separate source plan compares
 * every keyed checkpoint record; it does not assert checkpoint byte order or
 * authorize a writer. The original copy reader remains unchanged. */
import { CURRENT_FOOTPRINT_COPY_CACHE_SOURCE_READ_FUNCTION } from "./current-footprint-copy-cache-source-read.ts";

function replaceOnce(source: string, before: string, after: string): string {
  const parts = source.split(before);
  if (parts.length !== 2) { throw new Error("FOOTPRINT_SOURCE_CACHE_TEMPLATE"); }
  return parts.join(after);
}

const actor = String.raw`const actor=v=>{
 plain(v);let nodes=0,units=0;const seen=new Set();
 const copy=(value,depth)=>{if(++nodes>4096||depth>8)bad();
  if(value===null||typeof value==="boolean")return value;
  if(typeof value==="number"){if(!Number.isFinite(value))bad();return value;}
  if(typeof value==="string"){boundedText(value,65536);units+=value.length;if(units>65536)bad();return value;}
  if(typeof value!=="object"||seen.has(value))bad();seen.add(value);
  let result;if(Array.isArray(value)){if(proto(value)!==Array.prototype)bad();const n=integer(own(value,"length"));if(n>256||roster(value).length!==n+1)bad();result=[];for(let i=0;i<n;i++){units+=String(i).length;if(units>65536)bad();result.push(copy(own(value,String(i)),depth+1));}}
  else{plain(value);const keys=roster(value);if(keys.length>64)bad();result=Object.create(null);for(const key of keys){boundedText(key,256);units+=key.length;if(units>65536)bad();const d=descriptor(value,key);if(!d||!Object.hasOwn(d,"value")||d.enumerable!==true)bad();result[key]=copy(own(value,key),depth+1);}}
  seen.delete(value);return result;
 };
 const result=copy(v,0);if(typeof result.uuid!=="string"||!/^[a-f0-9]{32}$/.test(result.uuid)||typeof result.username!=="string"||typeof result.nickname!=="string")bad();
 const serialized=JSON.stringify(result);let bytes=0;for(let i=0;i<serialized.length;i++){const unit=serialized.charCodeAt(i);if(unit<128)bytes++;else if(unit<2048)bytes+=2;else if(unit>=55296&&unit<=56319){bytes+=4;i++;}else bytes+=3;if(bytes>65536)bad();}return result;
};`;

let program = replaceOnce(CURRENT_FOOTPRINT_COPY_CACHE_SOURCE_READ_FUNCTION,
  'const actor=v=>{plain(v);const keys=roster(v);if(keys.length!==3||keys.some(k=>!["uuid","username","nickname"].includes(k)))bad();const uuid=boundedText(own(v,"uuid"),32);if(!/^[a-f0-9]{32}$/.test(uuid))bad();return{uuid,username:boundedText(own(v,"username"),4096),nickname:boundedText(own(v,"nickname"),4096)};}', actor);
program = replaceOnce(program, "if(rowCount<2||rowCount>4097)bad();", "if(rowCount<0||rowCount>4101)bad();");
program = replaceOnce(program, "const selectedNodes=[];", "const selectedNodes=[],selectedIds=new Set();");
program = replaceOnce(program, 'if(typeof id!=="string"||id.length>256)bad();', 'if(typeof id!=="string"||!id||id.length>256||!id.isWellFormed())bad();');
program = replaceOnce(program,
  'if(type==="META"){if(id!=="META")bad();continue;}\n  if(!["CANVAS","PAD","LINE","NET"].includes(type))bad();',
  'absent(node,"pend");absent(node,"unique");if(typeof type!=="string"||!/^[A-Z][A-Z0-9_]{0,63}$/.test(type))bad();\n  if(["META","META_PLACEHOLDER","DELETE_DOC","META_CREATE","META_MODIFY"].includes(type))continue;');
program = replaceOnce(program,
  'if(actualId!==undefined&&(typeof actualId!=="string"||!actualId||actualId.length>256))bad();',
  'const insensitive=type==="NET"||type==="RULE_SELECTOR";if(insensitive?(typeof actualId!=="string"||!actualId||actualId.length>256||!actualId.isWellFormed()||actualId.toUpperCase()!==id):actualId!==undefined)bad();const emittedId=actualId||id;if(selectedIds.has(emittedId))bad();selectedIds.add(emittedId);');
program = replaceOnce(program, "roster(first);", 'roster(first);absent(first,"pend");absent(first,"unique");');
program = replaceOnce(program, "if(selectedNodes.length<1||selectedNodes.length>4096)bad();", "if(selectedNodes.length>4096)bad();");
program = replaceOnce(program,
  'if(typeof data!=="string"||contentLength+data.length>2097152||!data.startsWith("{")||!data.endsWith("}"))bad();const parsed=JSON.parse(data);if(parsed===null||typeof parsed!=="object"||Array.isArray(parsed))bad();',
  'if(typeof data!=="string"||contentLength+data.length>2097152||!data.isWellFormed())bad();if(data!==""){if(!data.startsWith("{")||!data.endsWith("}"))bad();const parsed=JSON.parse(data);if(parsed===null||typeof parsed!=="object"||Array.isArray(parsed))bad();}');

export const CURRENT_FOOTPRINT_CACHE_SOURCE_READ_FUNCTION = program;
