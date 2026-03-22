# Buffett Evaluator - Exact Template & Logic

## 1. CORE FORMULAS (JavaScript Implementation)

### CAGR (Compound Annual Growth Rate)
```javascript
CAGR = (EndValue / BeginValue)^(1/years) - 1

Example: $0.78 → $17.56 over 15 years
= (17.56 / 0.78)^(1/15) - 1
= 0.2307 = 23.07%
```

**Code:**
```javascript
function calculateCAGR(beginValue, endValue, years) {
    return Math.pow(endValue / beginValue, 1 / years) - 1;
}
```

---

### Margin of Safety
```javascript
MoS = (IntrinsicValue - CurrentPrice) / IntrinsicValue

Example: IV=$425, Price=$377.79
= (425 - 377.79) / 425
= 0.1111 = +11.1%

Negative = overvalued
Buffett wants: MoS > 30%
```

**Code:**
```javascript
function calculateMarginOfSafety(intrinsicValue, currentPrice) {
    return (intrinsicValue - currentPrice) / intrinsicValue;
}
```

---

### Discount Factor
```javascript
DF = 1 / (1 + rate)^years

Example: 10% rate, Year 5
= 1 / (1.10)^5
= 0.6209
```

**Code:**
```javascript
function calculateDiscountFactor(rate, years) {
    return 1 / Math.pow(1 + rate, years);
}
```

---

### Present Value
```javascript
PV = FutureValue × DiscountFactor

Example: $545M in Year 1 at 10%
= 545 × (1/1.10^1)
= $495.45M
```

**Code:**
```javascript
function calculatePresentValue(futureValue, rate, years) {
    return futureValue * (1 / Math.pow(1 + rate, years));
}
```

---

### Terminal Value (Gordon Growth Model)
```javascript
TV = FCF_Year10 × (1 + g) / (r - g)

Where:
  FCF_Year10 = Final year free cash flow
  g = terminal growth rate (2-3% for mature companies)
  r = discount rate (10% standard)

Example: $1,002M FCF, 10% discount, 3% growth
= 1002 × 1.03 / (0.10 - 0.03)
= 1032.06 / 0.07
= $14,743.71M
```

**Code:**
```javascript
function calculateTerminalValue(finalYearFCF, discountRate, terminalGrowthRate) {
    return (finalYearFCF * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate);
}
```

---

### DCF Intrinsic Value (Complete)
```javascript
Total IV = Σ(PV of 10-year cash flows) + PV(Terminal Value)
IV per share = Total IV / Shares Outstanding
```

**Steps:**
1. Project FCF for Years 1-10 with growth rate
2. Discount each year's FCF: `FCF_year × 1/(1.10)^year`
3. Calculate Terminal Value at Year 10
4. Discount Terminal Value: `TV / (1.10)^10`
5. Sum all present values = Total Enterprise Value
6. Divide by shares outstanding

**Code:**
```javascript
function calculateDCFValue(cashFlows, terminalValue, discountRate) {
    let totalPV = 0;
    
    // Discount each year's cash flow
    cashFlows.forEach((cf, index) => {
        const year = index + 1;
        totalPV += cf / Math.pow(1 + discountRate, year);
    });
    
    // Add discounted terminal value
    const terminalYear = cashFlows.length;
    totalPV += terminalValue / Math.pow(1 + discountRate, terminalYear);
    
    return totalPV;
}
```

---

### Other Financial Ratios

**ROE (Return on Equity):**
```javascript
ROE = NetIncome / ShareholderEquity
// Buffett wants: > 15%
```

**Debt/EBITDA:**
```javascript
Debt/EBITDA = NetDebt / EBITDA
// Buffett wants: < 3-4x
```

**Years to Pay Off Debt:**
```javascript
Years = LongTermDebt / NetIncome
// Buffett wants: < 4 years
```

**FCF Margin:**
```javascript
FCFMargin = FreeCashFlow / Revenue
// Higher = more capital efficient
```

**CapEx Ratio:**
```javascript
CapExRatio = CapEx / NetIncome
// Buffett wants: < 25% (asset-light)
```

---

## 2. JSON DATA STRUCTURE

Each company evaluation is stored as a JSON file in `data/[ticker].json`:

