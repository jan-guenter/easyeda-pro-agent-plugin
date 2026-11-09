/** Actual worker handler entry and original packet linkage before qe. These
 * checks never call deleteData, qe, a clock, encoder or a native method. */
import { CURRENT_NATIVE_OWN_DATA_CHECK } from "./current-native-own-data-intrinsics.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_PROGRAMS as RPC } from "./current-footprint-inverse-delete-rpc-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const common = `"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}const guard=f=>{if(typeof f!=="function"||f()!==true)bad();};const data=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value")||!d.writable||!d.enumerable||!d.configurable)bad();return d.value;};`;
const handler = `function(frame,prelude,link,bound){${common}dense(frame,2);dense(prelude,7);dense(link,3);dense(bound,4);const original=value(prelude,"0"),state=value(original,"1");dense(original,4);dense(state,9);const project=value(state,"0"),manager=value(state,"2"),target=value(state,"7"),bus=value(prelude,"2"),queue=value(prelude,"3"),task=value(prelude,"4"),callback=value(prelude,"5");dense(queue,0);if(data(project,"workerBus")!==bus||data(data(bus,"pulled"),"/mgr/projectWorker/footprint/delete")!==queue||data(task,"callback")!==callback||data(task,"isRunning")!==true||data(task,"unsafe")!==true)bad();if(value(link,"0")!==prelude||value(bound,"0")!==link||value(bound,"1")!==project||value(bound,"2")!==manager||value(frame,"0")!==target||value(frame,"1")!==project||value(root,"PROJECT")!==project||data(project,"footprint")!==manager)bad();return true;}`;
/** Packet joins use the existing worker model unchanged. Core must derive the
 * expected reply from its original accepted native send, never caller JSON. */
export const CURRENT_FOOTPRINT_INVERSE_DELETE_WORKER_FORWARD_PROGRAMS = freezeDeep({ handler, packet: RPC.packet } as const);
export const CURRENT_FOOTPRINT_INVERSE_DELETE_WORKER_FORWARD_EXPRESSIONS = Object.freeze({ handler: "[t,e]", service: "[this,r,e,t,s,i,n]", native: "[this,s]" } as const);
