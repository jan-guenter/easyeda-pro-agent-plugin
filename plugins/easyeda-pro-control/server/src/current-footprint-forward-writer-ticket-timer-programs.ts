/** Passive fixed reads over the original 11-intrinsic packet. The complete
 * Core must qualify every root/function and retain the exact binding tuple;
 * these strings and matching JSON create no original callback or native owner. */
import {CURRENT_NATIVE_OWN_DATA_CHECK as CHECK} from "./current-native-own-data-intrinsics.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const checked=`"use strict";${CHECK}
const known=o=>{dense(qualified,32);for(let i=0;i<32;i++)if(value(qualified,""+i)===o)return;bad();};
const own=(o,k)=>{known(o);return value(o,k);};
known(binding);dense(binding,15);
const project=own(binding,"0"),manager=own(binding,"1"),bus=own(binding,"2"),channel=own(binding,"3"),subscribed=own(binding,"4"),uuid=own(binding,"5"),busProto=own(binding,"6"),baseProto=own(binding,"7"),channelProto=own(binding,"13");
known(root);known(project);known(manager);known(bus);known(channel);known(subscribed);known(busProto);known(baseProto);known(channelProto);
if(own(root,"PROJECT")!==project||own(project,"consistencyManager")!==manager||own(project,"workerBus")!==bus||own(project,"isReady")!==true||own(bus,"bc")!==channel||own(bus,"subscribed")!==subscribed||own(bus,"uuid")!==uuid||typeof uuid!=="string"||uuid.length===0||uuid.length>128||proto(bus)!==busProto||proto(busProto)!==baseProto||proto(channel)!==channelProto||proto(subscribed)!==objectProto||get(subscribed,"/pro-mgr/project/ticket")!==undefined||get(objectProto,"/pro-mgr/project/ticket")!==undefined)bad();
const methods=[["publish",baseProto,8],["broadcastPublish",busProto,9],["post",busProto,10],["onMessage",busProto,11],["onReceivedPublish",baseProto,12]];
for(let i=0;i<methods.length;i++){const row=methods[i],fn=own(binding,""+row[2]);known(fn);if(get(bus,row[0])!==undefined||value(row[1],row[0])!==fn||typeof fn!=="function"||proto(fn)!==functionProto||get(fn,"apply")!==undefined)bad();}
const post=own(binding,"14");known(post);if(get(channel,"postMessage")!==undefined||value(channelProto,"postMessage")!==post||typeof post!=="function"||proto(post)!==functionProto||get(post,"apply")!==undefined)bad();
const maximum=own(manager,"maxTicket");if(typeof maximum!=="number"||maximum%1!==0||maximum<0||maximum===0&&1/maximum<0||maximum>9007199254740990)bad();
`;
const snapshot=`known(original);dense(original,8);for(let i=0;i<6;i++)if(own(original,""+i)!==own(binding,""+i))bad();const timer=own(original,"6"),ticket=own(original,"7");if(typeof timer!=="number"||timer%1!==0||timer<1||timer>2147483647||typeof ticket!=="number"||ticket%1!==0||ticket<1||ticket!==maximum)bad();`;
export const CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_PROGRAMS=freezeDeep({
 baseline:`function(binding,qualified){${checked}if(own(project,"publishTimer")!==null)bad();return[project,manager,bus,channel,subscribed,uuid,maximum];}`,
 entry:`function(frame,binding,qualified){${checked}known(frame);dense(frame,1);const timer=own(project,"publishTimer");if(own(frame,"0")!==project||typeof timer!=="number"||timer%1!==0||timer<1||timer>2147483647||maximum<1)bad();return[project,manager,bus,channel,subscribed,uuid,timer,maximum];}`,
 returned:`function(frame,binding,original,qualified){${checked}${snapshot}known(frame);dense(frame,1);if(own(frame,"0")!==project||own(project,"publishTimer")!==null)bad();return true;}`,
 selfReturned:`function(frame,binding,original,qualified){${checked}${snapshot}known(frame);dense(frame,2);if(own(frame,"0")!==bus||own(project,"publishTimer")!==null)bad();const envelope=own(frame,"1");known(envelope);if(proto(envelope)!==objectProto||symbols(envelope).length!==0)bad();const keys=names(envelope),envelopeKeys=["type","uuid","topic","message"];if(keys.length!==4)bad();for(let i=0;i<4;i++)if(keys[i]!==envelopeKeys[i])bad();if(own(envelope,"type")!=="PUBLISH"||own(envelope,"uuid")!==uuid||own(envelope,"topic")!=="/pro-mgr/project/ticket")bad();const body=own(envelope,"message");known(body);if(proto(body)!==objectProto||symbols(body).length!==0||names(body).length!==1||names(body)[0]!=="ticket"||own(body,"ticket")!==ticket)bad();return true;}`,
} as const);
