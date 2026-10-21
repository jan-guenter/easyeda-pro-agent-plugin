/** Synthetic original-worker layout, with inert exact excerpts at the admitted
 * positions. Only wrapper factories run; no vendor callback/publisher is called. */
import { currentPcbStringProducerCallbackSources as callbacks } from "./current-pcb-string-producer-callback-fixture.ts";
import { currentPcbStringProducerSources as wrappers } from "./current-pcb-string-producer-fixture.ts";
import { currentPcbStringWorkerGateSources as gates } from "./current-pcb-string-worker-gate-fixture.ts";

export function currentPcbStringWorkerProducerFixture(retainedBatch = false): string {
  let output = '(()=>{let jr=false;globalThis.trapCalls=0;globalThis.console={debug(){trapCalls++},warn(){trapCalls++},error(){trapCalls++},time(){trapCalls++}};class Mb{}class KP extends Mb{';
  const append = (offset: number, part: string): void => {
    if (output.length > offset) { throw new Error("Synthetic worker offset overlaps."); }
    output += " ".repeat(offset - output.length) + part;
  };
  append(9842, gates.publish); append(10_418, gates.received); output += "}class JP extends KP{";
  append(11_813, gates.message); append(12_230, gates.broadcast); append(12_638, gates.post); output += "}";
  output += "\n".repeat(107);
  append(1_701_495, "\nfunction Nd(e){let t=null,s=null,r;return ");
  append(1_847_074, wrappers.serial); output += ";}";
  append(1_847_288, `\nfunction ZA(e,t){let s=${retainedBatch ? "[{}]" : "[]"},r=null,i=null;return `);
  append(1_856_082, wrappers.cooperation); output += ";}function QA(e,t,s=false){let r,i=null;return ";
  append(2_011_176, wrappers.debounce); output += ";}class Gd{constructor(){this.bufferedUploadCloud=this.bufferedStream(";
  append(2_012_435, callbacks.upload); output += ",500)}";
  append(2_012_635, gates.format); output += "set isV2Format(value){this._isV2Format=value}";
  append(2_013_215, gates.readOnly); output += "}class Lg extends Gd{";
  append(2_014_185, "\nbufferedStream(t,s){let r=null,i=null,n=null,a=this;return ");
  append(2_029_707, wrappers.upload); output += ";";
  append(2_029_834, callbacks.buffer); append(2_029_936, callbacks.drain);
  output += "}constructor(){super();this.bufferedPendDataStream=ZA(";
  append(2_103_729, callbacks.cooperation); output += ",10);this.uploadStructure=Nd(";
  append(2_104_024, callbacks.uploadStructure); output += ");this.structure=Nd(QA(";
  append(2_104_240, callbacks.structure); output += ",300));}";
  append(2_108_520, gates.canPublish);
  output += '}const bus=new JP;bus.uuid="12345678-1234-4234-8234-123456789abc";globalThis.PROJECT=new Lg;Object.assign(PROJECT,{uuid:"a".repeat(64),_branchUuid:"b".repeat(32),workerBus:bus,isTemporary:false,isHistoryBack:false,_isV2Format:false,isReady:true});globalThis._TAB_ID_="synthetic-window";})();';
  return output;
}
