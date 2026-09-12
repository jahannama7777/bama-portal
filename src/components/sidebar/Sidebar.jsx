'use client';
import { Home, LayoutGrid, FileText, BarChart2, Users, Headphones, Settings, Radio } from 'lucide-react';
import Image from 'next/image';

const navItems = [
  { icon: Home, active: true },
  { icon: LayoutGrid, active: false },
  { icon: FileText, active: false },
  { icon: BarChart2, active: false },
  { icon: Users, active: false },
  { icon: Headphones, active: false },
  { icon: Settings, active: false },
];

export default function Sidebar() {
  return (
    <aside className="w-16 shrink-0 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-between py-5 min-h-screen transition-colors duration-300">
      <div className="flex flex-col items-center gap-6">
        {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 p-1.5 cursor-pointer">
          <Image 
            src="/logo.png" 
            alt="باما" 
            width={32} 
            height={32} 
            className="object-contain filter brightness-110"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div> */}

        <nav className="flex flex-col gap-3">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  item.active
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </nav>
      </div>

      <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
        <Radio size={18} />
      </button>
    </aside>
  );
}
