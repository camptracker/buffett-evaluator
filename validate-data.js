/**
 * Buffett Evaluator - Data Validation Script
 * 
 * Validates all company JSON files against the formulas
 * to ensure calculations are accurate.
 */

const fs = require('fs');
const path = require('path');
const formulas = require('./test-formulas.js');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Validation functions
function validateMarginOfSafety(data) {
    const errors = [];
    const warnings = [];
    
    // Parse margin of safety string (e.g., "+11%" or "-28%")
    const mosStr = data.marginOfSafety;
    const mosValue = parseFloat(mosStr.replace('%', '')) / 100;
    
    // Calculate expected MOS
    const calculated = formulas.calculateMarginOfSafety(
        data.intrinsicValue,
        data.currentPrice
    );
    
    const difference = Math.abs(mosValue - calculated);
    
    if (difference > 0.005) { // 0.5% tolerance for rounding
        errors.push({
            field: 'marginOfSafety',
            expected: `${(calculated * 100).toFixed(1)}%`,
            actual: mosStr,
            message: `Margin of Safety calculation incorrect. Expected ${(calculated * 100).toFixed(1)}% based on IV=$${data.intrinsicValue} and Price=$${data.currentPrice}`
        });
    }
    
    return { errors, warnings };
}

function validateEPSGrowth(data) {
    const errors = [];
    const warnings = [];
    
    const epsData = data.financialData.eps;
    if (!epsData || !epsData.rows || epsData.rows.length < 2) {
        warnings.push({
            field: 'eps',
            message: 'Insufficient EPS data to validate growth rates'
        });
        return { errors, warnings };
    }
    
    // Check each year's YoY growth
    for (let i = 0; i < epsData.rows.length - 1; i++) {
        const currentRow = epsData.rows[i];
        const previousRow = epsData.rows[i + 1];
        
        const currentEPS = parseFloat(currentRow[1]);
        const previousEPS = parseFloat(previousRow[1]);
        const reportedGrowth = currentRow[2];
        
        if (!reportedGrowth || reportedGrowth === '-' || reportedGrowth === 'N/A') {
            continue;
        }
        
        // Calculate expected growth
        const expectedGrowth = (currentEPS - previousEPS) / previousEPS;
        const reportedValue = parseFloat(reportedGrowth.replace('%', '').replace('+', '')) / 100;
        
        const difference = Math.abs(expectedGrowth - reportedValue);
        
        if (difference > 0.005) { // 0.5% tolerance
            errors.push({
                field: `eps.${currentRow[0]}`,
                expected: `${(expectedGrowth * 100).toFixed(1)}%`,
                actual: reportedGrowth,
                message: `EPS growth for ${currentRow[0]} incorrect. ${currentEPS} vs ${previousEPS} = ${(expectedGrowth * 100).toFixed(1)}%`
            });
        }
    }
    
    return { errors, warnings };
}

function validateScoreTotal(data) {
    const errors = [];
    const warnings = [];
    
    const scorecard = data.scorecard.scores;
    if (!scorecard || !scorecard.rows) {
        errors.push({
            field: 'scorecard',
            message: 'Scorecard data missing'
        });
        return { errors, warnings };
    }
    
    // Sum all scores except the total row
    let calculatedTotal = 0;
    let totalRow = null;
    
    for (const row of scorecard.rows) {
        if (row[0] === '**TOTAL**') {
            totalRow = row;
            continue;
        }
        
        // Extract score from "X/10" format
        const scoreMatch = row[2].match(/(\d+)\/10/);
        if (scoreMatch) {
            calculatedTotal += parseInt(scoreMatch[1]);
        }
    }
    
    if (!totalRow) {
        errors.push({
            field: 'scorecard',
            message: 'Total row not found in scorecard'
        });
        return { errors, warnings };
    }
    
    // Extract reported total from "**X/130**" format
    const totalMatch = totalRow[2].match(/\*\*(\d+)\/130\*\*/);
    if (!totalMatch) {
        errors.push({
            field: 'scorecard.total',
            message: 'Could not parse total score format'
        });
        return { errors, warnings };
    }
    
    const reportedTotal = parseInt(totalMatch[1]);
    
    if (calculatedTotal !== reportedTotal) {
        errors.push({
            field: 'scorecard.total',
            expected: `${calculatedTotal}/130`,
            actual: `${reportedTotal}/130`,
            message: `Scorecard total incorrect. Sum of individual scores = ${calculatedTotal}, reported = ${reportedTotal}`
        });
    }
    
    // Verify it matches top-level score
    if (reportedTotal !== data.score) {
        errors.push({
            field: 'score',
            expected: reportedTotal,
            actual: data.score,
            message: `Top-level score (${data.score}) doesn't match scorecard total (${reportedTotal})`
        });
    }
    
    return { errors, warnings };
}

