# Data Sources Audit - Buffett Evaluator

## Audit Date: March 22, 2026

## ✅ AUDIT COMPLETE: All agents now use ONLY official SEC sources

---

## Allowed Data Sources

### ✅ PRIMARY SOURCES (REQUIRED)

1. **SEC EDGAR (sec.gov)**
   - 10-K Annual Reports
   - 10-Q Quarterly Reports
   - 8-K Current Reports
   - DEF 14A Proxy Statements
   - Form 4 Insider Trading

2. **Official Company Investor Relations**
   - Earnings press releases (official IR site)
   - Annual reports (official IR site)
   - Shareholder letters (official IR site)
   - Only for qualitative data (CEO quotes, business description)

---

## ❌ FORBIDDEN SOURCES

**NEVER use these sources:**

- Yahoo Finance
- Google Finance
- Bloomberg Terminal
- Reuters
- MarketWatch
- Seeking Alpha
- Financial news websites
- Analyst reports (unless cited in SEC filing)
- Wikipedia
- Third-party aggregators
- Stock screeners
- Any non-official source

---

## Agent-by-Agent Data Requirements

### Agent 1: Data Collector

**MUST:**
- ✅ Download filings directly from SEC EDGAR
- ✅ Extract data manually from 10-K, 10-Q, DEF 14A
- ✅ Cite EVERY data point (filing type, date, page number)
- ✅ Calculate all metrics from raw SEC data (EPS growth, FCF, ROE, etc.)

**Example citations:**
```
✅ "EPS $5.00 (Source: 10-K filed 2025-02-15, Income Statement, page 52)"
✅ "FCF = $10B Operating CF - $2B CapEx (10-K 2025, Cash Flow Statement, p.55-56)"
✅ "CEO: John Doe, tenure 10 years (DEF 14A 2025, Executive Officers, p.8)"
```

**MUST NOT:**
```
❌ "EPS $5.00 (Source: Yahoo Finance)"
❌ "P/E ratio 20 (Bloomberg)"
❌ "Analyst estimate: $5.50 EPS"
```

**Output format:**
```json
{
  "sources": {
    "secFilings": [
      {"type": "10-K", "year": 2024, "filedDate": "2025-02-15", "url": "https://sec.gov/..."},
      {"type": "DEF 14A", "year": 2025, "filedDate": "2025-04-01", "url": "https://sec.gov/..."}
    ]
  },
  "data": {
    "eps": {
      "rows": [
        ["2024", "5.00", "+10%", "10-K filed 2025-02-15, p.52"]
      ]
    }
  }
}
```

Every data point MUST have SEC filing citation.

---

### Agent 2: Business Quality

**MUST:**
- ✅ Use ONLY data from Agent 1 (already SEC-verified)
- ✅ Analyze business description from 10-K Item 1
- ✅ Review Risk Factors from 10-K Item 1A for competitive threats
- ✅ Assess moat using margin trends from 10-K Income Statements

**MUST NOT:**
- ❌ Search web for competitive analysis
- ❌ Use third-party market research
- ❌ Make assumptions not supported by 10-K

**All analysis references:**
```
"Moat: Network effects (Source: 10-K 2025, Item 1, Business Description, p.5)"
"Competition: Risk from Amazon noted (10-K 2025, Risk Factors, p.18)"
```

---

### Agent 3: Management Quality

**MUST:**
- ✅ Use CEO info from DEF 14A (Proxy Statement)
- ✅ Capital allocation from 10-K Cash Flow Statements
- ✅ Compensation from DEF 14A Compensation Discussion & Analysis
- ✅ Shareholder letter quotes from official annual report

**MUST NOT:**
- ❌ Use news articles about CEO
- ❌ Reference analyst opinions on management
- ❌ Cite third-party sources

**Example:**
```
"CEO compensation: $15M tied to ROIC targets (DEF 14A 2025, CD&A, p.25)"
"Buybacks: $5B over 5 years (10-K 2025, Cash Flow Statement, Financing Activities)"
"Quote: 'We focus on long-term value' (2024 Annual Report, CEO Letter, p.2)"
```

---

### Agent 4: Financial Health

**MUST:**
- ✅ Calculate ALL metrics from 10-K financial statements
- ✅ Show calculations (e.g., ROE = Net Income / Equity)
- ✅ Use exact numbers from Balance Sheet, Income Statement, Cash Flow Statement

**MUST NOT:**
- ❌ Use pre-calculated ratios from Yahoo Finance
- ❌ Use analyst-calculated metrics
- ❌ Reference non-SEC sources

**Example:**
```
"ROE = $5,000M Net Income / $25,000M Equity = 20%"
"(Source: 10-K 2025, Income Statement p.52, Balance Sheet p.55)"

"FCF CAGR = ($8,000M / $3,000M)^(1/10) - 1 = 10.3%"
"(Calculated from 10-K 2015-2025 Cash Flow Statements)"
```

---

### Agent 5: Valuation

**MUST:**
- ✅ Use FCF from Agent 1 (sourced from 10-K Cash Flow Statements)
- ✅ Base growth rate on historical FCF CAGR from SEC data
- ✅ Adjust growth rate based on business quality scores (from SEC analysis)
- ✅ Show all DCF calculations step-by-step

