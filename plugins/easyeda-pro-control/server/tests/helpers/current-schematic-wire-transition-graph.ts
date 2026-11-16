/** Stand-in holders and monitors surround qualified original functions. */
export const WIRE_TRANSITION_GRAPH = `function(){
const refs=this,shapes={shouldUpdateAst:false},old=[{x:0,y:0},{x:1,y:1}],first={x:2,y:3},second={x:7,y:8},points=[first,second],line=Object.assign(Object.create(refs.pointObject.prototype),{shapeManager:shapes,_points:old,isConnected:true}),group={shapeManager:shapes};
const monitor=refs.monitor;monitor.shapeManager=shapes;monitor.onModelAttributeChange=refs.modifyView;
const bbox=Object.assign(Object.create({update:refs.bboxUpdate}),{onModelAttributeChange:refs.bboxAttribute,add:refs.bboxAdd,_tryAddParent:refs.bboxTryParent,_addCoreMethods:refs.core});
const history=Object.assign(Object.create({getGroupModelHistoryCommand:refs.historyGroup}),{onModelAttributeChange:refs.historyAttribute,_tryHandleGroupModelCommand:refs.historyTryGroup});
Object.assign(shapes,{modifyMonitor:monitor,bboxMonitor:bbox,attrWatcher:{onModelAttributeChange:refs.attrWatcher},historyRecorder:history});
const b={shapes,line,group,runner:{_currentAction:{history:"add",status:"running"}},pointBinding:{get:refs.pointsGet,set:refs.pointsSet},setLines:{fn:refs.setLines}},state={owner:null,failed:false,modifyAttempted:true,modifyAcknowledged:false,saveAttempted:false,before:{line,wire:group}},holder=[b,state];state.owner=holder;
const native=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype];
return{refs,holder,native,first,second,points,line,monitor,shapes,counts:{view:0,bbox:0,attr:0,history:0}};}`;
