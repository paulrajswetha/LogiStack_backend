// server.js - LogiStack Platform — 100% Local Code Judge (No API Required)
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const vm        = require('vm');
const { spawn } = require('child_process');
const fs        = require('fs');
const os        = require('os');
const path      = require('path');
require('dotenv').config();

const app         = express();
const PORT        = process.env.PORT || 5000;
const JWT_SECRET  = process.env.JWT_SECRET || 'your_jwt_secret_here';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leetcode';

const LANGUAGE_NAMES = {
  javascript: 'JavaScript (Node.js)',
  typescript: 'TypeScript',
  python:     'Python 3',
  java:       'Java',
};

app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174','http://localhost:3000','http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => { console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`); next(); });

// ─── Database ─────────────────────────────────────────────────────────────────
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    setTimeout(async () => {
      const users = await User.find().select('username email');
      console.log('📊 Users:', users.map(u => u.username));
    }, 2000);
  })
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ─── Schemas ──────────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email:     { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:  { type: String, required: true },
  progress: {
    problemsSolved: { type: Number, default: 0 },
    aptitudeScore:  { type: Number, default: 0 },
    contestRating:  { type: Number, default: 1200 },
  },
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }],
  createdAt:   { type: Date, default: Date.now },
});

const ProblemSchema = new mongoose.Schema({
  id:          { type: Number, required: true, unique: true },
  slug:        String,
  title:       { type: String, required: true },
  difficulty:  { type: String, required: true, enum: ['Easy','Medium','Hard'] },
  description: { type: String, required: true },
  examples:    [{ input: String, output: String, explanation: String }],
  constraints: [String],
  testCases:   [{ input: String, expectedOutput: String, explanation: String }],
  topic_tags:  [String],
  acceptance_rate: { type: Number, default: 0 },
  isPremium:   { type: Boolean, default: false },
  question_link: String,
  solution_link: String,
  code_solutions: { type: Object, default: {} },
  explanation:    String,
  starter_code:   { type: Object, default: {} },
});

const SubmissionSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  code:    { type: String, required: true },
  language:{ type: String, required: true },
  status:  { type: String, default: 'Pending', enum: ['Pending','Accepted','Wrong Answer','Runtime Error','Compilation Error','Time Limit Exceeded'] },
  runtime: { type: Number, default: 0 },
  memory:  { type: Number, default: 0 },
  testResults: { type: Array, default: [] },
  submittedAt: { type: Date, default: Date.now },
});

const ContestSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  startTime:   { type: Date, required: true },
  endTime:     { type: Date, required: true },
  duration:    { type: String, default: '2 hours' },
  participants:{ type: Number, default: 0 },
  prize:       { type: String, default: '' },
  problems:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
});

