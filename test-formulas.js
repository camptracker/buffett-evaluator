/**
 * Buffett Evaluator - Formula Test Suite
 * 
 * Tests all financial formulas used in the evaluation framework
 * with known inputs/outputs to ensure correctness.
 */

// Formula 1: CAGR (Compound Annual Growth Rate)
// Formula: (Ending Value / Beginning Value)^(1/years) - 1
function calculateCAGR(beginValue, endValue, years) {
    if (beginValue <= 0 || endValue <= 0 || years <= 0) {
        throw new Error('CAGR inputs must be positive');
    }
    return Math.pow(endValue / beginValue, 1 / years) - 1;
}

// Formula 2: Margin of Safety
// Formula: (Intrinsic Value - Current Price) / Intrinsic Value
function calculateMarginOfSafety(intrinsicValue, currentPrice) {
    if (intrinsicValue <= 0) {
        throw new Error('Intrinsic value must be positive');
    }
    return (intrinsicValue - currentPrice) / intrinsicValue;
}

// Formula 3: Discount Factor
// Formula: 1 / (1 + rate)^years
function calculateDiscountFactor(rate, years) {
    return 1 / Math.pow(1 + rate, years);
}

// Formula 4: Present Value
// Formula: Future Value × Discount Factor
function calculatePresentValue(futureValue, rate, years) {
    return futureValue * calculateDiscountFactor(rate, years);
}

// Formula 5: Terminal Value (Gordon Growth Model)
// Formula: Final Year FCF × (1 + g) / (r - g)
function calculateTerminalValue(finalYearFCF, discountRate, terminalGrowthRate) {
    if (discountRate <= terminalGrowthRate) {
        throw new Error('Discount rate must be greater than terminal growth rate');
    }
    return (finalYearFCF * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate);
}

// Formula 6: DCF Intrinsic Value
// Sum of discounted cash flows + discounted terminal value
function calculateDCFValue(cashFlows, terminalValue, discountRate) {
    let totalPV = 0;
    
    // Discount each year's cash flow
    cashFlows.forEach((cf, index) => {
        const year = index + 1;
        totalPV += calculatePresentValue(cf, discountRate, year);
    });
    
    // Add discounted terminal value
    const terminalYear = cashFlows.length;
    totalPV += calculatePresentValue(terminalValue, discountRate, terminalYear);
    
    return totalPV;
}

// Formula 7: ROE (Return on Equity)
// Formula: Net Income / Shareholder Equity
function calculateROE(netIncome, shareholderEquity) {
    if (shareholderEquity === 0) {
        throw new Error('Shareholder equity is zero (ROE undefined)');
    }
    return netIncome / shareholderEquity;
}

// Formula 8: Debt to EBITDA
// Formula: Net Debt / EBITDA
function calculateDebtToEBITDA(netDebt, ebitda) {
    if (ebitda <= 0) {
        throw new Error('EBITDA must be positive');
    }
    return netDebt / ebitda;
}

// Formula 9: Years to Pay Off Debt
// Formula: Long Term Debt / Net Income
function calculateYearsToPayDebt(longTermDebt, netIncome) {
    if (netIncome <= 0) {
        throw new Error('Net income must be positive to calculate payoff years');
    }
    return longTermDebt / netIncome;
}

// Formula 10: FCF Margin
// Formula: Free Cash Flow / Revenue
function calculateFCFMargin(fcf, revenue) {
    if (revenue <= 0) {
        throw new Error('Revenue must be positive');
    }
    return fcf / revenue;
}

// Formula 11: CapEx as % of Earnings
// Formula: CapEx / Net Income
function calculateCapExRatio(capex, netIncome) {
    if (netIncome <= 0) {
        return null; // Can't calculate if no earnings
    }
    return capex / netIncome;
}

