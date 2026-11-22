/** Exact V5 wire grammar. Matching data never creates an owner or receipt. */
import {currentSchematicWireV5TitleWire} from "./current-schematic-wire-v5-title-protocol.ts";
import {diagnosticRecord} from "./current-pcb-diagnostic-protocol.ts";
import {currentSchematicWireWriterV4SharedNativeRequest} from "./current-schematic-display-write-protocol.ts";
import {currentSchematicWireGlobalsNativeFrame,validateCurrentSchematicWireGlobalsCommand} from "./current-schematic-wire-globals-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_V4_NATIVE_PROFILE as V4 } from "./current-schematic-wire-writer-v4-native-profile.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_PROFILE as PROFILE} from "./current-schematic-wire-writer-v5-native-profile.ts";
import {validateCurrentSchematicWireWriterV4NativeCommand} from "./current-schematic-wire-writer-v4-native-command.ts";

export {decodeCurrentSchematicWireWriterV4Capture as decodeCurrentSchematicWireWriterV5Capture} from "./current-schematic-wire-writer-v4-protocol.ts";
export function currentSchematicWireWriterV5NativeRequest(chunk:Buffer):Readonly<Record<string,unknown>>{
 if(chunk.length>65_536||chunk.at(-1)!==0){throw new Error("WIRE_V5_WIRE");}
 const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(chunk.subarray(0,-1)));
 if(!diagnosticRecord(raw)||typeof raw["id"]!=="number"||!Number.isSafeInteger(raw["id"])||raw["id"]<1||raw["id"]>PROFILE.renderer.total||!chunk.equals(Buffer.from(`${JSON.stringify(raw)}\0`))){throw new Error("WIRE_V5_WIRE");}
 if(Object.hasOwn(raw,"schematicWireV5Title")){const {id,sessionId,schematicWireV5Title,...input}=raw;if(schematicWireV5Title!==true||typeof sessionId!=="string"){throw new Error("WIRE_V5_TITLE_SESSION");}const fixed=currentSchematicWireV5TitleWire(input,id,sessionId);if(!chunk.equals(Buffer.from(`${JSON.stringify(fixed.wire)}\0`))){throw new Error("WIRE_V5_TITLE_WIRE");}return fixed.request;}
 if(Object.hasOwn(raw,"schematicWireGlobals")){const {id:_id,sessionId,schematicWireGlobals,...input}=raw;if(schematicWireGlobals!==true||typeof sessionId!=="string"){throw new Error("WIRE_V5_GLOBALS_SESSION");}return currentSchematicWireGlobalsNativeFrame(chunk,validateCurrentSchematicWireGlobalsCommand(input),sessionId);}
 if(Object.keys(raw).some(key=>/^(?:schematicRelevance|schematicWire(?:WriterV4|Accessor|Lexical|Intent|Dependency|Edit)|schematicDisplayPhase|schematicAction|schematicAccessor|schematicClock)/u.test(key))){throw new Error("WIRE_V5_FOREIGN_ORIGIN");}
 if(!Object.hasOwn(raw,"schematicWireWriterV5Phase")){const fixed=currentSchematicWireWriterV4SharedNativeRequest(Buffer.from(`${JSON.stringify({...raw,id:1})}\0`));return Object.freeze({...fixed,requestId:raw["id"]});}
 const { id, sessionId, schematicWireWriterV5Phase, ...input } = raw;
 if (id > V4.renderer.total) { throw new Error("WIRE_V5_STAGE_REQUEST_LIMIT"); }
 const command = validateCurrentSchematicWireWriterV4NativeCommand({ schematicWireWriterV4Phase: schematicWireWriterV5Phase, ...input });
 if(typeof sessionId!=="string"||!/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)){throw new Error("WIRE_V5_SESSION");}
 const phase=command.schematicWireWriterV4Phase;if(phase!=="start"&&phase!=="navigate"&&phase!=="capture"&&phase!=="preflight"){throw new Error("WIRE_V5_READONLY_STAGE");}
 return Object.freeze({action:"schematic-wire-writer-v5-native",requestId:id,sessionId,phase,...("uniqueContextId"in command.params?{uniqueContextId:command.params.uniqueContextId}:{objectId:command.params.objectId}),...(phase==="start"?{}:{targetJson:command.params.arguments[0].value}),...(phase==="start"||phase==="navigate"?{}:{operationJson:command.params.arguments[2].value})});
}
