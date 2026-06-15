/**
 * CortexPrism Persona Switcher
 *
 * Loadable personality profiles (SRE, Data Scientist, Frontend Dev, etc.)
 * #6 in the official plugin registry.
 */

import type { Tool, ToolContext, PluginContext, ToolCallResult } from "cortex/plugins";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PersonaConfig {
  defaultPersona: string;
}

interface Persona {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  toolScopes: string[];
  expertise: string[];
}

// ---------------------------------------------------------------------------
// Built-in personas
// ---------------------------------------------------------------------------

const BUILTIN_PERSONAS: Persona[] = [
  {
    id: "sre",
    name: "SRE",
    role: "Site Reliability Engineer",
    systemPrompt: "You are a Site Reliability Engineer (SRE). Focus on system reliability, incident response, monitoring, capacity planning, and operational excellence. Prioritize stability, observability, and root-cause analysis.",
    toolScopes: ["monitoring", "incident", "infrastructure", "deployment"],
    expertise: ["SRE", "incident response", "monitoring", "reliability", "capacity planning"],
  },
  {
    id: "data-scientist",
    name: "Data Scientist",
    role: "Data analysis, ML, statistics",
    systemPrompt: "You are a Data Scientist. Focus on data analysis, machine learning, statistical modeling, and data visualization. Prioritize data-driven insights, reproducible research, and model interpretability.",
    toolScopes: ["data", "ml", "statistics", "visualization"],
    expertise: ["data science", "machine learning", "statistics", "SQL", "Python", "R"],
  },
  {
    id: "frontend-dev",
    name: "Frontend Developer",
    role: "React/Vue/Svelte, CSS, accessibility",
    systemPrompt: "You are a Frontend Developer specializing in modern web frameworks (React, Vue, Svelte). Focus on UI/UX, CSS, accessibility (WCAG), responsive design, and performance optimization.",
    toolScopes: ["frontend", "ui", "a11y", "css"],
    expertise: ["React", "Vue", "Svelte", "CSS", "accessibility", "web performance"],
  },
  {
    id: "devops",
    name: "DevOps Engineer",
    role: "CI/CD, Docker, K8s, Terraform",
    systemPrompt: "You are a DevOps Engineer. Focus on CI/CD pipelines, containerization (Docker, Kubernetes), infrastructure as code (Terraform), and deployment automation. Prioritize automation, reproducibility, and security.",
    toolScopes: ["ci-cd", "containers", "infrastructure", "automation"],
    expertise: ["Docker", "Kubernetes", "Terraform", "CI/CD", "GitHub Actions"],
  },
  {
    id: "security-auditor",
    name: "Security Auditor",
    role: "OWASP, SAST, secret scanning",
    systemPrompt: "You are a Security Auditor. Focus on security best practices, OWASP Top 10, static analysis (SAST), secret scanning, dependency auditing, and threat modeling. Prioritize security over convenience.",
    toolScopes: ["security", "audit", "secrets", "vulnerabilities"],
    expertise: ["OWASP", "SAST", "secret scanning", "threat modeling", "vulnerability assessment"],
  },
];

// ---------------------------------------------------------------------------
// Module-level config (closure pattern)
// ---------------------------------------------------------------------------

let config: PersonaConfig = {
  defaultPersona: "none",
};

let activePersona: Persona | null = null;
const customPersonas = new Map<string, Persona>();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPersona(personaId: string): Persona | undefined {
  const builtin = BUILTIN_PERSONAS.find((p) => p.id === personaId);
  if (builtin) return builtin;
  return customPersonas.get(personaId);
}

function listAllPersonas(): Persona[] {
  return [...BUILTIN_PERSONAS, ...customPersonas.values()];
}

// ---------------------------------------------------------------------------
// Tool: persona_list
// ---------------------------------------------------------------------------

