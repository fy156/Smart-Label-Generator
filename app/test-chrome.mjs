import { chromium } from 'playwright';
import { execSync } from 'child_process';

// Try to find Chrome
let chromePath;
try {
  chromePath = execSync('which google-chrome || which chromium || which chromium-browser || ls /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome 2>/dev/null || echo ""').toString().trim();
} catch (e) {
  console.log('Could not find Chrome');
}

console.log('Chrome path:', chromePath);

if (!chromePath) {
  console.log('No Chrome found, skipping test');
  process.exit(0);
}

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: chromePath 
  });
  const page = await browser.newPage();
  
  // Listen to console messages
  page.on('console', msg => console.log('Browser console:', msg.text()));
  page.on('pageerror', error => console.log('Browser error:', error.message));
  
  await page.goto('http://localhost:5173/');
  
  // Wait for React to render
  await page.waitForTimeout(3000);
  
  // Check if content is rendered
  const content = await page.content();
  console.log('Page content length:', content.length);
  
  if (content.includes('江布拉克')) {
    console.log('SUCCESS: 江布拉克 found in page');
  } else {
    console.log('ERROR: 江布拉克 NOT found in page');
  }
  
  if (content.includes('智能标签生成器')) {
    console.log('SUCCESS: Title found in page');
  } else {
    console.log('ERROR: Title NOT found in page');
  }
  
  // Take screenshot
  await page.screenshot({ path: '/Users/apple/Desktop/test/Kimi_Agent_UE抠图优化/screenshot.png' });
  console.log('Screenshot saved');
  
  await browser.close();
})();