const AptitudeQuestionSchema = new mongoose.Schema({
  topic:         { type: String, required: true },
  question:      { type: String, required: true },
  options:       [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  solution:      { type: String, required: true },
  points:        { type: Number, default: 5 },
});

const User             = mongoose.model('User', UserSchema);
const Problem          = mongoose.model('Problem', ProblemSchema);
const Submission       = mongoose.model('Submission', SubmissionSchema);
const Contest          = mongoose.model('Contest', ContestSchema);
const AptitudeQuestion = mongoose.model('AptitudeQuestion', AptitudeQuestionSchema);

// ─── Auth middleware ──────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const h = req.header('Authorization');
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' });
  try { req.user = jwt.verify(h.split(' ')[1], JWT_SECRET); next(); }
  catch (e) { res.status(401).json({ message: e.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' }); }
};
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ═══════════════════════════════════════════════════════════════════════════════
//  100% LOCAL EXECUTION ENGINE — JavaScript, TypeScript, Python, Java
// ═══════════════════════════════════════════════════════════════════════════════

const EXEC_TIMEOUT_MS = 10_000;

function normalise(s) {
  return (s || '').trim().replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').replace(/\n+$/, '');
}

function compareOutputs(actual, expected) {
  if (!expected || expected.trim() === '') {
    return !actual || actual.trim() === '';
  }
  if (!actual || actual.trim() === '') {
    return false;
  }
  
  const normalizedActual = normalise(actual);
  const normalizedExpected = normalise(expected);
  
  if (normalizedActual === normalizedExpected) return true;
  
  try {
    const actualJson = JSON.parse(normalizedActual);
    const expectedJson = JSON.parse(normalizedExpected);
    return JSON.stringify(actualJson) === JSON.stringify(expectedJson);
  } catch (e) {}
  
  const actualNum = parseFloat(normalizedActual);
  const expectedNum = parseFloat(normalizedExpected);
  if (!isNaN(actualNum) && !isNaN(expectedNum)) {
    return Math.abs(actualNum - expectedNum) < 1e-9;
  }
  
  return false;
}

function writeTmp(dir, name, content) {
  const p = path.join(dir, name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

function runProcess(cmd, args, stdinData, cwd, timeoutMs) {
  timeoutMs = timeoutMs || EXEC_TIMEOUT_MS;
  return new Promise(resolve => {
    const start = Date.now();
    let stdout = '', stderr = '', timedOut = false;
    let proc;
    try {
      let finalCmd = cmd;
      if (process.platform === 'win32') {
        if (cmd === 'python3') finalCmd = 'python';
      }
      
      proc = spawn(finalCmd, args, { 
        cwd: cwd || os.tmpdir(),
        shell: true
      });
    } catch (e) {
      return resolve({ exitCode: -1, stdout: '', stderr: `Cannot start '${cmd}': ${e.message}`, runtime: 0, timedOut: false });
    }
    const timer = setTimeout(() => { timedOut = true; proc.kill('SIGKILL'); }, timeoutMs);
    proc.stdout.on('data', d => { stdout += d; });
    proc.stderr.on('data', d => { stderr += d; });
    if (stdinData) proc.stdin.write(stdinData);
    proc.stdin.end();
    proc.on('close', code => { clearTimeout(timer); resolve({ exitCode: code ?? -1, stdout: stdout.trim(), stderr: stderr.trim(), runtime: Date.now() - start, timedOut }); });
    proc.on('error', e => { clearTimeout(timer); resolve({ exitCode: -1, stdout: '', stderr: e.message, runtime: Date.now() - start, timedOut: false }); });
  });
}

function makeVerdict(r, expectedOutput) {
  if (r.timedOut)       return { passed: false, status: 'time_limit_exceeded', stdout: r.stdout, stderr: 'Time Limit Exceeded', runtime_ms: EXEC_TIMEOUT_MS, memory_kb: 0 };
  if (r.exitCode !== 0) return { passed: false, status: 'runtime_error',       stdout: r.stdout, stderr: r.stderr || `Exit ${r.exitCode}`, runtime_ms: r.runtime, memory_kb: 0 };
  const passed = compareOutputs(r.stdout, expectedOutput);
  return { passed, status: passed ? 'accepted' : 'wrong_answer', stdout: r.stdout, stderr: r.stderr, runtime_ms: r.runtime, memory_kb: 0 };
}

// ── 1. JavaScript ─────────────────────────────────────────────────────────────
function judgeJavaScript(userCode, testInput, expectedOutput) {
  const logs = [];
  
  const fakeLog = (...a) => {
    logs.push(a.map(x => {
      if (x === undefined) return 'undefined';
      if (x === null) return 'null';
      if (typeof x === 'object') {
        try {
          return JSON.stringify(x);
        } catch (e) {
          return String(x);
        }
      }
      return String(x);
    }).join(' '));
  };
  
  // Parse input - handle direct string input
  let inputValue = testInput.trim();
  // Remove quotes if present
  if (inputValue.startsWith('"') && inputValue.endsWith('"')) {
    inputValue = inputValue.slice(1, -1);
  }
  
  const sandbox = {
    console: { log: fakeLog, error: fakeLog, warn: fakeLog },
    JSON, Math, parseInt, parseFloat, isNaN, isFinite,
    Number, String, Array, Object, Boolean, Map, Set, RegExp, Date,
    Promise,
    __input: inputValue,
    __result: undefined,
    undefined: undefined,
    NaN: NaN,
    Infinity: Infinity,
    setTimeout: () => { throw new Error('setTimeout is not allowed'); },
    setInterval: () => { throw new Error('setInterval is not allowed'); },
  };
  
  // Look for common function names
  const functionNames = ['lengthOfLongestSubstring', 'twoSum', 'maxProfit', 'isValid', 'romanToInt', 
                         'longestCommonPrefix', 'threeSum', 'mergeTwoLists', 'isPalindrome', 'reverse',
                         'solution', 'solve', 'fn', 'func', 'main', 'run', 'calculate'];
  
  const wrapped = `
${userCode}

(function _judge() {
  let _fn = null;
  
  // Check for Solution class
  if (typeof Solution === 'function') {
    try {
      const _sol = new Solution();
      for (const _method of Object.getOwnPropertyNames(Object.getPrototypeOf(_sol))) {
        if (_method !== 'constructor' && typeof _sol[_method] === 'function') {
          _fn = _sol[_method].bind(_sol);
          break;
        }
      }
    } catch(_e) {}
  }
  
  // Check for named functions
  if (!_fn) {
    for (const _name of ${JSON.stringify(functionNames)}) {
      try { 
        if (typeof eval(_name) === 'function') { 
          _fn = eval(_name); 
          break; 
        } 
      } catch(_e) {}
    }
  }
  
  // Find any function in the code
  if (!_fn) {
    const _funcRegex = /function\\s+(\\w+)\\s*\\(/g;
    let _match;
    while ((_match = _funcRegex.exec(${JSON.stringify(userCode)})) !== null) {
      try { 
        if (typeof eval(_match[1]) === 'function') { 
          _fn = eval(_match[1]); 
          break; 
        } 
      } catch(_e) {}
    }
  }
  
  // Execute function with input
  if (_fn) {
    try {
      const _r = _fn(__input);
      if (_r !== undefined) __result = _r;
    } catch(_e) {
      console.error(_e.message);
      throw _e;
    }
  } else {
    // Try to execute as script
    try {
      __result = eval(__input);
    } catch(_e) {
      console.error(_e.message);
    }
  }
})();`;
  
  const start = Date.now();
  
  try {
    const script = new vm.Script(wrapped, { timeout: EXEC_TIMEOUT_MS });
    script.runInNewContext(sandbox, { timeout: EXEC_TIMEOUT_MS });
    
    let stdout = '';
    if (logs.length > 0) {
      stdout = logs.join('\n');
    } else if (sandbox.__result !== undefined) {
      if (typeof sandbox.__result === 'object') {
        try {
          stdout = JSON.stringify(sandbox.__result);
        } catch (e) {
          stdout = String(sandbox.__result);
        }
      } else {
        stdout = String(sandbox.__result);
      }
    }
    
    const runtime_ms = Date.now() - start;
    const passed = compareOutputs(stdout, expectedOutput);
    
    return { 
      passed, 
      status: passed ? 'accepted' : 'wrong_answer', 
      stdout: stdout || '', 
      stderr: '', 
      runtime_ms, 
      memory_kb: Math.round(process.memoryUsage().heapUsed / 1024)
    };
    
  } catch (err) {
    const runtime_ms = Date.now() - start;
    return { 
      passed: false, 
      status: 'runtime_error', 
      stdout: logs.join('\n'), 
      stderr: err.message, 
      runtime_ms, 
      memory_kb: 0 
    };
  }
}

// ── 2. TypeScript ────────────────────────────────────────────────────────────
function judgeTypeScript(userCode, testInput, expectedOutput) {
  const js = userCode
    .replace(/:\s*[\w<>\[\] |&,]+(?=[,)={;])/g, '')
    .replace(/^export\s+(interface|type)\s[\s\S]*?^}/gm, '')
    .replace(/<[A-Z]\w*(\[\])?>/g, '')
    .replace(/\bas\s+\w+/g, '');
  return judgeJavaScript(js, testInput, expectedOutput);
}

// ── 3. Python ─────────────────────────────────────────────────────────────────
async function judgePython(userCode, testInput, expectedOutput) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'logi_py_'));
  try {
    // Clean the input - remove quotes and handle properly
    let cleanInput = testInput.trim();
    if (cleanInput.startsWith('"') && cleanInput.endsWith('"')) {
      cleanInput = cleanInput.slice(1, -1);
    }
    
    const script = `import sys, json
${userCode}

def main():
    # Read input
    input_str = sys.stdin.read().strip()
    
    # Remove quotes if present
    if input_str.startswith('"') and input_str.endswith('"'):
        input_str = input_str[1:-1]
    
    # Find function to call
    func = None
    
    # Check for Solution class
    if 'Solution' in dir():
        sol = Solution()
        for method in dir(sol):
            if not method.startswith('_') and callable(getattr(sol, method)):
                func = getattr(sol, method)
                break
    
    # Check for common function names
    if func is None:
        common_names = ['lengthOfLongestSubstring', 'twoSum', 'maxProfit', 'isValid', 'romanToInt', 
                       'longestCommonPrefix', 'threeSum', 'mergeTwoLists', 'isPalindrome', 'reverse',
                       'solution', 'solve', 'calculate', 'process']
        for name in common_names:
            if name in dir():
                func = eval(name)
                break
    
    # Find any function
    if func is None:
        import inspect
        for name, obj in globals().items():
            if callable(obj) and not name.startswith('_') and name not in ['print', 'len', 'range', 'main']:
                func = obj
                break
    
    # Execute
    if func:
        result = func(input_str)
        if result is not None:
            if isinstance(result, (list, dict, bool)):
                print(json.dumps(result))
            else:
                print(result)
    else:
        # Try to evaluate input directly
        try:
            result = eval(input_str)
            if result is not None:
                if isinstance(result, (list, dict, bool)):
                    print(json.dumps(result))
                else:
                    print(result)
        except:
            pass

if __name__ == "__main__":
    main()
`;
    writeTmp(dir, 'sol.py', script);
    
    let pythonCmd = 'python3';
    if (process.platform === 'win32') {
      pythonCmd = 'python';
    }
    
    const r = await runProcess(pythonCmd, ['sol.py'], cleanInput, dir);
    
    if (r.stderr && (r.stderr.includes('not found') || r.stderr.includes('not recognized'))) {
      return { 
        passed: false, 
        status: 'runtime_error', 
        stdout: '', 
        stderr: 'Python is not installed or not in PATH', 
        runtime_ms: 0, 
        memory_kb: 0 
      };
    }
    
    if (r.timedOut) return { passed: false, status: 'time_limit_exceeded', stdout: r.stdout, stderr: 'TLE', runtime_ms: EXEC_TIMEOUT_MS, memory_kb: 0 };
    if (r.exitCode !== 0 && r.stderr) {
      // Check if it's just a warning or actual error
      if (!r.stderr.includes('Traceback') && !r.stderr.includes('Error')) {
        // It's probably just output
        const passed = compareOutputs(r.stdout || r.stderr, expectedOutput);
        return { passed, status: passed ? 'accepted' : 'wrong_answer', stdout: r.stdout || r.stderr, stderr: '', runtime_ms: r.runtime, memory_kb: 4096 };
      }
      return { passed: false, status: 'runtime_error', stdout: r.stdout, stderr: r.stderr, runtime_ms: r.runtime, memory_kb: 0 };
    }
    const passed = compareOutputs(r.stdout, expectedOutput);
    return { passed, status: passed ? 'accepted' : 'wrong_answer', stdout: r.stdout, stderr: r.stderr, runtime_ms: r.runtime, memory_kb: 4096 };
  } finally { 
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (err) {}
  }
}

// ── 4. Java ───────────────────────────────────────────────────────────────────
async function judgeJava(userCode, testInput, expectedOutput) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'logi_java_'));
  try {
    let finalCode = userCode;
    finalCode = finalCode.replace(/^\s*package\s+[A-Za-z0-9_.]+\s*;\s*\r?\n?/m, '');
    
    if (!finalCode.includes('import java.util.')) {
      const essentialImports = `import java.util.*;
import java.io.*;

`;
      finalCode = essentialImports + finalCode;
    }
    
    const classMatch = finalCode.match(/(?:public\s+)?class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : 'Solution';
    
    fs.writeFileSync(path.join(dir, `${className}.java`), finalCode, 'utf8');
    
    const compile = await runProcess('javac', [`${className}.java`], '', dir, 30000);
    if (compile.exitCode !== 0) {
      return { passed: false, status: 'compilation_error', stdout: '', stderr: compile.stderr, runtime_ms: 0, memory_kb: 0 };
    }
    
    const hasMain = /public\s+static\s+void\s+main\s*\(/.test(finalCode);
    
    if (hasMain) {
      const run = await runProcess('java', ['-cp', '.', className], testInput, dir);
      return makeVerdict(run, expectedOutput);
    } else {
      let cleanInput = testInput.trim();
      if (cleanInput.startsWith('"') && cleanInput.endsWith('"')) {
        cleanInput = cleanInput.slice(1, -1);
      }
      
      const mainWrapper = `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        ${className} sol = new ${className}();
        String input = ${JSON.stringify(cleanInput)};
        
        // Try to find and call a method
        boolean called = false;
        java.lang.reflect.Method[] methods = ${className}.class.getDeclaredMethods();
        for (java.lang.reflect.Method method : methods) {
            if (!method.getName().equals("main") && method.getParameterCount() == 1) {
                Class<?> paramType = method.getParameterTypes()[0];
                Object param = null;
                
                if (paramType == String.class) {
                    param = input;
                } else if (paramType == int.class) {
                    param = Integer.parseInt(input);
                } else if (paramType == double.class) {
                    param = Double.parseDouble(input);
                } else {
                    param = input;
                }
                
                method.setAccessible(true);
                Object result = method.invoke(sol, param);
                if (result != null) {
                    System.out.println(result);
                }
                called = true;
                break;
            }
        }
        
        if (!called) {
            System.out.println(sol.toString());
        }
    }
}`;
      
      fs.writeFileSync(path.join(dir, 'Main.java'), mainWrapper, 'utf8');
      
      const compileWrapper = await runProcess('javac', [`${className}.java`, 'Main.java'], '', dir, 30000);
      if (compileWrapper.exitCode !== 0) {
        return { passed: false, status: 'compilation_error', stdout: '', stderr: compileWrapper.stderr, runtime_ms: 0, memory_kb: 0 };
      }
      
      const run = await runProcess('java', ['-cp', '.', 'Main'], testInput, dir);
      return makeVerdict(run, expectedOutput);
    }
  } catch (error) {
    return { passed: false, status: 'runtime_error', stdout: '', stderr: error.message, runtime_ms: 0, memory_kb: 0 };
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (err) {}
  }
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
async function judgeOneTestCase(language, userCode, testInput, expectedOutput) {
  console.log(`  ⚡ [${language}] "${(testInput||'').slice(0,60).replace(/\n/g,' ')}"`);
  switch (language) {
    case 'javascript': return judgeJavaScript(userCode, testInput, expectedOutput);
    case 'typescript': return judgeTypeScript(userCode, testInput, expectedOutput);
    case 'python':     return judgePython(userCode, testInput, expectedOutput);
    case 'java':       return judgeJava(userCode, testInput, expectedOutput);
    default:           return { passed: false, status: 'runtime_error', stdout: '', stderr: `Language '${language}' not supported`, runtime_ms: 0, memory_kb: 0 };
  }
}

async function executeAgainstTestCases(language, userCode, testCases) {
  const results = [];
  for (const tc of testCases) {
    const testInput      = (tc.input || '').trim();
    const expectedOutput = (tc.expectedOutput || '').trim();
    const v = await judgeOneTestCase(language, userCode, testInput, expectedOutput);
    results.push({ input: tc.input, expectedOutput, actualOutput: v.stdout, passed: v.passed, error: v.stderr || null, judgeStatus: v.status, runtime: v.runtime_ms, memory: v.memory_kb });
  }
  return results;
}

function mapStatus(s) {
  return ({ accepted:'Accepted', wrong_answer:'Wrong Answer', runtime_error:'Runtime Error', compilation_error:'Compilation Error', time_limit_exceeded:'Time Limit Exceeded' })[s] || 'Runtime Error';
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/api/test', (req, res) => res.json({ message: 'Server is running!', timestamp: new Date().toISOString(), judge: 'Local (no API)' }));

// Auth
app.post('/api/signup', asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: 'Username, email and password are required' });
  if (username.length < 3) return res.status(400).json({ message: 'Username must be at least 3 characters' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  const existing = await User.findOne({ $or: [{ email: email.toLowerCase().trim() }, { username: username.trim() }] });
  if (existing) return res.status(409).json({ message: `${existing.email === email.toLowerCase() ? 'Email' : 'Username'} already in use` });
  const user = await User.create({ username: username.trim(), email: email.toLowerCase().trim(), password: await bcrypt.hash(password, 12) });
  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  console.log(`✅ User created: ${username}`);
  res.status(201).json({ message: 'Account created successfully', token, username: user.username });
}));

app.post('/api/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid email or password' });
  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  console.log(`✅ Login: ${user.username}`);
  res.json({ token, username: user.username, userId: user._id });
}));

