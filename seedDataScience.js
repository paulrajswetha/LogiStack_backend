// seedDataScience.js — Run this script to populate Data Science interview questions
// Usage: node seedDataScience.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// ─── Schema ──────────────────────────────────────────────────────────────────
const DataScienceQuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  level: { type: String, enum: ['basic', 'intermediate', 'advanced'], required: true },
  topic: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const DataScienceQuestion = mongoose.model('DataScienceQuestion', DataScienceQuestionSchema);

// ─── Import Data from DataScienceData.js ─────────────────────────────────────
// Note: You'll need to copy the dataScienceQuestions array from DataScienceData.js
// For the seeding script, you can either:
// 1. Import the array directly (if using ES modules)
// 2. Copy the array here (as shown below)

const dataScienceQuestions = [
  // Paste all 100 questions from DataScienceData.js here
  // For brevity, I'm showing the structure. You'll need to copy the full array.
];

// ─── Seed Function ───────────────────────────────────────────────────────────
async function seedDataScience() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop existing Data Science questions
    await DataScienceQuestion.deleteMany({});
    console.log('🗑️  Cleared existing Data Science questions');

    // Insert all questions
    const result = await DataScienceQuestion.insertMany(dataScienceQuestions);
    console.log(`✅ Successfully inserted ${result.length} Data Science interview questions`);

    // Summary
    const basic = result.filter(q => q.level === 'basic').length;
    const intermediate = result.filter(q => q.level === 'intermediate').length;
    const advanced = result.filter(q => q.level === 'advanced').length;
    console.log(`\n📊 Summary:\n  Basic: ${basic}\n  Intermediate: ${intermediate}\n  Advanced: ${advanced}`);

    // Topic distribution
    const topics = {};
    result.forEach(q => {
      topics[q.topic] = (topics[q.topic] || 0) + 1;
    });
    console.log('\n📚 Topics distribution:');
    Object.entries(topics).sort((a, b) => b[1] - a[1]).forEach(([topic, count]) => {
      console.log(`  ${topic}: ${count}`);
    });

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seedDataScience();