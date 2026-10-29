/** Synthetic receiver tree for descriptor-only allocation tests. No methods run. */
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_COPY_CREATE_METHOD_CALLS as METHODS } from "../../src/current-footprint-copy-create-bindings.ts";

export function allocationVmFixture(): ReturnType<typeof createContext> {
  const context = createContext({});
  runInContext(`let calls=0;class Gd{uploadLocal(){calls++;}}class Lg extends Gd{}class Pi{get newTicket(){calls++;return 1;}}class ar extends Pi{}
class Tg extends ar{async create(){calls++;}buildString(){calls++;}canvasString(){calls++;}getCanvasData(){calls++;}get(){calls++;}}
class zy{}class Vc extends zy{}class ja extends Vc{setDoctype(){calls++;}}class Mb{}class KP extends Mb{}class JP extends KP{}
const bus=new JP,manager=new Tg,consistency=new ja,constructors=[Tg,ar,Pi,ja,Vc,zy,Lg,Gd,JP,KP,Mb];
globalThis.PROJECT=new Lg;PROJECT.uuid='${"b".repeat(64)}';PROJECT.workerBus=bus;PROJECT.footprint=manager;PROJECT.consistencyManager=consistency;
manager.projectManager=PROJECT;manager.user=undefined;
const methods=(${METHODS.capture.program}).call(PROJECT,bus,manager,consistency,constructors);
const argument={uuid:'${"a".repeat(16)}',path:PROJECT.uuid,isProject:true,docType:4,title:'Copy',display_title:'Copy',description:'',custom_tags:'[]',source:'',version:''};
const input={data:argument},build=[manager,input,argument,false,'${"c".repeat(16)}'],create=[manager,argument],wrapper=[PROJECT,bus,manager,consistency,constructors,methods,argument,Array.from(methods),JSON.stringify(argument),PROJECT.uuid];`, context);
  return context;
}