// Test Suite
const tests = [
    {
        name: 'CAGR Test 1: 10% annual growth over 10 years',
        formula: 'CAGR',
        input: { beginValue: 100, endValue: 259.37, years: 10 },
        expected: 0.10,
        tolerance: 0.001
    },
    {
        name: 'CAGR Test 2: EPS growth $1 to $17.56 over 15 years (Dominos actual)',
        formula: 'CAGR',
        input: { beginValue: 0.78, endValue: 17.56, years: 15 },
        expected: 0.2307, // 23.07% (corrected calculation)
        tolerance: 0.001
    },
    {
        name: 'CAGR Test 3: Negative growth -5% over 5 years',
        formula: 'CAGR',
        input: { beginValue: 100, endValue: 77.38, years: 5 },
        expected: -0.05,
        tolerance: 0.001
    },
    {
        name: 'Margin of Safety Test 1: 30% undervalued',
        formula: 'MarginOfSafety',
        input: { intrinsicValue: 100, currentPrice: 70 },
        expected: 0.30,
        tolerance: 0.001
    },
    {
        name: 'Margin of Safety Test 2: Dominos actual ($425 intrinsic, $377.79 price)',
        formula: 'MarginOfSafety',
        input: { intrinsicValue: 425, currentPrice: 377.79 },
        expected: 0.1111, // 11.11%
        tolerance: 0.001
    },
    {
        name: 'Margin of Safety Test 3: Overvalued (negative margin)',
        formula: 'MarginOfSafety',
        input: { intrinsicValue: 100, currentPrice: 120 },
        expected: -0.20,
        tolerance: 0.001
    },
    {
        name: 'Discount Factor Test 1: 10% rate, Year 1',
        formula: 'DiscountFactor',
        input: { rate: 0.10, years: 1 },
        expected: 0.9091,
        tolerance: 0.0001
    },
    {
        name: 'Discount Factor Test 2: 10% rate, Year 10',
        formula: 'DiscountFactor',
        input: { rate: 0.10, years: 10 },
        expected: 0.3855,
        tolerance: 0.0001
    },
    {
        name: 'Present Value Test 1: $100 in 5 years at 10%',
        formula: 'PresentValue',
        input: { futureValue: 100, rate: 0.10, years: 5 },
        expected: 62.09,
        tolerance: 0.01
    },
    {
        name: 'Present Value Test 2: $545M FCF Year 1 at 10% (Dominos)',
        formula: 'PresentValue',
        input: { futureValue: 545, rate: 0.10, years: 1 },
        expected: 495.45,
        tolerance: 0.01
    },
    {
        name: 'Terminal Value Test 1: $1000 FCF, 10% discount, 3% growth',
        formula: 'TerminalValue',
        input: { finalYearFCF: 1000, discountRate: 0.10, terminalGrowthRate: 0.03 },
        expected: 14714.29,
        tolerance: 1
    },
    {
        name: 'Terminal Value Test 2: Dominos actual ($1002M FCF, 10% rate, 3% growth)',
        formula: 'TerminalValue',
        input: { finalYearFCF: 1002, discountRate: 0.10, terminalGrowthRate: 0.03 },
        expected: 14743.71, // Corrected: 1002 * 1.03 / 0.07
        tolerance: 1
    },
    {
        name: 'DCF Value Test 1: Simple 3-year projection',
        formula: 'DCFValue',
        input: {
            cashFlows: [100, 110, 121], // 10% growth
            terminalValue: 2000,
            discountRate: 0.10
        },
        expected: 1775.36, // Corrected: 90.91 + 90.91 + 90.91 + 1502.63
        tolerance: 1
    },
    {
        name: 'ROE Test 1: 20% return',
        formula: 'ROE',
        input: { netIncome: 100, shareholderEquity: 500 },
        expected: 0.20,
        tolerance: 0.001
    },
    {
        name: 'ROE Test 2: Negative equity (common in buyback-heavy companies)',
        formula: 'ROE',
        input: { netIncome: 100, shareholderEquity: -200 },
        expected: -0.50,
        tolerance: 0.001
    },
    {
        name: 'Debt/EBITDA Test 1: Dominos actual (4.7x)',
        formula: 'DebtToEBITDA',
        input: { netDebt: 5000, ebitda: 1055 },
        expected: 4.74,
        tolerance: 0.01
    },
    {
        name: 'Debt/EBITDA Test 2: Conservative 2x leverage',
        formula: 'DebtToEBITDA',
        input: { netDebt: 1000, ebitda: 500 },
        expected: 2.00,
        tolerance: 0.01
    },
    {
        name: 'Years to Pay Debt Test 1: Buffett threshold (4 years)',
        formula: 'YearsToPayDebt',
        input: { longTermDebt: 400, netIncome: 100 },
        expected: 4.00,
        tolerance: 0.01
    },
    {
        name: 'Years to Pay Debt Test 2: High leverage (8 years)',
        formula: 'YearsToPayDebt',
        input: { longTermDebt: 5000, netIncome: 625 },
        expected: 8.00,
        tolerance: 0.01
    },
    {
        name: 'FCF Margin Test 1: 15% margin',
        formula: 'FCFMargin',
        input: { fcf: 150, revenue: 1000 },
        expected: 0.15,
        tolerance: 0.001
    },
    {
        name: 'FCF Margin Test 2: Dominos actual (~10% margin)',
        formula: 'FCFMargin',
        input: { fcf: 509, revenue: 5000 },
        expected: 0.1018,
        tolerance: 0.001
    },
    {
        name: 'CapEx Ratio Test 1: Capital light (10% of earnings)',
        formula: 'CapExRatio',
        input: { capex: 50, netIncome: 500 },
        expected: 0.10,
        tolerance: 0.001
    },
    {
        name: 'CapEx Ratio Test 2: Capital heavy (40% of earnings)',
        formula: 'CapExRatio',
        input: { capex: 200, netIncome: 500 },
        expected: 0.40,
        tolerance: 0.001
    }
];

