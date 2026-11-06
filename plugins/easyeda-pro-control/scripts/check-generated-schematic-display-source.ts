/** Exact installed serializer syntax/data check only. No native model, app,
 * SDK setter, process owner or write capability is constructed. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { canonicalJson } from "../server/src/core.ts";
import { GENERATED_SCHEMATIC_DISPLAY_TEXT_SOURCE, projectGeneratedSchematicInitialNativeTextBody } from "../server/src/generated-schematic-display-source.ts";
import { MANAGED_SCHEMATIC_FIXTURE_TEXT } from "../server/src/managed-schematic-fixture-generator.ts";

async function main(): Promise<void> {
  const assetsRoot = process.argv[2] ?? "/mnt/c/Program Files/easyeda-pro/resources/app/assets";
  for (const profile of GENERATED_SCHEMATIC_DISPLAY_TEXT_SOURCE.files) {
    const bytes = await readFile(join(assetsRoot, profile.relativePath)); assert.equal(bytes.length, profile.bytes);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), profile.sha256); const source = bytes.toString("utf8");
    const text = source.slice(profile.text.start, profile.text.end); const common = source.slice(profile.common.start, profile.common.end);
    assert.equal(createHash("sha256").update(text).digest("hex"), GENERATED_SCHEMATIC_DISPLAY_TEXT_SOURCE.textSha256);
    assert.equal(createHash("sha256").update(common).digest("hex"), GENERATED_SCHEMATIC_DISPLAY_TEXT_SOURCE.commonSha256);
    for (const span of [profile.accessors, profile.decorators]) {
      assert.equal(createHash("sha256").update(source.slice(span.start, span.end)).digest("hex"), span.sha256);
    }
    const fixture = MANAGED_SCHEMATIC_FIXTURE_TEXT;
    const projected: unknown = runInNewContext(`const methods={${text},${common}}; const input=${JSON.stringify(fixture)};
const receiver={_x:input.x,_y:input.y,_rotation:input.rotation,_color:input.color,_fontFamily:input.fontFamily,_fontSize:input.fontSize,
_fontWeight:input.fontWeight,_italic:input.italic,_underline:input.underline,_strikeout:input.strikeout,value:input.value,zIndex:input.zIndex,locked:input.locked,
shapeManager:{isSymbolShapeManager:()=>false},getAlignConsistencyValue:()=>input.align,setCommonPropsForConsistencyManager:methods.setCommonPropsForConsistencyManager};
JSON.parse(JSON.stringify(methods.getConsistencyData.call(receiver)));`, {}, { timeout: 1000 });
    assert.equal(canonicalJson(projected), canonicalJson(projectGeneratedSchematicInitialNativeTextBody(fixture)));
  }
  process.stdout.write(`${JSON.stringify({ ok: true, sourceFiles: 2, serializerMethods: 4, accessorAndDecoratorSpans: 4, syntaxAndDataOnly: true, nativeExecutionVerified: false, writerAuthority: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- The offline CLI must await its own syntax/data checks.
await main();