// User
app.get('/api/user/me', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

app.get('/api/user/:userId', authenticate, asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) return res.status(400).json({ message: 'Invalid user ID' });
  const user = await User.findById(req.params.userId).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

// Problems
app.get('/api/problems', asyncHandler(async (req, res) => {
  const { difficulty, tag, search, page = 1, limit = 50 } = req.query;
  const query = {};
  if (difficulty && ['Easy','Medium','Hard'].includes(difficulty)) query.difficulty = difficulty;
  if (tag)    query.topic_tags = { $in: [tag] };
  if (search) query.title = { $regex: search, $options: 'i' };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [problems, total] = await Promise.all([
    Problem.find(query).select('id title difficulty acceptance_rate topic_tags isPremium slug').sort({ id: 1 }).skip(skip).limit(parseInt(limit)),
    Problem.countDocuments(query),
  ]);
  res.json({ problems, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
}));

app.get('/api/problems/:problemId', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.problemId);
  if (isNaN(id)) return res.status(400).json({ message: 'Problem ID must be a number' });
  const problem = await Problem.findOne({ id });
  if (!problem) return res.status(404).json({ message: 'Problem not found' });
  res.json(problem);
}));

// Run
app.post('/api/run/:problemId', asyncHandler(async (req, res) => {
  const { code, language, customInput } = req.body;
  if (!code || !language) return res.status(400).json({ message: 'Code and language are required' });
  if (!LANGUAGE_NAMES[language]) return res.status(400).json({ message: `Unsupported language: ${language}` });
  const id = parseInt(req.params.problemId);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid problem ID' });
  const problem = await Problem.findOne({ id });
  if (!problem) return res.status(404).json({ message: 'Problem not found' });
  const testCases = customInput ? [{ input: customInput, expectedOutput: '' }] : (problem.testCases?.slice(0, 3) || []);
  if (!testCases.length) return res.json({ status: 'no_tests', message: 'No test cases available.', results: [] });
  const results   = await executeAgainstTestCases(language, code, testCases);
  const allPassed = results.every(r => r.passed);
  const firstErr  = results.find(r => r.error);
  res.json({ status: firstErr ? 'error' : allPassed ? 'accepted' : 'wrong', results, passed: results.filter(r => r.passed).length, total: results.length, runtime: results.find(r => r.runtime)?.runtime || null, memory: results.find(r => r.memory)?.memory || null });
}));

