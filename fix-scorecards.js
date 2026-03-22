/**
 * Fix scorecard totals in all company JSON files
 */

const fs = require('fs');
const path = require('path');

function fixScorecard(filePath) {
    console.log(`\nFixing: ${path.basename(filePath)}`);
    
    // Read file
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // Calculate correct total
    const rows = data.scorecard.scores.rows;
    let total = 0;
    
    for (const row of rows) {
        if (row[0] === '**TOTAL**') continue;
        
        const match = row[2].match(/(\d+)\/10/);
        if (match) {
            const score = parseInt(match[1]);
            console.log(`  ${row[1]}: ${score}/10`);
            total += score;
        }
    }
    
    const oldTotal = data.score;
    console.log(`\n  Calculated total: ${total}/130`);
    console.log(`  Old total: ${oldTotal}/130`);
    
    if (total !== oldTotal) {
        // Update scorecard row
        for (const row of rows) {
            if (row[0] === '**TOTAL**') {
                row[2] = `**${total}/130**`;
                row[3] = `${Math.round(total/130*100)}%`;
            }
        }
        
        // Update top-level score
        data.score = total;
        
        // Save file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`  ✅ Fixed! ${oldTotal} → ${total}`);
    } else {
        console.log(`  ✅ Already correct`);
    }
}

// Process all files
const dataDir = path.join(__dirname, 'data');
const files = fs.readdirSync(dataDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(dataDir, f));

console.log(`Found ${files.length} company files\n`);

for (const file of files) {
    fixScorecard(file);
}

console.log('\n✅ Done!');
