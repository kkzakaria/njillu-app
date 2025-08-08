#!/usr/bin/env node

/**
 * Browser compatibility validation script
 * Runs cross-browser tests and generates compatibility reports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BROWSERS = ['chromium', 'firefox', 'webkit'];
const MOBILE_BROWSERS = ['mobile-chrome', 'mobile-safari'];
const OUTPUT_DIR = path.join(__dirname, '../test-results');
const REPORTS_DIR = path.join(OUTPUT_DIR, 'compatibility-reports');

// Ensure directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Color console output
 */
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color] || ''}${text}${colors.reset}`;
}

/**
 * Log with timestamp
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const levelColors = {
    info: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red',
  };
  
  console.log(`${colorize(`[${timestamp}]`, 'cyan')} ${colorize(`[${level.toUpperCase()}]`, levelColors[level])} ${message}`);
}

/**
 * Execute shell command with error handling
 */
function execCommand(command, description) {
  log(`${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`${description} completed`, 'success');
    return { success: true, output };
  } catch (error) {
    log(`${description} failed: ${error.message}`, 'error');
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

/**
 * Run tests for a specific browser
 */
function runBrowserTests(browser) {
  log(`Running tests for ${browser}...`);
  
  const commands = [
    {
      name: 'core-functionality',
      command: `npx playwright test e2e/cross-browser-compatibility.spec.ts --project=${browser} --reporter=json --output-dir=${REPORTS_DIR}/${browser}`,
      description: `Core functionality tests for ${browser}`
    },
    {
      name: 'list-detail-workflows',
      command: `npx playwright test e2e/list-detail-workflows.spec.ts --project=${browser} --reporter=json --output-dir=${REPORTS_DIR}/${browser}`,
      description: `List-detail workflow tests for ${browser}`
    },
    {
      name: 'accessibility',
      command: `npx playwright test e2e/accessibility.spec.ts --project=${browser} --reporter=json --output-dir=${REPORTS_DIR}/${browser}`,
      description: `Accessibility tests for ${browser}`
    },
    {
      name: 'performance',
      command: `npx playwright test e2e/performance.spec.ts --project=${browser} --reporter=json --output-dir=${REPORTS_DIR}/${browser}`,
      description: `Performance tests for ${browser}`
    }
  ];

  const results = {
    browser,
    timestamp: new Date().toISOString(),
    tests: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    }
  };

  for (const { name, command, description } of commands) {
    const result = execCommand(command, description);
    results.tests[name] = {
      success: result.success,
      output: result.output,
      error: result.error || null
    };

    // Parse test results if JSON output is available
    try {
      const reportPath = path.join(REPORTS_DIR, browser, 'results.json');
      if (fs.existsSync(reportPath)) {
        const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        results.tests[name].stats = reportData.stats;
        
        results.summary.total += reportData.stats?.expected || 0;
        results.summary.passed += reportData.stats?.passed || 0;
        results.summary.failed += reportData.stats?.failed || 0;
        results.summary.skipped += reportData.stats?.skipped || 0;
      }
    } catch (e) {
      log(`Could not parse test results for ${browser}/${name}`, 'warning');
    }
  }

  // Save browser results
  const browserResultsPath = path.join(REPORTS_DIR, `${browser}-results.json`);
  fs.writeFileSync(browserResultsPath, JSON.stringify(results, null, 2));
  
  return results;
}

/**
 * Generate compatibility matrix
 */
