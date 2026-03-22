#!/usr/bin/env node

/**
 * Convert Claude Code agent output to website JSON format
 * Usage: node convert-to-website.js TICKER
 */

const fs = require('fs');
const path = require('path');

// Get ticker from command line
const ticker = process.argv[2];
if (!ticker) {
  console.error('❌ Usage: node convert-to-website.js TICKER');
  console.error('   Example: node convert-to-website.js TSLA');
  process.exit(1);
}

const tickerUpper = ticker.toUpperCase();
const tickerLower = ticker.toLowerCase();

// Paths
const inputFile = path.join(__dirname, '../../evaluations', tickerUpper, 'final.json');
const outputFile = path.join(__dirname, '../../data', `${tickerLower}.json`);

// Check input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`❌ Input file not found: ${inputFile}`);
  console.error('   Run ./run.sh first to generate the evaluation');
  process.exit(1);
}

// Read agent output
console.log(`📖 Reading: ${inputFile}`);
const agentData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

// Transform to website format
const websiteData = {
  name: agentData.company,
  ticker: agentData.ticker,
  industry: agentData.industry || "Unknown",
  analysisDate: agentData.analysisDate || new Date().toISOString().split('T')[0],
  currentPrice: agentData.currentPrice || 0,
  intrinsicValue: agentData.intrinsicValue || 0,
  marginOfSafety: agentData.marginOfSafety || "0%",
  verdict: agentData.verdict || "UNKNOWN",
  score: agentData.totalScore || 0,
  oneParagraphSummary: agentData.summary || "",
  
  // Financial data tables
  financialData: agentData.financialData || {},
  
  // Qualitative analysis
  qualitativeAnalysis: agentData.qualitativeData || {},
  
  // Business quality criteria (4 items, 40 pts max)
  businessQuality: {
    criteria: agentData.businessQuality?.criteria || []
  },
  
  // Management quality criteria (3 items, 30 pts max)
  managementQuality: {
    criteria: agentData.managementQuality?.criteria || []
  },
  
  // Financial health criteria (5 items, 50 pts max)
  financialHealth: {
    criteria: agentData.financialHealth?.criteria || []
  },
  
  // Intrinsic value calculation
  intrinsicValueCalculation: agentData.intrinsicValueCalculation || {},
  
  // Scorecard (13 criteria, 130 pts total)
  scorecard: agentData.scorecard || {},
  
  // Final verdict
  finalVerdict: {
    summary: agentData.summary || "",
    biggestRisk: agentData.biggestRisk || "",
    comparable: agentData.comparable || ""
  }
};

// Write to website data file
console.log(`💾 Writing: ${outputFile}`);
fs.writeFileSync(outputFile, JSON.stringify(websiteData, null, 2));

console.log(`✅ Website data created successfully`);
console.log(``);
console.log(`📊 Summary:`);
console.log(`   Company: ${websiteData.name} (${websiteData.ticker})`);
console.log(`   Score: ${websiteData.score}/130 (${Math.round(websiteData.score/130*100)}%)`);
console.log(`   Verdict: ${websiteData.verdict}`);
console.log(`   Intrinsic Value: $${websiteData.intrinsicValue}`);
console.log(`   Current Price: $${websiteData.currentPrice}`);
console.log(`   Margin of Safety: ${websiteData.marginOfSafety}`);
console.log(``);
console.log(`Next steps:`);
console.log(`   1. Register in script.js:`);
console.log(`      Add '${tickerLower}: "data/${tickerLower}.json"' to companies object`);
console.log(`   2. Validate:`);
console.log(`      cd ~/Documents/buffett-evaluator && node validate-data.js`);
console.log(`   3. Test locally:`);
console.log(`      python3 -m http.server 8000`);
console.log(`      Visit: http://localhost:8000/company.html?company=${tickerLower}`);
console.log(`   4. Deploy:`);
console.log(`      git add -A && git commit -m "Add ${tickerUpper} evaluation" && git push`);
