import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

function printHelp() {
  console.log(`用法:
  node scripts/resume-publish.mjs <简历文件路径> [--out-dir generated/resume-import]

说明:
  该命令会顺序执行以下步骤：
  1. 导入 PDF / TXT 简历
  2. 将导入结果合并进正式 resume-source
  3. 校验简历 schema
  4. 构建站点

注意:
  - 该命令不会执行 git add / commit / push
  - 如果合并、校验或构建失败，当前工作区改动会保留，方便继续检查
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
    if (!options.input) {
      options.input = path.resolve(arg);
      continue;
    }

    throw new Error(`无法识别的参数: ${arg}`);
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

  console.log("[resume:publish] 开始执行一键流程");
  console.log(`- 输入文件: ${options.input}`);
  console.log(`- 输入类型: ${inputKind}`);
  console.log(`- 输出目录: ${options.outDir}`);
  console.log("- Git 操作: 已禁用（不会提交或推送）");

  if (inputKind === "pdf") {
    await runCommand(
      options.python,
      ["scripts/import-resume-pdf.py", options.input, "--out-dir", options.outDir, "--node", options.node],
      "导入 PDF 简历",
    );
  } else {
    await runCommand(
      options.node,
      ["scripts/import-resume-text.mjs", options.input, "--out-dir", options.outDir, "--stem", path.parse(options.input).name],
      "导入文本简历",
    );
  }

  await runCommand(
    options.node,
    ["scripts/merge-imported-resume.mjs", "--input", mergeInput, "--write"],
    "合并导入结果到正式数据",
  );

  if (!options.skipValidate) {
    await runCommand(
      options.node,
      ["scripts/validate-resume-schema.mjs"],
      "校验简历 schema",
    );
  }

  if (!options.skipBuild) {
    const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
    await runCommand(
      npmCommand,
      ["run", "build"],
      "构建站点",
    );
  }

  console.log("\n[resume:publish] 流程执行完成");
  console.log("- 已完成导入、合并、校验和构建");
  console.log("- 当前未执行任何 Git 提交或推送");
  console.log("- 现在可以先本地查看效果，再决定是否继续提交");
}

main().catch((error) => {
  console.error(`\n[resume:publish] 执行失败: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
