/** Worker-local synthetic I/O only; the real stage and issuer graph stays intact. */
import { installClosedSymbolTestProfiles } from "./helpers/install-closed-symbol-test-profiles.ts";
// oxlint-disable-next-line node/no-top-level-await -- Register fixed test-only profile I/O before importing the actual stage graph.
await installClosedSymbolTestProfiles();
// oxlint-disable-next-line node/no-top-level-await -- Preserve the original cases after the worker-local prerequisite is installed.
await import("./helpers/closed-symbol-terminal-publication-cases.ts");
