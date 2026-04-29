# ccb

**Claude Code Better Usage Board** — 一个更好用的 Claude Code token 用量看板。

## 为什么写这个

[ccusage](https://github.com/ryaker/ccusage) 能统计 Claude Code 用量，但终端表格渲染在窄屏下会截断，多模型数据混在一起不好读。ccb 调用 ccusage 的 JSON 输出，重新排版为：

- 对齐的终端汇总表（不再截断）
- 完整的 Markdown 报告（按日 + 按模型分项），保存到 `/tmp/ccb.md`

## 依赖

- [Bun](https://bun.sh) >= 1.0
- [ccusage](https://github.com/ryaker/ccusage)（`bunx` 自动拉取）

## 安装

```bash
# 克隆后直接运行
git clone https://github.com/xhzq233/ccb.git
cd ccb
bun run ccb.ts

# 或装到 PATH 里
cp ccb.ts /usr/local/bin/ccb
chmod +x /usr/local/bin/ccb
ccb
```

## 使用

```bash
# 默认：查看 2026-04-21 至今的用量
ccb

# 指定起始日期
ccb --since 2026-04-25
ccb --since 2026-04-01

# 传递额外 ccusage 参数
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
- **Model Breakdown by Day** — 每日各模型的分项用量
- **Model Totals** — 跨天汇总，按总用量排序

```markdown
## Model Totals (All Days)

| Model | Input | Output | CacheCreate | CacheRead | Total |
| --- | --- | --- | --- | --- | --- |
| kimi-for-coding | 525,206K | 8,328K | 2,709K | 3,851,102K | 4,387,344K |
| glm-5.1 | 18,422K | 2,523K | 0K | 594,627K | 615,572K |
| deepseek-v4-pro | 8,802K | 1,781K | 0K | 495,257K | 505,840K |
```

## License

[MIT](LICENSE)
