/** Exact unmodified-source return/resume points. The source-owning controller
 * must join the actual original scripts, functions and held events. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_GET_RESULT_POINTS=freezeDeep({
 managerReply:{file:"manager",name:"rpcReply",lineNumber:0,functionColumn:7650,columnNumber:7660},
 uiReply:{file:"ui",name:"rpcReply",lineNumber:1033,functionColumn:30_350,columnNumber:30_360},
 managerCallback:{file:"manager",name:"",lineNumber:0,functionColumn:7522,columnNumber:7532},
 uiCallback:{file:"ui",name:"",lineNumber:1033,functionColumn:30_221,columnNumber:30_231},
 f2Raw:{file:"ui",name:"getFootprint",lineNumber:1171,functionColumn:113_048,columnNumber:113_134},
 m8Row:{file:"ui",name:"delete",lineNumber:2657,functionColumn:140_826,columnNumber:140_980},
}as const);
export const CURRENT_FOOTPRINT_INVERSE_GET_RESULT_EXPRESSIONS=Object.freeze({
 managerReply:"[this,e,t,s,r]",uiReply:"[this,t,e,i,o]",
 managerCallback:"[a,o,c,i]",uiCallback:"[a,s,l,n]",
 managerExecute:"[this,e,t,s,r,Rf]",uiExecute:"[this,t,e,i,o,e9e]",
 managerPush:"[this,e,t,s,r]",uiPush:"[this,t,e,i,o]",
 f2Raw:"[this,t,e,i,tgt]",formatters:"[tgt,iai,am,Eue,Oue,Rue,_ue,String,Number]",
 m8Row:"[e,i,o,n]",incoming:"[this,e]",nativeListener:"[this,s]",
}as const);
