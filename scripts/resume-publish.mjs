import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const DEFAULT_SOURCE_TARGET = path.resolve("src/data/resume-source.ts");

function printHelp() {
  console.log(`用法:
  node scripts/resume-publish.mjs <简历文件路径> [--out-dir generated/resume-import]

说明:
  默认执行新链路：
  1. 导入 PDF / TXT 简历，并产出 parsed-candidate / validation / field-candidates
  2. 用 safe merge 将新链路结果合并进正式 resume-source
  3. 校验简历 schema
  4. 构建站点

可选项:
  --use-ai-structure    导入时启用 AI 结构解析
  --use-ai-fields       导入时启用 AI 字段候选
  --legacy-pipeline     回退到旧 merge 模式
  --dry-run-merge       只执行导入和 merge dry-run，不写正式 source
  --merge-target <path> 将 merge 写入自定义目标文件
  --merge-report <path> 自定义 merge report 输出路径
  --backup-dir <path>   自定义 merge 备份目录
  --allow-risky-profile 允许 merge 高风险 profile 字段

注意:
  - 该命令不会执行 git add / commit / push
  - 默认 merge 模式是 safe
  - 如果指定自定义 merge target，schema 校验会针对该目标执行，但 build 默认跳过
`);
}

function parseArgs(argv) {
  const options = {
    input: undefined,
    outDir: path.resolve("generated/resume-import"),
    node: process.execPath,
    python: process.env.PYTHON || "python",
    skipBuild: false,
    skipValidate: false,
    useAiStructure: false,
    useAiFields: false,
    legacyPipeline: false,
    dryRunMerge: false,
    allowRiskyProfile: false,
    mergeTarget: DEFAULT_SOURCE_TARGET,
    mergeReport: undefined,
    backupDir: undefined,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--out-dir") {
      options.outDir = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--node") {
      options.node = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--python") {
      options.python = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--skip-build") {
      options.skipBuild = true;
      continue;
    }
    if (arg === "--skip-validate") {
      options.skipValidate = true;
      continue;
    }
    if (arg === "--use-ai-structure") {
      options.useAiStructure = true;
      continue;
    }
    if (arg === "--use-ai-fields") {
      options.useAiFields = true;
      continue;
    }
    if (arg === "--legacy-pipeline") {
      options.legacyPipeline = true;
      continue;
    }
    if (arg === "--dry-run-merge") {
      options.dryRunMerge = true;
      continue;
    }
    if (arg === "--allow-risky-profile") {
      options.allowRiskyProfile = true;
      continue;
    }
    if (arg === "--merge-target") {
      options.mergeTarget = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--merge-report") {
      options.mergeReport = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--backup-dir") {
      options.backupDir = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (!options.input) {
      options.input = path.resolve(arg);
      continue;
    }

    throw new Error(`无法识别的参数: ${arg}`);
  }

  if (options.legacyPipeline && (options.useAiStructure || options.useAiFields)) {
    throw new Error("--legacy-pipeline 不能和 --use-ai-structure / --use-ai-fields 同时使用。");
  }

  return options;
}

function inferInputKind(inputPath) {
  const extension = path.extname(inputPath).toLowerCase();
  if (extension === ".pdf") {
    return "pdf";
  }
  if (extension === ".txt" || extension === ".md") {
    return "text";
  }
  throw new Error(`暂不支持的简历文件类型: ${extension || "<无扩展名>"}。当前仅支持 .pdf / .txt / .md`);
}

