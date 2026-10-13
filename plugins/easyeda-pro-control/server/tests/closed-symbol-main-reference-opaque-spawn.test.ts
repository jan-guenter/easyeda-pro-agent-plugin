/** Ordinary isolated worker; production modules load only after fixed synthetic profiles. */
/* oxlint-disable node/no-top-level-await -- Install the existing test-only source-profile I/O seam before dynamic stage imports. */
import { installClosedSymbolTestProfiles } from "./helpers/install-closed-symbol-test-profiles.ts";

await installClosedSymbolTestProfiles();
await import("./helpers/closed-symbol-main-reference-opaque-spawn-cases.ts");
