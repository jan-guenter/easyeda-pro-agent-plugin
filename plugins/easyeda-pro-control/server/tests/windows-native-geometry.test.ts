import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";
import { promisify } from "node:util";

// oxlint-disable-next-line typescript/strict-void-return -- Node execFile returns its ChildProcess while promisify consumes only its callback.
const execute = promisify(execFile);

void test("actual PowerShell bounds projection rejects Rect.Empty and preserves finite native coordinates", async (context) => {
  let powershell: string | undefined;
  for (const candidate of ["/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe", "/usr/bin/pwsh"]) {
    try { await access(candidate); powershell = candidate; break; } catch {
      // This platform may not supply PowerShell.
    }
  }
  if (powershell === undefined) { context.skip("PowerShell is unavailable on this platform."); return; }
  const helper = await readFile(new URL("../../scripts/native-ui-controller.ps1", import.meta.url), "utf8");
  const functions = helper.match(/^function Get-FiniteWindowBounds\([^\n]+\) \{[\s\S]*?^\}/gmu);
  assert.equal(functions?.length, 1);
  const source = functions?.[0];
  assert.ok(source !== undefined && source.length < 4096);
  const encoded = Buffer.from(source, "utf8").toString("base64");
  // Parse the packaged script without running it, then execute only its pure geometry function.
  // This test never enumerates or interacts with windows.
  const program = `$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue';
$source=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${encoded}'));
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseInput($source,[ref]$tokens,[ref]$errors);
if($errors.Count -ne 0){throw 'script-parse-failed'};
$functions=@($ast.FindAll({param($node) $node -is [Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -ceq 'Get-FiniteWindowBounds'},$true));
if($functions.Count -ne 1){throw 'geometry-function-missing'};
. ([ScriptBlock]::Create($functions[0].Extent.Text));
$cases=@(
  @{bounds=(Get-FiniteWindowBounds @(10,20,800,600))},
  @{bounds=(Get-FiniteWindowBounds @([double]::PositiveInfinity,[double]::PositiveInfinity,[double]::NegativeInfinity,[double]::NegativeInfinity))},
  @{bounds=(Get-FiniteWindowBounds @(0,0,[double]::NaN,600))},
  @{bounds=(Get-FiniteWindowBounds @(0,0,0,600))},
  @{bounds=(Get-FiniteWindowBounds @(-32000,-32000,314,50))},
  @{bounds=(Get-FiniteWindowBounds @(0,0,200))}
);ConvertTo-Json -InputObject $cases -Depth 4 -Compress;`;
  // Allow cold PowerShell startup on shared CI runners. This pure-function test
  // Does not change the production native controller's operation deadlines.
  const { stdout, stderr } = await execute(powershell, ["-NoLogo", "-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(program, "utf16le").toString("base64")], { timeout: 45_000, maxBuffer: 16_384 });
  assert.equal(stderr, "");
  const actual: unknown = JSON.parse(stdout.trim());
  assert.deepEqual(actual, [{ bounds: [10, 20, 800, 600] }, { bounds: null }, { bounds: null }, { bounds: null }, { bounds: [-32_000, -32_000, 314, 50] }, { bounds: null }]);
});
