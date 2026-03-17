import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Target, Download, Shield, Sparkles, Github, ArrowRight, Check, MessageSquare } from 'lucide-react';
import AIChatShowcase from './AIChatShowcase';

export default function Landing({ onStart }) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    })
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans tracking-tight overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">

      {/* Decorative Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[40rem] bg-gradient-to-b from-indigo-50/30 via-transparent to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/30 blur-[120px] -z-10" />
      <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-100/30 blur-[120px] -z-10" />

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Sparkles size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Career Copilot</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        {/* 1. HERO SECTION */}
        <section className="flex flex-col items-center text-center max-w-4xl mx-auto relative z-10">
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200/60 shadow-sm text-sm font-medium text-slate-600 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            ATS Optimization Engine v2.0
          </motion.div>

          <motion.h1
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-slate-900 mb-8 leading-[1.05] max-w-3xl"
          >
            Tailor your resume for any job in seconds. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">100% Private. Your data, zero tracking.</span>
          </motion.h1>

          <motion.p
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
            className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl leading-relaxed text-balance"
          >
            Get past the ATS filters with an AI-powered document that speaks to recruiters. <strong className="text-slate-800 font-semibold">No subscriptions, just results.</strong>
          </motion.p>

          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-semibold text-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-indigo-600 hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgb(79,70,229,0.2)] transition-all flex items-center justify-center gap-3 group"
            >
              Try it for Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="https://github.com/Rork96/career-copilot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-2xl font-semibold text-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              <Github size={20} />
              View on GitHub
            </a>
          </motion.div>

          <motion.div
            custom={5}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
            className="mt-10 inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-slate-100 shadow-sm text-xs font-semibold uppercase tracking-widest text-slate-500"
          >
            <Shield size={14} className="text-green-500" />
            Powered by Google Gemini AI. 100% Free.
          </motion.div>
        </section>

        {/* 2. MOCKUP INTERFACE */}
        <motion.section
          custom={6}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          className="mt-32 relative z-10"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/40 to-transparent rounded-[3rem] -z-10 border border-white" />
          <div className="p-4 sm:p-6 md:p-10">
            <div className="bg-white/80 backdrop-blur-2xl border border-slate-200/60 shadow-[0_20px_50px_rgba(8,112,184,0.07)] rounded-[2rem] overflow-hidden">
              {/* Fake Mac Titlebar */}
              <div className="h-14 border-b border-slate-100 flex items-center px-6 gap-2 bg-gradient-to-b from-slate-50 to-white">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300"></div>
                </div>
                <div className="mx-auto text-xs font-medium text-slate-400 font-mono tracking-tight">career-copilot — AI Matrix</div>
              </div>

              <div className="p-6 md:p-10 bg-[#FAFAFA]">
                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                  {/* Left Side: Job Requirements */}
                  <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative group flex flex-col">
                    <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-slate-100 text-slate-600 text-[10px] font-bold px-4 py-1.5 rounded-full shadow-sm uppercase tracking-widest border border-slate-200">Input</div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                        <Target size={20} className="text-slate-400" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Job Requirements</h3>
                    </div>

                    <div className="space-y-6 flex-1">
                      <div className="h-2 w-1/4 bg-slate-200 rounded-full mb-2"></div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors group-hover:bg-indigo-50/30">
                          <div className="w-2 h-2 rounded-full bg-slate-300 mt-2 shrink-0"></div>
                          <p className="text-sm text-slate-600 leading-relaxed">Experience with <strong className="text-slate-900 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100">React</strong> and modern frontend state management.</p>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors group-hover:bg-indigo-50/30">
                          <div className="w-2 h-2 rounded-full bg-slate-300 mt-2 shrink-0"></div>
                          <p className="text-sm text-slate-600 leading-relaxed">Proven ability to <strong className="text-slate-900 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100">optimize rendering performance</strong>.</p>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors group-hover:bg-indigo-50/30">
                          <div className="w-2 h-2 rounded-full bg-slate-300 mt-2 shrink-0"></div>
                          <p className="text-sm text-slate-600 leading-relaxed">Familiarity with <strong className="text-slate-900 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100">Tailwind CSS</strong> and responsive design.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Tailored Resume */}
                  <div className="bg-white rounded-3xl p-8 border border-indigo-100 shadow-[0_15px_40px_rgb(99,102,241,0.08)] relative flex flex-col">
                    <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-md uppercase tracking-widest flex items-center gap-1.5 ring-4 ring-white">
                      <Sparkles size={12} className="text-blue-200" /> Optimized Output
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-500">
                        <Check size={20} />
                      </div>
                      <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Tailored Experience</h3>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3 mb-4">Senior Frontend Engineer</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100/50 hover:bg-indigo-50 transition-colors">
                            <Check size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                            <p className="text-sm text-slate-700 leading-relaxed">
                              Spearheaded the migration to <strong className="text-indigo-900 font-bold bg-indigo-100 px-1 rounded">React</strong>, implementing centralized state management and reducing load times by 25%.
                            </p>
                          </div>
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100/50 hover:bg-indigo-50 transition-colors">
                            <Check size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                            <p className="text-sm text-slate-700 leading-relaxed">
                              <strong className="text-indigo-900 font-bold bg-indigo-100 px-1 rounded">Optimized rendering performance</strong> by 40% through lazy loading and advanced memoization techniques.
                            </p>
                          </div>
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100/50 hover:bg-indigo-50 transition-colors">
                            <Check size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                            <p className="text-sm text-slate-700 leading-relaxed">
                              Architected a new design system using <strong className="text-indigo-900 font-bold bg-indigo-100 px-1 rounded">Tailwind CSS</strong>, ensuring 100% responsive design metrics.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 2.5 AI CHAT FEATURE */}
        <section className="mt-40 relative z-10">
          <div className="bg-slate-900 rounded-[3rem] p-8 sm:p-12 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 sm:gap-16 shadow-[0_20px_60px_rgba(15,23,42,0.4)] border border-slate-800">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex-1 relative z-10">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUpVariants}
                custom={0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest border border-indigo-500/30 mb-6 backdrop-blur-md"
              >
                <MessageSquare size={14} /> AI Chat Assistant
              </motion.div>
              <motion.h2
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUpVariants}
                custom={1}
                className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
              >
                Just Talk. <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">We'll Do the Formatting.</span>
              </motion.h2>
              <motion.p
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUpVariants}
                custom={2}
                className="text-slate-400 text-lg sm:text-xl leading-relaxed font-medium text-balance"
              >
                Don't stress about finding the perfect action verbs or formatting. Just brain-dump your past experience, projects, or daily tasks into our AI chat. It automatically analyzes your raw stories, closes the gaps, and translates them into powerful, professional resume bullets. It's like having a Senior Recruiter interviewing you.
              </motion.p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.3 } }
              }}
              className="flex-1 w-full relative z-10"
            >
              {/* Chat Interface Mockup */}
              <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 relative">

                {/* User Message Bubble */}
                <div className="flex justify-end relative">
                  <div className="bg-slate-700 text-slate-200 p-4 rounded-2xl rounded-tr-sm max-w-[85%] text-sm leading-relaxed border border-slate-600/50 shadow-sm relative z-10">
                    "I fixed some routers and helped customers with their internet whenever it broke down last year."
                  </div>
                </div>

                {/* AI Conversion Indicator */}
                <div className="flex justify-center -my-2 relative z-20">
                  <div className="bg-indigo-600 p-2 rounded-full shadow-lg border border-indigo-400 animate-pulse text-white">
                    <ArrowRight size={16} className="rotate-90 md:rotate-0" />
                  </div>
                </div>

                {/* System Output Bubble */}
                <div className="flex justify-start relative">
                  <div className="bg-white text-slate-800 p-5 rounded-2xl rounded-tl-sm max-w-[95%] text-sm leading-relaxed shadow-lg border border-slate-200 relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-indigo-600 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded inline-flex">
                      <Sparkles size={12} /> Optimized Bullet
                    </div>
                    <p className="font-medium">
                      Spearheaded internal network troubleshooting initiatives and delivered exceptional technical support, minimizing client downtime by resolving complex router issues.
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </section>

        {/* 3. HOW IT WORKS */}
        <section className="mt-40 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-5">Simple, transparent process.</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">No complex onboarding. Just bring your resume and the job you want.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-12 relative max-w-5xl mx-auto">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-slate-200 to-transparent -z-10" />

            {[
              {
                icon: FileText,
                title: "Provide your Base Resume",
                desc: "Just paste your current master CV. We'll extract your core achievements and skills.",
                delay: 0
              },
              {
                icon: Target,
                title: "Paste Job Description",
                desc: "Show the AI exactly what the employer wants. We analyze the ATS keywords.",
                delay: 0.1
              },
              {
                icon: Download,
                title: "Export PDF",
                desc: "Get a perfectly formatted, tailored resume instantly. Ready to submit.",
                delay: 0.2
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: step.delay } }
                }}
                className="bg-[#F9FAFB] rounded-[2rem] p-8 sm:p-10 border border-slate-100 text-center relative hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-20 h-20 mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-8 text-indigo-600 transition-transform hover:scale-110 duration-300">
                  <step.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold shadow-lg ring-4 ring-white">
                  {i + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
        <AIChatShowcase />

        {/* 4. FAQ */}
        <section className="mt-40 max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is it really free?",
                a: "Yes. Use your own free Google API key. You control your usage."
              },
              {
                q: "Does it beat ATS?",
                a: "We use Google Embeddings for semantic matching to naturally weave in exact keywords."
              },
              {
                q: "Is my data safe?",
                a: "Processed locally on our secure server. No databases, no storage."
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: i * 0.1 } }
                }}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all group"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-colors" />
                  {faq.q}
                </h3>
                <p className="text-slate-500 leading-relaxed sm:text-lg pl-5 border-l-[3px] border-slate-100 group-hover:border-indigo-100 transition-colors ml-1.5">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-[#F9FAFB] py-16 text-center text-slate-500 px-6 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <span className="font-bold text-lg text-slate-700 tracking-tight">Career Copilot</span>
        </div>
        <p className="text-sm font-medium">Stop applying blindly. Start standing out.</p>
      </footer>
    </div>
  );
}
