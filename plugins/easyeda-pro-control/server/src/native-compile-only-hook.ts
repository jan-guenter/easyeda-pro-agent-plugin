/** Build-time normalization of one independently owned PowerShell smoke call.
 * Other fragments can insert between calls without duplicating either owner. */
export function installNativeCompileOnlyHook(input: string, owned: string, anchor: string): string {
  const shape = /^ {4}\[Easyeda[A-Za-z\d]+\]::Verify[A-Za-z\d]*Smoke\(\)$/u;
  if (!shape.test(owned) || !shape.test(anchor) || owned === anchor) { throw new Error("NATIVE_COMPILE_ONLY_HOOK_CONTRACT"); }
  let source = input;
  const occurrences = source.split(owned.trimStart()).length - 1;
  if (occurrences > 1 || occurrences === 1 && source.split(`${owned}\n`).length !== 2) { throw new Error("NATIVE_COMPILE_ONLY_HOOK_DUPLICATE_OR_CHANGED"); }
  if (occurrences === 1) { source = source.replace(`${owned}\n`, ""); }
  if (source.split(anchor.trimStart()).length !== 2 || source.split(`${anchor}\n`).length !== 2) { throw new Error("NATIVE_COMPILE_ONLY_HOOK_ANCHOR"); }
  return source.replace(`${anchor}\n`, `${owned}\n${anchor}\n`);
}
