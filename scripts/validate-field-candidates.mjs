import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { buildFieldCandidateValidationReport } from "./lib/resume-parser/field-candidate-validation.ts";

function parseArgs(argv) {
  const options = {
    input: undefined,
    out: undefined,
    failOnError: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--out") {
      options.out = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--fail-on-error") {
      options.failOnError = true;
      continue;
    }
    if (!options.input) {
      options.input = path.resolve(arg);
    }
  }

  if (!options.input) {
    throw new Error("Usage: node scripts/validate-field-candidates.mjs <field-candidates.json> [--out report.json] [--fail-on-error]");
  }

  return options;
}

function toDefaultOutPath(inputPath) {
  const directory = path.dirname(inputPath);
  const fileName = path.basename(inputPath);
  if (fileName.endsWith(".field-candidates.json")) {
    return path.join(directory, fileName.replace(/\.field-candidates\.json$/, ".field-candidate-validation-report.json"));
  }

  return path.join(directory, `${path.basename(inputPath, path.extname(inputPath))}.field-candidate-validation-report.json`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const raw = await fs.readFile(options.input, "utf8");
  const fieldCandidates = JSON.parse(raw);
  const report = buildFieldCandidateValidationReport(fieldCandidates, {
    fieldCandidatesPath: options.input,
  });
  const outPath = options.out ?? toDefaultOutPath(options.input);

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Validated field candidates: ${options.input}`);
  console.log(`- field candidate validation report: ${outPath}`);
  console.log(`- errors: ${report.stats.errorCount}`);
  console.log(`- warnings: ${report.stats.warningCount}`);

  const previewIssues = report.issues.slice(0, 8);
  if (previewIssues.length > 0) {
    console.log("Top issues:");
    previewIssues.forEach((issue) => {
      console.log(`- [${issue.level}] ${issue.code} @ ${issue.path}: ${issue.message}`);
    });
  }

  if (options.failOnError && report.stats.errorCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
