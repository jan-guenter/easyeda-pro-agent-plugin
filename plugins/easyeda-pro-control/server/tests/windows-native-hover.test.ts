import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";
import { promisify } from "node:util";
import { z } from "zod";

// oxlint-disable-next-line typescript/strict-void-return -- Promisify uses execFile's callback, not its ChildProcess return value.
const execute = promisify(execFile);

async function hoverSources(): Promise<{ controller: string; direct: string; controllerMove: string; directMove: string }> {
  const controller = await readFile(new URL("../../scripts/native-ui-controller.ps1", import.meta.url), "utf8");
  const direct = await readFile(new URL("../../scripts/native-ui.ps1", import.meta.url), "utf8");
  const pattern = /^function Move-HoverPointer\([^\n]+\) \{[\s\S]*?^\}/mu;
  const controllerMove = pattern.exec(controller)?.[0];
  const directMove = pattern.exec(direct)?.[0];
  assert.ok(controllerMove !== undefined && directMove !== undefined);
  return { controller, direct, controllerMove, directMove };
}

function withoutComments(source: string): string {
  return source.replaceAll(/^\s*#[^\n]*\n/gmu, "").replaceAll("EasyedaNativeUi", "EasyedaUiController");
}

void test("hover leaves have identical bounded move-only behavior and preserved outer ownership/confirmation gates", async () => {
  const { controller, direct, controllerMove, directMove } = await hoverSources();
  assert.equal(withoutComments(controllerMove), withoutComments(directMove));
  for (const source of [controllerMove, directMove]) {
    assert.doesNotMatch(source, /mouse_event|SendInput|SendWait|SetForegroundWindow|ShowWindow|Start-Sleep/u);
    assert.equal(source.match(/::SetCursorPos\(/gu)?.length, 1);
    assert.match(source, /GetCursorPos\(\[ref\]\$point\).*\$point\.X -ne \$x.*\$point\.Y -ne \$y/u);
    assert.ok(source.indexOf("hover-button-held") < source.indexOf("$script:dispatched = $true"));
    for (const guard of ["hover-point-not-owned", "hover-point-owner-unverified", "hover-capture-state-unverified", "hover-recipient-changed", "hover-recipient-owner-changed", "hover-owner-chain-changed"]) {
      assert.ok(source.indexOf(guard) < source.indexOf("$script:dispatched = $true"));
    }
    assert.ok(source.indexOf("$script:dispatched = $true") < source.indexOf("::SetCursorPos("));
    assert.ok(source.indexOf("hover-foreground-changed") > source.indexOf("::SetCursorPos("));
  }
  const branch = /\} elseif \(\$action -eq 'hover'\) \{([\s\S]*?)\} elseif \(\$windowPid/u.exec(controller)?.[1];
  assert.ok(branch !== undefined);
  for (const guard of ["Assert-Root", "Owned-Window $windowHandle", "IsWindowVisible($windowHandle)", "$rect = $window.Current.BoundingRectangle"]) {
    assert.ok(branch.includes(guard) && branch.indexOf(guard) < branch.indexOf("$result = Move-HoverPointer"));
  }
  assert.ok(branch.includes("$hoverWindowPid = Window-Pid $windowHandle"));
  assert.ok(branch.includes("(Window-Pid $windowHandle) -ne $hoverWindowPid"));
  assert.ok(branch.includes("$hoverWindowPid ([uint32]$request.rootPid)"));
  assert.ok(controller.includes("'click','doubleclick','rightclick','hover','keys'"));
  assert.ok(controller.includes("if ($writes -and $request.confirmUIWrite -ne $true)"));
  assert.ok(controller.includes("if ($action -ne 'normal-close') { Assert-Root }"));
  assert.ok(direct.includes("'doubleclick','hover','keys'"));
  assert.ok(direct.includes("throw 'Hover window owner changed.'"));
  assert.ok(direct.includes("throw 'Hover process generation changed after input.'"));
  assert.ok(direct.includes("$X $Y ([uint32]$TargetPid) ([uint32]$TargetPid)"));
});

void test("actual hover PowerShell leaves refuse invalid bounds, held input, foreground drift and clipped positions using managed doubles only", async (context) => {
  let powershell: string | undefined;
  for (const candidate of ["/usr/bin/pwsh", "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"]) {
    try { await access(candidate); powershell = candidate; break; } catch {
      // Pure synthetic native replacements can run on either PowerShell platform.
    }
  }
  if (powershell === undefined) { context.skip("PowerShell unavailable for managed synthetic hover tests."); return; }
  const { controllerMove, directMove } = await hoverSources();
  const stub = `public static class EasyedaUiController {
public struct Point { public int X,Y; }
public struct Rect { public int Left,Top,Right,Bottom; }
[System.Runtime.InteropServices.StructLayout(System.Runtime.InteropServices.LayoutKind.Sequential)] public struct GuiThreadInfo {
public uint Size,Flags;public System.IntPtr Active,Focus,Capture,MenuOwner,MoveSize,Caret;public Rect CaretRect;
}
public static int Mode, Moves, X, Y, Hits, Owners;
public static bool IsIconic(System.IntPtr handle){return Mode==1;}
public static System.IntPtr GetForegroundWindow(){return new System.IntPtr(Mode==2||(Mode==7&&Moves>0)||(Mode==25&&Hits>0)?19:18);}
public static short GetAsyncKeyState(int key){return Mode==3&&key==1||Mode==8&&key==2||Mode==9&&key==4||Mode==10&&key==5||Mode==11&&key==6?(short)-32768:Mode==12?(short)1:(short)0;}
public static System.IntPtr WindowFromPoint(Point point){Hits++;return new System.IntPtr(Mode==13?0:Mode==14?99:Mode==22&&Hits>1?21:20);}
public static System.IntPtr GetAncestor(System.IntPtr handle,uint flags){return new System.IntPtr(handle.ToInt32()==99||Mode==29&&Hits>1?99:18);}
public static System.IntPtr GetWindow(System.IntPtr handle,uint flags){return new System.IntPtr(Mode==31||Mode==35?17:Mode==33?18:Mode==34?handle.ToInt32()+1:0);}
public static uint GetWindowThreadProcessId(System.IntPtr handle,out uint pid){Owners++;bool target=handle.ToInt32()==18;bool hit=handle.ToInt32()==20;
pid=Mode==24&&target||Mode==35&&!target&&!hit?0u:Mode==26||Mode==27&&Owners>=3||Mode==28&&Owners>=4&&hit||Mode>=31&&(target||hit||Mode==33||Mode==34)||Mode==15&&!target?8u:7u;
return Mode==16&&target||Mode==17&&!target?0u:((Mode==20||Mode==23)&&!target||Mode==30&&Owners>=3&&target)?88u:77u;}
public static bool GetGUIThreadInfo(uint thread,ref GuiThreadInfo info){if(info.Size!=System.Runtime.InteropServices.Marshal.SizeOf(typeof(GuiThreadInfo)))throw new System.Exception("incorrect-struct-size");info.Active=new System.IntPtr(Mode==21?99:18);info.Capture=new System.IntPtr(Mode==19||Mode==20&&thread==88?20:0);return Mode!=18;}
public static bool SetCursorPos(int x,int y){Moves++;X=x;Y=y;return Mode!=4;}
public static bool GetCursorPos(out Point point){point=new Point{X=Mode==6?X+1:X,Y=Y};return Mode!=5;}
}`;
  const parsedResult = z.object({ refused: z.boolean(), moves: z.number().int(), dispatched: z.boolean(), result: z.unknown() });
  const programs = [controllerMove, directMove].map((source, index) => {
    const name = index === 0 ? "EasyedaUiController" : "EasyedaNativeUi";
    return `$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue';
Add-Type @'
${stub.replaceAll("EasyedaUiController", name)}
'@
${source}
$cases=@();foreach($mode in 0..35){[${name}]::Mode=$mode;[${name}]::Moves=0;[${name}]::Hits=0;[${name}]::Owners=0;$script:dispatched=$false;$result=$null;$refused=$false;
$expectedPid=7;if($mode -ge 31){$expectedPid=8};
try{$result=Move-HoverPointer ([IntPtr]18) @(-20,0,100,300) -14 260 $expectedPid 7}catch{$refused=$true};
$cases+=@{refused=$refused;moves=[${name}]::Moves;dispatched=$script:dispatched;result=$result}};
[${name}]::Mode=0;$bad=@();foreach($bounds in @(@(0,0,0,300),@([double]::NaN,0,100,300),@(-20,0,[double]::PositiveInfinity,300),@(-20,0,20000,300),@(-20,0,100),@(0,0,100,300),@(-20,0,6,300),@(-20,0,100,260))){
[${name}]::Moves=0;[${name}]::Hits=0;[${name}]::Owners=0;$script:dispatched=$false;$refused=$false;try{Move-HoverPointer ([IntPtr]18) $bounds -14 260 7 7|Out-Null}catch{$refused=$true};
$bad+=@{refused=$refused;moves=[${name}]::Moves;dispatched=$script:dispatched;result=$null}};
ConvertTo-Json -InputObject @{cases=$cases;bounds=$bad} -Depth 8 -Compress;exit 0;`;
  });
  // Only the extracted maintained leaves run; every native API is a managed
  // Double. No real process/window discovery, cursor input or UI state is read.
  // Each invocation stays below Windows' command-line limit.
  // Both use the same native doubles, deadlines and complete assertions.
  const actual: unknown[] = [];
  for (const program of programs) {
    const { stdout, stderr }: { stdout: string; stderr: string } = await execute(powershell, ["-NoLogo", "-NoProfile", "-NonInteractive", "-EncodedCommand",
      Buffer.from(program, "utf16le").toString("base64")], { timeout: 15_000, maxBuffer: 32_768 });
    assert.equal(stderr, "");
    actual.push(JSON.parse(stdout.trim()) as unknown);
  }
  const variants = z.array(z.object({ cases: z.array(parsedResult).length(36), bounds: z.array(parsedResult).length(8) })).length(2).parse(actual);
  assert.deepEqual(variants[0], variants[1]);
  for (const variant of variants) {
    for (const [mode, result] of variant.cases.entries()) {
      // Modes 26–28 substitute initial or late target/hit PIDs.
      // Modes 29/30 change the late root/thread; 31 is a valid owned dialog.
      // Modes 32–35 lose, cycle, overrun or obscure its owner chain.
      const accepted = mode === 0 || mode === 12 || mode === 23 || mode === 31;
      const attempted = accepted || mode >= 4 && mode <= 7;
      assert.equal(result.refused, !accepted, `mode ${mode}`);
      assert.equal(result.moves, attempted ? 1 : 0, `mode ${mode}`);
      assert.equal(result.dispatched, attempted, `mode ${mode}`);
      assert.deepEqual(result.result, accepted ? { pointerMovedTo: [-14, 260], buttonInputSent: false, hoverEffectProven: false } : null);
    }
    for (const result of variant.bounds) { assert.deepEqual(result, { refused: true, moves: 0, dispatched: false, result: null }); }
  }
});
