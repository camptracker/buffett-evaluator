// Company registry - maps ticker to evaluation directory
const companies = {
    'PINS (Run 1)': 'subagents/claude-code/evaluations/PINS-run1',
    'PINS (Run 2)': 'subagents/claude-code/evaluations/PINS-run2',
    'PINS (Run 3)': 'subagents/claude-code/evaluations/PINS-run3',
    'PINS (Run 4)': 'subagents/claude-code/evaluations/PINS-run4'
};

// Load available companies on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadCompanyList();
    setupEventListeners();
});

// Load list of available companies
async function loadCompanyList() {
    const select = document.getElementById('company-select');
    
    // For now, manually populate
    // TODO: Auto-discover from evaluations directory
    for (const ticker of Object.keys(companies)) {
        const option = document.createElement('option');
        option.value = ticker;
        option.textContent = ticker;
        select.appendChild(option);
    }
}

// Setup event listeners
function setupEventListeners() {
    const select = document.getElementById('company-select');
    select.addEventListener('change', (e) => {
        if (e.target.value) {
            loadCompanyEvaluation(e.target.value);
        } else {
            document.getElementById('evaluation-container').style.display = 'none';
        }
    });

    // Toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.getAttribute('data-section');
            toggleSection(section);
        });
    });
}

// Toggle section visibility
function toggleSection(sectionId) {
    const content = document.getElementById(`${sectionId}-content`);
    const btn = document.querySelector(`[data-section="${sectionId}"]`);
    
    if (content.style.display === 'none' || !content.style.display) {
        content.style.display = 'block';
        btn.textContent = '▲';
    } else {
        content.style.display = 'none';
        btn.textContent = '▼';
    }
}

// Load company evaluation from all agent files
async function loadCompanyEvaluation(ticker) {
    const basePath = companies[ticker];
    if (!basePath) {
        console.error(`Company ${ticker} not found in registry`);
        return;
    }

    // Show loading state (without destroying child elements)
    const container = document.getElementById('evaluation-container');
    const header = document.getElementById('company-header');
    if (header) {
        header.innerHTML = `
            <div style="background: white; padding: 3rem; border-radius: 8px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                <h2 style="color: #2d3748; margin-bottom: 0.5rem;">Loading Evaluation...</h2>
                <p style="color: #718096;">Fetching data for ${ticker}</p>
            </div>
        `;
    }
    
    // Hide all agent sections during loading
    for (let i = 1; i <= 6; i++) {
        const section = document.getElementById(`agent${i}-section`);
        if (section) section.style.display = 'none';
    }
    
    container.style.display = 'block';

    try {
        // Load all 6 agent files
        const agents = await Promise.all([
            fetch(`${basePath}/agent1.json`).then(r => r.json()),
            fetch(`${basePath}/agent2.json`).then(r => r.json()),
            fetch(`${basePath}/agent3.json`).then(r => r.json()),
            fetch(`${basePath}/agent4.json`).then(r => r.json()),
            fetch(`${basePath}/agent5.json`).then(r => r.json()),
            fetch(`${basePath}/agent6.json`).then(r => r.json())
        ]);

        renderEvaluation(ticker, agents);
        document.getElementById('evaluation-container').style.display = 'block';
    } catch (error) {
        console.error(`Failed to load evaluation for ${ticker}:`, error);
        const container = document.getElementById('evaluation-container');
        const header = document.getElementById('company-header');
        
        if (header) {
            header.innerHTML = `
                <div style="background: white; padding: 2rem; border-radius: 8px; text-align: center;">
                    <h2 style="color: #f56565; margin-bottom: 1rem;">⚠️ Failed to Load</h2>
                    <p style="color: #4a5568; margin-bottom: 1rem;">
                        Could not load evaluation for <strong>${ticker}</strong>
                    </p>
                    <p style="color: #718096; font-size: 0.9rem; margin-bottom: 1rem;">
                        ${error.message || 'Network error or missing data files'}
                    </p>
                    <button onclick="location.reload()" style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;">
                        Reload Page
                    </button>
                </div>
            `;
        }
        
        // Hide all agent sections on error
        for (let i = 1; i <= 6; i++) {
            const section = document.getElementById(`agent${i}-section`);
            if (section) section.style.display = 'none';
        }
        
        container.style.display = 'block';
    }
}