function validateDebtMetrics(data) {
    const errors = [];
    const warnings = [];
    
    const debtData = data.financialData.debt;
    if (!debtData || !debtData.rows) {
        warnings.push({
            field: 'debt',
            message: 'Debt data missing or incomplete'
        });
        return { errors, warnings };
    }
    
    // Validate Debt/EBITDA calculations
    for (const row of debtData.rows) {
        const year = row[0];
        const debtStr = row[1];
        const ebitdaStr = row[2];
        const reportedRatio = row[3];
        
        if (!debtStr || !ebitdaStr || !reportedRatio || 
            debtStr === '-' || ebitdaStr === '-' || reportedRatio === '-') {
            continue;
        }
        
        // Parse values (handle ~5.0, $4.8B, etc.)
        const debt = parseFloat(debtStr.replace(/[~$B,]/g, '')) * 1000; // Convert B to M
        const ebitda = parseFloat(ebitdaStr.replace(/[~$B,M]/g, ''));
        const reported = parseFloat(reportedRatio.replace('x', ''));
        
        const calculated = formulas.calculateDebtToEBITDA(debt, ebitda);
        const difference = Math.abs(calculated - reported);
        
        if (difference > 0.1) { // 0.1x tolerance
            errors.push({
                field: `debt.${year}`,
                expected: `${calculated.toFixed(1)}x`,
                actual: reportedRatio,
                message: `Debt/EBITDA for ${year} incorrect. ${debt}M / ${ebitda}M = ${calculated.toFixed(1)}x`
            });
        }
    }
    
    return { errors, warnings };
}

function validateIntrinsicValue(data) {
    const errors = [];
    const warnings = [];
    
    const ivCalc = data.intrinsicValueCalculation;
    if (!ivCalc) {
        errors.push({
            field: 'intrinsicValueCalculation',
            message: 'Intrinsic value calculation section missing'
        });
        return { errors, warnings };
    }
    
    // Validate terminal value formula
    if (ivCalc.terminalValue && Array.isArray(ivCalc.terminalValue)) {
        for (const line of ivCalc.terminalValue) {
            // Look for "Terminal Value = X × Y ÷ (r - g) = $ZM"
            const match = line.match(/Terminal Value = .*?= \$?([\d,]+(?:\.\d+)?)/);
            if (match) {
                const reportedTV = parseFloat(match[1].replace(/,/g, ''));
                
                // Try to extract Year 10 FCF from terminal value array
                const year10Match = ivCalc.terminalValue[0].match(/Year 10 FCF: \$?([\d,]+(?:\.\d+)?)/);
                if (year10Match) {
                    const year10FCF = parseFloat(year10Match[0].replace(/[^0-9.]/g, ''));
                    
                    // Get discount and growth rates from inputs
                    const inputs = ivCalc.inputs.rows;
                    let discountRate = null;
                    let growthRate = null;
                    
                    for (const row of inputs) {
                        if (row[0].includes('Discount Rate')) {
                            discountRate = parseFloat(row[1].replace('%', '')) / 100;
                        }
                        if (row[0].includes('Terminal Growth')) {
                            growthRate = parseFloat(row[1].replace('%', '')) / 100;
                        }
                    }
                    
                    if (discountRate && growthRate) {
                        const calculatedTV = formulas.calculateTerminalValue(
                            year10FCF,
                            discountRate,
                            growthRate
                        );
                        
                        const difference = Math.abs(calculatedTV - reportedTV);
                        if (difference > 100) { // $100M tolerance for large numbers
                            warnings.push({
                                field: 'terminalValue',
                                expected: `$${calculatedTV.toFixed(0)}M`,
                                actual: `$${reportedTV}M`,
                                message: `Terminal value may be incorrect. Check calculation.`
                            });
                        }
                    }
                }
            }
        }
    }
    
    return { errors, warnings };
}

