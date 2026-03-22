// Company data registry
const companies = {};

// Initialize page based on URL
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const companyId = params.get('company');

    if (path.includes('company.html') && companyId) {
        loadCompanyPage(companyId);
    } else {
        loadHomePage();
    }
});

// Load homepage with company cards
async function loadHomePage() {
    const container = document.getElementById('company-list');
    if (!container) return;

    for (const [id, dataPath] of Object.entries(companies)) {
        try {
            const response = await fetch(dataPath);
            const data = await response.json();
            container.appendChild(createCompanyCard(id, data));
        } catch (error) {
            console.error(`Failed to load ${id}:`, error);
        }
    }
}

// Create company card for homepage
function createCompanyCard(id, data) {
    const card = document.createElement('a');
    card.href = `company.html?company=${id}`;
    card.className = 'company-card';

    const verdictClass = data.verdict.toLowerCase().replace(/\s+/g, '-');
    
    card.innerHTML = `
        <h2>${data.name}</h2>
        <div class="company-ticker">${data.ticker}</div>
        <div class="company-verdict ${verdictClass}">${data.verdict}</div>
        <div class="company-score">${data.score}/130</div>
        <div class="company-highlights">
            <p><strong>Current Price:</strong> $${data.currentPrice}</p>
            <p><strong>Intrinsic Value:</strong> $${data.intrinsicValue}</p>
            <p><strong>Margin of Safety:</strong> ${data.marginOfSafety}</p>
        </div>
    `;

    return card;
}

// Load individual company page
async function loadCompanyPage(companyId) {
    const dataPath = companies[companyId];
    if (!dataPath) {
        document.body.innerHTML = '<div class="container"><h1>Company not found</h1></div>';
        return;
    }

    try {
        const response = await fetch(dataPath);
        const data = await response.json();
        renderCompanyPage(data);
    } catch (error) {
        console.error('Failed to load company data:', error);
        document.body.innerHTML = '<div class="container"><h1>Error loading company data</h1></div>';
    }
}

// Render full company evaluation page
function renderCompanyPage(data) {
    document.getElementById('page-title').textContent = `${data.name} (${data.ticker}) - Buffett Evaluator`;
    document.getElementById('company-name').textContent = `${data.name} (${data.ticker})`;
    
    document.getElementById('company-meta').innerHTML = `
        <span><strong>Analysis Date:</strong> ${data.analysisDate}</span>
        <span><strong>Industry:</strong> ${data.industry}</span>
        <span><strong>Score:</strong> ${data.score}/130</span>
    `;

    renderVerdictCard(data);
    renderEvaluationContent(data);
}

// Render verdict summary card
function renderVerdictCard(data) {
    const card = document.getElementById('verdict-card');
    const verdictClass = data.verdict.toLowerCase().replace(/\s+/g, '-');
    
    card.innerHTML = `
        <div class="company-verdict ${verdictClass}">${data.verdict}</div>
        <h2>${data.oneParagraphSummary}</h2>
        <div class="verdict-highlights">
            <div class="verdict-item">
                <span class="icon">💰</span>
                <div class="content">
                    <h4>Current Price</h4>
                    <p>$${data.currentPrice}</p>
                </div>
            </div>
            <div class="verdict-item">
                <span class="icon">🎯</span>
                <div class="content">
                    <h4>Intrinsic Value</h4>
                    <p>$${data.intrinsicValue}</p>
                </div>
            </div>
            <div class="verdict-item">
                <span class="icon">📊</span>
                <div class="content">
                    <h4>Margin of Safety</h4>
                    <p>${data.marginOfSafety}</p>
                </div>
            </div>
            <div class="verdict-item">
                <span class="icon">🏆</span>
                <div class="content">
                    <h4>Buffett Score</h4>
                    <p>${data.score}/130 (${Math.round(data.score/130*100)}%)</p>
                </div>
            </div>
        </div>
    `;
}

// Render all evaluation sections
function renderEvaluationContent(data) {
    const container = document.getElementById('evaluation-content');
    
    const sections = [
        renderFinancialData(data.financialData),
        renderQualitativeAnalysis(data.qualitativeAnalysis),
        renderBusinessQuality(data.businessQuality),
        renderManagementQuality(data.managementQuality),
        renderFinancialHealth(data.financialHealth),
        renderIntrinsicValue(data.intrinsicValueCalculation),
        renderScorecard(data.scorecard),
        renderFinalVerdict(data.finalVerdict)
    ];

    container.innerHTML = sections.join('');
    
    // Attach event listeners to info toggles
    document.querySelectorAll('.info-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const infoId = button.getAttribute('data-info');
            const infoSection = document.getElementById(infoId);
            infoSection.classList.toggle('visible');
            button.textContent = infoSection.classList.contains('visible') ? 'Hide Info' : 'Show Info';
        });
    });
}

