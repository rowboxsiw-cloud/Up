
import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Gift } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isDebit = transaction.type === 'DEBIT';
  const isBonus = transaction.type === 'BONUS';
  
  const formatDate = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' • ' + 
           date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const Icon = isBonus ? Gift : (isDebit ? ArrowUpRight : ArrowDownLeft);
  const colorClass = isBonus ? 'bg-orange-100 text-orange-600' : (isDebit ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600');

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl mb-3 border border-slate-100 hover:border-blue-100 transition-all active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <p className="font-bold text-slate-800 text-sm">
            {isBonus ? 'Welcome Reward' : (isDebit ? `To: ${transaction.toName}` : `From: ${transaction.fromName}`)}
          </p>
          <p className="text-xs text-slate-400 font-medium">{formatDate(transaction.timestamp)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold text-base ${isDebit ? 'text-slate-800' : 'text-green-600'}`}>
          {isDebit ? `-₹${transaction.amount}` : `+₹${transaction.amount}`}
        </p>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Success</p>
      </div>
    </div>
  );
};

export default TransactionItem;