// Render full evaluation
function renderEvaluation(ticker, agents) {
    const [agent1, agent2, agent3, agent4, agent5, agent6] = agents;

    // Show all agent sections
    for (let i = 1; i <= 6; i++) {
        const section = document.getElementById(`agent${i}-section`);
        if (section) section.style.display = 'block';
    }

    renderHeader(agent1.data, agent6.data);
    renderAgent1(agent1.data);
    renderAgent2(agent2.data);
    renderAgent3(agent3.data);
    renderAgent4(agent4.data);
    renderAgent5(agent5.data);
    renderAgent6(agent6.data);
    
    // Expand Agent 6 (Final Verdict) by default for quick overview
    setTimeout(() => {
        const agent6Content = document.getElementById('agent6-content');
        const agent6Btn = document.querySelector('[data-section="agent6"]');
        if (agent6Content && agent6Btn) {
            agent6Content.style.display = 'block';
            agent6Btn.textContent = '▲';
        }
    }, 100);
}

// Render company header
function renderHeader(data1, data6) {
    const header = document.getElementById('company-header');
    if (!header) {
        console.error('company-header element not found');
        return;
    }
    
    const verdictClass = (data6.verdict || '').toLowerCase().replace(/\s+/g, '-');
    
    // Extract totalScoreOutOf from overallScore if missing (e.g., "77/130 (59.2%)" → 130)
    let totalScoreOutOf = data6.totalScoreOutOf;
    if (!totalScoreOutOf && data6.finalVerdict && data6.finalVerdict.overallScore) {
        const match = data6.finalVerdict.overallScore.match(/\/(\d+)/);
        if (match) totalScoreOutOf = match[1];
    }
    
    header.innerHTML = `
        <div class="company-title">
            <h1>${data1.company} (${data1.ticker})</h1>
            <div class="verdict-badge ${verdictClass}">${data6.verdict || 'CONDITIONAL'}</div>
        </div>
        <div class="company-meta">
            <span>📅 ${data1.analysisDate || 'N/A'}</span>
            <span>🏭 ${data1.industry || 'N/A'}</span>
            <span>📊 ${data6.totalScore}/${totalScoreOutOf || '?'}</span>
        </div>
        <div class="verdict-summary">
            <p>${data6.summary || ''}</p>
        </div>
    `;
}

// Render Agent 1: Data Collector
function renderAgent1(data) {
    const content = document.getElementById('agent1-content');
    
    let html = '<div class="agent1-container">';
    
    // Financial Data Tables
    html += '<h3>Financial Data</h3>';
    
    if (data.financialData) {
        const tables = ['eps', 'fcf', 'roe', 'debt', 'capex', 'margins', 'revenue'];
        
        tables.forEach(tableName => {
            const table = data.financialData[tableName];
            if (table && table.rows) {
                html += `<h4>${tableName.toUpperCase()}</h4>`;
                html += renderTable(table.headers, table.rows);
                if (table.notes) {
                    html += `<p class="table-note"><em>${table.notes}</em></p>`;
                }
            }
        });
    }
    
    // Qualitative Data
    if (data.qualitativeData) {
        html += '<h3>Qualitative Analysis</h3>';
        
        const sections = ['moat', 'management', 'industry', 'consumer'];
        sections.forEach(section => {
            const items = data.qualitativeData[section];
            if (items && items.length > 0) {
                html += `<h4>${section.charAt(0).toUpperCase() + section.slice(1)}</h4>`;
                html += '<div class="qual-items">';
                items.forEach(item => {
                    html += `
                        <div class="qual-item">
                            <strong>${item.factor || item.trend || item.metric || item.role || 'Item'}:</strong>
                            <p>${item.description || item.value || ''}</p>
                            <cite>Source: ${item.source}</cite>
                        </div>
                    `;
                });
                html += '</div>';
            }
        });
    }
    
    // Notes section (important caveats)
    if (data.notes) {
        html += '<h3>Important Notes</h3>';
        html += '<div class="notes-section" style="background: #fffaf0; padding: 1rem; border-radius: 6px; border-left: 4px solid #ed8936;">';
        for (const [key, value] of Object.entries(data.notes)) {
            if (typeof value === 'string') {
                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                html += `<p style="margin: 0.5rem 0;"><strong>${formattedKey}:</strong> ${value}</p>`;
            } else if (typeof value === 'object') {
                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                html += `<p style="margin: 0.5rem 0;"><strong>${formattedKey}:</strong></p><ul style="margin-left: 1.5rem;">`;
                for (const [subKey, subValue] of Object.entries(value)) {
                    html += `<li>${subKey}: ${subValue}</li>`;
                }
                html += '</ul>';
            }
        }
        html += '</div>';
    }
    
    html += '</div>';
    content.innerHTML = html;
}

