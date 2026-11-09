/** Fixed private FIELD spellings in the schematic C# emitter. The canonical
 * emitted source is compact; there is no new storage/reversible format or
 * runtime selector. Methods, types, literals, comments and wire bytes stay. */
import { createHash } from "node:crypto";
import { currentPcbDiagnosticCSharpLexicalTokens as tokenize } from "./current-pcb-diagnostic-csharp-spacing.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

type Token = ReturnType<typeof tokenize>[number];
/** Readable original-to-emitted field map and exact full-source use census. */
export const CURRENT_SCHEMATIC_PRIVATE_FIELDS = freezeDeep([
  { field: "relevanceActionGuardAttempts", emitted: "sgx0", uses: 8, contextSha256: "1238eabc328ce9bc0351913fe1f33dc4c15f62834bb32544c8e24c80e46978dd" },
  { field: "relevanceActionGuardScript", emitted: "sgx1", uses: 7, contextSha256: "ec9c160f5df8bb347d8e481938b72e18c269eeac81751ee054582f969106b918" },
  { field: "relevanceCallbackSetterResumed", emitted: "sgx2", uses: 6, contextSha256: "5a4ba2033508196101f6400cfe8b9fd0b8b9f0cee676edc080fc46124e62de12" },
  { field: "relevanceDrainResumed", emitted: "sgx3", uses: 9, contextSha256: "7ac5ff6508a7e992b4dfd5091565f44799b9f683329e29dc9fe436cf14beb11a" },
  { field: "relevanceFileSaveUiArms", emitted: "sgx4", uses: 8, contextSha256: "05fff2913bbac8f67899e5c22cb21959aef598cb04ff0b86e08e634fc577fba9" },
  { field: "relevanceFileSaveUiChanged", emitted: "sgx5", uses: 7, contextSha256: "34d3730fb427dc6d51a087fa28a546df91bce0ea1aabf6f9dec2f8057b3c909d" },
  { field: "relevanceFileSaveUiReady", emitted: "sgx6", uses: 7, contextSha256: "77631a9360e4b764f198f4fae4213f25ef70b2abc9454aa93edafbe2e0fc0c97" },
  { field: "relevanceFileSaveUiStage", emitted: "sgx7", uses: 16, contextSha256: "205f73e2689161239f4c8d77fd036e0d83f26c7a63bdd457198c630827673225" },
  { field: "relevanceHistoryCommandReads", emitted: "sgx8", uses: 10, contextSha256: "f0647dde3488aa08dbb70b109f9d4614cc0394bcb30453a98236c39c742b341c" },
  { field: "relevanceHistoryCommandReady", emitted: "sgx9", uses: 8, contextSha256: "0de2a98bb33790b8a771424b67dd4ab9cb1a3459b6ac09a9d058f3d151ec8c04" },
  { field: "relevanceHistoryCommandStage", emitted: "sgx10", uses: 11, contextSha256: "8d433bca1299005db66f87886b494b8ee23dc283b9f4fe0e086336f0d338de3d" },
  { field: "relevanceHistoryStatusReads", emitted: "sgx11", uses: 7, contextSha256: "da69424c5e1787dfd7650c674bbc1d4211b40de19ca1527c6d4faa72a552e8cb" },
  { field: "relevanceHistoryStatusReady", emitted: "sgx12", uses: 8, contextSha256: "3b6624e8c9c83d566f2cd6417319a3075dc2d1133c685fb246128964676fc020" },
  { field: "relevanceHistoryStatusStage", emitted: "sgx13", uses: 8, contextSha256: "0b9ce9340b00bf7a045274c65ec80c6c73a79eb4a2f8773f2811e926f4c2f9e4" },
  { field: "relevanceHistoryStep", emitted: "sgx14", uses: 10, contextSha256: "9b2e2c629d19f4a245e9ebbdade53e96f1ee698e303dea552e9b8dfb1cbb6408" },
  { field: "relevanceLocalCacheRequests", emitted: "sgx15", uses: 8, contextSha256: "6a86b26c8e3ce9c6606d11f63ae4f9f9168c49db98edcee39a49c0346ab577d3" },
  { field: "relevanceLocalUploadStep", emitted: "sgx16", uses: 14, contextSha256: "af9cca88e9d913767ea5dc2e512337616594c129f17d04a7fd72c937990bd58b" },
  { field: "relevanceMainConstruction", emitted: "sgx17", uses: 8, contextSha256: "9e7ef8a0a42408dadc2240034839ad814d6442e1273fbca20074b8aab883700b" },
  { field: "relevanceModifyCanvasBefore", emitted: "sgx18", uses: 7, contextSha256: "16e3f728e8f7b5d75fe431181f4230d082fe534f44426dbc294c2abee71f3640" },
  { field: "relevanceModifyCanvasParent", emitted: "sgx19", uses: 9, contextSha256: "f8933394256549962903e5c72373a8a37865ec1dc2fa36d9ce78bead5096a994" },
  { field: "relevanceModifyCanvasResumes", emitted: "sgx20", uses: 14, contextSha256: "b36d858e498005e13d419f1d20992dcfdb73641142c733e2ecb3c61eb62ca4bf" },
  { field: "relevanceModifyCmParentResumes", emitted: "sgx21", uses: 15, contextSha256: "9a91a814496d2704b69e98b237e77b1feb11b553e9ebd4e92e07e5ef86aca277" },
  { field: "relevanceModifyCmResumes", emitted: "sgx22", uses: 19, contextSha256: "628814c8d9215c43cb20626f1dc254ea2a84219fca35a1c63bc3a10bafb94c1b" },
  { field: "relevanceModifyEntryRequests", emitted: "sgx23", uses: 6, contextSha256: "ecc4fc0be6173bf5b645bb4943295b310e42aa0e13ce7359dc776b6fe9bcdc50" },
  { field: "relevanceModifyGenerated", emitted: "sgx24", uses: 8, contextSha256: "59e22c1486558bce2cbe6a573cc1fc9f3299fd0edbf02e46b367a7e7dee63494" },
  { field: "relevanceModifyReceiverArmed", emitted: "sgx25", uses: 8, contextSha256: "5fa5225a8aa4bbb574f7826d8b9e9681a1b3a459923a72554522a111ab5b9069" },
  { field: "relevanceModifyResumes", emitted: "sgx26", uses: 8, contextSha256: "527471c315f8c833bbeca935a071b89ddee1783cb86d9b97161ced5887843a41" },
  { field: "relevanceModifyReturnParentRemovals", emitted: "sgx27", uses: 5, contextSha256: "6591488d48d1ffda836ce14b8c91dee816338f5da60d6c85e33429247170a472" },
  { field: "relevanceModifyReturnStage", emitted: "sgx28", uses: 11, contextSha256: "3d3714924c6f6a836901644d5e50fb4409fd17326dc2d98b4431dcc46f33d370" },
  { field: "relevanceModifyStructureArms", emitted: "sgx29", uses: 6, contextSha256: "a6cfaadd00261ad0d14155c132a0444f7a1f492931b40c0142ea162568d9dcb0" },
  { field: "relevanceModifyStructureBound", emitted: "sgx30", uses: 8, contextSha256: "1197d45d146d8933a6e8b037880e73ed2633c57b13b6c4f70e79f428c1c79357" },
  { field: "relevanceModifyStructureCompleted", emitted: "sgx31", uses: 9, contextSha256: "ce2f65c2fc4738d1ba0709121b0c1eca21eda65ab81dc52a58e4bea0d32f1322" },
  { field: "relevanceModifyStructureRemovals", emitted: "sgx32", uses: 8, contextSha256: "c92f653f0a35a6b28c9abecd22665075f050862efedf57a8265d55e819787412" },
  { field: "relevanceModifyStructureResumes", emitted: "sgx33", uses: 9, contextSha256: "eb956c363ef350803fd13852a68f90fd770d69ed370ce494823f9278cc092bd8" },
  { field: "relevanceModifyWorkerMetadataReady", emitted: "sgx34", uses: 6, contextSha256: "d21929a746d72b0174de69b24124aa5a3715b5cf26a1810494a41abee00995eb" },
  { field: "relevanceMonitorBatchReads", emitted: "sgx35", uses: 8, contextSha256: "28212d614e516e1e8b7a74d21b06665bded43399cacb206418bd5c609dead3b1" },
  { field: "relevanceMonitorBatchReady", emitted: "sgx36", uses: 8, contextSha256: "bfd9389c621f4adbb3aa8808006a585fdb993337f4b07bc31a3c074fcca34067" },
  { field: "relevanceMonitorBatchStage", emitted: "sgx37", uses: 9, contextSha256: "05c4524257ee8d0b52def94c4c3b38ac950a26b16d265fe931d68cc470a77bd9" },
  { field: "relevanceNormalRecordReady", emitted: "sgx38", uses: 8, contextSha256: "daf772ce7358f52130495bcb3d2d03d054df3d8777031a030f084d2bedca34a6" },
  { field: "relevanceNormalRecordStage", emitted: "sgx39", uses: 8, contextSha256: "602e4296119238444271d04e93f1206991a19f84840ae4af67804779c42ff9af" },
  { field: "relevanceNormalUiReady", emitted: "sgx40", uses: 8, contextSha256: "e9489eee693fd06398ccde90e65f7226125c8617d309fad28615b27da3c9f3e4" },
  { field: "relevanceNormalUiStage", emitted: "sgx41", uses: 31, contextSha256: "1e4c3b05b528bb3b34cdec62f049af50083966b70950f6c194cce4e72b2a0cc1" },
  { field: "relevanceNormalUpdateArms", emitted: "sgx42", uses: 7, contextSha256: "dc95ad8d79f6408c60518e1820ce5d0b97d64c2e54efbdcbdef021fcc25d74aa" },
  { field: "relevanceNormalUpdateReady", emitted: "sgx43", uses: 8, contextSha256: "a19e03cbed1a9f81922c5f2dfe3b37c31c22c60a61c07ce3a32f95226e0394b9" },
  { field: "relevanceNormalUpdateStage", emitted: "sgx44", uses: 10, contextSha256: "faeef79420c2ff4177572b483554fa37410ed3f8d2189ffed4666e4fc1d82a77" },
  { field: "relevanceNotificationArms", emitted: "sgx45", uses: 9, contextSha256: "25416baa3877fdb0b11922f109ba4c91ad68e6811526ca7fee18e8796501e407" },
  { field: "relevanceNotificationComplete", emitted: "sgx46", uses: 6, contextSha256: "fa855961d47c5090d95bd9a14087d4086d29f503b39a03830783f0b3629fdf36" },
  { field: "relevanceNotificationReady", emitted: "sgx47", uses: 7, contextSha256: "0e85fec207d85742d8339a16ee2f63684c7b4739f7e9a974f7a80e21667fcad0" },
  { field: "relevanceNotificationStage", emitted: "sgx48", uses: 8, contextSha256: "11f79f06ad459fb8e51d44693939558785bc964d939fd1ba11cd306d1bd6e5ee" },
  { field: "relevancePendingCacheReads", emitted: "sgx49", uses: 7, contextSha256: "abc82c9897844db086824a228e4b6c6e78b3fc1c912ea9372879723980954155" },
  { field: "relevancePendingCacheReady", emitted: "sgx50", uses: 8, contextSha256: "10a1f1a6a27869da9bdd22427cc73b6104edd90314769a0aba207315da710fd1" },
  { field: "relevancePendingCacheStage", emitted: "sgx51", uses: 8, contextSha256: "68d7acb46f5956c30ff504e8cdf60246c1d37809132f115d8bceb3dde696b540" },
  { field: "relevancePostSyncStep", emitted: "sgx52", uses: 15, contextSha256: "8ed686650480730486efc203957e5a9ba8d0024b25062a6bceb9a4b725536fa1" },
  { field: "relevancePrimitiveResumed", emitted: "sgx53", uses: 9, contextSha256: "081c90ef4b77446a38e5062645ec07f8c82f5b494a4fbe473d09fa3b130575ee" },
  { field: "relevancePublicationLoopbackHeld", emitted: "sgx54", uses: 5, contextSha256: "81bee6760015bdb5f2f8bb15da395b8bd46fcdd1da0d765817a5348be02b0136" },
  { field: "relevancePublicationPostHeld", emitted: "sgx55", uses: 6, contextSha256: "ee0daebaaab235e2642c87e9254899f828c50c5caa1309e489d930ba448dec8d" },
  { field: "relevancePublicationPrepared", emitted: "sgx56", uses: 6, contextSha256: "a3164a2d3bd5e115e92e7080ae0f3c153df1d781471c41a96c107921d7cc606f" },
  { field: "relevancePublicationReturnStage", emitted: "sgx57", uses: 8, contextSha256: "a9e09626c8a22c128c78266796ecc1a58d47a51bede9f2dc845d70f6d4155fad" },
  { field: "relevancePublicationStage", emitted: "sgx58", uses: 19, contextSha256: "2ebab7f9872309f0dc423d1a0aade2760b825dca0010d36b9c3f57c8af329d99" },
  { field: "relevanceRecordAstResumed", emitted: "sgx59", uses: 9, contextSha256: "629e79fc2cf04f4a1fa0448eb00ded8c5e1db2924571745b78b9abda56ae7f22" },
  { field: "relevanceRegistrationArms", emitted: "sgx60", uses: 8, contextSha256: "2ea48cf4db3410742427086252de0ec9d08311489e29316a78dc2e6a5f6f9240" },
  { field: "relevanceRegistrationAttempted", emitted: "sgx61", uses: 9, contextSha256: "32b8f7bc2dbf39ba1c12a157534d3513097ad0c262fefeddb034919d475e9d69" },
  { field: "relevanceRegistrationCompleted", emitted: "sgx62", uses: 8, contextSha256: "4df02b7c06af358255828fe7abcc280ca5023c250c47e70d508f8218192a915b" },
  { field: "relevanceRegistrationEnrolled", emitted: "sgx63", uses: 9, contextSha256: "ea6863892712d005bbd65f23bf926a88f71278552074cdffc1500333d401f8b3" },
  { field: "relevanceRegistrationMainStep", emitted: "sgx64", uses: 11, contextSha256: "07480415e3d94595bbe7a835246ac2c60e4e56d37ff4c6abfe576e46acee11f7" },
  { field: "relevanceRenderDelegateArms", emitted: "sgx65", uses: 7, contextSha256: "3d76a42f21dd354abe21e67428f364f30f70ad422e1e2b0ad02e59da9fa4f274" },
  { field: "relevanceRenderDelegateReads", emitted: "sgx66", uses: 7, contextSha256: "24784aa42b7241d5dd1c9a3a50164651f7c63db8683a3c32257acab31118ea5a" },
  { field: "relevanceRenderDelegateReady", emitted: "sgx67", uses: 8, contextSha256: "50495692d454674e29897949196e5ffc645fc24c072487910ee8a80d6d341bb2" },
  { field: "relevanceRenderDelegateStage", emitted: "sgx68", uses: 12, contextSha256: "0e3ed6166daee2897c3d494c5debea5bc86e04e7371c994dda6d603c6cff69fc" },
  { field: "relevanceSaveBodyEnrolled", emitted: "sgx69", uses: 8, contextSha256: "d29d2340284ff5c2f8140b3e1106d13a74dc4c585399a4cc34d3a4e52118c9e5" },
  { field: "relevanceSaveGenerated", emitted: "sgx70", uses: 22, contextSha256: "9110662d7391a73b291671e9644d644bdcbb36002c989b294a155397ba5aeb26" },
  { field: "relevanceSdkGateStage", emitted: "sgx71", uses: 13, contextSha256: "2ce26b4d2006b920d412a7b1636207605068d1282b82bce031cff1c9b0349d91" },
  { field: "relevanceStatusBusReads", emitted: "sgx72", uses: 9, contextSha256: "244affa6af854e5189448fa2d106b931b4e47a79487574d57bff6363349a245d" },
  { field: "relevanceStatusBusReady", emitted: "sgx73", uses: 8, contextSha256: "c1e8926a2bf7b054be3ca797b0e15f1f952f091ea8c8fd9aeeb2725d9f2eec04" },
  { field: "relevanceStatusBusStage", emitted: "sgx74", uses: 8, contextSha256: "5b9cd70657c504a26d63a882e145dadd78aef02743ac051aa6f25b749cd94164" },
  { field: "relevanceStatusCloneReads", emitted: "sgx75", uses: 8, contextSha256: "912f6597649a18c015a09eaad9489a3b8cea34eb1e41cd1a5c67f3b4ec8909ba" },
  { field: "relevanceStatusCloneReady", emitted: "sgx76", uses: 8, contextSha256: "cfce0548874a1ff76c89c0f348111d3713a9f03dd31a3a78fb5b100d5f7a5e80" },
  { field: "relevanceStatusCloneStage", emitted: "sgx77", uses: 8, contextSha256: "a238f1e4b9c705b1431c59e0f1c4a9938d653fc986421ebbd8e3c0c7ecfb1064" },
  { field: "relevanceStatusDeliveryReads", emitted: "sgx78", uses: 9, contextSha256: "62b2fcef29b9f5ba78a29172960f3023e23480f0d3a3348d101ec50b6db62281" },
  { field: "relevanceStatusDeliveryReady", emitted: "sgx79", uses: 8, contextSha256: "c6710722115bb3eaff4dd79d3a9b3cef6ac6f95cecae0e81d1c72d7fc4e09c3b" },
  { field: "relevanceStatusDeliveryStage", emitted: "sgx80", uses: 8, contextSha256: "276dcbbd4b6306576c9c5370aa4f884301e6665030844ec8a87253a8716abccc" },
  { field: "relevanceStatusSubscriberReads", emitted: "sgx81", uses: 8, contextSha256: "55609f43cf0bf0d4a9d2fc742f18b466ed57b86d681d287eaa6db73d58b221bd" },
  { field: "relevanceStatusSubscriberReady", emitted: "sgx82", uses: 10, contextSha256: "dbcff4acf5ec1c3b7e7d97c8f2f8257356d5f5da79b3188345f8047b5c7cb28e" },
  { field: "relevanceStatusSubscriberStage", emitted: "sgx83", uses: 10, contextSha256: "1f9f3ee8b1ee94141730e13bbe96133f2b8a2a117d88b754a71111bc664bc46a" },
  { field: "relevanceStatusTabLookupReads", emitted: "sgx84", uses: 8, contextSha256: "e6f17735abb4be72f4bd7e1751b302edfc60cfe403f3fc2cf9ec7164d4614217" },
  { field: "relevanceStatusTabLookupReady", emitted: "sgx85", uses: 8, contextSha256: "da76eeaa9c52ff777f9b19541908d3cf613c0401fe88cfb21f054323be38681a" },
  { field: "relevanceStatusTabLookupResumed", emitted: "sgx86", uses: 8, contextSha256: "8aad2e8e069062e649870c0c2158642a907fa5319ae2fb14ad8632d07ffdaf5e" },
  { field: "relevanceStatusTabMutationReads", emitted: "sgx87", uses: 8, contextSha256: "0bb9d0c0004d9743ca7cb89272af4dafb07b116c4e55358296517f0a99e2c5c5" },
  { field: "relevanceStatusTabMutationReady", emitted: "sgx88", uses: 8, contextSha256: "656149f1337f0c0fba3e5983358814bb3eaeaa44f6c3091e4e5c4c37b82592b3" },
  { field: "relevanceStatusTabMutationResumed", emitted: "sgx89", uses: 8, contextSha256: "3e0a9328d77579f0cf3e8d5d1681072ffdbe875cdf139c3d942813ac2a37b693" },
  { field: "relevanceStructureBodyEnrollmentAttempted", emitted: "sgx90", uses: 4, contextSha256: "a64f432e30ae6726ea1bdbfdbb2958e45d4871aa449add43d77cbc2f2de955cc" },
  { field: "relevanceStructureMainStep", emitted: "sgx91", uses: 11, contextSha256: "0927605fc31012179abf7ffc1c23b01782dce756644971d4d33020f6671f562d" },
  { field: "relevanceStructureSqlBefore", emitted: "sgx92", uses: 9, contextSha256: "de634ee269858484aca01435f44a0a2f19584353f221f23f88d02aa3337ff1c1" },
  { field: "relevanceTailDeleteControlStep", emitted: "sgx93", uses: 9, contextSha256: "d6015557ff556f382e766e320411e9cd6c9f6769be028b4d331ed9905969e6e6" },
  { field: "relevanceTailDeleteReturnedResumed", emitted: "sgx94", uses: 5, contextSha256: "5a96e3f7448a1fb4bd01b52fae470cc74af27a150395d64d50dccb7946c8abf9" },
  { field: "relevanceTailObservationStep", emitted: "sgx95", uses: 11, contextSha256: "fcc0dfafb0f272104adadab9cb4e1c5e297192228f5ce2bb9e458b2a8fae0581" },
  { field: "relevanceUiPublicationContext", emitted: "sgx96", uses: 6, contextSha256: "7ccc78269e6f449f461d3aad2438cf00db61f5008eaa8ac0e26707d07bb1d6ce" },
  { field: "relevanceUploadCmReady", emitted: "sgx97", uses: 8, contextSha256: "81e52b3577ec9287ccd8508131004c726c0bfbf888584c6ac61b94c727189e86" },
  { field: "relevanceUploadCmStage", emitted: "sgx98", uses: 9, contextSha256: "b920f16589f77143ec02ceefe432da4f84573af969066b7799d6e1c15b2ed976" },
  { field: "relevanceUploadEntryReads", emitted: "sgx99", uses: 7, contextSha256: "468c46477f6a123a96fb346506c562dac13f470382c04721da19091573e1be77" },
  { field: "relevanceUploadEntryReady", emitted: "sgx100", uses: 8, contextSha256: "0e94b561d01859ee8220270963248fd943ae444c63c9b931972019f397c8b994" },
  { field: "relevanceUploadEntryStage", emitted: "sgx101", uses: 7, contextSha256: "c5c9ca698a9f510d680b1de5c33a4fdf280cc13d56dc466051af7e690d0d0bfe" },
  { field: "relevanceUploadModelReads", emitted: "sgx102", uses: 9, contextSha256: "577da192d593b18d79a1049e722f817e831249b6b5bcb319a50bbe41f17cadad" },
  { field: "relevanceUploadModelReady", emitted: "sgx103", uses: 8, contextSha256: "a14f2c6c5ba0fa384a8e73a6a1b1d32a384c7bf691f8addca3566ad6e1ec0c2e" },
  { field: "relevanceUploadModelStage", emitted: "sgx104", uses: 14, contextSha256: "74f6d486cb682adf7197df0dc4dbed294f48285d277873949813c634670b5188" },
  { field: "relevanceUploadRequestStep", emitted: "sgx105", uses: 9, contextSha256: "622e6dfe1d02492ff2b6a84981c549fad41a039e73c0d47b4672dad92aaf7379" },
  { field: "relevanceUploadReturnReads", emitted: "sgx106", uses: 10, contextSha256: "19be5abc8808149c18120a4e357574e8aebebd4fb933b67bf55fa01c2ed269b8" },
  { field: "relevanceUploadReturnReady", emitted: "sgx107", uses: 8, contextSha256: "3a0be5c5b555ef798b5ba8c3ed9ae8d7fce7e07a53a5ddf504396e70f8436686" },
  { field: "relevanceUploadReturnStage", emitted: "sgx108", uses: 10, contextSha256: "fdd7d16b53df76eac85dc749d18d54f39fbce63002cd08823f6f7ea9131d5206" },
  { field: "relevanceUploadSerializeReads", emitted: "sgx109", uses: 9, contextSha256: "6a68cd1a44fa612298e9486227077f76d8f97f2caa4cb40a4be7e1e2e948263e" },
  { field: "relevanceUploadSerializeReady", emitted: "sgx110", uses: 8, contextSha256: "6ff91833be82af429b3fbe89db5a30b8275c21d915344736db8cb9851fe93f95" },
  { field: "relevanceUploadSerializeStage", emitted: "sgx111", uses: 12, contextSha256: "ade36a5111000dc480bbc30048b9973b3533f3fa99e44e9f490dad89cf749f3e" },
  { field: "schematicDisplayAbort", emitted: "sgx112", uses: 110, contextSha256: "3f98c2430ee502acd155d0375b722897bf3c8cfd19ad93036bc61442ce189f3f" },
  { field: "schematicDisplayConstructionComplete", emitted: "sgx113", uses: 15, contextSha256: "930c56d5d3991a9b1ca2e7f1f9f8d1e49e2b4fdab8c387e423f681bd57879f8e" },
  { field: "schematicDisplayContext", emitted: "sgx114", uses: 10, contextSha256: "ceecab1acde22c43b2823b17f567775b5719e9bf2ff23ee3c9663b4bba558653" },
  { field: "schematicDisplayOperation", emitted: "sgx115", uses: 18, contextSha256: "8a9e56021656a2700cb31f0147351cc6560bdf3a067986fc398df7cfd392d167" },
  { field: "schematicDisplaySession", emitted: "sgx116", uses: 60, contextSha256: "b4487ec5c4bda896eaa8c98b962a77fa8930f0f39c0f08ff94db8eb5e4fc3e00" },
  { field: "schematicDisplayTarget", emitted: "sgx117", uses: 28, contextSha256: "386d94bc3da04c04ce83839b482daea52e115e57f2635ca1ac3a8d4824e04575" },
  { field: "schematicDisplayTuple", emitted: "sgx118", uses: 23, contextSha256: "587d11c510af19bc95f82ef68984320c2b14f9e34ed0695a7e1a2724b45b3212" },
  { field: "schematicDisplayWrite209", emitted: "sgx119", uses: 9, contextSha256: "a67cd816d01f4571f9c05296cd9bcba6cb6619baf704dc1e4a0104f351062064" },
  { field: "schematicInitialCacheCompleted", emitted: "sgx120", uses: 6, contextSha256: "4ac223c250905cf18ed85e2623bf4262bd93478d7a1868842d160c5754a62d5f" },
  { field: "schematicInitialSyncCompleted", emitted: "sgx121", uses: 7, contextSha256: "f644273edf06051e50357fec609728a7cbe61bf7b8a0556b01be4dc0b67cce08" },
  { field: "schematicInitialSyncStage", emitted: "sgx122", uses: 8, contextSha256: "85e6c6425f8cca77ca5658126ff3c4cd24aef831d50eaf29aa7ccf7b7ebf3419" },
  { field: "schematicPeriodicSyncStage", emitted: "sgx123", uses: 13, contextSha256: "34acb94a655ae206ad52d019547ee162a589434a1972cdb7aca3db57e87099ce" },
  { field: "schematicProducerConstructorStep", emitted: "sgx124", uses: 8, contextSha256: "50040c721adfc43da054bacb1b9f34460a037cd275821414e51e5e87ee6a29e0" },
  { field: "schematicProducerContext", emitted: "sgx125", uses: 10, contextSha256: "3a61803d51d5062b4fd72855293ca1fe552f763885f07792b6ea6c61f4c9efbe" },
  { field: "schematicProducerGuards", emitted: "sgx126", uses: 8, contextSha256: "30548acfdfefb46e241028ebbbf27cf30bc7fe55408d06fafbca7ba0877b3d42" },
  { field: "schematicProducerIntrinsicsReproved", emitted: "sgx127", uses: 8, contextSha256: "7d448d01e03621d11301560da22a87a67e1f0bb7406aa312d15c1d362824fdb8" },
  { field: "schematicProducerMembersCaptured", emitted: "sgx128", uses: 5, contextSha256: "361beef4e546b1451fd977f2775168032ffc2a2ea3c8fbc7581b289d998983ad" },
  { field: "schematicProducerMembersProperties", emitted: "sgx129", uses: 5, contextSha256: "7da43c96e20527f627e105fd10f1ab5d20519f32e765e58ee70c438c83cf8f61" },
  { field: "schematicProducerModeRequested", emitted: "sgx130", uses: 14, contextSha256: "dcb3014816972ac0664582592e61f2690938f352233b60c53afb52f2da1a5c34" },
  { field: "schematicProducerObserveArms", emitted: "sgx131", uses: 10, contextSha256: "fa624bfbecc4465973eb927c231bb07c47d31092c927efff45e4389def9234ed" },
  { field: "schematicProducerPrefixEnrolled", emitted: "sgx132", uses: 17, contextSha256: "05c2a711309f8e7d504cb400eb09b82f2c5fb69f3844468020b5ab46d7e277ba" },
  { field: "schematicRelevanceClockBound", emitted: "sgx133", uses: 7, contextSha256: "c5800dd5d5b1c0ab02fb8994b4e068fc446005c2d2fd6b4a3643bfda86071d4b" },
  { field: "schematicSavePoints", emitted: "sgx134", uses: 10, contextSha256: "34ae5a05d039b3ed685ff193d0593cfcf7462c6432eb05a7f3dd933a71264c3d" },
  { field: "schematicStartupActive", emitted: "sgx135", uses: 8, contextSha256: "d67729b30c129ab7e4b39b30dc050e8b8bc9ababd4236ab4372df0b49caa6d18" },
  { field: "schematicStructureBootstrapResumed", emitted: "sgx136", uses: 20, contextSha256: "4c6e838a2b193d5671533757422f8f188921596f23ebe35a33ab4b9dc42f36b9" },
  { field: "schematicStructurePoints", emitted: "sgx137", uses: 13, contextSha256: "c1ddb2649ec1a21b048046e27b19baf505aaabd85e1114d8d89b048f204b7920" },
  { field: "schematicStructureTransportBodyReserved", emitted: "sgx138", uses: 8, contextSha256: "f7f0cd34c1c38a61ff0f81467bff87b3c64c3cf0b7310700590bad44c9e1bd80" },
  { field: "schematicStructureTransportCaptured", emitted: "sgx139", uses: 7, contextSha256: "a95838c7bc5c79a6938de94ad968443a76b4bddd38a3af1adfc038d8a30965a8" },
  { field: "schematicStructureTransportContext", emitted: "sgx140", uses: 7, contextSha256: "879f6acfe03084b08473cca725bb9fc5a9f80794ecc4ea7323f8ae11ec9da361" },
  { field: "schematicStructureTransportPoints", emitted: "sgx141", uses: 6, contextSha256: "b38770573e22b598e67cf30412707c3b7bd4690c95f2eb6a1f3e310ba2c80941" },
  { field: "schematicStructureTransportPublished", emitted: "sgx142", uses: 6, contextSha256: "38ccade58032f920a77b332b1ee5679e3f40f0d487c52d28e18086ec403fff0c" },
  { field: "schematicStructureTransportReturnJoin", emitted: "sgx143", uses: 5, contextSha256: "be0d07e0809f0fb8d270fdf2d87ed5cbbe0e53f16ff7e57829dcc44a1140b0c9" },
  { field: "schematicStructureTransportReturnedResumed", emitted: "sgx144", uses: 5, contextSha256: "753817d88c798c0d5f42d0b7f54a5a2473c72f680c29747b777d31fdb21f99b5" },
  { field: "schematicStructureTransportSendResumed", emitted: "sgx145", uses: 5, contextSha256: "25ce56f69a14628d97f8d11c34bed1b1ab0c0a74c030ec9dc7ec872b7ea7f724" },
  { field: "schematicStructureTransportValue", emitted: "sgx146", uses: 5, contextSha256: "1d60770e4b7c4045502d4c324cc54d0475c4179872b70d062797063e04e9af47" },
  { field: "schematicWorkerInstrumentRemoved", emitted: "sgx147", uses: 7, contextSha256: "3a0799dde8dba409c1d7f93e894c2b3a4ca545aa481d6645d82d6542041a8a77" },
  { field: "schematicWorkerPageUuid", emitted: "sgx148", uses: 8, contextSha256: "7d502c5c2ab18985740e2fcac79065cee8c219d4b77fb5840f9468344ae1c796" },
  { field: "schematicWorkerParentRunning", emitted: "sgx149", uses: 9, contextSha256: "9b734af9a10d82e761efb0b35f87ce43b703e3ff9b423ed1cb47aefd2bd4b5d4" },
  { field: "schematicWorkerProjectScript", emitted: "sgx150", uses: 16, contextSha256: "e365d50b98299dd7987b73a61a52723daee6d5284547e796bcc62f50bf8d62f6" },
  { field: "schematicWorkerProjectUuid", emitted: "sgx151", uses: 16, contextSha256: "2e67d3c966f95a9e6e6bc26065e73f8c99f20d26cc6f25aa0f76874ab5dce3cf" },
  { field: "schematicWorkerSession", emitted: "sgx152", uses: 70, contextSha256: "5f3c9217321775f2fa6d31bc1c1529163b2b759c59367e67e75bee6a5b629f99" },
  { field: "schematicWorkerSourceRead", emitted: "sgx153", uses: 24, contextSha256: "c0af3be3241bbafb90bb7a4d06582cfbf0607dc119d5d9975ad54c4ba20face3" },
  { field: "schematicWorkerStage", emitted: "sgx154", uses: 50, contextSha256: "6e3938767331ffe137d2848a9f726edc7329f9982a672ec994f872543b51699e" },
] as const);
const FIELDS = CURRENT_SCHEMATIC_PRIVATE_FIELDS;
/** Appended Wire-only fields. The original155-row catalogue is byte-exact.
 * Every declaration and reference stays in the separately pinned region. */
