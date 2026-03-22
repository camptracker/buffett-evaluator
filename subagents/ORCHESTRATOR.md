# Buffett Evaluation Orchestrator

## Overview

This multi-agent system splits the Buffett evaluation into 6 specialized sub-agents, each handling isolated context. This approach:
- Avoids context limit issues (each agent sees only relevant data)
- Enables parallelization (agents 2-4 can run concurrently after agent 1)
- Improves quality (specialized focus per agent)
- Makes debugging easier (isolate issues to specific agents)

---

## Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │  Sub-Agent 1: Data Collector       │
         │  - Gather financial data           │
         │  - Gather qualitative data         │
         │  Output: JSON data                 │
         └────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
    ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
    │  Sub-Agent 2:   │ │ Sub-Agent 3: │ │ Sub-Agent 4: │
    │  Business       │ │ Management   │ │ Financial    │
    │  Quality        │ │ Quality      │ │ Health       │
    │  (40 pts)       │ │ (30 pts)     │ │ (50 pts)     │
    └─────────────────┘ └──────────────┘ └──────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                   ┌──────────────────────┐
                   │  Sub-Agent 5:        │
                   │  Valuation           │
                   │  (DCF, MoS, 10 pts)  │
                   └──────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │  Sub-Agent 6:        │
                   │  Scorecard & Verdict │
                   │  (Final output)      │
                   └──────────────────────┘
                              │
                              ▼
                        Final JSON Output
```

---

## Usage Instructions

### Option 1: Manual Sequential Execution

**Step 1: Prepare inputs**
```bash
COMPANY="Tesla"
TICKER="TSLA"
```

**Step 2: Run Sub-Agent 1 (Data Collector)**
```bash
# Open a new Claude conversation
# Copy subagents/1-data-collector.md
# Replace [COMPANY NAME] with "Tesla"
# Replace [TICKER] with "TSLA"
# Run in Claude

# Save output to file:
cat > agent1-output.json << 'EOF'
{PASTE_OUTPUT_HERE}
EOF
```

**Step 3: Run Sub-Agents 2-4 in parallel**

For each agent (2, 3, 4):
```bash
# Open new Claude conversation
# Copy subagents/X-[agent-name].md
# Replace {PREVIOUS_AGENT_OUTPUT} with agent1-output.json contents
# Run in Claude

# Save outputs:
cat > agent2-output.json << 'EOF'
{PASTE_OUTPUT_HERE}
EOF

cat > agent3-output.json << 'EOF'
{PASTE_OUTPUT_HERE}
EOF

cat > agent4-output.json << 'EOF'
{PASTE_OUTPUT_HERE}
EOF
```

**Step 4: Merge outputs for Sub-Agent 5**
```bash
# Combine agent 1-4 outputs into one JSON
jq -s '.[0] * .[1] * .[2] * .[3]' \
  agent1-output.json \
  agent2-output.json \
  agent3-output.json \
  agent4-output.json > agent1-4-merged.json

# Run Sub-Agent 5 (Valuation)
# Copy subagents/5-valuation.md
# Replace {PREVIOUS_AGENT_OUTPUT} with agent1-4-merged.json
# Run in Claude
# Save output:
cat > agent5-output.json << 'EOF'
{PASTE_OUTPUT_HERE}
EOF
```

**Step 5: Final scorecard (Sub-Agent 6)**
```bash
# Merge all 5 outputs
jq -s '.[0] * .[1] * .[2] * .[3] * .[4]' \
  agent1-output.json \
  agent2-output.json \
  agent3-output.json \
  agent4-output.json \
  agent5-output.json > all-agents-merged.json

# Run Sub-Agent 6 (Scorecard & Verdict)
# Copy subagents/6-scorecard-verdict.md
# Replace {PREVIOUS_AGENT_OUTPUT} with all-agents-merged.json
# Run in Claude

# Save final output:
cat > final-evaluation.json << 'EOF'
{PASTE_OUTPUT_HERE}
EOF
```

**Step 6: Convert to website format**
```bash
# Manually restructure final-evaluation.json to match
# the website's JSON schema (see data/dominos.json for template)

# Save as data/[ticker].json
cp final-evaluation.json ~/Documents/buffett-evaluator/data/tsla.json

# Validate
cd ~/Documents/buffett-evaluator
node validate-data.js
```

---

### Option 2: Automated via OpenClaw sessions_spawn

**Use sessions_spawn to run each sub-agent automatically:**

```bash
# Sub-Agent 1: Data Collection
openclaw sessions spawn \
  --task "$(cat subagents/1-data-collector.md | sed 's/\[COMPANY NAME\]/Tesla/g' | sed 's/\[TICKER\]/TSLA/g')" \
  --label "buffett-data-tsla" \
  --cleanup keep

# Wait for completion, retrieve output
openclaw sessions history buffett-data-tsla > agent1-output.txt

# Extract JSON from output
# (manual step - parse the JSON from Claude's response)

