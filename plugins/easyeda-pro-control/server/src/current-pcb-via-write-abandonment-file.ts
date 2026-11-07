/** Fixed-operation bounded sidecar read under the retained managed directory
 * capability. No design path, native process or writable file is opened. */
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import process from "node:process";
import { createHash } from "node:crypto";
import { controlRootCapability, operationPath } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";

export const CURRENT_PCB_VIA_ABANDONMENT_MAX_BYTES=4*1024*1024;
export function currentPcbViaWriteAbandonmentPath(operationId:string):string{return join(operationPath(operationId).slice(0,-5),"abandoned-disposable-via.json");}
function need(v:boolean):asserts v{if(!v){throw new Error("PCB_VIA_ABANDONMENT_FILE");}}
function authority(s:BigIntStats):void{need(s.isFile()&&s.nlink===1n&&s.mode%0o1000n===0o600n&&typeof process.getuid==="function"&&s.uid===BigInt(process.getuid()));}
function same(a:BigIntStats,b:BigIntStats):void{need(a.dev===b.dev&&a.ino===b.ino&&a.size===b.size&&a.ctimeNs===b.ctimeNs&&a.mtimeNs===b.mtimeNs);authority(b);}
export async function readCurrentPcbViaWriteAbandonmentFile(operationId:string):Promise<Readonly<{artifact:ArtifactDescriptor;text:string}>>{
  const path=currentPcbViaWriteAbandonmentPath(operationId);const root=await controlRootCapability(false);const directory=await root.openDirectory(dirname(path),false);
  try{const bound=join(`/proc/self/fd/${String(directory.handle.fd)}`,basename(path));const before=await lstat(bound,{bigint:true});authority(before);need(before.size>0n&&before.size<=BigInt(CURRENT_PCB_VIA_ABANDONMENT_MAX_BYTES));
    const file=await open(bound,constants.O_RDONLY+constants.O_NOFOLLOW+constants.O_NONBLOCK);
    try{same(before,await file.stat({bigint:true}));const content=Buffer.alloc(Number(before.size));let position=0;
      while(position<content.length){const part=await file.read(content,position,content.length-position,position);need(part.bytesRead>0);position+=part.bytesRead;}
      const extra=await file.read(Buffer.alloc(1),0,1,position);need(extra.bytesRead===0);same(before,await file.stat({bigint:true}));
      const current=await root.openDirectory(dirname(path),false);try{need(current.info.dev===directory.info.dev&&current.info.ino===directory.info.ino);const currentBound=join(`/proc/self/fd/${String(current.handle.fd)}`,basename(path));same(before,await lstat(currentBound,{bigint:true}));}finally{await current.handle.close();}
      await root.assertCurrent();same(before,await file.stat({bigint:true}));const text=new TextDecoder("utf-8",{fatal:true,ignoreBOM:true}).decode(content);
      return Object.freeze({artifact:Object.freeze({path,bytes:content.length,sha256:createHash("sha256").update(content).digest("hex")}),text});
    }finally{await file.close();}
  }finally{await directory.handle.close();}
}
