import { installClosedSymbolTestProfiles } from "./helpers/install-closed-symbol-test-profiles.ts";

// oxlint-disable-next-line node/no-top-level-await -- Fixed synthetic source I/O must precede actual stage imports.
await installClosedSymbolTestProfiles();
// oxlint-disable-next-line node/no-top-level-await -- A separate test worker starts with a fresh module-owned cache, with no reset seam.
const { registerAdmissionCase } = await import("./helpers/closed-symbol-terminal-admission-actual-cases.ts");
registerAdmissionCase(2);
