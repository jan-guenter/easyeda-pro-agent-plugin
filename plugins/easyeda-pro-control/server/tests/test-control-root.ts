import { join } from "node:path";

/** Keep independently resolved credential/upstream paths inside each fixture.
 * Tests of explicit custom paths may replace those variables after this call.
 * This module must remain builtin-only so static imports cannot capture any
 * production module's environment before the fixture installs its own root.
 */
export function configureTestControlRoot(directory?: string): void {
  if (directory === undefined) {
    delete process.env["EASYEDA_CONTROL_DATA_DIR"];
    delete process.env["EASYEDA_BRIDGE_TOKEN_FILE"];
    delete process.env["EASYEDA_UPSTREAM_DATA_DIR"];
  } else {
    process.env["EASYEDA_CONTROL_DATA_DIR"] = directory;
    process.env["EASYEDA_BRIDGE_TOKEN_FILE"] = join(directory, "bridge-token");
    process.env["EASYEDA_UPSTREAM_DATA_DIR"] = join(directory, "upstream");
  }
}
