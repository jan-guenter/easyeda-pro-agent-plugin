/** Source-only one-String command observation, separate from empty preflight.
 * PCB217199c8: G6@4735551, De@7916638, kde@7922234,
 * string-create@10393717, Sfe@9092131. No command or Save is executed.
 */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS } from "./current-pcb-constructor-scope.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_TEARDROP_OWNER_FRAGMENT } from "./current-pcb-teardrop-owner-program.ts";
import { CURRENT_PCB_STRING_OBSERVATION_GUARDS, decodeCurrentPcbStringObservation } from "./current-pcb-string-observation-core.ts";
import type { CURRENT_PCB_STRING_OBSERVATION_LIMITS } from "./current-pcb-string-observation-core.ts";

/** Fixed scope/callback callFunctionOn, effect checking required. This exact
 * history is conditional on one accepted native String create and no further
 * commands. A pending teardrop timer is reported, never called or cleared.
 * The same command shape can remain after Save; phase/completion are not inferred.
 * Arguments are original callback, admitted diagnostic/precreate constructors,
 * and the original six-bound-callback teardrop proof. These are retained runner
 * handles, never caller-supplied tuples or source-shaped replacement owners.
 */
export const CURRENT_PCB_STRING_COMMAND_STATE_FUNCTION = `function(originalCallback,constructors,teardropProof){
${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const scope=object(own(this,"object")),klass=n=>{const c=own(scope,n);if(typeof c!=="function")bad();return c;};
${CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS.diagnostic}
${CURRENT_PCB_TEARDROP_OWNER_FRAGMENT}
const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,"prototype"))bad();return o;};
const ec=klass("x"),env=instance(own(ec,"env"),ec),documentUuid=id(own(env,"_id"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);
if(own(env,"_doctype")!==3)bad();
const history=constructorInstance(own(scope,"Xe"),"kde"),stack=instance(own(history,"stack"),klass("De"));
if(Reflect.ownKeys(stack).length!==9)bad();
if(arraySize(own(history,"undoCommand"))!==0||arraySize(own(history,"redoCommand"))!==0||
own(stack,"description")!=="create texts for api"||own(stack,"refreshService")!==true||
own(stack,"needCheckFilterCommand")!==true||own(stack,"_partitionNeedAskBeforeDelete")!==false||
own(stack,"createPartitionFile")!==false||own(stack,"sendCopperOrderChange")!==false||
arraySize(own(stack,"waitingUploadStack"))!==0)bad();
emptyMap(own(stack,"idMap"));const commands=own(stack,"_commands");if(arraySize(commands)!==1)bad();
const command=instance(own(commands,"0"),klass("G6")),primitiveId=id(own(command,"gId"),/^[a-f0-9]{16}$/);
if(Reflect.ownKeys(command).length!==6)bad();
if(own(command,"action")!=="add"||own(command,"groupId")!==undefined||own(command,"groupName")!==null||
own(command,"number")!==-1||marker(command,"source")!=="undefined"||marker(command,"data")!=="absent")bad();
const mc=klass("bo"),manager=instance(own(mc,"manager"),mc),map=own(manager,"map");
if(size(map,Map.prototype)!==1)bad();
const model=instance(Reflect.apply(own(Map.prototype,"get"),map,[primitiveId]),klass("rd"));
if(own(model,"_globalIndex")!==primitiveId||own(model,"modelType")!=="Text"||
own(instance(own(scope,"Jr"),klass("t7")),"mgr")!==manager)bad();
const upload=n=>{const c=klass(n),p=instance(own(c,"proxy"),c);return emptySet(own(p,"data"));};
const bc=klass("pE"),board=instance(own(bc,"proxy"),bc);if(own(board,"flag")!==false)bad();
const uploads={boardFlag:false,pouredIds:upload("qI"),innerLayerIds:upload("e5")};
const tears=constructorInstance(teardropOwner,"Sfe");
if(own(tears,"isMove")!==false||own(tears,"suspend")!==true)bad();
const teardrop={modify:emptySet(own(tears,"modify")),task:emptySet(own(tears,"task")),
modifyTears:emptySet(own(tears,"modifyTears")),timer:marker(tears,"timeoutId")};
if(teardrop.timer!=="null"&&teardrop.timer!=="present")bad();
if(teardrop.timer==="present")count(own(tears,"timeoutId"));
verifyConstructorAssociations();verifyTeardropOwner();verify();if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
return JSON.stringify({schema:"easyeda-pro-control.pcb-string-command-state.v1",documentUuid,primitiveId,
history:{undoCount:0,redoCount:0,commandCount:1,waitingUploadCount:0,idMapCount:0,commandType:"G6",action:"add",
source:"undefined",data:"absent",description:"create texts for api"},uploads,teardrop});
}`;

const empty = z.array(z.never()).length(0);
const zero = z.literal(0).refine(value => !Object.is(value, -0));
const schema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-string-command-state.v1"),
  documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
  primitiveId: z.string().regex(/^[a-f\d]{16}$/u),
  history: z.object({ undoCount: zero, redoCount: zero, commandCount: z.literal(1), waitingUploadCount: zero,
    idMapCount: zero, commandType: z.literal("G6"), action: z.literal("add"), source: z.literal("undefined"),
    data: z.literal("absent"), description: z.literal("create texts for api") }).strict(),
  uploads: z.object({ boardFlag: z.literal(false), pouredIds: empty, innerLayerIds: empty }).strict(),
  teardrop: z.object({ modify: empty, task: empty, modifyTears: empty, timer: z.enum(["null", "present"]) }).strict(),
}).strict();
export type CurrentPcbStringCommandState = Readonly<z.infer<typeof schema>> & typeof CURRENT_PCB_STRING_OBSERVATION_LIMITS;
export function decodeCurrentPcbStringCommandState(input: unknown): CurrentPcbStringCommandState {
  return decodeCurrentPcbStringObservation(input, schema);
}
export const CURRENT_PCB_STRING_COMMAND_STATE_SHA256 = createHash("sha256")
  .update(CURRENT_PCB_STRING_COMMAND_STATE_FUNCTION).digest("hex");
