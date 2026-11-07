/** The point path reads only existing circular copper Pad geometry. Parent,
 * polygon, smart-pad and refresh branches are excluded before any hit call. */
export const CURRENT_PCB_209_SPATIAL_PAD_GUARDS = `
const noParent=o=>{const d=Object.getOwnPropertyDescriptor(o,"_parent");if(d&&(!Object.hasOwn(d,"value")||d.value!==null&&d.value!==undefined))bad();};
const pad=(value,layer)=>{instance(value,"Mi");absent(value,"_smartPad");noParent(value);
const model=instance(own(value,"model"),"tE");retainData(model);noParent(model);
if(own(model,"_stateWatcher")!==value||own(model,"modelType")!=="Pad"||(uint(own(model,"_dataState"))&6)!==0||(uint(own(value,"_dataState"))&4)!==0||own(model,"_locked")!==false||own(model,"_padType")!==0||own(model,"_layerId")!==layer||num(own(model,"_rotation"))!==0)bad();
const partition=Object.getOwnPropertyDescriptor(model,"_partition");if(partition&&(!Object.hasOwn(partition,"value")||partition.value!==undefined&&partition.value!==""))bad();
const center=instance(own(model,"_center"),"E");retainData(center);const x=num(own(center,"x")),y=num(own(center,"y"));
const shape=instance(own(model,layer===1?"_top":"_bottom"),"tC");retainData(shape);const width=num(own(shape,"width"));if(own(shape,"type")!=="ELLIPSE"||width<=0||own(shape,"height")!==width)bad();
const radius=width/2,box=own(model,"_bbox"),b=bbox(box);if(own(value,"_bbox")!==box||b[0]!==x-radius||b[1]!==x+radius||b[2]!==y-radius||b[3]!==y+radius)bad();
const primitiveId=id(own(model,"_globalIndex"));if(ids.has(primitiveId)||scene.length>=256)bad();ids.add(primitiveId);scene.push({value,model,primitiveId,family:"Pad"});};
`;
