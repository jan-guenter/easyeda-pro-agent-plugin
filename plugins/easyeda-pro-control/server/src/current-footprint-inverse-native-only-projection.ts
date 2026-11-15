/** Build-only closed native graph projection. Retained methods stay byte
 * exact; unreachable public routes throw and private data is omitted. This
 * module accepts no runtime selector and creates no execution authority. */
import { currentPcbDiagnosticCSharpLexicalTokens as tokenize } from "./current-pcb-diagnostic-csharp-spacing.ts";

type Token = ReturnType<typeof tokenize>[number];
interface Method { readonly owner: string; readonly name: string; readonly start: number; readonly end: number; readonly bodyStart: number; readonly bodyEnd: number; readonly public: boolean; readonly static: boolean; readonly signature: readonly Token[]; readonly uses: readonly Token[] }
interface Field { readonly owner: string; readonly start: number; readonly end: number; readonly prefix: string; readonly static: boolean; readonly cells: readonly Readonly<{ name: string; text: string; uses: readonly Token[] }>[] }
interface Block { readonly start: number; readonly end: number; readonly contentStart: number; readonly contentEnd: number; readonly name: string }
const prefix = "// BEGIN NATIVE ONLY CLOSED PUBLIC ", suffix = "// END NATIVE ONLY CLOSED PUBLIC ";
const closed = '{throw new System.InvalidOperationException("native-only-public-route-closed");}';
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_ONLY_PROJECTION"); } }
/** Match bounded lexical braces rather than interpreting strings as code. */
function closing(tokens: readonly Token[], at: number, open: string, close: string): number {
  need(tokens[at]?.text === open); let depth = 1;
  for (let i = at + 1; i < tokens.length; i += 1) { if (tokens[i]?.text === open) { depth += 1; } else if (tokens[i]?.text === close) { depth -= 1; if (depth === 0) { return i; } } }
  throw new Error("INVERSE_NATIVE_ONLY_DELIMITER");
}
/** Fixed markers are supplied by the native-only assembler, never a caller. */
function blocks(source: string): readonly Block[] {
  const out: Block[] = [];
  for (const match of source.matchAll(/^\/\/ BEGIN NATIVE ONLY CLOSED PUBLIC ([A-Za-z\d]+)\n/gmu)) {
    const name = match[1]; need(name !== undefined); const start = match.index; const contentStart = start + match[0].length;
    const endMarker = suffix + name; const contentEnd = source.indexOf(endMarker, contentStart);
    need(contentEnd > contentStart && !source.includes(endMarker, contentEnd + endMarker.length));
    const end = contentEnd + endMarker.length; out.push({ start, end, contentStart, contentEnd, name });
  }
  need(out.length > 0 && out.length <= 32 && new Set(out.map(row => row.name)).size === out.length);
  for (let i = 1; i < out.length; i += 1) { const prior = out[i - 1], row = out[i]; need(prior !== undefined && row !== undefined && prior.end < row.start); }
  return out;
}
/** Parse only ordinary generated C#5 class members in a fixed marked block. */
function members(source: string, tokens: readonly Token[]): Readonly<{ methods: readonly Method[]; fields: readonly Field[] }> {
  const methods: Method[] = []; const fields: Field[] = [];
  const readClass = (name: string, open: number, end: number): void => {
    let at = open + 1;
    while (at < end) {
      const first = at; let stop = at; let assignment = false;
      for (; stop < end; stop += 1) {
        const token = tokens[stop]; need(token !== undefined);
        if (token.text === "(") { stop = closing(tokens, stop, "(", ")"); }
        else if (token.text === "[") { stop = closing(tokens, stop, "[", "]"); }
        else if (token.text === "=") { assignment = true; }
        else if (token.text === ";" || token.text === "{") { break; }
      }
      const token = tokens[stop]; const firstToken = tokens[first]; need(token !== undefined && firstToken !== undefined && stop < end);
      const head = tokens.slice(first, stop);
      let last = stop;
      const nested = head.findIndex(row => row.text === "class" || row.text === "struct" || row.text === "enum");
      if (token.text === "{" && nested !== -1) { const type = head[nested + 1]; need(type?.kind === "identifier"); last = closing(tokens, stop, "{", "}"); readClass(type.text, stop, last); }
      else if (token.text === "{" && !assignment) {
        const paren = head.findIndex(row => row.text === "("); need(paren > 0); const method = head[paren - 1]; need(method?.kind === "identifier");
        last = closing(tokens, stop, "{", "}"); const final = tokens[last]; need(final !== undefined);
        methods.push({ owner: name, name: method.text, start: firstToken.start, end: final.end, bodyStart: token.start, bodyEnd: final.end, public: head.some(row => row.text === "public"), static: head.some(row => row.text === "static"), signature: head, uses: tokens.slice(stop + 1, last) });
      } else {
        while (tokens[last]?.text !== ";") { if (tokens[last]?.text === "{") { last = closing(tokens, last, "{", "}"); } last += 1; need(last < end); }
        const final = tokens[last]; need(final !== undefined); const declaration = tokens.slice(first, last);
        const cells: { name: string; text: string; uses: readonly Token[] }[] = []; let firstName = -1; let cellStart = -1;
        for (let i = 0; i < declaration.length; i += 1) {
          const t = declaration[i]; need(t !== undefined);
          if(t.text==="<"){i=closing(declaration,i,"<",">");}else if(t.text==="["){i=closing(declaration,i,"[","]");}
          else if (firstName === -1 && t.kind === "identifier" && ["=", ",", ";"].includes(declaration[i + 1]?.text ?? ";")) { firstName = i; cellStart = i; }
          if (firstName !== -1) { break; }
        }
        need(firstName > 0);
        for (let i = firstName; i <= declaration.length; i += 1) {
          const t = declaration[i];
          if (t?.text === "(") { i = closing(declaration, i, "(", ")"); }
          else if (t?.text === "[") { i = closing(declaration, i, "[", "]"); }
          else if (t?.text === "{") { i = closing(declaration, i, "{", "}"); }
          else if (t?.text === "<") { i = closing(declaration, i, "<", ">"); }
          else if (i === declaration.length || t?.text === ",") {
            const id = declaration[cellStart]; need(id?.kind === "identifier"); const stopAt = t?.start ?? final.start;
            cells.push({ name: id.text, text: source.slice(id.start, stopAt), uses: declaration.slice(cellStart + 1, i) }); cellStart = i + 1;
          }
        }
        const id = declaration[firstName]; need(id !== undefined); fields.push({ owner: name, start: firstToken.start, end: final.end, prefix: source.slice(firstToken.start, id.start), static: declaration.slice(0,firstName).some(row=>row.text==="static"), cells });
      }
      at = last + 1;
      if (tokens[at]?.text === ";") { at += 1; }
    }
  };
  for (let i = 0; i < tokens.length; i += 1) { if (tokens[i]?.text === "class") { const name = tokens[i + 1]; need(name?.kind === "identifier"); let open = i + 2; while (tokens[open]?.text !== "{") { open += 1; need(open < tokens.length); } const end = closing(tokens, open, "{", "}"); readClass(name.text, open, end); i = end; } }
  need(methods.length > 0 && methods.length <= 2048 && fields.length <= 512);
  return { methods, fields };
}
/** Index lexical uses in retained classes, excluding every marked fragment. */
function uses(source: string, omitted: readonly Block[]): ReadonlyMap<string, readonly Token[]> {
  const tokens = tokenize(source).filter(token => token.kind !== "space" && token.kind !== "comment");
  const grouped = new Map<string, Token[]>(), stack: (string | null)[] = []; let owner: string | null = null, pending: string | null = null;
  for (let i = 0; i < tokens.length; i += 1) { const token = tokens[i]; need(token !== undefined);
    const inBlock = omitted.some(row => token.start >= row.start && token.end <= row.end);
    if (token.text === "class" || token.text === "struct" || token.text === "enum") { const name = tokens[i + 1]; need(name?.kind === "identifier"); pending = name.text; }
    if (token.text === "{") { stack.push(owner); if (pending !== null) { owner = pending; pending = null; } }
    if (!inBlock && owner !== null) { let rows = grouped.get(owner); if (rows === undefined) { rows = []; grouped.set(owner, rows); } rows.push(token); }
    if (token.text === "}") { const prior = stack.pop(); need(prior !== undefined); owner = prior; }
  }
  need(stack.length === 0); return grouped;
}
/** Resolve conservative same-class and explicitly qualified references. */
function referenced(owner: string, name: string, source: ReadonlyMap<string, readonly Token[]>, method: boolean,external=false): boolean {
  for (const [context, rows] of source) { for (let i = 0; i < rows.length; i += 1) {
    if (rows[i]?.text === name && (rows[i - 1]?.text === "." ? rows[i - 2]?.text === owner || rows[i-2]?.text==="this"&&context===owner || external : context === owner || method && name === owner && rows[i - 1]?.text === "new")) { return true; }
  } } return false;
}
export interface CurrentFootprintInverseNativeOnlyProjection { readonly source: string; readonly retainedMethods: number; readonly closedPublicMethods: readonly string[]; readonly omittedPrivateMethods: number; readonly omittedFields: number }
/** Keep the reachable closure byte exact and close every removed public entry.
 * The independent compiler must still prove this generated graph is valid. */
