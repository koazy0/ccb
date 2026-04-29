# ccb

Claude Code token usage breakdown report — 一行命令查看你的 Claude Code 用量明细。

基于 [ccusage](https://github.com/ryaker/ccusage) 生成 JSON 数据，输出终端汇总表 + 详细 Markdown 报告。

## 依赖

- [Bun](https://bun.sh) >= 1.0
- [ccusage](https://github.com/ryaker/ccusage)（通过 `bunx` 自动拉取）

## 安装

```bash
# 直接运行
bun run ccb.ts

# 或者安装到全局
bun install -g .
ccb
```

## 使用

```bash
# 默认：查看 2026-04-21 至今的用量
ccb

# 传递额外 ccusage 参数（如指定用户、路径等）
ccb --user myuser
ccb --project /path/to/project
```

## 输出示例

### 终端表格

```
        Date |        Input |       Output |    CacheCreate |      CacheRead |          Total
-------------+--------------+--------------+----------------+----------------+---------------
  2026-04-21 |       9,602K |       1,582K |             0K |       241,972K |       253,156K
  2026-04-22 |       4,362K |         515K |             0K |        82,510K |        87,387K
  2026-04-23 |       3,431K |         456K |             0K |        61,248K |        65,135K
-------------+--------------+--------------+----------------+----------------+---------------
       Total |      17,395K |       2,553K |             0K |       385,730K |       405,678K

Report saved to /tmp/ccb.md
```

### Markdown 报告 (`/tmp/ccb.md`)

报告包含：

- **Daily Summary** — 每日 input / output / cacheCreate / cacheRead / total
- **Model Breakdown by Day** — 每日各模型（glm-5.1、kimi-for-coding 等）的分项用量
- **Model Totals** — 跨天汇总，按总用量排序

示例片段：

```markdown
## Model Totals (All Days)

| Model | Input | Output | CacheCreate | CacheRead | Total |
| --- | --- | --- | --- | --- | --- |
| kimi-for-coding | 525,206K | 8,328K | 2,709K | 3,851,102K | 4,387,344K |
| glm-5.1 | 18,422K | 2,523K | 0K | 594,627K | 615,572K |
| deepseek-v4-pro | 8,802K | 1,781K | 0K | 495,257K | 505,840K |
```

## 自定义起始日期

编辑 `ccb.ts` 中的 `--since` 参数：

```typescript
const args = ["ccusage", "-b", "--since", "20260421", "--mode", "display", "-j", ...extra];
```

## License

[MIT](LICENSE)
