#!/usr/bin/env node
// Validate AIL manifests against the v0.1 schema.
// Usage: node scripts/validate.mjs [file.json ...]   (defaults to examples/*.json)
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const here = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(readFileSync(join(here, "../schema/ail-v0.1.schema.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

let files = process.argv.slice(2);
if (files.length === 0) {
  const dir = join(here, "../examples");
  files = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => join(dir, f));
}

let failed = 0;
for (const file of files) {
  const data = JSON.parse(readFileSync(file, "utf8"));
  if (validate(data)) {
    console.log(`✓ ${file}`);
  } else {
    failed++;
    console.log(`✗ ${file}`);
    for (const e of validate.errors) console.log(`    ${e.instancePath || "/"} ${e.message}`);
  }
}
process.exit(failed ? 1 : 0);
