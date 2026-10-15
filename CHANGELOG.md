# Changelog

## 1.0.1 — 2026-10-16

- Fixed an exported review being rejected by the previous 1 MB import limit. JSON export and import now share a 10,000,000-byte UTF-8 limit, including multibyte text and JSON escape sequences.
- Kept version 1 backups, 100-claim and field-length limits, review evidence requirements, and explicit replacement confirmation.
- Added Turkish and English backup/restore instructions, an accessible byte-limit hint, and a fresh offline-shell cache. Browser storage quota remains separate from backup capacity.
- Added reproducible ZIP/checksum packaging with public guides and source-parity checks on Linux and both native Mac architectures.

## 1.0.0 — 2026-10-05

- Initial working Claim Lantern release.
- Turkish/English UI, responsive layout and local processing.
- Domain validation, rule checks, offline shell and public Pages demo.
- Research sources, design rationale, privacy limits and contribution guide.
