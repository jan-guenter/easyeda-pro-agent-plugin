/** Build-time insertion of one exact independently owned PowerShell switch block.
 * Other fragments may move around it; partial or duplicate blocks still refuse. */
export function installOwnedNativeDispatch(input: string, block: string, anchor: string): string {
  const markers = [...block.matchAll(/^ {8}'[a-z0-9-]+' \{$/gmu)].map(match => match[0]);
  if (!block.endsWith("\n") || markers.length === 0 || new Set(markers).size !== markers.length || markers.includes(anchor)) { throw new Error("NATIVE_OWNED_DISPATCH_CONTRACT"); }
  let source = input;
  const counts = markers.map(marker => source.split(marker.trimStart()).length - 1);
  if (counts.some(count => count > 1) || counts.some(count => count === 1) && counts.some(count => count === 0)) { throw new Error("NATIVE_OWNED_DISPATCH_DUPLICATE_OR_PARTIAL"); }
  if (counts.every(count => count === 1)) {
    if (source.split(block).length !== 2) { throw new Error("NATIVE_OWNED_DISPATCH_CHANGED"); }
    source = source.replace(block, "");
  }
  if (source.split(anchor.trimStart()).length !== 2 || source.split(`${anchor}\n`).length !== 2) { throw new Error("NATIVE_OWNED_DISPATCH_ANCHOR"); }
  return source.replace(`${anchor}\n`, `${block}${anchor}\n`);
}
