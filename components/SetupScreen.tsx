import React, { useState } from 'react';
import { TestConfig, Language, TestMode } from '../types';
import { LEVELS } from '../constants';
import { Code2, Target, Trophy, BrainCircuit, User, ListOrdered } from 'lucide-react';

interface SetupScreenProps {
  onStart: (config: TestConfig) => void;
  isLoading: boolean;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, isLoading }) => {
  const [userName, setUserName] = useState<string>('');
  const [language, setLanguage] = useState<Language>('python');
  const [mode, setMode] = useState<TestMode>('assessment');
  const [targetLevel, setTargetLevel] = useState<number>(1);
  const [problemCount, setProblemCount] = useState<number>(3);

  const handleStart = () => {
    if (!userName.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    onStart({
      userName,
      language,
      mode,
      targetLevel: mode === 'specific' ? targetLevel : undefined,
      problemCount,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-2xl w-full bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <div className="p-8 text-center bg-gradient-to-r from-blue-900 to-indigo-900">
          <div className="flex justify-center mb-4">
            <Trophy className="w-16 h-16 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">KOI Prep Master</h1>
          <p className="text-blue-200">한국정보올림피아드 대비 코딩 능력 진단 시스템</p>
          <div className="mt-3 inline-block px-4 py-1.5 rounded-full bg-slate-900/50 text-slate-300 text-xs font-bold border border-slate-500/30">
            Powered by 알고학원
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* User Name */}
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
              학생 이름 (Name)
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="이름을 입력하세요 (예: 홍길동)"
                className="w-full bg-slate-700 text-white rounded-xl pl-12 pr-4 py-4 border-2 border-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Selection */}
            <div>
              <label className="block text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
                사용 언어 (Language)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('python')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    language === 'python'
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                      : 'border-slate-600 hover:border-slate-500 text-slate-400'
                  }`}
                >
                  <span className="font-mono font-bold">Python</span>
                </button>
                <button
                  onClick={() => setLanguage('cpp')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    language === 'cpp'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-slate-600 hover:border-slate-500 text-slate-400'
                  }`}
                >
                  <span className="font-mono font-bold">C++</span>
                </button>
              </div>
            </div>

            {/* Problem Count */}
            <div>
              <label className="block text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
                문제 수 (1~20)
              </label>
              <div className="flex items-center gap-3 bg-slate-700 p-2 rounded-xl border-2 border-slate-600">
                <ListOrdered className="text-slate-500 w-5 h-5 ml-2" />
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={problemCount} 
                  onChange={(e) => setProblemCount(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-center font-bold text-white bg-slate-600 py-1 rounded-md">
                  {problemCount}
                </span>
              </div>
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
              테스트 모드 (Test Mode)
            </label>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setMode('assessment')}
                className={`relative p-5 rounded-xl border-2 text-left transition-all group ${
                  mode === 'assessment'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <BrainCircuit className={`w-6 h-6 ${mode === 'assessment' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className={`font-bold text-lg ${mode === 'assessment' ? 'text-emerald-400' : 'text-white'}`}>
                    종합 코딩수준평가 (Level Assessment)
                  </span>
                </div>
                <p className="text-sm text-slate-400 pl-9">
                  레벨 1~10 난이도의 문제를 섞어 출제하여 현재 실력을 정확히 진단합니다.
                </p>
              </button>

              <button
                onClick={() => setMode('specific')}
                className={`relative p-5 rounded-xl border-2 text-left transition-all group ${
                  mode === 'specific'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className={`w-6 h-6 ${mode === 'specific' ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className={`font-bold text-lg ${mode === 'specific' ? 'text-indigo-400' : 'text-white'}`}>
                      특정 레벨 도전 (Specific Level)
                    </span>
                  </div>
                </div>
                {mode === 'specific' && (
                  <div className="mt-4 pl-9">
                    <label className="text-sm text-indigo-300 mr-2">레벨 선택:</label>
                    <select
                      value={targetLevel}
                      onChange={(e) => setTargetLevel(Number(e.target.value))}
                      className="bg-slate-700 text-white rounded px-3 py-1 border border-slate-600 focus:outline-none focus:border-indigo-500"
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>
                          Level {l}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-800 border-t border-slate-700">
          <button
            onClick={handleStart}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
              isLoading
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:scale-[1.02]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                문제 출제중...
              </>
            ) : (
              <>
                <Code2 className="w-6 h-6" />
                테스트 시작하기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
