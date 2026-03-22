# Buffett Evaluator - Multi-Agent System

## What Is This?

The original Buffett evaluation prompt is **52 pages long** and can hit context limits. This multi-agent system splits it into **6 specialized sub-agents**, each handling one piece:

1. **Data Collector** - Gathers all financial + qualitative data
2. **Business Quality** - Evaluates 4 business criteria (40 pts)
3. **Management Quality** - Evaluates 3 management criteria (30 pts)
4. **Financial Health** - Evaluates 5 financial metrics (50 pts)
5. **Valuation** - Calculates DCF intrinsic value (10 pts)
6. **Scorecard & Verdict** - Compiles final score + verdict

**Total:** 130 points across 13 criteria

---

## Why Use Sub-Agents?

### Problems with Monolithic Prompt:
❌ 52 pages = context overload  
❌ Hard to debug errors  
❌ Must re-run entire evaluation if one section fails  
❌ Single point of failure  

### Benefits of Sub-Agents:
✅ Each agent sees only 5-10 pages  
✅ Easy to isolate and fix errors  
✅ Re-run only failed agents  
✅ Agents 2-4 can run in parallel  
✅ Better quality (specialization)  

---

## Quick Start

### 1. Pick a Company
```bash
COMPANY="Tesla"
TICKER="TSLA"
```

### 2. Run Sub-Agent 1 (Data Collector)

**Open Claude, paste this:**
```bash
cat subagents/1-data-collector.md | \
  sed "s/\[COMPANY NAME\]/$COMPANY/g" | \
  sed "s/\[TICKER\]/$TICKER/g"
```

**Wait for output (60-90 min), then save it:**
```bash
cat > agent1-output.json << 'EOF'
{PASTE_CLAUDE_OUTPUT_HERE}
EOF
```

### 3. Run Sub-Agents 2-4 (Parallel)

For each agent:
```bash
# Replace {PREVIOUS_AGENT_OUTPUT} with agent1-output.json contents
# Paste into new Claude conversation

# Agent 2: Business Quality
cat subagents/2-business-quality.md

# Agent 3: Management Quality  
cat subagents/3-management-quality.md

# Agent 4: Financial Health
cat subagents/4-financial-health.md
```

Save each output as `agent2-output.json`, `agent3-output.json`, `agent4-output.json`

### 4. Merge and Run Sub-Agent 5 (Valuation)

```bash
# Merge agents 1-4
jq -s '.[0] * .[1] * .[2] * .[3]' \
  agent1-output.json agent2-output.json \
  agent3-output.json agent4-output.json > merged.json

# Run Agent 5 with merged data
cat subagents/5-valuation.md
# (replace {PREVIOUS_AGENT_OUTPUT} with merged.json)

# Save output
cat > agent5-output.json << 'EOF'
{PASTE_OUTPUT_HERE}
EOF
```

### 5. Final Scorecard (Sub-Agent 6)

```bash
# Merge all 5 agents
jq -s '.[0] * .[1] * .[2] * .[3] * .[4]' \
  agent1-output.json agent2-output.json agent3-output.json \
  agent4-output.json agent5-output.json > all-merged.json

# Run Agent 6
cat subagents/6-scorecard-verdict.md
# (replace {PREVIOUS_AGENT_OUTPUT} with all-merged.json)

# This is your final evaluation!
```

### 6. Convert to Website Format

```bash
# Manually structure the output to match data/dominos.json format
# Save as data/[ticker].json
# Validate and deploy

cd ~/Documents/buffett-evaluator
node validate-data.js
git push
```

---

## File Structure

```
subagents/
├── README.md                    ← You are here
├── ORCHESTRATOR.md              ← Detailed workflow instructions
├── 1-data-collector.md          ← Agent 1: Gather data
├── 2-business-quality.md        ← Agent 2: Business criteria
├── 3-management-quality.md      ← Agent 3: Management criteria
├── 4-financial-health.md        ← Agent 4: Financial metrics
├── 5-valuation.md               ← Agent 5: DCF calculation
├── 6-scorecard-verdict.md       ← Agent 6: Final verdict
└── orchestrate.js               ← (TODO) Automation script
```

---

## Workflow Diagram

