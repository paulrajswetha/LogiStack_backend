// seedHTMLCSSJS.js — Run this script to populate HTML/CSS/JS interview questions
// Usage: node seedHTMLCSSJS.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// ─── Schema ──────────────────────────────────────────────────────────────────
const HTMLCSSJSQuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  level: { type: String, enum: ['basic', 'intermediate', 'advanced'], required: true },
  topic: { type: String, required: true },
  category: { type: String, enum: ['html', 'css', 'js'], required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const HTMLCSSJSQuestion = mongoose.model('HTMLCSSJSQuestion', HTMLCSSJSQuestionSchema);

// ─── Data Import ─────────────────────────────────────────────────────────────
// You'll need to copy the full htmlCssJsQuestions array from HTMLCSSJSData.js here
// For brevity, I'm showing the structure. In practice, you'd export/import the array.

const htmlCssJsQuestions = [
  // Copy all questions from HTMLCSSJSData.js here
];

// ─── Seed Function ───────────────────────────────────────────────────────────
async function seedHTMLCSSJS() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop existing questions
    await HTMLCSSJSQuestion.deleteMany({});
    console.log('🗑️  Cleared existing HTML/CSS/JS questions');

    // Insert all questions
    const result = await HTMLCSSJSQuestion.insertMany(htmlCssJsQuestions);
    console.log(`✅ Successfully inserted ${result.length} HTML/CSS/JS interview questions`);

    // Summary by category
    const html = result.filter(q => q.category === 'html').length;
    const css = result.filter(q => q.category === 'css').length;
    const js = result.filter(q => q.category === 'js').length;
    console.log(`\n📊 Category Summary:\n  HTML: ${html}\n  CSS: ${css}\n  JS: ${js}`);

    // Summary by level
    const basic = result.filter(q => q.level === 'basic').length;
    const intermediate = result.filter(q => q.level === 'intermediate').length;
    const advanced = result.filter(q => q.level === 'advanced').length;
    console.log(`\n📊 Level Summary:\n  Basic: ${basic}\n  Intermediate: ${intermediate}\n  Advanced: ${advanced}`);

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

seedHTMLCSSJS();