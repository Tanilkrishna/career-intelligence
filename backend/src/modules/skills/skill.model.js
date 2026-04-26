const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. "React"
  category: { type: String, required: true }, // e.g. "Frontend"
  aliases: [{ type: String }], // e.g. ["React.js", "ReactJS"]
  normalizedAliases: [{ type: String }], // Precomputed for fast matching
  description: { type: String, default: 'This skill is a key requirement for modern engineering roles in this domain.' }
});

module.exports = mongoose.model('Skill', skillSchema);
