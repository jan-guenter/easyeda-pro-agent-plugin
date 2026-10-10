import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { validateSkillPackage } from "../../scripts/skill-package-validation.ts";

void test("packaged skill links and metadata stay portable and resolve without following symlinks", async () => {
  const root = await mkdtemp(join(tmpdir(), "easyeda-skill-validation-"));
  const skillRoot = join(root, "example-skill");
  try {
    await mkdir(join(skillRoot, "agents"), { recursive: true });
    await mkdir(join(skillRoot, "references"));
    await writeFile(join(skillRoot, "agents", "openai.yaml"), 'interface:\n  short_description: "Review exact electronics design evidence"\n  default_prompt: "Use $example-skill to review this board."\n');
    await writeFile(join(skillRoot, "SKILL.md"), "---\nname: example-skill\ndescription: Review exact electronic design evidence.\n---\nUse [guidance](references/design.md).\n");
    await writeFile(join(skillRoot, "references", "design.md"), "Use the exact datasheet. [Manufacturer](https://example.com/device)\n");
    const valid = await validateSkillPackage(root);
    assert.equal(valid.ok, true);
    await writeFile(join(skillRoot, "references", "design.md"), "[Missing](missing.md)\n");
    const missing = await validateSkillPackage(root);
    assert.equal(missing.ok, false);
    await writeFile(join(skillRoot, "references", "design.md"), "[Escape](../../../outside.md)\n");
    const escaping = await validateSkillPackage(root);
    assert.equal(escaping.ok, false);
    await writeFile(join(skillRoot, "references", "design.md"), "[Symlink](redirect.md)\n");
    await symlink(join(skillRoot, "SKILL.md"), join(skillRoot, "references", "redirect.md"));
    const redirecting = await validateSkillPackage(root);
    assert.equal(redirecting.ok, false);
    await writeFile(join(skillRoot, "references", "design.md"), "A complete reference.\n");
    await writeFile(join(skillRoot, "agents", "openai.yaml"), 'interface:\n  short_description: "Review exact electronics design evidence"\n  default_prompt: "Use $wrong-skill to review this board."\n');
    const wrongPrompt = await validateSkillPackage(root);
    assert.equal(wrongPrompt.ok, false);
  } finally { await rm(root, { recursive: true, force: true }); }
});
