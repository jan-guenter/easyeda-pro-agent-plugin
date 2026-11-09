/** Fixed clone/native class; original state and messages remain purpose-owned. */
import {currentSchematicRelevanceUiCodecNativeSource} from "./current-schematic-relevance-ui-codec-native-source.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_STATUS_CLONE_CALLS as CALLS} from "./current-schematic-relevance-status-clone-protocol.ts";
import {currentSchematicRelevanceStatusCloneCases,currentSchematicRelevanceStatusCloneTemplate} from "./current-schematic-relevance-status-clone-wire.ts";

export function currentSchematicRelevanceStatusCloneNativeSource():string{const cases=currentSchematicRelevanceStatusCloneCases();const rows=cases.map(command=>{const row=currentSchematicRelevanceStatusCloneTemplate(command);return[row.phase,row.method,row.names.join(","),row.template];});return currentSchematicRelevanceUiCodecNativeSource({className:"EasyedaSchematicRelevanceStatusCloneProtocol",errorCode:"schematic-status-clone-codec",tableError:"SCHEMATIC_STATUS_CLONE_FIXED_TABLE_BOUND",marker:"statusclone",rows,programs:CALLS.map(row=>row[1]),messages:cases.map(command=>`${JSON.stringify({id:83,method:command.method,params:command.params,sessionId:"original_ui"})}\0`)});}
