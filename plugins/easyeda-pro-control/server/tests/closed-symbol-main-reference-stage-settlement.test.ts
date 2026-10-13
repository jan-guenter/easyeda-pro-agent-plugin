/** Ordinary isolation and the sole maintained registry; no implementation loader. */
/* oxlint-disable node/no-top-level-await -- Install the maintained test-only source-profile I/O seam before stage imports. */
import { installClosedSymbolTestProfiles } from "./helpers/install-closed-symbol-test-profiles.ts";

await installClosedSymbolTestProfiles();
await import("./helpers/closed-symbol-main-reference-stage-settlement-cases.ts");
