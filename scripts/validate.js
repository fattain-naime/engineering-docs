#!/usr/bin/env node
"use strict";

/**
 * engineering-docs MCP Validation Server
 *
 * Minimal MCP server providing three tools:
 *   - validate_document_set  — check required docs exist with valid frontmatter
 *   - check_consistency      — verify cross-document entity/reference consistency
 *   - generate_index         — produce a master index from existing documents
 *
 * Reads from .engineering-docs/ in the current working directory.
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DOCS_DIR = path.join(process.cwd(), ".engineering-docs");

const REQUIRED_DOCS = [
  { slug: "business-plan", skill: "business-concept" },
  { slug: "project-plan", skill: "project-plan" },
  { slug: "user-personas", skill: "user-personas-behavior" },
  { slug: "technical-specification", skill: "technical-specification" },
  { slug: "system-architecture", skill: "system-architecture-document" },
  { slug: "implementation-plan", skill: "implementation-plan" },
  { slug: "test-strategy", skill: "test-strategy-document" },
  { slug: "deployment-plan", skill: "deployment-plan" },
];

const CONDITIONAL_DOCS = [
  { slug: "feasibility-study", skill: "technical-feasibility-study" },
  { slug: "ux-flow-specification", skill: "ux-flow-specification" },
  { slug: "database-design", skill: "database-design-document" },
  { slug: "api-design", skill: "api-design-document" },
  { slug: "admin-access-control", skill: "admin-access-control-specification" },
  { slug: "security-threat-model", skill: "security-threat-model" },
  { slug: "design-system", skill: "design-system-specification" },
  { slug: "technical-runbook", skill: "technical-runbook" },
  { slug: "disaster-recovery", skill: "disaster-recovery-plan" },
  { slug: "slo-error-budget", skill: "slo-error-budget-document" },
];

const REQUIRED_FRONTMATTER_FIELDS = [
  "title",
  "skill",
  "status",
  "owner_reviewed",
  "last_updated",
  "depends_on",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const fm = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^(\w[\w_]*)\s*:\s*(.+)/);
    if (m) fm[m[1].trim()] = m[2].trim();
  }
  return fm;
}

function extractTitle(content) {
  const m = content.match(/^#\s+(.+)/m);
  return m ? m[1].trim() : null;
}

function listDocFiles() {
  if (!fs.existsSync(DOCS_DIR)) return [];
  return fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".md") && f !== "index.md")
    .sort();
}

function readDoc(filename) {
  const fp = path.join(DOCS_DIR, filename);
  if (!fs.existsSync(fp)) return null;
  return fs.readFileSync(fp, "utf8");
}

// ---------------------------------------------------------------------------
// Tool: validate_document_set
// ---------------------------------------------------------------------------

function validateDocumentSet() {
  const report = { ok: true, required: [], conditional: [], errors: [] };

  if (!fs.existsSync(DOCS_DIR)) {
    return {
      ok: false,
      error: "No .engineering-docs/ directory found in the current workspace.",
    };
  }

  const files = listDocFiles();

  for (const doc of REQUIRED_DOCS) {
    const match = files.find((f) => f.includes(doc.slug));
    if (!match) {
      report.required.push({ slug: doc.slug, status: "missing" });
      report.errors.push(`Required document missing: ${doc.slug}`);
      report.ok = false;
    } else {
      const content = readDoc(match);
      const fm = parseFrontmatter(content);
      const issues = [];

      if (!fm) {
        issues.push("No frontmatter block found");
      } else {
        for (const field of REQUIRED_FRONTMATTER_FIELDS) {
          if (!fm[field]) issues.push(`Missing frontmatter field: ${field}`);
        }
        if (fm.status && !["draft", "final", "superseded"].includes(fm.status)) {
          issues.push(`Invalid status "${fm.status}" — expected draft|final|superseded`);
        }
      }

      report.required.push({
        slug: doc.slug,
        file: match,
        status: fm?.status || "unknown",
        issues,
      });
      if (issues.length) report.ok = false;
    }
  }

  for (const doc of CONDITIONAL_DOCS) {
    const match = files.find((f) => f.includes(doc.slug));
    if (match) {
      const content = readDoc(match);
      const fm = parseFrontmatter(content);
      const issues = [];

      if (!fm) {
        issues.push("No frontmatter block found");
      } else {
        for (const field of REQUIRED_FRONTMATTER_FIELDS) {
          if (!fm[field]) issues.push(`Missing frontmatter field: ${field}`);
        }
      }

      report.conditional.push({ slug: doc.slug, file: match, status: fm?.status || "unknown", issues });
      if (issues.length) report.ok = false;
    }
  }

  return report;
}

// ---------------------------------------------------------------------------
// Tool: check_consistency
// ---------------------------------------------------------------------------

function checkConsistency() {
  const issues = [];
  const files = listDocFiles();

  if (!files.length) {
    return { ok: false, error: "No documents found in .engineering-docs/." };
  }

  // Collect entity names and references from each doc
  const docData = {};
  for (const f of files) {
    const content = readDoc(f);
    const fm = parseFrontmatter(content);
    docData[f] = { content, fm, depends_on: [] };

    if (fm?.depends_on) {
      // Parse depends_on which may be a YAML list like [a.md, b.md]
      const raw = fm.depends_on.replace(/^\[|\]$/g, "");
      docData[f].depends_on = raw
        .split(",")
        .map((s) => s.trim().replace(/["']/g, ""))
        .filter(Boolean);
    }
  }

  // 1. Check that every depends_on file actually exists
  for (const [file, data] of Object.entries(docData)) {
    for (const dep of data.depends_on) {
      if (!files.includes(dep) && !files.some((f) => f.includes(dep))) {
        issues.push({
          type: "missing_dependency",
          file,
          detail: `depends_on references "${dep}" which does not exist`,
        });
      }
    }
  }

  // 2. Check that entity names referenced in later docs appear in earlier docs
  //    Simple heuristic: extract capitalized multi-word phrases and check overlap
  const entityPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
  const entitiesByFile = {};
  for (const [file, data] of Object.entries(docData)) {
    const matches = data.content.match(entityPattern) || [];
    entitiesByFile[file] = [...new Set(matches)];
  }

  // For each file, check if entities in its depends_on docs are mentioned here
  for (const [file, data] of Object.entries(docData)) {
    for (const dep of data.depends_on) {
      const depFile = files.find((f) => f.includes(dep));
      if (!depFile || !entitiesByFile[depFile]) continue;

      const depEntities = entitiesByFile[depFile];
      const thisEntities = entitiesByFile[file] || [];

      // Find entities in dependency that are NOT referenced in this file
      // (this is informational, not necessarily an error)
      const unreferenced = depEntities.filter(
        (e) => !thisEntities.some((te) => te.includes(e) || e.includes(te))
      );

      if (unreferenced.length > 3) {
        issues.push({
          type: "entity_gap",
          file,
          detail: `${unreferenced.length} entities from ${depFile} not referenced (may be intentional): ${unreferenced.slice(0, 5).join(", ")}...`,
        });
      }
    }
  }

  // 3. Check for terminology consistency: look for variant spellings of key terms
  const allContent = Object.values(docData).map((d) => d.content).join("\n");
  const termVariants = [
    ["API", "api", "Api"],
    ["JavaScript", "Javascript", "javascript"],
    ["TypeScript", "Typescript", "typescript"],
    ["PostgreSQL", "Postgres", "postgres"],
    ["Kubernetes", "kubernetes", "K8s", "k8s"],
  ];

  for (const variants of termVariants) {
    const found = variants.filter((v) => allContent.includes(v));
    if (found.length > 1) {
      issues.push({
        type: "terminology_inconsistency",
        detail: `Multiple forms found: ${found.join(", ")} — consider standardizing`,
      });
    }
  }

  return {
    ok: issues.filter((i) => i.type !== "entity_gap").length === 0,
    files_checked: files.length,
    issues,
  };
}

// ---------------------------------------------------------------------------
// Tool: generate_index
// ---------------------------------------------------------------------------

function generateIndex() {
  const files = listDocFiles();

  if (!files.length) {
    return { ok: false, error: "No documents found in .engineering-docs/." };
  }

  const entries = [];
  for (const f of files) {
    const content = readDoc(f);
    const fm = parseFrontmatter(content);
    const title = fm?.title || extractTitle(content) || f.replace(/\.md$/, "");
    entries.push({
      file: f,
      title,
      skill: fm?.skill || "unknown",
      status: fm?.status || "unknown",
      owner_reviewed: fm?.owner_reviewed || "false",
      last_updated: fm?.last_updated || "unknown",
      depends_on: fm?.depends_on || "[]",
    });
  }

  // Build markdown index
  let md = "# Master Project Index\n\n";
  md += `Generated: ${new Date().toISOString().split("T")[0]}\n\n`;
  md += "## Document Set\n\n";
  md += "| # | Document | Status | Reviewed | Last Updated |\n";
  md += "|:--|:---------|:-------|:---------|:-------------|\n";

  entries.forEach((e, i) => {
    md += `| ${i + 1} | [${e.title}](${e.file}) | ${e.status} | ${e.owner_reviewed} | ${e.last_updated} |\n`;
  });

  md += "\n## Reading Order\n\n";
  md += "Documents should be read in the order listed above, as each builds on prior context.\n\n";

  const draft = entries.filter((e) => e.status === "draft");
  const final_ = entries.filter((e) => e.status === "final");

  md += "## Status Summary\n\n";
  md += `- **Final:** ${final_.length}\n`;
  md += `- **Draft:** ${draft.length}\n`;
  md += `- **Total:** ${entries.length}\n`;

  return { ok: true, index: md, stats: { total: entries.length, draft: draft.length, final: final_.length } };
}

// ---------------------------------------------------------------------------
// MCP JSON-RPC transport (stdio)
// ---------------------------------------------------------------------------

const TOOLS = {
  validate_document_set: {
    description: "Check that all required documents exist in .engineering-docs/ and have valid frontmatter.",
    handler: validateDocumentSet,
  },
  check_consistency: {
    description: "Verify cross-document consistency: dependency references, entity names, and terminology.",
    handler: checkConsistency,
  },
  generate_index: {
    description: "Generate a master index markdown from all documents in .engineering-docs/.",
    handler: generateIndex,
  },
};

function makeResponse(id, result) {
  return JSON.stringify({ jsonrpc: "2.0", id, result });
}

function makeError(id, code, message) {
  return JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
}

let buffer = "";

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  // Process complete messages (Content-Length framing or newline-delimited)
  let lines = buffer.split("\n");
  buffer = lines.pop(); // keep incomplete line in buffer

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let msg;
    try {
      msg = JSON.parse(trimmed);
    } catch {
      continue;
    }

    if (msg.method === "initialize") {
      process.stdout.write(
        makeResponse(msg.id, {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "engineering-docs-validator", version: "0.1.0" },
        }) + "\n"
      );
    } else if (msg.method === "notifications/initialized") {
      // No response needed
    } else if (msg.method === "tools/list") {
      process.stdout.write(
        makeResponse(msg.id, {
          tools: Object.entries(TOOLS).map(([name, t]) => ({
            name,
            description: t.description,
            inputSchema: { type: "object", properties: {} },
          })),
        }) + "\n"
      );
    } else if (msg.method === "tools/call") {
      const toolName = msg.params?.name;
      const tool = TOOLS[toolName];
      if (!tool) {
        process.stdout.write(makeError(msg.id, -32601, `Unknown tool: ${toolName}`) + "\n");
      } else {
        try {
          const result = tool.handler(msg.params?.arguments || {});
          process.stdout.write(
            makeResponse(msg.id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }) + "\n"
          );
        } catch (err) {
          process.stdout.write(makeError(msg.id, -32000, err.message) + "\n");
        }
      }
    } else if (msg.method === "ping") {
      process.stdout.write(makeResponse(msg.id, {}) + "\n");
    }
  }
});

process.stderr.write("engineering-docs validator MCP server started\n");
