import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
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
  
  if (content.includes('测试标签1')) {
    console.log('SUCCESS: Test tag 1 found in page');
  } else {
    console.log('ERROR: Test tag 1 NOT found in page');
  }
  
  if (content.includes('标签数量: 2')) {
    console.log('SUCCESS: Tag count found in page');
  } else {
    console.log('ERROR: Tag count NOT found in page');
  }
  
  await browser.close();
})();
