// Seedos.js
// This is a data validation and preview script for OS questions
// You can run this to see a summary of the OS questions data

import { osQuestions, topicsList, levelsList } from './Osdata.js';

console.log("=" .repeat(60));
console.log("OPERATING SYSTEM INTERVIEW QUESTIONS DATA SUMMARY");
console.log("=" .repeat(60));

// Total questions
console.log(`\n📊 Total Questions: ${osQuestions.length}`);

// Questions by level
const levelCounts = {
  basic: osQuestions.filter(q => q.level === "basic").length,
  intermediate: osQuestions.filter(q => q.level === "intermediate").length,
  advanced: osQuestions.filter(q => q.level === "advanced").length
};

console.log("\n📈 Questions by Level:");
console.log(`   Basic: ${levelCounts.basic}`);
console.log(`   Intermediate: ${levelCounts.intermediate}`);
console.log(`   Advanced: ${levelCounts.advanced}`);

// Questions by topic
console.log("\n🏷️  Questions by Topic:");
topicsList.forEach(topic => {
  const count = osQuestions.filter(q => q.topic === topic).length;
  console.log(`   ${topic}: ${count}`);
});

// Sample questions by level
console.log("\n📝 Sample Questions by Level:");

console.log("\n🔰 BASIC (3 samples):");
osQuestions.filter(q => q.level === "basic").slice(0, 3).forEach(q => {
  console.log(`   • ${q.question.substring(0, 80)}...`);
});

console.log("\n⚡ INTERMEDIATE (3 samples):");
osQuestions.filter(q => q.level === "intermediate").slice(0, 3).forEach(q => {
  console.log(`   • ${q.question.substring(0, 80)}...`);
});

console.log("\n🚀 ADVANCED (3 samples):");
osQuestions.filter(q => q.level === "advanced").slice(0, 3).forEach(q => {
  console.log(`   • ${q.question.substring(0, 80)}...`);
});

// Tags summary
const allTags = osQuestions.flatMap(q => q.tags);
const tagCounts = {};
allTags.forEach(tag => {
  tagCounts[tag] = (tagCounts[tag] || 0) + 1;
});
const topTags = Object.entries(tagCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

console.log("\n🏷️  Top 10 Tags:");
topTags.forEach(([tag, count]) => {
  console.log(`   #${tag}: ${count}`);
});

// Data validation
console.log("\n✅ Data Validation:");
const missingAnswers = osQuestions.filter(q => !q.answer || q.answer.trim() === "");
const missingTopics = osQuestions.filter(q => !q.topic);
const missingTags = osQuestions.filter(q => !q.tags || q.tags.length === 0);

console.log(`   Questions with answers: ${osQuestions.length - missingAnswers.length}/${osQuestions.length}`);
console.log(`   Questions with topics: ${osQuestions.length - missingTopics.length}/${osQuestions.length}`);
console.log(`   Questions with tags: ${osQuestions.length - missingTags.length}/${osQuestions.length}`);

if (missingAnswers.length === 0 && missingTopics.length === 0 && missingTags.length === 0) {
  console.log("\n🎉 All questions are properly formatted and ready to use!");
} else {
  console.log("\n⚠️  Some issues found:");
  if (missingAnswers.length) console.log(`   - ${missingAnswers.length} questions missing answers`);
  if (missingTopics.length) console.log(`   - ${missingTopics.length} questions missing topics`);
  if (missingTags.length) console.log(`   - ${missingTags.length} questions missing tags`);
}

console.log("\n" + "=" .repeat(60));