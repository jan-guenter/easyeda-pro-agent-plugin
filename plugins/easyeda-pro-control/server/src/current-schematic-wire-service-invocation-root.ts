/** The exact before-Modify registration may join one original service owner.
 * JSON never recreates this local source-comparison root. */
import { consumeCurrentSchematicWireServiceRegistrationData as consume } from "./current-schematic-wire-service-registration-cursor.ts";
import type { CurrentSchematicWireServiceRegistrationData } from "./current-schematic-wire-service-registration-cursor.ts";
import type { CurrentSchematicWireClassicRpcDriver } from "./current-schematic-wire-classic-rpc-driver.ts";

interface Input {readonly holder:string;readonly native:string;readonly scriptId:string;readonly uiScriptId:string;readonly variant:0|1}
export interface CurrentSchematicWireServiceInvocationRoot{
 readonly schema:"private.schematic-wire-service-invocation-root.v1";
 readonly registrations:CurrentSchematicWireServiceRegistrationData;
 readonly originalNativeOwnerJoined:false;readonly mutationAuthorized:false;readonly saveAuthorized:false;
}
interface Original{readonly input:Input;readonly rpc:CurrentSchematicWireClassicRpcDriver}
const issued=new WeakMap<CurrentSchematicWireServiceInvocationRoot,Original>();
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_SERVICE_ROOT");}}
export function createCurrentSchematicWireServiceInvocationRoot(data:CurrentSchematicWireServiceRegistrationData,input:Input,rpc:CurrentSchematicWireClassicRpcDriver):CurrentSchematicWireServiceInvocationRoot{
 const registrations=consume(data,input);const current=rpc.inspect();need(!current.failed&&!current.settled&&!current.objectGroupReleased);
 const root:CurrentSchematicWireServiceInvocationRoot=Object.freeze({schema:"private.schematic-wire-service-invocation-root.v1",registrations,originalNativeOwnerJoined:false,mutationAuthorized:false,saveAuthorized:false});
 issued.set(root,Object.freeze({input:Object.freeze({...input}),rpc}));return root;
}
export function requireCurrentSchematicWireServiceInvocationRoot(root:CurrentSchematicWireServiceInvocationRoot):Readonly<Original>{
 const original=issued.get(root);need(original!==undefined);const current=original.rpc.inspect();need(!current.failed&&!current.objectGroupReleased);return original;
}
