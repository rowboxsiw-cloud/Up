
import React from 'react';
import { PieChart, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';

interface Breakdown {
  category: string;
  amount: number;
  count: number;
}

interface StatsSectionProps {
  breakdown: Breakdown[];
  totalDebit: number;
}

const StatsSection: React.FC<StatsSectionProps> = ({ breakdown, totalDebit }) => {
  const colors: Record<string, string> = {
    Food: 'bg-orange-500',
    Travel: 'bg-blue-500',
    Shopping: 'bg-purple-500',
    Bills: 'bg-red-500',
    Others: 'bg-slate-500'
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Spend</p>
          <h4 className="text-xl font-black text-slate-900">₹{totalDebit.toLocaleString()}</h4>
          <div className="flex items-center gap-1 text-green-500 mt-2 text-[10px] font-black">
            <TrendingDown className="w-3 h-3" /> 12% LOWER
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Savings</p>
          <h4 className="text-xl font-black text-slate-900">₹{ (totalDebit * 0.15).toFixed(0) }</h4>
          <div className="flex items-center gap-1 text-blue-500 mt-2 text-[10px] font-black">
            <TrendingUp className="w-3 h-3" /> AUTO-SAVE
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-black text-slate-900">Spending Mix</h3>
          <PieChart className="w-5 h-5 text-slate-400" />
        </div>

        <div className="space-y-4">
          {breakdown.length > 0 ? breakdown.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{item.category}</span>
                <span className="text-sm font-black text-slate-900">₹{item.amount.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${colors[item.category] || 'bg-slate-400'} rounded-full transition-all duration-1000`}
                  style={{ width: `${(item.amount / totalDebit) * 100}%` }}
                />
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <p className="text-xs font-bold text-slate-400">AI needs more data to classify</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
