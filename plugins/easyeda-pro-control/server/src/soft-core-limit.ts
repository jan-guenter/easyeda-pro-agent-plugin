import { readFile } from "node:fs/promises";

const SELF_LIMITS_PATH = "/proc/self/limits";
const MAXIMUM_LIMITS_BYTES = 64 * 1024;

export type SelfLimitsReader = () => Promise<string>;

export function assertZeroSoftCoreLimit(limits: string): void {
  if (Buffer.byteLength(limits, "utf8") > MAXIMUM_LIMITS_BYTES) {
    throw new Error("The process limits record exceeds the supported size.");
  }
  const coreRows = limits
    .split("\n")
    .filter((line) => line.startsWith("Max core file size"));
  if (coreRows.length !== 1) {
    throw new Error(
      "The process must expose exactly one zero soft core-file limit.",
    );
  }
  const match =
    /^Max core file size[\t ]+(0|[1-9]\d*|unlimited)[\t ]+(0|[1-9]\d*|unlimited)[\t ]+bytes[\t ]*$/u.exec(
      coreRows[0] ?? "",
    );
  if (match?.[1] !== "0") {
    throw new Error("The process must have a zero soft core-file limit.");
  }
}

function readSelfLimits(): Promise<string> {
  if (process.platform !== "linux") {
    throw new Error("The process limits boundary requires Linux procfs.");
  }
  return readFile(SELF_LIMITS_PATH, "utf8");
}

export async function assertSelfSoftCoreLimitZero(
  readLimits: SelfLimitsReader = readSelfLimits,
): Promise<void> {
  let limits: string;
  try {
    limits = await readLimits();
  } catch {
    throw new Error(
      "The current process soft core-file limit could not be proven zero.",
    );
  }
  assertZeroSoftCoreLimit(limits);
}

export async function runWithZeroSoftCoreLimit<Result>(
  operation: () => Promise<Result>,
  readLimits: SelfLimitsReader = readSelfLimits,
): Promise<Result> {
  await assertSelfSoftCoreLimitZero(readLimits);
  return operation();
}
