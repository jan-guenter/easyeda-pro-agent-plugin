/** Pure narrow model of the pinned worker's clone rename. No execution authority.
 * WORKER b849bd12: l6 at 1371847, ir at 1372052, Ne at 1845057,
 * getDataByTitle at 1931780 and clone at 1940076. Native local-mode folding
 * uses the default locale; printable ASCII without uppercase I excludes its
 * Turkish/Azeri ambiguity. All active SYMBOL titles, including other symbol
 * types, must be supplied by the complete original inventory before use.
 */
export interface CurrentSymbolCopyName {
  readonly name: string;
  readonly collisions: number;
}

function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current symbol copy name: ${message}`); }
}

function checkedTitle(value: unknown): string {
  need(typeof value === "string" && value.length > 0 && value.length <= 512 && /^[\u0020-\u007E]+$/u.test(value) && !value.includes("I"),
    "title is outside the printable ASCII/no-uppercase-I policy");
  return value;
}

function folded(value: string): string { return value.toLowerCase(); }

function nextName(value: string): string {
  const parts = value.split("_"), suffix = parts.at(-1);
  need(suffix !== undefined, "suffix is absent");
  const numeric = Number(suffix);
  // Native l6 accepts empty, hexadecimal, fractional and exponent suffixes.
  // The admitted alphabet makes its multiline underscore test exact.
  if (parts.length === 1 || Number.isNaN(numeric) || /^_+$/u.test(value)) { return `${value}_1`; }
  parts[parts.length - 1] = String(numeric + 1);
  return parts.join("_");
}

export function deriveCurrentSymbolCopyName(sourceTitle: string, titles: readonly string[]): Readonly<CurrentSymbolCopyName> {
  const source = checkedTitle(sourceTitle);
  need(Array.isArray(titles) && titles.length > 0 && titles.length <= 4096, "title inventory count refused");
  need(Reflect.ownKeys(titles).length === titles.length + 1, "title inventory has extra properties or holes");
  const names = new Set<string>();
  let bytes = 0, sourceCount = 0;
  for (let index = 0; index < titles.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(titles, String(index));
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "title inventory requires own data entries");
    const title = checkedTitle(descriptor.value);
    bytes += title.length;
    need(bytes <= 1_048_576, "title inventory byte bound exceeded");
    const key = folded(title);
    need(!names.has(key), "duplicate folded title refused");
    names.add(key);
    if (title === source) { sourceCount += 1; }
  }
  need(sourceCount === 1, "exact source title must occur once");
  let name = source;
  for (let collisions = 0; collisions <= 500; collisions += 1) {
    if (!names.has(folded(name))) { return Object.freeze({ name, collisions }); }
    name = checkedTitle(nextName(name));
  }
  // Native ir returns the next candidate after its 501st collision unchecked.
  // Do not treat that exhausted native return as unique.
  throw new Error("Current symbol copy name: native collision search exhausted");
}
