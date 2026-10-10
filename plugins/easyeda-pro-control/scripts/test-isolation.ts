import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Node evaluates --import before each test worker's static dependencies.
// Every worker gets a fresh directory, never an inherited control root.
// Keep this preload builtin-only: application imports can capture paths eagerly.
// Retain the exact generated directory, including on failure, for investigation.
// Individual tests may still create and clean up their own narrower fixtures.
// oxlint-disable-next-line node/no-top-level-await -- The test entrypoint must await isolation before Node loads any test module.
const directory = await mkdtemp(join(tmpdir(), `easyeda-test-control-${String(process.pid)}-`));
process.env["EASYEDA_CONTROL_DATA_DIR"] = directory;
// These overrides resolve independently in production modules. Inheriting them
// Would leave tests pointed at the user's credential or upstream state paths.
process.env["EASYEDA_BRIDGE_TOKEN_FILE"] = join(directory, "bridge-token");
process.env["EASYEDA_UPSTREAM_DATA_DIR"] = join(directory, "upstream");
