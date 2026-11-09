/** Source-owned fixed delegate codebook. */
import {currentSchematicRelevanceUiCodecNativeSource} from "./current-schematic-relevance-ui-codec-native-source.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_RENDER_DELEGATE_CALLS as CALLS} from "./current-schematic-relevance-render-delegate-protocol.ts";
import {currentSchematicRelevanceRenderDelegateCases,currentSchematicRelevanceRenderDelegateTemplate} from "./current-schematic-relevance-render-delegate-wire.ts";

export function currentSchematicRelevanceRenderDelegateNativeSource():string{const cases=currentSchematicRelevanceRenderDelegateCases();const rows=cases.map(command=>{const row=currentSchematicRelevanceRenderDelegateTemplate(command);return[row.phase,row.method,row.names.join(","),row.template];});return currentSchematicRelevanceUiCodecNativeSource({className:"EasyedaSchematicRelevanceRenderDelegateProtocol",errorCode:"schematic-render-delegate-codec",tableError:"SCHEMATIC_RENDER_DELEGATE_FIXED_TABLE_BOUND",marker:"renderdelegate",rows,programs:CALLS.map(row=>row[1]),messages:cases.map(command=>`${JSON.stringify({id:83,method:command.method,params:command.params,sessionId:"original_ui"})}\0`)});}
