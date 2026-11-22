/** Exact original renderer reads through Start Page UI source qualification. */
export const CURRENT_COMPLETE_FORWARD_STARTUP_METHODS = [
  "Browser.getVersion", "Target.getTargets", "Target.attachToTarget", "Page.enable",
  "Page.getFrameTree", "Runtime.enable", "Debugger.enable", "Debugger.getScriptSource",
] as const;

const FRAME_TREE_FIRST_SCHEDULE = "frame-tree-before-page-events";
export const CURRENT_COMPLETE_FORWARD_STARTUP_SCHEDULE = "browser-version-before-frame-tree";
export const CURRENT_COMPLETE_FORWARD_STARTUP_SCHEDULES = [
  FRAME_TREE_FIRST_SCHEDULE,
  CURRENT_COMPLETE_FORWARD_STARTUP_SCHEDULE,
] as const;

type StartupMethod = typeof CURRENT_COMPLETE_FORWARD_STARTUP_METHODS[number];
type StartupSchedule = typeof CURRENT_COMPLETE_FORWARD_STARTUP_SCHEDULES[number];

const frameTreeFirstSequence = Object.freeze([
  "Browser.getVersion", "Target.getTargets",
  "Target.getTargets", "Target.attachToTarget", "Page.getFrameTree", "Page.enable", "Target.getTargets", "Page.getFrameTree",
  "Target.getTargets", "Page.getFrameTree", "Runtime.enable", "Debugger.enable", "Debugger.getScriptSource", "Target.getTargets", "Page.getFrameTree",
] satisfies StartupMethod[]);

export const CURRENT_COMPLETE_FORWARD_STARTUP_SEQUENCE = Object.freeze([
  ...frameTreeFirstSequence.slice(0, 4),
  "Browser.getVersion",
  ...frameTreeFirstSequence.slice(4),
] satisfies StartupMethod[]);

/** Resolve the request ID under the schedule that produced the failure record. */
export function currentCompleteForwardStartupEvidenceMethod(requestId: number, schedule?: StartupSchedule): StartupMethod | undefined {
  if (schedule === CURRENT_COMPLETE_FORWARD_STARTUP_SCHEDULE) {
    return CURRENT_COMPLETE_FORWARD_STARTUP_SEQUENCE[requestId - 1];
  }
  if (schedule === undefined) {
    if (requestId === 5) { return "Page.enable"; }
    if (requestId === 6) { return "Page.getFrameTree"; }
  }
  return frameTreeFirstSequence[requestId - 1];
}

export const CURRENT_COMPLETE_FORWARD_STARTUP_READ = Object.freeze({
  milliseconds: 15_000, emptyPollMilliseconds: 60, maximumPolls: 250,
});
