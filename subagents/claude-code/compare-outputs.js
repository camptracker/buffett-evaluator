#!/usr/bin/env node

/**
 * Compare two evaluation outputs for determinism
 * Usage: node compare-outputs.js file1.json file2.json
 */

const fs = require('fs');
const path = require('path');

const file1 = process.argv[2];
const file2 = process.argv[3];

if (!file1 || !file2) {
  console.error('❌ Usage: node compare-outputs.js file1.json file2.json');
  process.exit(1);
}

if (!fs.existsSync(file1) || !fs.existsSync(file2)) {
  console.error('❌ One or both files not found');
  process.exit(1);
}

// Read and parse
const data1 = JSON.parse(fs.readFileSync(file1, 'utf-8'));
const data2 = JSON.parse(fs.readFileSync(file2, 'utf-8'));

// Normalize: Remove timestamps and dynamic fields
function normalize(obj) {
  if (Array.isArray(obj)) {
    return obj.map(normalize);
  }
  
  if (obj && typeof obj === 'object') {
    const normalized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip timestamp fields
      if (key === 'timestamp' || key === 'analysisDate') {
        continue;
      }
      // Skip agent IDs (not part of actual analysis)
      if (key === 'agentId' || key === 'agentName') {
        continue;
      }
      normalized[key] = normalize(value);
    }
    return normalized;
  }
  
  return obj;
}

const normalized1 = normalize(data1);
const normalized2 = normalize(data2);

// Deep comparison
function deepEqual(a, b, path = '') {
  const differences = [];
  
  if (typeof a !== typeof b) {
    differences.push({
      path: path || 'root',
      type: 'type_mismatch',
      value1: typeof a,
      value2: typeof b
    });
    return differences;
  }
  
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      differences.push({
        path,
        type: 'array_vs_non_array',
        value1: 'array',
        value2: typeof b
      });
      return differences;
    }
    
    if (a.length !== b.length) {
      differences.push({
        path,
        type: 'array_length',
        value1: a.length,
        value2: b.length
      });
    }
    
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      const itemPath = `${path}[${i}]`;
      if (i >= a.length) {
        differences.push({
          path: itemPath,
          type: 'missing_in_first',
          value2: b[i]
        });
      } else if (i >= b.length) {
        differences.push({
          path: itemPath,
          type: 'missing_in_second',
          value1: a[i]
        });
      } else {
        differences.push(...deepEqual(a[i], b[i], itemPath));
      }
    }
    
    return differences;
  }
  
  if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object') {
      differences.push({
        path,
        type: 'object_vs_non_object',
        value1: 'object',
        value2: typeof b
      });
      return differences;
    }
    
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    
    for (const key of allKeys) {
      const keyPath = path ? `${path}.${key}` : key;
      
      if (!(key in a)) {
        differences.push({
          path: keyPath,
          type: 'missing_in_first',
          value2: b[key]
        });
      } else if (!(key in b)) {
        differences.push({
          path: keyPath,
          type: 'missing_in_second',
          value1: a[key]
        });
      } else {
        differences.push(...deepEqual(a[key], b[key], keyPath));
      }
    }
    
    return differences;
  }
  
  // Primitive comparison
  if (a !== b) {
    // Allow small floating point differences (< 0.01%)
    if (typeof a === 'number' && typeof b === 'number') {
      const diff = Math.abs(a - b);
      const relativeDiff = diff / Math.max(Math.abs(a), Math.abs(b), 1);
      
      if (relativeDiff < 0.0001) {
        // Acceptable floating point error
        return differences;
      }
    }
    
    differences.push({
      path,
      type: 'value_mismatch',
      value1: a,
      value2: b
    });
  }
  
  return differences;
}

const differences = deepEqual(normalized1, normalized2);

// Report results
console.log('🔍 DETERMINISM CHECK\n');
console.log('='.repeat(80));
console.log(`File 1: ${file1}`);
console.log(`File 2: ${file2}`);
console.log('='.repeat(80));

if (differences.length === 0) {
  console.log('\n✅ MATCH: Outputs are identical (deterministic)');
  console.log('\nThe evaluation produced consistent results.');
  process.exit(0);
} else {
  console.log(`\n❌ MISMATCH: Found ${differences.length} difference(s)\n`);
  
  // Group by type
  const byType = {};
  differences.forEach(diff => {
    if (!byType[diff.type]) {
      byType[diff.type] = [];
    }
    byType[diff.type].push(diff);
  });
  
  // Show summary
  console.log('Difference Summary:');
  for (const [type, diffs] of Object.entries(byType)) {
    console.log(`  ${type}: ${diffs.length} occurrence(s)`);
  }
  console.log('');
  
  // Show first 20 differences in detail
  console.log('Details (first 20):');
  differences.slice(0, 20).forEach((diff, idx) => {
    console.log(`\n${idx + 1}. Path: ${diff.path}`);
    console.log(`   Type: ${diff.type}`);
    if (diff.value1 !== undefined) {
      console.log(`   File 1: ${JSON.stringify(diff.value1)}`);
    }
    if (diff.value2 !== undefined) {
      console.log(`   File 2: ${JSON.stringify(diff.value2)}`);
    }
  });
  
  if (differences.length > 20) {
    console.log(`\n... and ${differences.length - 20} more differences`);
  }
  
  console.log('\n⚠️  Evaluation is NOT deterministic. Investigate differences above.');
  
  // Save diff report
  const diffReport = {
    file1,
    file2,
    totalDifferences: differences.length,
    differencesByType: byType,
    allDifferences: differences
  };
  
  const reportPath = path.join(path.dirname(file1), 'diff-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(diffReport, null, 2));
  console.log(`\n📄 Full diff report saved: ${reportPath}`);
  
  process.exit(1);
}
