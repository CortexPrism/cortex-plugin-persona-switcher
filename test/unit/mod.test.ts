import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { tools } from "../../mod.ts";
import type { PluginContext } from "cortex/plugins";

const mockContext: PluginContext = {
  pluginId: "cortex-plugin-persona-switcher",
  pluginDir: "/tmp/plugins/cortex-plugin-persona-switcher",
  state: {
    get: async () => null,
    set: async () => {},
  },
  config: {},
  logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
};

function findTool(name: string) {
  return tools.find((t) => t.definition.name === name);
}

Deno.test("persona_list - lists all personas", async () => {
  const tool = findTool("persona_list");
  if (!tool) throw new Error("persona_list tool not found");

  const result = await tool.execute({}, mockContext);
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertEquals(output.personas.length >= 5, true);
  assertEquals(output.builtin, 5);
});

Deno.test("persona_list - includes active persona info", async () => {
  const tool = findTool("persona_list");
  if (!tool) throw new Error("persona_list tool not found");

  const result = await tool.execute({}, mockContext);
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertEquals(output.active, null);
});

Deno.test("persona_activate - activates a built-in persona", async () => {
  const tool = findTool("persona_activate");
  if (!tool) throw new Error("persona_activate tool not found");

  const result = await tool.execute({ persona_id: "sre" }, mockContext);
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertEquals(output.activated.id, "sre");
  assertEquals(output.activated.name, "SRE");
  assertStringIncludes(output.message, "activated");
});

Deno.test("persona_activate - activates another built-in persona", async () => {
  const tool = findTool("persona_activate");
  if (!tool) throw new Error("persona_activate tool not found");

  const result = await tool.execute(
    { persona_id: "frontend-dev" },
    mockContext,
  );
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertEquals(output.activated.id, "frontend-dev");
});

Deno.test("persona_activate - rejects missing persona_id", async () => {
  const tool = findTool("persona_activate");
  if (!tool) throw new Error("persona_activate tool not found");

  const result = await tool.execute({}, mockContext);
  assertEquals(result.success, false);
  assertStringIncludes(result.error, "non-empty string");
});

Deno.test("persona_activate - rejects unknown persona", async () => {
  const tool = findTool("persona_activate");
  if (!tool) throw new Error("persona_activate tool not found");

  const result = await tool.execute({ persona_id: "nonexistent" }, mockContext);
  assertEquals(result.success, false);
  assertStringIncludes(result.error, "not found");
});

Deno.test("persona_create - creates a custom persona", async () => {
  const tool = findTool("persona_create");
  if (!tool) throw new Error("persona_create tool not found");

  const result = await tool.execute({
    name: "Custom Architect",
    role: "System Architect",
    system_prompt: "You are a system architect.",
    tool_scopes: "architecture,design",
    expertise: "systems,scalability",
  }, mockContext);
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertEquals(output.created.name, "Custom Architect");
  assertEquals(output.created.id, "custom-architect");
});

Deno.test("persona_create - rejects duplicate persona", async () => {
  const tool = findTool("persona_create");
  if (!tool) throw new Error("persona_create tool not found");

  await tool.execute({
    name: "Duplicate Persona",
    role: "Test",
    system_prompt: "Test prompt",
  }, mockContext);

  const result = await tool.execute({
    name: "Duplicate Persona",
    role: "Test",
    system_prompt: "Test prompt",
  }, mockContext);
  assertEquals(result.success, false);
  assertStringIncludes(result.error, "already exists");
});

Deno.test("persona_create - rejects missing name", async () => {
  const tool = findTool("persona_create");
  if (!tool) throw new Error("persona_create tool not found");

  const result = await tool.execute({}, mockContext);
  assertEquals(result.success, false);
  assertStringIncludes(result.error, "name");
});

Deno.test("persona_create - rejects missing role", async () => {
  const tool = findTool("persona_create");
  if (!tool) throw new Error("persona_create tool not found");

  const result = await tool.execute({ name: "Test" }, mockContext);
  assertEquals(result.success, false);
  assertStringIncludes(result.error, "role");
});

Deno.test("persona_current - returns no active persona by default", async () => {
  const tool = findTool("persona_current");
  if (!tool) throw new Error("persona_current tool not found");

  const result = await tool.execute({}, mockContext);
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertEquals(output.active, null);
});

Deno.test("persona_current - returns active persona after activation", async () => {
  const activate = findTool("persona_activate");
  if (!activate) throw new Error("persona_activate tool not found");
  await activate.execute({ persona_id: "devops" }, mockContext);

  const tool = findTool("persona_current");
  if (!tool) throw new Error("persona_current tool not found");

  const result = await tool.execute({}, mockContext);
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertEquals(output.active.id, "devops");
  assertEquals(output.active.name, "DevOps Engineer");
});

Deno.test("persona_deactivate - handles no active persona", async () => {
  const tool = findTool("persona_deactivate");
  if (!tool) throw new Error("persona_deactivate tool not found");

  const result = await tool.execute({}, mockContext);
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertStringIncludes(JSON.stringify(output), "No persona was active");
});

Deno.test("persona_deactivate - deactivates active persona", async () => {
  const activate = findTool("persona_activate");
  if (!activate) throw new Error("persona_activate tool not found");
  await activate.execute({ persona_id: "sre" }, mockContext);

  const tool = findTool("persona_deactivate");
  if (!tool) throw new Error("persona_deactivate tool not found");

  const result = await tool.execute({}, mockContext);
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertEquals(output.deactivated.id, "sre");
});

Deno.test("tools array exported", () => {
  assertEquals(tools.length, 5);
  assertEquals(tools[0].definition.name, "persona_list");
  assertEquals(tools[1].definition.name, "persona_activate");
  assertEquals(tools[2].definition.name, "persona_create");
  assertEquals(tools[3].definition.name, "persona_current");
  assertEquals(tools[4].definition.name, "persona_deactivate");
});