export const CURRENT_SCHEMATIC_WIRE_ACCESSOR_PRIVATE_FIELDS = freezeDeep([
  { field: "schematicWireAccessorNormal", emitted: "sgx155", uses: 3, contextSha256: "06ee66506b129506cf25c3d4981c836fb44baa8f96f2535625484d97c5703e35" },
  { field: "schematicWireAccessorCleanup", emitted: "sgx156", uses: 3, contextSha256: "d8e1c3a218d42e763e4b5f4d5ae4841458149ec3ba8f761eae71915e55fd3b02" },
] as const);
const WIRE_FIELDS = CURRENT_SCHEMATIC_WIRE_ACCESSOR_PRIVATE_FIELDS;
const wireReferences = [
  ...WIRE_FIELDS,
  { field: "schematicDisplayAbort", uses: 1, contextSha256: "725db305b1aed8893149ff08bbef2a0616c510c275012c2a422cdd99d24ccaac" },
  { field: "schematicDisplayTuple", uses: 2, contextSha256: "74753a038db467512054c6b869ae203767762efd4a3ed5c0d7663fa9cb847d51" },
  { field: "schematicDisplayTarget", uses: 2, contextSha256: "6335910645c19f159ce64cf92fb043a36a3f3a6d9385cf92baccc4237bf52aa6" },
  { field: "schematicDisplayOperation", uses: 2, contextSha256: "d9adccc8093e75a0fdf828bf7d9afdc24ea8be0ad015017092668a0192f7a790" },
  { field: "schematicDisplaySession", uses: 1, contextSha256: "5bc895777241d3c054c3f6a575c8e7586156bbcfde6c85849fbe69288c4ad9fd" },
] as const;
export const CURRENT_SCHEMATIC_WIRE_LEXICAL_PRIVATE_FIELDS = freezeDeep([
  { field: "schematicWireLexicalNormal", emitted: "sgx157", uses: 5, contextSha256: "bd8b0f23be28cf4fc0157d337c2dbbfe1c7997aa750d1eaecee2e42e3bc84443" },
  { field: "schematicWireLexicalCleanup", emitted: "sgx158", uses: 5, contextSha256: "b8e9936af773345a22c88322e28b6e571da43950ae7a14749faaf1ce1bef46d2" },
] as const);
const LEXICAL_FIELDS = CURRENT_SCHEMATIC_WIRE_LEXICAL_PRIVATE_FIELDS;
const lexicalReferences = [
  ...LEXICAL_FIELDS,
  { field: "schematicDisplayAbort", uses: 2, contextSha256: "eeca8286d29adbc90e9ba9666c4f4282649ea067743f05660f419df7ceb3e9f8" },
  { field: "schematicDisplayTuple", uses: 4, contextSha256: "423173b639204c58cf7bb201216adcbc0200da5c2d1d71549ad4645eca93656f" },
  { field: "schematicDisplayTarget", uses: 4, contextSha256: "3d602293abfb7ec2a04af8e435ec7f886ee7d3f0488955c309dffbb6a8423a6f" },
  { field: "schematicDisplayOperation", uses: 4, contextSha256: "dcb76c490c34ed3de465df17a60daa8a265ed153b3b1b45d67e3c49598993548" },
  { field: "schematicDisplaySession", uses: 2, contextSha256: "ab8def52eb37bae423be20e9662e48e3562d41f6e4769259e23073e2b8864a8a" },
] as const;
const allFields = [...FIELDS, ...WIRE_FIELDS, ...LEXICAL_FIELDS];
const originalNames = new Map<string, typeof allFields[number]>(allFields.map(row => [row.field, row]));
const emittedNames = new Set<string>(allFields.map(row => row.emitted));
need(createHash("sha256").update(JSON.stringify(FIELDS)).digest("hex") === "5a06e467ef7cf91f7197021c6df811a4e1b723a275c1721a42785d39bd6ae45d");
/** These exact names describe the fixed upload protocol, never Owner object
 * serialization. Pin every occurrence; all other serializer/reflection tokens
 * still refuse before emitting a renamed source. */
