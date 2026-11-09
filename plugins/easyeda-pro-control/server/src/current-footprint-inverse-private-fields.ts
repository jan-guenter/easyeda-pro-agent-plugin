/** Fixed private FIELD spellings in the inverse C# emitter. The canonical
 * emitted source is compact; there is no new storage/reversible format or
 * runtime selector. Methods, types, literals, comments and wire bytes stay. */
import { createHash } from "node:crypto";
import { currentPcbDiagnosticCSharpLexicalTokens as tokenize } from "./current-pcb-diagnostic-csharp-spacing.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

type Token = ReturnType<typeof tokenize>[number];
/** Readable original-to-emitted field map and exact full-source use census. */
export const CURRENT_FOOTPRINT_INVERSE_PRIVATE_FIELDS = freezeDeep([
  { field: "inverseGetCallbackArmAttempted", emitted: "igx0", uses: 4, contextSha256: "c4fffb5c50022baaaa2ed07a6787e2bb26a7151e23c7b033d7cabbc8ec163243" },
  { field: "inverseGetCallbackArmed", emitted: "igx1", uses: 5, contextSha256: "c1b57a0fcf12111d78f77bf17435d5151f855c52b258ead667a72245be074f04" },
  { field: "inverseGetCallbackBound", emitted: "igx2", uses: 4, contextSha256: "e9838caaa3e4632023497f2d375f47d9cc0a91ae01cfe3468fe2e083ef302a49" },
  { field: "inverseGetCallbackCalls", emitted: "igx3", uses: 10, contextSha256: "115a49f564193524a5d3b641b727a84de15d1ec9ef285f1621eb5fd68b36f7d3" },
  { field: "inverseGetCallbackComplete", emitted: "igx4", uses: 5, contextSha256: "4376631ebd7604f5d6fed9864ccfc669855670f610b681b39f15f73ef7dcc33e" },
  { field: "inverseGetCallbackFrames", emitted: "igx5", uses: 8, contextSha256: "43a3982a9ba405d788d83e8ea070726b503fc87656e2f34366629b3210d74f48" },
  { field: "inverseGetCallbackFunction", emitted: "igx6", uses: 3, contextSha256: "047fbfdb1145ac652220867011671bb961f15368624bbb69c23e87d6d9ccfa52" },
  { field: "inverseGetCallbackHeld", emitted: "igx7", uses: 8, contextSha256: "efb2c7382b6ce889803336584066ea08edffa34a66ec707f673579d71861578f" },
  { field: "inverseGetCallbackHelpers", emitted: "igx8", uses: 7, contextSha256: "7029384694cef06def58f6b98d25b847d0a0188c1784ab6419e79751ee4a1855" },
  { field: "inverseGetCallbackPoint", emitted: "igx9", uses: 5, contextSha256: "ff2851c9c2b625c961d1a2db650402c131dc34dbc53075cc348828fb516aa126" },
  { field: "inverseGetCallbackPrepared", emitted: "igx10", uses: 5, contextSha256: "a45deffb2004ed46ceffbf5c8a4f3eaa3e629f261aff1ce32721d49115ef068b" },
  { field: "inverseGetCallbackProperties", emitted: "igx11", uses: 5, contextSha256: "9f0fe6345d9bb62f2406e8a0bd432c178fc43ecbd782ee20cbd92dae882ab963" },
  { field: "inverseGetCallbackRemoveAttempted", emitted: "igx12", uses: 4, contextSha256: "dea838d846c1259a792d94b9fee64c276237fb1a1e67b5019c77409b29bf6835" },
  { field: "inverseGetCallbackResumeConsumed", emitted: "igx13", uses: 7, contextSha256: "a8343058dbdec1a05b68f3b09e9f6a92dac3f8938949327f4c5f29489363bda2" },
  { field: "inverseGetCallbackResumed", emitted: "igx14", uses: 4, contextSha256: "14ebc0283654e655f170394ab71f43cd3ea4db18e9f2f5235a783f9cfd996150" },
  { field: "inverseGetCompletionArms", emitted: "igx15", uses: 4, contextSha256: "a551295dd5ff065ef37be4cf1904dd2f444a87fd3ddbf3a98e9f38c64b7ad070" },
  { field: "inverseGetCompletionBound", emitted: "igx16", uses: 4, contextSha256: "820ca9ed5c15680c5e2146d8b1bd4732b0230ed85a4b79ffdf14a6e48c658c6a" },
  { field: "inverseGetCompletionComplete", emitted: "igx17", uses: 5, contextSha256: "0984df8b64be412ef5ea96000fda586ef3321e7145f1d8332dc46b03a48067a2" },
  { field: "inverseGetCompletionHeld", emitted: "igx18", uses: 9, contextSha256: "e802987cbcbef1632ba837e68740761b8cd2de522f9f5c91174b17912d2ac7eb" },
  { field: "inverseGetCompletionHelpers", emitted: "igx19", uses: 4, contextSha256: "6f1a126a8576b535029177db79427f2e024493960001fde8411f87b95bc21be6" },
  { field: "inverseGetCompletionHolds", emitted: "igx20", uses: 8, contextSha256: "626f3bd532890e6eb7146dcd2f5ac5ae37b4b1658f53e513164af3b0fcf2dfa1" },
  { field: "inverseGetCompletionInput", emitted: "igx21", uses: 8, contextSha256: "7074da95aae39895d45138e3bf596355511d13efcbc2b699f1b25afc47e87524" },
  { field: "inverseGetCompletionNormal", emitted: "igx22", uses: 4, contextSha256: "5365a71a77d100098aec0c3488c9a6ea1b8020cee8e1f53aee2f872d80f2d25f" },
  { field: "inverseGetCompletionPermit", emitted: "igx23", uses: 9, contextSha256: "ea9f56fbc93167114c9dae5e107f6bd00a28057b13de6fa7ce16426b36e1996a" },
  { field: "inverseGetCompletionPoints", emitted: "igx24", uses: 6, contextSha256: "f02b69dc3a2c31f11c1dbe6638d55e42ad1e79e45a3bb3217b23baba0394aefe" },
  { field: "inverseGetCompletionRemoved", emitted: "igx25", uses: 4, contextSha256: "d1665199079830208f9725191f8bc1ddfb4a306529b6403e6f2fa1cd45d10967" },
  { field: "inverseGetCompletionResumes", emitted: "igx26", uses: 7, contextSha256: "5874132b782daaf1e1d19835f604ac978d1a889ecf6b58574db87ec89c598639" },
  { field: "inverseGetCompletionRow", emitted: "igx27", uses: 6, contextSha256: "bebedeee4ed2aee165fac100c0dafdbd28c060842bd535453292f2de8fa9774c" },
  { field: "inverseGetForwardingBound", emitted: "igx28", uses: 4, contextSha256: "d4f2c30b756ffcb52f059b29c1aa146754576749cb11bf58c69058955f683e60" },
  { field: "inverseGetForwardingCalls", emitted: "igx29", uses: 8, contextSha256: "ae7a885e1c382a4ff16aeb46e928e68fece4da31343fa1f10b1530f2a301d2fa" },
  { field: "inverseGetForwardingHelpers", emitted: "igx30", uses: 5, contextSha256: "d8aa36f35fc13f8053eee9e4b7f8eed25cc4a1d97daeb8acc1c61c361e8577e8" },
  { field: "inverseGetForwardingManager", emitted: "igx31", uses: 4, contextSha256: "7e58406db25a0919278b7aca845bb21758ad664394884298830ec9a76815bb01" },
  { field: "inverseGetForwardingPrepared", emitted: "igx32", uses: 6, contextSha256: "e587e7bbac002808ac3f55d32c4a312d0b8be06c3059b15ee7015157446195e2" },
  { field: "inverseGetForwardingProperties", emitted: "igx33", uses: 3, contextSha256: "34365f0af98515a820a4899d52f53deb8f886c83b8ecd98f5985b9a2e145ada9" },
  { field: "inverseGetIntrinsicRoles", emitted: "igx34", uses: 7, contextSha256: "c7d42f9bbe1bc0d9119ee4d2c69d07a20891a55440dc44051b773d4c25e996af" },
  { field: "inverseGetIntrinsicsBound", emitted: "igx35", uses: 9, contextSha256: "2d777cbd131d4e323f8d1de765f08dfb767807d17a44ce5301c396aed79243da" },
  { field: "inverseGetIntrinsicsCalls", emitted: "igx36", uses: 3, contextSha256: "4c7c81b7b5fe99302e8803eabb42d2cae1f4a4e3ad9c6d7434313094f8493d62" },
  { field: "inverseGetIntrinsicsComplete", emitted: "igx37", uses: 5, contextSha256: "2dfec6fa4c65c4e789eb8479a372c641d8adb8b652eef9131f52084d8403e0d7" },
  { field: "inverseGetIntrinsicsHelpers", emitted: "igx38", uses: 3, contextSha256: "f2b84f74350ba0d90bf0452088c5b17c2f2f84a690e38bf6c8ab54d278228c3f" },
  { field: "inverseGetIntrinsicsProperties", emitted: "igx39", uses: 2, contextSha256: "25c7f6cefe8598c041c4609fd5222a8b82f3e5b2b4565460f274a1fa67ced4c5" },
  { field: "inverseGetManagerBound", emitted: "igx40", uses: 4, contextSha256: "21ea346f51d5b3dbe5b300897c1061d3647ce05b2182c86d05e211dafc8e3fa7" },
  { field: "inverseGetManagerCalls", emitted: "igx41", uses: 7, contextSha256: "aa8cd3f6c64a7b5adea1921f81f861b0667268867448a507f207dcbe9f62d2ef" },
  { field: "inverseGetManagerHelpers", emitted: "igx42", uses: 5, contextSha256: "01b4aea33f430852f40d14756e13271946636f85c166876b565e840350a203e3" },
  { field: "inverseGetManagerPrepared", emitted: "igx43", uses: 5, contextSha256: "22717a0026e95684be3852fdd520612167dafe9cf85215462c06e3d5937f9714" },
  { field: "inverseGetManagerProperties", emitted: "igx44", uses: 3, contextSha256: "f657656316b2d6ad6575c5e3bd124e66448b3a7aed682f180f2b2b5a191eac97" },
  { field: "inverseGetNativeBound", emitted: "igx45", uses: 6, contextSha256: "230d99fec439c6b5e2b1d3967f8af2f39ab875b18950bf3b7f09a7832c6764b6" },
  { field: "inverseGetNativeCompleted", emitted: "igx46", uses: 7, contextSha256: "d2500538e63704f3ee15cf833e5f05454e8ca454162b02214e3acd1b765be65d" },
  { field: "inverseGetNativeHeld", emitted: "igx47", uses: 7, contextSha256: "3314c3bff7ff800dae71a2f255ab04d3df6bc5a98aa996754b1e668295b689e1" },
  { field: "inverseGetNativeHelpers", emitted: "igx48", uses: 3, contextSha256: "ecaf3ab2a8557cb3d375f0cd4d781e1da5084ca3322275b3468158a64a52f4f7" },
  { field: "inverseGetNativeStep", emitted: "igx49", uses: 5, contextSha256: "22e551084d1335bfd22af3eabf02ff46f39345b52275ec8294699dd978853c93" },
  { field: "inverseGetResultAttempts", emitted: "igx50", uses: 4, contextSha256: "cc28a751f0268a87988ee26e9450e9c65710d89f3e565b9cea0f5ec2b8fabd33" },
  { field: "inverseGetResultBound", emitted: "igx51", uses: 4, contextSha256: "74b887dc57c66c299b4c6896437dea9417e08845d7dcf4088f8bc47ce85fca0e" },
  { field: "inverseGetResultCompleted", emitted: "igx52", uses: 7, contextSha256: "d0341e9fda3792d8df79bd3afbeba5a6bacb64099830a6930fa7e9bbd1641523" },
  { field: "inverseGetResultFunctionIds", emitted: "igx53", uses: 7, contextSha256: "1f58357468724a1a020c6c8392cbafccf68d75ee44f7b37a0734b8308948974a" },
  { field: "inverseGetResultFunctions", emitted: "igx54", uses: 6, contextSha256: "161c11f601217785958d3e50506673383234326e81ca70bcf1e9b3df0892baa6" },
  { field: "inverseGetResultHelpers", emitted: "igx55", uses: 8, contextSha256: "3ad560333196e1bb05cedba1cfbe8e49a210c0add0194cf61e5c254c7d23fb63" },
  { field: "inverseGetResultPoints", emitted: "igx56", uses: 6, contextSha256: "a51b2c3c2b2fa916a8033bba0b1b24926d1660007152317ef7b350d438fb355c" },
  { field: "inverseGetResultPrepared", emitted: "igx57", uses: 8, contextSha256: "1c162ad7715e7d7d01d010042e746a8b1b69dc410599dbdf66a6b8bdec91826b" },
  { field: "inverseGetResultRemoved", emitted: "igx58", uses: 4, contextSha256: "933e798e20591a5085f9e86bd9447a4ac6b1d94e9dc00096047d104f1d67d34c" },
  { field: "inverseGetResultRequests", emitted: "igx59", uses: 2, contextSha256: "dc38b4387aa85dd40fbb7c97d3b7310d65029ff25ebf7043c72647b7ef7d898b" },
  { field: "inverseGetResultResumed", emitted: "igx60", uses: 5, contextSha256: "c172ef0aea75824d87c0c9cb0f3bab6d74bb92f2c7fcc110e742578336e87a29" },
  { field: "inverseGetResultResumes", emitted: "igx61", uses: 6, contextSha256: "bafd91673082ee257aa5f18b178002ae49fbd37d65d0f92dbf5852faa8fcbde7" },
  { field: "inverseGetResultRoles", emitted: "igx62", uses: 4, contextSha256: "aae1fca4baa61654e884202726d486bfc3d5b2e6f5d83e8d237af8fa853aab9a" },
  { field: "inverseGetResultScripts", emitted: "igx63", uses: 9, contextSha256: "f63c2fc0a260a3581235831a3db93c3efc8efed2e6ae10c2aefbcd472ec935e3" },
  { field: "inverseGetRpcBodyProof", emitted: "igx64", uses: 3, contextSha256: "5bc787875c181422e52d8b37b6fbd943039d7009aa10afec3c8271b9607a0652" },
  { field: "inverseGetRpcEntryArmAttempted", emitted: "igx65", uses: 5, contextSha256: "cfddbe0e596e3ddfa320f427c5925b8a9f8d9e010cbc0e45a80b60bc1feca676" },
  { field: "inverseGetRpcEntryArmed", emitted: "igx66", uses: 7, contextSha256: "e75c773d80417ad255ea40ab5fd2846c790b393d2ef0a22ac685657370cba4dc" },
  { field: "inverseGetRpcEntryBound", emitted: "igx67", uses: 4, contextSha256: "eef44601814a8b75a2ec9510c0391db5406550eaeea1c0d29127b4dc2f60160c" },
  { field: "inverseGetRpcEntryCalls", emitted: "igx68", uses: 5, contextSha256: "7954975c019880869bd620d80b0898bfa3eb39b626f8a984241ae11d80b8fd65" },
  { field: "inverseGetRpcEntryComplete", emitted: "igx69", uses: 6, contextSha256: "49a426e2e8e240919afc9279504dd79a65463f402b38fe87861ee187ace1659b" },
  { field: "inverseGetRpcEntryFrames", emitted: "igx70", uses: 5, contextSha256: "577d4e1ca19714206c09e6265cfb62743db4bcddd66d9887360d5e1b2a86d655" },
  { field: "inverseGetRpcEntryFunction", emitted: "igx71", uses: 3, contextSha256: "7be15ed900162333a79b6939cae9ac086344e18afb767bba744d574da88a1eee" },
  { field: "inverseGetRpcEntryHeld", emitted: "igx72", uses: 13, contextSha256: "1dcbe67cb1b2ce7edd5e5ddf54f546e673b07fa72b2aac0bfdc321fbfd5e8aa0" },
  { field: "inverseGetRpcEntryHelpers", emitted: "igx73", uses: 5, contextSha256: "da305b6f9747062d3cd8361ae9e5ce25af57152660a671ceac559a6efb6aeb28" },
  { field: "inverseGetRpcEntryPoint", emitted: "igx74", uses: 4, contextSha256: "5133096232b4f2a237ecaa151214ddf9912d8bc32873c28320c021f8b55ff4aa" },
  { field: "inverseGetRpcEntryPrepared", emitted: "igx75", uses: 7, contextSha256: "812be1e3350e25e4591ac0092d9fab7d6a60842db601ecdf41133d98a7331d86" },
  { field: "inverseGetRpcEntryProperties", emitted: "igx76", uses: 2, contextSha256: "b495b3146f6b5dcf3f0cb21d87e01498da214ec783d81d5099d0834df85f03c6" },
  { field: "inverseGetRpcEntryResumeConsumed", emitted: "igx77", uses: 9, contextSha256: "5aa3ce7f000c220d793d1f73bf42a05c4f8b5161ec0bc19e0c25144b0f50e98f" },
  { field: "inverseGetRpcEntryResumed", emitted: "igx78", uses: 4, contextSha256: "008b53143884375a0d7466544fb3b04e4b2c6859f7eb37db9656cd1bde469457" },
  { field: "inverseGetRpcEntryRoles", emitted: "igx79", uses: 12, contextSha256: "eae2190c47a2f42e02ab493d6d532ba8d5e71de2d543c3651242db3d314f7120" },
  { field: "inverseGetRpcEntrySources", emitted: "igx80", uses: 3, contextSha256: "5be4ad23c47b33cd19af90670df8302b43dc57d7200b79f3493e5270f2d60ecc" },
  { field: "inverseGetRpcF2Proof", emitted: "igx81", uses: 3, contextSha256: "f663eaf479e2984cf5e1acba6f2fb1d52f3d415e5b5e77f1818665f24273412a" },
  { field: "inverseGetSendArmRequests", emitted: "igx82", uses: 3, contextSha256: "3a02a0f8707462b8a2341fc31735a76a05eb072cd88574143aa6fe7f28d4e5a1" },
  { field: "inverseGetSendBound", emitted: "igx83", uses: 4, contextSha256: "742c3b9d7662b034fb97b33d6dbd3bd1d038d19098bc2f101ea467eb47c111ae" },
  { field: "inverseGetSendCompleted", emitted: "igx84", uses: 5, contextSha256: "3d98dd6e6877aecdc5ba37b7eef34eb51f50caecb79beecf3acf7e2588ecd19e" },
  { field: "inverseGetSendFunctionIds", emitted: "igx85", uses: 4, contextSha256: "0e26693e93364a970a6d8d41c934e9ebe9fcfb1de605d49298c85018b8f95145" },
  { field: "inverseGetSendFunctions", emitted: "igx86", uses: 6, contextSha256: "f154c17a0727f6a0af385c862d83c54288356709783292c1f0c3494b7696215c" },
  { field: "inverseGetSendHelpers", emitted: "igx87", uses: 9, contextSha256: "2973c37b617e70127d70ff9107eb6652f42cda9bd7b46e937e425718514fd0b7" },
  { field: "inverseGetSendPoints", emitted: "igx88", uses: 7, contextSha256: "2ba196a15b3f72ec434ef39d21612e279fef13dce50df74067b1d490e966397f" },
  { field: "inverseGetSendPostReturned", emitted: "igx89", uses: 4, contextSha256: "ae466621c086400c858697f2c7db2bf23c979df819db1c8f3d40c1f04898d4eb" },
  { field: "inverseGetSendPrepared", emitted: "igx90", uses: 9, contextSha256: "18a98fb0555ee4d53369051a6ec1cd80a46f6de9bc9b67ad3850a4e938f9ae6d" },
  { field: "inverseGetSendRemovals", emitted: "igx91", uses: 2, contextSha256: "a735a658e18874c83e98e79bf424868b20b0f8c27995be79c92072be5a06588d" },
  { field: "inverseGetSendRemoved", emitted: "igx92", uses: 4, contextSha256: "d47eda993add098f67ec80914d03ae475c2e16e0411bb90a64029d87d372dae3" },
  { field: "inverseGetSendRequests", emitted: "igx93", uses: 2, contextSha256: "1ae7ca52af7a8560a61075746b43de4846c6e436ae1bfc045916cbed0a2fe577" },
  { field: "inverseGetSendResumed", emitted: "igx94", uses: 5, contextSha256: "5177b3cf73227b5f24632059d915fd33da687bbea4527d66ae1bf029f1c8c1a3" },
  { field: "inverseGetSendResumes", emitted: "igx95", uses: 8, contextSha256: "e46cf5ec960a38b208a28753216762109645642b9980a7d86f342ff530045980" },
  { field: "inverseGetSendRoles", emitted: "igx96", uses: 9, contextSha256: "93cfd1315fbd161d60ed7688ecb404ac5378dcda440d5245befa9c9beec82c2a" },
  { field: "inverseGetSendScripts", emitted: "igx97", uses: 10, contextSha256: "0f61592e5a4ae34f4188b29977f4cc06f2c8704f72d935186d69a52aa8658888" },
  { field: "inverseGetWorkerBound", emitted: "igx98", uses: 8, contextSha256: "2c004a54495907714e54320dceb1330b3f4b170900edc68df20ff212b04ca61f" },
  { field: "inverseGetWorkerConsumed", emitted: "igx99", uses: 13, contextSha256: "970bf8e257b78b99de23f32de4d2d1d18b52b0245ebedbbca42e11b2ff637756" },
  { field: "inverseGetWorkerHelpers", emitted: "igx100", uses: 3, contextSha256: "a8825b4ebea0287e5656b0715b77e3c68e2434e1390d7521d425c308ef00a2bd" },
  { field: "inverseGetWorkerPoint", emitted: "igx101", uses: 5, contextSha256: "32437afa6cedee64be2081bf77ab8689a2e4037594eb3fdc5f893299cd4f8486" },
  { field: "inverseGetWorkerReady", emitted: "igx102", uses: 6, contextSha256: "cc9d9e9241739fc49e6f9a05b7e7f4eafc82eb74a446bc06a9c7d988d8b17d77" },
  { field: "inverseGetWorkerStep", emitted: "igx103", uses: 5, contextSha256: "19a05002985b680a0887dffddef88126a2889455994c5d5d7374b4463d599f79" },
  { field: "nativeGetLookupBound", emitted: "igx104", uses: 6, contextSha256: "521b4cda5cda1de5aee5663122662599f445d481ffd82caae29b16f97ebf56f1" },
  { field: "nativeGetLookupFailed", emitted: "igx105", uses: 4, contextSha256: "208c40d8d1cc4a7ff3fb753b1583a9a415e9d38beceadbb278a713816e67f314" },
  { field: "nativeGetLookupHeld", emitted: "igx106", uses: 4, contextSha256: "13d6e7c627f077d6996ed5e6334d847e28543902e638a3a69cc94aef962b8638" },
  { field: "nativeGetLookupHelper", emitted: "igx107", uses: 6, contextSha256: "dd96942a38607bc9d6a5afa4089640ea27d5c404b2a5c30966f03a53bd62b736" },
  { field: "nativeGetLookupHelpers", emitted: "igx108", uses: 4, contextSha256: "59b585c82c52d34d32e9dac43a38aa68c93ddb832e32555287483ec8ea107c46" },
  { field: "nativeGetLookupStep", emitted: "igx109", uses: 8, contextSha256: "7c5fe8c533506cb3ec6c15f3e7b8542935e3020f9cbab3aace559512fdf524e3" },
  { field: "nativeGetTaskBound", emitted: "igx110", uses: 6, contextSha256: "ebf894d25f36937dc4290cc2ba2fbf4dfe03d037d35872f87282f62bb36995ae" },
  { field: "nativeGetTaskDependenciesBound", emitted: "igx111", uses: 5, contextSha256: "93c9a5a5bd911b858a8dce479ce09f854b0f6554eb4c4cf0308540bf8927029a" },
  { field: "nativeGetTaskDependenciesComplete", emitted: "igx112", uses: 5, contextSha256: "0a2b2daff54e8fb963f603c7a5b633f67c9afa36801243e4fe98ec8e2152f31e" },
  { field: "nativeGetTaskDependenciesFailed", emitted: "igx113", uses: 5, contextSha256: "8d596172503fb0d3ef6e1d1b6bc7a1993d0522327423440237ac7d73fff2d65f" },
  { field: "nativeGetTaskDependencyStep", emitted: "igx114", uses: 5, contextSha256: "712cb34bc37a0cec3a35bf5ca85355b8a8b7eebb44a5a3ae89407e1cd112a923" },
  { field: "nativeGetTaskFailed", emitted: "igx115", uses: 4, contextSha256: "f28ffb532a58c69b439ff91f437052c28619cdd706f3b3fa0b1d80fa61851c58" },
  { field: "nativeGetTaskHeld", emitted: "igx116", uses: 8, contextSha256: "0f8adfe901470039f80732beab2505b8ac1f37d2b49bf8b5c8910f1bb416aea6" },
  { field: "nativeGetTaskIntrinsicCalls", emitted: "igx117", uses: 3, contextSha256: "dcba20d1de4dedc8645d5f5cf4e3f4b848a9aa175ca43688b840651b932cdacd" },
  { field: "nativeGetTaskIntrinsicHelper", emitted: "igx118", uses: 6, contextSha256: "09e238b423665de07d1f500d17902215ab4104a82edbb5043debd74487f293cb" },
  { field: "nativeGetTaskIntrinsicHelpers", emitted: "igx119", uses: 3, contextSha256: "db8c61eed39a570989a1b91beded28ff00c021d564df8fce8b2600127ba42668" },
  { field: "nativeGetTaskIntrinsicProperties", emitted: "igx120", uses: 2, contextSha256: "6c1c7a781050c33efb81f8752d40fb6642052b51bcf6e849db8f0bf8e98856df" },
  { field: "nativeGetTaskIntrinsicRoles", emitted: "igx121", uses: 7, contextSha256: "3dbbe2f6e7a769b7554c67337a9b0525b83e894941914bf6310510ce0bd9ed41" },
  { field: "nativeGetTaskIntrinsicsBound", emitted: "igx122", uses: 4, contextSha256: "63029d9c37353b5974c63d58a3a2f59f01629ce92109949caec1831a4a1e49fd" },
  { field: "nativeGetTaskIntrinsicsComplete", emitted: "igx123", uses: 5, contextSha256: "c61e6ce189536ef759cfd88c2fe7b733ab531c903e6d27a81ea46efb89ad0d8a" },
  { field: "nativeGetTaskIntrinsicsFailed", emitted: "igx124", uses: 6, contextSha256: "c2572202f752157bea01dcd6487b65ea903fc965b6fdc7eaae10a61df265a674" },
  { field: "nativeGetTaskPrepared", emitted: "igx125", uses: 5, contextSha256: "cdef3a78d681c924dd019d73f0c456c2df6db0f1112bbf8c86de7e2f69c539a5" },
  { field: "nativeGetTaskStep", emitted: "igx126", uses: 9, contextSha256: "de84cc1e914ca60a5809ab85a79f0d8553cbc4b9db7a3dfcbf8489e2bd0a6008" },
  { field: "nativeGetWorkerBound", emitted: "igx127", uses: 5, contextSha256: "0f5e02da4cdc2b8a52900e8bed44265b5cd408e712d3272b43567eb445c601d2" },
  { field: "nativeGetWorkerCompleted", emitted: "igx128", uses: 6, contextSha256: "2ff61b905e98479c613522b3365a256524a9ec9cadef4a8d17ae1051dadd92fe" },
  { field: "nativeGetWorkerFailed", emitted: "igx129", uses: 6, contextSha256: "6c4bc94506b449c6e27a53b3e859557780b6e0185547e02522df03d008e83763" },
  { field: "nativeGetWorkerHelpers", emitted: "igx130", uses: 5, contextSha256: "ec38c8ee7224ab0b0af08d3ee90a4ab787c4dd3624192fc03eeea9cc7f1fac40" },
  { field: "nativeGetWorkerPoint", emitted: "igx131", uses: 2, contextSha256: "7baa06f6cfd7e759876db7853674d229127c335eff83934d0117f670cbd08436" },
  { field: "nativeGetWorkerStep", emitted: "igx132", uses: 6, contextSha256: "ee3c605c92b30789933014107d153a0808e06b8b842cdbb542e6c36826d60811" },
  { field: "footprintInverseAborted", emitted: "igx133", uses: 150, contextSha256: "92a00f1e3d189175e3afe8424a9c3b8ba8b22c1738a2448f766dc25b2a91f268" },
  { field: "footprintInverseBranch", emitted: "igx134", uses: 28, contextSha256: "683a06cc81763cc55cb8f28c6865b5b3357e23d0c89ac82ed8ff4c5852d3e54b" },
  { field: "footprintInverseCacheSlots", emitted: "igx135", uses: 15, contextSha256: "73baae24bd2333de96892a43f7e36401fd6301d1e096924da9967dad9a1cb357" },
  { field: "footprintInverseColdBound", emitted: "igx136", uses: 15, contextSha256: "f8e34b94968f192858b126bbf488114144351cab045ac39ffc6cc4c986f42db2" },
  { field: "footprintInverseColdHeld", emitted: "igx137", uses: 28, contextSha256: "bc46dec5f952161695a32d5230ca51315d695821c7d1bbbe463a9bd51442fafb" },
  { field: "footprintInverseColdStarted", emitted: "igx138", uses: 26, contextSha256: "675814b3e78722aad16a54d4b45294e21c89c2ab01a8167019d198ec3be77831" },
  { field: "footprintInverseCtorHeld", emitted: "igx139", uses: 19, contextSha256: "d3d67c91e9ee03362ba954ab6b71bb8048a609bd554910390a273307f4fb731e" },
  { field: "footprintInverseCtorStarted", emitted: "igx140", uses: 15, contextSha256: "9882fff41435c336cd14b17d04a9f51245c539fd2e5fe2799d8a63a19d27f940" },
  { field: "footprintInverseDeleteAdmissionConsumed", emitted: "igx141", uses: 24, contextSha256: "31a5d675d105cfc93e1383129902c4502f1d11601e13ea40eb0aa92fea8f917a" },
  { field: "footprintInverseDeleteEntryBound", emitted: "igx142", uses: 11, contextSha256: "73c1fee7f8dba1bceb0d218bf9d0e6bbb77e08b1853c55a9b3e316c4f6f6b1cf" },
  { field: "footprintInverseDeleteEntryCompleted", emitted: "igx143", uses: 12, contextSha256: "b81f192f38e10adebcb1534728e446251f0544ab0d5da30ac43b97a311216077" },
  { field: "footprintInverseDeleteEntryHeld", emitted: "igx144", uses: 13, contextSha256: "67650d4be6de3c62ebf8210bd02e2a6bcfdf495cb11f994e9926715709b6c31c" },
  { field: "footprintInverseDeleteWorkerPeerCompleted", emitted: "igx145", uses: 8, contextSha256: "41ef1fe2575fcfe32dccf886981f312c50b83578dac872b0c82a2f69cf8ce24b" },
  { field: "footprintInverseDocument", emitted: "igx146", uses: 29, contextSha256: "880439a26dbfb7569162ec9ad07d0d677b014407869677cda797eeb48a99e0cd" },
  { field: "footprintInverseInitialCacheBound", emitted: "igx147", uses: 15, contextSha256: "89c4bd1fa619c4dcf58d10af347a9e6f7cc2ce1e1ff74a8866a4fe016a94c5eb" },
  { field: "footprintInverseInitialCacheHeld", emitted: "igx148", uses: 15, contextSha256: "58b97bc3b96d79a81a59305eaf6cf27858de5a5ecd82709d950b0b4c2f997e92" },
  { field: "footprintInversePageSession", emitted: "igx149", uses: 40, contextSha256: "22501167f9019c7a61fb7772699d113cb8440935aced5f16fe355c626ae25738" },
  { field: "footprintInverseProject", emitted: "igx150", uses: 30, contextSha256: "0cedf89ddc51d44fd3e73a4a61c21b04e55c22674f3528ede015850b62d6748d" },
  { field: "footprintInversePublicCallCompleted", emitted: "igx151", uses: 16, contextSha256: "291853152015a5c7d6b115817c84682c968aa20fc088f5a6a795f9151ebd0081" },
  { field: "footprintInversePublicPreferencesBacked", emitted: "igx152", uses: 10, contextSha256: "871083fd6a72d5fc4481a63c59f15712af93c1423eacf8ed2511c09581dd2c50" },
  { field: "footprintInverseSourceBound", emitted: "igx153", uses: 13, contextSha256: "ce9e0208ba3a6cf30708543b81829e86dc9870b9159a178f0fd722501e5e760b" },
  { field: "footprintInverseStartupIdle", emitted: "igx154", uses: 29, contextSha256: "4f12f4cb854377122fb576e1b147a173a3544d3d7f4bbce236e79d03d2dcec98" },
  { field: "footprintInverseStartupRecordBound", emitted: "igx155", uses: 13, contextSha256: "59d0cc0bf05d8925a5ece575edc338c0b5101a2a0b85b1d43da1fd436d05c6ef" },
  { field: "footprintInverseUiSession", emitted: "igx156", uses: 45, contextSha256: "5bf7957beb81ba1e5fe882e782c5bafde98aa01ed4c413d002b33800353bc1d3" },
] as const);
const FIELDS = CURRENT_FOOTPRINT_INVERSE_PRIVATE_FIELDS;
const originalNames = new Map<string, typeof FIELDS[number]>(FIELDS.map(row => [row.field, row]));
const emittedNames = new Set<string>(FIELDS.map(row => row.emitted));
need(createHash("sha256").update(JSON.stringify(FIELDS)).digest("hex") === "07803d8d506b06795fff9b32b565e17fb9edb4cdd7c14d2f4cd34b162502a034");
const forbidden = new Set(["public", "protected", "internal"]);
const primitive = new Set(["bool", "int", "string", "long", "short", "byte", "object", "char", "uint", "ulong", "var"]);
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_PRIVATE_FIELD_EMITTER"); } }
/** Normalize escaped identifiers for collision checks while retaining their
 * exact original token bytes for the actual replacement proof. */