// Submit
app.post('/api/submit/:problemId', authenticate, asyncHandler(async (req, res) => {
  const { code, language } = req.body;
  if (!code || !language) return res.status(400).json({ message: 'Code and language are required' });
  if (!LANGUAGE_NAMES[language]) return res.status(400).json({ message: `Unsupported language: ${language}` });
  const id = parseInt(req.params.problemId);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid problem ID' });
  const problem = await Problem.findOne({ id });
  if (!problem) return res.status(404).json({ message: 'Problem not found' });
  const testCases = problem.testCases || [];
  if (!testCases.length) {
    const sub = await Submission.create({ user: req.user.id, problem: problem._id, code, language, status: 'Accepted', testResults: [] });
    await User.findByIdAndUpdate(req.user.id, { $push: { submissions: sub._id }, $inc: { 'progress.problemsSolved': 1 } });
    return res.json({ status: 'Accepted', submissionId: sub._id, message: 'Submission accepted!' });
  }
  const results     = await executeAgainstTestCases(language, code, testCases);
  const allPassed   = results.every(r => r.passed);
  const firstErr    = results.find(r => r.error);
  const failedCount = results.filter(r => !r.passed).length;
  let status = 'Accepted';
  if (firstErr)        status = mapStatus(results.find(r => r.judgeStatus && r.judgeStatus !== 'accepted')?.judgeStatus || 'runtime_error');
  else if (!allPassed) status = 'Wrong Answer';
  const rtVals     = results.filter(r => r.runtime).map(r => r.runtime);
  const avgRuntime = rtVals.length ? Math.round(rtVals.reduce((a,b) => a+b, 0) / rtVals.length) : 0;
  const maxMemory  = Math.max(...results.filter(r => r.memory).map(r => r.memory), 0);
  const sub = await Submission.create({ user: req.user.id, problem: problem._id, code, language, status, runtime: avgRuntime, memory: maxMemory, testResults: results });
  if (allPassed) await User.findByIdAndUpdate(req.user.id, { $push: { submissions: sub._id }, $inc: { 'progress.problemsSolved': 1 } });
  else           await User.findByIdAndUpdate(req.user.id, { $push: { submissions: sub._id } });
  res.json({ status, submissionId: sub._id, passed: results.filter(r => r.passed).length, total: results.length, results, runtime: avgRuntime, memory: maxMemory, message: allPassed ? '✅ All test cases passed!' : `❌ ${failedCount} test case(s) failed.` });
}));

