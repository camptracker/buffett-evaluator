# Quick Start - Claude Code Buffett Evaluator

## 1. Setup (One-time)

```bash
# Navigate to Claude Code directory
cd ~/Documents/buffett-evaluator/subagents/claude-code

# Make scripts executable (if not already)
chmod +x run.sh convert-to-website.js

# Create evaluations directory
mkdir -p ../../evaluations
```

## 2. Evaluate a Company

**NEW WORKFLOW (REQUIRED):** Download SEC files locally first, then run agents.

### Step 1: Download SEC Filings (Chrome)

```bash
# Create company folder
cd ~/Documents/buffett-evaluator/subagents/claude-code
mkdir -p evaluations/[TICKER]/filings

# Example for Pinterest (PINS):
mkdir -p evaluations/PINS/filings
```

**Manual Download (Required):**

1. **Open Chrome** and go to SEC EDGAR:
   - Search: `https://www.sec.gov/cgi-bin/browse-edgar?company=[COMPANY]&CIK=&type=10-K`
   - Example: https://www.sec.gov/cgi-bin/browse-edgar?company=pinterest&type=10-K

2. **Download 10-K filings** (last 6 years):
   - Click "Documents" for each year
   - Click the main `.htm` file (e.g., `pins-20251231.htm`)
   - Save As → `evaluations/[TICKER]/filings/10K-YYYY.htm`
   - Repeat for 2020-2025

3. **Download earnings reports** (optional, for current price):
   - Search for `type=8-K` (quarterly earnings)
   - Download 2-4 recent quarterly earnings
   - Save as `evaluations/[TICKER]/filings/8K-Q4-2024.htm`

**Why manual download?**
- SEC.gov blocks automated scraping (403 Forbidden errors)
- Chrome bypasses anti-bot protections
- One-time download (~5 min), reusable for all agents

### Step 2: Configure Company

```bash
# Create config.json
cat > config.json << 'EOF'
{
  "company": "Pinterest",
  "ticker": "PINS",
  "outputDir": "evaluations/PINS"
}
EOF
```

### Step 3: Run Agents on Local Files

### Option A: Deterministic Evaluation (Recommended)

```bash
# Step 1: Create config for company
cat > config.json << 'EOF'
{
  "company": "Apple",
  "ticker": "AAPL",
  "outputDir": "../../evaluations/AAPL"
}
EOF

# Step 2: Run deterministic evaluation (runs twice, compares, retries if needed)
./eval-deterministic.sh

# This will:
# - Run full evaluation twice
# - Compare outputs for consistency
# - Retry up to 5 times if mismatch
# - Only succeed when two consecutive runs match
```

### Option B: Single Run (Faster, No Validation)

```bash
# Step 1: Create config (same as above)

# Step 2: Run all 6 agents once
./run.sh

# This will take 2-3 hours and create:
# - evaluations/AAPL/agent1.json (Data Collector)
# - evaluations/AAPL/agent2.json (Business Quality)
# - evaluations/AAPL/agent3.json (Management Quality)
# - evaluations/AAPL/agent4.json (Financial Health)
# - evaluations/AAPL/agent5.json (Valuation)
# - evaluations/AAPL/agent6.json (Scorecard & Verdict)
# - evaluations/AAPL/final.json (Merged output)

# Step 3: Convert to website format
node convert-to-website.js AAPL

# Output: data/aapl.json

# Step 4: Register in website
# Edit script.js and add:
#   aapl: 'data/aapl.json'

# Step 5: Validate
cd ../..
node validate-data.js

# Step 6: Deploy
git add -A
git commit -m "Add Apple (AAPL) evaluation"
git push
```

## 3. Run Individual Agents

```bash
# Useful for debugging or re-running failed agents

# Run only Agent 1 (Data Collector)
./run.sh 1

# Run only Agent 5 (Valuation)
./run.sh 5

# Run all agents
./run.sh
```

## 4. Check Progress

```bash
# View agent outputs
jq . ../../evaluations/AAPL/agent1.json | less
jq . ../../evaluations/AAPL/final.json | less

# Check agent status
ls -lh ../../evaluations/AAPL/

# View summary
jq '{company, ticker, score: .totalScore, verdict}' ../../evaluations/AAPL/final.json
```

