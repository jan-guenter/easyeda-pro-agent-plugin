/** Actual uninvoked upload methods in inert Node24 realms. No renderer,
 * original receiver, transaction, upload or Save is created. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {Session} from "node:inspector/promises";
import {test} from "node:test";
import {createContext,runInContext} from "node:vm";
import {CURRENT_SCHEMATIC_RELEVANCE_UPLOADER_HELPER_ROLES as ROLES,CURRENT_SCHEMATIC_RELEVANCE_UPLOADER_HELPER_SOURCE as SOURCE,qualifyCurrentSchematicRelevanceUploaderHelperSource} from "../src/current-schematic-relevance-uploader-helper-source.ts";
import type {CurrentSchematicRelevanceUploaderHelperRole as Role} from "../src/current-schematic-relevance-uploader-helper-source.ts";
import {requireCurrentSchematicRelevanceUploaderHelperDescription as description,decodeCurrentSchematicRelevanceUploaderHelperFunction as metadata} from "../src/current-schematic-relevance-uploader-helper-replies.ts";

function uninvoked(source:string,variant:0|1,role:Role):unknown{
 const row=SOURCE[variant].roles[role],text=source.slice(row.start,row.end);let padding=source.slice(0,row.start).replaceAll(/[^\r\n]/gu,char=>" ".repeat(char.length));const directive='"use strict";';if(row.strict){padding=directive+padding.slice(directive.length);}
 if(row.kind==="regular"){return runInContext(`${padding}${text};${row.name}`,createContext({})) as unknown;}
 if(row.kind==="arrow"){const prefix=row.name.length===0?"const selected=(0,":`const ${row.name}=`;const tail=row.name.length===0?");selected":`;${row.name}`;return runInContext(`${padding.slice(0,-prefix.length)}${prefix}${text}${tail}`,createContext({})) as unknown;}
 const ctor:unknown=runInContext(`${padding.slice(0,-7)}(class{${text}})`,createContext({}));assert.ok(typeof ctor==="function");const parent:unknown=Reflect.get(ctor,"prototype");assert.ok(parent!==null&&typeof parent==="object");const key=row.kind==="getter"?row.name.slice(4):row.name;const actual=Object.getOwnPropertyDescriptor(parent,key);
 // oxlint-disable-next-line typescript/unbound-method -- This exact getter/method is retained only as uninvoked Inspector metadata, with no receiver call.
 return (row.kind==="getter"?actual?.get:actual?.value) as unknown;
}
void test("26 actual upload/serialization methods have exact native metadata without invoking their bodies",async context=>{
 assert.equal(process.versions.node,"24.18.0");const session=new Session;session.connect();const group="uninvoked-uploader-helper-test",key="__uninvokedUploaderHelper";
 try{for(const variant of [0,1] as const){const row=SOURCE[variant];let source:string;try{source=await readFile(`/mnt/c/Program Files/EasyEDA-Pro/resources/app/assets/${row.relativePath}`,"utf8");}catch(error){if(error instanceof Error&&"code" in error&&error.code==="ENOENT"){context.skip("Pinned installed source unavailable.");return;}throw error;}assert.equal(qualifyCurrentSchematicRelevanceUploaderHelperSource(source),variant);for(const role of ROLES){Object.defineProperty(globalThis,key,{value:uninvoked(source,variant,role),configurable:true});const value=await session.post("Runtime.evaluate",{expression:`globalThis.${key}`,objectGroup:group});assert.ok(typeof value.result.objectId==="string"&&typeof value.result.description==="string");description(value.result.description,variant,role);const packet=await session.post("Runtime.getProperties",{objectId:value.result.objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});const location:unknown=packet.internalProperties?.find(item=>item.name==="[[FunctionLocation]]")?.value?.value;assert.ok(location!==null&&typeof location==="object"&&"scriptId" in location&&typeof location.scriptId==="string");const decoded=metadata(packet,variant,role,location.scriptId);assert.equal(decoded.originalReceiverVerified,false);assert.equal(decoded.callbackDeliveryVerified,false);assert.equal(decoded.continuationAuthorized,false);assert.throws(()=>metadata(packet,variant,role,"foreign-script"));assert.throws(()=>{description(`${value.result.description} `,variant,role);});}}}
 finally{Reflect.deleteProperty(globalThis,key);await session.post("Runtime.releaseObjectGroup",{objectGroup:group});session.disconnect();}
});
void test("uploader metadata and source refusals leave caller accessors uncalled",()=>{let called=0;const value=Object.defineProperty({},"result",{enumerable:true,get(){called+=1;return[];}});assert.throws(()=>metadata(value,0,"isNetGroup","script"));assert.equal(called,0);assert.throws(()=>qualifyCurrentSchematicRelevanceUploaderHelperSource("foreign"));assert.throws(()=>qualifyCurrentSchematicRelevanceUploaderHelperSource("\uD800"));});