function runCommand(command, args, label) {
  return new Promise((resolve, reject) => {
    console.log(`\n[resume:publish] ${label}`);
    console.log(`> ${command} ${args.map((item) => (item.includes(" ") ? `"${item}"` : item)).join(" ")}`);

    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${label} 失败，退出码: ${code ?? "unknown"}`));
    });
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  if (!options.input) {
    printHelp();
    throw new Error("缺少简历文件路径。");
  }

  const inputKind = inferInputKind(options.input);
  const mergeInput = path.join(options.outDir, `${path.parse(options.input).name}.resume-source.json`);
  const mergeMode = options.legacyPipeline ? "legacy" : "safe";
  const usesCustomMergeTarget = path.resolve(options.mergeTarget) !== DEFAULT_SOURCE_TARGET;
  const effectiveMergeTarget = options.dryRunMerge && usesCustomMergeTarget && !fs.existsSync(options.mergeTarget)
    ? DEFAULT_SOURCE_TARGET
    : options.mergeTarget;

  console.log("[resume:publish] 开始执行一键流程");
  console.log(`- 输入文件: ${options.input}`);
  console.log(`- 输入类型: ${inputKind}`);
  console.log(`- 输出目录: ${options.outDir}`);
  console.log(`- merge 模式: ${mergeMode}`);
  console.log(`- merge 写入: ${options.dryRunMerge ? "dry-run" : effectiveMergeTarget}`);
  console.log("- Git 操作: 已禁用（不会提交或推送）");

  if (inputKind === "pdf") {
    const importArgs = ["scripts/import-resume-pdf.py", options.input, "--out-dir", options.outDir, "--node", options.node];
    if (!options.legacyPipeline || options.useAiStructure || options.useAiFields) {
      importArgs.push("--emit-candidate");
    }
    if (options.useAiStructure) {
      importArgs.push("--use-ai-structure");
    }
    if (options.useAiFields) {
      importArgs.push("--use-ai-fields");
    }
    await runCommand(options.python, importArgs, "导入 PDF 简历");
  } else {
    const importArgs = ["scripts/import-resume-text.mjs", options.input, "--out-dir", options.outDir, "--stem", path.parse(options.input).name];
    if (!options.legacyPipeline || options.useAiStructure || options.useAiFields) {
      importArgs.push("--emit-candidate");
    }
    if (options.useAiStructure) {
      importArgs.push("--use-ai-structure");
    }
    if (options.useAiFields) {
      importArgs.push("--use-ai-fields");
    }
    await runCommand(options.node, importArgs, "导入文本简历");
  }

  const mergeArgs = [
    "scripts/merge-imported-resume.mjs",
    "--input", mergeInput,
    "--mode", mergeMode,
    "--target", effectiveMergeTarget,
  ];
  if (options.mergeReport) {
    mergeArgs.push("--report-out", options.mergeReport);
  }
  if (options.backupDir) {
    mergeArgs.push("--backup-dir", options.backupDir);
  }
  if (options.allowRiskyProfile) {
    mergeArgs.push("--allow-risky-profile");
  }
  if (!options.dryRunMerge) {
    mergeArgs.push("--write");
  }

  await runCommand(options.node, mergeArgs, options.dryRunMerge ? "执行 merge dry-run" : "合并导入结果到正式数据");

  if (options.dryRunMerge) {
    console.log("\n[resume:publish] 已完成导入和 merge dry-run");
    console.log("- 当前未写入正式 source");
    console.log("- 可直接查看 merge report 后再决定是否执行正式写入");
    return;
  }

  if (!options.skipValidate) {
    const validateArgs = ["scripts/validate-resume-schema.mjs"];
    if (usesCustomMergeTarget) {
      validateArgs.push("--source", effectiveMergeTarget);
    }
    await runCommand(options.node, validateArgs, "校验简历 schema");
  }

  if (!options.skipBuild) {
    if (usesCustomMergeTarget) {
      console.log("\n[resume:publish] 跳过 build");
      console.log("- 原因: 当前使用了自定义 merge target，站点构建不会消费该目标文件");
    } else {
      const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
      await runCommand(npmCommand, ["run", "build"], "构建站点");
    }
  }

  console.log("\n[resume:publish] 流程执行完成");
  console.log("- 已完成导入、merge、schema 校验和构建步骤");
  console.log("- 当前未执行任何 Git 提交或推送");
  console.log("- 现在可以先本地查看效果，再决定是否继续提交");
}

main().catch((error) => {
  console.error(`\n[resume:publish] 执行失败: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});


