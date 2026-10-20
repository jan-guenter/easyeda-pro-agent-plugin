/** Self-authored minimal raw graph, not imported vendor code or a live scene.
 * Appends the interaction owners to an existing synthetic scope.object. */
export const CURRENT_PCB_DIAGNOSTIC_INTERACTION_SETUP = `(()=>{
class kF{constructor(){this.nextTool=null;}}
class Fo extends kF{constructor(){super();this.drawing=false;this.filterItems=new Set();}}
class Eh extends Fo{}
class m0e extends Fo{constructor(){super();this.nextTool=new Eh();this.isMouseRightDown=false;this.isMouseMidDown=false;
this.mark=[];this.shiftMoveHelpLine=null;this.wheelData={clearTime:null};}}
class Lpe extends kF{constructor(){super();this.nextTool=new m0e();this.mouseRightDownTimer=null;this.mouseDownStatus=null;}}
class Kme{constructor(){this.scene=[3];this._dropDrag=true;this.needHistoryTool=new Set();}}
class XU{constructor(){
for(const key of ["items","selections","components","tracks","currentPointSelectedItems","selectAnnotations"])this[key]=[];
for(const key of ["lines","drcItems"])this[key]=new Set();
this.selectionOrder=new Map();
for(const key of ["mouseLeftDown","mouseLeftUp","dragging","readyToCopyDragging","keepSelection","isSpecialPaste"])this[key]=false;
}}
class fpe{constructor(){this.control=null;this.lockedLayers=new Set();this.mouseMoveCheck=false;this.mouseAltDown=false;this.hasAlt=false;}}
class Spe{constructor(){this.tool=null;}}class Ume extends Spe{}class cge extends Spe{}
class P1e{constructor(){this.moveTool=null;this._flipping=false;}}
class mge{constructor(){this._type=null;this.isUnmounted=false;this._ui2PCBAboutAttrDataUpdateTimer=null;}}
class c7{constructor(){this.activeToolHistory=null;this.activeToolId=null;}}c7.instance=null;
class De{constructor(){this._commands=[];this.waitingUploadStack=[];this.idMap=new Map();}}
class tge{constructor(){this._control=null;this.dimension=null;this.start=null;this.end=null;
this.startSpots=[];this.highlightedSpots=[];this._historyItems=new Set();this.command=new De();this.initCommandFromOutside=false;}}
class Sy{constructor(){this.currTool=null;this.items=[];this._flipQueue=[];this._onSettleCallbacks=[];this._isProcessingFlip=false;}}
class p_{constructor(){this.items=new Map();}}p_.manager=null;
class KN{constructor(){this.map=new Map();this.updateIds=new Set();}}KN.manager=null;
class Tfe{constructor(){this.mgr=scope.object.zo.manager;this.layerMapSet={};}}
class Qme{constructor(){this.map=new Map();}}class jde extends Qme{}
const Fe=new XU(),Xo=new Sy();Xo.currTool=Fe;
scope.object.zo.manager.layerMapSet={};
Object.assign(scope.object,{Lpe,m0e,Eh,Kme,XU,fpe,Spe,Ume,cge,P1e,mge,Cy:c7,De,tge,$me:Sy,Nn:p_,Hb:KN,Tfe,Qme,jde,
$0:new Lpe(),Pi:new Kme(),Fe,Sr:new fpe(),dl:new Spe(),Yr:new Ume(),ru:new cge(),cm:new P1e(),nu:new mge(),Us:new tge(),
Xo,Wn:new Tfe(),Yh:new Qme(),Ft:new jde()});
})();`;

/** Canonical by-value fixture for transport tests that do not execute the leaf.
 * Matches the raw fixture above. Its single counted entry is Pi.scene[0]. */
export function currentPcbDiagnosticInteractionFixture(): unknown {
  return {
    schema: "easyeda-pro-control.pcb-diagnostic-interaction.v1",
    toolChain: {
      nextMarker: "present", nextKind: "m0e", rightDownTimer: "null", mouseDownMarker: "null", mouseDownButton: null,
      navigation: {
        drawing: false, filterCount: 0, mouseRightDown: false, mouseMidDown: false, markCount: 0, shiftHelp: "null",
        wheelTimer: "null", nextMarker: "present", nextKind: "Eh", idle: { drawing: false, filterCount: 0, next: "null" },
      },
    },
    scene: { modes: [3], dropDrag: true, historyToolCount: 0 },
    selection: {
      counts: { items: 0, selections: 0, components: 0, tracks: 0, lines: 0, points: 0, annotations: 0, drcItems: 0, selectionOrder: 0 },
      mouseLeftDown: false, mouseLeftUp: false, dragging: false, readyToCopyDragging: false,
      keepSelection: false, specialPaste: false, dialog: "absent",
    },
    controllers: {
      pointControl: "null", lockedLayerCount: 0, mouseMoveCheck: false, mouseAltDown: false, hasAlt: false,
      layerTool: "null", routeTool: "null", attributeTool: "null", flipMoveTool: "null", flipping: false,
      toolHistoryMarker: "null", toolHistory: null, attributeType: "null", attributesUnmounted: false, attributeTimer: "null",
      smart: {
        control: "null", dimension: "null", start: "null", end: "null", startSpotCount: 0, highlightSpotCount: 0,
        historyItemCount: 0, commandCount: 0, waitingUploadCount: 0, commandIndexCount: 0, commandFromOutside: false,
      },
      turn: { selectionRelation: "matching", itemCount: 0, queueCount: 0, settleCallbackCount: 0, processing: false },
    },
    secondary: {
      partitions: { marker: "null", count: null }, innerModelMarker: "present", innerModels: { keys: 0, members: 0 },
      innerViews: { keys: 0, members: 0 }, innerViewManagerMatches: true, smartDimensionViews: 0, groupViews: 0,
      retainedLineMarker: "null", retainedLines: null,
    },
    collectionEntries: 1,
  };
}
