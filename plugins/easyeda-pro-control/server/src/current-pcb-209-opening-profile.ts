/** Separate 209 disposable-opening profile. These exact assets qualify only
 * the fixed project/PCB navigation, identity and layer observations. They do
 * not qualify legacy compiler, project-worker, ratline or design readers. */
import type { CurrentPcbDiagnosticScriptProfile } from "./current-pcb-diagnostic-profile.ts";
import { ORDINARY_LAUNCH_209_PROFILE } from "./ordinary-launch-209-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_OPENING_PROFILE = freezeDeep({
  schema: "easyeda-pro-control.pcb209-disposable-opening.v1",
  application: "3.2.209.8a704eab",
  operationPrefix: "pcb209-",
  installedFiles: [...ORDINARY_LAUNCH_209_PROFILE.installedFiles,
    { relativePath: "pro-versions/3.2.209.8a704eab/editor.ini", bytes: 8031,
      sha256: "ced74cf98aedf6b04d0f23871b945f4155978d7e35edbc1704b8cdaf566623f9" },
    { relativePath: "pro-ui/3.2.198.2800f583/js/ui.js", bytes: 17_468_192,
      sha256: "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6" },
    { relativePath: "pro-pcb/3.2.195.6b67774e/js/pcb.js", bytes: 10_991_441,
      sha256: "a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b" },
    { relativePath: "pro-mgr/3.2.185.bf63a159/js/pro-mgr.js", bytes: 2_196_424,
      sha256: "b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d" },
    { relativePath: "pro-mgr/3.2.185.bf63a159/js/project-worker.js", bytes: 2_181_308,
      sha256: "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046" },
  ],
  validationOnly: true, connectedValidation: false, startupCompletionVerified: false,
  completeLiveBaselineVerified: false, executionAuthorized: false, saveAuthorized: false,
} as const);

export const CURRENT_PCB_209_OPENING_SCRIPTS: Readonly<Record<"ui" | "pcb", CurrentPcbDiagnosticScriptProfile>> = freezeDeep({
  ui: { family: "ui", relativePath: "pro-ui/3.2.198.2800f583/js/ui.js",
    scriptSha256: "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6", scriptBytes: 17_468_192 },
  pcb: { family: "pcb", relativePath: "pro-pcb/3.2.195.6b67774e/js/pcb.js",
    scriptSha256: "a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b", scriptBytes: 10_991_441 },
});
