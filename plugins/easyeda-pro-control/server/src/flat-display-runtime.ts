import { canonicalJson, sha256Json } from "./core.ts";
import type { ExpectedContext } from "./engine.ts";
import { assertFlatDisplayBinding, assertFlatDisplayInverse, buildFlatDisplayProjectGuardExpression, flatDisplayOperation } from "./flat-display-binding.ts";
import type { FlatDisplayBinding } from "./flat-display-binding.ts";
import { buildSchematicFlatTopologyExpression, schematicFlatTopologyObservationSchema, verifySchematicFlatTopology } from "./schematic-flat-topology.ts";
import type { SchematicFlatTopologyObservation } from "./schematic-flat-topology.ts";
import { verifyDesignTopology } from "./design-topology.ts";
import { buildSchematicLayoutPayloadCode } from "./schematic-layout-transport.ts";

/** Facade-owned, never part of a public operation schema. The original sealed
 * operation supplies authority, and one fresh observation supplies the exact
 * same-execution comparison. Neither accepts code or a caller-chosen reader.
 */
export interface FlatDisplayRuntimeGuard {
  readonly binding: FlatDisplayBinding;
  readonly operation: unknown;
  readonly context: ExpectedContext;
  readonly observation: SchematicFlatTopologyObservation;
  readonly phase: "before" | "after";
}
export function assertFlatDisplayRuntimeAction(guard: FlatDisplayRuntimeGuard, action: unknown): void {
  const binding = assertFlatDisplayBinding(guard.binding, guard.operation, guard.context);
  if (guard.phase === "before") {
    if (sha256Json(flatDisplayOperation(action)) !== binding.operationSha256) { throw new Error("Flat display writer substituted its sealed action."); }
  } else { assertFlatDisplayInverse(binding, action); }
}

/** Returns {read,check}. All decompression, crypto and metadata awaits finish
 * before check(). The caller MUST invoke check() synchronously inside the final
 * native action callback or directly before Save, then dispatch without await.
 */
export function buildFlatDisplayRuntimeGuard(input: FlatDisplayRuntimeGuard, mode: "idle" | "source-action" = "idle"): string {
  if (mode !== "idle" && mode !== "source-action") { throw new Error("Unknown internal flat display runtime mode."); }
  const guard = structuredClone(input);
  const binding = assertFlatDisplayBinding(guard.binding, guard.operation, guard.context);
  const observation = schematicFlatTopologyObservationSchema.parse(guard.observation), proof = verifySchematicFlatTopology(observation);
  if (guard.phase !== "before" && guard.phase !== "after") { throw new Error("Flat display runtime guard has an unknown phase."); }
  if (canonicalJson(observation.scope) !== canonicalJson({ projectUuid: binding.project.projectUuid, schematicUuid: binding.schematicUuid,
    activePageUuid: binding.pageUuid, activeTabId: binding.tabId, pageIds: [binding.pageUuid] }) ||
    proof.sourceSha256ByPage[binding.pageUuid] !== binding[guard.phase].sourceSha256) {
    throw new Error("Flat display runtime guard differs from its sealed phase and membership.");
  }
  verifyDesignTopology(binding.topology, proof.topology);
  return `(async()=>{
const owner=${buildFlatDisplayProjectGuardExpression(binding.project)};
const namespace=globalThis.SCH,manager=namespace?.docMemoryManager,document=manager?.getActiveDoc?.(),shapes=document?.shapeManager,runner=shapes?.actionRunner,runMethod=runner?.run,consistency=document?.consistencyImpl,sourceMethod=consistency?.getSourceCode,writeMethod=consistency?.setSourceCode,projectManager=document?.projectMgr;
let ownedAction;const token=Object.freeze({});let entered=false,spent=false;
const identity=()=>{owner.check();if(globalThis.SCH!==namespace||namespace?.docMemoryManager!==manager||manager?.getActiveDoc?.()!==document||document?.shapeManager!==shapes||shapes?.actionRunner!==runner||runner?.run!==runMethod||document?.consistencyImpl!==consistency||consistency?.getSourceCode!==sourceMethod||consistency?.setSourceCode!==writeMethod||document?.projectMgr!==projectManager)throw new Error('FLAT_DISPLAY_RECEIVER_DRIFT');};
const flatDisplayActionMatches=(page,shape)=>{identity();return page===document&&shape===shapes&&(ownedAction===undefined?runner?.running===false:runner?.running===true&&runner.currentAction===ownedAction&&ownedAction.status==='running'&&ownedAction.__easyedaFlatDisplayToken===token);};
identity();if(!flatDisplayActionMatches(document,shapes))throw new Error('FLAT_DISPLAY_ACTION_NOT_IDLE');
${buildSchematicLayoutPayloadCode(canonicalJson(observation), "[]")}
const stable=value=>JSON.stringify(value,(_key,entry)=>entry&&typeof entry==='object'&&!Array.isArray(entry)?Object.fromEntries(Object.keys(entry).sort().map(key=>[key,entry[key]])):entry);
const capture=()=>${buildSchematicFlatTopologyExpression(observation.scope, mode === "source-action" ? "flat-display-owned-action" : undefined)};
const check=()=>{identity();if(stable(capture())!==baseline)throw new Error('FLAT_DISPLAY_OBSERVATION_DRIFT');identity();};
${mode === "idle" ? "" : `const run=async(callback)=>{if(spent||entered||typeof runMethod!=='function')throw new Error('FLAT_DISPLAY_ACTION_REUSED');spent=true;check();
return await runMethod.call(runner,async()=>{if(entered)throw new Error('FLAT_DISPLAY_CALLBACK_REUSED');entered=true;identity();const action=runner.currentAction;
if(!action||action.__easyedaFlatDisplayToken!==token||action.status!=='running'||runner.running!==true)throw new Error('FLAT_DISPLAY_FOREIGN_ACTION');ownedAction=action;
try{check();const result=await callback();if(!flatDisplayActionMatches(document,shapes))throw new Error('FLAT_DISPLAY_ACTION_DRIFT');return result;}finally{ownedAction=undefined;}
},{__easyedaFlatDisplayToken:token});};\n`}return{check,read:async()=>{await owner.read();check();}${mode === "source-action" ? ",run,assertWriter:(space,memory,value)=>{identity();if(space!==namespace||memory!==manager||value!==document)throw new Error('FLAT_DISPLAY_WRITER_RECEIVER');}" : ""}};
})()`;
}
