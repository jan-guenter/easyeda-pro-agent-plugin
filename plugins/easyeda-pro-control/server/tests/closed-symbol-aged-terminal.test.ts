/** Synthetic I/O only; all actual stages, replay and issuers remain in the fixed graph. */
import { installClosedSymbolTestProfiles } from "./helpers/install-closed-symbol-test-profiles.ts";
// oxlint-disable-next-line node/no-top-level-await -- Register fixed worker-local test I/O before loading the graph.
await installClosedSymbolTestProfiles();
// oxlint-disable-next-line node/no-top-level-await -- Actual cases must load after the test-only profile registration.
await import("./helpers/closed-symbol-aged-terminal-cases.ts");
