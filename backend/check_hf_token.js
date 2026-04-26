require('dotenv').config();
const axios = require('axios');

async function checkToken() {
  const token = process.env.HF_TOKEN;
  try {
    const response = await axios.get('https://huggingface.co/api/whoami-v2', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Token is VALID. User:', response.data.name);
  } catch (err) {
    console.error('Token is INVALID or blocked:', err.response ? err.response.status : err.message);
  }
  process.exit(0);
}

checkToken();