function generateCompatibilityMatrix(allResults) {
  log('Generating compatibility matrix...');
  
  const matrix = {
    timestamp: new Date().toISOString(),
    browsers: {},
    features: {},
    summary: {
      totalTests: 0,
      passRate: 0,
      compatibilityScore: 0
    }
  };

  // Process each browser's results
  Object.entries(allResults).forEach(([browser, results]) => {
    matrix.browsers[browser] = {
      summary: results.summary,
      passRate: results.summary.total > 0 ? 
        (results.summary.passed / results.summary.total * 100).toFixed(1) : 0,
      testSuites: Object.keys(results.tests)
    };

    matrix.summary.totalTests += results.summary.total;
  });

  // Calculate overall pass rate
  const totalPassed = Object.values(allResults).reduce((sum, results) => sum + results.summary.passed, 0);
  matrix.summary.passRate = matrix.summary.totalTests > 0 ? 
    (totalPassed / matrix.summary.totalTests * 100).toFixed(1) : 0;

  // Feature compatibility analysis
  const featureTests = [
    'core-functionality',
    'list-detail-workflows', 
    'accessibility',
    'performance'
  ];

  featureTests.forEach(feature => {
    matrix.features[feature] = {};
    
    Object.keys(allResults).forEach(browser => {
      const testResult = allResults[browser].tests[feature];
      if (testResult && testResult.stats) {
        const passed = testResult.stats.passed || 0;
        const total = testResult.stats.expected || 0;
        const passRate = total > 0 ? (passed / total * 100).toFixed(1) : 0;
        
        matrix.features[feature][browser] = {
          passed,
          total,
          passRate: `${passRate}%`,
          status: passRate >= 90 ? '✅' : passRate >= 75 ? '⚠️' : '❌'
        };
      } else {
        matrix.features[feature][browser] = {
          passed: 0,
          total: 0,
          passRate: 'N/A',
          status: '❌'
        };
      }
    });
  });

  // Compatibility score calculation
  const browserScores = Object.values(matrix.browsers).map(b => parseFloat(b.passRate));
  matrix.summary.compatibilityScore = browserScores.length > 0 ? 
    (browserScores.reduce((sum, score) => sum + score, 0) / browserScores.length).toFixed(1) : 0;

  return matrix;
}

/**
 * Generate HTML report
 */
