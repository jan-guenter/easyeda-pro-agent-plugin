/** Fixed same-realm comparison for Inspector-qualified references.
 *
 * graph is [binding, state, page, consistency, handler, ids, idMap, sourceMap,
 * before, tree]. Peer references are six [sceneRow, model, prototype, uploadTo]
 * groups in original source-map order. Only the enclosing original observer
 * can qualify the handles. This helper deliberately calls no vendor method.
 */
export const CURRENT_SCHEMATIC_WIRE_ENCODER_MEMBERSHIP_PROGRAM = String.raw`function(native,graph,
  row0,model0,proto0,upload0,row1,model1,proto1,upload1,row2,model2,proto2,upload2,
  row3,model3,proto3,upload3,row4,model4,proto4,upload4,row5,model5,proto5,upload5) {
  "use strict";
  const get=native[0],proto=native[2],has=native[4],keys=native[5],apply=native[6],array=native[7];
  const mapGet=native[8],mapEach=native[10],mapSize=native[11],arrayProto=native[16],mapProto=native[17];
  const bad=()=>{throw "WIRE_ENCODER_MEMBERSHIP";};
  const own=(o,key)=>{
    const d=get(o,key);
    if(!d||!has(d,"value"))bad();
    return d.value;
  };
  const dense=(values,count)=>{
    if(!array(values)||proto(values)!==arrayProto||own(values,"length")!==count||keys(values).length!==count+1)bad();
    for(let i=0;i<count;i++)own(values,i);
  };
  dense(this,2);dense(graph,10);
  const peers=[[row0,model0,proto0,upload0],[row1,model1,proto1,upload1],[row2,model2,proto2,upload2],
    [row3,model3,proto3,upload3],[row4,model4,proto4,upload4],[row5,model5,proto5,upload5]];
  const binding=own(graph,0),state=own(graph,1),page=own(graph,2),consistency=own(graph,3),handler=own(graph,4);
  const ids=own(graph,5),idMap=own(graph,6),sourceMap=own(graph,7),before=own(graph,8),tree=own(graph,9);
  if(own(this,0)!==binding||own(this,1)!==state||own(state,"owner")!==this||own(state,"failed")!==false||
    own(state,"saveAttempted")!==false||own(state,"before")!==before||own(before,"tree")!==tree||
    own(binding,"page")!==page||own(binding,"consistency")!==consistency||own(binding,"handler")!==handler||
    own(binding,"ids")!==ids||own(binding,"index")!==idMap||own(page,"consistencyImpl")!==consistency||
    own(page,"idManager")!==ids||own(consistency,"decodeAndRealTimeSyncHandler")!==handler||
    own(handler,"docManager")!==page||own(handler,"sourceCodeIdMap")!==sourceMap||own(ids,"idMap")!==idMap)bad();
  dense(tree,6);
  if(proto(idMap)!==mapProto||proto(sourceMap)!==mapProto||keys(sourceMap).length!==0||keys(idMap).length!==0||
    apply(mapSize,idMap,[])!==8||apply(mapSize,sourceMap,[])!==6)bad();
  const seen=[];
  apply(mapEach,sourceMap,[(value,id)=>{
    if(seen.length===6||typeof id!=="string"||value!==1)bad();
    const peer=peers[seen.length];
    const row=peer[0],model=peer[1],parent=peer[2],method=peer[3];
    if(own(row,"id")!==id||own(row,"model")!==model||apply(mapGet,idMap,[id])!==model||
      proto(model)!==parent||get(model,"uploadTo")!==undefined||typeof method!=="function")bad();
    const actual=get(parent,"uploadTo");
    if(!actual||!has(actual,"value")||actual.value!==method||!actual.writable||actual.enumerable||!actual.configurable)bad();
    let found=false;
    for(let i=0;i<6;i++){
      if(own(tree,i)===row)found=true;
      if(i<seen.length&&seen[i]===model)bad();
    }
    if(!found)bad();
    seen[seen.length]=model;
  }]);
  if(seen.length!==6)bad();
  return true;
}`;