// Submissions
app.get('/api/submissions/user', authenticate, asyncHandler(async (req, res) => {
  const query = { user: req.user.id };
  if (req.query.problemId) { const p = await Problem.findOne({ id: parseInt(req.query.problemId) }); if (p) query.problem = p._id; }
  res.json(await Submission.find(query).populate('problem','id title difficulty').sort({ submittedAt: -1 }).limit(100));
}));

app.get('/api/submissions/:submissionId', authenticate, asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.submissionId)) return res.status(400).json({ message: 'Invalid submission ID' });
  const sub = await Submission.findById(req.params.submissionId).populate('problem','id title difficulty');
  if (!sub) return res.status(404).json({ message: 'Submission not found' });
  if (sub.user.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });
  res.json(sub);
}));

// Languages
app.get('/api/languages', (req, res) => res.json({
  languages: Object.entries(LANGUAGE_NAMES).map(([id, name]) => ({ id, name, supported: true })),
  judge: 'Local execution (no API)', judgeAvailable: true,
}));

// Solutions
app.get('/api/problems/:problemId/solutions', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.problemId);
  if (isNaN(id)) return res.status(400).json({ message: 'Problem ID must be a number' });
  const problem = await Problem.findOne({ id }).select('code_solutions explanation title');
  if (!problem) return res.status(404).json({ message: 'Problem not found' });
  res.json({ title: problem.title, solutions: problem.code_solutions || {}, explanation: problem.explanation || '' });
}));

