#!/usr/bin/env bun

import { spawnSync } from "child_process";
import { writeFileSync } from "fs";

interface ModelBreakdown {
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
}

interface DailyEntry {
  date: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  modelBreakdowns: ModelBreakdown[];
}

interface UsageData {
  daily: DailyEntry[];
  totals: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    totalTokens: number;
  };
}

function toK(n: number): string {
  return Math.round(n / 1000).toLocaleString("en-US") + "K";
}

function mdRow(cells: string[]): string {
  return "| " + cells.join(" | ") + " |";
}

function mdTable(headers: string[], rows: string[][]): string {
  return [
    mdRow(headers),
    mdRow(headers.map(() => "---")),
    ...rows.map(mdRow),
  ].join("\n");
}

function modelTotal(m: ModelBreakdown): number {
  return m.inputTokens + m.outputTokens + m.cacheCreationTokens + m.cacheReadTokens;
}

function main() {
  const extra = process.argv.slice(2);
  const args = ["ccusage", "-b", "--since", "20260421", "--mode", "display", "-j", ...extra];
  const result = spawnSync("bunx", args, {
    encoding: "utf-8",
    maxBuffer: 50 * 1024 * 1024,
  });

  if (result.error) {
    console.error("Failed to run ccusage:", result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error("ccusage exited with code", result.status);
    console.error(result.stderr);
    process.exit(1);
  }

  const data: UsageData = JSON.parse(result.stdout);

  // Terminal summary
  const headers = ["Date", "Input", "Output", "CacheCreate", "CacheRead", "Total"];
  const widths = [12, 12, 12, 14, 14, 14];
  const pad = (s: string, len: number) => s.padStart(len);

  console.log(headers.map((h, i) => pad(h, widths[i])).join(" | "));
  console.log(widths.map((w) => "-".repeat(w)).join("-+-"));

  for (const day of data.daily) {
    const row = [
      day.date,
      toK(day.inputTokens),
      toK(day.outputTokens),
      toK(day.cacheCreationTokens),
      toK(day.cacheReadTokens),
      toK(day.totalTokens),
    ];
    console.log(row.map((cell, i) => pad(cell, widths[i])).join(" | "));
  }

  const t = data.totals;
  const totalRow = [
    "Total",
    toK(t.inputTokens),
    toK(t.outputTokens),
    toK(t.cacheCreationTokens),
    toK(t.cacheReadTokens),
    toK(t.totalTokens),
  ];
  console.log(widths.map((w) => "-".repeat(w)).join("-+-"));
  console.log(totalRow.map((cell, i) => pad(cell, widths[i])).join(" | "));

  // Build markdown report
  const lines: string[] = [];
  lines.push("# CCB Usage Report");
  lines.push("");

  // Daily summary
  lines.push("## Daily Summary");
  lines.push("");
  const summaryHeaders = ["Date", "Input", "Output", "CacheCreate", "CacheRead", "Total"];
  const summaryRows = data.daily.map((d) => [
    d.date,
    toK(d.inputTokens),
    toK(d.outputTokens),
    toK(d.cacheCreationTokens),
    toK(d.cacheReadTokens),
    toK(d.totalTokens),
  ]);
  summaryRows.push([
    "**Total**",
    toK(t.inputTokens),
    toK(t.outputTokens),
    toK(t.cacheCreationTokens),
    toK(t.cacheReadTokens),
    toK(t.totalTokens),
  ]);
  lines.push(mdTable(summaryHeaders, summaryRows));
  lines.push("");

  // Daily model breakdown
  lines.push("## Model Breakdown by Day");
  lines.push("");
  for (const day of data.daily) {
    lines.push(`### ${day.date}`);
    lines.push("");
    const modelHeaders = ["Model", "Input", "Output", "CacheCreate", "CacheRead", "Total"];
    const modelRows = day.modelBreakdowns
      .slice()
      .sort((a, b) => modelTotal(b) - modelTotal(a))
      .map((m) => [
        m.modelName,
        toK(m.inputTokens),
        toK(m.outputTokens),
        toK(m.cacheCreationTokens),
        toK(m.cacheReadTokens),
        toK(modelTotal(m)),
      ]);
    lines.push(mdTable(modelHeaders, modelRows));
    lines.push("");
  }

  // Overall model totals
  const modelTotals = new Map<string, { input: number; output: number; cacheCreate: number; cacheRead: number }>();
  for (const day of data.daily) {
    for (const m of day.modelBreakdowns) {
      const prev = modelTotals.get(m.modelName) || { input: 0, output: 0, cacheCreate: 0, cacheRead: 0 };
      prev.input += m.inputTokens;
      prev.output += m.outputTokens;
      prev.cacheCreate += m.cacheCreationTokens;
      prev.cacheRead += m.cacheReadTokens;
      modelTotals.set(m.modelName, prev);
    }
  }
  const sortedModels = Array.from(modelTotals.entries()).sort((a, b) => {
    const totalA = a[1].input + a[1].output + a[1].cacheCreate + a[1].cacheRead;
    const totalB = b[1].input + b[1].output + b[1].cacheCreate + b[1].cacheRead;
    return totalB - totalA;
  });

  lines.push("## Model Totals (All Days)");
  lines.push("");
  const totalModelHeaders = ["Model", "Input", "Output", "CacheCreate", "CacheRead", "Total"];
  const totalModelRows = sortedModels.map(([name, m]) => [
    name,
    toK(m.input),
    toK(m.output),
    toK(m.cacheCreate),
    toK(m.cacheRead),
    toK(m.input + m.output + m.cacheCreate + m.cacheRead),
  ]);
  lines.push(mdTable(totalModelHeaders, totalModelRows));
  lines.push("");

  writeFileSync("/tmp/ccb.md", lines.join("\n"));
  console.log("\nReport saved to /tmp/ccb.md");
}

main();
