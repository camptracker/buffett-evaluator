# Non-Determinism Analysis - Pinterest Runs 1-3

**Date**: 2026-03-22  
**Issue**: Three runs on identical SEC data produced different intrinsic values

## Problem Summary

| Run | Business Quality | Intrinsic Value | Delta from Run 2 |
|-----|------------------|-----------------|------------------|
| Run 1 | 26/40 | $52.64 | **+64%** |
| Run 2 | 24/40 | $32.10 | baseline |
| Run 3 | 24/40 | $36.50 | +14% |

**Root Cause**: Subjective scoring in Agent 2 (Business Quality)

---

## Discrepancy Breakdown

### Agent 2: Business Quality Scoring Variance

| Criterion | Run 1 | Run 2 | Run 3 | Variance |
|-----------|-------|-------|-------|----------|
| Simple & Understandable | 7/10 | 7/10 | 7/10 | ✅ Consistent |
| **Durable Competitive Moat** | **7/10** | **6/10** | **6/10** | ❌ 1 pt variance |
| Consistent Operating History | 5/10 | 5/10 | 5/10 | ✅ Consistent |
| **Favorable Long-Term Prospects** | **7/10** | **6/10** | **6/10** | ❌ 1 pt variance |
| **TOTAL** | **26/40** | **24/40** | **24/40** | ❌ 2 pts variance |

**Runs 2 & 3 ARE deterministic** (both got 24/40).  
**Run 1 is the outlier** (scored 2 points higher).

---

## Cascade Effect: How 2 Points Changed Everything

### 1. Business Quality Score Impact

**Run 1**: 26/40 (65%) → **"Moderate quality"** band (25-34/40)  
**Run 2/3**: 24/40 (60%) → **"Below threshold"** band (<25/40)

### 2. DCF Growth Rate Multiplier

Agent 5 uses quality score to adjust historical FCF CAGR:

**Run 1 Logic**:
```
Business Quality: 26/40 (in 25-34 range)
Financial Health: 37/50 (in 35-44 range)
→ Apply 0.80x multiplier
→ Growth rate = 13.8% CAGR × 0.80 = 11.04% ≈ 11%
```

**Run 2/3 Logic**:
```
Business Quality: 24/40 (< 25 threshold)
→ Apply 0.60x multiplier + 5% cap
→ Growth rate = 14.9% CAGR × 0.60 = 8.94%, capped at 5%
```

### 3. Final Valuation Impact

| Run | Growth Rate | Intrinsic Value | Delta |
|-----|-------------|-----------------|-------|
| Run 1 | 11% | $52.64 | +64% |
| Run 2 | 5% | $32.10 | baseline |
| Run 3 | 5% | $36.50 | +14% |

**Key Insight**: 2-point difference in Business Quality → 6% difference in growth rate → 64% difference in valuation!

---

## Why Did Run 3 Differ from Run 2?

**Both got BQ 24/40 and used 5% growth** → Why different intrinsic values?

Likely differences in other Agent 5 inputs:
- Discount rate (both should be 10%)
- Terminal growth rate
- Share count
- FCF base year

Let me check...

### Run 2 vs Run 3 Valuation Inputs

| Input | Run 2 | Run 3 | Notes |
|-------|-------|-------|-------|
| Current FCF | ? | $1,251.89M | Need to check Run 2 |
| Growth Rate | 5% | 5% | Same ✅ |
| Discount Rate | 10% | 10% | Same ✅ |
| Terminal Growth | ? | 3.5% | Need to check Run 2 |
| Shares Outstanding | ? | ? | Need to check |

**TODO**: Extract full valuation inputs from Run 2 to find the 14% variance source.

---

## Root Cause: Agent 2 Scoring Is Subjective

### Current Prompt Issues

**Prompt says:**
> **Score:** 0-10 points
> - 9-10: Wide moat with multiple sources, clear from 10-K
> - 7-8: Wide moat but single source or emerging threats noted in Risk Factors
> - 5-6: Narrow moat, some advantages but not dominant
> - 3-4: Weak moat, significant competitive threats in Risk Factors
> - 0-2: No moat, commoditized business per 10-K

**Problem**: "Wide moat with emerging threats" could be scored **7 OR 8** depending on how agent weighs the threats.

**Example from Run 1**:
> "Scored 7 rather than 8-9 because a single major platform could replicate the commerce/visual experience."

Agent chose 7. Could have chosen 6. Could have chosen 8. **Subjective judgment call.**

---

## Solution: Deterministic Scoring Rules

### Principle 1: Use Quantitative Thresholds

Instead of:
> "7-8: Wide moat but emerging threats"

