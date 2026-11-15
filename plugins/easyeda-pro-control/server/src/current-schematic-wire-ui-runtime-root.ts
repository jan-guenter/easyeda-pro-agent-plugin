/** Exact before-Modify provider data pairs with one later original UI owner. */
import {consumeCurrentSchematicWireUiProviderData as consume}from"./current-schematic-wire-ui-provider-cursor.ts";
import type {CurrentSchematicWireUiProviderData}from"./current-schematic-wire-ui-provider-cursor.ts";
import {requireCurrentSchematicWireServiceInvocationRoot as current}from"./current-schematic-wire-service-invocation-root.ts";
import type {CurrentSchematicWireServiceInvocationRoot}from"./current-schematic-wire-service-invocation-root.ts";

export interface CurrentSchematicWireUiRuntimeRoot{readonly schema:"private.schematic-wire-ui-runtime-root.v1";readonly originalNativeOwnerJoined:false;readonly mutationAuthorized:false;readonly saveAuthorized:false}
type Stored=ReturnType<typeof consume>;
const issued=new WeakMap<CurrentSchematicWireUiRuntimeRoot,Stored>();
export function createCurrentSchematicWireUiRuntimeRoot(data:CurrentSchematicWireUiProviderData,root:CurrentSchematicWireServiceInvocationRoot):CurrentSchematicWireUiRuntimeRoot{
 const original=consume(data,root);const result:CurrentSchematicWireUiRuntimeRoot=Object.freeze({schema:"private.schematic-wire-ui-runtime-root.v1",originalNativeOwnerJoined:false,mutationAuthorized:false,saveAuthorized:false});issued.set(result,original);return result;
}
export function requireCurrentSchematicWireUiRuntimeRoot(root:CurrentSchematicWireUiRuntimeRoot):Readonly<Stored>{
 const original=issued.get(root);if(original===undefined){throw new Error("WIRE_UI_RUNTIME_ROOT");}current(original.root);return original;
}