function generateHTMLReport(matrix) {
  log('Generating HTML compatibility report...');
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Browser Compatibility Report</title>
    <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f7fa; }
        .header { background: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header h1 { margin: 0; color: #1a202c; }
        .header .meta { color: #718096; margin-top: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .summary-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
        .summary-card .value { font-size: 2rem; font-weight: bold; color: #2d3748; margin-bottom: 4px; }
        .summary-card .label { color: #718096; font-size: 0.9rem; }
        .matrix { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .matrix-header { background: #4299e1; color: white; padding: 16px 20px; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f7fafc; font-weight: 600; color: #2d3748; }
        .status-cell { text-align: center; font-size: 1.2rem; }
        .browser-results { margin-top: 24px; }
        .browser-card { background: white; border-radius: 12px; overflow: hidden; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .browser-card-header { padding: 16px 20px; font-weight: 600; background: #edf2f7; }
        .browser-card-content { padding: 20px; }
        .test-suite { margin-bottom: 16px; }
        .test-suite-title { font-weight: 600; margin-bottom: 8px; color: #2d3748; }
        .progress-bar { background: #e2e8f0; border-radius: 8px; height: 8px; overflow: hidden; }
        .progress-fill { height: 100%; background: #48bb78; transition: width 0.3s ease; }
        .footer { text-align: center; margin-top: 48px; color: #718096; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Browser Compatibility Report</h1>
        <div class="meta">Generated on ${new Date(matrix.timestamp).toLocaleString()}</div>
    </div>

    <div class="summary">
        <div class="summary-card">
            <div class="value">${matrix.summary.totalTests}</div>
            <div class="label">Total Tests</div>
        </div>
        <div class="summary-card">
            <div class="value">${matrix.summary.passRate}%</div>
            <div class="label">Overall Pass Rate</div>
        </div>
        <div class="summary-card">
            <div class="value">${matrix.summary.compatibilityScore}%</div>
            <div class="label">Compatibility Score</div>
        </div>
        <div class="summary-card">
            <div class="value">${Object.keys(matrix.browsers).length}</div>
            <div class="label">Browsers Tested</div>
        </div>
    </div>

    <div class="matrix">
        <div class="matrix-header">Feature Compatibility Matrix</div>
        <table>
            <thead>
                <tr>
                    <th>Feature</th>
                    ${Object.keys(matrix.browsers).map(browser => `<th>${browser}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${Object.entries(matrix.features).map(([feature, browsers]) => `
                    <tr>
                        <td><strong>${feature.replace(/-/g, ' ').toUpperCase()}</strong></td>
                        ${Object.values(browsers).map(result => `
                            <td class="status-cell">
                                ${result.status} ${result.passRate}
                            </td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="browser-results">
        ${Object.entries(matrix.browsers).map(([browser, data]) => `
            <div class="browser-card">
                <div class="browser-card-header">${browser.toUpperCase()} - ${data.passRate}% Pass Rate</div>
                <div class="browser-card-content">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
                        <div>
                            <strong>Passed:</strong> ${data.summary.passed}
                        </div>
                        <div>
                            <strong>Failed:</strong> ${data.summary.failed}
                        </div>
                        <div>
                            <strong>Total:</strong> ${data.summary.total}
                        </div>
                        <div>
                            <strong>Skipped:</strong> ${data.summary.skipped}
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${data.passRate}%"></div>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="footer">
        <p>Browser compatibility testing for responsive list-detail layout system</p>
        <p>Report generated using Playwright cross-browser testing suite</p>
    </div>
</body>
</html>
  `;

  const htmlPath = path.join(REPORTS_DIR, 'compatibility-report.html');
  fs.writeFileSync(htmlPath, html);
  log(`HTML report saved to ${htmlPath}`, 'success');
  
  return htmlPath;
}

/**
 * Print summary to console
 */
function printSummary(matrix) {
  console.log('\n' + colorize('='.repeat(60), 'cyan'));
  console.log(colorize('BROWSER COMPATIBILITY TEST RESULTS', 'cyan'));
  console.log(colorize('='.repeat(60), 'cyan'));
  
  console.log(`\n${colorize('SUMMARY:', 'blue')}`);
  console.log(`  Total Tests: ${matrix.summary.totalTests}`);
  console.log(`  Overall Pass Rate: ${colorize(`${matrix.summary.passRate}%`, 'green')}`);
  console.log(`  Compatibility Score: ${colorize(`${matrix.summary.compatibilityScore}%`, 'green')}`);
  console.log(`  Browsers Tested: ${Object.keys(matrix.browsers).length}`);

  console.log(`\n${colorize('BROWSER RESULTS:', 'blue')}`);
  Object.entries(matrix.browsers).forEach(([browser, data]) => {
    const passRate = parseFloat(data.passRate);
    const color = passRate >= 90 ? 'green' : passRate >= 75 ? 'yellow' : 'red';
    console.log(`  ${browser.toUpperCase()}: ${colorize(`${data.passRate}% (${data.summary.passed}/${data.summary.total})`, color)}`);
  });

  console.log(`\n${colorize('FEATURE COMPATIBILITY:', 'blue')}`);
  Object.entries(matrix.features).forEach(([feature, browsers]) => {
    console.log(`  ${feature.replace(/-/g, ' ').toUpperCase()}:`);
    Object.entries(browsers).forEach(([browser, result]) => {
      console.log(`    ${browser}: ${result.status} ${result.passRate}`);
    });
  });

  console.log('\n' + colorize('='.repeat(60), 'cyan'));
}

/**
 * Main execution function
 */
async function main() {
  log('Starting browser compatibility validation...', 'info');
  
  const args = process.argv.slice(2);
  const browsersToTest = args.length > 0 ? args : BROWSERS;
  
  log(`Testing browsers: ${browsersToTest.join(', ')}`);
  
  // Run tests for each browser
  const allResults = {};
  for (const browser of browsersToTest) {
    try {
      allResults[browser] = runBrowserTests(browser);
    } catch (error) {
      log(`Failed to test ${browser}: ${error.message}`, 'error');
      allResults[browser] = {
        browser,
        timestamp: new Date().toISOString(),
        error: error.message,
        tests: {},
        summary: { total: 0, passed: 0, failed: 0, skipped: 0 }
      };
    }
  }

  // Generate compatibility matrix
  const matrix = generateCompatibilityMatrix(allResults);
  
  // Save matrix to file
  const matrixPath = path.join(REPORTS_DIR, 'compatibility-matrix.json');
  fs.writeFileSync(matrixPath, JSON.stringify(matrix, null, 2));
  log(`Compatibility matrix saved to ${matrixPath}`, 'success');

  // Generate HTML report
  const htmlPath = generateHTMLReport(matrix);
  
  // Print summary
  printSummary(matrix);
  
  log('\nCompatibility validation completed!', 'success');
  log(`View detailed report at: ${htmlPath}`, 'info');
  
  // Exit with appropriate code
  const overallScore = parseFloat(matrix.summary.compatibilityScore);
  if (overallScore < 75) {
    log('Compatibility score below 75% - some tests failed', 'warning');
    process.exit(1);
  } else {
    log('Compatibility validation passed!', 'success');
    process.exit(0);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    log(`Script failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  runBrowserTests,
  generateCompatibilityMatrix,
  generateHTMLReport
};