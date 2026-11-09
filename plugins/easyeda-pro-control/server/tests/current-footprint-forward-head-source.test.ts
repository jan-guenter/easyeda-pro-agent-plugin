/** Installed-source pin/location checks only; no paused frame or original SQL
 * connection/callback can be issued by complete source bytes. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_FORWARD_HEAD_OPEN_POINT as POINT, qualifyCurrentFootprintForwardHeadSource } from "../src/current-footprint-forward-head-source.ts";

const assets = process.env["EASYEDA_ASSETS_ROOT"];
void test("exact pinned Main source places the head capture after original SQL connection fulfillment", { skip: assets === undefined }, async () => {
  assert.ok(assets !== undefined); const source = await readFile(join(dirname(assets), "app.js"), "utf8");
  assert.equal(qualifyCurrentFootprintForwardHeadSource(source), source);
  assert.equal(source.slice(POINT.offset, POINT.offset + 5), "K0(e)");
  assert.throws(() => qualifyCurrentFootprintForwardHeadSource(`${source.slice(0, POINT.offset)}Q${source.slice(POINT.offset + 1)}`));
});