export function projectCurrentFootprintInverseNativeOnly(input: string): CurrentFootprintInverseNativeOnlyProjection {
  need(Buffer.byteLength(input) <= 4_194_304); const marked = blocks(input); const allMethods: Method[] = []; const allFields: Field[] = [];
  const lexical=tokenize(input);for (const block of marked) { const tokens = lexical.filter(token => token.start >= block.contentStart && token.end <= block.contentEnd && token.kind !== "space" && token.kind !== "comment"); const parsed = members(input, tokens); allMethods.push(...parsed.methods); allFields.push(...parsed.fields); }
  const graph = new Map(uses(input, marked)); const signatures = new Map<string, readonly Token[]>();
  /* A closed public method keeps its declaration. Signature-only references
   * retain fields, never method bodies: the method/parameter declaration names
   * must not accidentally reopen an otherwise closed public route. */
  const retainSignature = (method: Method): void => { signatures.set(method.owner, [...(signatures.get(method.owner) ?? []), ...method.signature]); };
  for (const method of allMethods) { if (method.public) { retainSignature(method); } }
  const retained = new Set<Method>(); const kept = new Set<string>();
  const names=new Set([...allMethods.map(row=>row.name),...allFields.flatMap(row=>row.cells.map(cell=>cell.name))]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const method of allMethods) { if (!retained.has(method) && referenced(method.owner, method.name, graph, true, true)) { retained.add(method); if (!method.public) { retainSignature(method); } graph.set(method.owner, [...(graph.get(method.owner) ?? []), ...method.uses]); changed = true; } }
    for (const field of allFields) { for (const cell of field.cells) { const key = `${field.owner  }:${  cell.name}`; if (!kept.has(key) && (referenced(field.owner, cell.name, graph, false,/\b(?:public|internal|protected)\b/u.test(field.prefix)) || referenced(field.owner, cell.name, signatures, false,/\b(?:public|internal|protected)\b/u.test(field.prefix)))) { kept.add(key); graph.set(field.owner, [...(graph.get(field.owner) ?? []), ...cell.uses]); changed = true; } } }
    // Static initialization belongs to every retained static member and
    // Instance constructor; its own dependencies join the same closure.
    const initialized=new Set([...retained].filter(method=>method.static||method.name===method.owner).map(method=>method.owner));
    for(const field of allFields){if(field.static&&field.cells.some(cell=>kept.has(`${field.owner}:${cell.name}`))){initialized.add(field.owner);}}
    for(const method of allMethods){if(method.static&&method.name===method.owner&&initialized.has(method.owner)&&!retained.has(method)){retained.add(method);retainSignature(method);graph.set(method.owner,[...(graph.get(method.owner)??[]),...method.uses]);changed=true;}}
  }
  // Newly retained method bodies, constructor bodies and initializer cells
  // Must pass the same reflective-dependency refusal as the initial roots.
  for(const rows of graph.values()){for(let i=2;i<rows.length;i+=1){const token=rows[i];if(token?.kind==="string"&&rows[i-1]?.text==="("&&["GetField","GetMethod","GetProperty","InvokeMember"].includes(rows[i-2]?.text??"")){for(const name of names){need(token.text!==JSON.stringify(name));}}}}
  const edits: { start: number; end: number; value: string }[] = []; const closedPublicMethods: string[] = []; let omittedFields = 0, omittedPrivateMethods = 0;
  for (const method of allMethods) { if (!retained.has(method)) { if (method.public) { edits.push({ start: method.bodyStart, end: method.bodyEnd, value: closed }); closedPublicMethods.push(`${method.owner  }.${  method.name}`); } else { edits.push({ start: method.start, end: method.end, value: "" }); omittedPrivateMethods += 1; } } }
  for(const field of allFields){
    const cells=field.cells.filter(cell=>kept.has(`${field.owner}:${cell.name}`));omittedFields+=field.cells.length-cells.length;
    if(cells.length!==field.cells.length){
      const value=cells.length===0?"":`${field.prefix+cells.map(cell=>cell.text).join(",")};`;
      edits.push({start:field.start,end:field.end,value});
    }
  }
  for (const block of marked) { edits.push({ start: block.start, end: block.contentStart, value: "" }, { start: block.contentEnd, end: block.end, value: "" }); }
  edits.sort((a, b) => a.start - b.start); let cursor = 0; const out: string[] = [];
  for (const edit of edits) { need(edit.start >= cursor && edit.end >= edit.start); out.push(input.slice(cursor, edit.start), edit.value); cursor = edit.end; }
  out.push(input.slice(cursor)); const source = out.join("");
  need(!source.includes(prefix) && !source.includes(suffix) && retained.size > 0 && closedPublicMethods.length > 0);
  return Object.freeze({ source, retainedMethods: retained.size, closedPublicMethods: Object.freeze(closedPublicMethods), omittedPrivateMethods, omittedFields });
}