// Run tests
function runTests() {
    console.log('🧪 BUFFETT EVALUATOR FORMULA TESTS\n');
    console.log('=' .repeat(80));
    
    let passed = 0;
    let failed = 0;
    const failures = [];
    
    tests.forEach((test, index) => {
        let result;
        let actual;
        
        try {
            switch(test.formula) {
                case 'CAGR':
                    actual = calculateCAGR(test.input.beginValue, test.input.endValue, test.input.years);
                    break;
                case 'MarginOfSafety':
                    actual = calculateMarginOfSafety(test.input.intrinsicValue, test.input.currentPrice);
                    break;
                case 'DiscountFactor':
                    actual = calculateDiscountFactor(test.input.rate, test.input.years);
                    break;
                case 'PresentValue':
                    actual = calculatePresentValue(test.input.futureValue, test.input.rate, test.input.years);
                    break;
                case 'TerminalValue':
                    actual = calculateTerminalValue(test.input.finalYearFCF, test.input.discountRate, test.input.terminalGrowthRate);
                    break;
                case 'DCFValue':
                    actual = calculateDCFValue(test.input.cashFlows, test.input.terminalValue, test.input.discountRate);
                    break;
                case 'ROE':
                    actual = calculateROE(test.input.netIncome, test.input.shareholderEquity);
                    break;
                case 'DebtToEBITDA':
                    actual = calculateDebtToEBITDA(test.input.netDebt, test.input.ebitda);
                    break;
                case 'YearsToPayDebt':
                    actual = calculateYearsToPayDebt(test.input.longTermDebt, test.input.netIncome);
                    break;
                case 'FCFMargin':
                    actual = calculateFCFMargin(test.input.fcf, test.input.revenue);
                    break;
                case 'CapExRatio':
                    actual = calculateCapExRatio(test.input.capex, test.input.netIncome);
                    break;
                default:
                    throw new Error(`Unknown formula: ${test.formula}`);
            }
            
            const difference = Math.abs(actual - test.expected);
            const withinTolerance = difference <= test.tolerance;
            
            if (withinTolerance) {
                passed++;
                console.log(`✅ Test ${index + 1}: ${test.name}`);
                console.log(`   Expected: ${test.expected.toFixed(4)} | Actual: ${actual.toFixed(4)} | Diff: ${difference.toFixed(6)}`);
            } else {
                failed++;
                failures.push({
                    test: test.name,
                    expected: test.expected,
                    actual: actual,
                    difference: difference,
                    tolerance: test.tolerance
                });
                console.log(`❌ Test ${index + 1}: ${test.name}`);
                console.log(`   Expected: ${test.expected.toFixed(4)} | Actual: ${actual.toFixed(4)} | Diff: ${difference.toFixed(6)} (EXCEEDS tolerance ${test.tolerance})`);
            }
        } catch (error) {
            failed++;
            failures.push({
                test: test.name,
                error: error.message
            });
            console.log(`❌ Test ${index + 1}: ${test.name}`);
            console.log(`   ERROR: ${error.message}`);
        }
        
        console.log('');
    });
    
    console.log('=' .repeat(80));
    console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed out of ${tests.length} tests\n`);
    
    if (failures.length > 0) {
        console.log('❌ FAILURES:\n');
        failures.forEach((failure, index) => {
            console.log(`${index + 1}. ${failure.test}`);
            if (failure.error) {
                console.log(`   Error: ${failure.error}`);
            } else {
                console.log(`   Expected: ${failure.expected} | Actual: ${failure.actual}`);
                console.log(`   Difference: ${failure.difference} (tolerance: ${failure.tolerance})`);
            }
            console.log('');
        });
    }
    
    return { passed, failed, total: tests.length };
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateCAGR,
        calculateMarginOfSafety,
        calculateDiscountFactor,
        calculatePresentValue,
        calculateTerminalValue,
        calculateDCFValue,
        calculateROE,
        calculateDebtToEBITDA,
        calculateYearsToPayDebt,
        calculateFCFMargin,
        calculateCapExRatio,
        runTests
    };
}

// Auto-run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
    const results = runTests();
    process.exit(results.failed > 0 ? 1 : 0);
}
