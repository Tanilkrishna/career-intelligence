const mongoose = require('mongoose');

async function checkLocal() {
  try {
    await mongoose.connect('mongodb://localhost:27017/career-intelligence');
    const AnalysisJob = mongoose.model('AnalysisJob', new mongoose.Schema({}, { strict: false }), 'analysisjobs');
    const count = await AnalysisJob.countDocuments();
    console.log(`Local Analysis Jobs: ${count}`);
    await mongoose.disconnect();
  } catch (err) {
    console.log('Local MongoDB not accessible or failed.');
  }
}

checkLocal();
