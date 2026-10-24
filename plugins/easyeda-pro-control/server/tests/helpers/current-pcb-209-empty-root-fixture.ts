/** Synthetic raw roots only. No vendor asset or project is evaluated. */
import { CURRENT_PCB_209_EMPTY_ROOT_ALIASES } from "../../src/current-pcb-209-empty-root-profile.ts";
import { CURRENT_PCB_209_EMPTY_ROOT_FAMILIES, CURRENT_PCB_209_EMPTY_ROOT_PANEL_ARRAYS } from "../../src/current-pcb-209-empty-root-program.ts";
import { CURRENT_PCB_209_COMMON_MODEL_LOCATIONS } from "../../src/current-pcb-209-common-model-scope.ts";

export const PCB209_EMPTY_ROOT_SETUP = `(()=>{
const aliases=${JSON.stringify(CURRENT_PCB_209_EMPTY_ROOT_ALIASES)},families=${JSON.stringify(CURRENT_PCB_209_EMPTY_ROOT_FAMILIES)};
const roots={};for(const [family,role]of Object.entries(families)){
const c=class{constructor(){this.map=new Map();this._last=undefined;}};c.manager=new c();
if(family==="inner")c.manager.layerMapSet={};
c.getInstance=()=>{vendorCalls++;throw new Error("LAZY_MANAGER");};
scope.object[aliases[role]]=c;roots[family]=c;
}
class Board{constructor(){this._outlineCollect=new Map();this._autoGenerate=false;}}
Board.instance=new Board();scope.object[aliases._s]=Board;
if(!scope.object.ai){class Panel{constructor(){this._param={on:false,success:false};}}Panel.model=new Panel();scope.object.ai=Panel;}
const panel=scope.object.ai.model;for(const name of ${JSON.stringify(CURRENT_PCB_209_EMPTY_ROOT_PANEL_ARRAYS)})panel[name]=[];
panel.borderClosures=[[],[]];panel._param.on=false;panel._param.success=false;
class Node{constructor(){this.parent=null;this.childs=[];}}
class OtherNode{constructor(){this.parent=null;this.childs=[];}}
class Tree{constructor(){this.items=new Set();this.changeList=new Set();this.deadList=new Set();this.root=new Node();}}
class OtherTree{constructor(){this.items=new Set();this.changeList=new Set();this.deadList=new Set();this.root=new OtherNode();}}
class Spatial{constructor(){this.map=new Map();this.otherMap=new Map();this.ratlineMap=new Map();}}
scope.object[aliases.NI]=Node;scope.object[aliases.iy]=OtherNode;scope.object[aliases.Md]=Tree;scope.object[aliases.F0]=OtherTree;
scope.object[aliases.tV]=Spatial;scope.object.Ht=new Spatial();
globalThis.emptyRoots={roots,board:Board.instance,panel,spatial:scope.object.Ht,Tree,OtherTree};
})();`;

export function pcb209EmptyRootScopeReplies(): readonly unknown[] {
  return (["rpc-wrapper", "save-handler"] as const).flatMap(kind => {
    const point = CURRENT_PCB_209_COMMON_MODEL_LOCATIONS[kind];
    return [{ result: { type: "function", className: kind === "rpc-wrapper" ? "Function" : "AsyncFunction", description: "synthetic", objectId: kind } },
      { result: [["length", "number", point.parameterCount], ["name", "string", ""]].map(([name, type, value]) => ({
        name, value: { type, value }, writable: false, configurable: true, enumerable: false, isOwn: true })),
      internalProperties: [
        { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "pcb", lineNumber: point.lineNumber, columnNumber: point.columnNumber } } },
        { name: "[[Prototype]]", value: { type: "function", objectId: "prototype" } },
        { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: `${kind}-scopes` } },
      ] },
      { result: [kind === "rpc-wrapper" ? "Closure (rpcService)" : "Closure", "Global"].map((description, index) => ({ name: String(index),
        value: { type: "object", subtype: "internal#scope", className: "Object", description, objectId: `${kind}-${index}` },
        writable: true, configurable: true, enumerable: true, isOwn: true })) }];
  });
}
