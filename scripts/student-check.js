import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(projectRoot, "scripts", "baseline-manifest.json");

const requiredFiles = [
  "AGENTS.md",
  "TASK_SPEC.md",
  "AI_WORKLOG.md",
  "README.md",
  "src/receipt-policy.js",
  "src/receipt-store.js",
  "test/mission.test.js",
  "scripts/student-check.js",
  "scripts/baseline-manifest.json",
];

let structurePassed = true;

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(projectRoot, file))) {
    structurePassed = false;
    console.log(`[FAIL] 필수 파일 없음: ${file}`);
  }
}

let protectedFilesPassed = true;

if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  for (const [relativePath, expectedHash] of Object.entries(manifest.protectedFiles)) {
    const filePath = path.join(projectRoot, relativePath);

    if (!fs.existsSync(filePath)) {
      protectedFilesPassed = false;
      console.log(`[FAIL] 보호 파일 없음: ${relativePath}`);
      continue;
    }

    const actualHash = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
    if (actualHash !== expectedHash) {
      protectedFilesPassed = false;
      console.log(`[FAIL] 보호 파일 변경: ${relativePath}`);
    }
  }

  if (protectedFilesPassed) {
    console.log("[PASS] 보호 파일 변경 없음");
  }
}

if (structurePassed) {
  console.log("[PASS] 필수 파일 구조");
}

const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));
const dependencyCount = Object.keys(packageJson.dependencies ?? {}).length
  + Object.keys(packageJson.devDependencies ?? {}).length;

if (dependencyCount === 0) {
  console.log("[PASS] 외부 의존성 추가 없음");
} else {
  console.log(`[WARN] 외부 의존성 ${dependencyCount}개 발견`);
}

const testResult = spawnSync(process.execPath, ["--test", "test/mission.test.js"], {
  cwd: projectRoot,
  encoding: "utf8",
  stdio: "pipe",
});

process.stdout.write(testResult.stdout);
process.stderr.write(testResult.stderr);

if (testResult.status === 0) {
  console.log("[PASS] 전체 자동 테스트");
} else {
  console.log("[CHECK] 실패 테스트를 AI_WORKLOG.md에 기록하세요.");
}

process.exit(protectedFilesPassed ? (testResult.status ?? 1) : 1);