function name(token: Token | undefined): string | null { return token?.kind === "identifier" ? token.text.replace(/^@/u, "") : null; }
interface ClassScope { readonly name: string; readonly kind: "class" | "struct" | "enum"; readonly depth: number; member: number }
/** Distinguish one private class-level FIELD from its references, rejecting
 * attributes, public modifiers and primitive local/parameter shadowing. */
function privateField(active: readonly Token[], index: number, scope: ClassScope, depth: number): boolean {
  const next = active[index + 1]?.text; const previous = active[index - 1];
  if (depth === scope.depth) { need(next === "=" || next === "," || next === ";"); const prefix = active.slice(scope.member, index); need(prefix.length > 0 && !prefix.some(item => forbidden.has(item.text) || item.text === "[")); return true; }
  need(!(previous?.kind === "identifier" && primitive.has(previous.text) && (next === "=" || next === "," || next === ";" || next === ")" || next === "in"))); return false;
}
/** Prove every selected spelling is one private owner FIELD, with its exact
 * declaration/reference census. A fresh name, local shadow, anonymous key,
 * foreign owner or serializer/reflection construct permanently refuses. */
function inspect(source: string): readonly Token[] {
  need(FIELDS.length === 157 && originalNames.size === 157 && emittedNames.size === 157 && FIELDS.reduce((sum, row) => sum + row.uses, 0) === 1353);
  const all = tokenize(source); const active = all.filter(token => token.kind !== "space" && token.kind !== "comment");
  const counts = new Map<string, number>(); const declarations = new Map<string, number>(); const scopes: ClassScope[] = []; const anonymous: number[] = []; const contexts = new Map<string, string[][]>();
  let depth = 0; let pending: Readonly<{ name: string; kind: ClassScope["kind"] }> | null = null; let timezoneCalls = 0;
  for (const [index, token] of active.entries()) {
    const own = name(token);
    if (own !== null) {
      need(!emittedNames.has(own));
      const timezone = own === "ToSerializedString" && active[index - 1]?.text === "." && active[index - 2]?.text === "zone" && active[index + 1]?.text === "(" && active[index + 2]?.text === ")";
      if (timezone) { timezoneCalls += 1; }
      need(timezone || !/serializ|reflect|GetField|GetMember|GetPropert|TypeDescriptor|GetRuntimeField|GetMethod|InvokeMember|GetRuntimeMethod|GetType|TypeInfo|dynamic|Formatter|nameof|BindingFlags/iu.test(own));
    }
    if (token.text === "class" || token.text === "struct" || token.text === "enum") { const typeName = name(active[index + 1]); need(typeName !== null); pending = { name: typeName, kind: token.text }; }
    if (token.text === "{") {
      depth += 1;
      if (pending !== null) { scopes.push({ ...pending, depth, member: index + 1 }); pending = null; }
      else if (active[index - 1]?.text === "new") { anonymous.push(depth); }
    } else if (token.text === "}") {
      if (anonymous.at(-1) === depth) { anonymous.pop(); }
      if (scopes.at(-1)?.depth === depth) { scopes.pop(); }
      depth -= 1; const scope = scopes.at(-1); if (scope?.depth === depth) { scope.member = index + 1; } need(depth >= 0);
    } else {
      const scope = scopes.at(-1);
      if (scope !== undefined && token.text === ";" && depth === scope.depth) { scope.member = index + 1; }
      else if (own !== null) {
        const row = originalNames.get(own);
        if (row === undefined) { need(!/^(?:inverseGet|nativeGet(?:Task|Lookup|Worker))[A-Z]/u.test(own)); }
        else {
          need(token.text === own && scope !== undefined && scope.name === "EasyedaDiagnosticOwner" && scope.kind === "class");
          counts.set(own, (counts.get(own) ?? 0) + 1);
          const context = contexts.get(own) ?? []; context.push(active.slice(Math.max(0, index - 4), index + 5).map(item => item.kind === "string" || item.kind === "verbatim" || item.kind === "char" ? `[${item.kind}]` : item.text)); contexts.set(own, context);
          const next = active[index + 1]?.text; const previous = active[index - 1];
          need(!(anonymous.at(-1) === depth && (previous?.text === "{" || previous?.text === ",") && (next === "=" || next === "," || next === "}")));
          const declared = privateField(active, index, scope, depth); declarations.set(own, (declarations.get(own) ?? 0) + (declared ? 1 : 0));
        }
      }
    }
  }
  need(depth === 0 && scopes.length === 0 && anonymous.length === 0 && timezoneCalls === 1); need(source.split("System.TimeZoneInfo zone = System.TimeZoneInfo.Local;").length === 2);
  for (const row of FIELDS) { const context = contexts.get(row.field); need(context !== undefined); need(declarations.get(row.field) === 1 && counts.get(row.field) === row.uses && createHash("sha256").update(JSON.stringify(context)).digest("hex") === row.contextSha256); }
  return all;
}
/** Emit only injective globally fresh FIELD tokens. Splicing retains every
 * byte between those tokens, including comments, literals and table payloads. */
export function compactCurrentFootprintInversePrivateFields(source: string): string {
  const tokens = inspect(source); const parts: string[] = []; let prior = 0;
  for (const token of tokens) { if (token.kind === "identifier") { const row = originalNames.get(token.text); if (row !== undefined) { parts.push(source.slice(prior, token.start), row.emitted); prior = token.end; } } }
  parts.push(source.slice(prior)); const result = parts.join("");
  const observed = tokenize(result); need(observed.length === tokens.length);
  for (const [index, token] of tokens.entries()) { const now = observed[index]; need(now !== undefined && now.kind === token.kind && now.text === (token.kind === "identifier" ? originalNames.get(token.text)?.emitted ?? token.text : token.text)); }
  return result;
}
