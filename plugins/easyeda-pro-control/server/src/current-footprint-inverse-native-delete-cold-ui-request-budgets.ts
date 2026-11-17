/** Pure from-birth cold-UI request counts moved byte-exact from the original
 * six collector/controller declarations at 9db9d91e2116b5c6cbc9475d7dd79b680ea8af88.
 * The genuine implementations import/reexport these same objects; no callbacks,
 * owner identity or execution authorization is present in this module. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PRIMITIVE_REQUESTS=Object.freeze({
 bootstrap:Object.freeze({normal:19,helpers:4}),
 graph:Object.freeze({normal:261,helpers:21}),
 reflect:Object.freeze({normal:7,helpers:2}),
 closure:Object.freeze({normal:4,helpers:1}),
 timerReference:1,normal:292,helpers:28,cdpRequests:320,
});

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_SENDER_REQUESTS=Object.freeze({normal:52,helpers:10,cdpRequests:62,invocations:0});

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RECEIVER_REQUESTS=Object.freeze({
 forwarding:Object.freeze({normal:29,helpers:6}),manager:Object.freeze({normal:46,helpers:10}),channel:Object.freeze({normal:90,helpers:13}),
 channelProof:Object.freeze({normal:3,helpers:1}),guard:Object.freeze({normal:7,helpers:1}),channelNameRead:1,normal:176,helpers:31,cdpRequests:207,
});

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_REQUESTS=Object.freeze({normal:112,helpers:19,cdpRequests:131,invocations:0});

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_TOMBSTONE_REQUESTS=Object.freeze({normal:11,helpers:5,cdpRequests:16,invocations:0});

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_CONTROLLER_REQUESTS=Object.freeze({
 ownNormal:55,ownHelpers:11,returns:82,normal:148,cleanup:10,cdpRequests:158,paused:10,resumed:10,invocations:1,
});
