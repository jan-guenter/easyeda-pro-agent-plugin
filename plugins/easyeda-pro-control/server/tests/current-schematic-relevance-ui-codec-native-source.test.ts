/* oxlint-disable import/max-dependencies -- This byte-preservation test must compare the nine independently owned native protocol emitters. */
/** Source-factory refactoring preserves every prior complete native class byte,
 * including its independently fixed rows, programs, markers and hash vectors. */
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
 [source0,7272,"e7e339ff50dca61376faa4af5e10ad562c0ffa191cf5bdf7cf62e3dd38a14e58"],
 [source1,10_486,"b11d952b899335cff27d8fe98abf3e59657c54b39ebbe08f521f9291b59edba5"],
 [source2,12_958,"1465f7584e390a0a288f8c480ab4c59725825f38fee1ef9225c822e4c4c2c668"],
 [source3,12_425,"4a2627c92000cd8158cee372d88de526faad39155650130ab72a8c49b27d9050"],
 [source4,10_489,"f41f1a0a47e4a957eec27b9cfd9607e199acff668e4edfbd4b2c39cbbc500470"],
 [source5,11_017,"468a1d61aa8b7b124b17e6a65ca58aac5a5494bbfa1b333b1ca5982c5269860d"],
 [source6,11_284,"a1e0a0c42e3092aa5d49b1a4f55142de2f2e3ec112b3d3917ec463761519bb5f"],
 [source7,9412,"406bdfa41045fe478df66d0290b5c4fbd8ede7e8f3b7a61c5c5cc2e5201fa80f"],
 [source8,9367,"88eaf8384bd4f3f2fe9140e9095232dcd91f36fdfa4330311af64a9e7b2e9a78"],
]as const;
void test("shared own7 source factory preserves all nine original complete C# class bytes",()=>{for(const[build,bytes,sha]of originals){const source=build();assert.equal(Buffer.byteLength(source),bytes);assert.equal(createHash("sha256").update(source).digest("hex"),sha);}});
