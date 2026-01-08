import React, { useState } from 'react';
import { AppStep, TestConfig, Problem, CodeSubmission, AnalysisResult } from './types';
import SetupScreen from './components/SetupScreen';
import TestInterface from './components/TestInterface';
import ResultScreen from './components/ResultScreen';
import { generateProblems, generateAnalysisReport } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [config, setConfig] = useState<TestConfig | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleStartTest = async (testConfig: TestConfig) => {
    setConfig(testConfig);
    setStep(AppStep.LOADING_PROBLEMS);

    try {
      const generatedProblems = await generateProblems(
        testConfig.language,
        testConfig.mode === 'assessment',
        testConfig.problemCount,
        testConfig.targetLevel
      );
      setProblems(generatedProblems);
      setStep(AppStep.TESTING);
    } catch (error) {
      console.error("Error loading problems", error);
      alert("문제를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.");
      setStep(AppStep.SETUP);
    }
  };

  const handleTestComplete = async (submissions: CodeSubmission[]) => {
    if (!config) return;
    setStep(AppStep.ANALYZING);
    try {
      const result = await generateAnalysisReport(submissions, problems, config.userName);
      setAnalysis(result);
      setStep(AppStep.REPORT);
    } catch (error) {
      console.error("Error analyzing results", error);
      alert("결과 분석 중 오류가 발생했습니다.");
      // Fallback or restart
      setStep(AppStep.TESTING);
    }
  };

  const handleRestart = () => {
    setStep(AppStep.SETUP);
    setConfig(null);
    setProblems([]);
    setAnalysis(null);
  };

  // Loading Screen for intermediate steps
  if (step === AppStep.LOADING_PROBLEMS || step === AppStep.ANALYZING) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-6">
        <div className="relative w-24 h-24">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <div className="text-xl font-bold animate-pulse">
          {step === AppStep.LOADING_PROBLEMS ? 'KOI 문제를 출제하고 있습니다...' : '코드 분석 및 리포트 작성 중...'}
        </div>
        <p className="text-slate-400 text-sm">AI 전문가가 실시간으로 처리 중입니다.</p>
      </div>
    );
  }

  return (
    <>
      {step === AppStep.SETUP && (
        <SetupScreen onStart={handleStartTest} isLoading={false} />
      )}
      
      {step === AppStep.TESTING && config && (
        <TestInterface 
          problems={problems} 
          language={config.language} 
          onComplete={handleTestComplete} 
        />
      )}

      {step === AppStep.REPORT && analysis && config && (
        <ResultScreen analysis={analysis} onRestart={handleRestart} userName={config.userName} />
      )}
    </>
  );
};

export default App;
