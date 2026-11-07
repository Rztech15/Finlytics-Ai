import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useFinancial } from '../../context/FinancialContext';
import { AIAnalysisResponse } from '../../types';

const SUGGESTED_QUERIES = [
  'Why did my expenses increase?',
  'Which category consumes the most money?',
  'What is my most profitable month?',
  'How is my revenue performing?',
  'What are the major financial risks?',
  'Which expenses should I investigate?',
  'How is my cash flow and runway changing?',
  'What financial improvements can I consider?',
];

export const AIFinancialAnalystView: React.FC = () => {
  const {
    activeDataset,
    kpis,
    isAILoading,
    latestAIResponse,
    askAIAnalyst,
  } = useFinancial();

  const [inputQuery, setInputQuery] = useState('');
  const [response, setResponse] = useState<AIAnalysisResponse | null>(latestAIResponse);

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isAILoading) return;
    const res = await askAIAnalyst(q);
    if (res) {
      setResponse(res);
      setInputQuery('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#101D2B] via-[#153C43]/80 to-[#101D2B] border border-[#42D6C0]/30 p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-[#42D6C0]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#42D6C0]/20 border border-[#42D6C0]/40 text-[#42D6C0] text-xs font-bold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Grounded in {activeDataset.name}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Finlytics Chief AI Financial Analyst
            </h2>
            <p className="text-xs md:text-sm text-[#8B9AA8] mt-1 max-w-2xl">
              Real-time financial intelligence powered by Google Gemini API. Ask complex forensic questions, detect spend anomalies, and audit operating leverage.
            </p>
          </div>

          <div className="text-right shrink-0 hidden md:block">
            <span className="text-xs text-[#8B9AA8] block">Verified Data Source</span>
            <span className="text-xs font-mono font-bold text-white">
              {kpis.transactionCount} Rows • Health Score {kpis.financialHealthScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Fast Prompts */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-[#8B9AA8] flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-[#D4B36A]" />
          <span>Recommended Financial Inquiries:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isAILoading}
              className="px-3 py-1.5 rounded-xl bg-[#132232] hover:bg-[#153C43] text-white hover:text-[#42D6C0] border border-[#42D6C0]/20 hover:border-[#42D6C0]/50 text-xs font-medium transition-all text-left shadow-sm disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Composer */}
      <div className="bg-[#132232] rounded-2xl p-4 border border-[#42D6C0]/30 shadow-xl">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Ask anything about your revenues, expenses, profit drivers, or runway..."
              disabled={isAILoading}
              className="w-full bg-[#101D2B] text-white text-xs pl-4 pr-10 py-3.5 rounded-xl border border-[#42D6C0]/30 focus:outline-none focus:border-[#42D6C0] placeholder:text-[#8B9AA8]"
            />
          </div>
          <button
            type="submit"
            disabled={!inputQuery.trim() || isAILoading}
            className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#42D6C0] to-[#2FD3B4] text-[#101D2B] font-bold text-xs shadow-md shadow-[#42D6C0]/20 hover:opacity-95 disabled:opacity-40 transition-all flex items-center gap-2 shrink-0"
          >
            {isAILoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Analyze</span>
          </button>
        </form>
      </div>

      {/* Loading Shimmer State */}
      {isAILoading && (
        <div className="bg-[#132232] rounded-2xl p-8 border border-[#42D6C0]/30 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-[#42D6C0] animate-spin" />
            <span className="text-sm font-bold text-white">
              Gemini AI is analyzing financial ledgers and calculating ratios...
            </span>
          </div>
          <div className="h-4 w-3/4 rounded bg-[#101D2B] animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-[#101D2B] animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-[#101D2B] animate-pulse" />
        </div>
      )}

      {/* AI Analysis Result Display */}
      {response && !isAILoading && (
        <div className="space-y-6">
          {/* Grounded Calculated Facts Panel */}
          <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/25 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#42D6C0]/15">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#42D6C0]" />
                <span>Grounded Verification Matrix (Source of Truth)</span>
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#42D6C0]/15 text-[#42D6C0] border border-[#42D6C0]/30">
                100% Deterministic Calculations
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {response.groundedFacts.map((fact, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#101D2B] border border-[#42D6C0]/15"
                >
                  <span className="text-[10px] text-[#8B9AA8] font-semibold uppercase block">
                    {fact.kpi}
                  </span>
                  <div className="text-sm font-mono font-extrabold text-white mt-0.5">
                    {fact.calculatedValue}
                  </div>
                  <div className="text-[10px] text-[#8B9AA8] mt-1 line-clamp-1">
                    {fact.context}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Response Markdown */}
          <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/25 shadow-xl">
            <div className="prose prose-invert max-w-none text-xs text-white space-y-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {response.answer}
              </ReactMarkdown>
            </div>

            {/* Methodology & Regulatory Footer */}
            <div className="mt-6 pt-4 border-t border-[#42D6C0]/15 text-[11px] text-[#8B9AA8] space-y-2">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-[#D4B36A] shrink-0 mt-0.5" />
                <span>
                  <strong>Calculation Methodology:</strong> {response.calculationMethodology}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#101D2B] text-[10px] text-[#8B9AA8] border border-[#42D6C0]/10">
                <strong>Disclaimer:</strong> Finlytics AI provides automated mathematical insights and financial education for decision support. It does not provide certified fiduciary investment or tax advice.
              </div>
            </div>
          </div>

          {/* Follow-up Questions Suggestions */}
          {response.suggestedQuestions && response.suggestedQuestions.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#8B9AA8]">Suggested Follow-ups:</div>
              <div className="flex flex-wrap gap-2">
                {response.suggestedQuestions.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sq)}
                    className="px-3 py-1.5 rounded-xl bg-[#132232] hover:bg-[#153C43] text-[#42D6C0] border border-[#42D6C0]/30 text-xs font-medium transition-colors"
                  >
                    {sq} →
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
