/** Fixed descriptor-only comparisons at original held frames. */
const reflect = String.raw`
"use strict";
const get=native[0],proto=native[2],same=native[3],has=native[4],keys=native[5],apply=native[6];
const fail=()=>{throw "WIRE_NET_GEOMETRY_JOIN";};
const own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))fail();return d.value;};
const optional=(o,k)=>{const d=get(o,k);if(!d)return undefined;if(!has(d,"value"))fail();return d.value;};
const tuple=(o,n)=>{if(!native[7](o)||proto(o)!==native[16]||own(o,"length")!==n||keys(o).length!==n+1)fail();for(let i=0;i<n;i++)own(o,i);};
const map=(o)=>{if(proto(o)!==native[17]||keys(o).length!==0)fail();return o;};
const lookup=(m,k)=>apply(native[8],m,[k]), contains=(m,k)=>apply(native[9],m,[k]);
const set=(o,n)=>{if(proto(o)!==native[18]||keys(o).length!==0||apply(native[14],o,[])!==n)fail();return o;};
const member=(s,v)=>apply(native[12],s,[v]);
const coordinate=v=>{if(typeof v!=="number"||v-v!==0||same(v,-0))fail();return v;};
const find=(items,value,limit)=>{const count=own(items,"length");if(typeof count!=="number"||count%1!==0||count<0||count>limit)fail();tuple(items,count);let found=0;for(let i=0;i<count;i++)if(own(items,i)===value)found++;return found;};
const connected=(dot,group,idMap,treeMap)=>{const id=own(dot,"id"),node=lookup(treeMap,id);if(typeof id!=="string"||id.length<1||id.length>64||own(dot,"_parent")!==group||own(dot,"isConnected")!==true||lookup(idMap,id)!==dot||own(node,"model")!==dot)fail();return node;};
const scope=()=>{tuple(holder,2);const b=own(holder,0),state=own(holder,1),shapes=own(b,"shapes"),page=own(b,"page"),runner=own(b,"runner"),line=own(b,"line"),group=own(b,"group"),net=own(shapes,"netPointManager"),bbox=own(shapes,"bboxMonitor"),dispatcher=own(bbox,"_onUpdate");
if(own(state,"owner")!==holder||own(state,"failed")!==false||own(state,"saveAttempted")!==false||own(state,"saveAcknowledged")!==false||own(state,"savePromiseSettled")!==false||own(state,"modifyAttempted")!==true||own(state,"modifyAcknowledged")!==false||own(state,"after")!==null||own(runner,"_currentAction")!==action||own(page,"shapeManager")!==shapes||own(shapes,"docManager")!==page||own(net,"shapeManager")!==shapes||own(bbox,"shapeManager")!==shapes||own(line,"_parent")!==group)fail();
return [state,shapes,page,line,group,net,bbox,dispatcher];};
`;
const heldDelivery = String.raw`
const roots=scope(),state=roots[0],shapes=roots[1],page=roots[2],line=roots[3],group=roots[4],net=roots[5],bbox=roots[6],dispatcher=roots[7];
tuple(this,1);tuple(listener,2);tuple(delivery,3);tuple(dispatch,2);tuple(update,2);tuple(watchEvent,5);tuple(registration,3);
const registered=own(registration,0);tuple(registered,4);
const callbacks=own(dispatcher,"_listenerSubscriptions");tuple(callbacks,1);
const subscription=own(registered,1),payload=own(dispatch,1),args=own(delivery,2);tuple(args,2);
const types=own(bbox,"_modelTypesShouldUpdateBBox"),dirty=map(own(bbox,"_modelsShouldUpdateBBox"));
if(own(this,0)!==net||own(listener,0)!==net||own(listener,1)!==types||own(delivery,0)!==dispatcher||own(delivery,1)!==subscription||own(dispatch,0)!==dispatcher||own(update,0)!==bbox||own(update,1)!==true||own(watchEvent,0)!==dispatcher||own(registered,0)!==own(net,"_watchSubscriptions")||own(subscription,"cb")!==own(watchEvent,1)||own(callbacks,0)!==subscription||own(dispatcher,"_size")!==1||optional(dispatcher,"_deliveryQueue")!==undefined||own(args,0)!==payload||own(args,1)!==undefined||own(payload,"success")!==true||own(payload,"modelTypes")!==types||own(payload,"data")!==dirty||keys(payload).length!==3||proto(types)!==native[18]||!member(types,"Wire")||lookup(dirty,line)!==0||own(bbox,"_addCore")!==own(own(bbox,"_addCoreMethods"),"forUpdating"))fail();
const idMap=map(own(own(page,"idManager"),"idMap")),tree=own(shapes,"rTree"),treeMap=map(own(tree,"_idBBoxMap")),rbush=own(tree,"_rbush"),root=own(rbush,"data");
if(own(root,"leaf")!==true||own(root,"height")!==1)fail();
const children=own(root,"children");
`;
export const CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_PROGRAMS = Object.freeze({
  entry: `function(native,holder,action,watchEvent,registration,listener,delivery,dispatch,update){${reflect}${heldDelivery}
    const old=own(own(state,"before"),"markers");tuple(old,2);
    const a=own(old,0),b=own(old,1),live=set(own(net,"unConnectDotModels"),2);
    if(a===b||own(a,"id")===own(b,"id")||!member(live,a)||!member(live,b))fail();
    const an=connected(a,group,idMap,treeMap),bn=connected(b,group,idMap,treeMap);
    if(an===bn||find(children,an,9)!==1||find(children,bn,9)!==1)fail();
    return [net,group,line,idMap,treeMap,tree,root,[old,a,b,own(a,"id"),own(b,"id"),an,bn,rbush,children]];
  }`,
  constructor: `function(native,holder,action,before,create,factory,birth){${reflect}
    const roots=scope(),shapes=roots[1],line=roots[3],group=roots[4],net=roots[5];tuple(before,8);tuple(this,5);tuple(create,5);tuple(factory,3);tuple(birth,2);
    const dot=own(this,0),arg=own(this,2),cls=own(factory,2),flag=own(this,4),point=own(birth,1),constructor=own(this,3);
    if(own(this,1)!==shapes||own(create,0)!==shapes||own(create,1)!==cls||own(create,2)!==arg||own(create,3)!==constructor||own(create,4)!==flag||own(factory,0)!==shapes||own(factory,1)!==arg||own(birth,0)!==net||own(before,0)!==net||own(before,1)!==group||own(before,2)!==line||own(flag,"isConstructFromShapeManager")!==true||own(own(globalThis,"Reflect"),"construct")!==constructor||proto(constructor)!==proto(native[6])||proto(dot)!==own(cls,"prototype")||own(dot,"shapeManager")!==shapes||own(dot,"modelType")!=="UnConnectDot"||own(dot,"notAddHistory")!==true||own(dot,"id")!==own(arg,"id")||optional(dot,"_parent")!=null||contains(own(before,3),own(dot,"id"))||contains(own(before,4),own(dot,"id")))fail();
    if(keys(arg).length!==3||coordinate(own(arg,"cx"))!==coordinate(own(point,"x"))||coordinate(own(arg,"cy"))!==coordinate(own(point,"y"))||own(point,"wireNetGroup")!==group||!member(set(own(point,"Wire"),1),line))fail();
    return [dot,arg,cls,constructor,flag,point];
  }`,
  create: `function(native,holder,action,before,constructed,factory,birth){${reflect}
    const roots=scope(),shapes=roots[1],line=roots[3],group=roots[4],net=roots[5];
    tuple(before,8);tuple(this,6);tuple(constructed,6);tuple(factory,3);tuple(birth,2);
    const dot=own(constructed,0),arg=own(constructed,1),cls=own(constructed,2),point=own(constructed,5);
    if(own(this,0)!==shapes||own(this,1)!==cls||own(this,2)!==arg||own(this,3)!==dot||own(this,4)!==own(constructed,3)||own(this,5)!==own(constructed,4)||own(own(this,5),"isConstructFromShapeManager")!==true||own(factory,0)!==shapes||own(factory,1)!==arg||own(factory,2)!==cls||own(birth,0)!==net||own(birth,1)!==point||own(before,1)!==group||own(before,2)!==line||own(dot,"_cx")!==own(arg,"cx")||own(dot,"_cy")!==own(arg,"cy")||optional(dot,"_parent")!=null)fail();
    return true;
  }`,
  birth: `function(native,holder,action,before,constructed){${reflect}
    const roots=scope(),shapes=roots[1],line=roots[3],group=roots[4],net=roots[5];tuple(before,8);tuple(this,3);tuple(constructed,6);
    const dot=own(constructed,0),arg=own(constructed,1),point=own(constructed,5);
    if(own(this,0)!==net||own(this,1)!==point||own(this,2)!==dot||own(before,1)!==group||own(before,2)!==line||own(dot,"shapeManager")!==shapes||own(own(constructed,4),"isConstructFromShapeManager")!==false||own(dot,"id")!==own(arg,"id")||optional(dot,"_parent")!=null)fail();
    return true;
  }`,
  returned: `function(native,holder,action,watchEvent,registration,listener,delivery,dispatch,update,before,one,two){${reflect}${heldDelivery}
    tuple(before,8);tuple(one,6);tuple(two,6);
    if(own(before,0)!==net||own(before,1)!==group||own(before,2)!==line||own(before,3)!==idMap||own(before,4)!==treeMap||own(before,5)!==tree||own(before,6)!==root||own(one,2)!==own(two,2)||own(one,3)!==own(two,3)||own(one,4)!==own(two,4)||own(one,5)===own(two,5))fail();
    const a=own(one,0),b=own(two,0),old=own(before,7);tuple(old,9);
    if(own(old,0)!==own(own(state,"before"),"markers")||own(old,7)!==rbush||own(old,8)!==children)fail();
    const dots=set(own(net,"unConnectDotModels"),2),groupDots=set(own(group,"_unConnectDotModels"),2),groupKids=own(group,"children");
    const info=own(net,"_netPointData"),wire=own(info,"wireUnConnect");
    tuple(wire,2);tuple(own(info,"pinUnConnected"),0);tuple(own(info,"junction"),0);set(own(net,"junctionModels"),0);
    const points=own(line,"_points");tuple(points,2);
    const lineIds=own(own(net,"netGroupLineUnConnectDotIdMap"),own(line,"id"));set(lineIds,2);
    if(a===b||own(a,"id")===own(b,"id")||!member(lineIds,own(a,"id"))||!member(lineIds,own(b,"id")))fail();
    const first=own(points,0),second=own(points,1);
    const x0=coordinate(own(first,"x")),y0=coordinate(own(first,"y")),x1=coordinate(own(second,"x")),y1=coordinate(own(second,"y"));
    if((x0===x1)===(y0===y1))fail();
    for(let i=0;i<2;i++){
      const previous=own(old,i+1),id=own(old,i+3),oldNode=own(old,i+5);
      if(previous===a||previous===b||own(previous,"id")!==id||own(previous,"_parent")!==null||own(previous,"isConnected")!==false||contains(idMap,id)||contains(treeMap,id)||find(groupKids,previous,64)!==0||find(children,oldNode,9)!==0)fail();
      const proof=i===0?one:two,dot=own(proof,0),point=own(proof,5),x=coordinate(own(point,"x")),y=coordinate(own(point,"y"));
      if(own(wire,i)!==point||own(dot,"connectionPointNode")!==point||own(dot,"_cx")!==x||own(dot,"_cy")!==y||!member(dots,dot)||!member(groupDots,dot)||find(groupKids,dot,64)!==1||find(children,connected(dot,group,idMap,treeMap),9)!==1)fail();
      if(!((x===x0&&y===y0)||(x===x1&&y===y1)))fail();
    }
    if(own(a,"_cx")===own(b,"_cx")&&own(a,"_cy")===own(b,"_cy"))fail();
    return [net,group,line,idMap,treeMap,root,[a,b]];
  }`,
} as const);
