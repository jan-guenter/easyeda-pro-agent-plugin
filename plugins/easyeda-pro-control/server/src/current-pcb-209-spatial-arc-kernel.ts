/** Existing ready circular ArcTrack state only; no bounding-box or graphics
 * factory, constructor, serializer, maintenance or selection operation runs. */
export const CURRENT_PCB_209_SPATIAL_ARC_GUARDS = `
const angles=get("le");retainData(angles);if(Object.getPrototypeOf(angles)!==Object.prototype||Reflect.ownKeys(angles).length!==4||own(angles,"CW")!==0||own(angles,"CCW")!==1||own(angles,"0")!=="CW"||own(angles,"1")!=="CCW"||get("Fr")!==Math.PI*2)bad();
const arc=(value,layer)=>{instance(value,"Oi");const model=instance(own(value,"model"),"vi");retainData(model);
if(own(model,"_stateWatcher")!==value||own(model,"modelType")!=="ArcTrack"||(uint(own(model,"_dataState"))&6)!==0||(uint(own(value,"_dataState"))&4)!==0)bad();
for(const o of [value,model]){const parent=Object.getOwnPropertyDescriptor(o,"_parent");if(parent&&(!Object.hasOwn(parent,"value")||(parent.value!==null&&parent.value!==undefined)))bad();}
const partition=Object.getOwnPropertyDescriptor(model,"_partition");if(partition&&(!Object.hasOwn(partition,"value")||(partition.value!==undefined&&partition.value!=="")))bad();
const com=instance(own(model,"com"),"oie"),keys=Reflect.ownKeys(com);if(keys.length!==4||keys.some(k=>!["layerId","width","locked","net"].includes(k)))bad();retainData(com);
if(own(com,"layerId")!==layer||own(com,"locked")!==false||num(own(com,"width"))<0.05||typeof own(com,"net")!=="string"||!own(com,"net").isWellFormed()||own(com,"net").length>4096)bad();
const base=instance(own(model,"_baseModel"),"tF");retainData(base);const baseKeys=Reflect.ownKeys(base);
if(baseKeys.length!==6||baseKeys.some(k=>!["_center","_radius","_startAngle","_endAngle","_sweep","_arcType"].includes(k)))bad();
const center=instance(own(base,"_center"),"E");retainData(center);num(own(center,"x"));num(own(center,"y"));
if(num(own(base,"_radius"))<=0||![0,1].includes(own(base,"_sweep"))||own(base,"_arcType")!==1)bad();
for(const key of ["_startAngle","_endAngle"]){const angle=num(own(base,key));if(angle<0||angle>get("Fr"))bad();}
const primitiveId=id(own(model,"_globalIndex"));if(ids.has(primitiveId)||scene.length>=256)bad();ids.add(primitiveId);
const box=own(model,"_bbox");if(own(value,"_bbox")!==box)bad();const [a,b,c,d]=bbox(box);
if(regionBounds){const [l,r,bottom,top]=bbox(regionBounds),inside=a>=l&&b<=r&&c>=bottom&&d<=top,outside=b<l||a>r||d<bottom||c>top;if(!inside&&!outside)bad();}
scene.push({value,model,primitiveId,family:"Arc"});};
`;
