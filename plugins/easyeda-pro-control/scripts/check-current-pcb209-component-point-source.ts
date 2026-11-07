/** Source/cost checkpoint only. Exact installed methods run on inert local
 * geometry/cache objects; no app, native owner, SDK or library factory runs. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { CURRENT_PCB_209_COMPONENT_POINT_FUNCTION_PROFILES as PROFILES, deriveCurrentPcb209ComponentPointBudget,
  inspectCurrentPcb209ComponentPointSource } from "../server/src/current-pcb-209-component-point-source-profile.ts";
import { CURRENT_PCB_209_SPATIAL_SOURCE_PROFILE } from "../server/src/current-pcb-209-spatial-source-profile.ts";

async function main(): Promise<void> {
  const source = await readFile(join(process.argv[2] ?? "/mnt/c/Program Files/easyeda-pro/resources/app/assets", CURRENT_PCB_209_SPATIAL_SOURCE_PROFILE.relativePath), "utf8");
  assert.equal(inspectCurrentPcb209ComponentPointSource(source).sourceProfileMatches, true);
  const text = (key:string):string => { const profile = PROFILES.find(row => row.key === key); assert.ok(profile !== undefined); return source.slice(profile.sourceStart,profile.sourceEnd); };
  const code = `let JJ=0,lM=0;${text("BLe")};
const Ys=class{static ${text("Ys.normal")}},E=${text("E.class")};E.ORIGIN=new E(0,0);
const at=${text("at.class")},IQ=${text("IQ.class")},Ae=${text("Ae.class")},ws=${text("ws.class")},xe=${text("xe.class")};
const t_={getCache:()=>{throw new Error("Unentered box-cache constructor branch");}};
const Dm=class{${text("Dm.getItem")}},Cache=class{${text("lC.getLayeredBoxMap")}},cache=Object.create(Cache.prototype),Ji=Object.assign(Object.create(Dm.prototype),{map:new Map()});
const local=new at(-10,10,-10,10);cache._layeredBoxMap={1:local};Ji.map.set("fixed",cache);
const ye={getLayer:id=>{if(id!==1)throw new Error("Unentered layer branch");return{visible:true};}};
${text("gqe")};${text("yqe")};
const Model=class{${["xi.get:footprintUUID","xi.get:position","xi.get:rotation","xi.get:layerId","xi.get:locked","xi.inShape"].map(key => text(key)).join("\n")}};
const View=class{${["qs.getParent","Le.get:footprintUUID","Le.get:position","Le.get:rotation","Le.get:layerId","Le.getVisibleBBox","Le.getLayerIsVisible","Le.isSelect","Le.getPads"].map(key => text(key)).join("\n")}};
const model=Object.assign(Object.create(Model.prototype),{_footprintUUID:"fixed",_position:new E(0,0),_rotation:0,box:new ws(1,local.LL(),local.UL(),local.LR(),local.UR(),false,local)});
const view=Object.assign(Object.create(View.prototype),{model,_parent:null,pads:[]});
const e0={${text("e0.hypot")}};${text("j1")};const Me={smartMode:false},Style=${text("tC.class")};
const Template=class{${["tE.get:layerId","tE.get:top","tE.get:locked","tE.get:padType","tE.isPolygon"].map(key => text(key)).join("\n")}};
const Placed=class{${["rE.get:layerId","rE.get:top","rE.get:center","rE.get:rotation","rE.get:model","rE.inShape","rE.isPolygon"].map(key => text(key)).join("\n")}};
const Pad=class{${text("Mi.isSelect")}};
const style=Object.assign(Object.create(Style.prototype),{type:"ELLIPSE",width:20,height:20});
const template=Object.assign(Object.create(Template.prototype),{_layerId:1,_top:style,_locked:false,_padType:0});
const placed=Object.assign(Object.create(Placed.prototype),{_model:template,_layerId:1,_top:null,position:new E(0,0),_rotation:0});
const pad=Object.assign(Object.create(Pad.prototype),{model:placed,smartPad:undefined});view.pads.push(pad);
const prefilter={${text("g0.doAction")}};const rows=[];ws._modify=false;
for(const[x,y]of[[0,0],[9,9],[10,0],[10,10],[11,0]]){Object.assign(prefilter,{x,y,isClick:true});rows.push([prefilter.doAction(view),view.isSelect(x,y),prefilter.doAction(pad),pad.isSelect(x,y),ws._modify]);}
const before=[model.box._bbox.minX,model.box._bbox.maxX,model.box._bbox.minY,model.box._bbox.maxY];model._position=new E(5,0);ws._modify=false;const translated=view.isSelect(5,0,true),translatedScratch=ws._modify;
model._position=new E(0,0);model._rotation=Math.PI/2;ws._modify=false;const rotated=view.isSelect(0,0,true),rotatedScratch=ws._modify;
JSON.parse(JSON.stringify({rows,translated,translatedScratch,rotated,rotatedScratch,storedBoundsUnchanged:JSON.stringify(before)===JSON.stringify([model.box._bbox.minX,model.box._bbox.maxX,model.box._bbox.minY,model.box._bbox.maxY])}));`;
  const result:unknown = runInNewContext(code,{}, {timeout:1000});
  assert.equal(JSON.stringify(result),JSON.stringify({rows:[[true,true,true,true,false],[true,true,false,false,false],[true,true,true,true,false],[true,true,false,false,false],[false,false,false,false,false]],
    translated:true,translatedScratch:true,rotated:true,rotatedScratch:true,storedBoundsUnchanged:true}));
  process.stdout.write(`${JSON.stringify({sourceProfileMatches:true,qualifiedSourceSpans:PROFILES.length,actualIdentityGeometryCases:5,actualScratchMutationCases:2,
    onePoint:deriveCurrentPcb209ComponentPointBudget(1),sixteenPoints:deriveCurrentPcb209ComponentPointBudget(16),existingBirthAdmitted:false,nativePurposeIssued:false,connectedAcceptance:false})}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- Await this bounded offline source/data CLI only.
await main();
