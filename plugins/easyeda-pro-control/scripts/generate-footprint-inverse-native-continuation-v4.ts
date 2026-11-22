/** Rebuild the fixed native-only inverse purpose. */
import { lstat, readFile, writeFile } from "node:fs/promises";
import { footprintInverseNativeContinuationV4Identity, generateFootprintInverseNativeContinuationV4Source } from "./footprint-inverse-native-continuation-v4-source.ts";
import { CURRENT_INVERSE_NATIVE_CANONICAL_BASELINES } from "./inverse-native-canonical-baselines.ts";
import { readCurrentInverseNativeCanonicalInputs } from "./inverse-native-canonical-inputs.ts";

async function exists(path: URL): Promise<boolean> {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function main(): Promise<void> {
  const mode = process.argv[2];
  if (process.argv.length !== 3 || (mode !== "--write" && mode !== "--check")) {
    throw new Error("INVERSE_NATIVE_LIFECYCLE_GENERATOR_ARGUMENTS");
  }

  const layout = "inverse-native-continuation.v4";
  const input = await readCurrentInverseNativeCanonicalInputs(layout);
  const data = generateFootprintInverseNativeContinuationV4Source(input);
  const review = CURRENT_INVERSE_NATIVE_CANONICAL_BASELINES[layout].outputReview;
  const repository = new URL("../../../", import.meta.url);
  const checkout = new URL("plugins/easyeda-pro-control/", repository).href === new URL("../", import.meta.url).href
    && await exists(new URL(".agents/plugins/marketplace.json", repository));
  const reviewUrl = checkout
    ? new URL(review.repositoryRelativePath, repository)
    : new URL(`../${review.path}`, import.meta.url);
  const outputs = [
    { url: new URL("footprint-inverse-native-continuation-v4.ps1", import.meta.url), text: data.helper },
    { url: new URL("../server/src/current-footprint-inverse-native-continuation-v4-identity.ts", import.meta.url), text: footprintInverseNativeContinuationV4Identity(data) },
  ];

  /* The standalone plugin archive has the same readable bytes in its independent
   * canonical owner. A standalone write can also materialize its review output. */
  if (checkout || mode === "--write" || await exists(reviewUrl)) {
    outputs.push({ url: reviewUrl, text: data.review });
  } else if (data.review !== input.ownerSource) {
    throw new Error("INVERSE_NATIVE_LIFECYCLE_GENERATION_CHANGED");
  }

  for (const output of outputs) {
    if (mode === "--write") {
      await writeFile(output.url, output.text, { mode: 0o644 });
    } else if (await readFile(output.url, "utf8") !== output.text) {
      throw new Error("INVERSE_NATIVE_LIFECYCLE_GENERATION_CHANGED");
    }
  }
  process.stdout.write(`${JSON.stringify({ ok: true, helperBytes: Buffer.byteLength(data.helper), compilerBytes: Buffer.byteLength(data.compiler), nativeExecuted: false })}\n`);
}

// oxlint-disable-next-line node/no-top-level-await -- ESM-only immutable build command.
await main();
