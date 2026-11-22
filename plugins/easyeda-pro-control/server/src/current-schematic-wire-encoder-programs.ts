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
