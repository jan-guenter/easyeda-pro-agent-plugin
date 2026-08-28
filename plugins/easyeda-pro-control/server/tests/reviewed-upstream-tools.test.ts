import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  discoverReviewedOrLiveTools,
  reviewedUpstreamToolCatalog,
} from "../src/reviewed-upstream-tools.ts";

void describe("quarantine-safe upstream discovery", () => {
  void test("ships the reviewed 116-tool catalog without development-only tools", () => {
    const tools = reviewedUpstreamToolCatalog();
    assert.equal(tools.length, 116);
    assert.equal(new Set(tools.map((tool) => tool.name)).size, tools.length);
    assert.ok(tools.some((tool) => tool.name === "easyeda_execute"));
    assert.ok(!tools.some((tool) => tool.name === "easyeda_dev_hot_swap"));
  });

  void test("does not call live discovery while dispatch is quarantined", async () => {
    let liveListCalled = false;
    const tools = await discoverReviewedOrLiveTools(
      () => Promise.reject(new Error("orphan risk")),
      () => {
        liveListCalled = true;
        return Promise.resolve([{ name: "unreviewed_live_tool" }]);
      },
      { query: "execute", mode: "write", includeSchemas: true },
    );

    assert.equal(liveListCalled, false);
    assert.deepEqual(
      tools.map((tool) => tool.name),
      ["easyeda_execute"],
    );
    assert.equal(tools[0]?.classification.write, true);
    assert.match(
      String(tools[0]?.description),
      /does not start the upstream process/u,
    );
  });

  void test("uses live discovery after the local dispatch guard passes", async () => {
    const tools = await discoverReviewedOrLiveTools(
      () => Promise.resolve(true),
      () =>
        Promise.resolve([
          {
            name: "easyeda_live_catalog_fixture",
            annotations: { readOnlyHint: true },
          },
        ]),
      { mode: "read" },
    );
    assert.deepEqual(
      tools.map((tool) => tool.name),
      ["easyeda_live_catalog_fixture"],
    );
  });
});
