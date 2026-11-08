import {currentSchematicRelevanceNotificationCases,currentSchematicRelevanceNotificationTemplate} from "./current-schematic-relevance-notification-wire.ts";
import type {CurrentSchematicRelevanceNotificationWireCommand} from "./current-schematic-relevance-notification-wire.ts";
import {currentSchematicRelevanceSdkGateCases,currentSchematicRelevanceSdkGateTemplate} from "./current-schematic-relevance-sdk-gate-wire.ts";
import type {CurrentSchematicRelevanceSdkGateCommand} from "./current-schematic-relevance-sdk-gate-protocol.ts";
/** Five independently bounded fixed codebooks share the existing exact encoder.
 * Their public facade preserves all original CDP command bytes. */
import {currentSchematicRelevanceUiCodecNativeSource} from "./current-schematic-relevance-ui-codec-native-source.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_NORMAL_COMMAND_UI_CALLS as CALLS} from "./current-schematic-relevance-normal-command-ui-protocol.ts";
import type {CurrentSchematicRelevanceNormalCommandUiCommand as NormalCommand} from "./current-schematic-relevance-normal-command-ui-protocol.ts";
import {currentSchematicRelevanceNormalCommandUiCases,currentSchematicRelevanceNormalCommandUiTemplate} from "./current-schematic-relevance-normal-command-ui-wire.ts";

type Command=NormalCommand|CurrentSchematicRelevanceSdkGateCommand|CurrentSchematicRelevanceNotificationWireCommand;
function notification(command:Command):command is CurrentSchematicRelevanceNotificationWireCommand{return command.phase.startsWith("notification-");}
function sdk(command:Command):command is CurrentSchematicRelevanceSdkGateCommand{return command.phase.startsWith("sdk-");}
function active(command:Command):boolean{return !notification(command)&&command.phase==="call"&&command.role.startsWith("active-")||command.phase==="frame"&&command.stage.startsWith("active-");}
function stores(command:Command):boolean{return !notification(command)&&command.phase==="call"&&["store-","entry-","changed-","notify-"].some(prefix=>command.role.startsWith(prefix));}
/** Choose the immutable notification, SDK-gate or normal-command template for this closed command union.
 * Each selected encoder retains its own phase and fixed-program validation.
 */
function chooseTemplate(command:Command):ReturnType<typeof currentSchematicRelevanceNormalCommandUiTemplate>{if(notification(command)){return currentSchematicRelevanceNotificationTemplate(command);}if(sdk(command)){return currentSchematicRelevanceSdkGateTemplate(command);}return currentSchematicRelevanceNormalCommandUiTemplate(command);}
interface Source {readonly code:string;readonly programs:readonly string[]}
/** Build a fixed codebook and remap only validated program placeholders into its deduplicated program list.
 * An optional prior codebook contributes exact shared programs; every generated row keeps its original wire-message hash.
 */
function source(className:string,cases:readonly Command[],shared?:Readonly<{className:string;programs:readonly string[]}>):Source{const programs:string[]=[...(shared?.programs??[])];const rows=cases.map(command=>{const row=chooseTemplate(command);const template=row.template.replaceAll(/__schematic_normalcommandui_program(\d+)__/gu,(_,raw:string)=>{let program:string;if(sdk(command)||notification(command)){if(command.method!=="Runtime.callFunctionOn"){throw new Error("SCH_SDK_GATE_PROGRAM_KIND");}program=command.params.functionDeclaration;}else{const original=CALLS[Number(raw)];if(original===undefined||command.method!=="Runtime.callFunctionOn"||command.params.functionDeclaration!==original[1]){throw new Error("SCH_NORMAL_COMMAND_PROGRAM_INDEX");}program=original[1];}let index=programs.indexOf(program);if(index===-1){index=programs.length;programs.push(program);}return `__schematic_normalcommandui_program${String(index)}__`;});return[row.phase,row.method,row.names.join(","),template];});const common=shared?.programs.length??0;const code=currentSchematicRelevanceUiCodecNativeSource({className,errorCode:"schematic-normal-command-ui-codec",tableError:"SCHEMATIC_NORMAL_COMMAND_UI_FIXED_TABLE_BOUND",marker:"normalcommandui",rows,programs:programs.slice(common),...(shared===undefined?{}:{sharedProgramClass:shared.className,programIndexes:programs.slice(common).map((_,index)=>common+index)}),exportPrograms:className==="EasyedaSchematicRelevanceNormalCommandBodyProtocol"||className==="EasyedaSchematicRelevanceSdkGateProtocol",messages:cases.map(command=>`${JSON.stringify({id:83,method:command.method,params:command.params,sessionId:"original_ui"})}\0`)});return{code,programs};}
/** Return only immutable build data in the exact exported C# body-table
 * order, so another fixed codec can reuse bytes without copying its index recipe. */