// Section renderers
function renderFinancialData(data) {
    return `
        <div class="section">
            <div class="section-header">
                <h2>📊 Financial Data</h2>
                <button class="info-toggle" data-info="info-financial">Show Info</button>
            </div>
            <div id="info-financial" class="section-info">
                <h4>What This Section Measures</h4>
                <p>Historical financial performance over 10-20 years to assess consistency, growth, and quality of earnings.</p>
                <h4>Why It Matters</h4>
                <p>Buffett wants businesses with predictable, growing cash flows. Erratic or declining trends indicate business instability.</p>
                <h4>Key Metrics</h4>
                <p><strong>EPS Growth:</strong> Compound Annual Growth Rate (CAGR) = (Ending EPS / Beginning EPS)^(1/years) - 1</p>
                <p><strong>FCF Margin:</strong> Free Cash Flow / Revenue (higher = more capital efficient)</p>
                <p><strong>ROE:</strong> Net Income / Shareholder Equity (measures capital efficiency, Buffett wants >15%)</p>
            </div>
            
            ${renderTable('Earnings Per Share (EPS)', data.eps)}
            ${renderTable('Free Cash Flow', data.fcf)}
            ${renderTable('Return on Equity (ROE)', data.roe)}
            ${renderTable('Debt Analysis', data.debt)}
            ${renderTable('Profit Margins', data.margins)}
        </div>
    `;
}

function renderQualitativeAnalysis(data) {
    return `
        <div class="section">
            <div class="section-header">
                <h2>🔍 Qualitative Analysis</h2>
                <button class="info-toggle" data-info="info-qualitative">Show Info</button>
            </div>
            <div id="info-qualitative" class="section-info">
                <h4>What This Section Measures</h4>
                <p>Non-financial factors: competitive moat, management quality, industry dynamics, consumer behavior.</p>
                <h4>Why It Matters</h4>
                <p>Numbers alone don't reveal if a business can sustain its advantage. Moats protect profitability long-term.</p>
                <h4>Moat Types</h4>
                <p><strong>Brand:</strong> Pricing power (Coca-Cola, Nike)</p>
                <p><strong>Network Effects:</strong> Value increases with users (Facebook, Visa)</p>
                <p><strong>Switching Costs:</strong> Hard to leave (Oracle, Bloomberg)</p>
                <p><strong>Cost Advantage:</strong> Structural low-cost (Costco, Amazon)</p>
                <p><strong>Efficient Scale:</strong> Limited competition (utilities, pipelines)</p>
            </div>
            
            <div class="subsection">
                <h3>Competitive Moat</h3>
                ${renderList(data.moat)}
            </div>
            
            <div class="subsection">
                <h3>Management Quality</h3>
                ${renderList(data.management)}
            </div>
            
            <div class="subsection">
                <h3>Industry Analysis</h3>
                ${renderList(data.industry)}
            </div>
        </div>
    `;
}

function renderBusinessQuality(data) {
    return `
        <div class="section">
            <div class="section-header">
                <h2>🏢 Business Quality</h2>
                <button class="info-toggle" data-info="info-business">Show Info</button>
            </div>
            <div id="info-business" class="section-info">
                <h4>Buffett's 4 Business Quality Tests</h4>
                <p><strong>1. Simple & Understandable:</strong> Can you explain it in 3 sentences? If not, it's outside your circle of competence.</p>
                <p><strong>2. Durable Moat:</strong> Will competitors erode profitability in 10-20 years? Wide moat = pricing power + barriers.</p>
                <p><strong>3. Consistent History:</strong> Has it been profitable for 10+ consecutive years? Volatility = unpredictability.</p>
                <p><strong>4. Favorable Prospects:</strong> Will the business be stronger (not just existing) in 20 years?</p>
            </div>
            
            ${renderCriteria(data.criteria)}
        </div>
    `;
}

function renderManagementQuality(data) {
    return `
        <div class="section">
            <div class="section-header">
                <h2>👔 Management Quality</h2>
                <button class="info-toggle" data-info="info-management">Show Info</button>
            </div>
            <div id="info-management" class="section-info">
                <h4>Buffett's 3 Management Tests</h4>
                <p><strong>1. Rational Capital Allocation:</strong> Do they deploy cash wisely? Dividends, buybacks (only when undervalued), smart acquisitions, productive reinvestment.</p>
                <p><strong>2. Honest & Transparent:</strong> Do they admit mistakes in shareholder letters? Clear earnings reporting? No misleading statements?</p>
                <p><strong>3. Resist Institutional Imperative:</strong> Do they make contrarian decisions vs blindly copying peers? Think long-term vs quarterly earnings?</p>
                <h4>Red Flags</h4>
                <p>High CEO pay despite underperformance, excessive M&A, opaque accounting, overpromising, chasing trends.</p>
            </div>
            
            ${renderCriteria(data.criteria)}
        </div>
    `;
}

