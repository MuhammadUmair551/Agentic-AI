import { runToolCommand } from "../tools/command-runner.mjs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const readExceptions = async (workspaceRoot) => {
  try {
    const source = await readFile(path.join(workspaceRoot, "security-exceptions.json"), "utf8");
    const parsed = JSON.parse(source);
    const today = new Date().toISOString().slice(0, 10);
    return new Set((Array.isArray(parsed.dependencyAdvisories) ? parsed.dependencyAdvisories : [])
      .filter((entry) => typeof entry?.id === "string" && typeof entry?.expiresAt === "string" && entry.expiresAt >= today)
      .map(({ id }) => id));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return new Set();
    throw error;
  }
};

const parseJsonReport = (stdout) => {
  const start = stdout.indexOf("{");
  const end = stdout.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("pnpm audit did not return a JSON report.");
  return JSON.parse(stdout.slice(start, end + 1));
};

const toolFailure = (message, durationMs = 0, exitCode = 1) => ({
  result: { name: "dependency-audit", engine: "pnpm audit", status: "failed", exitCode, durationMs, findingCount: 0 },
  issues: [{ level: "error", rule: "security-tool-failure", tool: "pnpm audit", message }]
});

export const runDependencyScan = async ({
  workspaceRoot,
  minimumSeverity = "high",
  commandRunner = runToolCommand
}) => {
  let execution;
  try {
    execution = await commandRunner({
      command: "pnpm",
      args: ["audit", "--json", "--audit-level", minimumSeverity],
      cwd: workspaceRoot
    });
  } catch (error) {
    return toolFailure(`Required security tool pnpm audit could not start: ${error instanceof Error ? error.message : String(error)}`);
  }

  let report;
  try {
    report = parseJsonReport(execution.stdout);
  } catch (error) {
    return toolFailure(
      `pnpm audit failed without a valid report: ${error instanceof Error ? error.message : String(error)}`,
      execution.durationMs,
      execution.exitCode
    );
  }

  const exceptions = await readExceptions(workspaceRoot);
  const reportedAdvisories = Object.values(report.advisories ?? {});
  const advisories = reportedAdvisories.filter((advisory) => !exceptions.has(advisory.github_advisory_id ?? String(advisory.id ?? "unknown")));
  const issues = advisories.map((advisory) => ({
    level: "error",
    rule: "dependency-vulnerability",
    tool: "pnpm audit",
    advisoryId: advisory.github_advisory_id ?? String(advisory.id ?? "unknown"),
    severity: advisory.severity ?? "unknown",
    package: advisory.module_name ?? "unknown",
    message: `pnpm audit reported ${advisory.severity ?? "unknown"} vulnerability ${advisory.github_advisory_id ?? advisory.id ?? "unknown"} in ${advisory.module_name ?? "an installed package"}.`
  }));

  if (execution.exitCode !== 0 && issues.length === 0 && reportedAdvisories.length === 0) {
    return toolFailure("pnpm audit exited non-zero without reporting a vulnerability; registry or tool execution failed.", execution.durationMs, execution.exitCode);
  }

  return {
    result: {
      name: "dependency-audit",
      engine: "pnpm audit",
      status: issues.length === 0 ? "passed" : "failed",
      exitCode: execution.exitCode,
      durationMs: execution.durationMs,
      findingCount: issues.length
    },
    issues
  };
};
