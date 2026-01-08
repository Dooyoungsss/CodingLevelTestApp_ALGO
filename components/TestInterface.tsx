import React, { useState, useEffect } from 'react';
import { Problem, Language, CodeSubmission } from '../types';
import { DEFAULT_CPP_CODE, DEFAULT_PYTHON_CODE } from '../constants';
import { Play, CheckCircle, AlertCircle, ChevronRight, Terminal, ArrowRight } from 'lucide-react';
import { judgeCode } from '../services/geminiService';

interface TestInterfaceProps {
  problems: Problem[];
  language: Language;
  onComplete: (submissions: CodeSubmission[]) => void;
}

const TestInterface: React.FC<TestInterfaceProps> = ({ problems, language, onComplete }) => {
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [testOutput, setTestOutput] = useState<{ passed: boolean; output: string } | null>(null);
  const [submissions, setSubmissions] = useState<CodeSubmission[]>([]);

  const currentProblem = problems[currentProblemIdx];

  // Initialize code for new problems
  useEffect(() => {
    if (!codeMap[currentProblem.id]) {
      setCodeMap(prev => ({
        ...prev,
        [currentProblem.id]: language === 'python' ? DEFAULT_PYTHON_CODE : DEFAULT_CPP_CODE
      }));
    }
    setTestOutput(null);
  }, [currentProblem.id, language]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCodeMap(prev => ({
      ...prev,
      [currentProblem.id]: e.target.value
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;

    if (e.key === 'Tab') {
      e.preventDefault();
      // Insert 6 spaces
      const spaces = '      '; 
      const newValue = value.substring(0, selectionStart) + spaces + value.substring(selectionEnd);
      
      setCodeMap(prev => ({
        ...prev,
        [currentProblem.id]: newValue
      }));

      // Move cursor
      setTimeout(() => {
        textarea.selectionStart = selectionStart + 6;
        textarea.selectionEnd = selectionStart + 6;
      }, 0);
    } 
    else if (e.key === 'Enter') {
      e.preventDefault();
      // Auto-indentation logic
      const lines = value.substring(0, selectionStart).split('\n');
      const currentLine = lines[lines.length - 1];
      const match = currentLine.match(/^(\s*)/);
      const indentation = match ? match[1] : '';
      
      const newValue = value.substring(0, selectionStart) + '\n' + indentation + value.substring(selectionEnd);
      
      setCodeMap(prev => ({
        ...prev,
        [currentProblem.id]: newValue
      }));

      // Move cursor
      setTimeout(() => {
        textarea.selectionStart = selectionStart + 1 + indentation.length;
        textarea.selectionEnd = selectionStart + 1 + indentation.length;
      }, 0);
    }
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestOutput(null);
    try {
      // Run against the first sample case for feedback
      const sample = currentProblem.sampleCases[0];
      const result = await judgeCode(
        codeMap[currentProblem.id],
        language,
        currentProblem,
        sample.input,
        sample.output
      );
      setTestOutput(result);
    } catch (error) {
      setTestOutput({ passed: false, output: "System Error: Failed to execute code." });
    } finally {
      setIsRunning(false);
    }
  };

  const handleNext = () => {
    // Save current submission state
    const currentSubmission: CodeSubmission = {
      problemId: currentProblem.id,
      code: codeMap[currentProblem.id],
      passed: testOutput?.passed || false,
      executionOutput: testOutput?.output || "Not executed or Failed"
    };

    const newSubmissions = [...submissions];
    // Update or add
    if (newSubmissions[currentProblemIdx]) {
      newSubmissions[currentProblemIdx] = currentSubmission;
    } else {
      newSubmissions.push(currentSubmission);
    }
    setSubmissions(newSubmissions);

    if (currentProblemIdx < problems.length - 1) {
      setCurrentProblemIdx(prev => prev + 1);
    } else {
      onComplete(newSubmissions);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">KOI Test Env</h2>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700 uppercase">
             {language === 'python' ? 'Python 3' : 'C++17'}
          </span>
        </div>

        {/* Prominent Problem Counter */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
             <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Progress</span>
             <div className="text-lg font-bold text-white">
                Problem <span className="text-blue-400 text-xl">{currentProblemIdx + 1}</span> / {problems.length}
             </div>
        </div>

        <div className="flex items-center gap-2">
            {problems.map((_, idx) => (
                <div key={idx} className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentProblemIdx ? 'bg-blue-500 scale-125' : idx < currentProblemIdx ? 'bg-green-500' : 'bg-slate-700'}`} />
            ))}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Problem Description */}
        <div className="w-1/3 min-w-[350px] bg-slate-900 border-r border-slate-800 overflow-y-auto p-6 custom-scrollbar">
          <div className="mb-6">
            <span className="text-sm font-bold text-blue-400 mb-1 block">Level {currentProblem.level}</span>
            <h1 className="text-2xl font-bold text-white mb-4">{currentProblem.title}</h1>
            <div className="prose prose-invert prose-slate max-w-none">
              <p className="whitespace-pre-line">{currentProblem.description}</p>
              
              <h3 className="text-lg font-bold text-white mt-6 mb-2">입력</h3>
              <p className="whitespace-pre-line text-slate-300">{currentProblem.inputFormat}</p>
              
              <h3 className="text-lg font-bold text-white mt-6 mb-2">출력</h3>
              <p className="whitespace-pre-line text-slate-300">{currentProblem.outputFormat}</p>

              <h3 className="text-lg font-bold text-white mt-6 mb-2">제한조건</h3>
              <p className="whitespace-pre-line text-slate-300">{currentProblem.constraints}</p>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-white mb-3">예제 입출력</h3>
                {currentProblem.sampleCases.map((sample, idx) => (
                  <div key={idx} className="mb-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                    <div className="grid grid-cols-2 text-xs font-bold uppercase text-slate-500 bg-slate-950 border-b border-slate-700">
                      <div className="p-2 border-r border-slate-700">Input</div>
                      <div className="p-2">Output</div>
                    </div>
                    <div className="grid grid-cols-2 text-sm font-mono">
                      <div className="p-3 border-r border-slate-700 whitespace-pre-wrap">{sample.input}</div>
                      <div className="p-3 whitespace-pre-wrap">{sample.output}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: IDE & Console */}
        <div className="flex-1 flex flex-col bg-slate-950">
          {/* Editor Area */}
          <div className="flex-1 relative">
            <textarea
              className="w-full h-full bg-[#1e1e1e] text-slate-300 font-mono text-base p-6 resize-none focus:outline-none leading-relaxed"
              value={codeMap[currentProblem.id] || ''}
              onChange={handleCodeChange}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              placeholder="// Write your code here..."
            />
          </div>

          {/* Console/Output Area */}
          <div className="h-48 bg-slate-900 border-t border-slate-800 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                <Terminal className="w-4 h-4" />
                <span>Execution Console</span>
              </div>
              <button
                onClick={runTests}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                {isRunning ? (
                    <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"/>
                ) : (
                    <Play className="w-3 h-3 fill-current" />
                )}
                Run Test Case
              </button>
            </div>
            
            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto">
              {!testOutput && !isRunning && (
                <div className="text-slate-500 italic">Click 'Run Test Case' to execute your code against the sample input.</div>
              )}
              {isRunning && (
                <div className="text-yellow-400">Compiling and running code...</div>
              )}
              {testOutput && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        Status: 
                        <span className={testOutput.passed ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                            {testOutput.passed ? "PASSED" : "FAILED"}
                        </span>
                    </div>
                    <div className="mb-1 text-slate-400">Output:</div>
                    <pre className="text-slate-200 whitespace-pre-wrap">{testOutput.output}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-end px-6">
        <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold transition-all hover:pr-8 group"
        >
            {currentProblemIdx === problems.length - 1 ? 'Finish & Submit' : 'Next Problem'}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </footer>
    </div>
  );
};

export default TestInterface;
