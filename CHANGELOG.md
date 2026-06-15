# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup

## [1.0.0] — 2026-06-15

### Added
- Initial release of cortex-plugin-persona-switcher
- `persona_list` — List all available personas
- `persona_activate` — Activate a persona profile
- `persona_create` — Create a custom persona profile
- `persona_current` — Get the currently active persona
- `persona_deactivate` — Deactivate current persona and return to default
- 5 built-in personas: SRE, Data Scientist, Frontend Dev, DevOps, Security Auditor
- Pre-execution middleware injects persona system prompt
- UI settings: defaultPersona (select)
