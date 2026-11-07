/** Exact accessor/decorator metadata from the two pinned SCH scripts. UTF16
 * locations bind actual inspector functions; full source identity alone grants
 * no live owner, closure lineage, mutation or Save authority. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_FIELDS = ["x", "y", "rotation", "fontFamily", "fontSize", "fontWeight", "italic", "underline", "hAlign", "vAlign"] as const;
export type GeneratedSchematicDisplayAccessorField = typeof GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_FIELDS[number];
export const GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_SOURCE = freezeDeep([
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "methods": {
      "textConstructor": {
        "name": "c1",
        "arity": 0,
        "kind": "class",
        "start": 4_126_291,
        "end": 4_129_614,
        "bytes": 3323,
        "sha256": "1d6d4730c8e2829c69f7d0fe4e7a4df7c885aa80881aa297a2724c83ccc13d45",
        "lineNumber": 3606,
        "columnNumber": 459_435
      },
      "baseTextConstructor": {
        "name": "il",
        "arity": 0,
        "kind": "class",
        "start": 3_492_407,
        "end": 3_498_227,
        "bytes": 5820,
        "sha256": "b5131e89cea83a6c60a4f419e90bcd25499ef3c67fabb8deb67a494d63a23c6a",
        "lineNumber": 3597,
        "columnNumber": 7387
      },
      "monitorConstructor": {
        "name": "sk",
        "arity": 1,
        "kind": "class",
        "start": 1_695_766,
        "end": 1_697_900,
        "bytes": 2134,
        "sha256": "e6e27d3662cb12c4821255805df4c8ce4d96265bd99451cdfb09fe71e5881a63",
        "lineNumber": 58,
        "columnNumber": 57_165
      },
      "x.get": {
        "name": "get x",
        "arity": 0,
        "kind": "method",
        "start": 3_494_927,
        "end": 3_494_950,
        "bytes": 23,
        "sha256": "7f24ef3bf32adc9ddc587b45efc1c96dbd6ce9b0a395d664d108edc2dc3a4d42",
        "lineNumber": 3597,
        "columnNumber": 9884
      },
      "x.set": {
        "name": "set x",
        "arity": 1,
        "kind": "method",
        "start": 3_494_950,
        "end": 3_495_093,
        "bytes": 143,
        "sha256": "f03383b764fe2b9a523d6d80d848bd3791eb5ec151b90a526d3fb1e92206c16a",
        "lineNumber": 3597,
        "columnNumber": 9907
      },
      "y.get": {
        "name": "get y",
        "arity": 0,
        "kind": "method",
        "start": 3_495_093,
        "end": 3_495_116,
        "bytes": 23,
        "sha256": "bdedc39617ca4d724bf96a06d06277931692372ac70b9a7738f9d9d8f804d05e",
        "lineNumber": 3597,
        "columnNumber": 10_050
      },
      "y.set": {
        "name": "set y",
        "arity": 1,
        "kind": "method",
        "start": 3_495_116,
        "end": 3_495_259,
        "bytes": 143,
        "sha256": "9d0ffc1a17b15ddf13f92a058c1be58a1fecab11ba87327dde70b747ef18bed8",
        "lineNumber": 3597,
        "columnNumber": 10_073
      },
      "rotation.get": {
        "name": "get rotation",
        "arity": 0,
        "kind": "method",
        "start": 3_494_836,
        "end": 3_494_873,
        "bytes": 37,
        "sha256": "a096050bda4313035d5cb316d95368467c1d25c4d8251ef323408b2dfd08b14f",
        "lineNumber": 3597,
        "columnNumber": 9800
      },
      "rotation.set": {
        "name": "set rotation",
        "arity": 1,
        "kind": "method",
        "start": 3_494_873,
        "end": 3_494_927,
        "bytes": 54,
        "sha256": "44882e459165051b50f3b18def760cf63b7c5634bb6890ad1cc39dec5f2726d6",
        "lineNumber": 3597,
        "columnNumber": 9837
      },
      "fontFamily.get": {
        "name": "get fontFamily",
        "arity": 0,
        "kind": "method",
        "start": 3_492_920,
        "end": 3_492_961,
        "bytes": 41,
        "sha256": "47e43a73385f84c687d585e294d9098d881ed550d488413616fc5aef7e0e5d3c",
        "lineNumber": 3597,
        "columnNumber": 7886
      },
      "fontFamily.set": {
        "name": "set fontFamily",
        "arity": 1,
        "kind": "method",
        "start": 3_492_961,
        "end": 3_492_998,
        "bytes": 37,
        "sha256": "1439bac3eb55b03c4ae45bda79278a9a2349c65edb11a2dc0602546a4d836aae",
        "lineNumber": 3597,
        "columnNumber": 7927
      },
      "fontSize.get": {
        "name": "get fontSize",
        "arity": 0,
        "kind": "method",
        "start": 3_493_928,
        "end": 3_493_965,
        "bytes": 37,
        "sha256": "f981a77e62bdbf551833543e65bb33b6adb82838e70f922501ff1ef8c6850ac9",
        "lineNumber": 3597,
        "columnNumber": 8892
      },
      "fontSize.set": {
        "name": "set fontSize",
        "arity": 1,
        "kind": "method",
        "start": 3_493_965,
        "end": 3_493_998,
        "bytes": 33,
        "sha256": "603f67a248bcc4ad65686420041492cf76d692255fae99b69eab3ec8c67588ec",
        "lineNumber": 3597,
        "columnNumber": 8929
      },
      "fontWeight.get": {
        "name": "get fontWeight",
        "arity": 0,
        "kind": "method",
        "start": 3_493_306,
        "end": 3_493_347,
        "bytes": 41,
        "sha256": "b995ede80b9b0f626cba56fad1411d7ec88c47b88019d7ad81a16bd3eb231d6d",
        "lineNumber": 3597,
        "columnNumber": 8272
      },
      "fontWeight.set": {
        "name": "set fontWeight",
        "arity": 1,
        "kind": "method",
        "start": 3_493_347,
        "end": 3_493_384,
        "bytes": 37,
        "sha256": "67e9bc7da48dac1b529a0ba7a4169cf2f9645bc11626166f3abedd8709c5947c",
        "lineNumber": 3597,
        "columnNumber": 8313
      },
      "italic.get": {
        "name": "get italic",
        "arity": 0,
        "kind": "method",
        "start": 3_493_628,
        "end": 3_493_661,
        "bytes": 33,
        "sha256": "06dd02651b4cf8adc46af97574589af9a5087b1270e3ace30e88d84422ac658e",
        "lineNumber": 3597,
        "columnNumber": 8590
      },
      "italic.set": {
        "name": "set italic",
        "arity": 1,
        "kind": "method",
        "start": 3_493_661,
        "end": 3_493_690,
        "bytes": 29,
        "sha256": "39bc0cb98e7b9277db46f9a2b7f516d2e4623a698d6a814a5f5f7a5917cfa9fd",
        "lineNumber": 3597,
        "columnNumber": 8623
      },
      "underline.get": {
        "name": "get underline",
        "arity": 0,
        "kind": "method",
        "start": 3_494_310,
        "end": 3_494_349,
        "bytes": 39,
        "sha256": "7ca40ecb21942604af7020f872a1656f1b3c9fd548923da6b04d31e4c1a6acb7",
        "lineNumber": 3597,
        "columnNumber": 9275
      },
      "underline.set": {
        "name": "set underline",
        "arity": 1,
        "kind": "method",
        "start": 3_494_349,
        "end": 3_494_384,
        "bytes": 35,
        "sha256": "47dd7da9c9d68b8ab123c50055d10c523e414c37f7b317203ed9ff03054a8cfa",
        "lineNumber": 3597,
        "columnNumber": 9314
      },
      "hAlign.get": {
        "name": "get hAlign",
        "arity": 0,
        "kind": "method",
        "start": 3_495_259,
        "end": 3_495_292,
        "bytes": 33,
        "sha256": "502b66d4fab5a8f8c01fcc2eee6a3c5903c28fe718c0a8550a5c9d0610dd0512",
        "lineNumber": 3597,
        "columnNumber": 10_221
      },
      "hAlign.set": {
        "name": "set hAlign",
        "arity": 1,
        "kind": "method",
        "start": 3_495_292,
        "end": 3_495_342,
        "bytes": 50,
        "sha256": "97f36a582fc6a45e43813a4eba64c94972db452d5eefa035d9d3f416db177e13",
        "lineNumber": 3597,
        "columnNumber": 10_254
      },
      "vAlign.get": {
        "name": "get vAlign",
        "arity": 0,
        "kind": "method",
        "start": 3_495_404,
        "end": 3_495_437,
        "bytes": 33,
        "sha256": "846b203125a72dcb555bbddc2ecd3a8e6e3b7617c3a231ce925792531959715a",
        "lineNumber": 3597,
        "columnNumber": 10_366
      },
      "vAlign.set": {
        "name": "set vAlign",
        "arity": 1,
        "kind": "method",
        "start": 3_495_437,
        "end": 3_495_487,
        "bytes": 50,
        "sha256": "4a39fd9f38e22d02432e00d802d4e1a3a0e6652ad80c750bc53b35fc0e872df6",
        "lineNumber": 3597,
        "columnNumber": 10_399
      },
      "decoratedSetter": {
        "name": "",
        "arity": 1,
        "kind": "regular",
        "start": 1_695_234,
        "end": 1_695_279,
        "bytes": 45,
        "sha256": "44e4be018aa9f38aafd6b7e4ad651629b6f787c5e5421fd63ddcd7c3bf76fed0",
        "lineNumber": 58,
        "columnNumber": 56_613
      },
      "decoratorSetter": {
        "name": "setter",
        "arity": 3,
        "kind": "method",
        "start": 1_698_024,
        "end": 1_698_117,
        "bytes": 93,
        "sha256": "faf3ea415aadefcacd313bd6a0eea1f59647ce65eb84c59c660dfbce01a67bf9",
        "lineNumber": 58,
        "columnNumber": 59_401
      },
      "decoratorAccessor": {
        "name": "accessor",
        "arity": 2,
        "kind": "method",
        "start": 1_697_955,
        "end": 1_698_023,
        "bytes": 68,
        "sha256": "ea5e403394af1e60a37077511110c265d91c280c8e7e4e59aaaa489b5d743936",
        "lineNumber": 58,
        "columnNumber": 59_334
      },
      "monitorWatch": {
        "name": "watch",
        "arity": 0,
        "kind": "method",
        "start": 1_697_209,
        "end": 1_697_899,
        "bytes": 690,
        "sha256": "bec50f3e041fdf23a8e46cbedfc494ddc21b539ba12792e11fa0ed62ad83c651",
        "lineNumber": 58,
        "columnNumber": 58_585
      },
      "monitorAst": {
        "name": "",
        "arity": 0,
        "kind": "arrow",
        "start": 1_697_287,
        "end": 1_697_329,
        "bytes": 42,
        "sha256": "0b278713c85e52953ed61d4ba0f6d7d31211ae3e4307b6d8f5cd64020925a549",
        "lineNumber": 58,
        "columnNumber": 58_658
      },
      "monitorRecord": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 1_697_343,
        "end": 1_697_577,
        "bytes": 234,
        "sha256": "785e2bb8b04f50a74c0cda4798c622d6ad410092f94d923b4f6221f5bc9dc362",
        "lineNumber": 58,
        "columnNumber": 58_714
      },
      "monitorSetAttribute": {
        "name": "",
        "arity": 4,
        "kind": "arrow",
        "start": 1_697_596,
        "end": 1_697_705,
        "bytes": 109,
        "sha256": "b4a4b0d4433ed1f6f28cc07b6878e78b3a8496d25716911ca381307fa30fb021",
        "lineNumber": 58,
        "columnNumber": 58_967
      }
    }
  },
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "methods": {
      "textConstructor": {
        "name": "hv",
        "arity": 0,
        "kind": "class",
        "start": 4_331_463,
        "end": 4_334_786,
        "bytes": 3323,
        "sha256": "52a25ab05e04d6380433aec2b8e53b1c17df312e0c6a98fe6ac6568afc9d3c11",
        "lineNumber": 4105,
        "columnNumber": 322_874
      },
      "baseTextConstructor": {
        "name": "il",
        "arity": 0,
        "kind": "class",
        "start": 3_872_522,
        "end": 3_878_342,
        "bytes": 5820,
        "sha256": "82e277be550a774cc7b2c3d2958d5e04e2ecb08f0f33cb70e9e59cfe77cc0822",
        "lineNumber": 4096,
        "columnNumber": 4323
      },
      "monitorConstructor": {
        "name": "Vk",
        "arity": 1,
        "kind": "class",
        "start": 1_892_320,
        "end": 1_894_454,
        "bytes": 2134,
        "sha256": "5f5f6e9b0ec99aeb0c1cbd3c156aee0e84d4000bfeb4651d28073f9162cb088a",
        "lineNumber": 556,
        "columnNumber": 112_702
      },
      "x.get": {
        "name": "get x",
        "arity": 0,
        "kind": "method",
        "start": 3_875_042,
        "end": 3_875_065,
        "bytes": 23,
        "sha256": "7f24ef3bf32adc9ddc587b45efc1c96dbd6ce9b0a395d664d108edc2dc3a4d42",
        "lineNumber": 4096,
        "columnNumber": 6820
      },
      "x.set": {
        "name": "set x",
        "arity": 1,
        "kind": "method",
        "start": 3_875_065,
        "end": 3_875_208,
        "bytes": 143,
        "sha256": "f03383b764fe2b9a523d6d80d848bd3791eb5ec151b90a526d3fb1e92206c16a",
        "lineNumber": 4096,
        "columnNumber": 6843
      },
      "y.get": {
        "name": "get y",
        "arity": 0,
        "kind": "method",
        "start": 3_875_208,
        "end": 3_875_231,
        "bytes": 23,
        "sha256": "bdedc39617ca4d724bf96a06d06277931692372ac70b9a7738f9d9d8f804d05e",
        "lineNumber": 4096,
        "columnNumber": 6986
      },
      "y.set": {
        "name": "set y",
        "arity": 1,
        "kind": "method",
        "start": 3_875_231,
        "end": 3_875_374,
        "bytes": 143,
        "sha256": "9d0ffc1a17b15ddf13f92a058c1be58a1fecab11ba87327dde70b747ef18bed8",
        "lineNumber": 4096,
        "columnNumber": 7009
      },
      "rotation.get": {
        "name": "get rotation",
        "arity": 0,
        "kind": "method",
        "start": 3_874_951,
        "end": 3_874_988,
        "bytes": 37,
        "sha256": "a096050bda4313035d5cb316d95368467c1d25c4d8251ef323408b2dfd08b14f",
        "lineNumber": 4096,
        "columnNumber": 6736
      },
      "rotation.set": {
        "name": "set rotation",
        "arity": 1,
        "kind": "method",
        "start": 3_874_988,
        "end": 3_875_042,
        "bytes": 54,
        "sha256": "44882e459165051b50f3b18def760cf63b7c5634bb6890ad1cc39dec5f2726d6",
        "lineNumber": 4096,
        "columnNumber": 6773
      },
      "fontFamily.get": {
        "name": "get fontFamily",
        "arity": 0,
        "kind": "method",
        "start": 3_873_035,
        "end": 3_873_076,
        "bytes": 41,
        "sha256": "47e43a73385f84c687d585e294d9098d881ed550d488413616fc5aef7e0e5d3c",
        "lineNumber": 4096,
        "columnNumber": 4822
      },
      "fontFamily.set": {
        "name": "set fontFamily",
        "arity": 1,
        "kind": "method",
        "start": 3_873_076,
        "end": 3_873_113,
        "bytes": 37,
        "sha256": "1439bac3eb55b03c4ae45bda79278a9a2349c65edb11a2dc0602546a4d836aae",
        "lineNumber": 4096,
        "columnNumber": 4863
      },
      "fontSize.get": {
        "name": "get fontSize",
        "arity": 0,
        "kind": "method",
        "start": 3_874_043,
        "end": 3_874_080,
        "bytes": 37,
        "sha256": "f981a77e62bdbf551833543e65bb33b6adb82838e70f922501ff1ef8c6850ac9",
        "lineNumber": 4096,
        "columnNumber": 5828
      },
      "fontSize.set": {
        "name": "set fontSize",
        "arity": 1,
        "kind": "method",
        "start": 3_874_080,
        "end": 3_874_113,
        "bytes": 33,
        "sha256": "603f67a248bcc4ad65686420041492cf76d692255fae99b69eab3ec8c67588ec",
        "lineNumber": 4096,
        "columnNumber": 5865
      },
      "fontWeight.get": {
        "name": "get fontWeight",
        "arity": 0,
        "kind": "method",
        "start": 3_873_421,
        "end": 3_873_462,
        "bytes": 41,
        "sha256": "b995ede80b9b0f626cba56fad1411d7ec88c47b88019d7ad81a16bd3eb231d6d",
        "lineNumber": 4096,
        "columnNumber": 5208
      },
      "fontWeight.set": {
        "name": "set fontWeight",
        "arity": 1,
        "kind": "method",
        "start": 3_873_462,
        "end": 3_873_499,
        "bytes": 37,
        "sha256": "67e9bc7da48dac1b529a0ba7a4169cf2f9645bc11626166f3abedd8709c5947c",
        "lineNumber": 4096,
        "columnNumber": 5249
      },
      "italic.get": {
        "name": "get italic",
        "arity": 0,
        "kind": "method",
        "start": 3_873_743,
        "end": 3_873_776,
        "bytes": 33,
        "sha256": "06dd02651b4cf8adc46af97574589af9a5087b1270e3ace30e88d84422ac658e",
        "lineNumber": 4096,
        "columnNumber": 5526
      },
      "italic.set": {
        "name": "set italic",
        "arity": 1,
        "kind": "method",
        "start": 3_873_776,
        "end": 3_873_805,
        "bytes": 29,
        "sha256": "39bc0cb98e7b9277db46f9a2b7f516d2e4623a698d6a814a5f5f7a5917cfa9fd",
        "lineNumber": 4096,
        "columnNumber": 5559
      },
      "underline.get": {
        "name": "get underline",
        "arity": 0,
        "kind": "method",
        "start": 3_874_425,
        "end": 3_874_464,
        "bytes": 39,
        "sha256": "7ca40ecb21942604af7020f872a1656f1b3c9fd548923da6b04d31e4c1a6acb7",
        "lineNumber": 4096,
        "columnNumber": 6211
      },
      "underline.set": {
        "name": "set underline",
        "arity": 1,
        "kind": "method",
        "start": 3_874_464,
        "end": 3_874_499,
        "bytes": 35,
        "sha256": "47dd7da9c9d68b8ab123c50055d10c523e414c37f7b317203ed9ff03054a8cfa",
        "lineNumber": 4096,
        "columnNumber": 6250
      },
      "hAlign.get": {
        "name": "get hAlign",
        "arity": 0,
        "kind": "method",
        "start": 3_875_374,
        "end": 3_875_407,
        "bytes": 33,
        "sha256": "502b66d4fab5a8f8c01fcc2eee6a3c5903c28fe718c0a8550a5c9d0610dd0512",
        "lineNumber": 4096,
        "columnNumber": 7157
      },
      "hAlign.set": {
        "name": "set hAlign",
        "arity": 1,
        "kind": "method",
        "start": 3_875_407,
        "end": 3_875_457,
        "bytes": 50,
        "sha256": "97f36a582fc6a45e43813a4eba64c94972db452d5eefa035d9d3f416db177e13",
        "lineNumber": 4096,
        "columnNumber": 7190
      },
      "vAlign.get": {
        "name": "get vAlign",
        "arity": 0,
        "kind": "method",
        "start": 3_875_519,
        "end": 3_875_552,
        "bytes": 33,
        "sha256": "846b203125a72dcb555bbddc2ecd3a8e6e3b7617c3a231ce925792531959715a",
        "lineNumber": 4096,
        "columnNumber": 7302
      },
      "vAlign.set": {
        "name": "set vAlign",
        "arity": 1,
        "kind": "method",
        "start": 3_875_552,
        "end": 3_875_602,
        "bytes": 50,
        "sha256": "4a39fd9f38e22d02432e00d802d4e1a3a0e6652ad80c750bc53b35fc0e872df6",
        "lineNumber": 4096,
        "columnNumber": 7335
      },
      "decoratedSetter": {
        "name": "",
        "arity": 1,
        "kind": "regular",
        "start": 1_891_370,
        "end": 1_891_415,
        "bytes": 45,
        "sha256": "44e4be018aa9f38aafd6b7e4ad651629b6f787c5e5421fd63ddcd7c3bf76fed0",
        "lineNumber": 556,
        "columnNumber": 111_732
      },
      "decoratorSetter": {
        "name": "setter",
        "arity": 3,
        "kind": "method",
        "start": 1_894_578,
        "end": 1_894_671,
        "bytes": 93,
        "sha256": "faf3ea415aadefcacd313bd6a0eea1f59647ce65eb84c59c660dfbce01a67bf9",
        "lineNumber": 556,
        "columnNumber": 114_938
      },
      "decoratorAccessor": {
        "name": "accessor",
        "arity": 2,
        "kind": "method",
        "start": 1_894_509,
        "end": 1_894_577,
        "bytes": 68,
        "sha256": "f91c6e147d17d3d65491a7744bf1717c0a9a676ccc15cc51e044645f1d053979",
        "lineNumber": 556,
        "columnNumber": 114_871
      },
      "monitorWatch": {
        "name": "watch",
        "arity": 0,
        "kind": "method",
        "start": 1_893_763,
        "end": 1_894_453,
        "bytes": 690,
        "sha256": "8359842c351d56ae5832e5c9f85f74a52447838c04d7e99f341cd1869f04d208",
        "lineNumber": 556,
        "columnNumber": 114_122
      },
      "monitorAst": {
        "name": "",
        "arity": 0,
        "kind": "arrow",
        "start": 1_893_841,
        "end": 1_893_883,
        "bytes": 42,
        "sha256": "0b278713c85e52953ed61d4ba0f6d7d31211ae3e4307b6d8f5cd64020925a549",
        "lineNumber": 556,
        "columnNumber": 114_195
      },
      "monitorRecord": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 1_893_897,
        "end": 1_894_131,
        "bytes": 234,
        "sha256": "785e2bb8b04f50a74c0cda4798c622d6ad410092f94d923b4f6221f5bc9dc362",
        "lineNumber": 556,
        "columnNumber": 114_251
      },
      "monitorSetAttribute": {
        "name": "",
        "arity": 4,
        "kind": "arrow",
        "start": 1_894_150,
        "end": 1_894_259,
        "bytes": 109,
        "sha256": "b4a4b0d4433ed1f6f28cc07b6878e78b3a8496d25716911ca381307fa30fb021",
        "lineNumber": 556,
        "columnNumber": 114_504
      }
    }
  }
] as const);
export type GeneratedSchematicDisplayAccessorSource = typeof GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_SOURCE[number];
export type GeneratedSchematicDisplayAccessorRole = keyof GeneratedSchematicDisplayAccessorSource["methods"];
export const GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CALLEES = ["textConstructor", "baseTextConstructor", ...GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_FIELDS.flatMap(field => [`${field}.get`, `${field}.set`] as const), "monitorConstructor", "monitorSetAttribute", "monitorRecord", "monitorWatch"] as const;
