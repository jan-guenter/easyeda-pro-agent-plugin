import { installClosedSymbolTestProfiles } from "./helpers/install-closed-symbol-test-profiles.ts";

// oxlint-disable-next-line node/no-top-level-await -- Fixed synthetic source I/O must precede actual stage imports.
await installClosedSymbolTestProfiles();
// oxlint-disable-next-line node/no-top-level-await -- The shared case imports actual stages and the one fixed admission module only after the profile hook.
const { registerAdmissionCase } = await import("./helpers/closed-symbol-terminal-admission-actual-cases.ts");
registerAdmissionCase(1);