```
Input: Company Name + Ticker
         │
         ▼
┌─────────────────────┐
│ 1. Data Collector   │  60-90 min
│ → Financial data    │
│ → Qualitative data  │
└─────────────────────┘
         │
    ┌────┼────┐
    ▼    ▼    ▼
┌──────┐ ┌──────┐ ┌──────┐
│ 2.   │ │ 3.   │ │ 4.   │  20-30 min each
│ Biz  │ │ Mgmt │ │ Fin  │  (run parallel)
│ (40) │ │ (30) │ │ (50) │
└──────┘ └──────┘ └──────┘
    │      │      │
    └──────┼──────┘
           ▼
    ┌─────────────┐
    │ 5. Valuation│  30-45 min
    │ DCF + MoS   │
    │ (10 pts)    │
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │ 6. Scorecard│  15-20 min
    │ & Verdict   │
    │ (130 total) │
    └─────────────┘
           │
           ▼
    Final JSON Output
```

**Total time:** 2-3 hours (with parallelization)

---

## Agent Responsibilities

| Agent | Input | Output | Points | Time |
|-------|-------|--------|--------|------|
| 1. Data Collector | Company + Ticker | Financial tables + Qualitative lists | N/A | 60-90m |
| 2. Business Quality | Agent 1 data | 4 criterion scores | 40 | 20-30m |
| 3. Management Quality | Agent 1 data | 3 criterion scores | 30 | 20-30m |
| 4. Financial Health | Agent 1 data | 5 criterion scores | 50 | 20-30m |
| 5. Valuation | Agents 1-4 merged | DCF + Intrinsic Value | 10 | 30-45m |
| 6. Scorecard | All agents merged | Final verdict | 130 | 15-20m |

---

## Example: Tesla Evaluation

### Agent 1 Output (snippet):
```json
{
  "company": "Tesla",
  "ticker": "TSLA",
  "currentPrice": 195.00,
  "financialData": {
    "eps": {
      "headers": ["Year", "EPS", "Growth"],
      "rows": [
        ["2024", "3.65", "+19%"],
        ["2023", "3.07", "+12%"]
      ]
    }
  }
}
```

### Agent 2 Output:
```json
{
  "businessQuality": {
    "criteria": [
      {
        "title": "Simple & Understandable",
        "rating": "6/10",
        "verdict": "PASS"
      }
    ],
    "totalScore": 28,
    "maxScore": 40
  }
}
```

### Final Output (Agent 6):
```json
{
  "scorecard": {
    "scores": {
      "rows": [
        ["Business Quality", "Simple", "6/10", "PASS"],
        ["...", "...", "...", "..."],
        ["**TOTAL**", "", "**82/130**", "63%"]
      ]
    }
  },
  "finalVerdict": {
    "verdict": "WATCH",
    "summary": "Tesla is a growing EV manufacturer with strong brand but high execution risk..."
  }
}
```

---

## Tips

### For Best Results:
1. **Run Agent 1 first, validate output before proceeding**
2. **Agents 2-4 can run in parallel** (save time)
3. **Use jq to merge JSON** (cleaner than manual copy-paste)
4. **Validate each agent's output** before passing to next agent
5. **Keep context clean** - don't include unnecessary prior chat history

### Common Issues:
- **Agent 1 missing data:** Some companies lack 10-20 years of history
- **Valuation unrealistic:** Check growth rate assumptions
- **Scorecard math wrong:** Use `fix-scorecards.js` to auto-correct

---

## Automation (Future)

**TODO: Build `orchestrate.js`** to:
- Auto-spawn each agent via `sessions_spawn`
- Extract JSON from responses
- Merge outputs automatically
- Convert to website JSON format
- Validate and deploy

```bash
# Future usage:
node orchestrate.js --company "Tesla" --ticker "TSLA"

# Output: data/tsla.json (ready for website)
```

---

## Comparison: Monolithic vs Multi-Agent

| Aspect | Monolithic Prompt | Multi-Agent System |
|--------|-------------------|-------------------|
| Context size | 52 pages all at once | 5-10 pages per agent |
| Runtime | 2-3 hours sequential | 2-3 hours (parallel possible) |
| Error recovery | Re-run entire evaluation | Re-run only failed agent |
| Quality | Generalist (jack of all trades) | Specialist (expert per domain) |
| Debugging | Hard to isolate issues | Easy to pinpoint failures |
| Parallelization | No | Yes (agents 2-4) |
| Flexibility | One-size-fits-all | Swap agents as needed |

---

## Next Steps

1. **Test the system** - Evaluate a known company (Apple, Amazon, etc.)
2. **Build automation** - Create `orchestrate.js` script
3. **Document learnings** - Update prompts based on real evaluations
4. **Optimize runtime** - Find ways to speed up agents
5. **Add validation** - Auto-check outputs before merging

---

**Read ORCHESTRATOR.md for detailed workflow instructions.**

**The multi-agent approach trades simplicity for modularity, quality, and scalability.** 🎯
