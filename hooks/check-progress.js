#!/usr/bin/env node
"use strict";

/**
 * check-progress.js — SessionStart hook for engineering-docs
 *
 * Checks whether a .engineering-docs/ folder exists in the current working
 * directory, reads index.md if present, and outputs a reminder about any
 * in-progress or draft documentation so the user can pick up where they left off.
 */

const fs = require("fs");
const path = require("path");

const DOCS_DIR = path.join(process.cwd(), ".engineering-docs");
const INDEX_FILE = path.join(DOCS_DIR, "index.md");

function run() {
  // 1. Check if .engineering-docs/ exists
  if (!fs.existsSync(DOCS_DIR)) {
    // No documentation in progress — nothing to report
    process.exit(0);
  }

  // 2. Try to read index.md
  if (!fs.existsSync(INDEX_FILE)) {
    console.log("[engineering-docs] A .engineering-docs/ folder exists but has no index.md. Run the orchestrator to initialize it.");
    process.exit(0);
  }

  const content = fs.readFileSync(INDEX_FILE, "utf8");

  // 3. Look for in-progress or draft documents
  const draftLines = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("draft") || lower.includes("in-progress") || lower.includes("in progress")) {
      draftLines.push(line.trim());
    }
  }

  // 4. Count total documents mentioned
  const docLinks = content.match(/\[.*?\]\(.*?\.md\)/g) || [];

  if (draftLines.length === 0 && docLinks.length === 0) {
    process.exit(0);
  }

  // 5. Output the reminder
  console.log("");
  console.log("[engineering-docs] Documentation in progress for this project:");
  console.log(`  - ${docLinks.length} document(s) in the index`);

  if (draftLines.length > 0) {
    console.log(`  - ${draftLines.length} item(s) still in draft or in-progress status:`);
    // Show up to 5 draft items
    for (const line of draftLines.slice(0, 5)) {
      // Strip markdown table formatting for cleaner output
      const cleaned = line.replace(/\|/g, "").replace(/\s+/g, " ").trim();
      if (cleaned) console.log(`    > ${cleaned}`);
    }
    if (draftLines.length > 5) {
      console.log(`    ... and ${draftLines.length - 5} more`);
    }
  }

  console.log("");
  console.log("  To continue, invoke the engineering-docs orchestrator — it will");
  console.log("  read the existing index and resume from where you left off.");
  console.log("");
}

run();
