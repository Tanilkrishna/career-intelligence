require('dotenv').config();
const https = require('https');

const token = process.env.HF_TOKEN;
const model = 'facebook/bart-large-cnn';
const body = JSON.stringify({ inputs: "Hello world" });

const options = {
  hostname: 'api-inference.huggingface.co',
  path: `/models/${model}`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': body.length
  }
};

console.log(`Connecting to ${options.hostname}${options.path}...`);

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Body:', data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});

req.write(body);
req.end();
