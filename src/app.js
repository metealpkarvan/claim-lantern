import {
  $,
  esc,
  t,
  uid,
  init,
  notify,
  load,
  save,
  backup,
  bindImport,
  download,
  safeUrl,
} from "./ui.js";
import {
  empty,
  validate,
  validateClaim,
  draftClaims,
  stats,
  flags,
  report,
  STATUSES,
} from "./core.js";
const KEY = "claim-lantern:v1";
let state = load(KEY, empty(), validate);
$("title").value = state.title;
$("title").oninput = () => {
  state.title = $("title").value;
  save(KEY, state);
};
const statusText = (s) =>
  ({
    unchecked: t("Bekliyor", "Unchecked"),
    supported: t("Kaynak destekliyor", "Source supports"),
    contradicted: t("Kaynak çelişiyor", "Source contradicts"),
    inconclusive: t("Belirsiz", "Inconclusive"),
  })[s];
function render() {
  const counts = stats(state.claims);
  $("total").textContent = counts.total;
  $("reviewed").textContent = counts.reviewed;
  const visible = state.claims.filter(
    (c) => $("filter").value === "all" || c.status === $("filter").value,
  );
  $("claims").innerHTML =
    visible
      .map(
        (c, i) =>
          '<form class="record review" data-id="' +
          esc(c.id) +
          '"><div class="bar"><span class="tag">' +
          statusText(c.status) +
          '</span><span class="hint">' +
          flags(c)
            .map(
              (f) =>
                ({
                  "numeric-detail": t(
                    "Sayıyı kontrol et",
                    "Check numeric detail",
                  ),
                  "absolute-wording": t("Kesin ifade", "Absolute wording"),
                  "no-source": t("Kaynak eklenmedi", "No source attached"),
                })[f],
            )
            .join(" · ") +
          '</span></div><div class="field"><label for="claim-' +
          esc(c.id) +
          '">' +
          t("İddia", "Claim") +
          '</label><textarea id="claim-' +
          esc(c.id) +
          '" name="text" maxlength="4000" required>' +
          esc(c.text) +
          '</textarea></div><div class="field"><label for="url-' +
          esc(c.id) +
          '">' +
          t("Kaynak bağlantısı", "Source URL") +
          '</label><input id="url-' +
          esc(c.id) +
          '" name="url" type="url" maxlength="2000" value="' +
          esc(c.url) +
          '">' +
          (safeUrl(c.url)
            ? '<a href="' +
              esc(safeUrl(c.url)) +
              '" target="_blank" rel="noopener noreferrer">' +
              t("Kaynağı aç", "Open source") +
              " ↗</a>"
            : "") +
          '</div><div class="row"><div class="field"><label for="quote-' +
          esc(c.id) +
          '">' +
          t("Kaynağın ilgili alıntısı", "Relevant source excerpt") +
          '</label><textarea id="quote-' +
          esc(c.id) +
          '" name="quote" maxlength="4000">' +
          esc(c.quote) +
          '</textarea></div><div class="field"><label for="note-' +
          esc(c.id) +
          '">' +
          t("İnceleme notun", "Your review note") +
          '</label><textarea id="note-' +
          esc(c.id) +
          '" name="note" maxlength="4000">' +
          esc(c.note) +
          '</textarea></div></div><div class="actions"><label for="status-' +
          esc(c.id) +
          '" class="visually-hidden">Status</label><select id="status-' +
          esc(c.id) +
          '" name="status">' +
          STATUSES.map(
            (s) =>
              '<option value="' +
              s +
              '" ' +
              (c.status === s ? "selected" : "") +
              ">" +
              statusText(s) +
              "</option>",
          ).join("") +
          '</select><button class="primary" type="submit">' +
          t("İncelemeyi kaydet", "Save review") +
          '</button><button type="button" class="quiet danger" data-delete="' +
          esc(c.id) +
          '">' +
          t("Sil", "Delete") +
          "</button></div></form>",
      )
      .join("") ||
    '<div class="empty">' +
      t(
        "Bu görünümde iddia yok. Soldaki alana incelemek istediğin metni ekle.",
        "No claims in this view. Add the text you want to review on the left.",
      ) +
      "</div>";
}
$("filter").onchange = render;
$("claims").onsubmit = (event) => {
  event.preventDefault();
  const form = event.target.closest("form");
  if (!form) return;
  try {
    const c = validateClaim({
      id: form.dataset.id,
      ...Object.fromEntries(new FormData(form)),
    });
    state.claims = state.claims.map((old) => (old.id === c.id ? c : old));
    save(KEY, state);
    render();
    notify(t("İnceleme kaydedildi.", "Review saved."));
  } catch (error) {
    notify(
      t(
        "Kaynakla desteklenen/çelişen durum için geçerli bağlantı ve alıntı veya not gerekli.",
        "Supported/contradicted needs a valid source URL and an excerpt or note.",
      ) +
        " " +
        error.message,
    );
  }
};
$("claims").onclick = (event) => {
  const id = event.target.closest("[data-delete]")?.dataset.delete;
  if (!id) return;
  state.claims = state.claims.filter((c) => c.id !== id);
  save(KEY, state);
  render();
};
$("extract").onclick = () => {
  try {
    const next = draftClaims($("input").value, uid);
    if (!next.length)
      return notify(
        t("Her satıra bir iddia yaz.", "Write one claim per line."),
      );
    if (
      state.claims.length &&
      !confirm(
        t(
          "Mevcut inceleme kartları değiştirilsin mi? Önce yedek alabilirsin.",
          "Replace existing review cards? You can back them up first.",
        ),
      )
    )
      return;
    state.claims = next;
    save(KEY, state);
    render();
  } catch (error) {
    notify(error.message);
  }
};
$("report").onclick = () =>
  state.claims.length
    ? download("claim-lantern-review.md", report(state), "text/markdown")
    : notify(t("Önce iddia ekle.", "Add a claim first."));
$("backup").onclick = () => backup("claim-lantern", state);
function apply(next) {
  state = next;
  $("title").value = state.title;
  save(KEY, state);
  render();
}
bindImport("claim-lantern", validate, apply);
$("clear").onclick = () => {
  if (
    confirm(t("Tüm yerel incelemeler silinsin mi?", "Clear all local reviews?"))
  )
    apply(empty());
};
$("demo").onclick = () => {
  if (
    state.claims.length &&
    !confirm(
      t(
        "Kurgusal örnekle değiştirilsin mi?",
        "Replace with a fictional sample?",
      ),
    )
  )
    return;
  $("input").value =
    "The sample seed library has 18 varieties.\nEvery neighbor can borrow seeds at any time.\nThe sample center opens on Saturday at 10:00.";
  apply({
    title: "Fictional seed-library draft",
    claims: draftClaims($("input").value, uid),
  });
};
init(render);