function validateCompany(companyPath) {
    log('blue', `\n${'='.repeat(80)}`);
    log('cyan', `Validating: ${path.basename(companyPath)}`);
    log('blue', '='.repeat(80));
    
    let data;
    try {
        const fileContent = fs.readFileSync(companyPath, 'utf-8');
        data = JSON.parse(fileContent);
    } catch (error) {
        log('red', `❌ Failed to load file: ${error.message}`);
        return { errors: 1, warnings: 0 };
    }
    
    const allErrors = [];
    const allWarnings = [];
    
    // Run all validations
    const validations = [
        { name: 'Margin of Safety', fn: validateMarginOfSafety },
        { name: 'EPS Growth Rates', fn: validateEPSGrowth },
        { name: 'Scorecard Total', fn: validateScoreTotal },
        { name: 'Debt Metrics', fn: validateDebtMetrics },
        { name: 'Intrinsic Value', fn: validateIntrinsicValue }
    ];
    
    for (const validation of validations) {
        const result = validation.fn(data);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
        
        if (result.errors.length === 0 && result.warnings.length === 0) {
            log('green', `✅ ${validation.name}: PASS`);
        } else {
            if (result.errors.length > 0) {
                log('red', `❌ ${validation.name}: ${result.errors.length} error(s)`);
            }
            if (result.warnings.length > 0) {
                log('yellow', `⚠️  ${validation.name}: ${result.warnings.length} warning(s)`);
            }
        }
    }
    
    // Print detailed errors
    if (allErrors.length > 0) {
        log('red', '\n❌ ERRORS:');
        allErrors.forEach((err, index) => {
            console.log(`\n${index + 1}. ${err.field}`);
            console.log(`   ${err.message}`);
            if (err.expected && err.actual) {
                console.log(`   Expected: ${err.expected}`);
                console.log(`   Actual:   ${err.actual}`);
            }
        });
    }
    
    // Print detailed warnings
    if (allWarnings.length > 0) {
        log('yellow', '\n⚠️  WARNINGS:');
        allWarnings.forEach((warn, index) => {
            console.log(`\n${index + 1}. ${warn.field}`);
            console.log(`   ${warn.message}`);
            if (warn.expected && warn.actual) {
                console.log(`   Expected: ${warn.expected}`);
                console.log(`   Actual:   ${warn.actual}`);
            }
        });
    }
    
    if (allErrors.length === 0 && allWarnings.length === 0) {
        log('green', '\n✅ All validations passed!');
    }
    
    return { 
        errors: allErrors.length, 
        warnings: allWarnings.length 
    };
}

function main() {
    log('cyan', '\n🔍 BUFFETT EVALUATOR DATA VALIDATOR\n');
    
    const dataDir = path.join(__dirname, 'data');
    
    // Get all JSON files
    let files;
    try {
        files = fs.readdirSync(dataDir)
            .filter(f => f.endsWith('.json'))
            .map(f => path.join(dataDir, f));
    } catch (error) {
        log('red', `❌ Failed to read data directory: ${error.message}`);
        process.exit(1);
    }
    
    if (files.length === 0) {
        log('yellow', '⚠️  No JSON files found in data/ directory');
        process.exit(0);
    }
    
    let totalErrors = 0;
    let totalWarnings = 0;
    
    // Validate each file
    for (const file of files) {
        const result = validateCompany(file);
        totalErrors += result.errors;
        totalWarnings += result.warnings;
    }
    
    // Summary
    log('blue', `\n${'='.repeat(80)}`);
    log('cyan', 'VALIDATION SUMMARY');
    log('blue', '='.repeat(80));
    
    console.log(`Files validated: ${files.length}`);
    console.log(`Total errors:    ${totalErrors}`);
    console.log(`Total warnings:  ${totalWarnings}`);
    
    if (totalErrors === 0 && totalWarnings === 0) {
        log('green', '\n✅ All data files validated successfully!\n');
        process.exit(0);
    } else {
        if (totalErrors > 0) {
            log('red', '\n❌ Validation failed with errors. Please fix the issues above.\n');
        } else {
            log('yellow', '\n⚠️  Validation passed with warnings. Review the issues above.\n');
        }
        process.exit(totalErrors > 0 ? 1 : 0);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = {
    validateMarginOfSafety,
    validateEPSGrowth,
    validateScoreTotal,
    validateDebtMetrics,
    validateIntrinsicValue,
    validateCompany
};
