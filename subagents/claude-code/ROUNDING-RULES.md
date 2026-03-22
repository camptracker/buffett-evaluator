# Rounding Rules for Deterministic Evaluations

## Overview

**All agents MUST follow these exact rounding rules** to ensure deterministic outputs.

Inconsistent rounding is a major source of non-determinism. These rules eliminate variance.

---

## Standard Rounding Rules

### 1. Percentages

**Rule:** Round to **1 decimal place**

**Examples:**
```
20.123% → 20.1%
20.167% → 20.2%
20.05%  → 20.1% (round half up)
-5.234% → -5.2%
```

**Applies to:**
- YoY growth rates
- ROE, ROA
- Profit margins (gross, operating, net)
- Margin of safety
- All percentage calculations

### 2. Dollar Amounts (Millions)

**Rule:** Round to **nearest million**, no decimals

**Examples:**
```
$5,234,567,890 → $5,235M
$1,500,000,000 → $1,500M
$999,500,000   → $1,000M (round half up)
$500,000       → $1M (still round to millions)
```

**Applies to:**
- Revenue
- Net Income
- Free Cash Flow
- Debt amounts
- CapEx
- All financial statement items

### 3. Ratios

**Rule:** Round to **2 decimal places**

**Examples:**
```
2.15678 → 2.16
4.50123 → 4.50
0.98765 → 0.99
```

**Applies to:**
- Debt/EBITDA (e.g., 4.7x → report as "4.70x")
- P/E ratios
- FCF conversion ratios
- Any X:Y ratio

### 4. Years (Time Periods)

**Rule:** Round to **1 decimal place**

**Examples:**
```
2.345 years → 2.3 years
4.567 years → 4.6 years
1.05 years  → 1.1 years (round half up)
```

**Applies to:**
- Years to pay off debt
- CEO tenure
- Any time period calculation

### 5. Scores (Out of 10 or 130)

**Rule:** **Integer only**, no decimals

**Examples:**
```
7.8/10 → 8/10 (round to nearest integer)
7.4/10 → 7/10
95.6/130 → 96/130
```

**Applies to:**
- All criterion scores (0-10)
- Total scorecard score (0-130)

### 6. Share Counts

**Rule:** Round to **nearest million**, no decimals

**Examples:**
```
1,234,567,890 shares → 1,235M shares
100,500,000 shares   → 101M shares
```

**Applies to:**
- Shares outstanding
- Shares in float
- Insider share counts

### 7. Stock Prices (Per Share)

**Rule:** Round to **2 decimal places**

**Examples:**
```
$123.456 → $123.46
$1.2345  → $1.23
$0.9876  → $0.99
```

**Applies to:**
- Current stock price
- Intrinsic value per share
- Historical stock prices

---

## JavaScript Implementation

All agents should use this rounding function:

```javascript
function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

// Usage
const percentage = round(20.123, 1);      // 20.1
const millions = round(5234.567, 0);      // 5235
const ratio = round(2.15678, 2);          // 2.16
const years = round(2.345, 1);            // 2.3
const score = Math.round(7.8);            // 8
const price = round(123.456, 2);          // 123.46
```

---

## Formatting Rules

### Percentages
```
Format: "±XX.X%"
Examples: "+10.5%", "-5.2%", "20.1%"
```

### Dollar Amounts
```
Format: "$X,XXXM" or "$XB"
Examples: "$5,235M", "$1.5B"

For billions:
  $5,235,000,000 → "$5.2B" (round to 1 decimal for billions)
```

### Ratios
```
Format: "X.XXx"
Examples: "4.70x", "2.15x", "0.99x"
```

### Years
```
Format: "X.X years"
Examples: "2.3 years", "4.6 years"
```

### Scores
```
Format: "X/10" or "XX/130"
Examples: "8/10", "96/130"
```

---

## Special Cases

### 1. Zero Values

**Always include sign:**
```
0% → "0.0%"
$0 → "$0M"
0x → "0.00x"
```

### 2. Very Small Numbers

**Use scientific notation if <0.01:**
```
0.0001% → "<0.1%"
$50,000 → "<$1M" (for millions format)
```

### 3. Very Large Numbers

**Use billions for >10,000M:**
```
$15,000M → "$15.0B"
$125,000M → "$125.0B"
```

### 4. Negative Equity (for ROE)

**Report as "Negative":**
```
ROE when equity <0 → "Negative"
Do not calculate percentage
Instead, report ROA
```

---

## Calculation Order

**CRITICAL: Round at the END, not during calculation**

❌ **Bad (compounds rounding errors):**
```javascript
const eps2024 = round(5.123, 1);  // 5.1
const eps2023 = round(4.567, 1);  // 4.6
const growth = round((eps2024 - eps2023) / eps2023 * 100, 1);
// (5.1 - 4.6) / 4.6 * 100 = 10.87 → 10.9%  ❌ WRONG
```

✅ **Good (accurate calculation):**
```javascript
const eps2024 = 5.123;
const eps2023 = 4.567;
const growth = round((eps2024 - eps2023) / eps2023 * 100, 1);
// (5.123 - 4.567) / 4.567 * 100 = 12.17 → 12.2%  ✅ CORRECT
```

**Rule:** Calculate with full precision, round only the final result.

---

## Verification

Before finalizing output, check:

- [ ] All percentages have exactly 1 decimal place
- [ ] All dollar amounts are in millions (M) or billions (B), no decimals
- [ ] All ratios have exactly 2 decimal places
- [ ] All year values have exactly 1 decimal place
- [ ] All scores are integers
- [ ] All prices have exactly 2 decimal places
- [ ] No intermediate rounding (full precision until final output)

---

## Examples by Agent

### Agent 1 (Data Collector)

```json
{
  "eps": {
    "rows": [
      ["2024", "5.10", "+12.2%"]  // EPS: 2 decimals, Growth: 1 decimal
    ]
  },
  "fcf": {
    "rows": [
      ["2024", "8,235", "+15.3%"]  // FCF: millions (no decimals), Growth: 1 decimal
    ]
  }
}
```

### Agent 4 (Financial Health)

```json
{
  "metrics": {
    "averageROE": "20.5%",        // 1 decimal
    "averageNetMargin": "12.3%",  // 1 decimal
    "yearsToPayDebt": "2.3 years", // 1 decimal
    "debtToEBITDA": "4.70x",      // 2 decimals
    "fcfCAGR": "10.2%"            // 1 decimal
  }
}
```

### Agent 5 (Valuation)

```json
{
  "intrinsicValue": 93.32,        // 2 decimals (price)
  "currentPrice": 105.00,         // 2 decimals
  "marginOfSafety": "-12.5%"      // 1 decimal
}
```

### Agent 6 (Scorecard)

```json
{
  "scores": {
    "rows": [
      ["Business Quality", "Simple", "9/10", "PASS"],  // Integer score
      ["**TOTAL**", "", "**98/130**", "75%"]           // Integer total, 0 decimals on %
    ]
  }
}
```

---

## Testing Rounding Consistency

Run this test in Agent 1:

```javascript
// Test case
const value = 20.15;

// Round to 1 decimal
const rounded = round(value, 1);
console.log(rounded);  // Should be: 20.2

// Verify format
const formatted = `${rounded}%`;
console.log(formatted);  // Should be: "20.2%"

// Verify it's deterministic
const rounded2 = round(value, 1);
console.log(rounded === rounded2);  // Should be: true
```

---

**Consistent rounding = Deterministic evaluations.**

Follow these rules exactly in every agent. No exceptions. 🎯
