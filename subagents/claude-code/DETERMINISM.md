# Deterministic Evaluation Guide

## Overview

**Goal:** Evaluations must be reproducible. Running the same evaluation twice should produce identical results.

**Why:** Ensures our analysis is objective, not random. Prevents model variance from affecting scores.

---

## How It Works

### Deterministic Evaluation Workflow

```
1. Run full evaluation (Agents 1-6) → Output 1
2. Run full evaluation again (Agents 1-6) → Output 2
3. Compare Output 1 vs Output 2
   ├─ MATCH → Success ✅
   └─ MISMATCH → Retry (up to 5 attempts total)
```

**Success criteria:** Two consecutive runs produce identical outputs.

**Retry policy:** If mismatch, retry up to 5 times. Fail if still no match.

---

## Usage

### Quick Start

```bash
cd ~/Documents/buffett-evaluator/subagents/claude-code

# 1. Configure company
cat > config.json << 'EOF'
{
  "company": "Apple",
  "ticker": "AAPL",
  "outputDir": "../../evaluations/AAPL"
}
EOF

# 2. Run deterministic evaluation
./eval-deterministic.sh
```

### What Happens

```
Attempt 1:
  Run 1/2: Full evaluation (Agents 1-6) → run1-attempt1.json
  Run 2/2: Full evaluation (Agents 1-6) → run2-attempt1.json
  Compare: run1 vs run2
    ├─ MATCH → Success! ✅
    └─ MISMATCH → Continue to Attempt 2

Attempt 2:
  Run 1/2: Full evaluation → run1-attempt2.json
  Run 2/2: Full evaluation → run2-attempt2.json
  Compare: run1 vs run2
    ├─ MATCH → Success! ✅
    └─ MISMATCH → Continue to Attempt 3

... (up to 5 attempts)
```

---

## Output Files

### Success (Match)

```
evaluations/AAPL/
├── final.json                        ← Final deterministic output
└── determinism/
    ├── run1-attempt1.json            ← First run
    ├── run2-attempt1.json            ← Second run (matches first)
    ├── comparison-attempt1.txt       ← Comparison log (MATCH)
    └── summary.txt                   ← Summary report
```

### Failure (No Match After 5 Attempts)

```
evaluations/AAPL/
└── determinism/
    ├── run1-attempt1.json
    ├── run2-attempt1.json
    ├── comparison-attempt1.txt       ← Differences found
    ├── diff-report.json              ← Detailed diff
    ├── run1-attempt2.json
    ├── run2-attempt2.json
    ├── comparison-attempt2.txt
    ├── ... (up to attempt 5)
    └── summary.txt                   ← Failure report
```

---

## Comparison Logic

### What Gets Compared

**Included:**
- All financial data (EPS, FCF, ROE, debt, margins, etc.)
- All qualitative analysis (moat, management, industry)
- All scores (business quality, management, financial health, valuation)
- All calculated metrics (CAGR, ROE averages, debt ratios)
- Final verdict and summary

**Excluded (normalized out):**
- Timestamps (`timestamp`, `analysisDate`)
- Agent metadata (`agentId`, `agentName`)

### Tolerance

- **Exact match required** for strings, booleans, integers
- **Floating point tolerance:** <0.01% difference allowed (for rounding)

### Example

```javascript
// MATCH (within tolerance)
Run 1: ROE = 20.0%
Run 2: ROE = 20.0%  ✅

// MATCH (floating point tolerance)
Run 1: ROE = 20.000123%
Run 2: ROE = 20.000124%  ✅ (difference <0.01%)

// MISMATCH
Run 1: ROE = 20.0%
Run 2: ROE = 20.5%  ❌ (difference 0.5%)
```

---

## Debugging Non-Deterministic Results

### Step 1: Review Diff Report

```bash
cat evaluations/AAPL/determinism/diff-report.json | jq
```

**Look for:**
- Which fields are different?
- Are differences consistent across attempts?
- Are differences in calculations or source data?

### Step 2: Check Comparison Logs

```bash
cat evaluations/AAPL/determinism/comparison-attempt1.txt
```

**Example output:**
```
❌ MISMATCH: Found 3 difference(s)

Difference Summary:
  value_mismatch: 3 occurrence(s)

Details:
1. Path: data.financialData.eps.rows[0][1]
   Type: value_mismatch
   File 1: "5.00"
   File 2: "5.01"
```

### Step 3: Identify Root Cause

**Common causes:**

#### 1. **Live Data Fetching**
Agent prompt says "get latest stock price" → different on each run

**Fix:** Use specific filing dates, not "latest"

#### 2. **Current Date References**
Agent calculates "as of today" → different timestamps

**Fix:** Use fixed reference date from config

#### 3. **Rounding Inconsistency**
Agent rounds differently each time (e.g., 20.005% → 20.0% or 20.01%)

**Fix:** Specify rounding precision in agent prompt

#### 4. **Non-Deterministic Language**
Agent uses "approximately", "about", "roughly" → varies

**Fix:** Require exact numbers from SEC filings

#### 5. **Model Randomness**
Claude Code has inherent randomness in responses

**Fix:** Add temperature=0 if possible, or more specific prompts

### Step 4: Fix Agent Prompts

