# 📊 Buffett Evaluator

Warren Buffett's investment framework applied to modern companies. Deep-dive analyses using the legendary investor's complete methodology.

**Live Site:** https://camptracker.github.io/buffett-evaluator/  
**Auto-Deploy:** ✅ Enabled (rebuilds automatically on push to main)

## Features

- **Complete Buffett Framework**: 13-criteria evaluation (business quality, management, financials, valuation)
- **20-Year Financial History**: EPS, FCF, ROE, debt, margins analyzed over decades
- **Intrinsic Value Calculation**: Discounted cash flow (DCF) with margin of safety analysis
- **Educational Explanations**: Every section includes collapsible info explaining what it measures, why it matters, and the formulas used
- **Mobile-Friendly Design**: Responsive layout for all devices

## Companies Analyzed

### Nike (NKE)
- **Verdict**: WATCH / AVOID
- **Score**: 84/130 (65%)
- **Current Price**: $78
- **Intrinsic Value**: $55.83
- **Margin of Safety**: -28% (overvalued)

### Pinterest (PINS)
- **Verdict**: BUY / WATCH
- **Score**: 88/130 (68%)
- **Current Price**: $18.66
- **Intrinsic Value**: $29.80
- **Margin of Safety**: +37% (undervalued)

### Domino's Pizza (DPZ)
- **Verdict**: HOLD / WATCH
- **Score**: 95/130 (73%)
- **Current Price**: $377.79
- **Intrinsic Value**: $425
- **Margin of Safety**: +11% (fair value)

### Novartis (NVS)
- **Verdict**: HOLD / FAIR VALUE
- **Score**: 98/130 (75%)
- **Current Price**: $148.19
- **Intrinsic Value**: $165
- **Margin of Safety**: +10% (fair value)

## Methodology

Based on Warren Buffett's investment principles:

1. **Business Quality** - Simple, understandable, with durable competitive moat
2. **Management Quality** - Rational capital allocation, honest, long-term thinking
3. **Financial Health** - High ROE (>15%), strong margins, low debt, consistent FCF
4. **Valuation** - Intrinsic value via DCF, requiring 30%+ margin of safety

## Technology Stack

- Pure HTML/CSS/JavaScript (no frameworks)
- Static site hosted on GitHub Pages
- JSON data structure for easy company additions

## Adding New Companies

1. Create `data/[company].json` with evaluation data
2. Add company to `companies` registry in `script.js`
3. Follow the existing JSON structure (see `nike.json` or `pinterest.json`)

## Local Development

```bash
# Clone the repo
git clone https://github.com/camptracker/buffett-evaluator.git

# Open in browser
open index.html
```

No build process required—pure static files.

## Credits

Evaluation framework based on Warren Buffett's investment methodology as described in his Berkshire Hathaway shareholder letters (1977-2024) and writings of Benjamin Graham.

## Disclaimer

This is educational content, not financial advice. Do your own research before making investment decisions.

---

Built with 🔥 by [OpenClaw AI](https://openclaw.ai)