```json
{
  "name": "Company Name",
  "ticker": "TICK",
  "industry": "Industry description",
  "analysisDate": "March 20, 2026",
  "currentPrice": 100.00,
  "intrinsicValue": 120.00,
  "marginOfSafety": "+20%",
  "verdict": "BUY / HOLD / AVOID",
  "score": 95,
  "oneParagraphSummary": "...",
  
  "financialData": {
    "eps": {
      "headers": ["Year", "EPS ($)", "YoY Growth"],
      "rows": [
        ["2025", "5.00", "+10.0%"],
        ["2024", "4.55", "+8.3%"]
      ]
    },
    "fcf": { ... },
    "roe": { ... },
    "debt": { ... },
    "margins": { ... }
  },
  
  "qualitativeAnalysis": {
    "moat": ["Primary moat: BRAND", "Evidence: ..."],
    "management": ["CEO: John Doe", "Capital allocation: ..."],
    "industry": ["Growth rate: 5%", "Tailwinds: ..."]
  },
  
  "businessQuality": {
    "criteria": [
      {
        "title": "Simple & Understandable",
        "description": "...",
        "rating": "9/10",
        "verdict": "PASS"
      }
    ]
  },
  
  "managementQuality": { ... },
  "financialHealth": { ... },
  
  "intrinsicValueCalculation": {
    "inputs": {
      "headers": ["Input", "Value", "Justification"],
      "rows": [
        ["Current FCF", "$500M", "TTM"],
        ["Growth Rate", "7%", "Historical"],
        ["Terminal Growth", "3%", "GDP level"],
        ["Discount Rate", "10%", "Standard"]
      ]
    },
    "projections": {
      "headers": ["Year", "FCF ($M)", "Discount Factor", "Present Value"],
      "rows": [
        ["1", "535", "÷ 1.10¹", "486"],
        ["2", "572", "÷ 1.10²", "473"],
        ...
      ]
    },
    "terminalValue": [
      "Year 10 FCF: $1,000M",
      "TV = $1,000M × 1.03 / 0.07 = $14,714M",
      "PV = $14,714M / 1.10¹⁰ = $5,673M"
    ],
    "finalValue": [
      "10-Year Cash Flows (PV): $4,500M",
      "Terminal Value (PV): $5,673M",
      "Total Enterprise Value: $10,173M",
      "Intrinsic Value Per Share: $120"
    ]
  },
  
  "scorecard": {
    "scores": {
      "headers": ["Category", "Criteria", "Score", "Pass/Fail"],
      "rows": [
        ["Business Quality", "Simple", "9/10", "PASS"],
        ["Business Quality", "Moat", "8/10", "PASS"],
        ...
        ["**TOTAL**", "", "**95/130**", "73%"]
      ]
    }
  },
  
  "finalVerdict": {
    "summary": "One paragraph verdict...",
    "biggestRisk": "What could go wrong...",
    "comparable": "Most similar Buffett holding..."
  }
}
```

---

## 3. SCORING LOGIC

**13 Criteria × 10 points each = 130 points total**

### Business Quality (40 points)
1. Simple & Understandable (0-10)
2. Durable Moat (0-10)
3. Consistent History (0-10)
4. Favorable Prospects (0-10)

### Management Quality (30 points)
5. Rational Capital Allocation (0-10)
6. Honest & Transparent (0-10)
7. Resists Institutional Imperative (0-10)

### Financial Health (50 points)
8. ROE > 15% (0-10)
9. Strong Margins (0-10)
10. Low Debt (0-10)
11. Consistent FCF (0-10)
12. Capital Light (0-10)

### Valuation (10 points)
13. Margin of Safety > 30% (0-10)

**Interpretation:**
- **100-130 (77%+):** Excellent - Strong Buy
- **80-99 (62-76%):** Good - Buy at fair price
- **60-79 (46-61%):** Mediocre - Requires deep discount
- **<60 (<46%):** Avoid - Too many red flags

---

## 4. WEBSITE RENDERING LOGIC

### Homepage (index.html + script.js)

1. **Load company registry:**
```javascript
const companies = {
    nike: 'data/nike.json',
    pinterest: 'data/pinterest.json',
    dominos: 'data/dominos.json',
    novartis: 'data/novartis.json'
};
```

2. **Fetch each company's JSON:**
```javascript
for (const [id, dataPath] of Object.entries(companies)) {
    const response = await fetch(dataPath);
    const data = await response.json();
    container.appendChild(createCompanyCard(id, data));
}
```

3. **Create company card:**
```javascript
function createCompanyCard(id, data) {
    return `
        <a href="company.html?company=${id}">
            <h2>${data.name}</h2>
            <div class="verdict ${verdictClass}">${data.verdict}</div>
            <div class="score">${data.score}/130</div>
            <p>Intrinsic Value: $${data.intrinsicValue}</p>
            <p>Margin of Safety: ${data.marginOfSafety}</p>
        </a>
    `;
}
```

### Company Page (company.html)

1. **Parse URL parameter:**
```javascript
const params = new URLSearchParams(window.location.search);
const companyId = params.get('company');
```