**Bad (non-deterministic):**
```markdown
Get the latest stock price for the company.
Calculate ROE for recent years.
Estimate the industry growth rate.
```

**Good (deterministic):**
```markdown
Extract stock price from the most recent 10-Q filing (as of [DATE]).
Calculate ROE using data from 10-K filings 2015-2025.
Extract industry growth rate from 10-K MD&A (cite specific section).
```

### Step 5: Retest

```bash
./eval-deterministic.sh
```

---

## Best Practices for Deterministic Agents

### 1. **Use Specific Filing References**

❌ Bad:
```
"Get the current stock price"
```

✅ Good:
```
"Extract stock price from 10-Q filed 2026-01-15, page 42"
```

### 2. **Specify Calculation Precision**

❌ Bad:
```
"Calculate ROE"
```

✅ Good:
```
"Calculate ROE = Net Income / Shareholder Equity, round to 2 decimal places"
```

### 3. **Avoid Relative Time References**

❌ Bad:
```
"Most recent year"
"Latest filing"
"Current quarter"
```

✅ Good:
```
"2024 fiscal year"
"10-K filed 2025-02-15"
"Q4 2024"
```

### 4. **Use Exact SEC Data**

❌ Bad:
```
"Estimate the margin based on industry averages"
```

✅ Good:
```
"Extract Net Margin from 10-K Income Statement, line 'Net Income / Revenue'"
```

### 5. **Specify Rounding Rules**

Add to all agent prompts:
```markdown
## Rounding Rules
- Percentages: Round to 1 decimal place (e.g., 20.1%)
- Dollar amounts: Round to nearest million (e.g., $5,234M)
- Ratios: Round to 2 decimal places (e.g., 2.15x)
```

---

## Monitoring Determinism

### Success Rate Tracking

Keep a log of determinism success:

```bash
# After each evaluation
echo "$(date),AAPL,SUCCESS,1" >> determinism-log.csv
echo "$(date),TSLA,FAILURE,5" >> determinism-log.csv
```

**Format:** `date,ticker,result,attempts`

### Target Metrics

- **Success rate:** >95% of evaluations should match on first attempt
- **Retry rate:** <5% should require retry
- **Failure rate:** <1% should fail after 5 attempts

### Investigation Threshold

If >10% of evaluations fail determinism check → investigate agent prompts for systemic issues.

---

## Troubleshooting

### Issue: Run 1 and Run 2 always differ slightly

**Likely cause:** Model randomness

**Solution:**
1. Make agent prompts more specific
2. Reduce open-ended instructions
3. Require exact data extraction (no inference)

### Issue: Differences only in certain fields

**Likely cause:** Specific agent has non-deterministic logic

**Solution:**
1. Check diff-report.json to identify which fields differ
2. Trace back to which agent produces those fields
3. Review that agent's prompt for non-deterministic instructions

### Issue: All attempts fail (5/5)

**Likely cause:** Fundamental non-determinism in agent logic

**Solution:**
1. Review all agent prompts for:
   - "latest", "current", "recent" keywords
   - Calculation rounding inconsistencies
   - Open-ended inference tasks
2. Rewrite agents to be more deterministic
3. Consider fixing data source (e.g., download SEC filings once, reuse)

---

## Advanced: Pre-fetching Data

For maximum determinism, pre-fetch all SEC filings before evaluation:

```bash
# Download all filings once
./fetch-sec-filings.sh AAPL > sec-cache/AAPL/

# Point Agent 1 to local cache (not live SEC.gov)
# This guarantees same data on every run
```

**Trade-off:** More setup, but 100% deterministic.

---

## Validation Checklist

Before deploying an evaluation:

- [ ] Ran `./eval-deterministic.sh`
- [ ] Two consecutive runs matched
- [ ] Reviewed determinism/summary.txt
- [ ] No differences in diff-report.json
- [ ] Evaluation completed in ≤2 attempts

---

## Example Session

```bash
$ ./eval-deterministic.sh

╔════════════════════════════════════════════════════════════════════╗
║         DETERMINISTIC BUFFETT EVALUATION                          ║
╚════════════════════════════════════════════════════════════════════╝

Company: Apple (AAPL)
Output: ../../evaluations/AAPL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Attempt 1 of 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 Run 1/2: Executing full evaluation...
✅ Run 1 complete

🔄 Run 2/2: Executing full evaluation again...
✅ Run 2 complete

🔍 Comparing outputs...

╔════════════════════════════════════════════════════════════════════╗
║                  ✅ DETERMINISTIC MATCH                            ║
╚════════════════════════════════════════════════════════════════════╝

Both runs produced identical results.
Evaluation is deterministic after 1 attempt(s).

📄 Summary saved: ../../evaluations/AAPL/determinism/summary.txt

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Next steps:
  1. Review: jq . ../../evaluations/AAPL/final.json | less
  2. Convert: node convert-to-website.js AAPL
  3. Validate: cd ../.. && node validate-data.js
  4. Deploy: git add -A && git commit -m 'Add AAPL evaluation' && git push
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

**Deterministic evaluations ensure objective, reproducible analysis.**

No randomness. No variance. Just consistent, verifiable results. 🎯
