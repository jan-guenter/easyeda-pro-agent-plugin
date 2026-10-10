#!/usr/bin/env node
import { resolve } from "node:path";
import { validateSkillPackage } from "./skill-package-validation.ts";

try {
  // oxlint-disable-next-line node/no-top-level-await -- This standalone CLI waits for packaging validation before exiting.
  const result = await validateSkillPackage(resolve(import.meta.dirname, "../skills"));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) { process.exitCode = 1; }
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : "Skill validation failed."}\n`);
  process.exitCode = 1;
}