const protocolNames = [
  { name: "relevanceUploadSerializeHeld", uses: 5, contextSha256: "e701f9ce94bd14e604b4deac270ace0a021afdc4a918a7f2048558557c863a88" },
  { name: "EasyedaSchematicRelevanceUploadSerializeProtocol", uses: 2, contextSha256: "4440f47032719e742c1942f1b97ce0555d3bdeacbae3d59e9da304c0ab4b324c" },
  { name: "relevanceUploadSerializeBound", uses: 5, contextSha256: "b05a260587384874555f7f0bb1bfc8e9e6fc4ec217db2799ff912937c780dd64" },
  { name: "relevanceUploadSerializeReady", uses: 8, contextSha256: "d45fad2a6f02577453e69c546acc4a8a903a1e2b41becb78d065f70e39e8cfa4" },
  { name: "relevanceUploadSerializeStage", uses: 12, contextSha256: "a45f2402b9abbcbc51fcedb4d53695d6d0fd7d14f730a839aa476c86423f0df7" },
  { name: "relevanceUploadSerializeReads", uses: 9, contextSha256: "cff42638185d673df392295ec9eddc06cf73fcbceab186e1f0f86903c916b88e" },
  { name: "relevanceUploadSerializeArms", uses: 4, contextSha256: "59ca1c8e974cce0fb4f26089621c004752ad66f6277589a28f8f2cf6acb30a13" },
  { name: "AssertSchematicRelevanceUploadSerialize", uses: 3, contextSha256: "bf85df580cf178be62bd5b8e5a5b7d31a20cf028f7bfa2e3eaaeb8d6aa2a6b59" },
  { name: "RelevanceSerializeLimit", uses: 3, contextSha256: "fdc59eed5009bd1249155b3db87c71c20e108e3db9fdf033e6c31ec74e3dd89a" },
  { name: "ControlSchematicRelevanceUploadSerialize", uses: 1, contextSha256: "c06dc60f4d619b8ca64cfc212f3042bd0f00751a7bd0cc18ae877b68b082afbc" },
  { name: "StepSchematicRelevanceUploadSerialize", uses: 1, contextSha256: "c6042187da968587a7b52a72bb660721fa8ec366155b8039b8f8d79526368afc" },
] as const;
const protocolByName = new Map<string, typeof protocolNames[number]>(protocolNames.map(row => [row.name, row]));
const forbidden = new Set(["public", "protected", "internal"]);
const primitive = new Set(["bool", "int", "string", "long", "short", "byte", "object", "char", "uint", "ulong", "var"]);
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_PRIVATE_FIELD_EMITTER"); } }
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
function fieldDeclarationLedger(base: Map<string, number>, wire: boolean, lexical: boolean, accessorLedger: Map<string, number>, lexicalLedger: Map<string, number>): Map<string, number> {
  if (wire) { return accessorLedger; } if (lexical) { return lexicalLedger; } return base;
}
/** Prove every selected spelling is one private owner FIELD, with its exact
 * declaration/reference census. A fresh name, local shadow, anonymous key,
 * foreign owner or serializer/reflection construct permanently refuses. */