export const CURRENT_SCHEMATIC_WIRE_ENCODER_RETURN_PROGRAM = String.raw`function(native,encoder,handlerReturn,writerReturn) {
  "use strict";
  const get=native[0],has=native[4],is=native[3];
  const own=(o,key)=>{
    const d=get(o,key);
    if(!d||!has(d,"value"))throw "WIRE_ENCODER_RETURN";
    return d.value;
  };
  if(this!==encoder||own(handlerReturn,0)!==this||typeof own(handlerReturn,1)!=="string"||
    !is(own(handlerReturn,1),own(writerReturn,0)))throw "WIRE_ENCODER_RETURN";
  return true;
}`;

/** Derive the existing membership inputs from the original preflight holder.
 * The application-owned source map is distinct from the saved before copy. */
export const CURRENT_SCHEMATIC_WIRE_ENCODER_BEFORE_GRAPH_PROGRAM = String.raw`function(native) {
  "use strict";
  const get=native[0],proto=native[2],has=native[4],keys=native[5],apply=native[6],array=native[7];
  const mapGet=native[8],mapEach=native[10],mapSize=native[11],objectProto=native[15],arrayProto=native[16],mapProto=native[17];
  const bad=()=>{throw "WIRE_ENCODER_BEFORE_GRAPH";};
  const own=(object,key)=>{
    const field=get(object,key);
    if(!field||!has(field,"value"))bad();
    return field.value;
  };
  const dense=(values,count)=>{
    if(!array(values)||proto(values)!==arrayProto||own(values,"length")!==count||keys(values).length!==count+1)bad();
    for(let i=0;i<count;i++)own(values,i);
  };
  dense(this,2);
  const binding=own(this,0),state=own(this,1);
  if(proto(binding)!==objectProto||proto(state)!==objectProto||own(state,"owner")!==this||
    own(state,"failed")!==false||own(state,"modifyAttempted")!==false||own(state,"modifyAcknowledged")!==false||
    own(state,"saveAttempted")!==false||own(state,"saveAcknowledged")!==false||own(state,"after")!==null)bad();
  const guard=get(state,"guard");
  if(!guard||!has(guard,"value")||typeof guard.value!=="function"||guard.writable||guard.configurable||!guard.enumerable)bad();
  const page=own(binding,"page"),consistency=own(binding,"consistency"),handler=own(binding,"handler"),ids=own(binding,"ids");
  const idMap=own(binding,"index"),sourceMap=own(handler,"sourceCodeIdMap"),before=own(state,"before"),tree=own(before,"tree");
  if(own(page,"consistencyImpl")!==consistency||own(page,"idManager")!==ids||
    own(consistency,"decodeAndRealTimeSyncHandler")!==handler||own(handler,"docManager")!==page||own(ids,"idMap")!==idMap)bad();
  dense(tree,6);
  if(proto(idMap)!==mapProto||proto(sourceMap)!==mapProto||keys(idMap).length!==0||keys(sourceMap).length!==0||
    apply(mapSize,idMap,[])!==8||apply(mapSize,sourceMap,[])!==6)bad();
  const snapshot=own(before,"sourceMap");
  if(snapshot===sourceMap||proto(snapshot)!==mapProto||keys(snapshot).length!==0||apply(mapSize,snapshot,[])!==6)bad();
  const result=[[binding,state,page,consistency,handler,ids,idMap,sourceMap,before,tree]];
  apply(mapEach,sourceMap,[(value,id)=>{
    if(result.length>=19||typeof id!=="string"||value!==1||apply(mapGet,snapshot,[id])!==1)bad();
    let row=null;
    for(let i=0;i<6;i++){
      const candidate=own(tree,i);
      if(own(candidate,"id")===id){if(row!==null)bad();row=candidate;}
    }
    if(row===null)bad();
    const model=own(row,"model"),parent=proto(model);
    if(apply(mapGet,idMap,[id])!==model||parent===null||get(model,"uploadTo")!==undefined)bad();
    const method=get(parent,"uploadTo");
    if(!method||!has(method,"value")||typeof method.value!=="function"||!method.writable||method.enumerable||!method.configurable)bad();
    const offset=result.length;
    result[offset]=row;result[offset+1]=parent;result[offset+2]=method.value;
  }]);
  if(result.length!==19)bad();
  return result;
}`;
