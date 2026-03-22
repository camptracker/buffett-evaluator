# URL Documentation Requirements

## Overview

**ALL data must be traceable to specific SEC EDGAR URLs.**

This enables:
- Complete transparency
- Easy verification by humans
- Reproducibility of analysis
- Auditability of sources

---

## Required URLs

### 1. Company Search URL
```
https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=[CIK]&type=&dateb=&owner=exclude&count=100
```

**Example (Apple):**
```
https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=320193&type=&dateb=&owner=exclude&count=100
```

### 2. Individual Filing URLs

**Format:**
```
https://www.sec.gov/cgi-bin/viewer?action=view&cik=[CIK]&accession_number=[ACCESSION]&xbrl_type=v
```

**Components:**
- `CIK`: Central Index Key (company identifier)
- `ACCESSION`: Filing accession number (e.g., 0000320193-25-000010)
- `xbrl_type=v`: XBRL viewer (optional, for interactive viewing)

**Alternative direct URL:**
```
https://www.sec.gov/Archives/edgar/data/[CIK]/[ACCESSION]/[FILENAME].htm
```

---

## How to Get Filing URLs

### Step 1: Find Company on SEC EDGAR

Go to: https://www.sec.gov/edgar/searchedgar/companysearch.html

Search by:
- Ticker symbol (e.g., "AAPL")
- Company name (e.g., "Apple Inc")

### Step 2: Get CIK Number

From search results, note the CIK:
```
Apple Inc.
CIK: 0000320193
```

Save as 10-digit padded number: `0000320193`

### Step 3: Browse Filings

Click on company name to see all filings:
```
https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=320193&type=&dateb=&owner=exclude&count=100
```

### Step 4: Filter by Filing Type

Use dropdown to filter:
- 10-K (Annual Reports)
- 10-Q (Quarterly Reports)
- DEF 14A (Proxy Statements)

### Step 5: Get Individual Filing URL

Click "Documents" button next to a filing, then:

**Option A - Interactive Viewer (preferred):**
```
https://www.sec.gov/cgi-bin/viewer?action=view&cik=320193&accession_number=0000320193-24-000123&xbrl_type=v
```

**Option B - HTML Document:**
Click on the `.htm` filename to get direct URL:
```
https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/aapl-20240930.htm
```

### Step 6: Note Accession Number

Format: `[CIK]-[YY]-[SEQUENCE]`

Example: `0000320193-24-000123`
- Company: 320193 (Apple)
- Year: 24 (2024)
- Sequence: 000123

---

## URL Documentation Format

### In Agent 1 Output

**Sources array (top-level):**
```json
{
  "sources": {
    "cik": "0000320193",
    "ticker": "AAPL",
    "companyName": "Apple Inc.",
    "companySearchUrl": "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=320193&type=&dateb=&owner=exclude&count=100",
    "secFilings": [
      {
        "type": "10-K",
        "fiscalYear": 2024,
        "fiscalPeriod": "FY",
        "filedDate": "2024-11-01",
        "accessionNumber": "0000320193-24-000123",
        "url": "https://www.sec.gov/cgi-bin/viewer?action=view&cik=320193&accession_number=0000320193-24-000123&xbrl_type=v",
        "htmlUrl": "https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/aapl-20240930.htm"
      },
      {
        "type": "10-K",
        "fiscalYear": 2023,
        "fiscalPeriod": "FY",
        "filedDate": "2023-11-03",
        "accessionNumber": "0000320193-23-000106",
        "url": "https://www.sec.gov/cgi-bin/viewer?action=view&cik=320193&accession_number=0000320193-23-000106&xbrl_type=v"
      },
      {
        "type": "DEF 14A",
        "fiscalYear": 2025,
        "fiscalPeriod": "N/A",
        "filedDate": "2025-01-10",
        "accessionNumber": "0000320193-25-000005",
        "url": "https://www.sec.gov/cgi-bin/viewer?action=view&cik=320193&accession_number=0000320193-25-000005"
      }
    ]
  }
}
```

**Financial data tables (include URL column):**
```json
{
  "eps": {
    "headers": ["Year", "EPS ($)", "YoY Growth", "Source", "URL"],
    "rows": [
      [
        "2024",
        "6.08",
        "+10.5%",
        "10-K filed 2024-11-01, Consolidated Statements of Operations, p.31",
        "https://www.sec.gov/cgi-bin/viewer?action=view&cik=320193&accession_number=0000320193-24-000123"
      ],
      [
        "2023",
        "5.50",
        "+5.8%",
        "10-K filed 2023-11-03, Consolidated Statements of Operations, p.29",
        "https://www.sec.gov/cgi-bin/viewer?action=view&cik=320193&accession_number=0000320193-23-000106"
      ]
    ]
  }
}
```

