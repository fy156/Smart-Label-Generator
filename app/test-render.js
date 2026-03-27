const http = require('http');

// Wait a bit for server to be ready
setTimeout(() => {
  http.get('http://localhost:5173/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Page loaded, length:', data.length);
      if (data.includes('id="root"')) {
        console.log('Root element found');
      }
      process.exit(0);
    });
  }).on('error', (e) => {
    console.error('Error:', e.message);
    process.exit(1);
  });
}, 2000);
