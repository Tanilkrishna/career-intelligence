require('dotenv').config();
const axios = require('axios');

async function testAI() {
  const token = process.env.HF_TOKEN;
  const model = 'facebook/bart-large-cnn';
  const url = `https://api-inference.huggingface.co/models/${model}`;
  
  console.log(`URL: ${url}`);
  console.log(`Token Prefix: ${token.substring(0, 5)}...`);
  
  try {
    const response = await axios({
      method: 'post',
      url: url,
      data: { inputs: "The Tower of London is a historic castle." },
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      proxy: false // Explicitly disable proxy
    });
    
    console.log('AI Response:', JSON.stringify(response.data, null, 2));
    console.log('\n✅ AI is LIVE and working!');
  } catch (err) {
    console.error('❌ AI Test Failed:', err.response ? err.response.status + ' ' + JSON.stringify(err.response.data) : err.message);
  }
  
  process.exit(0);
}

testAI();
