import { text, array, safeUrl } from "./ui.js";
export const STATUSES = [
  "unchecked",
  "supported",
  "contradicted",
  "inconclusive",
];
export const empty = () => ({ title: "", claims: [] });
export function validateClaim(c) {
  if (!c || !STATUSES.includes(c.status))
    throw new Error("Invalid review status");
  const result = {
    id: text(c.id, 100),
    text: text(c.text, 4000),
    url: text(c.url, 2000),
    quote: text(c.quote, 4000),
    note: text(c.note, 4000),
    status: c.status,
  };
  if (!result.text.trim()) throw new Error("A claim needs text");
  if (result.url && !safeUrl(result.url))
    throw new Error("Use a complete http/https URL without credentials");
  if (
    ["supported", "contradicted"].includes(c.status) &&
    (!safeUrl(c.url) || (!c.quote.trim() && !c.note.trim()))
  )
    throw new Error(
      "A supported/contradicted assessment needs a source and a quote or review note",
    );
  return result;
}
export function validate(data) {
  if (!data) throw new Error("Invalid review file");
  const claims = array(data.claims, 100).map(validateClaim);
  if (new Set(claims.map((c) => c.id)).size !== claims.length)
    throw new Error("Duplicate claim IDs");
  return { title: text(data.title, 120), claims };
}
export function draftClaims(input, makeId) {
  text(input, 40000);
  const lines = [
    ...new Set(
      input
        .split(/\r?\n/)
        .map((s) => s.replace(/^\s*[-*•]\s*/, "").trim())
        .filter(Boolean),
    ),
  ];
  if (lines.length > 100) throw new Error("Maximum 100 claims");
  return lines.map((value) =>
    validateClaim({
      id: makeId(),
      text: value,
      url: "",
      quote: "",
      note: "",
      status: "unchecked",
    }),
  );
}
export function flags(c) {
  const result = [];
  if (/\d/.test(c.text)) result.push("numeric-detail");
  if (/\b(always|never|everyone|all|hiç|herkes|daima|asla)\b/i.test(c.text))
    result.push("absolute-wording");
  if (!c.url) result.push("no-source");
  return result;
}
export function stats(claims) {
  return {
    total: claims.length,
    reviewed: claims.filter((c) => c.status !== "unchecked").length,
    linked: claims.filter((c) => !!c.url).length,
  };
}
export function report(data) {
  const quote = (value) =>
    value
      .split("\n")
      .map((line) => "> " + line)
      .join("\n");
  return (
    "# " +
    (data.title || "Claim Lantern review") +
    "\n\nStatuses below are user assessments, not automated truth checks.\n\n" +
    data.claims
      .map(
        (c, i) =>
          "## " +
          (i + 1) +
          " · " +
          c.status.toUpperCase() +
          "\n\n" +
          quote(c.text) +
          "\n\nSource: " +
          (c.url || "(not attached)") +
          "\n\nSource excerpt:\n" +
          quote(c.quote || "(not recorded)") +
          "\n\nReview note:\n" +
          quote(c.note || "(not recorded)"),
      )
      .join("\n\n---\n\n")
  );
}
