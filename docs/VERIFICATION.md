# Verification record

Date: 2026-10-16 (Europe/Istanbul) · release: 1.0.1

## Automated rules

**39 tests passed** locally with Node.js 25.3.0 using `npm test`. The suite retains the claim extraction, evidence gates, unsafe URL rejection, duplicate-ID rejection, review statistics and report checks. Fifteen new backup tests exercise the actual export serializer and full domain validator.

All 100 maximum-field claims round-trip unchanged with these UTF-8 export sizes:

| Fixture | Bytes |
| --- | ---: |
| ASCII | 1,424,870 |
| Turkish and emoji | 2,832,590 |
| JSON-escaped control characters | 8,463,470 |

The current schema has a conservative 8,475,620-byte bound, below the shared 10,000,000-byte cap. A regression test detects changes to the assumed record/field limits. Tests cover the exact byte boundary, one byte over it, actual UTF-8 bytes despite a misleading file size, canonical output capacity, older compact v1 backups, foreign/future envelopes, malformed JSON and rejection of the entire review when one record is invalid. No state migration is required.

`npm run package` builds the static app and uses Python's standard library to create a whitelisted ZIP and SHA-256 manifest. It rejects stale build files and checks every archived file against source. Public English/Turkish guides are included; output files, tests, dependencies and user records are excluded. CI retains Node 22/24 Linux and native Intel/arm64 Mac jobs, each running all rules and packaging. See [Actions](https://github.com/metealpkarvan/claim-lantern/actions) for actual remote results; rule CI does not imply browser coverage on those machines.

## Browser acceptance

**33 checks passed** in Chromium through the Playwright CLI, served over local HTTP. Only fictional claims and isolated browser storage were used.

- Created the three fictional sample cards; rejected a supported verdict without evidence, then saved a source/excerpt/note and reopened it. Pending filtering and the downloaded Markdown report remained usable.
- Downloaded a real **2,018,865-byte** JSON file from the app containing 100 claims, Turkish excerpts, emoji notes and all four assessments. Cancelled replacement without changing the prior review, then confirmed restoration. Every ID, text, URL, quote, note, title and assessment matched. Reopening preserved the data; a second export matched the original download byte for byte.
- Malformed JSON, a foreign app, a future version, missing required evidence and a 10,000,001-byte file were rejected without replacement confirmation or changes to current records.
- Checked English/Turkish byte-limit text, its accessible description on the import control, desktop 1280 × 900 and mobile 390 × 844 / 320 × 780 for horizontal overflow, including the import filename.
- Checked the versioned 1.0.1 service-worker cache and offline reopening after a controlled online load. The updated importer and current review remained available. No JavaScript page errors were recorded.

[Desktop screenshot](preview.png) · [Mobile screenshot](mobile.png) · [320-pixel backup controls](backup-mobile.png)

## Limits

The backup cap is independent of browser localStorage quota or access permissions. A valid import is not a guarantee of persistent storage; retain the downloaded JSON. Recovery from already unreadable localStorage remains [open maintenance work](ROADMAP.md).

The ZIP requires local HTTP because it uses native ES modules; it is not a double-click `file://` app. Offline checks do not claim first-ever offline installation. Safari, Firefox, real phones and full assistive-technology checks were not performed. No representative user study, productivity measurement, adoption statistic or security audit was performed. Shared GitHub Pages origins do not isolate apps from each other; see [design decisions](DECISIONS.md).