Use:
> **Moat Score = Base (5 pts) + Margin Trend (0-3 pts) + Competitive Position (0-2 pts)**
> 
> **Margin Trend** (3-year):
> - +5% or more improvement: +3 pts
> - +2% to +5% improvement: +2 pts
> - Stable (±2%): +1 pt
> - Declining: 0 pts
>
> **Competitive Position** (from 10-K Risk Factors):
> - No major competitors mentioned: +2 pts
> - 1-2 major competitors mentioned: +1 pt
> - 3+ major competitors mentioned: 0 pts

### Principle 2: Tie to SEC Metrics

**Current**: Agent reads Risk Factors and "judges" the moat strength.  
**Better**: Agent counts specific metrics from SEC filings.

**Example - Durable Moat Scoring Formula**:
```
Points = Base(3) + GrossMarginTrend(0-2) + MarketPosition(0-2) + NetworkEffects(0-2) + DebtPower(0-1)

GrossMarginTrend:
  - Gross margin improved >5% over 6 years: +2
  - Gross margin improved 2-5%: +1
  - Gross margin flat or declining: 0

MarketPosition (from 10-K Risk Factors):
  - Top 3 player mentioned: +2
  - Competitive but viable: +1
  - Many competitors / commoditized: 0

NetworkEffects (if applicable from 10-K Item 1):
  - Clear network effect described: +2
  - Partial network effect: +1
  - None: 0

DebtPower (pricing power):
  - Can raise prices w/o volume loss (from MD&A): +1
  - No evidence: 0

Max score: 9 pts
Min score: 3 pts
```

This would **always** give the same score for Pinterest:
- Base: 3
- GrossMarginTrend: +2 (73.5% → 80.1% = +6.6%)
- MarketPosition: +1 (competitive but viable - Google, Meta, TikTok mentioned)
- NetworkEffects: +2 (Taste Graph explicitly described in 10-K)
- DebtPower: 0 (CPM declined 22% in 2025 per 10-K)
- **Total: 8 pts → maps to 8/10 score**

### Principle 3: Make All Ranges Objective

**For Long-Term Prospects**:

Instead of subjective "6 or 7?", use:
```
Score = IndustryGrowth(0-3) + CompanyPosition(0-3) + Headwinds(0-4)

IndustryGrowth (from 10-K MD&A):
  - Growing faster than GDP: +3
  - Growing with GDP: +2
  - Mature/slow growth: +1
  - Declining: 0

CompanyPosition:
  - Gaining market share: +3
  - Holding share: +2
  - Losing share slowly: +1
  - Losing share rapidly: 0

Headwinds (Risk Factors count):
  - 0-1 major threats: +4
  - 2-3 major threats: +3
  - 4-5 major threats: +2
  - 6+ major threats: +1

Max: 10 pts
```

---

## Recommended Fix

### Option 1: Refactor Agent 2 Prompt (High Effort)

1. Create deterministic scoring formulas for all 4 criteria
2. Test on Pinterest to verify consistent 24/40 or 26/40 result
3. Run 10 times to ensure zero variance
4. Document scoring rules in a separate SCORING-RULES.md file

**Pros**: Solves the root cause  
**Cons**: Need to design good formulas, may over-fit to specific companies

### Option 2: Add Scoring Validation Step (Medium Effort)

1. After Agent 2 runs, Agent 2.5 validates scores against formula
2. If score is off by >1 point, re-run with corrected score
3. Ensures consistency without fully rewriting prompts

**Pros**: Faster to implement  
**Cons**: Band-aid solution, doesn't fix root cause

### Option 3: Use Ensemble Voting (Low Effort)

1. Run Agent 2 three times
2. Take median score for each criterion
3. Use that as the final score

**Pros**: Easy to implement  
**Cons**: Doesn't guarantee determinism, just averages variance

---

## Immediate Action

**Run 4 Test**:
1. Run Pinterest evaluation again RIGHT NOW
2. Check if it matches Run 2/3 (24/40) or Run 1 (26/40)
3. If it's different again → variance is still present
4. If it matches Run 2/3 → we have 3 of 4 consistent, Run 1 was anomaly

**Then**:
- If variance persists → implement Option 1 (deterministic scoring)
- If Run 1 was anomaly → document and move forward with current system

---

## Long-Term Solution

**Create SCORING-FORMULAS.md**:
- Document exact formula for each criterion
- Link formulas to specific SEC metrics
- Make Agent 2 prompt reference the formulas
- Version control the formulas alongside agents

**Create Validation Test Suite**:
- Run each company 5 times
- Assert all runs produce identical scores
- CI/CD check before deploying agent updates

---

**Next Steps**:
1. Run Pinterest evaluation again (Run 4)
2. Compare Run 4 to Runs 1-3
3. Based on result, decide: refactor Agent 2 vs accept variance
