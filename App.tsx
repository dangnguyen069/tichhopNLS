import React, { useState } from 'react';
import { GradeLevel, AppState, NLSStandard } from './types';
import { NLS_DATA, SUBJECTS } from './constants';
import { integrateNLS } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ResultView from './components/ResultView';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    subject: SUBJECTS[0],
    gradeLevel: GradeLevel.G6_7,
    content: '',
    isLoading: false,
    result: null,
    error: null
  });

  const handleIntegrate = async () => {
    if (!state.content.trim()) {
      setState(prev => ({ ...prev, error: "Vui lòng nhập hoặc tải lên nội dung phụ lục." }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, result: null }));

    try {
      const result = await integrateNLS(
        state.content,
        state.subject,
        state.gradeLevel,
        NLS_DATA
      );
      setState(prev => ({ ...prev, result, isLoading: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || "Đã xảy ra lỗi không xác định."
      }));
    }
  };

  const clearContent = () => {
    setState(prev => ({ ...prev, content: '', result: null, error: null }));
  };

  return (
    <div className="min-h-screen bg-accent/30 pb-12 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-teal-100 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white shadow-md shadow-primary/30">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
             </div>
             <div>
                <h1 className="text-2xl font-black text-dark tracking-tight">NLS Integrator</h1>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">Tích hợp Năng lực số vào chương trình dạy học</p>
             </div>
          </div>
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold px-2 py-1 bg-teal-light text-dark rounded-md">Powered by Gemini AI</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Configuration & Input Panel */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Settings Card */}
            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-teal-100/50 border border-teal-50">
              <h2 className="text-lg font-bold text-slate-700 mb-5 flex items-center gap-2">
                <span className="bg-teal-light text-dark rounded-lg w-8 h-8 flex items-center justify-center text-sm font-extrabold shadow-sm">1</span>
                Cấu hình chương trình
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Môn học</label>
                  <div className="relative">
                    <select
                      value={state.subject}
                      onChange={(e) => setState(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full rounded-xl border-slate-200 border-2 p-3 text-sm font-medium focus:ring-4 focus:ring-teal-100 focus:border-primary outline-none bg-white hover:border-teal-200 transition-all appearance-none text-slate-700"
                    >
                      {SUBJECTS.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Cấp độ (Lớp)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setState(prev => ({ ...prev, gradeLevel: GradeLevel.G6_7 }))}
                      className={`py-3 px-3 rounded-xl text-sm font-bold transition-all border-2 relative overflow-hidden ${
                        state.gradeLevel === GradeLevel.G6_7
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                          : 'bg-white text-slate-500 border-slate-100 hover:border-teal-200 hover:bg-teal-50'
                      }`}
                    >
                      Lớp 6 - 7 (TC1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setState(prev => ({ ...prev, gradeLevel: GradeLevel.G8_9 }))}
                      className={`py-3 px-3 rounded-xl text-sm font-bold transition-all border-2 ${
                        state.gradeLevel === GradeLevel.G8_9
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                          : 'bg-white text-slate-500 border-slate-100 hover:border-teal-200 hover:bg-teal-50'
                      }`}
                    >
                      Lớp 8 - 9 (TC2)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Card */}
            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-teal-100/50 border border-teal-50 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <span className="bg-teal-light text-dark rounded-lg w-8 h-8 flex items-center justify-center text-sm font-extrabold shadow-sm">2</span>
                  Nội dung Phụ lục
                </h2>
                {state.content && (
                   <button 
                     onClick={clearContent}
                     className="text-xs text-red-500 hover:text-red-600 font-bold px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                   >
                     Xóa nội dung
                   </button>
                )}
              </div>

              <div className="mb-4">
                <FileUpload onContentLoad={(text) => setState(prev => ({ ...prev, content: text }))} />
              </div>

              <textarea
                value={state.content}
                onChange={(e) => setState(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Dán nội dung chương trình ở đây hoặc tải lên file (Word, PDF)..."
                className="flex-1 w-full rounded-xl border-slate-200 border-2 p-4 text-sm focus:ring-4 focus:ring-teal-100 focus:border-primary outline-none resize-none font-mono text-slate-600 bg-slate-50/50 hover:bg-white transition-colors placeholder:text-slate-400"
              />
              
              <button
                onClick={handleIntegrate}
                disabled={state.isLoading || !state.content}
                className={`mt-4 w-full py-4 px-6 rounded-xl font-bold text-white shadow-xl transition-all active:scale-[0.98] flex justify-center items-center gap-2 ${
                  state.isLoading || !state.content
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-primary to-secondary hover:brightness-105 shadow-primary/30'
                }`}
              >
                {state.isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Tích hợp ngay
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-8 min-h-[500px]">
            {state.error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl mb-6 shadow-sm flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold text-red-800">Đã xảy ra lỗi</h3>
                  <p className="text-sm mt-1">{state.error}</p>
                </div>
              </div>
            )}

            {!state.result && !state.isLoading && !state.error && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-teal-100 rounded-3xl p-12 bg-white/50">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-50 to-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-teal-100">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                </div>
                <p className="text-xl font-bold text-slate-400">Chưa có kết quả</p>
                <p className="text-slate-400 mt-2 text-center max-w-md">Vui lòng nhập nội dung chương trình và nhấn "Tích hợp ngay" để xem kết quả phân tích.</p>
              </div>
            )}

            {state.result && <ResultView results={state.result} subject={state.subject} gradeLevel={state.gradeLevel === GradeLevel.G6_7 ? 'Lớp 6-7' : 'Lớp 8-9'} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;