# How to Evaluate a Company - Complete Workflow

## The Full Prompt

**Location:** `buffett-eval-prompt.md` (9.7KB, 52 pages)

This is Warren Buffett's complete 13-criteria investment framework as a copy-paste prompt for Claude.

---

## Step-by-Step Workflow

### 1. Open the Prompt

```bash
# View the full prompt
cat ~/Documents/buffett-evaluator/buffett-eval-prompt.md

# Or open in your editor
open ~/Documents/buffett-evaluator/buffett-eval-prompt.md
```

---

### 2. Copy the Entire Prompt

The prompt starts with:
```
# Buffett Company Evaluation — Master Prompt

Copy and paste this entire prompt into a new Claude conversation...
```

**Select everything** and copy to clipboard.

---

### 3. Customize for Your Company

Find and replace these placeholders:
- `[COMPANY NAME]` → e.g., "Tesla"
- `[TICKER]` → e.g., "TSLA"

Example:
```
You are evaluating **Tesla (TSLA)** using Buffett's framework...
```

---

### 4. Paste into Claude

Open a **new conversation** in Claude (web, desktop, or API) and paste the customized prompt.

---

### 5. Claude Executes the Framework

Claude will:
1. **Phase 1:** Document research methodology (13 data sources)
2. **Phase 2:** Gather financial data (7 tables + 4 qualitative sections)
3. **Phase 3:** Evaluate using Buffett's framework
   - Business Quality (4 criteria)
   - Management Quality (3 criteria)
   - Financial Health (5 criteria)
   - Intrinsic Value (DCF calculation)
   - Scorecard (13 criteria, 130 points)
   - Final Verdict

**Output:** Complete evaluation (typically 15-25 pages)

---

### 6. Convert to JSON

Take Claude's output and structure it into the JSON format.

**Template structure:**
```json
{
  "name": "Company Name",
  "ticker": "TICK",
  "industry": "...",
  "analysisDate": "March 21, 2026",
  "currentPrice": 100.00,
  "intrinsicValue": 120.00,
  "marginOfSafety": "+20%",
  "verdict": "BUY",
  "score": 95,
  "oneParagraphSummary": "...",
  "financialData": { ... },
  "qualitativeAnalysis": { ... },
  "businessQuality": { ... },
  "managementQuality": { ... },
  "financialHealth": { ... },
  "intrinsicValueCalculation": { ... },
  "scorecard": { ... },
  "finalVerdict": { ... }
}
```

**Save as:** `data/[ticker].json` (e.g., `data/tsla.json`)

---

### 7. Validate the Data

Run the validation suite:

```bash
cd ~/Documents/buffett-evaluator

# Check formulas and calculations
node validate-data.js
```

**Fix any errors reported:**
- Scorecard total arithmetic
- Margin of safety calculation
- EPS growth rates
- Debt metrics

**Auto-fix scorecard totals:**
```bash
node fix-scorecards.js
```

---

### 8. Register the Company

Add to `script.js`:

```javascript
const companies = {
    nike: 'data/nike.json',
    pinterest: 'data/pinterest.json',
    dominos: 'data/dominos.json',
    novartis: 'data/novartis.json',
    tsla: 'data/tsla.json'  // ← ADD THIS LINE
};
```

---

### 9. Test Locally (Optional)

```bash
# Serve locally to preview
python3 -m http.server 8000

# Visit http://localhost:8000
```

Check that:
- Company card appears on homepage
- Company page loads correctly
- All sections render properly
- Collapsible info sections work

---

### 10. Deploy to GitHub Pages

```bash
git add -A
git commit -m "Add Tesla (TSLA) evaluation"
git push
```

**Auto-deploy:** GitHub Pages rebuilds in 1-2 minutes.

**Live site:** https://camptracker.github.io/buffett-evaluator/

---

## What the Prompt Does

The prompt guides Claude through Warren Buffett's complete investment methodology:

### Phase 1: Research Planning (10 min)
Claude documents how it will gather data from:
- SEC 10-K/10-Q filings
- Financial databases
- Shareholder letters
- Competitor analysis
- Industry reports

### Phase 2: Data Collection (30-60 min)
Claude gathers:
- **7 financial tables:** EPS, FCF, ROE, Debt, CapEx, Margins, Revenue
- **4 qualitative sections:** Moat, Management, Industry, Consumer behavior

### Phase 3: Buffett Framework Evaluation (60-90 min)
Claude scores 13 criteria:

**Business Quality (40 pts):**
1. Simple & understandable?
2. Durable moat?
3. Consistent history?
4. Favorable prospects?

**Management Quality (30 pts):**
5. Rational capital allocation?
6. Honest & transparent?
7. Resists institutional imperative?

**Financial Health (50 pts):**
8. ROE > 15%?
9. Strong margins?
10. Low debt?
11. Consistent FCF?
12. Capital light?

**Valuation (10 pts):**
13. Margin of safety > 30%?

