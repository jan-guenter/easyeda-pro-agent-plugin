/** Synthetic child streams only. The actual source-qualified start path issues every token. */
import assert from "node:assert/strict";
import process from "node:process";
import type { TestContext } from "node:test";
import { clockSpawnFixture } from "./windows-clock-spawn-fixture.ts";
import { startWindowsAuthoritySupervisor } from "../../src/windows-authority.ts";
import type { WindowsAuthoritySupervisor } from "../../src/windows-authority.ts";

export async function qualifiedClockFixture(context: TestContext): Promise<Awaited<ReturnType<typeof clockSpawnFixture>> & {
  supervisor: WindowsAuthoritySupervisor;
}> {
  const fixture = await clockSpawnFixture(context);
  const distribution = process.env["WSL_DISTRO_NAME"];
  assert.ok(distribution !== undefined && /^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$/u.test(distribution));
  fixture.options.helperWindowsPath = `\\\\wsl.localhost\\${distribution}${fixture.helperPath.replaceAll("/", "\\")}`;
  fixture.options.powershellExecutable = "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe";
  const supervisor = await startWindowsAuthoritySupervisor(fixture.options);
  context.after(async (): Promise<void> => {
    await supervisor.release(); fixture.restore();
  });
  return { ...fixture, supervisor };
}
