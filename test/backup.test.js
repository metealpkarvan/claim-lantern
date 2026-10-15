import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_BACKUP_BYTES,
  readBackup,
  serializeBackup,
} from "../src/ui.js";
import { STATUSES, validate } from "../src/core.js";

const kind = "claim-lantern";
const MAX_CLAIMS = 100;
const TITLE_LIMIT = 120;
const FIELD_LIMITS = {
  id: 100,
  text: 4000,
  url: 2000,
  quote: 4000,
  note: 4000,
};
const bytes = (value) => new TextEncoder().encode(value).byteLength;
const file = (raw) => ({ size: bytes(raw), text: async () => raw });
const fill = (pattern, length) =>
  pattern.repeat(Math.ceil(length / pattern.length)).slice(0, length);
function maximumReview(pattern) {
  const prefix = "https://example.org/";
  return {
    title: fill(pattern, TITLE_LIMIT),
    claims: Array.from({ length: MAX_CLAIMS }, (_, index) => ({
      id: String(index).padStart(3, "0") + fill(pattern, FIELD_LIMITS.id - 3),
      text: "x" + fill(pattern, FIELD_LIMITS.text - 1),
      url: prefix + fill(pattern, FIELD_LIMITS.url - prefix.length),
      quote: fill(pattern, FIELD_LIMITS.quote),
      note: fill(pattern, FIELD_LIMITS.note),
      status: STATUSES[index % STATUSES.length],
    })),
  };
}

test("the current schema has a conservative escaped JSON upper bound below the cap", (t) => {
  const longestStatus = STATUSES.reduce((a, b) =>
    a.length >= b.length ? a : b,
  );
  const emptyFields = Object.fromEntries(
    Object.keys(FIELD_LIMITS).map((key) => [key, ""]),
  );
  const envelopeBytes = bytes(
    serializeBackup(kind, {
      title: "",
      claims: Array.from({ length: MAX_CLAIMS }, () => ({
        ...emptyFields,
        status: longestStatus,
      })),
    }),
  );
  const fieldUnits = Object.values(FIELD_LIMITS).reduce(
    (sum, limit) => sum + limit,
    0,
  );
  const bound = envelopeBytes + 6 * (TITLE_LIMIT + MAX_CLAIMS * fieldUnits);
  assert.ok(bound < MAX_BACKUP_BYTES);
  t.diagnostic(`Conservative schema upper bound: ${bound} UTF-8 bytes`);
});

test("capacity assumptions stay in sync with the record count and field limits", () => {
  const review = maximumReview("a");
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    const prefix = "https://example.org/";
    const value =
      field === "url"
        ? prefix + "a".repeat(limit + 1 - prefix.length)
        : "x".repeat(limit + 1);
    assert.equal(value.length, limit + 1);
    assert.throws(() =>
      validate({
        title: review.title,
        claims: [{ ...review.claims[0], [field]: value }],
      }),
    );
  }
  assert.throws(() => validate({ ...review, title: "a".repeat(TITLE_LIMIT + 1) }));
  assert.throws(() =>
    validate({
      ...review,
      claims: [...review.claims, { ...review.claims[0], id: "extra" }],
    }),
  );
});

for (const [name, pattern] of [
  ["ASCII", "a"],
  ["Turkish and emoji", "İğşü🙂"],
  ["JSON control-character escaping", "\u0000"],
]) {
  test(`all 100 maximum-field claims round-trip with ${name}`, async (t) => {
    const review = maximumReview(pattern);
    assert.deepEqual(validate(review), review);
    const raw = serializeBackup(kind, review);
    const size = bytes(raw);
    assert.ok(size > 1_000_000, "This valid review exceeded the old limit");
    assert.ok(size <= MAX_BACKUP_BYTES);
    assert.deepEqual(await readBackup(file(raw), kind, validate), review);
    assert.deepEqual(JSON.parse(raw), { kind, version: 1, data: review });
    t.diagnostic(`${name}: ${size} UTF-8 bytes`);
  });
}

test("old compact v1 backups retain title, IDs, evidence and assessments", async () => {
  const review = {
    title: "İstanbul evidence review 🙂",
    claims: [
      {
        id: "old-source-1",
        text: "A claim from an older saved review",
        url: "https://example.org/evidence?source=old",
        quote: "Özgün kaynak alıntısı",
        note: "Kaynak tarihi kontrol edildi.",
        status: "supported",
      },
    ],
  };
  const raw = JSON.stringify({ kind, version: 1, data: review });
  assert.deepEqual(await readBackup(file(raw), kind, validate), review);
});

