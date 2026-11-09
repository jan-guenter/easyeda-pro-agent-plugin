/** Fresh native-route registration projections. Shared program bytes select
 * data only; no public Call, historical guard or native Job is an input. */
import { CURRENT_NATIVE_OWN_DATA_CHECK } from "./current-native-own-data-intrinsics.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_FORWARDING_PROGRAMS as F } from "./current-footprint-inverse-get-forwarding-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_MANAGER_PROGRAMS as M } from "./current-footprint-inverse-get-manager-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_PROGRAMS as D } from "./current-footprint-inverse-delete-manager-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_PROGRAMS as S } from "./current-footprint-inverse-delete-send-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_PROGRAMS as N } from "./current-footprint-inverse-lookup-native-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const common = `"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}const guard=f=>{if(typeof f!=="function"||f()!==true)bad();};`;
// The sender's before guard is valid only before its single invocation. Every
// Registration guard is deliberately spent with it; later held frames must
// Establish fresh lexical and receiver projections without calling this guard.
const members = `function(sender,members){${common}dense(sender,8);dense(members,2);guard(value(sender,"5"));const p=value(members,"0"),callback=value(members,"1");return[p,callback,()=>{guard(value(sender,"5"));if(value(members,"0")!==p||value(members,"1")!==callback)bad();return true;}];}`;
const checkpoint = `function(sender,members,lookup,method,topic){${common}dense(sender,8);dense(members,3);dense(lookup,1);dense(method,3);dense(topic,1);const check=()=>{guard(value(sender,"5"));guard(value(members,"2"));guard(value(lookup,"0"));guard(value(method,"2"));guard(value(topic,"0"));return true;};check();return[sender,check,undefined,undefined];}`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_REGISTRATION_PROGRAMS = freezeDeep({ members, handlerUi: F.handlerUi, body: F.handlerBody, managerModule: F.managerModule, lookupScope: D.lookupScope, asyncPrototype: N.asyncPrototype, ...M, method: D.method, topics: D.topics, topicGroup: D.topicGroup, innerTopic: D.innerTopic, checkpoint, managerData: S.managerData, managerLinks: S.managerLinks, managerTopics: S.managerTopics, prepare: S.prepareUi, before: S.before } as const);
