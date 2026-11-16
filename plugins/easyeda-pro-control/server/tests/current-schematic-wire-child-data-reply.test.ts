/** Real ports and filesystem errors exercise diagnostic delivery only. */
import assert from "node:assert/strict";
import {mkdtemp,readFile,readdir,rm,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {test} from "node:test";
import {MessageChannel} from "node:worker_threads";
import {deliverWireChildDataReply as deliver} from "./helpers/current-schematic-wire-child-data-reply.ts";

void test("repeated raw replies in one TMPDIR retain unique complete files and deliver both originals", async () => {
 const root=await mkdtemp(join(tmpdir(),"wire-reply-unique-"));
 for(const ordinal of [1,2]){
  const channel=new MessageChannel();const received=Promise.withResolvers<unknown>();channel.port2.once("message",received.resolve);
  await deliver(channel.port1,{ordinal},root,0,"original-points-data");assert.deepEqual(await received.promise,{ordinal});channel.port2.close();
 }
 const files=await readdir(root);assert.equal(files.length,2);assert.notEqual(files[0],files[1]);
 const values=await Promise.all(files.map(name=>readFile(join(root,name),"utf8")));
 assert.deepEqual(values.toSorted(),['{"ordinal":1}','{"ordinal":2}']);
 await rm(root,{recursive:true});
});

void test("a failed raw write still delivers the original result and closes the original sending port", async () => {
 const root=await mkdtemp(join(tmpdir(),"wire-reply-error-"));const notDirectory=join(root,"file");await writeFile(notDirectory,"owned fixture",{mode:0o600});
 const channel=new MessageChannel();const received=Promise.withResolvers<unknown>();const closed=Promise.withResolvers<null>();
 channel.port2.once("message",received.resolve);channel.port1.once("close",()=>{closed.resolve(null);});
 await assert.rejects(deliver(channel.port1,{original:true},notDirectory,0,"original-points-data"),{code:"ENOTDIR"});
 assert.deepEqual(await received.promise,{original:true});await closed.promise;channel.port2.close();
 await rm(root,{recursive:true});
});
