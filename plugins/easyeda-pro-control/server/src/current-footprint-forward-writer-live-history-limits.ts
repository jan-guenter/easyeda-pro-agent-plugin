/** Natural post-copy syncCloud(undefined) performs one yB read. Startup
 * syncCloud(true) keeps its independent four-read retry profile unchanged. */
export const CURRENT_FOOTPRINT_FORWARD_WRITER_LIVE_HISTORY_REQUESTS = Object.freeze({ normal: 11, cleanup: 2, total: 13, repetitions: 1 });
