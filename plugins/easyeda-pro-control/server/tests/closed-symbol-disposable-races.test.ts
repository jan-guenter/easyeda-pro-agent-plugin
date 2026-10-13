import assert from "node:assert/strict";
import { test } from "node:test";
import { admissionStopped, fulfilled, ordinaryRefused, raceFixture, reservationRefused, setupRefused, shutdownOutcome } from "./helpers/disposable-index-race-fixture.ts";

void test("ordinary launch reaches the held fingerprint before the original validation reserves", { timeout: 60_000 }, async context => {
  const f = await raceFixture(context, "ordinary-first");
  const ordinary = f.startOrdinary(); await f.ordinaryTurn();
  const validation = f.startValidation(); reservationRefused(await f.validation());
  await f.release(); ordinaryRefused(fulfilled(await ordinary)); admissionStopped(fulfilled(await validation));
  reservationRefused(await f.validation()); await f.unchangedAndOffline();
});
void test("validation reservation prevents ordinary runtime allocation before its fingerprint await", { timeout: 60_000 }, async context => {
  const f = await raceFixture(context, "reservation-first");
  const validation = f.startValidation(); reservationRefused(await f.validation());
  ordinaryRefused(await f.ordinary()); await f.ordinaryTurn();
  await f.release(); admissionStopped(fulfilled(await validation));
  reservationRefused(await f.validation()); await f.unchangedAndOffline();
});
void test("two valid public calls retain one original reservation and one entry invocation", { timeout: 60_000 }, async context => {
  const f = await raceFixture(context, "concurrent");
  const validation = f.startValidation(); reservationRefused(await f.validation());
  await f.release(); admissionStopped(fulfilled(await validation));
  reservationRefused(await f.validation()); await f.unchangedAndOffline();
});
void test("captured configuration drift refuses before any runtime allocation and stays consumed", { timeout: 60_000 }, async context => {
  const f = await raceFixture(context, "configuration");
  const validation = f.startValidation(); reservationRefused(await f.validation());
  await f.changeConfiguration(); await f.release(); setupRefused(fulfilled(await validation));
  assert.deepEqual(await f.runtimeStatus(), { state: "not-launched" });
  reservationRefused(await f.validation()); ordinaryRefused(await f.ordinary()); await f.ordinaryTurn();
  await f.unchangedAndOffline();
});
void test("original shutdown drains the pending ordinary gate owner without native allocation", { timeout: 60_000 }, async context => {
  const f = await raceFixture(context, "shutdown");
  const ordinary = f.startOrdinary(); await f.ordinaryTurn();
  const validation = f.startValidation(); reservationRefused(await f.validation());
  await f.unchangedAndOffline(); await f.shutdown(); await f.release(); await f.waitClosed();
  shutdownOutcome(await ordinary, "ordinary"); shutdownOutcome(await validation, "validation");
});
