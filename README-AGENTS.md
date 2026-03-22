# Buffett Evaluator - Multi-Agent Interface

## Overview

This is a refactored version of the Buffett Evaluator website that renders all 6 sub-agent outputs separately, allowing users to see the detailed breakdown of each evaluation step.

## Files

- **index-agents.html** - Main page with agent sections
- **script-agents.js** - JavaScript to load and render agent data
- **styles-agents.css** - Styling for multi-agent view

## Agent Structure

Each company evaluation consists of 6 agents:

1. **📊 Agent 1: Data Collector** - Financial data tables + qualitative analysis from SEC filings
2. **🏢 Agent 2: Business Quality** (40 pts) - 4 criteria: Simple, Moat, Consistency, Prospects
3. **👔 Agent 3: Management Quality** (30 pts) - 3 criteria: Capital Allocation, Transparency, Imperative Resistance
4. **💪 Agent 4: Financial Health** (50 pts) - 5 criteria: ROE, Margins, Debt, FCF, CapEx
5. **💎 Agent 5: Valuation** (10 pts) - DCF intrinsic value + margin of safety
6. **📋 Agent 6: Final Verdict** (130 pts total) - Scorecard + BUY/HOLD/AVOID verdict

## Data Structure

Each agent produces a separate JSON file:
```
evaluations/[TICKER]/
  ├── agent1.json  (Data Collector)
  ├── agent2.json  (Business Quality)
  ├── agent3.json  (Management Quality)
  ├── agent4.json  (Financial Health)
  ├── agent5.json  (Valuation)
  └── agent6.json  (Scorecard & Verdict)
```

The website loads all 6 files and renders them in expandable sections.

## Usage

### Viewing Locally

```bash
# Open in browser
open index-agents.html
```

### Adding a New Company

1. Run the evaluation (generates agent1-6.json files)
2. Add to company registry in `script-agents.js`:
   ```javascript
   const companies = {
       'PINS': 'subagents/claude-code/evaluations/PINS',
       'NVDA': 'subagents/claude-code/evaluations/NVDA',  // NEW
   };
   ```
3. Refresh page - new company appears in dropdown

## Features

- ✅ Expandable/collapsible agent sections
- ✅ Color-coded PASS/FAIL criteria
- ✅ Score badges for each agent
- ✅ SEC filing citations for every data point
- ✅ Full financial tables from Agent 1
- ✅ Detailed reasoning for every rating
- ✅ Mobile-responsive design

## Comparison to Original

| Feature | Original Site | Multi-Agent Site |
|---------|---------------|------------------|
| Data format | Single merged JSON | 6 separate agent JSONs |
| Sections | Pre-selected highlights | All agent outputs visible |
| Transparency | Final scores only | Full reasoning + sources |
| Navigation | Single scroll | Expandable sections |
| Data loss | Merging loses detail | Preserves all agent work |

## Next Steps

- [ ] Auto-discover companies from directory (no manual registry)
- [ ] Side-by-side comparison mode (e.g., PINS run1 vs run2)
- [ ] Export agent outputs to PDF
- [ ] Search/filter within agent outputs
- [ ] Timeline view showing how scores change over time

---

**Live Demo**: Open `index-agents.html` in any modern browser