2. **Fetch company data:**
```javascript
const dataPath = companies[companyId]; // e.g., 'data/dominos.json'
const data = await fetch(dataPath).then(r => r.json());
```

3. **Render sections:**
```javascript
renderVerdictCard(data);          // Top summary
renderFinancialData(data);        // EPS, FCF, ROE tables
renderQualitativeAnalysis(data);  // Moat, management, industry
renderBusinessQuality(data);      // 4 criteria with ratings
renderManagementQuality(data);    // 3 criteria
renderFinancialHealth(data);      // 5 criteria
renderIntrinsicValue(data);       // DCF calculation
renderScorecard(data);            // 13-row table
renderFinalVerdict(data);         // Summary + risk + comparable
```

4. **Collapsible info sections:**
```javascript
document.querySelectorAll('.info-toggle').forEach(button => {
    button.addEventListener('click', () => {
        const infoId = button.getAttribute('data-info');
        const infoSection = document.getElementById(infoId);
        infoSection.classList.toggle('visible');
        button.textContent = infoSection.classList.contains('visible') 
            ? 'Hide Info' 
            : 'Show Info';
    });
});
```

---

## 5. VALIDATION WORKFLOW

### Formula Testing (test-formulas.js)
```bash
node test-formulas.js
# Runs 23 tests on all 11 formulas
# Output: "23 passed, 0 failed"
```

### Data Validation (validate-data.js)
```bash
node validate-data.js
# Checks all JSON files for:
# - Correct margin of safety calculation
# - EPS growth rate accuracy
# - Scorecard total arithmetic
# - Debt metric formulas
```

### Auto-fix Scorecards (fix-scorecards.js)
```bash
node fix-scorecards.js
# Recalculates scorecard totals
# Updates both scorecard row and top-level score field
```

---

## 6. WORKFLOW: Adding a New Company

### Step 1: Run the Evaluation
Copy `buffett-eval-prompt.md` into Claude, replace [COMPANY NAME] and [TICKER], get full analysis.

### Step 2: Convert to JSON
Manually structure the output into the JSON format (see section 2).

Save as `data/[ticker].json`.

### Step 3: Validate
```bash
node validate-data.js
# Fix any errors reported
```

### Step 4: Register Company
Add to `script.js`:
```javascript
const companies = {
    nike: 'data/nike.json',
    pinterest: 'data/pinterest.json',
    dominos: 'data/dominos.json',
    novartis: 'data/novartis.json',
    newticker: 'data/newticker.json'  // ADD THIS
};
```

### Step 5: Deploy
```bash
git add -A
git commit -m "Add [COMPANY] evaluation"
git push
# GitHub Pages auto-deploys in 1-2 minutes
```

### Step 6: Verify
Check live site: https://camptracker.github.io/buffett-evaluator/

---

## 7. KEY FILES

```
buffett-evaluator/
├── index.html              # Homepage with company cards
├── company.html            # Individual company page
├── style.css               # All styling
├── script.js               # Website logic (fetch, render)
├── buffett-eval-prompt.md  # Master evaluation template
├── test-formulas.js        # Formula test suite (23 tests)
├── validate-data.js        # Data validator
├── fix-scorecards.js       # Auto-fix scorecard totals
├── VALIDATION-REPORT.md    # Testing documentation
├── data/
│   ├── nike.json           # Nike evaluation
│   ├── pinterest.json      # Pinterest evaluation
│   ├── dominos.json        # Domino's evaluation
│   └── novartis.json       # Novartis evaluation
```

---

## 8. FORMULA SUMMARY CHEAT SHEET

| Formula | Equation | Buffett Threshold |
|---------|----------|-------------------|
| CAGR | `(End/Begin)^(1/years) - 1` | 10%+ for EPS |
| Margin of Safety | `(IV - Price) / IV` | > 30% |
| Present Value | `FV / (1+r)^years` | - |
| Terminal Value | `FCF × (1+g) / (r-g)` | - |
| DCF | `Σ PV(FCF) + PV(TV)` | - |
| ROE | `Income / Equity` | > 15% |
| Debt/EBITDA | `Debt / EBITDA` | < 3-4x |
| Years to Pay Debt | `Debt / Income` | < 4 years |
| FCF Margin | `FCF / Revenue` | 10-20%+ |
| CapEx Ratio | `CapEx / Income` | < 25% |

---

## 9. AUTOMATED CHECKS

✅ **All formulas tested:** 23/23 passing  
✅ **Scorecard arithmetic:** Auto-validated  
✅ **Margin of safety:** Auto-calculated  
✅ **EPS growth rates:** Auto-verified  
✅ **Data structure:** JSON schema enforced  

**Result:** Framework is production-ready with full test coverage.
