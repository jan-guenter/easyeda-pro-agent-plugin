/** Fixed generation209 project-worker startup coordinates. No caller-selected
 * profile, source substitution, runtime admission or execution authority.
 * Source offsets move by24 after the changed line108; later CDP columns
 * remain unchanged because the line109/110 newline offsets also move. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_WORKER_STARTUP_SOURCE = freezeDeep({
  application: "3.2.209.8a704eab",
  relativePath: "pro-mgr/3.2.185.bf63a159/js/project-worker.js",
  bytes: 2_181_308,
  sha256: "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046"
} as const);

export const CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES = freezeDeep({
  channel: {
    name: "JP",
    start: 11_689,
    end: 11_813,
    offset: 11_812,
    lineNumber: 0,
    columnNumber: 11_812,
    bytes: 124,
    sha256: "1f1e941adc6960fcb594284ad2c3cc71c339d0649cfadb5f8dc401f383511ab1"
  },
  base: {
    name: "Gd",
    start: 2_011_492,
    end: 2_012_659,
    offset: 2_012_658,
    lineNumber: 109,
    columnNumber: 165_345,
    bytes: 1167,
    sha256: "a312e0fe696ec2ddab8f60124aeb72684da65046731ca0f5f23bb60f9e283842"
  },
  project: {
    name: "Lg",
    start: 2_103_288,
    end: 2_107_660,
    offset: 2_107_659,
    lineNumber: 110,
    columnNumber: 93_449,
    bytes: 4372,
    sha256: "1aac1292d0d86688476aaf3299417cad64c01a2e0d1d9226e029f1aa4bb0a014"
  },
  serial: {
    name: "Nd",
    start: 1_847_057,
    end: 1_847_248,
    offset: 1_847_078,
    lineNumber: 108,
    columnNumber: 145_582,
    bytes: 191,
    sha256: "99fca9f1568807ff06f32f3fba55b490def72b5b07d9325974dc153db217909e"
  },
  cooperation: {
    name: "ZA",
    start: 1_856_052,
    end: 1_856_219,
    offset: 1_856_075,
    lineNumber: 109,
    columnNumber: 8762,
    bytes: 167,
    sha256: "1de1846330650da2945eb6b280c1309feae47df438902a4c67370f3976f9b3d3"
  },
  debounce: {
    name: "QA",
    start: 2_011_158,
    end: 2_011_378,
    offset: 2_011_184,
    lineNumber: 109,
    columnNumber: 163_871,
    bytes: 220,
    sha256: "e44cd89d5dd9cc4c851c01a55247782eacd16b97d057add3b1cd472ad31a97db"
  },
  upload: {
    name: "bufferedStream",
    start: 2_029_672,
    end: 2_030_081,
    offset: 2_029_698,
    lineNumber: 110,
    columnNumber: 15_488,
    bytes: 409,
    sha256: "ab5308d9747401e42204794c3a3d8eb7dfa99af4a34bcb90481c7761752f83a7"
  },
  bootstrap: {
    name: "",
    offset: 2_177_142,
    lineNumber: 110,
    columnNumber: 162_932
  }
} as const);

export const CURRENT_PCB_209_WORKER_CALLBACK_LOCATIONS = freezeDeep({
  uploadStructure: {
    lineNumber: 110,
    columnNumber: 89_838,
    utf16Offset: 2_104_048,
    parameterCount: 3,
    name: "",
    async: false,
    prototype: false,
    sourceBytes: 193,
    sourceSha256: "f78a4c3123cfbf7d2be2c7404abcb1519fecbea1fd9f6fed49107cbac4f77f70"
  },
  structure: {
    lineNumber: 110,
    columnNumber: 90_054,
    utf16Offset: 2_104_264,
    parameterCount: 0,
    name: "",
    async: true,
    prototype: false,
    sourceBytes: 817,
    sourceSha256: "4e8dbb31948cc256f30a05c8f23764299c451f63981f176475d722442705f9c7"
  },
  cooperation: {
    lineNumber: 110,
    columnNumber: 89_543,
    utf16Offset: 2_103_753,
    parameterCount: 1,
    name: "",
    async: false,
    prototype: false,
    sourceBytes: 172,
    sourceSha256: "6ffe03fb8601b1e840dd90d84ff8499562ab81a0785215842a3f2b7d5afffa55"
  },
  upload: {
    lineNumber: 109,
    columnNumber: 165_146,
    utf16Offset: 2_012_459,
    parameterCount: 0,
    name: "",
    async: true,
    prototype: false,
    sourceBytes: 60,
    sourceSha256: "a724d28e81619f3d15dd170537a0defcad27d3c88b463045de3234eced63eaef"
  },
  buffer: {
    lineNumber: 110,
    columnNumber: 15_658,
    utf16Offset: 2_029_858,
    parameterCount: 1,
    name: "o",
    async: false,
    prototype: true,
    sourceBytes: 102,
    sourceSha256: "56f95d481a87fce2f09ed4186704a00b4c0e5589c3dd632b97a84435547f2133"
  },
  drain: {
    lineNumber: 110,
    columnNumber: 15_766,
    utf16Offset: 2_029_960,
    parameterCount: 0,
    name: "c",
    async: true,
    prototype: false,
    sourceBytes: 120,
    sourceSha256: "c823aa9affa52525a590c69b1282f9a5a8e022ea474a32c5d971c4473a594735"
  }
} as const);

export const CURRENT_PCB_209_WORKER_PRODUCER_LOCATIONS = freezeDeep({
  serial: {
    lineNumber: 108,
    columnNumber: 145_602,
    utf16Offset: 1_847_098,
    parameterCount: 0,
    scopeDescriptions: [
      "Closure (Nd)"
    ],
    regular: false,
    sourceBytes: 149,
    sourceSha256: "212bd4de32ee78a2924190e6d36bdf3f0592a92663faaf50151a341837488c7d"
  },
  debounce: {
    lineNumber: 109,
    columnNumber: 163_895,
    utf16Offset: 2_011_208,
    parameterCount: 0,
    scopeDescriptions: [
      "Block (QA)",
      "Closure (QA)"
    ],
    regular: true,
    sourceBytes: 177,
    sourceSha256: "7f497fd065f32fc737f50b0d1fc7c851538b37e04ec81c665b67c3fd0179f90d"
  },
  cooperation: {
    lineNumber: 109,
    columnNumber: 8793,
    utf16Offset: 1_856_106,
    parameterCount: 1,
    scopeDescriptions: [
      "Closure (ZA)"
    ],
    regular: false,
    sourceBytes: 112,
    sourceSha256: "8f0467161af080b133406e4cf0822ff6183c5bcb574fedbc924092f4f9f5476d"
  },
  upload: {
    lineNumber: 110,
    columnNumber: 15_521,
    utf16Offset: 2_029_731,
    parameterCount: 1,
    scopeDescriptions: [
      "Closure (bufferedStream)"
    ],
    regular: false,
    sourceBytes: 126,
    sourceSha256: "7b350c3d20de0324f1c34fd12954845adc8a919726dad878f165436155d2ae90"
  }
} as const);

export const CURRENT_PCB_209_WORKER_GATE_PROFILES = freezeDeep({
  readOnly: {
    name: "isReadOnly",
    parameterCount: 0,
    lineNumber: 109,
    columnNumber: 165_936,
    utf16Offset: 2_013_239,
    sourceBytes: 77,
    sourceSha256: "1ac8269d07d8f1283d909cb61e6cb2a5e8b078079e5350625d6ef1101f2c2540"
  },
  format: {
    name: "get isV2Format",
    parameterCount: 0,
    lineNumber: 109,
    columnNumber: 165_360,
    utf16Offset: 2_012_659,
    sourceBytes: 41,
    sourceSha256: "47f72926bacfd355a5f38e6e57177b982fb3efabf55e6e4a11d04bcd93499ed1"
  },
  canPublish: {
    name: "canWsPublish",
    parameterCount: 0,
    lineNumber: 110,
    columnNumber: 94_346,
    utf16Offset: 2_108_544,
    sourceBytes: 78,
    sourceSha256: "787898cdd71f5e2031ed21899efa65f187185fbb80edb8118b8ecd1931b1aab3"
  },
  publish: {
    name: "publish",
    parameterCount: 2,
    lineNumber: 0,
    columnNumber: 9849,
    utf16Offset: 9842,
    sourceBytes: 84,
    sourceSha256: "5f187de3262123ee1cdd5e9fd4cc789057e61148ce3ae18f5d44c475e17cd74b"
  },
  broadcast: {
    name: "broadcastPublish",
    parameterCount: 2,
    lineNumber: 0,
    columnNumber: 12_246,
    utf16Offset: 12_230,
    sourceBytes: 83,
    sourceSha256: "30cd880109ad82ba614691e6fc0de9b7a9469053af28ebafe94fa38af1d006a4"
  },
  post: {
    name: "post",
    parameterCount: 1,
    lineNumber: 0,
    columnNumber: 12_642,
    utf16Offset: 12_638,
    sourceBytes: 79,
    sourceSha256: "9dc43a09fc1339c50618ee681fa45a2967e94215e2a85361e1a9cb41a8d4f3c2"
  },
  message: {
    name: "onMessage",
    parameterCount: 1,
    lineNumber: 0,
    columnNumber: 11_822,
    utf16Offset: 11_813,
    sourceBytes: 417,
    sourceSha256: "924c657491184748fa1ac302ebaaaeeac47ef56b9df88c5d8404bcd0a6f92308"
  },
  received: {
    name: "onReceivedPublish",
    parameterCount: 3,
    lineNumber: 0,
    columnNumber: 10_435,
    utf16Offset: 10_418,
    sourceBytes: 269,
    sourceSha256: "7141a9d5fdbb7547e751300617fa425c8a35bfd2860bac659d97bb9cb836b0aa"
  }
} as const);

export const CURRENT_PCB_209_WORKER_STARTUP_SPANS = freezeDeep({
  constructionChannel: {
    start: 11_689,
    end: 11_813,
    bytes: 124,
    sha256: "1f1e941adc6960fcb594284ad2c3cc71c339d0649cfadb5f8dc401f383511ab1"
  },
  constructionBase: {
    start: 2_011_492,
    end: 2_012_659,
    bytes: 1167,
    sha256: "a312e0fe696ec2ddab8f60124aeb72684da65046731ca0f5f23bb60f9e283842"
  },
  constructionProject: {
    start: 2_103_288,
    end: 2_107_660,
    bytes: 4372,
    sha256: "1aac1292d0d86688476aaf3299417cad64c01a2e0d1d9226e029f1aa4bb0a014"
  },
  constructionSerial: {
    start: 1_847_057,
    end: 1_847_248,
    bytes: 191,
    sha256: "99fca9f1568807ff06f32f3fba55b490def72b5b07d9325974dc153db217909e"
  },
  constructionCooperation: {
    start: 1_856_052,
    end: 1_856_219,
    bytes: 167,
    sha256: "1de1846330650da2945eb6b280c1309feae47df438902a4c67370f3976f9b3d3"
  },
  constructionDebounce: {
    start: 2_011_158,
    end: 2_011_378,
    bytes: 220,
    sha256: "e44cd89d5dd9cc4c851c01a55247782eacd16b97d057add3b1cd472ad31a97db"
  },
  constructionUpload: {
    start: 2_029_672,
    end: 2_030_081,
    bytes: 409,
    sha256: "ab5308d9747401e42204794c3a3d8eb7dfa99af4a34bcb90481c7761752f83a7"
  },
  callbackUploadStructure: {
    start: 2_104_048,
    end: 2_104_241,
    bytes: 193,
    sha256: "f78a4c3123cfbf7d2be2c7404abcb1519fecbea1fd9f6fed49107cbac4f77f70"
  },
  callbackStructure: {
    start: 2_104_264,
    end: 2_105_081,
    bytes: 817,
    sha256: "4e8dbb31948cc256f30a05c8f23764299c451f63981f176475d722442705f9c7"
  },
  callbackCooperation: {
    start: 2_103_753,
    end: 2_103_925,
    bytes: 172,
    sha256: "6ffe03fb8601b1e840dd90d84ff8499562ab81a0785215842a3f2b7d5afffa55"
  },
  callbackUpload: {
    start: 2_012_459,
    end: 2_012_519,
    bytes: 60,
    sha256: "a724d28e81619f3d15dd170537a0defcad27d3c88b463045de3234eced63eaef"
  },
  callbackBuffer: {
    start: 2_029_858,
    end: 2_029_960,
    bytes: 102,
    sha256: "56f95d481a87fce2f09ed4186704a00b4c0e5589c3dd632b97a84435547f2133"
  },
  callbackDrain: {
    start: 2_029_960,
    end: 2_030_080,
    bytes: 120,
    sha256: "c823aa9affa52525a590c69b1282f9a5a8e022ea474a32c5d971c4473a594735"
  },
  wrapperSerial: {
    start: 1_847_098,
    end: 1_847_247,
    bytes: 149,
    sha256: "212bd4de32ee78a2924190e6d36bdf3f0592a92663faaf50151a341837488c7d"
  },
  wrapperDebounce: {
    start: 2_011_200,
    end: 2_011_377,
    bytes: 177,
    sha256: "7f497fd065f32fc737f50b0d1fc7c851538b37e04ec81c665b67c3fd0179f90d"
  },
  wrapperCooperation: {
    start: 1_856_106,
    end: 1_856_218,
    bytes: 112,
    sha256: "8f0467161af080b133406e4cf0822ff6183c5bcb574fedbc924092f4f9f5476d"
  },
  wrapperUpload: {
    start: 2_029_731,
    end: 2_029_857,
    bytes: 126,
    sha256: "7b350c3d20de0324f1c34fd12954845adc8a919726dad878f165436155d2ae90"
  },
  gateReadOnly: {
    start: 2_013_239,
    end: 2_013_316,
    bytes: 77,
    sha256: "1ac8269d07d8f1283d909cb61e6cb2a5e8b078079e5350625d6ef1101f2c2540"
  },
  gateFormat: {
    start: 2_012_659,
    end: 2_012_700,
    bytes: 41,
    sha256: "47f72926bacfd355a5f38e6e57177b982fb3efabf55e6e4a11d04bcd93499ed1"
  },
  gateCanPublish: {
    start: 2_108_544,
    end: 2_108_622,
    bytes: 78,
    sha256: "787898cdd71f5e2031ed21899efa65f187185fbb80edb8118b8ecd1931b1aab3"
  },
  gatePublish: {
    start: 9842,
    end: 9926,
    bytes: 84,
    sha256: "5f187de3262123ee1cdd5e9fd4cc789057e61148ce3ae18f5d44c475e17cd74b"
  },
  gateBroadcast: {
    start: 12_230,
    end: 12_313,
    bytes: 83,
    sha256: "30cd880109ad82ba614691e6fc0de9b7a9469053af28ebafe94fa38af1d006a4"
  },
  gatePost: {
    start: 12_638,
    end: 12_717,
    bytes: 79,
    sha256: "9dc43a09fc1339c50618ee681fa45a2967e94215e2a85361e1a9cb41a8d4f3c2"
  },
  gateMessage: {
    start: 11_813,
    end: 12_230,
    bytes: 417,
    sha256: "924c657491184748fa1ac302ebaaaeeac47ef56b9df88c5d8404bcd0a6f92308"
  },
  gateReceived: {
    start: 10_418,
    end: 10_687,
    bytes: 269,
    sha256: "7141a9d5fdbb7547e751300617fa425c8a35bfd2860bac659d97bb9cb836b0aa"
  },
  bootstrap: {
    start: 2_177_126,
    end: 2_177_149,
    bytes: 23,
    sha256: "6455b224e99a8d9b329d3a791dddbef8ec6591135835b20eb1a4a06d481eca40"
  }
} as const);

