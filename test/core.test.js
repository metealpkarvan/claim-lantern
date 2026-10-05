import test from "node:test";
import assert from "node:assert/strict";
import {
  empty,
  validate,
  validateClaim,
  draftClaims,
  flags,
  stats,
  report,
} from "../src/core.js";
const claim = () => ({
  id: "1",
  text: "A claim",
  url: "",
  quote: "",
  note: "",
  status: "unchecked",
});
test("empty file valid", () => assert.deepEqual(validate(empty()), empty()));
test("line drafts remain unreviewed", () => {
  let n = 0;
  const cs = draftClaims("- A\nA\nB", () => String(++n));
  assert.equal(cs.length, 2);
  assert.ok(cs.every((c) => c.status === "unchecked"));
});
test("no fabricated links in drafts", () =>
  assert.equal(draftClaims("A", () => "1")[0].url, ""));
test("supported requires evidence", () =>
  assert.throws(() => validateClaim({ ...claim(), status: "supported" })));
test("source alone insufficient", () =>
  assert.throws(() =>
    validateClaim({
      ...claim(),
      status: "supported",
      url: "https://example.org",
    }),
  ));
test("source plus excerpt permits user assessment", () =>
  assert.equal(
    validateClaim({
      ...claim(),
      status: "supported",
      url: "https://example.org",
      quote: "Relevant excerpt",
    }).status,
    "supported",
  ));
test("contradiction can include note", () =>
  assert.equal(
    validateClaim({
      ...claim(),
      status: "contradicted",
      url: "https://example.org",
      note: "Different date",
    }).status,
    "contradicted",
  ));
test("inconclusive allowed without source", () =>
  assert.equal(
    validateClaim({ ...claim(), status: "inconclusive" }).status,
    "inconclusive",
  ));
test("script URLs rejected", () =>
  assert.throws(() =>
    validateClaim({ ...claim(), url: "javascript:alert(1)" }),
  ));
test("credential URL rejected", () =>
  assert.throws(() =>
    validateClaim({ ...claim(), url: "https://user:pass@example.org" }),
  ));
test("empty claim rejected", () =>
  assert.throws(() => validateClaim({ ...claim(), text: " " })));
test("numeric detail flagged without a truth score", () =>
  assert.ok(
    flags({ ...claim(), text: "18 varieties" }).includes("numeric-detail"),
  ));
test("stats separate link from review", () =>
  assert.deepEqual(stats([{ ...claim(), url: "https://example.org" }]), {
    total: 1,
    reviewed: 0,
    linked: 1,
  }));
test("duplicate identifiers rejected", () =>
  assert.throws(() => validate({ title: "", claims: [claim(), claim()] })));
test("report includes review caveat and notes", () => {
  const r = report({
    title: "File",
    claims: [{ ...claim(), note: "Still unsure" }],
  });
  assert.ok(r.includes("user assessments"));
  assert.ok(r.includes("Still unsure"));
});
test("oversized claim rejected", () =>
  assert.throws(() => validateClaim({ ...claim(), text: "x".repeat(4001) })));
