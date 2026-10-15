# Proposed next improvements

Not implemented yet.

- Several sources and conflicting excerpts per claim.
- Review dates and revision history for changed claims.

Prioritize observed issues and complete small changes. Release actual changed behavior; never simulate contribution activity.

## Completed in 1.0.1

- Aligned JSON export and import at 10,000,000 UTF-8 bytes so valid exported reviews can be restored, including large evidence fields, multibyte text and escaped control characters.
- Documented replacement confirmation, cancellation and the separate limits of browser storage in Turkish and English.

## Known maintenance work

- Protect an unreadable saved review from later edits and offer its original text for recovery. Version 1.0.1 addresses backup capacity; this saved-data recovery work remains open.
