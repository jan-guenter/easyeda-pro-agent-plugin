/** Source-owned fixed delegate codebook. */
import {currentSchematicRelevanceUiCodecNativeSource} from "./current-schematic-relevance-ui-codec-native-source.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_FILE_SAVE_UI_CALLS as CALLS} from "./current-schematic-relevance-file-save-ui-protocol.ts";
import {currentSchematicRelevanceFileSaveUiCases,currentSchematicRelevanceFileSaveUiTemplate} from "./current-schematic-relevance-file-save-ui-wire.ts";

export function currentSchematicRelevanceFileSaveUiNativeSource():string{const cases=currentSchematicRelevanceFileSaveUiCases();const rows=cases.map(command=>{const row=currentSchematicRelevanceFileSaveUiTemplate(command);return[row.phase,row.method,row.names.join(","),row.template];});return currentSchematicRelevanceUiCodecNativeSource({className:"EasyedaSchematicRelevanceFileSaveUiProtocol",errorCode:"schematic-file-save-ui-codec",tableError:"SCHEMATIC_FILE_SAVE_UI_FIXED_TABLE_BOUND",marker:"filesaveui",rows,programs:CALLS.map(row=>row[1]),messages:cases.map(command=>`${JSON.stringify({id:83,method:command.method,params:command.params,sessionId:"original_ui"})}\0`)});}
