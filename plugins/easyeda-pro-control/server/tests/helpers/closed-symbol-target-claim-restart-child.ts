import assert from "node:assert/strict";
import { claimClosedSymbolValidationTarget } from "../../src/closed-symbol-target-claim.ts";
import { makePlan } from "./closed-symbol-target-claim-fixture.ts";
import { parseClosedSymbolValidationRequest } from "../../src/closed-symbol-validation-request.ts";

const encoded = process.argv[2];
assert.ok(typeof encoded === "string" && encoded.length <= 40_000);
const request = parseClosedSymbolValidationRequest(JSON.parse(encoded) as unknown);
// oxlint-disable-next-line node/no-top-level-await -- Fixed synthetic restart probe deliberately has no isolation/native/profile preload.
await assert.rejects(claimClosedSymbolValidationTarget(request, makePlan(request)));
process.stdout.write("existing reservation refused\n");
