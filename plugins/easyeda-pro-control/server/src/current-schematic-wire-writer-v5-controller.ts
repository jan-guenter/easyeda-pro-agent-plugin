/** Actual original V5 readonly sequence. No source-only title/ft receipt can
 * enter this factory or turn its returned native tuple into a writer grant. */
import {assertOriginalCurrentSchematicWireWriterV5Owner,originalCurrentSchematicWireWriterV5Target} from "./current-schematic-wire-writer-v5-owner.ts";
import type {CurrentSchematicWireWriterV5Owner} from "./current-schematic-wire-writer-v5-owner.ts";
import {requireOriginalCurrentSchematicWireEditPlan} from "./current-schematic-wire-edit-plan.ts";
import type {CurrentSchematicWireEditPlan} from "./current-schematic-wire-edit-plan.ts";
import {requireOriginalCurrentSchematicWireGlobals,requireOriginalCurrentSchematicWireV5TitlePreparation,requireOriginalSchematicWireWriterV5ReadStage} from "./current-pcb-diagnostic-owner.ts";
import type {CurrentSchematicWireV5TitlePreparation,CurrentSchematicWireV5TitleRuntime} from "./current-pcb-diagnostic-owner.ts";
import type {CurrentSchematicWireGlobalsCapture} from "./current-schematic-wire-globals-collector.ts";

const owners=new WeakSet<CurrentSchematicWireWriterV5Owner>();
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_V5_ORIGINAL_CONTROLLER");}}
export class CurrentSchematicWireWriterV5Controller{
 readonly #owner:CurrentSchematicWireWriterV5Owner;readonly #plan:CurrentSchematicWireEditPlan;readonly #original:ReturnType<typeof requireOriginalCurrentSchematicWireEditPlan>;
 #runtime:Promise<CurrentSchematicWireV5TitleRuntime>|null=null;#runtimePacket:CurrentSchematicWireV5TitleRuntime|null=null;
 #title:Promise<CurrentSchematicWireV5TitlePreparation>|null=null;#titlePacket:CurrentSchematicWireV5TitlePreparation|null=null;
 #pending:Promise<CurrentSchematicWireGlobalsCapture>|null=null;#settled=false;#failed=false;#capture:CurrentSchematicWireGlobalsCapture|null=null;
 public constructor(owner:CurrentSchematicWireWriterV5Owner,plan:CurrentSchematicWireEditPlan){
  assertOriginalCurrentSchematicWireWriterV5Owner(owner);const original=requireOriginalCurrentSchematicWireEditPlan(plan);need(originalCurrentSchematicWireWriterV5Target(owner)===original.prepared&&!owners.has(owner));owners.add(owner);this.#owner=owner;this.#plan=plan;this.#original=original;Object.freeze(this);
 }
 #current():void{assertOriginalCurrentSchematicWireWriterV5Owner(this.#owner);need(requireOriginalCurrentSchematicWireEditPlan(this.#plan)===this.#original&&originalCurrentSchematicWireWriterV5Target(this.#owner)===this.#original.prepared);}
 public captureOriginalGlobals():Promise<CurrentSchematicWireGlobalsCapture>{
  this.#current();if(this.#pending!==null){return this.#pending;}
  const task=(async():Promise<CurrentSchematicWireGlobalsCapture>=>{try{
   const args=this.#original.argumentsValue;await this.#owner.openGeneratedSchematicWireWriterV5(args);this.#current();
   await this.#owner.executeSchematicWireWriterV5ReadStage("capture",args);this.#current();
   const packet=await this.#owner.executeSchematicWireWriterV5ReadStage("preflight",args);this.#current();need("schema"in packet);requireOriginalSchematicWireWriterV5ReadStage(this.#owner,args,packet);
   const captured=await this.#owner.captureSchematicWireGlobals(args);this.#current();need(requireOriginalCurrentSchematicWireGlobals(this.#owner,args)===captured);this.#capture=captured;return captured;
  }catch(error){this.#failed=true;throw error;}finally{this.#settled=true;}})();this.#pending=task;return task;
 }
 public requireOriginalGlobals():CurrentSchematicWireGlobalsCapture{this.#current();need(this.#settled&&!this.#failed&&this.#capture!==null);need(requireOriginalCurrentSchematicWireGlobals(this.#owner,this.#original.argumentsValue)===this.#capture);return this.#capture;}
 public prepareOriginalTitles():Promise<CurrentSchematicWireV5TitlePreparation>{
  this.#current();if(this.#title!==null){return this.#title;}const task=(async():Promise<CurrentSchematicWireV5TitlePreparation>=>{try{await this.captureOriginalGlobals();this.#current();const packet=await this.#owner.prepareSchematicWireV5Titles(this.#original.argumentsValue);this.#current();need(requireOriginalCurrentSchematicWireV5TitlePreparation(this.#owner,this.#original.argumentsValue)===packet);this.#titlePacket=packet;return packet;}catch(caughtError){this.#failed=true;throw caughtError;}})();this.#title=task;return task;
 }
 public observeOriginalTitleRuntime():Promise<CurrentSchematicWireV5TitleRuntime>{
  this.#current();if(this.#runtime!==null){return this.#runtime;}const task=(async():Promise<CurrentSchematicWireV5TitleRuntime>=>{try{await this.prepareOriginalTitles();this.#current();const packet=await this.#owner.observeSchematicWireV5Titles(this.#original.argumentsValue);this.#current();this.#runtimePacket=packet;return packet;}catch(caughtError){this.#failed=true;throw caughtError;}})();this.#runtime=task;return task;
 }
 public inspect():Readonly<{profile:"private.current-schematic-wire-writer-v5-controller.v1";started:boolean;settled:boolean;failed:boolean;originalGlobalsQualified:boolean;continuousGlobalsVerified:false;originalGlobalsReproofsComplete:boolean;titleDriverPrepared:boolean;titleRuntimeJoined:boolean;executionAuthorized:false;saveAuthorized:false}>{
  this.#current();return Object.freeze({profile:"private.current-schematic-wire-writer-v5-controller.v1",started:this.#pending!==null,settled:this.#settled,failed:this.#failed,originalGlobalsQualified:this.#capture!==null,continuousGlobalsVerified:false,originalGlobalsReproofsComplete:this.#titlePacket!==null&&!this.#failed,titleDriverPrepared:this.#titlePacket!==null,titleRuntimeJoined:this.#runtimePacket!==null&&!this.#failed,executionAuthorized:false,saveAuthorized:false});
 }
}
