# Display Bugs Found (Visual Inspection)

**Date**: 2026-03-22 09:13 PDT  
**URL**: https://camptracker.github.io/buffett-evaluator/index-agents.html

## 🔴 Critical Display Bugs

### 1. **Agent 3: Evidence Array Not Displayed**
**Severity**: CRITICAL  
**Impact**: 8 pieces of detailed capital allocation evidence completely hidden from user

**Data Structure**:
```json
{
  "title": "Rational Capital Allocation",
  "evidence": [
    "Dividends: $0 paid over 2020-2025 period (Source: 10-K...)",
    "Buybacks: $500M (2023) + $600M (2024) + $927M (2025) = $2,027M...",
    "Share count: 683.2M (2022) → 664.5M (2025), net reduction...",
    "FCF trend: $11.43M (2020) → $743.88M (2021) → ...",
    "Debt: $0 long-term debt in all years 2020-2025...",
    "Cash position: $2,467.2M in cash...",
    "ROE trend: -5.72% (2020) → 10.41% (2021) → ...",
    "R&D reinvestment: $1,427.4M in 2025 (33.8% of revenue)..."
  ],
  ...
}
```

**Current Code**:
```javascript
${criterion.examples ? renderExamples(criterion.examples) : ''}
```

**Problem**: Code checks for `examples` field but Agent 3 has `evidence` field (array of 8 strings).

**Result**: All evidence bullets are invisible to user - they only see description + reasoning.

**Fix**:
```javascript
// In renderAgent3()
${criterion.evidence ? renderEvidence(criterion.evidence) : ''}
${criterion.examples ? renderExamples(criterion.examples) : ''}

// New helper function
function renderEvidence(evidence) {
    let html = '<div class="evidence"><strong>Evidence:</strong><ul>';
    evidence.forEach(item => html += `<li>${item}</li>`);
    html += '</ul></div>';
    return html;
}
```

---

### 2. **Agent 4: Nested Metrics Display as "[object Object]"**
**Severity**: CRITICAL  
**Impact**: Year-by-year ROE breakdown shows as "[object Object]" instead of actual data

**Data Structure**:
```json
{
  "metrics": {
    "yearlyROE": {
      "2020": "-5.72%",
      "2021": "10.41%",
      "2022": "-2.93%",
      "2023": "-1.15%",
      "2024": "39.19%",
      "2025": "8.78%"
    },
    "averageROE": "8.10% = (-5.72 + 10.41 + -2.93 + -1.15 + 39.19 + 8.78) / 6",
    "highYear": "2024: 39.19% (inflated by ~$1.4B one-time deferred tax asset release)",
    "buffettThreshold": ">15% average over 10 years"
  }
}
```

**Current Code**:
```javascript
function renderMetrics(metrics) {
    let html = '<div class="metrics">';
    for (const [key, value] of Object.entries(metrics)) {
        html += `<div class="metric-item"><strong>${key}:</strong> ${value}</div>`;
    }
    html += '</div>';
    return html;
}
```

**Problem**: When `value` is an object (like `yearlyROE`), JavaScript converts it to "[object Object]" string.

**Result**: User sees:
```
yearlyROE: [object Object]  ← BUG
averageROE: 8.10% = ...
highYear: 2024: 39.19%...
```

**Fix**:
```javascript
function renderMetrics(metrics) {
    let html = '<div class="metrics">';
    for (const [key, value] of Object.entries(metrics)) {
        // Handle nested objects
        if (typeof value === 'object' && value !== null) {
            html += `<div class="metric-item"><strong>${key}:</strong><ul>`;
            for (const [subKey, subValue] of Object.entries(value)) {
                html += `<li>${subKey}: ${subValue}</li>`;
            }
            html += '</ul></div>';
        } else {
            html += `<div class="metric-item"><strong>${key}:</strong> ${value}</div>`;
        }
    }
    html += '</div>';
    return html;
}
```

---

### 3. **Agent 5: DCF Inputs Table Has Headers + Rows But Not Rendered**
**Severity**: HIGH  
**Impact**: User can't see DCF calculation details

**Data Structure**:
```json
{
  "intrinsicValueCalculation": {
    "inputs": {
      "headers": ["Input", "Value", "Source/Justification"],
      "rows": [
        ["Current FCF", "$1,251.89M", "10-K 2025, Cash Flow Statement..."],
        ["Historical FCF CAGR (4yr)", "13.8%", "2021 to 2025..."],
        ["Growth Rate (Yrs 1-10)", "11%", "Moderate quality adjustment..."],
        ...
      ]
    },
    "projectedFCF": { ... },
    "terminalValue": { ... }
  }
}
```

**Current Code**:
```javascript
function renderDCFTable(calc) {
    // Implement based on intrinsicValueCalculation structure
    return '<p>DCF details (to be implemented based on data structure)</p>';
}
```

**Problem**: Function is a placeholder stub - never implemented!

**Result**: User sees literal text "DCF details (to be implemented...)" instead of actual calculation.

