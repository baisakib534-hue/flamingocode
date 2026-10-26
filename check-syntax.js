const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  try {
    new Function(scriptMatch[1]);
    console.log('PASS: Script syntax valid');
  } catch (e) {
    console.error('FAIL:', e.message);
    process.exit(1);
  }
} else {
  console.error('FAIL: No script tag found');
  process.exit(1);
}