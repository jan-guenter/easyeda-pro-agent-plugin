/** New-profile-only immutable metadata fork from source commit
 * 9db9d91e2116b5c6cbc9475d7dd79b680ea8af88. Readable data only: no owner,
 * callback, issuer or runtime grant. Historical profiles remain independent. */
import {freezeDeep} from "./sqlite-inventory-core.ts";

/** Canonical metadata SHA-256 90c07a5a31ecad23e63d31de97310ebdf671031b6478e1759337c4e76235210e. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_V4_BASE_PROFILE=freezeDeep({
  "purpose": "footprint-inverse-native-lifecycle209",
  "nativeSwitch": "-FootprintInverseNativeContinuationV3",
  "main": {
    "constructionNormal": 64,
    "fenceNormal": 838,
    "registrationNormal": 32,
    "initialHistory": {
      "arms": 1,
      "frames": 1,
      "joins": 3,
      "properties": 5,
      "originalSteps": 1,
      "normal": 11,
      "cleanup": 2,
      "total": 13,
      "events": 2,
      "repetitions": 4
    },
    "normal": 1197,
    "cleanup": 41,
    "total": 1238,
    "reproofs": 109_739,
    "polls": 24_000,
    "nativeDeleteMainPrefix": {
      "request": {
        "requestObservation": 22,
        "originalConstructionReproof": 1,
        "normal": 23,
        "ownPointRemovals": 3,
        "groupRelease": 1,
        "cleanup": 4,
        "total": 27,
        "nativeSqlResumeAvailable": false,
        "saveAuthorized": false
      },
      "begin": {
        "sourceArms": 4,
        "frames": 5,
        "joins": 5,
        "originalSteps": 5,
        "normal": 19,
        "cleanup": 4,
        "total": 23
      },
      "history": {
        "sourceArms": 9,
        "originalCallbackMetadata": 2,
        "originalCallbackArm": 1,
        "frames": 25,
        "joins": 31,
        "originalSteps": 20,
        "normal": 88,
        "cleanup": 11,
        "total": 99
      },
      "requestSteps": 3,
      "selectedReadonly": 9,
      "preUpload": 16,
      "ownNormal": 133,
      "cleanup": 19,
      "normal": 142,
      "total": 161,
      "postSyncReserved": false,
      "cloudReserved": false,
      "wholeInverseReserved": false
    },
    "nativeDeleteNaturalReadTail": {
      "returned": {
        "branch": {
          "normal": 8,
          "cleanup": 2
        },
        "history": {
          "normal": 11,
          "cleanup": 2
        },
        "body": {
          "normal": 8,
          "cleanup": 2
        }
      },
      "drivers": {
        "calls": 3,
        "capture": 15,
        "resume": 3
      },
      "selectedReadonly": {
        "maximumCalls": 9,
        "commandsPerCall": 3
      },
      "normal": 72,
      "cleanup": 6,
      "total": 78,
      "preUpload": 1,
      "nativeWireNormal": 30,
      "nativeWireCleanup": 6,
      "wholeInverseReserved": false,
      "nativeReadWireMounted": false,
      "runtimeSegmentCompletenessVerified": false
    }
  },
  "renderer": {
    "nativeDeleteClock": {
      "normal": 70,
      "helpers": 20,
      "conditionSources": 6,
      "cdpRequests": 90,
      "controls": 106,
      "resumes": 7,
      "events": 45,
      "producerResumed": false,
      "completeDeleteReserved": false,
      "saveAuthorized": false
    },
    "nativeDeleteClockRegistration": {
      "normal": 18,
      "helpers": 4,
      "cdpRequests": 22,
      "controls": 24,
      "resumes": 0,
      "completeClockLifecycleReserved": false,
      "executionAuthorized": false
    },
    "discovery": 16,
    "emptyGuard": 10,
    "generic": 39,
    "registration": 2,
    "parent": 4,
    "projectOpening": 10,
    "sourceHeldPrefix": 64,
    "construction": 615,
    "producerArm": {
      "intrinsics": 28,
      "intrinsicHelpers": 3,
      "gateAssociation": 5,
      "gateHelpers": 2,
      "guards": 10,
      "producerArms": 27,
      "normal": 70,
      "helperSources": 5,
      "cdpRequests": 75
    },
    "libraryRefresh": {
      "arms": 7,
      "moduleCapture": 2,
      "pristineCapture": 2,
      "capturedTuple": 2,
      "functionMetadata": 13,
      "frames": 6,
      "joins": 6,
      "effects": 2,
      "resumes": 3,
      "normal": 43,
      "helperSources": 12,
      "cdpRequests": 55,
      "cleanup": 8,
      "total": 63,
      "holds": 3,
      "bind": 1,
      "complete": 1,
      "controls": 68,
      "normalEvents": 6
    },
    "deleteBindings": {
      "callees": 28,
      "moduleCapture": 1,
      "capture": 1,
      "select": 28,
      "functionMetadata": 28,
      "reproofs": 2,
      "normal": 60,
      "helperSources": 32,
      "cdpRequests": 92,
      "cleanupAfterOriginalExit": 0,
      "controls": 94
    },
    "deleteEncoder": {
      "classes": 18,
      "setup": 25,
      "setupHelpers": 2,
      "dispatchReproof": 3,
      "dispatchHelper": 1,
      "cdpRequests": 31,
      "controls": 33,
      "cleanupAfterOriginalExit": 0
    },
    "publicApi": {
      "callees": 17,
      "setup": 31,
      "setupHelpers": 3,
      "dispatchReproof": 5,
      "dispatchHelper": 1,
      "cdpRequests": 40,
      "controls": 42,
      "cleanupAfterOriginalExit": 0
    },
    "clockWorker": {
      "callees": 34,
      "setup": 45,
      "setupHelpers": 4,
      "dispatchReproof": 3,
      "dispatchHelpers": 1,
      "cdpRequests": 53,
      "controls": 55,
      "cleanupAfterOriginalExit": 0
    },
    "deleteEntry": {
      "normal": 5,
      "helpers": 3,
      "cdpRequests": 8,
      "controls": 11,
      "events": 5,
      "cleanupAfterOriginalExit": 0
    },
    "publicService": {
      "setup": 43,
      "setupHelpers": 12,
      "dispatchReproof": 4,
      "dispatchHelpers": 2,
      "cdpRequests": 61,
      "controls": 63,
      "cleanupAfterOriginalExit": 0
    },
    "publicCall": {
      "normal": 12,
      "helpers": 5,
      "cdpRequests": 17,
      "controls": 20,
      "events": 8,
      "cleanupAfterOriginalExit": 0
    },
    "publicPreferences": {
      "normal": 19,
      "helpers": 5,
      "cdpRequests": 24,
      "controls": 26,
      "events": 7,
      "restorationAuthorized": false,
      "cleanupAfterOriginalExit": 0
    },
    "deleteRpc": {
      "setup": 14,
      "dispatch": 5,
      "normal": 19,
      "setupHelpers": 4,
      "dispatchHelpers": 1,
      "helpers": 5,
      "cdpRequests": 24,
      "controls": 26,
      "events": 5,
      "cleanupAfterOriginalExit": 0
    },
    "deleteJob": {
      "normal": 4,
      "helpers": 3,
      "cdpRequests": 7,
      "controls": 9,
      "events": 3,
      "cleanupAfterOriginalExit": 0
    },
    "workerPeer": {
      "normal": 3,
      "helpers": 2,
      "cdpRequests": 5,
      "controls": 7,
      "events": 2,
      "cleanupAfterOriginalExit": 0
    },
    "ownData": {
      "normal": 19,
      "helpers": 4,
      "cdpRequests": 23,
      "controls": 25,
      "events": 4,
      "cleanupAfterOriginalExit": 0
    },
    "nativeChannel": {
      "normal": 18,
      "helpers": 4,
      "cdpRequests": 22,
      "controls": 24,
      "events": 4,
      "cleanupAfterOriginalExit": 0
    },
    "nativeDelivery": {
      "normal": 16,
      "helpers": 4,
      "cdpRequests": 20,
      "controls": 22,
      "events": 4,
      "cleanupAfterOriginalExit": 0
    },
    "uiOwnData": {
      "normal": 19,
      "helpers": 4,
      "cdpRequests": 23,
      "controls": 25,
      "events": 4,
      "cleanupAfterOriginalExit": 0
    },
    "nativeDeleteExecution": {
      "sender": {
        "read": 61,
        "held": 23,
        "cdp": 84,
        "controls": 87
      },
      "registration": {
        "cdp": 172,
        "controls": 174
      },
      "cdpRequests": 256,
      "controls": 261,
      "nativeSenderHeldOnly": true,
      "workerDeleteBodyAuthorized": false,
      "mutationReturned": false,
      "saveAuthorized": false
    },
    "nativeDeleteTransfer": {
      "dependencies": {
        "calls": 6,
        "properties": 28,
        "frames": 1,
        "helpers": 7,
        "cdpRequests": 42,
        "controls": 44,
        "events": 7
      },
      "callback": {
        "calls": 5,
        "properties": 12,
        "frames": 3,
        "helpers": 8,
        "arm": 1,
        "remove": 1,
        "resumes": 1,
        "cdpRequests": 31,
        "controls": 37,
        "events": 10
      },
      "manager": {
        "calls": 6,
        "properties": 15,
        "frames": 5,
        "helpers": 11,
        "arm": 3,
        "remove": 3,
        "resumes": 3,
        "cdpRequests": 46,
        "controls": 58,
        "events": 17
      },
      "channel": {
        "cdpRequests": 130,
        "controls": 136,
        "helpers": 21,
        "properties": 85,
        "events": 23,
        "resumes": 1
      },
      "cdpRequests": 249,
      "workerPostAuthorized": false
    },
    "nativeDeletePost": {
      "forward": {
        "fixedRequests": 261,
        "fixedHelpers": 49,
        "originOwners": 8,
        "originMaximumRequests": 83,
        "cdpRequests": 344,
        "helpers": 69,
        "controls": 369,
        "events": 13,
        "resumes": 13
      },
      "accept": {
        "normal": 24,
        "helpers": 10,
        "cdpRequests": 34,
        "controls": 39,
        "events": 11,
        "resumes": 0,
        "workerClockAuthorized": false
      },
      "workerClockAuthorized": false,
      "publicationAuthorized": false
    },
    "nativeDeleteCollateral": {
      "maximumContainers": 8,
      "maximumTabs": 32,
      "before": {
        "calls": 12,
        "helpers": 12,
        "properties": 72,
        "cdp": 96
      },
      "after": {
        "calls": 2,
        "helpers": 2,
        "properties": 1,
        "cdp": 5
      },
      "cdpRequests": 101,
      "controls": 105,
      "events": 14,
      "cleanupAfterOriginalExit": 0,
      "tabCloseAuthorized": false,
      "preferenceRemovalAuthorized": false,
      "restorationAuthorized": false,
      "deleteAuthorized": false,
      "saveAuthorized": false
    },
    "nativeDeleteBootstrap": {
      "normal": 19,
      "helpers": 4,
      "cdpRequests": 23,
      "controls": 25,
      "events": 4,
      "cleanupAfterOriginalExit": 0
    },
    "nativeDeleteSender": {
      "sources": 2,
      "calls": 10,
      "properties": 39,
      "helpers": 10,
      "cdpRequests": 61,
      "controls": 63
    },
    "nativeDeleteRegistration": {
      "calls": 26,
      "properties": 120,
      "helpers": 26,
      "cdpRequests": 172,
      "controls": 174
    },
    "lookupPreentry": {
      "calls": 24,
      "properties": 96,
      "source": 1,
      "frame": 2,
      "arm": 1,
      "resume": 1,
      "helpers": 26,
      "cdpRequests": 151,
      "controls": 157,
      "events": 28,
      "cleanupAfterOriginalExit": 0
    },
    "getIntrinsics": {
      "calls": 21,
      "properties": 128,
      "helpers": 21,
      "cdpRequests": 170,
      "controls": 172
    },
    "getWorker": {
      "normal": 22,
      "helpers": 6,
      "cdpRequests": 28,
      "controls": 30,
      "events": 7,
      "cleanupAfterOriginalExit": 0
    },
    "getRpcEntry": {
      "calls": 7,
      "properties": 32,
      "frames": 2,
      "arm": 1,
      "resume": 1,
      "helpers": 9,
      "source": 1,
      "cdpRequests": 53,
      "controls": 59
    },
    "getForwarding": {
      "calls": 10,
      "properties": 61,
      "helpers": 10,
      "cdpRequests": 81,
      "controls": 83
    },
    "getSend": {
      "channel": 103,
      "origin": 90,
      "preflight": 62,
      "source": 45,
      "ihave": 76,
      "igive": 35,
      "local": 16,
      "native": 70,
      "reproof": 15,
      "cdpRequests": 512,
      "helpers": 128,
      "controls": 541,
      "events": 15,
      "resumes": 16
    },
    "getCallback": {
      "calls": 4,
      "properties": 13,
      "frames": 2,
      "arm": 1,
      "remove": 1,
      "resume": 1,
      "helpers": 6,
      "cdpRequests": 28,
      "controls": 34
    },
    "getManager": {
      "calls": 10,
      "properties": 36,
      "helpers": 10,
      "cdpRequests": 56,
      "controls": 58
    },
    "getNative": {
      "normal": 20,
      "helpers": 6,
      "cdpRequests": 26,
      "controls": 29,
      "events": 8,
      "cleanupAfterOriginalExit": 0
    },
    "getCompletion": {
      "normal": 551,
      "helpers": 176,
      "cdpRequests": 727,
      "controls": 760,
      "events": 227
    },
    "getResult": {
      "rowGraphs": 3,
      "rowNodes": 63,
      "nodeRequests": 10,
      "fixed": 512,
      "cdpRequests": 2402,
      "helpers": 896,
      "events": 7,
      "resumes": 6,
      "controls": 2416
    },
    "nativeGetTaskResult": {
      "rowGraphs": 2,
      "rowNodes": 63,
      "nodeRequests": 10,
      "fixed": 512,
      "cdpRequests": 1772,
      "helpers": 896,
      "events": 10,
      "resumes": 11,
      "controls": 1804
    },
    "nativeReferenceWorker": {
      "models": 4,
      "nodeSum": 252,
      "setupNormal": 916,
      "setupHelpers": 294,
      "entryNormal": 25,
      "entryHelpers": 11,
      "queryNormal": 109,
      "queryHelpers": 45,
      "normal": 1255,
      "helpers": 429,
      "cdpRequests": 1684,
      "controls": 1752,
      "events": 557
    },
    "nativeReferencePcbResult": {
      "rowGraphs": 2,
      "rowNodes": 1,
      "nodeRequests": 10,
      "fixed": 512,
      "cdpRequests": 532,
      "helpers": 266,
      "events": 10,
      "resumes": 11,
      "controls": 564
    },
    "nativeReferencePcbForward": {
      "cdpRequests": 351,
      "helpers": 100,
      "controls": 376,
      "events": 20,
      "resumes": 13
    },
    "nativeReferencePcbSender": {
      "preparation": 61,
      "entry": 23,
      "cdpRequests": 84,
      "controls": 87,
      "events": 14
    },
    "nativeReferenceNextSender": {
      "preparation": 61,
      "entry": 23,
      "cdpRequests": 84,
      "controls": 87,
      "events": 14
    },
    "nativeNextDependencies": {
      "calls": 31,
      "properties": 148,
      "frames": 1,
      "helpers": 32,
      "source": 1,
      "cdpRequests": 213,
      "controls": 216
    },
    "nativeNextCallback": {
      "calls": 5,
      "properties": 12,
      "frames": 3,
      "helpers": 8,
      "arm": 1,
      "remove": 1,
      "resumes": 1,
      "cdpRequests": 31,
      "controls": 37,
      "events": 10
    },
    "nativeSchematic": {
      "body": {
        "normal": 89,
        "helpers": 27,
        "events": 7,
        "resumes": 7
      },
      "result": {
        "normal": 193,
        "helpers": 57,
        "events": 4,
        "resumes": 5
      },
      "cdpRequests": 366,
      "helpers": 84,
      "events": 11,
      "resumes": 12,
      "controlCalls": 41,
      "controls": 407
    },
    "nativeWorkerReferences": {
      "repetitions": 2,
      "dependencies": {
        "calls": 31,
        "properties": 150,
        "frames": 1,
        "helpers": 32,
        "source": 1,
        "cdpRequests": 215,
        "controls": 218
      },
      "manager": {
        "calls": 11,
        "properties": 35,
        "frames": 5,
        "helpers": 16,
        "arm": 3,
        "remove": 3,
        "resumes": 3,
        "cdpRequests": 76,
        "controls": 89,
        "events": 22
      },
      "channel": {
        "cdpRequests": 130,
        "controls": 136,
        "helpers": 21,
        "properties": 85,
        "events": 23,
        "resumes": 1
      },
      "forward": {
        "cdpRequests": 351,
        "helpers": 100,
        "controls": 376,
        "events": 20,
        "resumes": 13
      },
      "result": {
        "rowGraphs": 2,
        "rowNodes": 1,
        "nodeRequests": 10,
        "fixed": 512,
        "cdpRequests": 532,
        "helpers": 266,
        "events": 10,
        "resumes": 11,
        "controls": 564
      },
      "cdp": 2670,
      "controls": 2840
    },
    "nativeReferencePcbManager": {
      "calls": 11,
      "properties": 33,
      "frames": 5,
      "helpers": 16,
      "arm": 3,
      "remove": 3,
      "resumes": 3,
      "cdpRequests": 74,
      "controls": 87,
      "events": 22
    },
    "nativeReferencePcbChannel": {
      "cdpRequests": 130,
      "controls": 136,
      "helpers": 21,
      "properties": 85,
      "events": 23,
      "resumes": 1
    },
    "nativeReferencePcbCallback": {
      "calls": 5,
      "properties": 12,
      "frames": 3,
      "helpers": 8,
      "arm": 1,
      "remove": 1,
      "resumes": 1,
      "cdpRequests": 31,
      "controls": 37,
      "events": 10
    },
    "nativeReferencePcbDependencies": {
      "calls": 6,
      "properties": 28,
      "frames": 1,
      "helpers": 7,
      "cdpRequests": 42,
      "controls": 44,
      "events": 7
    },
    "deletePrefix": {
      "calls": 46,
      "frames": 11,
      "propertiesMaximum": 149,
      "normal": 217,
      "helpers": 57,
      "arm": 3,
      "remove": 3,
      "resume": 5,
      "events": 5,
      "cdpRequests": 274,
      "controls": 291
    },
    "deleteCollateral": {
      "calls": 14,
      "frames": 1,
      "propertiesMaximum": 82,
      "normal": 97,
      "helpers": 15,
      "cdpRequests": 112,
      "controls": 114
    },
    "deleteManager": {
      "calls": 23,
      "properties": 112,
      "helpers": 23,
      "cdpRequests": 158
    },
    "deleteCallback": {
      "normal": 31,
      "calls": 11,
      "properties": 15,
      "frames": 2,
      "arm": 1,
      "remove": 1,
      "resume": 1,
      "helpers": 13,
      "cdpRequests": 44,
      "controls": 50
    },
    "deleteSend": {
      "normal": 54,
      "calls": 13,
      "properties": 33,
      "frames": 2,
      "arm": 2,
      "remove": 2,
      "resume": 2,
      "helpers": 15,
      "cdpRequests": 69,
      "controls": 78
    },
    "referenceProgress": {
      "callback": {
        "normal": 90,
        "helpers": 13,
        "events": 1,
        "resumes": 1
      },
      "schematic": {
        "normal": 100,
        "helpers": 27,
        "events": 7,
        "resumes": 7
      },
      "cdpRequests": 560,
      "controls": 640
    },
    "referenceResult": {
      "byKind": {
        "pcb-all": {
          "normalMaximum": 243,
          "helpersMaximum": 79,
          "cdpRequests": 322,
          "events": 6,
          "resumes": 5,
          "controls": 340
        },
        "schematic": {
          "normalMaximum": 122,
          "helpersMaximum": 49,
          "cdpRequests": 171,
          "events": 3,
          "resumes": 3,
          "controls": 184
        },
        "footprint-derived": {
          "normalMaximum": 243,
          "helpersMaximum": 79,
          "cdpRequests": 322,
          "events": 6,
          "resumes": 5,
          "controls": 340
        },
        "device-all": {
          "normalMaximum": 262,
          "helpersMaximum": 81,
          "cdpRequests": 343,
          "events": 6,
          "resumes": 5,
          "controls": 361
        }
      },
      "cdpRequests": 1158,
      "controls": 1225
    },
    "referenceSend": {
      "channel": 103,
      "origin": 90,
      "preflight": 62,
      "source": 45,
      "ihave": 76,
      "igive": 35,
      "local": 16,
      "native": 70,
      "reproof": 15,
      "service": 17,
      "cdpRequests": 529,
      "helpers": 131,
      "controls": 558,
      "events": 15,
      "resumes": 16
    },
    "referenceWorker": {
      "models": 4,
      "nodeSum": 252,
      "setupNormal": 916,
      "setupHelpers": 294,
      "entryNormal": 25,
      "entryHelpers": 11,
      "queryNormal": 109,
      "queryHelpers": 45,
      "normal": 1255,
      "helpers": 429,
      "cdpRequests": 1684,
      "controls": 1752,
      "events": 557
    },
    "referenceEntry": {
      "calls": 10,
      "properties": 64,
      "frames": 3,
      "arm": 1,
      "remove": 1,
      "resume": 1,
      "helpers": 13,
      "cdpRequests": 93,
      "controls": 99
    },
    "referenceUi": {
      "calls": 12,
      "properties": 17,
      "frames": 2,
      "arm": 1,
      "remove": 1,
      "resume": 1,
      "helpers": 14,
      "cdpRequests": 48,
      "controls": 54
    },
    "referenceDispatch": {
      "calls": 28,
      "properties": 128,
      "helpers": 28,
      "source": 1,
      "cdpRequests": 185,
      "controls": 188
    },
    "cold": {
      "chunks": 8,
      "arm": 25,
      "pauses": 37,
      "helperSources": 85,
      "normal": 222,
      "continuation": 0,
      "total": 222
    },
    "cache": {
      "cacheNormal": 24,
      "cacheCleanup": 1,
      "metadataNormal": 78,
      "metadataCleanup": 1,
      "guard": 10,
      "invalidationGuards": 30,
      "invalidation": 12,
      "total": 156
    },
    "sourceHeldBootstrap": 22,
    "total": 33_278,
    "polls": 24_000,
    "nativeDeleteSerialization": {
      "normal": 53,
      "helpers": 16,
      "cdpRequests": 69,
      "resumes": 6,
      "events": 34,
      "controls": 84,
      "uploadResumed": false,
      "publicationComplete": false,
      "saveAuthorized": false
    },
    "nativeDeletePublication": {
      "normal": 42,
      "helpers": 4,
      "cdpRequests": 46,
      "events": 4,
      "controls": 48,
      "uploadResumed": false,
      "publicationComplete": false,
      "saveAuthorized": false
    },
    "nativeDeleteLocalFlow": {
      "normal": 98,
      "helpers": 42,
      "cdpRequests": 140,
      "events": 74,
      "resumes": 13,
      "controls": 176,
      "local": 69,
      "callback": 40,
      "timer": 31
    },
    "nativeDeleteOriginalSegments": {
      "normal": 22,
      "helpers": 4,
      "cdpRequests": 26,
      "events": 4,
      "controls": 28,
      "resumes": 0
    },
    "nativeDeleteOriginalReturn": {
      "normal": 9,
      "helpers": 4,
      "cleanup": 1,
      "total": 14,
      "minimum": 13,
      "events": 7,
      "resumes": 1,
      "promisePasses": 2,
      "controls": 19,
      "originalCloudJoined": false,
      "wholeInverseReserved": false
    },
    "nativeDeleteOriginalUpload": {
      "capture": 1,
      "properties": 1,
      "metadata": 2,
      "proofs": 2,
      "resumes": 3,
      "cursor": 9,
      "observer": 6,
      "recipeNormal": 9,
      "recipeHelpers": 3,
      "normal": 24,
      "helpers": 12,
      "cdpRequests": 36,
      "events": 18,
      "controls": 45
    }
  },
  "controls": 195_402,
  "completeInverseReserved": false,
  "deleteInvocationAuthorized": false,
  "executionAuthorized": false,
  "saveAuthorized": false,
  "layout": "inverse-native-continuation.v3",
  "compiler": {
    "inputMaxBytes": 2_588_672,
    "reviewMaxBytes": 2_588_672,
    "compilerMaxBytes": 2_359_296
  },
  "naturalMainTailReserved": true,
  "workerTailArmed": false,
  "workerPostSyncVerified": false,
  "wholeInverseReserved": false,
  "commonFieldsCompacted": false
} as const);

/** Canonical metadata SHA-256 6c93a32b1b63d05dee4101a674884e7caa0b70b751da6e04622466ee4917f6b3. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_V4_BASE_ACTION_LIMITS=freezeDeep({
  "identity": 2,
  "launch": 1,
  "send": 39,
  "poll": 24_000,
  "window": 240,
  "termination": 240,
  "normal-close": 1,
  "release": 1,
  "release-unlaunched": 1,
  "no-process-proof": 1,
  "release-no-process": 1,
  "main-attach": 1,
  "main-reprove": 109_739,
  "main-send": 998,
  "main-poll": 24_000,
  "footprint-inverse-abort": 1,
  "footprint-inverse-preflight": 1,
  "footprint-inverse-register": 1,
  "footprint-inverse-cache-guard": 1,
  "footprint-inverse-cache-enroll": 1,
  "footprint-inverse-cache-delete-guard": 2,
  "footprint-inverse-cache-loading-guard": 1,
  "footprint-inverse-cache-invalidate": 12,
  "footprint-inverse-cache": 25,
  "footprint-inverse-cache-metadata": 79,
  "footprint-inverse-model-step": 21,
  "footprint-inverse-initial-sync": 120,
  "footprint-inverse-initial-cache": 298,
  "footprint-inverse-startup-queue": 1541,
  "footprint-inverse-condition-source": 1027,
  "footprint-inverse-startup-callback": 14_337,
  "footprint-inverse-cold-step": 27,
  "footprint-inverse-startup": 1,
  "footprint-inverse-cold": 261,
  "footprint-inverse-producer-arm": 75,
  "footprint-inverse-actors": 3,
  "footprint-inverse-parent": 1,
  "footprint-inverse-worker-bind": 1,
  "footprint-inverse-main-history": 52,
  "footprint-inverse-timer": 38,
  "footprint-inverse-library-refresh": 68,
  "footprint-inverse-delete-bindings": 94,
  "footprint-inverse-delete-encoder": 33,
  "footprint-inverse-public-api": 42,
  "footprint-inverse-clock-worker": 55,
  "footprint-inverse-delete-entry": 11,
  "footprint-inverse-public-service": 63,
  "footprint-inverse-public-call": 20,
  "footprint-inverse-public-preferences": 26,
  "footprint-inverse-delete-rpc": 26,
  "footprint-inverse-delete-job": 9,
  "footprint-inverse-delete-worker-peer": 7,
  "footprint-inverse-own-data": 25,
  "footprint-inverse-native-channel": 24,
  "footprint-inverse-ui-own-data": 25,
  "footprint-inverse-lookup-preentry": 157,
  "footprint-inverse-native-delivery": 22,
  "footprint-inverse-native-delete-clock": 106,
  "footprint-inverse-native-delete-clock-registration": 24,
  "footprint-inverse-native-delete-execution-forward": 369,
  "footprint-inverse-native-delete-accept-entry": 10,
  "footprint-inverse-native-delete-accept-job": 8,
  "footprint-inverse-native-delete-accept-delivery": 21,
  "footprint-inverse-native-delete-execution-dependencies": 44,
  "footprint-inverse-native-delete-execution-callback": 37,
  "footprint-inverse-native-delete-execution-manager": 58,
  "footprint-inverse-native-delete-execution-channel": 136,
  "footprint-inverse-native-delete-execution": 261,
  "footprint-inverse-native-delete-collateral": 105,
  "footprint-inverse-native-delete-bootstrap": 25,
  "footprint-inverse-native-delete-sender": 63,
  "footprint-inverse-native-delete-registration": 174,
  "footprint-inverse-get-intrinsics": 172,
  "footprint-inverse-get-worker": 30,
  "footprint-inverse-native-get-worker": 30,
  "footprint-inverse-native-get-lookup": 28,
  "footprint-inverse-native-get-task-sender": 87,
  "footprint-inverse-native-get-task-intrinsics": 172,
  "footprint-inverse-native-get-task-dependencies": 44,
  "footprint-inverse-native-get-task-forward": 378,
  "footprint-inverse-native-get-task-accept": 29,
  "footprint-inverse-native-get-task-channel": 137,
  "footprint-inverse-native-get-task-manager": 58,
  "footprint-inverse-native-get-task-callback": 37,
  "footprint-inverse-get-rpc-entry": 59,
  "footprint-inverse-get-forwarding": 83,
  "footprint-inverse-get-manager": 58,
  "footprint-inverse-get-callback": 34,
  "footprint-inverse-reference-callback": 41,
  "footprint-inverse-reference-dispatch": 188,
  "footprint-inverse-reference-ui": 54,
  "footprint-inverse-reference-progress": 640,
  "footprint-inverse-reference-result": 1225,
  "footprint-inverse-reference-send": 1674,
  "footprint-inverse-delete-prefix": 291,
  "footprint-inverse-delete-collateral": 114,
  "footprint-inverse-delete-send": 78,
  "footprint-inverse-delete-callback": 50,
  "footprint-inverse-delete-manager": 160,
  "footprint-inverse-reference-entry": 99,
  "footprint-inverse-reference-worker": 1752,
  "footprint-inverse-native-reference-worker": 1752,
  "footprint-inverse-native-get-task-result": 1804,
  "footprint-inverse-native-reference-pcb-result": 564,
  "footprint-inverse-native-reference-pcb-forward": 376,
  "footprint-inverse-native-reference-pcb-manager": 87,
  "footprint-inverse-native-reference-pcb-channel": 136,
  "footprint-inverse-native-reference-next-dependencies": 652,
  "footprint-inverse-native-reference-next-callback": 111,
  "footprint-inverse-native-reference-next-worker-manager": 178,
  "footprint-inverse-native-reference-next-worker-channel": 272,
  "footprint-inverse-native-reference-next-worker-forward": 752,
  "footprint-inverse-native-reference-next-worker-result": 1128,
  "footprint-inverse-native-reference-schematic": 407,
  "footprint-inverse-native-reference-next-sender": 261,
  "footprint-inverse-native-reference-pcb-sender": 87,
  "footprint-inverse-native-reference-pcb-callback": 37,
  "footprint-inverse-native-reference-pcb-dependencies": 44,
  "footprint-inverse-get-result": 2416,
  "footprint-inverse-get-send": 541,
  "footprint-inverse-get-native": 29,
  "footprint-inverse-get-completion": 760,
  "footprint-inverse-worker": 22,
  "footprint-inverse-construction": 684,
  "footprint-inverse-source-bind": 1,
  "footprint-inverse-project": 1,
  "footprint-inverse-native-delete-serialization": 84,
  "footprint-inverse-native-delete-publication": 48,
  "footprint-inverse-native-delete-flow": 176,
  "inverse-native-delete-main": 27,
  "inverse-native-delete-main-step": 3,
  "inverse-native-delete-main-begin": 23,
  "inverse-native-delete-main-history": 99,
  "footprint-inverse-native-delete-segments": 28,
  "footprint-inverse-native-delete-return": 19,
  "footprint-inverse-native-delete-upload": 45,
  "inverse-native-delete-main-read": 36
} as const);