function renderFinancialHealth(data) {
    return `
        <div class="section">
            <div class="section-header">
                <h2>💪 Financial Health</h2>
                <button class="info-toggle" data-info="info-health">Show Info</button>
            </div>
            <div id="info-health" class="section-info">
                <h4>Buffett's Financial Health Checklist</h4>
                <p><strong>ROE >15%:</strong> High return on equity means capital efficiency. Below 15% = mediocre business.</p>
                <p><strong>Strong Margins:</strong> Stable/improving margins indicate pricing power. Declining margins = competitive pressure.</p>
                <p><strong>Low Debt:</strong> Debt should be payable in <4 years of current earnings. High debt = financial risk.</p>
                <p><strong>Consistent FCF:</strong> Growing free cash flow is the gold standard. Formula: Operating Cash Flow - CapEx.</p>
                <p><strong>Capital Light:</strong> CapEx should be <25% of earnings. Lower = asset-light business (software, brands).</p>
            </div>
            
            ${renderCriteria(data.criteria)}
        </div>
    `;
}

function renderIntrinsicValue(data) {
    return `
        <div class="section">
            <div class="section-header">
                <h2>💎 Intrinsic Value Calculation</h2>
                <button class="info-toggle" data-info="info-valuation">Show Info</button>
            </div>
            <div id="info-valuation" class="section-info">
                <h4>Discounted Cash Flow (DCF) Method</h4>
                <p>Intrinsic value = present value of all future cash flows the business will generate.</p>
                <h4>Formula</h4>
                <p><code>PV = FCF₁/(1+r)¹ + FCF₂/(1+r)² + ... + Terminal Value/(1+r)ⁿ</code></p>
                <p><strong>Terminal Value:</strong> <code>Year 10 FCF × (1+g) / (r-g)</code></p>
                <p>Where: r = discount rate (usually 10%), g = terminal growth rate (GDP-level, 2-3%)</p>
                <h4>Margin of Safety</h4>
                <p>Buffett only buys at 30%+ discount to intrinsic value. This protects against errors in estimation.</p>
            </div>
            
            ${renderTable('Inputs', data.inputs)}
            ${renderTable('10-Year Projections', data.projections)}
            
            <div class="subsection">
                <h3>Terminal Value</h3>
                ${renderList(data.terminalValue)}
            </div>
            
            <div class="subsection">
                <h3>Final Valuation</h3>
                ${renderList(data.finalValue)}
            </div>
            
            ${renderTable('Margin of Safety Scenarios', data.scenarios)}
        </div>
    `;
}

function renderScorecard(data) {
    return `
        <div class="section">
            <div class="section-header">
                <h2>📋 Buffett Scorecard</h2>
                <button class="info-toggle" data-info="info-scorecard">Show Info</button>
            </div>
            <div id="info-scorecard" class="section-info">
                <h4>13-Criteria Framework</h4>
                <p>Each criterion scored out of 10. Total: 130 points.</p>
                <p><strong>90+:</strong> Excellent investment candidate</p>
                <p><strong>70-90:</strong> Good business, watch for better price</p>
                <p><strong>50-70:</strong> Mediocre, requires deep discount</p>
                <p><strong><50:</strong> Avoid unless transformational change</p>
            </div>
            
            ${renderTable('Scorecard', data.scores)}
        </div>
    `;
}

function renderFinalVerdict(data) {
    return `
        <div class="section">
            <div class="section-header">
                <h2>⚖️ Final Verdict</h2>
            </div>
            
            <div class="subsection">
                <h3>Summary</h3>
                <p>${data.summary}</p>
            </div>
            
            <div class="subsection">
                <h3>Biggest Risk</h3>
                <p>${data.biggestRisk}</p>
            </div>
            
            <div class="subsection">
                <h3>Comparable Buffett Holdings</h3>
                <p>${data.comparable}</p>
            </div>
        </div>
    `;
}

// Utility functions
function renderTable(title, data) {
    if (!data || !data.headers || !data.rows) return '';
    
    return `
        <div class="subsection">
            <h3>${title}</h3>
            <table>
                <thead>
                    <tr>${data.headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${data.rows.map(row => `
                        <tr>${row.map(cell => `<td>${formatCell(cell)}</td>`).join('')}</tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderList(items) {
    if (!items || items.length === 0) return '';
    return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
}

function renderCriteria(criteria) {
    if (!criteria || criteria.length === 0) return '';
    return criteria.map(c => `
        <div class="subsection">
            <h3>${c.title}</h3>
            <p>${c.description}</p>
            <p><strong>Rating:</strong> ${c.rating}</p>
            <div class="badge ${c.verdict.toLowerCase()}">${c.verdict}</div>
        </div>
    `).join('');
}

function formatCell(cell) {
    if (typeof cell === 'string' && cell.startsWith('+')) {
        return `<span class="positive">${cell}</span>`;
    }
    if (typeof cell === 'string' && cell.startsWith('-')) {
        return `<span class="negative">${cell}</span>`;
    }
    return cell;
}
