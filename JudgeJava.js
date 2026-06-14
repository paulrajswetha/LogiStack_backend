// ── 4. Java (corrected v2) ────────────────────────────────────────────────────
async function judgeJava(userCode, testInput, expectedOutput) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'logi_java_'));
  try {
    // 1. Strip package declaration
    let cleanedCode = userCode
      .replace(/^\s*package\s+[A-Za-z0-9_.]+\s*;\s*\r?\n?/m, '')
      .trim();

    // 2. Extract all import lines from user code so we can hoist them into Main
    const userImports = [];
    cleanedCode = cleanedCode.replace(/^\s*import\s+[^\n]+;\s*\n?/gm, line => {
      userImports.push(line.trim());
      return '';
    }).trim();

    // 3. Does user already supply main()?
    const hasMain = /public\s+static\s+void\s+main\s*\(/.test(cleanedCode);

    if (hasMain) {
      // ── Path A: user has their own main ──────────────────────────────────────
      // Re-attach their imports at the top, write as single file
      const classMatch = cleanedCode.match(/public\s+class\s+(\w+)/);
      const className  = classMatch ? classMatch[1] : 'Main';

      const fullCode = [
        'import java.util.*;',
        'import java.io.*;',
        ...userImports,
        '',
        cleanedCode,
      ].join('\n');

      fs.writeFileSync(path.join(dir, `${className}.java`), fullCode, 'utf8');

      const compile = await runProcess('javac', [`${className}.java`], '', dir, 30_000);
      if (compile.exitCode !== 0)
        return { passed: false, status: 'compilation_error', stdout: '', stderr: compile.stderr, runtime_ms: 0, memory_kb: 0 };

      const run = await runProcess('java', ['-cp', '.', className], testInput, dir);
      return makeVerdict(run, expectedOutput);

    } else {
      // ── Path B: no main() — generate Main.java as separate file ──────────────

      // Detect method name + return type
      const methodName = detectSolutionMethod(cleanedCode);
      const returnType = detectReturnType(cleanedCode, methodName);
      const javaArgs   = buildJavaArgs(testInput);

      let printStatement;
      if (!methodName) {
        printStatement = `new Solution();`;
      } else if (returnType === 'void') {
        printStatement = `sol.${methodName}(${javaArgs});`;
      } else if (/int\[\]|long\[\]|double\[\]|String\[\]/.test(returnType)) {
        printStatement = `System.out.println(java.util.Arrays.toString(sol.${methodName}(${javaArgs})));`;
      } else if (/int\[\]\[\]|long\[\]\[\]/.test(returnType)) {
        printStatement = `System.out.println(java.util.Arrays.deepToString(sol.${methodName}(${javaArgs})));`;
      } else {
        printStatement = `System.out.println(sol.${methodName}(${javaArgs}));`;
      }

      // Solution.java — NO imports (they go into Main.java)
      const solutionFile = cleanedCode;

      // Main.java — ALL imports at top, then the harness
      const mainFile = [
        'import java.util.*;',
        'import java.io.*;',
        ...userImports,          // hoist user imports here so Solution.java stays clean
        '',
        'public class Main {',
        '    public static void main(String[] args) throws Exception {',
        '        Solution sol = new Solution();',
        `        ${printStatement}`,
        '    }',
        '}',
      ].join('\n');

      fs.writeFileSync(path.join(dir, 'Solution.java'), solutionFile, 'utf8');
      fs.writeFileSync(path.join(dir, 'Main.java'),     mainFile,     'utf8');

      // Compile both together
      const compile = await runProcess('javac', ['Solution.java', 'Main.java'], '', dir, 30_000);
      if (compile.exitCode !== 0)
        return { passed: false, status: 'compilation_error', stdout: '', stderr: compile.stderr, runtime_ms: 0, memory_kb: 0 };

      const run = await runProcess('java', ['-cp', '.', 'Main'], testInput, dir);
      if (run.timedOut)
        return { passed: false, status: 'time_limit_exceeded', stdout: run.stdout, stderr: 'Time Limit Exceeded', runtime_ms: EXEC_TIMEOUT_MS, memory_kb: 0 };
      if (run.exitCode !== 0)
        return {
          passed: false,
          status: run.stderr.includes('compilation_error') ? 'compilation_error' : 'runtime_error',
          stdout: run.stdout,
          stderr: run.stderr.includes('ClassNotFoundException')
            ? `ClassNotFoundException — ensure your class is named 'Solution' with no package declaration.\n\n${run.stderr}`
            : run.stderr || `Exit ${run.exitCode}`,
          runtime_ms: run.runtime,
          memory_kb: 0,
        };

      const passed = compareOutputs(run.stdout, expectedOutput);
      return { passed, status: passed ? 'accepted' : 'wrong_answer', stdout: run.stdout, stderr: run.stderr, runtime_ms: run.runtime, memory_kb: 0 };
    }

  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ── Helpers (add these above judgeJava) ──────────────────────────────────────

function detectSolutionMethod(code) {
  const re = /(?:public|private|protected|)\s+(?:static\s+)?(?!class\b)[\w<>\[\]]+\s+(\w+)\s*\(/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    const name = m[1];
    if (name !== 'main' && !/^[A-Z]/.test(name)) return name;
  }
  return null;
}

function detectReturnType(code, methodName) {
  if (!methodName) return 'Object';
  const re = new RegExp(
    `(?:public|private|protected|)\\s+(?:static\\s+)?([\\w<>\\[\\]]+)\\s+${methodName}\\s*\\(`
  );
  const m = re.exec(code);
  return m ? m[1] : 'Object';
}

function buildJavaArgs(rawInput) {
  const lines = (rawInput || '').trim().split('\n').map(l => {
    return l.includes('=') ? l.split('=').slice(1).join('=').trim() : l.trim();
  }).filter(Boolean);

  if (!lines.length) return '';

  return lines.map(v => {
    if (/^".*"$/.test(v))           return v;                          // "string"
    if (/^-?\d+$/.test(v))          return v;                          // integer
    if (/^-?\d+\.\d+$/.test(v))     return v + 'd';                   // double
    if (v === 'true' || v === 'false') return v;                       // boolean
    if (/^\[[\d,\s-]*\]$/.test(v))  return `new int[]{${v.slice(1,-1)}}`; // int[]
    if (/^\[.*\]$/.test(v))         return `new String[]{${v.slice(1,-1)}}`; // String[]
    return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;      // bare string
  }).join(', ');
}