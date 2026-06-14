// updateAllProblems.js
const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codearena')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const ProblemSchema = new mongoose.Schema({
  id: Number,
  title: String,
  difficulty: String,
  description: String,
  examples: Array,
  constraints: Array,
  testCases: Array,
  explanation: String
});

const Problem = mongoose.model('Problem', ProblemSchema);

async function updateProblems() {
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

  let updated = 0;
  let lineNumber = 0;

  console.log('📖 Reading problems from JSONL file...');

  for await (const line of rl) {
    lineNumber++;
    try {
      const data = JSON.parse(line);
      
      if (!data.id || !data.title) continue;
      
      // Extract examples and constraints from content
      const content = data.content || '';
      const examples = extractExamples(content);
      const constraints = extractConstraints(content);
      const testCases = extractTestCases(content);
      
      // Update the problem in MongoDB
      const result = await Problem.updateOne(
        { id: parseInt(data.id) },
        {
          $set: {
            description: content,
            examples: examples,
            constraints: constraints,
            testCases: testCases,
            explanation: data.answer?.explanation || ''
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        updated++;
        if (updated % 100 === 0) {
          console.log(`✅ Updated ${updated} problems...`);
        }
      }
    } catch (err) {
      console.error(`❌ Error parsing line ${lineNumber}:`, err.message);
    }
  }

  console.log(`\n✅ Updated ${updated} problems successfully!`);
  await mongoose.connection.close();
}

function extractExamples(content) {
  const examples = [];
  if (!content) return examples;
  
  // Pattern for examples
  const patterns = [
    /\*\*Example \d+:\*\*\s*\n\s*\*\*Input:\*\*\s*([^\n]+)\s*\n\s*\*\*Output:\*\*\s*([^\n]+)(?:\s*\n\s*\*\*Explanation:\*\*\s*([^\n]+))?/g,
    /Example \d+:\s*\n\s*Input:\s*([^\n]+)\s*\n\s*Output:\s*([^\n]+)(?:\s*\n\s*Explanation:\s*([^\n]+))?/g
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      examples.push({
        input: match[1].trim().replace(/\\/g, ''),
        output: match[2].trim(),
        explanation: match[3] ? match[3].trim() : ''
      });
    }
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

updateProblems().catch(console.error);
