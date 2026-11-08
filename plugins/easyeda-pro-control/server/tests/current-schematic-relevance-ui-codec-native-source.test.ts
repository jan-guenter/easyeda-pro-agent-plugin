/* oxlint-disable import/max-dependencies -- This byte-preservation test must compare the nine independently owned native protocol emitters. */
/** Pin all nine complete native classes. The pending-cache class adds only its
 * reviewed original timer capture/reproof rows; the other eight stay exact. */
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {test} from "node:test";
import {currentSchematicRelevanceUploadEntryNativeSource as source0} from "../src/current-schematic-relevance-upload-entry-native.ts";
import {currentSchematicRelevanceUploadModelNativeSource as source1} from "../src/current-schematic-relevance-upload-model-native.ts";
import {currentSchematicRelevanceUploadSerializeNativeSource as source2} from "../src/current-schematic-relevance-upload-serialize-native.ts";
import {currentSchematicRelevanceUploadCmNativeSource as source3} from "../src/current-schematic-relevance-upload-cm-native.ts";
import {currentSchematicRelevancePendingCacheNativeSource as source4} from "../src/current-schematic-relevance-pending-cache-native.ts";
import {currentSchematicRelevanceUploadReturnNativeSource as source5} from "../src/current-schematic-relevance-upload-return-native.ts";
import {currentSchematicRelevanceHistoryStatusNativeSource as source6} from "../src/current-schematic-relevance-history-status-native.ts";
import {currentSchematicRelevanceStatusBusNativeSource as source7} from "../src/current-schematic-relevance-status-bus-native.ts";
import {currentSchematicRelevanceStatusDeliveryNativeSource as source8} from "../src/current-schematic-relevance-status-delivery-native.ts";

const originals=[
 [source0,6420,"0b4356f608800b37ca0ffe4117931d4a63f37eb3878b671de0c4d2c0b741be1c"],
 [source1,9634,"76c4462a5ec8ec5dfd85fe0c7eb43ba0bf3afe1ab883bee7a471173e34cabfdb"],
 [source2,12_106,"d5cc5121a1143805b314b4d23475f52032b4290fc283c124883c8f12f39d9b9d"],
 [source3,11_573,"56697c38ba4a15e745f02e6a090e9e9c50c1a5cc8fa3e372ac491f264dd11a5d"],
 [source4,9829,"9f0a3b3690926ef1d220e20b686e8f3675384501759ab1af0dc13d5e1204296f"],
 [source5,10_165,"f7a285ce4a411685fcfd316ef5f727089bcb19ad3aa4a13bcb628dc5bf86b8a1"],
 [source6,10_432,"63298538f73cd3bd30789cc82c4f04643b4702346aeecd8cca9b1a4c09ee9671"],
 [source7,8560,"1d68a0c48a37318b5bc8cdd07e77522fba4d07fd188a0203887d8ce32b5a42ed"],
 [source8,8515,"c8ac0c0aa2659395b2e5a30153b221121566a92e55c59c8718494de1e30a4c53"],
]as const;
void test("shared own7 source factory pins the timer-bound pending cache and eight unchanged complete C# classes",()=>{for(const[build,bytes,sha]of originals){const source=build();assert.equal(Buffer.byteLength(source),bytes);assert.equal(createHash("sha256").update(source).digest("hex"),sha);}});