// Render Agent 2: Business Quality
function renderAgent2(data) {
    const content = document.getElementById('agent2-content');
    const scoreElem = document.getElementById('agent2-score');
    
    const bq = data.businessQuality;
    if (!bq) return;
    
    scoreElem.textContent = `${bq.totalScore}/${bq.maxScore}`;
    
    let html = '<div class="agent2-container">';
    
    bq.criteria.forEach(criterion => {
        const passClass = criterion.verdict.toLowerCase();
        html += `
            <div class="criterion-card ${passClass}">
                <div class="criterion-header">
                    <h4>${criterion.title}</h4>
                    <span class="rating">${criterion.rating}</span>
                    <span class="verdict-tag ${passClass}">${criterion.verdict}</span>
                </div>
                <p class="description">${criterion.description}</p>
                <div class="reasoning">
                    <strong>Reasoning:</strong>
                    <p>${criterion.reasoning}</p>
                </div>
                ${criterion.metrics ? renderMetrics(criterion.metrics) : ''}
                <cite class="sec-ref">📄 ${criterion.secReference}</cite>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

// Render Agent 3: Management Quality
function renderAgent3(data) {
    const content = document.getElementById('agent3-content');
    const scoreElem = document.getElementById('agent3-score');
    
    const mq = data.managementQuality;
    if (!mq) return;
    
    scoreElem.textContent = `${mq.totalScore}/${mq.maxScore}`;
    
    let html = '<div class="agent3-container">';
    
    mq.criteria.forEach(criterion => {
        const passClass = criterion.verdict.toLowerCase();
        html += `
            <div class="criterion-card ${passClass}">
                <div class="criterion-header">
                    <h4>${criterion.title}</h4>
                    <span class="rating">${criterion.rating}</span>
                    <span class="verdict-tag ${passClass}">${criterion.verdict}</span>
                </div>
                <p class="description">${criterion.description}</p>
                <div class="reasoning">
                    <strong>Reasoning:</strong>
                    <p>${criterion.reasoning}</p>
                </div>
                ${criterion.evidence ? renderEvidence(criterion.evidence) : ''}
                ${criterion.examples ? renderExamples(criterion.examples) : ''}
                <cite class="sec-ref">📄 ${criterion.secReference}</cite>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

// Render Agent 4: Financial Health
function renderAgent4(data) {
    const content = document.getElementById('agent4-content');
    const scoreElem = document.getElementById('agent4-score');
    
    const fh = data.financialHealth;
    if (!fh) return;
    
    scoreElem.textContent = `${fh.totalScore}/${fh.maxScore}`;
    
    let html = '<div class="agent4-container">';
    
    fh.criteria.forEach(criterion => {
        const passClass = criterion.verdict.toLowerCase().replace(/\s+/g, '-');
        html += `
            <div class="criterion-card ${passClass}">
                <div class="criterion-header">
                    <h4>${criterion.title}</h4>
                    <span class="rating">${criterion.rating}</span>
                    <span class="verdict-tag ${passClass}">${criterion.verdict}</span>
                </div>
                <p class="description">${criterion.description}</p>
                <div class="reasoning">
                    <strong>Reasoning:</strong>
                    <p>${criterion.reasoning}</p>
                </div>
                ${criterion.metrics ? renderMetrics(criterion.metrics) : ''}
                <cite class="sec-ref">📄 ${criterion.secReference}</cite>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

// Render Agent 5: Valuation
function renderAgent5(data) {
    const content = document.getElementById('agent5-content');
    
    const val = data.valuation;
    const calc = data.intrinsicValueCalculation;
    if (!val && !calc) return;
    
    let html = '<div class="agent5-container">';
    
    // Intrinsic Value Summary
    if (val) {
        html += `
            <div class="valuation-summary">
                <h3>Intrinsic Value Estimate</h3>
                <div class="iv-grid">
                    <div class="iv-item">
                        <span class="iv-label">Base Case</span>
                        <span class="iv-value">$${val.baseCase || 'N/A'}</span>
                    </div>
                    <div class="iv-item">
                        <span class="iv-label">Conservative</span>
                        <span class="iv-value">$${val.conservative || 'N/A'}</span>
                    </div>
                    <div class="iv-item">
                        <span class="iv-label">Optimistic</span>
                        <span class="iv-value">$${val.optimistic || 'N/A'}</span>
                    </div>
                </div>
                ${val.note ? `<p class="val-note">${val.note}</p>` : ''}
            </div>
        `;
    }
    
    // DCF Calculation Details
    if (calc) {
        html += `
            <div class="dcf-details">
                <h3>DCF Calculation</h3>
                ${renderDCFTable(calc)}
            </div>
        `;
    }
    
    html += '</div>';
    content.innerHTML = html;
}

// Render Agent 6: Final Verdict
function renderAgent6(data) {
    const content = document.getElementById('agent6-content');
    const scoreElem = document.getElementById('agent6-score');
    
    scoreElem.textContent = `${data.totalScore}/${data.totalScoreOutOf}`;
    
    let html = '<div class="agent6-container">';
    
    // Scorecard
    if (data.scorecard) {
        html += '<h3>Scorecard</h3>';
        html += renderScorecard(data.scorecard);
    }
    
    // Final Verdict
    if (data.finalVerdict) {
        html += '<h3>Final Verdict</h3>';
        html += `<div class="final-verdict">${renderFinalVerdict(data.finalVerdict)}</div>`;
    }
    
    // Biggest Risk
    if (data.biggestRisk) {
        html += `
            <div class="risk-section">
                <h3>⚠️ Biggest Risk</h3>
                <p>${data.biggestRisk}</p>
            </div>
        `;
    }
    
    // Comparable
    if (data.comparable) {
        html += `
            <div class="comparable-section">
                <h3>🔍 Berkshire Comparable</h3>
                <p>${data.comparable}</p>
            </div>
        `;
    }
    
    html += '</div>';
    content.innerHTML = html;
}

// Helper: Render table (with mobile scroll wrapper)
function renderTable(headers, rows) {
    let html = '<div class="table-wrapper"><table class="data-table"><thead><tr>';
    headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';
    rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => html += `<td>${cell}</td>`);
        html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
}

// Helper: Render metrics (handles nested objects)
function renderMetrics(metrics) {
    let html = '<div class="metrics">';
    for (const [key, value] of Object.entries(metrics)) {
        // Handle nested objects (e.g., yearlyROE with years as keys)
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            html += `<div class="metric-item"><strong>${key}:</strong><ul style="margin-left: 1.5rem; margin-top: 0.5rem;">`;
            for (const [subKey, subValue] of Object.entries(value)) {
                html += `<li><strong>${subKey}:</strong> ${subValue}</li>`;
            }
            html += '</ul></div>';
        } else {
            html += `<div class="metric-item"><strong>${key}:</strong> ${value}</div>`;
        }
    }
    html += '</div>';
    return html;
}

// Helper: Render examples
function renderExamples(examples) {
    let html = '<div class="examples"><strong>Examples:</strong><ul>';
    examples.forEach(ex => html += `<li>${ex}</li>`);
    html += '</ul></div>';
    return html;
}

// Helper: Render evidence (for Agent 3)
function renderEvidence(evidence) {
    let html = '<div class="evidence" style="margin: 1rem 0;"><strong>Evidence:</strong><ul style="margin-left: 1.5rem; margin-top: 0.5rem;">';
    evidence.forEach(item => html += `<li style="margin-bottom: 0.5rem;">${item}</li>`);
    html += '</ul></div>';
    return html;
}

// Helper: Render DCF table
function renderDCFTable(calc) {
    let html = '';
    
    // DCF Inputs table
    if (calc.inputs && calc.inputs.headers && calc.inputs.rows) {
        html += '<h4 style="margin-top: 1.5rem;">DCF Inputs</h4>';
        html += renderTable(calc.inputs.headers, calc.inputs.rows);
    }
    
    // Projected FCF table
    if (calc.projectedFCF && calc.projectedFCF.headers && calc.projectedFCF.rows) {
        html += '<h4 style="margin-top: 1.5rem;">10-Year Projected Free Cash Flow</h4>';
        html += renderTable(calc.projectedFCF.headers, calc.projectedFCF.rows);
    }
    
    // Terminal Value details
    if (calc.terminalValue) {
        html += '<div style="margin-top: 1.5rem; padding: 1rem; background: #f7fafc; border-radius: 6px;">';
        html += '<h4>Terminal Value Calculation</h4>';
        for (const [key, value] of Object.entries(calc.terminalValue)) {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            html += `<p style="margin: 0.5rem 0;"><strong>${formattedKey}:</strong> ${value}</p>`;
        }
        html += '</div>';
    }
    
    // Summary metrics
    if (calc.summary) {
        html += '<div style="margin-top: 1.5rem; padding: 1rem; background: #fffaf0; border-left: 4px solid #ed8936; border-radius: 4px;">';
        html += '<h4>Valuation Summary</h4>';
        for (const [key, value] of Object.entries(calc.summary)) {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            html += `<p style="margin: 0.5rem 0;"><strong>${formattedKey}:</strong> ${value}</p>`;
        }
        html += '</div>';
    }
    
    return html || '<p>No DCF calculation details available</p>';
}

// Helper: Render scorecard (with mobile scroll wrapper)
function renderScorecard(scorecard) {
    if (!scorecard.scores) return '';
    
    let html = '<div class="table-wrapper"><table class="scorecard-table"><thead><tr>';
    scorecard.scores.headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';
    
    scorecard.scores.rows.forEach(row => {
        const isTotal = row[0].includes('TOTAL') || row[0].includes('**');
        html += `<tr class="${isTotal ? 'total-row' : ''}">`;
        row.forEach((cell, idx) => {
            const cellContent = String(cell).replace(/\*\*/g, '');
            html += `<td${isTotal ? ' class="total-cell"' : ''}>${cellContent}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    return html;
}

// Helper: Render final verdict
function renderFinalVerdict(verdict) {
    let html = '';
    
    if (verdict.conditionalVerdict) {
        html += '<div class="conditional-verdict"><h4>Price-Based Verdict:</h4><ul>';
        for (const [key, value] of Object.entries(verdict.conditionalVerdict)) {
            html += `<li><strong>${key}:</strong> ${value}</li>`;
        }
        html += '</ul></div>';
    }
    
    if (verdict.businessQualityVerdict) {
        html += `<p><strong>Business Quality:</strong> ${verdict.businessQualityVerdict}</p>`;
    }
    
    if (verdict.summary) {
        html += `<p>${verdict.summary}</p>`;
    }
    
    return html;
}
