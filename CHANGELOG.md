# Changelog

## [1.0.1] - 2026-09-29

### Fixed

- Broaden the `@deepseek-ai/dsh-host-webserver` peer range to `^0.1.0-rc.6 || ^0.2.0-rc.1` so the plugin is accepted on DSH 0.2.x. The previous `^0.1.0-rc.6` range did not match the `0.2.0-rc.2` runtime, and DSH refuses to load a plugin whose peer range excludes the running core.
- No source changes were needed: `ctx.webServer.register`, `ctx.systemPrompt.section` and `ctx.systemPrompt.context` keep the same signatures on 0.2.0-rc.2, and the client-side `ctx.slots.register`, `ctx.locale.register` and `ctx.locale.bind` signatures are unchanged as well.

## [1.0.0] - 2026-08-28

### Added

- Per-step injection of a language constraint into the system prompt (`systemPrompt.section`, order -200).
- HTTP routes `/language-control/status`, `/language-control/update`, `/language-control/reset` to read/update/reset the constraint text at runtime.
- Settings panel registered into DSH `settings.section` slot with editable constraint text, custom-text toggle, save and reset-to-default.
- Default constraint requires Chinese for chain-of-thought reasoning, planning, tool-invocation reasoning and all replies.