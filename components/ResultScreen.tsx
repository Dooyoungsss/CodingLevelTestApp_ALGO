import React, { useRef, useState } from 'react';
import { AnalysisResult } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trophy, Activity, ThumbsUp, AlertTriangle, BookOpen, RotateCcw, Printer, FileDown, School } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ResultScreenProps {
  analysis: AnalysisResult;
  onRestart: () => void;
  userName: string;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ analysis, onRestart, userName }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        backgroundColor: '#0f172a', // Capture dark theme background correctly
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Multi-page logic
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${userName}_KOI_Report.pdf`);
    } catch (error) {
      console.error("PDF Generation failed", error);
      alert("PDF 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 overflow-y-auto print:bg-white print:p-0 print:overflow-visible">
      
      {/* Action Bar (Hidden in Print) */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center print-hidden">
         <button
            onClick={onRestart}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors border border-slate-700"
        >
            <RotateCcw className="w-4 h-4" />
            처음으로
        </button>
        <div className="flex gap-4">
            <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors border border-slate-700"
            >
                <Printer className="w-4 h-4" />
                리포트 출력
            </button>
            <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors shadow-lg disabled:opacity-50"
            >
                {isGeneratingPdf ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                ) : (
                    <FileDown className="w-4 h-4" />
                )}
                PDF 저장
            </button>
        </div>
      </div>

      {/* Report Content */}
      <div 
        ref={reportRef} 
        className="max-w-5xl mx-auto space-y-8 pb-10 print:max-w-none print:space-y-4 print:pb-0"
      >
        
        {/* Header Section */}
        <div className="text-center space-y-4 mb-12 print:mb-8">
          <div className="flex justify-center items-center gap-2 mb-2">
            <School className="w-6 h-6 text-blue-400 print:text-blue-600" />
            <span className="text-blue-400 font-bold tracking-wider print:text-blue-600">Provided by 알고학원</span>
          </div>
          <h1 className="text-4xl font-bold text-white print:text-black">{userName}님의 종합 평가 리포트</h1>
          <p className="text-slate-400 print:text-slate-600">알고학원 Agent가 분석한 코딩 실력 진단 결과입니다.</p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
            {/* Score & Rank */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden print-bg-white print:border-slate-300 print:shadow-none">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500 print:bg-blue-600" />
                <span className="text-slate-400 uppercase tracking-widest text-sm font-bold mb-2 print:text-slate-600">Total Score</span>
                <div className="text-7xl font-bold text-white mb-4 print:text-black">{analysis.totalScore}</div>
                <div className="px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-full font-bold border border-indigo-500/50 flex items-center gap-2 print:bg-indigo-50 print:text-indigo-700 print:border-indigo-200">
                    <Trophy className="w-4 h-4" />
                    Estimated Rank: {analysis.rankEstimate}
                </div>
            </div>

             {/* Chart */}
             <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 print-bg-white print:border-slate-300">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 print:text-black">
                    <Activity className="w-5 h-5 text-blue-400 print:text-blue-600" />
                    영역별 분석
                </h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analysis.levelScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis 
                                dataKey="level" 
                                stroke="#94a3b8" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                interval={0} 
                            />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                            />
                            <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 print-bg-white print:border-slate-300">
                <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2 print:text-emerald-700">
                    <ThumbsUp className="w-5 h-5" />
                    강점 (Strengths)
                </h3>
                <ul className="space-y-3">
                    {analysis.strengths.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-300 print:text-black">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 print:bg-emerald-600" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 print-bg-white print:border-slate-300">
                <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2 print:text-amber-700">
                    <AlertTriangle className="w-5 h-5" />
                    보완점 (Areas for Improvement)
                </h3>
                <ul className="space-y-3">
                    {analysis.weaknesses.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-300 print:text-black">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 print:bg-amber-600" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Detailed Feedback & Recommendations */}
        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 print-bg-white print:border-slate-300">
            <h3 className="text-xl font-bold text-white mb-6 print:text-black">종합 피드백</h3>
            <div className="prose prose-invert prose-slate max-w-none mb-8 bg-slate-950/50 p-6 rounded-xl print:bg-slate-50 print:text-black print:prose-headings:text-black">
                <p className="whitespace-pre-line text-slate-300 print:text-black">{analysis.detailedFeedback}</p>
            </div>

            <h4 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2 print:text-blue-700">
                <BookOpen className="w-5 h-5" />
                학습 추천 (Next Steps)
            </h4>
            <div className="grid grid-cols-1 gap-4">
                {analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 flex items-center gap-4 print:bg-white print:border-slate-300">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 print:bg-blue-100 print:text-blue-800">
                            {idx + 1}
                        </div>
                        <span className="text-slate-200 print:text-black">{rec}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center justify-center pt-8 space-y-4 print:pt-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold print:text-slate-600">
                <School className="w-4 h-4" />
                <span>알고학원에서 제공하는 콘텐츠입니다.</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