# Sub-Agent 2-4 (parallel)
openclaw sessions spawn \
  --task "$(cat subagents/2-business-quality.md | sed \"s/{PREVIOUS_AGENT_OUTPUT}/$(cat agent1-output.json)/g\")" \
  --label "buffett-business-tsla" \
  --cleanup keep

openclaw sessions spawn \
  --task "$(cat subagents/3-management-quality.md | sed \"s/{PREVIOUS_AGENT_OUTPUT}/$(cat agent1-output.json)/g\")" \
  --label "buffett-management-tsla" \
  --cleanup keep

openclaw sessions spawn \
  --task "$(cat subagents/4-financial-health.md | sed \"s/{PREVIOUS_AGENT_OUTPUT}/$(cat agent1-output.json)/g\")" \
  --label "buffett-financial-tsla" \
  --cleanup keep

# Continue chaining...
```

---

### Option 3: Future Automation Script

**TODO: Create `orchestrate.js` that:**
1. Reads company name + ticker from CLI args
2. Spawns each sub-agent via sessions_spawn
3. Waits for completion
4. Extracts JSON from responses
5. Merges outputs
6. Passes merged data to next agent
7. Outputs final JSON in website format
8. Auto-validates with validate-data.js
9. Auto-registers in script.js
10. Auto-commits and pushes to GitHub

---

## Sub-Agent Summaries

### 1. Data Collector (Input: Company/Ticker → Output: Financial + Qualitative JSON)
- **Context size:** Large (needs to gather 10-20 years of data)
- **Runtime:** 60-90 minutes
- **Output:** ~2-3KB JSON with all financial tables + qualitative lists

### 2. Business Quality (Input: Agent 1 JSON → Output: 4 criteria scores)
- **Context size:** Medium (Agent 1 data + prompt)
- **Runtime:** 20-30 minutes
- **Output:** 4 scores (40 points max)

### 3. Management Quality (Input: Agent 1 JSON → Output: 3 criteria scores)
- **Context size:** Medium
- **Runtime:** 20-30 minutes
- **Output:** 3 scores (30 points max)

### 4. Financial Health (Input: Agent 1 JSON → Output: 5 criteria scores)
- **Context size:** Medium
- **Runtime:** 20-30 minutes
- **Output:** 5 scores (50 points max)

### 5. Valuation (Input: Agents 1-4 merged → Output: DCF + MoS + score)
- **Context size:** Medium-Large (all prior data + calculations)
- **Runtime:** 30-45 minutes
- **Output:** Full DCF tables + intrinsic value + 10-point score

### 6. Scorecard & Verdict (Input: All agents merged → Output: Final verdict)
- **Context size:** Large (all prior outputs)
- **Runtime:** 15-20 minutes
- **Output:** Complete scorecard + verdict + summary

**Total runtime:** ~3-4 hours sequential, ~2-3 hours if parallelizing agents 2-4

---

## Advantages Over Monolithic Prompt

### 1. **Context Management**
- Monolithic: 52 pages all at once (can hit context limits)
- Sub-agents: Each sees only ~5-10 pages max

### 2. **Specialization**
- Monolithic: One agent does everything (jack of all trades)
- Sub-agents: Each agent is expert in one domain

### 3. **Debugging**
- Monolithic: Hard to isolate errors
- Sub-agents: Easy to identify which step failed

### 4. **Parallelization**
- Monolithic: Sequential only
- Sub-agents: Agents 2-4 can run simultaneously

### 5. **Iteration**
- Monolithic: Re-run entire evaluation if one section is wrong
- Sub-agents: Re-run only the failed agent

### 6. **Quality Control**
- Monolithic: Hard to validate intermediate steps
- Sub-agents: Validate each agent's output before proceeding

---

## Files in This Directory

```
subagents/
├── ORCHESTRATOR.md              ← This file (instructions)
├── 1-data-collector.md          ← Sub-Agent 1 prompt
├── 2-business-quality.md        ← Sub-Agent 2 prompt
├── 3-management-quality.md      ← Sub-Agent 3 prompt
├── 4-financial-health.md        ← Sub-Agent 4 prompt
├── 5-valuation.md               ← Sub-Agent 5 prompt
├── 6-scorecard-verdict.md       ← Sub-Agent 6 prompt
└── orchestrate.js               ← (TODO) Automation script
```

---

## Next Steps

1. **Test the system:** Run a manual evaluation on a known company (e.g., Apple)
2. **Build orchestrate.js:** Automate the full workflow
3. **Integrate with website:** Auto-generate JSON in correct format
4. **Add retry logic:** Handle agent failures gracefully
5. **Parallel execution:** Run agents 2-4 simultaneously via sessions_spawn

---

## Notes

- Each sub-agent prompt is designed to be copy-pasted into Claude as-is
- Replace `[COMPANY NAME]`, `[TICKER]`, and `{PREVIOUS_AGENT_OUTPUT}` before running
- Output format is strictly JSON for easy merging
- All calculations are shown step-by-step for transparency
- Scoring is consistent with Buffett's thresholds

**The multi-agent approach trades runtime for quality, modularity, and reliability.**
