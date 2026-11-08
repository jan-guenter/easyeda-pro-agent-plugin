/** Fixed source guards share only the original immutable body-codebook
 * programs. Their rows, message hashes and effectful resumes stay separate. */
import {currentSchematicRelevanceUiCodecNativeSource} from "./current-schematic-relevance-ui-codec-native-source.ts";
import {currentSchematicRelevanceSdkGatePrograms} from "./current-schematic-relevance-normal-command-ui-native.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CONTROL_CALLS as CALLS} from "./current-schematic-relevance-publication-control-protocol.ts";
import {currentSchematicRelevancePublicationControlCases,currentSchematicRelevancePublicationControlTemplate} from "./current-schematic-relevance-publication-control-wire.ts";

/** Emit closed rows and exact message hashes while reusing the existing SDK
 * program pool; sharing data adds no native control or runtime issuer. */
/** Share byte-identical SDK proof programs while emitting separate publisher
 * rows and smoke hashes. This encoder creates no runtime grant. */
export function currentSchematicRelevancePublicationControlNativeSource():string{
 const cases=currentSchematicRelevancePublicationControlCases();const shared=currentSchematicRelevanceSdkGatePrograms();const programs=[...shared];
 const rows=cases.map(command=>{const row=currentSchematicRelevancePublicationControlTemplate(command);const template=row.template.replaceAll(/__schematic_publicationcontrol_program(\d+)__/gu,(_match,raw:string)=>{const original=CALLS[Number(raw)];if(original===undefined||command.method!=="Runtime.callFunctionOn"||command.params.functionDeclaration!==original[1]){throw new Error("SCH_PUBLICATION_CONTROL_INDEX");}let index=programs.indexOf(original[1]);if(index===-1){index=programs.length;programs.push(original[1]);}return`__schematic_publicationcontrol_program${String(index)}__`;});return[row.phase,row.method,row.names.join(","),template];});
 return currentSchematicRelevanceUiCodecNativeSource({className:"EasyedaSchematicRelevancePublicationControlProtocol",errorCode:"schematic-publication-control-codec",tableError:"SCHEMATIC_PUBLICATION_CONTROL_FIXED_TABLE_BOUND",marker:"publicationcontrol",rows,programs:programs.slice(shared.length),sharedProgramClass:"EasyedaSchematicRelevanceSdkGateProtocol",programIndexes:programs.slice(shared.length).map((_program,i)=>shared.length+i),messages:cases.map(command=>`${JSON.stringify({id:83,method:command.method,params:command.params,sessionId:"original_ui"})}\0`)});
}
