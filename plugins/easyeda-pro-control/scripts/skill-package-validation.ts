import { lstat, readFile, readdir } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

export interface SkillPackageValidation {
  readonly ok: boolean;
  readonly skills: readonly string[];
  readonly errors: readonly string[];
}

async function regularPath(root: string, path: string): Promise<boolean> {
  const local = relative(root, path);
  if (isAbsolute(local) || local === ".." || local.startsWith(`..${sep}`)) { return false; }
  let current = root;
  for (const segment of local.split(sep).filter((value) => value.length > 0)) {
    current = join(current, segment);
    const info = await lstat(current);
    if (info.isSymbolicLink()) { return false; }
  }
  const information = await lstat(path);
  return information.isFile();
}
function metadataString(source: string, key: string): string | undefined {
  const line = source.split("\n").find((value) => value.trimStart().startsWith(`${key}:`));
  if (line === undefined) { return undefined; }
  const value = line.trimStart().slice(key.length + 1).trim();
  try {
    const decoded: unknown = JSON.parse(value);
    return typeof decoded === "string" ? decoded : undefined;
  } catch { return undefined; }
}

function validateEntrypoint(source: string, name: string): void {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(source)?.[1];
  const declaredName = frontmatter === undefined ? undefined : /^name: ([a-z0-9-]+)$/mu.exec(frontmatter)?.[1];
  const description = frontmatter === undefined ? undefined : /^description: (.+)$/mu.exec(frontmatter)?.[1];
  const unfinishedMarker = ["[", "TODO", ":"].join("");
  if (declaredName !== name || description === undefined || description.trim().length < 20 || source.includes(unfinishedMarker)) {
    throw new Error("Invalid frontmatter or unfinished entrypoint.");
  }
}
async function readSkillFile(root: string, path: string): Promise<string> {
  if (!(await regularPath(root, path))) { throw new Error("Skill file escapes the package or is not regular."); }
  const information = await lstat(path);
  if (information.size > 1024 * 1024) { throw new Error("Skill file exceeds the 1 MiB packaging bound."); }
  return readFile(path, "utf8");
}
async function linkedMarkdownPaths(root: string, path: string, source: string): Promise<string[]> {
  const paths: string[] = [];
  for (const link of source.matchAll(/!?\[[^\]\n]*\]\(([^)\n]+)\)/gu)) {
    const target = link[1]?.trim();
    if (target !== undefined && !target.startsWith("#") && !/^(?:https?:|mailto:)/u.test(target)) {
      const local = target.split("#")[0];
      if (local === undefined || local.length === 0 || isAbsolute(local) || /^(?:file:|[A-Za-z]:|.*\\)/u.test(local)) {
        throw new Error(`Nonportable local link in ${relative(root, path)}.`);
      }
      const linked = resolve(path, "..", local);
      if (!(await regularPath(root, linked))) { throw new Error(`Broken or escaping skill link in ${relative(root, path)}.`); }
      if (linked.endsWith(".md")) { paths.push(linked); }
    }
  }
  return paths;
}
async function validateOneSkill(root: string, name: string): Promise<void> {
  const skillRoot = join(root, name);
  const entrypoint = join(skillRoot, "SKILL.md");
  const metadata = await readSkillFile(root, join(skillRoot, "agents", "openai.yaml"));
  const prompt = metadataString(metadata, "default_prompt"), shortDescription = metadataString(metadata, "short_description");
  if (prompt === undefined || !prompt.includes(`$${name}`) || shortDescription === undefined || shortDescription.length < 25 || shortDescription.length > 64) {
    throw new Error("UI metadata needs a quoted task prompt naming this skill and a 25–64 character short description.");
  }
  const queue = [entrypoint], visited = new Set<string>();
  while (queue.length > 0) {
    const path = queue.shift();
    if (path !== undefined && !visited.has(path)) {
      visited.add(path);
      const source = await readSkillFile(root, path);
      if (path === entrypoint) { validateEntrypoint(source, name); }
      queue.push(...await linkedMarkdownPaths(root, path, source));
    }
  }
}

/** Portable offline packaging checks; they do not claim behavioral skill quality. */
export async function validateSkillPackage(skillsRoot: string): Promise<SkillPackageValidation> {
  const root = resolve(skillsRoot);
  const errors: string[] = [], skills: string[] = [];
  const information = await lstat(root);
  if (!information.isDirectory() || information.isSymbolicLink()) {
    return { ok: false, skills, errors: ["Skill root must be a real directory, never a symlink."] };
  }
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries.toSorted((left, right) => left.name.localeCompare(right.name, "en"))) {
    if (!entry.isDirectory() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(entry.name) || entry.name.length > 64) {
      errors.push(`${entry.name}: skill root entries must be named directories, never symlinks.`);
    } else {
      skills.push(entry.name);
      try { await validateOneSkill(root, entry.name); }
      catch (error) { errors.push(`${entry.name}: ${error instanceof Error ? error.message : "skill files could not be validated"}`); }
    }
  }
  if (skills.length === 0) { errors.push("No skills are packaged."); }
  return { ok: errors.length === 0, skills, errors };
}