**Output:** Score (0-130), verdict (BUY/HOLD/AVOID), detailed analysis

---

## Example: How Domino's Was Evaluated

### Input (to Claude):
```
You are evaluating **Domino's Pizza (DPZ)** using Buffett's framework...
[full prompt with 52 pages of instructions]
```

### Output (from Claude):
- 15+ pages of analysis
- EPS CAGR: 23% over 15 years
- ROA: 35% (exceptional)
- Score: 105/130 (81%)
- Verdict: HOLD
- Intrinsic Value: $425
- Current Price: $377.79
- Margin of Safety: +11%

### Converted to JSON:
`data/dominos.json` (287 lines)

### Deployed:
https://camptracker.github.io/buffett-evaluator/company.html?company=dominos

---

## Tips for Best Results

### 1. Use Claude Sonnet 4 or Opus 4
Higher-tier models produce more thorough analysis.

### 2. Give Claude Access to Financial Data
If using API/desktop, provide:
- Recent 10-K filings
- Yahoo Finance data
- Analyst reports

### 3. Review the Output
Claude may:
- Miss recent quarters
- Use outdated data
- Make arithmetic errors (caught by validator)

**Always validate:**
```bash
node validate-data.json
```

### 4. Manual Adjustments OK
You can override Claude's scores if you disagree. Just document why in the JSON.

### 5. Update Regularly
Re-evaluate companies after:
- Quarterly earnings
- Major news events
- Management changes
- Industry disruption

---

## Prompt Sections Explained

### Section 1: Business Quality
- Can you explain the business in 3 sentences?
- Does it have a moat? (brand, network effects, cost advantage, etc.)
- Has it been consistently profitable for 10+ years?
- Will it be stronger in 20 years?

### Section 2: Management Quality
- Do they allocate capital wisely? (smart buybacks, dividends, M&A)
- Are they honest in shareholder letters?
- Do they resist copying competitors blindly?

### Section 3: Financial Health
- ROE > 15%? (capital efficiency)
- Strong margins? (pricing power)
- Low debt? (< 4 years of earnings)
- Growing FCF? (cash generation)
- Capital light? (< 25% CapEx)

### Section 4: Intrinsic Value (DCF)
- Project 10 years of FCF
- Calculate terminal value (Gordon Growth)
- Discount to present value
- Compare to current price

### Section 5: Scorecard
Sum up all 13 criteria → score out of 130

### Section 6: Final Verdict
- One paragraph summary
- Biggest risk to the thesis
- Comparable Buffett holding

---

## Common Issues & Solutions

### Issue: Claude runs out of context
**Solution:** Break into multiple conversations:
1. Data gathering only
2. Framework evaluation only
3. Combine results

### Issue: Scorecard total doesn't match
**Solution:** Run `fix-scorecards.js` after creating JSON

### Issue: Margin of safety calculation wrong
**Solution:** Validator catches this, recalculate manually:
```javascript
MoS = (IV - Price) / IV
```

### Issue: Missing financial data
**Solution:** Note gaps in JSON, lower the score for "Consistent History"

---

## Files You Need

```
buffett-evaluator/
├── buffett-eval-prompt.md   ← THE FULL PROMPT (copy this into Claude)
├── HOW-TO-EVALUATE.md       ← This guide
├── TEMPLATE-AND-LOGIC.md    ← Formula reference
├── test-formulas.js         ← Validation tests
├── validate-data.js         ← Data checker
├── fix-scorecards.js        ← Auto-fix tool
├── script.js                ← Add company here
├── data/
│   └── [ticker].json        ← Output goes here
```

---

## Quick Reference

| Step | Command | Time |
|------|---------|------|
| 1. Copy prompt | `cat buffett-eval-prompt.md` | 1 min |
| 2. Customize | Replace [COMPANY] & [TICKER] | 1 min |
| 3. Run in Claude | Paste full prompt | 60-120 min |
| 4. Convert to JSON | Manual structuring | 30-60 min |
| 5. Validate | `node validate-data.js` | 10 sec |
| 6. Fix errors | `node fix-scorecards.js` | 5 sec |
| 7. Register | Edit `script.js` | 1 min |
| 8. Deploy | `git push` | 2 min |
| **TOTAL** | | **~2-3 hours** |

---

## Next Steps

**Ready to evaluate a company?**

```bash
# 1. View the prompt
cat ~/Documents/buffett-evaluator/buffett-eval-prompt.md

# 2. Copy it, replace [COMPANY] and [TICKER]
# 3. Paste into Claude
# 4. Wait for complete analysis
# 5. Convert to JSON
# 6. Validate and deploy
```

**Need help?** Check:
- `TEMPLATE-AND-LOGIC.md` for formulas
- `VALIDATION-REPORT.md` for testing details
- Existing JSON files in `data/` for examples

---

**The prompt does all the work. You just need to:**
1. Pick a company
2. Copy/paste the prompt
3. Convert output to JSON
4. Deploy

That's it. 🎯
