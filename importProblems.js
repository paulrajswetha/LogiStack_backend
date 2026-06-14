// importFromJsonl.js
const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codearena')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Define Problem Schema
const ProblemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  slug: { type: String },
  title: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
  description: { type: String, required: true },
  examples: [{ input: String, output: String, explanation: String }],
  constraints: [String],
  testCases: [{ input: String, expectedOutput: String, explanation: String }],
  topic_tags: [String],
  acceptance_rate: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  question_link: String,
  solution_link: String,
  code_solutions: { type: Object, default: {} },
  explanation: { type: String }
});

const Problem = mongoose.model('Problem', ProblemSchema);

async function importProblems() {
  const filePath = './leetcode-solutions.jsonl';
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath);
    process.exit(1);
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const problems = [];
  let lineNumber = 0;

  console.log('📖 Reading problems from JSONL file...');

  for await (const line of rl) {
    lineNumber++;
    try {
      const data = JSON.parse(line);
      
      // Skip if missing required fields
      if (!data.id || !data.title || !data.difficulty) {
        console.log(`⚠️ Skipping line ${lineNumber}: Missing required fields`);
        continue;
      }

      // Parse the content directly from the JSON
      const content = data.content || '';
      
      // Extract examples from content
      const examples = extractExamples(content);
      const constraints = extractConstraints(content);
      const testCases = extractTestCases(content);
      
      // Parse code solutions
      const codeSolutions = {
        javascript: extractCodeFromAnswer(data.answer?.javascript),
        python: extractCodeFromAnswer(data.answer?.python),
        java: extractCodeFromAnswer(data.answer?.java),
        cpp: extractCodeFromAnswer(data.answer?.['c++'])
      };
      
      // Extract topic tags from content
      const topicTags = extractTopicTags(content);
      
      problems.push({
        id: parseInt(data.id),
        slug: data.slug || `problem-${data.id}`,
        title: data.title,
        difficulty: data.difficulty,
        description: content, // Use the full content directly
        examples: examples,
        constraints: constraints,
        testCases: testCases,
        topic_tags: topicTags,
        acceptance_rate: 0,
        isPremium: false,
        question_link: `https://leetcode.com/problems/${data.slug}/`,
        solution_link: `https://leetcode.com/problems/${data.slug}/solution/`,
        code_solutions: codeSolutions,
        explanation: data.answer?.explanation || ''
      });
      
      if (lineNumber % 100 === 0) {
        console.log(`✅ Parsed ${lineNumber} problems...`);
      }
    } catch (err) {
      console.error(`❌ Error parsing line ${lineNumber}:`, err.message);
    }
  }

  console.log(`\n📊 Total problems parsed: ${problems.length}`);

  if (problems.length === 0) {
    console.log('❌ No problems were parsed. Please check your JSONL file format.');
    process.exit(1);
  }

  // Clear existing problems and insert new ones
  try {
    const count = await Problem.countDocuments();
    if (count > 0) {
      console.log(`🗑️  Clearing ${count} existing problems...`);
      await Problem.deleteMany({});
    }
    
    console.log(`📥 Importing ${problems.length} problems...`);
    
    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < problems.length; i += batchSize) {
      const batch = problems.slice(i, i + batchSize);
      await Problem.insertMany(batch, { ordered: false });
      console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(problems.length / batchSize)}`);
    }
    
    console.log(`✅ Successfully imported ${problems.length} problems!`);
    
    // Verify by fetching problem 1
    const problem1 = await Problem.findOne({ id: 1 });
    if (problem1) {
      console.log('\n🔍 Verification for Problem 1:');
      console.log(`Title: ${problem1.title}`);
      console.log(`Description length: ${problem1.description?.length}`);
      console.log(`Description preview: ${problem1.description?.substring(0, 200)}...`);
      console.log(`Examples count: ${problem1.examples?.length}`);
      console.log(`Constraints count: ${problem1.constraints?.length}`);
    }
    
  } catch (err) {
    console.error('❌ Error inserting problems:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

function extractExamples(content) {
  const examples = [];
  if (!content) return examples;
  
  // Pattern for examples with explanation
  const pattern = /\*\*Example \d+:\*\*\s*\n\s*\*\*Input:\*\*\s*([^\n]+)\s*\n\s*\*\*Output:\*\*\s*([^\n]+)(?:\s*\n\s*\*\*Explanation:\*\*\s*([^\n]+))?/g;
  
  let match;
  while ((match = pattern.exec(content)) !== null) {
    examples.push({
      input: match[1].trim().replace(/\\/g, ''),
      output: match[2].trim(),
      explanation: match[3] ? match[3].trim() : ''
    });
  }
  
  return examples;
}

function extractConstraints(content) {
  const constraints = [];
  if (!content) return constraints;
  
  const constraintMatch = content.match(/\*\*Constraints:\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/);
  if (constraintMatch) {
    const lines = constraintMatch[1].split('\n');
    for (const line of lines) {
      let constraint = line.trim();
      if (constraint && !constraint.includes('Example') && !constraint.includes('Input:')) {
        constraint = constraint.replace(/^\*+/, '').trim();
        if (constraint) constraints.push(constraint);
      }
    }
  }
  
  return constraints;
}

function extractTestCases(content) {
  const testCases = [];
  if (!content) return testCases;
  
  const pattern = /\*\*Example \d+:\*\*\s*\n\s*\*\*Input:\*\*\s*([^\n]+)\s*\n\s*\*\*Output:\*\*\s*([^\n]+)/g;
  
  let match;
  while ((match = pattern.exec(content)) !== null) {
    testCases.push({
      input: match[1].trim().replace(/\\/g, ''),
      expectedOutput: match[2].trim(),
      explanation: ''
    });
  }
  
  return testCases;
}

function extractTopicTags(content) {
  const commonTags = [
    'Array', 'Hash Table', 'String', 'Linked List', 'Math', 'Two Pointers',
    'Dynamic Programming', 'Backtracking', 'Tree', 'Graph', 'Binary Search',
    'Sorting', 'Heap', 'Stack', 'Queue', 'Recursion', 'Sliding Window',
    'Greedy', 'Bit Manipulation', 'Trie', 'Divide and Conquer', 'Binary Tree'
  ];
  
  const tags = [];
  for (const tag of commonTags) {
    if (content.includes(tag)) {
      tags.push(tag);
    }
  }
  
  return tags.length > 0 ? tags.slice(0, 3) : ['Algorithm'];
}

function extractCodeFromAnswer(answer) {
  if (!answer) return '';
  
  // Extract code from markdown code blocks
  const codeMatch = answer.match(/```\w*\n([\s\S]*?)```/);
  if (codeMatch) {
    return codeMatch[1].trim();
  }
  
  return answer.trim();
}

// Run the import
importProblems().catch(err => {
  console.error('Fatal error:', err);
  if (mongoose.connection) {
    mongoose.connection.close();
  }
  process.exit(1);
});