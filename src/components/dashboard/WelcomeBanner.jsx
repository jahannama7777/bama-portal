export default function WelcomeBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-indigo-900/60 via-purple-950/40 to-[#0f172a] border border-indigo-500/20 p-8 shadow-2xl">
      
      {/* گرادیانت نور پس‌زمینه */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* سیلوئت کوهستانی گرافیکی مشابه تصویر ماکاپ */}
      <div 
        className="absolute inset-0 opacity-25 bg-cover bg-center pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `radial-gradient(ellipse at bottom, rgba(99, 102, 241, 0.3) 0%, transparent 70%)`
        }}
      />

      <div className="relative z-10 max-w-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">👋</span>
          <h2 className="text-2xl font-black text-white tracking-tight">سلام جابر بکرانی</h2>
        </div>
        <p className="text-sm text-slate-300 font-medium leading-relaxed">
          به پورتال سازمانی شرکت باما خوش آمدید.
        </p>
        <p className="text-xs text-indigo-300/80 mt-1 font-light">
          «با هم، آینده‌ای بهتر می‌سازیم»
        </p>
      </div>

    </div>
  );
}