test("the byte limit is shared by serialization and import at the exact boundary", async () => {
  const overhead = bytes(serializeBackup("app", ""));
  const data = "x".repeat(MAX_BACKUP_BYTES - overhead);
  const raw = serializeBackup("app", data);
  assert.equal(bytes(raw), MAX_BACKUP_BYTES);
  assert.equal(await readBackup(file(raw), "app", (value) => value), data);
  assert.throws(() => serializeBackup("app", data + "x"), /10 MB/);
});

test("a valid review padded to the exact raw byte boundary imports, but one extra byte is rejected before validation", async () => {
  const review = { title: "Boundary review", claims: [] };
  const small = serializeBackup(kind, review);
  const raw = small + " ".repeat(MAX_BACKUP_BYTES - bytes(small));
  assert.equal(bytes(raw), MAX_BACKUP_BYTES);
  assert.deepEqual(await readBackup(file(raw), kind, validate), review);
  let validated = false;
  await assert.rejects(
    readBackup(file(raw + " "), kind, () => {
      validated = true;
    }),
    /10 MB/,
  );
  assert.equal(validated, false);
});

test("serialization counts UTF-8 bytes rather than JavaScript string length", () => {
  const overhead = bytes(serializeBackup("app", ""));
  const available = MAX_BACKUP_BYTES - overhead;
  const data = "é".repeat(Math.floor(available / 2)) + "a".repeat(available % 2);
  const raw = serializeBackup("app", data);
  assert.ok(raw.length < MAX_BACKUP_BYTES);
  assert.equal(bytes(raw), MAX_BACKUP_BYTES);
  assert.throws(() => serializeBackup("app", data + "a"), /10 MB/);
});

test("an oversized file is rejected before reading or validating it", async () => {
  let read = false;
  let validated = false;
  await assert.rejects(
    readBackup(
      {
        size: MAX_BACKUP_BYTES + 1,
        text: async () => {
          read = true;
          return "";
        },
      },
      kind,
      () => {
        validated = true;
      },
    ),
    /10 MB/,
  );
  assert.equal(read, false);
  assert.equal(validated, false);
});

test("oversized raw UTF-8 text is rejected before parsing or validation despite a misleading file size", async () => {
  let validated = false;
  // Invalid JSON also proves the byte check runs before JSON.parse.
  const raw = "é".repeat(MAX_BACKUP_BYTES / 2) + "!";
  assert.ok(raw.length < MAX_BACKUP_BYTES);
  await assert.rejects(
    readBackup({ size: 1, text: async () => raw }, kind, () => {
      validated = true;
    }),
    /10 MB/,
  );
  assert.equal(validated, false);
});

test("validated data must also fit its canonical exported representation", async () => {
  let validated = false;
  const raw = JSON.stringify({ kind: "app", version: 1, data: "small" });
  await assert.rejects(
    readBackup(file(raw), "app", () => {
      validated = true;
      return "x".repeat(MAX_BACKUP_BYTES);
    }),
    /10 MB/,
  );
  assert.equal(validated, true);
});

test("malformed JSON and missing files are rejected", async () => {
  let validated = false;
  const validator = () => {
    validated = true;
  };
  await assert.rejects(readBackup(file("{broken"), kind, validator), SyntaxError);
  await assert.rejects(readBackup(undefined, kind, validator), /10 MB/);
  assert.equal(validated, false);
});

test("foreign, future and missing envelopes are rejected before record validation", async () => {
  for (const value of [
    { kind: "another-app", version: 1, data: {} },
    { kind, version: 2, data: {} },
    { kind, version: "1", data: {} },
    { version: 1, data: {} },
    null,
    [],
  ]) {
    let validated = false;
    await assert.rejects(
      readBackup(file(JSON.stringify(value)), kind, () => {
        validated = true;
      }),
    );
    assert.equal(validated, false);
  }
});

test("one invalid record rejects the entire review instead of restoring a subset", async () => {
  const validClaim = maximumReview("a").claims[0];
  for (const invalidClaim of [
    { ...validClaim, id: "other", text: " " },
    { ...validClaim, id: "other", status: "invented" },
    { ...validClaim, id: "other", url: "javascript:alert(1)" },
    { ...validClaim, id: "other", status: "supported", url: "" },
    { ...validClaim, id: "other", status: "contradicted", quote: "", note: "" },
    { ...validClaim, id: "other", note: "x".repeat(4001) },
    validClaim,
  ]) {
    const review = {
      title: "Do not partially restore",
      claims: [validClaim, invalidClaim],
    };
    await assert.rejects(
      readBackup(file(serializeBackup(kind, review)), kind, validate),
    );
  }
});
