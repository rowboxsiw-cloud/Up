
import React from 'react';
import { Wallet, Copy, CheckCircle } from 'lucide-react';

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
    <div className="w-full upi-gradient rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-6">
      {/* Background patterns */}
      <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>

      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <p className="text-blue-100 text-sm font-medium opacity-80 mb-1">Total Balance</p>
          <h2 className="text-4xl font-extrabold tracking-tight">₹{balance.toLocaleString('en-IN')}</h2>
        </div>
        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      <div className="flex flex-col gap-1 relative z-10">
        <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider opacity-70">SkyPay ID</p>
        <div className="flex items-center gap-2 group">
          <p className="text-lg font-bold">{upiId}</p>
          <button 
            onClick={copyUpi}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4 opacity-70" />}
          </button>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-blue-100/70">
        <p>Verified Merchant Account</p>
        <p className="font-mono tracking-widest uppercase">{name.split(' ')[0]}PAY</p>
      </div>
    </div>
  );
};

export default BalanceCard;