// Contests
app.get('/api/contests', asyncHandler(async (req, res) => res.json(await Contest.find().populate('problems','id title difficulty').sort({ startTime: -1 }))));
app.get('/api/contests/:contestId', asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.contestId)) return res.status(400).json({ message: 'Invalid contest ID' });
  const contest = await Contest.findById(req.params.contestId).populate('problems');
  if (!contest) return res.status(404).json({ message: 'Contest not found' });
  res.json(contest);
}));

// Aptitude
app.get('/api/aptitude/topics', asyncHandler(async (req, res) => res.json(await AptitudeQuestion.distinct('topic'))));
app.get('/api/aptitude/questions/:topic', asyncHandler(async (req, res) => res.json(await AptitudeQuestion.find({ topic: req.params.topic }).select('-solution -correctAnswer').limit(20))));
app.get('/api/aptitude/solution/:questionId', authenticate, asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.questionId)) return res.status(400).json({ message: 'Invalid question ID' });
  const q = await AptitudeQuestion.findById(req.params.questionId).select('solution correctAnswer');
  if (!q) return res.status(404).json({ message: 'Question not found' });
  res.json(q);
}));

app.post('/api/aptitude/submit', authenticate, asyncHandler(async (req, res) => {
  const { questionId, selectedAnswer } = req.body;
  if (!questionId || selectedAnswer === undefined) return res.status(400).json({ message: 'QuestionId and selectedAnswer are required' });
  const q = await AptitudeQuestion.findById(questionId);
  if (!q) return res.status(404).json({ message: 'Question not found' });
  const isCorrect = Number(selectedAnswer) === q.correctAnswer;
  if (isCorrect) await User.findByIdAndUpdate(req.user.id, { $inc: { 'progress.aptitudeScore': 1 } });
  res.json({ isCorrect, correctAnswer: q.correctAnswer, solution: q.solution });
}));

// Health & Debug
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString(), mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected', judge: 'Local (no external API)' }));
app.get('/api/debug/users', async (req, res) => {
  try { res.json({ users: (await User.find().select('username email')).map(u => ({ username: u.username, email: u.email })) }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Error handlers
app.use((err, req, res, next) => { console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err.message); res.status(500).json({ message: 'Internal server error' }); });
app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.path} not found` }));

// Start
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║   🚀 LogiStack Server Running!                              ║
║   📡 Server:  http://localhost:${PORT}                        ║
║   🔗 API:     http://localhost:${PORT}/api                    ║
║   ⚡ Judge:   100% Local — Zero API, Zero Rate Limits       ║
║   Languages: JavaScript, TypeScript, Python, Java          ║
╚══════════════════════════════════════════════════════════════╝

  Runtime checklist:
  ✅ Node.js  — already running
  ✅ python3  — run: python3 --version
  📦 Java     — run: javac --version    (install JDK if missing)
  `);
});