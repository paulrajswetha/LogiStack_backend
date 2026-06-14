// seedReact.js — Run this script once to populate React interview questions
// Usage: node seedReact.js
// Make sure your .env has MONGODB_URI set

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// ─── Schema ──────────────────────────────────────────────────────────────────
const ReactQuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  level: { type: String, enum: ['basic', 'intermediate', 'advanced'], required: true },
  topic: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const ReactQuestion = mongoose.model('ReactQuestion', ReactQuestionSchema);

// ─── Data (import from ReactData.js) ────────────────────────────────────────
// You'll need to import or copy the reactQuestions array here
// For brevity, I'm showing just the structure - in practice, import from ReactData.js

async function seedReact() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop existing React questions
    await ReactQuestion.deleteMany({});
    console.log('🗑️  Cleared existing React questions');

    // Insert all questions (you would import reactQuestions from ReactData.js)
    // const result = await ReactQuestion.insertMany(reactQuestions);
    // console.log(`✅ Successfully inserted ${result.length} React interview questions`);

    // Summary
    // const basic = result.filter(q => q.level === 'basic').length;
    // const intermediate = result.filter(q => q.level === 'intermediate').length;
    // const advanced = result.filter(q => q.level === 'advanced').length;
    // console.log(`\n📊 Summary:\n  Basic: ${basic}\n  Intermediate: ${intermediate}\n  Advanced: ${advanced}`);

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seedReact();