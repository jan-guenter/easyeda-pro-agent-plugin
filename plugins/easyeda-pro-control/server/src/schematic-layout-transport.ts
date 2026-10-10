import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { canonicalJson } from "./core.ts";
import { assertExactTransportValue } from "./exact-readers.ts";

export const SCHEMATIC_LAYOUT_PAYLOAD_MAX_BYTES = 8 * 1024 * 1024;
export const SCHEMATIC_LAYOUT_PAYLOAD_TOTAL_MAX_BYTES = 12 * 1024 * 1024;
export const SCHEMATIC_LAYOUT_PAYLOAD_MAX_GZIP_BYTES = 1024 * 1024;
interface Payload { readonly utf8Bytes: number; readonly gzipBytes: number; readonly base64: string; readonly sha256: string }

function encode(bytes: Buffer): Payload {
  // oxlint-disable-next-line node/no-sync -- Typed layout preparation is synchronous; input is already bounded before this one lossless compression, with no filesystem or network work.
  const compressed = gzipSync(bytes);
  if (compressed.length > SCHEMATIC_LAYOUT_PAYLOAD_MAX_GZIP_BYTES) { throw new Error("Layout payload exceeds its compressed bound."); }
  return { utf8Bytes: bytes.length, gzipBytes: compressed.length, base64: compressed.toString("base64"), sha256: createHash("sha256").update(bytes).digest("hex") };
}

/** Declares the exact original `baseline` string and decoded `desired` records.
 * Only the wire encoding changes. The caller must keep both native baseline
 * comparisons, target/source guards and the independent after-write proof.
 * This helper performs no editor access and accepts no runtime cache or URLs.
 */
export function buildSchematicLayoutPayloadCode(baseline: string, desiredJson: string): string {
  const baselineBytes = Buffer.from(baseline, "utf8"), desiredBytes = Buffer.from(desiredJson, "utf8");
  if (baselineBytes.length === 0 || desiredBytes.length === 0 || baselineBytes.length > SCHEMATIC_LAYOUT_PAYLOAD_MAX_BYTES ||
      desiredBytes.length > SCHEMATIC_LAYOUT_PAYLOAD_MAX_BYTES || baselineBytes.length + desiredBytes.length > SCHEMATIC_LAYOUT_PAYLOAD_TOTAL_MAX_BYTES) {
    throw new Error("Layout payload exceeds its decoded bound.");
  }
  const baselineValue: unknown = JSON.parse(baseline), desiredValue: unknown = JSON.parse(desiredJson);
  assertExactTransportValue(baselineValue); assertExactTransportValue(desiredValue);
  if (canonicalJson(baselineValue) !== baseline || !Array.isArray(desiredValue)) { throw new Error("Layout payload is not the original canonical baseline and desired record array."); }
  const payloads = [encode(baselineBytes), encode(desiredBytes)];
  return `
if(typeof DecompressionStream!=='function')throw new Error('SCH_LAYOUT_PAYLOAD_COMPRESSION_UNAVAILABLE');
if(typeof globalThis.crypto?.subtle?.digest!=='function')throw new Error('SCH_LAYOUT_PAYLOAD_CRYPTO_UNAVAILABLE');
const layoutPayloads=${JSON.stringify(payloads)};
if(layoutPayloads.length!==2||layoutPayloads.reduce((total,item)=>total+item.utf8Bytes,0)>${SCHEMATIC_LAYOUT_PAYLOAD_TOTAL_MAX_BYTES})throw new Error('SCH_LAYOUT_PAYLOAD_BOUND');
const decodeLayoutPayload=async(item)=>{
 if(!Number.isSafeInteger(item.utf8Bytes)||item.utf8Bytes<1||item.utf8Bytes>${SCHEMATIC_LAYOUT_PAYLOAD_MAX_BYTES}||!Number.isSafeInteger(item.gzipBytes)||item.gzipBytes<20||item.gzipBytes>${SCHEMATIC_LAYOUT_PAYLOAD_MAX_GZIP_BYTES}||typeof item.base64!=='string'||item.base64.length>${Math.ceil(SCHEMATIC_LAYOUT_PAYLOAD_MAX_GZIP_BYTES / 3) * 4}||typeof item.sha256!=='string'||!/^[a-f0-9]{64}$/.test(item.sha256))throw new Error('SCH_LAYOUT_PAYLOAD_BOUND');
 const binary=atob(item.base64);
 if(binary.length!==item.gzipBytes||btoa(binary)!==item.base64)throw new Error('SCH_LAYOUT_PAYLOAD_INVALID');
 const compressed=Uint8Array.from(binary,letter=>letter.charCodeAt(0));
 if(compressed[0]!==31||compressed[1]!==139||compressed[2]!==8||new DataView(compressed.buffer).getUint32(compressed.length-4,true)!==item.utf8Bytes)throw new Error('SCH_LAYOUT_PAYLOAD_INVALID');
 const reader=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip')).getReader(),chunks=[];
 let count=0;
 try{
  for(;;){const next=await reader.read();if(next.done)break;if(!(next.value instanceof Uint8Array))throw new Error('SCH_LAYOUT_PAYLOAD_INVALID');count+=next.value.byteLength;if(count>item.utf8Bytes)throw new Error('SCH_LAYOUT_PAYLOAD_BOUND');chunks.push(next.value);}
 }catch(error){try{await reader.cancel();}catch{throw new Error('SCH_LAYOUT_PAYLOAD_CLEANUP');}throw error;}finally{reader.releaseLock();}
 if(count!==item.utf8Bytes)throw new Error('SCH_LAYOUT_PAYLOAD_INVALID');
 const bytes=new Uint8Array(count);let offset=0;
 for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 const digest=new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',bytes));
 const hash=Array.from(digest,value=>value.toString(16).padStart(2,'0')).join('');
 if(hash!==item.sha256)throw new Error('SCH_LAYOUT_PAYLOAD_HASH');
 return new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);
};
const baseline=await decodeLayoutPayload(layoutPayloads[0]);
const desired=JSON.parse(await decodeLayoutPayload(layoutPayloads[1]));
if(!Array.isArray(desired))throw new Error('SCH_LAYOUT_PAYLOAD_INVALID');`;
}