const personaList: Tool = {
  definition: {
    name: "persona_list",
    description: "List all available personas",
    params: [],
    capabilities: [],
  },

  execute: async (_args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    const toolName = "persona_list";
    try {
      const allPersonas = listAllPersonas();
      const builtinCount = BUILTIN_PERSONAS.length;
      const customCount = customPersonas.size;

      return {
        toolName, success: true,
        output: JSON.stringify({
          personas: allPersonas.map((p) => ({
            id: p.id,
            name: p.name,
            role: p.role,
            expertise: p.expertise,
            type: customPersonas.has(p.id) ? "custom" : "builtin",
          })),
          total: allPersonas.length,
          builtin: builtinCount,
          custom: customCount,
          active: activePersona ? { id: activePersona.id, name: activePersona.name } : null,
        }),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName, success: false, output: "",
        error: `Failed to list personas: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Tool: persona_activate
// ---------------------------------------------------------------------------

const personaActivate: Tool = {
  definition: {
    name: "persona_activate",
    description: "Activate a persona profile",
    params: [
      { name: "persona_id", type: "string", description: "Persona identifier", required: true },
    ],
    capabilities: [],
  },

  execute: async (args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    const toolName = "persona_activate";
    try {
      if (!args.persona_id || typeof args.persona_id !== "string") {
        return { toolName, success: false, output: "", error: "persona_id must be a non-empty string", durationMs: Date.now() - start };
      }

      const personaId = (args.persona_id as string).toLowerCase();
      const persona = getPersona(personaId);

      if (!persona) {
        const available = listAllPersonas().map((p) => p.id).join(", ");
        return {
          toolName, success: false, output: "",
          error: `Persona "${personaId}" not found. Available: ${available}`,
          durationMs: Date.now() - start,
        };
      }

      activePersona = persona;

      return {
        toolName, success: true,
        output: JSON.stringify({
          activated: { id: persona.id, name: persona.name, role: persona.role },
          systemPrompt: persona.systemPrompt,
          expertise: persona.expertise,
          toolScopes: persona.toolScopes,
          message: `Persona "${persona.name}" activated.`,
        }),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName, success: false, output: "",
        error: `Activation failed: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Tool: persona_create
// ---------------------------------------------------------------------------

const personaCreate: Tool = {
  definition: {
    name: "persona_create",
    description: "Create a custom persona profile",
    params: [
      { name: "name", type: "string", description: "Name for the custom persona", required: true },
      { name: "role", type: "string", description: "Role description", required: true },
      { name: "system_prompt", type: "string", description: "System prompt for the persona", required: true },
      { name: "tool_scopes", type: "string", description: "Comma-separated tool scopes", required: false },
      { name: "expertise", type: "string", description: "Comma-separated expertise tags", required: false },
    ],
    capabilities: [],
  },

  execute: async (args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    const toolName = "persona_create";
    try {
      if (!args.name || typeof args.name !== "string") {
        return { toolName, success: false, output: "", error: "name must be a non-empty string", durationMs: Date.now() - start };
      }
      if (!args.role || typeof args.role !== "string") {
        return { toolName, success: false, output: "", error: "role must be a non-empty string", durationMs: Date.now() - start };
      }
      if (!args.system_prompt || typeof args.system_prompt !== "string") {
        return { toolName, success: false, output: "", error: "system_prompt must be a non-empty string", durationMs: Date.now() - start };
      }

      const name = args.name as string;
      const personaId = name.toLowerCase().replace(/[^a-z0-9-]/g, "-");

      if (getPersona(personaId)) {
        return { toolName, success: false, output: "", error: `Persona "${personaId}" already exists`, durationMs: Date.now() - start };
      }

      const toolScopes = args.tool_scopes && typeof args.tool_scopes === "string"
        ? args.tool_scopes.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const expertise = args.expertise && typeof args.expertise === "string"
        ? args.expertise.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const persona: Persona = {
        id: personaId,
        name: name,
        role: args.role as string,
        systemPrompt: args.system_prompt as string,
        toolScopes,
        expertise,
      };

      customPersonas.set(personaId, persona);

      return {
        toolName, success: true,
        output: JSON.stringify({
          created: {
            id: persona.id,
            name: persona.name,
            role: persona.role,
            expertise: persona.expertise,
            toolScopes: persona.toolScopes,
          },
          message: `Custom persona "${persona.name}" created with ID "${persona.id}".`,
        }),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName, success: false, output: "",
        error: `Creation failed: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Tool: persona_current
// ---------------------------------------------------------------------------

const personaCurrent: Tool = {
  definition: {
    name: "persona_current",
    description: "Get the currently active persona",
    params: [],
    capabilities: [],
  },

  execute: async (_args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    const toolName = "persona_current";
    try {
      if (!activePersona) {
        return {
          toolName, success: true,
          output: JSON.stringify({ active: null, message: "No persona is currently active. Using default agent behavior." }),
          durationMs: Date.now() - start,
        };
      }

      return {
        toolName, success: true,
        output: JSON.stringify({
          active: {
            id: activePersona.id,
            name: activePersona.name,
            role: activePersona.role,
            systemPrompt: activePersona.systemPrompt,
            expertise: activePersona.expertise,
            toolScopes: activePersona.toolScopes,
          },
        }),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName, success: false, output: "",
        error: `Failed to get current persona: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Tool: persona_deactivate
// ---------------------------------------------------------------------------

const personaDeactivate: Tool = {
  definition: {
    name: "persona_deactivate",
    description: "Deactivate current persona and return to default",
    params: [],
    capabilities: [],
  },

  execute: async (_args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    const toolName = "persona_deactivate";
    try {
      if (!activePersona) {
        return {
          toolName, success: true,
          output: JSON.stringify({ message: "No persona was active." }),
          durationMs: Date.now() - start,
        };
      }

      const deactivated = { id: activePersona.id, name: activePersona.name };
      activePersona = null;

      return {
        toolName, success: true,
        output: JSON.stringify({
          deactivated,
          message: `Persona "${deactivated.name}" deactivated. Returning to default agent behavior.`,
        }),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName, success: false, output: "",
        error: `Deactivation failed: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Middleware: pre-execution (injects persona system prompt)
// ---------------------------------------------------------------------------

  }
  return { allowed: true, args };
};

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

export async function onLoad(ctx: PluginContext): Promise<void> {
  const defaultPersona = await ctx.config.get<string>("defaultPersona");

  config = {
    defaultPersona: defaultPersona ?? "none",
  };

  if (config.defaultPersona !== "none") {
    const persona = getPersona(config.defaultPersona);
    if (persona) {
      activePersona = persona;
    }
  }

  ctx.logger.info(`[cortex-plugin-persona-switcher] Loaded with ${BUILTIN_PERSONAS.length} built-in personas${activePersona ? `, active: ${activePersona.id}` : ""}`);
}

export async function onUnload(_ctx: PluginContext): Promise<void> {
  activePersona = null;
  customPersonas.clear();
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const tools: Tool[] = [
  personaList,
  personaActivate,
  personaCreate,
  personaCurrent,
  personaDeactivate,
];