/** Two independently pinned regions preserve all earlier catalogues. The
 * selector is internal fixed data; no caller region or field list is accepted. */
function inspectWireRegion(source: string, kind: "ACCESSOR" | "LEXICAL"): Readonly<{ from: number; to: number }> {
  const begin = `// BEGIN GENERATED SCHEMATIC WIRE ${kind} FIELDS`; const end = `// END GENERATED SCHEMATIC WIRE ${kind} FIELDS`;
  const from = source.indexOf(begin); const stop = source.indexOf(end); const outer = "// BEGIN GENERATED SCHEMATIC WIRE EDIT BIRTH209"; const outerEnd = "// END GENERATED SCHEMATIC WIRE EDIT BIRTH209";
  need(from !== -1 && stop > from && source.split(begin).length === 2 && source.split(end).length === 2 && source.split(outer).length === 2 && source.split(outerEnd).length === 2 && source.indexOf(outer) < from && stop < source.indexOf(outerEnd));
  const prefix = kind === "ACCESSOR" ? "public sealed partial class EasyedaDiagnosticOwner {\nbool schematicWireEdit209;\n" : "public sealed partial class EasyedaDiagnosticOwner {\n";
  const suffix = kind === "ACCESSOR" ? "\nstatic string SchematicWireEditStart {get{return SchematicRelevanceDisplayStart;}}" : "\n}\n// END GENERATED SCHEMATIC WIRE EDIT BIRTH209";
  need(source.slice(from - prefix.length, from) === prefix && source.startsWith(suffix, stop + end.length));
  const region = source.slice(from, stop + end.length); const hash = kind === "ACCESSOR" ? "0a761220b0bac7550a3a694c33f5af28bf430c8daf850494f78c461096d1980d" : "2aeebf017466f2c31adb13e9f23f762d1c34a3f7232e3ca6eef8a1f330fbbf18";
  need(createHash("sha256").update(region).digest("hex") === hash);
  const active = tokenize(region).filter(token => token.kind !== "space" && token.kind !== "comment"); const references = kind === "ACCESSOR" ? wireReferences : lexicalReferences;
  for (const row of references) {
    const context = active.flatMap((token, index) => token.kind === "identifier" && token.text === row.field ? [active.slice(Math.max(0, index - 4), index + 5).map(item => item.kind === "string" || item.kind === "verbatim" || item.kind === "char" ? `[${item.kind}]` : item.text)] : []);
    need(context.length === row.uses && createHash("sha256").update(JSON.stringify(context)).digest("hex") === row.contextSha256);
  }
  return Object.freeze({ from, to: stop + end.length });
}
function inspect(source: string): readonly Token[] {
  need(FIELDS.length === 155 && WIRE_FIELDS.length === 2 && LEXICAL_FIELDS.length === 2 && originalNames.size === 159 && emittedNames.size === 159 && FIELDS.reduce((sum, row) => sum + row.uses, 0) === 1718 && WIRE_FIELDS.reduce((sum, row) => sum + row.uses, 0) === 6 && LEXICAL_FIELDS.reduce((sum, row) => sum + row.uses, 0) === 10);
  const accessorRegion = inspectWireRegion(source, "ACCESSOR"); const lexicalRegion = inspectWireRegion(source, "LEXICAL"); need(accessorRegion.to < lexicalRegion.from);
  const all = tokenize(source); const active = all.filter(token => token.kind !== "space" && token.kind !== "comment");
  const protocolContexts = new Map<string, string[][]>();
  const counts = new Map<string, number>(); const declarations = new Map<string, number>(); const scopes: ClassScope[] = []; const anonymous: number[] = []; const contexts = new Map<string, string[][]>();
  const wireDeclarations = new Map<string, number>(); const lexicalDeclarations = new Map<string, number>();
  let depth = 0; let pending: Readonly<{ name: string; kind: ClassScope["kind"] }> | null = null; let timezoneCalls = 0;
  for (const [index, token] of active.entries()) {
    const own = name(token);
    if (own !== null) {
      need(!emittedNames.has(own));
      const timezone = own === "ToSerializedString" && active[index - 1]?.text === "." && active[index - 2]?.text === "zone" && active[index + 1]?.text === "(" && active[index + 2]?.text === ")";
      if (timezone) { timezoneCalls += 1; }
      const protocol = protocolByName.get(own);
      need(timezone || protocol !== undefined || !/serializ|reflect|GetField|GetMember|GetPropert|TypeDescriptor|GetRuntimeField|GetMethod|InvokeMember|GetRuntimeMethod|GetType|TypeInfo|dynamic|Formatter|nameof|BindingFlags/iu.test(own));
      if (protocol !== undefined) { const context = protocolContexts.get(own) ?? []; context.push(active.slice(Math.max(0, index - 5), index + 6).map(item => item.kind === "string" || item.kind === "verbatim" || item.kind === "char" ? `[${item.kind}]` : item.text)); protocolContexts.set(own, context); }
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
        if (row !== undefined) {
          need(token.text === own && scope !== undefined && scope.name === "EasyedaDiagnosticOwner" && scope.kind === "class");
          const wire = token.start > accessorRegion.from && token.end < accessorRegion.to; const lexical = token.start > lexicalRegion.from && token.end < lexicalRegion.to; const guarded = wire || lexical;
          need(guarded || ![...WIRE_FIELDS, ...LEXICAL_FIELDS].some(field => field.field === own));
          need(!guarded || scopes.length === 1 && scope.depth === 1);
          need(!wire || wireReferences.some(field => field.field === own)); need(!lexical || lexicalReferences.some(field => field.field === own));
          counts.set(own, (counts.get(own) ?? 0) + (guarded ? 0 : 1));
          const context = contexts.get(own) ?? []; const nextContext = active.slice(Math.max(0, index - 4), index + 5).map(item => item.kind === "string" || item.kind === "verbatim" || item.kind === "char" ? `[${item.kind}]` : item.text);
          contexts.set(own, guarded ? context : [...context, nextContext]);
          const next = active[index + 1]?.text; const previous = active[index - 1];
          need(!(anonymous.at(-1) === depth && (previous?.text === "{" || previous?.text === ",") && (next === "=" || next === "," || next === "}")));
          const declared = privateField(active, index, scope, depth); const selected = fieldDeclarationLedger(declarations, wire, lexical, wireDeclarations, lexicalDeclarations); selected.set(own, (selected.get(own) ?? 0) + (declared ? 1 : 0));
        }
      }
    }
  }
  need(depth === 0 && scopes.length === 0 && anonymous.length === 0 && timezoneCalls === 1); need(source.split("System.TimeZoneInfo zone = System.TimeZoneInfo.Local;").length === 2);
  for (const row of protocolNames) { const context = protocolContexts.get(row.name); need(context !== undefined && context.length === row.uses && createHash("sha256").update(JSON.stringify(context)).digest("hex") === row.contextSha256); }
  for (const row of FIELDS) { const context = contexts.get(row.field); need(context !== undefined); need(declarations.get(row.field) === 1 && counts.get(row.field) === row.uses && createHash("sha256").update(JSON.stringify(context)).digest("hex") === row.contextSha256); }
  for (const row of wireReferences) { need(wireDeclarations.get(row.field) === (WIRE_FIELDS.some(field => field.field === row.field) ? 1 : 0)); }
  for (const row of lexicalReferences) { need(lexicalDeclarations.get(row.field) === (LEXICAL_FIELDS.some(field => field.field === row.field) ? 1 : 0)); }
  return all;
}
/** Emit only injective globally fresh FIELD tokens. Splicing retains every
 * byte between those tokens, including comments, literals and table payloads. */
export function compactCurrentSchematicPrivateFields(source: string): string {
  const tokens = inspect(source); const parts: string[] = []; let prior = 0;
  for (const token of tokens) { if (token.kind === "identifier") { const row = originalNames.get(token.text); if (row !== undefined) { parts.push(source.slice(prior, token.start), row.emitted); prior = token.end; } } }
  parts.push(source.slice(prior)); const result = parts.join("");
  const observed = tokenize(result); need(observed.length === tokens.length);
  for (const [index, token] of tokens.entries()) { const now = observed[index]; need(now !== undefined && now.kind === token.kind && now.text === (token.kind === "identifier" ? originalNames.get(token.text)?.emitted ?? token.text : token.text)); }
  return result;
}
