/** Exact possible-breakpoint positions in the pinned209 worker. Packet sites
 * follow packet creation, await return and successful callback cleanup. Nd
 * sites are its distinct initial and queued finalizers. No program executes. */
export const CURRENT_PROJECT_STRUCTURE_WORKER_SITES = Object.freeze({
  packet: Object.freeze({ lineNumber: 110, columnNumber: 90_576, offset: 2_104_786 }),
  response: Object.freeze({ lineNumber: 110, columnNumber: 90_621, offset: 2_104_831 }),
  callbackReturn: Object.freeze({ lineNumber: 110, columnNumber: 90_770, offset: 2_104_980 }),
  initialFinally: Object.freeze({ lineNumber: 108, columnNumber: 145_736, offset: 1_847_232 }),
  queuedFinally: Object.freeze({ lineNumber: 108, columnNumber: 145_680, offset: 1_847_176 }),
});
export const CURRENT_PROJECT_STRUCTURE_WORKER_REQUESTS = Object.freeze({ normal: 160, cleanup: 6, scopes: 4 });
