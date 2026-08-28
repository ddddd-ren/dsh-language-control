# Changelog

## [1.0.0] - 2026-08-28

### Added

- Per-step injection of a language constraint into the system prompt (`systemPrompt.section`, order -200).
- HTTP routes `/language-control/status`, `/language-control/update`, `/language-control/reset` to read/update/reset the constraint text at runtime.
- Settings panel registered into DSH `settings.section` slot with editable constraint text, custom-text toggle, save and reset-to-default.
- Default constraint requires Chinese for chain-of-thought reasoning, planning, tool-invocation reasoning and all replies.