**MUST NOT:**
- ❌ Use analyst price targets
- ❌ Use external valuation models
- ❌ Reference non-SEC data

**Example:**
```
"Current FCF: $500M (10-K 2025, Cash Flow Statement)"
"Historical CAGR: 8% (calculated from 10-K 2015-2025)"
"Adjusted growth: 6% (8% × 0.75 due to moderate quality score)"
```

---

### Agent 6: Scorecard & Verdict

**MUST:**
- ✅ Compile scores from Agents 2-5 (all SEC-sourced)
- ✅ Reference biggest risk from 10-K Risk Factors
- ✅ Compare to Buffett holdings using SEC filing similarities

**MUST NOT:**
- ❌ Add external research
- ❌ Use non-SEC opinions
- ❌ Reference market sentiment

**Example:**
```
"Biggest risk: FDA approval failure (10-K 2025, Risk Factors, p.22)"
"Comparable: Apple - both have ecosystem lock-in per respective 10-Ks"
```

---

## Data Quality Verification Checklist

Before finalizing any evaluation, verify:

### Agent 1 Output:
- [ ] All financial data has SEC filing citation (type, date, page)
- [ ] No data from Yahoo Finance, Bloomberg, or aggregators
- [ ] Sources array lists all SEC filings used
- [ ] Every calculation shown (e.g., YoY growth = (Current - Prior) / Prior)

### Agent 2-4 Output:
- [ ] All analysis references Agent 1 data (which is SEC-sourced)
- [ ] No external research added
- [ ] All claims supported by 10-K, 10-Q, or DEF 14A evidence

### Agent 5 Output:
- [ ] DCF uses only Agent 1-4 data (all SEC-sourced)
- [ ] Growth rate justified by SEC data and quality scores
- [ ] Current price from latest earnings release or 10-Q

### Agent 6 Output:
- [ ] Summary cites specific SEC filings
- [ ] Biggest risk from 10-K Risk Factors (cited with page)
- [ ] Comparable uses SEC filing similarities

---

## Why SEC-Only?

### 1. Legal Accountability
- SEC filings are legally binding
- Companies face penalties for misrepresentation
- Audited by independent firms (for 10-K)

### 2. Primary Source
- Direct from company, not filtered through aggregators
- No third-party interpretation errors
- Complete context (not cherry-picked metrics)

### 3. Comprehensive
- 10-K contains everything: financials, risks, business description, management discussion
- Historical filings available for 10-20 years
- Insider trading visible via Form 4

### 4. No Bias
- Aggregators may have data errors or delays
- Analyst reports have conflicts of interest
- SEC filings are neutral, factual

### 5. Buffett's Method
- Warren Buffett reads SEC filings directly
- He doesn't rely on analyst screens or aggregators
- We follow the same discipline

---

## SEC Filing Quick Reference

### 10-K (Annual Report) - Use this FIRST
- **Part I, Item 1:** Business Description (moat analysis)
- **Part I, Item 1A:** Risk Factors (threats, competition)
- **Part II, Item 7:** MD&A - Management Discussion & Analysis (trends, outlook)
- **Part II, Item 8:** Financial Statements (Income Statement, Balance Sheet, Cash Flow)

### 10-Q (Quarterly Report)
- Same structure as 10-K but less detailed
- Use for most recent data (e.g., current stock price, latest quarter results)

### DEF 14A (Proxy Statement)
- **Executive Officers:** CEO tenure, background
- **Compensation Discussion & Analysis:** CEO pay structure, performance metrics
- **Shareholder Proposals:** Governance issues

### Form 4 (Insider Trading)
- Insider buys/sells
- Useful for management alignment check

---

## How to Find SEC Filings

### 1. Go to SEC EDGAR
```
https://www.sec.gov/edgar/searchedgar/companysearch.html
```

### 2. Search by Ticker
```
Example: Enter "AAPL" for Apple
```

### 3. Get CIK Number
```
Example: Apple CIK = 0000320193
```

### 4. Filter by Filing Type
```
- 10-K: Annual reports
- 10-Q: Quarterly reports
- DEF 14A: Proxy statements
```

### 5. Download and Extract
```
- Read HTML or PDF version
- Extract data manually
- Cite: "10-K filed 2025-02-15, page 52"
```

---

## Audit Summary

✅ **All 6 agents audited and updated**  
✅ **SEC-only requirement enforced**  
✅ **Citation requirements added**  
✅ **Forbidden sources listed**  
✅ **Quality checklist created**  

**Result:** The Buffett Evaluator now uses ONLY official SEC sources, matching Warren Buffett's methodology of reading filings directly.

**No Yahoo Finance. No Bloomberg. No aggregators. Just SEC filings and official earnings reports.**

This ensures:
- Legal accountability (filings are binding)
- No third-party errors
- Complete context
- Unbiased data
- Buffett-authentic process

---

**Audit completed:** March 22, 2026  
**Auditor:** Bob (OpenClaw AI)  
**Files modified:** All 6 agent prompts (agents/1-6-*.md)  
**Data source policy:** SEC.gov + official IR only  
**Status:** ✅ COMPLIANT
