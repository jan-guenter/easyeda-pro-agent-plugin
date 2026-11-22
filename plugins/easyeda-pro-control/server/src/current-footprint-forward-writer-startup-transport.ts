/** Exact original renderer reads through Start Page UI source qualification. */
export const CURRENT_COMPLETE_FORWARD_STARTUP_METHODS = [
  "Browser.getVersion", "Target.getTargets", "Target.attachToTarget", "Page.enable",
  "Page.getFrameTree", "Runtime.enable", "Debugger.enable", "Debugger.getScriptSource",
] as const;

export const CURRENT_COMPLETE_FORWARD_STARTUP_SCHEDULE = "frame-tree-before-page-events";

export const CURRENT_COMPLETE_FORWARD_STARTUP_SEQUENCE = Object.freeze([
  "Browser.getVersion", "Target.getTargets",
  "Target.getTargets", "Target.attachToTarget", "Page.getFrameTree", "Page.enable", "Target.getTargets", "Page.getFrameTree",
  "Target.getTargets", "Page.getFrameTree", "Runtime.enable", "Debugger.enable", "Debugger.getScriptSource", "Target.getTargets", "Page.getFrameTree",
] satisfies (typeof CURRENT_COMPLETE_FORWARD_STARTUP_METHODS[number])[]);

export const CURRENT_COMPLETE_FORWARD_STARTUP_READ = Object.freeze({
  milliseconds: 15_000, emptyPollMilliseconds: 60, maximumPolls: 250,
});
