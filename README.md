# Persona Switcher

Loadable personality profiles (SRE, Data Scientist, Frontend Dev, etc.)

## Installation

```bash
cortex plugin install marketplace:cortex-plugin-persona-switcher
cortex plugin install github:CortexPrism/cortex-plugin-persona-switcher
cortex plugin install ./manifest.json
```

## Quick Start

```bash
cortex tools list
cortex chat --plugin cortex-plugin-persona-switcher
```

## Tools

### persona_list

List all available personas.

**Parameters:** none

### persona_activate

Activate a persona profile.

**Parameters:**
- `persona_id` (string, required) — Persona ID (sre, data-scientist, frontend-dev, devops, security-auditor)

### persona_create

Create a custom persona profile.

**Parameters:**
- `name` (string, required) — Name for the custom persona
- `role` (string, required) — Role description
- `system_prompt` (string, required) — System prompt for the persona
- `tool_scopes` (string, optional) — Comma-separated tool scopes
- `expertise` (string, optional) — Comma-separated expertise tags

### persona_current

Get the currently active persona.

**Parameters:** none

### persona_deactivate

Deactivate current persona and return to default.

**Parameters:** none

## Built-in Personas

| ID | Name | Role |
|----|------|------|
| sre | SRE | System reliability engineering, incident response |
| data-scientist | Data Scientist | Data analysis, ML, statistics |
| frontend-dev | Frontend Developer | React/Vue/Svelte, CSS, accessibility |
| devops | DevOps Engineer | CI/CD, Docker, K8s, Terraform |
| security-auditor | Security Auditor | OWASP, SAST, secret scanning |

## Configuration

```json
{
  "plugins": {
    "cortex-plugin-persona-switcher": {
      "enabled": true,
      "config": {
        "defaultPersona": "none"
      }
    }
  }
}
```

## Development

```bash
deno task test
deno fmt
deno lint
deno task validate
```

## License

MIT — See [LICENSE](./LICENSE) file
