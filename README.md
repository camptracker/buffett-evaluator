# 📊 Buffett Evaluator

Warren Buffett's investment framework applied to modern companies. Deep-dive analyses using the legendary investor's complete methodology.

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
- **Verdict**: MAYBE / WATCH
- **Score**: 91/130 (70%)
- **Current Price**: $37
- **Intrinsic Value**: $59.51
- **Margin of Safety**: +38% (undervalued)

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