**Fix**:
```javascript
function renderDCFTable(calc) {
    let html = '';
    
    // Inputs table
    if (calc.inputs && calc.inputs.headers && calc.inputs.rows) {
        html += '<h4>DCF Inputs</h4>';
        html += renderTable(calc.inputs.headers, calc.inputs.rows);
    }
    
    // Projected FCF table (if available)
    if (calc.projectedFCF && calc.projectedFCF.headers && calc.projectedFCF.rows) {
        html += '<h4>Projected Free Cash Flow</h4>';
        html += renderTable(calc.projectedFCF.headers, calc.projectedFCF.rows);
    }
    
    // Terminal Value details
    if (calc.terminalValue) {
        html += '<div class="terminal-value">';
        html += `<h4>Terminal Value Calculation</h4>`;
        for (const [key, value] of Object.entries(calc.terminalValue)) {
            html += `<p><strong>${key}:</strong> ${value}</p>`;
        }
        html += '</div>';
    }
    
    return html;
}
```

---

## 🟡 Medium Display Bugs

### 4. **Agent 2: Metrics Not Rendered (If Present)**
**Severity**: MEDIUM  
**Impact**: Business Quality criterion might have metrics that don't display

**Example**: Criterion #3 "Consistent Operating History" has metrics:
```json
{
  "profitableYears": "3/6 (2021, 2024, 2025 profitable; 2020, 2022, 2023 net losses)",
  "epsCAGR": "Not meaningful due to losses; from 2021 to 2025: ~7% CAGR",
  "revenueCAGR": "~20% CAGR from 2020-2025 (0 negative years)",
  "fcfCAGR": "~152% CAGR from 2020-2025 (all positive years)",
  "downYears": "3 GAAP loss years (2020, 2022, 2023); 0 FCF negative years"
}
```

**Current**: Code calls `renderMetrics()` which will work for flat key-value pairs.

**Problem**: IF any nested objects exist in Agent 2 metrics, same "[object Object]" bug as Agent 4.

**Status**: Needs same fix as Bug #2.

---

### 5. **Long Text Fields Not Line-Breaking Properly**
**Severity**: MEDIUM  
**Impact**: Mobile users see horizontal scroll for long reasoning paragraphs

**Example**: Agent 3 reasoning field is 500+ characters - might overflow on narrow screens.

**Fix**:
```css
.reasoning p {
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
}
```

---

## 🟢 Minor Display Issues

### 6. **Qualitative Data Missing "notes" Field**
**Severity**: LOW  
**Impact**: Agent 1 has a `notes` object with important caveats not displayed

**Data**:
```json
{
  "notes": {
    "units": "All financial figures in millions of USD unless otherwise noted",
    "filingYearMapping": { ... },
    "xbrlExtraction": "All financial data extracted from inline XBRL tags...",
    "debtNote": "Pinterest has no long-term debt. The company has a $750M...",
    "fy2024NetIncomeNote": "FY2024 net income of $1,862.1M includes a $1,574.5M...",
    "capexNote": "CapEx element name changed across filings..."
  }
}
```

**Current**: Code doesn't check for or render `notes` field.

**Result**: Important context (like "FY2024 net income includes tax benefit") hidden.

**Fix**: Add notes section to Agent 1 rendering.

---

### 7. **No Visual Hierarchy for Nested Metrics**
**Severity**: LOW (UX)  
**Impact**: Nested year-by-year data (when fixed) will look flat

**Example**: After fixing Bug #2, yearlyROE will show as flat list. Better UX would indent/style it:

```
ROE Breakdown:
  2020: -5.72%
  2021: 10.41%
  2022: -2.93%
  ...
```

---

## Summary

| Bug # | Component | Severity | Impact | Data Loss |
|-------|-----------|----------|--------|-----------|
| 1 | Agent 3 | CRITICAL | 8 evidence bullets hidden | 100% |
| 2 | Agent 4 | CRITICAL | Yearly metrics show [object Object] | 100% |
| 3 | Agent 5 | HIGH | DCF calculation not shown | 100% |
| 4 | Agent 2 | MEDIUM | Metrics might not render properly | Partial |
| 5 | All | MEDIUM | Long text overflow on mobile | UX only |
| 6 | Agent 1 | LOW | Important notes missing | Context |
| 7 | Agent 4 | LOW | Nested data not visually hierarchical | UX only |

**Total Critical Bugs**: 3 (Bugs #1, #2, #3)  
**Total Data Loss**: ~30-40% of detailed analysis not visible to users

---

## Priority Fixes

**Immediate (High Impact)**:
1. Fix Agent 3 evidence rendering (Bug #1)
2. Fix Agent 4 nested metrics rendering (Bug #2)
3. Implement Agent 5 DCF table rendering (Bug #3)

**Next**:
4. Apply nested object fix to Agent 2 metrics (Bug #4)
5. Add word-wrap for long text (Bug #5)

**Later**:
6. Add Agent 1 notes section (Bug #6)
7. Improve visual hierarchy for nested data (Bug #7)
