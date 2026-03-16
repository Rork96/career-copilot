import { Sparkles, Check, ShieldCheck, Zap, ChevronRight, MessageSquarePlus, ArrowRight, LayoutDashboard, Target } from 'lucide-react';

export default function Landing({ onStart }) {
  return (
    // Доданий радіальний градієнт для глибини
    <div className="flex flex-col items-center justify-start min-h-screen pt-20 pb-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white overflow-hidden font-sans">

      {/* Hero Section */}
      <div className="max-w-4xl px-4 animate-in fade-in slide-in-from-top-8 duration-1000 flex flex-col items-center text-center relative z-10">

        {/* Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 text-xs font-bold uppercase tracking-widest mb-8 mx-auto hover:border-blue-200 hover:bg-blue-50 transition-colors">
          <Zap size={14} className="text-blue-500" /> Powered by Gemini 5 Flash
        </div>

        {/* Headline - Зменшений tracking, правильний leading */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tighter leading-[1.05] mb-6 mx-auto max-w-3xl">
          The Intelligent Way to <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Land Your Dream Job.</span>
        </h1>

        {/* Subheadline - Баланс тексту */}
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed text-center font-medium text-balance">
          The only AI career tool built for Canadian standards. Optimize your resume for ATS, bypass filters, and generate high-conversion applications in seconds.
        </p>

        {/* CTA Button - Більш сучасна тінь */}
        <button
          onClick={onStart}
          className="px-8 py-4 bg-slate-900 text-white font-bold text-base rounded-full shadow-xl hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-2xl transition-all flex items-center gap-2 group"
        >
          Optimize My Resume <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 mx-auto">Trusted by candidates hired at</p>
          <div className="flex flex-wrap gap-8 md:gap-14 opacity-50 grayscale justify-center items-center">
            <span className="font-black text-xl italic tracking-tighter">Amazon</span>
            <span className="font-black text-xl tracking-widest uppercase">RBC</span>
            <span className="font-black text-xl tracking-tight uppercase">Shopify</span>
            <span className="font-bold text-xl tracking-tighter">Google</span>
          </div>
        </div>
      </div>

      {/* macOS Style Dashboard Mockup (Premium UI) */}
      <div className="w-full max-w-5xl px-4 md:px-0 mx-auto mt-20 relative z-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
        <div className="w-full rounded-2xl p-2 bg-slate-500/5 ring-1 ring-slate-200/50 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.05)] relative">

          {/* Decorative glows behind the mockup */}
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-400/20 blur-[120px] rounded-full -z-10"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-indigo-400/20 blur-[120px] rounded-full -z-10"></div>

          <div className="rounded-xl overflow-hidden border border-slate-200/80 bg-white shadow-sm flex flex-col h-[400px] md:h-[600px]">
            {/* macOS Top Bar */}
            <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/20"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20"></div>
              <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500/20"></div>
              <div className="mx-auto flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-md shadow-sm">
                <ShieldCheck size={12} className="text-green-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ATS Secured</span>
              </div>
            </div>

            {/* Mockup Body */}
            <div className="flex-1 bg-slate-100 p-6 flex gap-6">
              {/* Sidebar Mockup */}
              <div className="hidden md:flex w-64 flex-col gap-4">
                <div className="h-32 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-center items-center gap-2">
                  <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center text-green-500 font-black text-xl">92%</div>
                  <div className="h-2 w-20 bg-slate-200 rounded-full"></div>
                </div>
                <div className="h-48 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
                  <div className="h-2 w-24 bg-slate-200 rounded-full mb-2"></div>
                  <div className="h-8 bg-blue-50 rounded-lg border border-blue-100 flex items-center px-3"><div className="h-2 w-16 bg-blue-300 rounded-full"></div></div>
                  <div className="h-8 bg-red-50 rounded-lg border border-red-100 flex items-center px-3"><div className="h-2 w-12 bg-red-300 rounded-full"></div></div>
                </div>
              </div>
              {/* Main Content Mockup */}
              <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 flex flex-col gap-4 relative overflow-hidden">
                <div className="h-6 w-48 bg-slate-800 rounded-lg mx-auto mb-4"></div>
                <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                <div className="h-2 w-5/6 bg-slate-100 rounded-full"></div>
                <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                <div className="h-2 w-4/5 bg-slate-100 rounded-full"></div>
                <div className="mt-8 h-4 w-32 bg-slate-200 rounded-md"></div>
                <div className="flex gap-2 mt-2">
                  <div className="h-2 w-1.5 bg-slate-400 rounded-full mt-1.5"></div>
                  <div className="h-2 w-full bg-slate-100 rounded-full mt-1.5"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-2 w-1.5 bg-slate-400 rounded-full mt-1.5"></div>
                  <div className="h-2 w-3/4 bg-slate-100 rounded-full mt-1.5"></div>
                </div>

                {/* Glowing Overlay Element */}
                <div className="absolute bottom-10 right-10 px-4 py-2 bg-slate-900 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
                  <Sparkles size={14} className="text-yellow-400" />
                  <span className="text-xs font-bold text-white">Optimized for Canadian Market</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Box Features */}
      <div className="max-w-5xl mx-auto px-4 py-32 w-full relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: The Hero Feature */}
          <div className="md:col-span-2 min-h-[400px] bg-slate-50 border border-slate-100 rounded-[2rem] p-10 flex flex-col relative overflow-hidden transition-all hover:shadow-lg duration-300 text-left group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-6 text-slate-700 group-hover:scale-110 transition-transform"><Target size={24} /></div>
              <h3 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">Canadian ATS Standard.</h3>
              <p className="text-base text-slate-500 max-w-md leading-relaxed">Our deterministic scoring engine ensures your resume perfectly matches the keywords recruiters are looking for, guaranteeing a 90%+ ATS match.</p>
            </div>
            {/* Bleed visual */}
            <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-white rounded-full shadow-2xl border border-slate-100 flex items-center justify-center transform transition-transform group-hover:scale-105 duration-500">
              <span className="text-7xl font-black text-green-500 tracking-tighter">92%</span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Card 2: AI Coach */}
            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 flex flex-col relative overflow-hidden transition-all hover:shadow-lg duration-300 text-left min-h-[190px] flex-1 group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Contextual AI.</h3>
                <p className="text-sm text-slate-500 leading-relaxed pr-8">Your personal career coach lives in the cloud, remembering your achievements.</p>
              </div>
              <MessageSquarePlus size={64} className="absolute -bottom-4 -right-4 text-slate-200 group-hover:text-blue-100 transition-colors" />
            </div>

            {/* Card 3: Security */}
            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 flex flex-col relative overflow-hidden transition-all hover:shadow-lg duration-300 text-left min-h-[190px] flex-1 group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Zero Retention.</h3>
                <p className="text-sm text-slate-500 leading-relaxed pr-8">Bring your own API key. We never store your data on our servers.</p>
              </div>
              <ShieldCheck size={64} className="absolute -bottom-4 -right-4 text-slate-200 group-hover:text-green-100 transition-colors" />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