## 5. Workflow Diagram

```
Chrome Download (manual, 5 min)
    ↓
evaluations/[TICKER]/filings/
    ├─ 10K-2020.htm
    ├─ 10K-2021.htm
    ├─ 10K-2022.htm
    ├─ 10K-2023.htm
    ├─ 10K-2024.htm
    ├─ 10K-2025.htm
    └─ 8K-*.htm (earnings)
    ↓
config.json
    ↓
./run.sh
    ↓
Agent 1: Data Collector (60-90 min)
    [Reads local filings/*.htm files ONLY - no web scraping]
    ↓ agent1.json
    ├─→ Agent 2: Business Quality (20-30 min) → agent2.json
    ├─→ Agent 3: Management Quality (20-30 min) → agent3.json
    └─→ Agent 4: Financial Health (20-30 min) → agent4.json
        ↓ (merged)
Agent 5: Valuation (30-45 min)
    ↓ agent5.json
    ↓ (merged all)
Agent 6: Scorecard & Verdict (15-20 min)
    ↓ agent6.json
    ↓ (final merge)
final.json
    ↓
convert-to-website.js
    ↓
data/aapl.json
```

**Key Change:** Agent 1 now reads from local `filings/` directory instead of fetching from SEC.gov. This avoids 403 Forbidden errors and enables reproducible evaluations.

## 6. Debugging

```bash
# Check for JSON syntax errors
jq empty ../../evaluations/AAPL/*.json

# View agent prompts (saved for debugging)
cat ../../evaluations/AAPL/agent1-prompt.txt

# Test JSON merge manually
jq -s 'reduce .[] as $item ({}; . * $item.data)' \
  ../../evaluations/AAPL/agent{1,2,3,4,5,6}.json

# Validate specific agent output
node ../../validate-data.js
```

## 7. Common Issues

### Issue: Agent fails with "file not found"
**Solution:** Check `outputDir` in config.json is correct

### Issue: JSON syntax error
**Solution:** Run `jq . file.json` to see exact error

### Issue: Claude Code not found
**Solution:** Install Claude Code CLI (see AGENTS.md)

### Issue: Agent produces incomplete data
**Solution:** Re-run that specific agent: `./run.sh 3`

## 8. Tips

- **Parallel agents 2-4:** After agent 1 completes, agents 2-4 can run in parallel (future enhancement)
- **Incremental updates:** Re-run only changed agents instead of full evaluation
- **Batch processing:** Create multiple config files and loop through them
- **Version control:** All agent outputs are saved, enabling easy diffs between evaluation runs

## 9. Example: Full Workflow

```bash
# Tesla evaluation from scratch
cd ~/Documents/buffett-evaluator/subagents/claude-code

# 1. Download SEC files (Chrome - manual)
mkdir -p evaluations/TSLA/filings
# Use Chrome to download 10-Ks from:
# https://www.sec.gov/cgi-bin/browse-edgar?company=tesla&type=10-K
# Save as: evaluations/TSLA/filings/10K-2020.htm through 10K-2025.htm

# 2. Configure
echo '{"company":"Tesla","ticker":"TSLA","outputDir":"evaluations/TSLA"}' > config.json

# 3. Run evaluation (2-3 hours)
./run.sh

# 4. Review output
jq '.totalScore, .verdict, .marginOfSafety' evaluations/TSLA/final.json

# Output:
# 82
# "WATCH"
# "-5%"

# 5. Convert to website
node convert-to-website.js TSLA

# 6. Register in website
# (Edit ../../script.js manually to add tsla entry)

# 7. Validate
cd ../..
node validate-data.js

# 8. Deploy
git add -A && git commit -m "Add Tesla evaluation" && git push

# Done! Check https://camptracker.github.io/buffett-evaluator/
```

## 10. Next: Automation

Future enhancement - create cron job:

```bash
# Crontab entry (re-evaluate weekly)
0 2 * * 0 cd ~/Documents/buffett-evaluator/subagents/claude-code && ./batch-evaluate.sh

# batch-evaluate.sh would:
# - Loop through all companies in companies.json
# - Run evaluation for each
# - Auto-commit and push updates
```

---

**That's it! The Claude Code workflow is fully file-based, reproducible, and version-controlled.** 🔥
