
import React from 'react';
import { Wallet, Copy, CheckCircle, Zap } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  upiId: string;
  name: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, upiId, name }) => {
  const [copied, setCopied] = React.useState(false);

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full gradient-mesh rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden mb-10 group transition-all duration-700 hover:shadow-blue-200">
      {/* Dynamic light effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/30 transition-all duration-1000"></div>
      
      <div className="flex justify-between items-start mb-10 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-300 fill-current" />
            <p className="text-white/70 text-xs font-black uppercase tracking-[0.2em]">Live Balance</p>
          </div>
          <h2 className="text-5xl font-black tracking-tighter italic">₹{balance.toLocaleString('en-IN')}</h2>
        </div>
        <div className="bg-white/20 p-4 rounded-[2rem] backdrop-blur-md border border-white/20">
          <Wallet className="w-7 h-7" />
        </div>
      </div>

      <div className="space-y-1 relative z-10">
        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Active Address</p>
        <div className="flex items-center justify-between bg-black/10 backdrop-blur-sm p-4 rounded-3xl border border-white/10">
          <p className="text-lg font-black tracking-tight">{upiId}</p>
          <button 
            onClick={copyUpi}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-90"
          >
            {copied ? <CheckCircle className="w-5 h-5 text-green-300" /> : <Copy className="w-5 h-5 text-white/70" />}
          </button>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Quantum Verified</span>
        </div>
        <p className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">{name.split(' ')[0]} PRO</p>
      </div>
    </div>
  );
};

export default BalanceCard;
