export type Language = 'python' | 'cpp';
export type TestMode = 'specific' | 'assessment';

export interface TestCase {
  input: string;
  output: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  level: number; // 1-10
  inputFormat: string;
  outputFormat: string;
  sampleCases: TestCase[];
  constraints: string;
}

export interface CodeSubmission {
  problemId: string;
  code: string;
  passed: boolean;
  executionOutput: string; // From the mock execution
}

export interface TestConfig {
  language: Language;
  mode: TestMode;
  targetLevel?: number; // 1-10, only if mode is specific
  userName: string;
  problemCount: number;
}

export interface AnalysisResult {
  totalScore: number;
  rankEstimate: string; // e.g., "Silver", "Gold", "Beginner"
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback: string;
  levelScores: { level: string; score: number }[]; // For chart
}

export enum AppStep {
  SETUP = 'SETUP',
  LOADING_PROBLEMS = 'LOADING_PROBLEMS',
  TESTING = 'TESTING',
  ANALYZING = 'ANALYZING',
  REPORT = 'REPORT'
}
