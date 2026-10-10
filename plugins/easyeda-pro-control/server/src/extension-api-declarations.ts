/** A declaration inventory is documentation, never a callable API allowlist. */
export interface ApiDeclarationMethod {
  name: string;
  className: string;
  signature: string;
  sourceLine: number;
  tags: string[];
}

export interface ApiDeclarationNamespace {
  name: string;
  classNames: string[];
  methods: ApiDeclarationMethod[];
}

export interface ApiDeclarationType {
  name: string;
  kind: "class" | "interface" | "enum" | "type";
  sourceLine: number;
}

export interface ApiDeclarationSnapshot {
  reference: "reviewed-installed" | "official-latest";
  version: string;
  applicationVersion: string | null;
  sourceUrl: string;
  sourceSha256: string;
  sourceBytes: number;
  retrievedAt: string;
  license: string;
  namespaces: ApiDeclarationNamespace[];
  types: ApiDeclarationType[];
}

interface DeclarationClass {
  name: string;
  indentation: string;
  methods: ApiDeclarationMethod[];
}

/** Parse only the line-oriented class grammar present in the pinned official
 * snapshots. Unsupported member formatting refuses regeneration.
 * This does not interpret types, execute code, or claim a JSON input schema.
 */
export function inventoryApiDeclarations(source: string): Pick<ApiDeclarationSnapshot, "namespaces" | "types"> {
  const classes = new Map<string, DeclarationClass>();
  const mounts = new Map<string, string[]>();
  const types: ApiDeclarationType[] = [];
  let current: DeclarationClass | undefined;
  let tags: string[] = [];
  let inComment = false;
  let pending: { indentation: string; method: ApiDeclarationMethod } | undefined;
  const lines = source.split("\n");
  for (const [index, line] of lines.entries()) {
    if (pending) {
      if (!current || line === `${current.indentation}}` || pending.method.signature.length > 32_768) { throw new Error("Incomplete or oversized API method signature."); }
      pending.method.signature += ` ${line.trim()}`;
      const tail = line.slice(pending.indentation.length);
      if (line.startsWith(pending.indentation) && !/^\s/u.test(tail) && line.trimEnd().endsWith(";")) {
        current.methods.push(pending.method);
        pending = undefined;
      }
      // oxlint-disable-next-line eslint/no-continue -- A signature continuation is never parsed as an independent declaration.
      continue;
    }
    const typeMatch = /^\s*(?:declare )?(class|interface|enum|type) ([A-Za-z_]\w*)\b/u.exec(line);
    if (typeMatch?.[1] !== undefined && typeMatch[2] !== undefined && /^(?:(?:I|E|T)?(?:DMT|LIB|PCB|PNL|SCH|SYS)_|EDA$)/u.test(typeMatch[2])) {
      const kind = typeMatch[1];
      if (kind !== "class" && kind !== "interface" && kind !== "enum" && kind !== "type") { throw new Error("Unsupported declaration kind."); }
      types.push({ name: typeMatch[2], kind, sourceLine: index + 1 });
    }
    if (line.includes("/**")) { inComment = true; tags = []; }
    if (inComment) {
      for (const match of line.matchAll(/@(public|beta|alpha|internal|deprecated|since)\b([^@]*?)(?:\*\/|$)/gu)) {
        if (match[1] !== undefined) { tags.push(`${match[1]}${match[2] === undefined || match[2].trim() === "" ? "" : ` ${match[2].trim()}`}`); }
      }
      if (line.includes("*/")) { inComment = false; }
      if (!line.includes("*/") || line.trimEnd().endsWith("*/")) {
        // oxlint-disable-next-line eslint/no-continue -- Documentation is deliberately excluded from declaration syntax parsing.
        continue;
      }
    }
    const classMatch = /^(\s*)(?:declare )?class ([A-Za-z_]\w*)(?:\s[^{}]*)?\s*\{\s*$/u.exec(line);
    if (classMatch?.[2] !== undefined) {
      if (current || classes.has(classMatch[2])) { throw new Error("Nested or duplicate API declaration class."); }
      current = { name: classMatch[2], indentation: classMatch[1] ?? "", methods: [] };
      classes.set(current.name, current);
      tags = [];
    } else if (current && line === `${current.indentation}}`) {
      current = undefined;
      tags = [];
    } else if (current?.name === "EDA") {
      const mount = /^\s+(?:public )?((?:dmt|lib|pcb|pnl|sch|sys)_[A-Za-z0-9]+): ([A-Za-z_]\w*(?: \| [A-Za-z_]\w*)*);\s*$/u.exec(line);
      if (mount?.[1] !== undefined && mount[2] !== undefined) {
        if (mounts.has(mount[1])) { throw new Error("Duplicate EDA namespace mount."); }
        mounts.set(mount[1], mount[2].split(" | "));
      } else if (/\b(?:dmt|lib|pcb|pnl|sch|sys)_\w*\s*:/u.test(line)) { throw new Error("Unsupported EDA namespace mount syntax."); }
    } else if (current) {
      const method = /^\s+(?:public )?([A-Za-z_]\w*)(?:<[^;]*>)?\(/u.exec(line);
      if (method?.[1] !== undefined && method[1] !== "constructor") {
        const entry = { name: method[1], className: current.name, signature: line.trim().replace(/^public /u, ""), sourceLine: index + 1, tags: [...tags] };
        if (line.trimEnd().endsWith(";")) { current.methods.push(entry); }
        else { pending = { indentation: /^\s*/u.exec(line)?.[0] ?? "", method: entry }; }
        tags = [];
      }
    }
  }
  if (current || inComment || pending || mounts.size === 0) { throw new Error("Incomplete API declaration inventory."); }
  const namespaces = [...mounts].map(([name, classNames]) => {
    const methods = classNames.flatMap((className) => {
      const declaration = classes.get(className);
      if (!declaration) { throw new Error("EDA mount refers to a missing class."); }
      return declaration.methods;
    });
    return { name, classNames, methods: methods.toSorted((left, right) => left.name.localeCompare(right.name, "en") || left.className.localeCompare(right.className, "en") || left.sourceLine - right.sourceLine) };
  }).toSorted((left, right) => left.name.localeCompare(right.name, "en"));
  return { namespaces, types: types.toSorted((left, right) => left.name.localeCompare(right.name, "en") || left.sourceLine - right.sourceLine) };
}
