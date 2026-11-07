/** Fixed ready-only native Track guards, embedded in the spatial kernel.
 * No constructor, lazy geometry update, maintenance, setter or serializer runs.
 * Existing model AABBs and view/index octagons have distinct original owners. */
export const CURRENT_PCB_209_SPATIAL_TRACK_GUARDS = `
const octagon=o=>{instance(o,"bC");const fields=["minX","maxX","minY","maxY","left_lower_x","right_lower_x","left_upper_x","right_upper_x"],v=fields.map(k=>num(own(o,k)));
if(v[0]>v[1]||v[2]>v[3]||v[4]>v[7]||v[6]>v[5])bad();return v;};
const track=(value,layer)=>{instance(value,"xr");const model=instance(own(value,"model"),"qr");retainData(model);
if(own(model,"_stateWatcher")!==value||own(model,"modelType")!=="Track"||(uint(own(model,"_dataState"))&6)!==0||(uint(own(value,"_dataState"))&4)!==0)bad();
for(const o of [value,model]){const parent=Object.getOwnPropertyDescriptor(o,"_parent");if(parent&&(!Object.hasOwn(parent,"value")||(parent.value!==null&&parent.value!==undefined)))bad();}
const partition=Object.getOwnPropertyDescriptor(model,"_partition");if(partition&&(!Object.hasOwn(partition,"value")||(partition.value!==undefined&&partition.value!=="")))bad();
const com=instance(own(model,"com"),"oie"),comKeys=Reflect.ownKeys(com);if(comKeys.length!==4||comKeys.some(k=>!["layerId","width","locked","net"].includes(k)))bad();retainData(com);
if(own(com,"layerId")!==layer||own(com,"locked")!==false||num(own(com,"width"))<0.05||typeof own(com,"net")!=="string"||!own(com,"net").isWellFormed()||own(com,"net").length>4096)bad();
const base=instance(own(model,"_baseModel"),"bR");retainData(base);
const start=instance(own(base,"_start"),"E"),end=instance(own(base,"_end"),"E");retainData(start);retainData(end);
const sx=num(own(start,"x")),sy=num(own(start,"y")),ex=num(own(end,"x")),ey=num(own(end,"y"));if(sx===ex&&sy===ey)bad();
const primitiveId=id(own(model,"_globalIndex"));if(ids.has(primitiveId)||scene.length>=256)bad();ids.add(primitiveId);
const box=own(model,"_bbox"),[a,b,c,d]=bbox(box),shape=octagon(own(value,"_bbox"));
if(shape[0]!==a||shape[1]!==b||shape[2]!==c||shape[3]!==d)bad();
if(regionBounds){const [l,r,bottom,top]=bbox(regionBounds),inside=a>=l&&b<=r&&c>=bottom&&d<=top,outside=b<l||a>r||d<bottom||c>top;if(!inside&&!outside)bad();}
scene.push({value,model,primitiveId,family:"Line"});};
const trackTree=(tree,layer)=>{instance(tree,"V0");
if(size(own(tree,"changeList"),Set.prototype,0)!==0||size(own(tree,"deadList"),Set.prototype,0)!==0)bad();
const items=values(own(tree,"items"),256);for(const item of items)track(item,layer);
const leaves=new Set,walk=(node,parent,depth)=>{if(depth>16||treeNodes.has(node)||treeNodes.size>=1024)bad();treeNodes.add(node);instance(node,"iy");if(own(node,"parent")!==parent)bad();
const children=own(node,"childs"),n=list(children);if(n===0){if(parent!==null||items.length!==0||own(node,"_octagon")!==null)bad();return;}
const bounds=octagon(own(node,"_octagon"));
for(let i=0;i<n;i++){const child=own(children,String(i)),nested=Object.getPrototypeOf(child)===own(klass("iy"),"prototype"),sub=octagon(own(child,nested?"_octagon":"_bbox"));
if(sub[0]<bounds[0]||sub[1]>bounds[1]||sub[2]<bounds[2]||sub[3]>bounds[3]||sub[4]<bounds[4]||sub[7]>bounds[7]||sub[6]<bounds[6]||sub[5]>bounds[5])bad();
if(nested)walk(child,node,depth+1);else{if(!items.includes(child)||leaves.has(child))bad();leaves.add(child);}}};
walk(own(tree,"root"),null,0);if(leaves.size!==items.length)bad();};
`;
