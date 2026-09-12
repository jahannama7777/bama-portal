// کامپوننت کارت‌های داشبورد با استایل شیک و مدرن
import React from 'react';

const StatCard = ({ title, icon: Icon, value, description, colorClass }) => {
  return (
    <div className="relative overflow-hidden group bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/10">
      {/* افکت نوری در پس‌زمینه کارت هنگام هاور */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${colorClass}`}></div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-gray-400 text-sm font-medium mb-1">{title}</span>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        
        {/* بخش آیکون */}
        <div className={`p-3 rounded-xl bg-opacity-10 ${colorClass.replace('bg-', 'text-')} bg-current`}>
          <Icon size={28} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
