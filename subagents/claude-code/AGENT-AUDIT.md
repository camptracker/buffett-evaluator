# Agent File Audit Report

**Date**: March 22, 2026  
**Purpose**: Ensure all agent templates use generic placeholders instead of hardcoded paths

## Audit Results ✅

### Placeholder Standards

All agent files must use these placeholders (replaced by `run.sh`):

| Placeholder | Replaced With | Example |
|-------------|---------------|---------|
| `[COMPANY]` | Company name from config.json | "Pinterest" |
| `[TICKER]` | Ticker from config.json | "PINS" |
| `[OUTPUT_FILE]` | `$OUTPUT_DIR/agent$AGENT_NUM.json` | "evaluations/PINS-run2/agent1.json" |
| `[INPUT_FILE]` | `$OUTPUT_DIR/merged-prev.json` | "evaluations/PINS-run2/merged-prev.json" |

### Agent File Status

| Agent | File | Status | Placeholders Used |
|-------|------|--------|-------------------|
| 1 | `1-data-collector.md` | ✅ PASS | [COMPANY], [TICKER], [OUTPUT_FILE] |
| 2 | `2-business-quality.md` | ✅ PASS | [INPUT_FILE], [OUTPUT_FILE] |
| 3 | `3-management-quality.md` | ✅ PASS | [INPUT_FILE], [OUTPUT_FILE] |
| 4 | `4-financial-health.md` | ✅ PASS | [INPUT_FILE], [OUTPUT_FILE] |
| 5 | `5-valuation.md` | ✅ PASS | [INPUT_FILE], [OUTPUT_FILE] |
| 6 | `6-scorecard-verdict.md` | ✅ PASS | [INPUT_FILE], [OUTPUT_FILE] |

### Changes Made

**March 22, 2026 08:42 PDT**:
- Fixed `agents/1-data-collector.md` line 194-195: Changed hardcoded `"Pinterest"` → `[COMPANY]`, `"PINS"` → `[TICKER]`
- Deleted stale files: `1-data-collector-local.md`, `1-data-collector-online-backup.md` (had hardcoded paths)

### Verification

No hardcoded company-specific paths found:
```bash
# Check for hardcoded tickers
grep -r "PINS\|NKE\|TSLA\|DPZ\|NVDA" agents/*.md
# Result: Only [TICKER] placeholders + 1 comment about Pinterest IPO date (acceptable)

# Check for hardcoded paths
grep -r "evaluations/PINS\|evaluations/NKE" agents/*.md
# Result: Clean (no matches)
```

### How It Works

1. **config.json** defines the company:
   ```json
   {
     "company": "Pinterest",
     "ticker": "PINS",
     "outputDir": "evaluations/PINS-run2"
   }
   ```

2. **run.sh** reads config and replaces placeholders:
   ```bash
   sed "s|\[COMPANY\]|$COMPANY|g" | \
   sed "s|\[TICKER\]|$TICKER|g" | \
   sed "s|\[OUTPUT_FILE\]|$OUTPUT_DIR/agent$AGENT_NUM.json|g" | \
   sed "s|\[INPUT_FILE\]|$OUTPUT_DIR/merged-prev.json|g"
   ```

3. **Agent runs** with fully qualified paths:
   - Input: `evaluations/PINS-run2/merged-prev.json`
   - Output: `evaluations/PINS-run2/agent2.json`

### Scalability Confirmed ✅

This architecture supports:
- ✅ Multiple runs of same company: `PINS-run2`, `PINS-run3`, etc.
- ✅ Different companies: `NVDA`, `AAPL`, `GOOGL`, etc.
- ✅ Different output directories: `../evaluations/`, `./test-runs/`, etc.

**Just change config.json** → everything else adapts automatically.

## Best Practices Going Forward

1. **Never hardcode company names** in agent templates
2. **Always use placeholders**: `[COMPANY]`, `[TICKER]`, `[OUTPUT_FILE]`, `[INPUT_FILE]`
3. **Test with different config.json** before committing changes
4. **Delete backup/temp files** (`*-local.md`, `*-backup.md`) that bypass placeholder system

---

**Audit Status**: ✅ ALL CLEAR  
**Last Updated**: 2026-03-22 08:42 PDT