**Qualitative data (include URL in each item):**
```json
{
  "moat": [
    {
      "text": "Primary moat: Ecosystem lock-in (iOS, iCloud, App Store)",
      "source": "10-K 2024, Item 1 - Business, p.1",
      "url": "https://www.sec.gov/cgi-bin/viewer?action=view&cik=320193&accession_number=0000320193-24-000123"
    },
    {
      "text": "Evidence: 2.2B active devices, 1B+ iPhone users",
      "source": "10-K 2024, Item 1, p.2",
      "url": "https://www.sec.gov/cgi-bin/viewer?action=view&cik=320193&accession_number=0000320193-24-000123"
    }
  ]
}
```

---

## URL Validation Checklist

Before finalizing Agent 1 output:

- [ ] CIK number documented (10-digit format)
- [ ] Company search URL included
- [ ] Every filing in sources array has:
  - [ ] Type (10-K, 10-Q, DEF 14A)
  - [ ] Fiscal year/period
  - [ ] Filed date
  - [ ] Accession number
  - [ ] URL (viewer or HTML)
- [ ] Every financial data row has URL in last column
- [ ] Every qualitative statement has URL field
- [ ] All URLs are valid SEC EDGAR links (no broken links)
- [ ] URLs match the cited filing (e.g., 10-K 2024 URL actually points to 2024 10-K)

---

## Testing URLs

**Verify URLs work by clicking them:**

✅ Valid URL:
```
https://www.sec.gov/cgi-bin/viewer?action=view&cik=320193&accession_number=0000320193-24-000123&xbrl_type=v
```
- Opens SEC filing viewer
- Shows correct company and filing
- Displays financial statements

❌ Invalid URL:
```
https://www.sec.gov/Archives/edgar/data/320193/wrongfile.htm
```
- Returns 404 error
- File not found

---

## Benefits of URL Documentation

### 1. Transparency
Anyone can verify our analysis by clicking the exact filing link.

### 2. Auditability
Third parties can audit our data extraction and calculations.

### 3. Reproducibility
Future evaluations can use the same filings to reproduce results.

### 4. Trust
Shows we're using primary sources, not secondary aggregators.

### 5. Compliance
Demonstrates SEC-only data sourcing policy.

---

## Example: Complete URL Chain

**Claim:**
> "Apple's EPS grew 10.5% in 2024 to $6.08"

**Verification chain:**
1. Click URL: https://www.sec.gov/cgi-bin/viewer?action=view&cik=320193&accession_number=0000320193-24-000123
2. Navigate to: Consolidated Statements of Operations (page 31)
3. Find line: "Earnings per diluted share: $6.08"
4. Check prior year (2023 10-K): $5.50
5. Calculate: (6.08 - 5.50) / 5.50 = 10.5% ✅

**Every data point in our evaluation should be verifiable this way.**

---

## Common URL Patterns

### Apple (CIK 0000320193)
```
10-K 2024: https://www.sec.gov/cgi-bin/viewer?action=view&cik=320193&accession_number=0000320193-24-000123
10-K 2023: https://www.sec.gov/cgi-bin/viewer?action=view&cik=320193&accession_number=0000320193-23-000106
DEF 14A 2025: https://www.sec.gov/cgi-bin/viewer?action=view&cik=320193&accession_number=0000320193-25-000005
```

### Tesla (CIK 0001318605)
```
10-K 2024: https://www.sec.gov/cgi-bin/viewer?action=view&cik=1318605&accession_number=0001318605-25-000008
```

### Domino's Pizza (CIK 0001286681)
```
10-K 2024: https://www.sec.gov/cgi-bin/viewer?action=view&cik=1286681&accession_number=0001286681-25-000012
```

---

## Notes

- URLs may have `&xbrl_type=v` for interactive viewer or direct `.htm` file
- Both formats are acceptable as long as they link to the correct filing
- Prefer interactive viewer URLs (easier to navigate)
- Always include accession number for precise identification
- Test URLs before finalizing output (click to verify they work)

---

**URL documentation is mandatory for every data point extracted from SEC filings.**

This is the foundation of our SEC-only data sourcing policy.