export function currentSchematicRelevanceNormalCommandBodyPrograms():readonly string[]{return Object.freeze([...source("EasyedaSchematicRelevanceNormalCommandBodyProtocol",currentSchematicRelevanceNormalCommandUiCases().filter(command=>!active(command)&&!stores(command))).programs]);}
/** Reuse the exact SDK/body program pool for original post-park reproof,
 * preserving the independently fixed rows and once-only native controls. */
export function currentSchematicRelevanceSdkGatePrograms():readonly string[]{const shared={className:"EasyedaSchematicRelevanceNormalCommandBodyProtocol",programs:currentSchematicRelevanceNormalCommandBodyPrograms()};return Object.freeze([...source("EasyedaSchematicRelevanceSdkGateProtocol",currentSchematicRelevanceSdkGateCases(),shared).programs]);}
/** Compose the active, body, store and notification codebooks behind the fixed phase dispatcher.
 * Notifications share the body program table, while each book retains its complete protocol smoke checks.
 */
export function currentSchematicRelevanceNormalCommandUiNativeSource():string{
 const cases:readonly Command[]=[...currentSchematicRelevanceNormalCommandUiCases(),...currentSchematicRelevanceSdkGateCases(),...currentSchematicRelevanceNotificationCases()];
 const bodySource=source("EasyedaSchematicRelevanceNormalCommandBodyProtocol",cases.filter(command=>!active(command)&&!stores(command)&&!notification(command)&&!sdk(command)));
 const shared={className:"EasyedaSchematicRelevanceNormalCommandBodyProtocol",programs:bodySource.programs};
 const activeSource=source("EasyedaSchematicRelevanceNormalCommandActiveProtocol",cases.filter(command=>active(command)),shared);
 const storesSource=source("EasyedaSchematicRelevanceNormalCommandStoresProtocol",cases.filter(command=>stores(command)),shared);
 const sdkSource=source("EasyedaSchematicRelevanceSdkGateProtocol",cases.filter(command=>sdk(command)),shared);
 const notificationsSource=source("EasyedaSchematicRelevanceNotificationProtocol",cases.filter(command=>notification(command)),shared);
 return `${activeSource.code}\n${bodySource.code}\n${storesSource.code}\n${sdkSource.code}\n${notificationsSource.code}\npublic static class EasyedaSchematicRelevanceNormalCommandUiProtocol{
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){return phase!=null&&phase.StartsWith("sdk-",System.StringComparison.Ordinal)?EasyedaSchematicRelevanceSdkGateProtocol.Encode(id,session,phase,method,fields):phase!=null&&phase.StartsWith("notification-",System.StringComparison.Ordinal)?EasyedaSchematicRelevanceNotificationProtocol.Encode(id,session,phase,method,fields):phase!=null&&(phase.StartsWith("call-active-",System.StringComparison.Ordinal)||phase.StartsWith("frame-active-",System.StringComparison.Ordinal))?EasyedaSchematicRelevanceNormalCommandActiveProtocol.Encode(id,session,phase,method,fields):phase!=null&&(phase.StartsWith("call-store-",System.StringComparison.Ordinal)||phase.StartsWith("call-entry-",System.StringComparison.Ordinal)||phase.StartsWith("call-changed-",System.StringComparison.Ordinal)||phase.StartsWith("call-notify-",System.StringComparison.Ordinal))?EasyedaSchematicRelevanceNormalCommandStoresProtocol.Encode(id,session,phase,method,fields):EasyedaSchematicRelevanceNormalCommandBodyProtocol.Encode(id,session,phase,method,fields);}
public static void VerifySmoke(){EasyedaSchematicRelevanceNormalCommandActiveProtocol.VerifySmoke();EasyedaSchematicRelevanceNormalCommandBodyProtocol.VerifySmoke();EasyedaSchematicRelevanceNormalCommandStoresProtocol.VerifySmoke();EasyedaSchematicRelevanceNotificationProtocol.VerifySmoke();EasyedaSchematicRelevanceSdkGateProtocol.VerifySmoke();}
}`;}
